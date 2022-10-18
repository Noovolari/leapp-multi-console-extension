import { describe, beforeEach, test, expect } from "@jest/globals";
import { ContentListenerService } from "./content-listener.service";

describe("ContentListenerService", () => {
  let service: any;
  let chromeRuntime: any;
  let state: any;

  beforeEach(() => {
    chromeRuntime = {};
    state = {};
    service = new ContentListenerService(chromeRuntime, state);
  });

  test("listen", () => {
    const port = {
      onMessage: {
        addListener: jest.fn((callback) => {
          callback("message");
        }),
      },
    };
    chromeRuntime.onConnect = {
      addListener: jest.fn((callback) => {
        callback(port);
      }),
    };

    service.onMessageCallback = jest.fn();
    service.listen();

    expect(chromeRuntime.onConnect.addListener).toHaveBeenCalled();
    expect(port.onMessage.addListener).toHaveBeenCalled();
    expect(service.onMessageCallback).toHaveBeenCalledWith(port, "message");
  });

  test("onMessageCallback, unsupported request", () => {
    service.onMessageCallback(null, { request: "unsupported" });
  });

  test("onMessageCallback, get-ses-num request, no port sender tab", () => {
    const port = { sender: { tab: undefined } };
    service.onMessageCallback(port, { request: "get-ses-num" });
  });

  test("onMessageCallback, get-ses-num request, no sessionId", () => {
    state.getSessionIdByTabId = jest.fn(() => undefined);
    const port = { sender: { tab: { id: 123 } }, postMessage: jest.fn() };

    service.onMessageCallback(port, { request: "get-ses-num" });

    expect(state.getSessionIdByTabId).toHaveBeenCalledWith(port.sender.tab.id);
    expect(port.postMessage).toHaveBeenCalledWith({ content: "", request: "extract-session-number", separator: "##" });
  });

  test("onMessageCallback, get-ses-num request, default sessionId", () => {
    state.getSessionIdByTabId = jest.fn(() => 0);
    const port = { sender: { tab: { id: 123 } }, postMessage: jest.fn() };

    service.onMessageCallback(port, { request: "get-ses-num" });

    expect(state.getSessionIdByTabId).toHaveBeenCalledWith(port.sender.tab.id);
    expect(port.postMessage).toHaveBeenCalledWith({ content: "", request: "extract-session-number", separator: "##" });
  });

  test("onMessageCallback, get-ses-num request", () => {
    state.getSessionIdByTabId = jest.fn(() => 10);
    const port = { sender: { tab: { id: 123 } }, postMessage: jest.fn() };

    service.onMessageCallback(port, { request: "get-ses-num" });

    expect(state.getSessionIdByTabId).toHaveBeenCalledWith(port.sender.tab.id);
    expect(port.postMessage).toHaveBeenCalledWith({ content: "##LEAPP##10##", request: "extract-session-number", separator: "##" });
  });
});
