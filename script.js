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
