import init from "./init";
jest.mock("./init");

describe("ContentScript", () => {
  afterEach(() => {
    jest.resetModules();
  });

  test("extensionStateService.isChrome === true", () => {
    const providers = {
      extensionStateService: { isChrome: true },
      customDocumentCookieEventsService: { listen: jest.fn() },
      extractSessionIdService: { listen: jest.fn() },
    };
    (global as any).window = { providers };

    require("./content-script");

    expect(init).toHaveBeenCalled();
    expect(providers.customDocumentCookieEventsService.listen).toHaveBeenCalled();
    expect(providers.extractSessionIdService.listen).toHaveBeenCalled();
  });

  test("extensionStateService.isChrome === false", async () => {
    const providers = {
      extensionStateService: { isChrome: false },
      customDocumentCookieEventsService: { listen: jest.fn() },
      extractSessionIdService: { listen: jest.fn() },
    };
    (global as any).window = { providers };

    require("./content-script");

    expect(init).toHaveBeenCalled();
    expect(providers.customDocumentCookieEventsService.listen).not.toHaveBeenCalled();
    expect(providers.extractSessionIdService.listen).toHaveBeenCalled();
  });
});
