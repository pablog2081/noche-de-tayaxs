/* ===== utilidades ===== */
const fmt=n=>"$ "+Math.round(n).toLocaleString("es-AR");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $=s=>document.querySelector(s);
const el=(h)=>{const t=document.createElement("template");t.innerHTML=h.trim();return t.content.firstElementChild};
/* ===== 3D: three.js y modelos ===== */
const T3={st:"idle",TH:null,ren:null,loader:null,models:{},loading:{},tex:{},env:null,show:null};
const THREE_URLS=["https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js","https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/loaders/GLTFLoader.js","https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/shaders/CopyShader.js","https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/shaders/LuminosityHighPassShader.js","https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/shaders/FXAAShader.js","https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/shaders/SMAAShader.js","https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/postprocessing/EffectComposer.js","https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/postprocessing/RenderPass.js","https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/postprocessing/ShaderPass.js","https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/postprocessing/MaskPass.js","https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/postprocessing/UnrealBloomPass.js","https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/postprocessing/SMAAPass.js"];
function loadScript(u){return new Promise((ok,no)=>{const s=document.createElement("script");s.src=u;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
function init3D(){
  if(T3.p)return T3.p;T3.st="loading";
  T3.p=(async()=>{try{
    if(!window.THREE)for(const u of THREE_URLS)await loadScript(u).catch(()=>{T3.err="No se pudo bajar three.js";throw new Error(T3.err);});
    const TH=window.THREE;if(!TH||!TH.GLTFLoader)throw 0;
    const ren=new TH.WebGLRenderer({canvas:document.getElementById("gl")||document.createElement("canvas"),antialias:false,alpha:false,powerPreference:"high-performance"});
    ren.outputEncoding=TH.sRGBEncoding;ren.toneMapping=TH.ACESFilmicToneMapping;ren.toneMappingExposure=1.15;ren.setPixelRatio(1);ren.setClearColor(0x000000,0);ren.shadowMap.enabled=true;ren.shadowMap.type=TH.PCFSoftShadowMap;
    T3.TH=TH;T3.ren=ren;T3.loader=new TH.GLTFLoader();T3.st="ready";return true;
  }catch(e){T3.st="off";T3.err=T3.err||"No se pudo iniciar el 3D ("+(e&&e.message||"sin WebGL o sin three.js")+")";console.error("3D",e);return false;}})();
  return T3.p;
}
const ready3D=()=>T3.st==="ready";
function makeGLB(js,b64){const enc=new TextEncoder();let jb=enc.encode(js);const jp=(4-jb.length%4)%4;
  const bs=atob(b64.trim()),bl=bs.length,bp=(4-bl%4)%4,total=12+8+jb.length+jp+8+bl+bp;
  const out=new Uint8Array(total),dv=new DataView(out.buffer);let o=0;
  dv.setUint32(0,0x46546C67,true);dv.setUint32(4,2,true);dv.setUint32(8,total,true);o=12;
  dv.setUint32(o,jb.length+jp,true);dv.setUint32(o+4,0x4E4F534A,true);o+=8;out.set(jb,o);o+=jb.length;for(let i=0;i<jp;i++)out[o++]=32;
  dv.setUint32(o,bl+bp,true);dv.setUint32(o+4,0x004E4942,true);o+=8;for(let i=0;i<bl;i++)out[o+i]=bs.charCodeAt(i);
  return out.buffer;}
const withTimeout=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r("timeout"),ms))]);
function canvasTex(w,h,fn,rep){const c=document.createElement("canvas");c.width=w;c.height=h;fn(c.getContext("2d"),w,h);const t=new T3.TH.CanvasTexture(c);t.encoding=T3.TH.sRGBEncoding;
  if(rep){t.wrapS=t.wrapT=T3.TH.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}t.anisotropy=8;return t;}
