import type { Scene } from "@babylonjs/core/scene";

export type InputAction = "left" | "right" | "strike" | "guard";
export type MechaAction = "idle" | "move" | "strike" | "guard" | "damaged" | "down";
export type MatchState = "select" | "active" | "round-result" | "match-victory" | "match-defeat";
export type LoadoutKey = "vanguard" | "ironclad" | "sparkrunner" | "bulwark" | "pulsewing";
export type MissionKey = string;
export type CampaignStage = 1 | 2 | 3;
export type TheatreClass = "frontier" | "foundry" | "vault";
export type ChassisKind = "balanced" | "heavy" | "scout" | "bulwark" | "winged" | "raider" | "brute" | "warden" | "phantom" | "crown";

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

export interface AiTuning {
  aggression: number;
  attackInterval: number;
  guardChance: number;
  pursuitRange: number;
}

export interface MissionDefinition {
  key: MissionKey;
  code: string;
  title: string;
  stage: CampaignStage;
  stageLabel: string;
  level: number;
  theatre: string;
  objective: string;
  reward: number;
  difficulty: number;
  theatreClass: TheatreClass;
  backgroundUrl: string;
  enemyArtUrl: string;
  opponent: MechaProfile;
  ai: AiTuning;
}

export const LOADOUTS: Record<LoadoutKey, MechaProfile> = {
  vanguard: { key: "vanguard", label: "AEGIS RIFT", callsign: "PILOT-01", maxHp: 100, speed: 3.45, strikeDamage: 15, guardMultiplier: 0.25, frameScale: 1, accent: "#236ee2", flare: "#38eaff", description: "Custom assault frame with a rail-saber guard and twin cyan vector thrusters.", chassis: "balanced" },
  ironclad: { key: "ironclad", label: "IRONCLAD BASTION", callsign: "PILOT-03", maxHp: 125, speed: 2.75, strikeDamage: 17, guardMultiplier: 0.18, frameScale: 1.12, accent: "#54748a", flare: "#e6bd58", description: "Plated breach chassis built around a reinforced kinetic shield array.", chassis: "heavy" },
  sparkrunner: { key: "sparkrunner", label: "SPARKRUNNER ARC", callsign: "PILOT-07", maxHp: 85, speed: 4.30, strikeDamage: 13, guardMultiplier: 0.33, frameScale: 0.9, accent: "#38a5ca", flare: "#7de8d0", description: "Fast relay hunter with a compact antenna crest and evasive booster frame.", chassis: "scout" },
  bulwark: { key: "bulwark", label: "BULWARK-9", callsign: "PILOT-11", maxHp: 142, speed: 2.38, strikeDamage: 20, guardMultiplier: 0.15, frameScale: 1.2, accent: "#65777d", flare: "#ffbe3b", description: "Siege-frame interceptor with fortress shoulders and a high-mass cutter arm.", chassis: "bulwark" },
  pulsewing: { key: "pulsewing", label: "PULSEWING NOVA", callsign: "PILOT-14", maxHp: 92, speed: 4.05, strikeDamage: 16, guardMultiplier: 0.28, frameScale: 0.94, accent: "#446bd1", flare: "#69e7ff", description: "Wing-fin combat frame that converts booster precision into strike tempo.", chassis: "winged" },
};

const STAGE_BACKGROUNDS: Record<TheatreClass, string> = {
  frontier: "/manus-storage/stage-one-scrapyard-dawn_c2c9282f.png",
  foundry: "/manus-storage/stage-two-cinder-foundry_0ec1dcff.png",
  vault: "/manus-storage/stage-three-night-vault_f0020e9b.png",
};

