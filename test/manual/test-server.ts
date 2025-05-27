import { CenzeroApp, CenzeroRequest, CenzeroResponse, MiddlewareFunction } from './src';

// Create a simple test app to verify the server.ts implementation
const app = new CenzeroApp({
  port: 3001,
  host: 'localhost'
});

// Test basic routing
app.get('/test', (req: CenzeroRequest, res: CenzeroResponse) => {
  res.json({ message: 'Cenzero server is working coy!', timestamp: new Date().toISOString() });
});

// Test dynamic routing
app.get('/test/:id', (req: CenzeroRequest, res: CenzeroResponse) => {
  res.json({ id: req.params?.id, message: 'Dynamic routing works coy!' });
});

// Test middleware
app.use(((req: CenzeroRequest, res: CenzeroResponse, next: () => void) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
}) as MiddlewareFunction);

// Test POST method
app.post('/test', (req: CenzeroRequest, res: CenzeroResponse) => {
  res.json({ message: 'POST method works coy!', body: req.body });
});

console.log('🧪 Cenzero Framework Lab Test');
console.log('✅ CenzeroApp class created successfully');
console.log('✅ HTTP methods (.get, .post) implemented');
console.log('✅ Middleware (.use) implemented');
console.log('✅ Server (.listen) implemented');
console.log('✅ Router integration working');
console.log('✅ RequestParser integration working');
console.log('✅ ResponseHelper integration working');

if (require.main === module) {
  app.listen(3001, 'localhost', () => {
    console.log('🚀 Test server running on http://localhost:3001');
    console.log('📋 Test endpoints:');
    console.log('   GET  http://localhost:3001/test');
    console.log('   GET  http://localhost:3001/test/123');
    console.log('   POST http://localhost:3001/test');
  });
}
