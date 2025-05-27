import { CenzeroContext } from "./context";
import { CenzeroApp } from "./server";
import { IncomingMessage, ServerResponse } from "http";
export interface PluginHooks {
    onRequest?: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;
    onResponse?: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;
    onError?: (err: Error, req: IncomingMessage, res: ServerResponse) => Promise<void> | void;
    onStart?: (server: any) => Promise<void> | void;
    onRequestContext?: (ctx: CenzeroContext) => Promise<void> | void;
    onResponseContext?: (ctx: CenzeroContext) => Promise<void> | void;
    onErrorContext?: (error: Error, ctx: CenzeroContext) => Promise<void> | void;
    onRoute?: (ctx: CenzeroContext) => Promise<void> | void;
    onStop?: (app: CenzeroApp) => Promise<void> | void;
}
export type PluginFunction = (app: CenzeroApp, config?: any) => void | Promise<void>;
export interface PluginOptions {
    name: string;
    version?: string;
    hooks?: PluginHooks;
    dependencies?: string[];
}
export interface Plugin {
    name: string;
    version: string;
    hooks: PluginHooks;
    dependencies: string[];
    install(app: CenzeroApp, options?: any): Promise<void> | void;
    uninstall?(app: CenzeroApp): Promise<void> | void;
}
export declare class PluginManager {
    private registeredPlugins;
    private pluginFunctionList;
    private appInstance;
    constructor(app: CenzeroApp);
    usePlugin(pluginFn: PluginFunction, pluginConfig?: any): Promise<void>;
    register(plugin: Plugin, options?: any): Promise<void>;
    unregister(pluginName: string): Promise<void>;
    hasPlugin(pluginName: string): boolean;
    getPlugin(pluginName: string): Plugin | undefined;
    getPluginNames(): string[];
    getAllPlugins(): Plugin[];
    executeHook(hookName: keyof PluginHooks, ctx: CenzeroContext, error?: Error): Promise<void>;
    onRequest(ctx: CenzeroContext): Promise<void>;
    onResponse(ctx: CenzeroContext): Promise<void>;
    onError(error: Error, ctx: CenzeroContext): Promise<void>;
    onRoute(ctx: CenzeroContext): Promise<void>;
    onStart(): Promise<void>;
    onStop(): Promise<void>;
    executeRequestHook(req: IncomingMessage, res: ServerResponse): Promise<void>;
    executeResponseHook(req: IncomingMessage, res: ServerResponse): Promise<void>;
    executeErrorHook(err: Error, req: IncomingMessage, res: ServerResponse): Promise<void>;
    executeStartHook(serverInstance: any): Promise<void>;
}
export declare function createPlugin(options: PluginOptions & {
    install: (app: CenzeroApp, pluginOptions?: any) => Promise<void> | void;
    uninstall?: (app: CenzeroApp) => Promise<void> | void;
}): Plugin;
//# sourceMappingURL=plugin.d.ts.map