const STAGE_META: Record<CampaignStage, { label: string; theatre: string; theatreClass: TheatreClass; enemy: MechaProfile; enemyArtUrl: string; titles: string[]; objectives: string[] }> = {
  1: {
    label: "STAGE I // SCRAPLINE FRONTIER", theatre: "SCRAPYARD DAWN", theatreClass: "frontier", enemyArtUrl: "/manus-storage/ember-wraith-custom-frame_75ff79a0.png",
    enemy: { key: "ember-wraith", label: "EMBER WRAITH", callsign: "ENEMY-01", maxHp: 108, speed: 3.15, strikeDamage: 15, guardMultiplier: 0.28, frameScale: 1, accent: "#c92832", flare: "#ff7b26", description: "Crimson duelist chassis with a heated plasma blade.", chassis: "raider" },
    titles: ["RAILHEAD BREACH", "SALVAGE BARRAGE", "DUSTLINE DUEL", "CRANELOCK", "TOWER CIRCUIT", "MOONLIT SCRAP", "FRONTIER COMMAND"],
    objectives: ["Break the first hostile rail patrol.", "Secure the salvage lane before convoy dawn.", "Disable a wraith escort on the dustline.", "Hold the cargo crane junction.", "Capture the cyan relay tower.", "Survive the moonlit scrap ambush.", "Defeat the Scrapline commander."],
  },
  2: {
    label: "STAGE II // CINDER FOUNDRY", theatre: "CINDER FOUNDRY", theatreClass: "foundry", enemyArtUrl: "/manus-storage/warden-helix-boss-frame_114334d4.png",
    enemy: { key: "warden-helix", label: "WARDEN HELIX", callsign: "ENEMY-22", maxHp: 126, speed: 3.28, strikeDamage: 18, guardMultiplier: 0.22, frameScale: 1.08, accent: "#673c92", flare: "#72e6ff", description: "Violet security commander with an articulated hard-light guard halo.", chassis: "warden" },
    titles: ["FURNACE GATE", "CHAINFALL", "HEAT SINK", "SMELTER RUN", "ASHEN RELAY", "MAGNETIC CRUCIBLE", "FOUNDRY OVERSEER"],
    objectives: ["Open the sealed furnace gate.", "Break the chain-lift security patrol.", "Secure the coolant-control heat sink.", "Outrun the smelter line commander.", "Claim the ashen relay uplink.", "Survive the magnetic crucible shift.", "Defeat the Foundry overseer."],
  },
  3: {
    label: "FINAL STAGE // NIGHT VAULT", theatre: "NIGHT VAULT", theatreClass: "vault", enemyArtUrl: "/manus-storage/zero-crown-final-boss-frame_f74aa26d.png",
    enemy: { key: "zero-crown", label: "ZERO CROWN", callsign: "ENEMY-66", maxHp: 148, speed: 3.44, strikeDamage: 21, guardMultiplier: 0.19, frameScale: 1.18, accent: "#b12645", flare: "#ff58bc", description: "Obsidian final commander carrying a shield blade and reactor crown.", chassis: "crown" },
    titles: ["BLACKSITE ENTRY", "SECURITY ECLIPSE", "VAULT HEART", "CROWN PROTOCOL", "ZERO HOUR", "THE FINAL LINK"],
    objectives: ["Breach the first Night Vault security line.", "Disable the eclipse relay defenses.", "Claim the vault-heart reactor channel.", "Break the CROWN protocol guard network.", "Survive the final zero-hour barrage.", "Defeat ZERO CROWN and secure the campaign."],
  },
};

const makeLevel = (level: number): MissionDefinition => {
  const stage: CampaignStage = level <= 7 ? 1 : level <= 14 ? 2 : 3;
  const index = stage === 1 ? level - 1 : stage === 2 ? level - 8 : level - 15;
  const meta = STAGE_META[stage];
  const opponent = { ...meta.enemy, maxHp: meta.enemy.maxHp + (level - 1) * 8, speed: Number((meta.enemy.speed + (level - 1) * 0.035).toFixed(2)), strikeDamage: meta.enemy.strikeDamage + Math.floor((level - 1) / 3), guardMultiplier: Math.max(0.11, Number((meta.enemy.guardMultiplier - (level - 1) * 0.004).toFixed(2))) };
  return {
    key: `level-${String(level).padStart(2, "0")}`,
    code: `LVL-${String(level).padStart(2, "0")}`,
    title: meta.titles[index], stage, stageLabel: meta.label, level, theatre: meta.theatre, objective: meta.objectives[index], reward: 210 + level * 85, difficulty: level, theatreClass: meta.theatreClass,
    backgroundUrl: STAGE_BACKGROUNDS[meta.theatreClass], enemyArtUrl: meta.enemyArtUrl, opponent,
    ai: { aggression: Number((0.3 + level * 0.03).toFixed(2)), attackInterval: Math.max(0.34, Number((1.1 - level * 0.032).toFixed(2))), guardChance: Math.min(0.58, Number((0.12 + level * 0.02).toFixed(2))), pursuitRange: Math.max(1.5, Number((2.45 - level * 0.035).toFixed(2))) },
  };
};

export const CAMPAIGN_LEVELS = Array.from({ length: 20 }, (_, index) => makeLevel(index + 1));
export const MISSIONS: Record<MissionKey, MissionDefinition> = Object.fromEntries(CAMPAIGN_LEVELS.map((mission) => [mission.key, mission]));

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
  missionLevel: number;
  stage: CampaignStage;
  stageLabel: string;
  theatreClass: TheatreClass;
  backgroundUrl: string;
  enemyArtUrl: string;
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
