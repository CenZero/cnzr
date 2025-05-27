import { PluginFunction } from '../core/plugin';
import { IncomingMessage, ServerResponse } from 'http';

// Example plugin using the new function-based system
export interface RequestIdOptions {
  header?: string;
  generator?: () => string;
}

export const requestIdPlugin: PluginFunction = (app, options: RequestIdOptions = {}) => {
  const opts = {
    header: 'X-Request-ID',
    generator: () => Math.random().toString(36).substring(2, 15),
    ...options
  };

  console.log(`🔌 RequestID Plugin loaded with header: ${opts.header}`);

  // Register hooks using the Plugin system
  app.getPluginManager().register({
    name: 'request-id',
    version: '1.0.0',
    dependencies: [],
    hooks: {
      // New req/res-based hook
      onRequest: async (req: IncomingMessage, res: ServerResponse) => {
        const requestId = opts.generator();
        res.setHeader(opts.header, requestId);
        // Add to request for other middlewares to use
        (req as any).requestId = requestId;
      }
    },
    install: async () => {
      // Plugin installation logic if needed
    }
  });
};

// Example authentication plugin
export interface AuthOptions {
  secret?: string;
  paths?: string[];
}

export const authPlugin: PluginFunction = (app, options: AuthOptions = {}) => {
  const opts = {
    secret: 'default-secret',
    paths: ['/protected'],
    ...options
  };

  console.log(`🔌 Auth Plugin loaded for paths: ${opts.paths.join(', ')}`);

  app.getPluginManager().register({
    name: 'auth',
    version: '1.0.0',
    dependencies: [],
    hooks: {
      onRequest: async (req: IncomingMessage, res: ServerResponse) => {
        const url = require('url').parse(req.url || '');
        const isProtectedPath = opts.paths.some(path => url.pathname?.startsWith(path));
        
        if (isProtectedPath) {
          const authHeader = req.headers.authorization;
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Unauthorized', message: 'Missing or invalid token' }));
            return;
          }
          
          // Simple token validation (in real app, use proper JWT validation)
          const token = authHeader.substring(7);
          if (token !== opts.secret) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Forbidden', message: 'Invalid token' }));
            return;
          }
          
          // Add user info to request
          (req as any).user = { id: 1, username: 'testuser' };
        }
      }
    },
    install: async () => {
      // Plugin installation logic
    }
  });
};

// Response compression plugin example
export interface CompressionOptions {
  threshold?: number;
  algorithms?: string[];
}

export const compressionPlugin: PluginFunction = (app, options: CompressionOptions = {}) => {
  const opts = {
    threshold: 1024, // Only compress responses larger than 1KB
    algorithms: ['gzip', 'deflate'],
    ...options
  };

  console.log(`🔌 Compression Plugin loaded with threshold: ${opts.threshold} bytes`);

  app.getPluginManager().register({
    name: 'compression',
    version: '1.0.0',
    dependencies: [],
    hooks: {
      onResponse: async (req: IncomingMessage, res: ServerResponse) => {
        const acceptEncoding = req.headers['accept-encoding'] || '';
        
        if (acceptEncoding.includes('gzip') && opts.algorithms.includes('gzip')) {
          res.setHeader('Content-Encoding', 'gzip');
          res.setHeader('Vary', 'Accept-Encoding');
        } else if (acceptEncoding.includes('deflate') && opts.algorithms.includes('deflate')) {
          res.setHeader('Content-Encoding', 'deflate');
          res.setHeader('Vary', 'Accept-Encoding');
        }
      }
    },
    install: async () => {
      // Plugin installation logic
    }
  });
};
