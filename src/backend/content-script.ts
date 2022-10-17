import init, { Providers } from "./init";

init();

const providers: Providers = (window as any).providers;
providers.customDocumentCookieEventsService.listen();
providers.extractSessionIdService.listen();
