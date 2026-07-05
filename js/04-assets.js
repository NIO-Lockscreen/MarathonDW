'use strict';
// ---------- GLB models ----------
const loader = new THREE.GLTFLoader();
let assetsPending = 3;
const loadnote = document.getElementById('loadnote');
function assetDone(){
  assetsPending--;
  if(assetsPending<=0) loadnote.textContent = 'assets ready';
}
function loadGLB(key, onOk){
  loader.load(MODELS[key], gltf=>{
    gltf.scene.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
    onOk(gltf.scene); assetDone();
  }, undefined, err=>{ console.warn('model failed:',key,err); assetDone(); });
}

// Truck at its spawn point
loadGLB('truck', obj=>{
  obj.scale.setScalar(2.1);
  obj.position.set(truckPos.x, 0, truckPos.z);
  obj.rotation.y = Math.PI*.02;
  scene.add(obj);
  obj.traverse(o=>{ if(o.isMesh) occluders.push(o); });
});

// Patrol scan drones
const drones=[];
loadGLB('drone', obj=>{
  for(let i=0;i<3;i++){
    const d = obj.clone(true);
    d.scale.setScalar(2.2);
    const light = new THREE.PointLight(0xff4030, .9, 12);
    light.position.y = -0.5;
    d.add(light);
    scene.add(d);
    drones.push({o:d, a:i*2.1, r:26+i*8, h:13+i*2.5, s:.14+i*.03, l:light});
  }
});

// First-person blaster viewmodel
let viewmodel=null, recoil=0;
loadGLB('blaster', obj=>{
  obj.scale.setScalar(.55);
  obj.rotation.y = Math.PI;
  obj.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=false; } });
  viewmodel = new THREE.Group();
  viewmodel.add(obj);
  obj.position.set(0,0,0);
  camera.add(viewmodel);
  viewmodel.position.set(.34,-.34,-.62);
  scene.add(camera);
});
// muzzle flash
const flashLight = new THREE.PointLight(0xffcc66, 0, 10);
scene.add(flashLight);