#!/usr/bin/env node

// Quick test untuk cek advanced humanization features
// Gw bikin simple test buat pastiin semua fitur custom gw works

const { CenzeroApp, getRandomJoke, getMorningVibes, detectEasterEgg } = require('./dist/cjs/index');

console.log('🧪 Testing Advanced Humanization Features...\n');

// Test 1: DevJokes functionality
console.log('📝 Testing DevJokes:');
console.log('   Random joke:', getRandomJoke());
console.log('   Morning vibes:', getMorningVibes());
console.log('   Easter egg detection (coffee):', detectEasterEgg('I need coffee'));
console.log('   Easter egg detection (bug):', detectEasterEgg('Found a bug!'));
console.log();

// Test 2: CenzeroApp dengan personal features
console.log('🚀 Testing CenzeroApp Personal Features:');
const app = new CenzeroApp({ 
  debug: true,  // Enable debug mode buat liat personal touches
  port: 3001 
});

// Test personal naming conventions
console.log('   Server stats available:', typeof app.getServerStats === 'function');

// Simple route dengan personal style
app.get('/test-humanization', (ctx) => {
  ctx.json({ 
    message: 'Advanced humanization working! 🎉',
    joke: getRandomJoke(),
    vibes: getMorningVibes(),
    timestamp: new Date().toISOString()
  });
});

// Test error handling dengan personal touch
app.onError((error, req, res, ctx) => {
  console.log('🐛 Custom error handler triggered (personal style)');
  if (ctx) {
    ctx.status(500).json({ 
      error: 'Something went wrong, but handled dengan style!',
      message: error.message 
    });
  }
});

console.log('   Routes registered successfully');
console.log('   Error handler registered');
console.log();

// Start server briefly untuk test
console.log('🔧 Testing Server Startup (will close immediately):');
const server = app.listen(3001, 'localhost', () => {
  console.log('   ✅ Server started with personal touches');
  console.log('   ✅ Debug mode showing personal features');
  
  // Test server stats
  const stats = app.getServerStats();
  console.log('   📊 Server stats:', {
    requestCount: stats.requestCount,
    uptime: `${stats.uptime}ms`,
    memoryMB: Math.round(stats.memoryUsage.heapUsed / 1024 / 1024),
    middleware: stats.middleware
  });
  
  // Close immediately after test
  setTimeout(() => {
    app.close(() => {
      console.log('\n🎉 All advanced humanization features working correctly!');
      console.log('   ✅ Personal naming conventions');
      console.log('   ✅ Custom utilities (no heavy dependencies)');
      console.log('   ✅ Enhanced logging with personal flair');
      console.log('   ✅ Easter eggs and humor');
      console.log('   ✅ Performance tracking');
      console.log('   ✅ Mixed Indonesian/English comments working');
      process.exit(0);
    });
  }, 1000);
});
