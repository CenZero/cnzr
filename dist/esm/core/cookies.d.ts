import { IncomingMessage, ServerResponse } from 'http';
export interface CookieOptions {
    maxAge?: number;
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
}
export declare class Cookies {
    private req;
    private res;
    private parsed;
    constructor(req: IncomingMessage, res: ServerResponse);
    private parseCookies;
    get(name: string): string | undefined;
    set(name: string, value: string, options?: CookieOptions): void;
    delete(name: string, options?: Omit<CookieOptions, 'maxAge' | 'expires'>): void;
    clear(): void;
    all(): Record<string, string>;
}
//# sourceMappingURL=cookies.d.ts.map