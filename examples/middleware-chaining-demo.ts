#!/usr/bin/env tsx

/**
 * Demo Middleware Chaining dengan Context di Cenzero Framework
 * 
 * Menunjukkan bagaimana:
 * - app.use(middleware) untuk chaining middleware
 * - Context object (ctx) dikirim ke setiap handler
 * - Handler format: app.get('/path', async (ctx) => { ... })
 */

import { CenzeroApp } from '../src/core/server';
import { CenzeroContext } from '../src/core/context';

const app = new CenzeroApp({
  port: 3000,
  useContext: true // Aktifkan Context mode
});

console.log('🔗 Middleware Chaining Demo\n');

// ========================================
// MIDDLEWARE CHAINING dengan app.use()
// ========================================

// Middleware 1: Request Logger
app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  const start = Date.now();
  console.log(`\n→ [1] Logger: ${ctx.method} ${ctx.url}`);
  
  // Tambah info ke context state
  ctx.state.requestId = Math.random().toString(36).substr(2, 9);
  ctx.state.startTime = start;
  
  await next(); // Lanjut ke middleware berikutnya
  
  const duration = Date.now() - start;
  console.log(`← [1] Logger: ${ctx.method} ${ctx.url} - ${ctx.res.statusCode} (${duration}ms)`);
});

// Middleware 2: Authentication
app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  console.log(`   [2] Auth: Checking authentication for ${ctx.url}`);
  
  const authHeader = ctx.get('authorization');
  
  // Simulasi autentikasi
  if (ctx.url.startsWith('/protected') && !authHeader) {
    console.log(`   [2] Auth: ❌ Unauthorized access to ${ctx.url}`);
    ctx.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
      requestId: ctx.state.requestId
    });
    return; // Stop chain, tidak panggil next()
  }
  
  // Set user info jika authenticated
  if (authHeader) {
    ctx.state.user = {
      id: 123,
      name: 'John Doe',
      token: authHeader
    };
    console.log(`   [2] Auth: ✅ User authenticated: ${ctx.state.user.name}`);
  } else {
    console.log(`   [2] Auth: ✅ Public route, no auth required`);
  }
  
  await next(); // Lanjut ke middleware berikutnya
});

// Middleware 3: CORS Headers
app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  console.log(`   [3] CORS: Setting headers for ${ctx.url}`);
  
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (ctx.method === 'OPTIONS') {
    console.log(`   [3] CORS: ✅ Preflight request handled`);
    ctx.status(200).send('');
    return; // Stop chain untuk OPTIONS
  }
  
  await next(); // Lanjut ke middleware berikutnya
});

// Middleware 4: Request ID Header
app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  console.log(`   [4] Headers: Adding request ID header`);
  
  ctx.set('X-Request-ID', ctx.state.requestId);
  ctx.set('X-Timestamp', new Date().toISOString());
  
  await next(); // Lanjut ke handler
});

// Middleware khusus untuk route /api/*
app.use('/api', async (ctx: CenzeroContext, next: () => Promise<void>) => {
  console.log(`   [5] API: API-specific middleware for ${ctx.url}`);
  
  ctx.set('X-API-Version', '1.0');
  ctx.state.isApiRoute = true;
  
  await next();
});

// ========================================
// ROUTE HANDLERS dengan Context (ctx)
// ========================================

// Handler 1: Hello dengan parameter
app.get('/hello/:name', async (ctx: CenzeroContext) => {
  console.log(`   [Handler] Hello: Processing request for ${ctx.params.name}`);
  
  // Context object berisi semua yang kita butuhkan
  ctx.json({
    message: `Hello ${ctx.params.name}!`,
    requestId: ctx.state.requestId,
    timestamp: ctx.state.timestamp,
    responseTime: `${Date.now() - ctx.state.startTime}ms`
  });
});

