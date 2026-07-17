'use strict';
// ---------- Player ----------
const player = {
  pos: new THREE.Vector3(-6, 0, 7),
  vel: new THREE.Vector3(),
  yaw: Math.PI, pitch: 0,
  onGround: true,
  h: 1.7, r: .45,
  speed: 7.5, sprint: 11.5,
};
const key = {};
addEventListener('keydown',e=>{
  key[e.code]=true;
  if(e.code==='KeyR' && state!=='menu') startRun(assistMode);   // restart same mode
  const m = {Digit1:1,Digit2:2,Digit3:3,Digit4:4}[e.code];       // pick / switch mode
  if(m) startRun(m);
  if(e.code==='Space' || e.code==='Tab') e.preventDefault();
  if(e.code==='Tab') showMap(true);
});
addEventListener('keyup',e=>{
  key[e.code]=false;
  if(e.code==='Tab') showMap(false);
});

const hud = document.getElementById('hud');
canvas.addEventListener('click',()=>{ if(state==='play' && document.pointerLockElement!==canvas) canvas.requestPointerLock(); });
addEventListener('mousemove',e=>{
  if(document.pointerLockElement!==canvas) return;
  player.yaw   -= e.movementX*.0022;
  player.pitch -= e.movementY*.0022;
  player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch));
});