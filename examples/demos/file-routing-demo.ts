import { CenzeroApp } from './src/core/server';
import { responseTimeMiddleware } from './src/middleware/response-time';
import { loggerMiddleware } from './src/middleware/logger';

console.log('🗂️  File-based Routing Demo - Cenzero Framework\n');

// Inisialisasi aplikasi dengan file-based routing
const app = new CenzeroApp({
  useContext: true,
  useFileRouting: true,  // Enable file-based routing
  routesDir: './routes'  // Direktori routes
});

// Middleware global
app.use(responseTimeMiddleware);  // Response time tracking
app.use(loggerMiddleware);        // Request logging

// Manual route (akan coexist dengan file-based routes)
app.get('/manual', (ctx) => {
  ctx.json({
    message: 'This is a manually defined route',
    type: 'manual',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📁 File-based routing aktif dari folder: ./routes`);
  console.log('');
  
  // Tampilkan routes yang terdaftar
  const fileRoutes = app.getFileRoutes();
  if (fileRoutes.length > 0) {
    console.log('📋 Routes dari file:');
    fileRoutes.forEach(route => {
      console.log(`   ${route.method.padEnd(6)} ${route.pattern}`);
    });
  }
  
  console.log('\n🧪 Test URL:');
  console.log(`   curl http://localhost:${PORT}/`);
  console.log(`   curl http://localhost:${PORT}/about`);
  console.log(`   curl http://localhost:${PORT}/api/hello`);
  console.log(`   curl http://localhost:${PORT}/api/users`);
  console.log(`   curl http://localhost:${PORT}/api/users/123`);
  console.log(`   curl -X POST -H "Content-Type: application/json" -d '{"name":"John","email":"john@test.com"}' http://localhost:${PORT}/api/users`);
  console.log(`   curl http://localhost:${PORT}/manual`);
});
