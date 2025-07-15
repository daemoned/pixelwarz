import { InputHandler } from "./inputHandler.js";
import { Client } from "./client.js";
import { GUI } from "./gui.js"

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const client = new Client();
const gui = new GUI(client);
gui.init();

const input = new InputHandler();
input.init();

let lastInputTime = 0;

export function gameLoop() {
  // check if we are in right state otherwise exit.
  if (client.getState() !== "PLAYING") return;

  const now = Date.now();
  if (now - lastInputTime >= 100) {
    if (input.isPressed() && !gui.chatFocus()) {
      const keys = input.getKeys();
      input.getKeys
      //console.log(keys[keys.length - 1]);
      client.move(keys[keys.length - 1]);
      lastInputTime = now;
    } else {
      client.move(null);
      lastInputTime = now;
    }
  }

  render();
  window.requestAnimationFrame(gameLoop);
}

function render() {
  const gameState = client.getGameState();
  if (gameState) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameState.forEach((player) => {
      ctx.fillStyle = player.color;
      ctx.fillRect(player.position.x, player.position.y, 1, 1);
    });
  }

}

// DEBUG: make them accesible from browser console for debbuging.
window.client = client;
window.gui = gui;



