import { jest, describe, afterEach, test, expect } from "@jest/globals";

describe("ContentScript", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("extensionStateService.isChrome === true", async () => {
    const initProviders = await import("./init-providers");
    const providers = {
      extensionStateService: { isChrome: true },
      customDocumentCookieEventsService: { listen: jest.fn() },
      extractSessionIdService: { listen: jest.fn() },
    } as any;
    jest.spyOn(initProviders, "initProviders").mockImplementation(() => providers);

    await import("./content-script");

    expect(providers.extractSessionIdService.listen).toHaveBeenCalled();
  });

  test("extensionStateService.isChrome === false", async () => {
    const initProviders = await import("./init-providers");

    const providers = {
      extensionStateService: { isChrome: false },
      customDocumentCookieEventsService: { listen: jest.fn() },
      extractSessionIdService: { listen: jest.fn() },
    } as any;
    jest.spyOn(initProviders, "initProviders").mockImplementation(() => providers);

    await import("./content-script");

    expect(providers.customDocumentCookieEventsService.listen).not.toHaveBeenCalled();
    expect(providers.extractSessionIdService.listen).toHaveBeenCalled();
  });
});
