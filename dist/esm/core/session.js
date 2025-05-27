import { randomBytes, createHash } from 'crypto';
export class Session {
    constructor(cookies, options = {}) {
        this.data = {};
        this.sessionId = null;
        this.dirty = false;
        this.cookies = cookies;
        this.options = {
            name: options.name || 'cenzero-session',
            secret: options.secret || 'cenzero-default-secret',
            maxAge: options.maxAge || 24 * 60 * 60 * 1000, // 24 hours
            secure: options.secure || false,
            httpOnly: options.httpOnly !== false,
            sameSite: options.sameSite || 'lax'
        };
        this.loadSession();
    }
    loadSession() {
        const sessionCookie = this.cookies.get(this.options.name);
        if (sessionCookie) {
            try {
                this.sessionId = this.verifySessionId(sessionCookie);
                if (this.sessionId) {
                    const sessionEntry = Session.store.get(this.sessionId);
                    if (sessionEntry && sessionEntry.expires > Date.now()) {
                        this.data = sessionEntry.data;
                        return;
                    }
                    else if (sessionEntry) {
                        // Session expired, clean up
                        Session.store.delete(this.sessionId);
                    }
                }
            }
            catch (error) {
                // Invalid session cookie
            }
        }
        // Create new session
        this.createNewSession();
    }
    createNewSession() {
        this.sessionId = this.generateSessionId();
        this.data = {};
        this.dirty = true;
    }
    generateSessionId() {
        const timestamp = Date.now().toString();
        const random = randomBytes(16).toString('hex');
        const payload = `${timestamp}:${random}`;
        const signature = this.sign(payload);
        return `${payload}.${signature}`;
    }
    sign(value) {
        return createHash('sha256')
            .update(value + this.options.secret)
            .digest('hex')
            .substring(0, 16);
    }
    verifySessionId(sessionId) {
        const parts = sessionId.split('.');
        if (parts.length !== 2)
            return null;
        const [payload, signature] = parts;
        const expectedSignature = this.sign(payload);
        if (signature !== expectedSignature)
            return null;
        return sessionId;
    }
    get(key) {
        return this.data[key];
    }
    set(key, value) {
        this.data[key] = value;
        this.dirty = true;
    }
    clear() {
        this.data = {};
        this.dirty = true;
    }
    delete(key) {
        delete this.data[key];
        this.dirty = true;
    }
    destroy() {
        if (this.sessionId) {
            Session.store.delete(this.sessionId);
            this.cookies.delete(this.options.name);
        }
        this.data = {};
        this.sessionId = null;
        this.dirty = false;
    }
    save() {
        if (!this.dirty || !this.sessionId)
            return;
        // Save to store
        Session.store.set(this.sessionId, {
            data: { ...this.data },
            expires: Date.now() + this.options.maxAge
        });
        // Set cookie
        this.cookies.set(this.options.name, this.sessionId, {
            maxAge: Math.floor(this.options.maxAge / 1000),
            secure: this.options.secure,
            httpOnly: this.options.httpOnly,
            sameSite: this.options.sameSite
        });
        this.dirty = false;
    }
    regenerate() {
        const oldData = { ...this.data };
        this.destroy();
        this.createNewSession();
        this.data = oldData;
        this.save();
    }
    // Getter/Setter for easier access
    get id() {
        return this.sessionId;
    }
    get all() {
        return { ...this.data };
    }
    // Clean up expired sessions (should be called periodically)
    static cleanup() {
        const now = Date.now();
        const entries = Array.from(Session.store.entries());
        for (const [sessionId, entry] of entries) {
            if (entry.expires <= now) {
                Session.store.delete(sessionId);
            }
        }
    }
}
Session.store = new Map();
//# sourceMappingURL=session.js.map