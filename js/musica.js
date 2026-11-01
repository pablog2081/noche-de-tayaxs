/* Noche de TAYA'xs — música de los menús:
   al abrir el juego suena la cortina de rock; después queda una cortina tranquila en loop, bajita,
   y por encima, cada 5 segundos, algún ruido de taller (pistola neumática, martillo, criquet, compresor...).
   En carrera no hay música: suenan los motores y el relato. */
const MUS={buf:{},carg:null,src:null,g:null,fx:null,fxT:null,introYa:false,estado:"off",cola:[]};
const MUS_FX=["pistola","martillo","criquet","compresor","llave","amoladora","cajon","motor"];
function musCargar(){if(MUS.carg||!AC)return MUS.carg;const get=n=>fetch("musica/"+n+".mp3?v=1").then(r=>{if(!r.ok)throw 0;return r.arrayBuffer();}).then(a=>new Promise((ok,no)=>AC.decodeAudioData(a,ok,no))).then(b=>{MUS.buf[n]=b;}).catch(()=>{});
  MUS.carg=Promise.all([get("intro"),get("espera"),...MUS_FX.map(n=>get("taller_"+n))]);return MUS.carg;}
function musVol(){if(!MUS.g)return;const on=!(muted||noMus);MUS.g.gain.setTargetAtTime(on?.55*VOL.mus:0,AC.currentTime,.15);if(MUS.fx)MUS.fx.gain.setTargetAtTime(on?.9*VOL.mus:0,AC.currentTime,.15);}
function musParar(fade){if(MUS.src){const s=MUS.src,g=MUS.sg;try{g.gain.setTargetAtTime(0,AC.currentTime,(fade||.4)/3);setTimeout(()=>{try{s.stop();}catch(e){}},(fade||.4)*1000+200);}catch(e){}MUS.src=null;}clearTimeout(MUS.fxT);MUS.fxT=null;MUS.estado="off";}
function musTocar(nombre,loop,alTerminar){const b=MUS.buf[nombre];if(!b)return false;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;s.loop=!!loop;
  if(loop){s.loopStart=.05;s.loopEnd=b.duration-.05;}g.gain.value=0;g.gain.setTargetAtTime(1,AC.currentTime,.25);s.connect(g);g.connect(MUS.g);s.start();
  if(alTerminar)s.onended=()=>{if(MUS.src===s)alTerminar();};MUS.src=s;MUS.sg=g;return true;}
// un ruido de taller cada ~5 segundos, desde un costado distinto cada vez
function musTaller(){clearTimeout(MUS.fxT);MUS.fxT=setTimeout(()=>{if(MUS.estado!=="espera")return;
    if(!MUS.cola.length)MUS.cola=MUS_FX.slice().sort(()=>Math.random()-.5);const n=MUS.cola.pop(),b=MUS.buf["taller_"+n];
    if(b&&!(muted||noMus)){const s=AC.createBufferSource(),g=AC.createGain(),p=AC.createStereoPanner?AC.createStereoPanner():null;s.buffer=b;g.gain.value=.55+Math.random()*.35;
      s.connect(g);if(p){p.pan.value=(Math.random()*2-1)*.7;g.connect(p);p.connect(MUS.fx);}else g.connect(MUS.fx);s.start();}
    musTaller();},4300+Math.random()*1400);}
function musEspera(){musParar(.6);if(!musTocar("espera",true))return;MUS.estado="espera";musTaller();}
function musArrancar(){if(!AC)return;if(!MUS.g){MUS.g=AC.createGain();MUS.g.connect(AC.destination);MUS.fx=AC.createGain();MUS.fx.connect(AC.destination);}musVol();
  musCargar().then(()=>{if(typeof TYR!=="undefined"&&TYR)return;if(MUS.estado!=="off")return;
    if(!MUS.introYa&&MUS.buf.intro){MUS.introYa=true;MUS.estado="intro";musTocar("intro",false,()=>musEspera());}else musEspera();});}
// reemplaza a la música vieja: en menús suena esto; en carrera, nada
bgm=function(){try{BGM.pause();}catch(e){}if(!AC)return;
  const enCarrera=typeof TYR!=="undefined"&&TYR;if(enCarrera||muted||noMus){if(MUS.estado!=="off")musParar(.8);musVol();return;}
  if(MUS.estado==="off")musArrancar();musVol();};
// vigila cuándo empieza y termina una carrera para cortar o volver a poner la música
setInterval(()=>{if(!AC)return;const enCarrera=typeof TYR!=="undefined"&&TYR;
  if(enCarrera&&MUS.estado!=="off")musParar(1.2);else if(!enCarrera&&MUS.estado==="off"&&!(muted||noMus)&&AC.state==="running")musArrancar();musVol();},700);
