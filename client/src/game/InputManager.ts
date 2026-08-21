import type { InputAction } from "./types";

const ACTION_BY_KEY: Record<string, InputAction | "reset"> = {
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  KeyJ: "strike",
  Space: "strike",
  KeyK: "guard",
  KeyR: "reset",
};

export class InputManager {
  private pressed = new Set<InputAction>();
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
  set(action: InputAction, pressed: boolean) { pressed ? this.pressed.add(action) : this.pressed.delete(action); }
  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.pressed.clear();
  }
}

