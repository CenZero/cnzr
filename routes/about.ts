// GET /about
export default function handler(ctx) {
  ctx.json({
    name: 'Cenzero Framework',
    version: '1.0.0',
    description: 'A modern, minimalist Node.js web framework with file-based routing like Next.js',
    features: [
      'File-based routing',
      'TypeScript support',
      'Middleware system',
      'Plugin architecture',
      'Context API'
    ]
  });
}
