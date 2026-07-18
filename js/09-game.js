'use strict';
// ---------- Modes ----------
// Chosen before each run. `count` buttons spawn (or `set` = one whole color
// set); `arrow` shows the nearest-target HUD pointer; `mapActive` rings the
// live targets on the TAB map (all 39 documented spawns are always drawn).
const MODES = {
  1:{ key:'1', name:'GUIDED',   count:5,  arrow:true,  mapActive:false, blurb:'Marker floats on the nearest button' },
  2:{ key:'2', name:'RECON',    count:5,  arrow:false, mapActive:true,  blurb:'Live buttons ringed on the TAB map' },
  3:{ key:'3', name:'BLIND',    count:5,  arrow:false, mapActive:false, blurb:'No help — learn the spawns' },
  4:{ key:'4', name:'FULL SET', set:true, arrow:false, mapActive:true,  blurb:'One whole color set (8-12 buttons)' },
};
let assistMode = 3;
let targetCount = 5;

// ---------- State / timer ----------
let state='menu', t0=0, tEnd=0, started=false, bestTime=null, bestSplits=null;
const bestByMode = {};                 // best time per mode
function elapsed(){ return started ? ((tEnd||performance.now())-t0)/1000 : 0; }
function fmt(s){
  const m=(s/60)|0, sec=s-m*60;
  return String(m).padStart(2,'0')+':'+sec.toFixed(2).padStart(5,'0');
}

// Rebuild the HUD lamp row (#lamps) with one lamp per target.
function setLamps(n){
  const box = document.getElementById('lamps');
  box.innerHTML='';
  for(let i=0;i<n;i++){
    const s=document.createElement('span');
    s.className='lamp'; s.id='l'+i;
    box.appendChild(s);
  }
}

function startRun(mode){
  if(mode && MODES[mode]) assistMode = mode;
  const M = MODES[assistMode];
  bestTime = bestByMode[assistMode] || null;
  bestSplits = null;

  document.getElementById('start').style.display='none';
  document.getElementById('end').style.display='none';
  hud.style.display='block';
  state='play';
  destroyed=0; splitTimes=[]; started=false; t0=0; tEnd=0;

  targetCount = spawnSwitches(M);      // FULL SET runs vary in size (8-12)
  setLamps(targetCount);
  buildBarrierLamps(targetCount);

  document.getElementById('scount').textContent='0/'+targetCount;
  document.getElementById('timer').textContent='00:00.00';
  document.getElementById('bestval').textContent = bestTime!=null ? fmt(bestTime) : '--:--.--';
  document.getElementById('modetag').textContent = M.name + (currentSetName? ' · '+currentSetName : '');
  document.getElementById('guide').style.display = M.arrow ? 'block':'none';
  document.getElementById('guidemark').style.display='none';
  barrier.visible=true; barrier2.visible=true;

  // deploy on one of the drop zones flanking Orientation — the video notes the
  // buttons sit around the player spawn areas on both sides of the building
  const D = [{x:-6,z:7,yaw:Math.PI}, {x:-20,z:-22,yaw:-2.4}][(Math.random()*2)|0];
  player.pos.set(D.x,0,D.z); player.vel.set(0,0,0);
  player.yaw=D.yaw; player.pitch=0;
  particles.forEach(p=>scene.remove(p)); particles=[];
  flash((currentSetName? currentSetName+' SET — ' : M.name+' — ')+'FIND '+targetCount+' BUTTONS');
  if(canvas.requestPointerLock) canvas.requestPointerLock();
}

// Wire the mode buttons on both the start and end screens.
[['start',''],['end','e']].forEach(([screen,pfx])=>{
  [1,2,3,4].forEach(m=>{
    const btn=document.getElementById(pfx+'mode'+m);
    if(btn) btn.onclick=()=>{ beep(600,.1); startRun(m); };
  });
});

function endRun(){
  state='done'; tEnd=performance.now();
  const t=elapsed();
  if(document.exitPointerLock) document.exitPointerLock();
  hud.style.display='none';
  mapDiv.style.display='none';
  document.getElementById('guide').style.display='none';
  document.getElementById('guidemark').style.display='none';
  const prevBest = bestByMode[assistMode];
  const isBest = prevBest==null || t<prevBest;
  document.getElementById('endtitle').textContent = MODES[assistMode].name+' CLEARED';
  document.getElementById('endstats').innerHTML =
    fmt(t) + (isBest? ' <span class="newbest">NEW BEST</span>'
                    : '<br><span style="font-size:14px;color:#9fc">BEST '+fmt(prevBest)+'</span>');
  let rows='';
  splitTimes.forEach((s,i)=>{
    let d='';
    if(bestSplits && bestSplits[i]!==undefined){
      const dv = s-bestSplits[i];
      d = ' <span class="'+(dv<=0?'d-neg':'d-pos')+'">('+(dv<=0?'':'+')+dv.toFixed(2)+')</span>';
    }
    rows += 'BUTTON '+(i+1)+' &mdash; '+fmt(s)+d+'<br>';
  });
  document.getElementById('splits').innerHTML = rows;
  document.getElementById('foundlist').innerHTML =
    'THIS RUN:<br>' + switches.map(s=>
      '&#10003; <span style="color:'+SETCOL[s.set]+'">'+s.set+' '+s.num+'</span>'+
      ' <span style="color:#6a7">['+s.lv+']</span> '+s.label.split(' · ')[1]).join('<br>');
  if(isBest){ bestByMode[assistMode]=t; bestSplits=[...splitTimes]; }
  document.getElementById('bestval').textContent=fmt(bestByMode[assistMode]);
  document.getElementById('end').style.display='flex';
  beep(880,.4,'triangle',.2,200);
}
