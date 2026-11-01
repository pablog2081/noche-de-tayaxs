/* Noche de TAYA'xs — MULTIJUGADOR
   · Mano a mano: dos pilotos, una carrera del largo de la final.
   · Jornada única: todos los inscriptos en la sala + máquinas hasta completar los 128 de la noche, con el reglamento
     completo (series, repechajes, semis, prefinal y final). Las carreras con humanos se corren en vivo; las demás se simulan.
   · Campeonato: varias jornadas únicas seguidas con la misma sala; la tabla suma los puntos de cada noche.
   Red: Firebase (el mismo proyecto del Rey de la Costanera, salas con prefijo "ntx_"). Con ?red=local usa BroadcastChannel
   (dos pestañas del mismo navegador), para probar sin internet. */

/* ---------- red ---------- */
const FB_CFG={apiKey:"AIzaSyDX4zmUO3UFbKzCxt-yjfUzYe7KBJEoGeo",authDomain:"rey-de-la-costanera.firebaseapp.com",databaseURL:"https://rey-de-la-costanera-default-rtdb.firebaseio.com",projectId:"rey-de-la-costanera",storageBucket:"rey-de-la-costanera.firebasestorage.app",messagingSenderId:"653162476908",appId:"1:653162476908:web:d9a7dc0fe73ba1ea852f49"};
const FBV="10.12.2";
const jsonClean=o=>JSON.parse(JSON.stringify(o===undefined?null:o));
function loadScript(u){return new Promise((ok,ko)=>{const s=document.createElement("script");s.src=u;s.onload=ok;s.onerror=ko;document.head.appendChild(s);});}
let netProm=null;
function netInit(){if(netProm)return netProm;netProm=(async()=>{
  const local=/[?&]red=local/.test(location.search);
  if(local){NET.uid=NET.uid||("u"+Math.random().toString(36).slice(2,9));NET.now=()=>Date.now();NET.db=lsDb();NET.room=bcRoom("lobby");NET.ready=true;return true;}
  try{for(const m of ["app","auth","database"])await loadScript(`https://cdn.jsdelivr.net/npm/firebase@${FBV}/firebase-${m}-compat.js`);}catch(e){return false;}
  const fb=window.firebase;if(!fb)return false;try{fb.initializeApp(FB_CFG);}catch(e){}
  let user=await new Promise(res=>{const un=fb.auth().onAuthStateChanged(x=>{un();res(x);});});
  if(!user){try{user=(await fb.auth().signInAnonymously()).user;}catch(e){return false;}}
  const D=fb.database();NET.fb=D;NET.uid=user.uid;let off=0;D.ref(".info/serverTimeOffset").on("value",s=>{off=s.val()||0;});
  NET.now=()=>Date.now()+off;NET.db=fbDb(D);NET.room=fbRoom(D,"ntx_lobby",user.uid);NET.ready=true;return true;})();
  netProm.then(ok=>{if(!ok)netProm=null;});return netProm;}
