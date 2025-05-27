import { readFile } from 'fs/promises';
import { join } from 'path';
import * as ejs from 'ejs';

export class TemplateEngine {
  private engine: string;
  private viewsDir: string;

  constructor(engine: string, viewsDir: string) {
    this.engine = engine;
    this.viewsDir = viewsDir;
  }

  async render(template: string, data: any = {}): Promise<string> {
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
    } catch (error) {
      throw new Error(`Template rendering failed: ${error}`);
    }
  }

  private async renderEjs(templatePath: string, data: any): Promise<string> {
    const template = await readFile(templatePath, 'utf-8');
    return ejs.render(template, data);
  }

  private async renderHtml(templatePath: string, data: any): Promise<string> {
    let template = await readFile(templatePath, 'utf-8');
    
    // Simple template variable replacement
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      template = template.replace(regex, String(value));
    }
    
    return template;
  }
}
