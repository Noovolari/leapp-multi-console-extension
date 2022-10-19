import { initProviders } from "./init-providers";

const providers = initProviders();

if (providers.extensionStateService.isChrome) {
  providers.customDocumentCookieEventsService.listen();
}

providers.extractSessionIdService.listen();
