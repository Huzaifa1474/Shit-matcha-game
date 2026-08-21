import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { GameWorld } from "./GameWorld";
import { MISSIONS, type GameHandle, type HudState, type MissionKey } from "./types";

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement, publishHud: (state: HudState) => void): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = Color4.FromHexString("#5c4e3a");
  const camera = new FreeCamera("arena-camera", new Vector3(0, 0, -10), scene);
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  camera.orthoLeft = -8;
  camera.orthoRight = 8;
  camera.orthoTop = 4.5;
  camera.orthoBottom = -4.5;
  camera.setTarget(new Vector3(0, 0, 0));
  camera.detachControl();
  const params = new URLSearchParams(window.location.search);
  const demo = params.has("demo");
  const requestedMission = params.get("mission") ?? "level-01";
  const demoMissionKey: MissionKey = MISSIONS[requestedMission] ? requestedMission : "level-01";
  const world = new GameWorld(scene, publishHud, demo, demoMissionKey);
  return {
    scene,
    update: (delta) => world.update(delta),
    setAction: (action, pressed) => world.setAction(action, pressed),
    startMatch: (loadout, mission) => world.startMatch(loadout, mission),
    returnToSelect: () => world.returnToSelect(),
    toggleAudio: () => world.toggleAudio(),
    dispose: () => { world.dispose(); scene.dispose(); },
  };
}
