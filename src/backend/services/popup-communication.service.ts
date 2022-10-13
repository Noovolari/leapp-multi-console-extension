import { ExtensionStateService } from "./extension-state.service";
import { focusTab, sessionListRequest } from "../models/constants";

export class PopupCommunicationService {
  constructor(private chromeRuntime: typeof chrome.runtime, private state: ExtensionStateService) {}

  listen() {
    chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
      if (request.type === sessionListRequest) {
        const activeSessions = this.state.isolatedSessions.map((session) => {
          return {
            data: session.leappSession,
            tabsList: session.tabsList,
          };
        });
        console.log(JSON.stringify(activeSessions));
        sendResponse(JSON.stringify(activeSessions));
      }
      if (request.type === focusTab) {
        const updateProperties = { active: true };
        const tabId = request.tabId;
        chrome.tabs.update(tabId, updateProperties, (_) => {});
        sendResponse("done");
      }
    });
  }
}
