import { CenzeroApp } from '../src/core/server';
import { CenzeroContext } from '../src/core/context';
import type { NextFunction } from '../src/core/middleware-engine';

// Create a new Cenzero app instance
const app = new CenzeroApp();

// Example 1: Global logging middleware
app.use(async (ctx: CenzeroContext, next: NextFunction) => {
  const start = Date.now();
  console.log(`→ ${ctx.method} ${ctx.url}`);
  
  await next(); // Continue to next middleware
  
  const duration = Date.now() - start;
  console.log(`← ${ctx.method} ${ctx.url} - ${duration}ms`);
});

// Example 2: Error handling middleware (should be early to catch all errors)
app.use(async (ctx: CenzeroContext, next: NextFunction) => {
  try {
    await next();
  } catch (error) {
    console.error('Error caught by middleware:', error);
    
    ctx.status(500);
    ctx.json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
    });
  }
});

// Example 3: CORS middleware (before auth to handle preflight requests)
app.use(async (ctx: CenzeroContext, next: NextFunction) => {
  // Set CORS headers
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (ctx.method === 'OPTIONS') {
    ctx.status(200);
    return;
  }
  
  await next();
});

// Example 4: Authentication middleware
app.use(async (ctx: CenzeroContext, next: NextFunction) => {
  const authHeader = ctx.headers.authorization || ctx.get('authorization');
  
  if (!authHeader && ctx.url !== '/login') {
    ctx.status(401);
    ctx.json({ error: 'Authentication required' });
    return; // Don't call next() - stop the chain
  }
  
  // Add user info to context
  ctx.state.user = {
    id: 1,
    name: 'Demo User',
    authenticated: true
  };
  
  await next();
});

// Example 5: Path-specific middleware for API routes
app.use('/api', async (ctx: CenzeroContext, next: NextFunction) => {
  console.log('API middleware executing');
  
  // Add API-specific headers
  ctx.set('X-API-Version', '1.0');
  ctx.set('Content-Type', 'application/json');
  
  await next();
});

// Define some route handlers that will receive the processed context
const loginHandler = async (ctx: CenzeroContext) => {
  ctx.status(200);
  ctx.json({
    message: 'Login successful',
    token: 'demo-jwt-token'
  });
};

const apiHandler = async (ctx: CenzeroContext) => {
  // This handler receives the context after all middleware has run
  ctx.status(200);
  ctx.json({
    message: 'API endpoint reached',
    user: ctx.state.user,
    timestamp: new Date().toISOString()
  });
};

const errorHandler = async (ctx: CenzeroContext) => {
  // Simulate an error
  throw new Error('This is a test error');
};

// Helper function to create a mock context for testing
function createMockContext(method: string, url: string, headers: Record<string, string> = {}): CenzeroContext {
  const responseData: any = {};
  
  return {
    req: {
      method,
      url,
      headers,
      path: url,
      params: {},
      query: {},
      body: undefined
    },
    res: {
      statusCode: 200,
      setHeader: (name: string, value: string) => {
        responseData.headers = responseData.headers || {};
        responseData.headers[name] = value;
      },
      end: (data?: string) => {
        responseData.ended = true;
        if (data) responseData.body = data;
      }
    },
    method,
    url,
    path: url,
    headers,
    params: {},
    query: {},
    body: undefined,
    state: {},
    status: function(code: number) { 
      this.res.statusCode = code; 
      responseData.status = code;
      return this; 
    },
    json: function(data: any) { 
      responseData.json = data;
      this.res.setHeader('Content-Type', 'application/json');
      this.res.end(JSON.stringify(data));
    },
    html: function(content: string) {
      responseData.html = content;
      this.res.setHeader('Content-Type', 'text/html');
      this.res.end(content);
    },
    text: function(content: string) {
      responseData.text = content;
      this.res.setHeader('Content-Type', 'text/plain');
      this.res.end(content);
    },
    redirect: function(url: string, statusCode = 302) {
      this.res.statusCode = statusCode;
      this.res.setHeader('Location', url);
      this.res.end();
      responseData.redirect = { url, statusCode };
    },
    send: function(data: any) {
      responseData.send = data;
      if (typeof data === 'string') {
        this.res.setHeader('Content-Type', 'text/plain');
      } else if (typeof data === 'object') {
        this.res.setHeader('Content-Type', 'application/json');
        data = JSON.stringify(data);
      }
      this.res.end(String(data));
    },
    set: function(name: string, value: string) { 
      this.res.setHeader(name, value); 
    },
    get: function(name: string) { 
      return this.headers[name.toLowerCase()]; 
    },
    throw: function(status: number, message?: string): never {
      const error = new Error(message || `HTTP Error ${status}`) as any;
      error.status = status;
      throw error;
    },
    assert: function(condition: any, status: number, message?: string) {
      if (!condition) {
        this.throw(status, message);
      }
    },
    createError: function(status: number, message?: string) {
      const error = new Error(message || `HTTP Error ${status}`) as any;
      error.status = status;
      return error;
    },
    session: {} as any,
    cookies: {} as any,
    _testData: responseData // For accessing response data in tests
  } as any as CenzeroContext;
}

// Demo function to test the middleware chain
async function testMiddlewareChain() {
  console.log('=== Testing Middleware Chain ===\n');
  
  const middlewareEngine = app.getMiddlewareEngine();
  
  // Test 1: Login route (no auth required)
  console.log('Test 1: Login Route');
  const loginCtx = createMockContext('POST', '/login');
  
  await middlewareEngine.execute(loginCtx, loginHandler);
  console.log('Status:', (loginCtx as any)._testData.status || loginCtx.res.statusCode);
  console.log('Response:', (loginCtx as any)._testData.json);
  console.log();
  
  // Test 2: API route with authentication
  console.log('Test 2: API Route (Authenticated)');
  const apiCtx = createMockContext('GET', '/api/users', { authorization: 'Bearer demo-token' });
  
  await middlewareEngine.execute(apiCtx, apiHandler);
  console.log('Status:', (apiCtx as any)._testData.status || apiCtx.res.statusCode);
  console.log('Response:', (apiCtx as any)._testData.json);
  console.log();
  
  // Test 3: Unauthenticated request
  console.log('Test 3: Unauthenticated Request');
  const unauthCtx = createMockContext('GET', '/protected');
  
  await middlewareEngine.execute(unauthCtx, apiHandler);
  console.log('Status:', (unauthCtx as any)._testData.status || unauthCtx.res.statusCode);
  console.log('Response:', (unauthCtx as any)._testData.json);
  console.log();
  
  // Test 4: Error handling
  console.log('Test 4: Error Handling');
  const errorCtx = createMockContext('GET', '/error', { authorization: 'Bearer demo-token' });
  
  await middlewareEngine.execute(errorCtx, errorHandler);
  console.log('Status:', (errorCtx as any)._testData.status || errorCtx.res.statusCode);
  console.log('Response:', (errorCtx as any)._testData.json);
  console.log();
  
  // Test 5: OPTIONS request (CORS preflight)
  console.log('Test 5: CORS Preflight');
  const corsCtx = createMockContext('OPTIONS', '/api/test');
  
  await middlewareEngine.execute(corsCtx, apiHandler);
  console.log('Status:', (corsCtx as any)._testData.status || corsCtx.res.statusCode);
  console.log('Headers:', (corsCtx as any)._testData.headers);
}

// Export for testing
export { app, testMiddlewareChain };

// Run the demo if this file is executed directly
if (require.main === module) {
  testMiddlewareChain().catch(console.error);
}
