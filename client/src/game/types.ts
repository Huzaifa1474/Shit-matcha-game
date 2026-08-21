import type { Scene } from "@babylonjs/core/scene";

export type InputAction = "left" | "right" | "strike" | "guard";
export type MechaAction = "idle" | "move" | "strike" | "guard" | "damaged" | "down";
export type MatchState = "select" | "active" | "round-result" | "match-victory" | "match-defeat";
export type LoadoutKey = "vanguard" | "ironclad" | "sparkrunner";

export interface MechaProfile {
  key: LoadoutKey | "red-raider";
  label: string;
  callsign: string;
  maxHp: number;
  speed: number;
  strikeDamage: number;
  guardMultiplier: number;
  frameScale: number;
  accent: string;
  flare: string;
  description: string;
}

export const LOADOUTS: Record<LoadoutKey, MechaProfile> = {
  vanguard: { key: "vanguard", label: "BLUE VANGUARD", callsign: "UNIT 01", maxHp: 100, speed: 3.45, strikeDamage: 15, guardMultiplier: 0.28, frameScale: 1, accent: "#2b78d1", flare: "#f5b93d", description: "Balanced line unit. Reliable spacing and a clean all-purpose frame." },
  ironclad: { key: "ironclad", label: "IRONCLAD", callsign: "UNIT 03", maxHp: 125, speed: 2.75, strikeDamage: 17, guardMultiplier: 0.20, frameScale: 1.12, accent: "#346c9e", flare: "#e6bd58", description: "Plated breach chassis. Higher integrity and tighter guard at a slower pace." },
  sparkrunner: { key: "sparkrunner", label: "SPARKRUNNER", callsign: "UNIT 07", maxHp: 85, speed: 4.30, strikeDamage: 13, guardMultiplier: 0.36, frameScale: 0.9, accent: "#3d8fba", flare: "#7de8d0", description: "Light relay frame. Fast range control, but every clean hit matters." },
};

export const RED_RAIDER: MechaProfile = { key: "red-raider", label: "RED RAIDER", callsign: "UNIT 02", maxHp: 100, speed: 3.15, strikeDamage: 15, guardMultiplier: 0.28, frameScale: 1, accent: "#d7533f", flare: "#ff8a6c", description: "Fixed arena assault platform." };

export interface HudState {
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerState: MechaAction;
  enemyState: MechaAction;
  playerX: number;
  enemyX: number;
  matchState: MatchState;
  round: number;
  playerRounds: number;
  enemyRounds: number;
  playerLabel: string;
  playerCallsign: string;
  selectedLoadout: LoadoutKey;
  soundOn: boolean;
  message: string;
}

export interface GameHandle {
  scene: Scene;
  update: (delta: number) => void;
  setAction: (action: InputAction, pressed: boolean) => void;
  startMatch: (loadout: LoadoutKey) => void;
  returnToSelect: () => void;
  toggleAudio: () => boolean;
  dispose: () => void;
}
