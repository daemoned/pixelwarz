export class InputHandler {
  #movement = new Set(["w", "a", "s", "d"]);
  // attack
  // actions
  #pressed = new Set();

  constructor() {

  }

  init() {
    document.addEventListener("keydown", (event) => this.#keyDown(event));
    document.addEventListener("keyup", (event) => this.#keyUp(event));
  }
  #keyDown(event) {
    const key = event.key.toLowerCase();
    if (this.#movement.has(key) && !this.#pressed.has(key)) {
      this.#pressed.add(key);
    }
  }
  #keyUp(event) {
    const key = event.key.toLowerCase();
    if (this.#movement.has(key)) {
      this.#pressed.delete(key);
    }
  }
  getKeys() {
    return Array.from(this.#pressed);
  }
  isPressed() {
    return this.#pressed.size;
  }

}