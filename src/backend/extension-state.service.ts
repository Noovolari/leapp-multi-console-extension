import { LeappSessionInfo } from "./leapp-session-info";

export class ExtensionStateService {
  private readonly userAgent: string;
  private readonly hashedSessions: number[];
  private readonly leappActiveSessions: LeappSessionInfo[];
  private _sessionCounter: number;
  private _nextSessionId: number;

  constructor(navigator: Navigator) {
    this.leappActiveSessions = [];
    this.hashedSessions = [];
    this._sessionCounter = 1;
    this._nextSessionId = 0;
    this.userAgent = navigator.userAgent;
  }

  get isChrome(): boolean {
    return this.userAgent.indexOf("Chrome") > 0;
  }

  get isFirefox(): boolean {
    return this.userAgent.indexOf("Mozilla") > 0;
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

  setSessionIdByTabId(tabId: number, sessionId: number): void {
    this.hashedSessions[tabId] = sessionId;
  }

  setLeappActiveSession(sessionId: number, leappSessionInfo: LeappSessionInfo): void {
    this.leappActiveSessions[sessionId] = leappSessionInfo;
  }

  addTabToSession(tabId: number, sessionId: number): void {
    this.hashedSessions[tabId] = sessionId;
  }

  removeTabFromSession(tabIdToRemove: number): void {
    delete this.hashedSessions[tabIdToRemove];
  }
}
