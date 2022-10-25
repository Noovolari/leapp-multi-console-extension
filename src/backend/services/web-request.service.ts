import { ExtensionStateService } from "./extension-state.service";
import * as constants from "../models/constants";

const awsConsoleUrls = ["https://*.awsapps.com/*", "https://*.cloudfront.net/*", "https://*.aws.amazon.com/*"];

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
    let blocked = false;
    if (tabId > 0) {
      const tabSessionId = this.state.getSessionIdByTabId(tabId);
      const requestHeaders = data.requestHeaders;
      if (tabSessionId !== undefined && tabSessionId !== 0) {
        this.fetchingDate = new Date();
        for (const requestHeader of requestHeaders) {
          if (requestHeader.name.toLowerCase() === "cookie") {
            while (blocked) {
              console.log("waiting...");
            }
            blocked = true;
            const sessionString = `${constants.leappToken}${tabSessionId}${constants.separatorToken}`;
            chrome.storage.sync.get(sessionString, (value) => {
              //console.log(value);
              // const cookieValues = requestHeader.value.split(constants.cookiesStringSeparator);
              // const newCookieValues = [];
              // for (const cookieValue of cookieValues) {
              //   const sessionString = `${constants.leappToken}${tabSessionId}${constants.separatorToken}`;
              //   if (cookieValue.startsWith(sessionString)) {
              //     const slicingPoint =
              //       cookieValue.indexOf(constants.separatorToken, `${constants.leappToken}`.length) + `${constants.separatorToken}`.length;
              //     newCookieValues.push(cookieValue.slice(slicingPoint));
              //   }
              // }
              console.log("getting from webrequest");
              requestHeader.value = value;
              blocked = false;
            });
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
            //responseHeader.value = sessionString + responseHeader.value;
            const newStorageObject = {};
            newStorageObject[sessionString] = responseHeader.value;
            chrome.storage.sync.set(newStorageObject);
            console.log("setting from background");
          }
        }
        return { responseHeaders };
      }
    }
  }
}