// Handler 2: User info dengan query parameters
app.get('/users/:id', async (ctx: CenzeroContext) => {
  console.log(`   [Handler] Users: Getting user ${ctx.params.id}`);
  
  const userId = ctx.params.id;
  const { include, format } = ctx.query;
  
  ctx.json({
    user: {
      id: parseInt(userId),
      name: `User ${userId}`,
      email: `user${userId}@example.com`
    },
    options: {
      include: include || 'basic',
      format: format || 'json'
    },
    meta: {
      requestId: ctx.state.requestId,
      authenticatedUser: ctx.state.user || null
    }
  });
});

// Handler 3: Protected route (butuh authentication)
app.get('/protected/profile', async (ctx: CenzeroContext) => {
  console.log(`   [Handler] Profile: Protected route accessed`);
  
  // Middleware sudah handle auth, di sini kita tinggal pakai user info
  ctx.json({
    message: 'Protected profile data',
    user: ctx.state.user,
    sessionInfo: {
      requestId: ctx.state.requestId,
      timestamp: new Date().toISOString()
    }
  });
});

// Handler 4: API endpoint
app.get('/api/status', async (ctx: CenzeroContext) => {
  console.log(`   [Handler] API Status: API endpoint accessed`);
  
  ctx.json({
    status: 'OK',
    api: {
      version: '1.0',
      isApiRoute: ctx.state.isApiRoute
    },
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage()
    },
    request: {
      id: ctx.state.requestId,
      method: ctx.method,
      url: ctx.url,
      userAgent: ctx.get('user-agent')
    }
  });
});

// Handler 5: POST dengan body
app.post('/users', async (ctx: CenzeroContext) => {
  console.log(`   [Handler] Create User: Processing POST request`);
  
  const userData = ctx.body;
  
  if (!userData || !userData.name) {
    ctx.status(400).json({
      error: 'Bad Request',
      message: 'Name is required',
      requestId: ctx.state.requestId
    });
    return;
  }
  
  // Simulasi create user
  const newUser = {
    id: Math.floor(Math.random() * 1000),
    ...userData,
    createdAt: new Date().toISOString(),
    createdBy: ctx.state.user?.name || 'Anonymous'
  };
  
  ctx.status(201).json({
    message: 'User created successfully',
    user: newUser,
    meta: {
      requestId: ctx.state.requestId,
      processingTime: `${Date.now() - ctx.state.startTime}ms`
    }
  });
});

// Handler 6: Error demonstration
app.get('/error', async (ctx: CenzeroContext) => {
  console.log(`   [Handler] Error: Simulating error`);
  
  // Simulasi error untuk menunjukkan error handling
  throw new Error('This is a simulated error for testing');
});

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================

// Error handling middleware (harus di akhir)
app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  try {
    await next();
  } catch (error: any) {
    console.log(`   [Error] Caught error: ${error.message}`);
    
    ctx.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      requestId: ctx.state.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// ========================================
// START SERVER
// ========================================

if (require.main === module) {
  app.listen(3000, 'localhost', () => {
    console.log('\n🚀 Middleware Chaining Demo Server started at http://localhost:3000\n');
    console.log('📋 Test these endpoints:');
    console.log('');
    console.log('  Public routes:');
    console.log('    GET  http://localhost:3000/hello/john');
    console.log('    GET  http://localhost:3000/users/123?include=profile&format=detailed');
    console.log('    GET  http://localhost:3000/api/status');
    console.log('');
    console.log('  Protected routes (need Authorization header):');
    console.log('    GET  http://localhost:3000/protected/profile');
    console.log('');
    console.log('  POST endpoints:');
    console.log('    POST http://localhost:3000/users');
    console.log('         Body: {"name": "Alice", "email": "alice@example.com"}');
    console.log('');
    console.log('  Error testing:');
    console.log('    GET  http://localhost:3000/error');
    console.log('');
    console.log('🧪 Test commands:');
    console.log('  curl http://localhost:3000/hello/world');
    console.log('  curl http://localhost:3000/users/456?include=posts');
    console.log('  curl -H "Authorization: Bearer token123" http://localhost:3000/protected/profile');
    console.log('  curl -X POST -H "Content-Type: application/json" -d \'{"name":"Bob"}\' http://localhost:3000/users');
    console.log('');
  });
}

export { app };
