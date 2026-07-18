'use strict';
/* =====================  LAYOUT — rebuilt from the player's GLB model  =====================
   The whole arena is imported from the user's crude 3D build (MyGameMap.glb,
   axes match the game: +x = east, -z = north). Every wall, floor, door,
   ladder and crate below sits at the model's exact coordinates; the gaps the
   model left open (B1 rooms, the depot / far-east annex, supports under
   floating pieces, stairs) are filled in from the community button guide.

   Vertical structure (the model's five layers):
     y0   ground (+ two B1 rooms at -3.2 dug under it)
     y3   THE DECK — a raised slab over an open undercroft; the deck hall,
          walkway booth and north walkway live here
     y6   hall story 2 + the tilted hull corridor's second story (bridge-linked)
     y9   roof level: hall roof, corridor roof, overhang-pod roof
     y12  THE WING TIP — platform + walled tip room (the finish)
   Everything solid goes through addBox() so it collides + occludes. */

// Build a climbable ladder: rails + rungs (non-colliding) plus a climb volume.
// axis 'x': rails spread along x (mount on a ±z wall); 'z': along z (±x wall).
function addLadder(cx, cz, base, top, land, axis='x'){
  const h=top-base, cy=(base+top)/2;
  if(axis==='x'){
    addBox(.12,h,.12, cx-.55,cy,cz, M.uescDark, {noCollide:true});
    addBox(.12,h,.12, cx+.55,cy,cz, M.uescDark, {noCollide:true});
  }else{
    addBox(.12,h,.12, cx,cy,cz-.55, M.uescDark, {noCollide:true});
    addBox(.12,h,.12, cx,cy,cz+.55, M.uescDark, {noCollide:true});
  }
  const n = Math.floor(h/0.45);
  for(let i=0;i<=n;i++){
    if(axis==='x') addBox(1.2,.09,.09, cx, base+i*0.45, cz, M.uescDark, {noCollide:true});
    else           addBox(.09,.09,1.2, cx, base+i*0.45, cz, M.uescDark, {noCollide:true});
  }
  ladders.push({ x0:cx-.9, x1:cx+.9, z0:cz-1.1, z1:cz+1.1, base, top:top+.1, land });
}
// Rotated wall, built as short segments so the AABB colliders hug the true
// line (one long rotated box would block everything inside its fat AABB).
function addWallRot(cx, cz, len, h, thick, yaw, y0, mat, opts={}){
  const segs = Math.max(1, Math.round(len/1.4));
  const sl = len/segs, dx = Math.sin(yaw), dz = Math.cos(yaw);
  for(let i=0;i<segs;i++){
    const t = -len/2 + sl*(i+.5);
    addBox(thick, h, sl*1.08, cx+dx*t, y0+h/2, cz+dz*t, mat, Object.assign({ry:yaw}, opts));
  }
}
// Ground-level pad strip (visual only)
function addPad(w,d, x,z, ry){
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w,d), M.pad);
  p.rotation.x = -Math.PI/2; if(ry) p.rotation.z = ry;
  p.position.set(x,.03,z); p.receiveShadow = true;
  scene.add(p); occluders.push(p);
  return p;
}
// Cool-white station floodlight
function addFlood(x,y,z, i=.85, d=22, col=0xcfe2ff){
  const l = new THREE.PointLight(col, i, d);
  l.position.set(x,y,z); scene.add(l); return l;
}

// ---- Shared anchors ----
// Deck/roof heights straight from the model; the WING anchor now describes
// the tip platform: two barrier gates (platform north edge + tip-room door)
// and the finish volume inside the tip room.
const LV = { deck:3.0, mid:6.0, roof:9.0, tip:12.0 };
const WING = {
  gates:[ {x0:-15.3, x1:-6.7, z0:9.4,  z1:11.4, push:9.2,  y:11.3},   // platform north edge
          {x0:-11.9, x1:-10.1, z0:22.2, z1:23.5, push:22.0, y:11.9} ],// tip-room doorway
  finishY: 11.9,
  finish:[ {x0:-14.85, x1:-7.15, z0:23.3, z1:31.2} ],                 // inside the tip room
};
// Below-ground rooms (B1). groundHeightAt() treats these as the base floor.
const PITS = [
  {x0:-34.2, x1:-25.8, z0:3,  z1:11, floor:-3.2, name:'WEST ROOM'},   // under the west quarters
  {x0:-32,   x1:-18,   z0:19, z1:27, floor:-3.2, name:'PLAZA ROOMS'}, // under the south plaza
];

// ---- Ground (quads leaving holes only where a B1 room has an opening —
//      the slabs over the rooms are their own boxes below) ----
{
  // one big ground sheet split around the two pit rectangles
  [[-50,36.2,-27,3],                       // north band (incl. added north strip)
   [-50,-34.2,3,11],[-25.8,36.2,3,11],
   [-50,36.2,11,19],
   [-50,-32,19,27],[-18,36.2,19,27],
   [-50,36.2,27,30.8]]
  .forEach(([x0,x1,z0,z1])=>{
    const g = new THREE.Mesh(new THREE.PlaneGeometry(x1-x0, z1-z0), M.ground);
    g.rotation.x=-Math.PI/2;
    g.position.set((x0+x1)/2, 0, (z0+z1)/2);
    g.receiveShadow = true;
    scene.add(g); occluders.push(g);
  });
  addPad(30,10, -10,21);                   // south plaza road
  addPad(8,20, -30,-14, .5);               // NW approach
  addPad(10,16, 14,6);                     // east yard
  addPad(12,6, 27,-1);                     // depot apron
  // perimeter rock rim keeps the arena closed
  addBox(1.4,7,60, -50.6,3.5,2, M.rock);
  addBox(1.4,7,60, 36.8,3.5,2, M.rock);
  addBox(90,7,1.4, -7,3.5,-27.6, M.rock);
  addBox(90,7,1.4, -7,3.5,31.4, M.rock);
  // far-west backdrop: airfield mega-structure skyline (outside the rim)
  addBox(18,13,22, -62,6.5,-12, M.uescGrey);
  addBox(14,9,16, -60,4.5,12, M.hull);
  addBox(12,6,10, -58,3,24, M.ctrl);
}

