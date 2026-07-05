'use strict';
// ---------- Map overlay (recon style, matches the ground-truth tac map) ----------
const mapDiv = document.getElementById('map');
const mapcv = document.getElementById('mapcv');
function showMap(on){
  if(state!=='play'){ mapDiv.style.display='none'; return; }
  mapDiv.style.display = on? 'block':'none';
  if(on){
    document.getElementById('maptitle').textContent =
      MODES[assistMode].mapActive ? 'TAC MAP // LIVE TARGETS' : 'TAC MAP // TERRAIN';
    drawMap();
  }
}
// World -> map px. +x is right, +z is DOWN (so the Destroyed Wing reads toward
// the bottom, like the reference). World x -50..50, z -50..95.
function w2m(x,z){ return [ (x+50)/100*420, (z+50)/145*560 ]; }

function drawMap(){
  const g = mapcv.getContext('2d');
  const W=420, H=560;
  g.clearRect(0,0,W,H);
  g.fillStyle='#0b1220'; g.fillRect(0,0,W,H);
  // faint recon grid
  g.strokeStyle='rgba(90,120,170,.12)'; g.lineWidth=1;
  for(let x=0;x<=W;x+=30){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,H); g.stroke(); }
  for(let y=0;y<=H;y+=30){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); }

  function bldg(x0,z0,x1,z1, fill, label, lc){
    const [ax,ay]=w2m(Math.min(x0,x1),Math.min(z0,z1));
    const [bx,by]=w2m(Math.max(x0,x1),Math.max(z0,z1));
    g.fillStyle=fill; g.fillRect(ax,ay,bx-ax,by-ay);
    g.strokeStyle='rgba(180,205,240,.35)'; g.lineWidth=1; g.strokeRect(ax,ay,bx-ax,by-ay);
    if(label){ g.fillStyle=lc||'#cfe0f5'; g.font='bold 10px monospace'; g.fillText(label, ax+4, ay+13); }
  }

  // Outbuildings
  const b1='#7f93b0', b2='#6b7f9c';
  bldg(-32.5,-20,-23.5,20, b2, 'TRENCH');
  bldg(-34,-6,-22,6,       b1, 'FLIGHT CTRL');
  bldg(-30.5,-28,-20.5,-16,b1, 'GARAGE');
  bldg(34,-15,46,-1,       b1, 'DORMITORIES');
  bldg(19,-10.5,33,-5.5,   b2, '');
  bldg(-21,-42,-9,-32,     b1, 'CARGO BAY');

  // Pinwheel core
  const [px,py]=w2m(0,72);
  g.fillStyle='#5a6f92'; g.beginPath(); g.arc(px,py, 420*13/100, 0, 7); g.fill();
  g.fillStyle='#cfe0f5'; g.font='bold 10px monospace'; g.fillText('PINWHEEL', px-26, py);

  // Orientation — the two-floor building (brighter)
  bldg(-17,-26,17,-2, '#9fb2cf', '');

  // Destroyed Wing (elevated) — translucent blue OVER the Orientation footprint
  {
    const [ax,ay]=w2m(-8,-14), [bx,by]=w2m(8,30);
    g.fillStyle='rgba(58,120,205,.45)'; g.fillRect(ax,ay,bx-ax,by-ay);
    g.save(); g.setLineDash([5,4]); g.strokeStyle='#8ec5ff'; g.lineWidth=1.5;
    g.strokeRect(ax,ay,bx-ax,by-ay); g.restore();
    // barrier line (z=24)
    const [q0x,q0y]=w2m(-8,24), [q1x]=w2m(8,24);
    g.strokeStyle='#ff5a5a'; g.lineWidth=2; g.beginPath(); g.moveTo(q0x,q0y); g.lineTo(q1x,q0y); g.stroke();
    g.fillStyle='#dfeeff'; g.font='bold 11px monospace'; g.fillText('DESTROYED WING', ax-8, by+2);
  }

  // ORIENTATION label + yellow dotted line (decorative, like the reference)
  g.fillStyle='#ffd23a'; g.font='bold 13px monospace'; g.fillText('ORIENTATION', 250, 30);
  {
    const [sx,sy]=w2m(18,-6), [ex,ey]=w2m(48,-42), steps=14;
    for(let i=0;i<=steps;i++){
      const x=sx+(ex-sx)*i/steps, y=sy+(ey-sy)*i/steps;
      g.beginPath(); g.arc(x,y,2.2,0,7); g.fill();
    }
  }

  // Targets — only when the current mode reveals them
  if(MODES[assistMode].mapActive){
    switches.forEach(s=>{
      const [x,y]=w2m(s.group.position.x, s.group.position.z);
      g.lineWidth=2;
      if(s.dead){ g.strokeStyle='#5a8a5a'; g.fillStyle='rgba(70,120,80,.45)'; }
      else      { g.strokeStyle='#7ecbff'; g.fillStyle='rgba(90,180,255,.35)'; }
      g.fillRect(x-5,y-5,10,10); g.strokeRect(x-5,y-5,10,10);
      if(s.dead){ g.strokeStyle='#9fe0a0'; g.beginPath(); g.moveTo(x-3,y); g.lineTo(x-1,y+3); g.lineTo(x+4,y-3); g.stroke(); }
    });
  }

  // Player arrow (points the way the player faces; +z is down here)
  const [ux,uy]=w2m(player.pos.x, player.pos.z);
  g.save(); g.translate(ux,uy); g.rotate(-player.yaw);
  g.fillStyle='#fff'; g.strokeStyle='#0b1220'; g.lineWidth=1.5;
  g.beginPath(); g.moveTo(0,-9); g.lineTo(6,7); g.lineTo(0,3); g.lineTo(-6,7); g.closePath();
  g.fill(); g.stroke();
  g.restore();
}
