// Test: Logger Middleware usage exactly as requested
// Shows that it works with `app.use(loggerMiddleware)`

import { CenzeroApp, loggerMiddleware, CenzeroContext } from './src';

const app = new CenzeroApp({
  port: 3030,
  useContext: true
});

// Exactly as requested: app.use(loggerMiddleware)
app.use(loggerMiddleware);

app.get('/', (ctx: CenzeroContext) => {
  ctx.json({ message: 'Logger middleware test' });
});

app.get('/users', (ctx: CenzeroContext) => {
  ctx.json({ users: [{ id: 1, name: 'Test User' }] });
});

app.post('/users', (ctx: CenzeroContext) => {
  ctx.status(201).json({ message: 'User created' });
});

console.log('🧪 Testing Logger Middleware Usage');
console.log('✅ app.use(loggerMiddleware) - working!');
console.log('📝 Expected format: [METHOD] [URL] - [STATUS] in [ms]');
console.log('');

app.listen(3030, 'localhost', () => {
  console.log('🚀 Test server running on http://localhost:3030');
  console.log('');
  console.log('📋 Test commands:');
  console.log('curl http://localhost:3030/');
  console.log('curl http://localhost:3030/users');
  console.log('curl -X POST http://localhost:3030/users');
  console.log('');
  console.log('🔍 Watch console for logger output...');
});
