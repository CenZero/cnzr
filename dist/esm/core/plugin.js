export class PluginManager {
    constructor(app) {
        this.registeredPlugins = new Map();
        this.pluginFunctionList = [];
        this.appInstance = app;
    }
    // Method for simple plugin functions (most common case)
    async usePlugin(pluginFn, pluginConfig) {
        this.pluginFunctionList.push(pluginFn);
        await pluginFn(this.appInstance, pluginConfig);
    }
    // Register more complex Plugin objects with full lifecycle hooks
    async register(plugin, options) {
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
    async unregister(pluginName) {
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
    hasPlugin(pluginName) {
        return this.registeredPlugins.has(pluginName);
    }
    getPlugin(pluginName) {
        return this.registeredPlugins.get(pluginName);
    }
    getPluginNames() {
        return Array.from(this.registeredPlugins.keys());
    }
    getAllPlugins() {
        return Array.from(this.registeredPlugins.values());
    }
    // Hook execution methods - this handles calling plugin hooks at the right times
    async executeHook(hookName, ctx, error) {
        for (const plugin of this.registeredPlugins.values()) {
            const hookFunction = plugin.hooks[hookName];
            if (hookFunction) {
                try {
                    if (hookName === "onErrorContext" && error) {
                        await hookFunction(error, ctx);
                    }
                    else if (hookName === "onStart" || hookName === "onStop") {
                        await hookFunction(this.appInstance);
                    }
                    else {
                        await hookFunction(ctx);
                    }
                }
                catch (hookError) {
                    console.error(`Error in plugin "${plugin.name}" hook "${hookName}":`, hookError);
                }
            }
        }
    }
    // Specific hook executors for the legacy context-based hooks
    async onRequest(ctx) {
        await this.executeHook("onRequestContext", ctx);
    }
    async onResponse(ctx) {
        await this.executeHook("onResponseContext", ctx);
    }
    async onError(error, ctx) {
        await this.executeHook("onErrorContext", ctx, error);
    }
    async onRoute(ctx) {
        await this.executeHook("onRoute", ctx);
    }
    // Server lifecycle hooks
    async onStart() {
        for (const plugin of this.registeredPlugins.values()) {
            const startHook = plugin.hooks.onStart;
            if (startHook) {
                try {
                    await startHook(this.appInstance);
                }
                catch (err) {
                    console.error(`Error in plugin "${plugin.name}" onStart hook:`, err);
                }
            }
        }
    }
    async onStop() {
        for (const plugin of this.registeredPlugins.values()) {
            const stopHook = plugin.hooks.onStop;
            if (stopHook) {
                try {
                    await stopHook(this.appInstance);
                }
                catch (err) {
                    console.error(`Error in plugin "${plugin.name}" onStop hook:`, err);
                }
            }
        }
    }
    // Hook execution methods for req/res-based hooks (newer, more direct approach)
    async executeRequestHook(req, res) {
        for (const plugin of this.registeredPlugins.values()) {
            const requestHook = plugin.hooks.onRequest;
            if (requestHook) {
                try {
                    await requestHook(req, res);
                }
                catch (err) {
                    console.error(`Error in plugin "${plugin.name}" onRequest hook:`, err);
                }
            }
        }
    }
    async executeResponseHook(req, res) {
        for (const plugin of this.registeredPlugins.values()) {
            const responseHook = plugin.hooks.onResponse;
            if (responseHook) {
                try {
                    await responseHook(req, res);
                }
                catch (err) {
                    console.error(`Error in plugin "${plugin.name}" onResponse hook:`, err);
                }
            }
        }
    }
    async executeErrorHook(err, req, res) {
        for (const plugin of this.registeredPlugins.values()) {
            const errorHook = plugin.hooks.onError;
            if (errorHook) {
                try {
                    await errorHook(err, req, res);
                }
                catch (hookError) {
                    console.error(`Error in plugin "${plugin.name}" onError hook:`, hookError);
                }
            }
        }
    }
    async executeStartHook(serverInstance) {
        for (const plugin of this.registeredPlugins.values()) {
            const startHook = plugin.hooks.onStart;
            if (startHook) {
                try {
                    await startHook(serverInstance);
                }
                catch (hookError) {
                    console.error(`Error in plugin "${plugin.name}" onStart hook:`, hookError);
                }
            }
        }
    }
}
// Plugin factory for easier plugin creation - makes it simpler for users
export function createPlugin(options) {
    return {
        name: options.name,
        version: options.version || "1.0.0",
        hooks: options.hooks || {},
        dependencies: options.dependencies || [],
        install: options.install,
        uninstall: options.uninstall
    };
}
//# sourceMappingURL=plugin.js.map