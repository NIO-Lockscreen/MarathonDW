'use strict';
/* =====================  LAYOUT  =====================
   Outpost / Orientation quadrant, rebuilt to the community button-spawn
   guide map (world axes: +x = east, -z = north — the TAB map is north-up):

        NW mega-structure   |  north road -> tip     |   SEA
        west huts + B1 rooms|  ORIENTATION (2 floors)|   sealed hut / bridge
        plaza B1 rooms      |  south plaza           |   DEPOT   far-east blocks
        SW yard             |  DESTROYED WING        |   SE yard

   Four button heights: B1 basement (-4.2), ground (0), Orientation 2F (+4.2),
   Destroyed Wing upper walls / top deck (+8.4..+10).
   Everything solid goes through addBox() so it collides + occludes. */

// Build a climbable ladder: visual rails + rungs (non-colliding) plus a climb
// volume pushed into `ladders`. `land` is the roof point the climber steps onto.
function addLadder(cx, cz, base, top, land){
  addBox(.12, top-base, .12, cx-.55, (base+top)/2, cz, M.uescDark, {noCollide:true});
  addBox(.12, top-base, .12, cx+.55, (base+top)/2, cz, M.uescDark, {noCollide:true});
  const n = Math.floor((top-base)/0.45);
  for(let i=0;i<=n;i++) addBox(1.2,.09,.09, cx, base+i*0.45, cz, M.uescDark, {noCollide:true});
  ladders.push({ x0:cx-.9, x1:cx+.9, z0:cz-1.1, z1:cz+1.1, base, top:top+.1, land });
}
// Ground-level road/pad strip (visual only)
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
const OR   = { x0:-32, x1:10, z0:-18, z1:2, f2:4.2, roofY:8.4 };     // Orientation
const WING = { x0:-28, x1:8, z0:12, z1:34, mezzY:4.2, deckY:8.4,     // Destroyed Wing
  // barrier gates (movement clamps while buttons remain): the top of the deck
  // stairs, and the north door where the roof walkway lands
  gates:[ {x0:-28.6, x1:-23.2, z0:25.4, z1:27.2, push:25.4, y:7},
          {x0:-20.5, x1: -3.5, z0:18.4, z1:20,   push:18.4, y:7} ],
  finishY: 7.2,                                    // top-deck interior = clock stop, but only
  finish:[ {x0:-28.5, x1:-23.5, z0:27.2, z1:34},   // PAST the gate line (west strip)…
           {x0:-23.5, x1:7,     z0:20,   z1:34} ]};// …or on the main deck
// Below-ground rooms (B1). groundHeightAt() treats these as the base floor.
const PITS = [
  {x0:-61, x1:-47, z0:-29, z1:-15, floor:-4.2, name:'WEST ROOMS'},
  {x0:-35, x1:-15, z0: -1, z1: 11, floor:-4.2, name:'PLAZA ROOMS'},
];
const SEA  = {x0:16, x1:85, z0:-85, z1:-14};
const DEPOT= {x0:18, x1:38, z0:2, z1:17};

// ---- Ground (quads leaving holes for the two B1 rooms and the sea) ----
{
  [[-80, 16,-85,-29],
   [-80,-61,-29,-15],[-47, 16,-29,-15],
   [-80, 16,-15,-14],
   [-80, 85,-14, -1],
   [-80,-35, -1, 11],[-15, 85, -1, 11],
   [-80, 85, 11, 40]]
  .forEach(([x0,x1,z0,z1])=>{
    const g = new THREE.Mesh(new THREE.PlaneGeometry(x1-x0, z1-z0), M.ground);
    g.rotation.x=-Math.PI/2;
    g.position.set((x0+x1)/2, 0, (z0+z1)/2);
    g.receiveShadow = true;
    scene.add(g); occluders.push(g);
  });
  // the sea (northeast) + shoreline rocks so nobody walks off the map
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(SEA.x1-SEA.x0, SEA.z1-SEA.z0), M.water);
  sea.rotation.x=-Math.PI/2; sea.position.set((SEA.x0+SEA.x1)/2, -.8, (SEA.z0+SEA.z1)/2);
  scene.add(sea); occluders.push(sea);
  [[15.5,-70,2.6],[15,-61,3.6],[15.8,-52,2.9],[15.2,-43,4.1],[15.6,-34,3.1],[15,-25,2.7],[15.5,-17,3.9]]
    .forEach(([x,z,h])=> addBox(4,h,7.5, x,h/2,z, M.rock, {ry:x*.3}));
  [[20,-14,3],[29,-13.6,2.6],[38,-14.2,3.4],[47,-13.8,2.8],[56,-14,3.2],[65,-13.7,2.7],[74,-14.2,3.6]]
    .forEach(([x,z,h])=> addBox(7,h,3.5, x,h/2,z, M.rock, {ry:z*.2}));
}

