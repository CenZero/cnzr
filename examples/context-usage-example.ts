// Contoh penggunaan Context Object `ctx` di Cenzero Framework
// Semua fitur sudah implemented dan siap digunakan!

import { CenzeroApp } from '../src/core/server';
import { CenzeroContext } from '../src/core/context';

const app = new CenzeroApp({
  port: 3006,
  useContext: true // Aktifkan context mode
});

// 1. Middleware yang menggunakan context
app.use((ctx: CenzeroContext, next: () => Promise<void>) => {
  // Akses semua properties context
  console.log(`📝 ${ctx.method} ${ctx.path}`);
  console.log(`🎯 Query:`, ctx.query);
  console.log(`📋 Params:`, ctx.params);
  
  // Set state untuk handler
  ctx.state.requestId = Math.random().toString(36).substring(2);
  ctx.state.startTime = Date.now();
  
  // Set response header
  ctx.set('X-Request-ID', ctx.state.requestId);
  
  return next();
});

// 2. GET dengan params dan query
app.get('/api/users/:userId', (ctx: CenzeroContext) => {
  // Context berisi semua yang dibutuhkan:
  const userId = ctx.params.userId;       // Dynamic route param
  const page = ctx.query.page || 1;       // URL query param
  const limit = ctx.query.limit || 10;    // URL query param
  
  // Response menggunakan method context
  ctx.status(200).json({
    user: {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`
    },
    pagination: { page, limit },
    requestId: ctx.state.requestId,
    processingTime: Date.now() - ctx.state.startTime
  });
});

// 3. POST dengan body parsing
app.post('/api/users', (ctx: CenzeroContext) => {
  // Body otomatis di-parse
  const { name, email, age } = ctx.body;
  
  // Validasi menggunakan context assertions
  ctx.assert(name, 400, 'Name is required');
  ctx.assert(email, 400, 'Email is required');
  ctx.assert(age && age > 0, 400, 'Valid age is required');
  
  // Create user
  const newUser = {
    id: ctx.state.requestId,
    name,
    email,
    age,
    createdAt: new Date().toISOString()
  };
  
  // Set location header dan response
  ctx.set('Location', `/api/users/${newUser.id}`);
  ctx.status(201).json({
    message: 'User created successfully',
    user: newUser
  });
});

// 4. HTML response
app.get('/users/:userId/profile', (ctx: CenzeroContext) => {
  const userId = ctx.params.userId;
  const theme = ctx.query.theme || 'light';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>User ${userId} Profile</title>
      <style>
        body { 
          font-family: Arial; 
          background: ${theme === 'dark' ? '#333' : '#fff'};
          color: ${theme === 'dark' ? '#fff' : '#333'};
          padding: 20px;
        }
      </style>
    </head>
    <body>
      <h1>User Profile: ${userId}</h1>
      <p>Theme: ${theme}</p>
      <p>Request ID: ${ctx.state.requestId}</p>
      <p>Method: ${ctx.method}</p>
      <p>Path: ${ctx.path}</p>
      <p>Query: ${JSON.stringify(ctx.query)}</p>
    </body>
    </html>
  `;
  
  ctx.html(html);
});

// 5. Error handling dengan context
app.get('/api/users/:userId/delete', (ctx: CenzeroContext) => {
  const userId = ctx.params.userId;
  
  // Simulasi error menggunakan context.throw()
  if (userId === 'admin') {
    ctx.throw(403, 'Cannot delete admin user');
  }
  
  ctx.json({
    message: `User ${userId} deleted successfully`,
    requestId: ctx.state.requestId
  });
});

// 6. Redirect dengan context
app.get('/users/:userId', (ctx: CenzeroContext) => {
  const userId = ctx.params.userId;
  ctx.redirect(`/users/${userId}/profile`, 302);
});

// 7. Text response
app.get('/health', (ctx: CenzeroContext) => {
  ctx.text(`
Server Status: OK
Request ID: ${ctx.state.requestId}
Method: ${ctx.method}
Path: ${ctx.path}
Time: ${new Date().toISOString()}
  `.trim());
});

// Start server
app.listen(3006, 'localhost', () => {
  console.log('\n🚀 Context Object Example Server running on http://localhost:3006');
  console.log('\n📝 Test these endpoints:');
  console.log('👉 GET  /api/users/123?page=2&limit=5');
  console.log('👉 POST /api/users (JSON body: {"name":"John","email":"john@test.com","age":25})');
  console.log('👉 GET  /users/123/profile?theme=dark');
  console.log('👉 GET  /api/users/admin/delete (will show error)');
  console.log('👉 GET  /users/123 (redirect test)');
  console.log('👉 GET  /health');
});

/*
Test commands:

# 1. GET dengan params & query
curl "http://localhost:3006/api/users/123?page=2&limit=5"

# 2. POST dengan JSON body
curl -X POST http://localhost:3006/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@test.com","age":25}'

# 3. HTML response
curl "http://localhost:3006/users/123/profile?theme=dark"

# 4. Error handling
curl "http://localhost:3006/api/users/admin/delete"

# 5. Redirect
curl -v "http://localhost:3006/users/123"

# 6. Text response
curl "http://localhost:3006/health"
*/
