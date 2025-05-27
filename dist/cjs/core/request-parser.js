"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestParser = void 0;
const querystring_1 = require("querystring");
const url_1 = require("url");
class RequestParser {
    static async parseRequest(req) {
        // Parse URL and query parameters
        const parsedUrl = (0, url_1.parse)(req.url || '', true);
        req.path = parsedUrl.pathname || '/';
        req.query = parsedUrl.query;
        // Parse body for POST requests
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            req.body = await this.parseBody(req);
        }
    }
    static async parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const contentType = req.headers['content-type'] || '';
                    if (contentType.includes('application/json')) {
                        resolve(JSON.parse(body));
                    }
                    else if (contentType.includes('application/x-www-form-urlencoded')) {
                        resolve((0, querystring_1.parse)(body));
                    }
                    else {
                        resolve(body);
                    }
                }
                catch (error) {
                    reject(error);
                }
            });
            req.on('error', reject);
        });
    }
}
exports.RequestParser = RequestParser;
//# sourceMappingURL=request-parser.js.map