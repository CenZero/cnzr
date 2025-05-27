#!/usr/bin/env node

/**
 * Working Demo: Middleware Chaining + Context in Cenzero Framework
 * 
 * This demonstrates:
 * ✅ app.use(middleware) for chaining middleware
 * ✅ Context object (ctx) sent to every handler  
 * ✅ Handler format: app.get('/path', async (ctx) => { ... })
 * ✅ Shared state between middleware via ctx.state
 * ✅ All Context properties: req, res, query, params, body, helpers
 */

const { CenzeroApp } = require('./dist/cjs/core/server');

const app = new CenzeroApp({
  port: 3000,
  useContext: true // Enable Context mode
});

console.log('🔗 Middleware Chaining Demo with Context\n');

// ========================================
// MIDDLEWARE CHAINING with app.use()
// ========================================

// Middleware 1: Request Logger & State Setup
app.use(async (ctx, next) => {
  const start = Date.now();
  console.log(`\n→ [LOGGER] ${ctx.method} ${ctx.url}`);
  
  // Set shared state for other middleware/handlers
  ctx.state.requestId = Math.random().toString(36).substr(2, 9);
  ctx.state.startTime = start;
  ctx.state.timestamp = new Date().toISOString();
  
  await next(); // Continue to next middleware
  
  const duration = Date.now() - start;
  console.log(`← [LOGGER] ${ctx.method} ${ctx.url} - ${ctx.res.statusCode} (${duration}ms)`);
});

// Middleware 2: Authentication Check
app.use(async (ctx, next) => {
  console.log(`   [AUTH] Checking authentication for ${ctx.url}`);
  
  const authHeader = ctx.get('authorization');
  
  // Protected routes require authentication
  if (ctx.url.startsWith('/protected') && !authHeader) {
    console.log(`   [AUTH] ❌ Unauthorized access to ${ctx.url}`);
    ctx.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required for protected routes',
      requestId: ctx.state.requestId
    });
    return; // Stop chain - don't call next()
  }
  
  // Set user info if authenticated
  if (authHeader) {
    ctx.state.user = {
      id: 123,
      name: 'John Doe',
      email: 'john@example.com',
      token: authHeader
    };
    console.log(`   [AUTH] ✅ User authenticated: ${ctx.state.user.name}`);
  } else {
    console.log(`   [AUTH] ✅ Public route, no auth required`);
  }
  
  await next(); // Continue to next middleware
});

// Middleware 3: CORS Headers
app.use(async (ctx, next) => {
  console.log(`   [CORS] Setting headers for ${ctx.url}`);
  
  // Set CORS headers
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (ctx.method === 'OPTIONS') {
    console.log(`   [CORS] ✅ Preflight request handled`);
    ctx.status(200);
    return; // Stop chain for OPTIONS
  }
  
  await next(); // Continue to next middleware
});

// Middleware 4: Request Headers Enhancement
app.use(async (ctx, next) => {
  console.log(`   [HEADERS] Adding custom headers`);
  
  // Add custom headers
  ctx.set('X-Request-ID', ctx.state.requestId);
  ctx.set('X-Timestamp', ctx.state.timestamp);
  ctx.set('X-Powered-By', 'Cenzero Framework');
  
  await next(); // Continue to handler
});

// Path-specific middleware for API routes
app.use('/api', async (ctx, next) => {
  console.log(`   [API-MW] API-specific middleware for ${ctx.url}`);
  
  // API-specific setup
  ctx.set('X-API-Version', '1.0');
  ctx.set('Content-Type', 'application/json');
  ctx.state.isApiRoute = true;
  
  await next();
});

// ========================================
// ROUTE HANDLERS with Context (ctx)
// ========================================

// Handler 1: Hello with route parameters
app.get('/hello/:name', async (ctx) => {
  console.log(`   [HANDLER] Hello: Processing request for "${ctx.params.name}"`);
  
  // Context object contains everything we need
  ctx.json({
    message: `Hello ${ctx.params.name}!`,
    requestInfo: {
      id: ctx.state.requestId,
      timestamp: ctx.state.timestamp,
      method: ctx.method,
      url: ctx.url,
      userAgent: ctx.get('user-agent')
    },
    performance: {
      responseTime: `${Date.now() - ctx.state.startTime}ms`
    }
  });
});

