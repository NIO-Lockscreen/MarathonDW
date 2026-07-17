'use strict';
// ---------- Canvas textures ----------
function makeTex(draw, w=256, h=256, repX=1, repY=1){
  const cv=document.createElement('canvas'); cv.width=w; cv.height=h;
  draw(cv.getContext('2d'), w, h);
  const t=new THREE.CanvasTexture(cv);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.repeat.set(repX,repY);
  t.encoding=THREE.sRGBEncoding;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}
const groundTex = makeTex((g,w,h)=>{
  g.fillStyle='#4c4842'; g.fillRect(0,0,w,h);
  for(let i=0;i<2600;i++){
    g.fillStyle='rgba('+(60+Math.random()*40|0)+','+(56+Math.random()*36|0)+','+(50+Math.random()*30|0)+',.35)';
    g.fillRect(Math.random()*w, Math.random()*h, 2, 2);
  }
  g.strokeStyle='rgba(30,28,26,.5)'; g.lineWidth=2;
  g.strokeRect(0,0,w,h);
},256,256, 40,40);
const panelTex = makeTex((g,w,h)=>{
  g.fillStyle='#d8d6cf'; g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(120,118,112,.7)'; g.lineWidth=3;
  for(let x=0;x<=w;x+=64) { g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); }
  for(let y=0;y<=h;y+=64) { g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
  for(let i=0;i<26;i++){
    g.fillStyle='rgba(90,88,84,.18)';
    const x=Math.random()*w, y=Math.random()*h;
    g.fillRect(x, y, 3+Math.random()*4, 18+Math.random()*46);
  }
  for(let i=0;i<8;i++){
    g.fillStyle='rgba(160,158,150,.5)';
    g.fillRect((Math.random()*w)|0, (Math.random()*h)|0, 10, 4);
  }
},256,256, 2,1);
const darkPanelTex = makeTex((g,w,h)=>{
  g.fillStyle='#8f9296'; g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(60,62,66,.8)'; g.lineWidth=3;
  for(let x=0;x<=w;x+=86) { g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); }
  for(let y=0;y<=h;y+=64) { g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
  for(let i=0;i<20;i++){
    g.fillStyle='rgba(58,60,64,.22)';
    g.fillRect(Math.random()*w, Math.random()*h, 4, 20+Math.random()*40);
  }
},256,256, 2,1);
const containerTex = makeTex((g,w,h)=>{
  g.fillStyle='#fff'; g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(0,0,0,.28)'; g.lineWidth=6;
  for(let x=12;x<w;x+=28){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); }
},128,128, 2,1);
// White station panel with the CTRL wordmark + acid stripe (Outpost branding)
const ctrlTex = makeTex((g,w,h)=>{
  g.fillStyle='#e2e4e0'; g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(105,110,108,.5)'; g.lineWidth=3;
  for(let x=0;x<=w;x+=64){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); }
  for(let y=0;y<=h;y+=86){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
  for(let i=0;i<18;i++){
    g.fillStyle='rgba(120,124,120,.16)';
    g.fillRect(Math.random()*w, Math.random()*h, 4, 16+Math.random()*40);
  }
  g.fillStyle='#c8e82a'; g.fillRect(0,h-18,w,8);                    // acid skirt stripe
  g.fillStyle='#1c2024'; g.font='bold 34px monospace';
  g.fillText('C T R L', 96, 52);
  g.strokeStyle='#1c2024'; g.lineWidth=4; g.strokeRect(86,22,120,40);
  g.beginPath(); g.arc(48,42,20,0,7); g.stroke();                   // roundel
  g.fillRect(148,h-52,58,10);                                       // data bar
},256,256, 2,1);
// Deep-blue ship hull plating with white service decals + acid chevron
const hullTex = makeTex((g,w,h)=>{
  g.fillStyle='#14307c'; g.fillRect(0,0,w,h);
  for(let i=0;i<12;i++){
    g.fillStyle='rgba(35,72,178,'+(0.25+Math.random()*0.35)+')';
    g.fillRect((Math.random()*w)|0, (Math.random()*h)|0, 40+Math.random()*70, 26+Math.random()*44);
  }
  g.strokeStyle='rgba(8,16,44,.85)'; g.lineWidth=3;
  for(let x=0;x<=w;x+=86){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); }
  for(let y=0;y<=h;y+=64){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
  g.fillStyle='rgba(238,242,246,.92)';
  g.font='bold 17px monospace'; g.fillText('000V@1S2', 18, 40);
  g.fillRect(18,52,64,6); g.fillRect(150,120,10,10); g.fillRect(166,120,10,10);
  g.beginPath(); g.arc(200,52,14,0,7); g.strokeStyle='rgba(238,242,246,.9)'; g.lineWidth=4; g.stroke();
  g.fillStyle='#c8e82a';                                            // acid chevron
  g.beginPath(); g.moveTo(40,210); g.lineTo(70,180); g.lineTo(84,180);
  g.lineTo(54,210); g.closePath(); g.fill();
},256,256, 2,1);

