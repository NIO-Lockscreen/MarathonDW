'use strict';
/* =====================  LAYOUT  =====================
   World geometry, updated to the Orientation quadrant map:
   - ORIENTATION is a grounded TWO-FLOOR building with a walkable
     interior (lobby + second floor), stairwells and a roof.
   - The DESTROYED WING is an elevated crashed hull whose deck runs
     from the south rubble field OVER the Orientation roof.
   Everything solid goes through addBox() so it collides + occludes. */

// ---- Ground (4 quads leaving a hole for the trench) ----
{
  const hole = {x0:-32.5, x1:-23.5, z0:-20, z1:20};
  [[-200, hole.x0, -200, 200],[hole.x1, 200, -200, 200],
   [hole.x0, hole.x1, -200, hole.z0],[hole.x0, hole.x1, hole.z1, 200]]
  .forEach(([x0,x1,z0,z1])=>{
    const g = new THREE.Mesh(new THREE.PlaneGeometry(x1-x0, z1-z0), M.ground);
    g.rotation.x=-Math.PI/2;
    g.position.set((x0+x1)/2, 0, (z0+z1)/2);
    g.receiveShadow = true;
    scene.add(g); occluders.push(g);
  });
}

// ---- Pinwheel core backdrop ----
{
  for(let i=0;i<7;i++){
    const r = 16 - i*1.2;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r+1.5, 6, 8), i%2? M.uescGrey : M.uescWhite);
    m.position.set(0, 3+i*6, 72);
    m.rotation.y = i*.35;
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
  }
  colliders.push(new THREE.Box3(new THREE.Vector3(-18,0,55), new THREE.Vector3(18,45,89)));
  for(let i=0;i<3;i++){
    const l = new THREE.PointLight(0xff3020,.8,30);
    l.position.set(Math.sin(i*2.1)*14, 12+i*12, 72+Math.cos(i*2.1)*14);
    scene.add(l);
  }
}

/* ---- Orientation building (two floors + interior + roof) ----
   Footprint x -17..17, z -26..-2. Ground floor 0..3.6, slab 3.6..4.2,
   second floor 4.2..7.8, roof slab 7.8..8.4 (roofY = walkable roof). */
