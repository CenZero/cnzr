describe("Error handler module", () => {
  test("does not print ASCII banner on import", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

    jest.isolateModules(() => {
      require("../src/core/error-handler");
    });

    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
