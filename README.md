# SWITCH HUNT // DESTROYED WING

A fan-made three.js speedrun trainer for the Orientation quadrant of Outpost.
Shoot the 5 wall batteries (each run picks 5 of 18 spawn locations), drop the
barrier, and sprint into the crashed Destroyed Wing to stop the clock.

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
| `js/10-main.js` | Physics, collision, and the animation loop |

To change the map, edit `js/02-layout.js` (geometry) and `js/03-spawns.js`
(battery positions). `WING.deckY`, `OR` (Orientation), and `TR` (trench) are the
shared anchors the spawn pool and physics reference.

---
FAN-MADE TRAINER · LAYOUT APPROXIMATED FROM COMMUNITY GUIDES ·
MODELS: KENNEY.NL (CC0) · three.js (MIT) · NOT AFFILIATED WITH BUNGIE
