/* Noche de TAYA'xs — reglamento: tiempo de suficiencia para pilotos nuevos y el taller entre fechas.
   · Piloto nuevo: primero practica en el salitral; después corre solo una serie de "Tiempo de suficiencia" en el óvalo.
     Sin choques, trompos ni vuelcos, y sin pasarse del 110% del tiempo de un piloto de mitad de tabla.
     Si no aprueba, la fecha se corre sin él y repite en la próxima jornada.
   · Taller: entre fechas se prepara el auto y se arregla lo que se rompió o volcó (con la noche empezada está cerrado). */
const SUF_VUELTAS_SAL=3;
function tySufRef(laps){const r=TY_PIL.map(p=>tyRating(p.id)).sort((a,b)=>a-b),med=r[r.length>>1];
  return laps*15.6*(1.06-med*.08);}
const tySufMax=laps=>tySufRef(laps)*1.10;
// el salitral cuenta vueltas para el requisito
{const _fe=tyFinEntreno;tyFinEntreno=function(R){try{const T=tyState();T.salV=(T.salV|0)+((R.ent&&R.ent.vueltas&&R.ent.vueltas.length)|0);save();}catch(e){}return _fe.apply(this,arguments);};}
// la fecha: antes chequea el reglamento (piloto habilitado y auto en condiciones)
{const _ir=tyIrFecha;tyIrFecha=function(){if(typeof TYR!=="undefined"&&TYR)return;const T=tyPz();
  if(!S.tayaJ&&T.fecha<TY_FECHAS){
    if(!T.habil){tySuficiencia();return;}
    if(T.chapa||T.est.jaula<25||T.est.tren<20){modal(`<h3 class="gan">El auto no está en condiciones</h3><p>${T.chapa?"Después del vuelco hay que enderezar el chasis":"La jaula o el tren delantero están rotos"}: pasá por el taller antes de la fecha.</p><div class="opts"><button class="btn oro" id="cT">Ir al taller</button><button class="btn sec" id="cN">Volver</button></div>`,"resplaca");
      $("#cT").onclick=()=>{closeModal();vTaller();};$("#cN").onclick=closeModal;return;}}
  return _ir.apply(this,arguments);};}
function tySuficiencia(){const T=tyState(),laps=TY.LAPS.serie,mx=tySufMax(laps),salV=T.salV|0,ok=salV>=SUF_VUELTAS_SAL||(T.mejorSal&&salV>=1);
  modal(`<h3 class="gan">Piloto nuevo: habilitación</h3>
    <p>Antes de tu primera fecha el reglamento pide dos cosas:</p>
    <ol class="sufl"><li class="${ok?"ok":""}"><b>Práctica en el salitral</b> · ${ok?"✔ hecha":`te faltan ${SUF_VUELTAS_SAL-salV} vueltas`}</li>
      <li><b>Tiempo de suficiencia</b> · una serie de ${laps} vueltas solo en el óvalo. Sin choques, trompos ni vuelcos, y en menos de <b>${mx.toFixed(1)} s</b> (110% de un piloto de mitad de tabla).</li></ol>
    <p class="nota">Si no lo cumplís, la fecha se corre sin vos y lo repetís en la próxima jornada.</p>
    <div class="opts">${ok?`<button class="btn oro" id="sfGo">Correr el tiempo de suficiencia</button>`:`<button class="btn oro" id="sfSal">Ir al salitral</button>`}<button class="btn sec" id="sfNo">Volver</button></div>`,"resplaca");
  $("#sfNo").onclick=closeModal;if($("#sfSal"))$("#sfSal").onclick=()=>{closeModal();tyEntreno();};
  if($("#sfGo"))$("#sfGo").onclick=()=>{const v=pzPuedeLargar(null);if(v){toast(v);return;}closeModal();
    const J=S.tayaJ=tyJornadaNueva();J.yaPresento=true;J.suf=true;save();
    tyLargar({k:"sufi",n:1,ids:["yo"],laps,nom:"Tiempo de suficiencia",sufi:true},J);};}
