import { sessionIdRequest, sessionIdResponse } from "../models/constants";
import { InternalCommunicationService } from "./internal-communication.service";
import { ExtensionStateService } from "./extension-state.service";

export class ExtractSessionIdService {
  constructor(private internalCommunicationService: InternalCommunicationService, private state: ExtensionStateService) {}

  listen(): void {
    try {
      const port = this.internalCommunicationService.connectToBackgroundScript();

      port.onMessage.addListener((message) => {
        console.log(message);
        if (message.request === sessionIdResponse) {
          if (message.content) {
            this.state.sessionToken = message.content;
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