// ---- Roads (visual pads; the plaza pads skirt the B1 stair opening) ----
{
  addPad(11,8, -28.5,6);  addPad(29,8, .5,6);          // south plaza (around stair hole x -22..-15)
  addPad(7,2.2, -18.5,8.9); addPad(7,.6, -18.5,2.3);
  addPad(8,22, -42,3);                                  // southwest approach
  addPad(8,26, -31,-12, -.55);                          // junction diagonal (SW -> NW corner)
  addPad(7,24, -23,-34, -.06);                          // north road, lower leg
  addPad(16,20, 12,20);                                 // southeast yard road
  addPad(40,8, 30,3);                                   // east bridge road -> depot
  addPad(22,8, 61,7);                                   // far-east pass
}
{ // north road, upper leg runs at an angle toward the tip
  const p = new THREE.Mesh(new THREE.PlaneGeometry(7,36), M.pad);
  p.rotation.x=-Math.PI/2; p.rotation.z = -Math.atan2(27,-22);
  p.position.set(-8.5,.032,-57); p.receiveShadow=true; scene.add(p); occluders.push(p);
}

/* =================  B1 — UNDERGROUND ROOMS (purple 1/2, green 2/3)  ================= */
{
  // --- West rooms (under the huts west of the map) ---
  addBox(14,.4,14, -54,-4.4,-22, M.pad);                       // floor (top -4.2)
  addBox(.6,4.2,14, -61,-2.1,-22, M.ctrl);                     // west wall (purple 1)
  addBox(.6,4.2,14, -47,-2.1,-22, M.ctrl);                     // east wall
  addBox(14.6,4.2,.6, -54,-2.1,-29, M.ctrl);                   // north wall (purple 2)
  addBox(14.6,4.2,.6, -54,-2.1,-15, M.ctrl);                   // south wall
  // ceiling: minus the east stair hole AND the drop-down hatch by the hangars
  addBox(7,.4,6, -57.5,-.2,-26, M.pad);
  addBox(7,.4,3, -57.5,-.2,-16.5, M.pad);
  addBox(2,.4,5, -60,-.2,-20.5, M.pad);
  addBox(2.4,.4,5, -55.2,-.2,-20.5, M.pad);
  addBox(.3,.25,5, -59.15,.12,-20.5, M.hazard);                // hatch rim (drop-down entry)
  addBox(.3,.25,5, -56.25,.12,-20.5, M.hazard);
  addBox(2.6,.25,.3, -57.7,.12,-23.15, M.hazard);
  addBox(2.6,.25,.3, -57.7,.12,-17.85, M.hazard);
  addBox(7,.4,5, -50.5,-.2,-26.5, M.pad);
  addBox(7,.4,4, -50.5,-.2,-17, M.pad);
  addFlood(-57.7,-1.5,-20.5, .5, 10);
  for(let i=0;i<10;i++) addBox(.62,.42,4.6, -47.9-i*.62, -.21-i*.42, -21.5, M.uescGrey);
  addBox(2.4,2.4,2.4, -58.5,-3,-26.5, M.contBlu);              // stored cargo
  addBox(2.4,1.2,2.4, -58.5,-1.2,-26.5, M.contOlv);
  addBox(2,2,2, -58.8,-3.2,-18, M.contRed);
  addBox(6,.1,.3, -54,-.62,-22, M.acid, {noCollide:true,noShadow:true}); // ceiling light strip
  addFlood(-54,-1.4,-22, .8, 18);
  addFlood(-49,-1.6,-20, .5, 12, 0xc8e82a);

  // stair hut on the surface (door faces the west road)
  addBox(8,3,.6, -50.5,1.5,-25, M.ctrl);
  addBox(8,3,.6, -50.5,1.5,-18, M.ctrl);
  addBox(.6,3,7.6, -54.5,1.5,-21.5, M.ctrl);
  addBox(.6,3,2.5, -46.5,1.5,-23.75, M.ctrl);
  addBox(.6,3,2.5, -46.5,1.5,-19.25, M.ctrl);
  addBox(8.6,.4,7.6, -50.5,3.2,-21.5, M.uescGrey);
  addBox(8,.16,.16, -50.5,3.45,-18.05, M.acid, {noCollide:true,noShadow:true});
  // the two airfield hangars flanking the drop-down hatch (purple zone);
  // 2m gaps on both sides of the hatch keep the drop approach open
  addBox(7,4.2,5, -60,2.1,-27.5, M.ctrl);                      // hangar A
  addBox(.2,3.2,4, -56.35,1.6,-27.5, M.uescGrey);              // roll door (east face)
  addBox(7,4.2,5, -60,2.1,-13.5, M.ctrl);                      // hangar B
  addBox(.2,3.2,4, -56.35,1.6,-13.5, M.uescGrey);
  addBox(7,.18,.18, -60,4.3,-24.97, M.acid, {noCollide:true,noShadow:true});
  addBox(7,.18,.18, -60,4.3,-11.03, M.acid, {noCollide:true,noShadow:true});
  // parked dropship on the airfield apron
  addBox(2.2,1.9,6.5, -59.5,1.15,-7.5, M.uescWhite);
  addBox(7.5,.25,1.8, -59.5,1.9,-6.6, M.ortn);
  addBox(.3,1.4,1.2, -59.5,2.6,-10.3, M.uescWhite);
  addBox(2.4,.2,6.7, -59.5,.1,-7.5, M.uescDark);

  // --- Plaza rooms (under the plaza southwest of Orientation) ---
  addBox(20,.4,12, -25,-4.4,5, M.pad);                         // floor
  addBox(.6,4.2,12, -35,-2.1,5, M.ctrl);                       // west wall
  addBox(.6,4.2,12, -15,-2.1,5, M.ctrl);                       // east wall
  addBox(20.6,4.2,.6, -25,-2.1,-1, M.ctrl);                    // north wall (green 2)
  addBox(20.6,4.2,.6, -25,-2.1,11, M.ctrl);                    // south wall
  addBox(1.3,4.2,1.3, -21.5,-2.1,9, M.uescDark);               // center pillar (green 3) — clear of the stairs
  addBox(1.3,4.2,1.3, -28,-2.1,7.6, M.uescDark);
  // wall-vent housing on the north wall — green 2 sits inside the frame
  addBox(2,.22,.7, -28.3,-1.55,-0.5, M.genBlack);
  addBox(2,.22,.7, -28.3,-3.45,-0.5, M.genBlack);
  addBox(.22,2.1,.7, -29.3,-2.5,-0.5, M.genBlack);
  addBox(.22,2.1,.7, -27.3,-2.5,-0.5, M.genBlack);
  // ceiling minus the stair hole (x -22..-15, z 2.5..7.5) and the open hatch (x -30..-28, z 6..8)
  addBox(5,.4,12, -32.5,-.2,5, M.pad);
  addBox(2,.4,7, -29,-.2,2.5, M.pad);
  addBox(2,.4,3, -29,-.2,9.5, M.pad);
  addBox(6,.4,12, -25,-.2,5, M.pad);
  addBox(7,.4,3.5, -18.5,-.2,.75, M.pad);
  addBox(7,.4,3.5, -18.5,-.2,9.25, M.pad);
  for(let i=0;i<10;i++) addBox(.62,.42,4.6, -15.65-i*.62, -.21-i*.42, 5, M.uescGrey);
  // hatch rim + grate bars over the open ceiling hole
  addBox(.3,.25,2.4, -30.15,.12,7, M.hazard); addBox(.3,.25,2.4, -27.85,.12,7, M.hazard);
  for(let i=0;i<4;i++) addBox(2.3,.05,.08, -29,-.05,6.3+i*.5, M.uescDark, {noCollide:true,noShadow:true});
  addBox(2.4,2.4,5, -32.6,-3,8, M.contBlu);
  addBox(6,.1,.3, -25,-.62,5, M.acid, {noCollide:true,noShadow:true});
  addFlood(-25,-1.4,5, .8, 20);
  addFlood(-31,-1.8,7, .45, 10, 0xc8e82a);
}

