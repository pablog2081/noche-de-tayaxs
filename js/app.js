/* Noche de TAYA'xs — pantalla principal (PC) */
const BUILD="24";
function hud(){$("#hPesos").textContent=fmt(S.pesos);$("#hApodo").textContent=S.apodo?"Piloto: "+S.apodo:"";$("#bMute").textContent=muted?"🔇":"🔊";}
function render(){hud();const m=$("#main");m.innerHTML="";
  if(!S.apodo){m.append(bienvenida());return;}
  vInicio(m);}
function bienvenida(){const d=el(`<div class="copa bienv"><h2>Noche de TAYA'xs</h2>
  <p class="sub">Midgets en el óvalo de tierra de Bahía Blanca. 140 pilotos: series de 8, repechajes, semis de 10, prefinal y la Gran Final de 12. Los pilotos nuevos primero practican en el salitral y corren el tiempo de suficiencia. Autos sin caja: se doblan derrapando y el acelerador es el volante.</p>
  <label class="nota">¿Cómo te dicen en el ambiente?</label>
  <input id="bApodo" maxlength="16" placeholder="Tu apodo" style="font:700 22px var(--f-ui);padding:10px;border-radius:10px;border:1px solid var(--linea);background:var(--asfalto);color:var(--crema);width:100%;margin:6px 0 12px">
  <button class="btn oro" id="bEmp">Entrar al autódromo</button></div>`);
  d.querySelector("#bEmp").onclick=()=>{const v=(d.querySelector("#bApodo").value||"").trim();if(!v){toast("Poné tu apodo");return;}S.apodo=v.slice(0,16);{const m=TY_VOCES.find(n=>tySlug(n)===tySlug(v.split(" ")[0]));if(m&&!S.tyVoz)S.tyVoz=tySlug(m);}save();render();};
  setTimeout(()=>{try{d.querySelector("#bApodo").focus();}catch(e){}},50);return d;}
function graficosMenu(){const g=S.graf||"ultra";
  modal(`<h3>Gráficos</h3><p class="nota">Ultra: sombras de las torres de luz, brillo de las luces, antialias fino y más resolución. Si la PC anda trabada, bajalo.</p>
    ${["ultra","alta","media"].map(k=>`<label class="aopt" style="display:flex;gap:10px;align-items:center;padding:8px 0"><input type="radio" name="gq" value="${k}" ${g===k?"checked":""}> <b>${{ultra:"Ultra",alta:"Alta",media:"Media"}[k]}</b> <span class="nota">${{ultra:"PC con placa de video",alta:"notebooks",media:"PC viejita"}[k]}</span></label>`).join("")}
    <div class="opts"><button class="btn oro" id="gOk">Listo</button></div>`);
  document.querySelectorAll('input[name="gq"]').forEach(i=>i.onchange=()=>{S.graf=i.value;save();});$("#gOk").onclick=closeModal;}
function sonidoMenu(){const row=(k,t,on)=>`<label class="aopt" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0"><span>${t}</span><input type="checkbox" data-k="${k}" ${on?"checked":""} style="width:22px;height:22px"></label>`;
  modal(`<h3>Sonido</h3>${row("all","Todo el sonido",!muted)}${row("mus","Música de fondo",!noMus)}${row("voz","El relato de Fefón",!noVoz)}${row("fx","Motores y golpes",!noFx)}<div class="opts"><button class="btn oro" id="aOk">Listo</button></div>`);
  document.querySelectorAll("input[data-k]").forEach(i=>i.onchange=()=>{const v=!i.checked;({all:()=>muted=v,mus:()=>noMus=v,voz:()=>noVoz=v,fx:()=>noFx=v})[i.dataset.k]();
    try{localStorage.setItem(KEY+".mute",muted?"1":"0");localStorage.setItem(KEY+".nomus",noMus?"1":"0");localStorage.setItem(KEY+".novoz",noVoz?"1":"0");localStorage.setItem(KEY+".nofx",noFx?"1":"0");}catch(e){}bgm();hud();});
  $("#aOk").onclick=closeModal;}
