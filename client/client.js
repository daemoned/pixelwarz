let PLAYING = false;
let playerName = undefined;
let ws = null;

const btn = btnHandler();

function connectWebSocket() {
  ws = new WebSocket("ws://" + window.location.host + "/ws");
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "new", name: playerName }))
  }
  ws.onmessage = (event) => {
    console.log("Received:", event.data);
  }
  ws.onclose = () => {
    btn.timeout();
  }
}

function sendChat(text) {
  ws.send(JSON.stringify({
    type: "chat",
    text: text
  }))
}

function btnHandler() {
  const container = document.getElementById("buttons");
  const clear = () => container.innerHTML = "";
  const create = (text, onclick) => {
    const button = document.createElement("button");
    button.textContent = text;
    button.onclick = onclick;
    container.appendChild(button);
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
        }
        return;
      } else {
        connectWebSocket();
        clear();
        create("Play", btn.play);
        create("Disconnect", btn.disconnect);
      }
    },
    play() {
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
      const message = document.createElement("p");
      message.textContent = "Timeout: You were disconnected. No activity for 5 minutes.";
      message.style = "color: red";
      container.appendChild(message);
    }
  }
}
