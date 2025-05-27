import { CenzeroContext } from "./context";
import { CenzeroApp } from "./server";
import { IncomingMessage, ServerResponse } from "http";

// Plugin lifecycle hooks - pretty flexible system
export interface PluginHooks {
  // New req/res-based hooks (requested by users for direct HTTP access)
  onRequest?: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;
  onResponse?: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;
  onError?: (err: Error, req: IncomingMessage, res: ServerResponse) => Promise<void> | void;
  onStart?: (server: any) => Promise<void> | void;
  
  // Legacy context-based hooks - keeping for backward compatibility
  onRequestContext?: (ctx: CenzeroContext) => Promise<void> | void;
  onResponseContext?: (ctx: CenzeroContext) => Promise<void> | void;
  onErrorContext?: (error: Error, ctx: CenzeroContext) => Promise<void> | void;
  onRoute?: (ctx: CenzeroContext) => Promise<void> | void;
  onStop?: (app: CenzeroApp) => Promise<void> | void;
}

// Plugin function type - each plugin is basically a function that configures the app
export type PluginFunction = (app: CenzeroApp, config?: any) => void | Promise<void>;

export interface PluginOptions {
  name: string;
  version?: string;
  hooks?: PluginHooks;
  dependencies?: string[]; // other plugins this one needs
}

export interface Plugin {
  name: string;
  version: string;
  hooks: PluginHooks;
  dependencies: string[];
  install(app: CenzeroApp, options?: any): Promise<void> | void;
  uninstall?(app: CenzeroApp): Promise<void> | void; // optional cleanup
}

export class PluginManager {
  private registeredPlugins: Map<string, Plugin> = new Map();
  private pluginFunctionList: PluginFunction[] = [];
  private appInstance: CenzeroApp;

  constructor(app: CenzeroApp) {
    this.appInstance = app;
  }

  // Method for simple plugin functions (most common case)
  async usePlugin(pluginFn: PluginFunction, pluginConfig?: any): Promise<void> {
    this.pluginFunctionList.push(pluginFn);
    await pluginFn(this.appInstance, pluginConfig);
  }

  // Register more complex Plugin objects with full lifecycle hooks
  async register(plugin: Plugin, options?: any): Promise<void> {
    // Check dependencies first - plugins can depend on each other
    for (const dependencyName of plugin.dependencies) {
      if (!this.registeredPlugins.has(dependencyName)) {
        throw new Error(`Plugin "${plugin.name}" requires dependency "${dependencyName}" to be installed first`);
      }
    }

    // Check for duplicate registration
    if (this.registeredPlugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    // Install the plugin
    await plugin.install(this.appInstance, options);
    this.registeredPlugins.set(plugin.name, plugin);

    console.log(`🔌 Plugin "${plugin.name}" v${plugin.version} registered successfully`);
  }

  async unregister(pluginName: string): Promise<void> {
    const plugin = this.registeredPlugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" is not registered`);
    }

    // Check if other plugins depend on this one - can't remove if they do
    for (const [, registeredPlugin] of this.registeredPlugins) {
      if (registeredPlugin.dependencies.includes(pluginName)) {
        throw new Error(`Cannot unregister plugin "${pluginName}": plugin "${registeredPlugin.name}" depends on it`);
      }
    }

    // Cleanup if the plugin supports it
    if (plugin.uninstall) {
      await plugin.uninstall(this.appInstance);
    }

    this.registeredPlugins.delete(pluginName);
    console.log(`🔌 Plugin "${pluginName}" unregistered successfully`);
  }

  // Public method for checking if plugin is loaded
  hasPlugin(pluginName: string): boolean {
    return this.registeredPlugins.has(pluginName);
  }

  getPlugin(pluginName: string): Plugin | undefined {
    return this.registeredPlugins.get(pluginName);
  }

