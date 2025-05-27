# Response Time Middleware for Cenzero Framework

The Response Time middleware automatically adds an `X-Response-Time` header to all responses, showing how long the request took to process. This is essential for performance monitoring and debugging.

## Features

- ✅ **Zero Configuration**: Works out of the box with `app.use(responseTimeMiddleware)`
- ✅ **High Precision**: Uses `process.hrtime()` for accurate microsecond timing
- ✅ **Custom Headers**: Configure custom header names
- ✅ **Flexible Formatting**: Custom time format functions
- ✅ **Console Logging**: Optional response time logging
- ✅ **Error Handling**: Timing continues even during errors
- ✅ **Pipeline Injection**: Must be placed early in middleware pipeline

## Quick Start

### Basic Usage

```typescript
import { CenzeroApp, responseTimeMiddleware } from 'cenzero-framework';

const app = new CenzeroApp();

// IMPORTANT: Must be first or early in middleware pipeline
app.use(responseTimeMiddleware);

app.get('/', (ctx) => {
  ctx.json({ message: 'Hello World!' });
});

app.listen(3000);
```

**Response Headers:**
```
X-Response-Time: 12ms
```

### Advanced Configuration

```typescript
import { CenzeroApp, createResponseTimeMiddleware } from 'cenzero-framework';

const app = new CenzeroApp();

app.use(createResponseTimeMiddleware({
  header: 'X-Response-Time',
  precision: 2,
  log: true,
  hrtime: true
}));

app.listen(3000);
```

## Configuration Options

### `ResponseTimeOptions`

```typescript
interface ResponseTimeOptions {
  header?: string;                      // Header name (default: 'X-Response-Time')
  formatter?: (time: number) => string; // Custom formatter
  log?: boolean;                        // Console logging (default: false)
  precision?: number;                   // Decimal places (default: 0)
  hrtime?: boolean;                     // Use high-res timing (default: true)
}
```

### Option Details

#### `header`
Sets the response header name.

```typescript
// Default
{ header: 'X-Response-Time' }

// Custom header
{ header: 'X-Processing-Time' }
{ header: 'Response-Duration' }
```

#### `formatter`
Custom function to format the time value.

```typescript
// Default format
{ formatter: (time) => `${time}ms` }

// Custom formats
{ formatter: (time) => `${time} milliseconds` }
{ formatter: (time) => `${time}ms (${(time/1000).toFixed(2)}s)` }
{ formatter: (time) => time < 1000 ? `${time}ms` : `${(time/1000).toFixed(1)}s` }
```

#### `precision`
Number of decimal places for timing.

```typescript
{ precision: 0 }  // 12ms
{ precision: 1 }  // 12.3ms  
{ precision: 2 }  // 12.34ms
{ precision: 3 }  // 12.345ms
```

#### `log`
Enable console logging of response times.

```typescript
{ log: true }
// Console output: GET / - Response time: 12ms
```

#### `hrtime`
Use high-resolution timing vs Date.now().

```typescript
{ hrtime: true }   // More accurate (microsecond precision)
{ hrtime: false }  // Less accurate (millisecond precision)
```

## Helper Functions

### Precise Response Time

```typescript
import { preciseResponseTime } from 'cenzero-framework';

app.use(preciseResponseTime); // 2 decimal precision + hrtime
```

### Response Time with Logging

```typescript
import { responseTimeWithLogging } from 'cenzero-framework';

app.use(responseTimeWithLogging); // Logs to console + 1 decimal precision
```

### Custom Header Name

```typescript
import { createCustomResponseTime } from 'cenzero-framework';

app.use(createCustomResponseTime('X-Processing-Time'));
```

### Custom Formatter

```typescript
import { createFormattedResponseTime } from 'cenzero-framework';

app.use(createFormattedResponseTime((time) => {
  if (time < 10) return `${time.toFixed(2)}ms (fast)`;
  if (time < 100) return `${time.toFixed(1)}ms (normal)`;
  return `${Math.round(time)}ms (slow)`;
}));
```

## Usage Examples

### Basic Setup

```typescript
import { CenzeroApp, responseTimeMiddleware, loggerMiddleware } from 'cenzero-framework';

const app = new CenzeroApp();

// CRITICAL: Response time must be FIRST
app.use(responseTimeMiddleware);
app.use(loggerMiddleware);

app.get('/', (ctx) => {
  ctx.json({ message: 'Timed response' });
});

app.listen(3000);
```

### Production Configuration

```typescript
const app = new CenzeroApp();

app.use(createResponseTimeMiddleware({
  header: 'X-Response-Time',
  precision: 1,
  log: process.env.NODE_ENV === 'development',
  hrtime: true
}));

// Other middleware...
app.use(corsMiddleware);
app.use(loggerMiddleware);
```

### Performance Monitoring

