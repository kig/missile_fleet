# Copilot instructions (missile_fleet)

## Project overview
- This is a static browser game built on the vendored **CAKE** canvas engine.
- Runtime boot sequence:
  - [index.html](../index.html) loads non-module globals first: [js/cake.js](../js/cake.js) and [js/support.js](../js/support.js)
  - then starts the ES module entrypoint: [js/main.js](../js/main.js)
- The game world is authored in “level coordinates” built around a 640×480 base, then scaled to the viewport.

## Architecture & data flow
- **Engine primitives are globals** from CAKE (e.g. `Klass`, `Canvas`, `CanvasNode`, `Rectangle`, `Circle`, `Line`, `ElementNode`, `CanvasSupport`). Prefer using these instead of introducing new frameworks.
- Most gameplay code is **ES modules** (`import … from "./x.js"`); don’t assume game symbols are globals (only CAKE/support helpers are).
- Game root: `MissileFleet` in [js/main.js](../js/main.js)
  - owns the CAKE `Canvas`, sets `canvas.frameDuration`, and applies responsive scaling/centering.
  - swaps levels via `changeLevel()` and resets static Player state (`Player.selection/targets/waypoints`).
- Levels: subclasses of `Level` in [js/levels.js](../js/levels.js) and base behavior in [js/level.js](../js/level.js)
  - spawn ships via `ship()/group()` and `shipAfter()/groupAfter()` (delayed spawns use `after()`).
  - completion is event-driven: `Level.destroyed()` dispatches `teamDestroyed`, which `Level.initialize()` listens to.
- Entities:
  - `ControlledNode` in [js/controlled_node.js](../js/controlled_node.js) provides the update loop (AI tick + movement + health).
  - `Ship` in [js/ship.js](../js/ship.js) composes weapons/markers and implements tactical+strategic AI.
  - Projectiles/weapons are in [js/projectile.js](../js/projectile.js) and [js/weapons.js](../js/weapons.js).
- Player interaction state is **static** on `Player` in [js/player.js](../js/player.js):
  - `Player.selection` stores ship IDs plus a sidecar `selection.dict` and `selection.formation`.

## Code conventions in this repo
- Use CAKE’s inheritance pattern:
  - `export const Thing = Klass(Base, { initialize: function (...) { Base.initialize.call(this); ... } })`
- Use CAKE scheduling/animation helpers where you see them already:
  - `addFrameListener(fn)`, `after(ms, fn)`, `every(ms, fn)`, `animateTo(...)`.
- Avoid large refactors of the vendored engine files:
  - [js/cake.js](../js/cake.js) and [js/support.js](../js/support.js) are legacy and include wrapper code; treat them as third‑party unless you have a targeted fix.

## Input, mobile, and fullscreen
- Mouse selection/waypoints are handled in [js/level.js](../js/level.js) using CAKE events (`mousedown`, `drag`, `mouseup`).
- Touch support is layered by translating touch events into mouse/drag events in [js/touch_controls.js](../js/touch_controls.js) and initialized from [js/main.js](../js/main.js).
- Fullscreen + info overlay is created dynamically in [js/fullscreen.js](../js/fullscreen.js) and styled in [css/style.css](../css/style.css).

## Common gotchas
- Coordinate spaces: gameplay uses level coordinates; pointer input arrives in canvas/screen space—see the `CanvasSupport.tInvertMatrix(...)` transform usage in [js/level.js](../js/level.js).
- Responsive scaling/centering happens in `MissileFleet.initialize()` and its `resize` handler in [js/main.js](../js/main.js); avoid duplicating scaling logic elsewhere.
- Player state is static/global: `Player.selection`, `Player.selection.dict`, `Player.selection.formation`, and `Player.targets` persist across frames and are reset on level changes in [js/main.js](../js/main.js).
- CAKE engine globals vs ES modules: CAKE primitives are globals, but most game code must be imported; don’t rely on cross-module globals except the engine/support layer.

## Developer workflow
- No build step. Use a local static server (ES modules usually won’t run from `file://`):
  - `python3 -m http.server 8000` then open `http://localhost:8000/`
- Debug UI is present but hidden by default (`#debug { display: none; }` in [css/style.css](../css/style.css)). To work on debug panels, temporarily show it.
