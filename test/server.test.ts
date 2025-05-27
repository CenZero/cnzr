import { CenzeroApp } from '../src/core/server';
import { testConfig, mockConsole } from './setup';
import * as http from 'http';

describe('CenzeroApp Core Functionality', () => {
  let app: CenzeroApp;
  let server: http.Server;
  let testPort = 3002; // Use different port to avoid conflicts

  mockConsole();

  beforeEach(() => {
    testPort++; // Increment port for each test
    app = new CenzeroApp({ port: testPort });
  });

  afterEach((done) => {
    if (server && server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('Basic Server Operations', () => {
    test('should create server instance', () => {
      expect(app).toBeInstanceOf(CenzeroApp);
      expect(app.getServer()).toBeInstanceOf(http.Server);
    });

    test('should start and stop server', (done) => {
      server = app.listen(testPort, 'localhost', () => {
        expect(server.listening).toBe(true);
        server.close(() => {
          expect(server.listening).toBe(false);
          done();
        });
      });
    });
  });

  describe('HTTP Methods', () => {
    test('should register GET route', () => {
      const handler = jest.fn();
      app.get('/test', handler);

      const routes = app.getRouter().getRoutes();
      expect(routes.some(r => r.method === 'GET' && r.path === '/test')).toBe(true);
    });

    test('should register POST route', () => {
      const handler = jest.fn();
      app.post('/test', handler);

      const routes = app.getRouter().getRoutes();
      expect(routes.some(r => r.method === 'POST' && r.path === '/test')).toBe(true);
    });

    test('should register PUT route', () => {
      const handler = jest.fn();
      app.put('/test', handler);

      const routes = app.getRouter().getRoutes();
      expect(routes.some(r => r.method === 'PUT' && r.path === '/test')).toBe(true);
    });

    test('should register DELETE route', () => {
      const handler = jest.fn();
      app.delete('/test', handler);

      const routes = app.getRouter().getRoutes();
      expect(routes.some(r => r.method === 'DELETE' && r.path === '/test')).toBe(true);
    });
  });

  describe('Middleware Registration', () => {
    test('should register global middleware', () => {
      const middleware = jest.fn();
      app.use(middleware);

      // Global middleware is stored in globalMiddlewares array, not in routes
      expect(app.getMiddleware()).toContain(middleware);
    });

    test('should register path-specific middleware', () => {
      const middleware = jest.fn();
      app.use('/api', middleware);

      const routes = app.getRouter().getRoutes();
      expect(routes.some(r => r.method === '*' && r.path === '/api')).toBe(true);
    });
  });

  describe('Plugin System', () => {
    test('should register plugin', async () => {
      const plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        hooks: {
          onRequest: jest.fn()
        },
        dependencies: [],
        install: jest.fn()
      };

      await app.plugin(plugin);
      expect(app.getPluginManager().hasPlugin('test-plugin')).toBe(true);
    });

    test('should handle plugin dependencies', async () => {
      const plugin1 = {
        name: 'plugin1',
        version: '1.0.0',
        hooks: {},
        dependencies: [],
        install: jest.fn()
      };

      const plugin2 = {
        name: 'plugin2',
        version: '1.0.0',
        dependencies: ['plugin1'],
        hooks: {},
        install: jest.fn()
      };

      await app.plugin(plugin1);
      await app.plugin(plugin2);

      expect(app.getPluginManager().hasPlugin('plugin1')).toBe(true);
      expect(app.getPluginManager().hasPlugin('plugin2')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should register custom error handler', () => {
      const errorHandler = jest.fn();
      app.onError(errorHandler);

      expect(app.getErrorHandler()).toBeDefined();
    });
  });
});