function tySufFin(R){const T=tyState(),J=R.J,P=R.P,laps=R.c.laps,mx=tySufMax(laps),t=P.fin;
  pzFinCarrera(R);T.desg=Math.min(1,(T.desg||0)+laps*.0045);TYR=null;tyBanderaBlanca(false);tyUI(false);tyAudioStop();
  const nom={rueda:"Volcaste",pared:"Chocaste contra el paredón",golpe:"Chocaste",trompo:"Hiciste un trompo",abandono:"Abandonaste"};
  const falla=R.sufFalla?nom[R.sufFalla]||"Tuviste un incidente":P.out?nom[P.out]||"Quedaste afuera":t==null?"No completaste las vueltas":t>mx?`Tu tiempo (${t.toFixed(2)} s) pasa el 110% (${mx.toFixed(2)} s)`:"";
  J.gUso=0;J.carreras=0;J.danio=false;
  if(!falla){T.habil=true;J.yaPresento=false;save();
    modal(`<h3 class="gan">¡Aprobaste el tiempo de suficiencia!</h3><p>Hiciste <b>${t.toFixed(2)} s</b> (el máximo era ${mx.toFixed(2)} s). Ya estás habilitado: ahora corrés la Fecha ${J.fecha}.</p><div class="opts"><button class="btn oro" id="sfOk">Ir a la serie</button></div>`,"resplaca");
    $("#sfOk").onclick=()=>{closeModal();tyIrFecha();};return;}
  // no aprobó: la fecha se corre sin él
  S.tayaJ=null;const J2=tyJornadaNueva(true);let c;while((c=tySiguiente(J2)))tyGuardar(J2,c,tySimular(c.ids,c.laps,c.sup));
  const msg=tyCerrarNoche(J2);save();
  modal(`<h3 class="gan">No aprobaste</h3><p>${esc(falla)}. ${esc(msg)} Repetís el tiempo de suficiencia en la próxima jornada.</p><div class="opts"><button class="btn oro" id="sfOk">Volver</button></div>`,"resplaca");
  $("#sfOk").onclick=()=>{closeModal();render();};}

/* ---------- TALLER entre fechas ---------- */
const TALLER=[
  {k:"chapa",n:"Enderezar el chasis después del vuelco",d:"Banco de enderezado, caños nuevos y pintura.",p:85000,ok:T=>T.chapa,hace:T=>{T.chapa=false;T.est.jaula=Math.max(T.est.jaula,80);}},
  {k:"jaula",n:"Reparar la jaula",d:"Soldadura y caños: deja la jaula al 100%.",p:55000,stock:"jaula",ok:T=>T.est.jaula<99,hace:T=>{T.est.jaula=100;}},
  {k:"tren",n:"Rehacer el tren delantero",d:"Extremos, rótulas, parrilla y alineación.",p:42000,stock:"tren",ok:T=>T.est.tren<99,hace:T=>{T.est.tren=100;}},
  {k:"amort",n:"Cambiar los amortiguadores",d:"Juego nuevo, regulado para tierra.",p:45000,stock:"amort",ok:T=>T.est.amort<99,hace:T=>{T.est.amort=100;}},
  {k:"serv",n:"Service del motor",d:"Bujías, filtro, aceite y puesta a punto del carburador.",p:16000,stock:"serv",ok:T=>(T.desg||0)>.01,hace:T=>{T.desg=Math.max(0,(T.desg||0)*.6);}},
  {k:"rect",n:"Rectificar el motor",d:"Deja el motor al 100%.",p:90000,ok:T=>(T.desg||0)>.01,hace:T=>{T.desg=0;}}];
