import { CenzeroContext } from './context';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LoggerOptions {
    level?: LogLevel;
    format?: 'simple' | 'json' | 'combined';
    timestamp?: boolean;
    colors?: boolean;
    silent?: boolean;
    customFormat?: (ctx: CenzeroContext, responseTime: number) => string;
}
export declare class Logger {
    private options;
    private levels;
    private colors;
    constructor(options?: LoggerOptions);
    private shouldLog;
    private colorize;
    private formatTimestamp;
    private getStatusColor;
    private formatMessage;
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, data?: any): void;
    middleware(): (ctx: CenzeroContext, next: () => Promise<void>) => Promise<void>;
    static create(options?: LoggerOptions): Logger;
}
//# sourceMappingURL=logger.d.ts.map