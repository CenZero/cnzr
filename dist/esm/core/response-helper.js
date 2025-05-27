export class ResponseHelper {
    static enhance(res) {
        const enhancedRes = res;
        enhancedRes.json = function (data) {
            this.setHeader('Content-Type', 'application/json');
            this.end(JSON.stringify(data));
        };
        enhancedRes.html = function (content) {
            this.setHeader('Content-Type', 'text/html');
            this.end(content);
        };
        enhancedRes.redirect = function (url, statusCode = 302) {
            this.statusCode = statusCode;
            this.setHeader('Location', url);
            this.end();
        };
        enhancedRes.status = function (code) {
            this.statusCode = code;
            return this;
        };
        enhancedRes.send = function (data) {
            if (typeof data === 'string') {
                this.setHeader('Content-Type', 'text/plain');
                this.end(data);
            }
            else if (typeof data === 'object') {
                this.json(data);
            }
            else {
                this.end(String(data));
            }
        };
        return enhancedRes;
    }
}
//# sourceMappingURL=response-helper.js.map