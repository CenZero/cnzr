import { CenzeroApp } from './src/core/server';
import { responseTimeMiddleware } from './src/middleware/response-time';
import { CenzeroContext } from './src/core/context';

// Inisialisasi aplikasi Cenzero
const app = new CenzeroApp();

// PENTING: Response time middleware HARUS di-inject di awal pipeline
app.use(responseTimeMiddleware);

// Endpoint sederhana
app.get('/', (ctx: CenzeroContext) => {
  ctx.json({ 
    message: 'Halo dari Cenzero!',
    timestamp: new Date().toISOString()
  });
});

// Endpoint dengan delay untuk test timing
app.get('/test', async (ctx: CenzeroContext) => {
  // Simulasi proses yang membutuhkan waktu
  await new Promise(resolve => setTimeout(resolve, 50));
  ctx.json({ 
    message: 'Test endpoint dengan delay 50ms',
    processed: true
  });
});

// Jalankan server
const PORT = 3000;
app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Server Cenzero berjalan di http://localhost:${PORT}`);
  console.log(`📊 Header X-Response-Time akan otomatis ditambahkan ke setiap response`);
  console.log(`\n🧪 Test dengan curl:`);
  console.log(`   curl -i http://localhost:${PORT}/`);
  console.log(`   curl -i http://localhost:${PORT}/test`);
});
