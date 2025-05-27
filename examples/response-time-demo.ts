import { CenzeroApp } from './src/core/server';
import { 
  responseTimeMiddleware, 
  createResponseTimeMiddleware, 
  preciseResponseTime, 
  responseTimeWithLogging,
  createCustomResponseTime,
  createFormattedResponseTime 
} from './src/middleware/response-time';
import { loggerMiddleware } from './src/middleware/logger';
import { corsMiddleware } from './src/middleware/cors';
import { CenzeroContext } from './src/core/context';

console.log('⏱️  Response Time Middleware Examples\n');

// ==========================================
// Example 1: Basic Response Time
// ==========================================

const basicApp = new CenzeroApp();

// CRITICAL: Response time MUST be first in pipeline
basicApp.use(responseTimeMiddleware);
basicApp.use(loggerMiddleware);
basicApp.use(corsMiddleware);

basicApp.get('/', (ctx: CenzeroContext) => {
  ctx.json({ 
    message: 'Basic response time example',
    timestamp: new Date().toISOString()
  });
});

basicApp.get('/fast', (ctx: CenzeroContext) => {
  ctx.json({ data: 'instant response' });
});

basicApp.get('/slow', async (ctx: CenzeroContext) => {
  // Simulate slow operation
  await new Promise(resolve => setTimeout(resolve, 100));
  ctx.json({ data: 'delayed response', delay: '100ms' });
});

// ==========================================
// Example 2: Precise Response Time
// ==========================================

const preciseApp = new CenzeroApp();

preciseApp.use(preciseResponseTime); // High precision timing
preciseApp.use(loggerMiddleware);

preciseApp.get('/', (ctx: CenzeroContext) => {
  ctx.json({ 
    message: 'Precise timing with 2 decimal places',
    precision: 'microsecond level'
  });
});

preciseApp.get('/compute', (ctx: CenzeroContext) => {
  // Simulate computation
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += Math.random();
  }
  ctx.json({ result: sum, computation: 'heavy' });
});

// ==========================================
// Example 3: Response Time with Logging
// ==========================================

const loggingApp = new CenzeroApp();

loggingApp.use(responseTimeWithLogging); // Logs to console
loggingApp.use(corsMiddleware);

loggingApp.get('/', (ctx: CenzeroContext) => {
  ctx.json({ 
    message: 'Response time logged to console',
    feature: 'automatic logging'
  });
});

loggingApp.get('/api/users', async (ctx: CenzeroContext) => {
  // Simulate database query
  await new Promise(resolve => setTimeout(resolve, 50));
  ctx.json({ 
    users: [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ]
  });
});

// ==========================================
// Example 4: Custom Configuration
// ==========================================

const customApp = new CenzeroApp();

customApp.use(createResponseTimeMiddleware({
  header: 'X-Processing-Time',
  precision: 3,
  log: true,
  formatter: (time) => {
    if (time < 10) return `${time.toFixed(3)}ms (blazing fast!)`;
    if (time < 50) return `${time.toFixed(2)}ms (fast)`;
    if (time < 200) return `${time.toFixed(1)}ms (normal)`;
    return `${Math.round(time)}ms (slow - needs optimization)`;
  }
}));

customApp.use(loggerMiddleware);

customApp.get('/', (ctx: CenzeroContext) => {
  ctx.json({ 
    message: 'Custom response time formatting',
    header: 'X-Processing-Time'
  });
});

customApp.get('/performance-test', (ctx: CenzeroContext) => {
  // Different performance scenarios
  const scenario = ctx.query.type || 'fast';
  
  switch (scenario) {
    case 'instant':
      ctx.json({ scenario: 'instant', time: 'sub-millisecond' });
      break;
    case 'fast':
      setTimeout(() => {
        ctx.json({ scenario: 'fast', time: '10-50ms' });
      }, 25);
      break;
    case 'normal':
      setTimeout(() => {
        ctx.json({ scenario: 'normal', time: '50-200ms' });
      }, 100);
      break;
    case 'slow':
      setTimeout(() => {
        ctx.json({ scenario: 'slow', time: '200ms+' });
      }, 300);
      break;
    default:
      ctx.json({ scenarios: ['instant', 'fast', 'normal', 'slow'] });
  }
});

// ==========================================
// Example 5: Multiple Headers
// ==========================================

const multiHeaderApp = new CenzeroApp();

// Total request time (including all middleware)
multiHeaderApp.use(createCustomResponseTime('X-Total-Time'));

// Simulate auth middleware
multiHeaderApp.use(async (ctx: CenzeroContext, next: () => Promise<void>) => {
  await new Promise(resolve => setTimeout(resolve, 10)); // Auth delay
  return next();
});

// Processing time (after auth)
multiHeaderApp.use(createCustomResponseTime('X-Processing-Time'));

