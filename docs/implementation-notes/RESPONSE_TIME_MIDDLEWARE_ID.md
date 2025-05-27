# Middleware Response Time - Cenzero Framework

Middleware ini menambahkan header `X-Response-Time` ke setiap response HTTP untuk mengukur waktu pemrosesan request.

## Format Header
```
X-Response-Time: 12ms
```

## Penggunaan Dasar

### 1. Import Middleware
```typescript
import { responseTimeMiddleware } from 'cenzero/middleware/response-time';
```

### 2. Inject di Awal Pipeline
```typescript
import { CenzeroApp } from 'cenzero';
import { responseTimeMiddleware } from 'cenzero/middleware/response-time';

const app = new CenzeroApp();

// PENTING: Harus di awal pipeline untuk timing yang akurat
app.use(responseTimeMiddleware);

// Middleware lain...
app.use(otherMiddleware);

app.listen(3000);
```

## Penggunaan Advanced

### Custom Header dan Precision
```typescript
import { createResponseTimeMiddleware } from 'cenzero/middleware/response-time';

app.use(createResponseTimeMiddleware({
  header: 'X-Processing-Time',    // Custom header name
  precision: 2,                   // 2 decimal places
  log: true,                      // Console logging
  formatter: (time) => `${time}ms (custom)`
}));
```

### Helper Functions
```typescript
import { 
  preciseResponseTime,      // High precision timing
  responseTimeWithLogging,  // With console logging
  createCustomResponseTime  // Custom configuration
} from 'cenzero/middleware/response-time';

// Precision tinggi (2 decimal places)
app.use(preciseResponseTime);

// Dengan logging
app.use(responseTimeWithLogging);

// Custom
app.use(createCustomResponseTime('X-API-Time', true));
```

## Fitur

✅ **High-resolution timing** - Menggunakan `process.hrtime()` untuk akurasi microsecond  
✅ **Error-safe** - Tetap menambahkan header meski ada error  
✅ **Customizable** - Header name, precision, format bisa disesuaikan  
✅ **Logging support** - Optional console logging  
✅ **Zero dependencies** - Tidak memerlukan library eksternal  

## Contoh Response
```http
HTTP/1.1 200 OK
X-Response-Time: 12ms
Content-Type: application/json
...
```

## ⚠️ Penting
Middleware ini **HARUS** ditempatkan di awal middleware pipeline untuk mendapatkan timing yang akurat dari seluruh proses request handling.

## Test
Jalankan `npm run dev demo-simple.ts` dan test dengan:
```bash
curl -i http://localhost:3000/
curl -i http://localhost:3000/test
```
