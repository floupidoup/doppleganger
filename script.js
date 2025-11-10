// ...existing code...

function fakeSubmit(){
  var raw = document.getElementById('name').value || '';
  var name = raw.trim();
  if(!name){
    alert('Entrer un nom...');
    return false;
  }

  // normaliser
  var norm = name.toLowerCase();
  // enregistrer en cookie pour usage ultérieur (en minuscule)
  document.cookie = 'doppel=' + encodeURIComponent(norm) + ';path=/;max-age=31536000';

  if(norm === 'whingu'){
    // accès autorisé
    alert('Accès autorisé. Approchez.');
    setTimeout(function(){ window.location = 'secret.html'; }, 600);
  } else {
    // accès refusé
    alert('Vous n\'êtes pas un doppelganger.');
    // laisser la page en place pour éviter le contournement
  }
  return false;
}

// cheap flicker effect (conservé pour l'ambiance)
setInterval(function(){
  var el = document.querySelector('.title');
  if(!el) return;
  el.style.opacity = (Math.random()>0.85)?'0.3':'1';
},800);

// noisy console
console.log('DOPPLEGANGER INIT');
console.warn('if you see this, do not stare in mirrors');

// intentionally sloppy function to reveal secret link only for specific cookie
function maybeReveal(){
  var c = (document.cookie.match(/doppel=([^;]+)/)||[])[1];
  if(c){
    var n = decodeURIComponent(c);
    if(n === 'whingu'){
      var a = document.createElement('a');
      a.href='secret.html'; a.style.color='#faa'; a.textContent='(un lien secret)';
      a.style.display='block'; a.style.textAlign='center';
      a.style.marginTop='8px';
      document.body.appendChild(a);
    }
  }
}
setTimeout(maybeReveal,1200);


