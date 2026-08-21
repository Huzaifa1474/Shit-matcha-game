import type { Scene } from "@babylonjs/core/scene";

export type InputAction = "left" | "right" | "strike" | "guard";
export type MechaAction = "idle" | "move" | "strike" | "guard" | "damaged" | "down";
export type MatchState = "select" | "active" | "round-result" | "match-victory" | "match-defeat";
export type LoadoutKey = "vanguard" | "ironclad" | "sparkrunner" | "bulwark" | "pulsewing";
export type MissionKey = "scrapline" | "furnace" | "moonfall" | "blacksite";
export type ChassisKind = "balanced" | "heavy" | "scout" | "bulwark" | "winged" | "raider" | "brute" | "warden" | "phantom";

export interface MechaProfile {
  key: LoadoutKey | string;
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
  chassis: ChassisKind;
}

export interface MissionDefinition {
  key: MissionKey;
  code: string;
  title: string;
  theatre: string;
  objective: string;
  reward: number;
  difficulty: 1 | 2 | 3 | 4;
  theatreClass: "scrapline" | "furnace" | "moonfall" | "blacksite";
  opponent: MechaProfile;
}

export const LOADOUTS: Record<LoadoutKey, MechaProfile> = {
  vanguard: { key: "vanguard", label: "BLUE VANGUARD", callsign: "UNIT 01", maxHp: 100, speed: 3.45, strikeDamage: 15, guardMultiplier: 0.28, frameScale: 1, accent: "#2b78d1", flare: "#f5b93d", description: "Balanced line unit. Reliable spacing and a clean all-purpose frame.", chassis: "balanced" },
  ironclad: { key: "ironclad", label: "IRONCLAD", callsign: "UNIT 03", maxHp: 125, speed: 2.75, strikeDamage: 17, guardMultiplier: 0.20, frameScale: 1.12, accent: "#54748a", flare: "#e6bd58", description: "Plated breach chassis. Higher integrity and tighter guard at a slower pace.", chassis: "heavy" },
  sparkrunner: { key: "sparkrunner", label: "SPARKRUNNER", callsign: "UNIT 07", maxHp: 85, speed: 4.30, strikeDamage: 13, guardMultiplier: 0.36, frameScale: 0.9, accent: "#55a6c7", flare: "#7de8d0", description: "Light relay frame. Fast range control, but every clean hit matters.", chassis: "scout" },
  bulwark: { key: "bulwark", label: "BULWARK-9", callsign: "UNIT 11", maxHp: 142, speed: 2.38, strikeDamage: 20, guardMultiplier: 0.17, frameScale: 1.2, accent: "#65777d", flare: "#ffbe3b", description: "Siege-frame interceptor. Massive integrity and impact force for deliberate pilots.", chassis: "bulwark" },
  pulsewing: { key: "pulsewing", label: "PULSEWING", callsign: "UNIT 14", maxHp: 92, speed: 4.05, strikeDamage: 16, guardMultiplier: 0.31, frameScale: 0.94, accent: "#446bd1", flare: "#69e7ff", description: "Aerial relay frame. Featherweight thrusters turn timing into an advantage.", chassis: "winged" },
};

const RED_RAIDER: MechaProfile = { key: "red-raider", label: "RED RAIDER", callsign: "UNIT 02", maxHp: 100, speed: 3.15, strikeDamage: 15, guardMultiplier: 0.28, frameScale: 1, accent: "#d7533f", flare: "#ff8a6c", description: "Fixed arena assault platform.", chassis: "raider" };

export const MISSIONS: Record<MissionKey, MissionDefinition> = {
  scrapline: { key: "scrapline", code: "OP-01", title: "SCRAPLINE BREACH", theatre: "RUSTBELT ARENA", objective: "Hold the central rail against an assault platform.", reward: 240, difficulty: 1, theatreClass: "scrapline", opponent: RED_RAIDER },
  furnace: { key: "furnace", code: "OP-02", title: "FURNACE ECHO", theatre: "CINDER FOUNDRY", objective: "Disrupt a thermal extraction convoy before launch.", reward: 360, difficulty: 2, theatreClass: "furnace", opponent: { key: "furnace-drake", label: "FURNACE DRAKE", callsign: "UNIT 22", maxHp: 112, speed: 2.92, strikeDamage: 17, guardMultiplier: 0.25, frameScale: 1.08, accent: "#c15b36", flare: "#ffcc4a", description: "Heat-scarred excavation breaker.", chassis: "brute" } },
  moonfall: { key: "moonfall", code: "OP-03", title: "MOONFALL RELAY", theatre: "ORBITAL SCRAPYARD", objective: "Secure the uplink relay before the eclipse window closes.", reward: 480, difficulty: 3, theatreClass: "moonfall", opponent: { key: "void-warden", label: "VOID WARDEN", callsign: "UNIT 31", maxHp: 105, speed: 3.62, strikeDamage: 18, guardMultiplier: 0.23, frameScale: 1.02, accent: "#7249a1", flare: "#73e5ff", description: "Relay defense frame with a drifting guard field.", chassis: "warden" } },
  blacksite: { key: "blacksite", code: "OP-04", title: "BLACKSITE ZERO", theatre: "NIGHT VAULT", objective: "Disable the blacksite commander and claim its encrypted cache.", reward: 650, difficulty: 4, theatreClass: "blacksite", opponent: { key: "signal-phantom", label: "SIGNAL PHANTOM", callsign: "UNIT 66", maxHp: 116, speed: 3.82, strikeDamage: 19, guardMultiplier: 0.21, frameScale: 0.95, accent: "#8b3b88", flare: "#ff68bb", description: "Stealth relay killer built for blackout incursions.", chassis: "phantom" } },
};

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
  enemyLabel: string;
  enemyCallsign: string;
  selectedLoadout: LoadoutKey;
  missionKey: MissionKey;
  missionTitle: string;
  missionObjective: string;
  missionReward: number;
  theatreClass: MissionDefinition["theatreClass"];
  soundOn: boolean;
  message: string;
}

export interface GameHandle {
  scene: Scene;
  update: (delta: number) => void;
  setAction: (action: InputAction, pressed: boolean) => void;
  startMatch: (loadout: LoadoutKey, mission: MissionKey) => void;
  returnToSelect: () => void;
  toggleAudio: () => boolean;
  dispose: () => void;
}