function fbDb(D){return {doc:p=>({get:async()=>{const s=await D.ref(p).once("value");return {exists:s.exists(),data:()=>s.val()};},set:o=>D.ref(p).set(jsonClean(o))})};}
function fbRoom(D,name,uid){
  const TS=firebase.database.ServerValue.TIMESTAMP;
  const base=D.ref("salas/"+name),me=NET.pid||(NET.pid=D.ref("salas").push().key),myRef=base.child("peers/"+me);
  let pres={},joined=false,gone=false,peers=[],peerCbs=[],evCbs={},evQ=null,hb=null,conn=null;
  const write=()=>{myRef.onDisconnect().remove();return myRef.set({by:uid,p:pres,at:TS});};
  async function ensure(){if(joined||gone)return;joined=true;
    conn=D.ref(".info/connected");conn.on("value",s=>{if(s.val()&&!gone)write().catch(()=>{});});
    hb=setInterval(()=>{if(!gone)myRef.child("at").set(TS).catch(()=>{});},60000);
    base.child("peers").on("value",s=>{const old=peers,lim=NET.now()-180000;peers=[];
      s.forEach(ch=>{const v=ch.val();if(v&&v.by&&(ch.key===me||!(v.at<lim)))peers.push({peer:ch.key,by:v.by,presence:v.p||{},sameTab:ch.key===me,kind:"viewer"});});
      const left=old.filter(o=>!peers.some(x=>x.peer===o.peer));peerCbs.forEach(cb=>{try{cb({peers,left});}catch(e){}});});
    await write();}
  function on(evt,cb){(evCbs[evt]=evCbs[evt]||[]).push(cb);ensure();
    if(!evQ){evQ=base.child("ev").orderByChild("at").startAt(NET.now()-1500);
      evQ.on("child_added",s=>{const v=s.val();if(!v||!v.t)return;(evCbs[v.t]||[]).forEach(f=>{try{f({peer:v.peer,by:v.by,data:v.d||{},sameTab:v.peer===me});}catch(e){}});});}}
  function emit(evt,data){ensure();const r=base.child("ev").push();setTimeout(()=>r.remove().catch(()=>{}),90000);
    return r.set({by:uid,peer:me,t:evt,d:jsonClean(data||{}),at:TS});}
  return {presence:o=>{pres=jsonClean(o||{});if(!joined)return ensure();return myRef.child("p").set(pres);},
    onPeers:cb=>{peerCbs.push(cb);ensure();if(peers.length)cb({peers,left:[]});},on,emit,peers:()=>peers,
    join:async n=>{const r=fbRoom(D,n,uid);await r._ensure();return r;},_ensure:ensure,
    leave:()=>{if(gone)return;gone=true;clearInterval(hb);try{conn&&conn.off();}catch(e){}base.child("peers").off();if(evQ)evQ.off();
      peerCbs=[];evCbs={};myRef.onDisconnect().cancel();myRef.remove().catch(()=>{});}};}
// red local de prueba: pestañas del mismo navegador
function lsDb(){return {doc:p=>({get:async()=>{const v=localStorage.getItem("ntxdb:"+p);return {exists:v!=null,data:()=>JSON.parse(v)};},set:async o=>{localStorage.setItem("ntxdb:"+p,JSON.stringify(jsonClean(o)));}})};}
function bcRoom(name){const ch=new BroadcastChannel("ntx_"+name),me=NET.pid||(NET.pid="k"+Math.random().toString(36).slice(2,10));
  let pres={},peers={},peerCbs=[],evCbs={},gone=false;
  const lista=()=>Object.entries(peers).filter(([k,v])=>k===me||Date.now()-v.at<7000).map(([k,v])=>({peer:k,by:v.by,presence:v.p||{},sameTab:k===me,kind:"viewer"}));
  const avisar=()=>{const L=lista();peerCbs.forEach(cb=>{try{cb({peers:L,left:[]});}catch(e){}});};
  const send=ask=>{if(gone)return;peers[me]={p:pres,at:Date.now(),by:NET.uid};ch.postMessage({k:"p",peer:me,p:pres,by:NET.uid,ask});avisar();};
  ch.onmessage=e=>{const m=e.data;if(m.k==="p"){peers[m.peer]={p:m.p,at:Date.now(),by:m.by};avisar();if(m.ask)send();}
    else if(m.k==="bye"){delete peers[m.peer];avisar();}else if(m.k==="ev")(evCbs[m.t]||[]).forEach(f=>{try{f({peer:m.peer,data:m.d,sameTab:false});}catch(x){}});};
  const hb=setInterval(()=>send(),2000);
  return {presence:o=>{pres=jsonClean(o||{});send(true);return Promise.resolve();},onPeers:cb=>{peerCbs.push(cb);avisar();},
    on:(t,cb)=>{(evCbs[t]=evCbs[t]||[]).push(cb);},emit:(t,d)=>{const dd=jsonClean(d||{});ch.postMessage({k:"ev",peer:me,t,d:dd});(evCbs[t]||[]).forEach(f=>{try{f({peer:me,data:dd,sameTab:true});}catch(x){}});return Promise.resolve();},
    peers:lista,join:async n=>bcRoom(n),leave:()=>{gone=true;clearInterval(hb);ch.postMessage({k:"bye",peer:me});ch.close();}};}

