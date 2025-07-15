import { gameLoop } from "./app.js";

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
  #gameState = null;

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

  setName(name) {
    this.#name = name;
    return true;
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
      this.#ws.onmessage = (event) => this.#wsMessage(event);
      return true;
    } else {
      return false;
    }
  }

  #wsOpen() {
    // Update state and send our name on connect.
    this.#setState("CONNECTED", `You are connected as ${this.#name}.`);
    this.#ws.send(JSON.stringify({
      type: "NEW",
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

  #wsMessage(event) {
    // Parse message from server.
    let parsed;
    try {
      parsed = JSON.parse(event.data);
    } catch {
      this.#setState("ERROR", "Failed parsing server message.");
      return;
    }

    // Handle all types of messages.
    switch (parsed.type) {
      case "CHAT":
        this.#newChat(parsed.name, parsed.message);
        break;
      case "ERROR":
        this.#setState("ERROR", parsed.message);
        break;
      case "CLIENTS":
        this.#newClient(parsed.list);
        break;
      case "PLAYING":
        this.#handlePlay(parsed.color);
        break;
      case "GAME":
        this.#gameState = parsed.data;
        break;
      default:
        console.log(parsed);
        break;
    }
  }

  requestPlay() {
    this.#ws.send(JSON.stringify({
      type: "REQUEST_PLAY"
    }))
  }

  getGameState() {
    return this.#gameState;
  }

  #handlePlay(color) {
    if (color) {
      this.#setState("PLAYING", "You are playing. Good luck!");
      console.log(color);
      gameLoop();
    } else {
      this.#setState("CONNECTED", "Sorry. No more slots in game.");
    }
  }

  move(input) {
    if (this.getState() === "PLAYING") {
      this.#ws.send(JSON.stringify({
        type: "MOVE",
        key: input
      }))
    }
  }

  stopPlay() {
    this.#ws.send(JSON.stringify({
      type: "STOP_PLAY"
    }));
    // TODO: tell server to stop playing but stay connected for chat and realtime updates
    this.#setState("CONNECTED", "You left the game.");
  }

  sendChat(message) {
    // Check if we have the right state and that the message is not empty or to long.
    if (
      (this.getState() === "CONNECTED" || this.getState() === "PLAYING") &&
      (message.length > 0 && message.length < 255)
    ) {
      this.#ws.send(JSON.stringify({
        type: "CHAT",
        message: message
      }));
      return true;
    } else {
      return false;
    }
  }

  #newChat(name, message) {
    const event = new CustomEvent("newChat", {
      detail: {
        name: name,
        message: message
      }
    })
    document.dispatchEvent(event);
    return true;
  }

  #newClient(list) {
    const event = new CustomEvent("newClient", {
      detail: {
        list: list,
      }
    })
    document.dispatchEvent(event);
    return true;
  }

}