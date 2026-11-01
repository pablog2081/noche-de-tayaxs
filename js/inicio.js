/* Noche de TAYA'xs — página de inicio: todo lo del juego en un lugar, y botones a la fecha, el entrenamiento, Warnes y el kiosco.
   Además: el control de sonido, siempre a mano (también en carrera), con una lista desplegable. */
function vInicio(m){const T=tyPz(),reg=T.fecha<TY_REG,po=T.po;
  const fase=T.fecha>=TY_FECHAS?"Campeonato terminado":reg?`Fecha ${T.fecha+1} de ${TY_FECHAS} · temporada regular`:`Fecha ${T.fecha+1} de ${TY_FECHAS} · playoff`;
  const tab=tyTabla(),yoI=tab.findIndex(r=>r.id==="yo"),enNoche=!!S.tayaJ;
  const goTxt=T.fecha>=TY_FECHAS?"Nueva temporada":enNoche?"Seguir la noche":!T.habil?"Habilitación":"Correr la fecha "+(T.fecha+1);
  const goSub=enNoche?"La noche está empezada: solo podés usar lo que tenés en stock":!T.habil?"Piloto nuevo: práctica en el salitral y tiempo de suficiencia":T.chapa?"Primero arreglá el auto en el taller":"Series, repechajes, semis, prefinal y la Gran Final";
  const d=el(`<div class="inicio">
    <section class="hero"><div><h1>Noche de TAYA'xs</h1><p>Midgets en el óvalo de tierra de Bahía Blanca. ${esc(fase)} · vas ${yoI+1}º de ${tab.length}.</p></div></section>
    <section class="tiles">
      <button class="tile t-fecha" id="iFecha"><i>🏁</i><b>${goTxt}</b><span>${goSub}</span></button>
      <button class="tile t-ent" id="iEnt"><i>🧂</i><b>Entrenamiento</b><span>Solo en el salitral, sin gastos${T.mejorSal?` · récord ${T.mejorSal.toFixed(2)} s`:""}</span></button>
      <button class="tile t-war" id="iWar"><i>🔧</i><b>Warnes</b><span>Gomería, rectificadora, repuestos y tren delantero${enNoche?" · cerrado durante la noche":""}</span></button>
      <button class="tile t-tal" id="iTal"><i>🛠️</i><b>Taller</b><span>${enNoche?"Cerrado durante la noche":T.chapa?"¡El auto volcó: hay que enderezarlo!":"Preparar y reparar el auto entre fechas"}</span></button>
      <button class="tile t-kio" id="iKio"><i>🛒</i><b>Kiosco</b><span>Plata para el juego</span></button>
      <button class="tile t-tab" id="iTab"><i>🏆</i><b>Campeonato</b><span>${T.po?"Playoff y Copa de Plata":"La tabla de los 140 pilotos"}</span></button>
    </section>
    <section class="ini2"><div class="copa imid"><div class="t">Tu midget</div></div><div class="copa ipz"><div class="t">Piezas y stock</div></div><div class="copa iaju"><div class="t">Ajustes</div></div></section></div>`);
  m.append(d);
  // tu midget: vitrina 3D, chasis, color, estado de las piezas y stock
  const car=d.querySelector(".imid");
  car.append(el(`<div><div class="s">Chasis ${TY_HUMAN[T.m]} · número ${T.num}. Cambiar de chasis cuesta ${fmt(TY_CHASIS_P)} y no se puede con la noche empezada.</div>
    <div class="row" style="flex-wrap:wrap;gap:6px;margin:8px 0">${TY_M.map(k=>`<button class="btn sm ${T.m===k?"oro":"sec"}" data-m="${k}">${TY_HUMAN[k]}</button>`).join("")}</div>
    <div class="row" style="flex-wrap:wrap;gap:6px">${TY_COL.slice(0,10).map(c=>`<button aria-label="color" data-c="${c}" style="width:30px;height:30px;border-radius:50%;background:${c};border:3px solid ${T.col===c?"var(--oro)":"var(--linea)"}"></button>`).join("")}</div>
    </div>`));
  d.querySelector(".ipz").append(el(`<div>${pzEstadoHTML(S.tayaJ)}<div class="sec-t" style="margin-top:8px">Stock de repuestos</div>${pzStockHTML()}</div>`));
  try{tyVitrina(car);}catch(e){}
  car.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{const k=b.dataset.m;if(k===T.m)return;if(S.tayaJ){toast("Con la noche empezada no se puede cambiar el chasis");return;}
    if(S.pesos<TY_CHASIS_P){toast("Cambiar de chasis cuesta "+fmt(TY_CHASIS_P)+": pasá por el kiosco");return;}
    modal(`<h3 class="gan">¿Comprar el chasis ${TY_HUMAN[k]}?</h3><p>Cuesta ${fmt(TY_CHASIS_P)}. Tenés ${fmt(S.pesos)}.</p><div class="opts"><button class="btn oro" id="tyCh">Comprar</button><button class="btn sec" id="tyNo">No</button></div>`,"resplaca");
    $("#tyCh").onclick=()=>{S.pesos-=TY_CHASIS_P;T.m=k;save();closeModal();render();};$("#tyNo").onclick=closeModal;});
  car.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{T.col=b.dataset.c;save();render();});
  // ajustes: apodo, nombre que grita el relator, gráficos, controles, sonido
  const aj=d.querySelector(".iaju");
  aj.append(el(`<div class="ajlist">
    <label>Tu apodo<input id="aApodo" maxlength="16" value="${esc(S.apodo||"")}"></label>
    <label>El relator te grita<select id="aVoz"><option value="">el piloto del pueblo</option>${TY_VOCES.map(n=>`<option value="${tySlug(n)}"${S.tyVoz===tySlug(n)?" selected":""}>¡${n}!</option>`).join("")}</select></label>
    <label>Gráficos<select id="aGraf">${[["ultra","Ultra (PC con placa de video)"],["alta","Alta (notebooks)"],["media","Media (PC viejita)"]].map(([k,t])=>`<option value="${k}"${(S.graf||"ultra")===k?" selected":""}>${t}</option>`).join("")}</select></label>
    <label>Cámara al largar<select id="aCam">${[["atras","De atrás"],["cabina","De adentro"],["lado","De costado"],["arriba","De arriba"]].map(([k,t])=>`<option value="${k}"${(S.tyCam||"atras")===k?" selected":""}>${t}</option>`).join("")}</select></label>
    <label>Volante<select id="aVol"><option value="auto"${(S.tyVol||"auto")==="auto"?" selected":""}>Automático (sigue la línea)</option><option value="manual"${S.tyVol==="manual"?" selected":""}>Manual (vos doblás)</option></select></label>
    <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:6px"><button class="btn sm" id="aCtl">🎮 Teclado, joystick y volante</button><button class="btn sm" id="aSnd">🔊 Sonido</button></div></div>`));
  aj.querySelector("#aApodo").onchange=e=>{const v=e.target.value.trim().slice(0,16);if(v){S.apodo=v;save();hud();}};
  aj.querySelector("#aVoz").onchange=e=>{S.tyVoz=e.target.value||null;save();if(S.tyVoz){narLoadF();narraF("adentro",{a:{yo:true}});}};
  aj.querySelector("#aGraf").onchange=e=>{S.graf=e.target.value;save();};aj.querySelector("#aCam").onchange=e=>{S.tyCam=e.target.value;save();};aj.querySelector("#aVol").onchange=e=>{S.tyVol=e.target.value;save();};
  aj.querySelector("#aCtl").onclick=controlesMenu;aj.querySelector("#aSnd").onclick=e=>{e.stopPropagation();sndAbrir(true);};
  // botones grandes
  d.querySelector("#iFecha").onclick=()=>tyIrFecha();
  d.querySelector("#iEnt").onclick=()=>tyEntreno();
  d.querySelector("#iWar").onclick=()=>vWarnes();
  d.querySelector("#iKio").onclick=()=>vKiosco();
  d.querySelector("#iTal").onclick=()=>vTaller();
  d.querySelector("#iTab").onclick=()=>vCampeonato();}
