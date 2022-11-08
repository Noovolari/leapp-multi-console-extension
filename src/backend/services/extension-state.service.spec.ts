import { describe, beforeEach, test, expect } from "@jest/globals";
import { ExtensionStateService } from "./extension-state.service";

describe("ExtensionStateService", () => {
  let service: any;

  beforeEach(() => {
    service = new ExtensionStateService({} as any);
  });

  test("constructor", () => {
    const service = new ExtensionStateService({ userAgent: "user-agent" } as any) as any;
    expect(service.userAgent).toBe("user-agent");
  });

  test("isChrome", () => {
    service.userAgent = "some text Chrome some other";
    expect(service.isChrome).toBe(true);
  });

  test("isChrome false", () => {
    service.userAgent = "some text chrome some other";
    expect(service.isChrome).toBe(false);
  });

  test("isFirefox", () => {
    service.userAgent = "some text Firefox some other";
    expect(service.isFirefox).toBe(true);
  });

  test("isFirefox false", () => {
    service.userAgent = "some text firefox some other";
    expect(service.isFirefox).toBe(false);
  });

  test("sessionToken", () => {
    service.sessionToken = "fake-session-token";
    expect(service.sessionToken).toBe("fake-session-token");
  });

  test("sessionCounter", () => {
    service.sessionCounter = 42;
    expect(service.sessionCounter).toBe(42);
  });

  test("nextSessionId", () => {
    service.nextSessionId = 42;
    expect(service.nextSessionId).toBe(42);
  });

  test("getSessionIdByTabId", () => {
    service.hashedSessions = [10, undefined, 30];

    expect(service.getSessionIdByTabId(0)).toBe(10);
    expect(service.getSessionIdByTabId(1)).toBeUndefined();
    expect(service.getSessionIdByTabId(2)).toBe(30);
  });

  test("createNewIsolatedSession", () => {
    service.createNewIsolatedSession(123, "fake-session-info1");
    expect(service.isolatedSessions).toEqual([{ sessionId: 123, leappSession: "fake-session-info1", tabsList: [] }]);

    service.createNewIsolatedSession(234, "fake-session-info2");
    expect(service.isolatedSessions).toEqual([
      { sessionId: 123, leappSession: "fake-session-info1", tabsList: [] },
      { sessionId: 234, leappSession: "fake-session-info2", tabsList: [] },
    ]);
  });

  test("addTabToSession", () => {
    service.isolatedSessions = [
      { sessionId: 123, tabsList: [] },
      { sessionId: 234, tabsList: [1] },
    ];

    service.addTabToSession(2, 234);

    expect(service.isolatedSessions).toEqual([
      { sessionId: 123, tabsList: [] },
      { sessionId: 234, tabsList: [1, 2] },
    ]);
    expect(service.hashedSessions).toEqual([undefined, undefined, 234]);
  });

  test("removeTabFromSession, Chrome user agent", () => {
    service.hashedSessions = [10, 20, 30, 20];
    jest.spyOn(service, "isFirefox", "get").mockImplementation(() => false);

    service.isolatedSessions = [
      { sessionId: 10, tabsList: [0] },
      { sessionId: 20, tabsList: [1, 3] },
      { sessionId: 30, tabsList: [2] },
    ];

    service.removeTabFromSession(1);

    expect(service.hashedSessions).toEqual([10, undefined, 30, 20]);
    expect(service.isolatedSessions).toEqual([
      { sessionId: 10, tabsList: [0] },
      { sessionId: 20, tabsList: [3] },
      { sessionId: 30, tabsList: [2] },
    ]);
  });

  test("removeTabFromSession, Firefox user agent, tab removed from an isolated session is not the last", () => {
    service.hashedSessions = [10, 20, 30, 20];
    jest.spyOn(service, "isFirefox", "get").mockImplementation(() => true);

    service.isolatedSessions = [
      { sessionId: 10, tabsList: [0], cookieStoreId: "firefox-container-1" },
      { sessionId: 20, tabsList: [1, 3], cookieStoreId: "firefox-container-2" },
      { sessionId: 30, tabsList: [2], cookieStoreId: "firefox-container-3" },
    ];

    service.removeTabFromSession(1);

    expect(service.hashedSessions).toEqual([10, undefined, 30, 20]);
    expect(service.isolatedSessions).toEqual([
      { sessionId: 10, tabsList: [0], cookieStoreId: "firefox-container-1" },
      { sessionId: 20, tabsList: [3], cookieStoreId: "firefox-container-2" },
      { sessionId: 30, tabsList: [2], cookieStoreId: "firefox-container-3" },
    ]);
  });

  test("removeTabFromSession, Firefox user agent, tab removed from an isolated session is the last", () => {
    service.hashedSessions = [10, 20, 30, 20];
    jest.spyOn(service, "isFirefox", "get").mockImplementation(() => true);

    service.isolatedSessions = [
      { sessionId: 10, tabsList: [0], cookieStoreId: "firefox-container-1" },
      { sessionId: 20, tabsList: [1, 3], cookieStoreId: "firefox-container-2" },
      { sessionId: 30, tabsList: [2], cookieStoreId: "firefox-container-3" },
    ];

    const removeMock = jest.fn(async () => {});
    service.getBrowser = () => ({ contextualIdentities: { remove: removeMock } });

    service.removeTabFromSession(0);

    expect(service.hashedSessions).toEqual([undefined, 20, 30, 20]);
    expect(service.isolatedSessions).toEqual([
      { sessionId: 10, tabsList: [], cookieStoreId: "firefox-container-1" },
      { sessionId: 20, tabsList: [1, 3], cookieStoreId: "firefox-container-2" },
      { sessionId: 30, tabsList: [2], cookieStoreId: "firefox-container-3" },
    ]);
    expect(removeMock).toHaveBeenCalledWith("firefox-container-1");
  });

  test("setCookieStoreId", () => {
    service.isolatedSessions = [{ sessionId: 1, tabsList: [], cookieStoreId: undefined }];
    service.setCookieStoreId(1, "firefox-container-1");
    expect(service.isolatedSessions).toEqual([{ sessionId: 1, tabsList: [], cookieStoreId: "firefox-container-1" }]);
  });

  test("getBrowser", () => {
    (global as any).browser = "browser";
    const browser = service.getBrowser();
    expect(browser).toBe("browser");
  });

  test("setLeappSessionId", () => {
    service.isolatedSessions = [{ sessionId: 1, tabsList: [], cookieStoreId: undefined, leappSessionId: undefined }];
    service.setLeappSessionId(1, "fake-leapp-session-id");
    expect(service.isolatedSessions).toEqual([{ sessionId: 1, tabsList: [], cookieStoreId: undefined, leappSessionId: "fake-leapp-session-id" }]);
  });

  test("setLeappSessionId, for retrocompatibility leappSessionId isn't set", () => {
    service.isolatedSessions = [{ sessionId: 1, tabsList: [], cookieStoreId: undefined, leappSessionId: undefined }];
    service.setLeappSessionId(1);
    expect(service.isolatedSessions).toEqual([{ sessionId: 1, tabsList: [], cookieStoreId: undefined, leappSessionId: undefined }]);
  });

  test("getTabIdByLeappSessionId", () => {
    const leappSessionId = "fake-leapp-session-id";
    service.isolatedSessions = [
      { sessionId: 0, tabsList: [3], leappSessionId: "wrong-id" },
      { sessionId: 1, tabsList: [1, 2], leappSessionId },
    ];
    const result = service.getTabIdByLeappSessionId(leappSessionId);
    expect(result).toEqual(1);
  });

  test("getTabIdByLeappSessionId, no leappSessionId found", () => {
    const leappSessionId = "wrong-leapp-session-id";
    service.isolatedSessions = [{ sessionId: 0, tabsList: [3], leappSessionId: "leapp-session-id" }];
    const result = service.getTabIdByLeappSessionId(leappSessionId);
    expect(result).toEqual(undefined);
  });
});
