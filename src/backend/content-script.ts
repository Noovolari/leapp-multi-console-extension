import { initProviders } from "./init-providers";

const providers = initProviders();

if (providers.extensionStateService.isChrome) {
  providers.customDocumentCookieEventsService.listen();
}

providers.extractSessionIdService.listen();

chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
  if (!sender.tab && message.request === "set-cookies-request") {
    providers.extensionStateService.setSingleCookieState(message.cookies, message.sessionTokenId);
    console.log("Receiving cookies from background script");
    console.log(new Date().getTime());
    console.log(message.cookies);
  }
});
