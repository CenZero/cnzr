import { CenzeroApp } from '../src/index';
import { logger, cors } from '../src/plugins';
import { CenzeroContext } from '../src/core/context';
import * as http from 'http';

describe('End-to-End Integration Tests', () => {
  let app: CenzeroApp;
  let server: http.Server;
  const testPort = 4000;

  beforeEach(() => {
    // Silence console output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach((done) => {
    jest.restoreAllMocks();
    if (server && server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  test('should create and run a basic server with plugins', (done) => {
    app = new CenzeroApp({ port: testPort });

    // Add plugins
    app.plugin(logger({ level: 'info' }));
    app.plugin(cors());

    // Add routes
    app.get('/', (ctx: CenzeroContext) => {
      return ctx.json({ message: 'Hello Cenzero!' });
    });

    app.get('/users/:id', (ctx: CenzeroContext) => {
      return ctx.json({ userId: ctx.params.id });
    });

    // Custom error handler
    app.onError((error: Error, ctx: CenzeroContext) => {
      return ctx.status(500).json({ error: error.message });
    });

    // Start server
    server = app.listen(testPort, 'localhost', () => {
      expect(server.listening).toBe(true);
      
      // Make a simple HTTP request to verify it's working
      const req = http.request({
        hostname: 'localhost',
        port: testPort,
        path: '/',
        method: 'GET'
      }, (res) => {
        expect(res.statusCode).toBe(200);
        done();
      });

      req.on('error', done);
      req.end();
    });
  });

  test('should handle context-based routing', (done) => {
    app = new CenzeroApp({ port: testPort + 1 });

    app.get('/api/test', (ctx: CenzeroContext) => {
      ctx.session.set('test', 'value');
      ctx.cookies.set('theme', 'dark');
      return ctx.json({ 
        success: true,
        session: ctx.session.get('test')
      });
    });

    server = app.listen(testPort + 1, 'localhost', () => {
      // Test that server starts without errors
      expect(server.listening).toBe(true);
      done();
    });
  });

  test('should handle legacy Express-style routing', (done) => {
    app = new CenzeroApp({ port: testPort + 2 });

    // Legacy Express-style handler
    app.get('/legacy', (req: any, res: any) => {
      res.json({ legacy: true });
    });

    server = app.listen(testPort + 2, 'localhost', () => {
      expect(server.listening).toBe(true);
      done();
    });
  });

  test('should handle middleware correctly', (done) => {
    app = new CenzeroApp({ port: testPort + 3 });

    let middlewareCalled = false;

    // Global middleware
    app.use((ctx: CenzeroContext, next: () => Promise<void>) => {
      middlewareCalled = true;
      return next();
    });

    app.get('/middleware-test', (ctx: CenzeroContext) => {
      return ctx.json({ middlewareCalled });
    });

    server = app.listen(testPort + 3, 'localhost', () => {
      expect(server.listening).toBe(true);
      done();
    });
  });
});