function vTaller(){const m=$("#main"),T=tyPz(),cerrado=!!S.tayaJ;m.innerHTML="";hud();
  const lista=TALLER.filter(x=>x.ok(T));const total=lista.reduce((a,x)=>a+(x.stock&&T.stock[x.stock]>0?12000:x.p),0);
  const d=el(`<div class="taller"><div class="row" style="justify-content:space-between;align-items:center;gap:10px"><div><h2 style="margin:0">El taller</h2><p class="sub" style="margin:2px 0 0">Entre fechas: preparar el auto y arreglar lo que se rompió o volcó. Con tus repuestos pagás solo la mano de obra (${fmt(12000)}).</p></div>
      <button class="btn sec" id="tVol" style="width:auto;flex:0 0 auto">◀ Inicio</button></div>
    ${cerrado?`<div class="row" style="gap:12px;align-items:center;margin-top:8px;flex-wrap:wrap"><p class="nota" style="color:var(--rojo);margin:0;flex:1 1 300px">Tenés la fecha ${S.tayaJ.fecha} empezada: el auto está en el autódromo. Para arreglarlo acá, primero abandoná la noche.</p><button class="btn oro" id="tAb" style="width:auto;flex:0 0 auto">Abandonar la noche y traer el auto</button></div>`:""}
    <div class="tgrid"><div class="copa"><div class="t">Estado del auto</div>${T.chapa?`<p class="nota" style="color:var(--rojo);margin:4px 0">Chasis torcido por el vuelco: no podés largar hasta enderezarlo.</p>`:""}${pzEstadoHTML(null)}<div class="sec-t" style="margin-top:8px">Stock</div>${pzStockHTML()}
      ${lista.length>1&&!cerrado?`<button class="btn oro" id="tTodo" style="margin-top:10px">Dejarlo a punto: todo · ${fmt(total)}</button>`:""}</div>
      <div class="titems"></div></div></div>`);
  const it=d.querySelector(".titems");
  TALLER.forEach(x=>{const hace=x.ok(T),st=x.stock&&T.stock[x.stock]>0,p=st?12000:x.p;
    const r=el(`<div class="item"><div><b>${x.n}</b><small>${x.d}${st?` · usa 1 de tu stock`:""}</small></div><button class="btn sm ${hace?"oro":"sec"}"${cerrado||!hace?" disabled":""}>${hace?fmt(p):"Está bien"}</button></div>`);
    r.querySelector("button").onclick=()=>{if(!tyTallerHacer(x))return;save();toast("¡Listo! "+x.n);vTaller();};it.append(r);});
  m.append(d);d.querySelector("#tVol").onclick=render;const ab=d.querySelector("#tAb");if(ab)ab.onclick=()=>tyRetiro(S.tayaJ);
  const tt=d.querySelector("#tTodo");if(tt)tt.onclick=()=>{if(S.pesos<total){toast("No te alcanza la plata: pasá por el kiosco");return;}lista.forEach(x=>tyTallerHacer(x,true));save();toast("Auto a punto para la fecha");vTaller();};}
function tyTallerHacer(x,sinChk){const T=tyPz();if(S.tayaJ){toast("Con la noche empezada el taller está cerrado");return false;}
  const st=x.stock&&T.stock[x.stock]>0,p=st?12000:x.p;if(S.pesos<p){if(!sinChk)toast("No te alcanza la plata: pasá por el kiosco");return false;}
  S.pesos-=p;if(st)T.stock[x.stock]--;x.hace(T);return true;}

/* ---------- la pista se gasta: arranca pareja y cada carrera la marca más; la Champion la deja perfecta antes de la semi 1 y la 3 ---------- */
const TY_PISTA_PASO=.065;
function tyPistaDesg(c){if(!c||c.entreno)return 0;const e=c.etapa||c,n=(e.n|0)||1;
  const k=e.k==="serie"?n-1:e.k==="repe"?16+n-1:e.k==="semi"?(n-1)%2:e.k==="pre"?2:e.k==="final"?3:e.k==="sufi"?0:2;
  return Math.min(1,k*TY_PISTA_PASO);}
{const _s3=tySetup3D;tySetup3D=function(R){const r=_s3.apply(this,arguments);try{if(!R.c.entreno){const w=tyPistaDesg(R.c),E=TY3.env;R.desgPista=w;
    if(E&&E.huella){const m=E.huella.material;m.opacity=w*.62;m.color.setHex(0x2a1b10);E.huella.visible=w>.01;}
    R.cars.forEach(e=>{e.mu*=1-.05*w;});
    const et=R.c.etapa||R.c;if(et.k==="semi"&&((et.n|0)===1||(et.n|0)===3))setTimeout(()=>{if(TYR===R)tyMsg("Pasó la Champion: la pista quedó perfecta para las semis","var(--oro)");},2500);}}catch(x){console.warn("pista",x);}return r;};}
