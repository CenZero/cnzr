import {
  diagnostics,
  PerformanceProfiler,
  colors,
  RequestTimer,
  SimpleFileWatcher,
} from "../src/index";

describe("framework index exports", () => {
  test("should export new dev utils from main entrypoint", () => {
    expect(typeof diagnostics.getEnvInfo).toBe("function");
    expect(typeof PerformanceProfiler).toBe("function");
    expect(typeof colors.info).toBe("function");
    expect(typeof RequestTimer).toBe("function");
    expect(typeof SimpleFileWatcher).toBe("function");
  });
});

