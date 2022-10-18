import { WebsocketService } from "./services/websocket.service";
import { TabControllerService } from "./services/tab-controller.service";
import { ExtensionStateService } from "./services/extension-state.service";
import { BootstrapService } from "./services/bootstrap.service";
import { WebRequestService } from "./services/web-request.service";
import { InternalCommunicationService } from "./services/internal-communication.service";
import { CustomDocumentCookieEventsService } from "./services/custom-document-cookie-events.service";
import { ExtractSessionIdService } from "./services/extract-session-id.service";
import { PopupCommunicationService } from "./services/popup-communication.service";

export interface Providers {
  extensionStateService: ExtensionStateService;
  webRequestService: WebRequestService;
  tabControllerService: TabControllerService;
  bootstrapService: BootstrapService;
  internalCommunicationService: InternalCommunicationService;
  webSocketService: WebsocketService;
  customDocumentCookieEventsService: CustomDocumentCookieEventsService;
  extractSessionIdService: ExtractSessionIdService;
  popupCommunicationService: PopupCommunicationService;
}

export default function init(): void {
  const providers = {} as Providers;
  providers.extensionStateService = new ExtensionStateService(navigator);

  if (providers.extensionStateService.isChrome) {
    providers.webRequestService = new WebRequestService(chrome.webRequest, providers.extensionStateService);
  }

  providers.tabControllerService = new TabControllerService(chrome, providers.extensionStateService);

  providers.bootstrapService = new BootstrapService(window, chrome, providers.extensionStateService);

  providers.internalCommunicationService = new InternalCommunicationService(chrome.runtime, providers.extensionStateService);

  providers.webSocketService = new WebsocketService(providers.tabControllerService, providers.webRequestService);

  providers.customDocumentCookieEventsService = new CustomDocumentCookieEventsService(document, localStorage, navigator);

  providers.extractSessionIdService = new ExtractSessionIdService(
    providers.internalCommunicationService,
    providers.customDocumentCookieEventsService
  );

  providers.popupCommunicationService = new PopupCommunicationService(chrome, providers.extensionStateService);

  (window as any).providers = providers;
}
