'use strict';
// ---------- Shooting ----------
const ray = new THREE.Raycaster();
const cross = document.getElementById('cross');
const tracers=[];
addEventListener('mousedown',()=>{
  if(state!=='play' || document.pointerLockElement!==canvas) return;
  beep(190,.06,'sawtooth',.12,-120);
  recoil = 1;
  ray.setFromCamera(new THREE.Vector2(0,0), camera);
  const alive = switches.filter(s=>!s.dead);
  const targets = alive.map(s=>s.box).concat(occluders);
  const hits = ray.intersectObjects(targets, false);
  const hitPoint = hits.length? hits[0].point
    : ray.ray.origin.clone().addScaledVector(ray.ray.direction, 120);
  // muzzle flash + tracer
  const muzzle = camera.localToWorld(new THREE.Vector3(.34,-.3,-1.1));
  flashLight.position.copy(muzzle);
  flashLight.intensity = 3.2;
  const tGeo = new THREE.BufferGeometry().setFromPoints([muzzle, hitPoint]);
  const tLine = new THREE.Line(tGeo, new THREE.LineBasicMaterial({color:0xffe08a, transparent:true, opacity:.9}));
  scene.add(tLine); tracers.push({l:tLine, t:0});
  if(hits.length){
    const sw = alive.find(s=>s.box===hits[0].object);
    if(sw){
      destroySwitch(sw);
      cross.classList.add('hit'); setTimeout(()=>cross.classList.remove('hit'),120);
    }
  }
});

let destroyed=0, splitTimes=[], particles=[];
function destroySwitch(sw){
  sw.dead = true;
  sw.sq.material.color.set(0x223300);
  sw.glow.intensity = 0;
  sw.box.material = M.uescDark;
  for(let i=0;i<16;i++){
    const p = new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.12),
      new THREE.MeshBasicMaterial({color: i%3? 0xff5533 : 0xffcc66}));
    p.position.copy(sw.group.position);
    p.userData.v = new THREE.Vector3((Math.random()-.5)*7,Math.random()*5.5,(Math.random()-.5)*7);
    p.userData.t = 0;
    scene.add(p); particles.push(p);
  }
  destroyed++;
  splitTimes.push(elapsed());
  document.getElementById('l'+(destroyed-1)).classList.add('off');
  barrierLamps[destroyed-1].material.color.set(0x224400);
  document.getElementById('scount').textContent = destroyed+'/5';
  beep(500+destroyed*120,.12,'square',.18);
  flash(destroyed<5 ? 'BATTERY '+destroyed+'/5 DOWN' : 'BARRIER OFFLINE - GO GO GO');
  if(destroyed===5){
    barrier.visible = false;
    beep(220,.5,'sawtooth',.2,600);
  }
}

function flash(t){
  const m=document.getElementById('msg');
  m.textContent=t; m.style.opacity=1;
  clearTimeout(m._t); m._t=setTimeout(()=>m.style.opacity=0,1500);
}