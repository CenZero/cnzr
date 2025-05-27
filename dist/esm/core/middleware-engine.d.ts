import { CenzeroContext } from './context';
import { ContextMiddlewareFunction, ContextRouteHandler } from './types';
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
    path?: string;
    method?: string;
    name?: string;
}
/**
 * Modern async middleware engine untuk Cenzero framework
 * Design philosophy: simple, fast, debuggable
 *
 * NOTE: Ini jantungnya middleware system - jangan diutak-atik sembarangan!
 * Udah ditest dengan berbagai edge cases
 */
export declare class MiddlewareEngine {
    private myGlobalStack;
    private routeSpecificStacks;
    private executionStats;
    constructor();
    /**
     * Register global middleware yang jalan untuk semua routes
     * Support both app.use(middleware) dan app.use('/path', middleware)
     */
    use(middleware: ModernMiddlewareFunction): void;
    use(path: string, middleware: ModernMiddlewareFunction): void;
    /**
     * Register middleware untuk route tertentu
     * Lebih specific daripada global middleware
     */
    useForRoute(method: string, path: string, middleware: ModernMiddlewareFunction): void;
    /**
     * Execute middleware stack for a given context and handler
     * @param ctx - Cenzero context
     * @param handler - Final route handler
     */
    execute(ctx: CenzeroContext, handler: ModernRouteHandler): Promise<void>;
    /**
     * Collect semua middlewares yang applicable untuk request
     * Enhanced dengan performance tracking dan debug info
     */
    private collectMiddlewares;
    /**
     * Check if middleware is applicable for current request
     * @param middleware - Middleware context
     * @param ctx - Cenzero context
     * @returns Boolean indicating if middleware should run
     */
    private isMiddlewareApplicable;
    /**
     * Execute middleware chain recursively with proper async/await handling
     * @param middlewares - Array of middleware functions
     * @param ctx - Cenzero context
     * @param index - Current middleware index
     */
    private executeChain;
    /**
     * Handle errors that occur during middleware execution
     * @param error - Error that occurred
     * @param ctx - Cenzero context
     */
    private handleMiddlewareError;
    /**
     * Get semua registered middlewares - berguna buat debugging/testing
     * Enhanced dengan stats tracking
     */
    getMiddlewares(): {
        global: MiddlewareContext[];
        routes: Map<string, MiddlewareContext[]>;
        stats: Map<string, number>;
    };
    /**
     * Clear semua registered middlewares - useful buat testing
     * Reset stats juga
     */
    clear(): void;
    /**
     * Get performance stats - personal addition buat monitoring
     */
    getPerformanceStats(): {
        totalExecutions: number;
        averageTime: number;
    };
}
export declare function createMiddlewareEngine(): MiddlewareEngine;
export type { CenzeroContext };
//# sourceMappingURL=middleware-engine.d.ts.map