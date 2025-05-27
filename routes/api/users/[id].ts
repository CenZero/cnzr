// GET /api/users/:id
export default function handler(ctx) {
  const userId = ctx.params.id;
  
  // Simulasi data user
  const user = {
    id: parseInt(userId),
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    createdAt: '2025-01-01T00:00:00.000Z'
  };
  
  ctx.json({
    user,
    params: ctx.params,
    message: `Retrieved user with ID: ${userId}`
  });
}

// PUT /api/users/:id
export function PUT(ctx) {
  const userId = ctx.params.id;
  const { name, email } = ctx.body || {};
  
  if (!name && !email) {
    ctx.status(400).json({
      error: 'Bad Request',
      message: 'At least one field (name or email) is required for update'
    });
    return;
  }
  
  const updatedUser = {
    id: parseInt(userId),
    name: name || `User ${userId}`,
    email: email || `user${userId}@example.com`,
    updatedAt: new Date().toISOString()
  };
  
  ctx.json({
    message: `User ${userId} updated successfully`,
    user: updatedUser,
    changes: ctx.body
  });
}

// DELETE /api/users/:id
export function DELETE(ctx) {
  const userId = ctx.params.id;
  
  ctx.json({
    message: `User ${userId} deleted successfully`,
    userId: parseInt(userId),
    deletedAt: new Date().toISOString()
  });
}