```typescript
const app = new CenzeroApp();

app.use(createResponseTimeMiddleware({
  precision: 2,
  log: true,
  formatter: (time) => {
    const formatted = `${time}ms`;
    
    // Log slow requests
    if (time > 1000) {
      console.warn(`SLOW REQUEST: ${formatted}`);
    }
    
    return formatted;
  }
}));
```

### Multiple Response Time Headers

```typescript
const app = new CenzeroApp();

// Total response time (must be first)
app.use(createCustomResponseTime('X-Total-Time'));

// Add processing time after auth
app.use(authMiddleware);
app.use(createCustomResponseTime('X-Processing-Time'));
```

### Development vs Production

```typescript
const app = new CenzeroApp();

if (process.env.NODE_ENV === 'development') {
  app.use(createResponseTimeMiddleware({
    precision: 3,
    log: true,
    formatter: (time) => `${time}ms (dev mode)`
  }));
} else {
  app.use(createResponseTimeMiddleware({
    precision: 0,
    log: false
  }));
}
```

## Middleware Order (CRITICAL)

The response time middleware **MUST** be placed first or very early in the middleware pipeline to get accurate timing:

```typescript
const app = new CenzeroApp();

// ✅ CORRECT ORDER
app.use(responseTimeMiddleware);  // FIRST - starts timing
app.use(corsMiddleware);
app.use(loggerMiddleware);
app.use(authMiddleware);
// ... other middleware

// ❌ WRONG ORDER
app.use(corsMiddleware);
app.use(loggerMiddleware);
app.use(responseTimeMiddleware);  // TOO LATE - timing is inaccurate
```

## Performance Impact

- **Minimal overhead**: ~0.01ms per request
- **High precision**: Microsecond accuracy with `hrtime`
- **Memory efficient**: No memory leaks or accumulation
- **Error safe**: Continues timing even during errors

## Integration Examples

### With CORS and Logger

```typescript
import { 
  CenzeroApp, 
  responseTimeMiddleware, 
  corsMiddleware, 
  loggerMiddleware 
} from 'cenzero-framework';

const app = new CenzeroApp();

// Correct order for accurate timing
app.use(responseTimeMiddleware);  // 1. Start timing
app.use(corsMiddleware);          // 2. Handle CORS
app.use(loggerMiddleware);        // 3. Log requests (includes timing)

app.get('/', (ctx) => {
  ctx.json({ message: 'Fully monitored endpoint' });
});

app.listen(3000);
```

### API Performance Monitoring

```typescript
const app = new CenzeroApp();

app.use(createResponseTimeMiddleware({
  precision: 2,
  log: true,
  formatter: (time) => {
    // Color-coded performance logging
    let color = '';
    if (time < 50) color = '\x1b[32m';      // Green (fast)
    else if (time < 200) color = '\x1b[33m'; // Yellow (normal)
    else color = '\x1b[31m';                 // Red (slow)
    
    console.log(`${color}Response time: ${time}ms\x1b[0m`);
    return `${time}ms`;
  }
}));

app.get('/api/fast', (ctx) => {
  ctx.json({ data: 'instant' });
});

app.get('/api/slow', async (ctx) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  ctx.json({ data: 'delayed' });
});
```

## Testing

Test the response time header:

```bash
# Basic test
curl -i http://localhost:3000/

# Expected headers:
# X-Response-Time: 12ms

# Performance test
curl -w "Total time: %{time_total}s\n" -s http://localhost:3000/ > /dev/null

# Load test
for i in {1..10}; do curl -s -w "%{time_total}\n" http://localhost:3000/ > /dev/null; done
```

## Error Handling

The middleware continues to time and set headers even when errors occur:

```typescript
app.use(responseTimeMiddleware);

app.get('/error', (ctx) => {
  throw new Error('Something went wrong');
});

// Response will still include:
// X-Response-Time: 5ms
// Status: 500
```

## Browser Dev Tools

You can see the response time in browser dev tools:

1. Open Dev Tools → Network tab
2. Make a request to your server
3. Check response headers for `X-Response-Time`

## Best Practices

1. **Always place first**: Response time middleware should be the first middleware
2. **Use hrtime in production**: More accurate than Date.now()
3. **Monitor slow requests**: Log or alert on requests > threshold
4. **Consider precision**: Higher precision adds minimal overhead
5. **Use in development**: Essential for performance optimization

## Common Patterns

```typescript
// Pattern 1: Basic monitoring
app.use(responseTimeMiddleware);

// Pattern 2: Development monitoring
app.use(responseTimeWithLogging);

// Pattern 3: Production monitoring
app.use(createResponseTimeMiddleware({
  precision: 1,
  log: process.env.LOG_TIMING === 'true'
}));

// Pattern 4: Performance alerting
app.use(createResponseTimeMiddleware({
  formatter: (time) => {
    if (time > 1000) {
      console.error(`ALERT: Slow response ${time}ms`);
    }
    return `${time}ms`;
  }
}));
```