// ---------- Materials ----------
const M = {
  ground : new THREE.MeshStandardMaterial({map:groundTex, roughness:1}),
  pad    : new THREE.MeshStandardMaterial({color:0x55534d, roughness:.95}),
  uescWhite: new THREE.MeshStandardMaterial({map:panelTex, roughness:.65}),
  uescGrey : new THREE.MeshStandardMaterial({map:darkPanelTex, roughness:.75}),
  uescDark : new THREE.MeshStandardMaterial({color:0x3c4148, roughness:.8}),
  hazard  : new THREE.MeshStandardMaterial({color:0xd9a520, roughness:.5}),
  rust    : new THREE.MeshStandardMaterial({color:0x6e4a32, roughness:1}),
  glass   : new THREE.MeshStandardMaterial({color:0x9fd8ff, roughness:.1, metalness:.4, transparent:true, opacity:.45, emissive:0x224466, emissiveIntensity:.4}),
  genBlack: new THREE.MeshStandardMaterial({color:0x17181a, roughness:.5, metalness:.3}),
  vend    : new THREE.MeshStandardMaterial({color:0x2266aa, roughness:.4}),
  contRed : new THREE.MeshStandardMaterial({map:containerTex, color:0xb03a2a, roughness:.7}),
  contOlv : new THREE.MeshStandardMaterial({map:containerTex, color:0x6b7a3a, roughness:.7}),
  contBlu : new THREE.MeshStandardMaterial({map:containerTex, color:0x2a5a8a, roughness:.7}),
  // ---- Outpost art direction ----
  ctrl    : new THREE.MeshStandardMaterial({map:ctrlTex, roughness:.6}),                    // CTRL white station panels
  hull    : new THREE.MeshStandardMaterial({map:hullTex, roughness:.5, metalness:.25}),     // deep-blue ship hull
  wreckAcid: new THREE.MeshStandardMaterial({color:0xc3d92c, roughness:.55}),               // acid-yellow wing chunks
  acid    : new THREE.MeshStandardMaterial({color:0x37400a, emissive:0xc8e82a, emissiveIntensity:1.1}), // glowing trim
  ortn    : new THREE.MeshStandardMaterial({color:0x1fb3a3, roughness:.5, metalness:.08}),  // ORTN teal units
  rock    : new THREE.MeshStandardMaterial({color:0x3d3a35, roughness:1}),
  water   : new THREE.MeshStandardMaterial({color:0x0a1626, roughness:.12, metalness:.55}),
  redGlow : new THREE.MeshBasicMaterial({color:0xff2331}),                                  // beacon bars
};

// ---------- Colliders / occluders ----------
const colliders = [];
const occluders = [];
const ladders  = [];   // climb volumes: {x0,x1,z0,z1, base, top}
function addBox(w,h,d, x,y,z, mat, opts={}){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.set(x,y,z);
  if(opts.ry) m.rotation.y = opts.ry;
  m.castShadow = !opts.noShadow;
  m.receiveShadow = true;
  scene.add(m);
  if(!opts.noCollide){
    m.updateMatrixWorld();
    colliders.push(new THREE.Box3().setFromObject(m));
    occluders.push(m);
  }
  return m;
}