/* =================  ORIENTATION (two floors + roof; blue 1-9 etc.)  ================= */
{
  addBox(42,.2,20, -11,.1,-8, M.pad);                          // interior floor pad
  // ground-floor walls — doors: S x-14..-10 & x-2..2, N x-8..-4, W z-12..-9, E z-6..-2
  addBox(18,3.6,.6, -23,1.8,2, M.ctrl);
  addBox(8,3.6,.6, -6,1.8,2, M.ctrl);
  addBox(8,3.6,.6, 6,1.8,2, M.ctrl);
  addBox(24,3.6,.6, -20,1.8,-18, M.ctrl);
  addBox(14,3.6,.6, 3,1.8,-18, M.ctrl);
  addBox(.6,3.6,6, -32,1.8,-15, M.ctrl);
  addBox(.6,3.6,11, -32,1.8,-3.5, M.ctrl);
  addBox(.6,3.6,12, 10,1.8,-12, M.ctrl);
  addBox(.6,3.6,4, 10,1.8,0, M.ctrl);
  // lobby: west pillar pair (blue 1/2), console (blue 3), reception desk
  addBox(1.3,3.6,1.3, -25.2,1.8,-13.6, M.uescDark);
  addBox(1.3,3.6,1.3, -25.2,1.8,-8.9, M.uescDark);
  addBox(2.6,1.3,1.2, -19,.65,-8.6, M.genBlack);
  addBox(4,1.1,1.5, -4,.55,-13, M.uescDark);
  // slab between floors, stairwell hole x -16..-10 / z -16..-8
  addBox(42,.6,10, -11,3.9,-3, M.uescGrey);
  addBox(42,.6,2, -11,3.9,-17, M.uescGrey);
  addBox(16,.6,8, -24,3.9,-12, M.uescGrey);
  addBox(20,.6,8, 0,3.9,-12, M.uescGrey);
  // stairwell: ground -> second floor (roof stays ladder-access)
  for(let i=0;i<10;i++) addBox(5,.42,.62, -13, .21+i*.42, -8.6-i*.68, M.uescGrey);
  addBox(6,.42,1.4, -13,3.99,-15.6, M.uescGrey);
  // second-floor walls (south = window band over a solid sill)
  addBox(42,3.6,.6, -11,6,-18, M.ctrl);
  addBox(.6,3.6,20, -32,6,-8, M.ctrl);
  addBox(.6,3.6,20, 10,6,-8, M.ctrl);
  addBox(42,1.2,.6, -11,4.8,2, M.ctrl);
  addBox(42,1.6,.2, -11,6.2,2, M.glass, {noShadow:true});
  addBox(42,.8,.6, -11,7.4,2, M.ctrl, {noCollide:true});
  // 2F: the locked room in the middle section (blue 5 on its outer wall) + racks
  addBox(6.4,3.6,.4, -5,6,-12, M.ctrl);
  addBox(6.4,3.6,.4, -5,6,-7.7, M.ctrl);
  addBox(.4,3.6,3.9, -8,6,-9.85, M.ctrl);
  addBox(.4,3.6,3.9, -2,6,-9.85, M.ctrl);
  addBox(1.3,2.6,.12, -1.75,5.5,-9.85, M.uescDark, {noCollide:true});   // sealed door
  addBox(.14,.2,1.6, -1.7,4.6,-9.85, M.hazard, {noCollide:true,noShadow:true});
  addBox(.14,.2,1.6, -1.7,6.3,-9.85, M.hazard, {noCollide:true,noShadow:true});
  addBox(6.4,.15,.15, -5,7.6,-7.42, M.acid, {noCollide:true,noShadow:true});
  addBox(1,2.4,3, 4.6,5.4,-10.4, M.genBlack);
  addBox(3,2.4,1, -2,5.4,-14.2, M.genBlack);
  // roof slab + parapets (west edge open for the ladder dismount; the south
  // parapet has a gap where the collapsed walkway to the wing begins)
  addBox(42,.6,20, -11,8.1,-8, M.uescGrey);
  addBox(42,1,.6, -11,8.9,-18, M.uescGrey);
  addBox(23,1,.6, -20.5,8.9,2, M.uescGrey);
  addBox(17,1,.6, 1.5,8.9,2, M.uescGrey);
  addBox(.6,1,20, 10,8.9,-8, M.uescGrey);
  addBox(4,2.4,2.4, -2,9.6,-15, M.genBlack);                   // roof generator (blue 9)
  addBox(2.4,1.6,2.4, 4,9.2,-11, M.uescDark);                  // roof AC unit (blue 8)
  addLadder(-32.6, -6, 0, OR.roofY, {x:-29.5, y:OR.roofY, z:-6});
  // ORTN teal cladding on the east end + acid roofline (image 4 look)
  addBox(.35,3.2,10, 10.5,1.9,-11, M.ortn, {noCollide:true});
  addBox(42,.22,.22, -11,8.5,2.12, M.acid, {noCollide:true,noShadow:true});
  addBox(24,.22,.22, -20,8.5,-18.12, M.acid, {noCollide:true,noShadow:true});
  // interior ceiling lamps + lights (both floors)
  const lampMat = new THREE.MeshStandardMaterial({color:0xdde8ff, emissive:0xaac8ff, emissiveIntensity:1.2});
  [[-24,3.45,-4],[2,3.45,-13],[-24,7.65,-13],[2,7.65,-4]].forEach(([x,y,z])=>{
    addBox(2,.1,2, x,y,z, lampMat, {noCollide:true, noShadow:true});
    addFlood(x, y-.4, z, .7, 17);
  });
}

