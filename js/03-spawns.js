'use strict';
/* ============ SWITCH SPAWN POOL (18 documented locations) ============
   p = position, n = wall normal the battery faces. Positions sit ~3cm
   proud of their wall so the red panel is visible. 5 are picked per run. */
// 40 documented spawn locations, grouped by the zones community guides list
// (Meyling Games / Marathon Codec): inside / outside / on top of / underneath
// Orientation, inside the Destroyed Wing, and the left & right of Pinwheel.
// Each `p` sits ~0.3m proud of its wall so the red face is visible; `n` is the
// outward wall normal. 5 (or 10 in SWARM) are drawn at random per run.
const RY = OR.roofY, F2 = OR.f2, DY = WING.deckY, PZ = PIN.z;
const SPAWNS = [
  // --- Inside Orientation - ground floor ---
  {p:[-6.0, 1.8, -14],   n:[-1,0,0], label:'Inside Orientation - west lobby pillar'},
  {p:[ 6.0, 1.8, -14],   n:[ 1,0,0], label:'Inside Orientation - east lobby pillar'},
  {p:[ 0.0, 1.0, -6.0],  n:[0,0,1],  label:'Inside Orientation - reception desk'},
  {p:[16.1, 1.8, -8],    n:[-1,0,0], label:'Inside Orientation - east wall'},
  {p:[-16.1,1.8, -18],   n:[ 1,0,0], label:'Inside Orientation - west wall'},
  {p:[12.0, 1.8, -25.1], n:[0,0,1],  label:'Inside Orientation - north wall'},
  // --- Inside Orientation - second floor ---
  {p:[16.1, F2+1.8, -8],    n:[-1,0,0], label:'Second floor - east wall'},
  {p:[-16.1,F2+1.8, -18],   n:[ 1,0,0], label:'Second floor - west wall'},
  {p:[ 8.0, F2+1.8, -25.1], n:[0,0,1],  label:'Second floor - north wall'},
  {p:[-12.0,F2+1.8, -25.1], n:[0,0,1],  label:'Second floor - by the stairwell'},
  // --- On top of Orientation (roof, ladder access) ---
  {p:[ 6.7, RY+1.4, -22],   n:[-1,0,0], label:'Roof - generator (west face)'},
  {p:[-2.0, RY+1.4, -22.5], n:[0,0,1],  label:'Roof - generator (facing the wing)'},
  {p:[ 6.0, RY+1.2, -10.5], n:[0,0,1],  label:'Roof - AC unit'},
  {p:[-6.0, RY+1.0, -25.1], n:[0,0,1],  label:'Roof - north parapet'},
  {p:[16.1, RY+1.0, -10],   n:[-1,0,0], label:'Roof - east parapet'},
  // --- Outside Orientation (exterior walls) ---
  {p:[10.0, 1.8, -1.7],  n:[0,0,1],  label:'Outside Orientation - south wall (east)'},
  {p:[-10.0,1.8, -1.7],  n:[0,0,1],  label:'Outside Orientation - south wall (west)'},
  {p:[17.3, 1.8, -14],   n:[ 1,0,0], label:'Outside Orientation - east wall'},
  {p:[-17.3,2.2, -20],   n:[-1,0,0], label:'Outside Orientation - west wall'},
  {p:[-3.0, 1.8, -26.3], n:[0,0,-1], label:'Outside Orientation - north wall'},
  // --- Underneath Orientation, near the road ---
  {p:[-7.1, 3.0, 16],    n:[-1,0,0], label:'Underneath - west deck pillar'},
  {p:[ 7.1, 3.0, 16],    n:[ 1,0,0], label:'Underneath - east deck pillar'},
  {p:[-7.1, 2.4, 6],     n:[-1,0,0], label:'Underneath - west pillar (road end)'},
  {p:[ 7.1, 3.0, 26],    n:[ 1,0,0], label:'Underneath - east pillar (pocket)'},
  {p:[10.0, 1.9, 4],     n:[-1,0,0], label:'Underneath - large truck on the road'},
  {p:[ 3.4, 1.6, -27.55],n:[0,0,-1], label:'Underneath - NuCaloric machines'},
  // --- Inside the Destroyed Wing (hull deck) ---
  {p:[-7.1, DY+1.6, 4],   n:[ 1,0,0], label:'Destroyed Wing - west wall'},
  {p:[ 7.1, DY+1.6, -6],  n:[-1,0,0], label:'Destroyed Wing - east wall (over roof)'},
  {p:[ 0.0, DY+1.6, -13.4],n:[0,0,1], label:'Destroyed Wing - north end wall'},
  {p:[-7.1, DY+1.6, 18],  n:[ 1,0,0], label:'Destroyed Wing - west wall (south)'},
  {p:[ 7.1, DY+1.6, 12],  n:[-1,0,0], label:'Destroyed Wing - east wall (mid)'},
  {p:[ 7.1, DY+0.9, 27],  n:[-1,0,0], label:'Destroyed Wing - rubble ramp climb'},
  // --- Left of Pinwheel ---
  {p:[-16.7, 2.5, PZ-4],  n:[ 1,0,0], label:'Pinwheel (left) - inner wall'},
  {p:[-16.7, 4.0, PZ+4],  n:[ 1,0,0], label:'Pinwheel (left) - inner wall (high)'},
  {p:[-18.0, 1.3, PZ-11.5],n:[0,0,1], label:'Pinwheel (left) - crate'},
  {p:[-15.0, 1.3, PZ-9.5], n:[0,0,1], label:'Pinwheel (left) - crate (inner)'},
  // --- Right of Pinwheel ---
  {p:[16.7, 2.5, PZ-4],   n:[-1,0,0], label:'Pinwheel (right) - inner wall'},
  {p:[16.7, 4.0, PZ+4],   n:[-1,0,0], label:'Pinwheel (right) - inner wall (high)'},
  {p:[18.0, 1.3, PZ-11.5],n:[0,0,1],  label:'Pinwheel (right) - crate'},
  {p:[15.0, 1.3, PZ-9.5], n:[0,0,1],  label:'Pinwheel (right) - crate (inner)'},
];

let switches = [];
function spawnSwitches(count){
  const n = Math.min(count||5, SPAWNS.length);
  switches.forEach(s=> scene.remove(s.group));
  switches = [];
  const pool = SPAWNS.map((s,i)=>({...s, idx:i}));
  for(let i=pool.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [pool[i],pool[j]]=[pool[j],pool[i]]; }
  pool.slice(0,n).forEach(def=>{
    const g = new THREE.Group();
    const box = new THREE.Mesh(new THREE.BoxGeometry(1,1,.5),
      new THREE.MeshStandardMaterial({color:0xf2f0e8, roughness:.4}));
    box.castShadow = true;
    const sq = new THREE.Mesh(new THREE.PlaneGeometry(.5,.5),
      new THREE.MeshBasicMaterial({color:0xff2a2a}));
    sq.position.z = .26;
    const glow = new THREE.PointLight(0xff2a2a, 1.4, 7);
    glow.position.z = .8;
    g.add(box, sq, glow);
    g.position.set(...def.p);
    g.lookAt(g.position.clone().add(new THREE.Vector3(...def.n)));
    scene.add(g);
    switches.push({group:g, box, sq, glow, dead:false, label:def.label, idx:def.idx});
  });
}
