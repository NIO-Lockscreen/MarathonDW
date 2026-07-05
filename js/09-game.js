'use strict';
// ---------- State / timer ----------
let state='menu', t0=0, tEnd=0, started=false, bestTime=null, bestSplits=null;
function elapsed(){ return started ? ((tEnd||performance.now())-t0)/1000 : 0; }
function fmt(s){
  const m=(s/60)|0, sec=s-m*60;
  return String(m).padStart(2,'0')+':'+sec.toFixed(2).padStart(5,'0');
}

function startRun(){
  document.getElementById('start').style.display='none';
  document.getElementById('end').style.display='none';
  hud.style.display='block';
  state='play';
  destroyed=0; splitTimes=[]; started=false; t0=0; tEnd=0;
  for(let i=0;i<5;i++){
    document.getElementById('l'+i).classList.remove('off');
    barrierLamps[i].material.color.set(0xff2a2a);
  }
  document.getElementById('scount').textContent='0/5';
  document.getElementById('timer').textContent='00:00.00';
  barrier.visible=true;
  player.pos.set(0,0,40); player.vel.set(0,0,0);
  player.yaw=0; player.pitch=0;
  spawnSwitches();
  particles.forEach(p=>scene.remove(p)); particles=[];
  flash('FIND 5 WALL BATTERIES');
  if(canvas.requestPointerLock) canvas.requestPointerLock();
}
document.getElementById('startBtn').onclick=()=>{ beep(600,.1); startRun(); };
document.getElementById('againBtn').onclick=()=>{ beep(600,.1); startRun(); };

function endRun(){
  state='done'; tEnd=performance.now();
  const t=elapsed();
  if(document.exitPointerLock) document.exitPointerLock();
  hud.style.display='none';
  mapDiv.style.display='none';
  const isBest = bestTime===null || t<bestTime;
  document.getElementById('endstats').innerHTML =
    fmt(t) + (isBest? ' <span class="newbest">NEW BEST</span>'
                    : '<br><span style="font-size:14px;color:#9fc">BEST '+fmt(bestTime)+'</span>');
  let rows='';
  splitTimes.forEach((s,i)=>{
    let d='';
    if(bestSplits && bestSplits[i]!==undefined){
      const dv = s-bestSplits[i];
      d = ' <span class="'+(dv<=0?'d-neg':'d-pos')+'">('+(dv<=0?'':'+')+dv.toFixed(2)+')</span>';
    }
    rows += 'BATTERY '+(i+1)+' &mdash; '+fmt(s)+d+'<br>';
  });
  document.getElementById('splits').innerHTML = rows;
  document.getElementById('foundlist').innerHTML =
    'THIS RUN:<br>' + switches.map(s=>'&#10003; '+s.label).join('<br>');
  if(isBest){ bestTime=t; bestSplits=[...splitTimes]; }
  document.getElementById('bestval').textContent=fmt(bestTime);
  document.getElementById('end').style.display='flex';
  beep(880,.4,'triangle',.2,200);
}