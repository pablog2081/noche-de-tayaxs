/* Noche de TAYA'xs — la ceremonia de la Gran Final.
   · Presentación: los doce salen de boxes de a uno, en el orden de la grilla, y Fefón los presenta
     ("¡Aaaaa la pista…!", "En el tercer puesto larga…", "¡Máquina número…!"). El suplente que entra
     después de una bandera roja también sale presentado.
   · Al terminar: todos vuelven a boxes menos los tres primeros, que dan una vuelta más y se forman en
     fila india en la largada. Corte a la cámara de costado: vuelta de honor despacito, con el piloto
     parado en el costado del midget, casco puesto, laureles al cuello y el trofeo de su puesto, saludando a la tribuna. */
Object.assign(NAR_F4,{pres_final:"¡Atención, Bahía Blanca, que se viene la Gran Final! ¡Vamos a presentar a los doce gladiadores de la noche!",
  pres_pista:"¡Aaaaaa la pistaaaa…!",pres_pista2:"¡Y aaaaa la pista, señores…!",pres_turno:"¡Ahora le toca salir a la pista a…!",pres_asoma:"¡Asoma por el portón de boxes…!",
  pres_aplauso:"¡Un aplauso bien grande para…!",pres_p1:"¡Y en la pole position, en el primer puesto larga…!",maquina:"¡máquina número…",sup_entra:"¡Atención, que entra el suplente…!",
  honor1:"¡Y ahora, la vuelta de honor de los tres primeros! ¡Bahía Blanca los aplaude de pie!",honor2:"¡Miren cómo saludan con el trofeo en la mano! ¡Qué noche, señores, qué noche!",num_ciento:"ciento"});
["segundo","tercer","cuarto","quinto","sexto","séptimo","octavo","noveno","décimo","undécimo","duodécimo"].forEach((o,i)=>{NAR_F4["pres_p"+(i+2)]=`¡En el ${o} puesto larga…!`;});
for(let n=1;n<=100;n++)NAR_F4["num_"+n]=n+"!";
const tyFinalNum=n=>{n=n|0;return n<=100?["f:num_"+n]:n<200?["f:num_ciento","f:num_"+(n-100)]:[];};
const tyEsFinal=R=>R&&R.c&&!R.c.vivo&&!R.c.entreno&&!R.c.sufi&&((R.c.etapa||R.c).k==="final"||R.c.k==="final");

/* ---------- placa de la presentación ---------- */
function tyPresPlaca(e,txt){let d=$("#tyPres");if(!d){d=el(`<div id="tyPres"></div>`);$("#tyRace").append(d);}
  if(!e){d.remove();return;}d.innerHTML=`<small>${esc(txt)}</small><b><span style="background:${esc(e.col||"#ccc")}">#${e.num}</span> ${esc(e.n)}</b>`;d.classList.remove("on");void d.offsetWidth;d.classList.add("on");}

/* ---------- salida de a uno, presentados ---------- */
function tyPresRuta(e,gdist,gd,ordenIdx){const B=TYB,L=TY.LAP,bx=tyBoxDe(e.id,ordenIdx);e.box=bx;
  const gs=B.sal+5+((((gdist-(B.sal+5))%L)+L)%L||L);
  return tyRuta([[bx.s,bx.d],[bx.s,B.road],[B.sal-7,B.road],[B.sal+5,TY.W/2-2.5],[gs-9,gd],[gs,gd]]);}
/* ---------- la voz del estadio (el locutor), con eco de altoparlantes ---------- */
const LOC={busy:false,src:[],fin:0};
function tyLocOut(){if(LOC.out||!AC)return LOC.out;const g=AC.createGain(),dl=AC.createDelay(1),fb=AC.createGain(),wet=AC.createGain(),hp=AC.createBiquadFilter();
  hp.type="highpass";hp.frequency.value=180;dl.delayTime.value=.17;fb.gain.value=.28;wet.gain.value=.32;
  g.connect(hp);hp.connect(AC.destination);hp.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(AC.destination);LOC.out=g;return g;}
