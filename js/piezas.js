/* Noche de TAYA'xs — piezas con desgaste, stock de repuestos y la calle Warnes
   Cada pieza tiene un estado (0–100%). Se gasta con el uso y mucho más con los golpes y los vuelcos.
   Los repuestos se compran en Warnes ANTES de la fecha y quedan en stock; durante la noche, en el box,
   solo se puede usar lo que hay en stock. */
const PZ_N={motor:"Motor",tren:"Tren delantero",amort:"Amortiguadores",jaula:"Chasis y jaula"};
const ST_N={cub:"Juego de cubiertas",cubB:"Juego de cubiertas blandas",serv:"Kit de service",tren:"Kit de tren delantero",amort:"Juego de amortiguadores",jaula:"Caños y soldadura (jaula)"};
function tyPz(T){T=T||tyState();if(!T.est)T.est={tren:100,amort:100,jaula:100};if(!T.stock)T.stock={cub:2,cubB:0,serv:1,tren:0,amort:0,jaula:0};
  for(const k of Object.keys(ST_N))if(T.stock[k]==null)T.stock[k]=0;return T;}
const pzMotor=T=>Math.round(100*(1-(T.desg||0)));
function pzGastar(k,n){const T=tyPz();T.est[k]=Math.max(0,Math.min(100,(T.est[k]??100)-n));}
const pzBarra=(v)=>`<i class="pzb"><b style="width:${Math.max(2,v)}%;background:${v>60?"var(--verde)":v>30?"var(--oro)":"var(--rojo)"}"></b></i>`;
// resumen del estado del auto (para el box, la pantalla de inicio y Warnes)
function pzEstadoHTML(J){const T=tyPz(),u=J?J.gUso|0:0,gom=Math.round(100*(1-u/TY_GOMA_MAX));
  const f=[["Gomas",gom,J?`${u} de ${TY_GOMA_MAX} carreras${J.blandas?" · blandas":""}`:"nuevas al largar la fecha"],["Motor",pzMotor(T),`${Math.round((168+T.up.motor*3)*tyMotorK())} HP`],["Tren delantero",Math.round(T.est.tren),""],["Amortiguadores",Math.round(T.est.amort),""],["Chasis y jaula",Math.round(T.est.jaula),""]];
  return `<div class="pzgrid">${f.map(([n,v,s])=>`<div class="pzrow"><span>${n}</span>${pzBarra(v)}<em>${v}%${s?` · ${s}`:""}</em></div>`).join("")}</div>`;}
function pzStockHTML(){const T=tyPz(),L=Object.keys(ST_N).filter(k=>T.stock[k]>0);
  return L.length?`<div class="pzstock">${L.map(k=>`<span><b>${T.stock[k]}</b> ${ST_N[k]}</span>`).join("")}</div>`:`<p class="nota">No tenés repuestos en stock. Pasá por Warnes antes de la fecha.</p>`;}
// ¿se puede largar? (con la jaula o el tren destruidos no te dejan entrar a la pista)
function pzPuedeLargar(J){const T=tyPz();if(J&&(J.gUso|0)>=TY_GOMA_MAX)return "Cambiá las gomas para largar";if(T.est.jaula<25)return "La jaula está rota: reparala para largar";if(T.est.tren<20)return "El tren delantero no da más: cambialo para largar";return "";}

