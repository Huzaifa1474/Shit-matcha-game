import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Scene } from "@babylonjs/core/scene";
import { AudioManager } from "./AudioManager";
import { InputManager } from "./InputManager";
import { Mecha } from "./Mecha";
import { LOADOUTS, RED_RAIDER, type HudState, type InputAction, type LoadoutKey, type MatchState } from "./types";

const BACKDROP_URL = "/manus-storage/rustbelt-arena-backdrop_1351a937.png";
const BLUE_MECHA_URL = "/manus-storage/blue-vanguard-mecha_07647d6a.png";
const RED_MECHA_URL = "/manus-storage/red-raider-mecha_87c0fcb9.png";

export class GameWorld {
  readonly player: Mecha;
  readonly enemy: Mecha;
  private readonly input: InputManager;
  private readonly audio = new AudioManager();
  private readonly scene: Scene;
  private readonly publishHud: (state: HudState) => void;
  private readonly demo: boolean;
  private matchState: MatchState = "select";
  private selectedLoadout: LoadoutKey = "vanguard";
  private round = 1;
  private playerRounds = 0;
  private enemyRounds = 0;
  private nextRoundAt = 0;
  private message = "HANGAR LINK // SELECT A FRAME";
  private lastHudPublish = 0;
  private nextAiAt = 0;
  private lastStepAt = 0;
  private lastGuardAt = 0;
  private demoCycle = 0;
  private demoStart = 0;
  private impactFlash: AbstractMesh;
  private impactFlashUntil = 0;
  private smoke: AbstractMesh[] = [];

  constructor(scene: Scene, publishHud: (state: HudState) => void, demo: boolean) {
    this.scene = scene;
    this.publishHud = publishHud;
    this.demo = demo;
    this.buildStage();
    this.player = new Mecha(scene, { id: "player", startX: -3.55, direction: 1, textureUrl: BLUE_MECHA_URL, profile: LOADOUTS.vanguard });
    this.enemy = new Mecha(scene, { id: "enemy", startX: 3.55, direction: -1, textureUrl: RED_MECHA_URL, profile: RED_RAIDER });
    this.input = new InputManager(() => this.returnToSelect());
    this.impactFlash = MeshBuilder.CreateDisc("impact-flash", { radius: 0.55, tessellation: 8 }, scene);
    this.impactFlash.position.z = -0.55;
    const flashMaterial = new StandardMaterial("impact-flash-material", scene);
    flashMaterial.diffuseColor = Color3.FromHexString("#fff3cd");
    flashMaterial.emissiveColor = Color3.FromHexString("#ffb436");
    flashMaterial.alpha = 0.88;
    flashMaterial.disableLighting = true;
    this.impactFlash.material = flashMaterial;
    this.impactFlash.isVisible = false;
    this.demoStart = performance.now() / 1000;
    if (demo) this.startMatch("vanguard", true);
    else this.emitHud(true);
  }

  setAction(action: InputAction, pressed: boolean) { this.input.set(action, pressed); }

  startMatch(loadout: LoadoutKey, demoLaunch = false) {
    const now = performance.now() / 1000;
    this.selectedLoadout = loadout;
    this.player.setProfile(LOADOUTS[loadout]);
    this.round = 1;
    this.playerRounds = 0;
    this.enemyRounds = 0;
    this.matchState = "active";
    this.message = "ROUND 01 // SIGNAL GREEN";
    this.player.reset(-3.55, now);
    this.enemy.reset(3.55, now);
    this.demoStart = now;
    if (!demoLaunch) this.audio.unlock();
    this.audio.play("round");
    this.emitHud(true);
  }

  returnToSelect() {
    const now = performance.now() / 1000;
    this.matchState = "select";
    this.message = "HANGAR LINK // SELECT A FRAME";
    this.player.reset(-3.55, now);
    this.enemy.reset(3.55, now);
    this.emitHud(true);
  }

  toggleAudio() { const on = this.audio.toggle(); this.emitHud(true); return on; }

