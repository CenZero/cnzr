# CORS Middleware for Cenzero Framework

The CORS (Cross-Origin Resource Sharing) middleware allows you to enable CORS with various configuration options for your Cenzero application.

## Features

- ✅ **Simple Usage**: Basic CORS middleware with default settings
- ✅ **Custom Configuration**: Full control over CORS headers and behavior
- ✅ **Origin Control**: Support for string, array, function, and boolean origins
- ✅ **Method Configuration**: Specify allowed HTTP methods
- ✅ **Header Management**: Control allowed and exposed headers
- ✅ **Credentials Support**: Enable/disable credentials
- ✅ **Preflight Handling**: Automatic OPTIONS request handling
- ✅ **Helper Functions**: Convenient shortcuts for common configurations

## Basic Usage

### Simple CORS (Allow All Origins)

```typescript
import { CenzeroApp, corsMiddleware } from 'cenzero-framework';

const app = new CenzeroApp();

// Apply CORS middleware globally
app.use(corsMiddleware);

app.get('/', (ctx) => {
  ctx.json({ message: 'Hello with CORS!' });
});

app.listen(3000);
```

### Custom CORS Configuration

```typescript
import { CenzeroApp, createCorsMiddleware } from 'cenzero-framework';

const app = new CenzeroApp();

app.use(createCorsMiddleware({
  origin: ['http://localhost:3000', 'https://example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

app.listen(3000);
```

## Configuration Options

### `origin`

Configures the `Access-Control-Allow-Origin` header.

```typescript
// Allow all origins
{ origin: '*' }
{ origin: true }

// Allow specific origin
{ origin: 'https://example.com' }

// Allow multiple origins
{ origin: ['https://example.com', 'http://localhost:3000'] }

// Dynamic origin based on request
{ origin: (ctx) => {
  if (ctx.get('origin')?.includes('trusted-domain.com')) {
    return ctx.get('origin');
  }
  return false;
}}

// Disable CORS
{ origin: false }
```

### `methods`

Configures the `Access-Control-Allow-Methods` header.

```typescript
// String format
{ methods: 'GET,POST,PUT,DELETE' }

// Array format (recommended)
{ methods: ['GET', 'POST', 'PUT', 'DELETE'] }
```

### `allowedHeaders`

Configures the `Access-Control-Allow-Headers` header.

```typescript
// String format
{ allowedHeaders: 'Content-Type, Authorization, X-API-Key' }

// Array format (recommended)
{ allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'] }

// Auto-reflect request headers (default if not specified)
// Will use the value from Access-Control-Request-Headers
```

### `credentials`

Configures the `Access-Control-Allow-Credentials` header.

```typescript
{ credentials: true }  // Enable credentials
{ credentials: false } // Disable credentials (default)
```

### `exposedHeaders`

Configures the `Access-Control-Expose-Headers` header.

```typescript
// String format
{ exposedHeaders: 'X-Total-Count, X-Page-Count' }

// Array format
{ exposedHeaders: ['X-Total-Count', 'X-Page-Count'] }
```

### `maxAge`

Configures the `Access-Control-Max-Age` header for preflight cache.

```typescript
{ maxAge: 86400 } // Cache preflight for 24 hours
```

### Advanced Options

```typescript
{
  preflightContinue: false,    // Pass preflight to next handler
  optionsSuccessStatus: 204    // Status for successful OPTIONS requests
}
```

## Helper Functions

### Origin Whitelist

```typescript
import { corsWithOrigins } from 'cenzero-framework';

app.use(corsWithOrigins([
  'http://localhost:3000',
  'https://myapp.com',
  'https://admin.myapp.com'
]));
```

### Enable Credentials

```typescript
import { corsWithCredentials } from 'cenzero-framework';

app.use(corsWithCredentials);
```

## Common Configurations

### Development Setup

```typescript
// Allow localhost and common dev ports
app.use(createCorsMiddleware({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'http://127.0.0.1:3000'
  ],
  credentials: true
}));
```

### Production Setup

```typescript
// Strict origin control for production
app.use(createCorsMiddleware({
  origin: [
    'https://myapp.com',
    'https://www.myapp.com',
    'https://admin.myapp.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight for better performance
}));
```

### API with Authentication

```typescript
app.use(createCorsMiddleware({
  origin: true, // Allow any origin in development
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Requested-With'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Rate-Limit'
  ]
}));
```

### Conditional CORS

```typescript
app.use(createCorsMiddleware({
  origin: (ctx) => {
    const origin = ctx.get('origin');
    
    // Allow specific domains
    if (origin?.endsWith('.myapp.com')) {
      return origin;
    }
    
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development' && 
        origin?.includes('localhost')) {
      return origin;
    }
    
    return false;
  },
  credentials: true
}));
```

## Route-Specific CORS

You can also apply CORS to specific routes:

```typescript
import { createCorsMiddleware } from 'cenzero-framework';

const apiCors = createCorsMiddleware({
  origin: ['https://api.example.com'],
  methods: ['GET', 'POST']
});

// Apply CORS only to API routes
app.use('/api', apiCors);

app.get('/api/users', (ctx) => {
  ctx.json({ users: [] });
});

// Different CORS for admin routes
const adminCors = createCorsMiddleware({
  origin: 'https://admin.example.com',
  credentials: true
});

app.use('/admin', adminCors);
```

## Integration with Other Middleware

```typescript
import { 
  CenzeroApp, 
  corsMiddleware, 
  loggerMiddleware 
} from 'cenzero-framework';

const app = new CenzeroApp();

// Apply middlewares in order
app.use(loggerMiddleware);    // Log requests first
app.use(corsMiddleware);      // Then handle CORS
// app.use(authMiddleware);   // Then authentication
// app.use(rateLimitMiddleware); // Then rate limiting

app.get('/', (ctx) => {
  ctx.json({ message: 'Hello World!' });
});

app.listen(3000);
```

## Troubleshooting

### Common Issues

1. **CORS not working**: Make sure the middleware is applied before your routes
2. **Credentials not working**: Ensure both client and server have credentials enabled
3. **Origin blocked**: Check if your origin is properly configured in the whitelist
4. **Preflight failures**: Verify that allowed methods and headers are properly configured

### Debug CORS

```typescript
app.use(createCorsMiddleware({
  origin: (ctx) => {
    const origin = ctx.get('origin');
    console.log('CORS request from origin:', origin);
    return origin ? origin : false;
  }
}));
```

## Browser Testing

You can test CORS with simple JavaScript in browser console:

```javascript
// Test basic request
fetch('http://localhost:3000/api/users')
  .then(response => response.json())
  .then(data => console.log(data));

// Test with credentials
fetch('http://localhost:3000/api/protected', {
  credentials: 'include',
  headers: {
    'Authorization': 'Bearer token'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

## Performance Notes

- Use `maxAge` for better performance by caching preflight requests
- Be specific with allowed origins in production
- Consider using route-specific CORS instead of global CORS for complex applications
- The middleware automatically handles preflight OPTIONS requests