// Handler 2: Users with query parameters
app.get('/users/:id', async (ctx) => {
  console.log(`   [HANDLER] Users: Getting user ${ctx.params.id}`);
  
  const userId = ctx.params.id;
  const { include, format, limit } = ctx.query;
  
  ctx.json({
    user: {
      id: parseInt(userId),
      name: `User ${userId}`,
      email: `user${userId}@example.com`
    },
    queryOptions: {
      include: include || 'basic',
      format: format || 'json', 
      limit: limit || '10'
    },
    meta: {
      requestId: ctx.state.requestId,
      authenticatedUser: ctx.state.user || null,
      processingTime: `${Date.now() - ctx.state.startTime}ms`
    }
  });
});

// Handler 3: Protected route (requires authentication)
app.get('/protected/profile', async (ctx) => {
  console.log(`   [HANDLER] Profile: Protected route accessed`);
  
  // Middleware already handled auth - user is available in ctx.state
  ctx.json({
    message: 'Welcome to your protected profile',
    user: ctx.state.user,
    session: {
      requestId: ctx.state.requestId,
      timestamp: ctx.state.timestamp,
      accessTime: new Date().toISOString()
    }
  });
});

// Handler 4: API endpoint  
app.get('/api/status', async (ctx) => {
  console.log(`   [HANDLER] API Status: API endpoint accessed`);
  
  ctx.json({
    status: 'OK',
    api: {
      version: '1.0',
      isApiRoute: ctx.state.isApiRoute
    },
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      requestId: ctx.state.requestId
    }
  });
});

// Handler 5: POST with body parsing
app.post('/users', async (ctx) => {
  console.log(`   [HANDLER] Create User: Processing POST request`);
  
  const userData = ctx.body;
  
  if (!userData || !userData.name) {
    ctx.status(400).json({
      error: 'Bad Request',
      message: 'Name is required in request body',
      requestId: ctx.state.requestId
    });
    return;
  }
  
  // Simulate user creation
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
app.get('/error', async (ctx) => {
  console.log(`   [HANDLER] Error: Simulating error`);
  
  // Simulate an error to show error handling
  throw new Error('This is a simulated error for testing');
});

// ========================================
// ERROR HANDLING MIDDLEWARE (at the end)
// ========================================

// Global error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.log(`   [ERROR] Caught error: ${error.message}`);
    
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

app.listen(3000, 'localhost', () => {
  console.log('\n🚀 Middleware Chaining Demo Server started at http://localhost:3000\n');
  console.log('📋 Test these endpoints:\n');
  
  console.log('  📝 Basic routes:');
  console.log('    GET  http://localhost:3000/hello/world');
  console.log('    GET  http://localhost:3000/users/123?include=profile&format=detailed');
  console.log('    GET  http://localhost:3000/api/status');
  console.log('');
  
  console.log('  🔒 Protected routes (need Authorization header):');
  console.log('    GET  http://localhost:3000/protected/profile');
  console.log('');
  
  console.log('  📮 POST endpoints:');
  console.log('    POST http://localhost:3000/users');
  console.log('         Body: {"name": "Alice", "email": "alice@example.com"}');
  console.log('');
  
  console.log('  💥 Error testing:');
  console.log('    GET  http://localhost:3000/error');
  console.log('');
  
  console.log('🧪 Test commands:');
  console.log('  curl http://localhost:3000/hello/john');
  console.log('  curl "http://localhost:3000/users/456?include=posts&format=json"');
  console.log('  curl -H "Authorization: Bearer token123" http://localhost:3000/protected/profile');
  console.log('  curl -X POST -H "Content-Type: application/json" -d \'{"name":"Bob","email":"bob@test.com"}\' http://localhost:3000/users');
  console.log('');
});

module.exports = { app };
