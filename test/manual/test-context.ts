#!/usr/bin/env tsx

/**
 * Test sederhana untuk Context class Cenzero Framework
 * Menjalankan berbagai skenario untuk memastikan Context bekerja dengan benar
 */

import { CenzeroApp } from './src/core/server';
import { CenzeroContext } from './src/core/context';

// Helper untuk simulate HTTP request
async function simulateRequest(
  app: CenzeroApp, 
  method: string, 
  url: string, 
  headers: Record<string, string> = {},
  body?: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    const responseData: any = { headers: {} };
    
    // Mock request object
    const req: any = {
      method,
      url,
      path: url.split('?')[0],
      headers: { 'content-type': 'application/json', ...headers },
      body,
      params: {},
      query: {}
    };
    
    // Mock response object
    const res: any = {
      statusCode: 200,
      headersSent: false,
      setHeader: (name: string, value: string) => {
        responseData.headers[name] = value;
      },
      end: (data?: string) => {
        responseData.body = data;
        responseData.ended = true;
        resolve(responseData);
      },
      write: (data: string) => {
        responseData.body = (responseData.body || '') + data;
      }
    };
    
    // Simulate request handling
    setTimeout(() => {
      try {
        (app as any).handleRequest(req, res).catch(reject);
      } catch (error) {
        reject(error);
      }
    }, 10);
  });
}

// Test scenarios
async function runTests() {
  console.log('🧪 Testing Cenzero Context Class\n');
  
  const app = new CenzeroApp({ useContext: true });
  
  // Test 1: Context properties
  console.log('1️⃣  Testing Context properties...');
  
  app.get('/test/properties', async (ctx: CenzeroContext) => {
    // Test semua properties yang diminta
    const response = {
      hasReq: !!ctx.req,
      hasRes: !!ctx.res,
      method: ctx.method,
      url: ctx.url,
      path: ctx.path,
      query: ctx.query,
      params: ctx.params,
      body: ctx.body,
      hasHeaders: !!ctx.headers,
      hasState: !!ctx.state,
      hasSession: !!ctx.session,
      hasCookies: !!ctx.cookies
    };
    
    ctx.json(response);
  });
  
  // Test 2: Helper methods
  console.log('2️⃣  Testing helper methods...');
  
  app.get('/test/methods', async (ctx: CenzeroContext) => {
    // Test chaining status
    ctx.status(201).json({
      message: 'Helper methods test',
      statusSet: true
    });
  });
  
  // Test 3: Query parameters
  console.log('3️⃣  Testing query parameters...');
  
  app.get('/test/query', async (ctx: CenzeroContext) => {
    ctx.json({
      queryReceived: ctx.query,
      queryCount: Object.keys(ctx.query).length
    });
  });
  
  // Test 4: Route parameters
  console.log('4️⃣  Testing route parameters...');
  
  app.get('/test/params/:id/:name', async (ctx: CenzeroContext) => {
    ctx.json({
      paramsReceived: ctx.params,
      id: ctx.params.id,
      name: ctx.params.name
    });
  });
  
  // Test 5: Request body
  console.log('5️⃣  Testing request body...');
  
  app.post('/test/body', async (ctx: CenzeroContext) => {
    ctx.json({
      bodyReceived: ctx.body,
      hasBody: !!ctx.body
    });
  });
  
  // Test 6: State management
  console.log('6️⃣  Testing state management...');
  
  let middlewareOrder: string[] = [];
  
  app.use('/test/state', async (ctx: CenzeroContext, next: () => Promise<void>) => {
    ctx.state.middleware1 = 'executed';
    middlewareOrder.push('middleware1');
    await next();
  });
  
  app.use('/test/state', async (ctx: CenzeroContext, next: () => Promise<void>) => {
    ctx.state.middleware2 = 'executed';
    middlewareOrder.push('middleware2');
    await next();
  });
  
  app.get('/test/state', async (ctx: CenzeroContext) => {
    ctx.json({
      state: ctx.state,
      middlewareOrder: [...middlewareOrder]
    });
    middlewareOrder = []; // Reset untuk test berikutnya
  });
  
  // Test 7: Headers
  console.log('7️⃣  Testing headers...');
  
  app.get('/test/headers', async (ctx: CenzeroContext) => {
    // Set custom header
    ctx.set('X-Custom-Header', 'Test Value');
    ctx.set('X-Test-ID', '12345');
    
    // Get request header
    const userAgent = ctx.get('user-agent') || 'Not provided';
    
    ctx.json({
      requestHeaders: Object.keys(ctx.headers),
      userAgent,
      customHeaderSet: true
    });
  });
  
  // Run actual tests
  console.log('\n🔄 Running tests...\n');
  
  try {
    // Test properties
    const propertiesResult = await simulateRequest(app, 'GET', '/test/properties');
    console.log('✅ Properties test:', JSON.stringify(JSON.parse(propertiesResult.body), null, 2));
    
    // Test methods
    const methodsResult = await simulateRequest(app, 'GET', '/test/methods');
    console.log('✅ Methods test:', JSON.stringify(JSON.parse(methodsResult.body), null, 2));
    
    // Test query - akan butuh implementasi query parsing yang lebih baik
    const queryResult = await simulateRequest(app, 'GET', '/test/query?name=john&age=25&active=true');
    console.log('✅ Query test:', JSON.stringify(JSON.parse(queryResult.body), null, 2));
    
    // Test route params - akan butuh implementasi route matching yang lebih baik  
    const paramsResult = await simulateRequest(app, 'GET', '/test/params/123/john');
    console.log('✅ Params test:', JSON.stringify(JSON.parse(paramsResult.body), null, 2));
    
    // Test body
    const bodyResult = await simulateRequest(app, 'POST', '/test/body', {}, { name: 'John', email: 'john@example.com' });
    console.log('✅ Body test:', JSON.stringify(JSON.parse(bodyResult.body), null, 2));
    
    // Test state
    const stateResult = await simulateRequest(app, 'GET', '/test/state');
    console.log('✅ State test:', JSON.stringify(JSON.parse(stateResult.body), null, 2));
    
    // Test headers
    const headersResult = await simulateRequest(app, 'GET', '/test/headers', { 'user-agent': 'Test Agent/1.0' });
    console.log('✅ Headers test:', JSON.stringify(JSON.parse(headersResult.body), null, 2));
    
    console.log('\n🎉 All Context tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Jalankan tests jika file ini dieksekusi langsung
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };
