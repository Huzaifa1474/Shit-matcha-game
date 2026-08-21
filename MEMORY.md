# Development Memory

- Host: React 19 + Vite static project; Babylon.js will render the combat arena inside the React frame.
- Required visual style: Rustbelt Arena — warm industrial pixel arcade, cobalt Blue Vanguard versus vermilion Red Raider, reactor teal only as a surgical power accent.
- Generated assets are stored outside the project and referenced by `/manus-storage/` URLs only.
- The implementation must remain a simple browser game: no backend, physics engine, imported GLB pipeline, pointer lock, or external services.
- Visual verification should use the WebDev preview. `?demo` must run a deterministic combat sequence for screenshot review.
- Tournament Link adds a best-of-three state machine, three Blue faction profiles, frame-stepped CSS-visible fight animation, an uploaded 8-bit music loop, and Web Audio chip effects.
- The preview browser can report Babylon fragment shader compilation failures for standard materials. The game retains its Babylon state model, but its player-visible Rustbelt stage and fighters are rendered through a synchronized CSS pixel layer for reliable delivery.
