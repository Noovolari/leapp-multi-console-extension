import { initProviders } from "./init-providers";

const providers = initProviders();

if (providers.extensionStateService.isChrome) {
  providers.webRequestService.listen();
}

providers.tabControllerService.listen();
providers.bootstrapService.listen();
providers.internalCommunicationService.listenToContentScriptConnection();
providers.popupCommunicationService.listen();
providers.webSocketService.listen();
