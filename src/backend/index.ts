import { WebsocketService } from "./websocket.service";
import { TabControllerService } from "./tab-controller.service";
import { ExtensionStateService } from "./extension-state.service";
import { BootstrapService } from "./bootstrap.service";
import { WebRequestService } from "./web-request.service";
import { ContentService } from "./content.service";

const extensionStateService = new ExtensionStateService(navigator);

const bootstrapService = new BootstrapService(window, chrome, extensionStateService);
bootstrapService.listen();

const tabControllerService = new TabControllerService(chrome.tabs, extensionStateService);
tabControllerService.listen();

if (extensionStateService.isChrome) {
  const webRequestService = new WebRequestService(chrome.webRequest, extensionStateService);
  webRequestService.listen();
}

const contentService = new ContentService(chrome.runtime, extensionStateService);
contentService.listen();

const webSocketService = new WebsocketService();
webSocketService.listen();
