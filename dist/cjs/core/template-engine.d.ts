export declare class TemplateEngine {
    private engine;
    private viewsDir;
    constructor(engine: string, viewsDir: string);
    render(template: string, data?: any): Promise<string>;
    private renderEjs;
    private renderHtml;
}
//# sourceMappingURL=template-engine.d.ts.map