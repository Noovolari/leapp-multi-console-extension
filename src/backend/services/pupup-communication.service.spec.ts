import { describe, beforeEach, test, expect } from "@jest/globals";
import { PopupCommunicationService } from "./popup-communication.service";

describe("PopupCommunicationService", () => {
  let service: any;
  let chrome: any;
  let state: any;

  beforeEach(() => {
    chrome = {};
    state = {};
    service = new PopupCommunicationService(chrome, state);
  });

  test("listen", () => {
    chrome.runtime = {
      onMessage: {
        addListener: jest.fn((callback) => {
          expect(callback("request", "send-response")).toBe("callback-return-value");
        }),
      },
    };
    service.onMessageCallback = jest.fn(() => "callback-return-value");
    service.listen();
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
  });

  test("onMessageCallback, session-list-request", () => {
    state.isolatedSessions = [{ leappSession: "fake-session", tabsList: "fake-tabs-list" }];

    const sendResponse = jest.fn();
    service.onMessageCallback({ type: "session-list-request" }, sendResponse);
    expect(sendResponse).toHaveBeenCalledWith('[{"data":"fake-session","tabsList":"fake-tabs-list"}]');
  });

  test("onMessageCallback, focus-tab", () => {
    chrome.tabs = {
      update: jest.fn((tabId, updateProperties, callback) => {
        expect(tabId).toBe("fake-tab-id");
        expect(updateProperties).toEqual({ active: true });
        expect(callback()).toBe(undefined);
      }),
    };
    const sendResponse = jest.fn();
    service.onMessageCallback({ type: "focus-tab", tabId: "fake-tab-id" }, sendResponse);
    expect(sendResponse).toHaveBeenCalledWith("done");
  });
});
