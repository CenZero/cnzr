# Cenzero Framework - Context Class

Context class adalah inti dari Cenzero framework yang menyediakan akses terpusat ke request dan response data untuk setiap HTTP request.

## 📋 Fitur Utama

Setiap request akan dibuatkan instance Context (`ctx`) yang berisi:

### Core Properties
- **`ctx.req`** - CenzeroRequest (extends Node.js IncomingMessage)
- **`ctx.res`** - CenzeroResponse (extends Node.js ServerResponse)
- **`ctx.query`** - Parsed URLSearchParams dari query string
- **`ctx.params`** - Route parameters yang dynamic (dari :id, :name, dll)
- **`ctx.body`** - Parsed request body (JSON/URL-encoded)

### Request Information
- **`ctx.method`** - HTTP method (GET, POST, PUT, DELETE, dll)
- **`ctx.url`** - Full URL request
- **`ctx.path`** - Path tanpa query string
- **`ctx.headers`** - Request headers

### Helper Methods
- **`ctx.send(body: string | Buffer)`** - Kirim response body
- **`ctx.json(obj: any)`** - Kirim JSON response
- **`ctx.status(code: number)`** - Set status code HTTP
- **`ctx.html(content: string)`** - Kirim HTML response
- **`ctx.text(content: string)`** - Kirim plain text response
- **`ctx.redirect(url: string, statusCode?: number)`** - Redirect request

### Header Management
- **`ctx.set(field: string, value: string)`** - Set response header
- **`ctx.get(field: string)`** - Get request header

### State Management
- **`ctx.state`** - Object untuk share data antar middleware
- **`ctx.session`** - Session management
- **`ctx.cookies`** - Cookie management

### Error Handling
- **`ctx.throw(status: number, message?: string)`** - Throw HTTP error
- **`ctx.assert(condition: any, status: number, message?: string)`** - Assert dengan HTTP error
- **`ctx.createError(status: number, message?: string)`** - Create HTTP error object

## 🚀 Penggunaan Dasar

### 1. Setup Server dengan Context

```typescript
import { CenzeroApp } from 'cenzero';
import { CenzeroContext } from 'cenzero/core/context';

const app = new CenzeroApp({
  useContext: true // Aktifkan mode Context
});
```

### 2. Middleware dengan Context

```typescript
// Middleware menerima (ctx, next)
app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  console.log(`${ctx.method} ${ctx.url}`);
  
  // Akses request data
  console.log('Query:', ctx.query);
  console.log('Headers:', ctx.headers);
  
  // Set response header
  ctx.set('X-Request-ID', Date.now().toString());
  
  await next(); // Lanjut ke middleware/handler berikutnya
});
```

### 3. Route Handler dengan Context

```typescript
// Handler menerima hanya (ctx)
app.get('/users/:id', async (ctx: CenzeroContext) => {
  const userId = ctx.params.id; // Dynamic route parameter
  const { includeProfile } = ctx.query; // Query parameter
  
  ctx.json({
    userId,
    includeProfile: includeProfile === 'true'
  });
});
```

## 📚 Contoh Lengkap

### Query Parameters
```typescript
// GET /search?q=javascript&limit=10&page=2
app.get('/search', async (ctx: CenzeroContext) => {
  const { q, limit = '20', page = '1' } = ctx.query;
  
  ctx.json({
    query: q,
    limit: parseInt(limit),
    page: parseInt(page)
  });
});
```

### Dynamic Route Parameters
```typescript
// GET /users/123/posts/456
app.get('/users/:userId/posts/:postId', async (ctx: CenzeroContext) => {
  const { userId, postId } = ctx.params;
  
  ctx.json({
    user: userId,
    post: postId
  });
});
```

### Request Body Parsing
```typescript
// POST /users dengan JSON body
app.post('/users', async (ctx: CenzeroContext) => {
  const userData = ctx.body; // Sudah di-parse otomatis
  
  if (!userData.name) {
    ctx.status(400).json({ error: 'Name required' });
    return;
  }
  
  ctx.status(201).json({
    message: 'User created',
    user: userData
  });
});
```

