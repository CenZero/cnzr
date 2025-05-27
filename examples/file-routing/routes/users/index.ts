// GET /users
export default async function handler(ctx) {
  ctx.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ]
  });
}

// POST /users
export async function post(ctx) {
  const { name, email } = ctx.req.body || {};
  
  if (!name || !email) {
    ctx.status(400).json({
      error: 'Name and email are required'
    });
    return;
  }
  
  ctx.status(201).json({
    message: 'User created',
    user: {
      id: Date.now(),
      name,
      email
    }
  });
}