/* =================  B1 WEST ROOM (purple 1/2) — under the west quarters.
   Drop in through the floor hatch in the quarters' NW corner; the same
   shaft's ladder runs all the way B1 -> deck. ================= */
{
  addBox(8.4,.4,8, -30,-3.4,7, M.pad);                          // floor (top -3.2)
  addBox(.35,3,8, -34.02,-1.7,7, M.ctrl);                       // west wall (purple 1)
  addBox(.35,3,8, -25.98,-1.7,7, M.ctrl);                       // east wall
  addBox(8.4,3,.35, -30,-1.7,3.18, M.ctrl);                     // north wall (purple 2)
  addBox(8.4,3,.35, -30,-1.7,10.82, M.ctrl);                    // south wall
  // ceiling = the quarters' floor, minus the hatch shaft (x -34.2..-32.9, z 3.3..5)
  addBox(7.1,.4,8, -29.35,-.2,7, M.pad);
  addBox(1.3,.4,.3, -33.55,-.2,3.15, M.pad);
  addBox(1.3,.4,6, -33.55,-.2,8, M.pad);
  addBox(.3,.25,1.9, -34.05,.12,4.15, M.hazard);                // hatch rim
  addBox(.3,.25,1.9, -32.85,.12,4.15, M.hazard);
  addBox(1.5,.25,.3, -33.45,.12,5.1, M.hazard);
  addBox(2.4,2.4,2.4, -27.6,-2,9.4, M.contBlu);                 // stored cargo
  addBox(2,1.2,2, -27.8,-2.6,4.6, M.contOlv);
  addBox(5,.1,.3, -30,-.62,7, M.acid, {noCollide:true,noShadow:true});
  addFlood(-30,-1.4,7, .7, 14);
}

/* =================  WEST QUARTERS (ground story of the model's west building)
   Doors: west face + south face. Interior ladder in the NW shaft: B1 -> deck. */
{
  // north wall (purple zone button inside on it)
  addBox(8.4,3,.36, -30,1.5,3.18, M.ctrl);
  // west wall with the door (z 5.45..6.55)
  addBox(.38,3,2.1, -34.01,1.5,4.4, M.ctrl);
  addBox(.38,3,4.1, -34.01,1.5,8.6, M.ctrl);
  addBox(.38,.9,1.2, -34.01,2.55,6, M.ctrl);
  // south wall with the door (x -29.2..-28.2)
  addBox(5,3,.36, -31.7,1.5,10.82, M.ctrl);
  addBox(2.4,3,.36, -27,1.5,10.82, M.ctrl);
  addBox(1.1,.9,.36, -28.7,2.55,10.82, M.ctrl);
  // east wall (button inside on it)
  addBox(.38,3,8, -25.99,1.5,7, M.ctrl);
  // interior: locker + console flavor (clear of the east-wall button)
  addBox(2.2,1.1,1, -28.5,.55,4.2, M.uescDark);
  addBox(1,2.2,2.6, -26.9,1.1,5.6, M.genBlack);
  addFlood(-30,2.4,7, .7, 13);
  // the B1 -> deck ladder inside the NW hatch shaft
  addLadder(-33.35, 4.15, -3.15, LV.deck+.05, {x:-32.2, y:LV.deck+.05, z:4.15}, 'z');
  addBox(8.4,.16,.16, -30,3.35,10.95, M.acid, {noCollide:true,noShadow:true});
}

/* ----  Ground-level south walls: the covered alley (green buttons) + plaza edge  ---- */
{
  addBox(8.8,3,.18, -10,1.5,9, M.uescGrey);                     // alley north wall (green, S face)
  addBox(.18,3,4, -6,1.5,9, M.uescGrey);                        // alley east wall (green, W face)
  addBox(8.4,3,.18, -22,1.5,11, M.uescGrey);                    // south wall, west run
  addWallRot(-16,10, 4,3,.18, Math.PI/6, 0, M.uescGrey);        // angled joint (model piece)
  addBox(37.6,3,.18, -19,1.5,16, M.uescGrey);                   // long plaza boundary wall
  addBox(37.6,.16,.16, -19,3.1,16.12, M.acid, {noCollide:true,noShadow:true});
  addFlood(-10,2.6,10, .55, 12, 0xc8e82a);
}

