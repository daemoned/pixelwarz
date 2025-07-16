export class GUI {
  #client = null;
  #buttonsDiv = null;
  #statusDiv = null;
  #chatDiv = null;
  #messageInput = null;
  #sendButton = null;
  #playersDiv = null;
  #clientsDiv = null;


  constructor(client) {
    this.#client = client;
    this.#buttonsDiv = document.getElementById("buttons");
    this.#statusDiv = document.getElementById("status");
    this.#chatDiv = document.getElementById("chat");
    this.#messageInput = document.getElementById("message");
    this.#sendButton = document.getElementById("send");
    this.#playersDiv = document.getElementById("players");
    this.#clientsDiv = document.getElementById("clients");
  }

  init() {
    this.renderButtons({ state: this.#client.getState() })

    // Handle all state change events
    document.addEventListener("stateChange", (event) => {
      this.renderButtons(event.detail);
      this.handleChat(event.detail);
    })

    // Handle chat box enter and button click.
    this.#messageInput.addEventListener("keydown", (event) => event.key === "Enter" ? this.sendChat() : null);
    this.#sendButton.addEventListener("click", () => this.sendChat());

    // Handle new chat messages.
    document.addEventListener("newChat", (event) => this.newChat(event.detail));

    // Handle new clients and players.
    document.addEventListener("newClient", (event) => this.newClient(event.detail));
    document.addEventListener("updatePlayers", (event) => this.updatePlayers(event.detail));

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

  chatFocus() {
    if (document.activeElement === this.#messageInput) {
      return true;
    } else {
      return false;
    }
  }

  renderButtons(event) {
    this.#clear(this.#buttonsDiv);
    switch (event.state) {
      case "DISCONNECTED":
        if (this.#client.getName()) {
          this.#createButton("Connect", () => this.#client.connect());
          event.message ? this.#setStatus(event.message, "red") : "";
          this.#clientsDiv.innerHTML = "";
          this.#playersDiv.innerHTML = "";
        } else {
          this.#createButton("Connect", () => this.setName());
          this.#clientsDiv.innerHTML = "";
          this.#playersDiv.innerHTML = "";
        }
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

  handleChat(event) {
    // Handle state change
    if (event.state === "CONNECTED" || event.state === "PLAYING") {
      this.#messageInput.hidden = false;
      this.#sendButton.hidden = false;
    } else {
      this.#messageInput.hidden = true;
      this.#sendButton.hidden = true;
    }
  }

  sendChat() {
    const message = this.#messageInput.value;
    if (message.length > 0 && message.length < 255) {
      this.#client.sendChat(message);
    } else {
      return false;
    }
    this.#messageInput.value = "";
  }

  newChat(obj) {
    // Create HTML element and append to chat and scroll...
    const message = document.createElement("p");
    const name = document.createElement("span");
    const text = document.createTextNode(obj.message);

    name.classList.add("text-neutral-200");
    name.textContent = `${obj.name}: `;
    message.appendChild(name);
    message.appendChild(text);

    this.#chatDiv.appendChild(message);
    this.#chatDiv.scrollTop = this.#chatDiv.scrollHeight;
    return true;
  }

  newClient(obj) {
    const list = obj.list;
    this.#clientsDiv.innerHTML = "";
    list.forEach(name => {
      const span = document.createElement("span");
      span.textContent = name;
      span.classList.add("bg-neutral-800");
      span.classList.add("text-neutral-400");
      span.classList.add("px-3");
      span.classList.add("py-1");
      this.#clientsDiv.appendChild(span);
    });
    return true;
  }

  updatePlayers(obj) {
    const list = obj.list;
    this.#playersDiv.innerHTML = "";
    list.forEach(item => {
      const span = document.createElement("span");
      span.textContent = item.name;
      span.classList.add("bg-neutral-800");
      //span.classList.add("text-neutral-400");
      span.classList.add("px-3");
      span.classList.add("py-1");
      span.style.color = item.color;
      this.#playersDiv.appendChild(span);
    });
  }

  setName() {
    const name = prompt("Enter player name, max 16 characters.");
    if (name && name.length > 0 && name.length < 16) {
      this.#client.setName(name);
      this.#client.connect();
      //this.renderButtons({ state: "DISCONNECTED" });
      return true;
    } else {
      alert("Name must be atleast 1 character and max 16 characters.");
      return false;
    }
  }

}