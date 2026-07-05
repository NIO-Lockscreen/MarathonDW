'use strict';
// ---------- Map overlay ----------
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
function w2m(x,z){ // world -> map px. world x -50..50, z -50..95 (+z up)
  return [ (x+50)/100*420, 560 - (z+50)/145*560 ];
}
function drawMap(){
  const g = mapcv.getContext('2d');
  g.clearRect(0,0,420,560);
  g.fillStyle='rgba(10,14,10,1)'; g.fillRect(0,0,420,560);
  function rect(x0,z0,x1,z1,label){
    const [ax,ay]=w2m(x0,z1), [bx,by]=w2m(x1,z0);
    g.strokeStyle='#3a5a3a'; g.strokeRect(ax,ay,bx-ax,by-ay);
    if(label){ g.fillStyle='#5a8a5a'; g.font='9px monospace'; g.fillText(label, ax+3, ay+11); }
  }
  g.strokeStyle='#3a5a3a';
  const [px,py]=w2m(0,72); g.beginPath(); g.arc(px,py, 420*16/100, 0, 7); g.stroke();
  g.fillStyle='#5a8a5a'; g.font='9px monospace'; g.fillText('PINWHEEL', px-24, py);
  // Orientation is a two-floor building; the wing crash lands OVER its roof
  rect(-17,-26,17,-2,'ORIENTATION 2F');
  rect(-30.5,-28,-20.5,-16,'GARAGE');
  rect(-32.5,-20,-23.5,20,'TRENCH');
  rect(-34,-6,-22,6,'FLIGHT CTRL');
  rect(34,-15,46,-1,'DORMITORIES');
  rect(19,-10.5,33,-5.5,'');
  rect(-21,-42,-9,-32,'CARGO BAY');
  rect(-45,10,45,3,''); // road hint? skip label
  // Destroyed Wing deck (elevated) — dashed, drawn OVER the Orientation footprint
  {
    const [ax,ay]=w2m(-8,30), [bx,by]=w2m(8,-14);
    g.save();
    g.setLineDash([5,4]); g.lineWidth=1.5; g.strokeStyle='#c8ff00';
    g.strokeRect(ax,ay,bx-ax,by-ay);
    g.restore();
    g.fillStyle='#c8ff00'; g.font='9px monospace'; g.fillText('DESTROYED WING', ax+3, ay+11);
    // barrier line at z=24
    const [q0x,q0y]=w2m(-8,24), [q1x]=w2m(8,24);
    g.strokeStyle='#ff5a5a'; g.beginPath(); g.moveTo(q0x,q0y); g.lineTo(q1x,q0y); g.stroke();
  }
  // Live targets — only revealed by the modes that allow map assist
  if(MODES[assistMode].mapActive){
    switches.forEach(s=>{
      const [x,y]=w2m(s.group.position.x, s.group.position.z);
      g.beginPath(); g.arc(x,y,5,0,7);
      g.strokeStyle = '#c8ff00';
      if(s.dead){ g.fillStyle='#3a5a3a'; g.fill(); } else { g.fillStyle='rgba(200,255,0,.35)'; g.fill(); }
      g.stroke();
    });
  }
  // player (arrow points the way the player faces; +z is up here)
  const [ux,uy]=w2m(player.pos.x, player.pos.z);
  g.fillStyle='#fff';
  g.save(); g.translate(ux,uy); g.rotate(player.yaw + Math.PI);
  g.beginPath(); g.moveTo(0,-8); g.lineTo(5,6); g.lineTo(-5,6); g.closePath(); g.fill();
  g.restore();
}
