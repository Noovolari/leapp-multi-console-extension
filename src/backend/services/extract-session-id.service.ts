import { sessionIdRequest, sessionIdResponse } from "../models/constants";
import { InternalCommunicationService } from "./internal-communication.service";
import { ExtensionStateService } from "./extension-state.service";
import { CustomDocumentCookieEventsService } from "./custom-document-cookie-events.service";

export class ExtractSessionIdService {
  constructor(
    private internalCommunicationService: InternalCommunicationService,
    private state: ExtensionStateService,
    private customDocumentCookieEventsService?: CustomDocumentCookieEventsService
  ) {}

  listen(): void {
    try {
      const port = this.internalCommunicationService.connectToBackgroundScript();

      port.onMessage.addListener((message) => {
        console.log(message);
        if (message.request === sessionIdResponse && message.content) {
          this.state.sessionToken = message.content;
          if (this.state.isChrome) {
            if (!this.customDocumentCookieEventsService.isAlreadyBootstrapped()) {
              this.customDocumentCookieEventsService.setSessionToken(message.content);
              this.customDocumentCookieEventsService.listen();
            }
          }
        }
      });

      port.onDisconnect.addListener(() => console.log("port disconnected"));
      port.postMessage({ request: sessionIdRequest });
    } catch (err) {
      console.error(err);
    }
  }
}
