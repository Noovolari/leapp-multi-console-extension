export class WebsocketService {
  private connected;
  private ws;

  constructor(public port: number = 8095, public interval: number = 10000) {
    this.connected = false;
    this.ws = null;
  }

  listen(): void {
    setInterval(() => {
      console.log("checking if connected...");
      if (!this.connected) {
        this.ws = this.createWebsocket(this.port);

        this.ws.onopen = (_) => {
          this.connected = true;
          console.log("connecting to websocket...");
        };

        this.ws.onmessage = (event) => {
          console.log("recevied: %s", event.data);
          // TODO Tell the Extension to open the received url in a new session tab
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