/* =================  THE DECK (y3 slab over the open undercroft)  =================
   One big slab x -37.2..9.2 / z -6.4..14.4 minus the west hatch shaft.
   The ground floor below stays open — pillars hold it up. ================= */
{
  const T=.35, Y=LV.deck-T/2;                                    // slab top = y3
  addBox(42.1,T,20.8, -11.85,Y,4, M.uescGrey);                   // main field (x -32.9..9.2)
  addBox(4.3,T,9.7, -35.05,Y,-1.55, M.uescGrey);                 // west block, north of hatch
  addBox(4.3,T,9.4, -35.05,Y,9.7, M.uescGrey);                   // west block, south of hatch
  addBox(3,T,1.7, -35.7,Y,4.15, M.uescGrey);                     // sliver west of the hatch
  // undercroft pillars + lighting (open ground hall below the deck)
  [[-31,-3],[-20,-3],[-9,-3],[1,-3],[-31,6],[-20,6],[-9,6],[1,6],[-25,12],[-13,12],[-2,12],[6,12],[6,-1],[6,5]]
    .forEach(([x,z])=> addBox(.9,2.85,.9, x,1.43,z, M.uescDark));
  addFlood(-16,2.3,1, .6, 16); addFlood(0,2.3,8, .55, 14); addFlood(-30,2.3,0, .5, 13);
  const ember = new THREE.PointLight(0xff7733,.4,11); ember.position.set(-4,1.2,3); scene.add(ember);
  // cargo scattered in the undercroft
  addBox(2.4,2.4,5, 2.5,1.2,11.5, M.contBlu);
  addBox(2.2,2.2,2.2, -18,1.1,-1, M.contOlv);
  addBox(3,1.1,2, -28,.55,-2.5, M.rust, {ry:.4});
  // crate steps up to the deck at its SE corner (parkour route from the yard)
  addBox(2.2,1.2,2.2, 10.6,.6,13.2, M.contOlv);
  addBox(2.4,2.4,2.4, 8.4,1.2,13.6, M.contBlu);
}

/* ----  Deck perimeter: west parapet, angled NW corner, north wall with the
        walkway mouth, and the east wall fin (the ladder column)  ---- */
{
  addBox(.18,3,15.2, -36,4.5,7, M.ctrl);                        // west parapet (y3..6)
  addWallRot(-35,-2, 4,3,.18, Math.PI/3, LV.deck, M.ctrl);      // NW angled corner
  addBox(8.4,3,.25, -31,4.5,-4, M.ctrl);                        // north wall, west run
  addBox(18,3,.18, -12,4.5,-4, M.ctrl);                         // north wall, east run
  //   (the 5.8m gap x -26.8..-21 between the runs is the walkway mouth)
  addBox(.18,3,6.4, -4,4.5,-1, M.ctrl);                         // east fin, deck story
  addBox(.18,3,4, -4,7.5,-1, M.ctrl);                           // east fin, upper story (blue btns)
  addBox(.16,.16,6.4, -4,6.08,-1, M.acid, {noCollide:true,noShadow:true});
}

/* =================  DECK HALL (two stories on the deck, x -26..-4 / z 0.8..9.2)
   Story 1 (y3..6): north door, twin south doors, east-block door, store room.
   Story 2 (y6..9): same walls, east-block door to the hull bridge, overlook pod. */
{
  const S1=LV.deck, S2=LV.mid;
  // --- story 1 north wall (door x -23.8..-22.7) ---
  addBox(2.2,3,.38, -24.9,S1+1.5,.99, M.ctrl);
  addBox(18.7,3,.38, -13.35,S1+1.5,.99, M.ctrl);
  addBox(1.1,.9,.38, -23.25,S1+2.55,.99, M.ctrl);
  // --- story 1 south wall (twin doors x -13.3..-12.25 / -11.55..-10.45) ---
  addBox(12.7,3,.38, -19.65,S1+1.5,9.01, M.ctrl);
  addBox(.7,3,.38, -11.9,S1+1.5,9.01, M.ctrl);
  addBox(6.45,3,.38, -7.22,S1+1.5,9.01, M.ctrl);
  addBox(1.05,.9,.38, -12.77,S1+2.55,9.01, M.ctrl);
  addBox(1.1,.9,.38, -11,S1+2.55,9.01, M.ctrl);
  // --- west end block (solid, both stories) ---
  addBox(1,3,7.64, -25.5,S1+1.5,5, M.ctrl);
  addBox(1,3,7.64, -25.5,S2+1.5,5, M.ctrl);
  // --- east end block, story 1 (door z 4.45..5.55) + story 2 (door z 4.15..5.25) ---
  addBox(1,3,3.27, -4.5,S1+1.5,2.82, M.ctrl);
  addBox(1,3,3.27, -4.5,S1+1.5,7.18, M.ctrl);
  addBox(1,.9,1.1, -4.5,S1+2.55,5, M.ctrl);
  addBox(1,3,3.42, -4.5,S2+1.5,2.89, M.ctrl);
  addBox(1,3,3.57, -4.5,S2+1.5,7.41, M.ctrl);
  addBox(1,.9,1.1, -4.5,S2+2.55,4.7, M.ctrl);
  // --- story 2 north + south walls (south holds the pod doorway x -10.7..-9.6) ---
  addBox(22,3,.38, -15,S2+1.5,.99, M.ctrl);
  addBox(15.3,3,.38, -18.35,S2+1.5,9.01, M.ctrl);
  addBox(5.6,3,.38, -6.8,S2+1.5,9.01, M.ctrl);
  addBox(1.1,.9,.38, -10.15,S2+2.55,9.01, M.ctrl);
  // --- floors: story-2 floor + roof (y9 deck) ---
  addBox(20,.35,7.6, -15,S2-.18,5, M.uescGrey);
  addBox(20,.35,7.6, -15,LV.roof-.18,5, M.uescGrey);
  // --- store room, story 1 (door west face z 4.7..5.75) — red button on it ---
  addBox(.2,3,.55, -21.9,S1+1.5,4.45, M.ctrl);
  addBox(.2,3,2.1, -21.9,S1+1.5,6.93, M.ctrl);
  addBox(.2,.9,1.05, -21.9,S1+2.55,5.22, M.ctrl);
  addBox(4,3,.2, -20,S1+1.5,4.1, M.ctrl);
  addBox(4,3,.2, -20,S1+1.5,7.9, M.ctrl);
  addBox(.2,3,3.6, -18.1,S1+1.5,6, M.ctrl);
  addBox(4.2,.25,4.1, -20,S2-.13,6, M.uescGrey);
  addBox(2.6,1.3,1.2, -19.6,S1+.65,6.2, M.genBlack);
  // --- store room, story 2 (model puts it a bay west; fill-in door east face) ---
  addBox(.2,3,3.8, -24.9,S2+1.5,6, M.ctrl);
  addBox(4,3,.2, -23,S2+1.5,4.1, M.ctrl);
  addBox(4,3,.2, -23,S2+1.5,7.9, M.ctrl);
  addBox(.2,3,.55, -21.1,S2+1.5,4.45, M.ctrl);
  addBox(.2,3,2.1, -21.1,S2+1.5,6.93, M.ctrl);
  addBox(.2,.9,1.05, -21.1,S2+2.55,5.22, M.ctrl);
  addBox(4.2,.25,4.1, -23,LV.roof-.13,6, M.uescGrey);
  addBox(1,2.2,2.4, -24,S2+1.1,6.6, M.genBlack);
  // interior lamps
  const lampMat = new THREE.MeshStandardMaterial({color:0xdde8ff, emissive:0xaac8ff, emissiveIntensity:1.2});
  [[-9,S1+2.8,5],[-16,S1+2.8,2.5],[-9,S2+2.8,5],[-17,S2+2.8,6]].forEach(([x,y,z])=>{
    addBox(1.8,.1,1.8, x,y,z, lampMat, {noCollide:true,noShadow:true});
    addFlood(x,y-.4,z, .65, 14);
  });
  // ladder up the east fin to the hall roof (the model's ladder column) —
  // north of the hall block so the climb corridor is clear
  addLadder(-4.62, 0.3, LV.deck+.05, LV.roof+.05, {x:-5.8, y:LV.roof+.05, z:1.7}, 'z');
}

