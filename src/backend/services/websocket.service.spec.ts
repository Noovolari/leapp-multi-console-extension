import { WebsocketService } from "./websocket.service";

describe("WebsocketService", () => {
  let tabControllerService: any;
  let webRequestService: any;
  let service: any;

  const webSocket: any = class {
    constructor(url) {
      expect(url).toBe("ws://localhost:8095");
    }
  };

  beforeEach(() => {
    tabControllerService = { openNewSessionTab: jest.fn() };
    webRequestService = { fetching: "fake-fetching" };

    service = new WebsocketService(tabControllerService, webRequestService, webSocket);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("listen", () => {
    const fakeWebSocket = {
      onopen: undefined,
      onmessage: undefined,
      send: jest.fn(),
      onclose: undefined,
      onerror: undefined,
    };
    jest.spyOn(global.console, "log").mockImplementation(jest.fn());
    service.createWebsocket = jest.fn(() => fakeWebSocket);
    const realSetInterval = setInterval;
    (setInterval as any) = jest.fn((callback) => callback());

    service.listen();

    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 6000);
    expect(console.log).toHaveBeenNthCalledWith(1, "checking if connected");
    expect(service.createWebsocket).toHaveBeenCalledWith(8095);
    expect(service.ws.onopen).toStrictEqual(expect.any(Function));
    expect(service.ws.onmessage).toStrictEqual(expect.any(Function));
    expect(service.ws.onclose).toStrictEqual(expect.any(Function));
    expect(service.ws.onerror).toStrictEqual(expect.any(Function));

    service.ws.onopen();
    expect(service.connected).toBe(true);
    expect(console.log).toHaveBeenCalledWith("connecting to websocket...");

    service.ws.onmessage({ data: '{"type":"create-new-session","sessionInfo":"fake-session-info"}' });
    expect(tabControllerService.openNewSessionTab).toHaveBeenCalledWith("fake-session-info");
    expect(service.ws.send).toHaveBeenNthCalledWith(1, JSON.stringify({ type: "success", msg: "payload from Leapp received correctly" }));

    service.ws.onmessage({ data: '{"type":"get-fetching-state"}' });
    expect(service.ws.send).toHaveBeenNthCalledWith(2, JSON.stringify({ type: "send-fetching-state", fetching: "fake-fetching" }));

    service.ws.onclose();
    expect(service.connected).toBe(false);
    expect(console.log).toHaveBeenCalledWith("closing...");

    service.ws.onerror();
    expect(service.connected).toBe(false);
    expect(console.log).toHaveBeenCalledWith("can't connect!");

    (setInterval as any) = realSetInterval;
  });

  test("createWebsocket", () => {
    const actualWebSocket = service.createWebsocket(8095);

    expect(actualWebSocket).toBeInstanceOf(webSocket);
  });
});