function dTex(w,h,fn,rep){const c=document.createElement("canvas");c.width=w;c.height=h;fn(c.getContext("2d"),w,h);const t=new T3.TH.CanvasTexture(c);t.encoding=T3.TH.sRGBEncoding;
  if(rep){t.wrapS=t.wrapT=T3.TH.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}t.anisotropy=8;return t;}
/* ===== banderillera 3D ===== */
const CH3={st:null,obj:null,act:null,mix:null,flag:null,bones:null};
const CH_WAVE=[.1,4.4],CH_TURN=[4.4,6.9];
function loadChica(){if(CH3.st)return;CH3.st="cargando";
  init3D().then(ok=>{if(!ok)throw 0;const get=f=>fetch("chica3d/"+f).then(r=>{if(!r.ok)throw new Error(f);return r.text();});
    return Promise.all([get("model.json"),get("geo.txt")]);}).then(([js,b64])=>new Promise((res,rej)=>T3.loader.parse(makeGLB(js,b64),"chica3d/",g=>{
    const TH=T3.TH,o=g.scene;o.traverse(n=>{n.layers.set(2);if(n.isMesh){n.frustumCulled=false;if(n.material)n.material.envMapIntensity=1;}});
    const mix=new TH.AnimationMixer(o),act=mix.clipAction(g.animations[0]);act.play();
    const B=k=>o.getObjectByName("mixamorig"+k)||o.getObjectByName("mixamorig:"+k);
    CH3.bones={hand:B("RightHand"),fore:B("RightForeArm")};
    CH3.obj=o;CH3.mix=mix;CH3.act=act;CH3.flag=makeFlag(TH);CH3.st="ok";res();},rej))).catch(e=>{console.warn("chica3d",e);CH3.st="error";});}
function makeFlag(TH){ // palo y paño a cuadros que flamea
  const NU=14,NV=9,geo=new TH.PlaneGeometry(1,1,NU-1,NV-1);
  const tex=canvasTex(256,192,(x,w,h)=>{const q=32;for(let yy=0;yy<h;yy+=q)for(let xx=0;xx<w;xx+=q){x.fillStyle=((xx+yy)/q)%2?"#111":"#f2f2f2";x.fillRect(xx,yy,q,q);}});
  const cloth=new TH.Mesh(geo,new TH.MeshStandardMaterial({map:tex,side:TH.DoubleSide,roughness:.8}));cloth.frustumCulled=false;
  const pole=new TH.Mesh(new TH.CylinderGeometry(.012,.012,1,6),new TH.MeshStandardMaterial({color:0x2a2a2a,roughness:.5,metalness:.4}));
  const grp=new TH.Group();grp.add(cloth,pole);grp.traverse(n=>n.layers.set(2));
  return {grp,cloth,pole,NU,NV,prev:null,vel:new TH.Vector3(),dir:new TH.Vector3(0,-1,0)};}
function updFlag(dt,t){const F=CH3.flag,TH=T3.TH,b=CH3.bones;if(!F||!b.hand||!b.fore)return;
  const h=b.hand.getWorldPosition(new TH.Vector3()),f=b.fore.getWorldPosition(new TH.Vector3());
  const ax=h.clone().sub(f).normalize(),L=.95,base=h.clone().addScaledVector(ax,-.04),tip=base.clone().addScaledVector(ax,L);
  F.pole.position.copy(base).addScaledVector(ax,L/2);F.pole.quaternion.setFromUnitVectors(new TH.Vector3(0,1,0),ax);
  if(F.prev&&dt>0)F.vel.lerp(tip.clone().sub(F.prev).divideScalar(dt),Math.min(1,dt*10));F.prev=tip.clone();
  // el paño se arrastra al revés del movimiento y cae por su peso
  const want=F.vel.clone().multiplyScalar(-.25).add(new TH.Vector3(0,-1.2,0)).add(new TH.Vector3(.5,0,0));
  want.addScaledVector(ax,-want.dot(ax));if(want.lengthSq()<1e-4)want.set(1,0,0).addScaledVector(ax,-ax.x);want.normalize();
  F.dir.lerp(want,Math.min(1,dt*6)).normalize();const d=F.dir.clone().addScaledVector(ax,-F.dir.dot(ax)).normalize(),n=new TH.Vector3().crossVectors(ax,d).normalize();
  const pos=F.cloth.geometry.attributes.position,W=.62,Hh=.44,amp=.05+Math.min(.12,F.vel.length()*.03);
  for(let j=0;j<F.NV;j++)for(let i=0;i<F.NU;i++){const u=i/(F.NU-1),v=j/(F.NV-1),k=j*F.NU+i;
    const wv=Math.sin(u*7-t*11+v*1.5)*amp*u+Math.sin(u*13-t*17)*.015*u;
    const p=tip.clone().addScaledVector(ax,-v*Hh-u*u*.05).addScaledVector(d,u*W).addScaledVector(n,wv);pos.setXYZ(k,p.x,p.y,p.z);}
  pos.needsUpdate=true;F.cloth.geometry.computeVertexNormals();F.cloth.geometry.computeBoundingSphere();}
