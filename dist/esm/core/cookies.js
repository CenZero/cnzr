export class Cookies {
    constructor(req, res) {
        this.parsed = {};
        this.req = req;
        this.res = res;
        this.parseCookies();
    }
    parseCookies() {
        const cookieHeader = this.req.headers.cookie;
        if (!cookieHeader)
            return;
        cookieHeader.split(';').forEach(cookie => {
            const [name, ...rest] = cookie.trim().split('=');
            if (name && rest.length > 0) {
                this.parsed[name] = decodeURIComponent(rest.join('='));
            }
        });
    }
    get(name) {
        return this.parsed[name];
    }
    set(name, value, options = {}) {
        let cookieString = `${name}=${encodeURIComponent(value)}`;
        if (options.maxAge !== undefined) {
            cookieString += `; Max-Age=${options.maxAge}`;
        }
        if (options.expires) {
            cookieString += `; Expires=${options.expires.toUTCString()}`;
        }
        if (options.path) {
            cookieString += `; Path=${options.path}`;
        }
        if (options.domain) {
            cookieString += `; Domain=${options.domain}`;
        }
        if (options.secure) {
            cookieString += '; Secure';
        }
        if (options.httpOnly) {
            cookieString += '; HttpOnly';
        }
        if (options.sameSite) {
            cookieString += `; SameSite=${options.sameSite}`;
        }
        // Get existing Set-Cookie headers
        const existingHeaders = this.res.getHeader('Set-Cookie');
        const headers = Array.isArray(existingHeaders)
            ? existingHeaders
            : existingHeaders
                ? [existingHeaders]
                : [];
        headers.push(cookieString);
        this.res.setHeader('Set-Cookie', headers);
    }
    delete(name, options = {}) {
        this.set(name, '', {
            ...options,
            expires: new Date(0)
        });
    }
    clear() {
        Object.keys(this.parsed).forEach(name => {
            this.delete(name);
        });
    }
    all() {
        return { ...this.parsed };
    }
}
//# sourceMappingURL=cookies.js.map