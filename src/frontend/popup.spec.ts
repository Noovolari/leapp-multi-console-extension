import { jest, describe, afterEach, test, expect } from "@jest/globals";

describe("popup", () => {
  let messageCallback;
  let globalNamespace;
  let containerElement;
  let rowElements;
  let elementCallback;

  beforeEach(async () => {
    jest.mock("./popup.css", () => {});

    globalNamespace = global as any;
    globalNamespace.chrome = {
      runtime: {
        connect: jest.fn(),
        sendMessage: jest.fn((_, callback) => {
          messageCallback = callback;
        }),
      },
    };
    containerElement = { innerHTML: "" };
    rowElements = {
      forEach: jest.fn((callback) => {
        elementCallback = callback;
      }),
    };
    globalNamespace.document = { getElementById: jest.fn(() => containerElement), querySelectorAll: jest.fn(() => rowElements) };

    await import("./popup");
    expect(globalNamespace.chrome.runtime.connect).toHaveBeenCalledWith({ name: "background-connection" });
    expect(globalNamespace.chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: "session-list-request" }, expect.anything());
  });

  afterEach(() => {
    jest.resetModules();
  });

  test("sessions without tabs", function () {
    const sessions = [{ tabsList: [1, 2, 3] }, { data: "data", tabsList: [] }, { data: "data", tabsList: [] }];
    messageCallback(JSON.stringify(sessions));

    expect(globalNamespace.document.getElementById).toHaveBeenCalledWith("container");
    expect(containerElement.innerHTML).toBe('<p class="first-launch">Start by opening a session from Leapp</p>');
  });

  test("session with tabs", function () {
    const sessions = [
      { tabsList: [1, 2, 3] },
      { data: "data", tabsList: [] },
      {
        data: {
          sessionName: "fake-session-name",
          sessionRole: "fake-session-role",
          sessionRegion: "fake-session-region",
          sessionType: "fake-session-type",
        },
        tabsList: [4, 5],
      },
    ];
    messageCallback(JSON.stringify(sessions));

    expect(globalNamespace.document.getElementById).toHaveBeenCalledWith("container");
    expect(globalNamespace.document.querySelectorAll).toHaveBeenCalledWith(".row");
    const expectedHtml =
      '<div class="row" data-session-id="2">\n' +
      '                <img src="icons/fake-session-type.png" alt="provider-icon">\n' +
      '                <div class="session-info-container">\n' +
      '                    <p class="session-name">Name: fake-session-name</p>\n' +
      '                    <p class="session-role">Role: fake-session-role</p>\n' +
      "                </div>\n" +
      '                <div class="badge-container">\n' +
      '                    <span class="badge badge-gray badge-region">fake-session-region</span>\n' +
      "                </div>\n" +
      "              </div>";
    expect(containerElement.innerHTML).toBe(expectedHtml);

    let clickCallback;
    const rowElement = {
      addEventListener: jest.fn((_, callback) => {
        clickCallback = callback;
      }),
      getAttribute: jest.fn(() => 2),
    };
    elementCallback(rowElement);
    expect(rowElement.addEventListener).toHaveBeenCalledWith("click", expect.anything());

    const event = { stopPropagation: jest.fn() };
    clickCallback(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(rowElement.getAttribute).toHaveBeenCalledWith("data-session-id");
    expect(chrome.runtime.sendMessage).toHaveBeenNthCalledWith(2, { type: "focus-tab", tabId: 4 }, expect.anything());
    messageCallback();
  });
});
