import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import {
  diagnostics,
  PerformanceProfiler,
  colors,
  RequestTimer,
  SimpleFileWatcher,
  sleep,
} from "../src/utils/dev-utils";

describe("Dev tools utilities", () => {
  test("diagnostics should return environment info", () => {
    const info = diagnostics.getEnvInfo();
    expect(info.nodeVersion).toBe(process.version);
    expect(info.platform).toBe(process.platform);
  });

  test("diagnostics should check required env vars", () => {
    process.env.CNZR_TEST_PRESENT = "yes";
    const result = diagnostics.checkRequiredEnvVars([
      "CNZR_TEST_PRESENT",
      "CNZR_TEST_MISSING",
    ]);
    expect(result.present).toContain("CNZR_TEST_PRESENT");
    expect(result.missing).toContain("CNZR_TEST_MISSING");
  });

  test("performance profiler should collect samples", async () => {
    const profiler = new PerformanceProfiler();
    profiler.start("work");
    await sleep(10);
    const duration = profiler.end("work");
    expect(duration).toBeGreaterThanOrEqual(0);

    const stats = profiler.getStats("work");
    expect(stats).not.toBeNull();
    expect(stats!.count).toBe(1);
  });

  test("colors helper should wrap ANSI codes", () => {
    expect(colors.error("x")).toContain("\x1b[31m");
    expect(colors.success("x")).toContain("\x1b[32m");
    expect(colors.warn("x")).toContain("\x1b[33m");
    expect(colors.info("x")).toContain("\x1b[36m");
  });

  test("request timer should measure marks", async () => {
    const timer = new RequestTimer("test");
    timer.mark("a");
    await sleep(5);
    timer.mark("b");
    const between = timer.getMarkDuration("a", "b");
    expect(between).toBeGreaterThanOrEqual(0);
    expect(timer.getReport().label).toBe("test");
  });

  test("simple file watcher should watch and unwatch", async () => {
    const watcher = new SimpleFileWatcher();
    const file = join(process.cwd(), "tmp-watch-file.txt");
    await writeFile(file, "hello");

    const unwatch = watcher.watch(file, () => undefined);
    expect(typeof unwatch).toBe("function");
    unwatch();
    watcher.unwatchAll();

    await unlink(file);
  });
});
