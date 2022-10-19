import initProviders from "./initProviders";

const providers = initProviders();

if (providers.extensionStateService.isChrome) {
  providers.customDocumentCookieEventsService.listen();
}

providers.extractSessionIdService.listen();
