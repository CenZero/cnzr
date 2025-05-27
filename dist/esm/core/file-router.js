import { readdir, stat } from "fs/promises";
import { join, extname, relative } from "path";
export class FileRouter {
    constructor(app, routesDir = "routes") {
        this.discoveredRoutes = [];
        this.appInstance = app;
        this.baseRoutesDir = routesDir;
    }
    /**
     * Scan and register file-based routes
     * NOTE: This is pretty handy for Next.js style routing
     */
    async scanAndRegister() {
        try {
            await this.scanDirectory(this.baseRoutesDir);
            this.registerRoutes();
            console.log(`📁 File-based routing: ${this.discoveredRoutes.length} routes registered`);
        }
        catch (err) {
            console.warn("⚠️  File-based routing not available:", err instanceof Error ? err.message : "Unknown error");
        }
    }
    /**
     * Recursively scan directory for route files
     * TODO: Maybe add some file watching later for hot reload
     */
    async scanDirectory(dirPath, routePrefix = "") {
        try {
            const dirEntries = await readdir(dirPath);
            for (const entry of dirEntries) {
                const fullPath = join(dirPath, entry);
                const fileStats = await stat(fullPath);
                if (fileStats.isDirectory()) {
                    // Recursively scan subdirectories - supports nested routes
                    await this.scanDirectory(fullPath, `${routePrefix}/${entry}`);
                }
                else if (fileStats.isFile() && this.isValidRouteFile(entry)) {
                    await this.processRouteFile(fullPath, routePrefix);
                }
            }
        }
        catch (err) {
            // Directory doesn't exist or can't be read
            throw new Error(`Cannot scan routes directory: ${dirPath}`);
        }
    }
    /**
     * Check if file is a valid route file
     * NOTE: Files starting with _ are ignored (like Next.js)
     */
    isValidRouteFile(filename) {
        const fileExt = extname(filename);
        return [".js", ".ts"].includes(fileExt) && !filename.startsWith("_");
    }
    /**
     * Process individual route file
     * Handles both named exports (get, post, etc) and default exports
     */
    async processRouteFile(filePath, routePrefix) {
        try {
            const routeModule = await import(filePath);
            const relativeFilename = relative(this.baseRoutesDir, filePath);
            const routePattern = this.filePathToRoutePattern(relativeFilename, routePrefix);
            // Check for HTTP method handlers - pretty standard pattern
            const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
            for (const method of httpMethods) {
                const methodHandler = routeModule[method.toLowerCase()] || routeModule[method];
                if (methodHandler && typeof methodHandler === "function") {
                    this.discoveredRoutes.push({
                        pattern: routePattern,
                        filePath,
                        method,
                        isDynamic: routePattern.includes(":"),
                        handler: methodHandler
                    });
                }
            }
            // Default export handler (assumes GET) - common in simple cases
            if (routeModule.default && typeof routeModule.default === "function") {
                this.discoveredRoutes.push({
                    pattern: routePattern,
                    filePath,
                    method: "GET",
                    isDynamic: routePattern.includes(":"),
                    handler: routeModule.default
                });
            }
        }
        catch (err) {
            console.warn(`⚠️  Failed to load route file ${filePath}:`, err instanceof Error ? err.message : "Unknown error");
        }
    }
    /**
     * Convert file path to Express-style route pattern
     * This logic is inspired by Next.js file-based routing
     */
    filePathToRoutePattern(filename, routePrefix) {
        // Remove file extension first
        let routePattern = filename.replace(/\.(js|ts)$/, "");
        // Handle index files - they become the parent route
        if (routePattern.endsWith("/index") || routePattern === "index") {
            routePattern = routePattern.replace(/\/index$/, "") || "/";
        }
        // Convert [param] to :param - dynamic segments
        routePattern = routePattern.replace(/\[([^\]]+)\]/g, ":$1");
        // Convert [...param] to *param - catch-all routes (not sure if we need this)
        routePattern = routePattern.replace(/\[\.\.\.([^\]]+)\]/g, "*$1");
        // Add prefix if we have one
        if (routePrefix) {
            routePattern = `${routePrefix}${routePattern === "/" ? "" : routePattern}`;
        }
        // Make sure it starts with /
        if (!routePattern.startsWith("/")) {
            routePattern = `/${routePattern}`;
        }
        return routePattern;
    }
    /**
     * Register all discovered routes with the app
     * NOTE: Order matters here - static routes should be checked before dynamic ones
     */
    registerRoutes() {
        // Sort routes: static routes first, then dynamic, catch-all last
        this.discoveredRoutes.sort((routeA, routeB) => {
            if (routeA.pattern.includes("*") && !routeB.pattern.includes("*"))
                return 1;
            if (!routeA.pattern.includes("*") && routeB.pattern.includes("*"))
                return -1;
            if (routeA.isDynamic && !routeB.isDynamic)
                return 1;
            if (!routeA.isDynamic && routeB.isDynamic)
                return -1;
            return routeA.pattern.localeCompare(routeB.pattern);
        });
        for (const discoveredRoute of this.discoveredRoutes) {
            const httpMethod = discoveredRoute.method.toLowerCase();
            this.appInstance[httpMethod](discoveredRoute.pattern, discoveredRoute.handler);
        }
    }
    /**
     * Get registered routes info - useful for debugging
     */
    getRoutes() {
        return [...this.discoveredRoutes];
    }
}
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
//# sourceMappingURL=file-router.js.map