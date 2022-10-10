import Tab = chrome.tabs.Tab;
import { ExtensionStateService } from "./extension-state.service";

export class TabControllerService {
  constructor(private chromeNamespace: typeof chrome, private browserNamespace: typeof browser, private state: ExtensionStateService) {}
  /*
  private newChromeSessionTab(url: string) {
    this.chromeNamespace.tabs.create({
      url: chrome.runtime.getURL(url),
    });
  }

  private async newFirefoxSessionTab(url: string, sessionKey: string) {
    const container = await browser.contextualIdentities.create({ name: sessionKey, color: "orange", icon: "circle" });
    this.browserNamespace.tabs.create({
      url: browser.runtime.getURL(url),
      cookieStoreId: container.cookieStoreId,
    });
  }

  private async newSessionTab(url: string, sessionKey?: string) {
    if (this.state.isChrome) {
      this.newChromeSessionTab(url);
    } else {
      await this.newFirefoxSessionTab(url, sessionKey);
    }
  }

  loginSSO(accountName: string, roleName: string, ssoRegion: string) {
    const sessionNum = sessionCounter++;
    const sessionKey = `session-${sessionNum}`;
    sessionDictionary[sessionKey] = [];
    selectedSessionKey = sessionNum;

    const user = {
      loginInfo: {
        accountName: accountName,
        roleName: roleName,
        SSOregion: ssoRegion,
        chainedInfo: undefined,
        genericToken: constants.leappToken,
        sessionNum: sessionKey,
      },
    };
    this.chromeNamespace.storage.local.set(user); // TODO: Set metadata in state
    // TODO: Notify popup page to reload state
    this.newSessionTab("logins/loginSSO.html", sessionKey).then(() => {});
  }

  loginFederated(SAMLResponse, consoleRegion, idp = undefined) {
    const sessionNum = sessionCounter++;
    const sessionKey = `session-${sessionNum}`;
    sessionDictionary[sessionKey] = [];
    sessionLandingRegion[sessionKey] = consoleRegion;
    selectedSessionKey = sessionNum;

    const user = {
      loginInfo: {
        SAMLResponse: SAMLResponse,
        chainedInfo: undefined,
        idp: idp,
      },
    };
    chrome.storage.local.set(user);

    const url = "logins/loginFederated.html";

    if (userAgent.indexOf("Chrome") > 0) chromiumNewSessionTab(consoleRegion, url);
    else firefoxNewSessionTab(consoleRegion, url, sessionKey);
  }

  loginChainedFromFederated(SAMLResponse, accountId, roleName, displayName = undefined, consoleRegion) {
    const sessionNum = sessionCounter++;
    const sessionKey = `session-${sessionNum}`;
    sessionDictionary[sessionKey] = [];
    sessionLandingRegion[sessionKey] = consoleRegion;
    selectedSessionKey = sessionNum;

    const user = {
      loginInfo: {
        SAMLResponse: SAMLResponse,
        chainedInfo: {
          accountId: accountId,
          roleName: roleName,
          displayName: displayName,
        },
      },
    };
    chrome.storage.local.set(user);

    const url = "logins/loginFederated.html";

    if (userAgent.indexOf("Chrome") > 0) chromiumNewSessionTab(consoleRegion, url);
    else firefoxNewSessionTab(consoleRegion, url, sessionKey);
  }

  loginChainedFromSSO(authToken, parentAccountName, parentRoleName, SSOregion, accountId, roleName, displayName = undefined, consoleRegion) {
    const sessionNum = sessionCounter++;
    const sessionKey = `session-${sessionNum}`;
    sessionDictionary[sessionKey] = [];
    sessionLandingRegion[sessionKey] = consoleRegion;
    selectedSessionKey = sessionNum;

    const user = {
      loginInfo: {
        authToken: authToken,
        accountName: parentAccountName,
        roleName: parentRoleName,
        SSOregion: SSOregion,
        chainedInfo: {
          accountId: accountId,
          roleName: roleName,
          displayName: displayName,
        },
        genericToken: genericToken,
        sessionNum: sessionKey,
      },
    };
    chrome.storage.local.set(user);

    sessionChainedSSO[sessionKey] = user["loginInfo"]["chainedInfo"];
    sessionChainedSSO[sessionKey]["redirect"] = consoleRegion;

    console.log(sessionChainedSSO[sessionKey]);

    const url = "logins/loginSSO.html";

    if (userAgent.indexOf("Chrome") > 0) chromiumNewSessionTab(consoleRegion, url);
    else firefoxNewSessionTab(consoleRegion, url, sessionKey);
  }
*/
  listen(): void {
    this.chromeNamespace.tabs.onCreated.addListener((tab: Tab) => this.handleCreated(tab));
    this.chromeNamespace.tabs.onRemoved.addListener((tabId: number) => this.handleRemoved(tabId));
  }

  private handleCreated(tab: Tab): void {
    if (tab.openerTabId) {
      const currentSessionId = this.state.getSessionIdByTabId(tab.openerTabId);
      this.state.addTabToSession(tab.id, currentSessionId);
    } else {
      this.state.addTabToSession(tab.id, this.state.nextSessionId);
    }
    this.state.nextSessionId = 0;
    console.log(`Tab ${tab.id} was created from ${tab.openerTabId ?? "popup page"}`);
  }

  private handleRemoved(tabId: number): void {
    this.state.removeTabFromSession(tabId);
    console.log(`Tab ${tabId} was removed! R†P`);
  }
}
