#!/usr/bin/env tsx

/**
 * Demo lengkap penggunaan Context class di Cenzero Framework
 * 
 * Mendemonstrasikan semua fitur Context yang diminta:
 * - ctx.req = IncomingMessage
 * - ctx.res = ServerResponse
 * - ctx.query = parsed URLSearchParams  
 * - ctx.params = route parameters (dynamic)
 * - ctx.body = parsed body (json/urlencoded)
 * - Helper methods: ctx.send(), ctx.json(), ctx.status()
 */

import { CenzeroApp } from '../src/core/server';
import { CenzeroContext } from '../src/core/context';

const app = new CenzeroApp({
  port: 3000,
  useContext: true // Aktifkan mode Context
});

// Middleware yang menerima Context
app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  const start = Date.now();
  
  console.log(`→ ${ctx.method} ${ctx.url}`);
  console.log(`   Headers:`, Object.keys(ctx.headers));
  console.log(`   Query:`, ctx.query);
  console.log(`   Params:`, ctx.params);
  
  await next();
  
  const duration = Date.now() - start;
  console.log(`← ${ctx.method} ${ctx.url} - ${ctx.res.statusCode} in ${duration}ms`);
});

// Middleware untuk parsing body dan menambah info ke state
app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  // Body sudah di-parse otomatis oleh RequestParser
  if (ctx.body) {
    console.log(`   Body:`, ctx.body);
  }
  
  // Tambah info ke state untuk middleware berikutnya
  ctx.state.requestId = Math.random().toString(36).substr(2, 9);
  ctx.state.timestamp = new Date().toISOString();
  
  await next();
});

// Demo route dengan query parameters
// GET /users?name=john&age=25
app.get('/users', async (ctx: CenzeroContext) => {
  // ctx.query berisi parsed URLSearchParams
  const { name, age, limit = '10' } = ctx.query;
  
  ctx.json({
    message: 'Users endpoint',
    query: {
      name,
      age: age ? parseInt(age) : null,
      limit: parseInt(limit)
    },
    requestId: ctx.state.requestId,
    timestamp: ctx.state.timestamp
  });
});

// Demo route dengan dynamic parameters
// GET /users/123/posts/456
app.get('/users/:userId/posts/:postId', async (ctx: CenzeroContext) => {
  // ctx.params berisi route parameters yang sudah di-extract
  const { userId, postId } = ctx.params;
  
  ctx.status(200).json({
    message: 'User post endpoint',
    params: {
      userId: parseInt(userId),
      postId: parseInt(postId)
    },
    url: ctx.url,
    path: ctx.path
  });
});

// Demo POST dengan body (JSON)
// POST /users dengan body: { "name": "John", "email": "john@example.com" }
app.post('/users', async (ctx: CenzeroContext) => {
  // ctx.body berisi parsed JSON body
  const userData = ctx.body;
  
  if (!userData || !userData.name || !userData.email) {
    ctx.status(400).json({
      error: 'Bad Request',
      message: 'Name and email are required'
    });
    return;
  }
  
  // Simulate creating user
  const newUser = {
    id: Math.floor(Math.random() * 1000),
    ...userData,
    createdAt: new Date().toISOString()
  };
  
  ctx.status(201).json({
    message: 'User created successfully',
    user: newUser
  });
});

// Demo PUT dengan URL-encoded body
// PUT /users/123 dengan body: name=John&email=john@updated.com
app.put('/users/:id', async (ctx: CenzeroContext) => {
  const userId = ctx.params.id;
  const updateData = ctx.body; // Parsed URL-encoded atau JSON body
  
  ctx.json({
    message: 'User updated',
    userId: parseInt(userId),
    updateData,
    contentType: ctx.get('content-type')
  });
});

// Demo berbagai helper methods
app.get('/demo/methods', async (ctx: CenzeroContext) => {
  // Set custom header
  ctx.set('X-Custom-Header', 'Demo Value');
  ctx.set('X-Request-ID', ctx.state.requestId);
  
  // Contoh penggunaan ctx.send() dengan string
  ctx.status(200).send('This is a plain text response using ctx.send()');
});

app.get('/demo/html', async (ctx: CenzeroContext) => {
  // Contoh ctx.html()
  ctx.html(`
    <html>
      <head><title>Context Demo</title></head>
      <body>
        <h1>Cenzero Context Demo</h1>
        <p>Request ID: ${ctx.state.requestId}</p>
        <p>Method: ${ctx.method}</p>
        <p>URL: ${ctx.url}</p>
        <p>Time: ${ctx.state.timestamp}</p>
      </body>
    </html>
  `);
});

app.get('/demo/redirect', async (ctx: CenzeroContext) => {
  // Contoh redirect
  ctx.redirect('/users', 302);
});

// Demo error handling dengan Context
app.get('/demo/error', async (ctx: CenzeroContext) => {
  try {
    // Simulate error
    throw new Error('Something went wrong!');
  } catch (error) {
    ctx.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      requestId: ctx.state.requestId
    });
  }
});

// Demo session dan cookies
app.get('/demo/session', async (ctx: CenzeroContext) => {
  // Set session data
  ctx.session.set('userId', '123');
  ctx.session.set('username', 'john_doe');
  
  // Set cookie
  ctx.cookies.set('sessionToken', 'abc123', {
    httpOnly: true,
    maxAge: 3600000 // 1 hour
  });
  
  ctx.json({
    message: 'Session and cookie set',
    sessionId: ctx.session.id,
    sessionData: {
      userId: ctx.session.get('userId'),
      username: ctx.session.get('username')
    }
  });
});

// Demo access ke underlying Node.js objects
app.get('/demo/raw', async (ctx: CenzeroContext) => {
  // Akses langsung ke Node.js IncomingMessage dan ServerResponse
  const userAgent = ctx.req.headers['user-agent'];
  const method = ctx.req.method;
  const url = ctx.req.url;
  
  // Set header langsung ke res
  ctx.res.setHeader('X-Direct-Header', 'Set directly on res');
  
  ctx.json({
    message: 'Raw Node.js access demo',
    nodeJs: {
      userAgent,
      method,
      url,
      headers: Object.keys(ctx.req.headers)
    },
    context: {
      method: ctx.method,
      url: ctx.url,
      path: ctx.path
    }
  });
});

// Error handler middleware
app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    
    if (!ctx.res.headersSent) {
      ctx.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        requestId: ctx.state.requestId
      });
    }
  }
});

// Start server
if (require.main === module) {
  app.listen(3000, 'localhost', () => {
    console.log('\n🚀 Cenzero Context Demo Server started at http://localhost:3000\n');
    console.log('Demo endpoints:');
    console.log('  GET  /users?name=john&age=25');
    console.log('  GET  /users/123/posts/456');
    console.log('  POST /users (with JSON body)');
    console.log('  PUT  /users/123 (with form data)');
    console.log('  GET  /demo/methods');
    console.log('  GET  /demo/html');
    console.log('  GET  /demo/redirect');
    console.log('  GET  /demo/error');
    console.log('  GET  /demo/session');
    console.log('  GET  /demo/raw');
    console.log('\nTest dengan curl:');
    console.log('  curl "http://localhost:3000/users?name=john&age=25"');
    console.log('  curl http://localhost:3000/users/123/posts/456');
    console.log('  curl -X POST -H "Content-Type: application/json" -d \'{"name":"John","email":"john@example.com"}\' http://localhost:3000/users');
  });
}

export { app };