// la fecha: usa la misma lógica de siempre (arma la noche, el box entre carreras y larga)
function tyIrFecha(){if(typeof TYR!=="undefined"&&TYR)return;const tmp=document.createElement("div");_vTayaBase(tmp);const b=tmp.querySelector("#tyGo");if(b)b.click();}
function vCampeonato(){const m=$("#main"),T=tyState(),po=T.po,tab=tyTabla(),yoI=tab.findIndex(r=>r.id==="yo"),g=T.ganF||{};m.innerHTML="";hud();
  const fila=(r,i,extra)=>`<tr${r.id==="yo"?' class="yo"':''}><td>${i+1}</td><td>#${tyNum(r.id)} ${esc(tyNombre(r.id))}</td><td>${g[r.id]?"🏆".repeat(Math.min(3,g[r.id]))+(g[r.id]>3?g[r.id]:""):""}</td>${extra}</tr>`;
  const cp=T.cp?T.cp.ids.map(id=>({id,p:T.cp.pts[id]|0})).sort((a,b)=>b.p-a.p):null;
  const d=el(`<div class="camp"><div class="row" style="justify-content:space-between;align-items:center"><div><h2 style="margin:0">Campeonato</h2>
      <p class="sub" style="margin:2px 0 0">${tab.length} pilotos · vas ${yoI+1}º · fechas 1 a ${TY_REG} regulares, los 12 primeros al playoff y el resto a la Copa de Plata. Para ser campeón hay que haber ganado una final (🏆).</p></div><button class="btn sec" id="cVol" style="width:auto;flex:0 0 auto">◀ Inicio</button></div>
    <div class="cgrid"><div class="copa"><div class="t">${po?"Playoff":"Temporada regular"}</div><div class="cscroll"><table class="ovtab"><tr><th>Pos</th><th>Piloto</th><th>Finales</th>${po?"<th>Playoff</th>":""}<th>Pts</th></tr>${tab.filter(r=>!po||po.todos.includes(r.id)).map((r,i)=>fila(r,i,`${po?`<td>${r.vivo?r.po:"afuera"}</td>`:""}<td>${r.p}</td>`)).join("")}</table></div></div>
      ${cp?`<div class="copa"><div class="t">Copa de Plata</div><div class="cscroll"><table class="ovtab"><tr><th>Pos</th><th>Piloto</th><th>Finales</th><th>Pts</th></tr>${cp.map((r,i)=>fila(r,i,`<td>${r.p}</td>`)).join("")}</table></div></div>`:""}</div></div>`);
  m.append(d);$("#cVol").onclick=render;}

