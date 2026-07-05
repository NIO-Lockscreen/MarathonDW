'use strict';
// ---------- Physics ----------
const GRAV=-24, JUMP=8.6, STEP=.55;

function groundHeightAt(x,z,curY){
  let h = 0;
  if(x>TR.x-4.5 && x<TR.x+4.5 && z>-20 && z<20) h=-3;
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

  if(state==='play'){
    const fwd=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));
    const rgt=new THREE.Vector3(-fwd.z,0,fwd.x);
    const wish=new THREE.Vector3();
    if(key.KeyW)wish.add(fwd); if(key.KeyS)wish.sub(fwd);
    if(key.KeyD)wish.add(rgt); if(key.KeyA)wish.sub(rgt);
    const moving = wish.lengthSq()>0;
    if(moving && !started){ started=true; t0=performance.now(); }
    if(moving) wish.normalize();
    const sprinting = (key.ShiftLeft||key.ShiftRight) && moving;
    const sp = sprinting ? player.sprint : player.speed;
    player.vel.x = wish.x*sp;
    player.vel.z = wish.z*sp;
    if(key.Space && player.onGround){
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

    // Barrier at z=24 blocks entry into the hull (over the Orientation roof)
    // until all 5 batteries are down. Approach comes from the south (z>24).
    if(destroyed<5 && Math.abs(player.pos.x)<7.4 && player.pos.y>WING.deckY-1.2 &&
       player.pos.z<25 && player.pos.z>22){
      player.pos.z=25;
    }
    // Crossing the barrier north into the hull interior = run complete.
    if(destroyed===5 && player.pos.z<23.5 && player.pos.z>-14 &&
       Math.abs(player.pos.x)<7.4 && player.pos.y>WING.deckY-1.2){
      endRun();
    }

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
  if(barrier.visible) barrier.material.opacity = .28+.12*Math.sin(now*.004);

  // drones patrol
  drones.forEach(d=>{
    d.a += d.s*dt;
    d.o.position.set(Math.sin(d.a)*d.r, d.h + Math.sin(now*.001+d.r)*0.8, 10+Math.cos(d.a)*d.r);
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