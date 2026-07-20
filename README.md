# SWITCH HUNT // DESTROYED WING

A fan-made three.js speedrun trainer for the Destroyed Wing complex of
Outpost. The whole arena is rebuilt from the player's own 3D model (a
"BlockMap" build exported to glTF): every building, wall, floor, crate,
doorway and ladder is imported at its exact coordinates, and all **31 button
spawns** sit exactly where they were placed. Where the model needed it to be
playable — per the builder's notes — an opening is cut at every doorway, a
hole is punched in the slab wherever a ladder climbs through, the hall's
atrium is opened, and every building and floor is made reachable. Shoot the
run's buttons, drop the barriers, climb to the wing tip, and set foot in the
tip room to stop the clock.
Playable with keyboard + mouse or a gamepad (left stick move, right stick
look, RT shoot, A jump, LT sprint, hold LB for the map).

## Modes (chosen before each run)

Pick a mode from the start/end screen, or press `1`–`4` (gamepad: A / X / B / Y):

1. **GUIDED** — 5 buttons; a marker floats over the nearest one whenever it is on screen (so you can see which wall it is on); an edge arrow steers you when it is not.
2. **RECON** — 5 buttons; live targets are ringed on the TAB map.
3. **BLIND** — 5 buttons; no assistance.
4. **FULL SET** — one whole color set (6–9 buttons); map assist on.

`R` (gamepad START) restarts the last mode. Best times are tracked per mode.
The TAB map is drawn straight from the model: all 31 numbered spawns, north-up,
in their set colors.

## The arena (five floors, straight from the model)

World `y` = floor × 3: **ground (0)**, **deck (3)**, **mid (6)**, **roof (9)**,
**tip (12)**.

- **Ground** — the open yards around and under the deck, the enterable **west
  quarters**, and the big **‑30° angled hangar** to the west. Two ladders
  climb to the deck (west shaft + the SE corner).
- **The deck** — the raised hub: the two-story **hall** (an open atrium — its
  upper walls ring the void), the **walkway booth**, store rooms, the north
  walkway, and the tilted **‑15° hull corridor** crossing the east end. To the
  southeast, a walled **45° compound/yard** with pinwheel walls.
- **Mid** — the hall's upper ring, the **overlook pod** cantilevered south, a
  small mid room, and the hull corridor's second story (linked by a bridge and
  interior ladders).
- **The roofs** — hall roof + corridor roof, strewn with the model's blue
  debris crates (several carry buttons).
- **The wing tip** — the platform on legs over the plaza, ending in the walled
  **tip room**: the finish. Two red barriers seal it until the grid clears —
  one across the platform mouth above the pod ladder, one in the tip-room door
  (the lamp row above the door shows the grid).

## Buttons (31 spawns, 4 sets, 5 levels)

Every spawn is a wall-mounted target imported from the model, grouped into four
pathing zones. It is fine that the model doesn't cover every guide target — the
run uses exactly what was built.

- **PURPLE (8)** — the west column: the west quarters interior, the walkway
  booth and store rooms on the deck, the west mid room.
- **GREEN (9)** — the central interior: the covered alley, the hall's south
  and east faces (deck + upper), and the mid rooms.
- **BLUE (8)** — the heights: the hull corridor's outer walls and the roofs
  (west roof, hall roof, the crates by the tip ladder, the under-platform pair).
- **RED (6)** — the east + the finish: the sealed hut, the SE compound wall,
  and the four faces of the wing-tip room (sniped from the roofs / plaza / yard,
  then entered to finish).

## Getting around

Ladders (all imported, then merged into continuous climbs where the model
stacked them): the **west shaft** (ground → deck), the **hall column** and the
**east column** (deck → roof, straight through the atrium), the **hull ladder**
(deck → mid), the **SE ladder** (ground → deck), and the **tip ladder** (roof →
platform, gated until the grid clears). Every doorway in the model is an open
opening, and every ladder emerges through a hole cut in the slab above it.

Open `index.html` in a browser (a static server is fine: `python3 -m http.server`).

## Source layout ("vibe-optimized" pieces)

Files load in order as plain classic `<script>`s sharing one global scope
(no build step, no modules), so declaration order matters.

| File | Responsibility |
|------|----------------|
| `css/style.css` | All HUD / screen styling |
| `vendor/three.min.js` | three.js r128 (MIT), vendored so the game is self-contained |
| `vendor/GLTFLoader.js` | three.js GLTFLoader r128 (MIT) |
| `assets/models.js` | Embedded CC0 Kenney GLB models (base64 data URIs) |
| `js/00-core.js` | Renderer, scene, camera, night sky, moonlight |
| `js/01-materials.js` | Canvas textures (CTRL panels, blue hull), materials, `addBox()` |
| `js/02-layout.js` | **`MAP` data (imported model) + the builder** that raises it |
| `js/03-spawns.js` | The 31-target spawn pool (4 color sets) + `spawnSwitches()` |
| `js/04-assets.js` | GLB loading (truck, drones, blaster viewmodel) |
| `js/05-input.js` | Keyboard / mouse / pointer-lock, player object |
| `js/06-audio.js` | WebAudio `beep()` synth |
| `js/07-map.js` | TAB map — footprints drawn from `MAP` + all 31 numbered spawns |
| `js/08-combat.js` | Shooting, raycast, button destruction, particles |
| `js/09-game.js` | Run state, timer, start / end flow |
| `js/10-gamepad.js` | Gamepad polling (Standard mapping) |
| `js/11-main.js` | Physics (platform/hole support + ladders), collision, the loop |

`js/02-layout.js` holds the model as `MAP` (buildings / walls / floors / blocks
/ ladders / doors) and a small builder that turns it into collidable geometry —
cutting doorways, punching ladder holes, laying walkable platforms, and adding
the fills (interior props, the tip-room door, barriers, lights). `platforms`
and `holeList` are the walkable-surface + shaft data the physics reads; `WING`
holds the tip gates and finish volume. To change the map, edit the `MAP` data.

---
FAN-MADE TRAINER · ARENA REBUILT 1:1 FROM THE PLAYER'S 3D MODEL ·
MODELS: KENNEY.NL (CC0) · three.js (MIT) · NOT AFFILIATED WITH BUNGIE