function tyLocStop(){LOC.src.forEach(s=>{try{s.stop();}catch(x){}});LOC.src=[];LOC.busy=false;clearTimeout(LOC.tm);}
// items: clave del clip, o {k, gap} (gap: pausa antes, puede ser negativa para pegarlas)
function tyLocutor(items,txt){tyLocStop();const M=NARF.map||{},ok=!(muted||noVoz)&&AC&&NARF.buf;let t=ok?AC.currentTime+.03:0,tot=0;LOC.busy=true;if(!ok)narLoadF();
  items.forEach((it,i)=>{const o=typeof it==="string"?{k:it}:it,c=M[o.k];if(!c)return;const [off,d]=c,gap=i?(o.gap!=null?o.gap:-.05):0;
    if(ok){t+=gap;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=NARF.buf;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1.15*VOL.rel,t+.02);g.gain.setValueAtTime(1.15*VOL.rel,t+Math.max(.03,d-.04));g.gain.linearRampToValueAtTime(0,t+d);
      s.connect(g);g.connect(tyLocOut());s.start(t,off,d);LOC.src.push(s);t+=d;}
    tot+=gap+d;});
  if(!tot)tot=1.2;LOC.tm=setTimeout(()=>{LOC.busy=false;},(tot+.15)*1000);if(txt&&TYR)tyMsg("🏟️ "+txt,"var(--oro)");}
const tyLocNum=n=>{n=n|0;return n<=100?["e_num_"+n]:n<200?["e_num_ciento",{k:"e_num_"+(n-100),gap:-.04}]:[];};
const tyLocNom=e=>e.yo?(S.tyVoz?["e_yo_"+S.tyVoz]:[]):["e_n_"+e.id];
/* ---------- la música: Also sprach Zarathustra ---------- */
const ZARA={a:null};
function tyZaraVol(){if(!ZARA.a)return;const base=(muted||noMus)?0:Math.min(1,.9*VOL.mus*1.4);ZARA.a.volume=Math.max(0,Math.min(1,base*(LOC.busy?.45:1)*(ZARA.fade??1)));}
function tyZara(on){if(on){try{if(!ZARA.a){ZARA.a=new Audio("taya/zaratustra.mp3?v=1");ZARA.a.preload="auto";}ZARA.fade=1;ZARA.a.currentTime=0;tyZaraVol();ZARA.a.play().catch(()=>{});}catch(x){}return;}
  if(!ZARA.a||ZARA.a.paused)return;const t0=performance.now(),f=()=>{ZARA.fade=Math.max(0,1-(performance.now()-t0)/2500);tyZaraVol();if(ZARA.fade>0)requestAnimationFrame(f);else ZARA.a.pause();};f();}
function tyPresentar(R,cars,cb,sup){const items=cars.map((e,i)=>{const gdist=e.dist,gd=e.d;return {e,r:tyPresRuta(e,gdist,gd,i),delay:1e9,fin:e=>{e.dist=gdist;e.s=gdist;e.d=gd;}};});
  if(!items.length){cb();return;}
  const cb0=cb;cb=()=>{tyPresPlaca(null);const cr=$("#tyPresCred");if(cr)cr.remove();if(!sup)tyZara(false);const t0=performance.now(),esp=()=>{if(TYR!==R)return;if((!LOC.busy&&narLibreF())||performance.now()-t0>6000)cb0();else setTimeout(esp,200);};esp();};
  tyAnimIni(R,"presenta",items,15,cb);const A=R.anim;A.dur=1e9;A.cine=true;A.pres={k:0,tUlt:-9,sup,listo:!!sup,fase:sup?2:0};
  A.B.onclick=()=>{narStopF();tyLocStop();tyZara(false);tyAnimFin(R);};
  if(!sup){narStopF();tyZara(true);$("#tyRace").append(el(`<div id="tyPresCred">Música: «Also sprach Zarathustra» (R. Strauss) · versión de Kevin MacLeod (incompetech.com) · CC BY 3.0</div>`));}
  tyMsg(sup?"Entra el suplente: sale de boxes y va al fondo de la grilla":"Gran Final: presentación de los pilotos","var(--oro)");}
