import { ExtensionStateService } from "./extension-state.service";
import { LeappSessionInfo } from "../models/leapp-session-info";
import { containerColors } from "../models/container-colors";

export class TabControllerService {
  constructor(private chromeNamespace: typeof chrome, private state: ExtensionStateService) {}

  getBrowser(): any {
    return browser;
  }

  openOrFocusSessionTab(leappPayload: LeappSessionInfo, leappSessionId?: string): void {
    const sessionId = this.state.sessionCounter;
    this.state.createNewIsolatedSession(sessionId, { ...leappPayload, url: undefined }, leappSessionId);
    this.state.nextSessionId = this.state.sessionCounter++;
    this.openSessionTab(sessionId, leappPayload);
  }

  private openSessionTab(sessionId: number, leappPayload: LeappSessionInfo) {
    if (this.state.isChrome) {
      this.newChromeSessionTab(leappPayload.url);
    } else {
      this.newFirefoxSessionTab(leappPayload.url, `${leappPayload.sessionName} (${leappPayload.sessionRole})`, sessionId).then(() => {});
    }
  }

  private focusSessionTab(tabId: number): void {
    this.chromeNamespace.windows.getCurrent((window) => {
      this.updateOnTabFocus(window, tabId);
    });
  }

  private updateOnTabFocus(window: any, tabId: number): void {
    this.chromeNamespace.windows.update(window.id, { focused: true });
    this.chromeNamespace.tabs.update(tabId, { active: true }, (_) => {});
  }

  private newChromeSessionTab(url: string) {
    this.chromeNamespace.tabs.create({
      url,
    });
  }

  private async newFirefoxSessionTab(url: string, containerName: string, sessionId: number) {
    const colorIndex = this.state.sessionCounter % containerColors.length;
    const container = await this.getBrowser().contextualIdentities.create({
      name: containerName,
      color: containerColors[colorIndex],
      icon: "circle",
    });
    this.state.setCookieStoreId(sessionId, container.cookieStoreId);
    await this.getBrowser().tabs.create({
      url,
      cookieStoreId: container.cookieStoreId,
    });
  }

  listen(): void {
    this.chromeNamespace.tabs.onCreated.addListener((tab: any) => this.handleCreated(tab));
    this.chromeNamespace.tabs.onRemoved.addListener((tabId: number) => this.handleRemoved(tabId));
  }

  private handleCreated(tab: any): void {
    if (tab.openerTabId) {
      const currentSessionId = this.state.getSessionIdByTabId(tab.openerTabId);
      this.state.addTabToSession(tab.id, currentSessionId);
    } else {
      this.state.addTabToSession(tab.id, this.state.nextSessionId);
    }
    this.state.nextSessionId = 0;
    console.log(`Tab ${tab.id} was created from ${tab.openerTabId ?? "Leapp"}`);
  }

  private handleRemoved(tabId: number): void {
    this.state.removeTabFromSession(tabId);
    console.log(`Tab ${tabId} was removed!`);
  }
}
