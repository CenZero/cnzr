"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRouter = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
class FileRouter {
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
            const dirEntries = await (0, promises_1.readdir)(dirPath);
            for (const entry of dirEntries) {
                const fullPath = (0, path_1.join)(dirPath, entry);
                const fileStats = await (0, promises_1.stat)(fullPath);
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
        const fileExt = (0, path_1.extname)(filename);
        return [".js", ".ts"].includes(fileExt) && !filename.startsWith("_");
    }
    /**
     * Process individual route file
     * Handles both named exports (get, post, etc) and default exports
     */
    async processRouteFile(filePath, routePrefix) {
        try {
            const routeModule = await Promise.resolve(`${filePath}`).then(s => __importStar(require(s)));
            const relativeFilename = (0, path_1.relative)(this.baseRoutesDir, filePath);
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
exports.FileRouter = FileRouter;
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