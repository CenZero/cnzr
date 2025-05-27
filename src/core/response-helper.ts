import { ServerResponse } from 'http';
import { CenzeroResponse } from './types';

export class ResponseHelper {
  static enhance(res: ServerResponse): CenzeroResponse {
    const enhancedRes = res as CenzeroResponse;

    enhancedRes.json = function(data: any): void {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(data));
    };

    enhancedRes.html = function(content: string): void {
      this.setHeader('Content-Type', 'text/html');
      this.end(content);
    };

    enhancedRes.redirect = function(url: string, statusCode: number = 302): void {
      this.statusCode = statusCode;
      this.setHeader('Location', url);
      this.end();
    };

    enhancedRes.status = function(code: number): CenzeroResponse {
      this.statusCode = code;
      return this;
    };

    enhancedRes.send = function(data: any): void {
      if (typeof data === 'string') {
        this.setHeader('Content-Type', 'text/plain');
        this.end(data);
      } else if (typeof data === 'object') {
        this.json(data);
      } else {
        this.end(String(data));
      }
    };

    return enhancedRes;
  }
}
