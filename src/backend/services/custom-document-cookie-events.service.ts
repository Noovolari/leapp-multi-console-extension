import * as constants from "../models/constants";
import { ExtensionStateService } from "./extension-state.service";

export class CustomDocumentCookieEventsService {
  constructor(private injectedDocument: Document, private injectedLocalStorage: Storage, private state: ExtensionStateService) {}

  listen(): void {
    const injectableScript = this.generateCookieSetterGetterOverwriteScript();
    this.injectScriptInDocument(injectableScript);
    this.injectedDocument.addEventListener(constants.setCustomCookieEventString, (event) => this.customSetCookieEventHandler(event));
    this.injectedDocument.addEventListener(constants.getCustomCookieEventString, () => this.customGetCookieEventHandler());
  }

  private injectScriptInDocument(injectableScript: string) {
    const script = this.injectedDocument.createElement("script");
    script.appendChild(this.injectedDocument.createTextNode(injectableScript));
    (this.injectedDocument.head || this.injectedDocument.documentElement).appendChild(script);
    script.parentNode.removeChild(script);
  }

  // Overrides document.cookie behaviour: when a cookie is SET customCookieSetFunction is called,
  // likewise if all cookies are obtained, customCookieGetFunction is called.
  private generateCookieSetterGetterOverwriteScript(): string {
    return (
      "(function () {\n" +
      '      Object.defineProperty(document, "cookie", {\n' +
      "        set: cookieToSet => {\n" +
      `          const event = new CustomEvent("${constants.setCustomCookieEventString}", {\n` +
      "            detail: cookieToSet\n" +
      "          });\n" +
      "          document.dispatchEvent(event);\n" +
      "        },\n" +
      "        get: () => {\n" +
      `          const event = new CustomEvent("${constants.getCustomCookieEventString}");\n` +
      "          document.dispatchEvent(event);\n" +
      "          let cookies;\n" +
      "\n" +
      "          try {\n" +
      `            cookies = localStorage.getItem("${constants.sessionsCookiesLocalStorageSelector}");\n` +
      `            localStorage.removeItem("${constants.sessionsCookiesLocalStorageSelector}");\n` +
      "          } catch (e) {\n" +
      `            cookies = document.getElementById("${constants.sessionsCookiesLocalStorageSelector}").innerText;\n` +
      "          }\n" +
      "\n" +
      "          return cookies;\n" +
      "        }\n" +
      "      });\n" +
      "    })();"
    );
  }

  private customSetCookieEventHandler(event: any): void {
    const cookie = event.detail;
    if (this.state.sessionToken === null || this.state.sessionToken === "" || this.state.sessionToken === undefined) {
      this.injectedDocument.cookie = cookie;
    } else {
      this.injectedDocument.cookie = this.state.sessionToken + cookie.trim();
    }
  }

  private getCookiesString(): string {
    const initialCookiesString = this.injectedDocument.cookie;
    if (!initialCookiesString) {
      return "";
    }
    const cookies: string[] = [...initialCookiesString.split(constants.cookiesStringSeparator)];
    const cookiesToReturn: string[] = [];
    for (const cookie of cookies) {
      if (this.state.sessionToken) {
        // A session that is already managed by the extension: the cookies are prefixed with the Leapp Custom Prefix
        if (cookie.startsWith(this.state.sessionToken)) {
          cookiesToReturn.push(cookie.substring(this.state.sessionToken.length));
        }
      } else {
        // A session not managed by Leapp Extension: the cookies are still (or renamed to) their normal name
        if (!cookie.startsWith(constants.leappToken)) {
          cookiesToReturn.push(cookie);
        }
      }
    }
    return cookiesToReturn.join(constants.cookiesStringSeparator);
  }

  private customGetCookieEventHandler(): void {
    const cookiesString = this.getCookiesString();
    try {
      this.injectedLocalStorage.setItem(constants.sessionsCookiesLocalStorageSelector, cookiesString);
    } catch (err) {
      let cookiesElement = this.injectedDocument.getElementById(constants.sessionsCookiesLocalStorageSelector);
      if (!cookiesElement) {
        cookiesElement = this.injectedDocument.createElement("div");
        cookiesElement.setAttribute("id", constants.sessionsCookiesLocalStorageSelector);
        this.injectedDocument.documentElement.appendChild(cookiesElement);
        cookiesElement.style.display = "none";
      }
      (cookiesElement as any).a = cookiesString;
      // TODO: why .a and not .innerText???
    }
  }
}
