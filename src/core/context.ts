import { IncomingMessage, ServerResponse } from 'http';
import { CenzeroRequest, CenzeroResponse } from './types';
import { Session, SessionOptions } from './session';
import { Cookies } from './cookies';

// Custom context utilities - karena gw suka yang practical
const ContextUtils = {
  // Request ID generator - simple tapi berguna buat tracing
  generateRequestId: (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `req_${timestamp}_${random}`;
  },
  
  // Helper buat detect content type dari request
  getContentType: (headers: Record<string, any>): string => {
    const contentType = headers['content-type'] || headers['Content-Type'];
    return Array.isArray(contentType) ? contentType[0] : contentType || 'unknown';
  },
  
  // Random tips - karena debugging context bisa confusing
  getContextTip: (): string => {
    const tips = [
      "💡 Use ctx.state to pass data between middlewares",
      "🔍 ctx.assert() is great for input validation",
      "📝 ctx.headers gives you all request headers",
      "Context pattern bikin code lebih clean daripada req/res terpisah"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }
};

// Main context interface - ini yang bakal dipake developer
// Design philosophy: everything you need in one place
export interface CenzeroContext {
  // Core request/response - yang essential
  req: CenzeroRequest;
  res: CenzeroResponse;
  
  // Request properties yang udah di-parse  
  params: Record<string, string>; // Route parameters
  query: Record<string, any>; // Query string parameters
  body: any; // Parsed request body
  headers: Record<string, string | string[]>; // Request headers
  method: string; // HTTP method
  path: string; // Request path (clean)
  url: string; // Full URL
  
  // Advanced features
  session: Session; // Session management
  cookies: Cookies; // Cookie handling
  requestId: string; // Unique request identifier
  
  // State management - super handy buat middleware communication
  state: Record<string, any>;
  
  // Response methods - convenience wrappers
  json(data: any): void;
  html(content: string): void;
  text(content: string): void;
  redirect(url: string, statusCode?: number): void;
  status(code: number): CenzeroContext;
  send(data: any): void;
  
  // Header utilities
  set(field: string, value: string): void;
  get(field: string): string | undefined;
  
  // Error handling helpers - yang sering gw pake
  throw(status: number, message?: string): never;
  assert(condition: any, status: number, message?: string): asserts condition;
  createError(status: number, message?: string): Error;
}

export class Context implements CenzeroContext {
  req: CenzeroRequest;
  res: CenzeroResponse;
  params: Record<string, string> = {};
  query: Record<string, any> = {};
  body: any;
  headers: Record<string, string | string[]>;
  method: string;
  path: string;
  url: string;
  session: Session;
  cookies: Cookies;
  requestId: string; // Add the missing property
  state: Record<string, any> = {}; // NOTE: super useful buat middleware communication

  constructor(req: CenzeroRequest, res: CenzeroResponse, sessionOptions?: SessionOptions) {
    this.req = req;
    this.res = res;
    this.method = req.method || 'GET';
    this.path = req.path || '/';
    this.url = req.url || '/';
    this.headers = req.headers as Record<string, string | string[]>;
    this.params = req.params || {};
    this.query = req.query || {};
    this.body = req.body;
    
    // Generate unique request ID - helpful buat debugging
    this.requestId = ContextUtils.generateRequestId();
    
    // Initialize session and cookies - order matters di sini
    this.cookies = new Cookies(req, res);
    this.session = new Session(this.cookies, sessionOptions);
    
    // Random dev tip kalo lagi development
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) { // 5% chance
      console.log(`💡 [${this.requestId}] ${ContextUtils.getContextTip()}`);
    }
  }

  // Response methods - keeping simple tapi powerful
  json(data: any): void {
    // Log di development buat debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 [${this.requestId}] JSON Response:`, typeof data === 'object' ? Object.keys(data) : data);
    }
    this.res.json(data);
  }

  html(content: string): void {
    this.res.html(content);
  }

  text(content: string): void {
    this.res.setHeader('Content-Type', 'text/plain');
    this.res.end(content);
  }

  redirect(url: string, statusCode: number = 302): void {
    // Log redirects - sometimes helpful buat debug flow
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔀 [${this.requestId}] Redirecting to: ${url} (${statusCode})`);
    }
    this.res.redirect(url, statusCode);
  }

  status(code: number): CenzeroContext {
    this.res.status(code);
    return this; // Chainable - ctx.status(200).json({...})
  }

  send(data: any): void {
    this.res.send(data);
  }

  // Header utility methods
  set(field: string, value: string): void {
    this.res.setHeader(field, value);
  }

  get(field: string): string | undefined {
    const header = this.req.headers[field.toLowerCase()];
    return Array.isArray(header) ? header[0] : header;
  }

  // Error handling utilities - ini yang bikin development life easier
  throw(status: number, message?: string): never {
    const err = new Error(message || `HTTP ${status} Error`) as any;
    err.status = status;
    err.statusCode = status;
    err.requestId = this.requestId; // Include request ID for tracking
    throw err;
  }

  assert(condition: any, status: number, message?: string): asserts condition {
    if (!condition) {
      this.throw(status, message);
    }
  }

  createError(status: number, message?: string): Error {
    const err = new Error(message || `HTTP ${status} Error`) as any;
    err.status = status;
    err.statusCode = status;
    err.requestId = this.requestId;
    return err;
  }

  // Bonus utility methods - personal additions yang sering gw pake
  
  // Check if request is AJAX/API call
  get isAjax(): boolean {
    const xhr = this.get('x-requested-with');
    const accept = this.get('accept') || '';
    return xhr === 'XMLHttpRequest' || accept.includes('application/json');
  }
  
  // Get user agent info - sometimes useful
  get userAgent(): string {
    return this.get('user-agent') || 'unknown';
  }
  
  // Get client IP with better detection
  get clientIP(): string {
    const forwarded = this.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return this.get('x-real-ip') || this.req.connection?.remoteAddress || 'unknown';
  }
}
