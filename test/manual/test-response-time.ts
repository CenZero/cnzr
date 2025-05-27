import { CenzeroApp } from './src/core/server';
import { responseTimeMiddleware, createResponseTimeMiddleware } from './src/middleware/response-time';
import { loggerMiddleware } from './src/middleware/logger';
import { CenzeroContext } from './src/core/context';

console.log('⏱️  Testing Response Time Middleware...\n');

// Test 1: Basic response time middleware
const app1 = new CenzeroApp();

// CRITICAL: Response time MUST be first
app1.use(responseTimeMiddleware);
app1.use(loggerMiddleware);

app1.get('/', (ctx: CenzeroContext) => {
  ctx.json({ 
    message: 'Basic response time test',
    timestamp: new Date().toISOString()
  });
});

app1.get('/slow', async (ctx: CenzeroContext) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  ctx.json({ message: 'Slow endpoint', delay: '100ms' });
});

// Test 2: Custom configuration
const app2 = new CenzeroApp();

app2.use(createResponseTimeMiddleware({
  header: 'X-Processing-Time',
  precision: 2,
  log: true,
  formatter: (time) => `${time}ms (custom format)`
}));
app2.use(loggerMiddleware);

app2.get('/', (ctx: CenzeroContext) => {
  ctx.json({ 
    message: 'Custom response time test',
    header: 'X-Processing-Time'
  });
});

// Start test servers
console.log('Starting response time test servers...');

try {
  app1.listen(3071);
  console.log('✅ Basic response time: http://localhost:3071');
  
  app2.listen(3072);
  console.log('✅ Custom response time: http://localhost:3072');
  
  console.log('\n📋 Test the X-Response-Time header:');
  console.log('\n1. Basic format (X-Response-Time: 12ms):');
  console.log('   curl -i http://localhost:3071/');
  console.log('   curl -i http://localhost:3071/slow');
  
  console.log('\n2. Custom format (X-Processing-Time: 12.34ms (custom format)):');
  console.log('   curl -i http://localhost:3072/');
  
  console.log('\n✨ Response Time middleware successfully integrated!');
  console.log('🔍 Check response headers for timing information.');
  console.log('📊 Headers will show request processing time in format: X-Response-Time: 12ms');
  
} catch (error) {
  console.error('❌ Error starting servers:', error);
}