### Response Methods
```typescript
app.get('/demo', async (ctx: CenzeroContext) => {
  // JSON response
  ctx.json({ message: 'Hello JSON' });
  
  // HTML response  
  ctx.html('<h1>Hello HTML</h1>');
  
  // Plain text
  ctx.text('Hello Text');
  
  // Custom response dengan Buffer
  ctx.send(Buffer.from('Hello Buffer'));
  
  // Redirect
  ctx.redirect('/other-page', 302);
  
  // Status code
  ctx.status(404).json({ error: 'Not Found' });
});
```

### State Management
```typescript
// Middleware pertama
app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  ctx.state.startTime = Date.now();
  ctx.state.user = await authenticateUser(ctx);
  await next();
});

// Middleware kedua atau handler
app.get('/profile', async (ctx: CenzeroContext) => {
  const { user, startTime } = ctx.state;
  
  ctx.json({
    user,
    responseTime: Date.now() - startTime
  });
});
```

### Session dan Cookies
```typescript
app.get('/login', async (ctx: CenzeroContext) => {
  // Set session
  ctx.session.set('userId', '123');
  
  // Set cookie
  ctx.cookies.set('token', 'abc123', {
    httpOnly: true,
    maxAge: 3600000 // 1 hour
  });
  
  ctx.json({ message: 'Logged in' });
});
```

### Error Handling
```typescript
app.get('/protected', async (ctx: CenzeroContext) => {
  const token = ctx.get('authorization');
  
  // Assert dengan automatic error throw
  ctx.assert(token, 401, 'Token required');
  
  // Manual error throw
  if (!isValidToken(token)) {
    ctx.throw(403, 'Invalid token');
  }
  
  ctx.json({ message: 'Access granted' });
});
```

## 🔄 Context vs Legacy Mode

Cenzero mendukung dua mode:

### Context Mode (Recommended)
```typescript
const app = new CenzeroApp({ useContext: true });

app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  // Middleware dengan Context
});

app.get('/path', async (ctx: CenzeroContext) => {
  // Handler dengan Context
});
```

### Legacy Mode
```typescript
const app = new CenzeroApp({ useContext: false });

app.use((req, res, next) => {
  // Middleware Express-style
});

app.get('/path', (req, res) => {
  // Handler Express-style
});
```

## 🎯 Best Practices

1. **Gunakan Context Mode** untuk aplikasi baru
2. **Gunakan ctx.state** untuk share data antar middleware
3. **Gunakan ctx.assert()** untuk validasi dengan error handling otomatis
4. **Set status code** sebelum mengirim response
5. **Gunakan async/await** untuk semua middleware dan handler

## 🔧 Advanced Features

### Custom Middleware
```typescript
function createTimingMiddleware() {
  return async (ctx: CenzeroContext, next: () => Promise<void>) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    ctx.set('X-Response-Time', `${duration}ms`);
  };
}

app.use(createTimingMiddleware());
```

### Error Middleware
```typescript
app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  try {
    await next();
  } catch (error) {
    ctx.status(error.status || 500).json({
      error: error.message
    });
  }
});
```

## 📖 Type Definitions

```typescript
interface CenzeroContext {
  // Core
  req: CenzeroRequest;
  res: CenzeroResponse;
  
  // Request data
  method: string;
  url: string;
  path: string;
  query: Record<string, any>;
  params: Record<string, string>;
  body: any;
  headers: Record<string, string | string[]>;
  
  // State & Utils
  state: Record<string, any>;
  session: Session;
  cookies: Cookies;
  
  // Response methods
  json(data: any): void;
  html(content: string): void;
  text(content: string): void;
  send(data: any): void;
  redirect(url: string, statusCode?: number): void;
  status(code: number): CenzeroContext;
  
  // Headers
  set(field: string, value: string): void;
  get(field: string): string | undefined;
  
  // Error handling
  throw(status: number, message?: string): never;
  assert(condition: any, status: number, message?: string): void;
  createError(status: number, message?: string): Error;
}
```

Context akan dikirim ke semua middleware dan handler dalam chain, memungkinkan akses terpusat ke semua request/response data dan utilitas.
