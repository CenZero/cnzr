import { CenzeroRequest, CenzeroResponse } from './types';
export declare class StaticFileServer {
    private myStaticMappings;
    private defaultStaticPath;
    private servedFilesCount;
    constructor(defaultStaticDir: string);
    addStaticPath(urlPath: string, fsDirectory: string): void;
    handleStatic(req: CenzeroRequest, res: CenzeroResponse): Promise<boolean>;
    private attemptFileServe;
    private determineMimeType;
    getStats(): {
        totalServed: number;
        mappingCount: number;
    };
}
//# sourceMappingURL=static-file-server.d.ts.map