/* ----  Sealed hut NE of Orientation (red 10) + red light-bar antenna  ---- */
{
  addBox(5,3,.6, 15.5,1.5,-10, M.uescWhite);
  addBox(5,3,.6, 15.5,1.5,-5, M.uescWhite);
  addBox(.6,3,5, 18,1.5,-7.5, M.uescWhite);
  addBox(.6,3,1.6, 13,1.5,-9.2, M.uescWhite);                  // door gap z -8.4..-6.6
  addBox(.6,3,1.6, 13,1.5,-5.8, M.uescWhite);
  addBox(5.6,.4,5.6, 15.5,3.2,-7.5, M.uescGrey);
  addBox(1.4,2.2,.15, 16.5,1.1,-7.5, M.uescDark, {noCollide:true}); // inner door
  addBox(.25,2.8,.25, 13.3,1.5,-9.9, M.hazard, {noCollide:true,noShadow:true}); // SEAL tape posts
  addBox(.25,2.8,.25, 13.3,1.5,-5.1, M.hazard, {noCollide:true,noShadow:true});
  addBox(.3,6,.3, 17.4,6.2,-9.4, M.uescDark);
  addBox(3.4,.22,.22, 16.2,9.2,-9.4, M.uescDark, {noCollide:true});
  addBox(3,.14,.14, 16.2,8.95,-9.4, M.redGlow, {noCollide:true,noShadow:true});
  const rl = new THREE.PointLight(0xff2331,.9,20); rl.position.set(16.2,9,-9.4); scene.add(rl);
  // parked ORTN van on the bridge road
  addBox(2,1.9,4.6, 20,.95,-2.6, M.uescWhite, {ry:.15});
  addBox(2.06,.5,4.66, 20,.6,-2.6, M.ortn, {noCollide:true,noShadow:true, ry:.15});
}