const TY_REMATE={e_rem1:"¡Un aplauso!",e_rem2:"¡Atención con él!",e_rem3:"¡Viene con todo, señores!",e_rem4:"¡La tribuna lo ovaciona!",e_rem5:"¡Qué temporada viene haciendo!",e_rem_yo:"¡El piloto del pueblo!"};
const TY_MUJ=new Set(["t70","t71","t72","t73","t74","t130","t131","t132","t133","t134","t135"]);
function tyPresRemate(e,k){if(e.yo)return "e_rem_yo";if((k*7+3)%3!==0)return null;const muj=TY_MUJ.has(e.id),L=muj?["e_rem1","e_rem3","e_rem5"]:["e_rem1","e_rem2","e_rem3","e_rem4","e_rem5"];return L[Math.floor(Math.random()*L.length)];}
function tyPresTurno(R,A,t){const P=A.pres,o=A.items[P.k],e=o.e,k=P.k;o.delay=t;P.tUlt=t;P.k++;
  const num=tyLocNum(e.num),nom=tyLocNom(e),fila=Math.floor(k/4),caj=k%4;let seq,txt;
  if(P.sup){seq=["e_suplente",...num,{k:nom[0],gap:.12}];txt=`Ingresa el suplente, máquina número ${e.num}… ${e.n}`;}
  else{const ab=[[fila===0?"e_pista":fila===1?"e_fila2":"e_fila3",{k:fila===0?"e_maquina":"e_interna",gap:.25}],["e_su_lado"],["e_tercer",{k:"e_el_numero",gap:.12}],["e_externa"]][caj];
    seq=[...ab,{k:num[0],gap:.1},...num.slice(1),{k:nom[0],gap:.18}];
    // un remate de vez en cuando (a vos siempre: "¡El piloto del pueblo!")
    const rem=tyPresRemate(e,k);if(rem)seq.push({k:rem,gap:.35});
    const ini=fila===0?["¡A la pista! Máquina número","A su lado, con el número","En el tercer cajón sale… el número","Y contra la cuerda externa, el número"][caj]:[(fila===1?"¡Segunda fila! ":"¡Tercera fila! ")+"Por la cuerda interna, el número","A su lado, con el número","En el tercer cajón sale… el número","Y contra la cuerda externa, el número"][caj];
    txt=`${ini} ${e.num}… ${e.n}${rem?" "+TY_REMATE[rem]:""}`;}
  tyLocutor(seq.filter(x=>x&&(typeof x==="string"||x.k)),txt);
  tyPresPlaca(e,P.sup?"Ingresa el suplente · larga último":`Fila ${fila+1} · cajón ${caj+1}`);}
{const _ap=tyAnimPaso;tyAnimPaso=function(R,now){const A=R.anim;
  if(A&&A.pres){const t=A.frz!=null?A.frz:(now-A.t0)/1000,P=A.pres;tyZaraVol();
    // con la música: a los 9 s (cuando termina la primera fanfarria) el locutor anuncia "¡FI… NAL… deganadores!"
    if(P.fase===0&&t>9.3){P.fase=1;tyLocutor(["e_fi",{k:"e_nal",gap:.22},{k:"e_deganadores",gap:-.02}],"¡FI… NAL… deGANADORES!");P.tF=t;}
    else if(P.fase===1&&t-P.tF>1&&!LOC.busy){P.fase=2;P.listo=true;P.tUlt=t-1;}
    else if(P.listo&&P.k<A.items.length){const fila=Math.floor(P.k/4),min=P.sup?0:fila===0?1.2:1.9;if(t-P.tUlt>min&&(!LOC.busy||t-P.tUlt>7))tyPresTurno(R,A,t);}
    if(P.k>=A.items.length&&A.dur>1e8)A.dur=Math.max(...A.items.map(o=>o.delay+o.r.len/A.vel))+.8;}
  _ap.apply(this,arguments);
  const B=R.anim;if(!B)return;
  if(B.pres){const P=B.pres,o=B.items[Math.max(0,P.k-1)],e=o.e,t=(now-B.t0)/1000;
    if(P.k===0){const bx=B.items[0].e;B.cam={s:TYB.sal-2,d:TYB.road+1.6,y:3.4,fs:bx.s,fd:bx.d};}
    else{const x=Math.max(0,t-o.delay)*B.vel,sq=((e.s%TY.LAP)+TY.LAP)%TY.LAP,pit=e.d>TY.W/2+1&&sq<TYB.sal+4;B.cam=pit?{s:TYB.sal-2,d:TYB.road+1.6,y:3.4,fs:e.s,fd:e.d}:{s:e.s+9,d:e.d-6,y:2.8,fs:e.s,fd:e.d};}}
  if(B.honor1){const e=B.items[0].e;B.cam={s:e.s-14,d:e.d-5,y:5.5,fs:e.s+3,fd:e.d};}};}
