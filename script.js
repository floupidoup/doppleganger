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
  var isPlaying = false;

  function createNoise(){
    if(!ctx) ctx = new AudioContext();
    // buffer: 2 seconds mono
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
    gain.gain.value = 0.25; // default volume (can be adjusted)

    source.connect(gain).connect(ctx.destination);

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
    // start the source only if context is running or the browser allows it
    try{
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

  // try to auto-start on load; if blocked (context suspended), listen for first gesture
  document.addEventListener('DOMContentLoaded', function(){
    try{
      ctx = new AudioContext();
    }catch(e){
      console.warn('AudioContext creation failed', e);
      return;
    }

    // attempt to start immediately
    var attempted = false;
    try{
      // attempt to start; browsers may keep ctx.state === 'suspended' until gesture
      startNoise();
      attempted = true;
    }catch(err){
      // failed to start synchronously; we'll fallback to gesture
      console.warn('Auto start failed or blocked, will wait for user gesture', err);
    }

    // If context is suspended or we didn't start, listen for user gesture
    if(!attempted || (ctx && ctx.state === 'suspended') || !isPlaying){
      document.addEventListener('click', startOnce);
      document.addEventListener('keydown', startOnce);
      // also try a small timeout to resume if browser allows it shortly after load
      setTimeout(function(){
        if(ctx && ctx.state === 'running' && !isPlaying){
          try{ startNoise(); }catch(e){ console.warn('startNoise after timeout failed', e); }
        }
      }, 800);
    }

    // visibility handling: suspend if page hidden, resume only if we were playing
    document.addEventListener('visibilitychange', function(){
      if(!ctx) return;
      if(document.hidden){ if(ctx.state === 'running') ctx.suspend(); }
      else { if(ctx.state === 'suspended' && isPlaying) ctx.resume(); }
    });
  });

})();
