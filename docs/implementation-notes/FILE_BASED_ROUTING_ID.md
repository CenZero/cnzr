# File-based Routing - Cenzero Framework

File-based routing seperti Next.js untuk Cenzero Framework. Sistem routing otomatis yang membaca folder `routes/` dan auto-import setiap file `.ts` untuk membuat routes berdasarkan struktur folder.

## 🗂️ Struktur Folder

```
routes/
├── index.ts          // GET /
├── about.ts          // GET /about
├── api/
│   ├── hello.ts      // GET /api/hello, POST /api/hello
│   └── users/
│       ├── index.ts  // GET /api/users, POST /api/users
│       └── [id].ts   // GET /api/users/:id, PUT /api/users/:id, DELETE /api/users/:id
└── blog/
    ├── index.ts      // GET /blog
    ├── [slug].ts     // GET /blog/:slug
    └── [...path].ts  // GET /blog/* (catch-all)
```

## 🚀 Penggunaan

### 1. Enable File-based Routing

```typescript
import { CenzeroApp } from 'cenzero';

const app = new CenzeroApp({
  useContext: true,
  useFileRouting: true,  // Enable file-based routing
  routesDir: './routes'  // Direktori routes (default: 'routes')
});

app.listen(3000);
```

### 2. Format File Route

#### Default Export (GET)

```typescript
// routes/index.ts → GET /
export default function handler(ctx) {
  ctx.json({ message: 'Home page' });
}
```

#### Named HTTP Methods

```typescript
// routes/api/users.ts
export function GET(ctx) {
  ctx.json({ users: [] });
}

export function POST(ctx) {
  const { name, email } = ctx.body;
  ctx.json({ message: 'User created', user: { name, email } });
}

export function PUT(ctx) {
  ctx.json({ message: 'User updated' });
}

export function DELETE(ctx) {
  ctx.json({ message: 'User deleted' });
}
```

## 📍 Dynamic Routes

### Parameter Routes

```typescript
// routes/users/[id].ts → /users/:id
export default function handler(ctx) {
  const userId = ctx.params.id;
  ctx.json({ userId, user: { id: userId } });
}
```

### Catch-all Routes

```typescript
// routes/blog/[...slug].ts → /blog/*slug
export default function handler(ctx) {
  const slugPath = ctx.params.slug;
  ctx.json({ path: slugPath });
}
```

## 🔧 Fitur

### ✅ Auto-import Files
- Scan folder `routes/` secara rekursif
- Auto-import semua file `.ts` dan `.js`
- Skip file yang dimulai dengan `_` (private files)

### ✅ URL Generation  
- URL ditentukan dari struktur folder dan nama file
- `routes/api/hello.ts` → `/api/hello`
- `routes/users/[id].ts` → `/users/:id`
- `routes/index.ts` → `/`

### ✅ HTTP Methods
- Support semua HTTP methods: GET, POST, PUT, DELETE, PATCH
- Default export = GET method
- Named exports = specific methods

### ✅ Priority Routing
- Static routes prioritas tertinggi
- Dynamic routes prioritas menengah  
- Catch-all routes prioritas terendah

### ✅ Coexist dengan Manual Routes
- File-based routes dapat coexist dengan manual routes
- Manual routes didefinisikan dengan `app.get()`, `app.post()`, dll

## 📋 Contoh Lengkap

### routes/index.ts
```typescript
export default function handler(ctx) {
  ctx.json({
    message: 'Welcome to Cenzero!',
    timestamp: new Date().toISOString()
  });
}
```

### routes/api/users/index.ts
```typescript
// GET /api/users
export default function handler(ctx) {
  ctx.json({ users: [] });
}

// POST /api/users  
export function POST(ctx) {
  const { name, email } = ctx.body;
  if (!name || !email) {
    ctx.status(400).json({ error: 'Name and email required' });
    return;
  }
  ctx.status(201).json({ message: 'User created' });
}
```

### routes/api/users/[id].ts
```typescript
// GET /api/users/:id
export default function handler(ctx) {
  const userId = ctx.params.id;
  ctx.json({ user: { id: userId } });
}

// PUT /api/users/:id
export function PUT(ctx) {
  const userId = ctx.params.id;
  const updates = ctx.body;
  ctx.json({ message: `User ${userId} updated`, updates });
}

// DELETE /api/users/:id
export function DELETE(ctx) {
  const userId = ctx.params.id;
  ctx.json({ message: `User ${userId} deleted` });
}
```

## 🧪 Testing

```bash
# Start development server
npm run dev file-routing-demo.ts

# Test endpoints
curl http://localhost:3000/
curl http://localhost:3000/about  
curl http://localhost:3000/api/hello
curl http://localhost:3000/api/users
curl http://localhost:3000/api/users/123
curl -X POST -H "Content-Type: application/json" -d '{"name":"John"}' http://localhost:3000/api/users
```

## 🔍 Debug Routes

```typescript
// Lihat semua routes yang terdaftar
const fileRoutes = app.getFileRoutes();
fileRoutes.forEach(route => {
  console.log(`${route.method} ${route.pattern}`);
});
```

## ⚠️ Catatan Penting

1. **File naming**: Gunakan format `[param]` untuk dynamic routes
2. **Private files**: File yang dimulai dengan `_` akan diabaikan
3. **Index files**: `index.ts` akan menjadi route root folder
4. **Method priority**: Named exports lebih spesifik dari default export
5. **Route sorting**: Static → Dynamic → Catch-all

File-based routing membuat development lebih cepat dan terorganisir, mirip dengan pengalaman Next.js! 🚀
