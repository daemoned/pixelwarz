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
//window.requestAnimationFrame(gameLoop);

const client = new Client();
const gui = new GUI(client);

gui.init();

// DEBUG: make them accesible from browser console for debbuging.
window.client = client;
window.gui = gui;



