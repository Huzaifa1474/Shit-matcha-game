# Game Plan: Pixel Mecha Battle // Campaign Console

## Gameplay Design

Pixel Mecha Battle expands from a single tournament into a compact campaign loop. Players begin at the **Command Deck**, inspect the mission board, choose a theatre, select from a five-frame Blue Faction roster, and launch a best-of-three mission battle. Each secured mission awards salvage credits and increases the active mission count. The campaign UI exposes achievements, reward cache status, roster data, and accessible settings without interrupting the core side-on duel.

## Risk Tasks

### 1. Combat State Expansion and Mission Profiles
- **Why isolated:** Mission selection changes opponent stats, reward values, labels, background treatment, and match messaging while the existing best-of-three state machine must remain readable and stable.
- **Approach:** Keep the duel engine as the authority for active / round-result / match-result behavior. Pass a typed mission definition into launch, apply the associated opponent profile, and publish the active mission in the HUD snapshot.
- **Verify:** Moving from Command Deck → Mission Board → Hangar → Battle produces the selected mission title, opponent identity, reward amount, and theatre treatment. A mission round still resets both combatants correctly and ends only after two wins.

### 2. Distinct Mecha Silhouettes and Engine Animation
- **Why isolated:** A larger roster needs visually distinct CSS and Babylon frame variants, and layered engine plumes can easily conflict with strike, guard, damage, or down poses.
- **Approach:** Extend each frame with a silhouette variant class and procedural rear exhaust / core activity. Gate plume intensity from the mecha action state so idle, move, strike, guard, damage, and down transitions remain explicit.
- **Verify:** Every Blue frame has a readable profile from the Hangar. Engines idle-pulse, intensify during movement and strikes, dampen under guard, and stop when down. Strike → damage → idle and move → guard → move transitions show no pose snapping.

### 3. Progression and Reward Persistence
- **Why isolated:** Rewards and achievements must not duplicate on render loops or be lost when players navigate within the cabinet.
- **Approach:** Track campaign credits, completed missions, and earned achievement IDs in a small local browser save. Award a mission once when a new victory state is observed, then update the React command UI from that snapshot.
- **Verify:** Winning a mission adds only its listed salvage amount once. The same completion updates the Mission Board, Reward Cache, and Achievements display without refresh. A fresh reload restores the local campaign snapshot.

## Main Build

Build a full-screen **Campaign Console** around the existing Rustbelt duel. The Command Deck has a cinematic roster backdrop, current salvage and achievement telemetry, and direct access to Missions, Roster, Rewards, Achievements, and Settings. The Mission Board contains four authored operations with escalating foes and distinct arena labels. Hangar Select expands to five playable frames with strong stat trade-offs. The arena gains mission-themed background layers, ambient ally silhouettes, extra foreground machinery, animated engine trails, stronger impact presentation, and a mission objective panel.

- **Assets:**
  - Expanded visual target: `/manus-storage/pixel-mecha-expanded-visual-target_4bbaee58.png` — 16:9 visual QA anchor.
  - Orbital scrapyard theatre: `/manus-storage/mission-theatre-orbital-scrapyard_bd3c7520.png` — full-width Command Deck / mission background.
  - Command roster artwork: `/manus-storage/mecha-roster-command-deck_499e092e.png` — full-width home-screen art.
  - Reward cache emblems: `/manus-storage/reward-cache-emblems_828578b5.png` — Reward and Achievement decorative asset.
- **Verify:**
  - Command Deck has clear paths to mission, roster, reward, achievement, and settings views, with an obvious return action from each.
  - Five playable Blue frames and four opponent mission profiles have legible visual and statistical differences.
  - The selected mission propagates into the battle HUD, enemy profile, mission objective, and victory reward screen.
  - Engine effects, combat effects, HUD, mission backgrounds, and touch controls remain visible at desktop and mobile sizes.
  - Reward and achievement values change only after a player victory and persist locally.
  - `?demo` still visibly produces a live combat sequence without manual input.
  - No missing generated-asset URLs, overflow, blocking overlay conflicts, or browser console errors occur during capture.
  - Reference consistency: side-on camera, dense industrial background, cyan / amber / oxide palette, readable combat scale, and premium pixel-cabinet presentation.
