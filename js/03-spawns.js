'use strict';
/* ============ BUTTON SPAWN POOL (31 model targets) ============
   Every target is placed exactly where the player marked one in the reference
   model (MyGameMap.glb), with the exact facing normal read from the model.
   They're grouped into four pathing zones for the color sets:
     PURPLE — the west column (quarters / west deck / west mid & roof)
     GREEN  — the central complex interior (hall, alley, plaza faces)
     BLUE   — the roofs and the tilted hull corridor
     RED    — the east hut, the SE compound, and the wing tip (finish snipes)
   `p` sits ~0.35m proud of its mount; `n` is the outward normal. Modes draw 5
   at random, or one whole color set. Levels: GRD/DECK/MID/ROOF/TIP. */
const SETCOL = { PURPLE:'#c85fd6', BLUE:'#38b6f0', GREEN:'#41c95e', RED:'#e8483f' };
const SPAWNS = [
  // --- PURPLE (8) — west column ---
  {set:'PURPLE', num:1, lv:'GRD',  p:[-31.73,1.91,3.4],   n:[0,0,1],       label:'west quarters — inside north wall'},
  {set:'PURPLE', num:2, lv:'GRD',  p:[-26.22,1.62,9.22],  n:[-1,0,0],      label:'west quarters — inside east wall'},
  {set:'PURPLE', num:3, lv:'DECK', p:[-27.2,4.56,-5.86],  n:[-1,0,0],      label:'walkway booth — west face'},
  {set:'PURPLE', num:4, lv:'DECK', p:[-25.31,4.56,-4.78], n:[-1,0,0],      label:'walkway booth — east face'},
  {set:'PURPLE', num:5, lv:'DECK', p:[-22.59,5.22,9.6],   n:[0,0,1],       label:'store room — south wall'},
  {set:'PURPLE', num:6, lv:'DECK', p:[-22.4,5.28,7.01],   n:[-1,0,0],      label:'store room — west wall'},
  {set:'PURPLE', num:7, lv:'DECK', p:[-21.19,4.51,-18.96],n:[-0.5,0,0.87], label:'north wall — angled panel'},
  {set:'PURPLE', num:8, lv:'MID',  p:[-23.86,7.8,7.78],   n:[0,0,-1],      label:'west mid room — north wall'},
  // --- GREEN (9) — central interior ---
  {set:'GREEN', num:1, lv:'GRD',  p:[-12.18,1.42,9.13],  n:[0,0,1],   label:'covered alley — inner wall'},
  {set:'GREEN', num:2, lv:'GRD',  p:[-6.13,1.4,10.35],   n:[-1,0,0],  label:'covered alley — east wall'},
  {set:'GREEN', num:3, lv:'DECK', p:[-9.26,4.65,9.6],    n:[0,0,1],   label:'hall — south wall, over the porch'},
  {set:'GREEN', num:4, lv:'DECK', p:[-4.4,4.96,1.7],     n:[-1,0,0],  label:'hall — east block, deck story'},
  {set:'GREEN', num:5, lv:'MID',  p:[-18.38,6.39,8.78],  n:[0,0,-1],  label:'hall upper — south wall, inside'},
  {set:'GREEN', num:6, lv:'MID',  p:[-9.44,6.48,13.66],  n:[0,0,1],   label:'overlook pod — south face'},
  {set:'GREEN', num:7, lv:'MID',  p:[-8.13,7.19,-2.32],  n:[-1,0,0],  label:'mid room — west wall'},
  {set:'GREEN', num:8, lv:'MID',  p:[-7.87,7.58,-2],     n:[1,0,0],   label:'mid room — east wall'},
  {set:'GREEN', num:9, lv:'MID',  p:[-4.4,7.76,3.4],     n:[-1,0,0],  label:'hall — east block, upper story'},
  // --- BLUE (8) — roofs + hull corridor ---
  {set:'BLUE', num:1, lv:'MID',  p:[5.46,7.94,-4.3],   n:[-0.26,0,0.97], label:'hull corridor — upper, outside'},
  {set:'BLUE', num:2, lv:'ROOF', p:[-24.96,9.4,8.54],  n:[0,0,1],        label:'west roof — chunk, south face'},
  {set:'BLUE', num:3, lv:'ROOF', p:[-23.54,9.34,3.03], n:[-1,0,0],       label:'west roof — chunk, west face'},
  {set:'BLUE', num:4, lv:'ROOF', p:[-15.19,9.36,2.46], n:[0,0,-1],       label:'hall roof — chunk, north face'},
  {set:'BLUE', num:5, lv:'ROOF', p:[-11,9.99,20.13],   n:[0,0,1],        label:'under the tip platform — south face'},
  {set:'BLUE', num:6, lv:'ROOF', p:[-11,11,19.87],     n:[0,0,-1],       label:'under the tip platform — north face'},
  {set:'BLUE', num:7, lv:'ROOF', p:[-9.19,9.17,2.46],  n:[0,0,-1],       label:'hall roof — chunk by the tip ladder'},
  {set:'BLUE', num:8, lv:'ROOF', p:[5.54,9.34,2.93],   n:[1,0,0],        label:'hull roof — chunk, east face'},
  // --- RED (6) — east annex + wing tip ---
  {set:'RED', num:1, lv:'DECK', p:[15.31,4.71,-0.69],  n:[1,0,0],       label:'sealed hut — east wall'},
  {set:'RED', num:2, lv:'DECK', p:[22.24,4.63,-8.58],  n:[-0.71,0,0.71],label:'SE compound — angled wall'},
  {set:'RED', num:3, lv:'TIP',  p:[-15.13,12.55,30.29],n:[-1,0,0],      label:'wing tip — west wall, outside'},
  {set:'RED', num:4, lv:'TIP',  p:[-14,14.4,22.87],    n:[0,0,-1],      label:'wing tip — north wall, high west'},
  {set:'RED', num:5, lv:'TIP',  p:[-9,13,22.87],       n:[0,0,-1],      label:'wing tip — north wall, east'},
  {set:'RED', num:6, lv:'TIP',  p:[-6.87,13.59,27.67], n:[1,0,0],       label:'wing tip — east wall, outside'},
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
