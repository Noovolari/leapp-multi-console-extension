import { sessionIdRequest, sessionIdResponse } from "../models/constants";
import { InternalCommunicationService } from "./internal-communication.service";
import { CustomDocumentCookieEventsService } from "./custom-document-cookie-events.service";

export class ExtractSessionIdService {
  constructor(
    private internalCommunicationService: InternalCommunicationService,
    private customDocumentCookieEventsService: CustomDocumentCookieEventsService
  ) {}

  listen(): void {
    try {
      const port = this.internalCommunicationService.connectToBackgroundScript();

      port.onMessage.addListener((message) => {
        if (message.request === sessionIdResponse) {
          if (message.content) {
            this.customDocumentCookieEventsService.sessionToken = message.content;
          } else {
            window.location.reload();
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