  update(delta: number) {
    const now = performance.now() / 1000;
    if (this.matchState === "active") {
      if (this.demo) this.runDemo(now, delta); else this.runLiveInputs(now, delta);
      this.player.update(now, delta);
      this.enemy.update(now, delta);
      this.resolveImpacts(now);
    } else {
      this.player.update(now, delta);
      this.enemy.update(now, delta);
      if (this.matchState === "round-result" && now >= this.nextRoundAt) this.beginNextRound(now);
    }
    this.updateSceneMotion(now);
    if (now - this.lastHudPublish > 0.09) this.emitHud();
  }

  dispose() { this.input.dispose(); this.audio.dispose(); }

  private beginNextRound(now: number) {
    this.round += 1;
    this.matchState = "active";
    this.message = `ROUND 0${this.round} // SIGNAL GREEN`;
    this.player.reset(-3.55, now);
    this.enemy.reset(3.55, now);
    this.audio.play("round");
    this.emitHud(true);
  }

  private runLiveInputs(now: number, delta: number) {
    const direction = (this.input.isDown("right") ? 1 : 0) - (this.input.isDown("left") ? 1 : 0);
    this.player.move(direction, delta, now);
    this.player.setGuard(this.input.isDown("guard"), now);
    if (direction !== 0 && now > this.lastStepAt) { this.audio.play("step"); this.lastStepAt = now + 0.25; }
    if (this.input.isDown("guard") && now > this.lastGuardAt) { this.audio.play("guard"); this.lastGuardAt = now + 0.42; }
    if (this.input.isDown("strike") && this.player.startStrike(now)) this.audio.play("strike");
    this.runEnemyAi(now, delta);
  }

  private runEnemyAi(now: number, delta: number) {
    const distance = this.enemy.x - this.player.x;
    if (Math.abs(distance) > 2.05) { this.enemy.move(distance > 0 ? -1 : 1, delta, now); return; }
    this.enemy.move(0, delta, now);
    if (now < this.nextAiAt) return;
    this.nextAiAt = now + 0.88;
    const beat = Math.floor(now * 2.1) % 4;
    if (beat === 0) {
      this.enemy.setGuard(true, now);
      this.message = "RED RAIDER // BRACE SIGNAL";
      window.setTimeout(() => this.enemy.setGuard(false, performance.now() / 1000), 360);
    } else if (beat === 1 || beat === 3) {
      if (this.enemy.startStrike(now)) this.audio.play("strike");
    } else this.enemy.move(0.55, delta, now);
  }

  private runDemo(now: number, delta: number) {
    const phase = (now - this.demoStart) % 8;
    const cycle = Math.floor((now - this.demoStart) / 8);
    if (cycle !== this.demoCycle) { this.demoCycle = cycle; this.message = "DEMO LINK // TRAINING TELEMETRY"; }
    if (phase < 1.25) {
      const shouldClose = Math.abs(this.enemy.x - this.player.x) > 2.2;
      this.player.move(shouldClose ? 1 : 0, delta, now);
      this.enemy.move(shouldClose ? -1 : 0, delta, now);
    } else if (phase < 1.85) this.player.setGuard(true, now);
    else if (phase < 2.4) { this.player.setGuard(false, now); if (phase > 1.94 && phase < 2.1) this.enemy.startStrike(now); }
    else if (phase < 3.15) { if (phase > 2.48 && phase < 2.65) this.player.startStrike(now); }
    else if (phase < 4.1) { this.enemy.setGuard(true, now); if (phase > 3.28 && phase < 3.45) this.player.startStrike(now); }
    else if (phase < 5.2) { this.enemy.setGuard(false, now); if (phase > 4.22 && phase < 4.4) this.player.startStrike(now); }
    else if (phase < 6.1) { if (phase > 5.3 && phase < 5.47) this.enemy.startStrike(now); }
    else this.player.setGuard(true, now);
  }

  private resolveImpacts(now: number) { this.resolveStrike(this.player, this.enemy, now); this.resolveStrike(this.enemy, this.player, now); }