/* ----  Walkway booth (x -26.8..-25.2 / z -9..-5, on the deck) — purple pair
        on its outer faces; door on the south face.  ---- */
{
  addBox(1.6,3,.18, -26,4.5,-8.91, M.ctrl);
  addBox(.14,3,3.64, -26.77,4.5,-7, M.ctrl);
  addBox(.14,3,3.64, -25.23,4.5,-7, M.ctrl);
  addBox(.3,3,.18, -26.65,4.5,-5.09, M.ctrl);
  addBox(.3,3,.18, -25.35,4.5,-5.09, M.ctrl);
  addBox(1,.9,.18, -26,LV.deck+2.55,-5.09, M.ctrl);
  addBox(1.75,.25,4.1, -26,LV.mid-.13,-7, M.uescGrey);
  addBox(1.9,.35,2.9, -26,LV.deck-.18,-7.05, M.uescGrey);       // floor under the booth
  addBox(1,2.85,1, -26,1.43,-7.8, M.uescDark);                  // support strut
  addFlood(-26,5.2,-7, .4, 8);
}

/* ----  North walkway (y3, x -25.8..-20.2, runs z -4 -> -20) + end stairs,
        struts, rails, the crate, and the angled sign panel (green button) ---- */
{
  addBox(5.6,.35,16, -23,LV.deck-.18,-12, M.hull);              // span
  addBox(.15,.5,16, -25.72,LV.deck+.25,-12, M.uescDark, {noCollide:true});
  addBox(.15,.5,16, -20.28,LV.deck+.25,-12, M.uescDark, {noCollide:true});
  [-6.5,-11,-15.5,-19.5].forEach(z=> addBox(1,3,1, -23,1.5,z, M.uescDark));
  addBox(2.4,1,4, -24,LV.deck+.5,-12, M.contBlu);               // the model's walkway crate
  // stairs down to the north ground at the walkway's end
  for(let i=0;i<7;i++) addBox(5.6,.42,.62, -23, 2.68-i*.42, -20.3-i*.66, M.uescGrey);
  // angled sign panel at the end (model piece, yaw -30) + legs
  addWallRot(-21,-19, 5.2,3,.18, -Math.PI/6, LV.deck, M.ortn);
  addBox(.5,3,.5, -22.9,1.5,-17.9, M.uescDark);
  addBox(.5,3,.5, -19.2,1.5,-20, M.uescDark);
  addBox(5,.16,.16, -21,6.12,-19, M.acid, {noCollide:true,noShadow:true, ry:-Math.PI/6});
  addFlood(-23,4.4,-14, .55, 13);
}

/* =================  THE TILTED HULL CORRIDOR (the crashed wing body)  =================
   Two stories of a 4m-wide corridor leaning 15 deg east-of-north, centered
   at (4, z4). Doors punch the west wall on both stories; an interior ladder
   (through a blown-open hatch in the mid floor) links them; an exterior
   ladder near the north tip reaches the walkable roof. ================= */
