import { BootstrapService } from "../services/bootstrap.service";
import { CustomDocumentCookieEventsService } from "../services/custom-document-cookie-events.service";
import { ExtensionStateService } from "../services/extension-state.service";
import { ExtractSessionIdService } from "../services/extract-session-id.service";
import { InternalCommunicationService } from "../services/internal-communication.service";
import { PopupCommunicationService } from "../services/popup-communication.service";
import { TabControllerService } from "../services/tab-controller.service";
import { WebRequestService } from "../services/web-request.service";
import { WebsocketService } from "../services/websocket.service";

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
