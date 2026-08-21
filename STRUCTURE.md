# Code Structure: Pixel Mecha Battle // Campaign Console

## Runtime Layering

React owns the Campaign Console, command navigation, local campaign save, accessible controls, and battle HUD. Babylon owns the underlying stage and procedural combat effects. Plain TypeScript gameplay classes remain independent of React and receive only typed mission / loadout configuration.

```text
client/src/
├── components/
│   └── GameCanvas.tsx       # React cabinet, Command Deck, HUD, local campaign save
└── game/
    ├── scene.ts             # Babylon bridge and expanded GameHandle delegates
    ├── GameWorld.ts         # Duel state machine, mission application, AI, stage activity
    ├── Mecha.ts             # Mecha frame state, procedural parts, engines, combat effects
    ├── InputManager.ts      # Semantic combat input and reset routing
    ├── AudioManager.ts      # Gesture-gated music and instant chip feedback
    └── types.ts             # Roster, mission, HUD, progression and public contracts
```

## Domain Model

| Object | Owns | Responsibility |
|---|---|---|
| `GameCanvas` | Console view state, mission selection, campaign save, accessible UI | Presents the Command Deck, Missions, Roster, Rewards, Achievements, Settings, Hangar and active arena in a shared cabinet shell. |
| `CampaignProgress` | Credits, completed mission keys, achievement IDs, settings | Persists player-facing progress in local storage and receives verified battle-victory events. |
| `MissionDefinition` | Theatre, opponent frame, objective, reward, difficulty | Makes operations data-driven so a mission selection consistently configures UI and combat. |
| `GameWorld` | Mechas, mission profile, match state, AI, Babylon effects | Runs a best-of-three battle and publishes one serializable HUD snapshot. |
| `Mecha` | Procedural silhouette parts, exhaust / core meshes, movement / strike / guard state | Makes profile-specific combat states physically readable, with action-driven engine intensity. |

## Campaign Flow

`command` → `missions` → `hangar` → `battle` → `rewards` (on victory) or `command` (on exit). Roster, Achievements, and Settings are console views that retain the last selected mission and never mutate the duel state directly. The existing gameplay engine retains only its combat state machine, avoiding UI navigation logic inside Babylon.
