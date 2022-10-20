import { BootstrapService } from "./bootstrap.service";

describe("BootstrapService", () => {
  let windowNamespace: any;
  let chromeNamespace: any;
  let state: any;
  let service: any;

  const tabs = [{ id: 123 }, { id: 456 }, { id: 789 }];
  const cookies = [
    {
      name: "##LEAPP##fake-name-1",
      secure: true,
      domain: "fake-domain-1",
      path: "fake-path-1",
    },
    {
      name: "##LEAPP##fake-name-2",
      secure: false,
      domain: "fake-domain-2",
      path: "fake-path-2",
    },
    {
      name: "fake-name-3",
    },
  ];

  beforeEach(() => {
    windowNamespace = { onload: undefined };
    chromeNamespace = {
      tabs: { query: jest.fn((_queryInfo, callback) => callback(tabs)) },
      windows: { WINDOW_ID_CURRENT: 123 },
      cookies: { getAll: jest.fn((_details, callback) => callback(cookies)), remove: jest.fn((_details, callback) => callback()) },
    };
    state = {
      createNewIsolatedSession: jest.fn(),
      addTabToSession: jest.fn(),
    };
    service = new BootstrapService(windowNamespace, chromeNamespace, state);
  });

  test("listen", () => {
    service.listen();
    expect(windowNamespace.onload).not.toBe(undefined);

    windowNamespace.onload();

    expect(state.createNewIsolatedSession).toHaveBeenCalledWith(0, null);
    expect(chromeNamespace.tabs.query).toHaveBeenCalledWith({ windowId: 123 }, expect.any(Function));
    expect(state.addTabToSession).toHaveBeenNthCalledWith(1, 123, 0);
    expect(state.addTabToSession).toHaveBeenNthCalledWith(2, 456, 0);
    expect(state.addTabToSession).toHaveBeenNthCalledWith(3, 789, 0);
    expect(chromeNamespace.cookies.getAll).toHaveBeenCalledWith({}, expect.any(Function));
    expect(chromeNamespace.cookies.remove).toHaveBeenCalledTimes(2);
    expect(chromeNamespace.cookies.remove).toHaveBeenNthCalledWith(
      1,
      {
        url: "https://fake-domain-1fake-path-1",
        name: "##LEAPP##fake-name-1",
      },
      expect.any(Function)
    );
    expect(chromeNamespace.cookies.remove).toHaveBeenNthCalledWith(
      2,
      {
        url: "http://fake-domain-2fake-path-2",
        name: "##LEAPP##fake-name-2",
      },
      expect.any(Function)
    );
  });
});
