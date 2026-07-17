'use strict';
// ---------- Map overlay ----------
// Guide-style tac map: north-up, navy ground, sea to the NE, and ALL 39
// documented button spawns drawn as numbered colored dots (like the community
// guide). Modes with map assist additionally ring the run's live targets.
const mapDiv = document.getElementById('map');
const mapcv = document.getElementById('mapcv');
const MAPW = 540, MAPH = 420;
function showMap(on){
  if(state!=='play'){ mapDiv.style.display='none'; return; }
  mapDiv.style.display = on? 'block':'none';
  if(on){
    document.getElementById('maptitle').textContent =
      MODES[assistMode].mapActive ? 'TAC MAP // LIVE TARGETS RINGED' : 'TAC MAP // ALL 39 SPAWNS';
    drawMap();
  }
}
// world -> map px. Window: x -70..80, z -78..38 (north = -z = up)
function w2m(x,z){ return [ (x+70)*MAPW/150, (z+78)*MAPH/116 ]; }

function drawMap(){
  const g = mapcv.getContext('2d');
  g.fillStyle='#0c1522'; g.fillRect(0,0,MAPW,MAPH);
  // faint grid
  g.strokeStyle='rgba(40,58,82,.35)'; g.lineWidth=1;
  for(let i=0;i<=10;i++){ const x=i*MAPW/10; g.beginPath(); g.moveTo(x,0); g.lineTo(x,MAPH); g.stroke(); }
  for(let i=0;i<=8;i++){ const y=i*MAPH/8; g.beginPath(); g.moveTo(0,y); g.lineTo(MAPW,y); g.stroke(); }

  function rect(x0,z0,x1,z1, fill, stroke, label, dash){
    const [ax,ay]=w2m(x0,z0), [bx,by]=w2m(x1,z1);
    g.save();
    if(dash) g.setLineDash([5,4]);
    if(fill){ g.fillStyle=fill; g.fillRect(ax,ay,bx-ax,by-ay); }
    if(stroke){ g.strokeStyle=stroke; g.lineWidth=1.3; g.strokeRect(ax,ay,bx-ax,by-ay); }
    g.restore();
    if(label){ g.fillStyle='#9fb3cf'; g.font='9px monospace'; g.fillText(label, ax+3, ay+11); }
  }

  // sea + shoreline contours (NE)
  rect(16,-78,80,-14, '#070d17', null);
  g.strokeStyle='#2c4a66'; g.lineWidth=1.4;
  [0,7].forEach(off=>{
    const [ax,ay]=w2m(16+off,-78), [bx,by]=w2m(16+off,-14-off*.6);
    g.beginPath(); g.moveTo(ax,ay);
    g.bezierCurveTo(ax+26,ay+90, ax-14,by-120, ax+40,by);
    const [cx2]=w2m(80,-14-off);
    g.lineTo(cx2,by); g.stroke();
  });

  // roads
  const road='rgba(46,62,88,.9)';
  rect(-34,2,14,10, road);            // south plaza
  rect(-46,-8,-38,14, road);          // southwest approach
  rect(-36,-24,-24,-6, road);         // junction
  rect(-26.5,-46,-19.5,-24, road);    // north road lower
  rect(-22,-64,4,-46, road);          // north road upper (approx)
  rect(-3,-72,11,-62, road);          // tip pad
  rect(10,-1,50,7, road);             // east bridge road
  rect(50,3,72,11, road);             // far-east pass
  rect(4,10,20,30, road);             // southeast yard

  // B1 rooms (below ground) — dashed green
  rect(-61,-29,-47,-15, 'rgba(30,52,40,.55)', '#4d8a62', 'B1', true);
  rect(-35,-1,-15,11,  'rgba(30,52,40,.55)', '#4d8a62', 'B1', true);

  // structures
  const bld='rgba(190,205,224,.82)', bs='#8fa3bd', dark='rgba(70,84,102,.9)';
  rect(-66,-78,-42,-38, dark, '#55657c', 'G');            // NW mega-structure
  rect(-60,-19.5,-57,-16.5, bld, bs);                     // west huts
  rect(-57.8,-27,-54.2,-24, bld, bs);
  rect(-54.5,-25,-46.5,-18, bld, bs);
  rect(-37.2,-17.8,-32.3,-15.4, dark, '#55657c');         // container stack (purple 3)
  rect(-22.2,-42,-16,-37, 'rgba(31,179,163,.8)', '#2fd8c4'); // ORTN garage
  rect(OR.x0,OR.z0,OR.x1,OR.z1, bld, bs, 'ORIENTATION 2F');
  rect(13,-10,18,-5, bld, bs);                            // sealed hut
  rect(-15.5,3.9,-11.3,6.3, dark, '#55657c');             // kiosk
  rect(DEPOT.x0,DEPOT.z0,DEPOT.x1,DEPOT.z1, bld, bs, 'DEPOT');
  rect(52,-6,64,2, bld, bs);                              // far-east blocks
  rect(52,4,58,14, bld, bs);
  rect(72,0,74,14, dark, '#55657c');                      // east gate wall
  rect(-60,26,-50,34, bld, bs);                           // SW yard
  rect(-45.5,21,-39.5,29, dark, '#55657c');
  rect(8.5,23.2,14.8,31.8, dark, '#55657c');              // SE containers

  // Destroyed Wing — blue-highlighted like the guide; acid dash = top deck
  rect(WING.x0,WING.z0,WING.x1,WING.z1, 'rgba(70,110,205,.72)', '#7fa6ff', 'DESTROYED WING');
  rect(-28,20,8,32, null, '#c8ff00', null, true);
  rect(-8.9,2,-7.1,19.5, 'rgba(120,150,210,.85)', null);  // roof walkway to the north door
  WING.gates.forEach(GT=>{ // barrier gate markers
    const [ax,ay]=w2m(GT.x0, (GT.z0+GT.z1)/2), [bx]=w2m(GT.x1, (GT.z0+GT.z1)/2);
    g.strokeStyle='#ff5a5a'; g.lineWidth=2;
    g.beginPath(); g.moveTo(ax,ay); g.lineTo(bx,ay); g.stroke();
  });

  // all 39 documented spawns — numbered colored dots (the placement guide)
  const t = performance.now();
  SPAWNS.forEach((s,i)=>{
    const [x,y]=w2m(s.p[0], s.p[2]);
    const col = SETCOL[s.set];
    const live = switches.find(w=> w.idx===i);
    if(live && MODES[assistMode].mapActive){
      g.strokeStyle = live.dead? 'rgba(120,140,120,.5)' : 'rgba(200,255,0,'+(.55+.45*Math.sin(t*.006))+')';
      g.lineWidth=2; g.beginPath(); g.arc(x,y,7.5,0,7); g.stroke();
    }
    g.beginPath(); g.arc(x,y,4.2,0,7);
    g.fillStyle = (live && live.dead)? '#26303d' : col;
    g.fill();
    g.strokeStyle='#0c1522'; g.lineWidth=1.4; g.stroke();
    g.fillStyle = (live && live.dead)? 'rgba(140,155,175,.6)' : col;
    g.font='bold 10px monospace';
    g.fillText(s.num, x+6, y-3);
  });

  // legend + compass
  g.font='bold 10px monospace';
  let lx=10;
  [['PURPLE',8],['BLUE',12],['GREEN',8],['RED',11]].forEach(([nm,n])=>{
    g.fillStyle=SETCOL[nm];
    g.beginPath(); g.arc(lx+4, MAPH-12, 4, 0, 7); g.fill();
    g.fillText(nm+' '+n, lx+11, MAPH-8);
    lx += 11 + g.measureText(nm+' '+n).width + 12;
  });
  g.fillStyle='#9fb3cf'; g.font='bold 11px monospace'; g.fillText('N', 8, 16);
  g.beginPath(); g.moveTo(11,20); g.lineTo(15,30); g.lineTo(7,30); g.closePath(); g.fill();

  // player (north-up: yaw 0 faces up)
  const [ux,uy]=w2m(player.pos.x, player.pos.z);
  g.fillStyle='#fff';
  g.save(); g.translate(ux,uy); g.rotate(-player.yaw);
  g.beginPath(); g.moveTo(0,-8); g.lineTo(5,6); g.lineTo(-5,6); g.closePath(); g.fill();
  g.restore();
}
