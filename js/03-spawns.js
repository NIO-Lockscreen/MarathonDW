'use strict';
/* ============ BUTTON SPAWN POOL (39 documented locations) ============
   The four color sets from the community guide map — PURPLE (8), BLUE (12),
   GREEN (8), RED (11) — at their mapped positions, spread over the four
   height levels: B1 basement, L1 ground, 2F second floor / elevated,
   TOP Destroyed Wing upper walls & deck.
   `p` sits ~0.35m proud of its mount so the red face is visible; `n` is the
   outward normal. Modes draw 5/10 at random, or one whole color set. */
const SETCOL = { PURPLE:'#c85fd6', BLUE:'#38b6f0', GREEN:'#41c95e', RED:'#e8483f' };
const SPAWNS = [
  // --- PURPLE set (8) — west + north of Orientation ---
  {set:'PURPLE', num:1,  lv:'B1',  p:[-60.35,-2.5,-20],   n:[ 1,0,0], label:'B1 west rooms — west wall'},
  {set:'PURPLE', num:2,  lv:'B1',  p:[-54.2,-2.5,-28.35], n:[ 0,0,1], label:'B1 west rooms — north wall'},
  {set:'PURPLE', num:3,  lv:'2F',  p:[-33.9,6.2,-16.2],   n:[.5,0,-1], label:'on top of the container stack NW of Orientation'},
  {set:'PURPLE', num:4,  lv:'L1',  p:[-22.55,1.6,-38.3],  n:[-1,0,0], label:'ORTN garage on the north road — road-side wall'},
  {set:'PURPLE', num:5,  lv:'L1',  p:[-21.6,1.9,-42.35],  n:[0,0,-1], label:'ORTN garage on the north road — north corner'},
  {set:'PURPLE', num:6,  lv:'L1',  p:[5.5,1.5,-67.25],    n:[ 0,0,1], label:'north tip overlook — crate by the antenna'},
  {set:'PURPLE', num:7,  lv:'L1',  p:[-22.15,1.4,-21],    n:[ 1,0,0], label:'road junction NW of Orientation — red crate'},
  {set:'PURPLE', num:8,  lv:'L1',  p:[-6.6,2.2,-18.65],   n:[0,0,-1], label:'Orientation — north wall, outside by the door'},
  // --- BLUE set (12) — Orientation interior + Destroyed Wing top ---
  {set:'BLUE', num:1,  lv:'L1',  p:[-25.2,1.7,-12.6],  n:[ 0,0,1], label:'Orientation GF — west pillar, south face'},
  {set:'BLUE', num:2,  lv:'L1',  p:[-24.2,1.7,-8.9],   n:[ 1,0,0], label:'Orientation GF — west pillar, east face'},
  {set:'BLUE', num:3,  lv:'L1',  p:[-19,1.0,-7.65],    n:[ 0,0,1], label:'Orientation GF — console by the west rooms'},
  {set:'BLUE', num:4,  lv:'L1',  p:[-18.7,1.7,1.35],   n:[0,0,-1], label:'Orientation GF — inside the south wall'},
  {set:'BLUE', num:5,  lv:'2F',  p:[-5.2,5.9,-8.35],   n:[ 0,0,1], label:'Orientation 2F — center pillar'},
  {set:'BLUE', num:6,  lv:'L1',  p:[9.35,1.7,-0.8],    n:[-1,0,0], label:'Orientation GF — southeast corner, inside'},
  {set:'BLUE', num:7,  lv:'2F',  p:[2.3,5.15,1.35],    n:[0,0,-1], label:'Orientation 2F — sill under the south windows'},
  {set:'BLUE', num:8,  lv:'2F',  p:[3.75,5.6,-10.4],   n:[-1,0,0], label:'Orientation 2F — east server rack'},
  {set:'BLUE', num:9,  lv:'2F',  p:[-2.1,5.9,-13.35],  n:[ 0,0,1], label:'Orientation 2F — north rack row'},
  {set:'BLUE', num:10, lv:'TOP', p:[8.65,10,18.7],     n:[ 1,0,0], label:'Destroyed Wing — east hull wall, upper level (outside)'},
  {set:'BLUE', num:11, lv:'TOP', p:[-9.5,9.9,24.45],   n:[0,0,-1], label:'Destroyed Wing — top deck, blue hull chunk'},
  {set:'BLUE', num:12, lv:'TOP', p:[-16.9,9.8,23.95],  n:[-.35,0,-1], label:'Destroyed Wing — top deck, acid wing chunk'},
  // --- GREEN set (8) — plaza, wing perimeter, B1 ---
  {set:'GREEN', num:1,  lv:'L1',  p:[-32.65,1.8,-8],    n:[-1,0,0], label:'Orientation — west wall, outside'},
  {set:'GREEN', num:2,  lv:'B1',  p:[-28.3,-2.5,-0.35], n:[ 0,0,1], label:'B1 plaza rooms — north wall'},
  {set:'GREEN', num:3,  lv:'B1',  p:[-21.5,-2.5,8.0],   n:[0,0,-1], label:'B1 plaza rooms — center pillar'},
  {set:'GREEN', num:4,  lv:'L1',  p:[-13.1,1.5,7.35],   n:[0,0,-1], label:'south plaza — NuCaloric kiosk'},
  {set:'GREEN', num:5,  lv:'L1',  p:[5.3,1.6,11.35],    n:[0,0,-1], label:'Destroyed Wing — north wall by the east corner'},
  {set:'GREEN', num:6,  lv:'L1',  p:[8.7,1.3,26.9],     n:[-1,0,0], label:'southeast yard — blue crate, west face'},
  {set:'GREEN', num:7,  lv:'TOP', p:[-28.65,10,28.9],   n:[-1,0,0], label:'Destroyed Wing — west hull wall, upper level (outside)'},
  {set:'GREEN', num:8,  lv:'L1',  p:[-14.4,3.0,31.9],   n:[ 0,0,1], label:'Destroyed Wing — underneath the south overhang'},
  // --- RED set (11) — sealed hut, depot, far east ---
  {set:'RED', num:1,  lv:'L1',  p:[60.65,1.2,11.4],   n:[ 1,0,0], label:'far east — crate by the dorm block'},
  {set:'RED', num:2,  lv:'L1',  p:[58.35,2.6,8.9],    n:[ 1,0,0], label:'far east — dorm block east wall, high'},
  {set:'RED', num:3,  lv:'L1',  p:[71.65,2.2,7.2],    n:[-1,0,0], label:'east gate wall — west face'},
  {set:'RED', num:4,  lv:'L1',  p:[59.2,2.0,-6.35],   n:[0,0,-1], label:'far east — north block, sea side'},
  {set:'RED', num:5,  lv:'L1',  p:[35.2,2.0,1.35],    n:[0,0,-1], label:'depot — north wall, outside'},
  {set:'RED', num:6,  lv:'L1',  p:[38.65,2.0,7.8],    n:[ 1,0,0], label:'depot — east wall, outside'},
  {set:'RED', num:7,  lv:'L1',  p:[27.7,1.7,16.35],   n:[0,0,-1], label:'depot GF — inside, south wall'},
  {set:'RED', num:8,  lv:'L1',  p:[23.05,1.5,12.2],   n:[ 1,0,0], label:'depot GF — inside, west rack'},
  {set:'RED', num:9,  lv:'L1',  p:[17.35,1.7,9.6],    n:[-1,0,0], label:'depot — outside the west door'},
  {set:'RED', num:10, lv:'L1',  p:[12.65,1.6,-9.2],   n:[-1,0,0], label:'sealed hut NE of Orientation — west face'},
  {set:'RED', num:11, lv:'L1',  p:[11.45,1.6,25.2],   n:[ 1,0,0], label:'southeast yard — red container, east face'},
];

let switches = [];
let currentSetName = null;
// Spawn the run's buttons. `mode` is a MODES entry: `count` random picks, or
// `set:true` for one whole color set. Returns how many spawned.
function spawnSwitches(mode){
  switches.forEach(s=> scene.remove(s.group));
  switches = [];
  let picks;
  if(mode && mode.set){
    const names = Object.keys(SETCOL);
    currentSetName = names[(Math.random()*names.length)|0];
    picks = SPAWNS.filter(s=> s.set===currentSetName);
  }else{
    currentSetName = null;
    const pool = SPAWNS.slice();
    for(let i=pool.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [pool[i],pool[j]]=[pool[j],pool[i]]; }
    picks = pool.slice(0, Math.min((mode&&mode.count)||5, pool.length));
  }
  picks.forEach(def=>{
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
    switches.push({group:g, box, sq, glow, dead:false,
      set:def.set, num:def.num, lv:def.lv,
      label:def.set+' '+def.num+' · '+def.label, idx:SPAWNS.indexOf(def)});
  });
  return picks.length;
}
