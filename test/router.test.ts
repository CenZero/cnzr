import { Router } from '../src/core/router';
import { CenzeroRequest, CenzeroResponse } from '../src/core/types';
import { mockConsole } from './setup';

describe('Router', () => {
  let router: Router;
  let mockReq: CenzeroRequest;
  let mockRes: CenzeroResponse;

  mockConsole();

  beforeEach(() => {
    router = new Router();
    
    mockReq = {
      method: 'GET',
      url: '/test',
      headers: {},
      body: {},
      params: {},
      query: {},
      path: '/test'
    } as CenzeroRequest;

    mockRes = {
      statusCode: 200,
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
      json: jest.fn(),
      html: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as any as CenzeroResponse;
  });

  describe('Route Registration', () => {
    test('should register GET route', () => {
      const handler = jest.fn();
      router.get('/users', handler);

      const routes = router.getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe('GET');
      expect(routes[0].path).toBe('/users');
      expect(routes[0].handler).toBe(handler);
    });

    test('should register POST route', () => {
      const handler = jest.fn();
      router.post('/users', handler);

      const routes = router.getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe('POST');
      expect(routes[0].path).toBe('/users');
    });

    test('should register PUT route', () => {
      const handler = jest.fn();
      router.put('/users/:id', handler);

      const routes = router.getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe('PUT');
      expect(routes[0].path).toBe('/users/:id');
    });

    test('should register DELETE route', () => {
      const handler = jest.fn();
      router.delete('/users/:id', handler);

      const routes = router.getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe('DELETE');
      expect(routes[0].path).toBe('/users/:id');
    });

    test('should register middleware with routes', () => {
      const middleware = jest.fn();
      const handler = jest.fn();
      router.get('/protected', middleware, handler);

      const routes = router.getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0].middlewares).toHaveLength(1);
      expect(routes[0].middlewares[0]).toBe(middleware);
      expect(routes[0].handler).toBe(handler);
    });

    test('should register global middleware', () => {
      const middleware = jest.fn();
      router.use(middleware);

      const routes = router.getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe('*');
      expect(routes[0].path).toBe('*');
    });

    test('should register path-specific middleware', () => {
      const middleware = jest.fn();
      router.use('/api', middleware);

      const routes = router.getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe('*');
      expect(routes[0].path).toBe('/api');
    });
  });

  describe('Route Matching', () => {
    test('should match exact path', () => {
      const handler = jest.fn();
      router.get('/users', handler);

      const result = router.matchRoute('GET', '/users');
      expect(result).toBeTruthy();
      expect(result?.route.handler).toBe(handler);
    });

    test('should match route with parameters', () => {
      const handler = jest.fn();
      router.get('/users/:id', handler);

      const result = router.matchRoute('GET', '/users/123');
      expect(result).toBeTruthy();
      expect(result?.params).toEqual({ id: '123' });
    });

    test('should match route with multiple parameters', () => {
      const handler = jest.fn();
      router.get('/users/:userId/posts/:postId', handler);

      const result = router.matchRoute('GET', '/users/123/posts/456');
      expect(result).toBeTruthy();
      expect(result?.params).toEqual({ userId: '123', postId: '456' });
    });

    test('should not match different method', () => {
      const handler = jest.fn();
      router.get('/users', handler);

      const result = router.matchRoute('POST', '/users');
      expect(result).toBeNull();
    });

    test('should not match different path', () => {
      const handler = jest.fn();
      router.get('/users', handler);

      const result = router.matchRoute('GET', '/posts');
      expect(result).toBeNull();
    });

    test('should return null for non-matching parameter route', () => {
      const handler = jest.fn();
      router.get('/users/:id', handler);

      const result = router.matchRoute('GET', '/users');
      expect(result).toBeNull();
    });

    test('should handle URL decoding in parameters', () => {
      const handler = jest.fn();
      router.get('/search/:query', handler);

      const result = router.matchRoute('GET', '/search/hello%20world');
      expect(result).toBeTruthy();
      expect(result?.params).toEqual({ query: 'hello world' });
    });

    test('should match wildcard routes', () => {
      const middleware = jest.fn();
      router.use(middleware);

      const result = router.matchRoute('GET', '/any/path');
      expect(result).toBeTruthy();
      expect(result?.route.method).toBe('*');
      expect(result?.route.path).toBe('*');
    });
  });

  describe('Router with Prefix', () => {
    test('should apply prefix to routes', () => {
      const prefixedRouter = new Router('/api');
      const handler = jest.fn();
      prefixedRouter.get('/users', handler);

      const routes = prefixedRouter.getRoutes();
      expect(routes[0].path).toBe('/api/users');
    });

    test('should match prefixed routes', () => {
      const prefixedRouter = new Router('/api');
      const handler = jest.fn();
      prefixedRouter.get('/users', handler);

      const result = prefixedRouter.matchRoute('GET', '/api/users');
      expect(result).toBeTruthy();
      expect(result?.route.handler).toBe(handler);
    });
  });
});
