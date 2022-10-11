import { ExtensionStateService } from "./extension-state.service";
import Cookie = chrome.cookies.Cookie;
import Details = chrome.cookies.Details;
import * as constants from "./constants";

export class BootstrapService {
  private readonly defaultSessionId = 0;

  constructor(private windowNamespace: typeof window, private chromeNamespace: typeof chrome, private state: ExtensionStateService) {}

  listen(): void {
    this.windowNamespace.onload = () => {
      // Add the first, default session
      //const sessionKey = `session-0`;
      //this.state.sessionDictionary[sessionKey] = [];
      //this.state.addNewSession();

      this.chromeNamespace.tabs.query({ windowId: this.chromeNamespace.windows.WINDOW_ID_CURRENT }, (tabs) => {
        for (const tab of tabs) {
          this.state.hashedSessions[tab.id] = this.defaultSessionId;
          //this.state.sessionDictionary[`session-1`].push(tab.id);
          //this.state.addTabToSession(tab.id, this.defaultSessionId);
        }
        this.chromeNamespace.cookies.getAll({}, (cookies: Cookie[]) => {
          for (const cookie of cookies) {
            if (cookie.name.startsWith(constants.leappToken)) {
              const cookieProtocol = cookie.secure ? "https://" : "http://";
              const cookieURL = cookieProtocol + cookie.domain + cookie.path;
              this.chromeNamespace.cookies.remove({ url: cookieURL, name: cookie.name }, (_: Details) => {});
            }
          }
        });
      });
    };
  }
}
