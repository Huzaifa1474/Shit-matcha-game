# Game Plan: Pixel Mecha Battle

## Gameplay Design

Pixel Mecha Battle is a single-screen 2D duel. The player pilots **Blue Vanguard** against the autonomous **Red Raider**. Both units begin with 100 HP. Win by reducing the opposing mech to zero HP; lose if Blue Vanguard reaches zero first.

The enhanced **Tournament Link** mode begins in Hangar Select and runs as a best-of-three encounter. The player selects Blue Vanguard, Ironclad, or Sparkrunner before launch; the selected frame supplies a specific integrity, speed, strike, and guard profile. Every round re-arms both fighters at full integrity, while the first combatant to two round markers wins the match.

| System | Player | Opponent | Rule |
|---|---|---|---|
| Movement | `A` / `D` or arrow keys | Intent-driven arena movement | Both fighters stay inside the catwalk bounds. |
| Strike | `J` or STRIKE button | Short-range combat AI | A strike damages only when the target is in range and cannot land repeatedly during cooldown. |
| Guard | Hold `K` or GUARD button | Short defensive AI windows | Guard converts incoming damage to a small chip hit. |
| Vitality | Blue HP rail | Red HP rail | Both begin at 100; rails visibly segment and flash after damage. |
| Round state | `R` or RESET button | N/A | Defeat freezes combat, shows the winner, and permits a full reset. |

## Risk Tasks

### 1. Mecha State Animation
- **Why isolated:** Movement, guarding, striking, damage recoil, and defeat are fast visual state changes that can overlap or leave a fighter stuck in the wrong pose.
- **Approach:** Use a compact explicit action state for each fighter. Position movement is permitted only when the state allows it; every short-lived action owns an expiry timestamp. Visual offsets, scales, tint, and effects are driven from the state rather than from independent timers.
- **Verify:** Idle → move → idle, move → strike → idle, idle → guard → idle, and strike → damaged → idle transitions read without pose snapping. A defeated fighter stays disabled and performs no further actions.

### 2. Collision Range and Combat Timing
- **Why isolated:** A side-on duel becomes unplayable if attacks hit at any distance, guard applies after the hit, or both actors hit more than once during the same animation.
- **Approach:** Evaluate each strike once at an authored impact point, use a fixed horizontal range check, and record a per-fighter cooldown. The defender’s current guard state is sampled at the same impact moment.
- **Verify:** Attacks miss beyond range, damage occurs once per valid strike, guard applies chip damage while active, and a strike cannot repeat until its cooldown ends.

## Main Build

Build a full-viewport Babylon.js orthographic stage with a generated Rustbelt Arena backdrop and two generated mecha plane sprites. Add a React-based HUD around the canvas for energy rails, round information, controls, an event ticker, an action guide, a touch-friendly control cluster, and win/loss handling. Use a deterministic `?demo` autopilot that visibly exercises movement, guard, attack, damage, and reset states for visual review.

The shipped presentation also uses a resilient CSS pixel stage beneath the HUD. It supplies a clear warm industrial hangar, animated procedural mecha silhouettes, and four-frame action-state poses in the preview environment while the underlying Babylon world retains combat ownership and frame-state simulation.

- **Assets:**
  - Rustbelt Arena generated backdrop, filling the arena’s rear layer.
  - Blue Vanguard and Red Raider generated cutout mecha artwork for the fighters.
  - Reactor core generated graphic used in the brand and in the HUD.
  - Procedural Babylon geometry for floor rails, smoke particles, sparks, HP values, and effects.
- **Verify:**
  - Blue movement direction follows keyboard and button input; fighters cannot leave the catwalk.
  - Strike is visibly directional, hits only in range, and respects cooldown.
  - Guard communicates its active state and reduces incoming damage.
  - HP rails, event ticker, and win/loss overlay accurately reflect the world state.
  - The opponent moves, guards, and attacks under a straightforward readable AI.
  - `?demo` visibly produces an active battle without manual input.
  - No missing textures, off-screen HUD overlap, runtime errors, or placeholder-looking main visual elements.
  - The final stage matches the target’s side-on camera, warm industrial palette, fighter scale, and visual density.