const OR = { x:0, z:-14, w:34, d:24, f2:4.2, roofY:8.4 };
{
  // interior floor pad
  addBox(OR.w, .2, OR.d, 0, .1, -14, M.pad);

  // ground floor walls (south door x -2.5..2.5, north door x 4.5..8.5,
  // west door z -22..-18 toward the garage alley, east solid)
  addBox(14.5,3.6,.6, -9.75,1.8,-2.3,  M.uescWhite);
  addBox(14.5,3.6,.6,  9.75,1.8,-2.3,  M.uescWhite);
  addBox(21.5,3.6,.6, -6.25,1.8,-25.7, M.uescWhite);
  addBox( 8.5,3.6,.6, 12.75,1.8,-25.7, M.uescWhite);
  addBox(.6,3.6, 3.4, -16.7,1.8,-23.7, M.uescWhite);
  addBox(.6,3.6,15.4, -16.7,1.8,-10.3, M.uescWhite);
  addBox(.6,3.6,22.8,  16.7,1.8,-14,   M.uescWhite);

  // lobby pillars + reception desk
  addBox(1.4,3.6,1.4, -5,1.8,-14, M.uescDark);
  addBox(1.4,3.6,1.4,  5,1.8,-14, M.uescDark);
  addBox(4,1.1,1.5, 0,.55,-7, M.uescDark);

  // slab between floors, stairwell hole x -15..-9 / z -24..-18
  addBox(34,.6,16, 0,3.9,-10, M.uescGrey);
  addBox(34,.6, 2, 0,3.9,-25, M.uescGrey);
  addBox( 2,.6, 6,-16,3.9,-21, M.uescGrey);
  addBox(26,.6, 6,  4,3.9,-21, M.uescGrey);

  // stairwell: ground -> second floor, second floor -> roof
  for(let i=0;i<10;i++) addBox(6,.42,.6, -12,      .21+i*.42, -18.3-i*.6, M.uescGrey);
  for(let i=0;i<10;i++) addBox(6,.42,.6, -12, OR.f2+.21+i*.42, -18.3-i*.6, M.uescGrey);

  // second floor walls (south = window band, rest solid)
  addBox(34,1.2,.6, 0,4.8,-2.3, M.uescWhite);
  addBox(34,1.6,.2, 0,6.2,-2.3, M.glass, {noShadow:true});
  addBox(34, .8,.6, 0,7.4,-2.3, M.uescWhite, {noCollide:true});
  addBox(34,3.6,.6, 0,6,-25.7,  M.uescWhite);
  addBox(.6,3.6,22.8, -16.7,6,-14, M.uescWhite);
  addBox(.6,3.6,22.8,  16.7,6,-14, M.uescWhite);

  // roof slab (same stairwell hole)
  addBox(34,.6,16, 0,8.1,-10, M.uescGrey);
  addBox(34,.6, 2, 0,8.1,-25, M.uescGrey);
  addBox( 2,.6, 6,-16,8.1,-21, M.uescGrey);
  addBox(26,.6, 6,  4,8.1,-21, M.uescGrey);

  // interior ceiling lamps + lights (both floors)
  const lampMat = new THREE.MeshStandardMaterial({color:0xdde8ff, emissive:0xaac8ff, emissiveIntensity:1.2});
  [[-7,3.5,-8],[7,3.5,-20],[-7,7.7,-20],[7,7.7,-8]].forEach(([x,y,z])=>{
    addBox(2,.1,2, x,y,z, lampMat, {noCollide:true, noShadow:true});
    const l = new THREE.PointLight(0xbfd8ff,.8,18);
    l.position.set(x, y-.4, z);
    scene.add(l);
  });

  // exterior stairs (west face, through the garage alley) up to the roof
  for(let i=0;i<17;i++){
    addBox(3,.5,1.6, -18.8, .25+i*.5, -6 - i*1.05, M.uescGrey);
  }

  // roof parapets (north + east; west stays open for the exterior stairs)
  addBox(34,1,.6, 0,8.9,-25.7, M.uescGrey);
  addBox(.6,1,22.8, 16.7,8.9,-14, M.uescGrey);

  // roof generators, north of the crashed wing hull
  addBox(4,2.4,2.4,  9, OR.roofY+1.2, -22, M.genBlack);
  addBox(4,2.4,2.4, -2, OR.roofY+1.2, -24, M.genBlack);

  // crash debris where the wing came down on the roof
  addBox(2.5,1,2.5, -11, OR.roofY+.5, -5, M.rust, {ry:.7});

  // garage block west of the building
  addBox(10, 5, 12, -25.5, 2.5, -22, M.uescGrey);
  addBox(.4, 4, 8, -20.3, 2, -22, M.hazard, {noCollide:true, noShadow:true});

  // NuCaloric kiosk wall + vending machines (outside the north face)
  addBox(10, 3, .6, 7, 1.5, -27, M.uescDark);
  [6.5, 8.7].forEach((x,i)=>{
    addBox(1.8,3,1.2, x, 1.5, -28.2, M.vend);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.3,2.1),
      new THREE.MeshBasicMaterial({color:i?0x66ccff:0xffaa33}));
    s.position.set(x, 1.55, -28.85);
    s.rotation.y = Math.PI;
    scene.add(s);
  });
}

/* ---- Destroyed Wing (crashed hull OVER the Orientation roof) ----
   Deck runs z -14..30 at deckY 12; the north span rests on the
   building roof, the south span stands on pillars over the road.
   Entry: rubble ramp (east) -> low wall hop into the south pocket
   -> barrier at z 24 -> hull interior (finish zone). */
const WING = { deckY: 12 };
{
  addBox(16, 1.2, 44, 0, WING.deckY-.6, 8, M.uescGrey);          // deck floor (z -14..30)
  addBox(.6, 4, 44, -7.7, WING.deckY+2, 8,  M.uescWhite);        // west wall (full length)
  addBox(.6, 4, 44,  7.7, WING.deckY+2, 8,  M.uescWhite);        // east wall (full length)
  addBox(16, 4, .6, 0, WING.deckY+2, -14, M.uescWhite);          // north end wall
  addBox(17, 1, 12, 0, WING.deckY+5.5, -8, M.uescDark);          // hull canopy over the roof
  // support pillars for the over-the-road span
  [6,16,26].forEach(z=>{ [-6,6].forEach(x=> addBox(1.6, WING.deckY-1.2, 1.6, x, (WING.deckY-1.2)/2, z, M.uescDark)); });
  // stubs where the north end of the hull rests on the Orientation roof
  [-6,6].forEach(x=> addBox(1.6, 2.4, 1.6, x, OR.roofY+1.2, -6, M.uescDark));
  // rubble ramp: ground -> deck, delivering into the south entry pocket (z 24..30)
  for(let i=0;i<24;i++){
    addBox(5, .5, 2.4, 4, .25+i*.5, 49 - i*.9, M.rust);
  }
  // wreckage on the deck (inside the hull)
  addBox(3,1.5,3, -4, WING.deckY+.75, 12, M.rust, {ry:.4});
  addBox(2,1,2.5,  3, WING.deckY+.5,  0,  M.rust, {ry:-.3});
}

