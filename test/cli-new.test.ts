import { readFile, rm, access } from "fs/promises";
import { join } from "path";
import { createProject } from "../src/cli/commands/new";

describe("CLI new command", () => {
  const projectName = "cnzr-new-app";
  const projectPath = join(process.cwd(), projectName);

  afterEach(async () => {
    await rm(projectPath, { recursive: true, force: true });
  });

  test("scaffolds project with cnzr 2.0 template", async () => {
    await createProject(projectName, {});

    const pkgRaw = await readFile(join(projectPath, "package.json"), "utf-8");
    const pkg = JSON.parse(pkgRaw);

    expect(pkg.dependencies.cnzr).toBe("^2.0.0");

    const indexRaw = await readFile(join(projectPath, "src", "index.ts"), "utf-8");
    expect(indexRaw).toContain("from 'cnzr'");

    // Verify scaffolded structure
    expect(await exists(join(projectPath, "src"))).toBe(true);
    expect(await exists(join(projectPath, "public", "index.html"))).toBe(true);
    expect(await exists(join(projectPath, "views"))).toBe(true);
    expect(await exists(join(projectPath, "tsconfig.json"))).toBe(true);
  });

  test("accepts custom metadata options", async () => {
    await createProject(projectName, { description: "Demo app" });

    const pkgRaw = await readFile(join(projectPath, "package.json"), "utf-8");
    const pkg = JSON.parse(pkgRaw);

    expect(pkg.description).toBe("Demo app");
  });
});

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
