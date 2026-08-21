import type { InputAction } from "./types";

const ACTION_BY_KEY: Record<string, InputAction | "reset"> = {
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  KeyJ: "strike",
  Space: "strike",
  KeyK: "guard",
  KeyQ: "special",
  KeyL: "boost",
  ShiftLeft: "boost",
  ShiftRight: "boost",
  KeyR: "reset",
};

export class InputManager {
  private pressed = new Set<InputAction>();
  private queued = new Set<InputAction>();
  private readonly onReset: () => void;
  private readonly onKeyDown: (event: KeyboardEvent) => void;
  private readonly onKeyUp: (event: KeyboardEvent) => void;

  constructor(onReset: () => void) {
    this.onReset = onReset;
    this.onKeyDown = (event) => {
      const action = ACTION_BY_KEY[event.code];
      if (!action) return;
      event.preventDefault();
      if (action === "reset") {
        if (!event.repeat) this.onReset();
        return;
      }
      if (!this.pressed.has(action)) this.queued.add(action);
      this.pressed.add(action);
    };
    this.onKeyUp = (event) => {
      const action = ACTION_BY_KEY[event.code];
      if (action && action !== "reset") this.pressed.delete(action);
    };
    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp);
  }

  isDown(action: InputAction) { return this.pressed.has(action); }
  consume(action: InputAction) { if (!this.queued.has(action)) return false; this.queued.delete(action); return true; }
  set(action: InputAction, pressed: boolean) { if (pressed && !this.pressed.has(action)) this.queued.add(action); pressed ? this.pressed.add(action) : this.pressed.delete(action); }
  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.pressed.clear();
    this.queued.clear();
  }
}
