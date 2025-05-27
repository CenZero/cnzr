#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const new_1 = require("./commands/new");
const dev_1 = require("./commands/dev");
const build_1 = require("./commands/build");
const packageJson = require("../../package.json");
commander_1.program
    .name("cnzr")
    .description("Cenzero Framework CLI")
    .version(packageJson.version);
commander_1.program
    .command("new <project-name>")
    .description("Create a new Cenzero project")
    .option("-t, --template <template>", "Project template", "basic")
    .action(new_1.createProject);
commander_1.program
    .command("dev")
    .description("Start development server")
    .option("-p, --port <port>", "Port number", "3000")
    .option("-h, --host <host>", "Host address", "localhost")
    .action(dev_1.devServer);
commander_1.program
    .command("build")
    .description("Build the project for production")
    .option('-o, --output <dir>', 'Output directory', 'dist')
    .action(build_1.buildProject);
commander_1.program.parse();
//# sourceMappingURL=index.js.map