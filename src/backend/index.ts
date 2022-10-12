import { WebsocketService } from "./services/websocket.service";
import { TabControllerService } from "./services/tab-controller.service";
import { ExtensionStateService } from "./services/extension-state.service";
import { BootstrapService } from "./services/bootstrap.service";
import { WebRequestService } from "./services/web-request.service";
import { ContentListenerService } from "./services/content-listener.service";

const extensionStateService = new ExtensionStateService(navigator);

let webRequestService;
if (extensionStateService.isChrome) {
  webRequestService = new WebRequestService(chrome.webRequest, extensionStateService);
  webRequestService.listen();
}

let firefoxBrowser;
if (extensionStateService.isFirefox) {
  firefoxBrowser = browser;
}
const tabControllerService = new TabControllerService(chrome, extensionStateService, firefoxBrowser);
tabControllerService.listen();

const bootstrapService = new BootstrapService(window, chrome, extensionStateService);
bootstrapService.listen();

const contentService = new ContentListenerService(chrome.runtime, extensionStateService);
contentService.listen();

const webSocketService = new WebsocketService(tabControllerService);
webSocketService.listen();

(window as any).extensionStateService = extensionStateService;
(window as any).tabControllerService = tabControllerService;
(window as any).bootstrapService = bootstrapService;
(window as any).webRequestService = webRequestService;
(window as any).contentService = contentService;
(window as any).webSocketService = webSocketService;
