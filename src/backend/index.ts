import { WebsocketService } from "./websocket.service";
import { TabControllerService } from "./tab-controller.service";
import { ExtensionStateService } from "./extension-state.service";
import { BootstrapService } from "./bootstrap.service";
import { WebRequestService } from "./web-request.service";
import { ContentService } from "./content.service";

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

const contentService = new ContentService(chrome.runtime, extensionStateService);
contentService.listen();

const webSocketService = new WebsocketService(tabControllerService);
webSocketService.listen();

(window as any).extensionStateService = extensionStateService;
(window as any).tabControllerService = tabControllerService;
(window as any).bootstrapService = bootstrapService;
(window as any).webRequestService = webRequestService;
(window as any).contentService = contentService;
(window as any).webSocketService = webSocketService;
