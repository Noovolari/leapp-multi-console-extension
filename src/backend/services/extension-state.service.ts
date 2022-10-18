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

  get isChrome(): boolean {
    return this.userAgent.includes("Chrome");
  }

  get isFirefox(): boolean {
    return this.userAgent.includes("Mozilla");
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

  createNewIsolatedSession(sessionId: number, leappSession: LeappSessionInfo): void {
    const newIsolatedSession: IsolatedSession = { sessionId, leappSession, tabsList: [] };
    this.isolatedSessions.push(newIsolatedSession);
  }

  addTabToSession(tabId: number, sessionId: number): void {
    this.isolatedSessions.find((isolatedSession) => isolatedSession.sessionId === sessionId).tabsList.push(tabId);
    this.hashedSessions[tabId] = sessionId;
  }

  removeTabFromSession(tabIdToRemove: number): void {
    const sessionId = this.hashedSessions[tabIdToRemove];
    const isolatedSession = this.isolatedSessions.find((isolatedSession) => isolatedSession.sessionId === sessionId);
    isolatedSession.tabsList = isolatedSession.tabsList.filter((tabId) => tabId !== tabIdToRemove);
    delete this.hashedSessions[tabIdToRemove];
  }
}
