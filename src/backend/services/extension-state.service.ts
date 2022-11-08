import { LeappSessionInfo } from "../models/leapp-session-info";
import { IsolatedSession } from "../models/isolated-session";

export class ExtensionStateService {
  private readonly userAgent: string;
  private readonly hashedSessions: number[];
  public isolatedSessions: IsolatedSession[];
  private _sessionToken: string;
  private _sessionCounter: number;
  private _nextSessionId: number;

  constructor(navigator: Navigator) {
    this.isolatedSessions = [];
    this.hashedSessions = [];
    this._sessionCounter = 1;
    this._nextSessionId = 0;
    this.userAgent = navigator.userAgent;
  }

  getBrowser(): any {
    return browser;
  }

  get isChrome(): boolean {
    return this.userAgent.includes("Chrome");
  }

  get isFirefox(): boolean {
    return this.userAgent.includes("Firefox");
  }

  set sessionToken(value: string) {
    this._sessionToken = value;
  }

  get sessionToken(): string {
    return this._sessionToken;
  }

  get sessionCounter(): number {
    return this._sessionCounter;
  }

  set sessionCounter(sessionCounter: number) {
    this._sessionCounter = sessionCounter;
  }

  get nextSessionId(): number {
    return this._nextSessionId;
  }

  set nextSessionId(nextSessionId: number) {
    this._nextSessionId = nextSessionId;
  }

  getSessionIdByTabId(tabId: number): number {
    return this.hashedSessions[tabId];
  }

  createNewIsolatedSession(sessionId: number, leappSession: LeappSessionInfo, leappSessionId?: string): void {
    if (!leappSessionId || !this.isolatedSessions.find((is) => is.leappSessionId === leappSessionId)) {
      const newIsolatedSession: IsolatedSession = { sessionId, leappSession, tabsList: [] };
      this.isolatedSessions.push(newIsolatedSession);
      this.setLeappSessionId(sessionId, leappSessionId);
    }
  }

  addTabToSession(tabId: number, sessionId: number): void {
    this.isolatedSessions.find((isolatedSession) => isolatedSession.sessionId === sessionId).tabsList.push(tabId);
    this.hashedSessions[tabId] = sessionId;
  }

  removeTabFromSession(tabIdToRemove: number): void {
    const sessionId = this.hashedSessions[tabIdToRemove];
    const isolatedSession = this.isolatedSessions.find((isolatedSession) => isolatedSession.sessionId === sessionId);
    isolatedSession.tabsList = isolatedSession.tabsList.filter((tabId) => tabId !== tabIdToRemove);
    if (isolatedSession.tabsList.length === 0) {
      isolatedSession.leappSessionId = undefined;
    }
    this.hashedSessions[tabIdToRemove] = undefined;
    if (this.isFirefox && isolatedSession.tabsList.length === 0) {
      this.getBrowser()
        .contextualIdentities.remove(isolatedSession.cookieStoreId)
        .then(() => {});
    }
  }

  setCookieStoreId(sessionId: number, cookieStoreId: string): void {
    const selectedIsolatedSession = this.isolatedSessions.find((isolatedSession) => isolatedSession.sessionId === sessionId);
    selectedIsolatedSession.cookieStoreId = cookieStoreId;
  }

  setLeappSessionId(sessionId: number, leappSessionId?: string): void {
    const selectedIsolatedSession = this.isolatedSessions.find((isolatedSession) => isolatedSession.sessionId === sessionId);
    selectedIsolatedSession.leappSessionId = leappSessionId;
  }

  getTabIdByLeappSessionId(leappSessionId: string): number | undefined {
    const isolatedSession = this.isolatedSessions.find((isolatedSession) => isolatedSession.leappSessionId === leappSessionId);
    if (isolatedSession) {
      return isolatedSession.tabsList[0];
    } else {
      return undefined;
    }
  }
}
