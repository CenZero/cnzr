// GET /
export default async function handler(ctx) {
  ctx.json({
    message: 'Welcome to file-based routing!',
    timestamp: new Date().toISOString()
  });
}
