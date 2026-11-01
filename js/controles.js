/* Noche de TAYA'xs — joystick y volante (Gamepad API)
   Joystick estándar (Xbox / PlayStation): gatillo derecho acelera, palanca izquierda dobla.
   Volante de PC: el eje del volante dobla y el pedal acelera; se calibra desde el menú (qué eje es cada cosa). */
const PAD={on:false,idx:null,id:"",cfg:null,prev:{},steerAct:false,last:0};
const PAD_KEY=KEY+".pad";
try{PAD.cfg=JSON.parse(localStorage.getItem(PAD_KEY)||"null");}catch(e){}
function padCfgDe(gp){if(PAD.cfg&&PAD.cfg.id===gp.id)return PAD.cfg;
  // por defecto: mapeo estándar del navegador
  return {id:gp.id,std:gp.mapping==="standard",steer:{axis:0,inv:false},gas:gp.mapping==="standard"?{btn:7}:{axis:2,min:1,max:-1},dead:.06,sens:1};}
function padLeer(gp,c){const ax=i=>gp.axes[i]??0,bt=i=>gp.buttons[i]?(gp.buttons[i].value||(gp.buttons[i].pressed?1:0)):0;
  let st=ax(c.steer.axis)*(c.steer.inv?-1:1);if(Math.abs(st)<c.dead)st=0;else st=Math.sign(st)*(Math.abs(st)-c.dead)/(1-c.dead);
  st=Math.sign(st)*Math.pow(Math.abs(st),1.35)*c.sens; // más fino cerca del centro
  let gas=0;if(c.gas.btn!=null)gas=bt(c.gas.btn);else{const v=ax(c.gas.axis);gas=(v-c.gas.min)/(c.gas.max-c.gas.min);}
  gas=Math.max(0,Math.min(1,gas));if(gas<.04)gas=0;
  // botones: A = acelerar a fondo (por si no hay gatillo), Y = cámara, X = volante, Start = pausa
  const b={a:bt(0)>.5,x:bt(2)>.5,y:bt(3)>.5,start:bt(9)>.5,lb:bt(4)>.5,rb:bt(5)>.5,izq:bt(14)>.5,der:bt(15)>.5};
  return {st:Math.max(-1,Math.min(1,st)),gas:Math.max(gas,b.a?1:0),b};}
function padPoll(){requestAnimationFrame(padPoll);const L=navigator.getGamepads?navigator.getGamepads():[];let gp=null;
  for(const g of L)if(g&&g.connected){gp=g;break;}
  if(!gp){if(PAD.on){PAD.on=false;toast("Se desconectó el joystick");}return;}
  if(!PAD.on||PAD.idx!==gp.index){PAD.on=true;PAD.idx=gp.index;PAD.id=gp.id;toast("🎮 Joystick/volante conectado: "+gp.id.split("(")[0].trim().slice(0,40));}
  const c=padCfgDe(gp),v=padLeer(gp,c),p=PAD.prev;PAD.v=v;
  if(typeof TYR!=="undefined"&&TYR&&!TYR.pausa){const R=TYR;
    R.padGas=v.gas;
    const st=v.st||(v.b.izq?-1:v.b.der?1:0);
    if(st!==0){R.steer=st;PAD.steerAct=true;}else if(PAD.steerAct){R.steer=0;PAD.steerAct=false;}
    const gb=$("#tyGas");if(gb)gb.classList.toggle("on",!!R.gas||v.gas>.05);
    if(v.b.y&&!p.y)$("#tyCam")&&$("#tyCam").click();
    if(v.b.x&&!p.x)$("#tyVol")&&$("#tyVol").click();}
  if(v.b.start&&!p.start&&typeof TYR!=="undefined"&&TYR)tyPausa();
  PAD.prev=v.b;}
requestAnimationFrame(padPoll);
// vibración del joystick en los golpes (además de la del celular)
const vibBase=vib;
vib=ms=>{vibBase(ms);try{const L=navigator.getGamepads?navigator.getGamepads():[];const gp=L&&PAD.idx!=null?L[PAD.idx]:null;const d=Array.isArray(ms)?ms.reduce((a,b)=>a+b,0):ms;
  if(gp&&gp.vibrationActuator)gp.vibrationActuator.playEffect("dual-rumble",{duration:Math.min(600,d),strongMagnitude:.8,weakMagnitude:.5}).catch(()=>{});}catch(e){}};
