// session token
// navigator / userAgent
// window / cookie

import { leappToken } from "./models/constants";

let sessionToken;
let port;
//let separatorToken;
//let sessionNumber;

if (navigator.userAgent.indexOf("Chrome") > 0) {
  const injectedScript =
    "(" +
    function () {
      Object.defineProperty(document, "cookie", {
        set: function (cookieToSet) {
          const event = new CustomEvent("SET_COOKIE", {
            detail: cookieToSet,
          });
          document.dispatchEvent(event);
        },
        get: function () {
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
    ")();";

  const script = document.createElement("script");
  script.appendChild(document.createTextNode(injectedScript));
  (document.head || document.documentElement).appendChild(script);
  script.parentNode.removeChild(script);

  document.addEventListener("SET_COOKIE", (event: any) => {
    const cookie = event.detail;
    if (sessionToken === null || sessionToken === "") {
      document.cookie = cookie;
    } else {
      document.cookie = sessionToken + cookie.trim();
    }
  });

  document.addEventListener("GET_COOKIE", () => {
    let newCookies = "";
    const cookiesString = document.cookie;
    const cookiesArray: string[] = [];

    if (cookiesString) {
      cookiesArray.push(...cookiesString.split("; "));

      for (const index in cookiesArray) {
        if (sessionToken) {
          // not default session
          if (cookiesArray[index].substring(0, sessionToken.length) !== sessionToken) {
            continue;
          }
        } else {
          // default session
          if (cookiesArray[index].startsWith(leappToken)) {
            continue;
          }
        }

        if (newCookies) {
          newCookies += "; ";
        }

        newCookies += sessionToken ? cookiesArray[index].substring(sessionToken.length) : cookiesArray[index];
      }
    }

    try {
      localStorage.setItem("##SESSION-COOKIES##", newCookies);
    } catch (err) {
      if (!document.getElementById("##SESSION-COOKIES##")) {
        const index = document.createElement("div");
        index.setAttribute("id", "##SESSION-COOKIES##");
        document.documentElement.appendChild(index);
        index.style.display = "none";
      }
      (document.getElementById("##SESSION-COOKIES##") as any).a = newCookies;
    }
  });
}

try {
  port = chrome.runtime.connect({ name: "background-script-connection" });

  port.onMessage.addListener(function (message) {
    if (message.request == "extract-session-number") {
      if (message.content == "undefined") {
        window.location.reload();
      }
      if (message.content != null) {
        sessionToken = message.content;
        //separatorToken = message.separator;
        //sessionNumber = sessionToken.split(message.separator)[2];
      }
    }
  });

  port.postMessage({
    request: "get-ses-num",
  });

  port.onDisconnect.addListener(function () {});
} catch (e) {
  console.error(e);
}

if (!port) {
  throw "port error";
}
