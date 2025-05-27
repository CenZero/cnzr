import { CenzeroApp, createError, Logger } from '../src';

const app = new CenzeroApp({
  useContext: true,
  useFileRouting: false, // Manual routes for demo
  port: 3000
});

// Enable file-based routing (optional)
// await app.enableFileRouting();

// Setup logger
const logger = new Logger({ level: 'info', colors: true });

// Add logger middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  logger.info(`${ctx.req.method} ${ctx.req.url} - ${ctx.res.statusCode} - ${duration}ms`);
});

// Custom error handler
app.onError(async (error, ctx) => {
  logger.error(`Error: ${error.message}`);
  
  if (!ctx.res.headersSent) {
    const statusCode = (error as any).statusCode || 500;
    ctx.status(statusCode).json({
      error: true,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes with context API
app.get('/', async (ctx) => {
  ctx.json({ 
    message: 'Welcome to Cenzero Framework!',
    features: [
      'Context-based middleware',
      'Plugin system', 
      'Session & cookies',
      'Error handling',
      'File-based routing',
      'ESM + CommonJS support'
    ]
  });
});

app.get('/users/:id', async (ctx) => {
  const userId = ctx.params.id;
  
  if (!userId || isNaN(Number(userId))) {
    throw createError('Invalid user ID', 400);
  }
  
  ctx.json({
    user: {
      id: Number(userId),
      name: `User ${userId}`,
      email: `user${userId}@example.com`
    }
  });
});

app.post('/users', async (ctx) => {
  const { name, email } = ctx.req.body || {};
  
  if (!name || !email) {
    throw createError('Name and email are required', 400);
  }
  
  ctx.status(201).json({
    message: 'User created successfully',
    user: { id: Date.now(), name, email }
  });
});

// Session demo
app.get('/session/set', async (ctx) => {
  ctx.session.set('user', { name: 'John Doe', role: 'admin' });
  ctx.json({ message: 'Session set' });
});

app.get('/session/get', async (ctx) => {
  const user = ctx.session.get('user');
  ctx.json({ user: user || null });
});

// Cookie demo
app.get('/cookie/set', async (ctx) => {
  ctx.cookies.set('theme', 'dark', { maxAge: 3600000 });
  ctx.json({ message: 'Cookie set' });
});

app.get('/cookie/get', async (ctx) => {
  const theme = ctx.cookies.get('theme');
  ctx.json({ theme: theme || 'light' });
});

// Error demo
app.get('/error', async (ctx) => {
  throw new Error('This is a test error!');
});

// 404 handler
app.use(async (ctx, next) => {
  await next();
  if (ctx.res.statusCode === 404) {
    ctx.status(404).json({
      error: 'Not Found',
      message: `Cannot ${ctx.req.method} ${ctx.req.url}`,
      statusCode: 404
    });
  }
});

app.listen(3000, 'localhost', () => {
  console.log('🎉 Advanced Cenzero demo running!');
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET    /');
  console.log('  GET    /users/:id');
  console.log('  POST   /users');
  console.log('  GET    /session/set');
  console.log('  GET    /session/get');
  console.log('  GET    /cookie/set');
  console.log('  GET    /cookie/get');
  console.log('  GET    /error');
});