/* ---------- pantalla Multijugador ---------- */
function vMulti(){const m=$("#main");m.innerHTML="";hud();
  const d=el(`<div class="multi"><div class="row" style="justify-content:space-between;align-items:center;gap:10px"><div><h2 style="margin:0">Multijugador</h2>
      <p class="sub" style="margin:2px 0 0">Carreras en vivo con otros pilotos. Creá una sala y pasá el código de 4 letras, o entrá con el código que te pasaron.</p></div>
      <button class="btn sec" id="mVol" style="width:auto;flex:0 0 auto">◀ Inicio</button></div>
    <div class="mgrid">
      <div class="copa"><i class="mic">🤝</i><div class="t">Mano a mano</div><p class="s">Desafío de a dos: vos y tu rival, solos en el óvalo, ${TY.LAPS.final} vueltas. El que llega primero gana.</p>
        <div class="opts"><button class="btn oro" data-a="mano:crear">Crear desafío</button><button class="btn" data-a="mano:entrar">Entrar con código</button></div></div>
      <div class="copa"><i class="mic">🏁</i><div class="t">Jornada única</div><p class="s">Una noche completa con todos los inscriptos de la sala, completada con máquinas hasta los 128 autos: series, repechajes, semis, prefinal y la Gran Final.</p>
        <div class="opts"><button class="btn oro" data-a="jornada:crear">Crear jornada</button><button class="btn" data-a="jornada:entrar">Entrar con código</button><button class="btn sec" data-a="jornada:abierta">Sala abierta (sin código)</button></div></div>
      <div class="copa"><i class="mic">🏆</i><div class="t">Campeonato</div><p class="s">Varias jornadas únicas con el mismo grupo. Cada noche suma puntos a la tabla del grupo; para ser campeón hay que haber ganado una final.</p>
        <div class="row" style="gap:8px;align-items:center;margin:4px 0 8px"><span class="s" style="margin:0">Fechas:</span><select id="mFe" class="msel">${[4,6,8,12].map(n=>`<option${n===6?" selected":""}>${n}</option>`).join("")}</select></div>
        <div class="opts"><button class="btn oro" data-a="camp:crear">Crear campeonato</button><button class="btn" data-a="camp:entrar">Entrar con código</button></div></div>
    </div><p class="nota" id="mEst" style="margin-top:10px">Conectando…</p></div>`);
  m.append(d);d.querySelector("#mVol").onclick=render;
  netInit().then(ok=>{const e=$("#mEst");if(e)e.textContent=ok?"Conectado. Tu partida y tus mejoras no se tocan: en el multijugador corrés con tu midget tal como está.":"No se pudo conectar al servidor del juego. Revisá la conexión a internet y volvé a entrar.";});
  d.querySelectorAll("[data-a]").forEach(b=>b.onclick=async()=>{const [modo,acc]=b.dataset.a.split(":");
    if(!(await netInit())){toast("Sin conexión al servidor del juego");return;}
    const fechas=+($("#mFe")||{}).value||6;
    const ir=code=>modo==="mano"?tyVivoEntrar("mano",code):mjEntrar(modo,code,acc==="crear"?fechas:0,acc==="crear");
    if(acc==="crear")ir(tyVivoCodigo());else if(acc==="abierta")ir("ABIERTA");else tyVivoPedirCodigo(modo==="mano"?"Mano a mano":modo==="camp"?"Campeonato":"Jornada única",ir);});}

/* ---------- jornada única y campeonato en red ---------- */
const MJ_MAX=24,mjH=id=>String(id).startsWith("h_");
async function mjEntrar(modo,code,fechas,crea){if(TYR)return;await netInit();if(!NET.room||!NET.room.join){toast("El multijugador necesita conexión");return;}if(!S.apodo){toast("Primero elegí tu apodo");return;}
  modalLock=true;modal(`<h3>${modo==="camp"?"Campeonato":"Jornada única"}</h3><p>Conectando a la sala ${esc(code)}…</p>`);
  let room;try{room=await NET.room.join("ntx_"+modo+"_"+code);}catch(e){modalLock=false;closeModal();toast("No se pudo conectar");return;}
  TYV={room,code,modo,peers:[],st:{},me:null,go:false,info:{},tabla:null,mj:{n:0,J:null,org:null,vistas:{},tot:fechas||0,cobrado:{}},crea:!!crea};tyVivoPres();
  room.onPeers(ch=>{if(!TYV||TYV.room!==room)return;TYV.peers=ch.peers.filter(p=>p.presence&&p.presence.apodo);
    for(const p of TYV.peers){if(p.sameTab)TYV.me=p.peer;const q=p.presence;if(q&&q.en)TYV.st[p.peer]={...q,rt:performance.now()};}
    for(const l of ch.left||[]){if(TYV.st[l.peer])TYV.st[l.peer].gone=1;}
    const M=TYV.mj;if(M.J&&M.org&&TYV.me&&M.org!==TYV.me&&!TYV.peers.some(p=>p.peer===M.org)){M.orgFalta=(M.orgFalta|0)+1;if(M.orgFalta>3&&!TYR)mjSinOrg();}else M.orgFalta=0;
    if(!M.J&&!TYV.go)mjSala();},()=>{});
  room.on("mjestado",m=>{if(TYV&&TYV.room===room)mjEstado(m.data||{});},()=>{});
  room.on("mjres",m=>{if(TYV&&TYV.room===room)mjResultado(m.data||{});},()=>{});
  room.on("mjsala",m=>{if(TYV&&TYV.room===room&&m.data&&m.data.tot&&!TYV.mj.tot)TYV.mj.tot=m.data.tot;},()=>{});
  if(modo==="camp")await mjTablaLeer();
  if(modo==="camp"&&fechas&&TYV){if(!TYV.tabla.tot){TYV.tabla.tot=fechas;}TYV.mj.tot=TYV.tabla.tot;}
  mjSala();}
