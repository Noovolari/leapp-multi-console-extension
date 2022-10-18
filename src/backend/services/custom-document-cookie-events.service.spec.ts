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

  test("sessionToken", () => {
    service.sessionToken = "fake-session-token";
    expect(service.sessionToken).toBe("fake-session-token");
  });

  test("listen, not in chrome", () => {
    state.isChrome = false;
  });
});
