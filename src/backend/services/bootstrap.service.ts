import { ExtensionStateService } from "./extension-state.service";
import * as constants from "../models/constants";

export class BootstrapService {
  constructor(private windowNamespace: typeof window, private chromeNamespace: typeof chrome, private state: ExtensionStateService) {}

  listen(): void {
    this.windowNamespace.onload = () => {
      this.state.createNewIsolatedSession(constants.defaultSessionId, null);
      this.chromeNamespace.tabs.query({ windowId: this.chromeNamespace.windows.WINDOW_ID_CURRENT }, (tabs) => {
        // Assign all current tabs to default session id (0)
        for (const tab of tabs) {
          this.state.addTabToSession(tab.id, constants.defaultSessionId);
        }
        // Remove all Leapp cookies
        this.chromeNamespace.cookies.getAll({}, (cookies: any[]) => {
          for (const cookie of cookies) {
            if (cookie.name.startsWith(constants.leappToken)) {
              const cookieProtocol = cookie.secure ? "https://" : "http://";
              const cookieURL = cookieProtocol + cookie.domain + cookie.path;
              this.chromeNamespace.cookies.remove({ url: cookieURL, name: cookie.name }, (_: any) => {});
            }
          }
        });
      });
    };
    this.chromeNamespace.runtime.setUninstallURL("https://docs.leapp.cloud/latest/built-in-features/multi-console/#uninstall-the-extension");
  }
}
