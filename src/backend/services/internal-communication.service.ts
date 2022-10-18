import { ExtensionStateService } from "./extension-state.service";
import * as constants from "../models/constants";

export class InternalCommunicationService {
  backgroundScriptConnectionName: string;

  constructor(private chromeRuntime: typeof chrome.runtime, private state: ExtensionStateService) {
    this.backgroundScriptConnectionName = "background-script-connection";
  }

  listenToContentScriptConnection(): void {
    this.chromeRuntime.onConnect.addListener((port: any) => {
      port.onMessage.addListener((message: any) => {
        this.routeMessage(port, message);
      });
    });
  }

  connectToBackgroundScript(): any {
    return this.chromeRuntime.connect({ name: this.backgroundScriptConnectionName });
  }

  private routeMessage(port: any, message: any) {
    if (message.request == constants.sessionIdRequest) {
      this.handleGetSessionId(port);
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
