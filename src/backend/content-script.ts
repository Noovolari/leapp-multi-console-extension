import init, { Providers } from "./init";

init();

const providers: Providers = (window as any).providers;

if (providers.extensionStateService.isChrome) {
  providers.customDocumentCookieEventsService.listen();
}

providers.extractSessionIdService.listen();
