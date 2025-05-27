# Cenzero Framework - Modern Middleware Engine

A powerful, Express.js-inspired middleware engine for the Cenzero Framework with full async/await support and TypeScript integration.

## 🚀 Quick Start

```typescript
import { CenzeroApp } from 'cenzero-framework';

const app = new CenzeroApp();

// Add middleware using familiar Express.js syntax
app.use(async (ctx, next) => {
  console.log(`${ctx.method} ${ctx.url}`);
  await next(); // Continue to next middleware
});

// Path-specific middleware
app.use('/api', async (ctx, next) => {
  ctx.set('X-API-Version', '1.0');
  await next();
});

// Error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.status(500).json({ error: 'Server error' });
  }
});
```

## ✨ Features

- **Express.js-like API** - Familiar `app.use()` syntax
- **Async/Await Support** - Native Promise-based middleware chain
- **TypeScript First** - Full type safety and IntelliSense
- **Path-specific Middleware** - Route-based middleware registration
- **Error Handling** - Proper error propagation through middleware chain
- **Backward Compatible** - Works alongside existing Cenzero middleware

## 📖 Documentation

### Basic Usage

```typescript
import { CenzeroApp } from 'cenzero-framework';
import type { NextFunction } from 'cenzero-framework';

const app = new CenzeroApp();

// Global middleware (runs for all requests)
app.use(async (ctx, next) => {
  // Your middleware logic here
  await next(); // Continue to next middleware
});

// Path-specific middleware
app.use('/api', async (ctx, next) => {
  // Only runs for routes starting with /api
  await next();
});
```

### Middleware Types

#### 1. Request Logging
```typescript
app.use(async (ctx, next) => {
  const start = Date.now();
  console.log(`→ ${ctx.method} ${ctx.url}`);
  await next();
  console.log(`← ${ctx.method} ${ctx.url} - ${Date.now() - start}ms`);
});
```

#### 2. Authentication
```typescript
app.use(async (ctx, next) => {
  const token = ctx.get('authorization');
  
  if (!token && ctx.url !== '/login') {
    ctx.status(401).json({ error: 'Authentication required' });
    return; // Stop the chain
  }
  
  ctx.state.user = await validateToken(token);
  await next();
});
```

#### 3. CORS Handling
```typescript
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  
  if (ctx.method === 'OPTIONS') {
    ctx.status(200);
    return; // Handle preflight
  }
  
  await next();
});
```

#### 4. Error Handling
```typescript
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    ctx.status(500).json({ error: 'Internal server error' });
  }
});
```

### Advanced Usage

#### Manual Middleware Execution
```typescript
const middlewareEngine = app.getMiddlewareEngine();

// Execute middleware chain with custom handler
await middlewareEngine.execute(ctx, async (ctx) => {
  ctx.json({ message: 'Hello World' });
});
```

#### Middleware Order
Middleware executes in registration order:
1. Global middleware (first registered)
2. Path-specific middleware (for matching paths)
3. Global middleware (later registered)
4. Route handler

```typescript
app.use(loggingMiddleware);     // Runs first
app.use(errorMiddleware);       // Runs second
app.use('/api', apiMiddleware); // Runs for /api/* routes only
app.use(corsMiddleware);        // Runs after path-specific middleware
```

## 🔧 API Reference

### `app.use(middleware)`
Register global middleware that runs for all requests.

**Parameters:**
- `middleware: (ctx: CenzeroContext, next: NextFunction) => Promise<void>`

### `app.use(path, middleware)`
Register path-specific middleware that runs only for matching routes.

**Parameters:**
- `path: string` - Path prefix to match
- `middleware: (ctx: CenzeroContext, next: NextFunction) => Promise<void>`

### `app.getMiddlewareEngine()`
Get the middleware engine instance for manual execution.

**Returns:** `MiddlewareEngine`

### `middlewareEngine.execute(ctx, handler)`
Execute the middleware chain with a final handler.

**Parameters:**
- `ctx: CenzeroContext` - Request context
- `handler: (ctx: CenzeroContext) => Promise<void>` - Final route handler

## 🧪 Examples

Check out the comprehensive examples in the `/examples` directory:

- **`middleware-demo.ts`** - Complete demo with 5 different middleware types
- **`quick-start.ts`** - Simple getting started example

Run examples:
```bash
npx tsx examples/middleware-demo.ts
npx tsx examples/quick-start.ts
```

## 🔄 Migration from Old Middleware

The new middleware engine works alongside the existing system. You can gradually migrate:

```typescript
// Old style (still works)
app.use((ctx) => {
  console.log('Old middleware');
});

// New style (recommended)
app.use(async (ctx, next) => {
  console.log('New middleware');
  await next();
});
```

## 🎯 TypeScript Support

Full TypeScript support with proper types:

```typescript
import type { 
  CenzeroContext, 
  NextFunction,
  ModernMiddlewareFunction 
} from 'cenzero-framework';

const middleware: ModernMiddlewareFunction = async (ctx, next) => {
  // Full type safety and IntelliSense
  ctx.status(200).json({ message: 'Hello' });
  await next();
};

app.use(middleware);
```

## 🚀 Performance

- **Minimal overhead** - Efficient middleware chain execution
- **Async optimized** - Native Promise-based execution
- **Memory efficient** - No unnecessary object creation
- **Fast path matching** - Optimized route filtering

## 🤝 Contributing

The middleware engine is part of the Cenzero Framework. Contributions are welcome!

## 📄 License

Same as Cenzero Framework license.

---

**Ready to build modern web applications with Express.js-like middleware? Get started with Cenzero Framework today!** 🚀
