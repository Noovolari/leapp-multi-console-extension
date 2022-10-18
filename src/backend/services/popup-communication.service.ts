import { ExtensionStateService } from "./extension-state.service";
import { focusTab, sessionListRequest } from "../models/constants";

export class PopupCommunicationService {
  constructor(private chromeNamespace: typeof chrome, private state: ExtensionStateService) {}

  listen() {
    this.chromeNamespace.runtime.onMessage.addListener((request, _, sendResponse) => this.onMessageCallback(request, sendResponse));
  }

  private onMessageCallback(request, sendResponse) {
    if (request.type === sessionListRequest) {
      const activeSessions = this.state.isolatedSessions.map((session) => {
        return {
          data: session.leappSession,
          tabsList: session.tabsList,
        };
      });
      sendResponse(JSON.stringify(activeSessions));
    }
    if (request.type === focusTab) {
      const updateProperties = { active: true };
      const tabId = request.tabId;
      this.chromeNamespace.tabs.update(tabId, updateProperties, (_) => {});
      sendResponse("done");
    }
  }
}
