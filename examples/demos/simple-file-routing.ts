import { CenzeroApp } from './src/core/server';

console.log('🗂️  Testing File-based Routing...\n');

// Simple app with file-based routing
const app = new CenzeroApp({
  useContext: true,
  useFileRouting: true,
  routesDir: './routes'
});

// Manual route for comparison
app.get('/status', (ctx) => {
  ctx.json({
    status: 'OK',
    type: 'manual-route',
    timestamp: new Date().toISOString()
  });
});

const PORT = 3000;

try {
  app.listen(PORT, 'localhost', () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📁 File-based routing enabled from ./routes\n`);
    
    console.log('📋 Available routes:');
    console.log('   GET  /               → routes/index.ts');
    console.log('   GET  /about          → routes/about.ts');
    console.log('   GET  /api/hello      → routes/api/hello.ts');
    console.log('   POST /api/hello      → routes/api/hello.ts');
    console.log('   GET  /api/users      → routes/api/users/index.ts');
    console.log('   POST /api/users      → routes/api/users/index.ts');
    console.log('   GET  /api/users/:id  → routes/api/users/[id].ts');
    console.log('   PUT  /api/users/:id  → routes/api/users/[id].ts');
    console.log('   DEL  /api/users/:id  → routes/api/users/[id].ts');
    console.log('   GET  /status         → manual route\n');
    
    console.log('🧪 Test commands:');
    console.log(`   curl http://localhost:${PORT}/`);
    console.log(`   curl http://localhost:${PORT}/about`);
    console.log(`   curl http://localhost:${PORT}/api/hello`);
    console.log(`   curl http://localhost:${PORT}/api/users/123`);
    console.log(`   curl http://localhost:${PORT}/status`);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
}