/* ===== semáforo ===== */
function drawLights(ctx,w,h,phase){
  const r=h*.032,cx=w/2,y=h*.19;ctx.fillStyle="rgba(0,0,0,.6)";ctx.fillRect(cx-r*5.2,y-r*1.5,r*10.4,r*3);
  for(let i=0;i<4;i++){const on=i<3?phase>i:phase>=4;ctx.fillStyle=on?(i<3?"#e0242f":"#3fd07a"):"#333";ctx.beginPath();ctx.arc(cx-r*3.75+i*r*2.5,y,r,0,7);ctx.fill();}
}
/* ===== teclas ===== */
const tk=(a,c)=>!!c&&TECLAS[a].includes(c);
function teclaNom(c){if(!c)return "—";const M={ArrowUp:"↑",ArrowDown:"↓",ArrowLeft:"←",ArrowRight:"→",Space:"Espacio",ShiftLeft:"Shift",ShiftRight:"Shift der.",ControlLeft:"Ctrl",ControlRight:"Ctrl der.",AltLeft:"Alt",Enter:"Enter",Tab:"Tab",Backspace:"Borrar"};
  return M[c]||c.replace(/^Key/,"").replace(/^Digit/,"").replace(/^Numpad/,"Num ");}
const tkN=a=>TECLAS[a].filter(Boolean).map(teclaNom).join("/")||"—";
function kbTxt(modo){if(modo==="taya")return `${tkN("gas")} acelerar · ${tkN("izq")} adentro · ${tkN("der")} afuera (contravolante) · ${tkN("camara")} cámara · ${tkN("volante")} volante`;
  if(modo==="ov")return `${tkN("gas")} acelerar · ${tkN("bajar")} bajar · ${tkN("cambio")} subir · ${tkN("izq")} ${tkN("der")} carril · ${tkN("nitro")} nitro · ${tkN("volante")} volante`;
  return `${tkN("gas")} acelerar · ${tkN("cambio")} cambio · ${tkN("nitro")} nitro`;}