/* ---------- sonido: siempre a mano, con lista desplegable ---------- */
const VOL=(()=>{try{return Object.assign({gen:1,mot:1,rel:1,mus:.6},JSON.parse(localStorage.getItem(KEY+".vol")||"{}"));}catch(e){return {gen:1,mot:1,rel:1,mus:.6};}})();
function volGuardar(){try{localStorage.setItem(KEY+".vol",JSON.stringify(VOL));localStorage.setItem(KEY+".mute",muted?"1":"0");localStorage.setItem(KEY+".nomus",noMus?"1":"0");localStorage.setItem(KEY+".novoz",noVoz?"1":"0");localStorage.setItem(KEY+".nofx",noFx?"1":"0");}catch(e){}}
// todo lo que suena pasa por un volumen general
let MASTER=null;
function volAplicar(){if(AC){if(!MASTER){MASTER=AC.createGain();MASTER.connect(AC.destination);const oc=AudioNode.prototype.connect;
      AudioNode.prototype.connect=function(dst,...r){if(dst===AC.destination&&this!==MASTER)dst=MASTER;return oc.call(this,dst,...r);};}
    MASTER.gain.value=muted?0:VOL.gen;if(typeof NARF!=="undefined"&&NARF.gain)NARF.gain.gain.value=noVoz?0:1.2*VOL.rel;}
  if(typeof musVol==="function")musVol();
  const b=$("#sndBtn");if(b)b.textContent=muted||VOL.gen<.01?"🔇":"🔊";const h=$("#bMute");if(h)h.textContent=muted?"🔇":"🔊";}
function sndAbrir(forzar){let p=$("#sndPanel");if(p&&!forzar){p.remove();return;}if(p)p.remove();
  const sl=(k,t)=>`<label class="sndrow"><span>${t}</span><input type="range" min="0" max="100" value="${Math.round(VOL[k]*100)}" data-v="${k}"></label>`,ck=(k,t,on)=>`<label class="sndck"><input type="checkbox" data-k="${k}"${on?" checked":""}> ${t}</label>`;
  p=el(`<div id="sndPanel"><div class="t">Sonido</div>${ck("all","Todo el sonido",!muted)}${sl("gen","Volumen general")}${ck("fx","Motores y golpes",!noFx)}${sl("mot","Motores")}${ck("voz","Relato",!noVoz)}${sl("rel","Relato")}${ck("mus","Música de fondo",!noMus)}${sl("mus","Música")}</div>`);
  document.body.append(p);
  p.querySelectorAll("input[data-v]").forEach(i=>i.oninput=()=>{VOL[i.dataset.v]=+i.value/100;volAplicar();volGuardar();});
  p.querySelectorAll("input[data-k]").forEach(i=>i.onchange=()=>{const v=!i.checked;({all:()=>muted=v,fx:()=>noFx=v,voz:()=>noVoz=v,mus:()=>noMus=v})[i.dataset.k]();
    if(muted||noFx){if(typeof tyAudioStop==="function"&&!(typeof TYR!=="undefined"&&TYR&&!muted&&!noFx))tyAudioStop();}else if(typeof TYR!=="undefined"&&TYR&&!TYA.yo)tyAudioStart();
    if(noVoz&&typeof narStopF==="function")narStopF();audioInit();bgm();volAplicar();volGuardar();});
  p.addEventListener("click",e=>e.stopPropagation());}
document.addEventListener("click",e=>{const p=$("#sndPanel");if(p&&!e.target.closest("#sndBtn")&&!e.target.closest("#sndPanel")&&!e.target.closest("#bMute"))p.remove();});
document.body.append(el(`<button id="sndBtn" title="Sonido">🔊</button>`));
$("#sndBtn").onclick=e=>{e.stopPropagation();audioInit();volAplicar();sndAbrir();};
$("#bMute").onclick=e=>{e.stopPropagation();audioInit();volAplicar();sndAbrir();};
setInterval(volAplicar,1000);volAplicar();