const B2s=e=>e.s;
// la final: presentación en vez de la salida en montón
{const _bs=tyBoxesSalida;tyBoxesSalida=function(R,cb){if(tyEsFinal(R)&&R.g3&&!R.presentada){R.presentada=true;
    const orden=R.cars.filter(e=>!e.out).slice().sort((a,b)=>b.dist-a.dist||a.d-b.d);tyPresentar(R,orden,cb,false);return;}
  return _bs.apply(this,arguments);};}
// el suplente que entra en la final después de una roja también sale de boxes presentado
{const _rl=tyRelargar;tyRelargar=function(R){const antes=R.cars.length;_rl.apply(this,arguments);
  if(tyEsFinal(R)&&R.g3&&R.cars.length>antes)R.presPend=R.cars.slice(antes);};}
{const _sm=tySemaforo;tySemaforo=function(){const R=TYR;if(R&&R.presPend&&R.presPend.length){const nuevos=R.presPend;R.presPend=null;R.esperaLuz=false;
    tyPresentar(R,nuevos,()=>{if(TYR===R)_sm();},true);return;}
  return _sm.apply(this,arguments);};}

/* ---------- el piloto parado saludando (modelo de Meshy) con el trofeo de su puesto ---------- */
const TY_TROFEO=[null,{c:[.78,.8,.84]},{c:[.72,.45,.25]}]; // 1º oro (el del modelo), 2º plata, 3º bronce
function tyCampeonObj(e,puesto){const src=TY3.per&&TY3.per.campeon;if(!src)return null;const TH=T3.TH,g=src.clone(true),tint=new TH.Color(e.col||"#ffffff"),tro=TY_TROFEO[puesto];
  g.traverse(q=>{if(!q.isMesh)return;q.castShadow=true;q.geometry=q.geometry.clone();q.material=q.material.clone();q.material.roughness=.6;q.material.metalness=0;
    q.material.onBeforeCompile=sh=>{sh.uniforms.uTint={value:tint};sh.uniforms.uTro={value:new TH.Vector3(...(tro?tro.c:[0,0,0]))};sh.uniforms.uHay={value:tro?1:0};
      sh.fragmentShader="uniform vec3 uTint;uniform vec3 uTro;uniform float uHay;\n"+sh.fragmentShader.replace("#include <map_fragment>",`#include <map_fragment>
      {vec3 c=diffuseColor.rgb;float l=max(c.r,max(c.g,c.b)),mn=min(c.r,min(c.g,c.b)),sat=(l-mn)/max(l,.001);
       float oro=step(.25,sat)*step(c.b*1.25,c.g)*step(c.g,c.r*1.05)*step(c.g,c.r)*step(c.r*.45,c.g);
       if(uHay>.5&&oro>.5)diffuseColor.rgb=uTro*(l*1.15+.08);
       float w=smoothstep(.62,.85,l)*(1.-smoothstep(.06,.18,sat));diffuseColor.rgb=mix(diffuseColor.rgb,uTint*l,w*.55);}`);};});
  // el brazo en alto saluda: se mueven los vértices de arriba del hombro
  const ola=[];g.traverse(q=>{if(!q.isMesh)return;const P=q.geometry.attributes.position,b=q.geometry.boundingBox||(q.geometry.computeBoundingBox(),q.geometry.boundingBox);
    const A=src.userData.brazo;if(!A)return;const idx=[],org=[];for(let i=0;i<P.count;i++){const y=P.getY(i),x=P.getX(i),z=P.getZ(i);if(y>A.y0&&(A.lado>0?x>A.x0:x<A.x0)){idx.push(i);org.push(x,y,z);}}
    if(idx.length)ola.push({q,idx,org,A});});
  g.userData.ola=ola;g.userData.campeon=true;return g;}
