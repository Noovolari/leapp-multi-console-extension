import { describe, beforeEach, test, expect } from "@jest/globals";
import { ExtensionStateService } from "./extension-state.service";

describe("ExtensionStateService", () => {
  let service: any;

  beforeEach(() => {
    service = new ExtensionStateService({} as any, {} as any);
  });

  test("constructor", () => {
    const service = new ExtensionStateService({ userAgent: "user-agent" } as any, {} as any) as any;
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
    service.userAgent = "some text Mozilla some other";
    expect(service.isFirefox).toBe(true);
  });

  test("isFirefox", () => {
    service.userAgent = "some text mozilla some other";
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

  test("removeTabFromSession", () => {
    service.hashedSessions = [10, 20, 30, 20];

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
});
