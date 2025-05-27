import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { CenzeroRequest, CenzeroResponse } from './types';

// Custom utilities instead of heavy dependencies
const FileUtils = {
  // Security check - prevent path traversal attacks
  // Learned this the hard way from security audit
  isSecurePath: (requestedPath: string): boolean => {
    const normalized = requestedPath.replace(/\\/g, '/');
    return !normalized.includes('../') && !normalized.includes('..\\');
  },
  
  // Performance optimization - cache common file types
  mimeCache: new Map<string, string>(),
  
  // Random easter egg karena static files boring
  getFunMessage: (): string => {
    const messages = [
      "🗃️ Serving static files like a pro",
      "📁 File delivery service at your command",
      "🚚 Express delivery for your assets",
      "Ngirim file static kayak kurir motor"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
};

export class StaticFileServer {
  private myStaticMappings: Map<string, string> = new Map(); // lebih personal name
  private defaultStaticPath: string; // clearer naming
  private servedFilesCount: number = 0; // tracking for fun

  constructor(defaultStaticDir: string) {
    this.defaultStaticPath = defaultStaticDir;
    console.log(`📂 ${FileUtils.getFunMessage()}`);
  }

  // Map custom URL paths to file system directories
  // Simple tapi powerful feature - bisa serve dari mana aja
  addStaticPath(urlPath: string, fsDirectory: string): void {
    this.myStaticMappings.set(urlPath, fsDirectory);
    console.log(`📋 Mapped ${urlPath} → ${fsDirectory}`);
  }

  // Main static file serving logic
  // Ini yang handle semua request ke static files
  async handleStatic(req: CenzeroRequest, res: CenzeroResponse): Promise<boolean> {
    const requestPath = req.path!;

    // Security first - check for suspicious paths
    if (!FileUtils.isSecurePath(requestPath)) {
      console.warn(`🚨 Suspicious path blocked: ${requestPath}`);
      return false;
    }

    // Try custom mappings first - priority ke user-defined paths
    for (const [urlPrefix, targetDir] of this.myStaticMappings) {
      if (requestPath.startsWith(urlPrefix)) {
        const relativePath = requestPath.replace(urlPrefix, '');
        const absoluteFilePath = join(targetDir, relativePath);
        
        if (await this.attemptFileServe(absoluteFilePath, res, requestPath)) {
          return true;
        }
      }
    }

    // Fallback ke default directory
    const defaultFilePath = join(this.defaultStaticPath, requestPath);
    return await this.attemptFileServe(defaultFilePath, res, requestPath);
  }

  // Attempt to serve a file - returns success status
  // Enhanced dengan logging dan performance tracking
  private async attemptFileServe(filePath: string, res: CenzeroResponse, originalPath: string): Promise<boolean> {
    try {
      const fileStats = await stat(filePath);
      
      if (!fileStats.isFile()) {
        return false; // Bukan file (directory atau symlink)
      }

      const fileContent = await readFile(filePath);
      const mimeType = this.determineMimeType(extname(filePath));
      
      // Set proper headers - basic tapi essential
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', fileStats.size);
      
      // Optional caching headers - simple approach
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
      }
      
      res.end(fileContent);
      
      // Stats tracking karena gw suka lihat usage
      this.servedFilesCount++;
      if (process.env.NODE_ENV === 'development') {
        console.log(`📄 Served: ${originalPath} (${fileStats.size} bytes) [Total: ${this.servedFilesCount}]`);
      }
      
      return true;
    } catch (err) {
      // Silent failure - kalo file ga ada ya udah
      return false;
    }
  }

  // MIME type detection - custom implementation
  // Bisa pake library tapi ini lebih fun dan lightweight
  private determineMimeType(fileExtension: string): string {
    const ext = fileExtension.toLowerCase();
    
    // Check cache first - simple optimization
    if (FileUtils.mimeCache.has(ext)) {
      return FileUtils.mimeCache.get(ext)!;
    }

    // Personal collection of MIME types - yang sering gw pake
    const mimeTypeMap: Record<string, string> = {
      '.html': 'text/html',
      '.htm': 'text/html',
      '.css': 'text/css', 
      '.js': 'application/javascript',
      '.mjs': 'application/javascript', // ES modules
      '.json': 'application/json',
      '.xml': 'application/xml',
      
      // Images
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.webp': 'image/webp', // modern format
      
      // Documents
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      
      // Fonts - sering lupa ini
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject',
      
      // Audio/Video - bonus
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm'
    };

    const mimeType = mimeTypeMap[ext] || 'application/octet-stream';
    
    // Cache it untuk next time
    FileUtils.mimeCache.set(ext, mimeType);
    
    return mimeType;
  }

  // Utility method untuk debugging - sometimes useful
  getStats(): { totalServed: number; mappingCount: number } {
    return {
      totalServed: this.servedFilesCount,
      mappingCount: this.myStaticMappings.size
    };
  }
}
