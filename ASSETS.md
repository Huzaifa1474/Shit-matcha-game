# Assets

**Art direction:** A premium side-view industrial pixel-arcade cabinet. Warm oxidized steel and deep charcoal frame cobalt Blue Faction machines against vermilion opponents. Reactor cyan appears as a deliberate energy signal, while amber hazard lights guide hierarchy. Backgrounds are dense but preserve a clear catwalk combat lane; silhouettes remain bold at mobile size.

## Visual Target

| Name | Role | Size | Image |
|---|---|---:|---|
| Expanded Campaign Visual Target | Visual QA anchor for roster scale, theatre density, mission tile, rewards, and HUD hierarchy | 16:9 reference | `/manus-storage/pixel-mecha-expanded-visual-target_4bbaee58.png` |

## Backgrounds

| Name | Description | Size | Image |
|---|---|---:|---|
| Rustbelt Arena Backdrop | Dusty industrial arena rear layer with catwalk, factory silhouettes, crane, stacks, and controlled empty middle ground | 1920×1080 px, full playfield | `/manus-storage/rustbelt-arena-backdrop_1351a937.png` |
| Orbital Scrapyard Theatre | Layered empty-center theatre with crane, reactor tower, moon, cables, and hazard-deck foreground | 1920×1080 px, full Command Deck / mission art | `/manus-storage/mission-theatre-orbital-scrapyard_bd3c7520.png` |
| Command Roster Artwork | Five distinct mech silhouettes in a maintenance hangar for the Command Deck hero layer | 1920×1080 px, full-width panel | `/manus-storage/mecha-roster-command-deck_499e092e.png` |

## Sprites and Interface Art

| Name | Description | Size | Image |
|---|---|---:|---|
| Blue Vanguard | Cobalt/cream player mecha, facing right | 150×150 px display target | `/manus-storage/blue-vanguard-mecha_07647d6a.png` |
| Red Raider | Vermilion/graphite enemy mecha, facing left | 150×150 px display target | `/manus-storage/red-raider-mecha_87c0fcb9.png` |
| Reactor Core Mark | Teal angular arcade reactor emblem used in the HUD header | 64×64 px display target | `/manus-storage/reactor-core-mark_76dd0b87.png` |
| Reward Cache Emblems | Open cache with three achievement emblems for progression panels | 256×256 px display target | `/manus-storage/reward-cache-emblems_828578b5.png` |

## Procedural Effects and UI

| Asset | Method | Size | Purpose |
|---|---|---:|---|
| Engine exhaust | CSS / Babylon segmented particle plumes | 0.4–1.1 scene units | Idle, move, strike, guard, and down state readability. |
| Allied gantry silhouettes | CSS procedural mecha shapes | 80–120 px display target | Adds roster density and depth to mission theatres. |
| Mission telemetry | React / CSS data plates | Responsive | Objective, reward, difficulty, and theatre identity. |
| Achievement markers | React / CSS unlock cards with generated emblem art | Responsive | Makes campaign milestones legible and collectable. |

## Audio

| Asset | Method | Length | Purpose |
|---|---|---:|---|
| Rustbelt Arena 8-bit Loop | Generated instrumental chiptune | 90 seconds | Looping arena background music; starts after the pilot’s first launch gesture. `/manus-storage/rustbelt-arena-8bit-loop_907a823b.mp3` |
| Combat chip sounds | Web Audio oscillator phrases | 40–300 ms | Immediate movement relay, engine, strike, impact, guard, and match-result feedback. |
