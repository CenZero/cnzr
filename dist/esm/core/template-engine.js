import { readFile } from 'fs/promises';
import { join } from 'path';
import * as ejs from 'ejs';
export class TemplateEngine {
    constructor(engine, viewsDir) {
        this.engine = engine;
        this.viewsDir = viewsDir;
    }
    async render(template, data = {}) {
        const templatePath = join(this.viewsDir, `${template}.${this.engine}`);
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
        const template = await readFile(templatePath, 'utf-8');
        return ejs.render(template, data);
    }
    async renderHtml(templatePath, data) {
        let template = await readFile(templatePath, 'utf-8');
        // Simple template variable replacement
        for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            template = template.replace(regex, String(value));
        }
        return template;
    }
}
//# sourceMappingURL=template-engine.js.map