function teclasMenu(){let esp=null;
  const html=()=>`<h3>Teclas</h3><p class="nota" style="margin:0 0 6px">Tocá una tecla de la lista y después apretá la que quieras usar. Cada acción acepta dos teclas. Esc cancela, Borrar la deja vacía.</p>
    ${Object.keys(TECLAS_DEF).map(a=>`<div class="tkrow"><b>${TECLA_N[a]}</b>${[0,1].map(i=>`<button class="tkb${esp&&esp[0]===a&&esp[1]===i?" esp":""}" data-a="${a}" data-i="${i}">${esp&&esp[0]===a&&esp[1]===i?"Apretá…":teclaNom(TECLAS[a][i])}</button>`).join("")}</div>`).join("")}
    <div class="opts" style="margin-top:14px"><button class="btn sec" id="tkRes">Volver a las de fábrica</button><button class="btn oro" id="tkOk">Listo</button></div>`;
  const pinta=()=>{$("#mbox").innerHTML=html();$("#mbox").querySelectorAll(".tkb").forEach(b=>b.onclick=()=>{esp=[b.dataset.a,+b.dataset.i];pinta();});
    $("#tkRes").onclick=()=>{TECLAS=JSON.parse(JSON.stringify(TECLAS_DEF));guarda();pinta();};$("#tkOk").onclick=()=>{window.removeEventListener("keydown",cap,true);closeModal();};};
  const guarda=()=>{try{localStorage.setItem(KEY+".teclas",JSON.stringify(TECLAS));}catch(e){}document.querySelectorAll(".kb[data-modo]").forEach(k=>k.textContent=kbTxt(k.dataset.modo));};
  const cap=e=>{if(!esp)return;e.preventDefault();e.stopPropagation();const [a,i]=esp;esp=null;
    if(e.code==="Escape"){pinta();return;}if(e.code==="Backspace"){TECLAS[a][i]="";guarda();pinta();return;}
    for(const k in TECLAS)TECLAS[k]=TECLAS[k].map(c=>c===e.code?"":c);TECLAS[a][i]=e.code;guarda();pinta();};
  modal("");pinta();window.addEventListener("keydown",cap,true);
  const mo=$("#modal"),obs=new MutationObserver(()=>{if(mo.hidden){window.removeEventListener("keydown",cap,true);obs.disconnect();}});obs.observe(mo,{attributes:true});}
/* ===== sonido ===== */
let AC=null,eng=null,muted=false,noMus=false,noVoz=false,noFx=false;try{muted=localStorage.getItem(KEY+".mute")==="1";noMus=localStorage.getItem(KEY+".nomus")==="1";noVoz=localStorage.getItem(KEY+".novoz")==="1";noFx=localStorage.getItem(KEY+".nofx")==="1";}catch(e){}
const SND={buf:{},p:null};
function loadSounds(){if(SND.p||!AC)return SND.p;SND.p=Promise.all(["chico","medio","seis","v8"].map(n=>fetch("sonidos/motor2_"+n+".wav").then(r=>{if(!r.ok)throw 0;SND.v2=true;return r.arrayBuffer();}).catch(()=>fetch("sonidos/motor_"+n+".wav").then(r=>r.arrayBuffer())).then(a=>new Promise((ok,no)=>AC.decodeAudioData(a,ok,no))).then(b=>{SND.buf[n]=b;}).catch(()=>{})));return SND.p;}
// pitidos de semáforo de largada: tres cortos y agudos y uno más largo para largar
function pitido(f,d){if(!AC||muted||noFx)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain(),lp=AC.createBiquadFilter();
  o.type="square";o.frequency.value=f;lp.type="lowpass";lp.frequency.value=f*3.2;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.085,t+.008);
  g.gain.setValueAtTime(.085,t+d);g.gain.linearRampToValueAtTime(0,t+d+.03);o.connect(lp);lp.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.06);}
function blip(f=880,d=.12){if(!AC||muted||noFx)return;const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.value=.12;o.connect(g);g.connect(AC.destination);o.start();g.gain.setTargetAtTime(0,AC.currentTime+d*.6,.03);o.stop(AC.currentTime+d+.1);}
/* ===== ventanas ===== */
let vib=ms=>{try{navigator.vibrate&&navigator.vibrate(ms);}catch(e){}};
function toast(t){const d=el(`<div class="toast" role="status"></div>`);d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2400);}
function modal(html,cls){const b=$("#mbox");b.className="box "+(cls||"");b.innerHTML=html;$("#modal").hidden=false;}
function closeModal(){$("#modal").hidden=true;}
let modalLock=false;
$("#modal").addEventListener("click",e=>{if(e.target.id==="modal"&&!modalLock)closeModal();});