/* ----  Container yard NW of Orientation (purple 3 on top of the stack)  ---- */
{
  addBox(5.2,2.6,2.4, -34.6,1.3,-16.6, M.genBlack);            // black stack, bottom
  addBox(5.2,2.6,2.4, -34.9,3.9,-16.2, M.genBlack);            // black stack, top (5.2 high)
  addBox(.7,.5,.7, -33.9,5.45,-16.2, M.uescDark);              // button pedestal
  addBox(2.4,2.6,5.6, -31,1.3,-21, M.ortn);                    // ORTN teal container (the perch)
  addBox(2.2,1.2,2.2, -29.1,.6,-19.4, M.contBlu);              // step crate up to the perch
  addBox(2.4,2.4,6, -37.5,1.2,-13, M.contBlu);
  addBox(2.4,2.2,5, -36.2,1.1,-20.5, M.contOlv);
  addFlood(-32,4.5,-15, .6, 16);
  // junction crate (purple 7) where the west road forks north
  addBox(2.2,2.2,2.2, -23.6,1.1,-21, M.contRed);
}

/* =================  NORTH ROAD: ORTN garage (purple 4/5), cliffs, tip (purple 6)  ================= */
{
  addBox(6.2,3.4,5, -19.1,1.7,-39.5, M.ortn);                  // teal garage block
  addBox(.15,2.6,3, -22.33,1.3,-39.5, M.uescWhite, {noCollide:true,noShadow:true}); // roll door
  addBox(2,1.4,2, -18,4.1,-38.5, M.genBlack);                  // rooftop unit
  addBox(6.2,.18,.18, -19.1,3.5,-37.02, M.acid, {noCollide:true,noShadow:true});
  addFlood(-23.6,3.2,-39.5, .7, 15);
  addBox(2,1.9,4.6, -25.5,.95,-35.4, M.uescWhite, {ry:-.1});   // parked van
  // cliff wall between the road and the sea (image 3 backdrop)
  addBox(7,7,14, -11,3.5,-44, M.rock, {ry:.25});
  addBox(8,9,12, -6,4.5,-52, M.rock, {ry:-.2});
  addBox(8,10,10, -2,5,-60, M.rock, {ry:.15});
  addBox(6,5,8, -13,2.5,-30, M.rock, {ry:-.3});
  addBox(4,3.2,6, -30,1.6,-36, M.rock, {ry:.4});
  // the tip: overlook platform at the end of the road
  addPad(14,10, 4,-67);
  addBox(2,2,2, 5.5,1,-68.6, M.contOlv);                       // purple 6 mounts here
  addBox(2.2,2.2,2.2, 2.6,1.1,-69, M.contBlu);
  addBox(.4,8,.4, 8.5,4,-69.5, M.uescDark);                    // antenna mast
  addBox(2.6,.18,.18, 8.5,7.6,-69.5, M.redGlow, {noCollide:true,noShadow:true});
  const tl = new THREE.PointLight(0xff2331,.8,18); tl.position.set(8.5,7.7,-69.5); scene.add(tl);
  addBox(2,1.8,4.4, 9.2,.9,-64.4, M.uescWhite, {ry:-.4});      // wrecked van
  addFlood(2,4,-66, .7, 18);
  addBox(10,5,8, -2,2.5,-73, M.rock, {ry:.2});                 // rocks past the tip
  addBox(12,6,8, 9,3,-72.5, M.rock, {ry:-.15});
}

