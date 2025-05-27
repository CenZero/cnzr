// GET /
export default function handler(ctx) {
  ctx.json({
    message: 'Welcome to file-based routing!',
    framework: 'Cenzero',
    timestamp: new Date().toISOString(),
    routes: [
      'GET /',
      'GET /about', 
      'GET /api/hello',
      'GET /api/users',
      'POST /api/users',
      'GET /api/users/:id',
      'PUT /api/users/:id',
      'DELETE /api/users/:id'
    ]
  });
}
