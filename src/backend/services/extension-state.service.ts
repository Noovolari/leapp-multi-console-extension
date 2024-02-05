import { LeappSessionInfo } from "../models/leapp-session-info";
import { IsolatedSession } from "../models/isolated-session";
import * as constants from "../models/constants";

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

  removeTabFromSession(tabIdToRemove: number, cookies: any): void {
    const sessionId = this.hashedSessions[tabIdToRemove];
    const isolatedSession = this.isolatedSessions.find((isolatedSession) => isolatedSession.sessionId === sessionId);
    if (!isolatedSession) return; // Tab removed but not managed by Leapp Extension

    isolatedSession.tabsList = isolatedSession.tabsList.filter((tabId) => tabId !== tabIdToRemove);
    if (isolatedSession.tabsList.length === 0) {
      isolatedSession.leappSessionId = undefined;
      const sessionString = `${constants.leappToken}${sessionId}${constants.separatorToken}`;
      cookies.getAll({}, (unexpiredCookies: any[]) => {
        unexpiredCookies.forEach((uCookie) => {
          // If the prefix of the cookie's name matches the one specified, remove it
          if (uCookie.name.indexOf(sessionString) !== -1) {
            try {
              const cookieDomain = uCookie.domain.startsWith(".") ? uCookie.domain.substring(1) : uCookie.domain;
              // Remove the cookie
              cookies.remove({
                name: uCookie.name,
                url: "https://" + cookieDomain + uCookie.path,
              });
            } catch (error) {
              console.error(error);
            }
          }
        });
      });
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

  isSessionExpired(leappSessionId: string): boolean {
    const isolatedSession = this.isolatedSessions.find((isolatedSession) => isolatedSession.leappSessionId === leappSessionId);
    const msInASecond = 1000;
    const secondsInAMinute = 60;
    const minutesBeforeExpiration = 55;
    if (isolatedSession) {
      if (new Date().getTime() - isolatedSession.leappSession.createdAt < msInASecond * secondsInAMinute * minutesBeforeExpiration) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  updateCreatedAt(leappSessionId: string): void {
    this.isolatedSessions = this.isolatedSessions.map((isolatedSession) => {
      if (isolatedSession.leappSessionId === leappSessionId) {
        isolatedSession.leappSession.createdAt = new Date().getTime();
      }
      return isolatedSession;
    });
  }
}
