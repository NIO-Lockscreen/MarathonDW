'use strict';
// ---------- Audio ----------
let AC=null;
function beep(f, t=.08, type='square', vol=.15, slide=0){
  try{
    if(!AC) AC = new (window.AudioContext||window.webkitAudioContext)();
    const o=AC.createOscillator(), g=AC.createGain();
    o.type=type; o.frequency.value=f;
    if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide), AC.currentTime+t);
    g.gain.value=vol; g.gain.exponentialRampToValueAtTime(.001, AC.currentTime+t);
    o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime+t);
  }catch(e){}
}