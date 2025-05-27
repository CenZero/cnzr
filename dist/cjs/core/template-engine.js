"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateEngine = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const ejs = __importStar(require("ejs"));
class TemplateEngine {
    constructor(engine, viewsDir) {
        this.engine = engine;
        this.viewsDir = viewsDir;
    }
    async render(template, data = {}) {
        const templatePath = (0, path_1.join)(this.viewsDir, `${template}.${this.engine}`);
        try {
            switch (this.engine) {
                case 'ejs':
                    return await this.renderEjs(templatePath, data);
                case 'html':
                    return await this.renderHtml(templatePath, data);
                default:
                    throw new Error(`Unsupported template engine: ${this.engine}`);
            }
        }
        catch (error) {
            throw new Error(`Template rendering failed: ${error}`);
        }
    }
    async renderEjs(templatePath, data) {
        const template = await (0, promises_1.readFile)(templatePath, 'utf-8');
        return ejs.render(template, data);
    }
    async renderHtml(templatePath, data) {
        let template = await (0, promises_1.readFile)(templatePath, 'utf-8');
        // Simple template variable replacement
        for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            template = template.replace(regex, String(value));
        }
        return template;
    }
}
exports.TemplateEngine = TemplateEngine;
//# sourceMappingURL=template-engine.js.map