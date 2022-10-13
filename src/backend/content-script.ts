import init from "./init";

init();

(window as any).customDocumentCookieEventsService.listen();
(window as any).extractSessionIdService.listen();
