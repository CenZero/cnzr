import { Session } from './session.js';
import { Cookies } from './cookies.js';
// Custom context utilities - karena gw suka yang practical
const ContextUtils = {
    // Request ID generator - simple tapi berguna buat tracing
    generateRequestId: () => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `req_${timestamp}_${random}`;
    },
    // Helper buat detect content type dari request
    getContentType: (headers) => {
        const contentType = headers['content-type'] || headers['Content-Type'];
        return Array.isArray(contentType) ? contentType[0] : contentType || 'unknown';
    },
    // Random tips - karena debugging context bisa confusing
    getContextTip: () => {
        const tips = [
            "💡 Use ctx.state to pass data between middlewares",
            "🔍 ctx.assert() is great for input validation",
            "📝 ctx.headers gives you all request headers",
            "Context pattern bikin code lebih clean daripada req/res terpisah"
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }
};
export class Context {
    constructor(req, res, sessionOptions) {
        this.params = {};
        this.query = {};
        this.state = {}; // NOTE: super useful buat middleware communication
        this.req = req;
        this.res = res;
        this.method = req.method || 'GET';
        this.path = req.path || '/';
        this.url = req.url || '/';
        this.headers = req.headers;
        this.params = req.params || {};
        this.query = req.query || {};
        this.body = req.body;
        // Generate unique request ID - helpful buat debugging
        this.requestId = ContextUtils.generateRequestId();
        // Initialize session and cookies - order matters di sini
        this.cookies = new Cookies(req, res);
        this.session = new Session(this.cookies, sessionOptions);
        // Random dev tip kalo lagi development
        if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) { // 5% chance
            console.log(`💡 [${this.requestId}] ${ContextUtils.getContextTip()}`);
        }
    }
    // Response methods - keeping simple tapi powerful
    json(data) {
        // Log di development buat debugging
        if (process.env.NODE_ENV === 'development') {
            console.log(`📤 [${this.requestId}] JSON Response:`, typeof data === 'object' ? Object.keys(data) : data);
        }
        this.res.json(data);
    }
    html(content) {
        this.res.html(content);
    }
    text(content) {
        this.res.setHeader('Content-Type', 'text/plain');
        this.res.end(content);
    }
    redirect(url, statusCode = 302) {
        // Log redirects - sometimes helpful buat debug flow
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔀 [${this.requestId}] Redirecting to: ${url} (${statusCode})`);
        }
        this.res.redirect(url, statusCode);
    }
    status(code) {
        this.res.status(code);
        return this; // Chainable - ctx.status(200).json({...})
    }
    send(data) {
        this.res.send(data);
    }
    // Header utility methods
    set(field, value) {
        this.res.setHeader(field, value);
    }
    get(field) {
        const header = this.req.headers[field.toLowerCase()];
        return Array.isArray(header) ? header[0] : header;
    }
    // Error handling utilities - ini yang bikin development life easier
    throw(status, message) {
        const err = new Error(message || `HTTP ${status} Error`);
        err.status = status;
        err.statusCode = status;
        err.requestId = this.requestId; // Include request ID for tracking
        throw err;
    }
    assert(condition, status, message) {
        if (!condition) {
            this.throw(status, message);
        }
    }
    createError(status, message) {
        const err = new Error(message || `HTTP ${status} Error`);
        err.status = status;
        err.statusCode = status;
        err.requestId = this.requestId;
        return err;
    }
    // Bonus utility methods - personal additions yang sering gw pake
    // Check if request is AJAX/API call
    get isAjax() {
        const xhr = this.get('x-requested-with');
        const accept = this.get('accept') || '';
        return xhr === 'XMLHttpRequest' || accept.includes('application/json');
    }
    // Get user agent info - sometimes useful
    get userAgent() {
        return this.get('user-agent') || 'unknown';
    }
    // Get client IP with better detection
    get clientIP() {
        const forwarded = this.get('x-forwarded-for');
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        return this.get('x-real-ip') || this.req.connection?.remoteAddress || 'unknown';
    }
}
//# sourceMappingURL=context.js.map