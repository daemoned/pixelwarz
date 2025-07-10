export class GUI {
  #client = null;
  #buttonsDiv = null;
  #statusDiv = null;

  constructor(client) {
    this.#client = client;
    this.#buttonsDiv = document.getElementById("buttons");
    this.#statusDiv = document.getElementById("status");
  }

  init() {
    this.renderButtons({ state: this.#client.getState() })
    document.addEventListener("stateChange", (event) => {
      this.renderButtons(event.detail);
    })
  }

  #clear(element) {
    element.innerHTML = "";
  }

  #createButton(text, onclick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.addEventListener("click", onclick);
    this.#buttonsDiv.appendChild(button);
  }

  #setStatus(text, color) {
    if (color === "red") {
      color = "text-red-500";
    } else if (color === "green") {
      color = "text-green-500";
    } else {
      color = "text-neutral-500";
    }
    this.#statusDiv.innerHTML = "";
    const status = document.createElement("p");
    status.textContent = text;
    status.classList.add(color);
    this.#statusDiv.appendChild(status);
  }

  renderButtons(event) {
    this.#clear(this.#buttonsDiv);
    switch (event.state) {
      case "DISCONNECTED":
        this.#createButton("Connect", () => this.#client.connect());
        event.message ? this.#setStatus(event.message, "red") : "";
        break;
      case "CONNECTED":
        this.#createButton("Play", () => this.#client.requestPlay());
        this.#createButton("Disconnect", () => this.#client.disconnect());
        event.message ? this.#setStatus(event.message, "green") : "";
        break;
      case "PLAYING":
        this.#createButton("Spectate", () => this.#client.stopPlay());
        this.#createButton("Disconnect", () => this.#client.disconnect());
        event.message ? this.#setStatus(event.message, "green") : "";
        break;
    }
  }
}