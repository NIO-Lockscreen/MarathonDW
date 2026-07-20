'use strict';
/* =====================  LAYOUT — built from the player's complete GLB  =====================
   The arena is the player's BlockMap build (ed107af8 / MyGameMap.glb), imported
   verbatim: 14 buildings, 36 walls, 13 floors, 28 blocks, 9 ladders, 15 doors,
   over five floors (world y = floor*3: 0 ground, 3 deck, 6 mid, 9 roof, 12 tip).
   A small builder turns that data into collidable geometry and — per the
   player's notes — cuts an opening at every doorway, punches a hole in the slab
   wherever a ladder climbs through, opens the hall's atrium, and makes every
   floor reachable. Fills (interior props, tip-room door, barriers, lights) are
   added on top so the run works end to end. */

// ---- MAP DATA (extracted verbatim; pos = world center, s = [w,h,d] pre-rotation,
//      y = yaw degrees, f = floor index) ----
const MAP = {
  buildings: [
    {p:[-30,0,7],s:[8.4,3,8],f:0,hollow:1},
    {p:[-15,3,5],s:[22,3,8.4],f:1,hollow:1,open:1},
    {p:[-26,3,-6],s:[1.6,3,4],f:1,hollow:1},
    {p:[-20,3,6],s:[4,3,4],f:1,hollow:1},
    {p:[-15,6,5],s:[22,3,8.4],f:2,hollow:1},
    {p:[-23,6,6],s:[4,3,4],f:2,hollow:1},
    {p:[4,3,4],s:[4,3,18],y:-15,f:1,hollow:1},
    {p:[4,6,4],s:[4,3,17.6],y:-15,f:2,hollow:1},
    {p:[-10,6,11],s:[4,3,5.2],f:2,hollow:1},
    {p:[16,3,-2],s:[1.6,3,4],f:1,hollow:1},
    {p:[-48,0,0],s:[17.6,3,20],y:-30,f:0,hollow:1},
    {p:[-24,3,23],s:[8.8,3,6.8],f:1,hollow:1},
    {p:[-28,3,5],s:[4,3,7.6],f:1,hollow:1},
    {p:[-6,6,0],s:[4,3,2],f:2,hollow:1},
  ],
  walls: [
    {p:[-22,0,11],s:[8.4,3,0.18],f:0},{p:[-10,0,9],s:[8.8,3,0.18],f:0},
    {p:[-16,0,10],s:[4,3,0.18],y:30,f:0},{p:[-6,0,9],s:[4,3,0.18],y:-90,f:0},
    {p:[-19,0,16],s:[54,3,0.18],f:0},{p:[-8,3,-2],s:[6.4,3,0.18],y:90,f:1},
    {p:[-12,3,-4],s:[18,3,0.18],f:1},{p:[-21,3,-19],s:[5.2,3,0.18],y:-30,f:1},
    {p:[-8,6,-2],s:[4.8,3,0.18],y:90,f:2},{p:[-31,3,-4],s:[8.4,3,0.25],f:1},
    {p:[-35,3,-3],s:[25.2,3,0.18],y:60,f:1},{p:[-36,3,6],s:[14.4,3,0.18],y:90,f:1},
    {p:[-11,12,23],s:[7.6,3,0.18],f:4},{p:[-7,12,26],s:[6.8,3,0.18],y:-90,f:4},
    {p:[-15,12,27],s:[8.8,3,0.18],y:90,f:4},{p:[-11,9,20],s:[0.8,2.7,0.18],f:3},
    {p:[21,3,-10],s:[26,3,0.18],y:-45,f:1},{p:[-46,0,14],s:[4,3,0.18],y:-90,f:0},
    {p:[-32,0,-4],s:[14.4,3,0.18],y:75,f:0},{p:[-33,0,-9],s:[4,3,0.18],f:0},
    {p:[-35,0,-7],s:[6,3,0.18],y:60,f:0},{p:[1,0,9],s:[14.8,3,0.18],f:0},
    {p:[8,0,12],s:[8,3,0.18],y:-90,f:0},{p:[-28,3,18],s:[4,3,0.18],y:90,f:1},
    {p:[-9,3,21],s:[8.8,3,0.18],y:90,f:1},{p:[-14,3,24],s:[12,3,0.18],f:1},
    {p:[-28,3,-14],s:[4.8,3,0.18],f:1},{p:[-24,3,-20],s:[4.8,3,0.18],f:1},
    {p:[-26,3,-17],s:[6.4,3,0.18],y:-90,f:1},{p:[-20,3,-12],s:[16,3,0.18],y:-90,f:1},
    {p:[-8,9,-2],s:[5.2,3,0.18],y:-90,f:3},{p:[5,3,-12],s:[23.6,3,0.18],y:45,f:1},
    {p:[24,3,2],s:[23.6,3,0.18],y:45,f:1},{p:[12,3,11],s:[9.6,3,0.18],y:15,f:1},
    {p:[8,3,14],s:[4.8,3,0.18],y:-90,f:1},{p:[-1,3,16],s:[16.4,3,0.18],f:1},
  ],
  floors: [
    {p:[-7,0,14],s:[86.4,0,33.6],f:0},{p:[-14,3,2],s:[46.4,0,20.8],f:1},
    {p:[-23,3,-12],s:[5.6,0,16],f:1},{p:[-11,12,16],s:[8,0,13.6],f:4},
    {p:[-11,12,27],s:[8,0,8],f:4},{p:[0,6,5],s:[8,0,3.2],f:2},
    {p:[-12,0,-3],s:[76.8,0,39.2],f:0},{p:[-15,3,13],s:[5.6,0,8],f:1},
    {p:[-18,3,20],s:[18.4,0,8],f:1},{p:[-39,0,11],s:[8,0,8],f:0},
    {p:[-27,3,-10],s:[9.6,0,8],f:1},{p:[12,3,-8],s:[31.2,0,23.2],y:-45,f:1},
    {p:[11,3,8],s:[8,0,8],y:15,f:1},
  ],
  blocks: [
    {p:[-11,0,12],s:[4.7,1,1],f:0},{p:[-24,0,12],s:[1.3,1,2.9],f:0},
    {p:[-24,3,-12],s:[4,1,1],f:1},{p:[-9,9,3],s:[1,1,1],f:3},
    {p:[-15,9,3],s:[1,1,1],f:3},{p:[-25,9,8],s:[1,1,1],f:3},
    {p:[-23,9,3],s:[1,1,1],f:3},{p:[5,9,3],s:[1,1,1],f:3},
    {p:[5,9,1],s:[1,1,1],f:3},{p:[4,9,-1],s:[1,1,1],f:3},
    {p:[-33,0,-7],s:[1.5,1,3.2],y:-15,f:0},{p:[-27,3,12],s:[19.7,1,1],f:1},
    {p:[-6,3,12],s:[12,1,1],f:1},{p:[-23,3,16],s:[12,1,1],f:1},
    {p:[-10,3,16],s:[4,1,1],f:1},{p:[-29,3,-5],s:[2.4,1.6,1],f:1},
    {p:[-31,3,-5],s:[1,1,1],f:1},{p:[-29,3,-6],s:[1,1,1],f:1},
    {p:[-30,3,-3],s:[3.9,2.2,1.5],f:1},{p:[-21,3,-16],s:[1,2.2,1],f:1},
    {p:[-20,3,-15],s:[1,2.2,1],f:1},{p:[-22,3,-15],s:[1,1.3,1],f:1},
    {p:[-28,3,-10],s:[1,1,3.2],y:-30,f:1},{p:[-10,12,16],s:[3.1,1,1],f:4},
    {p:[-13,12,13],s:[3.1,1,1],f:4},{p:[-9,12,13],s:[3.1,0.6,1.3],y:-45,f:4},
    {p:[-12,12,11],s:[3.1,0.6,1.3],y:30,f:4},{p:[-13,12,20],s:[3.1,0.6,1.3],y:30,f:4},
  ],
  ladders: [
    {p:[-33,0,4],f:0},{p:[-10,3,0],f:1},{p:[-10,6,0],f:2},{p:[-5,6,2],y:-90,f:2},
    {p:[-8,9,9],f:3},{p:[-4,3,1],y:-90,f:1},{p:[-4,6,1],y:-90,f:2},
    {p:[6,3,0],f:1},{p:[6,0,12],f:0},
  ],
  doors: [
    {p:[-34.24,0,6],y:-90,f:0},{p:[-28.68,0,11.04],f:0},{p:[-16,3,9.24],f:1},
    {p:[-13,3,9.24],f:1},{p:[-3.96,3,5],y:90,f:1},{p:[-26.04,3,-3.96],f:1},
    {p:[-22.04,3,5.22],y:-90,f:1},{p:[2.96,3,-0.02],y:-105,f:1},{p:[1.47,6,5.57],y:-105,f:2},
    {p:[-3.96,6,4.67],y:90,f:2},{p:[-27.2,3,1.16],y:180,f:1},{p:[-28.43,3,8.84],f:1},
    {p:[-26.22,3,2.81],y:-90,f:1},{p:[6.49,3,-4.69],y:165,f:1},{p:[16.08,3,-4.04],y:180,f:1},
    {p:[-11,12,23],f:4},                 // FILL: tip-room door (model left the room sealed)
  ],
};
const FH = 3;                          // floor height
const floorY = f => f*FH;

