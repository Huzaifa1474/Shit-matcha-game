# Code Structure: Pixel Mecha Battle

## Runtime Layering

React supplies the framing HUD, accessible buttons, and responsive page shell. Babylon.js supplies the full-screen orthographic stage and owns rendered meshes. Gameplay rules live in plain TypeScript and have no React state dependency.

```text
client/src/
├── App.tsx                    # Routes directly into the game frame
├── index.css                  # Rustbelt Arena tokens, typography, HUD presentation
├── components/
│   └── GameCanvas.tsx         # React lifecycle bridge and semantic action forwarding
└── game/
    ├── scene.ts               # Babylon scene assembly and GameHandle contract
    ├── GameWorld.ts           # Match state, input, AI loop, win/loss resolution
    ├── Mecha.ts               # Mecha state machine, meshes, combat response, cleanup
    ├── InputManager.ts        # Semantic keys / touch actions and cleanup
    └── types.ts               # Shared action, fighter, and HUD data types
```

## Main Domain Model

| Object | Owns | Responsibility |
|---|---|---|
| `GameWorld` | Mechas, AI cadence, scene effects, UI snapshot callback | Advances the battle, resolves hits, updates game mode, and reports a serializable HUD model. |
| `Mecha` | Sprite plane, shadow mesh, state, HP, cooldown | Moves inside bounds and maps action state to visible pose/effects. |
| `InputManager` | Pressed-action set and cleanup listeners | Translates raw keyboard and on-screen input into movement, strike, and guard intents. |
| `GameCanvas` | Babylon engine lifecycle and HUD React state | Creates one scene safely, forwards on-screen actions, responds to resize, and disposes fully. |

## State Model

The match state is `active`, `victory`, or `defeat`. Each mech action is `idle`, `move`, `strike`, `guard`, `damaged`, or `down`. `GameWorld` is the only class permitted to change a match state; both mechas render their own state locally.

## Asset Hints

The backdrop is a wide plane at the rear of the orthographic scene. Each mecha uses a transparent image texture on a plane, displayed at roughly 2.2 scene units tall. No runtime-loaded model formats, complex physics, pointer lock, custom shaders, or external APIs are needed.

