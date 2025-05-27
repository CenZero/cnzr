#!/usr/bin/env tsx

/**
 * Contoh Sederhana: Handler Format dengan Context
 * 
 * Fokus pada format handler: app.get('/hello/:name', async (ctx) => { ... })
 */

import { CenzeroApp } from '../src/core/server';
import { CenzeroContext } from '../src/core/context';

const app = new CenzeroApp({ useContext: true });

// ========================================
// MIDDLEWARE CHAINING dengan app.use()
// ========================================

// Middleware 1: Logger
app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  console.log(`→ ${ctx.method} ${ctx.url}`);
  await next();
  console.log(`← ${ctx.method} ${ctx.url} - ${ctx.res.statusCode}`);
});

// Middleware 2: Add request info
app.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  ctx.state.timestamp = new Date().toISOString();
  await next();
});

// ========================================
// HANDLER FORMAT: async (ctx) => { ... }
// ========================================

// ✅ Format handler seperti yang diminta
app.get('/hello/:name', async (ctx) => {
  ctx.json({ 
    message: `Hello ${ctx.params.name}!`,
    timestamp: ctx.state.timestamp
  });
});

// Lebih banyak contoh handler dengan format yang sama
app.get('/users/:id', async (ctx) => {
  ctx.json({
    user: {
      id: ctx.params.id,
      name: `User ${ctx.params.id}`
    },
    query: ctx.query
  });
});

app.post('/users', async (ctx) => {
  const userData = ctx.body;
  ctx.status(201).json({
    message: 'User created',
    data: userData,
    timestamp: ctx.state.timestamp
  });
});

app.get('/api/:resource/:id', async (ctx) => {
  ctx.json({
    resource: ctx.params.resource,
    id: ctx.params.id,
    query: ctx.query,
    method: ctx.method
  });
});

// Start server untuk testing
if (require.main === module) {
  app.listen(3001, 'localhost', () => {
    console.log('🚀 Simple Handler Demo at http://localhost:3001');
    console.log('\nTest:');
    console.log('  curl http://localhost:3001/hello/world');
    console.log('  curl http://localhost:3001/users/123?role=admin');
    console.log('  curl -X POST -H "Content-Type: application/json" -d \'{"name":"Alice"}\' http://localhost:3001/users');
  });
}

export { app };
