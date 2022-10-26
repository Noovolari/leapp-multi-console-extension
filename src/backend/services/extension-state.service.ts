import { LeappSessionInfo } from "../models/leapp-session-info";
import { IsolatedSession } from "../models/isolated-session";
import * as constants from "../models/constants";
import { CookiesMap } from "../models/cookie";

export class ExtensionStateService {
  private readonly userAgent: string;
  private readonly hashedSessions: number[];
  public isolatedSessions: IsolatedSession[];
  private _sessionToken: string;
  private _sessionCounter: number;
  private _nextSessionId: number;

  constructor(navigator: Navigator, private backgroundPort: any, private cookiesMap: CookiesMap) {
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

  // cookieString is like "name=value; expires=...; path=..."
  setSingleCookieState(cookieString: string, sessionTokenId: string): string {
    // TODO: JS code can also set expire=* or path=* that now is not managed

    const cookieArray = localStorage.getItem(sessionTokenId) ? localStorage.getItem(sessionTokenId).split(constants.cookiesStringSeparator) : [];
    const cookieArrayNew = cookieString.split(";");
    const map = new Map();
    for (const cookie of cookieArray) {
      const cookieParts = cookie.split("=");
      const cookieName = cookieParts[0].trim();
      const cookieValue = cookieParts[1] ? cookieParts[1].trim() : undefined;
      map.set(cookieName, cookieValue);
    }
    for (const cookie of cookieArrayNew) {
      const cookieParts = cookie.split("=");
      const cookieName = cookieParts[0].trim();
      const cookieValue = cookieParts[1] ? cookieParts[1].trim() : undefined;
      if (cookieName.toLowerCase() !== "path" && cookieName.toLowerCase() !== "expires") {
        map.set(cookieName, cookieValue);
      } else {
        console.log(`AWS is fucking with cookies: ${cookie}`);
      }
    }
    const resultCookies = [];
    for (const entry of map.keys()) {
      const res = map.get(entry);
      resultCookies.push(res !== undefined ? `${entry}=${res}` : entry);
    }
    const cookiesString = resultCookies.join(constants.cookiesStringSeparator);
    localStorage.setItem(sessionTokenId, cookiesString);
    return cookiesString;
  }

  synchronizeCookies(cookies: string, sessionTokenId: string, environment: "background-script" | "content-script", tabId?: number) {
    if (environment === "content-script") {
      try {
        this.backgroundPort.postMessage({ request: "set-cookies-request", cookies, sessionTokenId }, () => {});
        console.log("Sending cookies from content script to bg script");
        console.log(new Date().getTime());
      } catch (error) {
        console.warn(error);
      }
    } else if (environment === "background-script") {
      try {
        chrome.tabs.sendMessage(tabId, { request: "set-cookies-request", cookies, sessionTokenId }, () => {});
        console.log(`Sending cookies from bg script to content script (tabid:${tabId})`);
        console.log(new Date().getTime());
      } catch (error) {
        console.warn(error);
      }
    }
  }
}
