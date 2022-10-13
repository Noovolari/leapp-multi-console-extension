import { LeappSessionInfo } from "../models/leapp-session-info";
import { ExtensionStateService } from "./extension-state.service";
import Port = chrome.runtime.Port;

export class PopupCommunicationService {
  private readonly port: Port;

  constructor(private chromeRuntime: typeof chrome.runtime, private state: ExtensionStateService) {}

  listen() {
    chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
      if (request.type === "get-leapp-sessions") {
        const activeSessions = this.state.isolatedSessions.map((session) => {
          return {
            data: session.leappSession,
            tabsList: session.tabsList,
          };
        });
        console.log(JSON.stringify(activeSessions));
        sendResponse(JSON.stringify(activeSessions));
      }
    });
  }

  sendMessageToPopup(message: LeappSessionInfo): void {
    this.chromeRuntime.sendMessage({ msg: "add-leapp-session", data: message });
  }
}
