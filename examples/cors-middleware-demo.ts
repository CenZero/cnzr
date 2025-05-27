import { CenzeroApp, corsMiddleware, createCorsMiddleware, corsWithOrigins, corsWithCredentials, loggerMiddleware } from '../src/index';

// Example 1: Basic CORS middleware
console.log('=== Example 1: Basic CORS (Allow All Origins) ===');

const app1 = new CenzeroApp();

// Apply basic CORS middleware
app1.use(loggerMiddleware);
app1.use(corsMiddleware);

app1.get('/', (ctx) => {
  ctx.json({ message: 'Hello with basic CORS!', timestamp: new Date().toISOString() });
});

app1.get('/users', (ctx) => {
  ctx.json({ 
    users: [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ]
  });
});

// Example 2: Custom CORS with specific origins
console.log('=== Example 2: Custom CORS with Origin Whitelist ===');

const app2 = new CenzeroApp();

app2.use(loggerMiddleware);
app2.use(createCorsMiddleware({
  origin: ['http://localhost:3000', 'https://example.com', 'https://myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

app2.get('/api/protected', (ctx) => {
  ctx.json({ 
    message: 'This endpoint requires specific origin and supports credentials',
    user: { id: 1, name: 'Authenticated User' }
  });
});

app2.post('/api/data', (ctx) => {
  ctx.json({ 
    message: 'Data created successfully',
    data: ctx.body || { default: 'data' }
  });
});

// Example 3: CORS with credentials helper
console.log('=== Example 3: CORS with Credentials ===');

const app3 = new CenzeroApp();

app3.use(loggerMiddleware);
app3.use(corsWithCredentials);

app3.get('/api/session', (ctx) => {
  ctx.json({ 
    message: 'Session endpoint with credentials support',
    sessionId: 'sess_' + Math.random().toString(36).substr(2, 9)
  });
});

// Example 4: CORS with origin whitelist helper
console.log('=== Example 4: CORS with Origin Whitelist Helper ===');

const app4 = new CenzeroApp();

app4.use(loggerMiddleware);
app4.use(corsWithOrigins([
  'http://localhost:3000',
  'http://localhost:3001',
  'https://trusted-domain.com'
]));

app4.get('/api/public', (ctx) => {
  ctx.json({ 
    message: 'Public API with origin whitelist',
    data: 'public data'
  });
});

// Example 5: Advanced CORS with dynamic origin
console.log('=== Example 5: Advanced CORS with Dynamic Origin ===');

const app5 = new CenzeroApp();

app5.use(loggerMiddleware);
app5.use(createCorsMiddleware({
  origin: (ctx) => {
    const requestOrigin = ctx.get('origin');
    console.log('CORS request from origin:', requestOrigin);
    
    // Allow localhost in development
    if (requestOrigin?.includes('localhost')) {
      return requestOrigin;
    }
    
    // Allow subdomains of trusted domain
    if (requestOrigin?.endsWith('.trusted-domain.com')) {
      return requestOrigin;
    }
    
    // Allow specific production domains
    const allowedDomains = [
      'https://myapp.com',
      'https://www.myapp.com',
      'https://admin.myapp.com'
    ];
    
    if (requestOrigin && allowedDomains.includes(requestOrigin)) {
      return requestOrigin;
    }
    
    return false; // Reject all other origins
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Rate-Limit'],
  credentials: true,
  maxAge: 3600 // 1 hour
}));

app5.get('/api/advanced', (ctx) => {
  // Set some exposed headers
  ctx.set('X-Total-Count', '100');
  ctx.set('X-Page-Count', '10');
  ctx.set('X-Rate-Limit', '1000');
  
  ctx.json({ 
    message: 'Advanced CORS endpoint',
    features: [
      'Dynamic origin validation',
      'Custom exposed headers',
      'Credentials support',
      'Preflight caching'
    ]
  });
});

// Example 6: Route-specific CORS
console.log('=== Example 6: Route-specific CORS ===');

const app6 = new CenzeroApp();

app6.use(loggerMiddleware);

// Different CORS for different route groups
const publicCors = createCorsMiddleware({
  origin: '*',
  methods: ['GET']
});

const apiCors = createCorsMiddleware({
  origin: ['http://localhost:3000', 'https://api.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
});

const adminCors = createCorsMiddleware({
  origin: 'https://admin.example.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token']
});

// Apply different CORS to different routes
app6.use('/public', publicCors);
app6.use('/api', apiCors);
app6.use('/admin', adminCors);

app6.get('/public/info', (ctx) => {
  ctx.json({ message: 'Public info - open CORS' });
});

app6.get('/api/users', (ctx) => {
  ctx.json({ message: 'API users - restricted CORS' });
});

app6.get('/admin/settings', (ctx) => {
  ctx.json({ message: 'Admin settings - very restricted CORS' });
});

// Start all servers on different ports
const servers = [
  { app: app1, port: 3031, name: 'Basic CORS' },
  { app: app2, port: 3032, name: 'Custom CORS' },
  { app: app3, port: 3033, name: 'CORS with Credentials' },
  { app: app4, port: 3034, name: 'CORS with Origin Whitelist' },
  { app: app5, port: 3035, name: 'Advanced Dynamic CORS' },
  { app: app6, port: 3036, name: 'Route-specific CORS' }
];

console.log('\n🚀 Starting CORS middleware demo servers...\n');

servers.forEach(({ app, port, name }) => {
  try {
    app.listen(port);
    console.log(`✅ ${name} server running on http://localhost:${port}`);
  } catch (error) {
    console.error(`❌ Failed to start ${name} server on port ${port}:`, error);
  }
});

console.log('\n📋 Test Commands:');
console.log('Basic CORS:');
console.log('  curl -H "Origin: http://example.com" http://localhost:3031/');
console.log('  curl -X OPTIONS -H "Origin: http://example.com" -H "Access-Control-Request-Method: GET" http://localhost:3031/');

console.log('\nCustom CORS:');
console.log('  curl -H "Origin: https://example.com" http://localhost:3032/api/protected');
console.log('  curl -H "Origin: https://blocked.com" http://localhost:3032/api/protected');

console.log('\nCORS with Credentials:');
console.log('  curl -H "Origin: http://localhost:3000" --include http://localhost:3033/api/session');

console.log('\nAdvanced CORS:');
console.log('  curl -H "Origin: http://localhost:3000" --include http://localhost:3035/api/advanced');
console.log('  curl -H "Origin: https://admin.myapp.com" --include http://localhost:3035/api/advanced');

console.log('\nRoute-specific CORS:');
console.log('  curl -H "Origin: http://anywhere.com" http://localhost:3036/public/info');
console.log('  curl -H "Origin: http://localhost:3000" http://localhost:3036/api/users');
console.log('  curl -H "Origin: https://admin.example.com" http://localhost:3036/admin/settings');

console.log('\n💡 Tips:');
console.log('- Use browser dev tools to see CORS headers');
console.log('- Check preflight OPTIONS requests');
console.log('- Notice how different origins are handled');
console.log('- Watch the console for dynamic origin validation logs');
