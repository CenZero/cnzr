import { CenzeroContext } from './context';

export interface CorsOptions {
  origin?: string | string[] | boolean | ((ctx: CenzeroContext) => string | boolean);
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

export class CorsMiddleware {
  private options: CorsOptions;

  constructor(options: CorsOptions = {}) {
    this.options = {
      origin: options.origin !== undefined ? options.origin : '*',
      methods: options.methods || ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      allowedHeaders: options.allowedHeaders,
      exposedHeaders: options.exposedHeaders,
      credentials: options.credentials || false,
      maxAge: options.maxAge,
      preflightContinue: options.preflightContinue || false,
      optionsSuccessStatus: options.optionsSuccessStatus || 204
    };
  }

  private resolveOrigin(ctx: CenzeroContext): string | false {
    const { origin } = this.options;
    const requestOrigin = ctx.get('origin');

    if (typeof origin === 'boolean') {
      return origin ? (requestOrigin || '*') : false;
    }

    if (typeof origin === 'string') {
      return origin;
    }

    if (typeof origin === 'function') {
      const result = origin(ctx);
      return typeof result === 'boolean' ? (result ? (requestOrigin || '*') : false) : result;
    }

    if (Array.isArray(origin)) {
      if (requestOrigin && origin.includes(requestOrigin)) {
        return requestOrigin;
      }
      return false;
    }

    return '*';
  }

  private configureOrigin(ctx: CenzeroContext): void {
    const origin = this.resolveOrigin(ctx);
    if (origin !== false) {
      ctx.set('Access-Control-Allow-Origin', origin);
    }

    if (this.options.credentials) {
      ctx.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  private configureMethods(ctx: CenzeroContext): void {
    const methods = Array.isArray(this.options.methods) 
      ? this.options.methods.join(',')
      : this.options.methods as string;
    
    ctx.set('Access-Control-Allow-Methods', methods);
  }

  private configureAllowedHeaders(ctx: CenzeroContext): void {
    let headers = this.options.allowedHeaders;

    if (!headers) {
      // If no allowed headers specified, reflect the request headers
      const requestHeaders = ctx.get('access-control-request-headers');
      if (requestHeaders) {
        headers = requestHeaders;
      }
    }

    if (headers) {
      const headerList = Array.isArray(headers) ? headers.join(',') : headers;
      ctx.set('Access-Control-Allow-Headers', headerList);
    }
  }

  private configureExposedHeaders(ctx: CenzeroContext): void {
    if (this.options.exposedHeaders) {
      const headers = Array.isArray(this.options.exposedHeaders)
        ? this.options.exposedHeaders.join(',')
        : this.options.exposedHeaders;
      
      ctx.set('Access-Control-Expose-Headers', headers);
    }
  }

  private configureMaxAge(ctx: CenzeroContext): void {
    if (this.options.maxAge !== undefined) {
      ctx.set('Access-Control-Max-Age', this.options.maxAge.toString());
    }
  }

  middleware() {
    return async (ctx: CenzeroContext, next: () => Promise<void>) => {
      // Configure CORS headers
      this.configureOrigin(ctx);
      this.configureExposedHeaders(ctx);

      // Handle preflight requests
      if (ctx.method === 'OPTIONS') {
        this.configureMethods(ctx);
        this.configureAllowedHeaders(ctx);
        this.configureMaxAge(ctx);

        if (!this.options.preflightContinue) {
          ctx.status(this.options.optionsSuccessStatus || 204);
          ctx.res.end();
          return;
        }
      }

      await next();
    };
  }

  // Static factory method
  static create(options?: CorsOptions): CorsMiddleware {
    return new CorsMiddleware(options);
  }
}

// Convenience function for quick CORS setup
export function cors(options?: CorsOptions) {
  return new CorsMiddleware(options).middleware();
}
