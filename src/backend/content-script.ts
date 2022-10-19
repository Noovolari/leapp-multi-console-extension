import init from "./init";
import { Providers } from "./models/providers";

init();

const providers: Providers = (window as any).providers;

if (providers.extensionStateService.isChrome) {
  providers.customDocumentCookieEventsService.listen();
}

providers.extractSessionIdService.listen();
