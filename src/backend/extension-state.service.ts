import { SessionDictionary } from "./session-dictionary";

export class ExtensionStateService {
  private readonly sessionDictionary: SessionDictionary;
  private readonly hashedSessions: number[];
  private readonly userAgent: string;
  public sessionCounter: number;
  public nextSessionId: number;

  constructor(navigator: Navigator) {
    this.sessionDictionary = {};
    this.hashedSessions = [];
    this.sessionCounter = 1;
    this.nextSessionId = 0;
    this.userAgent = navigator.userAgent;
  }

  get isChrome() {
    return this.userAgent.indexOf("Chrome") > 0;
  }

  // Return the numeric id only
  getSessionIdByTabId(tabId: number): number {
    return this.hashedSessions[tabId];
  }

  addNewSession() {
    const sessionKey = `session-${this.sessionCounter}`;
    this.sessionDictionary[sessionKey] = [];
  }

  addTabToSession(tabId: number, sessionId: number) {
    this.hashedSessions[tabId] = sessionId;
    this.sessionDictionary[`session-${sessionId}`].push(tabId);
  }

  removeTabFromSession(tabIdToRemove: number) {
    const tabSessionName = this.getTabSessionName(tabIdToRemove);
    this.sessionDictionary[tabSessionName] = this.sessionDictionary[tabSessionName].filter((tabId) => tabId !== tabIdToRemove);
    delete this.hashedSessions[tabIdToRemove];
  }

  // Return the session name for the tab id
  private getTabSessionName(requestedTabId: number): string | undefined {
    return Object.keys(this.sessionDictionary).find((key) => {
      for (const tabId of this.sessionDictionary[key]) {
        if (this.sessionDictionary[key][tabId] === requestedTabId) return key;
      }
    });
  }
}
