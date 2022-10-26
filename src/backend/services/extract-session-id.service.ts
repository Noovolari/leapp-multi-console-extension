import { sessionIdRequest, sessionIdResponse } from "../models/constants";
import { ExtensionStateService } from "./extension-state.service";

export class ExtractSessionIdService {
  constructor(private backgroundPort: any, private state: ExtensionStateService) {}

  listen(): void {
    try {
      this.backgroundPort.onMessage.addListener((message) => {
        console.log(message);
        if (message.request === sessionIdResponse && message.content) {
          this.state.sessionToken = message.content;
        }
      });

      this.backgroundPort.onDisconnect.addListener(() => console.log("port disconnected"));
      this.backgroundPort.postMessage({ request: sessionIdRequest });
    } catch (err) {
      console.warn(err);
    }
  }
}
