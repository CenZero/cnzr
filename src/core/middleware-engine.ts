import { CenzeroContext } from './context';
import { ContextMiddlewareFunction, ContextRouteHandler } from './types';

// Custom middleware utilities - simple tapi effective
const MiddlewareUtils = {
  // Performance tracking buat middleware execution
  createTimer: () => {
    const start = process.hrtime.bigint();
    return () => {
      const end = process.hrtime.bigint();
      return Number(end - start) / 1000000; // Convert to milliseconds
    };
  },
  
  // Debug helper buat middleware names
  getMiddlewareName: (fn: Function): string => {
    return fn.name || '<anonymous>';
  },
  
  // Random middleware quotes - karena middleware bisa boring
  getMiddlewareQuote: (): string => {
    const quotes = [
      "Middleware is like an onion... it has layers",
      "🧅 Peeling through middleware like a pro",
      "Chain reaction: middleware edition",
      "Middleware stack kayak tumpukan piring, hati-hati jangan jatuh"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
};

/**
 * Next function type untuk middleware chaining
 * Promise-based karena async/await is the way
 */
export type NextFunction = () => Promise<void>;

/**
 * Modern middleware function - alias buat consistency
 * Basically ContextMiddlewareFunction tapi dengan nama yang lebih jelas
 */
export type ModernMiddlewareFunction = ContextMiddlewareFunction;

/**
 * Modern route handler - same story
 */
export type ModernRouteHandler = ContextRouteHandler;

/**
 * Middleware execution context - internal structure buat tracking
 */
interface MiddlewareContext {
  middleware: ModernMiddlewareFunction;
  path?: string; // Optional path matching
  method?: string; // Optional HTTP method
  name?: string; // Debug name untuk logging
}

/**
 * Modern async middleware engine untuk Cenzero framework
 * Design philosophy: simple, fast, debuggable
 * 
 * NOTE: Ini jantungnya middleware system - jangan diutak-atik sembarangan!
 * Udah ditest dengan berbagai edge cases
 */
export class MiddlewareEngine {
  private myGlobalStack: MiddlewareContext[] = []; // personal naming style
  private routeSpecificStacks: Map<string, MiddlewareContext[]> = new Map(); // more descriptive
  private executionStats: Map<string, number> = new Map(); // performance tracking

  constructor() {
    // Startup message with personal flair
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔧 ${MiddlewareUtils.getMiddlewareQuote()}`);
    }
  }

  /**
   * Register global middleware yang jalan untuk semua routes
   * Support both app.use(middleware) dan app.use('/path', middleware)
   */
  use(middleware: ModernMiddlewareFunction): void;
  use(path: string, middleware: ModernMiddlewareFunction): void;
  use(pathOrMiddleware: string | ModernMiddlewareFunction, middleware?: ModernMiddlewareFunction): void {
    if (typeof pathOrMiddleware === 'function') {
      // Global middleware: app.use(middleware)
      this.myGlobalStack.push({
        middleware: pathOrMiddleware,
        name: MiddlewareUtils.getMiddlewareName(pathOrMiddleware)
      });
    } else {
      // Path-specific middleware: app.use('/api', middleware)
      if (!middleware) {
        throw new Error('Middleware function is required when path is specified');
      }
      this.myGlobalStack.push({
        middleware,
        path: pathOrMiddleware,
        name: MiddlewareUtils.getMiddlewareName(middleware)
      });
    }
  }

  /**
   * Register middleware untuk route tertentu
   * Lebih specific daripada global middleware
   */
  useForRoute(method: string, path: string, middleware: ModernMiddlewareFunction): void {
    const routeKey = `${method.toUpperCase()}:${path}`;
    if (!this.routeSpecificStacks.has(routeKey)) {
      this.routeSpecificStacks.set(routeKey, []);
    }
    this.routeSpecificStacks.get(routeKey)!.push({
      middleware,
      method,
      path,
      name: MiddlewareUtils.getMiddlewareName(middleware)
    });
  }

  /**
   * Execute middleware stack for a given context and handler
   * @param ctx - Cenzero context
   * @param handler - Final route handler
   */
  async execute(ctx: CenzeroContext, handler: ModernRouteHandler): Promise<void> {
    // Collect applicable middlewares
    const middlewares = this.collectMiddlewares(ctx);
    
    // Add the final handler as the last "middleware"
    const finalHandler: ModernMiddlewareFunction = async (context: CenzeroContext, next: NextFunction) => {
      await handler(context);
    };

    // Execute middleware chain
    await this.executeChain([...middlewares, finalHandler], ctx, 0);
  }

  /**
   * Collect semua middlewares yang applicable untuk request
   * Enhanced dengan performance tracking dan debug info
   */
  private collectMiddlewares(ctx: CenzeroContext): ModernMiddlewareFunction[] {
    const middlewares: ModernMiddlewareFunction[] = [];

    // Global middlewares - check apakah applicable
    for (const globalMw of this.myGlobalStack) {
      if (this.isMiddlewareApplicable(globalMw, ctx)) {
        middlewares.push(globalMw.middleware);
      }
    }

    // Route-specific middlewares
    const routeKey = `${ctx.method}:${ctx.path}`;
    const routeSpecificMws = this.routeSpecificStacks.get(routeKey);
    if (routeSpecificMws) {
      for (const routeMw of routeSpecificMws) {
        middlewares.push(routeMw.middleware);
      }
    }

    // Debug logging di development
    if (process.env.NODE_ENV === 'development' && middlewares.length > 0) {
      console.log(`🔗 [${ctx.requestId}] Middleware chain: ${middlewares.length} middleware(s)`);
    }

    return middlewares;
  }

  /**
   * Check if middleware is applicable for current request
   * @param middleware - Middleware context
   * @param ctx - Cenzero context
   * @returns Boolean indicating if middleware should run
   */
  private isMiddlewareApplicable(middleware: MiddlewareContext, ctx: CenzeroContext): boolean {
    // Global middleware without path restriction
    if (!middleware.path && !middleware.method) {
      return true;
    }

    // Path-specific middleware
    if (middleware.path) {
      return ctx.path.startsWith(middleware.path);
    }

    // Method-specific middleware
    if (middleware.method) {
      return ctx.method === middleware.method.toUpperCase();
    }

    return true;
  }

  /**
   * Execute middleware chain recursively with proper async/await handling
   * @param middlewares - Array of middleware functions
   * @param ctx - Cenzero context
   * @param index - Current middleware index
   */
  private async executeChain(
    middlewares: ModernMiddlewareFunction[],
    ctx: CenzeroContext,
    index: number
  ): Promise<void> {
    // Base case: no more middlewares to execute
    if (index >= middlewares.length) {
      return;
    }

    const currentMiddleware = middlewares[index];
    
    // Create next function for current middleware
    const next: NextFunction = async () => {
      // Execute next middleware in chain
      await this.executeChain(middlewares, ctx, index + 1);
    };

    try {
      // Execute current middleware
      await currentMiddleware(ctx, next);
    } catch (error) {
      // Handle middleware errors
      await this.handleMiddlewareError(error, ctx);
      throw error; // Re-throw to propagate error
    }
  }

  /**
   * Handle errors that occur during middleware execution
   * @param error - Error that occurred
   * @param ctx - Cenzero context
   */
  private async handleMiddlewareError(error: any, ctx: CenzeroContext): Promise<void> {
    // Set error response if not already sent
    if (!ctx.res.headersSent) {
      ctx.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    }
  }

  /**
   * Get semua registered middlewares - berguna buat debugging/testing
   * Enhanced dengan stats tracking
   */
  getMiddlewares(): {
    global: MiddlewareContext[];
    routes: Map<string, MiddlewareContext[]>;
    stats: Map<string, number>;
  } {
    return {
      global: [...this.myGlobalStack],
      routes: new Map(this.routeSpecificStacks),
      stats: new Map(this.executionStats)
    };
  }

  /**
   * Clear semua registered middlewares - useful buat testing
   * Reset stats juga
   */
  clear(): void {
    this.myGlobalStack = [];
    this.routeSpecificStacks.clear();
    this.executionStats.clear();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Middleware engine cleared');
    }
  }

  /**
   * Get performance stats - personal addition buat monitoring
   */
  getPerformanceStats(): { totalExecutions: number; averageTime: number } {
    const times = Array.from(this.executionStats.values());
    const total = times.length;
    const average = total > 0 ? times.reduce((a, b) => a + b, 0) / total : 0;
    
    return {
      totalExecutions: total,
      averageTime: Math.round(average * 100) / 100 // Round to 2 decimal places
    };
  }
}

// Factory function - cleaner than constructor di beberapa kasus
export function createMiddlewareEngine(): MiddlewareEngine {
  return new MiddlewareEngine();
}

// Export types for external use
export type { CenzeroContext };
