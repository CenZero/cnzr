import { parse as parseQuery } from 'querystring';
import { parse as parseUrl } from 'url';
export class RequestParser {
    static async parseRequest(req) {
        // Parse URL and query parameters
        const parsedUrl = parseUrl(req.url || '', true);
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
                        resolve(parseQuery(body));
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
//# sourceMappingURL=request-parser.js.map