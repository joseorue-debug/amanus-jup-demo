(()=>{
  const key='amanus-sound-enabled';
  let enabled=true, context=null, voices=[], generation=0;
  try{enabled=localStorage.getItem(key)!=='false'}catch{}
  const supported=!!(window.AudioContext||window.webkitAudioContext);
  const cues={
    correct:[[659,0,.12],[880,.09,.2]],
    retry:[[440,0,.1],[392,.09,.15]],
    mission:[[523,0,.13],[659,.10,.13],[784,.20,.25],[1047,.31,.32]],
    badge:[[523,0,.16],[659,.12,.16],[784,.24,.2],[1047,.40,.38]],
    stage:[[523,0,.16],[659,.13,.16],[784,.26,.19],[1047,.44,.22],[988,.64,.16],[1175,.79,.18],[1047,.98,.55],[523,.98,.55],[659,.98,.55]]
  };
  function stop(){generation++;for(const voice of voices){try{voice.stop()}catch{}}voices=[]}
  function update(){const b=document.getElementById('sound-toggle');if(!b)return;b.disabled=!supported;b.textContent=!supported?'Sonido no disponible':enabled?'Sonido: activado':'Sonido: silenciado';b.setAttribute('aria-pressed',String(enabled&&supported));b.title=enabled?'Silenciar efectos de sonido':'Activar efectos de sonido'}
  async function play(name){if(!enabled||!supported||document.hidden)return;stop();const run=generation;
    try{context??=new (window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')await context.resume();if(!enabled||run!==generation||context.state!=='running')return;
      const now=context.currentTime+.015;
      for(const [freq,delay,duration] of cues[name]||cues.correct){const tone=context.createOscillator(),gain=context.createGain();tone.type='sine';tone.frequency.value=freq;const start=now+delay;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(name==='retry'?.035:.055,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);tone.connect(gain);gain.connect(context.destination);voices.push(tone);tone.onended=()=>{tone.disconnect();gain.disconnect();voices=voices.filter(v=>v!==tone)};tone.start(start);tone.stop(start+duration+.02)}
    }catch{/* Audio failure must never interrupt a mission. */}
  }
  document.addEventListener('click',e=>{if(!e.target.closest('#sound-toggle'))return;enabled=!enabled;stop();try{localStorage.setItem(key,String(enabled))}catch{}update();if(enabled)play('correct')});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
  window.AmanusSound={play};update();
})();
