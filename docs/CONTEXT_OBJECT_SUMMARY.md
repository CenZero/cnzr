# Context Object `ctx` - Implementasi Lengkap ✅

## Ringkasan
Context object `ctx` untuk Cenzero Framework sudah **sepenuhnya diimplementasikan** dan berfungsi dengan sempurna. Setiap request memiliki object context yang berisi semua fitur yang diminta.

## Fitur Context Object yang Sudah Tersedia

### ✅ 1. Core Request/Response
```typescript
interface CenzeroContext {
  req: CenzeroRequest;      // Original request object
  res: CenzeroResponse;     // Enhanced response object
}
```

### ✅ 2. Parsed Body
```typescript
ctx.body: any;  // Automatically parsed JSON/form data
```

### ✅ 3. Dynamic Route Parameters  
```typescript
ctx.params: Record<string, string>;  // Route params like /users/:id
```

### ✅ 4. URL Query Parameters
```typescript
ctx.query: Record<string, any>;  // URL query params like ?name=john&age=25
```

### ✅ 5. Response Methods
```typescript
ctx.status(code: number): CenzeroContext;
ctx.json(data: any): void;
ctx.send(data: any): void;
ctx.html(content: string): void;
ctx.text(content: string): void;
ctx.redirect(url: string, statusCode?: number): void;
```

### ✅ 6. Header Management
```typescript
ctx.set(field: string, value: string): void;
ctx.get(field: string): string | undefined;
ctx.headers: Record<string, string | string[]>;
```

### ✅ 7. Enhanced Properties
```typescript
ctx.method: string;         // HTTP method
ctx.path: string;          // Request path
ctx.url: string;           // Full URL
ctx.state: Record<string, any>;  // State untuk middleware
```

### ✅ 8. Error Handling
```typescript
ctx.throw(status: number, message?: string): never;
ctx.assert(condition: any, status: number, message?: string): void;
ctx.createError(status: number, message?: string): Error;
```

### ✅ 9. Session & Cookies
```typescript
ctx.session: Session;
ctx.cookies: Cookies;
```

## Implementasi di Middleware & Handler

### Context Mode (Default)
```typescript
const app = new CenzeroApp({ useContext: true });

// Middleware dengan context
app.use((ctx: CenzeroContext, next: () => Promise<void>) => {
  console.log(`${ctx.method} ${ctx.path}`);
  ctx.state.startTime = Date.now();
  return next();
});

// Handler dengan context
app.get('/users/:id', (ctx: CenzeroContext) => {
  const userId = ctx.params.id;
  const filter = ctx.query.filter;
  
  ctx.status(200).json({
    userId,
    filter,
    timestamp: Date.now() - ctx.state.startTime
  });
});
```

## Demo Lengkap Sudah Berjalan

Telah dibuat dan dijalankan demo lengkap di `/examples/complete-context-demo.ts` yang menunjukkan:

### ✅ Test Case 1: GET dengan Params & Query
```bash
curl "http://localhost:3005/users/123/posts/456?name=john&age=25&category=tech"

Response:
{
  "userId": "123",
  "postId": "456", 
  "query": {"name":"john","age":"25","category":"tech"},
  "timestamp": "2025-05-27T00:16:49.635Z",
  "processingTime": 2,
  "message": "Context object working perfectly!"
}
```

### ✅ Test Case 2: POST dengan Body Parsing
```bash
curl -X POST http://localhost:3005/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","age":30}'

Response:
{
  "message": "User created successfully",
  "user": {
    "id": "qgujh3yjplp",
    "name": "John Doe",
    "email": "john@example.com", 
    "createdAt": "2025-05-27T00:18:02.646Z"
  }
}
```

### ✅ Test Case 3: HTML Response
```bash
curl "http://localhost:3005/page/dashboard?theme=dark&lang=id"

Response: HTML page dengan dynamic content berdasarkan params & query
```

### ✅ Test Case 4: API dengan State Management
```bash
curl "http://localhost:3005/api/status?version=1.2&debug=true"

Response:
{
  "status": "OK",
  "context": {
    "method": "GET",
    "path": "/api/status",
    "params": {},
    "query": {"version":"1.2","debug":"true"},
    "state": {"startTime":1748305103181,"processed":true},
    "hasBody": false,
    "userAgent": "curl/8.7.1"
  }
}
```

### ✅ Test Case 5: Validation dengan Context Assertions
```bash
# Valid input
curl "http://localhost:3005/validate/hello"
→ {"message":"Validation passed!","value":"hello","length":5}

# Invalid input
curl "http://localhost:3005/validate/hello123" 
→ {"error":true,"message":"Value must contain only letters","statusCode":400}
```

## Server Logs Menunjukkan Context Bekerja

```
=== CONTEXT OBJECT DEMO ===
🔸 req: object
🔸 res: object
🔸 method: GET
🔸 path: /users/123/posts/456
🔸 url: /users/123/posts/456?name=john&age=25&category=tech
🔸 params: { userId: '123', postId: '456' }
🔸 query: { name: 'john', age: '25', category: 'tech' }
🔸 body: undefined
🔸 headers: { host: 'localhost:3005', 'user-agent': 'curl/8.7.1', accept: '*/*' }
🔸 state: { startTime: 1748305009634, processed: true }

=== POST WITH BODY DEMO ===
🔸 method: POST  
🔸 body (parsed): { name: 'John Doe', email: 'john@example.com', age: 30 }
🔸 content-type: application/json
```

## Kesimpulan

✅ **Context object `ctx` sudah sepenuhnya diimplementasikan**
✅ **Semua fitur yang diminta sudah tersedia**
✅ **Context dipass ke middleware & handler**
✅ **Body parsing otomatis**
✅ **Dynamic route params & query params** 
✅ **Response methods lengkap**
✅ **Error handling terintegrasi**
✅ **Demo berjalan sempurna**

**Framework Cenzero sudah memiliki context object yang powerful dan lengkap sesuai requirement!**