/* =================  DESTROYED WING (blue hull crash over a CTRL hall)  =================
   Ground hall (0) -> mezzanine (+4.2) -> top deck (+8.4, finish zone).
   green 7 / blue 10 sit OUTSIDE on the upper hull walls; green 8 hangs under
   the south overhang; blue 11/12 are up in the wreck on the top deck. */
{
  addBox(36,.2,18, -10,.1,21, M.pad);                          // hall floor pad
  // ground walls — big north door x -16..-8, east door z 20..24, south door x -6..-2
  addBox(12,4.2,.6, -22,2.1,12, M.ctrl);
  addBox(16,4.2,.6, 0,2.1,12, M.ctrl);                         // green 5 outside this one
  addBox(.6,4.2,22, -28,2.1,23, M.ctrl);
  addBox(.6,4.2,8, 8,2.1,16, M.ctrl);
  addBox(.6,4.2,10, 8,2.1,29, M.ctrl);
  addBox(22,4.2,.6, -17,2.1,30, M.ctrl);
  addBox(10,4.2,.6, 3,2.1,30, M.ctrl);
  // mezzanine slab (north half) + stairs hall->mezz along the west wall
  addBox(36,.6,8, -10,3.9,16, M.uescGrey);
  for(let i=0;i<10;i++) addBox(3,.42,.62, -26, .21+i*.42, 28.8-i*.82, M.uescGrey);
  addBox(3,.42,1.8, -26,3.99,20.9, M.uescGrey);
  // top deck (hole x -28..-23.5 / z 20..27 for the second stair) + stairs mezz->deck
  addBox(31.5,.6,12, -7.75,8.1,26, M.uescGrey);
  addBox(4.5,.6,5, -25.75,8.1,29.5, M.uescGrey);
  for(let i=0;i<10;i++) addBox(3,.42,.62, -26, 4.41+i*.42, 19.6+i*.82, M.uescGrey);
  // upper hull shell (deep-blue ship plating)
  addBox(.6,5.1,16, -28,10.95,26, M.hull);                     // west hull wall (green 7 outside)
  addBox(.6,7,20, 8,9.5,24, M.hull);                           // east hull wall (blue 10 outside)
  addBox(36,4.6,.8, -10,10.7,33.6, M.hull);                    // south hull end
  addBox(16,1,.8, -12,8.9,19.9, M.hull);                       // north lip (snipe gap above)
  addBox(8,2.6,.8, -24,9.7,19.9, M.hull);
  addBox(12,2.6,.8, 2,9.7,19.9, M.hull);
  // mangled wing canopy: blue hull + acid-yellow chunks (visual, high above sightlines)
  addBox(18,.7,10, -18,13.8,26, M.wreckAcid, {ry:.15, noCollide:true});
  addBox(14,.6,8, 0,12.6,28, M.hull, {ry:-.2, noCollide:true});
  addBox(10,.5,6, -8,14.6,22, M.hull, {ry:.3, noCollide:true});
  addBox(1,4,6, -20,15,30, M.wreckAcid, {ry:.1, noCollide:true});
  addBox(36,.2,.2, -10,13.15,33.9, M.acid, {noCollide:true,noShadow:true});
  addBox(.2,.2,16, -28.15,13.6,26, M.acid, {noCollide:true,noShadow:true});
  addBox(.12,1.6,8, 8.36,10.4,27, M.ctrl, {noCollide:true,noShadow:true}); // white decal band
  // deck wreckage (blue 11 on the east chunk, blue 12 on the acid chunk)
  addBox(3.5,2.6,2, -9.5,9.7,25.8, M.hull);
  addBox(3,2.4,2, -16.9,9.6,25.3, M.wreckAcid);
  addBox(2,1,3, -3,8.9,29, M.rust, {ry:.5});
  // red anti-collision beacons up on the wreck (image 2 skyline)
  [[-6,14.5,26],[4,13.5,32]].forEach(([x,y,z])=>{
    addBox(.9,.16,.16, x,y,z, M.redGlow, {noCollide:true,noShadow:true});
    const l = new THREE.PointLight(0xff2331,.8,24); l.position.set(x,y+.2,z); scene.add(l);
  });
  // south overhang on pillars — green 8 hangs underneath
  addBox(24,.8,4, -12,4,32.2, M.hull);
  addBox(1.2,3.6,1.2, -22,1.8,33, M.uescDark);
  addBox(1.2,3.6,1.2, -12,1.8,33.4, M.uescDark);
  addBox(1.2,3.6,1.2, -2,1.8,33, M.uescDark);
  addBox(.7,.8,.7, -14.4,3.2,31.2, M.genBlack);                // green 8 bracket
  // burnt hall interior (image 5): sign boards, cargo, fallen wing chunk
  const board = (x,z,ry,col)=>{
    addBox(.2,2.6,.2, x,1.3,z, M.uescDark);
    const b = addBox(2.2,1.4,.12, x,2.1,z, new THREE.MeshBasicMaterial({color:col}), {noCollide:true,noShadow:true});
    b.rotation.y = ry;
  };
  board(-20,16, .2, 0x2334cc); board(-4,18, -.15, 0x7a3fd0); board(-13,26, .1, 0x2334cc);
  addBox(2.4,2.4,5, 2,1.2,26, M.contBlu);
  addBox(2.2,2.2,2.2, -24,1.1,14, M.contOlv);
  addBox(4,1.2,3, -10,.6,22, M.wreckAcid, {ry:.4});
  addBox(3,1,2, -18,.5,21, M.rust, {ry:-.6});
  addFlood(-10,7,24, .6, 20);
  addFlood(-20,3.4,16, .5, 14);
  const ember = new THREE.PointLight(0xff7733,.55,13); ember.position.set(-8,1,23); scene.add(ember);
  // rubble at the NE corner (low — you cannot parkour to the deck from here)
  addBox(4,1.4,4, 11,.7,14, M.rust, {ry:.3});
  addBox(3,1.2,3, 10.5,1.9,13.5, M.rust, {ry:-.2});
}

