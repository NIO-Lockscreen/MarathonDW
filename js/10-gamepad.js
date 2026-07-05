'use strict';
// ---------- Gamepad ----------
// Standard Gamepad mapping (Xbox-style):
//   Left stick  = move        Right stick = look
//   A (0)       = jump / deploy    Start (9) = restart / deploy
//   RT (7) / RB (5) = shoot    LT (6) / L3 (10) = sprint    LB (4) hold = map
const PAD = {
  index: null,
  prev: {},       // previous pressed state per button (edge detection)
  _map: false,    // last map-hold state
  DEAD: 0.18,     // stick deadzone
  LOOK: 2.6,      // look speed (rad/sec at full deflection)
};

addEventListener('gamepadconnected', e=>{
  if(e.gamepad) PAD.index = e.gamepad.index;
  if(typeof flash === 'function' && state === 'play') flash('GAMEPAD CONNECTED');
});
addEventListener('gamepaddisconnected', e=>{
  if(e.gamepad && PAD.index === e.gamepad.index) PAD.index = null;
});

function padGet(){
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  if(PAD.index != null && pads[PAD.index]) return pads[PAD.index];
  for(const p of pads){ if(p){ PAD.index = p.index; return p; } }  // adopt first present
  return null;
}
function padDead(v){ return Math.abs(v) < PAD.DEAD ? 0 : (v - Math.sign(v)*PAD.DEAD)/(1-PAD.DEAD); }

// Poll the pad once per frame. Handles look + one-shot actions internally;
// returns continuous movement intent for the main loop, or null if no pad.
function gamepadUpdate(dt){
  const gp = padGet();
  if(!gp) return null;
  const A = i => !!(gp.buttons[i] && gp.buttons[i].pressed);           // level
  const E = i => { const p = A(i), w = PAD.prev[i]; PAD.prev[i] = p; return p && !w; }; // edge

  // On menus / end screen: A or Start starts a run.
  if(state !== 'play'){
    const deploy = E(0) || E(9);
    for(let i=0;i<16;i++){ if(i!==0 && i!==9) PAD.prev[i] = A(i); } // consume stale edges
    if(deploy){ beep(600,.1); startRun(); }
    return null;
  }

  // Look — right stick (axes 2,3)
  player.yaw  -= padDead(gp.axes[2]||0) * PAD.LOOK * dt;
  player.pitch = Math.max(-1.45, Math.min(1.45,
                 player.pitch - padDead(gp.axes[3]||0) * PAD.LOOK * dt));

  // Shoot — RT / RB (edge; no pointer lock required)
  if(E(7) || E(5)) fireWeapon();
  // Restart — Start
  if(E(9)) startRun();
  // Map — hold LB
  const map = A(4);
  if(map !== PAD._map){ PAD._map = map; showMap(map); }
  PAD.prev[0] = A(0); // keep jump edge state fresh (read as level below)

  // Move — left stick (axes 0,1); sprint LT/L3; jump A
  return {
    moveX:  padDead(gp.axes[0]||0),
    moveZ:  padDead(gp.axes[1]||0),
    sprint: A(6) || A(10),
    jump:   A(0),
  };
}
