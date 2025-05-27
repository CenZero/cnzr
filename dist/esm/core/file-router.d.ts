import { CenzeroApp } from "./server";
import { Handler, ContextHandler, HTTPMethod } from "./types";
interface RouteInfo {
    pattern: string;
    filePath: string;
    method: HTTPMethod;
    isDynamic: boolean;
    handler: Handler | ContextHandler;
}
export declare class FileRouter {
    private discoveredRoutes;
    private appInstance;
    private baseRoutesDir;
    constructor(app: CenzeroApp, routesDir?: string);
    /**
     * Scan and register file-based routes
     * NOTE: This is pretty handy for Next.js style routing
     */
    scanAndRegister(): Promise<void>;
    /**
     * Recursively scan directory for route files
     * TODO: Maybe add some file watching later for hot reload
     */
    private scanDirectory;
    /**
     * Check if file is a valid route file
     * NOTE: Files starting with _ are ignored (like Next.js)
     */
    private isValidRouteFile;
    /**
     * Process individual route file
     * Handles both named exports (get, post, etc) and default exports
     */
    private processRouteFile;
    /**
     * Convert file path to Express-style route pattern
     * This logic is inspired by Next.js file-based routing
     */
    private filePathToRoutePattern;
    /**
     * Register all discovered routes with the app
     * NOTE: Order matters here - static routes should be checked before dynamic ones
     */
    private registerRoutes;
    /**
     * Get registered routes info - useful for debugging
     */
    getRoutes(): RouteInfo[];
}
export {};
/**
 * Example file structure and resulting routes:
 * Pretty cool how this maps files to routes automatically
 *
 * routes/
 * ├── index.ts           → GET /
 * ├── about.ts           → GET /about
 * ├── users/
 * │   ├── index.ts       → GET /users
 * │   ├── [id].ts        → GET /users/:id
 * │   └── [...slug].ts   → GET /users/*slug
 * └── api/
 *     ├── auth.ts        → GET /api/auth
 *     └── users/
 *         └── [id].ts    → GET /api/users/:id
 *
 * TODO: Maybe add support for middleware files (_middleware.ts)?
 */
//# sourceMappingURL=file-router.d.ts.map