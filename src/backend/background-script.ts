import init from "./init";

init();

(window as any).webRequestService.listen();
(window as any).tabControllerService.listen();
(window as any).bootstrapService.listen();
(window as any).internalCommunicationService.listenToContentScriptConnection();
(window as any).popupCommunicationService.listen();
(window as any).webSocketService.listen();