multiHeaderApp.use(loggerMiddleware);

multiHeaderApp.get('/', (ctx: CenzeroContext) => {
  ctx.json({ 
    message: 'Multiple timing headers',
    headers: ['X-Total-Time', 'X-Processing-Time'],
    note: 'X-Total-Time includes auth overhead'
  });
});

// ==========================================
// Example 6: Performance Monitoring
// ==========================================

const monitoringApp = new CenzeroApp();

monitoringApp.use(createResponseTimeMiddleware({
  precision: 2,
  log: true,
  formatter: (time) => {
    // Performance monitoring with color coding
    let status = '';
    let color = '';
    
    if (time < 10) {
      status = 'EXCELLENT';
      color = '\x1b[32m'; // Green
    } else if (time < 50) {
      status = 'GOOD';
      color = '\x1b[36m'; // Cyan
    } else if (time < 200) {
      status = 'FAIR';
      color = '\x1b[33m'; // Yellow
    } else if (time < 500) {
      status = 'POOR';
      color = '\x1b[31m'; // Red
    } else {
      status = 'CRITICAL';
      color = '\x1b[41m'; // Red background
    }
    
    console.log(`${color}[${status}] Response time: ${time}ms\x1b[0m`);
    
    // Alert on slow requests
    if (time > 200) {
      console.warn(`⚠️  SLOW REQUEST DETECTED: ${time}ms - Consider optimization`);
    }
    
    return `${time}ms`;
  }
}));

monitoringApp.use(loggerMiddleware);

monitoringApp.get('/', (ctx: CenzeroContext) => {
  ctx.json({ 
    message: 'Performance monitoring example',
    monitoring: 'Color-coded response times'
  });
});

monitoringApp.get('/load-test', async (ctx: CenzeroContext) => {
  // Variable load for testing
  const delay = Math.random() * 300; // 0-300ms random delay
  await new Promise(resolve => setTimeout(resolve, delay));
  
  ctx.json({ 
    message: 'Load test endpoint',
    simulatedDelay: `${delay.toFixed(0)}ms`,
    tip: 'Refresh multiple times to see different performance ratings'
  });
});

// Start all servers
const servers = [
  { app: basicApp, port: 3061, name: 'Basic Response Time' },
  { app: preciseApp, port: 3062, name: 'Precise Timing' },
  { app: loggingApp, port: 3063, name: 'Response Time with Logging' },
  { app: customApp, port: 3064, name: 'Custom Configuration' },
  { app: multiHeaderApp, port: 3065, name: 'Multiple Headers' },
  { app: monitoringApp, port: 3066, name: 'Performance Monitoring' }
];

console.log('🚀 Starting Response Time middleware demo servers...\n');

servers.forEach(({ app, port, name }) => {
  try {
    app.listen(port);
    console.log(`✅ ${name}: http://localhost:${port}`);
  } catch (error) {
    console.error(`❌ Failed to start ${name} on port ${port}:`, error);
  }
});

console.log('\n📋 Test Commands:\n');

console.log('1. Basic Response Time:');
console.log('   curl -i http://localhost:3061/');
console.log('   curl -i http://localhost:3061/fast');
console.log('   curl -i http://localhost:3061/slow');

console.log('\n2. Precise Timing:');
console.log('   curl -i http://localhost:3062/');
console.log('   curl -i http://localhost:3062/compute');

console.log('\n3. Response Time with Logging (check console):');
console.log('   curl http://localhost:3063/');
console.log('   curl http://localhost:3063/api/users');

console.log('\n4. Custom Configuration:');
console.log('   curl -i http://localhost:3064/');
console.log('   curl -i http://localhost:3064/performance-test?type=fast');
console.log('   curl -i http://localhost:3064/performance-test?type=slow');

console.log('\n5. Multiple Headers:');
console.log('   curl -i http://localhost:3065/');

console.log('\n6. Performance Monitoring (watch console colors):');
console.log('   curl http://localhost:3066/');
console.log('   curl http://localhost:3066/load-test  # Run multiple times');

console.log('\n✨ Response Time Middleware Features:');
console.log('  ✅ X-Response-Time header in format: 12ms');
console.log('  ✅ High precision timing with process.hrtime()');
console.log('  ✅ Custom header names and formats');
console.log('  ✅ Console logging with performance ratings');
console.log('  ✅ Multiple timing measurements');
console.log('  ✅ Error-safe timing (continues during errors)');
console.log('  ✅ Zero configuration basic usage');
console.log('  ✅ Must be injected early in middleware pipeline');

console.log('\n💡 Pro Tips:');
console.log('  - Always place responseTimeMiddleware FIRST in pipeline');
console.log('  - Use precision: 0 for production, higher for debugging');
console.log('  - Monitor slow requests (>200ms) for optimization');
console.log('  - Use multiple headers to measure different stages');
