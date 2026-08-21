import type { Scene } from "@babylonjs/core/scene";

export type InputAction = "left" | "right" | "strike" | "guard";
export type MechaAction = "idle" | "move" | "strike" | "guard" | "damaged" | "down";
export type MatchState = "active" | "victory" | "defeat";

export interface HudState {
  playerHp: number;
  enemyHp: number;
  playerState: MechaAction;
  enemyState: MechaAction;
  matchState: MatchState;
  message: string;
}

export interface GameHandle {
  scene: Scene;
  setAction: (action: InputAction, pressed: boolean) => void;
  reset: () => void;
  dispose: () => void;
}

