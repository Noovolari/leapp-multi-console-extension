import { ExtractSessionIdService } from "./extract-session-id.service";

describe("ExtractSessionIdService", () => {
  const port = {
    onMessage: { addListener: jest.fn() },
    onDisconnect: { addListener: jest.fn((callback) => callback()) },
    postMessage: jest.fn(),
  };
  let internalCommunicationService: any;
  let state: any;
  let service: any;

  beforeEach(() => {
    internalCommunicationService = { connectToBackgroundScript: jest.fn(() => port) };
    state = { sessionToken: undefined };
    service = new ExtractSessionIdService(internalCommunicationService, state);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test.each([
    {
      testName: "message.request === sessionIdResponse, content defined",
      message: {
        request: "session-id-response",
        content: "fake-content",
      },
      expectedSessionToken: "fake-content",
    },
    {
      testName: "message.request === sessionIdResponse, content undefined",
      message: {
        request: "session-id-response",
        content: undefined,
      },
      expectedSessionToken: undefined,
    },
    {
      testName: "message.request !== sessionIdResponse, content defined",
      message: {
        request: "fake-request",
        content: "fake-content",
      },
      expectedSessionToken: undefined,
    },
    {
      testName: "message.request !== sessionIdResponse, content undefined",
      message: {
        request: "fake-request",
        content: undefined,
      },
      expectedSessionToken: undefined,
    },
  ])("listen - $testName", ({ message, expectedSessionToken }) => {
    port.onMessage.addListener.mockImplementationOnce((callback) => callback(message));

    service.listen();

    expect(internalCommunicationService.connectToBackgroundScript).toHaveBeenCalled();
    expect(port.onMessage.addListener).toHaveBeenCalledWith(expect.any(Function));
    expect(state.sessionToken).toBe(expectedSessionToken);
    expect(port.onDisconnect.addListener).toHaveBeenCalledWith(expect.any(Function));
    expect(port.postMessage).toHaveBeenCalledWith({ request: "session-id-request" });
  });

  test("listen - error", () => {
    const error = new Error("generic error");
    port.onMessage.addListener.mockImplementationOnce(() => {
      throw error;
    });
    jest.spyOn(global.console, "error").mockImplementationOnce(jest.fn());

    service.listen();

    expect(console.error).toHaveBeenCalledWith(error);
  });
});