  private resolveStrike(attacker: Mecha, defender: Mecha, now: number) {
    if (!attacker.needsImpact(now)) return;
    const inRange = Math.abs(attacker.x - defender.x) <= 2.48;
    if (!inRange) { this.message = `${attacker.label} // STRIKE MISSED`; return; }
    const result = defender.receiveDamage(attacker.strikeDamage, now);
    this.impactFlash.position = new Vector3((attacker.x + defender.x) / 2, -0.5, -0.6);
    this.impactFlash.scaling.setAll(result.guarded ? 0.68 : 1.15);
    this.impactFlash.isVisible = true;
    this.impactFlashUntil = now + 0.16;
    this.audio.play(result.guarded ? "guard" : "impact");
    this.message = result.guarded ? `${defender.label} // GUARD HOLDS · ${result.damage} CHIP` : `${attacker.label} // CLEAN HIT · ${result.damage} DAMAGE`;
    if (defender.isDown) this.finishRound(defender.id === "enemy" ? "player" : "enemy", now);
    this.emitHud(true);
  }

  private finishRound(winner: "player" | "enemy", now: number) {
    if (winner === "player") this.playerRounds += 1; else this.enemyRounds += 1;
    const playerWon = this.playerRounds >= 2;
    const enemyWon = this.enemyRounds >= 2;
    if (playerWon || enemyWon) {
      this.matchState = playerWon ? "match-victory" : "match-defeat";
      this.message = playerWon ? "TOURNAMENT LINK // SECURED" : "TOURNAMENT LINK // BREACHED";
      this.audio.play(playerWon ? "victory" : "defeat");
    } else {
      this.matchState = "round-result";
      this.nextRoundAt = now + 1.55;
      this.message = winner === "player" ? "ROUND SECURED // RE-ARMING" : "ROUND LOST // RE-ARMING";
      this.audio.play("round");
    }
  }

  private updateSceneMotion(now: number) {
    this.impactFlash.isVisible = now < this.impactFlashUntil;
    for (let index = 0; index < this.smoke.length; index += 1) {
      const puff = this.smoke[index];
      puff.position.y += 0.0025 + index * 0.0006;
      puff.position.x += Math.sin(now + index) * 0.0014;
      if (puff.position.y > 3.9) puff.position.y = 1.9;
    }
  }

  private emitHud(force = false) {
    const now = performance.now() / 1000;
    if (!force && now - this.lastHudPublish < 0.08) return;
    this.lastHudPublish = now;
    const profile = LOADOUTS[this.selectedLoadout];
    this.publishHud({ playerHp: this.player.hp, playerMaxHp: this.player.maxHp, enemyHp: this.enemy.hp, enemyMaxHp: this.enemy.maxHp, playerState: this.player.action, enemyState: this.enemy.action, playerX: this.player.x, enemyX: this.enemy.x, matchState: this.matchState, round: this.round, playerRounds: this.playerRounds, enemyRounds: this.enemyRounds, playerLabel: profile.label, playerCallsign: profile.callsign, selectedLoadout: this.selectedLoadout, soundOn: this.audio.isEnabled, message: this.message });
  }

