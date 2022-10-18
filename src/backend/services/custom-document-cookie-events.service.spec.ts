import { describe, beforeEach, test, expect } from "@jest/globals";
import { CustomDocumentCookieEventsService } from "./custom-document-cookie-events.service";

describe("CustomDocumentCookieEventsService", () => {
  let document: any;
  let localStorage: any;
  let state: any;
  let service: any;

  beforeEach(() => {
    document = {};
    localStorage = {};
    state = {};
    service = new CustomDocumentCookieEventsService(document, localStorage, state);
  });

  test("listen", () => {
    service.generateCookieSetterGetterOverwriteScript = () => "fake-js-function";
    service.injectScriptInDocument = jest.fn();
    service.customSetCookieEventHandler = jest.fn();
    service.customGetCookieEventHandler = jest.fn();

    document.addEventListener = jest.fn((_type, listener) => {
      listener("fake-event");
    });

    service.listen();
    expect(service.injectScriptInDocument).toHaveBeenCalledWith("fake-js-function");
    expect(document.addEventListener).toHaveBeenCalledTimes(2);
    expect(document.addEventListener).toHaveBeenNthCalledWith(1, "SET_COOKIE", expect.anything());
    expect(document.addEventListener).toHaveBeenNthCalledWith(2, "GET_COOKIE", expect.anything());
    expect(service.customSetCookieEventHandler).toHaveBeenCalledWith("fake-event");
    expect(service.customGetCookieEventHandler).toHaveBeenCalledWith();
  });

  test("injectScriptInDocument, document head found", () => {
    const scriptElement = { appendChild: jest.fn(), parentNode: { removeChild: jest.fn() } };
    document.createElement = jest.fn(() => scriptElement);
    document.createTextNode = jest.fn(() => "fake-text-node");
    document.head = { appendChild: jest.fn() };
    document.documentElement = undefined;

    service.injectScriptInDocument("fake-js-script");

    expect(document.createElement).toHaveBeenCalledWith("script");
    expect(document.createTextNode).toHaveBeenCalledWith("fake-js-script");
    expect(scriptElement.appendChild).toHaveBeenCalledWith("fake-text-node");
    expect(document.head.appendChild).toHaveBeenCalledWith(scriptElement);
    expect(scriptElement.parentNode.removeChild).toHaveBeenCalledWith(scriptElement);
  });

  test("injectScriptInDocument, document head not found", () => {
    const scriptElement = { appendChild: jest.fn(), parentNode: { removeChild: jest.fn() } };
    document.createElement = jest.fn(() => scriptElement);
    document.createTextNode = jest.fn(() => "fake-text-node");
    document.head = undefined;
    document.documentElement = { appendChild: jest.fn() };

    service.injectScriptInDocument("fake-js-script");

    expect(document.createElement).toHaveBeenCalledWith("script");
    expect(document.createTextNode).toHaveBeenCalledWith("fake-js-script");
    expect(scriptElement.appendChild).toHaveBeenCalledWith("fake-text-node");
    expect(document.documentElement.appendChild).toHaveBeenCalledWith(scriptElement);
    expect(scriptElement.parentNode.removeChild).toHaveBeenCalledWith(scriptElement);
  });

  test("generateCookieSetterGetterOverwriteScript", () => {
    const script = service.generateCookieSetterGetterOverwriteScript();
    const expectedScript =
      "(function () {\n" +
      '      Object.defineProperty(document, "cookie", {\n' +
      "        set: cookieToSet => {\n" +
      `          const event = new CustomEvent("SET_COOKIE", {\n` +
      "            detail: cookieToSet\n" +
      "          });\n" +
      "          document.dispatchEvent(event);\n" +
      "        },\n" +
      "        get: () => {\n" +
      `          const event = new CustomEvent("GET_COOKIE");\n` +
      "          document.dispatchEvent(event);\n" +
      "          let cookies;\n" +
      "\n" +
      "          try {\n" +
      `            cookies = localStorage.getItem("##SESSION-COOKIES##");\n` +
      `            localStorage.removeItem("##SESSION-COOKIES##");\n` +
      "          } catch (e) {\n" +
      `            cookies = document.getElementById("##SESSION-COOKIES##").innerText;\n` +
      "          }\n" +
      "\n" +
      "          return cookies;\n" +
      "        }\n" +
      "      });\n" +
      "    })();";
    expect(script).toBe(expectedScript);
  });

  test("customSetCookieEventHandler, sessionToken null", () => {
    state.sessionToken = null;
    service.customSetCookieEventHandler({ detail: "fake-cookie" });
    expect(document.cookie).toBe("fake-cookie");
  });

  test("customSetCookieEventHandler, sessionToken empty", () => {
    state.sessionToken = "";
    service.customSetCookieEventHandler({ detail: "fake-cookie" });
    expect(document.cookie).toBe("fake-cookie");
  });

  test("customSetCookieEventHandler, sessionToken undefined", () => {
    state.sessionToken = undefined;
    service.customSetCookieEventHandler({ detail: " fake-cookie " });
    expect(document.cookie).toBe(" fake-cookie ");
  });

  test("customSetCookieEventHandler, sessionToken defined", () => {
    state.sessionToken = "sessionToken";
    service.customSetCookieEventHandler({ detail: " fake-cookie " });
    expect(document.cookie).toBe("sessionTokenfake-cookie");
  });
});