// ---- Barrier + indicator lamps (south entrance of the hull) ----
let barrier;
const barrierLamps=[];
{
  barrier = new THREE.Mesh(new THREE.PlaneGeometry(15, 6),
    new THREE.MeshBasicMaterial({color:0xff2222, transparent:true, opacity:.35, side:THREE.DoubleSide}));
  barrier.position.set(0, WING.deckY+3, 24);
  scene.add(barrier);
  addBox(1,7,1, -8, WING.deckY+3.5, 24, M.uescDark);
  addBox(1,7,1,  8, WING.deckY+3.5, 24, M.uescDark);
  addBox(17,1,1, 0, WING.deckY+7.5, 24, M.uescDark, {noCollide:true});
  for(let i=0;i<5;i++){
    const lm = new THREE.Mesh(new THREE.SphereGeometry(.35,10,10),
      new THREE.MeshBasicMaterial({color:0xff2a2a}));
    lm.position.set(-4+i*2, WING.deckY+8.6, 24);
    scene.add(lm); barrierLamps.push(lm);
  }
}

// ---- Lower road + truck (south of Orientation, under the wing deck) ----
const truckPos = {x:12, z:4};
{
  const road = new THREE.Mesh(new THREE.PlaneGeometry(90,10), M.pad);
  road.rotation.x=-Math.PI/2; road.position.set(0,.02,4); road.receiveShadow=true;
  scene.add(road);
  colliders.push(new THREE.Box3(
    new THREE.Vector3(truckPos.x-1.7, 0, truckPos.z-3.2),
    new THREE.Vector3(truckPos.x+1.7, 2.6, truckPos.z+3.2)));
}

// ---- Trench + Flight Control bridge (west) ----
const TR = {x:-28};
{
  const tw=8, tl=40;
  const tfloor = new THREE.Mesh(new THREE.PlaneGeometry(tw+1,tl), M.uescDark);
  tfloor.rotation.x=-Math.PI/2; tfloor.position.set(TR.x,-3,0); tfloor.receiveShadow=true;
  scene.add(tfloor); occluders.push(tfloor);
  addBox(1,3,tl, TR.x-tw/2-.5, -1.5, 0, M.uescGrey);
  addBox(1,3,tl, TR.x+tw/2+.5, -1.5, 0, M.uescGrey);
  for(let i=0;i<7;i++){ addBox(tw,.5,1.6, TR.x, -2.75+i*.5, -13 - i*1.3, M.uescGrey); }
  for(let i=0;i<7;i++){ addBox(tw,.5,1.6, TR.x, -2.75+i*.5,  13 + i*1.3, M.uescGrey); }
  addBox(6,.8,14, TR.x, 4, 0, M.uescWhite);
  addBox(.6,2,14, TR.x-3, 5, 0, M.uescGrey, {noCollide:true});
  addBox(.6,2,14, TR.x+3, 5, 0, M.uescGrey, {noCollide:true});
  addBox(12,10,12, TR.x-12, 5, 0, M.uescWhite);
}

// ---- East bridge to Dormitories stub ----
{
  addBox(14,.8,5, 26, 4, -8, M.uescWhite);
  addBox(12,9,14, 40, 4.5, -8, M.uescGrey);
  addBox(14,.2,.5, 26, 4.5, -5.8, M.hazard, {noCollide:true, noShadow:true});
  addBox(14,.2,.5, 26, 4.5, -10.2, M.hazard, {noCollide:true, noShadow:true});
}

// ---- Cargo Bay (Airfield side, southwest) ----
{
  const cy = -37;
  addBox(2.5,2.6,6, -16, 1.3, cy, M.contRed);
  addBox(2.5,2.6,6, -19, 1.3, cy+1, M.contOlv);
  addBox(2.5,2.6,6, -17.5, 3.9, cy+.5, M.contBlu);
  addBox(2.5,2.6,6, -11, 1.3, cy-2, M.contBlu, {ry:.3});
  // gantry frame
  addBox(.8,7,.8, -22, 3.5, cy-4, M.uescDark);
  addBox(.8,7,.8, -9,  3.5, cy-4, M.uescDark);
  addBox(14,.8,.8, -15.5, 7, cy-4, M.uescDark, {noCollide:true});
  // landing pad hint toward Airfield
  const p = new THREE.Mesh(new THREE.CircleGeometry(7, 24), M.pad);
  p.rotation.x=-Math.PI/2; p.position.set(-16,.03,cy-14); p.receiveShadow=true;
  scene.add(p);
}

// ---- Scatter cover ----
[[-14,12,3],[18,6,2.6],[-8,16,2],[20,-22,2.5],[14,-32,2.2],[26,-26,2]].forEach(([x,z,s])=>{
  addBox(s,s*.8,s, x, s*.4, z, M.uescDark, {ry:x*.2});
});
