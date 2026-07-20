'use strict';
// ---------- Map overlay ----------
// Tac map of the imported arena: north-up, drawn straight from MAP (building /
// floor footprints, rotated where the model is) with all 31 targets as
// numbered colored dots. Map-assist modes ring the run's live targets.
const mapDiv = document.getElementById('map');
const mapcv = document.getElementById('mapcv');
const MAPW = 540, MAPH = 420;
function showMap(on){
  if(state!=='play'){ mapDiv.style.display='none'; return; }
  mapDiv.style.display = on? 'block':'none';
  if(on){
    document.getElementById('maptitle').textContent =
      MODES[assistMode].mapActive ? 'TAC MAP // LIVE TARGETS RINGED' : 'TAC MAP // ALL '+SPAWNS.length+' SPAWNS';
    drawMap();
  }
}
// world -> map px. Window: x -62..38, z -29..33 (north = -z = up)
function w2m(x,z){ return [ (x+62)*MAPW/100, (z+29)*MAPH/62 ]; }

function drawMap(){
  const g = mapcv.getContext('2d');
  g.fillStyle='#0c1522'; g.fillRect(0,0,MAPW,MAPH);
  g.strokeStyle='rgba(40,58,82,.35)'; g.lineWidth=1;
  for(let i=0;i<=10;i++){ const x=i*MAPW/10; g.beginPath(); g.moveTo(x,0); g.lineTo(x,MAPH); g.stroke(); }
  for(let i=0;i<=8;i++){ const y=i*MAPH/8; g.beginPath(); g.moveTo(0,y); g.lineTo(MAPW,y); g.stroke(); }

  // filled rotated rectangle footprint (world center, size, yaw deg)
  function foot(cx,cz,w,d,yaw, fill,stroke,dash){
    const r=(yaw||0)*Math.PI/180, c=Math.cos(r), s=Math.sin(r);
    const cor=[[ -w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([lx,lz])=>
      w2m(cx+lx*c+lz*s, cz-lx*s+lz*c));
    g.save(); if(dash) g.setLineDash([5,4]);
    g.beginPath(); g.moveTo(cor[0][0],cor[0][1]);
    for(let i=1;i<4;i++) g.lineTo(cor[i][0],cor[i][1]);
    g.closePath();
    if(fill){ g.fillStyle=fill; g.fill(); }
    if(stroke){ g.strokeStyle=stroke; g.lineWidth=1.2; g.stroke(); }
    g.restore();
  }

  // ground floor slabs (dark), then elevated decks (mid), then buildings by floor
  const gnd='rgba(28,40,58,.9)', deck='rgba(120,138,160,.34)', dline='#5a6c84';
  MAP.floors.filter(f=>f.f===0).forEach(f=> foot(f.p[0],f.p[2],f.s[0],f.s[2],f.y, gnd,null));
  MAP.floors.filter(f=>f.f>=1).forEach(f=> foot(f.p[0],f.p[2],f.s[0],f.s[2],f.y, deck,dline));
  // buildings — brighter with height so stacking reads
  const shade=f=>['rgba(150,168,192,.5)','rgba(170,186,210,.6)','rgba(150,175,220,.6)','rgba(120,150,210,.6)','rgba(90,130,205,.7)'][f]||deck;
  MAP.buildings.sort((a,b)=>a.f-b.f).forEach(b=> foot(b.p[0],b.p[2],b.s[0],b.s[2],b.y, shade(b.f),'#8fa3bd'));
  // tip room outline (finish) in acid
  foot(-11,27,8,8,0, null,'#c8ff00',true);

  // barrier gate markers
  WING.gates.forEach(GT=>{
    const [ax,ay]=w2m(GT.x0,(GT.z0+GT.z1)/2),[bx]=w2m(GT.x1,(GT.z0+GT.z1)/2);
    g.strokeStyle='#ff5a5a'; g.lineWidth=2; g.beginPath(); g.moveTo(ax,ay); g.lineTo(bx,ay); g.stroke();
  });

  // all spawns — numbered colored dots
  const t=performance.now();
  SPAWNS.forEach((s,i)=>{
    const [x,y]=w2m(s.p[0],s.p[2]); const col=SETCOL[s.set];
    const live=switches.find(w=>w.idx===i);
    if(live && MODES[assistMode].mapActive){
      g.strokeStyle=live.dead?'rgba(120,140,120,.5)':'rgba(200,255,0,'+(.55+.45*Math.sin(t*.006))+')';
      g.lineWidth=2; g.beginPath(); g.arc(x,y,7.5,0,7); g.stroke();
    }
    g.beginPath(); g.arc(x,y,4.2,0,7);
    g.fillStyle=(live&&live.dead)?'#26303d':col; g.fill();
    g.strokeStyle='#0c1522'; g.lineWidth=1.4; g.stroke();
    g.fillStyle=(live&&live.dead)?'rgba(140,155,175,.6)':col; g.font='bold 10px monospace';
    g.fillText(s.num, x+6, y-3);
  });

  // legend (counts from the pool) + compass
  g.font='bold 10px monospace'; let lx=10;
  Object.keys(SETCOL).forEach(nm=>{
    const n=SPAWNS.filter(s=>s.set===nm).length;
    g.fillStyle=SETCOL[nm]; g.beginPath(); g.arc(lx+4,MAPH-12,4,0,7); g.fill();
    g.fillText(nm+' '+n, lx+11, MAPH-8);
    lx += 11 + g.measureText(nm+' '+n).width + 12;
  });
  g.fillStyle='#9fb3cf'; g.font='bold 11px monospace'; g.fillText('N',8,16);
  g.beginPath(); g.moveTo(11,20); g.lineTo(15,30); g.lineTo(7,30); g.closePath(); g.fill();

  // player
  const [ux,uy]=w2m(player.pos.x,player.pos.z);
  g.fillStyle='#fff'; g.save(); g.translate(ux,uy); g.rotate(-player.yaw);
  g.beginPath(); g.moveTo(0,-8); g.lineTo(5,6); g.lineTo(-5,6); g.closePath(); g.fill();
  g.restore();
}
