'use strict';
// ---------- Map overlay ----------
// Guide-style tac map of the rebuilt arena: north-up, all 40 button spawns
// drawn as numbered colored dots. Modes with map assist additionally ring the
// run's live targets.
const mapDiv = document.getElementById('map');
const mapcv = document.getElementById('mapcv');
const MAPW = 540, MAPH = 420;
function showMap(on){
  if(state!=='play'){ mapDiv.style.display='none'; return; }
  mapDiv.style.display = on? 'block':'none';
  if(on){
    document.getElementById('maptitle').textContent =
      MODES[assistMode].mapActive ? 'TAC MAP // LIVE TARGETS RINGED' : 'TAC MAP // ALL 40 SPAWNS';
    drawMap();
  }
}
// world -> map px. Window: x -52..38, z -29..32 (north = -z = up)
function w2m(x,z){ return [ (x+52)*MAPW/90, (z+29)*MAPH/61 ]; }

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
  // rotated box footprint (the hull corridor / fin / sign): world center,
  // length, width, yaw -> filled polygon
  function rotRect(cx,cz,len,wid,yaw, fill, stroke){
    const dx=Math.sin(yaw), dz=Math.cos(yaw), lx=Math.cos(yaw), lz=-Math.sin(yaw);
    const c=[[ 1, 1],[ 1,-1],[-1,-1],[-1, 1]].map(([a,b])=>
      w2m(cx + dx*a*len/2 + lx*b*wid/2, cz + dz*a*len/2 + lz*b*wid/2));
    g.beginPath(); g.moveTo(c[0][0],c[0][1]);
    for(let i=1;i<4;i++) g.lineTo(c[i][0],c[i][1]);
    g.closePath();
    if(fill){ g.fillStyle=fill; g.fill(); }
    if(stroke){ g.strokeStyle=stroke; g.lineWidth=1.3; g.stroke(); }
  }

  // ground roads
  const road='rgba(46,62,88,.9)';
  rect(-25,16,5,26, road);            // south plaza road
  rect(-34,-24,-26,-4, road);         // NW approach
  rect(9,-2,19,14, road);             // east yard
  rect(21,-4,33,2, road);             // depot apron

  // B1 rooms (below ground) — dashed green
  rect(-34.2,3,-25.8,11, 'rgba(30,52,40,.55)', '#4d8a62', 'B1', true);
  rect(-32,19,-18,27,   'rgba(30,52,40,.55)', '#4d8a62', 'B1', true);

  // the deck (y3 slab) — pale field with the undercroft open beneath
  rect(-37.2,-6.4,9.2,14.4, 'rgba(120,138,160,.35)', '#66788e', 'DECK');
  // north walkway + end stairs + sign
  rect(-25.8,-20,-20.2,-4, 'rgba(120,150,210,.8)', null, 'WALKWAY');
  rect(-25.8,-24.8,-20.2,-20, 'rgba(90,110,150,.7)', null);
  rotRect(-21,-19, 5.2,.9, -Math.PI/6, '#2fd8c4', null);
  // walkway booth
  rect(-26.8,-9,-25.2,-5, 'rgba(190,205,224,.85)', '#8fa3bd');

  // structures on / around the deck
  const bld='rgba(190,205,224,.82)', bs='#8fa3bd', dark='rgba(70,84,102,.9)';
  rect(-34.2,3,-25.8,11, bld, bs);                        // west quarters (ground story)
  rect(-26,.8,-4,9.2, bld, bs, 'HALL');                   // the two-story hall
  rect(-22,4,-18,8, dark, '#55657c');                     // store room
  rect(-12,8.6,-8,13.4, 'rgba(70,110,205,.72)', '#7fa6ff'); // overlook pod
  rect(-14.4,9,-5.6,11, dark, null);                      // covered alley
  rect(-37.8,15.8,-.2,16.2, dark, null);                  // plaza boundary wall
  // the tilted hull corridor (the crashed wing body)
  rotRect(4,4, 16.4,4.2, -Math.PI/12, 'rgba(70,110,205,.72)', '#7fa6ff');
  // wing tip platform + room (the finish) — acid dash
  rect(-15,9.2,-7,31.2, 'rgba(70,110,205,.55)', '#7fa6ff', 'WING TIP');
  rect(-15,23,-7,31.2, null, '#c8ff00', null, true);
  // east annex
  rect(14,-7,18,-3, bld, bs);                             // sealed hut
  rotRect(16,-13, 10.4,.9, -Math.PI/4, 'rgba(70,110,205,.8)', null); // hull fin
  rect(DEPOT.x0,DEPOT.z0,DEPOT.x1,DEPOT.z1, bld, bs, 'DEPOT');
  rect(26,-9,34,-4, bld, bs);                             // dorm block
  rect(34.7,-1,36.1,13, dark, '#55657c');                 // east gate wall
  rect(-9.3,19.9,-5.3,21.3, dark, '#55657c');             // kiosk pair

  WING.gates.forEach(GT=>{ // barrier gate markers
    const [ax,ay]=w2m(GT.x0, (GT.z0+GT.z1)/2), [bx]=w2m(GT.x1, (GT.z0+GT.z1)/2);
    g.strokeStyle='#ff5a5a'; g.lineWidth=2;
    g.beginPath(); g.moveTo(ax,ay); g.lineTo(bx,ay); g.stroke();
  });

  // all 40 documented spawns — numbered colored dots (the placement guide)
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

  // legend (counts computed from the pool) + compass
  g.font='bold 10px monospace';
  let lx=10;
  Object.keys(SETCOL).forEach(nm=>{
    const n = SPAWNS.filter(s=>s.set===nm).length;
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