// ---- Shared systems the physics loop reads ----
const platforms = [];                  // walkable slabs: {x,z,w,d,yaw,top}
const holeList  = [];                  // vertical shafts: {x,z,r,y}
const PITS = [];                       // (no below-ground rooms in this build)
// tip finish + the two barrier gates (added below, near the tip room)
const WING = {
  gates:[ {x0:-15.2, x1:-6.8, z0:12.4, z1:14, push:12.2, y:11.4},   // platform mouth
          {x0:-13,   x1:-9,   z0:22.3, z1:23.7, push:22.1, y:11.9} ],// tip-room door (fill)
  finishY:11.9,
  finish:[ {x0:-14.8, x1:-7.2, z0:23.5, z1:31} ],                    // inside the tip room
};

// point (x,z) inside a rotated rect (deg yaw)?
function inRot(x,z, r){
  const c=Math.cos(-r.yaw*Math.PI/180), s=Math.sin(-r.yaw*Math.PI/180);
  const dx=x-r.x, dz=z-r.z;
  const lx=dx*c + dz*s, lz=-dx*s + dz*c;
  return Math.abs(lx)<=r.w/2 && Math.abs(lz)<=r.d/2;
}
function inHole(x,z,y){
  for(const h of holeList) if(Math.abs(h.y-y)<0.7 && Math.hypot(x-h.x,z-h.z)<h.r) return true;
  return false;
}
function supportedAt(x,z,y){
  for(const p of platforms) if(Math.abs(p.top-y)<0.6 && inRot(x,z,{x:p.x,z:p.z,w:p.w,d:p.d,yaw:p.yaw}) && !inHole(x,z,y)) return true;
  return false;
}

