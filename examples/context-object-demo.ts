import { CenzeroApp } from '../src/core/server';
import { CenzeroContext } from '../src/core/context';

// Demo penggunaan Context Object di Cenzero Framework
async function demoContextObject() {
  console.log('🧪 Demo Context Object untuk Cenzero Framework');
  console.log('');

  const app = new CenzeroApp({
    port: 3004,
    useContext: true // Pastikan context mode diaktifkan
  });

  // Demo 1: Basic context usage dengan req, res, body, params, query
  app.get('/users/:id', (ctx: CenzeroContext) => {
    console.log('📥 Request Context Demo:');
    console.log('  Method:', ctx.method);
    console.log('  Path:', ctx.path);
    console.log('  URL:', ctx.url);
    console.log('  Params:', ctx.params); // Dynamic route params seperti { id: "123" }
    console.log('  Query:', ctx.query);   // URL query params seperti ?name=john&age=25
    console.log('  Headers:', Object.keys(ctx.headers));
    console.log('');

    // Response menggunakan context methods
    ctx.json({
      message: 'Context object working!',
      requestInfo: {
        method: ctx.method,
        path: ctx.path,
        userId: ctx.params.id,
        queryParams: ctx.query,
        timestamp: new Date().toISOString()
      }
    });
  });

  // Demo 2: POST dengan body parsing
  app.post('/users', (ctx: CenzeroContext) => {
    console.log('📝 POST Request with Body:');
    console.log('  Method:', ctx.method);
    console.log('  Body:', ctx.body); // Parsed request body
    console.log('');

    // Validasi dan response
    if (!ctx.body || !ctx.body.name) {
      ctx.status(400).json({
        error: 'Bad Request',
        message: 'Name is required'
      });
      return;
    }

    // Response sukses
    ctx.status(201).json({
      message: 'User created successfully',
      user: {
        id: Math.floor(Math.random() * 1000),
        name: ctx.body.name,
        email: ctx.body.email || 'not provided'
      },
      timestamp: new Date().toISOString()
    });
  });

  // Demo 3: HTML response
  app.get('/dashboard/:userId', (ctx: CenzeroContext) => {
    const { userId } = ctx.params;
    const { theme = 'light' } = ctx.query;

    ctx.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dashboard - User ${userId}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: ${theme === 'dark' ? '#333' : '#fff'};
            color: ${theme === 'dark' ? '#fff' : '#333'};
            padding: 20px;
          }
          .info { 
            background: ${theme === 'dark' ? '#555' : '#f5f5f5'};
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <h1>Dashboard untuk User ${userId}</h1>
        <div class="info">
          <h3>Request Information</h3>
          <p><strong>Method:</strong> ${ctx.method}</p>
          <p><strong>Path:</strong> ${ctx.path}</p>
          <p><strong>Query:</strong> ${JSON.stringify(ctx.query)}</p>
          <p><strong>Theme:</strong> ${theme}</p>
          <p><strong>User Agent:</strong> ${ctx.get('user-agent') || 'Unknown'}</p>
        </div>
        <div class="info">
          <h3>Context Features</h3>
          <ul>
            <li>✅ req, res objects accessible</li>
            <li>✅ Parsed body available</li>
            <li>✅ Dynamic route params: {userId: "${userId}"}</li>
            <li>✅ URL query params: ${JSON.stringify(ctx.query)}</li>
            <li>✅ Response methods: status(), json(), html(), etc.</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  });

  // Demo 4: Middleware dengan context
  app.use('/api', (ctx: CenzeroContext, next: () => Promise<void>) => {
    console.log(`🔧 Middleware - ${ctx.method} ${ctx.path}`);
    
    // Tambah timestamp ke context state
    ctx.state.requestStart = Date.now();
    
    // Set response header
    ctx.set('X-API-Version', '1.0.0');
    
    return next();
  });

  app.get('/api/info', (ctx: CenzeroContext) => {
    const processingTime = Date.now() - ctx.state.requestStart;
    
    ctx.json({
      message: 'API Info endpoint',
      context: {
        method: ctx.method,
        path: ctx.path,
        params: ctx.params,
        query: ctx.query,
        processingTime: `${processingTime}ms`,
        customState: ctx.state
      },
      headers: {
        'X-API-Version': ctx.res.getHeader('X-API-Version')
      }
    });
  });

  // Demo 5: Error handling dengan context
  app.get('/error/:type', (ctx: CenzeroContext) => {
    const { type } = ctx.params;

    switch (type) {
      case 'throw':
        // Menggunakan ctx.throw()
        ctx.throw(400, 'Bad request thrown using ctx.throw()');
        break;
        
      case 'assert':
        // Menggunakan ctx.assert()
        ctx.assert(false, 422, 'Assertion failed using ctx.assert()');
        break;
        
      case 'createError':
        // Menggunakan ctx.createError()
        const error = ctx.createError(500, 'Error created using ctx.createError()');
        throw error;
        
      default:
        ctx.status(404).json({
          error: 'Not Found',
          message: `Error type '${type}' not recognized. Try: throw, assert, createError`
        });
    }
  });

  // Demo 6: Text dan redirect responses
  app.get('/text', (ctx: CenzeroContext) => {
    ctx.text(`
Context Object Text Response
===========================

Method: ${ctx.method}
Path: ${ctx.path}
Query: ${JSON.stringify(ctx.query)}
Timestamp: ${new Date().toISOString()}

Context features working:
✅ req, res access
✅ params parsing  
✅ query parsing
✅ text() method
    `);
  });

  app.get('/redirect', (ctx: CenzeroContext) => {
    const { to = '/dashboard/1?theme=light' } = ctx.query;
    console.log(`🔄 Redirecting to: ${to}`);
    ctx.redirect(to as string);
  });

  // Start server
  const server = app.listen(3004, 'localhost', () => {
    console.log('🚀 Context Object Demo Server running on http://localhost:3004');
    console.log('');
    console.log('🎯 Test endpoints untuk Context Object:');
    console.log('');
    console.log('📍 Basic Context:');
    console.log('  • GET  http://localhost:3004/users/123?name=john&age=25');
    console.log('  • POST http://localhost:3004/users (with JSON body)');
    console.log('');
    console.log('📍 HTML Response:');
    console.log('  • GET  http://localhost:3004/dashboard/456?theme=dark');
    console.log('');
    console.log('📍 API with Middleware:');
    console.log('  • GET  http://localhost:3004/api/info?test=value');
    console.log('');
    console.log('📍 Error Handling:');
    console.log('  • GET  http://localhost:3004/error/throw');
    console.log('  • GET  http://localhost:3004/error/assert');
    console.log('  • GET  http://localhost:3004/error/createError');
    console.log('');
    console.log('📍 Other Responses:');
    console.log('  • GET  http://localhost:3004/text?message=hello');
    console.log('  • GET  http://localhost:3004/redirect?to=/dashboard/999');
    console.log('');
    console.log('📝 Test POST dengan curl:');
    console.log('  curl -X POST http://localhost:3004/users \\');
    console.log('    -H "Content-Type: application/json" \\');
    console.log('    -d \'{"name":"John Doe","email":"john@example.com"}\'');
    console.log('');
    console.log('✨ Context Object Features:');
    console.log('  ✅ req, res - Raw HTTP objects');
    console.log('  ✅ body - Parsed request body (JSON/form/etc)');
    console.log('  ✅ params - Dynamic route parameters');
    console.log('  ✅ query - URL query parameters');
    console.log('  ✅ status(code) - Set response status');
    console.log('  ✅ json(data) - Send JSON response');
    console.log('  ✅ html(content) - Send HTML response');
    console.log('  ✅ text(content) - Send text response');
    console.log('  ✅ send(data) - Send any data');
    console.log('  ✅ redirect(url) - Redirect response');
    console.log('  ✅ set/get - Header manipulation');
    console.log('  ✅ throw/assert/createError - Error handling');
    console.log('  ✅ state - Custom state storage per request');
    console.log('  ✅ session, cookies - Session & cookie management');
    console.log('');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('');
    console.log('🛑 Shutting down Context Demo server...');
    await app.close();
    process.exit(0);
  });
}

// Run demo if this file is executed directly
if (require.main === module) {
  demoContextObject().catch(console.error);
}

export { demoContextObject };
