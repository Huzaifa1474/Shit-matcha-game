# Pixel Mecha Battle — Design Directions

## Three stylistic approaches

### 1. Rustbelt Arena
**Very Brief Intro:** A battered industrial fighting pit under a pale evening sky, with warm hazard paint, enamel-blue armor, and punchy arcade HUD language. It feels immediate, readable, and built for one-more-round tension.

**Probability:** 0.04

### 2. Shrine Circuit
**Very Brief Intro:** A ceremonial dueling platform in a futuristic mountain shrine, using lacquer red, ivory stone, and delicate signal-light motifs. The mood is deliberate and elegant rather than noisy.

**Probability:** 0.07

### 3. Neon Salvage Run
**Very Brief Intro:** A rain-soaked night scrap yard with saturated electric signs and reflective puddles. It leans into velocity and street-fight atmosphere.

**Probability:** 0.02

---

# Chosen Direction — Rustbelt Arena

## Design Movement
**Late-1980s arcade cabinet illustration reinterpreted as a clean, readable pixel diorama.** The screen should feel like a technical fighting-game attract mode: physically constructed, slightly worn, and high contrast without defaulting to a dark neon cyberpunk look.

## Core Principles
1. **Combat readability before ornament:** each combat state (idle, guard, strike, damage, victory) has a distinct silhouette, color, and motion language.
2. **A working industrial stage:** metal plates, hazard stripes, cranes, smoke stacks, and power conduits make the arena feel functional rather than decorative.
3. **Pixel intent, not pixel noise:** deliberate block forms, crisp edges, limited-color clusters, and scanline texture replace generic retro filters.
4. **Arcade tactility:** thick status bars, mechanical labels, ledger-like readouts, and weighty hit flashes give every choice consequence.

## Color Philosophy
The stage is a restrained **warm steel and parchment** field—dusty bone sky, oxidized umber structures, and charcoal machinery—so the two pilots own the eye line. **Cobalt blue** identifies the player with composure and precision; **vermilion red** identifies the opponent with force and urgency. Acid-yellow hazard markings act as a shared warning signal, never a decorative wash. The ownable signature brand color is **Reactor Teal (#19C7B5)**, used sparingly in cockpit lamps, charge indicators, and the title emblem to suggest powered machinery.

## Layout Paradigm
The game is a **framed stage window**, not a centered card: top health instrumentation spans the width; the arena fills the middle as a broad side-on diorama; control and system callouts live in the lower left and right corners like physical cabinet labels. Elements slightly overlap the playfield border so the HUD feels bolted onto the machine.

## Signature Elements
- **Bolt-corner frames:** square metal plate borders with dark corner fasteners.
- **Split energy bars:** blue and red segmented HP rails that echo the fighter palette.
- **Hazard-line geometry:** diagonal black/yellow marks across platform edges and small UI separators.

## Interaction Philosophy
Inputs should feel like operating a compact combat rig. Movement has a subtle engine bob; defense raises an unmissable angular shield; attack creates a directional slash, recoil, spark particles, and short screen shake. Keyboard input responds instantly. On-screen control buttons are available for touch play and use tight, tactile press feedback.

## Animation
Movement loops at a calm mechanical cadence with leg pistons cycling and a one-pixel body bounce. Attacks use a sharp anticipation → impact → recoil sequence with no long easing. Damage produces a brief white hit flash, backward knockback, and falling sparks. The scene uses subtle looping smoke, intermittent cyan lights, and a low-amplitude scanline drift. Respect reduced-motion preferences by keeping the battle readable without shake.

## Typography System
Use **Press Start 2P** for combat labels, HP values, and buttons; its compact all-caps pixel construction makes actions legible. Pair it with **Space Grotesk** for explanations and small supporting text. Headlines use Press Start 2P at a limited number of large, emphatic scales; no italics or soft rounded type.

## Brand Essence
**A compact arcade mecha duel for players who want crisp, intentional tactical fights in under a minute.**

Personality: **industrial, focused, kinetic**.

## Brand Voice
Headlines and action language are concise, physical, and systems-oriented. CTAs state the exact combat intent; microcopy names the current condition rather than adding generic encouragement.

Example lines:

> **LOCK YOUR FRAME. BREAK THE LINE.**

> **SHIELD HOLDS. NEXT STRIKE IS YOURS.**

## Wordmark & Logo

## Style Decisions

- Every battle view keeps a visibly lit rustbelt stage behind the combatants; a black void is never an acceptable arena state.
- The two mecha silhouettes remain the first center-line read, ahead of decorative detail and UI ornament.
- Reactor Teal (#19C7B5) remains restricted to the reactor glyph and powered-machine indicators, leaving blue/red to the fighters and acid yellow to hazard markings.
- Non-combat Hangar Select views must preserve a dusty rustbelt environment, physical cabinet frames, hazard-seam geometry, and visible frame silhouettes rather than resembling a black terminal.
- The PIXEL // MECHA lockup always pairs its name with a dominant teal reactor glyph; this remains the primary brand signal across the menu and match HUD.
- Armory records should read as physical maintenance bays with large framed portraits, visible service-grid hardware, and warm plated materials instead of dense dark database cards.
- Directional combo telemetry may cross the arena frame only while it communicates an active launcher, juggle, or finisher, and must not obscure either fighter’s silhouette or the strike lane.
- Catalog language remains concise and operational: state the frame, system, command, or acquisition condition without conventional product copy.
- The PIXEL // MECHA lockup appears as a stenciled machine insignia on primary menu states, anchored by the Reactor Teal glyph and supported by hazard-yellow manufacturer marks.
- Press Start 2P is reserved for command-grade language—titles, buttons, HUD states, HP values, and combat calls—while Space Grotesk carries explanatory campaign and chassis copy.
- Mission and Armory screens use service grids, rail segments, plated materials, and physical slot geometry so neither reads as a generic terminal panel.

The wordmark is a condensed, stenciled **PIXEL // MECHA** lockup interrupted by a central reactor glyph. The graphic mark is a heavy angular teal reactor core: a hexagonal chassis around a four-pronged electric aperture. It is always shown independently of text when space is limited.
