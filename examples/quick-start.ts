import { CenzeroApp } from '../src/core/server';
import { CenzeroContext } from '../src/core/context';
import type { NextFunction } from '../src/core/middleware-engine';

// Create app instance
const app = new CenzeroApp();

// 1. Request logging middleware
app.use(async (ctx: CenzeroContext, next: NextFunction) => {
  const start = Date.now();
  console.log(`→ ${ctx.method} ${ctx.url}`);
  
  await next(); // Continue to next middleware
  
  const duration = Date.now() - start;
  console.log(`← ${ctx.method} ${ctx.url} - ${duration}ms`);
});

// 2. Error handling middleware
app.use(async (ctx: CenzeroContext, next: NextFunction) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    ctx.status(500).json({ 
      error: 'Internal server error',
      message: (error as Error).message 
    });
  }
});

// 3. CORS middleware
app.use(async (ctx: CenzeroContext, next: NextFunction) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (ctx.method === 'OPTIONS') {
    ctx.status(200);
    return; // Stop here for preflight requests
  }
  
  await next();
});

// 4. Authentication middleware
app.use(async (ctx: CenzeroContext, next: NextFunction) => {
  const authHeader = ctx.get('authorization');
  
  // Skip auth for login endpoint
  if (ctx.url === '/login') {
    await next();
    return;
  }
  
  if (!authHeader) {
    ctx.status(401).json({ error: 'Authentication required' });
    return; // Stop the chain
  }
  
  // Add user to context
  ctx.state.user = { id: 1, name: 'User', authenticated: true };
  
  await next();
});

// 5. API-specific middleware (only for /api routes)
app.use('/api', async (ctx: CenzeroContext, next: NextFunction) => {
  console.log('API middleware executing');
  
  ctx.set('X-API-Version', '1.0');
  ctx.set('Content-Type', 'application/json');
  
  await next();
});

// Example route handlers
const loginHandler = async (ctx: CenzeroContext) => {
  ctx.json({ message: 'Login successful', token: 'jwt-token' });
};

const apiHandler = async (ctx: CenzeroContext) => {
  ctx.json({ 
    message: 'API response',
    user: ctx.state.user,
    timestamp: new Date().toISOString()
  });
};

// Usage example
async function handleRequest(method: string, url: string, headers: Record<string, string> = {}) {
  const middlewareEngine = app.getMiddlewareEngine();
  
  // Create mock context (in real app, this comes from HTTP request)
  const responseData: any = {};
  
  const ctx = {
    req: {
      method, url, headers,
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
        console.log(`Header: ${name} = ${value}`);
      },
      end: (data?: string) => {
        responseData.ended = true;
        if (data) responseData.body = data;
      }
    },
    method, url,
    path: url,
    headers, params: {}, query: {}, body: undefined,
    state: {},
    status: function(code: number) { 
      this.res.statusCode = code;
      responseData.status = code;
      console.log(`Status: ${code}`);
      return this; 
    },
    json: function(data: any) { 
      responseData.json = data;
      this.res.setHeader('Content-Type', 'application/json');
      this.res.end(JSON.stringify(data));
      console.log('Response:', JSON.stringify(data, null, 2));
    },
    set: function(name: string, value: string) { 
      this.res.setHeader(name, value);
    },
    get: function(name: string) { 
      return headers[name.toLowerCase()]; 
    },
    _testData: responseData
  } as any as CenzeroContext;
  
  // Determine handler based on URL
  const handler = url.startsWith('/api') ? apiHandler : 
                 url === '/login' ? loginHandler : 
                 async (ctx: CenzeroContext) => ctx.json({ message: 'Not found' });
  
  // Execute middleware chain with handler
  await middlewareEngine.execute(ctx, handler);
}

// Examples
console.log('=== Express.js-like Middleware Example ===\n');

// Test different scenarios
(async () => {
  console.log('1. Login request:');
  await handleRequest('POST', '/login');
  console.log();
  
  console.log('2. Authenticated API request:');
  await handleRequest('GET', '/api/users', { authorization: 'Bearer token' });
  console.log();
  
  console.log('3. Unauthenticated request:');
  await handleRequest('GET', '/protected');
  console.log();
  
  console.log('4. CORS preflight:');
  await handleRequest('OPTIONS', '/api/test');
})().catch(console.error);

export { app };
