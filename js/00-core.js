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
scene.fog = new THREE.Fog(0x2a3040, 80, 260);

const camera = new THREE.PerspectiveCamera(78, innerWidth/innerHeight, .08, 500);
const BASE_FOV=78, SPRINT_FOV=86;

addEventListener('resize',()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

// ---------- Sky dome (dusk gradient) ----------
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
      ' vec3 top = vec3(0.05,0.09,0.16);'+
      ' vec3 mid = vec3(0.16,0.20,0.28);'+
      ' vec3 hor = vec3(0.85,0.45,0.22);'+
      ' vec3 c = h>0.12 ? mix(mid,top,smoothstep(0.12,0.7,h)) : mix(hor,mid,smoothstep(-0.02,0.12,h));'+
      ' gl_FragColor = vec4(c,1.0);'+
      '}'
  });
  scene.add(new THREE.Mesh(geo, mat));
}

// ---------- Lights ----------
scene.add(new THREE.HemisphereLight(0x6a82a0, 0x2a2018, .85));
const sun = new THREE.DirectionalLight(0xffc890, 1.35);
sun.position.set(-70, 60, -90);
sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-90; sun.shadow.camera.right=90;
sun.shadow.camera.top=120;  sun.shadow.camera.bottom=-70;
sun.shadow.camera.far=350;
sun.shadow.bias = -0.0004;
scene.add(sun);