// ---- Builders ----
function addPad(w,d,x,z,ry){
  const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d), M.pad);
  p.rotation.x=-Math.PI/2; if(ry) p.rotation.z=ry;
  p.position.set(x,.03,z); p.receiveShadow=true; scene.add(p); occluders.push(p); return p;
}
function addFlood(x,y,z,i=.85,d=22,col=0xcfe2ff){
  const l=new THREE.PointLight(col,i,d); l.position.set(x,y,z); scene.add(l); return l;
}
// A wall between two world points, height h from y0, cutting a gap at any door
// (same floor) it passes. Axis-aligned open runs collapse to one box; rotated
// runs are split into short segments so their AABB colliders hug the line.
function wallLine(ax,az,bx,bz, y0,h, mat, floorIdx, thick=0.2){
  const L=Math.hypot(bx-ax,bz-az); if(L<0.05) return;
  const ux=(bx-ax)/L, uz=(bz-az)/L;
  const axisAligned = Math.abs(ux)<0.02 || Math.abs(uz)<0.02;
  const ry=Math.atan2(-uz,ux);
  const dz=floorIdx!=null ? MAP.doors.filter(d=>d.f===floorIdx) : [];
  const near=(x,z)=> dz.some(d=> Math.hypot(x-d.p[0],z-d.p[2])<0.85);
  // scan for open runs
  const step=0.3, n=Math.max(1,Math.ceil(L/step));
  let runStart=null;
  const flush=(t0,t1)=>{
    const rl=t1-t0; if(rl<0.05) return;
    const pieces = axisAligned ? 1 : Math.max(1,Math.round(rl/2));
    const pl=rl/pieces;
    for(let k=0;k<pieces;k++){
      const tc=t0+pl*(k+0.5);
      const cx=ax+ux*tc, cz=az+uz*tc;
      addBox(pl+ (axisAligned?0:0.06), h, thick, cx, y0+h/2, cz, mat, {ry});
    }
  };
  for(let i=0;i<=n;i++){
    const t=Math.min(L,i*step);
    const x=ax+ux*t, z=az+uz*t;
    const open=!near(x,z);
    if(open && runStart===null) runStart=t;
    if((!open||i===n) && runStart!==null){ flush(runStart, open?t:t-step*0.0); runStart=null; }
  }
}
// A walkable slab: registered for support (rotated-rect + hole test) and drawn.
// Holed slabs are tessellated so the hole is visible; clear slabs are one box.
function addSlab(cx,cy,cz,w,d,yaw,mat){
  platforms.push({x:cx,z:cz,w,d,yaw:yaw||0,top:cy});
  const holed = holeList.some(h=>Math.abs(h.y-cy)<0.7 && inRot(h.x,h.z,{x:cx,z:cz,w,d,yaw:yaw||0}));
  const th=0.3;
  if(!holed){ addBox(w,th,d, cx,cy-th/2,cz, mat, {ry:yaw?yaw*Math.PI/180:0, noCollide:true}); return; }
  const rr=yaw?yaw*Math.PI/180:0, c=Math.cos(rr), s=Math.sin(rr);
  const tile=3, nx=Math.ceil(w/tile), nz=Math.ceil(d/tile), tw=w/nx, td=d/nz;
  for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){
    const lx=-w/2+tw*(ix+0.5), lz=-d/2+td*(iz+0.5);
    const wx=cx+lx*Math.cos(rr)+lz*Math.sin(rr), wz=cz-lx*Math.sin(rr)+lz*Math.cos(rr);
    if(inHole(wx,wz,cy)) continue;
    addBox(tw,th,td, wx,cy-th/2,wz, mat, {ry:rr, noCollide:true});
  }
}
// climbable ladder (rails+rungs, non-colliding) + climb volume; land = the
// solid step-off point beside the shaft hole it emerges from.
function addLadder(cx,cz,base,top,land,axis='x'){
  const h=top-base, cy=(base+top)/2;
  if(axis==='x'){ addBox(.12,h,.12,cx-.55,cy,cz,M.uescDark,{noCollide:true}); addBox(.12,h,.12,cx+.55,cy,cz,M.uescDark,{noCollide:true}); }
  else{ addBox(.12,h,.12,cx,cy,cz-.55,M.uescDark,{noCollide:true}); addBox(.12,h,.12,cx,cy,cz+.55,M.uescDark,{noCollide:true}); }
  const n=Math.floor(h/0.45);
  for(let i=0;i<=n;i++){
    if(axis==='x') addBox(1.2,.09,.09,cx,base+i*0.45,cz,M.uescDark,{noCollide:true});
    else           addBox(.09,.09,1.2,cx,base+i*0.45,cz,M.uescDark,{noCollide:true});
  }
  ladders.push({x0:cx-.9,x1:cx+.9,z0:cz-1.1,z1:cz+1.1,base,top:top+.1,land});
}

