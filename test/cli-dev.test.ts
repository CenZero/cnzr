jest.mock("child_process", () => ({
  spawn: jest.fn(),
}));

import { spawn } from "child_process";
import { devServer } from "../src/cli/commands/dev";

describe("CLI dev command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.removeAllListeners("SIGINT");
  });

  afterEach(() => {
    process.removeAllListeners("SIGINT");
  });

  test("passes fullstack env flags when --fullstack is enabled", () => {
    (spawn as unknown as jest.Mock).mockReturnValue({
      on: jest.fn(),
      kill: jest.fn(),
    });

    devServer({ port: "3100", host: "127.0.0.1", fullstack: true });

    expect(spawn).toHaveBeenCalledTimes(1);
    const call = (spawn as unknown as jest.Mock).mock.calls[0];
    expect(call[0]).toBe("npx");
    expect(call[1]).toEqual(["ts-node", "src/index.ts"]);
    expect(call[2].env.FULLSTACK_MODE).toBe("true");
    expect(call[2].env.ENABLE_FILE_ROUTING).toBe("true");
    expect(call[2].env.PORT).toBe("3100");
    expect(call[2].env.HOST).toBe("127.0.0.1");
  });

  test("sets non-fullstack env flags when fullstack mode is not enabled", () => {
    (spawn as unknown as jest.Mock).mockReturnValue({
      on: jest.fn(),
      kill: jest.fn(),
    });

    devServer({ port: "3200", host: "localhost", fullstack: false });

    const call = (spawn as unknown as jest.Mock).mock.calls[0];
    expect(call[2].env.FULLSTACK_MODE).toBe("false");
    expect(call[2].env.ENABLE_FILE_ROUTING).toBe("false");
  });
});

