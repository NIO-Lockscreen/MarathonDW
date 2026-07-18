'use strict';
/* ============ BUTTON SPAWN POOL (40 locations) ============
   29 buttons sit exactly where the player placed them in the reference model
   (MyGameMap.glb — marked [model]); 11 more are filled in from the community
   button guide (marked [guide]): the four B1 basement buttons and the east
   red-zone annex. Four color sets over four height levels:
     PURPLE 8 — the west quarters column: B1 room, ground interior, the
                walkway booth, the west roof chunks
     GREEN  8 — plaza + vantage: B1 plaza rooms, the covered alley, south
                faces, the walkway sign, the wing tip's west wall
     BLUE  12 — the middle: hall east block, the ladder-column fin, roof
                chunks, under-platform pair, the wing-tip walls
     RED   12 — interiors + the east annex: store room, medical walls, the
                sealed hut, the hull fin, depot + far east
   `p` sits ~0.35m proud of its mount so the red face is visible; `n` is the
   outward normal. Modes draw 5 at random, or one whole color set. */
const SETCOL = { PURPLE:'#c85fd6', BLUE:'#38b6f0', GREEN:'#41c95e', RED:'#e8483f' };
const SPAWNS = [
  // --- PURPLE set (8) — the west quarters column ---
  {set:'PURPLE', num:1, lv:'B1',  p:[-33.5,-1.9,7],      n:[ 1,0,0], label:'B1 west room — west wall'},                    // [guide]
  {set:'PURPLE', num:2, lv:'B1',  p:[-30,-1.9,3.71],     n:[ 0,0,1], label:'B1 west room — north wall'},                   // [guide]
  {set:'PURPLE', num:3, lv:'L1',  p:[-31.7,2.2,3.71],    n:[ 0,0,1], label:'west quarters — inside, north wall'},          // [model]
  {set:'PURPLE', num:4, lv:'L1',  p:[-26.53,1.9,9.2],    n:[-1,0,0], label:'west quarters — inside, east wall'},           // [model]
  {set:'PURPLE', num:5, lv:'2F',  p:[-27.19,4.9,-6.9],   n:[-1,0,0], label:'walkway booth — west face'},                   // [model]
  {set:'PURPLE', num:6, lv:'2F',  p:[-24.81,4.9,-5.8],   n:[ 1,0,0], label:'walkway booth — east face'},                   // [model]
  {set:'PURPLE', num:7, lv:'TOP', p:[-23.85,9.6,3],      n:[-1,0,0], label:'roof deck — debris chunk, west face'},         // [model]
  {set:'PURPLE', num:8, lv:'TOP', p:[-25,9.7,8.85],      n:[ 0,0,1], label:'roof deck — debris chunk at the SW corner'},   // [model]
  // --- GREEN set (8) — plaza + vantage ---
  {set:'GREEN', num:1, lv:'2F',  p:[-21.38,4.81,-19.19], n:[-.866,0,-.5], label:'walkway sign panel — back face'},         // [model]
  {set:'GREEN', num:2, lv:'B1',  p:[-28.5,-1.9,19.71],   n:[ 0,0,1], label:'B1 plaza rooms — inside the wall vent'},       // [guide]
  {set:'GREEN', num:3, lv:'B1',  p:[-25,-1.9,22.05],     n:[0,0,-1], label:'B1 plaza rooms — center pillar'},              // [guide]
  {set:'GREEN', num:4, lv:'L1',  p:[-12.2,1.7,9.44],     n:[ 0,0,1], label:'covered alley — inner wall'},                  // [model]
  {set:'GREEN', num:5, lv:'L1',  p:[-6.44,1.7,10.3],     n:[-1,0,0], label:'covered alley — east wall'},                   // [model]
  {set:'GREEN', num:6, lv:'2F',  p:[-22.6,5.5,9.55],     n:[ 0,0,1], label:'hall south face — over the porch'},           // [model]
  {set:'GREEN', num:7, lv:'TOP', p:[-15,9.7,2.15],       n:[0,0,-1], label:'roof deck — debris chunk, north face'},        // [model]
  {set:'GREEN', num:8, lv:'TOP', p:[-15.45,12.8,30.3],   n:[-1,0,0], label:'wing tip — west wall, outside'},               // [model]
  // --- BLUE set (12) — the middle: ladders, roofs, the tip ---
  {set:'BLUE', num:1,  lv:'2F',  p:[-5.35,5.3,1.7],      n:[-1,0,0], label:'hall — east block, deck story'},               // [model]
  {set:'BLUE', num:2,  lv:'2F',  p:[-5.35,8.1,3.4],      n:[-1,0,0], label:'hall — east block, upper story'},              // [model]
  {set:'BLUE', num:3,  lv:'2F',  p:[-4.44,7.5,-1.3],     n:[-1,0,0], label:'ladder-column fin — west face'},               // [model]
  {set:'BLUE', num:4,  lv:'2F',  p:[-3.56,7.9,-2.1],     n:[ 1,0,0], label:'ladder-column fin — east face'},               // [model]
  {set:'BLUE', num:5,  lv:'2F',  p:[-18.4,6.7,8.47],     n:[0,0,-1], label:'hall upper story — south wall, inside'},       // [model]
  {set:'BLUE', num:6,  lv:'TOP', p:[-9,9.6,2.15],        n:[0,0,-1], label:'roof deck — debris chunk by the ladder top'},  // [model]
  {set:'BLUE', num:7,  lv:'TOP', p:[5.9,9.6,2.9],        n:[ 1,0,0], label:'wing roof — debris chunk, east face'},         // [model]
  {set:'BLUE', num:8,  lv:'TOP', p:[-11,10.4,20.45],     n:[ 0,0,1], label:'under the tip platform — south face'},         // [model]
  {set:'BLUE', num:9,  lv:'TOP', p:[-10.6,10.5,19.55],   n:[0,0,-1], label:'under the tip platform — north face'},         // [model]
  {set:'BLUE', num:10, lv:'TOP', p:[-14,14.7,22.55],     n:[0,0,-1], label:'wing tip — north wall, high west'},            // [model]
  {set:'BLUE', num:11, lv:'TOP', p:[-9,13.3,22.55],      n:[0,0,-1], label:'wing tip — north wall, east'},                 // [model]
  {set:'BLUE', num:12, lv:'TOP', p:[-6.55,13.9,27.7],    n:[ 1,0,0], label:'wing tip — east wall, outside'},               // [model]
  // --- RED set (12) — interiors + the east annex ---
  {set:'RED', num:1,  lv:'2F',  p:[-22.35,5.6,7],        n:[-1,0,0], label:'hall store room — west wall'},                 // [model]
  {set:'RED', num:2,  lv:'2F',  p:[-9.3,5,9.55],         n:[ 0,0,1], label:'south face — medical wall, deck story'},       // [model]
  {set:'RED', num:3,  lv:'2F',  p:[-9.4,6.8,9.55],       n:[ 0,0,1], label:'south face — medical wall, upper story'},      // [model]
  {set:'RED', num:4,  lv:'2F',  p:[13.65,5,-3.7],        n:[-1,0,0], label:'sealed hut — upper story, west face'},         // [model]
  {set:'RED', num:5,  lv:'2F',  p:[16.32,4.93,-12.68],   n:[.707,0,.707], label:'crashed hull fin — southeast face'},      // [model]
  {set:'RED', num:6,  lv:'L1',  p:[28,2,1.65],           n:[0,0,-1], label:'depot — north wall, outside'},                 // [guide]
  {set:'RED', num:7,  lv:'L1',  p:[26.5,2.6,13.15],      n:[0,0,-1], label:'depot — medical section, south wall'},         // [guide]
  {set:'RED', num:8,  lv:'L1',  p:[23.98,1.1,9],         n:[ 1,0,0], label:'depot — under the loft stairs'},               // [guide]
  {set:'RED', num:9,  lv:'L1',  p:[19.65,1.7,12.6],      n:[-1,0,0], label:'depot — outside the west door'},               // [guide]
  {set:'RED', num:10, lv:'L1',  p:[32.25,1.2,-2.2],      n:[ 1,0,0], label:'far east — crate by the dorm block'},          // [guide]
  {set:'RED', num:11, lv:'L1',  p:[34.35,3.6,-6.5],      n:[ 1,0,0], label:'far east — dorm block east wall, high'},       // [guide]
  {set:'RED', num:12, lv:'L1',  p:[34.35,2.2,-0.5],      n:[-1,0,0], label:'east gate wall — west face'},                  // [guide]
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
