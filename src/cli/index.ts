#!/usr/bin/env node

import { program } from "commander";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { createProject } from "./commands/new";
import { devServer } from "./commands/dev";
import { buildProject } from "./commands/build";
import { generateRoute } from "./commands/generate";

// Supports both source and built CLI execution contexts:
// - src/cli/index.ts during local dev/test
// - dist/cjs/cli/index.js after build/publish
const packageJsonPathCandidates = [
  join(__dirname, "..", "..", "package.json"),
  join(__dirname, "..", "..", "..", "package.json"),
];

const packageJsonPath = packageJsonPathCandidates.find((candidate) =>
  existsSync(candidate)
);

if (!packageJsonPath) {
  throw new Error("Unable to locate package.json for CLI version.");
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

program
  .name("cnzr")
  .description("Cenzero Framework CLI")
  .version(packageJson.version);

program
  .command("new <project-name>")
  .description("Create a new Cenzero project")
  .option("-t, --template <template>", "Project template (basic, fullstack)", "basic")
  .action(createProject);

program
  .command("dev")
  .description("Start development server")
  .option("-p, --port <port>", "Port number", "3000")
  .option("-h, --host <host>", "Host address", "localhost")
  .option("-f, --fullstack", "Enable fullstack dev mode convenience flags", false)
  .action(devServer);

program
  .command("build")
  .description("Build the project for production")
  .option('-o, --output <dir>', 'Output directory', 'dist')
  .action(buildProject);

program
  .command("generate <route-name>")
  .alias("g")
  .description("Generate a new route handler")
  .option("-m, --method <method>", "HTTP method (get, post, put, delete)", "get")
  .option("-p, --path <path>", "Route path", undefined)
  .option("-d, --dir <directory>", "Output directory", "src/routes")
  .option(
    "-t, --template <template>",
    "Template type (basic, api, crud, fullstack, error)",
    "basic"
  )
  .option("-s, --status <code>", "HTTP status code for error template", "404")
  .action((routeName: string, options: any) => {
    generateRoute(routeName, {
      method: options.method,
      path: options.path || `/${routeName}`,
      dir: options.dir,
      template: options.template,
      statusCode: options.status,
    });
  });

program.parse();