// materials by role: hull-blue for the tilted corridor + tip, CTRL white else
const isHull = (p,y)=> (p[0]>0 && Math.abs((y||0)+15)<2);
const bMat = b=> isHull(b.p,b.y)? M.hull : M.ctrl;
const wMat = w=> isHull(w.p,w.y)? M.hull : (w.f>=4? M.hull : M.ctrl);

// ---- Ground (the two big f0 slabs render as the ground plane; y0 handled by
//      groundHeightAt default). Perimeter rim keeps the arena closed. ----
{
  MAP.floors.filter(f=>f.f===0).forEach(f=>{
    const g=new THREE.Mesh(new THREE.PlaneGeometry(f.s[0],f.s[2]), M.ground);
    g.rotation.x=-Math.PI/2; g.position.set(f.p[0],0.01,f.p[2]); g.receiveShadow=true;
    scene.add(g); occluders.push(g);
  });
  addBox(1.4,7,64, -61.6,3.5,2, M.rock);
  addBox(1.4,7,64, 37.2,3.5,2, M.rock);
  addBox(100,7,1.4, -12,3.5,-28.4, M.rock);
  addBox(100,7,1.4, -12,3.5,32.2, M.rock);
}

// ---- Pre-register holes (ladders + the hall atrium) BEFORE slabs so the
//      slab builder cuts them. ----
MAP.ladders.forEach(l=> holeList.push({x:l.p[0], z:l.p[2], r:1.35, y:floorY(l.f)+FH}));
MAP.buildings.filter(b=>b.open).forEach(b=>            // atrium: open the ceiling
  holeList.push({x:b.p[0], z:b.p[2], r:Math.min(b.s[0],b.s[2])/2+2, y:floorY(b.f)+FH,
                 rect:{x:b.p[0],z:b.p[2],w:b.s[0]-1,d:b.s[2]-1,yaw:b.y||0}}));

