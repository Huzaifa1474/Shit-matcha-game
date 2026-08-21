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
    ├── AudioManager.ts         # Gesture-unlocked music playback and immediate chip sound effects
    ├── InputManager.ts        # Semantic keys / touch actions and cleanup
    └── types.ts               # Shared action, fighter, and HUD data types
```

## Main Domain Model

| Object | Owns | Responsibility |
|---|---|---|
| `GameWorld` | Mechas, round scoring, AI cadence, audio cues, scene effects, UI snapshot callback | Advances the battle, resolves hits, applies the selected profile, transitions best-of-three states, and reports a serializable HUD model. |
| `Mecha` | Sprite plane, procedural frame parts, state, HP, cooldown, profile | Moves inside bounds and maps action state to explicit frame-stepped poses and combat effects. |
| `AudioManager` | Background music element and Web Audio oscillator context | Unlocks sound on player launch, loops the generated 8-bit track, and creates low-latency action and result effects. |
| `InputManager` | Pressed-action set and cleanup listeners | Translates raw keyboard and on-screen input into movement, strike, and guard intents. |
| `GameCanvas` | Babylon engine lifecycle and HUD React state | Creates one scene safely, forwards on-screen actions, responds to resize, and disposes fully. |

## State Model

The match state is `select`, `active`, `round-result`, `match-victory`, or `match-defeat`. Each mech action is `idle`, `move`, `strike`, `guard`, `damaged`, or `down`. `GameWorld` is the only class permitted to change a match state; both mechas render their own state locally. The React frame presents a CSS pixel-art stage from the same HUD state so that the player-facing arena remains visible even where WebGL material compilation is unavailable.

## Asset Hints

The backdrop is a wide plane at the rear of the orthographic scene. Each mecha uses a transparent image texture on a plane, displayed at roughly 2.2 scene units tall. No runtime-loaded model formats, complex physics, pointer lock, custom shaders, or external APIs are needed.
