'use strict';
// ---------- Modes ----------
// Chosen before each run. `count` batteries spawn; `arrow` shows the nearest-
// target HUD pointer; `mapActive` reveals the live targets on the TAB map.
const MODES = {
  1:{ key:'1', name:'GUIDED', count:5,  arrow:true,  mapActive:false, blurb:'Arrow points to the nearest battery' },
  2:{ key:'2', name:'RECON',  count:5,  arrow:false, mapActive:true,  blurb:'Live batteries shown on the TAB map' },
  3:{ key:'3', name:'BLIND',  count:5,  arrow:false, mapActive:false, blurb:'No help — learn the spawns' },
  4:{ key:'4', name:'SWARM',  count:10, arrow:false, mapActive:true,  blurb:'10 batteries at once — map assist on' },
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
  targetCount = M.count;
  bestTime = bestByMode[assistMode] || null;
  bestSplits = null;

  document.getElementById('start').style.display='none';
  document.getElementById('end').style.display='none';
  hud.style.display='block';
  state='play';
  destroyed=0; splitTimes=[]; started=false; t0=0; tEnd=0;

  setLamps(targetCount);
  buildBarrierLamps(targetCount);
  spawnSwitches(targetCount);

  document.getElementById('scount').textContent='0/'+targetCount;
  document.getElementById('timer').textContent='00:00.00';
  document.getElementById('bestval').textContent = bestTime!=null ? fmt(bestTime) : '--:--.--';
  document.getElementById('modetag').textContent = M.name;
  document.getElementById('guide').style.display = M.arrow ? 'block':'none';
  barrier.visible=true;

  player.pos.set(0,0,40); player.vel.set(0,0,0);
  player.yaw=0; player.pitch=0;
  particles.forEach(p=>scene.remove(p)); particles=[];
  flash(M.name+' — FIND '+targetCount+' BATTERIES');
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
    rows += 'BATTERY '+(i+1)+' &mdash; '+fmt(s)+d+'<br>';
  });
  document.getElementById('splits').innerHTML = rows;
  document.getElementById('foundlist').innerHTML =
    'THIS RUN:<br>' + switches.map(s=>'&#10003; '+s.label).join('<br>');
  if(isBest){ bestByMode[assistMode]=t; bestSplits=[...splitTimes]; }
  document.getElementById('bestval').textContent=fmt(bestByMode[assistMode]);
  document.getElementById('end').style.display='flex';
  beep(880,.4,'triangle',.2,200);
}
