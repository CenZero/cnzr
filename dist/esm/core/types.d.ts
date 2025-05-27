import { IncomingMessage, ServerResponse } from 'http';
export interface CenzeroRequest extends IncomingMessage {
    params?: Record<string, string>;
    query?: Record<string, string>;
    body?: any;
    path?: string;
    method?: string;
    url?: string;
}
export interface CenzeroResponse extends ServerResponse {
    json(data: any): void;
    html(content: string): void;
    redirect(url: string, statusCode?: number): void;
    status(code: number): CenzeroResponse;
    send(data: any): void;
}
export type MiddlewareFunction = (req: CenzeroRequest, res: CenzeroResponse, next: () => void) => void | Promise<void>;
export type ContextMiddlewareFunction = (ctx: import('./context').CenzeroContext, next: () => Promise<void>) => void | Promise<void>;
export type RouteHandler = (req: CenzeroRequest, res: CenzeroResponse) => void | Promise<void>;
export type ContextRouteHandler = (ctx: import('./context').CenzeroContext) => void | Promise<void>;
export interface Route {
    method: string;
    path: string;
    handler: RouteHandler | ContextRouteHandler;
    middlewares: (MiddlewareFunction | ContextMiddlewareFunction)[];
    useContext?: boolean;
}
export interface RouterOptions {
    prefix?: string;
}
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
export type Handler = RouteHandler;
export type ContextHandler = ContextRouteHandler;
export interface CenzeroOptions {
    port?: number;
    host?: string;
    staticDir?: string;
    viewEngine?: string;
    viewsDir?: string;
    useContext?: boolean;
    useFileRouting?: boolean;
    routesDir?: string;
    debug?: boolean;
}
//# sourceMappingURL=types.d.ts.map