import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { GameWorld } from "./GameWorld";
import type { GameHandle, HudState } from "./types";

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement, publishHud: (state: HudState) => void): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = Color4.FromHexString("#101515");
  const camera = new FreeCamera("arena-camera", new Vector3(0, 0, -10), scene);
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  camera.orthoLeft = -8;
  camera.orthoRight = 8;
  camera.orthoTop = 4.5;
  camera.orthoBottom = -4.5;
  camera.setTarget(new Vector3(0, 0, 0));
  camera.detachControl();
  const demo = new URLSearchParams(window.location.search).has("demo");
  const world = new GameWorld(scene, publishHud, demo);
  scene.onBeforeRenderObservable.add(() => world.update(scene.getEngine().getDeltaTime() / 1000));
  return {
    scene,
    setAction: (action, pressed) => world.setAction(action, pressed),
    reset: () => world.reset(),
    dispose: () => { world.dispose(); scene.dispose(); },
  };
}

