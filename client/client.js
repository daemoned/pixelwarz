export class Client {
  #validStates = new Set([
    "DISCONNECTED",
    "CONNECTED",
    "PLAYING",
    "ERROR"
  ]);
  #state = null;
  #lastState = null;
  #name = null;
  url = null;
  #ws = null;

  constructor(url = "ws://" + window.location.host + "/ws") {
    // Always start disconnected.
    this.#state = "DISCONNECTED";
    this.#lastState = "DISCONNECTED";
    this.url = url;
    //this.#name = "Anonymous";
  }

  #dispatchEvent(message) {
    const event = new CustomEvent("stateChange", {
      detail: {
        state: this.#state,
        lastState: this.#lastState,
        message: message
      }
    })
    document.dispatchEvent(event);
  }

  #setState(newState, message) {
    if (this.#validStates.has(newState)) {
      this.#lastState = this.#state;
      this.#state = newState;
      this.#dispatchEvent(message);
      return true;
    } else {
      return false;
    }
  }

  getState() {
    return this.#state;
  }

  getName() {
    return this.#name;
  }

  disconnect() {
    this.#ws.close();
    this.#setState("DISCONNECTED");
  }

  connect() {

    // Check if it's already open or in the process of connecting.
    if (this.#ws && (this.#ws.readyState === WebSocket.OPEN || this.#ws.readyState === WebSocket.CONNECTING)) {
      console.warn("WebSocket is already connected or connecting.");
      return;
    }

    // Check of there is a name yet and connect.
    if (this.#name) {
      this.#ws = new WebSocket(this.url);
      this.#ws.onopen = () => this.#wsOpen();
      this.#ws.onclose = (event) => this.#wsClose(event);
      return true;
    } else {
      const name = prompt("Enter player name:");
      if (name) {
        this.#name = name;
        return this.connect();
      } else {
        return false;
      }
    }
  }

  #wsOpen() {
    this.#setState("CONNECTED", `You are connected as ${this.#name}.`);
    this.#ws.send(JSON.stringify({
      type: "new",
      name: this.#name
    }))
  }

  #wsClose(event) {
    // Check if server sent 4000 which we handle as a timeout/inactivity.
    if (event.code === 4000) {
      this.#setState("DISCONNECTED", "Timeout: You were inactive for 5 minutes");
    } else {
      this.#setState("DISCONNECTED", "You were disconnected.");
    }
    return;
  }

  requestPlay() {
    // TODO: handle reqesut for a play slot.
    this.#setState("PLAYING", "You are playing. Good luck!");
  }

  stopPlay() {
    // TODO: tell server to stop playing but stay connected for chat and realtime updates
    this.#setState("CONNECTED", "You left the game.");
  }

}