/* ----  Collapsed walkway: Orientation roof -> the wing's sealed north door.
        The guide route — climb the roof, cross the wreckage, and the red
        barrier door (lamps above it) is straight ahead.  ---- */
{
  addBox(1.8,.35,17.6, -8,8.22,10.75, M.hull);                 // walkway span (top ~8.4)
  addBox(.15,.5,17.6, -8.95,8.75,10.75, M.uescDark, {noCollide:true}); // rails
  addBox(.15,.5,17.6, -7.05,8.75,10.75, M.uescDark, {noCollide:true});
  addBox(2.6,.12,4, -8,8.46,6, M.wreckAcid, {ry:.08, noCollide:true}); // buckled plates
  addBox(2.2,.12,3, -7.8,8.44,14, M.hull, {ry:-.06, noCollide:true});
  [4,10,16].forEach(z=> addBox(1,8.4,1, -8,4.2,z, M.uescDark)); // support struts
}

// ---- Barriers + indicator lamps: one red field at the top of the deck
// stairs, one across the walkway door; both drop when the grid clears. ----
let barrier, barrier2;
let barrierLamps=[];
{
  const barrierMat = new THREE.MeshBasicMaterial({color:0xff2222, transparent:true, opacity:.35, side:THREE.DoubleSide});
  barrier = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.2), barrierMat);
  barrier.position.set(-25.9, WING.deckY+2.1, 26.6);
  scene.add(barrier);
  addBox(.5,4.6,.5, -28.15,WING.deckY+2.3,26.6, M.uescDark);
  addBox(.5,4.6,.5, -23.65,WING.deckY+2.3,26.6, M.uescDark);
  addBox(5,.4,.4, -25.9,WING.deckY+4.8,26.6, M.uescDark, {noCollide:true});
  barrier2 = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), barrierMat);
  barrier2.position.set(-8, WING.deckY+1.6, 19.3);
  scene.add(barrier2);
  addBox(.5,4,.5, -10,WING.deckY+1.8,19.3, M.uescDark);
  addBox(.5,4,.5, -6,WING.deckY+1.8,19.3, M.uescDark);
}
// Rebuild the row of barrier indicator lamps (on the wing's north lip, visible
// from the plaza and the Orientation roof) to match the run's target count.
function buildBarrierLamps(n){
  barrierLamps.forEach(l=>scene.remove(l));
  barrierLamps = [];
  const span = 14, x0 = -17;
  for(let i=0;i<n;i++){
    const lm = new THREE.Mesh(new THREE.SphereGeometry(.28,10,10),
      new THREE.MeshBasicMaterial({color:0xff2a2a}));
    lm.position.set(x0 + (n>1? i*span/(n-1) : span/2), 9.85, 19.3);
    scene.add(lm); barrierLamps.push(lm);
  }
}

/* ----  South plaza kiosk (green 4), south of the B1 stair opening.
        Freestanding machine pair — the wing-door runline passes both sides. ---- */
{
  [[-13.6,0],[-11.4,1]].forEach(([x,i])=>{
    addBox(1.8,3,1.2, x,1.5,8.3, M.vend);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.3,2.1),
      new THREE.MeshBasicMaterial({color:i?0x66ccff:0xffaa33}));
    s.position.set(x,1.55,7.68); s.rotation.y=Math.PI; scene.add(s);
  });
  addFlood(-12.5,3.6,7, .7, 14);
}

/* ----  Red key card spawn (the green-zone vantage point)  ---- */
{
  addBox(.9,1.1,.9, -30,.55,3, M.uescDark);
  addBox(.06,.5,.34, -30,1.35,3, M.redGlow, {noCollide:true,noShadow:true});
  const kl = new THREE.PointLight(0xff2331,.5,8); kl.position.set(-30,1.5,3); scene.add(kl);
}

/* ----  Southeast yard (green 6 / red 11 containers)  ---- */
{
  addBox(2.4,2.4,3.6, 9.9,1.2,25.2, M.contRed);                // red 11 on the east face
  addBox(2,2,2, 10.05,1.1,26.9, M.contBlu);                    // green 6 on the west face
  addBox(2.4,2.4,6, 13.4,1.2,28.6, M.contOlv);
  addFlood(12,4,26, .6, 16);
}

