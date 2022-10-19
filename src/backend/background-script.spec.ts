import init from "./init";
jest.mock("./init");

describe("BackgroundScript", () => {
  afterEach(() => {
    jest.resetModules();
  });

  test("extensionStateService.isChrome === true", () => {
    const providers = {
      extensionStateService: { isChrome: true },
      webRequestService: { listen: jest.fn() },
      tabControllerService: { listen: jest.fn() },
      bootstrapService: { listen: jest.fn() },
      internalCommunicationService: { listenToContentScriptConnection: jest.fn() },
      popupCommunicationService: { listen: jest.fn() },
      webSocketService: { listen: jest.fn() },
    };
    (global as any).window = { providers };

    require("./background-script");

    expect(init).toHaveBeenCalled();
    expect(providers.webRequestService.listen).toHaveBeenCalled();
    expect(providers.tabControllerService.listen).toHaveBeenCalled();
    expect(providers.bootstrapService.listen).toHaveBeenCalled();
    expect(providers.internalCommunicationService.listenToContentScriptConnection).toHaveBeenCalled();
    expect(providers.popupCommunicationService.listen).toHaveBeenCalled();
    expect(providers.webSocketService.listen).toHaveBeenCalled();
  });

  test("extensionStateService.isChrome === false", async () => {
    const providers = {
      extensionStateService: { isChrome: false },
      webRequestService: { listen: jest.fn() },
      tabControllerService: { listen: jest.fn() },
      bootstrapService: { listen: jest.fn() },
      internalCommunicationService: { listenToContentScriptConnection: jest.fn() },
      popupCommunicationService: { listen: jest.fn() },
      webSocketService: { listen: jest.fn() },
    };
    (global as any).window = { providers };

    require("./background-script");

    expect(init).toHaveBeenCalled();
    expect(providers.webRequestService.listen).not.toHaveBeenCalled();
    expect(providers.tabControllerService.listen).toHaveBeenCalled();
    expect(providers.bootstrapService.listen).toHaveBeenCalled();
    expect(providers.internalCommunicationService.listenToContentScriptConnection).toHaveBeenCalled();
    expect(providers.popupCommunicationService.listen).toHaveBeenCalled();
    expect(providers.webSocketService.listen).toHaveBeenCalled();
  });
});