// ---- Floors / decks (elevated slabs, f>=1) ----
MAP.floors.filter(f=>f.f>=1).forEach(f=> addSlab(f.p[0],floorY(f.f),f.p[2], f.s[0],f.s[2], f.y||0, M.uescGrey));

// ---- Buildings: perimeter walls (+ floor slab if not over an atrium, + roof
//      slab on top unless the room is an atrium) ----
MAP.buildings.forEach(b=>{
  const [cx,cy0,cz]=b.p, w=b.s[0], d=b.s[2], th=Math.PI/180*(b.y||0);
  const c=Math.cos(th), s=Math.sin(th), y0=floorY(b.f);
  const cor=(lx,lz)=>[cx+lx*c+lz*s, cz-lx*s+lz*c];
  const P=[cor(-w/2,-d/2),cor(w/2,-d/2),cor(w/2,d/2),cor(-w/2,d/2)];
  for(let i=0;i<4;i++){ const a=P[i], b2=P[(i+1)%4]; wallLine(a[0],a[1],b2[0],b2[1], y0,3, bMat(b), b.f); }
  // floor: skip if an open room directly below already opened this level
  const overAtrium = MAP.buildings.some(o=>o.open && Math.abs(floorY(o.f)+FH-y0)<0.6 &&
                     Math.hypot(o.p[0]-cx,o.p[2]-cz)<Math.max(w,d)/2);
  if(b.f>=1 && !overAtrium) addSlab(cx,y0,cz, w,d, b.y||0, M.uescGrey);
  // roof: walkable top unless this room is the atrium (open to above)
  if(!b.open) addSlab(cx,y0+3,cz, w,d, b.y||0, M.uescGrey);
});

// ---- Standalone walls ----
MAP.walls.forEach(w=>{
  const [cx,,cz]=w.p, L=w.s[0], th=Math.PI/180*(w.y||0);
  const ux=Math.cos(th), uz=-Math.sin(th);        // wall runs along local +x
  wallLine(cx-ux*L/2, cz-uz*L/2, cx+ux*L/2, cz+uz*L/2, floorY(w.f), w.s[1], wMat(w), w.f, w.s[2]);
});

// ---- Blocks (solid crates; these DO collide and give stand-on tops) ----
MAP.blocks.forEach(bl=>{
  addBox(bl.s[0],bl.s[1],bl.s[2], bl.p[0], floorY(bl.f)+bl.s[1]/2, bl.p[2], M.contBlu, {ry:bl.y?bl.y*Math.PI/180:0});
});

// ---- Ladders: BlockMap stores one 3m ladder per floor; stacked ones form a
// tall climb. Merge columns (same xz) into a single continuous ladder so it
// never lands in an open atrium, then give it a solid step-off ledge. ----
{
  const cols=[];
  MAP.ladders.forEach(l=>{
    let c=cols.find(c=> Math.hypot(c.x-l.p[0], c.z-l.p[2])<1.9);
    if(!c){ c={x:l.p[0], z:l.p[2], fmin:l.f, fmax:l.f, y:l.y||0}; cols.push(c); }
    else { c.fmin=Math.min(c.fmin,l.f); c.fmax=Math.max(c.fmax,l.f); c.x=(c.x+l.p[0])/2; c.z=(c.z+l.p[2])/2; }
  });
  cols.forEach(c=>{
    const base=floorY(c.fmin), top=floorY(c.fmax)+FH;
    const axis=(Math.abs(c.y)===90)?'z':'x';
    // step-off: first of several offsets that is solid on the top level & clear
    let land=null;
    for(const [ox,oz] of [[0,1.6],[0,-1.6],[1.6,0],[-1.6,0],[1.3,1.3],[-1.3,1.3],[1.3,-1.3],[-1.3,-1.3]]){
      if(supportedAt(c.x+ox,c.z+oz, top)){ land={x:c.x+ox,y:top+0.1,z:c.z+oz}; break; }
    }
    // no solid neighbour (climb ends over open space): build a small landing ledge
    if(!land){ const lx=c.x, lz=c.z+1.6; addSlab(lx,top,lz, 2,2, 0, M.uescGrey); land={x:lx,y:top+0.1,z:lz}; }
    addLadder(c.x,c.z, base, top, land, axis);
  });
}