/* =================  DEPOT east of the wing (red 5-9, truck)  ================= */
const truckPos = {x:13, z:6.5};
{
  addBox(6,4.6,.6, 21,2.3,2, M.ctrl);                          // north wall, west of door
  addBox(10,4.6,.6, 33,2.3,2, M.ctrl);                         // north wall (red 5 outside)
  addBox(20,4.6,.6, 28,2.3,17, M.ctrl);                        // south wall (red 7 inside)
  addBox(.6,4.6,2, 18,2.3,3, M.ctrl);                          // west wall, door z 4..8
  addBox(.6,4.6,9, 18,2.3,12.5, M.ctrl);                       // west wall (red 9 outside)
  addBox(.6,4.6,15, 38,2.3,9.5, M.ctrl);                       // east wall (red 6 outside)
  addBox(20,.5,15, 28,4.85,9.5, M.uescGrey);                   // flat roof
  addBox(20,.2,.2, 28,5.15,17.12, M.acid, {noCollide:true,noShadow:true});
  // interior staircase up to the storage loft; red 8 hides underneath it
  for(let i=0;i<7;i++) addBox(2.4,.36,.62, 19.9, .18+i*.36, 14.3-i*.72, M.uescGrey);
  addBox(2.8,.3,4.4, 19.9,2.62,7.6, M.uescGrey);
  addBox(.3,2.5,.3, 19.9,1.25,5.6, M.uescDark);
  addBox(.25,2.2,4.4, 21.2,1.1,12.2, M.uescDark);
  // medical section along the south wall (red 7)
  addBox(2.6,1.9,.9, 25,.95,15.9, M.uescWhite);
  addBox(2.6,1.9,.9, 31,.95,15.9, M.uescWhite);
  addBox(2,.15,.9, 28,.75,15.4, M.uescWhite);
  addBox(.15,.75,.9, 27.2,.38,15.4, M.uescDark);
  addBox(.15,.75,.9, 28.8,.38,15.4, M.uescDark);
  addBox(.12,1.8,2, 29.9,.9,14.4, M.ortn);
  addBox(.8,.8,.12, 26,2.9,16.46, M.ortn, {noCollide:true,noShadow:true});
  addBox(.5,.14,.1, 26,2.9,16.37, M.uescWhite, {noCollide:true,noShadow:true});
  addBox(.14,.5,.1, 26,2.9,16.37, M.uescWhite, {noCollide:true,noShadow:true});
  addBox(1,2.2,6, 34,1.1,10, M.genBlack);
  addFlood(28,3.9,9, .7, 20);
  addBox(2.2,1.2,2.2, 14.9,.6,15.4, M.contOlv);                // crate stair -> roof access
  addBox(2.4,2.4,2.4, 15.6,1.2,13.4, M.contOlv);               // (1.2 -> 2.4 -> 3.8 -> wall 4.6 -> roof)
  addBox(2.4,1.4,2.4, 16.5,3.1,13.9, M.contBlu);
  addBox(.3,5,.3, 16,2.5,3, M.uescDark);                       // flood pole on the apron
  addFlood(16,5.2,3, .95, 24);
  colliders.push(new THREE.Box3(
    new THREE.Vector3(truckPos.x-1.7, 0, truckPos.z-3.2),
    new THREE.Vector3(truckPos.x+1.7, 2.6, truckPos.z+3.2)));
}

/* =================  FAR EAST (red 1-4) + east gate (red 3)  ================= */
{
  addBox(5,6,10, 44,3,-2, M.rock, {ry:.3});                    // rocky pass
  addBox(4,5,8, 47,2.5,14, M.rock, {ry:-.2});
  addBox(12,5.4,8, 58,2.7,-2, M.ctrl);                         // north block (red 4)
  addBox(12,.2,.2, 58,5.5,2.12, M.acid, {noCollide:true,noShadow:true});
  addBox(6,4.6,10, 55,2.3,9, M.ctrl);                          // dorm block (red 2)
  addBox(1.8,1.8,1.8, 59.4,.9,11.4, M.contRed);                // red 1 crate
  addBox(2,5,14, 73,2.5,7, M.uescGrey);                        // east gate wall (red 3)
  addBox(.4,5.6,.4, 73,2.8,-.2, M.hazard);
  addBox(.4,5.6,.4, 73,2.8,14.2, M.hazard);
  addBox(2,.2,.2, 73,5.15,7, M.acid, {noCollide:true,noShadow:true});
  addFlood(60,4.6,5, .8, 22);
  addBox(3,2.6,2.2, 50,1.3,6, M.contBlu);
}

/* ----  NW mega-structure + map perimeter  ---- */
{
  addBox(24,12,18, -54,6,-69, M.uescGrey);                     // "G" complex backdrop
  addBox(20,16,14, -56,8,-51, M.hull);
  addBox(14,9,10, -47,4.5,-42, M.ctrl);
  for(let i=0;i<3;i++)
    addBox(18,.25,.25, -56,4+i*3.4,-43.9, M.acid, {noCollide:true,noShadow:true});
  addFlood(-48,8,-44, .7, 26);
  // SW yard backdrop
  addBox(2.5,2.6,6, -44,1.3,24, M.contRed);
  addBox(2.5,2.6,6, -41,1.3,26, M.contOlv);
  addBox(2.5,2.6,6, -42.5,3.9,25, M.contBlu);
  addBox(10,7,8, -55,3.5,30, M.ctrl);
  // perimeter walls / rock lines
  addBox(1.2,6,118, -66,3,-19, M.rock);
  addBox(144,6,1.2, 5,3,38, M.rock);
  addBox(1.2,6,53, 78,3,11.5, M.rock);
  addBox(82,6,1.2, -25,3,-78, M.rock);
}

// ---- Scatter cover along the roads ----
[[-40,16,2.4],[12,34,2.2],[-4,-26,2],[24,-10,2.2],[46,4,2],[-38,-6,2]].forEach(([x,z,s])=>{
  addBox(s,s*.8,s, x, s*.4, z, M.uescDark, {ry:x*.2});
});