async function mjTablaLeer(){if(!TYV||!NET.db)return;try{const s=await NET.db.doc("tyamigos/ntx_"+TYV.code).get();TYV.tabla=s.exists?s.data():{n:0,t:{}};}catch(e){TYV.tabla=TYV.tabla||{n:0,t:{}};}TYV.tabla.t=TYV.tabla.t||{};}
const mjOrden=()=>TYV.peers.filter(p=>p.presence.sala&&!p.presence.en).sort((a,b)=>((b.presence.crea|0)-(a.presence.crea|0))||(a.peer<b.peer?-1:1)).slice(0,MJ_MAX);
function mjTablaHTML(){const T=TYV.tabla;if(!T)return "";const L=Object.values(T.t||{}).sort((a,b)=>b.pts-a.pts);
  return `<div class="sec-t">Tabla del campeonato <span>${T.n|0} de ${T.tot||TYV.mj.tot||"?"} fechas</span></div>${L.length?`<table class="ovtab"><tr><th>Pos</th><th>Piloto</th><th>Finales</th><th>Pts</th></tr>${L.map((r,i)=>`<tr${r.uid===NET.uid?' class="yo"':''}><td>${i+1}</td><td>${esc(r.n)}</td><td>${r.gan?"🏆".repeat(Math.min(3,r.gan)):""}</td><td>${r.pts}</td></tr>`).join("")}</table>`:`<p class="nota">Todavía no se corrió ninguna fecha.</p>`}${T.champ?`<p class="gan" style="color:var(--oro)">🏆 Campeón: ${esc(T.champ)}</p>${T.champNota?`<p class="nota">${esc(T.champNota)}</p>`:""}`:""}`;}