  getPluginNames(): string[] {
    return Array.from(this.registeredPlugins.keys());
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.registeredPlugins.values());
  }

  // Hook execution methods - this handles calling plugin hooks at the right times
  async executeHook(hookName: keyof PluginHooks, ctx: CenzeroContext, error?: Error): Promise<void> {
    for (const plugin of this.registeredPlugins.values()) {
      const hookFunction = plugin.hooks[hookName];
      if (hookFunction) {
        try {
          if (hookName === "onErrorContext" && error) {
            await (hookFunction as any)(error, ctx);
          } else if (hookName === "onStart" || hookName === "onStop") {
            await (hookFunction as any)(this.appInstance);
          } else {
            await (hookFunction as any)(ctx);
          }
        } catch (hookError) {
          console.error(`Error in plugin "${plugin.name}" hook "${hookName}":`, hookError);
        }
      }
    }
  }

  // Specific hook executors for the legacy context-based hooks
  async onRequest(ctx: CenzeroContext): Promise<void> {
    await this.executeHook("onRequestContext", ctx);
  }

  async onResponse(ctx: CenzeroContext): Promise<void> {
    await this.executeHook("onResponseContext", ctx);
  }

  async onError(error: Error, ctx: CenzeroContext): Promise<void> {
    await this.executeHook("onErrorContext", ctx, error);
  }

  async onRoute(ctx: CenzeroContext): Promise<void> {
    await this.executeHook("onRoute", ctx);
  }

  // Server lifecycle hooks
  async onStart(): Promise<void> {
    for (const plugin of this.registeredPlugins.values()) {
      const startHook = plugin.hooks.onStart;
      if (startHook) {
        try {
          await startHook(this.appInstance);
        } catch (err) {
          console.error(`Error in plugin "${plugin.name}" onStart hook:`, err);
        }
      }
    }
  }

  async onStop(): Promise<void> {
    for (const plugin of this.registeredPlugins.values()) {
      const stopHook = plugin.hooks.onStop;
      if (stopHook) {
        try {
          await stopHook(this.appInstance);
        } catch (err) {
          console.error(`Error in plugin "${plugin.name}" onStop hook:`, err);
        }
      }
    }
  }

  // Hook execution methods for req/res-based hooks (newer, more direct approach)
  async executeRequestHook(req: IncomingMessage, res: ServerResponse): Promise<void> {
    for (const plugin of this.registeredPlugins.values()) {
      const requestHook = plugin.hooks.onRequest;
      if (requestHook) {
        try {
          await requestHook(req, res);
        } catch (err) {
          console.error(`Error in plugin "${plugin.name}" onRequest hook:`, err);
        }
      }
    }
  }

  async executeResponseHook(req: IncomingMessage, res: ServerResponse): Promise<void> {
    for (const plugin of this.registeredPlugins.values()) {
      const responseHook = plugin.hooks.onResponse;
      if (responseHook) {
        try {
          await responseHook(req, res);
        } catch (err) {
          console.error(`Error in plugin "${plugin.name}" onResponse hook:`, err);
        }
      }
    }
  }

  async executeErrorHook(err: Error, req: IncomingMessage, res: ServerResponse): Promise<void> {
    for (const plugin of this.registeredPlugins.values()) {
      const errorHook = plugin.hooks.onError;
      if (errorHook) {
        try {
          await errorHook(err, req, res);
        } catch (hookError) {
          console.error(`Error in plugin "${plugin.name}" onError hook:`, hookError);
        }
      }
    }
  }

  async executeStartHook(serverInstance: any): Promise<void> {
    for (const plugin of this.registeredPlugins.values()) {
      const startHook = plugin.hooks.onStart;
      if (startHook) {
        try {
          await startHook(serverInstance);
        } catch (hookError) {
          console.error(`Error in plugin "${plugin.name}" onStart hook:`, hookError);
        }
      }
    }
  }
}

// Plugin factory for easier plugin creation - makes it simpler for users
export function createPlugin(options: PluginOptions & {
  install: (app: CenzeroApp, pluginOptions?: any) => Promise<void> | void;
  uninstall?: (app: CenzeroApp) => Promise<void> | void;
}): Plugin {
  return {
    name: options.name,
    version: options.version || "1.0.0",
    hooks: options.hooks || {},
    dependencies: options.dependencies || [],
    install: options.install,
    uninstall: options.uninstall
  };
}
