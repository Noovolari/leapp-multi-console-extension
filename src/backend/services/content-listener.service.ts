import { ExtensionStateService } from "./extension-state.service";
import Port = chrome.runtime.Port;
import * as constants from "../models/constants";

export class ContentListenerService {
  constructor(private chromeRuntime: typeof chrome.runtime, private state: ExtensionStateService) {}

  listen() {
    this.chromeRuntime.onConnect.addListener((port: Port) => {
      port.onMessage.addListener((message: any) => {
        if (message.request == "get-ses-num") {
          if (port.sender.tab) {
            let sessionToken = "";
            const sessionId = this.state.getSessionIdByTabId(port.sender.tab.id);
            if (sessionId !== constants.defaultSessionId && sessionId) {
              sessionToken = `${constants.leappToken}${sessionId}${constants.separatorToken}`;
            }
            port.postMessage({
              request: "extract-session-number",
              content: sessionToken,
              separator: constants.separatorToken,
            });
          }
        }
      });
    });
  }
}