$("#bPad").onclick=controlesMenu;$("#bGraf").onclick=graficosMenu;
$("#bBuild").textContent=BUILD;
// el 3D arranca apenas abre, así la primera carrera no espera
init3D();
render();

/* ---------- KIOSCO: plata para el juego (compras simuladas en esta versión de prueba) ---------- */
const KIO_PESOS=[{t:"Bolsita",v:300000,p:"$ 1.999"},{t:"Sobre",v:1000000,p:"$ 4.999",d:true},{t:"Valija",v:3000000,p:"$ 9.999"},{t:"Caja fuerte",v:10000000,p:"$ 24.999"}];
function vKiosco(){const m=$("#main");m.innerHTML="";hud();const cd=Math.max(0,Math.ceil(((S.adAt||0)+120000-Date.now())/1000));
  const d=el(`<div class="kio"><div class="row" style="justify-content:space-between;align-items:center"><h2 style="margin:0">El kiosco</h2><button class="btn sec" id="kVol" style="width:auto;flex:0 0 auto">◀ Volver</button></div>
    <p class="sub">Plata para el juego: chasis nuevo, carburación, cubiertas, gomas y service.</p><div class="stack"></div>
    <p class="nota">Versión de prueba: las compras y los avisos están simulados y no cobran nada.</p>
    <button class="btn sec" id="kReset" style="margin-top:14px">Empezar de cero</button></div>`);
  const st=d.querySelector(".stack");
  const ad=el(`<div class="pack"><div class="big">▶</div><div><div class="t">Mirá un aviso</div><div class="s">Ganás ${fmt(25000)} gratis. Uno cada 2 minutos.</div></div><button class="btn verde" ${cd?"disabled":""}>${cd?cd+" s":"Ver"}</button></div>`);
  ad.querySelector("button").onclick=()=>kioAviso(()=>{S.pesos+=25000;S.adAt=Date.now();save();toast("+"+fmt(25000));vKiosco();});st.append(ad);
  KIO_PESOS.forEach(p=>{const r=el(`<div class="pack ${p.d?"dest":""}"><div class="big">$</div><div><div class="t">${p.t}</div><div class="s">${fmt(p.v)} de plata para el juego</div></div><button class="btn oro">${p.p}</button></div>`);
    r.querySelector("button").onclick=()=>kioComprar(`${p.t} (${fmt(p.v)})`,p.p,()=>{S.pesos+=p.v;});st.append(r);});
  m.append(d);$("#kVol").onclick=render;
  $("#kReset").onclick=()=>{modal(`<h3>¿Borrar la partida?</h3><p>Perdés la plata, el campeonato y las mejoras. Tu apodo queda.</p><div class="opts"><button class="btn" id="ys">Borrar</button><button class="btn sec" id="ns">Cancelar</button></div>`);
    $("#ys").onclick=()=>{const ap=S.apodo,vz=S.tyVoz;S=fresh();S.apodo=ap;S.tyVoz=vz;save();closeModal();render();};$("#ns").onclick=closeModal;};}
function kioComprar(nom,precio,fn){modal(`<h3>${esc(nom)}</h3><p>En la versión final acá se paga ${precio}. En esta versión de prueba la compra es simulada y no se cobra nada.</p><div class="opts"><button class="btn oro" id="ys">Comprar (simulado)</button><button class="btn sec" id="ns">Cancelar</button></div>`);
  $("#ys").onclick=()=>{fn();save();closeModal();toast("¡Listo! Ya tenés la plata");vKiosco();};$("#ns").onclick=closeModal;}
function kioAviso(done){let n=3;modal(`<div class="adfake" id="adtx">Aviso<br>${n}</div><p>En la versión final acá va un video con premio.</p>`);
  const it=setInterval(()=>{n--;const t=$("#adtx");if(t)t.innerHTML=`Aviso<br>${n}`;if(n<=0){clearInterval(it);closeModal();done();}},1000);}
$("#bKio").onclick=()=>{if(typeof TYR!=="undefined"&&TYR)return;vKiosco();};