/* ---------- el box entre carreras: solo con lo que hay en stock ---------- */
tyBox=function(J,cont,enGar){const T=tyPz();
  const html=()=>{const s=T.stock,motivo=pzPuedeLargar(J),btn=(k,txt,dis)=>`<button class="btn sm" data-b="${k}"${dis?" disabled":""}>${txt}</button>`;
    return `<div class="copa tybox"><div class="t">Box · entre carreras</div>${pzEstadoHTML(J)}
      <div class="sec-t" style="margin-top:8px">Tu stock de repuestos</div>${pzStockHTML()}
      ${tyGarageOk()&&!enGar?`<p class="nota" style="margin:6px 0">Los repuestos se cambian adentro de tu box.</p>`:`<div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px">
        ${btn("gomas",`Cubiertas nuevas (${s.cub})`,!s.cub||(J.gUso|0)===0)}${btn("gomasB",`Cubiertas blandas (${s.cubB})`,!s.cubB)}
        ${btn("serv",J.serv?"Service hecho":`Service (${s.serv})`,J.serv||!s.serv||T.desg<.01)}
        ${btn("tren",`Tren delantero (${s.tren})`,!s.tren||T.est.tren>=99)}${btn("amort",`Amortiguadores (${s.amort})`,!s.amort||T.est.amort>=99)}${btn("jaula",`Soldar la jaula (${s.jaula})`,!s.jaula||T.est.jaula>=99)}</div>`}
      ${motivo?`<p class="nota" style="color:var(--rojo);margin:6px 0">${motivo}</p>`:""}
      ${tyGarageOk()&&!enGar?`<button class="btn oro sm" data-b="garage" style="margin-top:8px;width:100%">🔧 Ir al box${motivo?" · "+motivo.toLowerCase():" · cambiar repuestos"}</button>`:""}</div>`;};
  let box=el(html());
  const pinta=()=>{const n=el(html());box.replaceWith(n);wire(n);cont&&cont();};
  const usar=k=>{if(T.stock[k]<=0){toast("No tenés en stock");return false;}T.stock[k]--;return true;};
  const wire=b=>{b.querySelectorAll("[data-b]").forEach(x=>x.onclick=()=>{const k=x.dataset.b;
      if(k==="garage"){tyGarage(J,()=>pinta());return;}
      if(k==="gomas"&&usar("cub")){J.gUso=0;J.blandas=false;toast("Gomas nuevas");enGar&&enGar("gomas");}
      else if(k==="gomasB"&&usar("cubB")){J.gUso=0;J.blandas=true;toast("Gomas blandas: más agarre, se gastan más rápido");enGar&&enGar("gomas");}
      else if(k==="serv"&&!J.serv&&usar("serv")){J.serv=true;T.desg=Math.max(0,T.desg*.75);toast("Service hecho: bujías, filtro y aceite");enGar&&enGar("serv");}
      else if(k==="tren"&&usar("tren")){T.est.tren=100;toast("Tren delantero nuevo");enGar&&enGar("serv");}
      else if(k==="amort"&&usar("amort")){T.est.amort=100;toast("Amortiguadores nuevos");enGar&&enGar("serv");}
      else if(k==="jaula"&&usar("jaula")){T.est.jaula=Math.min(100,T.est.jaula+60);toast("Jaula soldada");enGar&&enGar("serv");}
      save();pinta();});box=b;};
  wire(box);return ()=>box;};

/* ---------- desgaste: por carrera, por golpes y por vuelcos ---------- */
function pzFinCarrera(R){if(!R||R.c.entreno||R.c.vivo)return;const J=R.J,v=R.c.laps/5;
  pzGastar("tren",2.2*v);pzGastar("amort",2.6*v);pzGastar("jaula",.6*v);if(J&&J.blandas)J.gUso=Math.min(TY_GOMA_MAX,(J.gUso|0)+1);save();}
function pzGolpe(tipo,imp){const T=tyPz();
  if(tipo==="vuelco"){T.chapa=true;pzGastar("tren",38);pzGastar("amort",32);pzGastar("jaula",48);}
  else if(tipo==="pared"){pzGastar("tren",26);pzGastar("amort",18);pzGastar("jaula",24);}
  else if(tipo==="rueda"){pzGastar("tren",30);pzGastar("amort",24);pzGastar("jaula",30);}
  else if(tipo==="trompo"){pzGastar("tren",4);pzGastar("amort",3);}
  else if(tipo==="roce"){pzGastar("tren",Math.min(10,2+imp*6));}
  else if(tipo==="goma"){pzGastar("amort",6);}
  save();}