function tyCampeonSaluda(g,t){for(const o of g.userData.ola||[]){const P=o.q.geometry.attributes.position,A=o.A,ang=Math.sin(t*5.5)*.28;const c=Math.cos(ang),s=Math.sin(ang);
    for(let j=0;j<o.idx.length;j++){const x=o.org[j*3]-A.px,y=o.org[j*3+1]-A.py,w=Math.min(1,(o.org[j*3+1]-A.y0)/A.rampa);const a2=ang*w,c2=Math.cos(a2),s2=Math.sin(a2);
      P.setXY(o.idx[j],A.px+x*c2-y*s2,A.py+x*s2+y*c2);}P.needsUpdate=true;}}
// busca en el modelo el brazo levantado: es la parte más alta, a un costado de la cabeza
function tyCampeonPrep(h){if(h.userData.brazo!==undefined)return;h.userData.brazo=null;let mesh=null;h.traverse(q=>{if(q.isMesh&&!mesh)mesh=q;});if(!mesh)return;
  const P=mesh.geometry.attributes.position;let ymin=1e9,ymax=-1e9,xmin=1e9,xmax=-1e9;for(let i=0;i<P.count;i++){const y=P.getY(i),x=P.getX(i);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);}
  const H=ymax-ymin,yTop=ymax-H*.06;let sx=0,n=0;for(let i=0;i<P.count;i++)if(P.getY(i)>yTop){sx+=P.getX(i);n++;}if(!n)return;const xm=(xmin+xmax)/2,xh=sx/n,lado=xh>xm?1:-1;
  const y0=ymin+H*.8,px=xm+lado*H*.11,py=ymin+H*.8;h.userData.brazo={y0,x0:xm+lado*H*.05,lado,px,py,rampa:H*.12};}

/* ---------- final de la final: a boxes, los tres primeros dan una vuelta y forman en fila ---------- */
{const _be=tyBoxesEntrada;tyBoxesEntrada=function(R,cb){if(!tyEsFinal(R)||!R.g3)return _be.apply(this,arguments);
  const B=TYB,L=TY.LAP,pos=tyPosiciones(R),top=pos.filter(e=>!e.out&&e.fin!=null).slice(0,3),items=[];
  if(!top.length)return _be.apply(this,arguments);
  const lider=top[0],linea=Math.ceil((lider.s+30)/L)*L;
  R.cars.forEach((e,i)=>{if(e.gone||e.out){if(e.g)e.g.visible=false;e.gone=true;return;}const k=top.indexOf(e);
    if(k>=0){const s0=e.s,stop=linea-6-k*5.5,r=tyRuta([[s0,e.d],[s0+18,.5],[stop-30,.5],[stop,.5]]);items.push({e,r,delay:k*.5});return;}
    const bx=e.box||tyBoxDe(e.id,i),s0=((e.s%L)+L)%L;let off=0;if(B.ent-9<s0+4)off=L;
    const r=tyRuta([[s0,e.d],[s0+5,Math.max(-2,Math.min(3,e.d))],[B.ent-9+off,TY.W/2-2.5],[B.ent+4+off,B.road],[bx.s+off,B.road],[bx.s+off,bx.d]]);
    items.push({e,r,delay:i*.15,fin:e=>{e.gone=true;}});});
  // la vuelta de los tres va más rápido que la entrada a boxes
  items.forEach(o=>{if(top.includes(o.e)){o.r.len=o.r.len;}});
  tyAnimIni(R,"entrada",items,22,()=>tyVueltaHonor(R,top,cb));R.anim.honor1=true;R.anim.cine=true;
  narraF("entrada",{});setTimeout(()=>{if(TYR===R){NARRA_F4.honor_a=[["f:honor1"]];NARF_BOLSA.honor_a=null;narraF("honor_a",{});}},5500);
  tyMsg("Vuelven todos a boxes. Los tres primeros dan una vuelta más y forman en la largada","var(--oro)");};}
