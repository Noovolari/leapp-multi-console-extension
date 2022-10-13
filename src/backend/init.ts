import { WebsocketService } from "./services/websocket.service";
import { TabControllerService } from "./services/tab-controller.service";
import { ExtensionStateService } from "./services/extension-state.service";
import { BootstrapService } from "./services/bootstrap.service";
import { WebRequestService } from "./services/web-request.service";
import { InternalCommunicationService } from "./services/internal-communication.service";

export default function init(): void {
  (window as any).extensionStateService = (window as any).extensionStateService || new ExtensionStateService(navigator);

  if ((window as any).extensionStateService.isChrome) {
    (window as any).webRequestService =
      (window as any).webRequestService || new WebRequestService(chrome.webRequest, (window as any).extensionStateService);
  }

  let firefoxBrowser;
  if ((window as any).extensionStateService.isFirefox) {
    firefoxBrowser = browser;
  }

  (window as any).tabControllerService =
    (window as any).tabControllerService || new TabControllerService(chrome, (window as any).extensionStateService, firefoxBrowser);

  (window as any).bootstrapService = (window as any).bootstrapService || new BootstrapService(window, chrome, (window as any).extensionStateService);

  (window as any).internalCommunicationService =
    (window as any).internalCommunicationService || new InternalCommunicationService(chrome.runtime, (window as any).extensionStateService);

  (window as any).webSocketService = (window as any).webSocketService || new WebsocketService((window as any).tabControllerService);
}
