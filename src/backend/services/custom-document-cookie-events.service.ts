import {
  getCustomCookieEventString,
  leappToken,
  newCookieSeparator,
  sessionsCookiesLocalStorageSelector,
  setCustomCookieEventString,
} from "../models/constants";

export class CustomDocumentCookieEventsService {
  private _sessionToken: string;

  constructor(private injectedDocument: Document, private injectedLocalStorage: Storage, private injectedNavigator: Navigator) {}

  set sessionToken(value: string) {
    this._sessionToken = value;
  }

  get sessionToken(): string {
    return this._sessionToken;
  }

  listen(): void {
    if (this.isChrome()) {
      const injectableScript = CustomDocumentCookieEventsService.generateCookieSetterGetterOverwriteScript();
      this.injectScriptInDocument(injectableScript);
      this.injectedDocument.addEventListener(setCustomCookieEventString, (event) => this.customSetCookieEventHandler(event));
      this.injectedDocument.addEventListener(getCustomCookieEventString, () => this.customGetCookieEventHandler());
    }
  }

  private injectScriptInDocument = (injectableScript: string) => {
    const script = this.injectedDocument.createElement("script");
    script.appendChild(this.injectedDocument.createTextNode(injectableScript));
    (this.injectedDocument.head || this.injectedDocument.documentElement).appendChild(script);
    script.parentNode.removeChild(script);
  };

  // Overrides document.cookie behaviour: when a cookie is SET customCookieSetFunction is called,
  // likewise if all cookies are obtained, customCookieGetFunction is called.
  private static generateCookieSetterGetterOverwriteScript = (): string => {
    return (
      "(" +
      function () {
        Object.defineProperty(document, "cookie", {
          set: (cookieToSet): void => {
            const event = new CustomEvent("SET_COOKIE", {
              detail: cookieToSet,
            });
            document.dispatchEvent(event);
          },
          get: (): string => {
            const event = new CustomEvent("GET_COOKIE");
            document.dispatchEvent(event);
            let cookies;
            try {
              cookies = localStorage.getItem("##SESSION-COOKIES##");
              localStorage.removeItem("##SESSION-COOKIES##");
            } catch (e) {
              cookies = document.getElementById("##SESSION-COOKIES##").innerText;
            }
            return cookies;
          },
        });
      } +
      ")();"
    );
  };

  private customSetCookieEventHandler = (event: any) => {
    const cookie = event.detail;
    if (this.sessionToken === null || this.sessionToken === "" || this.sessionToken === undefined) {
      this.injectedDocument.cookie = cookie;
    } else {
      this.injectedDocument.cookie = this.sessionToken + cookie.trim();
    }
  };

  private customGetCookieEventHandler = () => {
    let newCookies = "";
    const cookiesString = this.injectedDocument.cookie;
    const cookiesArray: string[] = [];

    if (cookiesString) {
      cookiesArray.push(...cookiesString.split("; "));

      for (const index in cookiesArray) {
        if (this.sessionToken) {
          // A session that is already managed by the extension: the cookies are prefixed with the Leapp Custom Prefix
          if (cookiesArray[index].substring(0, this.sessionToken.length) !== this.sessionToken) {
            continue;
          }
        } else {
          // A session not managed by Leapp Extension: the cookies are still (or renamed to) their normal name
          if (cookiesArray[index].startsWith(leappToken)) {
            continue;
          }
        }

        if (newCookies) {
          newCookies += newCookieSeparator;
        }

        newCookies += this.sessionToken ? cookiesArray[index].substring(this.sessionToken.length) : cookiesArray[index];
      }
    }

    try {
      this.injectedLocalStorage.setItem(sessionsCookiesLocalStorageSelector, newCookies);
    } catch (err) {
      if (!this.injectedDocument.getElementById(sessionsCookiesLocalStorageSelector)) {
        const index = this.injectedDocument.createElement("div");
        index.setAttribute("id", sessionsCookiesLocalStorageSelector);
        this.injectedDocument.documentElement.appendChild(index);
        index.style.display = "none";
      }
      (this.injectedDocument.getElementById(sessionsCookiesLocalStorageSelector) as any).a = newCookies;
    }
  };

  private isChrome = (): boolean => this.injectedNavigator.userAgent.indexOf("Chrome") > 0;
}
