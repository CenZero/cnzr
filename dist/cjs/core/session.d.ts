import { Cookies } from './cookies';
export interface SessionOptions {
    name?: string;
    secret?: string;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
}
export interface SessionData {
    [key: string]: any;
}
export declare class Session {
    private cookies;
    private options;
    private data;
    private sessionId;
    private dirty;
    private static store;
    constructor(cookies: Cookies, options?: SessionOptions);
    private loadSession;
    private createNewSession;
    private generateSessionId;
    private sign;
    private verifySessionId;
    get(key: string): any;
    set(key: string, value: any): void;
    clear(): void;
    delete(key: string): void;
    destroy(): void;
    save(): void;
    regenerate(): void;
    get id(): string | null;
    get all(): SessionData;
    static cleanup(): void;
}
//# sourceMappingURL=session.d.ts.map