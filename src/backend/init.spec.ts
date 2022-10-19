import init from "./init";
import { ExtensionStateService } from "./services/extension-state.service";

describe("init", () => {
  jest.mock("./services/extension-state.service");

  test("prova", () => {
    (global as any).navigator = "fake-navigator";
    init();

    expect(ExtensionStateService).toHaveBeenCalledWith("fake-navigator");
  });
});
