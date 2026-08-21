import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Scene } from "@babylonjs/core/scene";
import type { MechaAction } from "./types";

export interface MechaConfig {
  id: "player" | "enemy";
  label: string;
  startX: number;
  direction: 1 | -1;
  textureUrl: string;
  accent: Color3;
  flare: Color3;
}

export class Mecha {
  readonly root: TransformNode;
  readonly direction: 1 | -1;
  readonly label: string;
  readonly id: "player" | "enemy";
  hp = 100;
  action: MechaAction = "idle";
  private actionUntil = 0;
  private cooldownUntil = 0;
  private impactAt = 0;
  private impactResolved = false;
  private readonly sprite: AbstractMesh;
  private readonly spriteMaterial: StandardMaterial;
  private readonly shadow: AbstractMesh;
  private readonly strike: AbstractMesh;
  private readonly shield: AbstractMesh;
  private readonly flair: AbstractMesh;
  private readonly accent: Color3;
  private readonly flare: Color3;
  private moveAmount = 0;

  constructor(scene: Scene, config: MechaConfig) {
    this.id = config.id;
    this.label = config.label;
    this.direction = config.direction;
    this.accent = config.accent;
    this.flare = config.flare;
    this.root = new TransformNode(`${config.id}-root`, scene);
    this.root.position.set(config.startX, -1.2, 0);

    this.shadow = MeshBuilder.CreateDisc(`${config.id}-shadow`, { radius: 1.1, tessellation: 16 }, scene);
    this.shadow.parent = this.root;
    this.shadow.position.set(0, -1.45, 0.05);
    this.shadow.scaling.y = 0.24;
    const shadowMaterial = new StandardMaterial(`${config.id}-shadow-material`, scene);
    shadowMaterial.diffuseColor = new Color3(0.02, 0.03, 0.03);
    shadowMaterial.alpha = 0.45;
    shadowMaterial.disableLighting = true;
    this.shadow.material = shadowMaterial;

    this.sprite = MeshBuilder.CreatePlane(`${config.id}-sprite`, { width: 2.85, height: 2.85 }, scene);
    this.sprite.parent = this.root;
    this.sprite.position.set(0, 0, -0.18);
    this.spriteMaterial = new StandardMaterial(`${config.id}-sprite-material`, scene);
    const spriteTexture = new Texture(config.textureUrl, scene, true, false);
    spriteTexture.hasAlpha = true;
    this.spriteMaterial.diffuseTexture = spriteTexture;
    this.spriteMaterial.useAlphaFromDiffuseTexture = true;
    this.spriteMaterial.alpha = 0.12;
    this.spriteMaterial.specularColor = Color3.Black();
    this.spriteMaterial.emissiveColor = new Color3(0.12, 0.12, 0.12);
    this.spriteMaterial.backFaceCulling = false;
    this.sprite.material = this.spriteMaterial;

    this.shield = MeshBuilder.CreateDisc(`${config.id}-shield`, { radius: 1.55, tessellation: 8 }, scene);
    this.shield.parent = this.root;
    this.shield.position.set(config.direction * 0.37, 0, -0.1);
    const shieldMaterial = new StandardMaterial(`${config.id}-shield-material`, scene);
    shieldMaterial.diffuseColor = config.accent;
    shieldMaterial.emissiveColor = config.accent.scale(0.8);
    shieldMaterial.alpha = 0.28;
    shieldMaterial.disableLighting = true;
    this.shield.material = shieldMaterial;
    this.shield.isVisible = false;

    this.strike = MeshBuilder.CreatePlane(`${config.id}-strike`, { width: 1.72, height: 0.22 }, scene);
    this.strike.parent = this.root;
    this.strike.position.set(config.direction * 1.55, 0.08, -0.4);
    const strikeMaterial = new StandardMaterial(`${config.id}-strike-material`, scene);
    strikeMaterial.diffuseColor = config.flare;
    strikeMaterial.emissiveColor = config.flare;
    strikeMaterial.alpha = 0.88;
    strikeMaterial.disableLighting = true;
    this.strike.material = strikeMaterial;
    this.strike.rotation.z = config.direction === 1 ? -0.18 : 0.18;
    this.strike.isVisible = false;

    this.flair = MeshBuilder.CreateDisc(`${config.id}-flair`, { radius: 0.5, tessellation: 8 }, scene);
    this.flair.parent = this.root;
    this.flair.position.set(config.direction * 1.34, 0.15, -0.35);
    const flairMaterial = new StandardMaterial(`${config.id}-flair-material`, scene);
    flairMaterial.diffuseColor = config.flare;
    flairMaterial.emissiveColor = config.flare;
    flairMaterial.alpha = 0.86;
    flairMaterial.disableLighting = true;
    this.flair.material = flairMaterial;
    this.flair.isVisible = false;

    const shellMaterial = new StandardMaterial(`${config.id}-fallback-shell`, scene);
    shellMaterial.diffuseColor = config.accent;
    shellMaterial.emissiveColor = config.accent.scale(0.22);
    const jointMaterial = new StandardMaterial(`${config.id}-fallback-joint`, scene);
    jointMaterial.diffuseColor = Color3.FromHexString("#18201f");
    jointMaterial.emissiveColor = Color3.FromHexString("#071111");
    const signalMaterial = new StandardMaterial(`${config.id}-fallback-signal`, scene);
    signalMaterial.diffuseColor = config.flare;
    signalMaterial.emissiveColor = config.flare;
    signalMaterial.disableLighting = true;
    const part = (name: string, width: number, height: number, x: number, y: number, material: StandardMaterial) => {
      const mesh = MeshBuilder.CreateBox(`${config.id}-${name}`, { width, height, depth: 0.18 }, scene);
      mesh.parent = this.root;
      mesh.position.set(x, y, -0.63);
      mesh.material = material;
      return mesh;
    };
    part("torso", 1.05, 0.94, 0, 0.04, shellMaterial);
    part("helmet", 0.62, 0.44, config.direction * 0.12, 0.75, shellMaterial);
    part("visor", 0.42, 0.09, config.direction * 0.12, 0.75, signalMaterial);
    part("shoulder-left", 0.48, 0.34, -0.65, 0.38, shellMaterial);
    part("shoulder-right", 0.48, 0.34, 0.65, 0.38, shellMaterial);
    part("arm-front", 0.34, 0.82, config.direction * 0.77, -0.18, jointMaterial);
    part("arm-back", 0.3, 0.74, -config.direction * 0.77, -0.18, jointMaterial);
    part("chest-core", 0.22, 0.22, config.direction * 0.12, 0.03, signalMaterial);
    part("leg-left", 0.38, 0.88, -0.34, -0.86, jointMaterial);
    part("leg-right", 0.38, 0.88, 0.34, -0.86, jointMaterial);
    part("foot-left", 0.58, 0.2, -0.38, -1.34, shellMaterial);
    part("foot-right", 0.58, 0.2, 0.38, -1.34, shellMaterial);
  }

