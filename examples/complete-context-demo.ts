// Demo lengkap context object `ctx` untuk Cenzero Framework
// Menunjukkan semua fitur yang diminta:
// - req, res
// - body (parsed)  
// - params (dynamic route param)
// - query (URL query param)
// - status(code), json(), send(), html(), dll
// - Context dipass ke middleware & handler

import { CenzeroApp } from '../src/core/server';
import { CenzeroContext } from '../src/core/context';

const app = new CenzeroApp({
  port: 3005,
  useContext: true // Pastikan context mode aktif
});

// Middleware yang menggunakan context object
app.use((ctx: CenzeroContext, next: () => Promise<void>) => {
  console.log(`📝 Middleware: ${ctx.method} ${ctx.path}`);
  console.log(`📦 Headers:`, ctx.headers);
  console.log(`🎯 Query:`, ctx.query);
  console.log(`📋 State:`, ctx.state);
  
  // Tambah state ke context untuk handler
  ctx.state.startTime = Date.now();
  ctx.state.processed = true;
  
  return next();
});

// Demo: GET dengan params dan query
app.get('/users/:userId/posts/:postId', (ctx: CenzeroContext) => {
  // Context object berisi semua yang diminta:
  console.log('\n=== CONTEXT OBJECT DEMO ===');
  console.log('🔸 req:', typeof ctx.req);
  console.log('🔸 res:', typeof ctx.res);
  console.log('🔸 method:', ctx.method);
  console.log('🔸 path:', ctx.path);
  console.log('🔸 url:', ctx.url);
  
  // Dynamic route params
  console.log('🔸 params:', ctx.params);
  
  // URL query parameters
  console.log('🔸 query:', ctx.query);
  
  // Body (akan undefined untuk GET)
  console.log('🔸 body:', ctx.body);
  
  // Headers
  console.log('🔸 headers:', ctx.headers);
  
  // State dari middleware
  console.log('🔸 state:', ctx.state);
  
  // Response methods yang tersedia
  const response = {
    userId: ctx.params.userId,
    postId: ctx.params.postId,
    query: ctx.query,
    timestamp: new Date().toISOString(),
    processingTime: Date.now() - ctx.state.startTime,
    message: 'Context object working perfectly!'
  };
  
  // Menggunakan method json() dari context
  ctx.status(200).json(response);
});

// Demo: POST dengan body parsing
app.post('/users', (ctx: CenzeroContext) => {
  console.log('\n=== POST WITH BODY DEMO ===');
  console.log('🔸 method:', ctx.method);
  console.log('🔸 body (parsed):', ctx.body);
  console.log('🔸 content-type:', ctx.get('content-type'));
  
  // Validasi body
  if (!ctx.body || !ctx.body.name) {
    ctx.status(400).json({
      error: 'Name is required',
      received: ctx.body
    });
    return;
  }
  
  // Response dengan semua method context
  const newUser = {
    id: Math.random().toString(36).substring(2),
    name: ctx.body.name,
    email: ctx.body.email,
    createdAt: new Date().toISOString()
  };
  
  // Set custom header dan status
  ctx.set('Location', `/users/${newUser.id}`);
  ctx.status(201).json({
    message: 'User created successfully',
    user: newUser
  });
});

// Demo: HTML response
app.get('/page/:title', (ctx: CenzeroContext) => {
  const title = ctx.params.title;
  const theme = ctx.query.theme || 'light';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          background: ${theme === 'dark' ? '#333' : '#fff'};
          color: ${theme === 'dark' ? '#fff' : '#333'};
          padding: 20px;
        }
      </style>
    </head>
    <body>
      <h1>Page: ${title}</h1>
      <p>Theme: ${theme}</p>
      <p>Query params: ${JSON.stringify(ctx.query)}</p>
      <p>Path params: ${JSON.stringify(ctx.params)}</p>
      <p>Method: ${ctx.method}</p>
      <p>URL: ${ctx.url}</p>
    </body>
    </html>
  `;
  
  // Menggunakan method html() dari context
  ctx.html(htmlContent);
});

// Demo: Error handling dengan context
app.get('/error-test', (ctx: CenzeroContext) => {
  // Menggunakan method throw() dari context
  ctx.throw(500, 'This is a test error using context.throw()');
});

// Demo: Redirect dengan context
app.get('/redirect-test', (ctx: CenzeroContext) => {
  const target = ctx.query.to || '/';
  ctx.redirect(target as string, 302);
});

// Demo: Text response
app.get('/text/:message', (ctx: CenzeroContext) => {
  const message = ctx.params.message;
  ctx.text(`Plain text response: ${message}\nQuery: ${JSON.stringify(ctx.query)}`);
});

// Demo: Context assertions
app.get('/validate/:value', (ctx: CenzeroContext) => {
  const value = ctx.params.value;
  
  // Menggunakan assert() dari context
  ctx.assert(value, 400, 'Value parameter is required');
  ctx.assert(value.length > 2, 400, 'Value must be longer than 2 characters');
  ctx.assert(/^[a-zA-Z]+$/.test(value), 400, 'Value must contain only letters');
  
  ctx.json({
    message: 'Validation passed!',
    value: value,
    length: value.length
  });
});

// Demo middleware untuk semua route
app.use('/api/*', (ctx: CenzeroContext, next: () => Promise<void>) => {
  console.log(`🌐 API Middleware: ${ctx.method} ${ctx.path}`);
  
  // Add API versioning to state
  ctx.state.apiVersion = 'v1';
  ctx.state.authenticated = true;
  
  // Set API headers
  ctx.set('X-API-Version', 'v1.0');
  ctx.set('X-Powered-By', 'Cenzero');
  
  return next();
});

app.get('/api/status', (ctx: CenzeroContext) => {
  ctx.json({
    status: 'OK',
    context: {
      method: ctx.method,
      path: ctx.path,
      params: ctx.params,
      query: ctx.query,
      state: ctx.state,
      hasBody: !!ctx.body,
      userAgent: ctx.get('user-agent')
    }
  });
});

// Start server
app.listen(3005, 'localhost', () => {
  console.log('\n🚀 Cenzero Context Demo Server running on http://localhost:3005');
  console.log('\n📋 Test endpoints:');
  console.log('👉 GET  /users/123/posts/456?name=john&age=25');
  console.log('👉 POST /users (with JSON body: {"name":"John","email":"john@example.com"})');
  console.log('👉 GET  /page/home?theme=dark');
  console.log('👉 GET  /error-test');
  console.log('👉 GET  /redirect-test?to=/users/123/posts/456');
  console.log('👉 GET  /text/hello?foo=bar');
  console.log('👉 GET  /validate/hello');
  console.log('👉 GET  /api/status');
  console.log('\n📝 Curl examples:');
  console.log('curl "http://localhost:3005/users/123/posts/456?name=john&age=25"');
  console.log('curl -X POST http://localhost:3005/users -H "Content-Type: application/json" -d \'{"name":"John Doe","email":"john@example.com"}\'');
  console.log('curl "http://localhost:3005/page/dashboard?theme=dark"');
});
