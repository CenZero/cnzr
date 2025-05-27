// GET /about
export default async function handler(ctx) {
  ctx.json({
    name: 'Cenzero Framework',
    version: '1.0.0',
    description: 'A minimalist but powerful Node.js web framework'
  });
}
