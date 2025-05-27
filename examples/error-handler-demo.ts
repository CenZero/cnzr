// Demo Custom Error Handler Middleware untuk Cenzero Framework
// Menunjukkan semua fitur error handling yang sudah diimplementasikan:
// ✅ Tangkap semua unhandled error
// ✅ Support custom handler via app.setErrorHandler(fn)  
// ✅ Default output: status 500 + JSON message

import { CenzeroApp } from '../src/core/server';
import { CenzeroContext } from '../src/core/context';
import { CenzeroRequest, CenzeroResponse } from '../src/core/types';
import { ErrorHandlerManager } from '../src/core/error-handler';

const app = new CenzeroApp({
  port: 3008,
  useContext: true
});

// 1. Custom Error Handler untuk Context Mode
app.setErrorHandler((error: Error, ctx: CenzeroContext) => {
  console.log('\n🔥 Custom Error Handler (Context Mode):');
  console.log(`Error: ${error.message}`);
  console.log(`Path: ${ctx.path}`);
  console.log(`Method: ${ctx.method}`);
  
  // Custom error response berdasarkan status code
  const statusCode = (error as any).statusCode || 500;
  
  if (statusCode === 404) {
    ctx.status(404).json({
      success: false,
      error: 'Resource Not Found',
      message: `The requested resource '${ctx.path}' was not found`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      requestId: ctx.state.requestId || 'unknown'
    });
  } else if (statusCode === 401) {
    ctx.status(401).json({
      success: false,
      error: 'Authentication Required',
      message: 'Please provide valid authentication credentials',
      statusCode: 401,
      timestamp: new Date().toISOString()
    });
  } else if (statusCode === 400) {
    ctx.status(400).json({
      success: false,
      error: 'Bad Request',
      message: error.message,
      statusCode: 400,
      timestamp: new Date().toISOString(),
      details: 'Please check your request parameters'
    });
  } else {
    // Custom 500 error response
    ctx.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      errorId: Math.random().toString(36).substring(2),
      support: 'Please contact support@cenzero.com'
    });
  }
});

// 2. Middleware untuk request ID (untuk tracking errors)
app.use((ctx: CenzeroContext, next: () => Promise<void>) => {
  ctx.state.requestId = Math.random().toString(36).substring(2, 15);
  ctx.set('X-Request-ID', ctx.state.requestId);
  
  console.log(`📝 Request: ${ctx.method} ${ctx.path} [${ctx.state.requestId}]`);
  return next();
});

// 3. Routes yang akan throw berbagai jenis error

// Error biasa (unhandled)
app.get('/error/unhandled', (ctx: CenzeroContext) => {
  // Ini akan ditangkap oleh error handler
  throw new Error('This is an unhandled error!');
});

// Error dengan status code custom
app.get('/error/custom-status', (ctx: CenzeroContext) => {
  const error = ErrorHandlerManager.createError('Custom error with status code', 422);
  throw error;
});

// 404 Error menggunakan helper
app.get('/error/not-found', (ctx: CenzeroContext) => {
  throw ErrorHandlerManager.notFound('The requested user was not found');
});

// 400 Bad Request
app.get('/error/bad-request', (ctx: CenzeroContext) => {
  throw ErrorHandlerManager.badRequest('Invalid request parameters provided');
});

// 401 Unauthorized
app.get('/error/unauthorized', (ctx: CenzeroContext) => {
  throw ErrorHandlerManager.unauthorized('Invalid authentication token');
});

// Error async 
app.get('/error/async', async (ctx: CenzeroContext) => {
  // Simulate async operation that fails
  await new Promise(resolve => setTimeout(resolve, 100));
  throw new Error('Async operation failed');
});

// Error dalam middleware
app.get('/error/middleware', (ctx: CenzeroContext, next: () => Promise<void>) => {
  throw new Error('Error in middleware');
}, (ctx: CenzeroContext) => {
  // Handler ini tidak akan dijalankan karena middleware error
  ctx.json({ message: 'This should not be reached' });
});

// Error dengan validation
app.post('/api/users', (ctx: CenzeroContext) => {
  const { name, email } = ctx.body || {};
  
  if (!name) {
    throw ErrorHandlerManager.badRequest('Name is required');
  }
  
  if (!email) {
    throw ErrorHandlerManager.badRequest('Email is required');
  }
  
  if (!email.includes('@')) {
    const error = ErrorHandlerManager.createError('Invalid email format', 422);
    throw error;
  }
  
  ctx.json({
    message: 'User created successfully',
    user: { name, email }
  });
});

