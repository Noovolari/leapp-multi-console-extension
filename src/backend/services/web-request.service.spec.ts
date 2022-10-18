import { describe, beforeEach, afterAll, test, jest, expect } from "@jest/globals";
import { WebRequestService } from "./web-request.service";

describe("ExtensionStateService", () => {
  let service: any;
  let chromeWebRequest: any;
  let extensionStateService: any;

  beforeEach(() => {
    chromeWebRequest = {};
    extensionStateService = {};
    service = new WebRequestService(chromeWebRequest, extensionStateService);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("fetching, is fetching", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2022, 1, 1, 0, 0, 0, 899));
    service.fetchingDate = new Date(2022, 1, 1, 0, 0, 0, 0);

    expect(service.fetching).toBe(true);
  });

  test("fetching, is not fetching", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2022, 1, 1, 0, 0, 0, 900));
    service.fetchingDate = new Date(2022, 1, 1, 0, 0, 0, 0);

    expect(service.fetching).toBe(false);
  });

  test("", () => {
    const expectedFilterUrls = ["https://*.awsapps.com/*", "https://*.cloudfront.net/*", "https://*.aws.amazon.com/*"];
    chromeWebRequest.onBeforeSendHeaders = {
      addListener: jest.fn((callback, filter, extraInfo) => {
        expect(callback("before-headers-data")).toBe("beforeHeadersCallback");
        expect(filter).toEqual({ urls: expectedFilterUrls });
        expect(extraInfo).toEqual(["blocking", "requestHeaders", "extraHeaders"]);
      }),
    };
    chromeWebRequest.onHeadersReceived = {
      addListener: jest.fn((callback, filter, extraInfo) => {
        expect(callback("headers-received-data")).toBe("headersReceivedCallback");
        expect(filter).toEqual({ urls: expectedFilterUrls });
        expect(extraInfo).toEqual(["blocking", "responseHeaders", "extraHeaders"]);
      }),
    };

    service.onBeforeSendHeadersCallback = jest.fn(() => "beforeHeadersCallback");
    service.onHeadersReceivedCallback = jest.fn(() => "headersReceivedCallback");
    service.listen();

    expect(chromeWebRequest.onBeforeSendHeaders.addListener).toHaveBeenCalled();
    expect(chromeWebRequest.onHeadersReceived.addListener).toHaveBeenCalled();
    expect(service.onBeforeSendHeadersCallback).toHaveBeenCalledWith("before-headers-data");
    expect(service.onHeadersReceivedCallback).toHaveBeenCalledWith("headers-received-data");
  });

  test("onHeadersReceivedCallback, tabId = 0", () => {
    const data = { tabId: 0 };
    expect(service.onHeadersReceivedCallback(data)).toBe(undefined);
  });

  test("onHeadersReceivedCallback, tabId > 0, tabSessionId = undefined", () => {
    const data = { tabId: 1, responseHeaders: "fake-response-headers" };
    service.state = { getSessionIdByTabId: jest.fn(() => undefined) };

    expect(service.onHeadersReceivedCallback(data)).toBe(undefined);
    expect(service.state.getSessionIdByTabId).toHaveBeenCalledWith(data.tabId);
    expect(service.fetchingDate).toEqual(new Date(0));
  });

  test("onHeadersReceivedCallback, tabId > 0, tabSessionId = 0", () => {
    const data = { tabId: 1, responseHeaders: "fake-response-headers" };
    service.state = { getSessionIdByTabId: jest.fn(() => 0) };

    expect(service.onHeadersReceivedCallback(data)).toBe(undefined);
    expect(service.state.getSessionIdByTabId).toHaveBeenCalledWith(data.tabId);
    expect(service.fetchingDate).toEqual(new Date(0));
  });

  test("onHeadersReceivedCallback, tabId > 0", () => {
    const data = { tabId: 1, responseHeaders: [{ name: "OTHER" }, { name: "SET-COOKIE", value: "fake-cookie-value" }] };
    service.state = { getSessionIdByTabId: jest.fn(() => 123) };

    jest.useFakeTimers();
    jest.setSystemTime(new Date(2022, 1, 1, 0, 0, 0, 0));

    const result = service.onHeadersReceivedCallback(data);
    expect(service.state.getSessionIdByTabId).toHaveBeenCalledWith(data.tabId);
    expect(service.fetchingDate).toEqual(new Date(2022, 1, 1, 0, 0, 0, 0));
    expect(data.responseHeaders).toEqual([{ name: "OTHER" }, { name: "SET-COOKIE", value: "##LEAPP##123##fake-cookie-value" }]);
    expect(result).toEqual({ responseHeaders: data.responseHeaders });
  });

  test("onBeforeSendHeadersCallback, tabId = 0", () => {
    const data = { tabId: 0 };
    expect(service.onBeforeSendHeadersCallback(data)).toBe(undefined);
  });

  test("onBeforeSendHeadersCallback, tabId > 0, tabSessionId != 0", () => {
    const data = { tabId: 1, requestHeaders: [{ name: "OTHER" }, { name: "COOKIE", value: "value1; ##LEAPP##123##fake-cookie-value" }] };
    service.state = { getSessionIdByTabId: jest.fn(() => 123) };
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2022, 1, 1, 0, 0, 0, 0));

    const result = service.onBeforeSendHeadersCallback(data);
    expect(service.state.getSessionIdByTabId).toHaveBeenCalledWith(data.tabId);
    expect(service.fetchingDate).toEqual(new Date(2022, 1, 1, 0, 0, 0, 0));
    expect(data.requestHeaders).toEqual([{ name: "OTHER" }, { name: "COOKIE", value: "fake-cookie-value" }]);
    expect(result).toEqual({ requestHeaders: data.requestHeaders });
  });

  test("onBeforeSendHeadersCallback, tabId > 0, tabSessionId = 0", () => {
    const data = { tabId: 1, requestHeaders: [{ name: "OTHER" }, { name: "COOKIE", value: "value1; ##LEAPP##123##fake-cookie-value" }] };
    service.state = { getSessionIdByTabId: jest.fn(() => 0) };

    const result = service.onBeforeSendHeadersCallback(data);
    expect(service.state.getSessionIdByTabId).toHaveBeenCalledWith(data.tabId);
    expect(service.fetchingDate).toEqual(new Date(0));
    expect(data.requestHeaders).toEqual([{ name: "OTHER" }, { name: "COOKIE", value: "value1" }]);
    expect(result).toEqual({ requestHeaders: data.requestHeaders });
  });

  test("onBeforeSendHeadersCallback, tabId > 0, tabSessionId = undefineds", () => {
    const data = { tabId: 1, requestHeaders: [{ name: "OTHER" }, { name: "COOKIE", value: "value1; ##LEAPP##123##fake-cookie-value" }] };
    service.state = { getSessionIdByTabId: jest.fn(() => undefined) };

    const result = service.onBeforeSendHeadersCallback(data);
    expect(service.state.getSessionIdByTabId).toHaveBeenCalledWith(data.tabId);
    expect(service.fetchingDate).toEqual(new Date(0));
    expect(data.requestHeaders).toEqual([{ name: "OTHER" }, { name: "COOKIE", value: "value1" }]);
    expect(result).toEqual({ requestHeaders: data.requestHeaders });
  });
});
