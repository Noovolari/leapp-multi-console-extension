import { ExtensionStateService } from "./extension-state.service";
import * as constants from "../models/constants";
import WebRequestHeadersDetails = chrome.webRequest.WebRequestHeadersDetails;
import WebResponseHeadersDetails = chrome.webRequest.WebResponseHeadersDetails;

export class WebRequestService {
  constructor(private chromeWebRequest: typeof chrome.webRequest, private state: ExtensionStateService) {}

  listen(): void {
    chrome.webRequest.onBeforeSendHeaders.addListener(
      (data: WebRequestHeadersDetails) => {
        const tabId = data.tabId;
        if (tabId > 0) {
          const tabSessionId = this.state.getSessionIdByTabId(tabId);
          const requestHeaders = data.requestHeaders;
          if (tabSessionId !== undefined && tabSessionId !== 0) {
            for (const headerKey in requestHeaders) {
              if (requestHeaders[headerKey].name.toLowerCase() === "cookie") {
                const cleanCookiesString = requestHeaders[headerKey].value.split("; ");
                const newCookiesString = [];
                for (const index in cleanCookiesString) {
                  const sessionString = `${constants.leappToken}${tabSessionId}${constants.separatorToken}`;
                  if (cleanCookiesString[index].startsWith(sessionString)) {
                    const slicingPoint =
                      cleanCookiesString[index].indexOf(`${constants.separatorToken}`, `${constants.leappToken}`.length) +
                      `${constants.separatorToken}`.length;
                    newCookiesString.push(cleanCookiesString[index].slice(slicingPoint));
                  }
                }
                requestHeaders[headerKey].value = newCookiesString.join("; ");
              }
            }
          } else {
            for (const headerKey in requestHeaders) {
              if (requestHeaders[headerKey].name.toLowerCase() === "cookie") {
                const cleanCookiesString = requestHeaders[headerKey].value.split("; ");
                const newCookiesString = [];
                for (const index in cleanCookiesString) {
                  if (!cleanCookiesString[index].startsWith(`${constants.leappToken}`)) {
                    newCookiesString.push(cleanCookiesString[index]);
                  }
                }
                requestHeaders[headerKey].value = newCookiesString.join("; ");
              }
            }
          }
          return {
            requestHeaders,
          };
        }
      },
      {
        urls: ["https://*.awsapps.com/*", "https://*.cloudfront.net/*", "https://*.aws.amazon.com/*"],
      },
      ["blocking", "requestHeaders", "extraHeaders"]
    );

    chrome.webRequest.onHeadersReceived.addListener(
      (data: WebResponseHeadersDetails) => {
        const tabId = data.tabId;
        const responseHeaders = data.responseHeaders;
        if (tabId > 0) {
          const tabSessionId = this.state.getSessionIdByTabId(tabId);
          if (tabSessionId !== undefined && tabSessionId !== 0) {
            for (const headerKey in responseHeaders) {
              if (responseHeaders[headerKey].name.toLowerCase() == "set-cookie") {
                const sessionString = `${constants.leappToken}${tabSessionId}${constants.separatorToken}`;
                responseHeaders[headerKey].value = sessionString + responseHeaders[headerKey].value;
              }
            }
            return {
              responseHeaders,
            };
          }
        }
      },
      {
        urls: ["https://*.awsapps.com/*", "https://*.cloudfront.net/*", "https://*.aws.amazon.com/*"],
      },
      ["blocking", "responseHeaders", "extraHeaders"]
    );
  }
}
