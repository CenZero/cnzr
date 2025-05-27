"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(options = {}) {
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        this.colors = {
            reset: '\x1b[0m',
            bright: '\x1b[1m',
            dim: '\x1b[2m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m'
        };
        this.options = {
            level: options.level || 'info',
            format: options.format || 'simple',
            timestamp: options.timestamp !== false,
            colors: options.colors !== false,
            silent: options.silent || false,
            customFormat: options.customFormat
        };
    }
    shouldLog(level) {
        if (this.options.silent)
            return false;
        return this.levels[level] >= this.levels[this.options.level];
    }
    colorize(text, color) {
        if (!this.options.colors)
            return text;
        return `${this.colors[color]}${text}${this.colors.reset}`;
    }
    formatTimestamp() {
        return this.options.timestamp ? `[${new Date().toISOString()}]` : '';
    }
    getStatusColor(status) {
        if (status >= 200 && status < 300)
            return 'green';
        if (status >= 300 && status < 400)
            return 'cyan';
        if (status >= 400 && status < 500)
            return 'yellow';
        return 'red';
    }
    formatMessage(level, message, data) {
        const timestamp = this.formatTimestamp();
        const levelStr = this.colorize(level.toUpperCase().padEnd(5), level === 'error' ? 'red' :
            level === 'warn' ? 'yellow' :
                level === 'info' ? 'blue' : 'white');
        if (this.options.format === 'json') {
            return JSON.stringify({
                timestamp: timestamp || new Date().toISOString(),
                level,
                message,
                ...data
            });
        }
        const parts = [timestamp, levelStr, message].filter(Boolean);
        return parts.join(' ') + (data ? ` ${JSON.stringify(data)}` : '');
    }
    debug(message, data) {
        if (this.shouldLog('debug')) {
            console.log(this.formatMessage('debug', message, data));
        }
    }
    info(message, data) {
        if (this.shouldLog('info')) {
            console.log(this.formatMessage('info', message, data));
        }
    }
    warn(message, data) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message, data));
        }
    }
    error(message, data) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message, data));
        }
    }
    // Request/Response logging middleware
    middleware() {
        return async (ctx, next) => {
            const start = Date.now();
            // Log request
            this.info(`${ctx.method} ${ctx.path}`, {
                userAgent: ctx.get('user-agent'),
                ip: ctx.req.socket.remoteAddress
            });
            await next();
            // Log response
            const responseTime = Date.now() - start;
            const status = ctx.res.statusCode;
            const statusColor = this.getStatusColor(status);
            if (this.options.customFormat) {
                const formatted = this.options.customFormat(ctx, responseTime);
                console.log(formatted);
            }
            else {
                const statusStr = this.colorize(status.toString(), statusColor);
                const methodStr = this.colorize(ctx.method.padEnd(6), 'white');
                const timeStr = this.colorize(`${responseTime}ms`, 'dim');
                this.info(`${methodStr} ${ctx.path} ${statusStr} - ${timeStr}`);
            }
            // Set response time header
            ctx.set('X-Response-Time', `${responseTime}ms`);
        };
    }
    // Static factory method
    static create(options) {
        return new Logger(options);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map