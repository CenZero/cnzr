import { Route, RouteHandler, ContextRouteHandler, MiddlewareFunction, ContextMiddlewareFunction } from "./types";
export declare class Router {
    private routeList;
    private routePrefix;
    constructor(prefix?: string);
    get(path: string, ...handlers: (RouteHandler | ContextRouteHandler | MiddlewareFunction | ContextMiddlewareFunction)[]): void;
    post(path: string, ...handlers: (RouteHandler | ContextRouteHandler | MiddlewareFunction | ContextMiddlewareFunction)[]): void;
    put(path: string, ...handlers: (RouteHandler | ContextRouteHandler | MiddlewareFunction | ContextMiddlewareFunction)[]): void;
    delete(path: string, ...handlers: (RouteHandler | ContextRouteHandler | MiddlewareFunction | ContextMiddlewareFunction)[]): void;
    use(pathOrHandler: string | MiddlewareFunction | ContextMiddlewareFunction, handler?: MiddlewareFunction | ContextMiddlewareFunction): void;
    private addRoute;
    private isContextHandler;
    private isContextMiddleware;
    getRoutes(): Route[];
    matchRoute(httpMethod: string, requestPath: string): {
        route: Route;
        params: Record<string, string>;
    } | null;
    private matchPath;
}
//# sourceMappingURL=router.d.ts.map