'use strict';
// ---------- Physics ----------
const GRAV=-24, JUMP=8.6, STEP=.55, CLIMB=4.5;

// ---------- Nearest-target HUD pointer (GUIDED mode) ----------
const guideEl = document.getElementById('guide');
function updateGuide(){
  if(!MODES[assistMode].arrow){ guideEl.style.display='none'; return; }
  let best=null, bd=Infinity;
  for(const s of switches){
    if(s.dead) continue;
    const d = s.group.position.distanceToSquared(player.pos);
    if(d<bd){ bd=d; best=s; }
  }
  if(!best){ guideEl.style.display='none'; return; }
  guideEl.style.display='block';
  const to = best.group.position.clone().sub(player.pos);
  const fwd = new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));
  const rgt = new THREE.Vector3(-fwd.z,0,fwd.x);
  // angle where 0 = dead ahead, clockwise positive toward the right
  const a = Math.atan2(to.dot(rgt), to.dot(fwd));
  guideEl.style.transform = 'rotate('+a+'rad)';
}

function groundHeightAt(x,z,curY){
  let h = 0;
  for(const p of PITS){                       // B1 basement rooms sit below grade
    if(x>p.x0 && x<p.x1 && z>p.z0 && z<p.z1){ h=p.floor; break; }
  }
  for(const bb of colliders){
    if(x>bb.min.x-player.r && x<bb.max.x+player.r && z>bb.min.z-player.r && z<bb.max.z+player.r){
      if(bb.max.y<=curY+STEP && bb.max.y>h) h=bb.max.y;
    }
  }
  return h;
}

function collide(pos){
  for(const bb of colliders){
    if(pos.y+player.h < bb.min.y+.05) continue;
    if(pos.y > bb.max.y-STEP) continue;
    const cx=Math.max(bb.min.x,Math.min(pos.x,bb.max.x));
    const cz=Math.max(bb.min.z,Math.min(pos.z,bb.max.z));
    const dx=pos.x-cx, dz=pos.z-cz;
    const d2=dx*dx+dz*dz;
    if(d2 < player.r*player.r){
      if(dx===0&&dz===0){
        const pxl=pos.x-bb.min.x, pxr=bb.max.x-pos.x;
        const pzl=pos.z-bb.min.z, pzr=bb.max.z-pos.z;
        if(Math.min(pxl,pxr)<Math.min(pzl,pzr)) pos.x = pxl<pxr? bb.min.x-player.r : bb.max.x+player.r;
        else                                    pos.z = pzl<pzr? bb.min.z-player.r : bb.max.z+player.r;
      }else{
        const d=Math.sqrt(d2)||1e-5;
        pos.x = cx + dx/d*player.r;
        pos.z = cz + dz/d*player.r;
      }
    }
  }
}

