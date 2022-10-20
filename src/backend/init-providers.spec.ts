import { initProviders } from "./init-providers";
import { ExtensionStateService } from "./services/extension-state.service";
import { TabControllerService } from "./services/tab-controller.service";
import { WebRequestService } from "./services/web-request.service";
import { CustomDocumentCookieEventsService } from "./services/custom-document-cookie-events.service";
import { BootstrapService } from "./services/bootstrap.service";
import { InternalCommunicationService } from "./services/internal-communication.service";
import { WebsocketService } from "./services/websocket.service";
import { ExtractSessionIdService } from "./services/extract-session-id.service";
import { PopupCommunicationService } from "./services/popup-communication.service";

describe("initProviders", () => {
  test("initProviders with chrome agent", () => {
    const globalNamespace = global as any;
    globalNamespace.navigator = { userAgent: "...Chrome..." };
    globalNamespace.chrome = { webRequest: {}, runtime: {} };
    globalNamespace.document = {};
    globalNamespace.localStorage = {};
    globalNamespace.window = {};
    globalNamespace.WebSocket = {};

    const providers = initProviders();

    expect(providers.webRequestService).toBeInstanceOf(WebRequestService);
    expect(providers.customDocumentCookieEventsService).toBeInstanceOf(CustomDocumentCookieEventsService);

    expect(providers.extensionStateService).toBeInstanceOf(ExtensionStateService);
    expect(providers.tabControllerService).toBeInstanceOf(TabControllerService);
    expect(providers.bootstrapService).toBeInstanceOf(BootstrapService);
    expect(providers.internalCommunicationService).toBeInstanceOf(InternalCommunicationService);
    expect(providers.webSocketService).toBeInstanceOf(WebsocketService);
    expect(providers.extractSessionIdService).toBeInstanceOf(ExtractSessionIdService);
    expect(providers.popupCommunicationService).toBeInstanceOf(PopupCommunicationService);
  });

  test("initProviders with non-chrome agent", () => {
    const globalNamespace = global as any;
    globalNamespace.navigator = { userAgent: "...Mozilla..." };
    globalNamespace.chrome = { webRequest: {}, runtime: {} };
    globalNamespace.document = {};
    globalNamespace.localStorage = {};
    globalNamespace.window = {};
    globalNamespace.WebSocket = {};

    const providers = initProviders();

    expect(providers.webRequestService).toBe(undefined);
    expect(providers.customDocumentCookieEventsService).toBe(undefined);

    expect(providers.extensionStateService).toBeInstanceOf(ExtensionStateService);
    expect(providers.tabControllerService).toBeInstanceOf(TabControllerService);
    expect(providers.bootstrapService).toBeInstanceOf(BootstrapService);
    expect(providers.internalCommunicationService).toBeInstanceOf(InternalCommunicationService);
    expect(providers.webSocketService).toBeInstanceOf(WebsocketService);
    expect(providers.extractSessionIdService).toBeInstanceOf(ExtractSessionIdService);
    expect(providers.popupCommunicationService).toBeInstanceOf(PopupCommunicationService);
  });
});
