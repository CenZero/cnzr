import { access, readFile, rm } from "fs/promises";
import { join } from "path";
import { constants } from "fs";
import { generateRoute } from "../src/cli/commands/generate";

declare const describe: any;
declare const test: any;
declare const beforeEach: any;
declare const afterEach: any;
declare const expect: any;

describe("CLI Route Generator", () => {
  const testDir = join(process.cwd(), "test-routes");

  beforeEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
  });

  afterEach(async () => {
    // Clean up after tests
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore errors
    }
  });

  test("should generate basic route template", async () => {
    const routeName = "testRoute";

    await generateRoute(routeName, {
      method: "get",
      path: "/test",
      dir: testDir,
      template: "basic",
    });

    const filePath = join(testDir, `${routeName}.ts`);
    const exists = await fileExists(filePath);

    expect(exists).toBe(true);
  });

  test("should generate API route template", async () => {
    const routeName = "apiRoute";

    await generateRoute(routeName, {
      method: "post",
      path: "/api/test",
      dir: testDir,
      template: "api",
    });

    const filePath = join(testDir, `${routeName}.ts`);
    const exists = await fileExists(filePath);

    expect(exists).toBe(true);
  });

  test("should generate CRUD route template", async () => {
    const routeName = "product";

    await generateRoute(routeName, {
      method: "get",
      path: "/products",
      dir: testDir,
      template: "crud",
    });

    const filePath = join(testDir, `${routeName}.ts`);
    const exists = await fileExists(filePath);

    expect(exists).toBe(true);
  });

  test("should create directory if not exists", async () => {
    const routeName = "nested";
    const nestedDir = join(testDir, "api", "v1");

    await generateRoute(routeName, {
      method: "get",
      path: "/nested",
      dir: nestedDir,
      template: "basic",
    });

    const filePath = join(nestedDir, `${routeName}.ts`);
    const exists = await fileExists(filePath);

    expect(exists).toBe(true);
  });

  test("should generate fullstack route template", async () => {
    const routeName = "dashboard";

    await generateRoute(routeName, {
      method: "get",
      path: "/dashboard",
      dir: testDir,
      template: "fullstack" as any,
    });

    const filePath = join(testDir, `${routeName}.ts`);
    const exists = await fileExists(filePath);
    expect(exists).toBe(true);

    const content = await readFile(filePath, "utf-8");
    expect(content).toContain("export async function dashboardPage");
    expect(content).toContain("export async function dashboardData");
    expect(content).toContain('fetch("/dashboard/data")');
  });

  test("should use default options when not provided", async () => {
    const routeName = "defaultRoute";

    await generateRoute(routeName, {});

    // Should use default dir (src/routes)
    const defaultPath = join(process.cwd(), "src", "routes", `${routeName}.ts`);
    
    // Clean up
    try {
      await rm(join(process.cwd(), "src", "routes"), { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });
});

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
