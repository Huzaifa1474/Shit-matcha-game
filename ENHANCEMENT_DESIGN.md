# Enhancement Design: Tournament Link

## Match Flow

The game now opens in a **Hangar Select** state. The player chooses a Blue faction machine, reviews its operating profile, and launches the encounter. Each battle round begins with fresh chassis integrity and ends as soon as a fighter reaches zero HP. The first pilot to earn two round markers wins the match. A short in-world intermission retains the selected loadout and makes the next round number explicit before the arena re-arms.

| State | Player-facing meaning | Main transition |
|---|---|---|
| `select` | Choose a Blue faction frame and start the match. | Launch button begins round one. |
| `active` | Movement, strike, and guard actions are enabled. | A fighter reaches zero HP. |
| `round-result` | The HUD records the round winner and restores integrity. | A brief countdown starts the next round unless the match is decided. |
| `match-victory` / `match-defeat` | The best-of-three outcome is displayed. | Re-arm returns to Hangar Select. |

## Available Blue Faction Loadouts

All three loadouts retain the same compact silhouette family, but change the fight’s rhythm through integrity, movement velocity, strike damage, guard efficiency, and cooldown. Red Raider remains the fixed opposing assault platform so that the player can immediately feel the effect of their selection.

| Frame | Identity | Integrity | Speed | Strike | Guard chip | Intended play |
|---|---|---:|---:|---:|---:|---|
| **Blue Vanguard** | Balanced line unit | 100 | 3.45 | 15 | 28% | Readable default that rewards spacing. |
| **Ironclad** | Plated breach chassis | 125 | 2.75 | 17 | 20% | Slow but resilient pressure fighter. |
| **Sparkrunner** | Lightweight relay frame | 85 | 4.30 | 13 | 36% | Fast repositioning with lower mistake tolerance. |

## Frame-Stepped Animation Language

Each rendered mecha will use a four-step pixel animation clock instead of smooth interpolation. Idle cycles through cockpit flicker and a two-frame chassis settle. Movement alternates a left and right step with a one-pixel-like vertical shift. Strike uses anticipation, extension, impact, and recovery frames. Guard snaps into a braced pose, cycles the shield aperture, and returns to idle only after the input is released. Damage and down states remain distinct, so a successful hit never reads like an action frame.

## Audio Design

The first launch interaction unlocks sound in accordance with browser gesture requirements. A generated instrumental 8-bit Rustbelt loop supplies the arena bed, while a lightweight in-browser chip synthesizer provides immediate action sounds: relay click for movement, square-wave blade burst for strikes, short filtered impact for hits, rising shield chirp for guard, and a two-tone result stinger for round outcomes. The HUD includes a sound toggle that controls both music and effects.
