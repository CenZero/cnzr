# Enhanced Plugin System Implementation - Cenzero Framework

## ✅ COMPLETED: Enhanced Plugin System

The Cenzero Framework (`cnzr`) now has a fully functional enhanced plugin system as requested, with the following key features:

### Core Features Implemented

#### 1. Plugin Functions with App Instance Access
```typescript
// Each plugin is a function that receives app instance and optional config
const myPlugin: PluginFunction = (app, config = {}) => {
  // Plugin has access to app instance
  // Plugin can register hooks, middleware, routes, etc.
};

// Use the plugin
await app.usePlugin(myPlugin, { option: 'value' });
```

#### 2. Lifecycle Hooks with req/res Parameters
All hooks run asynchronously and have access to request/response objects:

- **`onRequest(req, res)`** - Called on incoming requests
- **`onResponse(req, res)`** - Called on outgoing responses  
- **`onError(err, req, res)`** - Called on errors
- **`onStart(server)`** - Called when server starts

#### 3. usePlugin() Method
```typescript
// Simple usage
await app.usePlugin(pluginFunction);

// With configuration
await app.usePlugin(pluginFunction, { 
  option1: 'value1',
  option2: 'value2' 
});
```

### Example Plugins Included

#### 1. Request ID Plugin
```typescript
await app.usePlugin(requestIdPluginFunction, { 
  header: 'X-Custom-Request-ID' 
});
```
- Generates unique request IDs
- Adds header to response
- Accessible in route handlers

#### 2. Authentication Plugin
```typescript
await app.usePlugin(authPluginFunction, { 
  secret: 'my-secret-token', 
  paths: ['/api/protected'] 
});
```
- Protects specified routes
- Bearer token authentication
- Adds user info to request

#### 3. Analytics Plugin
```typescript
await app.usePlugin(analyticsPlugin, { 
  trackingId: 'GA-12345' 
});
```
- Logs request analytics
- User agent tracking
- Configurable tracking ID

#### 4. Simple Logger Plugin
```typescript
await app.usePlugin(simpleLoggerPlugin, { 
  logLevel: 'info' 
});
```
- Logs all requests/responses
- Timestamps included
- Error logging

### Technical Implementation Details

#### Plugin Manager Enhancement
- **Dual Hook System**: Supports both new req/res-based hooks and legacy context-based hooks
- **Async Execution**: All hooks run asynchronously
- **Error Handling**: Plugin errors are caught and logged without breaking the server
- **Dependency Management**: Plugin dependencies are tracked and validated

#### Server Integration
The plugin hooks are integrated into the server lifecycle:

```typescript
// Request lifecycle
await this.pluginManager.executeRequestHook(req, res);     // New req/res hooks
await this.pluginManager.onRequest(ctx);                   // Legacy context hooks

// Response lifecycle  
await this.pluginManager.executeResponseHook(req, res);    // New req/res hooks
await this.pluginManager.onResponse(ctx);                  // Legacy context hooks

// Error lifecycle
await this.pluginManager.executeErrorHook(error, req, res); // New req/res hooks

// Server start
await this.pluginManager.executeStartHook(server);         // New req/res hooks
```

### Test Results

#### ✅ All Tests Passing
- 63 tests pass successfully
- No regressions in existing functionality
- Plugin system fully tested

#### ✅ Live Demo Working
The live demo at `examples/plugin-system-demo.ts` demonstrates:

**Working Features:**
- ✅ Plugin loading and configuration
- ✅ Request ID generation and header setting
- ✅ Authentication with Bearer tokens
- ✅ Analytics tracking with user agent detection
- ✅ Request/response logging with timestamps
- ✅ Error handling with plugin hooks
- ✅ All lifecycle hooks executing correctly

**Test Endpoints:**
- `GET /` - Basic endpoint with plugin hooks
- `GET /api/protected` - Protected route requiring authentication
- `GET /test-error` - Error handling demonstration

### Backward Compatibility

The enhanced plugin system maintains full backward compatibility:
- Existing Plugin objects still work
- Legacy context-based hooks still function
- No breaking changes to existing APIs

### Usage Examples

#### Basic Plugin Function
```typescript
const simplePlugin: PluginFunction = (app, config) => {
  app.getPluginManager().register({
    name: 'simple-plugin',
    version: '1.0.0',
    dependencies: [],
    hooks: {
      onRequest: async (req, res) => {
        console.log(`Request: ${req.method} ${req.url}`);
      },
      onResponse: async (req, res) => {
        console.log(`Response: ${res.statusCode}`);
      }
    },
    install: async () => {
      console.log('Plugin installed');
    }
  });
};

await app.usePlugin(simplePlugin);
```

#### Advanced Plugin with Configuration
```typescript
interface MyPluginOptions {
  enabled: boolean;
  timeout: number;
  endpoints: string[];
}

const advancedPlugin: PluginFunction = (app, options: MyPluginOptions = {}) => {
  const config = {
    enabled: true,
    timeout: 5000,
    endpoints: ['/api'],
    ...options
  };

  if (!config.enabled) return;

  app.getPluginManager().register({
    name: 'advanced-plugin',
    version: '2.0.0',
    dependencies: [],
    hooks: {
      onRequest: async (req, res) => {
        const url = require('url').parse(req.url || '');
        if (config.endpoints.some(ep => url.pathname?.startsWith(ep))) {
          // Apply plugin logic to specific endpoints
          res.setHeader('X-Plugin-Applied', 'true');
        }
      }
    },
    install: async () => {
      console.log(`Advanced plugin installed with timeout: ${config.timeout}`);
    }
  });
};

await app.usePlugin(advancedPlugin, {
  timeout: 10000,
  endpoints: ['/api/v1', '/api/v2']
});
```

## Summary

The enhanced plugin system for Cenzero Framework is now fully implemented and working as specified:

1. ✅ **Plugin Functions**: Each plugin is a function receiving app instance and config
2. ✅ **usePlugin() Method**: App has `usePlugin(pluginFn, config)` method
3. ✅ **Lifecycle Hooks**: All four hooks implemented with req/res parameters
4. ✅ **Async Execution**: All hooks run asynchronously
5. ✅ **Real-world Examples**: Multiple working example plugins included
6. ✅ **Full Test Coverage**: All tests passing with live demo
7. ✅ **Backward Compatibility**: No breaking changes

The plugin system provides a powerful, flexible way to extend Cenzero applications with custom functionality while maintaining clean separation of concerns and excellent developer experience.
