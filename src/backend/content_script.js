/*let separatorToken;
let sessionToken = null;
let sessionNumber;
let port;

function cookiesGetSetInjector() {

  const injectedScript = "(" + function () {
    Object.defineProperty(document, "cookie", {
      set: function (cookieToSet) {
        const event = new CustomEvent("SET_COOKIE", {
          "detail": cookieToSet
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
          cookies = document.getElementById("##SESSION-COOKIES##").innerText;      //se non è disponibile il localStorage
        }
        return cookies;
      }
    });
  } + ")();";

  let script = document.createElement("script");
  script.appendChild(document.createTextNode(injectedScript));
  (document.head || document.documentElement).appendChild(script);
  script.parentNode.removeChild(script);
}

if(navigator.userAgent.indexOf("Chrome") > 0) {
  //alert("Chrome!");
  cookiesGetSetInjector();

  //---------- C O O K I E    S E T T E R --------------

  document.addEventListener("SET_COOKIE", function (event) {
    const cookie = event.detail;
    if (sessionToken == null || sessionToken == "") {
      document.cookie = cookie;
    } else {
      document.cookie = sessionToken + cookie.trim();
    }
  });

  //---------- C O O K I E    G E T T E R --------------

  document.addEventListener("GET_COOKIE", function () {

    let newCookies = "";
    let cookies = document.cookie;

    if (cookies) {
      cookies = cookies.split("; ");
      for (let index in cookies) {
        //-----------------
        if (sessionToken) {  //per cookie di sessioni speciali
          if (cookies[index].substring(0, sessionToken.length) != sessionToken) {
            continue;
          }
        } else {             //per cookie di DEFAULT
          if (cookies[index].startsWith(`${separatorToken}LEAPP${separatorToken}`)) {
            continue;
          }
        }
        //-----------------
        if (newCookies) {
          newCookies += "; ";
        }
        newCookies += sessionToken ? cookies[index].substring(sessionToken.length) : cookies[index];
      }
    }

    try {
      localStorage.setItem("##SESSION-COOKIES##", newCookies);
    } catch (v) {
      if (!document.getElementById("##SESSION-COOKIES##")) {
        index = document.createElement("div");
        index.setAttribute("id", "##SESSION-COOKIES##");
        document.documentElement.appendChild(index);
        index.style.display = "none";
      }
      document.getElementById("##SESSION-COOKIES##").a = newCookies;
    }
  });
}

function extractSessionNumber(sesTok, separator) {
  if (sesTok != null) {
    sessionToken = sesTok;
    separatorToken = separator;
    sessionNumber = sessionToken.split(separator)[2];
  }
}

try {
  port = chrome.runtime.connect({name: "background-script-connection"});

  port.onMessage.addListener(function (message) {
    if (message.request == "extract-session-number") {
      if (message.content == "undefined") {
        window.location.reload();
      }
      extractSessionNumber(message.content, message.separator);
    }
  });

  port.postMessage({
    request: "get-ses-num"
  });

  port.onDisconnect.addListener(function () { });
} catch (e) {
  console.error(e);
}

if (!port) {
  throw "port error";
}
*/
