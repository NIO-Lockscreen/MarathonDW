'use strict';
/* ============ SWITCH SPAWN POOL (18 documented locations) ============
   p = position, n = wall normal the battery faces. Positions sit ~3cm
   proud of their wall so the red panel is visible. 5 are picked per run. */
const SPAWNS = [
  // Destroyed Wing (crashed hull)
  {p:[-6.85, 3, 14],               n:[-1,0,0], label:'Under the wing - west pillar'},
  {p:[ 6.85, 3, 22],               n:[ 1,0,0], label:'Under the wing - east pillar'},
  {p:[-7.37, WING.deckY+1.6, 4],   n:[ 1,0,0], label:'Wing west wall (on deck)'},
  {p:[ 7.37, WING.deckY+1.6, -6],  n:[-1,0,0], label:'Wing east wall (over Orientation)'},
  {p:[ 7.37, WING.deckY+.9, 27],   n:[-1,0,0], label:'Climbing point - rubble ramp'},
  // Orientation roof
  {p:[11.06, OR.roofY+1.4, -22],   n:[ 1,0,0], label:'Roof generator facing Dormitories bridge'},
  {p:[-2, OR.roofY+1.4, -22.74],   n:[ 0,0,1], label:'Roof generator facing Destroyed Wing'},
  // Orientation interior - ground floor
  {p:[-5.73, 1.8, -14],            n:[-1,0,0], label:'Ground floor - lobby pillar'},
  {p:[-16.34, 1.8, -10],           n:[ 1,0,0], label:'Ground floor - west wall by the exit'},
  // Orientation interior - second floor
  {p:[16.34, OR.f2+1.8, -8],       n:[-1,0,0], label:'Second floor - east wall'},
  {p:[-12, OR.f2+1.8, -25.34],     n:[ 0,0,1], label:'Second floor - stairwell wall'},
  // Outskirts
  {p:[TR.x-4.44, -1.4, -4],        n:[ 1,0,0], label:'Trench wall under Flight Control bridge (west)'},
  {p:[TR.x+4.44, -1.4, 4],         n:[-1,0,0], label:'Trench wall under Flight Control bridge (east)'},
  {p:[-20.24, 2, -17],             n:[ 1,0,0], label:'Garage wall - Orientation west'},
  {p:[truckPos.x-1.76, 1.9, truckPos.z], n:[-1,0,0], label:'Large truck - lower road'},
  {p:[ 3.4, 1.6, -27.36],          n:[ 0,0,-1], label:'Left of the NuCaloric machines'},
  {p:[-16, 1.5, -33.94],           n:[ 0,0,1], label:'Cargo Bay containers (Airfield side)'},
  {p:[33.94, 5.5, -8],             n:[-1,0,0], label:'Dormitories wall by the bridge'},
];

let switches = [];
function spawnSwitches(){
  switches.forEach(s=> scene.remove(s.group));
  switches = [];
  const pool = SPAWNS.map((s,i)=>({...s, idx:i}));
  for(let i=pool.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [pool[i],pool[j]]=[pool[j],pool[i]]; }
  pool.slice(0,5).forEach(def=>{
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
