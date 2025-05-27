import { PluginManager, createPlugin, PluginFunction } from '../src/core/plugin';
import { CenzeroApp } from '../src/core/server';
import { IncomingMessage, ServerResponse } from 'http';
import { mockConsole } from './setup';

describe('Plugin System', () => {
  let app: CenzeroApp;
  let pluginManager: PluginManager;

  mockConsole();

  beforeEach(() => {
    app = new CenzeroApp({ port: 3001 });
    pluginManager = app.getPluginManager();
  });

  describe('Plugin Registration', () => {
    test('should register a simple plugin', async () => {
      const plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        hooks: {},
        dependencies: [],
        install: jest.fn()
      };

      await pluginManager.register(plugin);
      
      expect(pluginManager.hasPlugin('test-plugin')).toBe(true);
      expect(plugin.install).toHaveBeenCalledWith(app, undefined);
    });

    test('should pass options to plugin install', async () => {
      const plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        hooks: {},
        dependencies: [],
        install: jest.fn()
      };

      const options = { enabled: true };
      await pluginManager.register(plugin, options);
      
      expect(plugin.install).toHaveBeenCalledWith(app, options);
    });

    test('should handle plugin dependencies', async () => {
      const plugin1 = {
        name: 'base-plugin',
        version: '1.0.0',
        hooks: {},
        dependencies: [],
        install: jest.fn()
      };

      const plugin2 = {
        name: 'dependent-plugin',
        version: '1.0.0',
        hooks: {},
        dependencies: ['base-plugin'],
        install: jest.fn()
      };

      await pluginManager.register(plugin1);
      await pluginManager.register(plugin2);

      expect(pluginManager.hasPlugin('base-plugin')).toBe(true);
      expect(pluginManager.hasPlugin('dependent-plugin')).toBe(true);
    });

    test('should reject plugin with missing dependencies', async () => {
      const plugin = {
        name: 'dependent-plugin',
        version: '1.0.0',
        hooks: {},
        dependencies: ['missing-plugin'],
        install: jest.fn()
      };

      await expect(pluginManager.register(plugin)).rejects.toThrow(
        'Plugin "dependent-plugin" requires dependency "missing-plugin" to be installed first'
      );
    });

    test('should prevent duplicate plugin registration', async () => {
      const plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        hooks: {},
        dependencies: [],
        install: jest.fn()
      };

      await pluginManager.register(plugin);
      
      await expect(pluginManager.register(plugin)).rejects.toThrow(
        'Plugin "test-plugin" is already registered'
      );
    });
  });

  describe('Plugin Hooks', () => {
    test('should call onRequest hooks', async () => {
      const onRequestHook = jest.fn();
      const plugin = {
        name: 'request-plugin',
        version: '1.0.0',
        hooks: { onRequestContext: onRequestHook },
        dependencies: [],
        install: jest.fn()
      };

      await pluginManager.register(plugin);
      
      const mockCtx = {} as any;
      await pluginManager.onRequest(mockCtx);
      
      expect(onRequestHook).toHaveBeenCalledWith(mockCtx);
    });

    test('should call onResponse hooks', async () => {
      const onResponseHook = jest.fn();
      const plugin = {
        name: 'response-plugin',
        version: '1.0.0',
        hooks: { onResponseContext: onResponseHook },
        dependencies: [],
        install: jest.fn()
      };

      await pluginManager.register(plugin);
      
      const mockCtx = {} as any;
      await pluginManager.onResponse(mockCtx);
      
      expect(onResponseHook).toHaveBeenCalledWith(mockCtx);
    });

    test('should call onError hooks', async () => {
      const onErrorHook = jest.fn();
      const plugin = {
        name: 'error-plugin',
        version: '1.0.0',
        hooks: { onErrorContext: onErrorHook },
        dependencies: [],
        install: jest.fn()
      };

      await pluginManager.register(plugin);
      
      const mockError = new Error('test error');
      const mockCtx = {} as any;
      await pluginManager.onError(mockError, mockCtx);
      
      expect(onErrorHook).toHaveBeenCalledWith(mockError, mockCtx);
    });

    test('should handle hook errors gracefully', async () => {
      const failingHook = jest.fn().mockImplementation(() => {
        throw new Error('Hook failed');
      });

      const plugin = {
        name: 'failing-plugin',
        version: '1.0.0',
        hooks: { onRequestContext: failingHook },
        dependencies: [],
        install: jest.fn()
      };

      await pluginManager.register(plugin);
      
      const mockCtx = {} as any;
      // Should not throw
      await expect(pluginManager.onRequest(mockCtx)).resolves.toBeUndefined();
      expect(failingHook).toHaveBeenCalled();
    });
  });

  describe('Plugin Factory', () => {
    test('should create plugin with factory', () => {
      const install = jest.fn();
      const plugin = createPlugin({
        name: 'factory-plugin',
        version: '2.0.0',
        hooks: {
          onRequest: jest.fn()
        },
        dependencies: ['base'],
        install
      });

      expect(plugin.name).toBe('factory-plugin');
      expect(plugin.version).toBe('2.0.0');
      expect(plugin.dependencies).toEqual(['base']);
      expect(plugin.install).toBe(install);
    });

    test('should use default version', () => {
      const plugin = createPlugin({
        name: 'no-version-plugin',
        install: jest.fn()
      });

      expect(plugin.version).toBe('1.0.0');
      expect(plugin.hooks).toEqual({});
      expect(plugin.dependencies).toEqual([]);
    });
  });

  describe('Plugin Lifecycle', () => {
    test('should call onStart hooks', async () => {
      const onStartHook = jest.fn();
      const plugin = {
        name: 'start-plugin',
        version: '1.0.0',
        hooks: { onStart: onStartHook },
        dependencies: [],
        install: jest.fn()
      };

      await pluginManager.register(plugin);
      await pluginManager.onStart();
      
      expect(onStartHook).toHaveBeenCalledWith(app);
    });

    test('should call onStop hooks', async () => {
      const onStopHook = jest.fn();
      const plugin = {
        name: 'stop-plugin',
        version: '1.0.0',
        hooks: { onStop: onStopHook },
        dependencies: [],
        install: jest.fn()
      };

      await pluginManager.register(plugin);
      await pluginManager.onStop();
      
      expect(onStopHook).toHaveBeenCalledWith(app);
    });
  });

  describe('Enhanced Plugin System', () => {
    test('should support usePlugin with plugin functions', async () => {
      const onRequestHook = jest.fn();
      const onResponseHook = jest.fn();
      
      const testPlugin: PluginFunction = (app, config) => {
        app.getPluginManager().register({
          name: 'test-function-plugin',
          version: '1.0.0',
          dependencies: [],
          hooks: {
            onRequest: onRequestHook,
            onResponse: onResponseHook
          },
          install: async () => {
            // Plugin installation logic
          }
        });
      };

      // Use the plugin function
      await pluginManager.usePlugin(testPlugin, { testOption: 'value' });

      // Verify plugin was registered
      expect(pluginManager.hasPlugin('test-function-plugin')).toBe(true);

      // Test the new req/res-based hooks
      const mockReq = {} as IncomingMessage;
      const mockRes = {} as ServerResponse;

      await pluginManager.executeRequestHook(mockReq, mockRes);
      await pluginManager.executeResponseHook(mockReq, mockRes);

      expect(onRequestHook).toHaveBeenCalledWith(mockReq, mockRes);
      expect(onResponseHook).toHaveBeenCalledWith(mockReq, mockRes);
    });

    test('should support plugin functions with configuration', async () => {
      let receivedConfig: any = null;
      
      const configurablePlugin: PluginFunction = (app, config) => {
        receivedConfig = config;
        
        app.getPluginManager().register({
          name: 'configurable-plugin',
          version: '1.0.0',
          dependencies: [],
          hooks: {},
          install: async () => {}
        });
      };

      const testConfig = { 
        option1: 'value1', 
        option2: 42, 
        option3: true 
      };

      await pluginManager.usePlugin(configurablePlugin, testConfig);

      expect(receivedConfig).toEqual(testConfig);
      expect(pluginManager.hasPlugin('configurable-plugin')).toBe(true);
    });

    test('should execute req/res-based error hooks', async () => {
      const onErrorHook = jest.fn();
      
      const errorPlugin: PluginFunction = (app, config) => {
        app.getPluginManager().register({
          name: 'error-test-plugin',
          version: '1.0.0',
          dependencies: [],
          hooks: {
            onError: onErrorHook
          },
          install: async () => {}
        });
      };

      await pluginManager.usePlugin(errorPlugin);

      const mockReq = {} as IncomingMessage;
      const mockRes = {} as ServerResponse;
      const mockError = new Error('Test error');

      await pluginManager.executeErrorHook(mockError, mockReq, mockRes);

      expect(onErrorHook).toHaveBeenCalledWith(mockError, mockReq, mockRes);
    });

    test('should execute start hooks with server parameter', async () => {
      const onStartHook = jest.fn();
      
      const startPlugin: PluginFunction = (app, config) => {
        app.getPluginManager().register({
          name: 'start-test-plugin',
          version: '1.0.0',
          dependencies: [],
          hooks: {
            onStart: onStartHook
          },
          install: async () => {}
        });
      };

      await pluginManager.usePlugin(startPlugin);

      const mockServer = { listen: jest.fn() };
      await pluginManager.executeStartHook(mockServer);

      expect(onStartHook).toHaveBeenCalledWith(mockServer);
    });
  });
});
