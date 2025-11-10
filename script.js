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

  // Si l'utilisateur tape "nunu", rediriger vers la page mignonne
  if(norm === 'nunu'){
    // légère pause pour l'effet, puis redirection
    setTimeout(function(){ window.location = 'nunu.html'; }, 200);
    return false;
  }

  if(norm === 'whingu'){
    // accès autorisé
    alert('Accès autorisé. DOPPLEGÄNGER identifié.');
    setTimeout(function(){ window.location = 'secret.html'; }, 600);
  } else {
    // accès refusé
    alert('Ce n\'est pas un doppelganger.');
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

// --- NEW: Noise canvas and glyph overlay + glitch enhancements ---
(function(){
  // helpers
  function rand(min,max){return Math.random()*(max-min)+min}
  function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}

  // setup canvas noise
  var canvas = document.getElementById('noise-canvas');
  var ctx = canvas && canvas.getContext && canvas.getContext('2d');
  function resizeCanvas(){
    if(!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function drawNoise(intensity){
    if(!ctx) return;
    var w = canvas.width, h = canvas.height;
    var img = ctx.createImageData(w, h);
    var data = img.data;
    var amount = Math.floor(255 * (intensity||0.06));
    for(var i=0;i<data.length;i+=4){
      var v = (Math.random()*amount)|0;
      data[i]=data[i+1]=data[i+2]=v;
      data[i+3]=Math.floor(40 + Math.random()*60);
    }
    ctx.putImageData(img,0,0);
  }

  // animate noise slowly
  var noiseIntensity = 0.06;
  setInterval(function(){ drawNoise(noiseIntensity); }, 120);

  // glyph overlay — sprinkle faint characters across the screen
  var glyphs = '░▒▓▧▩▦◇◆○●✶✷✸✹✺✼✽✾✿✖✙✚'.split('');
  var overlay = document.getElementById('glyph-overlay');
  function seedGlyphs(count){
    if(!overlay) return;
    overlay.innerHTML='';
    for(var i=0;i<count;i++){
      var s = document.createElement('span');
      s.textContent = pick(glyphs);
      s.style.left = (Math.random()*100)+'%';
      s.style.top = (Math.random()*100)+'%';
      s.style.fontSize = Math.floor(rand(8,28))+'px';
      s.style.opacity = (Math.random()*0.12 + 0.02).toFixed(2);
      s.style.transform = 'rotate(' + rand(-30,30).toFixed(1) + 'deg)';
      overlay.appendChild(s);
    }
  }
  seedGlyphs(60);
  setInterval(function(){ seedGlyphs(30 + Math.floor(Math.random()*60)); }, 5000);

  // dynamic glitch for elements with class .glitch
  function jitterGlitch(){
    var els = document.querySelectorAll('.glitch');
    els.forEach(function(el){
      var t = el.textContent || el.innerText || '';
      // set data-text so CSS pseudo-elements can mirror it
      el.setAttribute('data-text', t);
      // random micro translate for pseudo layer illusion
      el.style.setProperty('--g1x', (Math.random()*6-3)+'px');
      el.style.setProperty('--g1y', (Math.random()*4-2)+'px');
    });
  }
  setInterval(jitterGlitch, 300);

  // title layer nudge occasionally
  setInterval(function(){
    var layer = document.querySelector('.title .title-layer');
    if(!layer) return;
    layer.style.transform = 'translate(' + (Math.random()*6-3).toFixed(1) + 'px,' + (Math.random()*4-2).toFixed(1) + 'px)';
    layer.style.opacity = (0.5 + Math.random()*0.5).toFixed(2);
  }, 400);

  // small chance to briefly apply heavier glitch filter to body
  setInterval(function(){
    if(Math.random() > 0.96){
      document.body.style.filter = 'url(#glitch)';
      setTimeout(function(){ document.body.style.filter = ''; }, 120 + Math.random()*400);
    }
  }, 800);

})();

// Le bruit blanc a été retiré — le bloc WebAudio a été supprimé à la demande de l'utilisateur.
// Si vous souhaitez restaurer le bruit plus tard, on peut le réimplémenter ou récupérer la version précédente.