// calibración: se mueve cada cosa y el juego detecta el eje
function controlesMenu(){const L=navigator.getGamepads?navigator.getGamepads():[];const gp=PAD.idx!=null?L[PAD.idx]:null;
  const info=gp?`<p>Conectado: <b>${esc(gp.id)}</b></p>`:`<p class="nota">No hay joystick ni volante conectado. Enchufalo y tocá cualquier botón para que el navegador lo reconozca.</p>`;
  modal(`<h3>Controles</h3>
    <div class="sec-t">Teclado</div><p class="nota">${esc(kbTxt("taya"))} · ${tkN("pausa")} pausa</p><button class="btn sm" id="cTec">Cambiar las teclas</button>
    <div class="sec-t" style="margin-top:12px">Joystick o volante</div>${info}
    <p class="nota">Joystick: gatillo derecho (RT/R2) acelera, palanca izquierda dobla, Y/△ cámara, X/□ volante automático o manual, Start pausa.</p>
    <div id="cVivo" class="nota" style="font-family:monospace;white-space:pre;min-height:3em"></div>
    <div class="row" style="flex-wrap:wrap;gap:6px">${gp?`<button class="btn sm" id="cCal">Calibrar volante / pedal</button><button class="btn sm sec" id="cRes">Volver a lo estándar</button>`:""}</div>
    <label class="nota" style="display:flex;gap:8px;align-items:center;margin-top:8px">Sensibilidad del volante <input type="range" id="cSens" min="50" max="150" value="${Math.round(((PAD.cfg&&PAD.cfg.sens)||1)*100)}"></label>
    <div class="opts" style="margin-top:12px"><button class="btn oro" id="cOk">Listo</button></div>`);
  let vivo=true;const loop=()=>{if(!vivo||$("#modal").hidden){vivo=false;return;}const v=PAD.v,d=$("#cVivo");if(d&&v)d.textContent=`Volante ${(v.st>=0?"+":"")+v.st.toFixed(2)}   Acelerador ${(v.gas*100|0)}%`;requestAnimationFrame(loop);};loop();
  $("#cOk").onclick=()=>{vivo=false;closeModal();};$("#cTec").onclick=()=>{vivo=false;teclasMenu();};
  $("#cSens").oninput=e=>{const g=navigator.getGamepads()[PAD.idx];const c=Object.assign({},g?padCfgDe(g):{id:"",steer:{axis:0},gas:{btn:7},dead:.06});c.sens=+e.target.value/100;PAD.cfg=c;try{localStorage.setItem(PAD_KEY,JSON.stringify(c));}catch(x){}};
  if($("#cRes"))$("#cRes").onclick=()=>{PAD.cfg=null;try{localStorage.removeItem(PAD_KEY);}catch(x){}toast("Controles estándar");};
  if($("#cCal"))$("#cCal").onclick=()=>padCalibrar();}
function padCalibrar(){const snap=()=>{const g=navigator.getGamepads()[PAD.idx];return g?{a:[...g.axes],b:g.buttons.map(x=>x.value||(x.pressed?1:0)),id:g.id}:null;};
  const paso=(txt,cb)=>{modal(`<h3>Calibrar</h3><p>${txt}</p><p class="nota">Tenés 3 segundos…</p>`);const s0=snap();setTimeout(()=>{const s1=snap();cb(s0,s1);},3000);};
  const mayor=(s0,s1)=>{let best={k:null,d:0};s1.a.forEach((v,i)=>{const d=Math.abs(v-s0.a[i]);if(d>best.d)best={k:"axis",i,d,v0:s0.a[i],v1:v};});s1.b.forEach((v,i)=>{const d=Math.abs(v-s0.b[i]);if(d>best.d)best={k:"btn",i,d};});return best;};
  if(!snap()){toast("No encuentro el joystick");return;}
  paso("Girá el volante (o la palanca) <b>a la derecha</b> y dejalo ahí.",(a0,a1)=>{const s=mayor(a0,a1);if(!s.k||s.k!=="axis"){toast("No detecté el giro");controlesMenu();return;}
    const steer={axis:s.i,inv:s.v1<s.v0};
    paso("Ahora soltá el volante y <b>pisá el acelerador a fondo</b> (pedal o gatillo).",(b0,b1)=>{const g=mayor(b0,b1);let gas;
      if(g.k==="btn")gas={btn:g.i};else if(g.k==="axis")gas={axis:g.i,min:g.v0,max:g.v1};else{toast("No detecté el acelerador");controlesMenu();return;}
      PAD.cfg={id:a1.id,std:false,steer,gas,dead:.04,sens:(PAD.cfg&&PAD.cfg.sens)||1};try{localStorage.setItem(PAD_KEY,JSON.stringify(PAD.cfg));}catch(x){}
      toast("Listo: volante y acelerador calibrados");controlesMenu();});});}
// teclado: el volante no salta de golpe, gira suave hacia el lado de la flecha (como un volante de verdad)
const KBS={l:false,r:false,v:0,t:performance.now(),act:false};
window.addEventListener("keydown",e=>{if(tk("izq",e.code))KBS.l=true;if(tk("der",e.code))KBS.r=true;});
window.addEventListener("keyup",e=>{if(tk("izq",e.code))KBS.l=false;if(tk("der",e.code))KBS.r=false;});
window.addEventListener("blur",()=>{KBS.l=KBS.r=false;});
(function kbLoop(now){requestAnimationFrame(kbLoop);const dt=Math.min(.05,(now-KBS.t)/1000);KBS.t=now;
  if(typeof TYR==="undefined"||!TYR||PAD.steerAct)return;const tg=(KBS.r?1:0)-(KBS.l?1:0);
  if(!tg&&!KBS.act){KBS.v=0;return;}
  KBS.v+=(tg-KBS.v)*Math.min(1,dt*(tg?7:12));if(Math.abs(KBS.v)<.02&&!tg){KBS.v=0;KBS.act=false;TYR.steer=0;return;}
  KBS.act=true;TYR.steer=KBS.v;})(performance.now());