NARRA_F4.honor_b=[["f:honor2"]];
function tyVueltaHonor(R,top,cb){if(TYR!==R)return;const TH=T3.TH,L=TY.LAP,E=TY3.env;R.cars.forEach(e=>{if(!top.includes(e)){e.gone=true;if(e.g)e.g.visible=false;}});
  const pegados=[];
  const armar=()=>{top.forEach((e,k)=>{const g=e.g;if(!g)return;const pil=g.userData.piloto;if(pil)pil.visible=false;const c=tyCampeonObj(e,k);if(!c)return;
    const src=TY3.mod[e.m],W=src&&src.userData.ruedas||[],del=W.filter(w=>w.del),tra=W.filter(w=>!w.del),xm=del.length&&tra.length?(del[0].x+tra[0].x)/2:-.2,zo=tra.length?Math.max(...tra.map(w=>Math.abs(w.z))):.7;
    c.position.set(xm,.33,zo*.92);c.rotation.y=TY_CAMPEON_ROT;g.userData.piv.add(c);pegados.push({g,c,pil});});};
  tyPersona("campeon",1.72).then(h=>{tyCampeonPrep(h);armar();},()=>{});
  const items=top.map((e,k)=>{const s0=e.s,r=tyRuta([[s0,e.d],[s0+14,TY.W/2-3],[s0+L*.75,TY.W/2-3]]);return {e,r,delay:0};});
  tyAnimIni(R,"honor",items,6.5,()=>{});const A=R.anim;A.cine=true;A.honor=true;A.dur=1e9;A.B.textContent="Saltar ⏭";
  const ban=el(`<div id="tyHonor"><b>🏆 Vuelta de honor</b><span>${top.map((e,k)=>`${k+1}º #${e.num} ${esc(e.n)}`).join(" · ")}</span></div>`);$("#tyRace").append(ban);
  const nm=top.map(e=>e);narStopF();narraF("podio",{a:nm[0],b:nm[1],c:nm[2]});
  let dijo=false,fin=false;const t0=performance.now();
  const terminar=()=>{if(fin)return;fin=true;pegados.forEach(p=>{p.g.userData.piv.remove(p.c);if(p.pil)p.pil.visible=true;});ban.remove();window.__tyCam=null;
    if(R.anim===A){R.anim=null;A.B.remove();}cb();};
  A.B.onclick=()=>{narStopF();terminar();};
  A.honorPaso=now=>{const t=A.tFrz!=null?A.tFrz:(now-t0)/1000;pegados.forEach((p,i)=>{tyCampeonSaluda(p.c,t+i*.7);});
    if(!dijo&&t>4&&narLibreF()){dijo=true;narraF("honor_b",{});}
    // cámara de costado, desde adentro: se los ve de espaldas saludando a la tribuna
    const m=top[Math.min(1,top.length-1)],cp=tyPose(m.s-1,m.d-10),lk=tyPose(m.s,m.d+1);window.__tyCam={p:[cp.x,tyY(m.s,m.d)+2.1,cp.z],l:[lk.x,1.3,lk.z],f:50};
    if(t>30||(dijo&&t>16&&narLibreF()))terminar();};}
const TY_CAMPEON_ROT=0;
{const _ap2=tyAnimPaso;tyAnimPaso=function(R,now){const A=R.anim;if(A&&A.honor){const t=A.tFrz!=null?A.tFrz:(now-A.t0)/1000;
    for(const o of A.items){const x=Math.min(o.r.len,t*A.vel),p=tyRutaEn(o.r,x),e=o.e;e.s=p.s;e.d=p.d;e.sa+=(p.ang-e.sa)*Math.min(1,(R.dt||.016)*4);e.v=A.vel;e.th=.15;}
    if(A.honorPaso)A.honorPaso(now);return;}
  return _ap2.apply(this,arguments);};}