function mjSala(){if(!TYV||TYV.go||TYV.mj.J)return;const ps=mjOrden(),org=ps[0]&&ps[0].peer,soy=org&&org===TYV.me,camp=TYV.modo==="camp";
  const T=TYV.tabla,fin=camp&&T&&T.tot&&(T.n|0)>=T.tot;
  modalLock=true;modal(`<h3>${camp?"Campeonato":"Jornada única"} · código <span style="color:var(--oro);letter-spacing:3px">${esc(TYV.code)}</span></h3>
    <p>${TYV.code==="ABIERTA"?"Sala abierta: entra cualquiera desde Multijugador → Jornada única → Sala abierta.":"Pasales el código: entran desde <b>Multijugador</b>."} Hasta ${MJ_MAX} pilotos; el resto de los 128 autos son máquinas. Las carreras con pilotos de verdad se corren en vivo.</p>
    <div class="mjcols"><div><div class="sec-t">Inscriptos <span>${ps.length}</span></div><table class="ovtab"><tr><th></th><th>Piloto</th><th>Chasis</th></tr>${ps.map((p,i)=>`<tr${p.sameTab?' class="yo"':''}><td>${i+1}</td><td>#${p.presence.num|0} ${esc(p.presence.apodo)}${p.peer===org?" · organiza":""}</td><td>${esc(TY_HUMAN[p.presence.m]||"")}</td></tr>`).join("")}</table></div>
    ${camp?`<div>${mjTablaHTML()}</div>`:""}</div>
    <p class="nota">${fin?"El campeonato terminó.":soy?"Vos organizás: largá cuando estén todos.":"Esperá a que el que organiza largue la noche."}</p><div class="opts" id="mjo"></div>`,"resplaca mjsala");
  const o=$("#mjo");if(soy&&!fin){const b=el(`<button class="btn oro">🏁 Largar la ${camp?"fecha "+(((T&&T.n)|0)+1):"jornada"} (${ps.length} + ${128-ps.length} máquinas)</button>`);b.onclick=()=>mjLargar(ps);o.append(b);}
  const x=el(`<button class="btn sec">Salir de la sala</button>`);x.onclick=()=>{tyVivoSalir();modalLock=false;closeModal();vMulti();};o.append(x);}
// el que organiza arma la noche: humanos agrupados en las primeras series, el resto máquinas
function mjLargar(ps){const M=TYV.mj,info={};const usados=new Set();const libre=n=>{n=Math.max(1,n|0);while(usados.has(n))n=n%199+1;usados.add(n);return n;};
  const H=ps.map(p=>{const q=p.presence,id="h_"+p.peer;info[id]={apodo:String(q.apodo).slice(0,16),num:libre(q.num),m:TY_M.includes(q.m)?q.m:"ma",col:q.col||"#ccc",uid:q.uid||null};return id;});
  const bots=TY_PIL.map(p=>p.id).filter(id=>!usados.has(TY_P[id].num)).sort(()=>Math.random()-.5).slice(0,128-H.length);
  const todos=[...H,...bots],series=[];for(let i=0;i<16;i++)series.push(todos.slice(i*8,i*8+8));
  const fecha=TYV.modo==="camp"?((TYV.tabla&&TYV.tabla.n)|0)+1:1;
  const J={fecha,ent:todos,series,res:{},parc:{},pts:{},info,mj:true};todos.forEach(id=>J.pts[id]=5);
  M.org=TYV.me;M.J=J;M.n=Math.max(M.n|0,M.vis|0);mjAvanzar();}
// una etapa: corre en vivo las carreras con humanos (una por vez) y simula el resto
function mjEtapa(J,key,lists,laps,nomF,k,sup){const P=J.parc[key]=J.parc[key]||{};
  for(let i=0;i<lists.length;i++)if(!P[i]&&lists[i].some(mjH))return {k,key,i,n:i+1,ids:lists[i],laps,nom:nomF(i),sup};
  J.res[key]=lists.map((l,i)=>P[i]||tySimular(l,laps,sup));return null;}
function mjSiguiente(J){const R=J.res,LP=TY.LAPS;let c;
  if(!R.series&&(c=mjEtapa(J,"series",J.series,LP.serie,i=>"Serie "+(i+1),"serie")))return c;
  if(!J.clasS){const rk=tyOrdT(R.series.flat()).map(x=>x.id);J.clasS=rk.slice(0,32);const resto=rk.slice(32),n=Math.ceil(resto.length/10);J.repes=[...Array(n)].map((_,i)=>resto.filter((_,k)=>k%n===i));}
  if(!R.repes&&(c=mjEtapa(J,"repes",J.repes,LP.repe,i=>"Repechaje "+(i+1),"repe")))return c;
  if(!J.semis){J.clasR=tyOrdT(R.repes.flat()).filter(x=>!x.dnf).slice(0,8).map(x=>x.id);J.semis=[0,1,2,3].map(i=>[...J.clasS.filter((_,k)=>k%4===i),...J.clasR.filter((_,k)=>k%4===i)]);}
  if(!R.semis&&(c=mjEtapa(J,"semis",J.semis,LP.semi,i=>"Semifinal "+(i+1),"semi")))return c;
  if(!J.rkSemi){J.rkSemi=tyOrdT(R.semis.flat()).map(x=>x.id);J.pre=J.rkSemi.slice(12,24);}
  if(!R.pre){if((c=mjEtapa(J,"pre1",[J.pre],LP.pre,()=>"Prefinal","pre",J.rkSemi.slice(24))))return c;R.pre=R.pre1[0];}
  if(!J.final)J.final=[...J.rkSemi.slice(0,10),...R.pre.filter(x=>!x.dnf).slice(0,2).map(x=>x.id)];
  if(!R.final){const sup=J.rkSemi.slice(10).filter(id=>!J.final.includes(id));if((c=mjEtapa(J,"final1",[J.final],LP.final,()=>"Gran Final","final",sup)))return c;R.final=R.final1[0];}
  return null;}
function mjVivos(){return new Set(TYV.peers.map(p=>p.peer));}
function mjAvanzar(){const M=TYV.mj,J=M.J;clearTimeout(M.toT);let c;
  for(let g=0;g<20;g++){c=mjSiguiente(J);if(!c)break;
    const vivos=mjVivos(),hs=c.ids.filter(mjH).map(id=>id.slice(2)).filter(p=>vivos.has(p)).sort();
    if(hs.length){M.cur={c,rhost:hs[0]};break;}
    J.parc[c.key][c.i]=tySimular(c.ids,c.laps,c.sup);c=null;} // nadie conectado en esa carrera: se simula
  M.n++;const d={n:M.n,org:TYV.me,J,tot:M.tot};
  if(c){d.c={k:c.k,key:c.key,i:c.i,nom:c.nom,ids:c.ids,laps:c.laps};d.rhost=M.cur.rhost;d.t0=NET.now()+12000;
    M.toT=setTimeout(()=>{if(TYV&&TYV.mj.n===d.n){J.parc[c.key][c.i]=tySimular(c.ids,c.laps,c.sup);mjAvanzar();}},(12+c.laps*45+180)*1000);}
  else{d.fin=1;if(TYV.modo==="camp")mjTablaFin(J);}
  TYV.room.emit("mjestado",d).catch(()=>toast("Problema de conexión"));}
// resultado de una carrera en vivo (lo manda el que llevó las máquinas en esa carrera)
function mjResultado(d){const M=TYV.mj;if(M.org!==TYV.me||!M.cur||d.n!==M.n)return;const c=M.cur.c;if(d.key!==c.key||d.i!==c.i)return;
  M.J.parc[c.key][c.i]=d.res;M.cur=null;setTimeout(mjAvanzar,600);}
// cada uno recibe el estado de la noche
function mjEstado(d){const M=TYV.mj;if(!d.J||(d.n|0)<=(M.vis|0))return;if(TYR){M.pend=d;return;}M.vis=d.n;M.org=d.org;
  // la base de datos se come los objetos vacíos y los null: se normaliza; el que organiza se queda con su copia
  if(d.org===TYV.me&&M.J)d.J=M.J;else{const J=d.J;J.res=J.res||{};J.parc=J.parc||{};J.pts=J.pts||{};J.info=J.info||{};M.J=J;}
  if(d.tot)M.tot=d.tot;M.d=d;
  for(const id in d.J.info){const f=d.J.info[id];TYV.info[id]=f;TYV.info["p_"+id.slice(2)]=f;}
  const yoId="h_"+TYV.me,J=d.J;J.vistas=M.vistas;
  const sigue=()=>{if(!TYV||TYV.mj.d!==d)return;if(d.fin){mjFinNoche(d);return;}if(d.c.ids.includes(yoId))mjCorrer(d);else mjEspera(d);};
  const pl=tyPlacasPend(J);if(pl.length&&!(d.c&&d.c.ids.includes(yoId)&&d.t0-NET.now()<pl.length*5200)){modalLock=false;closeModal();tyPlacas(pl,sigue);}else sigue();}
function mjEstadoH(J,id){const et=[["series","Serie"],["repes","Repechaje"],["semis","Semifinal"],["pre1","Prefinal"],["final1","Gran Final"]];let r=null;
  for(const [k,n] of et){const L=J.res[k]||(J.parc[k]&&Object.keys(J.parc[k]).length?Object.entries(J.parc[k]).reduce((a,[i,v])=>(a[i]=v,a),[]):null);if(!L)continue;
    L.forEach((res,i)=>{if(!res)return;const p=res.findIndex(x=>x.id===id);if(p>=0)r={nom:k.startsWith("pre")||k.startsWith("final")?n:n+" "+(i+1),pos:p+1,x:res[p]};});}
  return r;}
function mjEspera(d){const J=d.J,yoId="h_"+TYV.me,hs=J.ent.filter(mjH);const corre=d.c.ids.filter(mjH);
  const yoR=mjEstadoH(J,yoId),k={series:"serie",repes:"repe",semis:"semi",pre1:"pre",final1:"final"};
  const filas=hs.map(id=>{const r=mjEstadoH(J,id),en=corre.includes(id);return `<tr${id===yoId?' class="yo"':''}><td>#${tyNum(id)} ${esc(tyNombre(id))}</td><td>${en?"🏁 corriendo":r?`${esc(r.nom)}: ${r.x.dnf?"abandono":r.pos+"º"+(r.x.t!=null?" · "+r.x.t.toFixed(2)+" s":"")}`:"—"}</td></tr>`;}).join("");
  modalLock=true;modal(`<h3>${TYV.modo==="camp"?"Campeonato · Fecha "+J.fecha:"Jornada única"}</h3>
    <p>Ahora corre la <b>${esc(d.c.nom)}</b> con ${corre.map(id=>esc(tyNombre(id))).join(", ")}. Las demás carreras de la etapa las corren las máquinas.</p>
    <table class="ovtab"><tr><th>Piloto</th><th>Última carrera</th></tr>${filas}</table>
    <p class="nota">${yoR?"Vos: "+esc(yoR.nom)+" "+(yoR.x.dnf?"(abandono)":yoR.pos+"º")+". ":""}Esperá: cuando te toque, tu carrera larga sola.</p>
    <div class="opts"><button class="btn sec" id="mjSal">Salir de la noche</button></div>`,"resplaca mjsala");
  $("#mjSal").onclick=()=>{tyVivoSalir();modalLock=false;closeModal();vMulti();};}
function mjCorrer(d){const c=d.c;document.querySelectorAll(".typlaca").forEach(x=>x.remove());TYV.go=true;TYV.host=d.rhost;modalLock=false;closeModal();
  const ids=c.ids.map(id=>mjH(id)?(id.slice(2)===TYV.me?"yo":"p_"+id.slice(2)):id);
  const yoNum=d.J.info["h_"+TYV.me];if(yoNum)TYV.miNum=yoNum.num;
  const vivo={t0:d.t0,host:d.rhost,mj:1,n:d.n,key:c.key,i:c.i,modo:TYV.modo,laps:c.laps};
  const cc={k:"vivo",n:1,nom:(TYV.modo==="camp"?`Fecha ${d.J.fecha} · `:"")+c.nom,ids,laps:c.laps,vivo};
  tyVivoPres({en:1,dist:0,d:0,v:0});tyLargar(cc,{vivo:true,yaPresento:true,res:{},fuera:false});}
{const _vf=tyVivoFin;tyVivoFin=function(R){if(R&&R.c&&R.c.vivo&&R.c.vivo.mj)return mjFinCarrera(R);return _vf.apply(this,arguments);};}
function mjFinCarrera(R){if(TYR!==R)return;const v=R.c.vivo,pos=tyPosiciones(R),yo=pos.findIndex(e=>e.yo);
  TYR=null;tyBanderaBlanca(false);tyUI(false);tyAudioStop();if(pos[0])narraF("bandera",{a:pos[0]});
  const gid=e=>e.yo?"h_"+TYV.me:String(e.id).startsWith("p_")?"h_"+e.id.slice(2):e.id;
  const res=pos.map(e=>({id:gid(e),dnf:!!e.out,t:e.fin!=null?Math.round(e.fin*100)/100:null}));
  if(TYV&&v.host===TYV.me)TYV.room.emit("mjres",{n:v.n,key:v.key,i:v.i,res}).catch(()=>{});
  if(TYV){TYV.go=false;TYV.st={};tyVivoPres({en:0});}
  const filas=pos.map((e,i)=>`<tr${e.yo?' class="yo"':''}><td>${i+1}</td><td>#${e.num} ${esc(e.n)}${String(e.id).startsWith("p_")?" 👤":""}</td><td>${e.out?"Abandono":e.fin!=null?e.fin.toFixed(2)+" s":"—"}</td></tr>`).join("");
  modalLock=true;modal(`<h3 class="gan">${esc(R.c.nom)}: ${R.P.out?"¡Afuera!":(yo+1)+"º"}</h3><p>Esperando que termine la etapa: las otras carreras las corren las máquinas.</p>
    <table class="ovtab"><tr><th>Pos</th><th>Piloto</th><th>Tiempo</th></tr>${filas}</table><div class="opts"><button class="btn sec" id="mjSal">Salir de la noche</button></div>`,"resplaca mjsala");
  $("#mjSal").onclick=()=>{tyVivoSalir();modalLock=false;closeModal();vMulti();};
  const M=TYV&&TYV.mj;if(M&&M.pend){const p=M.pend;M.pend=null;setTimeout(()=>mjEstado(p),1500);}}
function mjFinNoche(d){const J=d.J,yoId="h_"+TYV.me,P=tyPuntosNoche(J),fin=J.res.final||[],M=TYV.mj;
  const yo=fin.findIndex(x=>x.id===yoId);if(!M.cobrado[d.n]){M.cobrado[d.n]=1;const plata=yo>=0&&!fin[yo].dnf?TY_PREMIO[yo]:10000;S.pesos+=plata;save();hud();M.plata=plata;}
  const hs=J.ent.filter(mjH).sort((a,b)=>(P[b]|0)-(P[a]|0));
  const filas=fin.map((x,i)=>`<tr${x.id===yoId?' class="yo"':''}><td>${i+1}</td><td>#${tyNum(x.id)} ${esc(tyNombre(x.id))}${mjH(x.id)?" 👤":""}</td><td>${x.dnf?"Abandono":(TY_PTS_FINAL[i]||0)+" pts"}</td></tr>`).join("");
  const done=()=>{modalLock=true;modal(`<h3 class="gan">${TYV.modo==="camp"?"Fecha "+J.fecha+" terminada":"Terminó la jornada"}</h3>
    <p>${yo>=0?(fin[yo].dnf?"Abandonaste la Gran Final.":`Llegaste ${yo+1}º en la Gran Final.`):"No llegaste a la final."} Sumaste ${P[yoId]|0} puntos. Cobraste ${fmt(M.plata||0)}.</p>
    <div class="mjcols"><div><div class="sec-t">Gran Final</div><table class="ovtab"><tr><th>Pos</th><th>Piloto</th><th>Pts</th></tr>${filas}</table></div>
    <div><div class="sec-t">Pilotos de la sala</div><table class="ovtab"><tr><th>Piloto</th><th>Pts</th></tr>${hs.map(id=>`<tr${id===yoId?' class="yo"':''}><td>${esc(tyNombre(id))}</td><td>${P[id]|0}</td></tr>`).join("")}</table>${TYV.modo==="camp"?`<div id="mjTab"></div>`:""}</div></div>
    <div class="opts"><button class="btn oro" id="mjOtra">Volver a la sala</button><button class="btn sec" id="mjSal">Salir</button></div>`,"resplaca mjsala");
    if(TYV.modo==="camp")mjTablaLeer().then(()=>{const t=$("#mjTab");if(t)t.innerHTML=mjTablaHTML();});
    $("#mjOtra").onclick=()=>{TYV.mj.J=null;TYV.mj.d=null;TYV.mj.org=null;TYV.mj.vistas={};TYV.st={};tyVivoPres({en:0});if(TYV.modo==="camp")mjTablaLeer().then(mjSala);else mjSala();};
    $("#mjSal").onclick=()=>{tyVivoSalir();modalLock=false;closeModal();vMulti();};};
  done();}
// campeonato: el que organiza suma los puntos de la noche a la tabla del grupo
async function mjTablaFin(J){await mjTablaLeer();const T=TYV.tabla,P=tyPuntosNoche(J),gan=(J.res.final||[]).find(x=>!x.dnf);T.tot=T.tot||TYV.mj.tot||6;
  for(const id of J.ent.filter(mjH)){const f=J.info[id]||{},k=String(f.uid||id).replace(/[.#$\[\]\/]/g,"_");const o=T.t[k]||(T.t[k]={n:f.apodo||"?",uid:f.uid||null,pts:0,f:0,gan:0});
    o.n=f.apodo||o.n;o.pts+=P[id]|0;o.f++;if(gan&&gan.id===id)o.gan=(o.gan|0)+1;}
  T.n=Math.max(T.n|0,J.fecha|0);T.at=Date.now();
  if(T.n>=T.tot&&!T.champ){const L=Object.values(T.t).sort((a,b)=>b.pts-a.pts),g=L.find(r=>r.gan>0),c=g||L[0];T.champ=c?c.n:null;T.champNota=g?(g!==L[0]?`${L[0].n} sumó más, pero no ganó ninguna final`:""):"Nadie ganó una final: es campeón el que más sumó";}
  try{await NET.db.doc("tyamigos/ntx_"+TYV.code).set(T);}catch(e){toast("No se pudo guardar la tabla");}}
function mjSinOrg(){if(!TYV)return;tyVivoSalir();modalLock=false;modal(`<h3>Se cortó la noche</h3><p>El que organizaba se desconectó y la noche no puede seguir. Volvé a armar la sala.</p><div class="opts"><button class="btn oro" id="mjOk">Volver</button></div>`,"resplaca");$("#mjOk").onclick=()=>{closeModal();vMulti();};}
