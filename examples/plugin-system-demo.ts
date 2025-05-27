import { CenzeroApp } from '../src/core/server';
import { PluginFunction } from '../src/core/plugin';
import { CenzeroContext } from '../src/core/context';
import { requestIdPluginFunction, authPluginFunction, compressionPluginFunction } from '../src/plugins';
import { IncomingMessage, ServerResponse } from 'http';

// Test the enhanced plugin system
async function testPluginSystem() {
  console.log('🧪 Testing Enhanced Plugin System for Cenzero Framework');
  console.log('');

  const app = new CenzeroApp({
    port: 3003,
    useContext: true
  });

  // Example 1: Simple logging plugin function
  const simpleLoggerPlugin: PluginFunction = (app, config = {}) => {
    console.log('🔌 Simple Logger Plugin loaded with config:', config);
    
    app.getPluginManager().register({
      name: 'simple-logger',
      version: '1.0.0',
      dependencies: [],
      hooks: {
        onRequest: async (req: IncomingMessage, res: ServerResponse) => {
          console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
        },
        onResponse: async (req: IncomingMessage, res: ServerResponse) => {
          console.log(`📤 ${req.method} ${req.url} - ${res.statusCode} - ${new Date().toISOString()}`);
        },
        onError: async (err: Error, req: IncomingMessage, res: ServerResponse) => {
          console.log(`❌ Error in ${req.method} ${req.url}:`, err.message);
        },
        onStart: async (server: any) => {
          console.log('🚀 Simple Logger Plugin: Server started!');
        }
      },
      install: async () => {
        console.log('✅ Simple Logger Plugin installed');
      }
    });
  };

  // Example 2: Custom analytics plugin
  const analyticsPlugin: PluginFunction = (app, config: { trackingId?: string } = {}) => {
    const { trackingId = 'default-tracking-id' } = config;
    console.log(`🔌 Analytics Plugin loaded with tracking ID: ${trackingId}`);
    
    app.getPluginManager().register({
      name: 'analytics',
      version: '2.0.0',
      dependencies: [],
      hooks: {
        onRequest: async (req: IncomingMessage, res: ServerResponse) => {
          // Simulate analytics tracking
          const userAgent = req.headers['user-agent'] || 'unknown';
          console.log(`📊 Analytics: ${req.method} ${req.url} from ${userAgent}`);
        },
        onStart: async (server: any) => {
          console.log(`📈 Analytics Plugin: Tracking started with ID ${trackingId}`);
        }
      },
      install: async () => {
        console.log('✅ Analytics Plugin installed');
      }
    });
  };

  try {
    // Use plugins with the new usePlugin method
    console.log('📦 Loading plugins...');
    
    // Load simple logger plugin
    await app.usePlugin(simpleLoggerPlugin, { logLevel: 'info' });
    
    // Load analytics plugin with config
    await app.usePlugin(analyticsPlugin, { trackingId: 'GA-12345' });
    
    // Load pre-built example plugins
    await app.usePlugin(requestIdPluginFunction, { header: 'X-Custom-Request-ID' });
    await app.usePlugin(authPluginFunction, { 
      secret: 'my-secret-token', 
      paths: ['/api/protected'] 
    });
    await app.usePlugin(compressionPluginFunction, { threshold: 512 });

    console.log('');
    console.log('✅ All plugins loaded successfully!');
    console.log('');

    // Define some routes to test
    app.get('/', (ctx: CenzeroContext) => {
      ctx.json({ 
        message: 'Hello from Cenzero with Enhanced Plugin System!',
        timestamp: new Date().toISOString(),
        requestId: (ctx.req as any).requestId
      });
    });

    app.get('/api/protected', (ctx: CenzeroContext) => {
      const user = (ctx.req as any).user;
      ctx.json({ 
        message: 'This is a protected route',
        user: user,
        requestId: (ctx.req as any).requestId
      });
    });

    app.get('/test-error', (ctx: CenzeroContext) => {
      throw new Error('Test error for plugin hooks');
    });

    // Start server
    const server = app.listen(3003, 'localhost', () => {
      console.log('');
      console.log('🎯 Test endpoints:');
      console.log('  • GET http://localhost:3003/ - Basic endpoint');
      console.log('  • GET http://localhost:3003/api/protected - Protected endpoint (needs Bearer token)');
      console.log('  • GET http://localhost:3003/test-error - Error test endpoint');
      console.log('');
      console.log('📝 To test protected endpoint:');
      console.log('  curl -H "Authorization: Bearer my-secret-token" http://localhost:3003/api/protected');
      console.log('');
      console.log('💡 Plugin system features demonstrated:');
      console.log('  ✓ Plugin functions that receive app instance and config');
      console.log('  ✓ usePlugin() method for registering plugins');
      console.log('  ✓ Async lifecycle hooks: onRequest, onResponse, onError, onStart');
      console.log('  ✓ Request/Response parameter access in hooks');
      console.log('  ✓ Plugin configuration and dependency management');
      console.log('');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('');
      console.log('🛑 Shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error setting up plugin system:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testPluginSystem().catch(console.error);
}

export { testPluginSystem };
