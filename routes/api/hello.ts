// GET /api/hello
export default function handler(ctx) {
  ctx.json({
    message: 'Hello from file-based API!',
    path: ctx.path,
    method: ctx.method,
    timestamp: new Date().toISOString()
  });
}

// POST /api/hello
export function POST(ctx) {
  const { name } = ctx.body || {};
  ctx.json({
    message: `Hello ${name || 'World'}!`,
    path: ctx.path,
    method: ctx.method,
    body: ctx.body
  });
}