const HULLC = { cx:4, cz:4, yaw:-Math.PI/12, len:16.38, lat:1.9 };
{
  const {cx,cz,yaw,len,lat} = HULLC;
  const dx=Math.sin(yaw), dz=Math.cos(yaw);                     // corridor axis (north = -t)
  const lx=Math.cos(yaw), lzn=-Math.sin(yaw);                   // lateral (east side = +s)
  const P = (t,s)=> [cx+dx*t+lx*s, cz+dz*t+lzn*s];
  const wallRun = (t0,t1,s, y0,h)=>{                            // wall piece from t0..t1 at lateral s
    const tm=(t0+t1)/2, L=Math.abs(t1-t0), [x,z]=P(tm,s);
    addWallRot(x,z, L,h,.2, yaw, y0, M.hull);
  };
  // --- story 1 west wall, door at t -4.2..-3.1 (the model's doorway) ---
  wallRun(-len/2,-4.2, -lat, LV.deck, 3);
  wallRun(-3.1, len/2, -lat, LV.deck, 3);
  { const [x,z]=P(-3.65,-lat); addBox(.2,.9,1.15, x,LV.deck+2.55,z, M.hull, {ry:yaw}); }
  // --- story 1 east wall (solid) ---
  wallRun(-len/2, len/2, lat, LV.deck, 3);
  // --- story 2 west wall, door at t 1.6..2.7 (lands on the y6 bridge) ---
  wallRun(-8.0,1.6, -lat, LV.mid, 3);
  wallRun(2.7,8.0, -lat, LV.mid, 3);
  { const [x,z]=P(2.15,-lat); addBox(.2,.9,1.15, x,LV.mid+2.55,z, M.hull, {ry:yaw}); }
  // --- story 2 east wall ---
  wallRun(-8.0,8.0, lat, LV.mid, 3);
  // --- end caps (thick hull bulkheads) ---
  { const [x,z]=P(-8.6,0); addWallRot(x,z, 4,6,.8, yaw+Math.PI/2, LV.deck, M.hull); }
  { const [x,z]=P( 8.6,0); addWallRot(x,z, 4,6,.8, yaw+Math.PI/2, LV.deck, M.hull); }
  // --- mid floor (story-2 floor) with the blown-open hatch at t -5.2..-3.3 ---
  const slab = (t0,t1,y)=>{
    const tm=(t0+t1)/2, L=t1-t0, [x,z]=P(tm,0);
    const segs=Math.max(1,Math.round(L/1.5)), sl=L/segs;
    for(let i=0;i<segs;i++){
      const tt=t0+sl*(i+.5), [sx,sz]=P(tt,0);
      addBox(3.64,.25,sl*1.06, sx,y,sz, M.uescGrey, {ry:yaw});
    }
  };
  slab(-len/2,-5.2, LV.mid-.13);
  slab(-3.3, len/2, LV.mid-.13);
  { const [x,z]=P(-5.2,0); addBox(3.6,.1,.14, x,LV.mid+.02,z, M.hazard, {noCollide:true,noShadow:true, ry:yaw}); }
  { const [x,z]=P(-3.3,0); addBox(3.6,.1,.14, x,LV.mid+.02,z, M.hazard, {noCollide:true,noShadow:true, ry:yaw}); }
  // --- roof (walkable y9 deck of the wing) ---
  slab(-len/2, len/2, LV.roof-.13);
  // acid roofline + red beacon up top
  { const [x,z]=P(0,lat+.1); addBox(.16,.16,len, x,LV.roof+.06,z, M.acid, {noCollide:true,noShadow:true, ry:yaw}); }
  { const [x,z]=P(-7.8,0);
    addBox(.9,.16,.16, x,LV.roof+2.2,z, M.redGlow, {noCollide:true,noShadow:true});
    addBox(.16,2.2,.16, x,LV.roof+1.1,z, M.uescDark, {noCollide:true});
    const l = new THREE.PointLight(0xff2331,.8,22); l.position.set(x,LV.roof+2.4,z); scene.add(l); }
  // --- interior ladder story1 -> story2 (under the hatch) ---
  { const [x,z]=P(-4.25,1.3), [ex,ez]=P(-2.6,.8);
    addLadder(x, z, LV.deck+.05, LV.mid+.1, {x:ex, y:LV.mid+.1, z:ez}, 'z'); }
  // --- exterior ladder to the roof, west face near the north tip ---
  { const [x,z]=P(-6.5,-lat-.35), [lx2,lz2]=P(-6.5,-.6);
    addLadder(x, z, LV.deck+.05, LV.roof+.1, {x:lx2, y:LV.roof+.1, z:lz2}, 'z'); }
  // interior lights both stories
  { const [x,z]=P(2,0);  addFlood(x,LV.deck+2.5,z, .55, 12); }
  { const [x,z]=P(-3,0); addFlood(x,LV.mid+2.5,z, .55, 12); }
  // white decal band on the outer east face
  { const [x,z]=P(1,lat+.14); addBox(.05,1.4,9, x,LV.mid+1.2,z, M.ctrl, {noCollide:true,noShadow:true, ry:yaw}); }
}

/* ----  y6 bridge between the hall's upper door and the corridor's upper door ---- */
{
  addBox(8,.25,3.2, 0,LV.mid-.13,5, M.uescGrey);
  addBox(.15,.45,3.2, -3.9,LV.mid+.22,5, M.uescDark, {noCollide:true});
  addBox(8,.45,.15, 0,LV.mid+.22,3.48, M.uescDark, {noCollide:true});
  addBox(8,.45,.15, 0,LV.mid+.22,6.52, M.uescDark, {noCollide:true});
}

/* ----  Overlook pod (y6..9, x -12..-8 / z 8.6..13.4) — cantilevered south
        over the alley; doorway aligned with the hall's south wall cut.  ---- */
{
  addBox(1,3,.23, -11.5,LV.mid+1.5,8.75, M.hull);
  addBox(1.6,3,.23, -8.8,LV.mid+1.5,8.75, M.hull);
  addBox(1.1,.9,.23, -10.15,LV.mid+2.55,8.75, M.hull);
  addBox(4,3,.23, -10,LV.mid+1.5,13.48, M.hull);
  addBox(.18,3,4.74, -11.91,LV.mid+1.5,11.06, M.hull);
  addBox(.18,3,4.74, -8.09,LV.mid+1.5,11.06, M.hull);
  addBox(4,.3,4.9, -10,LV.mid-.15,11.05, M.hull);               // pod floor (over the void)
  addBox(3.64,.25,4.73, -10,LV.roof-.13,11.05, M.uescGrey);     // pod roof (tip-ladder base)
  addBox(.9,1.1,.9, -10.8,LV.mid+.55,12.2, M.genBlack);
  addFlood(-10,LV.mid+2.5,11, .45, 9);
  // ladder pod roof -> tip platform (gated by the barrier until the grid clears)
  addLadder(-8.5, 9.05, LV.roof+.05, LV.tip+.1, {x:-8.5, y:LV.tip+.1, z:10.6}, 'x');
}

