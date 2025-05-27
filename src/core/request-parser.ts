import { IncomingMessage } from 'http';
import { parse as parseQuery } from 'querystring';
import { parse as parseUrl } from 'url';
import { CenzeroRequest } from './types';

export class RequestParser {
  static async parseRequest(req: CenzeroRequest): Promise<void> {
    // Parse URL and query parameters
    const parsedUrl = parseUrl(req.url || '', true);
    req.path = parsedUrl.pathname || '/';
    req.query = parsedUrl.query as Record<string, string>;

    // Parse body for POST requests
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      req.body = await this.parseBody(req);
    }
  }

  private static async parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = '';
      
      req.on('data', (chunk: any) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const contentType = req.headers['content-type'] || '';
          
          if (contentType.includes('application/json')) {
            resolve(JSON.parse(body));
          } else if (contentType.includes('application/x-www-form-urlencoded')) {
            resolve(parseQuery(body));
          } else {
            resolve(body);
          }
        } catch (error) {
          reject(error);
        }
      });

      req.on('error', reject);
    });
  }
}
