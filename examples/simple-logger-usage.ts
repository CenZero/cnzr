// Simple Logger Middleware Usage Example - Cenzero Framework
// Shows how to use the logger middleware with app.use(loggerMiddleware)

import { CenzeroApp, loggerMiddleware, createLoggerMiddleware } from '../src';

// Example 1: Basic usage
const app = new CenzeroApp({ useContext: true });

// Simply add the logger middleware
app.use(loggerMiddleware);

// Add some routes
app.get('/', (ctx) => {
  ctx.json({ message: 'Hello World!' });
});

app.get('/users', (ctx) => {
  ctx.json({ users: ['John', 'Jane'] });
});

app.post('/users', (ctx) => {
  ctx.status(201).json({ message: 'User created' });
});

// Example 2: Custom logger
const customApp = new CenzeroApp({ useContext: true, port: 3002 });

// Use custom logger with colors
const colorLogger = createLoggerMiddleware({
  colors: true,
  includeTimestamp: true
});

customApp.use(colorLogger);

customApp.get('/', (ctx) => {
  ctx.json({ message: 'Colored logger app!' });
});

// Start servers
app.listen(3001, 'localhost', () => {
  console.log('🚀 Basic Logger App running on http://localhost:3001');
  console.log('📝 Logger format: [METHOD] [URL] - [STATUS] in [ms]');
});

customApp.listen(3002, 'localhost', () => {
  console.log('🌈 Custom Logger App running on http://localhost:3002');
  console.log('📝 Logger format: Timestamped + Colored');
});

export { app, customApp };
