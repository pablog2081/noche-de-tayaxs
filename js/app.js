/* Noche de TAYA'xs — pantalla principal (PC) */
const BUILD="v1";
function hud(){$("#hPesos").textContent=fmt(S.pesos);$("#hApodo").textContent=S.apodo?"Piloto: "+S.apodo:"";$("#bMute").textContent=muted?"🔇":"🔊";}
function render(){hud();const m=$("#main");m.innerHTML="";
  if(!S.apodo){m.append(bienvenida());return;}
  const col=el(`<div class="pcgrid"><div class="pcizq"></div><div class="pcder"></div></div>`);m.append(col);
  vTaya(col.querySelector(".pcizq"));
  // en PC: a la izquierda el campeonato y tu midget, a la derecha la tabla
  const izq=col.querySelector(".pcizq"),der=col.querySelector(".pcder"),hijos=[...izq.children];
  hijos.slice(3).forEach(c=>der.append(c));}
function bienvenida(){const d=el(`<div class="copa bienv"><h2>Noche de TAYA'xs</h2>
  <p class="sub">Midgets en el óvalo de tierra de Bahía Blanca. 140 pilotos, series, repechajes, semis, prefinal y la Gran Final, todas las noches. Autos sin caja: se doblan derrapando y el acelerador es el volante.</p>
  <label class="nota">¿Cómo te dicen en el ambiente?</label>
  <input id="bApodo" maxlength="16" placeholder="Tu apodo" style="font:700 22px var(--f-ui);padding:10px;border-radius:10px;border:1px solid var(--linea);background:var(--asfalto);color:var(--crema);width:100%;margin:6px 0 12px">
  <button class="btn oro" id="bEmp">Entrar al autódromo</button></div>`);
  d.querySelector("#bEmp").onclick=()=>{const v=(d.querySelector("#bApodo").value||"").trim();if(!v){toast("Poné tu apodo");return;}S.apodo=v.slice(0,16);save();render();};
  setTimeout(()=>{try{d.querySelector("#bApodo").focus();}catch(e){}},50);return d;}
function graficosMenu(){const g=S.graf||"ultra";
  modal(`<h3>Gráficos</h3><p class="nota">Ultra: sombras de las torres de luz, brillo de las luces, antialias fino y más resolución. Si la PC anda trabada, bajalo.</p>
    ${["ultra","alta","media"].map(k=>`<label class="aopt" style="display:flex;gap:10px;align-items:center;padding:8px 0"><input type="radio" name="gq" value="${k}" ${g===k?"checked":""}> <b>${{ultra:"Ultra",alta:"Alta",media:"Media"}[k]}</b> <span class="nota">${{ultra:"PC con placa de video",alta:"notebooks",media:"PC viejita"}[k]}</span></label>`).join("")}
    <div class="opts"><button class="btn oro" id="gOk">Listo</button></div>`);
  document.querySelectorAll('input[name="gq"]').forEach(i=>i.onchange=()=>{S.graf=i.value;save();});$("#gOk").onclick=closeModal;}
function sonidoMenu(){const row=(k,t,on)=>`<label class="aopt" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0"><span>${t}</span><input type="checkbox" data-k="${k}" ${on?"checked":""} style="width:22px;height:22px"></label>`;
  modal(`<h3>Sonido</h3>${row("all","Todo el sonido",!muted)}${row("mus","La cumbia de fondo",!noMus)}${row("voz","El relato de Fefón",!noVoz)}${row("fx","Motores y golpes",!noFx)}<div class="opts"><button class="btn oro" id="aOk">Listo</button></div>`);
  document.querySelectorAll("input[data-k]").forEach(i=>i.onchange=()=>{const v=!i.checked;({all:()=>muted=v,mus:()=>noMus=v,voz:()=>noVoz=v,fx:()=>noFx=v})[i.dataset.k]();
    try{localStorage.setItem(KEY+".mute",muted?"1":"0");localStorage.setItem(KEY+".nomus",noMus?"1":"0");localStorage.setItem(KEY+".novoz",noVoz?"1":"0");localStorage.setItem(KEY+".nofx",noFx?"1":"0");}catch(e){}bgm();hud();});
  $("#aOk").onclick=closeModal;}
$("#bMute").onclick=sonidoMenu;$("#bPad").onclick=controlesMenu;$("#bGraf").onclick=graficosMenu;
$("#bBuild").textContent=BUILD;
// el 3D arranca apenas abre, así la primera carrera no espera
init3D();
render();
