import { Context } from '../src/core/context';
import { IncomingMessage, ServerResponse } from 'http';
import { CenzeroRequest, CenzeroResponse } from '../src/core/types';
import { mockConsole } from './setup';

describe('Context', () => {
  let req: CenzeroRequest;
  let res: CenzeroResponse;
  let ctx: Context;

  mockConsole();

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/test',
      headers: {},
      body: {},
      params: {},
      query: {},
      path: '/test'
    } as CenzeroRequest;

    res = {
      statusCode: 200,
      setHeader: jest.fn(),
      getHeader: jest.fn().mockReturnValue(undefined),
      writeHead: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
      json: jest.fn(),
      html: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as any as CenzeroResponse;

    ctx = new Context(req, res);
  });

  describe('Basic Properties', () => {
    test('should expose request and response', () => {
      expect(ctx.req).toBe(req);
      expect(ctx.res).toBe(res);
    });

    test('should have empty state initially', () => {
      expect(ctx.state).toEqual({});
    });

    test('should provide params access', () => {
      // Set params before creating context
      req.params = { id: '123' };
      const newCtx = new Context(req, res);
      expect(newCtx.params.id).toBe('123');
    });

    test('should provide query access', () => {
      // Set query before creating context
      req.query = { page: '1' };
      const newCtx = new Context(req, res);
      expect(newCtx.query.page).toBe('1');
    });

    test('should provide body access', () => {
      // Set body before creating context
      req.body = { name: 'test' };
      const newCtx = new Context(req, res);
      expect(newCtx.body.name).toBe('test');
    });
  });

  describe('Response Methods', () => {
    test('should call res.json for json response', () => {
      const data = { message: 'test' };
      ctx.json(data);
      expect(res.json).toHaveBeenCalledWith(data);
    });

    test('should call res.html for html response', () => {
      const html = '<h1>Test</h1>';
      ctx.html(html);
      expect(res.html).toHaveBeenCalledWith(html);
    });

    test('should call res.redirect for redirect', () => {
      ctx.redirect('/login');
      expect(res.redirect).toHaveBeenCalledWith('/login', 302);
    });

    test('should set status code', () => {
      ctx.status(404);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('Session Management', () => {
    test('should initialize session', () => {
      expect(ctx.session).toBeDefined();
    });

    test('should set and get session values', () => {
      ctx.session.set('user', { id: 1 });
      expect(ctx.session.get('user')).toEqual({ id: 1 });
    });

    test('should clear session', () => {
      ctx.session.set('user', { id: 1 });
      ctx.session.clear();
      expect(ctx.session.get('user')).toBeUndefined();
    });
  });

  describe('Cookie Management', () => {
    test('should initialize cookies', () => {
      expect(ctx.cookies).toBeDefined();
    });

    test('should set cookies', () => {
      ctx.cookies.set('theme', 'dark');
      // Verify cookie was set (implementation depends on cookie manager)
    });
  });

  describe('Error Creation', () => {
    test('should create HTTP error', () => {
      const error = ctx.createError(404, 'Not found') as any;
      expect(error.message).toBe('Not found');
      expect(error.status).toBe(404);
    });

    test('should create error with default message', () => {
      const error = ctx.createError(500) as any;
      expect(error.status).toBe(500);
      expect(error.message).toBeDefined();
    });
  });

  describe('State Management', () => {
    test('should allow setting state properties', () => {
      ctx.state.user = { id: 1 };
      expect(ctx.state.user).toEqual({ id: 1 });
    });

    test('should persist state across access', () => {
      ctx.state.count = 1;
      ctx.state.count++;
      expect(ctx.state.count).toBe(2);
    });
  });
});
