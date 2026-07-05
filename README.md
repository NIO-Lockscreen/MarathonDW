# SWITCH HUNT // DESTROYED WING

A fan-made three.js speedrun trainer for the Orientation quadrant of Outpost.
Shoot the wall batteries (each run picks from 40 documented spawn locations),
drop the barrier, and sprint into the crashed Destroyed Wing to stop the clock.
Spawn zones follow community switch-hunt guides: inside / outside / on top of
Orientation, underneath Orientation near the road, inside the Destroyed Wing,
and the left & right sides of Pinwheel.
Playable with keyboard + mouse or a gamepad (left stick move, right stick look,
RT shoot, A jump, LT sprint, hold LB for the map).

## Modes (chosen before each run)

Pick a mode from the start/end screen, or press `1`–`4` (gamepad: A / X / B / Y):

1. **GUIDED** — 5 batteries; an on-screen arrow points to the nearest one.
2. **RECON** — 5 batteries; live targets are shown on the TAB map.
3. **BLIND** — 5 batteries; no assistance.
4. **SWARM** — 10 batteries at once; map assist on.

`R` (gamepad START) restarts the last mode. Best times are tracked per mode.

## Getting around

Interior lobby stairs reach the second floor; a **ladder** on the building's
west face climbs to the roof. The rubble ramp on the south side leads up to the
Destroyed Wing deck, gated by the barrier until every battery is down.

Open `index.html` in a browser (a static server is fine: `python3 -m http.server`).

## Layout notes

- **Orientation** is a two-floor building with a walkable interior: ground-floor
  lobby, a second floor reached by an interior stairwell, and a roof reached
  either by the same stairwell or the exterior west stair.
- The **Destroyed Wing** is an elevated crashed hull whose deck crash-lands
  **over the Orientation roof**. Its north end rests on the roof; its south span
  stands on pillars over the lower road. Climb the rubble ramp into the south
  entry pocket, cross the barrier (once all 5 batteries are down) to finish.

## Source layout ("vibe-optimized" pieces)

The game was one 4,500-line file; it is now split so each concern is small and
editable on its own. Files load in order as plain classic `<script>`s that share
one global scope (no build step, no modules), so declaration order matters.

| File | Responsibility |
|------|----------------|
| `css/style.css` | All HUD / screen styling |
| `vendor/three.min.js` | three.js r128 (MIT), vendored so the game is self-contained |
| `vendor/GLTFLoader.js` | three.js GLTFLoader r128 (MIT) |
| `assets/models.js` | Embedded CC0 Kenney GLB models (base64 data URIs) |
| `js/00-core.js` | Renderer, scene, camera, sky, lights |
| `js/01-materials.js` | Canvas textures, materials, `addBox()` collider helper |
| `js/02-layout.js` | **World geometry** — buildings, wing, trench, barrier |
| `js/03-spawns.js` | The 18-location battery spawn pool + `spawnSwitches()` |
| `js/04-assets.js` | GLB loading (truck, drones, blaster viewmodel) |
| `js/05-input.js` | Keyboard / mouse / pointer-lock, player object |
| `js/06-audio.js` | WebAudio `beep()` synth |
| `js/07-map.js` | TAB minimap overlay |
| `js/08-combat.js` | Shooting, raycast, switch destruction, particles |
| `js/09-game.js` | Run state, timer, start / end flow |
| `js/10-gamepad.js` | Gamepad polling (Standard mapping): move / look / shoot / jump / sprint / map / deploy |
| `js/11-main.js` | Physics, collision, and the animation loop |

To change the map, edit `js/02-layout.js` (geometry) and `js/03-spawns.js`
(battery positions). `WING.deckY`, `OR` (Orientation), and `TR` (trench) are the
shared anchors the spawn pool and physics reference.

---
FAN-MADE TRAINER · LAYOUT APPROXIMATED FROM COMMUNITY GUIDES ·
MODELS: KENNEY.NL (CC0) · three.js (MIT) · NOT AFFILIATED WITH BUNGIE
