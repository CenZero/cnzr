// Complete Logger Middleware Examples - Cenzero Framework
// Shows all logger middleware options and usage patterns

import { CenzeroApp } from '../src/core/server';
import { CenzeroContext } from '../src/core/context';
import { loggerMiddleware, createLoggerMiddleware } from '../src/middleware/logger';

console.log('📋 Complete Logger Middleware Examples');
console.log('');

// Example 1: Basic logger middleware
console.log('🔵 Example 1: Basic Logger Middleware');
const basicApp = new CenzeroApp({
  port: 3021,
  useContext: true
});

basicApp.use(loggerMiddleware);

basicApp.get('/', (ctx: CenzeroContext) => {
  ctx.json({ message: 'Basic logger example' });
});

basicApp.get('/test', (ctx: CenzeroContext) => {
  ctx.json({ message: 'Test endpoint', timestamp: Date.now() });
});

// Example 2: Colored logger
console.log('🔵 Example 2: Colored Logger');
const coloredApp = new CenzeroApp({
  port: 3022,
  useContext: true
});

const coloredLogger = createLoggerMiddleware({
  colors: true
});

coloredApp.use(coloredLogger);

coloredApp.get('/', (ctx: CenzeroContext) => {
  ctx.json({ message: 'Colored logger example' });
});

coloredApp.get('/success', (ctx: CenzeroContext) => {
  ctx.status(200).json({ message: 'Success response' });
});

coloredApp.get('/redirect', (ctx: CenzeroContext) => {
  ctx.redirect('/success', 302);
});

coloredApp.get('/notfound', (ctx: CenzeroContext) => {
  ctx.status(404).json({ error: 'Not found' });
});

coloredApp.get('/error', (ctx: CenzeroContext) => {
  ctx.status(500).json({ error: 'Server error' });
});

// Example 3: Logger with timestamp
console.log('🔵 Example 3: Logger with Timestamp');
const timestampApp = new CenzeroApp({
  port: 3023,
  useContext: true
});

const timestampLogger = createLoggerMiddleware({
  includeTimestamp: true,
  colors: true
});

timestampApp.use(timestampLogger);

timestampApp.get('/', (ctx: CenzeroContext) => {
  ctx.json({ message: 'Timestamped logger example' });
});

// Example 4: Custom format logger
console.log('🔵 Example 4: Custom Format Logger');
const customApp = new CenzeroApp({
  port: 3024,
  useContext: true
});

const customLogger = createLoggerMiddleware({
  format: (method, url, status, duration) => {
    const emoji = status >= 200 && status < 300 ? '✅' : 
                  status >= 300 && status < 400 ? '🔄' :
                  status >= 400 && status < 500 ? '⚠️' : '❌';
    return `${emoji} ${method} ${url} → ${status} (${duration}ms)`;
  }
});

customApp.use(customLogger);

customApp.get('/', (ctx: CenzeroContext) => {
  ctx.json({ message: 'Custom format logger example' });
});

customApp.post('/data', (ctx: CenzeroContext) => {
  ctx.status(201).json({ message: 'Data created', data: ctx.body });
});

// Example 5: Silent logger (for testing)
console.log('🔵 Example 5: Silent Logger');
const silentApp = new CenzeroApp({
  port: 3025,
  useContext: true
});

const silentLogger = createLoggerMiddleware({
  silent: true // No logs will be printed
});

silentApp.use(silentLogger);

silentApp.get('/', (ctx: CenzeroContext) => {
  ctx.json({ message: 'Silent logger example - no logs printed' });
});

// Start all servers
async function startServers() {
  console.log('🚀 Starting all logger example servers...');
  console.log('');
  
  basicApp.listen(3021, 'localhost', () => {
    console.log('🔵 Basic Logger Example: http://localhost:3021');
    console.log('   Expected output: [GET] / - 200 in 5ms');
  });
  
  coloredApp.listen(3022, 'localhost', () => {
    console.log('🌈 Colored Logger Example: http://localhost:3022');
    console.log('   Features: Colored method and status codes');
  });
  
  timestampApp.listen(3023, 'localhost', () => {
    console.log('⏰ Timestamp Logger Example: http://localhost:3023');
    console.log('   Features: ISO timestamps + colors');
  });
  
  customApp.listen(3024, 'localhost', () => {
    console.log('🎨 Custom Format Logger Example: http://localhost:3024');
    console.log('   Features: Custom format with emojis');
  });
  
  silentApp.listen(3025, 'localhost', () => {
    console.log('🤫 Silent Logger Example: http://localhost:3025');
    console.log('   Features: No logging output');
  });
  
  console.log('');
  console.log('📝 Test these endpoints:');
  console.log('👉 GET  http://localhost:3021/');
  console.log('👉 GET  http://localhost:3021/test');
  console.log('👉 GET  http://localhost:3022/success');
  console.log('👉 GET  http://localhost:3022/redirect');
  console.log('👉 GET  http://localhost:3022/notfound');
  console.log('👉 GET  http://localhost:3022/error');
  console.log('👉 POST http://localhost:3024/data (JSON body)');
  console.log('');
  console.log('🔍 Watch console output to see different log formats!');
}

// Only start if this file is run directly
if (require.main === module) {
  startServers().catch(console.error);
}

export { basicApp, coloredApp, timestampApp, customApp, silentApp };