// --- White noise (WebAudio) implementation ---
// Creates a white-noise buffer and plays it in a loop through a gain node.
(function(){
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  if(!AudioContext) return; // no webaudio support

  var ctx = null;
  var noiseNode = null; // BufferSource
  var noiseGain = null;
  var masterGain = null; // gain maître pour contrôler le volume perçu
  // Ajustez cette constante pour changer le volume global du bruit (linéaire)
  // Exemples : 0.003 (discret), 0.0008 (très discret), 0.0002 (presque inaudible)
  var DEFAULT_MASTER_GAIN = 0.00001; // valeur très basse par défaut (encore diminuée)
  var isPlaying = false;

  function createNoise(){
    if(!ctx) ctx = new AudioContext();
    // ensure masterGain exists and has a low default value
    if(!masterGain){
      masterGain = ctx.createGain();
      // très faible par défaut, ajustable via DEFAULT_MASTER_GAIN
      masterGain.gain.value = DEFAULT_MASTER_GAIN;
      masterGain.connect(ctx.destination);
    }

    // expose simple console API to adjust volume at runtime
    try{
      window.setNoiseVolume = function(v){
        if(typeof v !== 'number') { console.warn('setNoiseVolume: valeur numérique attendue'); return; }
        if(!ctx){ DEFAULT_MASTER_GAIN = v; console.log('DEFAULT_MASTER_GAIN mis à jour (avant AudioContext):', v); return; }
        if(!masterGain){ masterGain = ctx.createGain(); masterGain.gain.value = v; masterGain.connect(ctx.destination); }
        try{ masterGain.gain.setValueAtTime(v, ctx.currentTime || 0); }catch(e){ masterGain.gain.value = v; }
        console.log('masterGain réglé sur', v);
      };
      window.getNoiseVolume = function(){ return (masterGain && ctx) ? masterGain.gain.value : DEFAULT_MASTER_GAIN; };
    }catch(e){ /* ignore if window not writable */ }

    var bufferSize = ctx.sampleRate * 2;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for(var i=0;i<bufferSize;i++){
      data[i] = Math.random()*2 - 1;
    }
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    var gain = ctx.createGain();
    // set a very low starting gain; we'll ramp up slightly on start to avoid pops
    // This gain will ramp to 1.0; final loudness is controlled by masterGain.
    gain.gain.value = 0.00001; // near-silence initial value

    // connect through masterGain so we can adjust perceived volume globally
    source.connect(gain);
    gain.connect(masterGain);

    return {source: source, gain: gain};
  }

  function startNoise(){
    if(isPlaying) return;
    var parts = createNoise();
    noiseNode = parts.source;
    noiseGain = parts.gain;
    try{
      if(ctx.state === 'suspended') ctx.resume();
    }catch(e){}
    // apply a short fade-in to reach a comfortable listening level
    try{
      var now = ctx.currentTime || 0;
      // Ramp the per-source gain to full (1.0) quickly; masterGain controls final loudness.
      noiseGain.gain.setValueAtTime(0.00001, now);
      noiseGain.gain.linearRampToValueAtTime(1.0, now + 0.25); // fade-in 250ms

      // start the source only if context allows
      noiseNode.start(0);
      isPlaying = true;
    }catch(err){
      // if start throws (rare), clean up and mark not playing
      try{ noiseNode.disconnect(); noiseGain.disconnect(); }catch(e){}
      noiseNode = null; noiseGain = null; isPlaying = false;
      throw err; // propagate so caller can fallback to gesture
    }
  }

  // stopNoise retained but not exposed in UI
  function stopNoise(){
    if(!isPlaying) return;
    try{ noiseNode.stop(0); }catch(e){}
    try{ noiseNode.disconnect(); noiseGain.disconnect(); }catch(e){}
    noiseNode = null; noiseGain = null; isPlaying = false;
  }

  // start-once handler: starts noise after a user gesture
  function startOnce(){
    if(!ctx){
      try{ ctx = new AudioContext(); }catch(err){ console.warn('AudioContext failed', err); }
    }
    // resume context if needed then start noise
    if(ctx && ctx.state === 'suspended'){
      ctx.resume().then(function(){
        try{ startNoise(); }catch(e){ console.warn('startNoise failed after resume', e); }
      }).catch(function(err){
        console.warn('resume failed', err);
      });
    } else {
      try{ startNoise(); }catch(e){ console.warn('startNoise failed on gesture', e); }
    }

    // remove listeners (we want it once)
    document.removeEventListener('click', startOnce);
    document.removeEventListener('keydown', startOnce);
  }

  // expose dev helpers to force start/stop from console if needed
  try{
    window.startNoiseNow = function(){
      if(!ctx){ try{ ctx = new AudioContext(); }catch(e){ console.warn('AudioContext creation failed', e); return; } }
      try{ startNoise(); }catch(e){ console.warn('startNoise failed (manual)', e); }
    };
    window.stopNoiseNow = function(){ try{ stopNoise(); }catch(e){ console.warn('stopNoise failed', e); } };
  }catch(e){ /* ignore if cannot assign globals */ }

  // try to auto-start immediately; if blocked (context suspended), listen for first gesture
  (function tryImmediateStart(){
    try{
      ctx = new AudioContext();
    }catch(e){
      console.warn('AudioContext creation failed', e);
      return;
    }

    // quick hint for developers: adjust volume via console if needed
    try{ console.info('Ajuster volume bruit: window.setNoiseVolume(0.0005)  (valeurs comme 0.003 / 0.0008 / 0.0002)'); }catch(e){}

    // attempt to start immediately (best-effort). Many browsers will suspend the context
    // until a user gesture; we keep a fallback to start on first gesture.
    var attempted = false;
    try{
      startNoise();
      attempted = true;
    }catch(err){
      console.warn('Auto start failed or blocked, will wait for user gesture', err);
    }

    // If context is suspended or we didn't start, listen for user gesture
    if(!attempted || (ctx && ctx.state === 'suspended') || !isPlaying){
      document.addEventListener('click', startOnce);
      document.addEventListener('keydown', startOnce);
      // also try a short timeout to resume if browser allows it shortly after load
      setTimeout(function(){
        if(ctx && ctx.state === 'running' && !isPlaying){
          try{ startNoise(); }catch(e){ console.warn('startNoise after timeout failed', e); }
        }
      }, 300);
    }

    // visibility handling: suspend if page hidden, resume only if we were playing
    document.addEventListener('visibilitychange', function(){
      if(!ctx) return;
      if(document.hidden){ if(ctx.state === 'running') ctx.suspend(); }
      else { if(ctx.state === 'suspended' && isPlaying) ctx.resume(); }
    });
  })();
})();
