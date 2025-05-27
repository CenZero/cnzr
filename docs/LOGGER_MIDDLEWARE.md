# Logger Middleware - Cenzero Framework

Simple logger middleware untuk Cenzero Framework yang mencetak log permintaan dalam format: `[METHOD] [URL] - [STATUS] in [ms]`

## 🚀 Quick Start

### Basic Usage

```typescript
import { CenzeroApp, loggerMiddleware } from 'cenzero';

const app = new CenzeroApp({ useContext: true });

// Tambahkan logger middleware
app.use(loggerMiddleware);

app.get('/', (ctx) => {
  ctx.json({ message: 'Hello World!' });
});

app.listen(3000, 'localhost', () => {
  console.log('Server running on http://localhost:3000');
});
```

**Output:**
```
[GET] / - 200 in 5ms
[POST] /users - 201 in 12ms
[GET] /users/123 - 200 in 3ms
```

## 📝 Features

✅ **Simple Format**: `[METHOD] [URL] - [STATUS] in [ms]`  
✅ **Context Support**: Works with Cenzero context middleware pattern  
✅ **Error Handling**: Logs errors and re-throws them  
✅ **Zero Configuration**: Works out of the box with `app.use(loggerMiddleware)`  
✅ **Customizable**: Advanced options with `createLoggerMiddleware()`  
✅ **Colored Output**: Optional colored terminal output  
✅ **Timestamps**: Optional ISO timestamp logging  

## 🎨 Advanced Usage

### Colored Logger

```typescript
import { CenzeroApp, createLoggerMiddleware } from 'cenzero';

const app = new CenzeroApp({ useContext: true });

const colorLogger = createLoggerMiddleware({
  colors: true
});

app.use(colorLogger);
```

**Output:**
```
[GET] / - 200 in 5ms    (green GET, green 200)
[POST] /users - 201 in 12ms    (blue POST, green 201)
[GET] /error - 500 in 8ms    (green GET, red 500)
```

### Logger with Timestamp

```typescript
const timestampLogger = createLoggerMiddleware({
  includeTimestamp: true,
  colors: true
});

app.use(timestampLogger);
```

**Output:**
```
2025-05-27T05:46:35.129Z [GET] / - 200 in 5ms
2025-05-27T05:46:40.234Z [POST] /users - 201 in 12ms
```

### Custom Format Logger

```typescript
const customLogger = createLoggerMiddleware({
  format: (method, url, status, duration) => {
    const emoji = status >= 200 && status < 300 ? '✅' : 
                  status >= 300 && status < 400 ? '🔄' :
                  status >= 400 && status < 500 ? '⚠️' : '❌';
    return `${emoji} ${method} ${url} → ${status} (${duration}ms)`;
  }
});

app.use(customLogger);
```

**Output:**
```
✅ GET / → 200 (5ms)
✅ POST /users → 201 (12ms)
⚠️ GET /notfound → 404 (3ms)
❌ GET /error → 500 (8ms)
```

### Silent Logger (for Testing)

```typescript
const silentLogger = createLoggerMiddleware({
  silent: true  // No output
});

app.use(silentLogger);
```

## 📚 API Reference

### `loggerMiddleware`

Simple logger middleware yang langsung bisa digunakan dengan `app.use()`.

**Type:** `ContextMiddlewareFunction`

### `createLoggerMiddleware(options)`

Factory function untuk membuat logger middleware dengan konfigurasi kustom.

**Parameters:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | `(method, url, status, duration) => string` | `undefined` | Custom format function |
| `includeTimestamp` | `boolean` | `false` | Include ISO timestamp |
| `colors` | `boolean` | `false` | Enable colored output |
| `silent` | `boolean` | `false` | Disable all output |

**Returns:** `ContextMiddlewareFunction`

## 🎯 Examples

### 1. Basic Web API

```typescript
import { CenzeroApp, loggerMiddleware } from 'cenzero';

const app = new CenzeroApp({ useContext: true });

app.use(loggerMiddleware);

app.get('/api/users', (ctx) => {
  ctx.json([
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ]);
});

app.post('/api/users', (ctx) => {
  const { name, email } = ctx.body;
  ctx.status(201).json({ 
    id: Date.now(), 
    name, 
    email 
  });
});

app.listen(3000, 'localhost');
```

**Console Output:**
```
[GET] /api/users - 200 in 2ms
[POST] /api/users - 201 in 8ms
```

### 2. Production Logger

```typescript
const prodLogger = createLoggerMiddleware({
  includeTimestamp: true,
  colors: process.env.NODE_ENV !== 'production',
  format: (method, url, status, duration) => {
    const timestamp = new Date().toISOString();
    return `${timestamp} ${method} ${url} ${status} ${duration}ms`;
  }
});

app.use(prodLogger);
```

### 3. Development Logger

```typescript
const devLogger = createLoggerMiddleware({
  colors: true,
  includeTimestamp: true
});

app.use(devLogger);
```

## 🔧 Integration

### With Error Handling

Logger middleware akan otomatis mencatat request yang menghasilkan error:

```typescript
app.use(loggerMiddleware);

app.get('/error', (ctx) => {
  throw new Error('Something went wrong!');
});

// Console output:
// [GET] /error - 500 in 5ms
```

### With Other Middleware

Logger middleware sebaiknya diletakkan di awal agar mencatat semua request:

```typescript
app.use(loggerMiddleware);          // ✅ First
app.use(someAuthMiddleware);        // After logger
app.use(someValidationMiddleware);  // After logger

app.get('/', handler);
```

## 🎨 Color Codes

Ketika `colors: true` diaktifkan:

| Element | Color |
|---------|-------|
| GET | Green |
| POST | Blue |  
| PUT | Yellow |
| DELETE | Red |
| PATCH | Magenta |
| 2xx Status | Green |
| 3xx Status | Cyan |
| 4xx Status | Yellow |
| 5xx Status | Red |
| Duration | Gray |

## 📦 Import Options

```typescript
// Named imports
import { loggerMiddleware, createLoggerMiddleware } from 'cenzero';

// Direct import
import { loggerMiddleware } from 'cenzero/middleware/logger';
```

## 🚀 Tips

1. **Position matters**: Letakkan logger middleware di awal untuk mencatat semua request
2. **Production ready**: Gunakan `includeTimestamp: true` untuk production
3. **Development friendly**: Gunakan `colors: true` untuk development
4. **Custom formats**: Gunakan `format` function untuk kebutuhan khusus
5. **Testing**: Gunakan `silent: true` untuk testing

Logger middleware ini fully compatible dengan sistem context dan middleware pattern Cenzero Framework!
