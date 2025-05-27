# ✅ Middleware Chaining & Handler Format - WORKING

## 🔗 Middleware Chaining dengan `app.use(mw)`

Cenzero framework sudah mendukung middleware chaining lengkap dengan `app.use()`:

### Basic Middleware Pattern
```typescript
// Middleware chaining dengan app.use()
app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  // Pre-processing
  console.log(`→ ${ctx.method} ${ctx.url}`);
  ctx.state.startTime = Date.now();
  
  await next(); // Lanjut ke middleware/handler berikutnya
  
  // Post-processing  
  console.log(`← Response sent in ${Date.now() - ctx.state.startTime}ms`);
});
```

### Multiple Middleware Chain
```typescript
// Middleware 1: Authentication
app.use(async (ctx, next) => {
  ctx.state.user = await authenticate(ctx);
  await next();
});

// Middleware 2: Authorization  
app.use(async (ctx, next) => {
  if (ctx.url.startsWith('/admin') && !ctx.state.user.isAdmin) {
    ctx.status(403).json({ error: 'Forbidden' });
    return; // Stop chain
  }
  await next();
});

// Middleware 3: Logging
app.use(async (ctx, next) => {
  console.log(`User ${ctx.state.user.name} accessing ${ctx.url}`);
  await next();
});
```

## 📄 Handler Format: `async (ctx) => { ... }`

Setiap handler menerima Context object sebagai parameter tunggal:

### ✅ Format Handler yang Benar
```typescript
// Handler format: async (ctx) => { ... }
app.get('/hello/:name', async (ctx) => {
  ctx.json({ message: `Hello ${ctx.params.name}` });
});

app.post('/users', async (ctx) => {
  const userData = ctx.body;
  ctx.status(201).json({ user: userData });
});

app.put('/users/:id', async (ctx) => {
  const { id } = ctx.params;
  const updateData = ctx.body;
  ctx.json({ id, updateData });
});
```

## 🌊 Complete Flow Example

```typescript
import { CenzeroApp } from 'cenzero';
import { CenzeroContext } from 'cenzero/core/context';

const app = new CenzeroApp({ useContext: true });

// ========================================
// MIDDLEWARE CHAINING
// ========================================

// 1. Request Logger
app.use(async (ctx, next) => {
  console.log(`→ ${ctx.method} ${ctx.url}`);
  ctx.state.requestId = Math.random().toString(36).substr(2, 9);
  await next();
  console.log(`← ${ctx.method} ${ctx.url} - ${ctx.res.statusCode}`);
});

// 2. Authentication 
app.use(async (ctx, next) => {
  const token = ctx.get('authorization');
  if (ctx.url.startsWith('/protected') && !token) {
    ctx.status(401).json({ error: 'Unauthorized' });
    return; // Stop chain
  }
  if (token) {
    ctx.state.user = { id: 123, name: 'John' };
  }
  await next();
});

// 3. CORS Headers
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('X-Request-ID', ctx.state.requestId);
  await next();
});

// ========================================
// HANDLERS dengan Context Object
// ========================================

// ✅ Handler menerima ctx dan menggunakan semua properties
app.get('/hello/:name', async (ctx) => {
  // ctx berisi hasil dari semua middleware di atas
  ctx.json({ 
    message: `Hello ${ctx.params.name}!`,
    requestId: ctx.state.requestId,
    user: ctx.state.user || 'Guest'
  });
});

app.get('/users/:id', async (ctx) => {
  const { id } = ctx.params;           // Route parameters
  const { include } = ctx.query;       // Query parameters  
  const user = ctx.state.user;         // From middleware
  
  ctx.json({
    userId: id,
    include: include || 'basic',
    requestedBy: user?.name || 'Anonymous',
    requestId: ctx.state.requestId
  });
});

app.post('/users', async (ctx) => {
  const userData = ctx.body;           // Parsed body
  
  if (!userData.name) {
    ctx.status(400).json({ error: 'Name required' });
    return;
  }
  
  ctx.status(201).json({
    message: 'User created',
    user: userData,
    createdBy: ctx.state.user?.name || 'System'
  });
});

app.get('/protected/profile', async (ctx) => {
  // Middleware sudah handle auth, langsung pakai user data
  ctx.json({
    profile: ctx.state.user,
    accessTime: new Date().toISOString()
  });
});
```

## 🔍 Context Object Properties

Setiap handler menerima `ctx` yang berisi:

```typescript
// Dari HTTP request
ctx.req           // Node.js IncomingMessage
ctx.res           // Node.js ServerResponse  
ctx.method        // 'GET', 'POST', etc
ctx.url           // '/hello/world?foo=bar'
ctx.path          // '/hello/world'

// Parsed data
ctx.params        // { name: 'world' } dari /hello/:name
ctx.query         // { foo: 'bar' } dari ?foo=bar
ctx.body          // Parsed JSON/form body
ctx.headers       // Request headers

// From middleware chain
ctx.state         // Shared data antar middleware
ctx.session       // Session management
ctx.cookies       // Cookie management

// Response helpers
ctx.json()        // Send JSON response
ctx.send()        // Send raw response
ctx.status()      // Set status code
ctx.html()        // Send HTML
ctx.text()        // Send plain text
ctx.redirect()    // Redirect response
```

## 🎯 Key Benefits

### 1. **Middleware Chain**
- Setiap middleware dapat modify `ctx.state`
- Data dari middleware tersedia di handler
- Middleware dapat stop chain dengan tidak memanggil `next()`

### 2. **Context Object**  
- Single parameter `ctx` berisi semua yang dibutuhkan
- Consistent API across semua handlers
- Type-safe dengan TypeScript

### 3. **Clean Handler Format**
```typescript
// ✅ Simple dan clean
app.get('/hello/:name', async (ctx) => {
  ctx.json({ message: `Hello ${ctx.params.name}` });
});

// ❌ Tidak perlu multiple parameters
app.get('/hello/:name', async (req, res, next) => { ... });
```

## 🧪 Execution Flow

```
Request → Middleware 1 → Middleware 2 → Middleware 3 → Handler → Response
          (Logger)       (Auth)         (CORS)        (Logic)
          
          ctx.state.requestId ↓
                     ctx.state.user ↓  
                            ctx.headers ↓
                                   ctx.json() ↓
```

## ✅ Working Features Confirmed

1. **✅ Middleware chaining** dengan `app.use(mw)`
2. **✅ Context object** dikirim ke setiap handler  
3. **✅ Handler format** `app.get('/hello/:name', async (ctx) => { ... })`
4. **✅ State sharing** antar middleware via `ctx.state`
5. **✅ Route parameters** via `ctx.params`
6. **✅ Query parsing** via `ctx.query`  
7. **✅ Body parsing** via `ctx.body`
8. **✅ Response helpers** `ctx.json()`, `ctx.status()`, etc

**Semua fitur middleware chaining dan handler format sudah working di Cenzero! 🎉**
