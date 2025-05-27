import { CenzeroApp } from './src/core/server';
import { corsMiddleware, createCorsMiddleware, corsWithOrigins, corsWithCredentials } from './src/middleware/cors';
import { loggerMiddleware } from './src/middleware/logger';
import { CenzeroContext } from './src/core/context';

console.log('🎯 CORS Middleware Complete Example\n');

// ==========================================
// Example 1: Basic CORS - Allow All Origins
// ==========================================

const basicApp = new CenzeroApp();
basicApp.use(loggerMiddleware);
basicApp.use(corsMiddleware); // Simple usage: app.use(corsMiddleware)

basicApp.get('/', (ctx: CenzeroContext) => {
  ctx.json({ 
    message: 'Basic CORS - allows all origins (*)',
    server: 'basic-cors',
    timestamp: new Date().toISOString()
  });
});

basicApp.get('/users', (ctx: CenzeroContext) => {
  ctx.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ]
  });
});

// ==========================================
// Example 2: Advanced CORS Configuration
// ==========================================

const advancedApp = new CenzeroApp();
advancedApp.use(loggerMiddleware);
advancedApp.use(createCorsMiddleware({
  origin: ['http://localhost:3000', 'https://example.com', 'https://myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

advancedApp.get('/api/protected', (ctx: CenzeroContext) => {
  // Set exposed headers
  ctx.set('X-Total-Count', '100');
  ctx.set('X-Page-Count', '10');
  
  ctx.json({ 
    message: 'Advanced CORS configuration',
    features: [
      'Origin whitelist',
      'Credentials support',
      'Custom headers',
      'Exposed headers',
      'Preflight caching'
    ],
    requestOrigin: ctx.get('origin') || 'no-origin'
  });
});

advancedApp.post('/api/data', (ctx: CenzeroContext) => {
  ctx.json({ 
    message: 'Data created with CORS',
    data: ctx.body || { default: 'sample data' },
    origin: ctx.get('origin')
  });
});

// ==========================================
// Example 3: Helper Functions
// ==========================================

const helperApp = new CenzeroApp();
helperApp.use(loggerMiddleware);

// Using corsWithOrigins helper
helperApp.use('/public', corsWithOrigins([
  'http://localhost:3000',
  'https://trusted-domain.com'
]));

// Using corsWithCredentials helper
helperApp.use('/auth', corsWithCredentials);

helperApp.get('/public/info', (ctx: CenzeroContext) => {
  ctx.json({
    message: 'Public endpoint with origin whitelist',
    allowedOrigins: ['localhost:3000', 'trusted-domain.com']
  });
});

helperApp.get('/auth/session', (ctx: CenzeroContext) => {
  ctx.json({
    message: 'Auth endpoint with credentials support',
    sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
    hasCredentials: true
  });
});

// Start servers
const port1 = 3051;
const port2 = 3052;
const port3 = 3053;

try {
  basicApp.listen(port1);
  console.log(`✅ Basic CORS server: http://localhost:${port1}`);
  
  advancedApp.listen(port2);
  console.log(`✅ Advanced CORS server: http://localhost:${port2}`);
  
  helperApp.listen(port3);
  console.log(`✅ Helper functions server: http://localhost:${port3}`);
  
  console.log('\n🧪 Test Commands:\n');
  
  console.log('1. Basic CORS (allows any origin):');
  console.log(`   curl -i -H "Origin: http://anywhere.com" http://localhost:${port1}/`);
  console.log(`   curl -i -H "Origin: http://anywhere.com" http://localhost:${port1}/users`);
  
  console.log('\n2. Advanced CORS (origin whitelist):');
  console.log(`   curl -i -H "Origin: https://example.com" http://localhost:${port2}/api/protected`);
  console.log(`   curl -i -H "Origin: https://blocked.com" http://localhost:${port2}/api/protected`);
  
  console.log('\n3. Preflight request:');
  console.log(`   curl -i -X OPTIONS -H "Origin: https://example.com" -H "Access-Control-Request-Method: POST" http://localhost:${port2}/api/data`);
  
  console.log('\n4. Helper functions:');
  console.log(`   curl -i -H "Origin: http://localhost:3000" http://localhost:${port3}/public/info`);
  console.log(`   curl -i -H "Origin: https://blocked.com" http://localhost:${port3}/public/info`);
  console.log(`   curl -i -H "Origin: http://anywhere.com" http://localhost:${port3}/auth/session`);
  
  console.log('\n✨ CORS Middleware Features Demonstrated:');
  console.log('  ✅ Basic usage with app.use(corsMiddleware)');
  console.log('  ✅ Custom configuration with createCorsMiddleware()');
  console.log('  ✅ Origin whitelisting');
  console.log('  ✅ Credentials support');
  console.log('  ✅ Custom headers (allowed & exposed)');
  console.log('  ✅ Preflight request handling');
  console.log('  ✅ Helper functions for common scenarios');
  console.log('  ✅ Route-specific CORS configuration');
  
} catch (error) {
  console.error('❌ Error starting servers:', error);
}
