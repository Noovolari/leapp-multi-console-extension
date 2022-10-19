import { jest } from "@jest/globals";

describe("BackgroundScript", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("extensionStateService.isChrome === true", async () => {
    const initProviders = await import("./init-providers");
    const providers = {
      extensionStateService: { isChrome: true },
      webRequestService: { listen: jest.fn() },
      tabControllerService: { listen: jest.fn() },
      bootstrapService: { listen: jest.fn() },
      internalCommunicationService: { listenToContentScriptConnection: jest.fn() },
      popupCommunicationService: { listen: jest.fn() },
      webSocketService: { listen: jest.fn() },
    } as any;
    jest.spyOn(initProviders, "initProviders").mockImplementation(() => providers);

    await import("./background-script");

    expect(providers.webRequestService.listen).toHaveBeenCalled();
    expect(providers.tabControllerService.listen).toHaveBeenCalled();
    expect(providers.bootstrapService.listen).toHaveBeenCalled();
    expect(providers.internalCommunicationService.listenToContentScriptConnection).toHaveBeenCalled();
    expect(providers.popupCommunicationService.listen).toHaveBeenCalled();
    expect(providers.webSocketService.listen).toHaveBeenCalled();
  });

  test("extensionStateService.isChrome === false", async () => {
    const initProviders = await import("./init-providers");

    const providers = {
      extensionStateService: { isChrome: false },
      webRequestService: { listen: jest.fn() },
      tabControllerService: { listen: jest.fn() },
      bootstrapService: { listen: jest.fn() },
      internalCommunicationService: { listenToContentScriptConnection: jest.fn() },
      popupCommunicationService: { listen: jest.fn() },
      webSocketService: { listen: jest.fn() },
    } as any;
    jest.spyOn(initProviders, "initProviders").mockImplementation(() => providers);

    await import("./background-script");

    expect(providers.webRequestService.listen).not.toHaveBeenCalled();
    expect(providers.tabControllerService.listen).toHaveBeenCalled();
    expect(providers.bootstrapService.listen).toHaveBeenCalled();
    expect(providers.internalCommunicationService.listenToContentScriptConnection).toHaveBeenCalled();
    expect(providers.popupCommunicationService.listen).toHaveBeenCalled();
    expect(providers.webSocketService.listen).toHaveBeenCalled();
  });
});