  private buildStage() {
    const sky = MeshBuilder.CreatePlane("rustbelt-sky", { width: 16, height: 9 }, this.scene);
    sky.position = new Vector3(0, 0, 2.8);
    const skyMaterial = new StandardMaterial("rustbelt-sky-material", this.scene);
    skyMaterial.diffuseColor = Color3.FromHexString("#b7a180"); skyMaterial.emissiveColor = Color3.FromHexString("#594b37"); skyMaterial.disableLighting = true; sky.material = skyMaterial;
    const factoryMaterial = new StandardMaterial("factory-fallback-material", this.scene);
    factoryMaterial.diffuseColor = Color3.FromHexString("#5d4938"); factoryMaterial.emissiveColor = Color3.FromHexString("#281f18");
    for (let i = -6; i <= 6; i += 2) { const factory = MeshBuilder.CreateBox(`factory-${i}`, { width: 1.28, height: 1.2 + Math.abs(i % 3) * 0.45, depth: 0.08 }, this.scene); factory.position.set(i, 0.25, 2.58); factory.material = factoryMaterial; }
    for (const x of [-5.7, 5.5]) { const stack = MeshBuilder.CreateBox(`stack-${x}`, { width: 0.42, height: 3.1, depth: 0.08 }, this.scene); stack.position.set(x, 1.05, 2.53); stack.material = factoryMaterial; }
    const crane = MeshBuilder.CreateBox("factory-crane", { width: 5.7, height: 0.18, depth: 0.08 }, this.scene); crane.position.set(-3.1, 2.55, 2.5); crane.material = factoryMaterial;
    const hook = MeshBuilder.CreateBox("factory-hook", { width: 0.08, height: 1.5, depth: 0.08 }, this.scene); hook.position.set(-0.7, 1.76, 2.5); hook.material = factoryMaterial;
    const backdrop = MeshBuilder.CreatePlane("rustbelt-backdrop", { width: 16, height: 9 }, this.scene); backdrop.position = new Vector3(0, 0, 2);
    const backdropMaterial = new StandardMaterial("rustbelt-backdrop-material", this.scene); const backdropTexture = new Texture(BACKDROP_URL, this.scene, true, false); backdropTexture.hasAlpha = false; backdropMaterial.diffuseTexture = backdropTexture; backdropMaterial.diffuseColor = Color3.White(); backdropMaterial.emissiveColor = new Color3(0.48, 0.48, 0.48); backdropMaterial.disableLighting = true; backdropMaterial.backFaceCulling = false; backdropMaterial.alpha = 0.36; backdrop.material = backdropMaterial;
    const deck = MeshBuilder.CreateBox("catwalk-deck", { width: 16, height: 0.54, depth: 0.15 }, this.scene); deck.position.set(0, -2.55, -0.15);
    const deckMaterial = new StandardMaterial("catwalk-material", this.scene); deckMaterial.diffuseColor = Color3.FromHexString("#27302f"); deckMaterial.emissiveColor = Color3.FromHexString("#0d1111"); deck.material = deckMaterial;
    for (let i = -7; i <= 7; i += 1) { const stripe = MeshBuilder.CreateBox(`hazard-${i}`, { width: 0.38, height: 0.22, depth: 0.035 }, this.scene); stripe.position.set(i + 0.2, -2.54, -0.32); stripe.rotation.z = -0.5; const material = new StandardMaterial(`hazard-material-${i}`, this.scene); material.diffuseColor = Color3.FromHexString(i % 2 === 0 ? "#e5b72b" : "#151919"); material.emissiveColor = Color3.FromHexString(i % 2 === 0 ? "#57420a" : "#050505"); stripe.material = material; }
    const railMaterial = new StandardMaterial("rail-material", this.scene); railMaterial.diffuseColor = Color3.FromHexString("#0e1413"); railMaterial.emissiveColor = Color3.FromHexString("#0f2623");
    for (const y of [-2.18, -2.83]) { const rail = MeshBuilder.CreateBox(`rail-${y}`, { width: 16, height: 0.05, depth: 0.05 }, this.scene); rail.position.set(0, y, -0.34); rail.material = railMaterial; }
    for (let i = 0; i < 4; i += 1) { const puff = MeshBuilder.CreateDisc(`smoke-${i}`, { radius: 0.25 + i * 0.05, tessellation: 8 }, this.scene); puff.position.set(-6.1 + i * 0.34, 2 + i * 0.36, 1.1); const puffMaterial = new StandardMaterial(`smoke-material-${i}`, this.scene); puffMaterial.diffuseColor = Color3.FromHexString("#aaa18d"); puffMaterial.alpha = 0.19; puffMaterial.disableLighting = true; puff.material = puffMaterial; this.smoke.push(puff); }
  }
}
