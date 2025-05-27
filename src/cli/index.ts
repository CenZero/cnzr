#!/usr/bin/env node

import { program } from "commander";
import { createProject } from "./commands/new";
import { devServer } from "./commands/dev";
import { buildProject } from "./commands/build";

const packageJson = require("../../package.json");

program
  .name("cnzr")
  .description("Cenzero Framework CLI")
  .version(packageJson.version);

program
  .command("new <project-name>")
  .description("Create a new Cenzero project")
  .option("-t, --template <template>", "Project template", "basic")
  .action(createProject);

program
  .command("dev")
  .description("Start development server")
  .option("-p, --port <port>", "Port number", "3000")
  .option("-h, --host <host>", "Host address", "localhost")
  .action(devServer);

program
  .command("build")
  .description("Build the project for production")
  .option('-o, --output <dir>', 'Output directory', 'dist')
  .action(buildProject);

program.parse();