/* ---------- WARNES: la calle de los repuestos ---------- */
const WARNES=[
 {id:"gom",n:"Gomería La Rueda",d:"Cubiertas para tierra. Un juego aguanta 3 carreras; las blandas agarran más pero se gastan el doble.",col:"#c0392b",ic:"🛞",it:[
   {k:"cub",n:"Juego de cubiertas",p:18000,stock:"cub"},{k:"cubB",n:"Juego de cubiertas blandas",p:32000,stock:"cubB"},
   {k:"comp",n:"Compuesto de carrera (mejora fija)",p:T=>45000*(T.up.gomas+1),mejora:"gomas",max:4}]},
 {id:"rec",n:"Rectificadora Bahía",d:"Motores Audi AP a carburador. La rectificación deja el motor al 100%; la carburación suma caballos para siempre.",col:"#1f5fa8",ic:"⚙️",it:[
   {k:"rect",n:"Rectificar el motor",p:90000,ahora:T=>{T.desg=0;},ok:T=>(T.desg||0)>.01},
   {k:"carb",n:"Preparación de carburación (mejora fija)",p:T=>60000*(T.up.motor+1),mejora:"motor",max:4}]},
 {id:"rep",n:"Repuestos El Puerto",d:"Lo que no puede faltar en la caja del box.",col:"#1e8a4c",ic:"🔩",it:[
   {k:"serv",n:"Kit de service (bujías, filtro, aceite)",p:12000,stock:"serv"},{k:"amort",n:"Juego de amortiguadores",p:35000,stock:"amort"},
   {k:"jaula",n:"Caños y soldadura para la jaula",p:40000,stock:"jaula"}]},
 {id:"tren",n:"Tren Delantero Don Tito",d:"Extremos, rótulas, parrillas y alineación. Después de un golpe el auto no dobla igual.",col:"#e46b1c",ic:"🔧",it:[
   {k:"tren",n:"Kit de tren delantero (extremos, rótulas, parrilla)",p:28000,stock:"tren"},
   {k:"alin",n:"Alineación y balanceo",p:8000,ahora:T=>{T.est.tren=Math.min(100,T.est.tren+15);},ok:T=>T.est.tren<99}]}];
function vWarnes(){const m=$("#main"),T=tyPz(),cerrado=!!S.tayaJ;m.innerHTML="";hud();
  const d=el(`<div class="warnes"><div class="calle"><div class="cartel">Av. WARNES</div><span>la calle de los repuestos</span></div>
    <div class="row" style="justify-content:space-between;align-items:center;gap:10px;margin:14px 0 6px"><p class="sub" style="margin:0">Comprá antes de la fecha: durante la noche solo vas a poder usar lo que tengas en stock.</p><button class="btn sec" id="wVol" style="width:auto;flex:0 0 auto">◀ Inicio</button></div>
    ${cerrado?`<p class="nota" style="color:var(--rojo)">La noche ya empezó: Warnes está cerrado hasta que termine la fecha. Usá lo que tenés en stock, o abandoná la noche desde el box y llevá el auto al taller.</p>`:""}
    <div class="wgrid"></div><div class="copa" style="margin-top:16px"><div class="t">Tu midget</div>${pzEstadoHTML(null)}<div class="sec-t" style="margin-top:8px">Stock</div>${pzStockHTML()}</div></div>`);
  const g=d.querySelector(".wgrid");
  WARNES.forEach(c=>{const card=el(`<div class="local" style="--c:${c.col}"><div class="toldo"></div><h3>${c.ic} ${c.n}</h3><p class="nota">${c.d}</p><div class="items"></div></div>`);
    c.it.forEach(it=>{const p=typeof it.p==="function"?it.p(T):it.p,lleno=it.mejora&&T.up[it.mejora]>=it.max,nada=it.ok&&!it.ok(T);
      const extra=it.stock?` · tenés ${T.stock[it.stock]}`:it.mejora?` · nivel ${T.up[it.mejora]}/${it.max}`:"";
      const r=el(`<div class="item"><div><b>${it.n}</b><small>${fmt(p)}${extra}</small></div><button class="btn sm oro"${cerrado||lleno||nada?" disabled":""}>${lleno?"Al máximo":nada?"No hace falta":"Comprar"}</button></div>`);
      r.querySelector("button").onclick=()=>{if(S.tayaJ){toast("Con la noche empezada Warnes está cerrado");return;}if(S.pesos<p){toast("No te alcanza la plata: pasá por el kiosco");return;}
        S.pesos-=p;if(it.stock)T.stock[it.stock]++;else if(it.mejora)T.up[it.mejora]++;else if(it.ahora)it.ahora(T);save();toast(it.stock?`${it.n}: al stock`:`¡Listo! ${it.n}`);vWarnes();};
      card.querySelector(".items").append(r);});g.append(card);});
  m.append(d);$("#wVol").onclick=()=>render();}