  get x() { return this.root.position.x; }
  get isDown() { return this.action === "down"; }
  get isGuarding() { return this.action === "guard"; }
  get canStrike() { return !this.isDown && this.action !== "damaged"; }

  move(amount: number, delta: number) {
    if (this.isDown || this.action === "strike" || this.action === "damaged") return;
    this.moveAmount = amount;
    if (amount === 0) {
      if (this.action === "move") this.action = "idle";
      return;
    }
    this.action = "move";
    this.root.position.x = Math.max(-6.25, Math.min(6.25, this.root.position.x + amount * delta * 3.45));
  }

  setGuard(active: boolean) {
    if (this.isDown || this.action === "strike" || this.action === "damaged") return;
    this.action = active ? "guard" : this.action === "guard" ? "idle" : this.action;
  }

  startStrike(now: number) {
    if (!this.canStrike || now < this.cooldownUntil) return false;
    this.action = "strike";
    this.actionUntil = now + 0.38;
    this.cooldownUntil = now + 0.82;
    this.impactAt = now + 0.14;
    this.impactResolved = false;
    return true;
  }

  needsImpact(now: number) {
    if (this.action !== "strike" || this.impactResolved || now < this.impactAt) return false;
    this.impactResolved = true;
    return true;
  }

  receiveDamage(damage: number, now: number) {
    const guarded = this.isGuarding;
    const resolvedDamage = guarded ? Math.max(2, Math.ceil(damage * 0.28)) : damage;
    this.hp = Math.max(0, this.hp - resolvedDamage);
    if (this.hp === 0) {
      this.action = "down";
      this.actionUntil = Number.POSITIVE_INFINITY;
    } else if (!guarded) {
      this.action = "damaged";
      this.actionUntil = now + 0.28;
    }
    return { guarded, damage: resolvedDamage };
  }

  reset(x: number) {
    this.hp = 100;
    this.action = "idle";
    this.actionUntil = 0;
    this.cooldownUntil = 0;
    this.root.position.set(x, -1.2, 0);
  }

  update(now: number, delta: number) {
    if (this.action !== "down" && this.actionUntil && now > this.actionUntil) {
      this.action = this.moveAmount === 0 ? "idle" : "move";
      this.actionUntil = 0;
    }
    const bob = this.action === "move" ? Math.sin(now * 15) * 0.07 : Math.sin(now * 4.2 + (this.id === "enemy" ? 1 : 0)) * 0.03;
    this.sprite.position.y = bob;
    this.shadow.scaling.x = 1.05 - Math.abs(bob) * 1.25;
    this.shield.isVisible = this.action === "guard";
    this.shield.rotation.z += delta * 0.7;
    this.strike.isVisible = this.action === "strike" && now > this.impactAt - 0.04 && now < this.impactAt + 0.15;
    this.flair.isVisible = this.strike.isVisible;
    this.strike.scaling.x = this.strike.isVisible ? 0.55 + Math.abs(Math.sin(now * 36)) : 0.5;
    this.spriteMaterial.emissiveColor = this.action === "damaged" ? this.flare.scale(0.48) : this.action === "guard" ? this.accent.scale(0.16) : new Color3(0.12, 0.12, 0.12);
    if (this.action === "strike") {
      this.root.rotation.z = -this.direction * 0.08;
      this.sprite.position.x = this.direction * 0.14;
    } else if (this.action === "damaged") {
      this.root.rotation.z = this.direction * 0.11;
      this.sprite.position.x = -this.direction * 0.12;
    } else if (this.action === "down") {
      this.root.rotation.z = this.direction * 1.12;
      this.sprite.position.y = -0.72;
    } else {
      this.root.rotation.z = 0;
      this.sprite.position.x = 0;
    }
  }
}
