import { SessionDictionary } from "./session-dictionary";

export class ExtensionStateService {
  public userAgent: string;

  constructor(
    public sessionCounter: number,
    public selectedSessionKey: number,
    public sessionDictionary: SessionDictionary,
    public currentSessionGlobal: number,
    public lastSessionGlobal: number,
    public hashedSessions: string[],
    navigator: Navigator
  ) {
    this.userAgent = navigator.userAgent;
    this.sessionCounter = 1;
    this.selectedSessionKey = 0;
    this.sessionDictionary = {};
    this.currentSessionGlobal = 0;
    this.lastSessionGlobal = 0;
    this.hashedSessions = [];
  }

  // Return the numeric id only
  getTabSessionId(tabId: number): string {
    return this.hashedSessions[tabId];
  }

  // Return the session name for the tab id
  getTabSessionName(requestedTabId: number): string {
    return (
      Object.keys(this.sessionDictionary).find((key) => {
        for (const tabId of this.sessionDictionary[key]) {
          if (this.sessionDictionary[key][tabId] === requestedTabId) return key;
        }
      }) ?? ""
    );
  }
}
