// GET /api/users
export default function handler(ctx) {
  ctx.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
    ],
    total: 3,
    timestamp: new Date().toISOString()
  });
}

// POST /api/users
export function POST(ctx) {
  const { name, email } = ctx.body || {};
  
  if (!name || !email) {
    ctx.status(400).json({
      error: 'Bad Request',
      message: 'Name and email are required'
    });
    return;
  }
  
  const newUser = {
    id: Date.now(),
    name,
    email,
    createdAt: new Date().toISOString()
  };
  
  ctx.status(201).json({
    message: 'User created successfully',
    user: newUser
  });
}