/* =================  THE WING TIP (y12 platform + walled tip room = FINISH)  ================= */
{
  // platform slabs (the model's two plates) on hull legs
  addBox(8,.35,13.6, -11,LV.tip-.18,16, M.hull);
  addBox(8,.35,8.4, -11,LV.tip-.18,27.2, M.hull);
  [[-14.4,16],[-7.6,16],[-14.4,25],[-7.6,25],[-14.4,30.6],[-7.6,30.6]]
    .forEach(([x,z])=> addBox(1.1,11.85,1.1, x,5.92,z, M.uescDark));
  // the under-platform wall (y9..12) carrying the blue through-pair
  addBox(4,3,.2, -11,10.5,20, M.hull);
  // tip room walls (y12..15): west full, north with MY doorway, east short
  addBox(.2,3,8.8, -15,13.5,27, M.hull);                        // west wall (green outside)
  addBox(3.1,3,.2, -13.25,13.5,23, M.hull);                     // north wall, west of door
  addBox(3.2,3,.2, -8.8,13.5,23, M.hull);                       // north wall, east of door
  addBox(1.3,.8,.2, -11.05,14.6,23, M.hull);                    // lintel (door x -11.7..-10.4)
  addBox(.2,3,6.8, -7,13.5,26, M.hull);                         // east wall (blue outside)
  addBox(8,.9,.2, -11,12.45,31.1, M.hull);                      // south parapet (open sky above)
  addBox(.16,.16,8.8, -15.14,15.06,27, M.acid, {noCollide:true,noShadow:true});
  addBox(3.6,.16,.16, -13,15.06,23, M.acid, {noCollide:true,noShadow:true});
  // beacon + interior glow
  addBox(.9,.16,.16, -11,15.6,29, M.redGlow, {noCollide:true,noShadow:true});
  addBox(.16,.6,.16, -11,15.3,29, M.uescDark, {noCollide:true});
  const tl = new THREE.PointLight(0xff2331,.8,20); tl.position.set(-11,15.7,29); scene.add(tl);
  addFlood(-11,14.6,27, .6, 12, 0xc8e82a);
  // mangled wing canopy above the tip (visual wreckage, high over sightlines)
  addBox(5.5,.4,4, -9.5,16.8,28.5, M.wreckAcid, {ry:.35, noCollide:true});
  addBox(4.5,.35,3.5, -13,16.2,25, M.hull, {ry:-.3, noCollide:true});
}

// ---- Barriers + indicator lamps: red field across the platform's north
// edge, another in the tip-room doorway; both drop when the grid clears. ----
let barrier, barrier2;
let barrierLamps=[];
{
  const barrierMat = new THREE.MeshBasicMaterial({color:0xff2222, transparent:true, opacity:.35, side:THREE.DoubleSide});
  barrier = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 3.4), barrierMat);
  barrier.position.set(-11, LV.tip+1.6, 10.4);
  scene.add(barrier);
  addBox(.4,3.8,.4, -15,LV.tip+1.75,10.4, M.uescDark);
  addBox(.4,3.8,.4, -7,LV.tip+1.75,10.4, M.uescDark);
  addBox(8.4,.35,.35, -11,LV.tip+3.75,10.4, M.uescDark, {noCollide:true});
  barrier2 = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 2.2), barrierMat);
  barrier2.position.set(-11.05, LV.tip+1.1, 23);
  scene.add(barrier2);
}
// Rebuild the row of barrier indicator lamps over the tip-room door (visible
// from the roofs and the deck) to match the run's target count.
function buildBarrierLamps(n){
  barrierLamps.forEach(l=>scene.remove(l));
  barrierLamps = [];
  const span = 6, x0 = -14;
  for(let i=0;i<n;i++){
    const lm = new THREE.Mesh(new THREE.SphereGeometry(.26,10,10),
      new THREE.MeshBasicMaterial({color:0xff2a2a}));
    lm.position.set(x0 + (n>1? i*span/(n-1) : span/2), 14.55, 22.82);
    scene.add(lm); barrierLamps.push(lm);
  }
}

