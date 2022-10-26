import { ExtensionStateService } from "./extension-state.service";
import * as constants from "../models/constants";

export class InternalCommunicationService {
  constructor(private chromeRuntime: typeof chrome.runtime, private state: ExtensionStateService) {}

  listenToContentScriptConnection(): void {
    this.chromeRuntime.onConnect.addListener((port: any) => {
      port.onMessage.addListener((message: any) => {
        this.routeMessage(port, message);
      });
    });
  }

  private routeMessage(port: any, message: any) {
    if (message.request === constants.sessionIdRequest) {
      this.handleGetSessionId(port);
    } else if (message.request === "set-cookies-request") {
      this.state.setSingleCookieState(message.cookies, message.sessionTokenId);
      console.log("Receiving cookies from content script");
      console.log(new Date().getTime());
      console.log(message.cookies);
    }
  }

  private handleGetSessionId(port: any): void {
    if (port.sender.tab) {
      let sessionToken = "";
      const sessionId = this.state.getSessionIdByTabId(port.sender.tab.id);
      if (sessionId !== constants.defaultSessionId && sessionId) {
        sessionToken = `${constants.leappToken}${sessionId}${constants.separatorToken}`;
      }
      port.postMessage({
        request: constants.sessionIdResponse,
        content: sessionToken,
      });
    }
  }
}
