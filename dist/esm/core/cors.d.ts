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
export declare class CorsMiddleware {
    private options;
    constructor(options?: CorsOptions);
    private resolveOrigin;
    private configureOrigin;
    private configureMethods;
    private configureAllowedHeaders;
    private configureExposedHeaders;
    private configureMaxAge;
    middleware(): (ctx: CenzeroContext, next: () => Promise<void>) => Promise<void>;
    static create(options?: CorsOptions): CorsMiddleware;
}
export declare function cors(options?: CorsOptions): (ctx: CenzeroContext, next: () => Promise<void>) => Promise<void>;
//# sourceMappingURL=cors.d.ts.map