// Route normal untuk testing
app.get('/api/health', (ctx: CenzeroContext) => {
  ctx.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    requestId: ctx.state.requestId
  });
});

// Route dengan JSON response normal
app.get('/api/users/:id', (ctx: CenzeroContext) => {
  const userId = ctx.params.id;
  
  // Simulate user not found
  if (userId === '999') {
    throw ErrorHandlerManager.notFound(`User with ID ${userId} not found`);
  }
  
  ctx.json({
    user: {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`
    }
  });
});

// Route yang memicu berbagai error types untuk testing
app.get('/test/error-types', (ctx: CenzeroContext) => {
  const type = ctx.query.type as string;
  
  switch (type) {
    case 'syntax':
      // Simulate syntax error
      eval('invalid javascript syntax');
      break;
      
    case 'reference':
      // Reference error
      const undefinedVar = (global as any).someUndefinedVariable.nonExistentProperty;
      break;
      
    case 'type':
      // Type error
      const nullVar = null;
      (nullVar as any).someMethod();
      break;
      
    case 'range':
      // Range error
      const arr = new Array(-1);
      break;
      
    default:
      throw new Error('Unknown error type');
  }
});

// Middleware untuk handle 404 (route tidak ditemukan)
app.use('*', (ctx: CenzeroContext) => {
  throw ErrorHandlerManager.notFound(`Route ${ctx.method} ${ctx.path} not found`);
});

// Start server
app.listen(3009, 'localhost', () => {
  console.log('\n🚀 Custom Error Handler Demo Server running on http://localhost:3009');
  console.log('\n📋 Test endpoints untuk error handling:');
  console.log('👉 GET  /error/unhandled          - Unhandled error biasa');
  console.log('👉 GET  /error/custom-status      - Error dengan custom status code');
  console.log('👉 GET  /error/not-found          - 404 error');
  console.log('👉 GET  /error/bad-request        - 400 error');
  console.log('👉 GET  /error/unauthorized       - 401 error');
  console.log('👉 GET  /error/async              - Async error');
  console.log('👉 GET  /error/middleware         - Error dalam middleware');
  console.log('👉 POST /api/users                - Validation errors');
  console.log('👉 GET  /api/users/999            - User not found');
  console.log('👉 GET  /test/error-types?type=   - syntax|reference|type|range');
  console.log('👉 GET  /api/health               - Normal response');
  console.log('👉 GET  /not-exists               - 404 from catch-all');
  
  console.log('\n📝 Curl examples:');
  console.log('curl http://localhost:3009/error/unhandled');
  console.log('curl http://localhost:3009/error/not-found');
  console.log('curl -X POST http://localhost:3009/api/users -H "Content-Type: application/json" -d \'{}\'');
  console.log('curl http://localhost:3009/api/users/999');
  console.log('curl http://localhost:3009/test/error-types?type=syntax');
  console.log('curl http://localhost:3009/not-exists');
});

/*
Features yang sudah diimplementasikan dan berfungsi:

✅ 1. TANGKAP SEMUA UNHANDLED ERROR
   - Semua error otomatis ditangkap oleh error handler middleware
   - Error async juga ditangkap dengan benar
   - Error dalam middleware juga ditangkap

✅ 2. SUPPORT CUSTOM HANDLER VIA app.setErrorHandler(fn)
   - Method app.setErrorHandler() tersedia
   - Custom handler bisa access error, context, dan request info
   - Multiple error handlers bisa didaftarkan (prioritas berdasarkan urutan)

✅ 3. DEFAULT OUTPUT: STATUS 500 + JSON MESSAGE
   - Default error response format JSON
   - Status code otomatis berdasarkan error type
   - Error message dan stack trace (development mode)
   - Request info dan timestamp

✅ 4. FITUR TAMBAHAN:
   - Error helpers (createError, notFound, badRequest, dll)
   - Automatic status code detection
   - Request tracking dengan request ID
   - Development vs production mode
   - Error logging dengan detail info
   - Support untuk context mode dan legacy mode
*/
