import { TabControllerService } from "./tab-controller.service";

describe("TabControllerService", () => {
  let chromeNamespace: any;
  let state: any;
  let service: any;

  const tab = { openerTabId: "fake-opener-tab-id", id: 456 };
  const window = { id: "fake-window-id" };
  const tabWithoutOpenerTabId = { id: 789 };
  let tabId;

  beforeEach(() => {
    tabId = 123;
    chromeNamespace = {
      tabs: {
        create: jest.fn(),
        onCreated: { addListener: jest.fn((callback) => callback(tab)) },
        onRemoved: {
          addListener: jest.fn((callback) => {
            callback(tabId);
          }),
        },
        update: jest.fn(),
      },
      windows: {
        update: jest.fn(),
        getCurrent: jest.fn((callback) => callback(window)),
      },
    };
    state = {
      sessionCounter: 0,
      createNewIsolatedSession: jest.fn(),
      nextSessionId: -1,
      addTabToSession: jest.fn(),
      removeTabFromSession: jest.fn(),
      getSessionIdByTabId: jest.fn(() => 147),
      setCookieStoreId: jest.fn(),
      getTabIdByLeappSessionId: jest.fn(() => tabId),
    };

    service = new TabControllerService(chromeNamespace, state);
  });

  test("getBrowser", () => {
    (global as any).browser = "browser";
    const browser = service.getBrowser();
    expect(browser).toBe("browser");
  });

  test("openOrFocusSessionTab, tabId is defined", () => {
    const leappSessionId = "fake-leapp-session-id";
    const leappPayload: any = { fakeKey: "fake-value", url: "fake-url" };
    service.focusSessionTab = jest.fn();
    service.openOrFocusSessionTab(leappPayload, leappSessionId);
    expect(state.createNewIsolatedSession).toHaveBeenCalledWith(0, { ...leappPayload, url: undefined }, leappSessionId);
    expect(state.nextSessionId).toBe(0);
    expect(state.getTabIdByLeappSessionId).toHaveBeenCalledWith(leappSessionId);
    expect(service.focusSessionTab).toHaveBeenCalledWith(tabId);
  });

  test("openOrFocusSessionTab, tabId is undefined", () => {
    tabId = undefined;
    const leappSessionId = "fake-leapp-session-id-2";
    const leappPayload: any = {};
    service.openSessionTab = jest.fn();
    service.openOrFocusSessionTab(leappPayload, leappSessionId);
    expect(state.createNewIsolatedSession).toHaveBeenCalledWith(0, { ...leappPayload, url: undefined }, leappSessionId);
    expect(state.nextSessionId).toBe(0);
    expect(state.getTabIdByLeappSessionId).toHaveBeenCalledWith(leappSessionId);
    expect(service.openSessionTab).toHaveBeenCalledWith(0, leappPayload);
  });

  test("openOrFocusSessionTab, no Leapp Session Id for retrocompatibility", () => {
    const leappSessionId = undefined;
    const leappPayload: any = {};
    service.openSessionTab = jest.fn();
    service.openOrFocusSessionTab(leappPayload, leappSessionId);
    expect(state.createNewIsolatedSession).toHaveBeenCalledWith(0, { ...leappPayload, url: undefined }, leappSessionId);
    expect(state.nextSessionId).toBe(0);
    expect(service.openSessionTab).toHaveBeenCalledWith(0, leappPayload);
  });

  test("openSessionTab, isChrome returns true", () => {
    const leappPayload: any = { sessionName: "fake-name", sessionRole: "fake-role", url: "fake-url" };
    state.isChrome = true;
    service.newChromeSessionTab = jest.fn();
    service.openSessionTab("fake-session-id" as any, leappPayload);
    expect(service.newChromeSessionTab).toHaveBeenCalledWith("fake-url");
  });

  test("openSessionTab, isChrome returns false", () => {
    const sessionId = "fake-session-id";
    const leappPayload: any = { sessionName: "fake-name", sessionRole: "fake-role", url: "fake-url" };
    state.isChrome = false;
    service.newFirefoxSessionTab = jest.fn(() => ({ then: jest.fn() }));
    service.openSessionTab("fake-session-id" as any, leappPayload);
    expect(service.newFirefoxSessionTab).toHaveBeenCalledWith("fake-url", `${leappPayload.sessionName} (${leappPayload.sessionRole})`, sessionId);
  });

  test("focusSessionTab", () => {
    const tabId = 2;
    service.updateOnTabFocus = jest.fn();
    service.focusSessionTab(tabId);
    expect(chromeNamespace.windows.getCurrent).toHaveBeenCalled();
    expect(service.updateOnTabFocus).toHaveBeenCalledWith(window, tabId);
  });

  test("updateOnTabFocus", () => {
    const tabId = 2;
    service.updateOnTabFocus(window, tabId);
    expect(chromeNamespace.windows.update).toHaveBeenCalledWith(window.id, { focused: true });
    expect(chromeNamespace.tabs.update).toHaveBeenCalledWith(tabId, { active: true }, expect.any(Function));
  });

  test("newChromeSessionTab", () => {
    const url = "fake-url";
    service.newChromeSessionTab(url);

    expect(chromeNamespace.tabs.create).toHaveBeenCalledWith({ url: "fake-url" });
  });

  test("newFirefoxSessionTab", async () => {
    const sessionId = "fake-session-id";
    const url = "fake-url";
    const containerName = "fake-container-key";
    const container = { cookieStoreId: "fake-cookie-store-id" };
    const browser = {
      contextualIdentities: { create: jest.fn(() => container) },
      tabs: { create: jest.fn() },
    };
    state.setCookieStoreId = jest.fn(() => {});
    service.getBrowser = jest.fn(() => browser);

    await service.newFirefoxSessionTab(url, containerName, sessionId);

    expect(browser.contextualIdentities.create).toHaveBeenCalledWith({ name: containerName, color: "orange", icon: "circle" });
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url,
      cookieStoreId: container.cookieStoreId,
    });
    expect(state.setCookieStoreId).toHaveBeenCalledWith(sessionId, container.cookieStoreId);
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
