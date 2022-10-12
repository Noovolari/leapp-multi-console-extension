// session token
// navigator / userAgent
// window / cookie

import { leappToken } from "./models/constants";

let sessionToken;
let port;

// Magic Strings
const isChrome = () => navigator.userAgent.indexOf("Chrome") > 0;
const newCookieSeparator = "; ";
const sessionsCookiesLocalStorageSelector = "##SESSION-COOKIES##";
const setCustomCookieEventString = "SET_COOKIE";
const getCustomCookieEventString = "GET_COOKIE";
const extractSessionNumberRequest = "extract-session-number";
const backgroundScriptConnectionName = "background-script-connection";
const getSessionNumberRequest = "get-ses-num";

// ======= Extracted functions ==
// ==============================
const customCookieSetFunction = (cookieToSet): void => {
  const event = new CustomEvent(setCustomCookieEventString, {
    detail: cookieToSet,
  });
  document.dispatchEvent(event);
};

const customCookieGetFunction = (): string => {
  const event = new CustomEvent(getCustomCookieEventString);
  document.dispatchEvent(event);
  let cookies;
  try {
    cookies = localStorage.getItem(sessionsCookiesLocalStorageSelector);
    localStorage.removeItem(sessionsCookiesLocalStorageSelector);
  } catch (e) {
    cookies = document.getElementById(sessionsCookiesLocalStorageSelector).innerText;
  }
  return cookies;
};

// Overrides document.cookie behaviour: when a cookie is SET customCookieSetFunction is called,
// likewise if all cookies are obtained, customCookieGetFunction is called.
const generateCookieSetterGetterOverwriteScript = (): string => {
  return (
    "(" +
    function () {
      Object.defineProperty(document, "cookie", {
        set: customCookieSetFunction,
        get: customCookieGetFunction,
      });
    } +
    ")();"
  );
};

if (isChrome()) {
  const injectedScript = generateCookieSetterGetterOverwriteScript();

  const script = document.createElement("script");
  script.appendChild(document.createTextNode(injectedScript));
  (document.head || document.documentElement).appendChild(script);
  script.parentNode.removeChild(script);

  document.addEventListener(setCustomCookieEventString, (event: any) => {
    const cookie = event.detail;
    if (sessionToken === null || sessionToken === "") {
      document.cookie = cookie;
    } else {
      document.cookie = sessionToken + cookie.trim();
    }
  });

  document.addEventListener(getCustomCookieEventString, () => {
    let newCookies = "";
    const cookiesString = document.cookie;
    const cookiesArray: string[] = [];

    if (cookiesString) {
      cookiesArray.push(...cookiesString.split("; "));

      for (const index in cookiesArray) {
        if (sessionToken) {
          // A session that is already managed by the extension: the cookies are prefixed with the Leapp Custom Prefix
          if (cookiesArray[index].substring(0, sessionToken.length) !== sessionToken) {
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

        newCookies += sessionToken ? cookiesArray[index].substring(sessionToken.length) : cookiesArray[index];
      }
    }

    try {
      localStorage.setItem(sessionsCookiesLocalStorageSelector, newCookies);
    } catch (err) {
      if (!document.getElementById(sessionsCookiesLocalStorageSelector)) {
        const index = document.createElement("div");
        index.setAttribute("id", sessionsCookiesLocalStorageSelector);
        document.documentElement.appendChild(index);
        index.style.display = "none";
      }
      (document.getElementById(sessionsCookiesLocalStorageSelector) as any).a = newCookies;
    }
  });
}

try {
  port = chrome.runtime.connect({ name: backgroundScriptConnectionName });

  port.onMessage.addListener((message) => {
    if (message.request === extractSessionNumberRequest) {
      if (message.content) {
        sessionToken = message.content;
      } else {
        window.location.reload();
      }
    }
  });

  port.postMessage({ request: getSessionNumberRequest });
  port.onDisconnect.addListener(() => console.log("port disconnected"));
} catch (err) {
  console.error(err);
}
