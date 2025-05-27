import { CenzeroApp } from './src/core/server';
import { responseTimeMiddleware } from './src/middleware/response-time';
import { CenzeroContext } from './src/core/context';

console.log('🚀 Memulai Cenzero Framework dengan Response Time Middleware');

const app = new CenzeroApp();

// PENTING: Response time middleware HARUS di awal pipeline
app.use(responseTimeMiddleware);

// Endpoint untuk test
app.get('/', (ctx: CenzeroContext) => {
  ctx.json({ 
    message: 'Response Time Middleware berhasil!',
    framework: 'Cenzero',
    timestamp: new Date().toISOString()
  });
});

app.get('/test', async (ctx: CenzeroContext) => {
  // Simulasi proses yang membutuhkan waktu
  await new Promise(resolve => setTimeout(resolve, 25));
  ctx.json({ 
    message: 'Test endpoint dengan delay 25ms',
    processed: true
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, 'localhost', () => {
  console.log(`✅ Server berhasil berjalan di http://localhost:${PORT}`);
  console.log(`📊 Response Time Middleware telah diinjeksi di awal pipeline`);
  console.log(`⏱️  Header X-Response-Time akan ditambahkan ke setiap response\n`);
  
  console.log('🧪 Cara test:');
  console.log(`   curl -i http://localhost:${PORT}/`);
  console.log(`   curl -i http://localhost:${PORT}/test`);
  console.log('');
  console.log('📋 Format header: X-Response-Time: 12ms');
});
