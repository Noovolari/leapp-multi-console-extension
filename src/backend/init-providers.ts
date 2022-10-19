import { WebsocketService } from "./services/websocket.service";
import { TabControllerService } from "./services/tab-controller.service";
import { ExtensionStateService } from "./services/extension-state.service";
import { BootstrapService } from "./services/bootstrap.service";
import { WebRequestService } from "./services/web-request.service";
import { InternalCommunicationService } from "./services/internal-communication.service";
import { CustomDocumentCookieEventsService } from "./services/custom-document-cookie-events.service";
import { ExtractSessionIdService } from "./services/extract-session-id.service";
import { PopupCommunicationService } from "./services/popup-communication.service";
import { Providers } from "./models/providers";

export function initProviders(): Providers {
  const providers = {} as Providers;
  providers.extensionStateService = new ExtensionStateService(navigator);

  if (providers.extensionStateService.isChrome) {
    providers.webRequestService = new WebRequestService(chrome.webRequest, providers.extensionStateService);
    providers.customDocumentCookieEventsService = new CustomDocumentCookieEventsService(document, localStorage, providers.extensionStateService);
  }

  providers.tabControllerService = new TabControllerService(chrome, providers.extensionStateService);

  providers.bootstrapService = new BootstrapService(window, chrome, providers.extensionStateService);

  providers.internalCommunicationService = new InternalCommunicationService(chrome.runtime, providers.extensionStateService);

  providers.webSocketService = new WebsocketService(providers.tabControllerService, providers.webRequestService, WebSocket);

  providers.extractSessionIdService = new ExtractSessionIdService(providers.internalCommunicationService, providers.extensionStateService);

  providers.popupCommunicationService = new PopupCommunicationService(chrome, providers.extensionStateService);

  return providers;
}