/* =================  B1 PLAZA ROOMS (green 2/3) — under the south plaza.
   Open stairwell on the east side + a grated drop hatch to the west. ================= */
{
  addBox(14,.4,8, -25,-3.4,23, M.pad);                          // floor (top -3.2)
  addBox(.35,3,8, -31.82,-1.7,23, M.ctrl);                      // west wall
  addBox(.35,3,8, -18.18,-1.7,23, M.ctrl);                      // east wall
  addBox(14,3,.35, -25,-1.7,19.18, M.ctrl);                     // north wall (green 2 vent)
  addBox(14,3,.35, -25,-1.7,26.82, M.ctrl);                     // south wall
  addBox(1.2,3,1.2, -25,-1.7,23, M.uescDark);                   // center pillar (green 3)
  // wall-vent housing on the north wall — the button sits inside the frame
  addBox(1.8,.2,.6, -28.5,-1.15,19.6, M.genBlack);
  addBox(1.8,.2,.6, -28.5,-2.75,19.6, M.genBlack);
  addBox(.2,1.8,.6, -29.4,-1.95,19.6, M.genBlack);
  addBox(.2,1.8,.6, -27.6,-1.95,19.6, M.genBlack);
  // ceiling minus the stairwell run (x -24.9..-18.2, z 20.8..25.2) and the
  // drop hatch (x -30.4..-28.6, z 24..26)
  addBox(1.6,.4,8, -31.2,-.2,23, M.pad);
  addBox(1.8,.4,5, -29.5,-.2,21.5, M.pad);
  addBox(1.8,.4,1, -29.5,-.2,26.5, M.pad);
  addBox(3.7,.4,8, -26.75,-.2,23, M.pad);
  addBox(6.7,.4,1.8, -21.55,-.2,19.9, M.pad);
  addBox(6.7,.4,1.8, -21.55,-.2,26.1, M.pad);
  addBox(.2,.4,8, -18.1,-.2,23, M.pad);
  for(let i=0;i<8;i++) addBox(.62,.42,4.2, -18.51-i*.62, -.21-i*.42, 23, M.uescGrey);
  // hatch rim + grate bars over the drop hole
  addBox(.3,.25,2.2, -30.55,.12,25, M.hazard); addBox(.3,.25,2.2, -28.45,.12,25, M.hazard);
  for(let i=0;i<4;i++) addBox(2.1,.05,.08, -29.5,-.05,24.3+i*.5, M.uescDark, {noCollide:true,noShadow:true});
  addBox(2.2,2.2,2.2, -27,-2.1,25.6, M.contBlu);
  addBox(5,.1,.3, -25,-.62,23, M.acid, {noCollide:true,noShadow:true});
  addFlood(-25,-1.4,23, .75, 16);
  addFlood(-29.5,-1.8,25, .4, 8, 0xc8e82a);
}

/* ----  South plaza props: kiosk pair, key-card spawn, scattered cover  ---- */
{
  [[-8.4,0],[-6.2,1]].forEach(([x,i])=>{
    addBox(1.8,3,1.2, x,1.5,20.6, M.vend);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.3,2.1),
      new THREE.MeshBasicMaterial({color:i?0x66ccff:0xffaa33}));
    s.position.set(x,1.55,19.98); s.rotation.y=Math.PI; scene.add(s);
  });
  addFlood(-7.3,3.6,19.5, .6, 12);
  addBox(.9,1.1,.9, -16,.55,18, M.uescDark);                    // red key card spawn
  addBox(.06,.5,.34, -16,1.35,18, M.redGlow, {noCollide:true,noShadow:true});
  const kl = new THREE.PointLight(0xff2331,.5,8); kl.position.set(-16,1.5,18); scene.add(kl);
  addBox(2.4,2.4,6, -36,1.2,22, M.contOlv);
  addBox(2.2,2.2,2.2, -34,1.1,27, M.contRed);
  addBox(2,2,2, 2,1,24, M.contBlu);
  // the model's two ground crates by the south face
  addBox(4.7,1,1, -11,.5,12, M.contBlu);
  addBox(1.3,1,2.9, -24,.5,12, M.contBlu);
}

/* =================  EAST ANNEX (the red zone)  ================= */
/* ----  Sealed hut: the model's floating story grounded on a base; the
        upper story is sealed — its button faces the deck.  ---- */
{
  addBox(4,3,.35, 16,1.5,-6.83, M.uescWhite);                   // ground story
  addBox(4,3,.35, 16,1.5,-3.17, M.uescWhite);
  addBox(.35,3,3.3, 14.17,1.5,-5, M.uescWhite);
  addBox(.35,3,1.1, 17.83,1.5,-6.3, M.uescWhite);               // east door z -5.75..-4.25
  addBox(.35,3,1.1, 17.83,1.5,-3.7, M.uescWhite);
  addBox(.35,.9,1.5, 17.83,2.55,-5, M.uescWhite);
  addBox(1.3,2.1,.14, 16.4,1.05,-5, M.uescDark, {noCollide:true});  // inner sealed door
  addBox(4,3,.18, 16,4.5,-6.91, M.ctrl);                        // the model's story (y3..6)
  addBox(4,3,.18, 16,4.5,-3.09, M.ctrl);
  addBox(.18,3,3.64, 14.09,4.5,-5, M.ctrl);                     // west face (red button outside)
  addBox(.18,3,3.64, 17.91,4.5,-5, M.ctrl);
  addBox(4.2,.3,4.1, 16,5.95,-5, M.uescGrey);
  addBox(.25,2.6,.25, 17.3,7.3,-6, M.uescDark);
  addBox(2.6,.14,.14, 16.4,8.5,-6, M.redGlow, {noCollide:true,noShadow:true});
  const rl = new THREE.PointLight(0xff2331,.8,18); rl.position.set(16.4,8.6,-6); scene.add(rl);
  addBox(.25,2.8,.25, 13.6,1.5,-7.3, M.hazard, {noCollide:true,noShadow:true}); // SEAL tape posts
  addBox(.25,2.8,.25, 13.6,1.5,-2.7, M.hazard, {noCollide:true,noShadow:true});
}

/* ----  Crashed hull fin (the model's 45-deg floating panel, grounded)  ---- */
{
  addWallRot(16,-13, 10.4,3,.2, -Math.PI/4, LV.deck, M.hull);   // the model's panel (y3..6)
  addWallRot(16,-13, 8.6,3,.2, -Math.PI/4, 0, M.hull);          // buried run beneath it
  addBox(3,1.2,2, 12.6,.6,-10.4, M.rust, {ry:.5});              // debris at the base
  addBox(2.4,1,2.6, 19.6,.5,-15.8, M.rust, {ry:-.3});
  addBox(.16,.16,10.2, 16,6.08,-13, M.acid, {noCollide:true,noShadow:true, ry:-Math.PI/4});
  addFlood(14,3.8,-11, .5, 13);
}

