'use strict';
// ---------- Renderer / scene ----------
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a1420, 70, 300);

const camera = new THREE.PerspectiveCamera(78, innerWidth/innerHeight, .08, 500);
const BASE_FOV=78, SPRINT_FOV=86;

addEventListener('resize',()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

// ---------- Sky dome (Outpost night: near-black blue, cold teal horizon) ----------
{
  const geo = new THREE.SphereGeometry(380, 24, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite:false, fog:false,
    uniforms:{},
    vertexShader:'varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:
      'varying vec3 vP;'+
      'void main(){'+
      ' float h = normalize(vP).y;'+
      ' vec3 top = vec3(0.010,0.016,0.038);'+
      ' vec3 mid = vec3(0.040,0.070,0.115);'+
      ' vec3 hor = vec3(0.075,0.195,0.235);'+
      ' vec3 c = h>0.10 ? mix(mid,top,smoothstep(0.10,0.65,h)) : mix(hor,mid,smoothstep(-0.02,0.10,h));'+
      ' gl_FragColor = vec4(c,1.0);'+
      '}'
  });
  scene.add(new THREE.Mesh(geo, mat));
}

// ---------- Lights (cold moonlight + station floods fill in per-area) ----------
scene.add(new THREE.HemisphereLight(0x33455e, 0x0b0d12, .75));
const sun = new THREE.DirectionalLight(0xaac4ee, 1.0);
sun.position.set(-60, 85, -50);
sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-115; sun.shadow.camera.right=115;
sun.shadow.camera.top=130;  sun.shadow.camera.bottom=-95;
sun.shadow.camera.far=400;
sun.shadow.bias = -0.0004;
scene.add(sun);