import { beforeEach } from "@jest/globals";
import { InternalCommunicationService } from "./internal-communication.service";

describe("InternalCommunicationService", () => {
  let chromeRuntime: any;
  let state: any;
  let service: any;
  let port;
  beforeEach(() => {
    port = {
      onMessage: {
        addListener: jest.fn((callback) => {
          callback("message");
        }),
      },
    };
    chromeRuntime = {
      onConnect: {
        addListener: jest.fn((callback) => {
          callback(port);
        }),
      },
      connect: jest.fn(() => "fake-connection"),
    };
    state = {
      getSessionIdByTabId: jest.fn(),
    };
    service = new InternalCommunicationService(chromeRuntime, state);
  });

  test("listenToContentScriptConnection", () => {
    service.routeMessage = jest.fn();
    service.listenToContentScriptConnection();

    expect(chromeRuntime.onConnect.addListener).toHaveBeenCalled();
    expect(service.routeMessage).toHaveBeenCalledWith(port, "message");
  });

  test("connectToBackgroundScript", () => {
    service.backgroundScriptConnectionName = "fake-background-script-connection-name";
    const result = service.connectToBackgroundScript();

    expect(chromeRuntime.connect).toHaveBeenCalledWith({ name: service.backgroundScriptConnectionName });
    expect(result).toBe("fake-connection");
  });

  test("routeMessage, message.request is session-id-request", () => {
    const port = "port";
    const message = { request: "session-id-request" };
    service.handleGetSessionId = jest.fn();
    service.routeMessage(port, message);

    expect(service.handleGetSessionId).toHaveBeenCalledWith(port);
  });

  test("routeMessage, message.request isn't session-id-request", () => {
    const port = "port";
    const message = { request: "not-session-id-request" };
    service.handleGetSessionId = jest.fn();
    service.routeMessage(port, message);

    expect(service.handleGetSessionId).not.toHaveBeenCalled();
  });

  test("handleGetSessionId, port.sender.tab is null", () => {
    const port = { sender: {}, postMessage: jest.fn() };
    service.handleGetSessionId(port);

    expect(state.getSessionIdByTabId).not.toHaveBeenCalled();
    expect(port.postMessage).not.toHaveBeenCalled();
  });

  test("handleGetSessionId, port.sender.tab exists, and sessionId is defined and equal to constants.defaultSessionId", () => {
    const port = { sender: { tab: { id: "fake-tab-id" } }, postMessage: jest.fn() };
    state.getSessionIdByTabId.mockImplementationOnce(() => 0);
    service.handleGetSessionId(port);

    expect(state.getSessionIdByTabId).toHaveBeenCalledWith("fake-tab-id");
    expect(port.postMessage).toHaveBeenCalledWith({
      request: "session-id-response",
      content: "",
    });
  });

  test("handleGetSessionId, port.sender.tab exists, and sessionId is defined and different from constants.defaultSessionId", () => {
    const port = { sender: { tab: { id: "fake-tab-id" } }, postMessage: jest.fn() };
    state.getSessionIdByTabId.mockImplementationOnce(() => 1);
    service.handleGetSessionId(port);

    expect(state.getSessionIdByTabId).toHaveBeenCalledWith("fake-tab-id");
    expect(port.postMessage).toHaveBeenCalledWith({
      request: "session-id-response",
      content: "##LEAPP##1##",
    });
  });

  test("handleGetSessionId, port.sender.tab exists, and sessionId is not defined and equal from constants.defaultSessionId", () => {
    const port = { sender: { tab: { id: "fake-tab-id" } }, postMessage: jest.fn() };
    state.getSessionIdByTabId.mockImplementationOnce(() => undefined);
    service.handleGetSessionId(port);

    expect(state.getSessionIdByTabId).toHaveBeenCalledWith("fake-tab-id");
    expect(port.postMessage).toHaveBeenCalledWith({
      request: "session-id-response",
      content: "",
    });
  });
});
