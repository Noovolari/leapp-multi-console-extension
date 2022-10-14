import { TabControllerService } from "./tab-controller.service";
import { LeappSessionInfo } from "../models/leapp-session-info";

export class WebsocketService {
  private connected;
  private ws;

  constructor(private tabControllerService: TabControllerService, public port: number = 8095, public interval: number = 6000) {
    this.connected = false;
    this.ws = null;
  }

  listen(): void {
    setInterval(() => {
      console.log("checking if connected");
      if (!this.connected) {
        this.ws = this.createWebsocket(this.port);

        this.ws.onopen = (_) => {
          this.connected = true;
          console.log("connecting to websocket...");
        };

        this.ws.onmessage = (event) => {
          const payload: LeappSessionInfo = JSON.parse(event.data);
          console.log("received: %s", payload);
          this.tabControllerService.openNewSessionTab(payload);
          this.ws.send("payload from Leapp received correctly");
        };

        this.ws.onclose = (_) => {
          this.connected = false;
          console.log("closing...");
        };

        this.ws.onerror = (_) => {
          this.connected = false;
          console.log("can't connect!");
        };
      }
    }, this.interval);
  }

  private createWebsocket(port: number): WebSocket {
    return new WebSocket(`ws://localhost:${port}`);
  }
}