/* ----  FILLS (per the player's notes: make every room enterable + the run
        playable). Kept minimal and clearly separate from the imported model. ---- */

// (The tip-room door is cut by the FILL doorway added to MAP.doors above.)

// Basic interior props for the hollow buildings (a crate + a light), skipping
// the tight corridors so nothing blocks a doorway.
MAP.buildings.filter(b=>b.hollow && Math.min(b.s[0],b.s[2])>=3.5).forEach(b=>{
  const y=floorY(b.f);
  addBox(1.1,1,1.1, b.p[0]+b.s[0]*0.2, y+0.5, b.p[2]-b.s[2]*0.2, M.genBlack);
  addFlood(b.p[0], y+2.6, b.p[2], .5, Math.max(b.s[0],b.s[2])+4);
});

// Acid rooflines + a couple of station floods over the yards
addBox(46,.16,.16, -14,floorY(1)+3.05,12.3, M.acid, {noCollide:true,noShadow:true});
addBox(.16,.16,20, -37.1,floorY(1)+3.05,2, M.acid, {noCollide:true,noShadow:true});
addFlood(-14,7,2, .5, 26); addFlood(4,7,4, .5, 22); addFlood(12,6,-8, .5, 24);
addFlood(-48,6,0, .5, 26);

// Red beacon + acid trim up on the wing tip (skyline)
addBox(.9,.16,.16, -11,floorY(4)+2.4,27, M.redGlow, {noCollide:true,noShadow:true});
addBox(.16,2.4,.16, -11,floorY(4)+1.2,27, M.uescDark, {noCollide:true});
{ const l=new THREE.PointLight(0xff2331,.8,20); l.position.set(-11,floorY(4)+2.6,27); scene.add(l); }
addBox(8,.16,.16, -11,floorY(4)+3.05,31.1, M.acid, {noCollide:true,noShadow:true});

// ---- Barriers + indicator lamps at the tip (drop when the grid clears) ----
let barrier, barrier2, barrierLamps=[];
{
  const bm=new THREE.MeshBasicMaterial({color:0xff2222, transparent:true, opacity:.35, side:THREE.DoubleSide});
  barrier=new THREE.Mesh(new THREE.PlaneGeometry(8.4,3.4), bm);
  barrier.position.set(-11, floorY(4)+1.7, 13.2); scene.add(barrier);
  addBox(.4,3.8,.4, -15.2,floorY(4)+1.8,13.2, M.uescDark);
  addBox(.4,3.8,.4, -6.8,floorY(4)+1.8,13.2, M.uescDark);
  addBox(8.6,.35,.35, -11,floorY(4)+3.7,13.2, M.uescDark, {noCollide:true});
  barrier2=new THREE.Mesh(new THREE.PlaneGeometry(3.8,2.4), bm);
  barrier2.position.set(-11, floorY(4)+1.2, 23); scene.add(barrier2);
}
function buildBarrierLamps(n){
  barrierLamps.forEach(l=>scene.remove(l)); barrierLamps=[];
  const span=6.5, x0=-14.2;
  for(let i=0;i<n;i++){
    const lm=new THREE.Mesh(new THREE.SphereGeometry(.26,10,10), new THREE.MeshBasicMaterial({color:0xff2a2a}));
    lm.position.set(x0+(n>1?i*span/(n-1):span/2), floorY(4)+2.5, 22.9); scene.add(lm); barrierLamps.push(lm);
  }
}

// South plaza dressing on the ground (the deploy area) — kiosks flank the
// approach lane so the spawn stays clear straight ahead
{
  addPad(26,12, -6,22);
  [[-14,20,0],[4,20,1]].forEach(([x,z,i])=>{
    addBox(1.8,3,1.2, x,1.5,z, M.vend);
    const sgn=new THREE.Mesh(new THREE.PlaneGeometry(1.3,2.1), new THREE.MeshBasicMaterial({color:i?0x66ccff:0xffaa33}));
    sgn.position.set(x,1.55,z-0.62); sgn.rotation.y=Math.PI; scene.add(sgn);
  });
  addFlood(-6,3.6,21, .6, 15);
}
