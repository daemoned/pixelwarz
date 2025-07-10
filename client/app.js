import { InputHandler } from "./inputHandler.js";
import { Client } from "./client.js";
import { GUI } from "./gui.js"

/*const input = new InputHandler(document);

input.init();

function gameLoop() {
  if (input.isPressed()) {
    console.log(input.getKeys());
  }

  window.requestAnimationFrame(gameLoop);
}*/

const client = new Client();
const gui = new GUI(client);

console.log(client.getName())
gui.init();

let playerName = undefined;
let ws = null;

const btn = btnHandler();

function connectWebSocket() {
  ws = new WebSocket("ws://" + window.location.host + "/ws");
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "new", name: playerName }))
  }
  ws.onmessage = (event) => {
    let parsed;

    try {
      parsed = JSON.parse(event.data);
    } catch {
      console.log("Failed parsing server response.");
      return;
    }

    switch (parsed.type) {
      case "chat":
        handleChat(parsed);
        break;
    }

    //console.log("Received:", parsed);
  }
  ws.onclose = () => {
    btn.timeout();
  }
}

function handleChat(obj) {
  const chat = document.getElementById("chat");
  const message = document.createElement("p");
  const name = document.createElement("span");
  name.classList.add("text-neutral-200");
  name.textContent = `${obj.name}: `;
  message.appendChild(name);
  const text = document.createTextNode(obj.text);
  message.appendChild(text);
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

document.getElementById("message").addEventListener("keydown", (event) => {
  if (event.key == "Enter") {
    sendChat();
  }
})

function sendChat() {
  const text = document.getElementById("message");
  if (text.value) {
    ws.send(JSON.stringify({
      type: "chat",
      text: text.value
    }))
  }
  text.value = "";
}

function btnHandler() {
  const container = document.getElementById("buttons");
  const clear = () => container.innerHTML = "";
  const create = (text, onclick) => {
    const button = document.createElement("button");
    button.textContent = text;
    button.onclick = onclick;
    container.appendChild(button);
  };
  const status = (text, color) => {
    const status = document.getElementById("status");
    status.innerHTML = "";
    const message = document.createElement("p");
    message.textContent = text;
    message.classList.add(color);
    status.appendChild(message);
  }
  return {
    connect() {
      if (playerName === undefined || playerName === null) {
        playerName = prompt("Enter player name:");
        if (playerName) {
          connectWebSocket();
          clear();
          create("Play", btn.play);
          create("Disconnect", btn.disconnect);
          status();
        }
        return;
      } else {
        connectWebSocket();
        clear();
        create("Play", btn.play);
        create("Disconnect", btn.disconnect);
        status();
      }
    },
    play() {
      state = "PLAYING"
      console.log("Play pressed.");
      clear();
      create("Spectate");
      create("Disconnect", btn.disconnect);
    },
    disconnect() {
      ws.close();
      clear();
      create("Connect", btn.connect);
    },
    timeout() {
      clear();
      create("Connect", btn.connect);
      status("You were disconnected.", "text-red-500");
    }
  }
}

//window.requestAnimationFrame(gameLoop);