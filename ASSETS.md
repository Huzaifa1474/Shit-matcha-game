# Assets

**Art direction:** A clean, side-view industrial arcade diorama with crisp pixel-art clusters, warm parchment sky, oxidized factory forms, charcoal steel, cobalt blue versus vermilion red combatants, and sparing reactor-teal power indicators. Visual effects are built from sharply bounded geometry and particles rather than soft bloom or cinematic lighting.

## Visual Target

| Name | Role | Size | Image |
|---|---|---:|---|
| Rustbelt Arena Visual Target | Visual QA reference showing camera, HUD hierarchy, combat scale, and palette | 16:9 reference | `/manus-storage/rustbelt-arena-visual-target_2a6d1c77.png` |

## Backgrounds

| Name | Description | Size | Image |
|---|---|---:|---|
| Rustbelt Arena Backdrop | Dusty industrial arena rear layer with catwalk, factory silhouettes, crane, stacks, and controlled empty middle ground | 1920×1080 px, full playfield | `/manus-storage/rustbelt-arena-backdrop_1351a937.png` |

## Sprites

| Name | Description | Size | Image |
|---|---|---:|---|
| Blue Vanguard | Cobalt/cream player mecha, facing right | 150×150 px display target | `/manus-storage/blue-vanguard-mecha_07647d6a.png` |
| Red Raider | Vermilion/graphite enemy mecha, facing left | 150×150 px display target | `/manus-storage/red-raider-mecha_87c0fcb9.png` |
| Reactor Core Mark | Teal angular arcade reactor emblem; used in the HUD header | 64×64 px display target | `/manus-storage/reactor-core-mark_76dd0b87.png` |

## Procedural Effects and UI

| Asset | Method | Size | Purpose |
|---|---|---:|---|
| HP rails | React/CSS segmented bars | Responsive | Health at a glance, color-coded by fighter. |
| Impact flash | Babylon plane and small spark boxes | 0.5–1.2 scene units | Shows strike range and successful hits. |
| Guard field | Babylon line/plane material | 2.2 scene units | Angular blue or red guard state signal. |
| Exhaust smoke | Babylon transparent planes | 0.3–0.8 scene units | Low-frequency background activity. |

