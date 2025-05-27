import { CenzeroApp } from './src/core/server';
import { corsMiddleware, createCorsMiddleware } from './src/middleware/cors';
import { loggerMiddleware } from './src/middleware/logger';
import { CenzeroContext } from './src/core/context';

console.log('🧪 Testing CORS Middleware Integration...\n');

// Test 1: Basic CORS middleware
const app1 = new CenzeroApp();
app1.use(loggerMiddleware);
app1.use(corsMiddleware);

app1.get('/', (ctx: CenzeroContext) => {
  ctx.json({ message: 'Basic CORS test', timestamp: new Date().toISOString() });
});

// Test 2: Custom CORS configuration
const app2 = new CenzeroApp();
app2.use(loggerMiddleware);
app2.use(createCorsMiddleware({
  origin: ['http://localhost:3000', 'https://example.com'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app2.get('/api/test', (ctx: CenzeroContext) => {
  ctx.json({ message: 'Custom CORS test', origin: ctx.get('origin') || 'no-origin' });
});

// Start test servers
console.log('Starting test servers...');

try {
  app1.listen(3041);
  console.log('✅ Basic CORS test server: http://localhost:3041');
  
  app2.listen(3042);
  console.log('✅ Custom CORS test server: http://localhost:3042');
  
  console.log('\n📋 Test the CORS headers with these commands:');
  console.log('\n1. Basic CORS (should allow any origin):');
  console.log('   curl -i -H "Origin: http://example.com" http://localhost:3041/');
  
  console.log('\n2. Custom CORS (should allow specific origins):');
  console.log('   curl -i -H "Origin: https://example.com" http://localhost:3042/api/test');
  console.log('   curl -i -H "Origin: https://blocked.com" http://localhost:3042/api/test');
  
  console.log('\n3. Preflight request test:');
  console.log('   curl -i -X OPTIONS -H "Origin: https://example.com" -H "Access-Control-Request-Method: POST" http://localhost:3042/api/test');
  
  console.log('\n✨ CORS middleware successfully integrated!');
  console.log('🔍 Check the response headers for CORS configuration.');
  
} catch (error) {
  console.error('❌ Error starting test servers:', error);
}