let last=performance.now(), bobT=0, stepT=0;
function tick(){
  requestAnimationFrame(tick);
  const now=performance.now();
  const dt=Math.min(.05,(now-last)/1000); last=now;

  // Poll gamepad every frame (also handles menu deploy / look / shoot).
  const pad = (typeof gamepadUpdate==='function') ? gamepadUpdate(dt) : null;

  if(state==='play'){
    const fwd=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));
    const rgt=new THREE.Vector3(-fwd.z,0,fwd.x);
    // Combine keyboard (digital ±1) and gamepad (analog) into a move vector.
    let mf=0, ms=0;                       // forward, strafe
    if(key.KeyW)mf+=1; if(key.KeyS)mf-=1;
    if(key.KeyD)ms+=1; if(key.KeyA)ms-=1;
    if(pad){ mf += -pad.moveZ; ms += pad.moveX; }
    const wish=new THREE.Vector3().addScaledVector(fwd, mf).addScaledVector(rgt, ms);
    const mag = Math.hypot(mf, ms);       // == wish length (fwd,rgt orthonormal)
    const moving = mag>1e-3;
    if(moving && !started){ started=true; t0=performance.now(); }
    if(mag>1) wish.multiplyScalar(1/mag); // clamp to unit; keep analog below 1
    const sprinting = ((key.ShiftLeft||key.ShiftRight) || (pad&&pad.sprint)) && moving;
    const sp = sprinting ? player.sprint : player.speed;
    const jumpHeld = key.Space || (pad&&pad.jump);

    // On a ladder? (checked against last frame's position)
    const L = ladders.find(l=> player.pos.x>l.x0 && player.pos.x<l.x1 &&
                                player.pos.z>l.z0 && player.pos.z<l.z1 &&
                                player.pos.y < l.top && player.pos.y > l.base-0.6);

    if(L){
      // Climb: forward / jump = up, back = down. Strafe still steps off the side.
      const cy = ((mf>0.1||jumpHeld)?1:0) - (mf<-0.1?1:0);
      player.vel.set(rgt.x*ms*player.speed, cy*CLIMB, rgt.z*ms*player.speed);
      player.pos.x += player.vel.x*dt;
      player.pos.z += player.vel.z*dt;
      collide(player.pos);
      player.pos.y += player.vel.y*dt;
      if(player.pos.y < L.base){ player.pos.y=L.base; }
      player.onGround = player.pos.y<=L.base+0.01;
      if(player.pos.y >= L.top-0.1){        // top reached -> step onto the roof
        player.pos.set(L.land.x, L.land.y, L.land.z);
        player.vel.set(0,0,0); player.onGround=true;
      }
    } else {
      player.vel.x = wish.x*sp;
      player.vel.z = wish.z*sp;
      if(jumpHeld && player.onGround){
        player.vel.y=JUMP; player.onGround=false;
        if(!started){started=true;t0=performance.now();}
      }
      player.vel.y += GRAV*dt;

      player.pos.x += player.vel.x*dt;
      player.pos.z += player.vel.z*dt;
      collide(player.pos);
      player.pos.y += player.vel.y*dt;

      const gh = groundHeightAt(player.pos.x, player.pos.z, player.pos.y+0.01);
      if(player.pos.y<=gh){ player.pos.y=gh; player.vel.y=0; player.onGround=true; }
      else player.onGround = (player.pos.y-gh) < .02;
    }

    // Barrier gates (deck-stair top + the walkway door) block the last few
    // meters until every button is down. Bands are deeper than one frame of
    // sprint movement, so they can't be jumped across.
    const gp = player.pos;
    if(destroyed<targetCount){
      for(const GT of WING.gates){
        if(gp.y>GT.y && gp.x>GT.x0 && gp.x<GT.x1 && gp.z>GT.z0 && gp.z<GT.z1){
          gp.z = GT.push;
        }
      }
    }
    // Setting foot on the wing's top deck (inside the wreck) = run complete.
    if(destroyed===targetCount && gp.y>WING.finishY &&
       WING.finish.some(f=> gp.x>f.x0 && gp.x<f.x1 && gp.z>f.z0 && gp.z<f.z1)){
      endRun();
    }

    updateGuide();   // nearest-target HUD pointer (GUIDED mode only)

    // head bob + footsteps
    if(moving && player.onGround){
      bobT += dt * (sprinting? 13:9);
      stepT += dt;
      const stepInt = sprinting? .3:.42;
      if(stepT>stepInt){ stepT=0; beep(85+Math.random()*20,.03,'triangle',.05); }
    } else { bobT *= .9; stepT=0; }
    const bob = Math.sin(bobT)*.05*(sprinting?1.4:1);

    // sprint FOV
    const targetFov = sprinting? SPRINT_FOV : BASE_FOV;
    camera.fov += (targetFov-camera.fov)*Math.min(1,dt*8);
    camera.updateProjectionMatrix();

    camera.position.set(player.pos.x, player.pos.y+player.h+bob, player.pos.z);
    camera.rotation.set(0,0,0);
    camera.rotateY(player.yaw);
    camera.rotateX(player.pitch);

    // viewmodel recoil + sway
    if(viewmodel){
      recoil = Math.max(0, recoil - dt*7);
      viewmodel.position.set(.34, -.34 + Math.sin(bobT*.5)*.008, -.62 + recoil*.09);
      viewmodel.rotation.x = recoil*.22;
    }

    document.getElementById('timer').textContent = fmt(elapsed());
    if(mapDiv.style.display==='block') drawMap();
  }

  // switch pulse
  const pulse = .5+.5*Math.sin(now*.006);
  switches.forEach(s=>{ if(!s.dead){
    s.glow.intensity = 1+pulse*1.2;
    s.sq.material.color.setRGB(1, .1+pulse*.15, .1);
  }});
  if(barrier.visible) barrier.material.opacity = .28+.12*Math.sin(now*.004); // barrier2 shares the material

  // drones patrol (orbits centered off the coast, over the sea)
  drones.forEach(d=>{
    d.a += d.s*dt;
    d.o.position.set(18+Math.sin(d.a)*d.r, d.h + Math.sin(now*.001+d.r)*0.8, -26+Math.cos(d.a)*d.r);
    d.o.rotation.y = -d.a;
    d.l.intensity = .5 + .5*Math.sin(now*.008+d.r);
  });

  // flash decay
  flashLight.intensity *= Math.pow(.0001, dt);
  if(flashLight.intensity<.02) flashLight.intensity=0;

  // tracers
  for(let i=tracers.length-1;i>=0;i--){
    const tr=tracers[i]; tr.t+=dt;
    tr.l.material.opacity = Math.max(0,.9-tr.t*8);
    if(tr.t>.13){ scene.remove(tr.l); tr.l.geometry.dispose(); tracers.splice(i,1); }
  }

  // particles
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    p.userData.t+=dt;
    p.userData.v.y+=GRAV*.5*dt;
    p.position.addScaledVector(p.userData.v,dt);
    if(p.userData.t>1.2){ scene.remove(p); particles.splice(i,1); }
  }

  renderer.render(scene,camera);
}
tick();