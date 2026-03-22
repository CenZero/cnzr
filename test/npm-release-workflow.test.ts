import { readFile } from "fs/promises";
import { join } from "path";

describe("npm release deployment workflow", () => {
  test("defines release-triggered npm publish deployment", async () => {
    const workflowPath = join(
      process.cwd(),
      ".github",
      "workflows",
      "npm-release.yml"
    );
    const workflow = await readFile(workflowPath, "utf-8");

    expect(workflow).toContain("release:");
    expect(workflow).toContain("types: [published]");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("npm ci");
    expect(workflow).toContain("npm run build");
    expect(workflow).toContain("npm test -- --runInBand");
    expect(workflow).toContain("npm publish --provenance --access public");
    expect(workflow).toContain("NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}");
  });
});
