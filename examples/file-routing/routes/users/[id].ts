// GET /users/:id
export default async function handler(ctx) {
  const userId = ctx.params.id;
  
  if (!userId || isNaN(Number(userId))) {
    ctx.status(400).json({
      error: 'Invalid user ID'
    });
    return;
  }
  
  ctx.json({
    user: {
      id: Number(userId),
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      createdAt: new Date().toISOString()
    }
  });
}

// PUT /users/:id
export async function put(ctx) {
  const userId = ctx.params.id;
  const { name, email } = ctx.req.body || {};
  
  if (!userId || isNaN(Number(userId))) {
    ctx.status(400).json({
      error: 'Invalid user ID'
    });
    return;
  }
  
  ctx.json({
    message: 'User updated',
    user: {
      id: Number(userId),
      name: name || `User ${userId}`,
      email: email || `user${userId}@example.com`,
      updatedAt: new Date().toISOString()
    }
  });
}

// DELETE /users/:id
export async function delete(ctx) {
  const userId = ctx.params.id;
  
  if (!userId || isNaN(Number(userId))) {
    ctx.status(400).json({
      error: 'Invalid user ID'
    });
    return;
  }
  
  ctx.status(204).send('');
}