/* ----  Depot (guide fill: interior staircase, medical section, red set)  ---- */
const DEPOT = {x0:20, x1:34, z0:2, z1:14};
{
  addBox(5,4.2,.5, 23,2.1,2.25, M.ctrl);                        // north wall, west of door
  addBox(6,4.2,.5, 31,2.1,2.25, M.ctrl);                        // north wall (red 6 outside)
  addBox(1.5,1.2,.5, 26.75,3.6,2.25, M.ctrl);                   // door head x 26..27.5
  addBox(14,4.2,.5, 27,2.1,13.75, M.ctrl);                      // south wall (medical inside)
  addBox(.5,4.2,2.6, 20.25,2.1,3.55, M.ctrl);                   // west wall, door z 5..8
  addBox(.5,4.2,5.6, 20.25,2.1,11.05, M.ctrl);
  addBox(.5,1.2,3, 20.25,3.6,6.5, M.ctrl);
  addBox(.5,4.2,11.5, 33.75,2.1,8, M.ctrl);                     // east wall
  addBox(14,.45,12, 27,4.4,8, M.uescGrey);                      // flat roof
  addBox(14,.18,.18, 27,4.75,13.86, M.acid, {noCollide:true,noShadow:true});
  // interior staircase to the loft — the red button hides underneath
  for(let i=0;i<7;i++) addBox(2.4,.36,.62, 22.2, .18+i*.36, 11.5-i*.72, M.uescGrey);
  addBox(2.8,.3,3.6, 22.2,2.62,5.6, M.uescGrey);
  addBox(.3,2.5,.3, 22.2,1.25,3.9, M.uescDark);
  addBox(.25,2.2,3.4, 23.5,1.1,9.6, M.uescDark);
  // medical section along the south wall
  addBox(2.6,1.9,.9, 26,.95,12.9, M.uescWhite);
  addBox(2.6,1.9,.9, 31.5,.95,12.9, M.uescWhite);
  addBox(.8,.8,.12, 28.6,2.9,13.44, M.ortn, {noCollide:true,noShadow:true});
  addBox(.5,.14,.1, 28.6,2.9,13.36, M.uescWhite, {noCollide:true,noShadow:true});
  addBox(.14,.5,.1, 28.6,2.9,13.36, M.uescWhite, {noCollide:true,noShadow:true});
  addBox(1,2.2,4, 32.8,1.1,8, M.genBlack);
  addFlood(27,3.6,8, .7, 18);
  addBox(2.2,1.2,2.2, 17.6,.6,11.8, M.contOlv);                 // crate steps -> depot roof
  addBox(2.4,2.4,2.4, 18.6,1.2,9.6, M.contOlv);
  addBox(2.4,1.4,2.4, 19.4,3.1,7.2, M.contBlu);
  addBox(.3,5,.3, 17,2.5,2.5, M.uescDark);                      // apron flood pole
  addFlood(17,5.2,2.5, .9, 20);
}
// Truck parked on the depot apron (04-assets places the model here),
// west of the north-wall button so it never blocks the shot
const truckPos = {x:23, z:-1.8};
colliders.push(new THREE.Box3(
  new THREE.Vector3(truckPos.x-1.7, 0, truckPos.z-3.2),
  new THREE.Vector3(truckPos.x+1.7, 2.6, truckPos.z+3.2)));

/* ----  Far east: dorm block, red crate, east gate wall  ---- */
{
  addBox(8,5,5, 30,2.5,-6.5, M.ctrl);                           // dorm block (red, east wall high)
  addBox(8,.18,.18, 30,5.1,-3.88, M.acid, {noCollide:true,noShadow:true});
  addBox(1.8,1.8,1.8, 31,.9,-2.2, M.contRed);                   // red crate
  addBox(1.4,5.2,14, 35.4,2.6,6, M.uescGrey);                   // east gate wall
  addBox(.4,5.8,.4, 35.4,2.9,-.8, M.hazard);
  addBox(.4,5.8,.4, 35.4,2.9,12.8, M.hazard);
  addBox(1.4,.2,.2, 35.4,5.3,6, M.acid, {noCollide:true,noShadow:true});
  addFlood(31,4.6,0, .7, 18);
  addBox(2.6,2.2,2.2, 25,1.1,-14, M.contOlv);
  addBox(2,1.9,4.6, 30,.95,17.5, M.uescWhite, {ry:.12});        // parked ORTN van (south pass)
  addBox(2.06,.5,4.66, 30,.6,17.5, M.ortn, {noCollide:true,noShadow:true, ry:.12});
}

/* ----  Roof-level debris cubes (the model's seven blue chunks — several
        carry buttons on their faces)  ---- */
{
  [[-9,3],[-15,3],[-23,3],[-25,8]].forEach(([x,z])=> addBox(1,1,1, x,LV.roof+.5,z, M.contBlu));
  const {cx,cz,yaw} = HULLC;
  [[5,3],[5,1],[4,-1]].forEach(([x,z])=> addBox(1,1,1, x,LV.roof+.5,z, M.contBlu, {ry:yaw}));
}

// ---- Scatter cover on the open ground ----
[[-42,6,2.2],[-40,-12,2],[6,-14,2.2],[-14,-22,2],[28,20,2.4],[8,28,2]].forEach(([x,z,s])=>{
  addBox(s,s*.8,s, x, s*.4, z, M.uescDark, {ry:x*.2});
});
