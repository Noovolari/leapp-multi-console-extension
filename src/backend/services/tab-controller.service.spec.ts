import { TabControllerService } from "./tab-controller.service";

describe("TabControllerService", () => {
  let chromeNamespace: any;
  let state: any;
  let service: any;

  const tab = { openerTabId: "fake-opener-tab-id", id: 456 };
  const tabWithoutOpenerTabId = { id: 789 };
  const tabId = 123;

  beforeEach(() => {
    chromeNamespace = {
      tabs: {
        create: jest.fn(),
        onCreated: { addListener: jest.fn((callback) => callback(tab)) },
        onRemoved: {
          addListener: jest.fn((callback) => {
            callback(tabId);
          }),
        },
      },
    };
    state = {
      sessionCounter: 0,
      createNewIsolatedSession: jest.fn(),
      nextSessionId: -1,
      addTabToSession: jest.fn(),
      removeTabFromSession: jest.fn(),
      getSessionIdByTabId: jest.fn(() => 147),
    };

    service = new TabControllerService(chromeNamespace, state);
  });

  test("openNewSessionTab, isChrome returns true", () => {
    const leappPayload: any = { fakeKey: "fake-value", url: "fake-url" };
    state.isChrome = true;
    service.newChromeSessionTab = jest.fn();
    service.openNewSessionTab(leappPayload);

    expect(state.createNewIsolatedSession).toHaveBeenCalledWith(0, { ...leappPayload, url: undefined });
    expect(state.nextSessionId).toBe(0);
    expect(service.newChromeSessionTab).toHaveBeenCalledWith("fake-url");
  });

  test("openNewSessionTab, isChrome returns false", () => {
    const leappPayload: any = { fakeKey: "fake-value", url: "fake-url" };
    state.isChrome = false;
    service.newFirefoxSessionTab = jest.fn(() => ({ then: jest.fn() }));
    service.openNewSessionTab(leappPayload);

    expect(state.createNewIsolatedSession).toHaveBeenCalledWith(0, { ...leappPayload, url: undefined });
    expect(state.nextSessionId).toBe(0);
    expect(service.newFirefoxSessionTab).toHaveBeenCalledWith("fake-url", "session-0");
  });

  test("newChromeSessionTab", () => {
    const url = "fake-url";
    service.newChromeSessionTab(url);

    expect(chromeNamespace.tabs.create).toHaveBeenCalledWith({ url: "fake-url" });
  });

  test("newFirefoxSessionTab", async () => {
    const url = "fake-url";
    const sessionKey = "fake-session-key";
    const container = { cookieStoreId: "fake-cookie-store-id" };
    const browser = {
      contextualIdentities: { create: jest.fn(() => container) },
      tabs: { create: jest.fn() },
    };
    service.getBrowser = jest.fn(() => browser);

    await service.newFirefoxSessionTab(url, sessionKey);

    expect(browser.contextualIdentities.create).toHaveBeenCalledWith({ name: sessionKey, color: "orange", icon: "circle" });
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url,
      cookieStoreId: container.cookieStoreId,
    });
  });

  test("listen", () => {
    service.handleCreated = jest.fn();
    service.handleRemoved = jest.fn();
    service.listen();
    expect(chromeNamespace.tabs.onCreated.addListener).toHaveBeenCalled();
    expect(chromeNamespace.tabs.onRemoved.addListener).toHaveBeenCalled();
    expect(service.handleCreated).toHaveBeenCalledWith(tab);
    expect(service.handleRemoved).toHaveBeenCalledWith(tabId);
  });

  test("handleCreated, tab has openerTabId defined", () => {
    jest.spyOn(global.console, "log").mockImplementationOnce(jest.fn());
    service.handleCreated(tab);

    expect(state.getSessionIdByTabId).toHaveBeenCalledWith(tab.openerTabId);
    expect(state.addTabToSession).toHaveBeenCalledWith(tab.id, 147);
    expect(state.nextSessionId).toBe(0);
    expect(console.log).toHaveBeenCalledWith(`Tab ${tab.id} was created from ${tab.openerTabId}`);
  });

  test("handleCreated, tab hasn't openerTabId defined", () => {
    jest.spyOn(global.console, "log").mockImplementationOnce(jest.fn());
    service.handleCreated(tabWithoutOpenerTabId);

    expect(state.getSessionIdByTabId).not.toHaveBeenCalled();
    expect(state.addTabToSession).toHaveBeenCalledWith(tabWithoutOpenerTabId.id, -1);
    expect(state.nextSessionId).toBe(0);
    expect(console.log).toHaveBeenCalledWith(`Tab ${tabWithoutOpenerTabId.id} was created from Leapp`);
  });

  test("handleRemoved", () => {
    jest.spyOn(global.console, "log").mockImplementationOnce(jest.fn());
    service.handleRemoved(tabId);

    expect(state.removeTabFromSession).toHaveBeenCalledWith(tabId);
    expect(console.log).toHaveBeenCalledWith(`Tab ${tabId} was removed!`);
  });
});
