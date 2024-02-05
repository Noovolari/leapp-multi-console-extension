import { ExtensionStateService } from "./extension-state.service";
import * as constants from "../models/constants";

const awsConsoleUrls = [
  "https://*.awsapps.com/*",
  "https://*.cloudfront.net/*",
  "https://*.amazon.com.be/*",
  "https://*.amazon.com.br/*",
  "https://*.amazon.ca/*",
  "https://*.amazon.cn/*",
  "https://*.amazon.eg/*",
  "https://*.amazon.fr/*",
  "https://*.amazon.de/*",
  "https://*.amazon.in/*",
  "https://*.amazon.com.au/*",
  "https://*.amazon.it/*",
  "https://*.amazon.co.jp/*",
  "https://*.amazon.com.mx/*",
  "https://*.amazon.nl/*",
  "https://*.amazon.pl/*",
  "https://*.amazon.sa/*",
  "https://*.amazon.sg/*",
  "https://*.amazon.es/*",
  "https://*.amazon.se/*",
  "https://*.amazon.com.tr/*",
  "https://*.amazon.ae/*",
  "https://*.amazon.co.uk/*",
  "https://*.amazon.com/*",
];

export enum FetchingState {
  notFetching,
  fetchingRequested,
  fetching,
}

export class WebRequestService {
  private fetchingDate;

  constructor(private chromeWebRequest: typeof chrome.webRequest, private state: ExtensionStateService) {
    this.fetchingDate = new Date(0);
  }

  get fetching(): FetchingState {
    const thresholdExpired = !(new Date().getTime() - this.fetchingDate.getTime() < constants.fetchingThreshold);
    return thresholdExpired ? FetchingState.notFetching : FetchingState.fetching;
  }

  listen(): void {
    this.chromeWebRequest.onBeforeSendHeaders.addListener((d) => this.onBeforeSendHeadersCallback(d), { urls: awsConsoleUrls }, [
      "blocking",
      "requestHeaders",
      "extraHeaders",
    ]);

    this.chromeWebRequest.onHeadersReceived.addListener((d) => this.onHeadersReceivedCallback(d), { urls: awsConsoleUrls }, [
      "blocking",
      "responseHeaders",
      "extraHeaders",
    ]);
  }

  private onBeforeSendHeadersCallback(data: any) {
    const tabId = data.tabId;
    if (tabId > 0) {
      const tabSessionId = this.state.getSessionIdByTabId(tabId);
      const requestHeaders = data.requestHeaders;
      if (tabSessionId !== undefined && tabSessionId !== 0) {
        this.fetchingDate = new Date();
        for (const requestHeader of requestHeaders) {
          if (requestHeader.name.toLowerCase() === "cookie") {
            const cookieValues = requestHeader.value.split(constants.cookiesStringSeparator);
            const newCookieValues = [];
            for (const cookieValue of cookieValues) {
              const sessionString = `${constants.leappToken}${tabSessionId}${constants.separatorToken}`;
              if (cookieValue.startsWith(sessionString)) {
                const slicingPoint =
                  cookieValue.indexOf(constants.separatorToken, `${constants.leappToken}`.length) + `${constants.separatorToken}`.length;
                newCookieValues.push(cookieValue.slice(slicingPoint));
              }
            }
            requestHeader.value = newCookieValues.join(constants.cookiesStringSeparator);
          }
        }
      } else {
        for (const requestHeader of requestHeaders) {
          if (requestHeader.name.toLowerCase() === "cookie") {
            const cookieValues = requestHeader.value.split(constants.cookiesStringSeparator);
            const newCookieValues = [];
            for (const cookieValue of cookieValues) {
              if (!cookieValue.startsWith(constants.leappToken)) {
                newCookieValues.push(cookieValue);
              }
            }
            requestHeader.value = newCookieValues.join(constants.cookiesStringSeparator);
          }
        }
      }
      return { requestHeaders };
    }
  }

  private onHeadersReceivedCallback(data: any) {
    const tabId = data.tabId;
    if (tabId > 0) {
      const responseHeaders = data.responseHeaders;
      const tabSessionId = this.state.getSessionIdByTabId(tabId);
      if (tabSessionId !== undefined && tabSessionId !== 0) {
        this.fetchingDate = new Date();
        for (const responseHeader of responseHeaders) {
          if (responseHeader.name.toLowerCase() === "set-cookie") {
            const sessionString = `${constants.leappToken}${tabSessionId}${constants.separatorToken}`;
            responseHeader.value = sessionString + responseHeader.value;
          }
        }
        return { responseHeaders };
      }
    }
  }
}
