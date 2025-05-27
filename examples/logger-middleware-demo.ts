// Demo for Logger Middleware - Cenzero Framework
// Shows simple logger middleware that prints: [METHOD] [URL] - [STATUS] in [ms]

import { CenzeroApp } from '../src/core/server';
import { CenzeroContext } from '../src/core/context';
import { loggerMiddleware, createLoggerMiddleware } from '../src/middleware/logger';

const app = new CenzeroApp({
  port: 3011,
  useContext: true
});

console.log('🚀 Logger Middleware Demo for Cenzero Framework');
console.log('');

// 1. Basic logger middleware usage
app.use(loggerMiddleware);

// 2. Additional middleware for demo
app.use((ctx: CenzeroContext, next: () => Promise<void>) => {
  // Add some processing time for demo
  ctx.state.startTime = Date.now();
  return next();
});

// 3. Test routes
app.get('/', (ctx: CenzeroContext) => {
  ctx.json({
    message: 'Logger Middleware Demo',
    framework: 'Cenzero',
    timestamp: new Date().toISOString()
  });
});

app.get('/users', (ctx: CenzeroContext) => {
  // Simulate some processing time
  setTimeout(() => {
    ctx.json({
      users: [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' }
      ]
    });
  }, 50);
});

app.get('/users/:id', (ctx: CenzeroContext) => {
  const userId = ctx.params.id;
  
  if (!userId || isNaN(Number(userId))) {
    ctx.status(400).json({ error: 'Invalid user ID' });
    return;
  }
  
  ctx.json({
    user: {
      id: Number(userId),
      name: `User ${userId}`,
      email: `user${userId}@example.com`
    }
  });
});

app.post('/users', (ctx: CenzeroContext) => {
  const { name, email } = ctx.body || {};
  
  if (!name || !email) {
    ctx.status(400).json({ error: 'Name and email are required' });
    return;
  }
  
  ctx.status(201).json({
    message: 'User created successfully',
    user: { name, email, id: Math.floor(Math.random() * 1000) }
  });
});

app.get('/slow', (ctx: CenzeroContext) => {
  // Simulate slow endpoint
  setTimeout(() => {
    ctx.json({ message: 'This was a slow endpoint!' });
  }, 500);
});

app.get('/error', (ctx: CenzeroContext) => {
  // Test error logging
  throw new Error('Test error for logging');
});

// Start server
app.listen(3011, 'localhost', () => {
  console.log('🚀 Logger Middleware Demo running on http://localhost:3011');
  console.log('');
  console.log('📝 Test these endpoints to see the logger in action:');
  console.log('👉 GET  http://localhost:3011/');
  console.log('👉 GET  http://localhost:3011/users');
  console.log('👉 GET  http://localhost:3011/users/123');
  console.log('👉 POST http://localhost:3011/users (JSON: {"name":"John","email":"john@test.com"})');
  console.log('👉 GET  http://localhost:3011/slow');
  console.log('👉 GET  http://localhost:3011/error');
  console.log('');
  console.log('🔍 Watch the console to see logger output in format:');
  console.log('   [METHOD] [URL] - [STATUS] in [ms]');
  console.log('');
});

// Advanced logger demo (commented out - uncomment to test)
/*
console.log('🎨 Advanced Logger Demo (uncomment to test):');

const advancedApp = new CenzeroApp({
  port: 3012,
  useContext: true
});

// Custom logger with colors and timestamp
const colorLogger = createLoggerMiddleware({
  colors: true,
  includeTimestamp: true
});

advancedApp.use(colorLogger);

advancedApp.get('/', (ctx: CenzeroContext) => {
  ctx.json({ message: 'Advanced logger demo with colors!' });
});

advancedApp.listen(3012, 'localhost', () => {
  console.log('🎨 Advanced Logger Demo running on http://localhost:3012');
});
*/
