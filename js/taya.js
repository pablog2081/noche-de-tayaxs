/* =====================================================================
   NIVEL 4 · TAYA'xs — midgets en el óvalo de tierra de Bahía Blanca
   Autódromo "Héctor Evaristo Plano" (Aldea Romana), de noche.
   Medidas sacadas de la foto satelital: óvalo de tierra de unos 400 m por
   la mitad de la pista (rectas de ~92 m, curvas de ~34,5 m de radio),
   13 m de ancho, paredón de hormigón con alambrado, tribuna larga sobre la
   recta principal, tribuna techada (roja) en la curva 3-4, tribuna chica en
   la recta opuesta, boxes (galpones) del lado de afuera de la curva 1-2 y
   la torre de control en el medio del infield.
   Autos: motor Audi AP 1.6/1.8 a carburador, 160-180 HP, 455/540 kg, sin caja
   (tracción directa), diferencial bloqueado: se manejan derrapando con el
   acelerador y el contravolante. Cuando les sobra potencia se paran de manos.
   ===================================================================== */
const TY={R:34.5,S:91.6,W:13,LAPS:{serie:5,repe:5,semi:6,pre:6,final:8}};
TY.LAP=2*TY.S+2*Math.PI*TY.R;           // ≈ 400 m
TY.WALL=TY.W/2-.85;                     // centro del auto contra el paredón de afuera
TY.IN=-TY.W/2+.7;                       // borde de adentro (después hay pasto y cubiertas)
const TY_FILA=[-4.3,-1.55,1.2,3.95]; // 4 autos por fila en la largada
// boxes comunitarios detrás de las curvas 3 y 4: 5 módulos de tinglado con boxes enfrentados (lona entre box y box);
// se entra por la curva 3 y se sale por la 4
const TYB=(()=>{const a=TY.S/2,arc=Math.PI*TY.R,s3=a+arc+TY.S,s4=s3+arc,W2=TY.W/2;
  const B={s3,s4,ent:s3+5,sal:s4-5,road:W2+9.6,dIn:W2+5.3,dOut:W2+13.9,boxes:[],mods:[]};
  const m0=s3+16,m1=s4-16,ml=(m1-m0-4*2.4)/5;
  for(let k=0;k<5;k++){const ms=m0+k*(ml+2.4);B.mods.push([ms,ms+ml]);const n=Math.floor(ml/3.05),w=ml/n;
    for(let i=0;i<n;i++){const sc=ms+w*(i+.5);B.boxes.push({s:sc,d:B.dIn,row:0,w,mod:k});B.boxes.push({s:sc,d:B.dOut,row:1,w,mod:k});}}
  B.puertas=[[B.ent-4.5,B.ent+4.5],[B.sal-4.5,B.sal+4.5]];return B;})();
const tyEnPuerta=s=>{s=((s%TY.LAP)+TY.LAP)%TY.LAP;return TYB.puertas.some(([a,b])=>s>a&&s<b);};
// box de cada auto en una carrera (el tuyo siempre es el mismo)
function tyBoxDe(id,i){const n=TYB.boxes.length;if(id==="yo")return TYB.boxes[12%n];let h=0;for(const ch of String(id))h=(h*31+ch.charCodeAt(0))%997;return TYB.boxes[(h+i*7)%n===12%n?(h+i*7+1)%n:(h+i*7)%n];}
const TY_BLANCOS=["ma","mb","mc","md"]; // chasis nuevos con la carrocería blanca: se pintan del color del piloto
const TY_M=["ma","mb","mc","md"];     // los 4 chasis (modelos realistas de Meshy, carrocería blanca para pintar)
const TY_M_VIEJO={m6:"ma",m99:"mb",m14:"mc",m2:"md"};
const TY_PTS_FINAL=[20,17,15,13,11,10,9,8,7,6,5,4];
const TY_PREMIO=[140000,100000,80000,65000,55000,48000,42000,37000,33000,30000,28000,26000];
const TY_FECHAS=18,TY_REG=12; // 12 fechas regulares + playoff de 6 (12 → 8 → 4)
const TY_HUMAN={"m6":"Médano","m99":"Carancho","m14":"Salitral","m2":"Tero","ma":"Bahiense","mb":"Pampa","mc":"Ventarrón","md":"Saeta"};

// posición en el óvalo: s = metros por el medio de la pista desde la línea de llegada (mitad de la recta principal)
// d = metros hacia afuera (+) o hacia adentro (−) desde el medio de la pista. Se dobla siempre a la izquierda.
function tyPose(s,d){const S=TY.S,R0=TY.R,R=R0+(d||0),L=TY.LAP;s=((s%L)+L)%L;const a=S/2,arc=Math.PI*R0;
  if(s<a)return {x:s,z:R,h:0,c:0};s-=a;
  if(s<arc){const t=s/R0;return {x:S/2+R*Math.sin(t),z:R*Math.cos(t),h:t,c:1};}s-=arc;
  if(s<S)return {x:S/2-s,z:-R,h:Math.PI,c:0};s-=S;
  if(s<arc){const t=s/R0;return {x:-S/2-R*Math.sin(t),z:-R*Math.cos(t),h:Math.PI+t,c:1};}s-=arc;
  return {x:-S/2+s,z:R,h:2*Math.PI,c:0};}
const tyCurva=s=>tyPose(s,0).c;
// peralte suave de las curvas (la tierra se levanta hacia afuera)
function tyBank(s){const L=TY.LAP,a=TY.S/2,arc=Math.PI*TY.R;s=((s%L)+L)%L;const sm=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};const r=14;
  return Math.max(sm((s-(a-r))/r)*sm((a+arc+r-s)/r),sm((s-(a+arc+TY.S-r))/r)*sm((a+2*arc+TY.S+r-s)/r));}
const tyY=(s,d)=>tyBank(s)*Math.max(0,d+TY.W/2)*.09;
/* altura de un auto: sobre la pista sigue el peralte; afuera del paredón (calle de boxes) baja al piso */
const tyYc=(s,d)=>{const W2=TY.W/2;if(d<=W2)return tyY(s,d);return tyY(s,W2)*Math.max(0,1-(d-W2)/4);};

/* ---------- pilotos: 140 inscriptos (139 + vos) ---------- */
const TY_NOM=["Pochón","Tito Ramírez","Cacho Benítez","El Ruso Kovalenko","Lalo Sartori","Beto Ferreyra","Chiche Duarte","El Vasco Iturbe","Quique Lombardo","Pato Gallardo",
  "El Tano Bruzzone","Coco Arrieta","Mingo Salvatierra","Nacho Pereyra","Fito Barrionuevo","El Turco Haddad","Rulo Mansilla","Toto Ledesma","Juanca Medina","Kike Olmos",
  "El Flaco Gauna","Gringo Weber","Pipo Aguirre","Moncho Rivas","Tincho Sosa","Lucho Barrera","El Negro Funes","Polaco Zelinski","Charly Villalba","Rodo Gaitán",
  "Pancho Leiva","Nene Cabral","Lito Montes","Tucu Paz","El Cabezón Ortiz","Santi Correa","Mati Bustos","Facu Ibarra","Fede Rossi","Dani Quiroga",
  "El Mono Ponce","Wally Schmidt","Rafa Ojeda","Tato Domínguez","Cholo Vera","Bocha Ruiz","Pelusa Godoy","Cachito Luna","Ruli Navarro","Toni Romero",
  "El Petiso Acuña","Chino Takahashi","Beto Jr. Ferreyra","Agus Molina","Nelo Castaño","Coqui Herrera","El Oso Maldonado","Gordo Valdez","Pocholo Ríos","Sergio Tuerca Díaz",
  "El Zurdo Ponce","Tano Russo","Marcelo Ibáñez","Kevin Montiel","Brian Álvarez","Lauti Giménez","Nico Peralta","Ema Toledo","Gonza Ríos","Maxi Ferreira",
  "Euge Báez","Flor Castro","La Colorada Sánchez","Vicky Núñez","Juli Pacheco","El Topo Rivero","Lucas Bianchi","Mauro Spinelli","Hernán Gutiérrez","Diego Calvo",
  "Martín Carrizo","Walter Ocampo","Ariel Méndez","Gustavo Pintos","Pablo Arce","Jorge Vidal","Raúl Benegas","Omar Figueroa","Darío Escobar","Claudio Robles",
  "El Chueco Arias","Tero Benavídez","Pirata Morales","Cuervo Sández","Lagarto Funes","Pinino Ruiz","Tony Calderón","El Galgo Ferraro","Mono Sepúlveda","Cachi Ferro","Ñato Barragán","Poroto Insaurralde","El Mosca Villar","Chula Garay","Tito Jr. Ramírez","Pájaro Molina","Piraña Coria","Chino Ledesma","Topo Gigena","El Rubio Sander","Carpincho Díaz","Lolo Echeverría","Yayo Bermúdez","Fideo Cabrera","Picu Albornoz","Chanchi Rojas","Pitu Galván","Bocha Jr. Ruiz","Tuerca Ojeda","El Loco Pereira","Manu Iriarte","Seba Quiroga","Leo Etchegaray","Tomi Zabala","Fran Bonetto","Ale Montero","Joaco Urquiza","Cristian Lastra","Bruno Sanz","Germán Etcheverry","Lorena Aguilar","Mica Pérez","Sol Iturralde","Rocío Bravo","Ceci Ponce","Gaby Lucero","Andrés Cortese","Rubén Lazarte","Néstor Gorostiaga"];
const TY_COL=["#f2c230","#c0392b","#1f5fa8","#ececec","#1e8a4c","#e46b1c","#6c2a8a","#111111","#7ec8e3","#d63384","#8d6e3b","#2b9aa0","#b5d334","#a01e2e","#355070"];
const TY_SPON=["Lubricantes Pampa","Transporte Sur","Agro Médano","Fierros Tito","Automotores Costa","Repuestos El Galpón","Cubiertas Tornado","Radio Fierrera","Panadería La Aldea","Corralón Bahía",
  "Frigorífico Romana","Gomería El Puerto","Pinturas Salitral","Distribuidora Ingeniero White","Ferretería Los Andes","Pizzería Don Tito","Cerealera Sur","Talleres Napostá","Seguros La Rural","Carnicería El Tero"];
// cada piloto: número, chasis, color, sponsor, habilidad y caballos (fijos por semilla)
const tyRnd=k=>{const x=Math.sin(k*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const TY_PIL=TY_NOM.map((n,i)=>({id:"t"+i,n,num:i===0?7:((i*37)%158)+2,m:TY_M[i%4],col:TY_COL[(i*7+3)%TY_COL.length],spon:TY_SPON[(i*11)%TY_SPON.length],
  sk:i===0?.95:.55+.42*tyRnd(i+1),hp:i===0?179:162+Math.round(17*tyRnd(i+40)),kg:i%3===0?540:455}));
// números sin repetir
{const used=new Set();TY_PIL.forEach(p=>{while(used.has(p.num)||p.num===77)p.num=(p.num%158)+2;used.add(p.num);});}
const TY_P={};TY_PIL.forEach(p=>TY_P[p.id]=p);

/* ---------- estado del campeonato ---------- */
function tyState(){let T=S.taya;
  if(!T||!T.pts){T=S.taya={fecha:0,pts:{},po:null,hist:[],up:{motor:0,gomas:0},m:"ma",col:"#f2b632",num:(S.apodo?77:77),champ:null,yaSabe:false};save();}
  if(!T.up)T.up={motor:0,gomas:0};if(T.desg==null)T.desg=0;if(T.habil==null)T.habil=(T.fecha|0)>0;if(T.po&&!T.po.todos)T.po.todos=T.po.vivos.slice();if(!T.ganF)T.ganF={};if(TY_M_VIEJO[T.m])T.m=TY_M_VIEJO[T.m];return T;}
const tyNombre=id=>id==="yo"?(S.apodo||"Vos"):TY_P[id]?TY_P[id].n:(typeof TYV!=="undefined"&&TYV&&TYV.info[id])?TYV.info[id].apodo:"?";
const tyNum=id=>id==="yo"?tyState().num:TY_P[id]?TY_P[id].num:(TYV&&TYV.info[id]?TYV.info[id].num:0);
function tyIds(){return ["yo",...TY_PIL.map(p=>p.id)];}
function tyTabla(){const T=tyState();const ids=T.po&&T.po.vivos?null:tyIds();
  const rows=tyIds().map(id=>({id,p:T.pts[id]|0,po:T.po?(T.po.pts[id]|0):0,vivo:T.po?T.po.vivos.includes(id):false}));
  if(T.po)rows.sort((a,b)=>(b.vivo-a.vivo)||(b.vivo?b.po-a.po:0)||b.p-a.p);else rows.sort((a,b)=>b.p-a.p);
  return rows;}
// rating de un piloto para las carreras que no ves
function tyRating(id){if(id==="yo"){const T=tyState();return .74+T.up.motor*.012+T.up.gomas*.01;}const p=TY_P[id];return p.sk*.75+(p.hp-160)/20*.18+(p.kg===455?.03:0);}

/* ---------- la jornada: series, repechajes, semifinales, prefinal y final ---------- */
// REGLAMENTO de la noche (128 autos de 140 inscriptos):
// · 16 series de 8. Los 32 mejores TIEMPOS de las series van a las semis (8 por semi, del 1º al 8º puesto de largada).
// · Repechajes (mismas vueltas que las series): corren todos los que no clasificaron, de a 10. Los 8 mejores tiempos
//   completan las semis en los puestos 9 y 10 de cada una (largan de 3ª fila).
// · 4 semis de 10. Ranking por tiempo de las 40: del 1º al 10º a la final, 11º y 12º suplentes, del 13º al 24º a la prefinal.
// · Final de 12: los 10 mejores tiempos de las semis + los 2 primeros de la prefinal.
// · Prefinal y final: si alguno abandona, se relarga con un suplente (el que sigue en tiempo de la instancia anterior).
function tyJornadaNueva(sinYo){const T=tyState(),nB=sinYo?128:127;
  const presentes=TY_PIL.map(p=>p.id).filter((id,i)=>i===0||tyRnd(i*13+T.fecha*7)>.08).slice(0,nB);
  while(presentes.length<nB)presentes.push(TY_PIL.find(p=>!presentes.includes(p.id)).id);
  const todos=(sinYo?presentes:["yo",...presentes]).sort((a,b)=>tyRnd(T.fecha*97+tyIds().indexOf(a))-tyRnd(T.fecha*97+tyIds().indexOf(b)));
  const series=[];for(let i=0;i<16;i++)series.push(todos.slice(i*8,i*8+8));
  const J={fecha:T.fecha+1,ent:todos,series,res:{},pend:[],pts:{},log:[],fuera:false,etapa:"serie",gUso:0,serv:false,carreras:0,sinYo:!!sinYo};
  todos.forEach(id=>J.pts[id]=5); // presentismo
  J.mio=series.findIndex(s=>s.includes("yo"));
  return J;}
const tyTSim=(id,laps)=>laps*15.6*(1.06-tyRating(id)*.08);
function tySimular(ids,laps,sup){ // resultado de una carrera que no se ve (vos nunca: si no la corrés, no estás)
  const r=ids.map(id=>({id,t:tyTSim(id,laps)+(Math.random()-.5)*laps*.55,dnf:id==="yo"||Math.random()<.035}));
  r.sort((a,b)=>(a.dnf-b.dnf)||a.t-b.t);const out=r.map(x=>({id:x.id,dnf:x.dnf,t:x.dnf?null:x.t}));
  // prefinal y final: por cada abandono entra un suplente desde el fondo
  if(sup){const L=sup.filter(id=>id!=="yo"&&!ids.includes(id));let n=out.filter(x=>x.dnf).length,tMax=Math.max(0,...out.filter(x=>!x.dnf).map(x=>x.t));
    for(let i=0;i<n&&i<L.length;i++){tMax+=.4+Math.random()*1.2;out.splice(out.findIndex(x=>x.dnf),0,{id:L[i],dnf:false,t:tMax,sup:true});}}
  return out;}
const tyOrdT=L=>L.slice().sort((a,b)=>(a.dnf-b.dnf)||((a.t??999)-(b.t??999)));
// arma la próxima carrera de la noche según lo que ya se corrió (las que no corrés se simulan)
function tySiguiente(J){
  const R=J.res,LP=TY.LAPS,yo=!J.sinYo&&!J.retiro;
  if(!R.series){if(yo&&J.mio>=0)return {k:"serie",n:J.mio+1,ids:J.series[J.mio],laps:LP.serie,nom:"Serie "+(J.mio+1)};R.series=J.series.map(s=>tySimular(s,LP.serie));}
  if(!J.clasS){const rk=tyOrdT(R.series.flat()).map(x=>x.id);J.clasS=rk.slice(0,32);const resto=rk.slice(32),n=Math.ceil(resto.length/10);
    J.repes=[...Array(n)].map((_,i)=>resto.filter((_,k)=>k%n===i));}
  if(!R.repes){const k=J.repes.findIndex(r=>r.includes("yo"));if(yo&&k>=0)return {k:"repe",n:k+1,ids:J.repes[k],laps:LP.repe,nom:"Repechaje "+(k+1)};
    R.repes=J.repes.map(r=>tySimular(r,LP.repe));}
  if(!J.semis){J.clasR=tyOrdT(R.repes.flat()).filter(x=>!x.dnf).slice(0,8).map(x=>x.id);
    J.semis=[0,1,2,3].map(i=>[...J.clasS.filter((_,k)=>k%4===i),...J.clasR.filter((_,k)=>k%4===i)]);}
  if(!R.semis){const k=J.semis.findIndex(s=>s.includes("yo"));if(yo&&k>=0)return {k:"semi",n:k+1,ids:J.semis[k],laps:LP.semi,nom:"Semifinal "+(k+1)};
    R.semis=J.semis.map(s=>tySimular(s,LP.semi));}
  if(!J.rkSemi){J.rkSemi=tyOrdT(R.semis.flat()).map(x=>x.id);J.pre=J.rkSemi.slice(12,24);}
  const supPre=J.rkSemi.slice(24);
  if(!R.pre){if(yo&&J.pre.includes("yo"))return {k:"pre",n:1,ids:J.pre,laps:LP.pre,nom:"Prefinal",sup:supPre.slice()};
    R.pre=tySimular(J.pre,LP.pre,supPre);}
  if(!J.final)J.final=[...J.rkSemi.slice(0,10),...R.pre.filter(x=>!x.dnf).slice(0,2).map(x=>x.id)];
  const supFin=J.rkSemi.slice(10).filter(id=>!J.final.includes(id));
  // si quedaste suplente de la final, a veces alguno no puede largar y entrás vos
  if(yo&&!J.supYa&&!R.final&&!J.final.includes("yo")){J.supYa=1;const k=supFin.indexOf("yo");
    if(k>=0&&k<2&&Math.random()<(k?.12:.3)){const out=J.final[2+Math.floor(Math.random()*(J.final.length-2))];J.supNota=`${tyNombre(out)} no pudo largar la final: entrás vos como suplente, desde el fondo.`;J.final=[...J.final.filter(x=>x!==out),"yo"];}}
  if(!R.final){if(yo&&J.final.includes("yo"))return {k:"final",n:1,ids:J.final,laps:LP.final,nom:"Gran Final",sup:supFin.filter(x=>x!=="yo")};
    R.final=tySimular(J.final,LP.final,supFin);}
  return null;}
// qué te toca después de cada carrera
function tyPasaTxt(J,c){const id="yo";
  if(c.k==="serie"){const i=(J.clasS||[]).indexOf(id);return i>=0?`¡Clasificaste a la semifinal con el ${i+1}º mejor tiempo de las 16 series!`:"No entraste entre los 32 mejores tiempos: vas al repechaje.";}
  if(c.k==="repe"){const i=(J.clasR||[]).indexOf(id);return i>=0?`¡Pasaste a la semifinal con el ${i+1}º tiempo de los repechajes! Largás de 3ª fila.`:"No te alcanzó: pasaban los 8 mejores tiempos de los repechajes.";}
  if(c.k==="semi"){const i=(J.rkSemi||[]).indexOf(id);if(J.final&&J.final.includes(id)&&i>=10)return J.supNota||"¡Entrás a la final como suplente!";
    return i<0?"":i<10?`¡¡ESTÁS EN LA GRAN FINAL!! (${i+1}º tiempo de las semis)`:i<12?`Quedaste ${i===10?"1º":"2º"} suplente de la final: esta vez no hizo falta.`:i<24?`Vas a la prefinal (${i+1}º tiempo de las semis): los 2 primeros completan la final.`:"Hasta acá llegaste esta noche: pasaban los 24 mejores tiempos.";}
  if(c.k==="pre")return J.final&&J.final.includes(id)?"¡Te metiste en la Gran Final!":"Quedaste afuera de la final: pasaban los 2 primeros.";
  return "";}
// guarda el resultado de una carrera (la tuya) y simula las demás de la misma etapa
function tyGuardar(J,c,res){const R=J.res;
  if(c.k==="serie"){R.series=J.series.map((s,i)=>i===c.n-1?res:tySimular(s,TY.LAPS.serie));}
  else if(c.k==="repe"){R.repes=J.repes.map((r,i)=>i===c.n-1?res:tySimular(r,TY.LAPS.repe));}
  else if(c.k==="semi"){R.semis=J.semis.map((s,i)=>i===c.n-1?res:tySimular(s,TY.LAPS.semi));}
  else if(c.k==="pre")R.pre=res;else if(c.k==="final")R.final=res;}
// puntos de la noche
function tyPuntosNoche(J){const P={...J.pts},R=J.res,add=(id,n)=>{P[id]=(P[id]|0)+n;};
  (R.series||[]).forEach(s=>{if(s[0]&&!s[0].dnf)add(s[0].id,4);});
  (R.semis||[]).forEach(s=>{if(s[0]&&!s[0].dnf)add(s[0].id,7);});
  if(R.pre){if(R.pre[0]&&!R.pre[0].dnf)add(R.pre[0].id,2);if(R.pre[1]&&!R.pre[1].dnf)add(R.pre[1].id,1);}
  (R.final||[]).forEach((x,i)=>{if(!x.dnf)add(x.id,TY_PTS_FINAL[i]||0);});
  return P;}
// cierra la noche: suma al campeonato, playoff, Copa de Plata, premio
function tyCerrarNoche(J){const T=tyState(),P=tyPuntosNoche(J);T.fecha++;T.ganF=T.ganF||{};
  const gan=(J.res.final||[]).find(x=>!x.dnf);if(gan)T.ganF[gan.id]=(T.ganF[gan.id]|0)+1;
  for(const id in P){T.pts[id]=(T.pts[id]|0)+P[id];if(T.po&&T.po.todos.includes(id))T.po.pts[id]=(T.po.pts[id]|0)+(T.po.vivos.includes(id)?P[id]:0);
    if(T.cp&&T.cp.ids.includes(id))T.cp.pts[id]=(T.cp.pts[id]|0)+P[id];}
  const fin=J.res.final||[],yo=fin.findIndex(x=>x.id==="yo");let msg="",plata=0;
  if(J.sinYo){msg=`La fecha ${J.fecha} se corrió sin vos. Ganó ${gan?tyNombre(gan.id):"—"}.`;}
  else{plata=yo>=0&&!fin[yo].dnf?TY_PREMIO[yo]:J.retiro?0:15000;
    S.pesos+=plata;msg=yo>=0?(fin[yo].dnf?"Abandonaste la Gran Final. ":`Llegaste ${yo+1}º en la Gran Final. `):J.retiro?"Abandonaste la noche para llevar el auto al taller. ":"";
    if(gan&&gan.id==="yo")msg+="¡Ganaste una final! Ya cumplís el requisito para ser campeón. ";
    msg+=`Sumaste ${P.yo|0} puntos esta noche.${plata?" Cobraste "+fmt(plata)+".":""}`;}
  // después de la fecha 12: los 12 primeros al playoff, el resto a la Copa de Plata. Cada 2 fechas el playoff se achica a 8 y a 4
  if(T.fecha===TY_REG&&!T.po){const tab=tyTabla(),top=tab.slice(0,12).map(r=>r.id);T.po={vivos:top,todos:top.slice(),pts:{}};top.forEach(id=>T.po.pts[id]=0);
    T.cp={ids:tab.slice(12).map(r=>r.id),pts:{}};
    msg+=top.includes("yo")?" ¡Entraste al playoff de los 12!":" No entraste al playoff: seguís en la Copa de Plata.";}
  else if(T.po&&(T.fecha===TY_REG+2||T.fecha===TY_REG+4)){const keep=T.fecha===TY_REG+2?8:4;const orden=T.po.vivos.slice().sort((a,b)=>(T.po.pts[b]|0)-(T.po.pts[a]|0));
    const out=orden.slice(keep);T.po.vivos=orden.slice(0,keep);if(T.po.vivos.includes("yo"))msg+=` ¡Pasaste el corte! Quedan ${keep}.`;else if(out.includes("yo"))msg+=" Quedaste afuera del playoff en este corte.";}
  if(T.fecha>=TY_FECHAS){const ch=tyCampeon(T);T.champ=ch.id;T.champNota=ch.nota;
    msg+=T.champ==="yo"?" ¡¡SOS CAMPEÓN DE TAYA'xs!!":` Campeón: ${tyNombre(T.champ)}.`;if(ch.nota)msg+=" "+ch.nota;if(T.champ==="yo"){S.pesos+=500000;}
    const cp=T.cp?T.cp.ids.slice().sort((a,b)=>(T.cp.pts[b]|0)-(T.cp.pts[a]|0))[0]:null;T.champP=cp;if(cp)msg+=cp==="yo"?" ¡Ganaste la Copa de Plata!":` Copa de Plata: ${tyNombre(cp)}.`;if(cp==="yo")S.pesos+=150000;}
  T.hist.unshift({f:T.fecha,yo:P.yo|0,pos:yo});T.hist=T.hist.slice(0,18);save();return msg;}
// campeón: el que más suma en el playoff, pero solo si ganó al menos una final en el torneo
function tyCampeon(T){const g=T.ganF||{},ord=L=>L.slice().sort((a,b)=>(T.po.pts[b]|0)-(T.po.pts[a]|0));
  const v=ord(T.po.vivos),lider=v[0];let id=v.find(x=>g[x]>0);
  if(!id)id=ord(T.po.todos).find(x=>g[x]>0);
  if(!id)return {id:lider,nota:""};
  return {id,nota:id!==lider?`${tyNombre(lider)} sumó más en el playoff pero no ganó ninguna final en el torneo.`:""};}

/* ---------- box: gomas, service y desgaste del motor ---------- */
const TY_GOMA_MAX=3,TY_GOMA_P=18000,TY_SERV_P=12000,TY_RECT_P=90000,TY_CHASIS_P=250000;
// las gomas pierden agarre con cada carrera; después de 3 no dan más
const tyGomaK=u=>[1,.965,.93,.9][Math.min(3,u|0)];
// el motor pierde potencia con el uso: hasta un 12% si nunca se rectifica
function tyMotorK(){const T=tyState();return 1-.12*Math.min(1,T.desg||0);}
const tyPct=x=>Math.round(x*100)+"%";
// panel del box entre carrera y carrera (no se puede tocar el motor por dentro ni el chasis)
function tyBox(J,cont,enGar){const T=tyState();
  const html=()=>{const u=J.gUso|0,venc=u>=TY_GOMA_MAX;
    return `<div class="copa tybox"><div class="t">Box · entre carreras</div>
      <div class="s">Plata: ${fmt(S.pesos)}</div>
      <p class="nota" style="margin:6px 0">Gomas: ${u} de ${TY_GOMA_MAX} carreras · agarre ${tyPct(tyGomaK(u))}${venc?" · <b style=\"color:var(--rojo)\">ya no aguantan otra carrera</b>":""}<br>
      Motor: ${tyPct(tyMotorK())} de potencia (${Math.round((168+T.up.motor*3)*tyMotorK())} HP). El motor no se rectifica durante la noche.</p>
      ${tyGarageOk()&&!enGar?`<p class="nota" style="margin:4px 0">Las gomas y el service se hacen adentro de tu box.</p>`:`<div class="row" style="flex-wrap:wrap;gap:6px">
        <button class="btn sm${venc?" oro":""}" data-b="gomas"${u===0?" disabled":""}>Cambiar gomas · ${fmt(TY_GOMA_P)}</button>
        <button class="btn sm" data-b="mejora"${T.up.gomas>=4?" disabled":""}>Mejorar cubiertas ${T.up.gomas}/4${T.up.gomas<4?" · "+fmt(45000*(T.up.gomas+1)):""}</button>
        <button class="btn sm" data-b="serv"${J.serv||T.desg<.01?" disabled":""}>${J.serv?"Service hecho":"Service · "+fmt(TY_SERV_P)}</button></div>`}
      ${tyGarageOk()&&!enGar?`<button class="btn oro sm" data-b="garage" style="margin-top:10px;width:100%">🔧 Ir al box${venc?" · ¡cambiá las gomas!":" · gomas y service"}</button>`:""}</div>`;};
  let box=el(html());
  const pinta=()=>{const n=el(html());box.replaceWith(n);wire(n);cont&&cont();};
  const pagar=p=>{if(S.pesos<p){toast("No te alcanza la plata");return false;}S.pesos-=p;return true;};
  const wire=b=>{b.querySelectorAll("[data-b]").forEach(x=>x.onclick=()=>{const k=x.dataset.b;
      if(k==="gomas"){if(S.pesos>=TY_GOMA_P){S.pesos-=TY_GOMA_P;J.gUso=0;toast("Gomas nuevas");if(enGar)enGar("gomas");}else if((J.gUso|0)>=TY_GOMA_MAX){J.gUso=1;toast("No te alcanzaba: un amigo te prestó unas recapadas");}else toast("No te alcanza la plata");}
      else if(k==="mejora"){const n=T.up.gomas,p=45000*(n+1);if(n<4&&pagar(p)){T.up.gomas=n+1;J.gUso=0;toast("Cubiertas mejores, y nuevas");if(enGar)enGar("gomas");}}
      else if(k==="serv"&&!J.serv&&pagar(TY_SERV_P)){J.serv=true;T.desg=Math.max(0,T.desg*.75);toast("Service hecho: bujías, filtro y carburación");if(enGar)enGar("serv");}
      else if(k==="garage"){tyGarage(J,()=>pinta());return;}
      save();pinta();});box=b;};
  wire(box);return ()=>box;}


/* ---------- el box en 3D: tu auto en el galpón, sobre caballetes, con el mecánico ---------- */
const tyGarageOk=()=>ready3D();
function tyGarage(J,onClose){const T=tyState();if(!TY3.mod[T.m]){toast("Llevando el auto al box…");tyModelo(T.m).then(()=>tyGarage(J,onClose),()=>toast("No se pudo cargar el auto"));return;}const E=tyEnvEst(),TH=T3.TH;
  const bx=tyBoxDe("yo",0),p0=tyPose(bx.s,bx.d),G=new TH.Group();G.position.set(p0.x,0,p0.z);G.rotation.y=p0.h+(bx.row===0?-Math.PI/2:Math.PI/2);E.sc.add(G); /* tu box en los boxes de la 3-4, mirando a la calle */
  const std=o=>new TH.MeshStandardMaterial(o);
  // piso de cemento con mancha de aceite, caballetes, gomas apiladas, banco de herramientas y lámpara
  const car=tyAutoObj({m:T.m,col:T.col,num:T.num,spon:S.apodo||""});car.position.y=.24;G.add(car);
  for(const [x,z] of [[1,.62],[1,-.62],[-1,.62],[-1,-.62]]){const c=new TH.Mesh(new TH.BoxGeometry(.18,.24,.18),std({color:0xc0392b,metalness:.4,roughness:.5}));c.position.set(x,.12,z);G.add(c);}
  const goma=()=>{const g=new TH.Mesh(new TH.TorusGeometry(.3,.13,10,20),std({color:0x161616,roughness:.95}));g.rotation.x=Math.PI/2;return g;};
  const pila=new TH.Group();for(let i=0;i<4;i++){const g=goma();g.position.y=.13+i*.27;pila.add(g);}pila.position.set(-1.7,0,1.15);G.add(pila);
  const nuevas=new TH.Group();for(let i=0;i<4;i++){const g=goma();g.material=std({color:0x0b0b0b,roughness:.6});g.position.y=.13+i*.27;nuevas.add(g);}nuevas.position.set(-1.7,0,-1.15);nuevas.visible=false;G.add(nuevas);
  const tabla=new TH.Mesh(new TH.BoxGeometry(.06,1.2,2.2),std({color:0x5d4037,roughness:.9}));tabla.position.set(-2.2,1.6,0);G.add(tabla);
  for(let i=0;i<6;i++){const h=new TH.Mesh(new TH.BoxGeometry(.04,.4+.1*(i%3),.06),std({color:0xbdc3c7,metalness:.8,roughness:.3}));h.position.set(-2.15,1.6,-.9+i*.36);G.add(h);}
  const lamp=new TH.PointLight(0xffe2b0,1.3,14,2);lamp.position.set(0,3.6,0);lamp.castShadow=ultra();G.add(lamp);
    let meca=null;tyPersona("piloto",1.74).then(()=>{if(!G.parent)return;meca=tyPilotoReal(TH,"t1");if(!meca)return;meca.traverse(q=>{if(q.isMesh&&q.material.onBeforeCompile){const c=new TH.Color(0x2b3a55);q.material.onBeforeCompile=(sh=>{sh.uniforms.uTint={value:c};sh.fragmentShader="uniform vec3 uTint;\n"+sh.fragmentShader.replace("#include <map_fragment>","#include <map_fragment>\n{vec3 c=diffuseColor.rgb;float l=max(c.r,max(c.g,c.b)),sat=l-min(c.r,min(c.g,c.b));float w=smoothstep(.5,.78,l)*(1.-smoothstep(.07,.2,sat));diffuseColor.rgb=mix(c,uTint*l*1.1,w);}");});q.material.needsUpdate=true;}});
    meca.position.set(1.9,0,-1.0);meca.rotation.y=-1.2;G.add(meca);}).catch(()=>{});
  const cam=new TH.PerspectiveCamera(50,1,.1,600);
  const ov=el(`<div id="tyGar"><canvas id="tyGarC"></canvas><div class="tgtop"><b>🔧 Box · ${esc(TY_HUMAN[T.m]||"")} #${T.num}</b><span id="tgMsg">Revisá las gomas y el motor antes de la próxima carrera</span></div><div class="tgpanel" id="tgPanel"></div><button class="btn oro tgvolver" id="tgVolver">Volver</button></div>`);
  document.body.append(ov);let fin=false,t0=performance.now(),anim=null;
  const accion=k=>{anim={k,t:performance.now()};$("#tgMsg").textContent=k==="gomas"?"Cambiando las gomas… ¡pistola de impacto!":"Manos a la obra: cambiando los repuestos";tySonido("roce",.35);
    if(k==="gomas"){nuevas.visible=true;setTimeout(()=>{if(!fin){tySonido("roce",.35);$("#tgMsg").textContent="Gomas nuevas puestas. Listo para largar";}},1600);}else setTimeout(()=>{if(!fin)$("#tgMsg").textContent="Service hecho: el motor respira mejor";},1600);};
  const panel=()=>{const p=$("#tgPanel");p.innerHTML="";const bx=tyBox(J,()=>{},accion);p.append(bx());};panel();
  const cerrar=()=>{if(fin)return;fin=true;E.sc.remove(G);ov.remove();onClose&&onClose();};$("#tgVolver").onclick=cerrar;
  const loop=now=>{if(fin)return;const cv=$("#tyGarC"),dpr=prUltra(Math.min(2,devicePixelRatio||1)),w=Math.round(cv.clientWidth*dpr),h=Math.round(cv.clientHeight*dpr);if(!w||!h){requestAnimationFrame(loop);return;}
    if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}const tt=(now-t0)/1000,ang=Math.sin(tt*.22)*.75,r=w<h?6.4:5.2;
    const lp=new TH.Vector3(Math.cos(ang)*r,2.3+Math.sin(tt*.3)*.2,Math.sin(ang)*r);G.localToWorld(lp);cam.position.copy(lp);const tg=new TH.Vector3(0,.7,0);G.localToWorld(tg);cam.lookAt(tg);cam.aspect=w/h;cam.fov=w<h?62:46;cam.updateProjectionMatrix();
    if(anim){const k=(now-anim.t)/1000;car.position.y=.24+(anim.k==="gomas"&&k<1.6?Math.abs(Math.sin(k*14))*.015:0);if(meca)meca.rotation.y=-1.2+Math.sin(k*6)*.3*(k<1.6?1:0);if(k>1.8)anim=null;}
    const ren=T3.ren;if(ren.domElement.width!==w||ren.domElement.height!==h)ren.setSize(w,h,false);ren.setClearColor(0x05070d,1);ren.render(E.sc,cam);const ctx=cv.getContext("2d");ctx.drawImage(ren.domElement,0,0,w,h);cineFX(ctx,w,h,"noche");
    requestAnimationFrame(loop);};requestAnimationFrame(loop);}

/* ---------- la carrera ---------- */
let TYR=null;
const TYH=1/120; // paso de física del midget
function tyAuto(id,i,grid){const T=tyState();let p=id==="yo"?null:TY_P[id];if(!p&&TYV&&TYV.info[id]){const f=TYV.info[id];p={n:f.apodo,num:f.num,m:TY_M.includes(f.m)?f.m:"ma",col:f.col||"#ccc",spon:f.apodo,sk:.8,hp:168,kg:455};}
  const J=S.tayaJ,uso=J?J.gUso|0:0;
  const PZ=id==="yo"?tyPz(T).est:null,hp=id==="yo"?(168+T.up.motor*3)*tyMotorK():p.hp,kg=id==="yo"?455:p.kg,mu=1.5*(id==="yo"?(1+T.up.gomas*.012)*tyGomaK(uso)*(.82+.18*PZ.amort/100)*(J&&J.blandas?1.045:1):1)*(1+(p?(p.sk-.75)*.05:0));
  return {id,yo:id==="yo",n:id==="yo"?tyNombre(id):p.n,num:id==="yo"?((TYV&&TYV.go&&TYV.miNum)||tyNum(id)):p.num,m:id==="yo"?T.m:p.m,col:id==="yo"?T.col:p.col,spon:id==="yo"?(S.apodo||""):p.spon,
    hp,kg:kg+70,mu,sk:id==="yo"?1:p.sk,s:0,d:0,vl:0,v:0,th:0,sa:0,pitch:0,lap:0,dist:0,fin:null,out:null,dmg:0,
    dT:0,ai:{err:0,errT:0,pase:0,linea:-2.2+Math.random()*1.4},grid:i,g:null,lastS:0,tren:PZ?PZ.tren/100:1,jaula:PZ?PZ.jaula/100:1};}
function tyLargar(c,J){audioInit();tyBanderaBlanca(false);narStopF();narLoadF();
  const ids=c.ids.slice();
  // grilla: en las series por sorteo; después por cómo vienen clasificados (el orden de la lista)
  const cars=ids.map((id,i)=>tyAuto(id,i));if(c.vivo)tyVivoMarcar(cars,c.vivo);
  TYR={c,J,cars,P:cars.find(e=>e.yo),t:0,acc:0,green:false,phase:0,lightT:0,laps:c.laps,done:false,pos:[],posAt:0,roja:null,relargadas:0,gas:false,steer:0,
    cam:S.tyCam||"lado",msgT:0,loading:true,last:performance.now(),evento:[],choques:0,t0:performance.now()};
  tyGrilla(TYR,cars,true);
  tyUI(true);tyMsg(c.nom+": "+c.laps+" vueltas. Acelerá en verde y manejá el derrape con el acelerador");
  tyAudioStart();
  const go=()=>{if(!TYR)return;TYR.loading=false;tySetup3D(TYR);TYR.last=performance.now();
    // la chica anuncia la carrera; Fefón se presenta en la primera de la noche
    if(c.vivo){tyMsg(c.nom+": "+c.laps+" vueltas, "+c.ids.length+" autos. Largan juntos en todos los celulares","var(--oro)");const ahora=()=>NET.now?NET.now():Date.now();setTimeout(()=>{if(TYR&&TYR.c===c)tySemaforo();},Math.max(300,c.vivo.t0-3600-ahora()));return;}
    const prim=!J.yaPresento;J.yaPresento=true;
    tyBoxesSalida(TYR,()=>tyAnuncio(c,()=>{if(!TYR)return;narraF(prim?"chiquito":"previa",{});const t0=performance.now(),esp=()=>{if(!TYR)return;if((narLibreF()&&performance.now()-t0>900)||performance.now()-t0>6000)tySemaforo();else setTimeout(esp,200);};setTimeout(esp,600);}));};
  Promise.all([init3D(),...[...new Set(cars.map(e=>e.m))].map(m=>tyModelo(m))]).then(go,go);
  requestAnimationFrame(tyLoop);}
function tySemaforo(){if(!TYR)return;TYR.lightT=performance.now();TYR.phase=0;TYR.esperaLuz=true;}
// acomoda los autos de a dos detrás de la línea (largada parada)
// después de la bandera roja la grúa saca los autos chocados y se larga de nuevo
function tyRelargar(R){R.roja=null;R.cars.forEach(e=>{if(e.out&&!e.gone){e.gone=true;e.v=0;e.d=-TY.W/2-5;}});tySuplentes(R);
  const pos=tyPosiciones(R),orden=[...pos.filter(e=>!e.pen&&!e.supNuevo),...pos.filter(e=>e.supNuevo&&!e.pen),...pos.filter(e=>e.pen)];
  tyGrilla(R,orden,true);R.cars.forEach(e=>{e.pen=false;e.supNuevo=false;});}
// prefinal y final: por cada auto que abandona entra el suplente que sigue en tiempo de la instancia anterior, desde el fondo
function tySuplentes(R){const L=R.c.sup;if(!L||!L.length)return;
  for(const e of R.cars){if(!e.out||e.supDado)continue;e.supDado=true;let id;while(L.length&&(id=L.shift())&&(id==="yo"||R.cars.some(o=>o.id===id)))id=null;if(!id)continue;
    const n=tyAuto(id,R.cars.length);n.sup=true;n.supNuevo=true;R.cars.push(n);
    setTimeout(()=>{if(TYR===R)tyMsg(`Entra el suplente #${n.num} ${n.n}, larga desde el fondo`,"var(--celeste)");},2600);}}
function tyGrilla(R,orden,parada){const vivos=orden.filter(e=>!e.out&&e.fin===null);
  const base=R.green?Math.max(...vivos.map(e=>e.dist)):0;
  vivos.forEach((e,i)=>{const row=i>>2;e.dist=base-6-row*7.5;e.s=e.dist;e.d=TY_FILA[i%4];e.vl=0;e.v=parada?0:0;e.th=0;e.sa=0;e.dT=e.d;});
  R.green=false;}
function tyLoop(now){const R=TYR;if(!R)return;if(R.pausa){R.last=now;R.dt=0;tyDraw(R);requestAnimationFrame(tyLoop);return;}const dt=Math.max(0,Math.min(.1,(now-R.last)/1000));R.last=Math.max(R.last,now);R.dt=dt;
  if(R.anim)tyAnimPaso(R,now);
  else if(!R.loading){
    // semáforo: rojo, amarillo, verde
    if(R.esperaLuz){const el2=(now-R.lightT)/1000,ph=el2<1?0:el2<2?1:el2<3?2:el2<3.6?3:4;
      while(R.phase<ph){R.phase++;pitido(R.phase<4?1320:1760,R.phase<4?.14:.62);
        if(R.phase===4){R.esperaLuz=false;R.green=true;R.tGreen=R.t;tyMsg("¡VERDE!","var(--verde)");narraF(R.relargadas?"relargada":"largada",{});}}}
    if(R.roja){R.roja.t-=dt;if(R.roja.t<=0){tyRelargar(R);R.relargadas++;tySemaforo();tyMsg("Relargada: misma posición, de a dos","var(--celeste)");}}
    else{R.acc+=dt;let g=0;while(R.acc>=TYH&&g++<40){R.acc-=TYH;tyPaso(R);}}
    tyRelato(R,now);
    if(R.done&&!R.cerrando){R.cerrando=now;}
    if(R.c.vivo){tyVivoTick(R,now);if(R.cerrando&&!R.cerrado&&now-R.cerrando>2600&&(R.cars.every(e=>e.out||e.fin!==null)||now-R.cerrando>60000)){R.cerrado=true;setTimeout(()=>tyVivoFin(R),400);}}
    else if(R.c.entreno){tyEntrenoTick(R);if(R.done&&!R.cerrado){R.cerrado=true;setTimeout(()=>tyFinEntreno(R),300);}}
    else if(R.cerrando&&!R.cerrado&&now-R.cerrando>2600){R.cerrado=true;tyCompletar(R);tyBoxesEntrada(R,()=>setTimeout(()=>tyFinCarrera(R),300));}
  }
  tyDraw(R);tyAudioSet(R);
  if(TYR===R)requestAnimationFrame(tyLoop);}
function tyPosiciones(R){return R.cars.slice().sort((a,b)=>{
  const fa=a.fin!==null,fb=b.fin!==null;if(fa&&fb)return a.fin-b.fin;if(fa)return -1;if(fb)return 1;
  if(!!a.out!==!!b.out)return a.out?1:-1;return b.dist-a.dist;});}
// un paso de física para todos los autos
function tyPaso(R){const dt=TYH;R.t+=dt;const g=9.81;
  const L=TY.LAP;
  for(const e of R.cars){
    if(e.remote){tyVivoRemoto(R,e);continue;}
    if(e.out){if(e.gone)continue;e.v=Math.max(0,e.v-9*dt);e.dist+=e.v*dt;e.s=e.dist;e.sa+=e.spinW?e.spinW*dt:0;if(e.spinW)e.spinW*=1-1.5*dt;continue;}
    if(e.fin!==null){e.v=Math.max(9,e.v-3*dt);e.th=0;}
    else if(!R.green){e.v=0;e.th=R.esperaLuz&&R.phase>=1?(e.yo?(R.gas?1:0):.6):0;e.pitch=0;continue;}
    const c=tyCurva(e.s),Rc=TY.R+e.d;
    // acelerador: el tuyo sube progresivo (dosificás manteniendo y soltando); la máquina dosifica sola
    let thT;if(e.yo&&e.fin===null&&!window.__tyBot)thT=R.gas?1:(R.padGas||0);else thT=tyIA(R,e,c);
    e.th+=(thT-e.th)*Math.min(1,dt*(thT>e.th?5.5:12));
    // fuerzas: tracción directa, sin caja → la potencia se entrega toda junta
    const m=e.kg,P=e.hp*745.7*.82,v=Math.max(2.5,e.v);
    const muL=e.mu*(e.d<TY.IN?.55:1)*(e.gomaR?.66:1);
    let aDrive=Math.min(P/(m*v)*(e.gomaR?.85:1),muL*g*.95)*e.th;
    // se para de manos: con mucha aceleración levanta la trompa y pierde un poco de empuje
    const lift=Math.max(0,(aDrive-5.2)/4);e.pitch+=(Math.min(.32,lift*.3)-e.pitch)*Math.min(1,dt*6);if(e.pitch>.22)aDrive*=.9;
    const aRes=(1.5*e.v*e.v+.02*m*g)/m+(e.th<.05?1.6:0);
    const aLat=c?e.v*e.v/Math.max(10,Rc):0,cap=muL*g*(1+tyBank(e.s)*.12);
    const uso=Math.sqrt(aLat*aLat+(aDrive*.85)**2)/cap,exc=Math.max(0,uso-1);
    e.v=Math.max(0,e.v+(aDrive-aRes-exc*7)*dt);
    // derrape: el sobrante de potencia en la curva saca la cola y empuja el auto hacia afuera
    let u=e.yo&&e.fin===null?tyVolanteYo(R,e,c):tyVolanteIA(R,e);
    const libre=Math.max(0,1-uso);
    const aCtrl=u*Math.min(6,(libre*.9+.25)*cap*.55)*(.55+.45*(e.tren??1));
    e.vl+=(aCtrl+exc*15*(c?1:0))*dt;e.vl*=1-2.2*dt;
    // la cola sale por exceso de potencia (sobreviraje); si entrás pasado, el auto se abre (sin trompo)
    const excLat=Math.max(0,aLat/cap-1),excPow=e.th>.35?exc*e.th:0,asist=e.yo&&(S.tyVol||"auto")==="auto"?.7:1;
    const saT=c?(.12+excLat*.35+excPow*2.1*asist+(u<0&&exc>0?-u*exc*.8:0)-(u>0?u*.45:0)):0;
    e.sa+=(Math.max(-.2,saT)-e.sa)*Math.min(1,dt*(saT>e.sa?2.6:4));
    if(e.sa>1.12*(.86+.14*(e.jaula??1))&&!e.out&&!e.pen){tyChoque(R,e,"trompo");continue;}
    if(e.yo&&e.sa>.72&&R.t-(R.avisoSa||-9)>2.5){R.avisoSa=R.t;tyMsg("¡Se te va la cola! Levantá el pie o contravolanteá ▶","#ff8f9c");vib(40);}
    if(!c&&e.sa>.15){e.vl-=e.v*Math.sin(e.sa-.1)*.9*dt;e.v=Math.max(0,e.v-(e.sa-.15)*4*dt);} /* tijera: sale de la curva cruzado → frena un poco y se mete para adentro */
    e.d+=e.vl*dt;
    // paredón: el auto ocupa más de costado cuando va cruzado, y lo primero que pega es la cola
    const ext=.85*Math.cos(e.sa)+1.45*Math.abs(Math.sin(e.sa)),dW=TY.W/2-ext;
    if(e.d>dW&&R.c.entreno){e.d=dW;e.vl=-Math.abs(e.vl)*.3;e.v*=1-.6*dt;if(e.yo&&R.t-(R.avisoRoce||-9)>1.5){R.avisoRoce=R.t;tyMsg("¡Contra las cubiertas! Abrite para adentro ◀","#ffb4bd");}}
    else if(e.d>dW){const imp=Math.max(0,e.vl),cola=e.sa>.22;e.d=dW;e.vl=-Math.abs(e.vl)*.25;
      if(imp>1.35&&!cola){tyChoque(R,e,"pared",imp);continue;}
      if(cola&&!e.gomaR){e.gomaR=true;if(e.yo&&!R.c.vivo)pzGolpe("goma",0);e.v*=.8;e.sa*=.6;e.dmg+=25;tySonido("pared",.55);if(e.yo){vib([60,40,90]);tyMsg("¡Tocaste el paredón con la cola! Rompiste la goma trasera","#ff8f9c");R.J.gomaRota=true;}
        if(R.t-(R.narChoqueT||-9)>3){R.narChoqueT=R.t;narraF("pared",{a:e});}}
      else if(imp>.25){e.v*=1-imp*.06;e.dmg+=imp*14;tySonido("roce",.4);if(e.yo&&!R.c.vivo)pzGolpe("roce",imp);if(e.yo){vib(30);tyMsg(e.gomaR?"¡Seguís pegándole al paredón con la goma rota!":"¡Rozaste el paredón!","#ffb4bd");}}
      else{e.v*=1-.5*dt;e.dmg+=3*dt;if(e.yo&&R.t-(R.avisoRoce||-9)>1.5){R.avisoRoce=R.t;tySonido("roce",.3);tyMsg("¡Vas raspando el paredón! Abrite para adentro ◀","#ffb4bd");}}
      if(e.dmg>=100){tyChoque(R,e,"pared",imp);continue;}}
    if(e.d<TY.IN-1.6){e.d=TY.IN-1.6;e.vl=Math.max(0,e.vl);}
    // avance: por adentro se recorre menos
    const k=c?TY.R/Math.max(10,Rc):1,ds=e.v*dt*k;e.s+=ds;e.dist+=ds;
    if(e.fin===null&&R.green&&e.dist>=R.laps*L){e.fin=R.t-R.tGreen;if(e.yo){R.done=true;}}
  }
  // contacto entre autos
  for(let i=0;i<R.cars.length;i++)for(let j=i+1;j<R.cars.length;j++){const a=R.cars[i],b=R.cars[j];if(a.out&&b.out||a.gone||b.gone)continue;
    let ds=b.dist-a.dist;if(Math.abs(ds)>4.2)continue;const dd=b.d-a.d;if(Math.abs(dd)>1.62)continue;
    const [f,r]=ds>0?[b,a]:[a,b];const gap=Math.abs(ds);
    if(gap<2.35&&!a.out&&!b.out&&R.green&&a.fin===null&&b.fin===null){ // rueda con rueda: los midgets tienen las ruedas afuera, se enganchan y vuelan
      const cierre=Math.abs(a.vl-b.vl);if(a.remote&&b.remote)continue;if(cierre>1.1||Math.abs(dd)<.95){if(!a.remote)tyChoque(R,a,"rueda",cierre,b);if(!b.remote)tyChoque(R,b,"rueda",cierre,a);continue;}
      // roce de costado: se separan, pierden velocidad y se dañan un poco
      const s2=Math.sign(dd)||1;a.vl=Math.min(a.vl,0)-s2*.5;b.vl=Math.max(b.vl,0)+s2*.5;a.v*=.997;b.v*=.997;a.dmg+=2*TYH*60;b.dmg+=2*TYH*60;
      if(!R.roceT||R.t-R.roceT>.6){R.roceT=R.t;tySonido("toque",.5);if(a.yo||b.yo){vib(25);tyMsg("¡Cuidado! Rueda con rueda: si se enganchan, vuelan","#ffb4bd");}}continue;}
    // de atrás: el de atrás no puede atravesar al de adelante
    const need=3.05;if(gap<need){const rel=r.v-f.v;if(f.out&&!r.out&&rel>3){tyChoque(R,r,"golpe",rel,f);continue;}
      r.dist=f.dist-need;r.s=r.dist;if(r.v>f.v){if(rel>2.5&&R.green){r.dmg+=rel*3;f.v+=rel*.3;tySonido("toque",.5);if(r.yo||f.yo)vib(20);}r.v=f.v;}}}
  // con todos los autos que siguen en carrera parados o cruzados, bandera roja
}
// la máquina: dosifica el acelerador para ir al límite (con errores según la habilidad) y elige la línea
function tyIA(R,e,c){const g=9.81,cap=e.mu*g*(1+tyBank(e.s)*.12),look=tyCurva(e.s+Math.max(8,e.v*1.2));
  if(e.ai.errT>0)e.ai.errT-=TYH;else if(Math.random()<TYH*.25*(1.15-e.sk)){e.ai.err=(Math.random()-.3)*.85*(1.15-e.sk);e.ai.errT=.6+Math.random();}
  const Rc=TY.R+e.d;if(c||look){const vC=Math.sqrt(cap*.93*Math.max(10,Rc)),margen=(e.v-vC)/vC;
    let th=margen>.04?0:margen>-.02?.42:1;th+=e.ai.err;if(R.c.k==="final")th+=.04;return Math.max(0,Math.min(1,th));}
  return 1;}
function tyLibre(R,e,dTgt){for(const o of R.cars){if(o===e||o.gone)continue;const ds=o.dist-e.dist;if(Math.abs(ds)>4.4)continue;
    const lo=Math.min(e.d,dTgt)-1.7,hi=Math.max(e.d,dTgt)+1.7;if(o.d>lo&&o.d<hi&&Math.sign(o.d-e.d)===Math.sign(dTgt-e.d))return false;}return true;}
function tyVolanteIA(R,e){
  // busca pasar: si viene más rápido que el de adelante, se abre por afuera o se tira por adentro
  if(e.ai.paseT>0)e.ai.paseT-=TYH;else{e.ai.paseT=.5;const f=R.cars.filter(o=>o!==e&&!o.out&&o.dist>e.dist&&o.dist-e.dist<9&&Math.abs(o.d-e.d)<2).sort((a,b)=>a.dist-b.dist)[0];
    if(f&&e.v>f.v*.99){const op=[f.d-2.4,f.d+2.6].filter(x=>x>TY.IN&&x<TY.WALL-.6);const t=op.sort((a,b)=>Math.abs(a-e.d)-Math.abs(b-e.d)).find(x=>tyLibre(R,e,x));if(t!==undefined)e.dT=t;}
    else if(!f){const t=e.ai.linea;if(tyLibre(R,e,t))e.dT=t;}}
  if(!tyLibre(R,e,e.dT))e.dT=e.d;
  const lado=R.cars.find(o=>o!==e&&!o.gone&&!o.out&&Math.abs(o.dist-e.dist)<3.4&&Math.abs(o.d-e.d)<2.3);
  if(lado){const sg=Math.sign(lado.d-e.d)||1;return Math.max(-1,Math.min(1,-sg*.8-e.vl*.9));}
  return Math.max(-1,Math.min(1,(e.dT-e.d)*.7-e.vl*.9));}
// tu volante: automático (sigue la línea elegida con ◀ ▶ y esquiva), o manual (◀ ▶ doblan directo: ▶ en la curva es contravolante)
function tyVolanteYo(R,e,c){const man=(S.tyVol||"auto")==="manual";
  if(man){if(R.steer)return R.steer;return Math.max(-1,Math.min(1,-e.vl*.6));}
  if(R.steer){e.dT=Math.max(TY.IN+.3,Math.min(TY.WALL-.9,e.d+R.steer*2.2));e.dLin=e.dT;}
  else{const lin=Math.min(e.dLin??(TY.IN+2.2),TY.WALL-1.2);if(tyLibre(R,e,lin))e.dT+=(lin-e.dT)*Math.min(1,TYH*1.2);}
  if(!tyLibre(R,e,e.dT))e.dT=e.d;
  const lado=R.cars.find(o=>o!==e&&!o.gone&&!o.out&&Math.abs(o.dist-e.dist)<3.4&&Math.abs(o.d-e.d)<2.1);
  if(lado&&!R.steer){const sg=Math.sign(lado.d-e.d)||1;return Math.max(-1,Math.min(1,-sg*.7-e.vl*.9));}
  return Math.max(-1,Math.min(1,(e.dT-e.d)*.75-e.vl*.9));}
// choques: rueda con rueda, paredón, trompo o golpe de atrás → el auto queda afuera y se para la carrera
function tyChoque(R,e,tipo,imp,otro){if(e.out)return;if(e.yo&&!R.c.entreno&&!R.c.vivo)pzGolpe((tipo==="rueda"||(tipo==="pared"&&imp>2.3))?"vuelco":tipo,imp||0);if(R.c.entreno){e.v*=.25;e.sa=0;e.vl=0;e.th=0;if(e.yo){tyMsg(tipo==="trompo"?"¡Trompo! Levantá el pie en la curva":"¡Golpe! Seguí practicando","#ff8f9c");vib(80);}R.entTrompos=(R.entTrompos|0)+1;return;}
  if(R.c.sufi&&e.yo)R.sufFalla=tipo;
  // trompo (o quedarse parado): no descalifica, relarga último en la fila. Solo la rotura o el vuelco te dejan afuera
  if(tipo==="trompo"&&!R.c.sufi&&!R.c.vivo){e.pen=true;e.v*=.35;e.vl=0;e.th=0;tySonido("toque",.7);R.choques++;
    if(e.yo){vib([60,40,60]);tyMsg("¡Trompo! No quedás afuera: relargás último en la fila","#ffb4bd");}
    if(!R.narChoqueT||R.t-R.narChoqueT>3){R.narChoqueT=R.t;narraF("trompo",{a:e});}
    if(R.green&&!R.done&&R.cars.filter(x=>!x.out&&x.fin===null).length>1){R.green=false;R.roja={t:5};R.cars.forEach(x=>{if(!x.out){x.vl=0;}});
      setTimeout(()=>{if(TYR===R){tyMsg("¡BANDERA ROJA! "+(e.yo?"Relargás último":e.n+" relarga último"),"#ff8f9c");narraF("roja",{});}},1500);}
    else{e.pen=false;e.sa=0;}
    return;}
  e.out=tipo;e.outT=R.t;e.dmg=100;e.spinW=(tipo==="rueda"?7:tipo==="trompo"?5:3)*(Math.random()<.5?-1:1);
  e.vuelco=tipo==="rueda"||(tipo==="pared"&&imp>2.3);e.vl=0;e.v*=tipo==="pared"?.25:.55;
  tySonido(e.vuelco?"vuelco":tipo==="pared"?"pared":"toque",1);R.choques++;
  if(e.yo){vib([90,60,140]);tyMsg(tipo==="rueda"?"¡Se tocaron rueda con rueda! Volcaste: quedás afuera de esta carrera":tipo==="pared"?"¡Al paredón! Rotura: quedás afuera de esta carrera":tipo==="trompo"?"¡Trompo! Te pasaste de acelerador en la curva":"¡Chocaste!","#ff8f9c");R.J.danio=true;}
  if(!R.narChoqueT||R.t-R.narChoqueT>3){R.narChoqueT=R.t;narraF(tipo==="rueda"?"rueda":tipo==="pared"?"pared":tipo==="trompo"?"trompo":"choque",{a:e,b:otro});}
  // bandera roja: se para todo y se relarga
  if(!R.c.vivo&&R.green&&!R.done&&R.cars.filter(x=>!x.out&&x.fin===null).length>1){R.green=false;R.roja={t:5};R.cars.forEach(x=>{if(!x.out){x.vl=0;}});
    setTimeout(()=>{if(TYR===R){tyMsg("¡BANDERA ROJA! Se para la carrera y se relarga","#ff8f9c");narraF("roja",{});}},1500);}
  if(e.yo){R.yoFuera=true;setTimeout(()=>{if(TYR===R&&!R.done){R.done=true;}},3500);}}
// cuando terminás (o quedás afuera) se completa el resto de la carrera a toda velocidad
function tyCompletar(R){if(!R.green){tyRelargar(R);R.green=true;R.tGreen=R.tGreen??R.t;R.esperaLuz=false;}
  let k=0;while(R.cars.some(e=>!e.out&&e.fin===null)&&k++<120*400){tyPaso(R);if(!R.green){tyRelargar(R);R.green=true;}}
  R.cars.forEach(e=>{if(!e.out&&e.fin===null)e.fin=R.t-R.tGreen+30;});}
function tyFinCarrera(R){if(TYR!==R)return;const pos=tyPosiciones(R),J=R.J,c=R.c;if(c.sufi){tySufFin(R);return;}
  const res=pos.map(e=>({id:e.id,dnf:!!e.out,t:e.fin,sup:!!e.sup}));tyGuardar(J,c,res);
  const yo=res.findIndex(x=>x.id==="yo");
  {pzFinCarrera(R);const T=tyState();J.gUso=J.gomaRota?TY_GOMA_MAX:(J.gUso|0)+1;J.gomaRota=false;J.serv=false;J.carreras=(J.carreras|0)+1;T.desg=Math.min(1,(T.desg||0)+c.laps*.0045);save();}
  if(pos[0])narraF("bandera",{a:pos[0]});
  TYR=null;tyBanderaBlanca(false);tyUI(false);tyAudioStop();
  const tabla=pos.map((e,i)=>`<tr${e.yo?' class="yo"':''}><td>${i+1}</td><td>#${e.num} ${esc(e.n)}</td><td>${e.out?(e.out==="rueda"?"Toque":e.out==="pared"?"Paredón":e.out==="trompo"?"Trompo":"Choque"):e.fin!=null?e.fin.toFixed(2)+" s":"—"}</td></tr>`).join("");
  const sig=tySiguiente(J);J.fuera=!sig;const pasa=tyPasaTxt(J,c);
  // primero las placas de las otras carreras de la etapa (y las que se corrieron sin vos); después tu resultado
  const placas=tyPlacasPend(J);
  tyPlacas(placas,()=>tyFinResultado(R,yo,pos,pasa,sig));}
function tyFinResultado(R,yo,pos,pasa,sig){const J=R.J,c=R.c;
  const tabla=pos.map((e,i)=>`<tr${e.yo?' class="yo"':''}><td>${i+1}</td><td>#${e.num} ${esc(e.n)}</td><td>${e.out?(e.out==="rueda"?"Toque":e.out==="pared"?"Paredón":e.out==="trompo"?"Trompo":"Choque"):e.fin!=null?e.fin.toFixed(2)+" s":"—"}</td></tr>`).join("");
  modal(`<h3 class="gan" style="color:${yo===0?"var(--oro)":"var(--crema)"}">${esc(c.nom)}: ${R.yoFuera?"¡Afuera!":(yo+1)+"º"}</h3>
    <p>${R.yoFuera?(R.P.out==="abandono"?"Abandonaste esta carrera. ":"Rotura o vuelco: quedaste descalificado de esta carrera. "):""}${esc(pasa)}</p>
    <table class="ovtab"><tr><th>Pos</th><th>Piloto</th><th>Tiempo</th></tr>${tabla}</table><div id="tyBoxW"></div><div class="opts" id="tyOpts"></div>`,"resplaca");
  const o=$("#tyOpts");
  if(sig&&!J.fuera){const b=el(`<button class="btn oro">Largar ${esc(sig.nom)}</button>`);
    const chk=()=>{const v=pzPuedeLargar(J);b.disabled=!!v;b.textContent=v||"Largar "+sig.nom;};
    const bx=tyBox(J,chk);$("#tyBoxW").append(bx());chk();
    b.onclick=()=>{if(pzPuedeLargar(J))return;closeModal();tyLargar(sig,J);};o.append(b);
    const ab=el(`<button class="btn sec">Abandonar la noche e ir al taller</button>`);ab.onclick=()=>tyRetiro(J);o.append(ab);}
  else{const b=el(`<button class="btn oro">${J.res.final?"Ver los resultados de la noche":"Terminar la noche"}</button>`);b.onclick=()=>{closeModal();tyTerminarNoche(J);};o.append(b);}}
// abandonar: la noche sigue sin vos y el auto va al taller
function tyRetiro(J){modal(`<h3 class="gan">¿Abandonar la noche?</h3><p>No corrés más esta fecha: te quedan los puntos que ya sumaste. El auto va al taller para repararlo antes de la próxima.</p><div class="opts"><button class="btn oro" id="rtSi">Abandonar e ir al taller</button><button class="btn sec" id="rtNo">Seguir en la noche</button></div>`,"resplaca");
  $("#rtNo").onclick=()=>{closeModal();tyIrFecha();};$("#rtSi").onclick=()=>{J.retiro=true;J.alTaller=true;closeModal();tyTerminarNoche(J);};}
function tyTerminarNoche(J){const pF=Promise.resolve(); /* sin podio: de las placas se va directo a los resultados */while(tySiguiente(J)){const c=tySiguiente(J);tyGuardar(J,c,tySimular(c.ids,c.laps,c.sup));}
  const msg=tyCerrarNoche(J);S.tayaJ=null;save();
  const fin=J.res.final||[];const placas=tyPlacasPend(J);
  tyUI(false);pF.then(()=>new Promise(r=>tyPlacas(placas,r))).then(()=>((cb)=>cb())(()=>{
    const filas=fin.map((x,i)=>`<tr${x.id==="yo"?' class="yo"':''}><td>${i+1}</td><td>#${tyNum(x.id)} ${esc(tyNombre(x.id))}</td><td>${x.dnf?"Abandono":TY_PTS_FINAL[i]+" pts"}</td></tr>`).join("");
    modal(`<h3 class="gan">Fecha ${J.fecha} terminada</h3><p>${esc(msg)}</p><div class="sec-t">Gran Final</div><table class="ovtab"><tr><th>Pos</th><th>Piloto</th><th>Pts</th></tr>${filas}</table><div class="opts"><button class="btn oro" id="tyOk">${J.alTaller?"Ir al taller":"Volver"}</button></div>`,"resplaca");
    $("#tyOk").onclick=()=>{closeModal();if(J.alTaller)vTaller();else render();};}));}

/* ---------- interfaz de carrera ---------- */
function tyMsg(t,col){const m=$("#tyMsgT");if(!m)return;m.textContent=t;m.style.color=col||"var(--crema)";if(TYR)TYR.msgT=2.4;}
function tyUI(on){let u=$("#tyRace");
  if(!on){if(u)u.hidden=true;document.body.classList.remove("tyrun");return;}
  if(!u){u=el(`<div id="tyRace"><canvas id="tyScene"></canvas>
    <div class="tytop"><button id="tyQuit">✕</button><div class="typos"><b id="tyP">–</b><span id="tyL"></span></div></div>
    <div class="tymsg" id="tyMsgT"></div>
    <div class="tyside"><button id="tyCam">Cámara</button><button id="tyVol"></button></div>
    <div class="tyhud"><div class="tyspd" id="tySpd">0<small>km/h</small></div><div class="tybar"><span>Acelerador</span><i id="tyTh"></i></div><div class="tybar"><span>Derrape</span><i id="tySa"></i></div></div>
    <div class="tyctrl"><button id="tyIzq" aria-label="Doblar adentro">◀</button><button id="tyGas">ACELERAR<small>mantené y dosificá</small></button><button id="tyDer" aria-label="Contravolante / afuera">▶</button></div>
    <div class="kb" data-modo="taya">${kbTxt("taya")}</div></div>`);
    document.body.append(u);
    const gas=$("#tyGas"),on2=e=>{e.preventDefault();audioInit();if(TYR){TYR.gas=true;gas.classList.add("on");}},off=e=>{e&&e.preventDefault();if(TYR){TYR.gas=false;}gas.classList.remove("on");};
    gas.addEventListener("pointerdown",on2);["pointerup","pointercancel","pointerleave"].forEach(ev=>gas.addEventListener(ev,off));
    for(const [id,v] of [["tyIzq",-1],["tyDer",1]]){const b=$("#"+id);b.addEventListener("pointerdown",e=>{e.preventDefault();if(TYR)TYR.steer=v;b.classList.add("on");});
      ["pointerup","pointercancel","pointerleave"].forEach(ev=>b.addEventListener(ev,e=>{if(TYR&&TYR.steer===v)TYR.steer=0;b.classList.remove("on");}));}
    $("#tyCam").onclick=()=>{const CS=["atras","cabina","lado","arriba"];S.tyCam=CS[(CS.indexOf(S.tyCam||"atras")+1)%CS.length];if(TYR)TYR.cam=S.tyCam;save();tyCamBtn();};
    $("#tyVol").onclick=()=>{S.tyVol=(S.tyVol||"auto")==="auto"?"manual":"auto";save();tyVolBtn();toast(S.tyVol==="auto"?"Volante automático: sigue la línea y esquiva. ◀ ▶ cambian la línea":"Volante manual: ◀ dobla adentro, ▶ contravolante");};
    $("#tyQuit").onclick=()=>{if(!TYR||TYR.done)return;const R=TYR;R.P.out="abandono";R.yoFuera=true;R.done=true;toast("Abandonaste la carrera");};
    u.addEventListener("contextmenu",e=>e.preventDefault());}
  u.hidden=false;document.body.classList.add("tyrun");tyCamBtn();tyVolBtn();$("#tyGas").classList.remove("on");}
function tyCamBtn(){const b=$("#tyCam");if(b)b.innerHTML="Cámara<br>"+({lado:"de costado",atras:"de atrás",arriba:"de arriba",cabina:"de adentro"}[S.tyCam||"atras"]);}
function tyVolBtn(){const b=$("#tyVol");if(b)b.innerHTML="Volante<br>"+((S.tyVol||"auto")==="auto"?"automático":"manual");}
window.addEventListener("keydown",e=>{if(!TYR||!$("#modal").hidden)return;const c=e.code;let u=true;if(e.repeat){if(tk("gas",c)||tk("izq",c)||tk("der",c))e.preventDefault();return;}
  if(tk("gas",c)){TYR.gas=true;$("#tyGas").classList.add("on");audioInit();}
  else if(tk("izq",c))TYR.steer=-1;else if(tk("der",c))TYR.steer=1;
  else if(tk("camara",c))$("#tyCam").click();else if(tk("volante",c))$("#tyVol").click();else if(tk("pausa",c))tyPausa();else u=false;if(u)e.preventDefault();});
window.addEventListener("keyup",e=>{if(!TYR)return;const c=e.code;if(tk("gas",c)){TYR.gas=false;$("#tyGas").classList.remove("on");}
  if(tk("izq",c)&&TYR.steer===-1)TYR.steer=0;if(tk("der",c)&&TYR.steer===1)TYR.steer=0;});

/* ---------- 3D: el autódromo de noche ---------- */
const TY3={mod:{},env:null};
function tyModelo(m,largo){largo=largo||3.05;if(TY3.mod[m])return Promise.resolve(TY3.mod[m]);if(TY3.mod["_"+m])return TY3.mod["_"+m];
  const base="taya/"+m+"/";const get=f=>fetch(base+f).then(r=>{if(!r.ok)throw new Error(f);return r.text();});
  return TY3.mod["_"+m]=init3D().then(ok=>{if(!ok)throw 0;return Promise.all([get("model.json"),get("geo.txt")]);}).then(([js,b64])=>new Promise((res,rej)=>T3.loader.parse(makeGLB(js,b64),base,g=>{
    const TH=T3.TH,inner=g.scene,holder=new TH.Group();holder.add(inner);holder.updateMatrixWorld(true);
    let b=new TH.Box3().setFromObject(holder),sz=b.getSize(new TH.Vector3());const k=largo/Math.max(sz.x,sz.z);inner.scale.multiplyScalar(k);
    if(sz.z>sz.x)inner.rotation.y=Math.PI/2;inner.rotation.y+=m==="f100"?TY_FWD_F100:TY_FWD;
    holder.updateMatrixWorld(true);b=new TH.Box3().setFromObject(holder);const c=b.getCenter(new TH.Vector3());inner.position.set(-c.x,-b.min.y,-c.z);
    inner.traverse(o=>{if(o.isMesh){o.material.roughness=.75;o.material.metalness=.1;}});
    if(TY_COLA[m])tyCortaCola(holder,TY_COLA[m]);
    TY3.mod[m]=holder;res(holder);},rej))).catch(err=>{delete TY3.mod["_"+m];throw err;});}
/* el modelo mc trae una quinta rueda pegada en la cola (error del modelo): se borran esos triángulos */
const TY_COLA={mc:{lado:window.__colaLado||-1,largo:window.__colaLargo||.15,ancho:.24,alto:window.__colaAlto||.62}};
function tyCortaCola(holder,o){holder.updateMatrixWorld(true);const TH=T3.TH,b=new TH.Box3().setFromObject(holder),sz=b.getSize(new TH.Vector3()),c=b.getCenter(new TH.Vector3());
  const x0=o.lado>0?b.max.x-sz.x*o.largo:b.min.x+sz.x*o.largo,v=new TH.Vector3();
  holder.traverse(q=>{if(!q.isMesh)return;const g=q.geometry,P=g.attributes.position,I=g.index?g.index.array:null,n=I?I.length:P.count,keep=[];
    const pt=k=>{v.fromBufferAttribute(P,k).applyMatrix4(q.matrixWorld);return v;};
    for(let t=0;t<n;t+=3){let cx=0,cy=0,cz=0;for(let j=0;j<3;j++){const p=pt(I?I[t+j]:t+j);cx+=p.x;cy+=p.y;cz+=p.z;}cx/=3;cy/=3;cz/=3;
      const enCola=(o.lado>0?cx>x0:cx<x0)&&Math.abs(cz-c.z)<sz.z*o.ancho&&cy<b.min.y+sz.y*o.alto;
      if(!enCola)for(let j=0;j<3;j++)keep.push(I?I[t+j]:t+j);}
    g.setIndex(keep);});}
const TY_FWD=Math.PI,TY_FWD_F100=Math.PI; // el frente de los modelos de Meshy mira a −x: se dan vuelta
function tyNumTex(n,col,spon){return dTex(256,160,(x,w,h)=>{x.clearRect(0,0,w,h);
  const c=new T3.TH.Color(col||"#fff"),lum=c.r*.3+c.g*.59+c.b*.11,tinta=lum>.55?"#111":"#fff",borde=lum>.55?"#fff":"#111";
  x.font=`900 ${String(n).length>2?118:136}px 'Barlow Condensed',Arial Narrow,sans-serif`;x.textAlign="center";x.textBaseline="middle";x.lineJoin="round";
  x.lineWidth=16;x.strokeStyle=borde;x.strokeText(String(n),w/2,h*.44);x.fillStyle=tinta;x.fillText(String(n),w/2,h*.44);
  if(spon){x.font="800 26px 'Barlow Condensed',Arial Narrow,sans-serif";x.lineWidth=6;x.strokeText(spon.toUpperCase(),w/2,h*.88);x.fillText(spon.toUpperCase(),w/2,h*.88);}});}
// busca la chapa del modelo con rayos: los costados detrás del motor y la cola, para pegar los números
function tyDecalPts(m,src){TY3.dec=TY3.dec||{};if(TY3.dec[m])return TY3.dec[m];const TH=T3.TH,rc=new TH.Raycaster(),out=[];src.updateMatrixWorld(true);
  const box=new TH.Box3().setFromObject(src),L=box.max.x-box.min.x,cx=(box.max.x+box.min.x)/2;
  const hit=(o,d)=>{rc.set(o,d);rc.far=8;const h=rc.intersectObject(src,true).find(q=>q.face);if(!h)return null;const n=q=>q.face.normal.clone().transformDirection(q.object.matrixWorld);return {p:h.point,n:n(h)};};
  for(const sd of[1,-1]){let best=null;
    for(const fx of[-.08,-.16,0,.06])for(const fy of[.42,.36,.5,.3]){const o=new TH.Vector3(cx+fx*L,box.min.y+fy*(box.max.y-box.min.y),sd*4);const h=hit(o,new TH.Vector3(0,0,-sd));
      if(h&&Math.abs(h.n.z)>.55&&Math.sign(h.n.z)===sd&&(!best||Math.abs(h.p.z)<Math.abs(best.p.z)+.02&&false||!best)){best=h;}if(best)break;}
    if(best){best.p.add(best.n.clone().multiplyScalar(.012));out.push({p:best.p,n:best.n,w:.56});}}
  for(const fx of[-.36,-.3,-.42]){const o=new TH.Vector3(cx+fx*L,box.max.y+2,0);const h=hit(o,new TH.Vector3(0,-1,0));if(h&&h.n.y>.6&&h.p.y<box.min.y+.75*(box.max.y-box.min.y)){h.p.add(h.n.clone().multiplyScalar(.012));out.push({p:h.p,n:h.n,w:.38,top:true});break;}}
  return TY3.dec[m]=out;}
function tyAutoObj(e){const TH=T3.TH,src=TY3.mod[e.m];if(!src)return null;const o=src.clone(true);
  const tint=new TH.Color(e.col);o.traverse(q=>{if(q.isMesh){q.castShadow=true;q.material=q.material.clone();q.material.color=new TH.Color(1,1,1).lerp(tint,TY_BLANCOS.includes(e.m)?.9:.38);}});
  const grp=new TH.Group(),piv=new TH.Group();grp.add(piv);piv.add(o);
  // el número va pegado a la carrocería: calcos en los dos costados y en la cola, apoyados sobre la chapa
  const dc=tyDecalPts(e.m,src),nm=new TH.MeshStandardMaterial({map:tyNumTex(e.num,e.col,e.spon),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,roughness:.5});
  for(const d of dc){const pl=new TH.Mesh(new TH.PlaneGeometry(d.w,d.w*.62),nm);pl.position.copy(d.p);pl.lookAt(d.p.clone().add(d.n));if(d.top)pl.rotateZ(-Math.PI/2);piv.add(pl);}
  if(!TY3.shT)TY3.shT=dTex(128,64,(x,w,h)=>{const g=x.createRadialGradient(w/2,h/2,4,w/2,h/2,w/2);g.addColorStop(0,"rgba(0,0,0,.7)");g.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=g;x.save();x.scale(1,h/w);x.beginPath();x.arc(w/2,w/2,w/2,0,7);x.fill();x.restore();});
  const sh=new TH.Mesh(new TH.PlaneGeometry(3.3,1.9),new TH.MeshBasicMaterial({map:TY3.shT,transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.03;sh.material.opacity=ultra()?.45:1;grp.add(sh);
  grp.userData={piv};return grp;}
function tyTierraTex(){return dTex(512,512,(x,w,h)=>{x.fillStyle="#6b4a33";x.fillRect(0,0,w,h);
  for(let i=0;i<9000;i++){const v=Math.random();x.fillStyle=`rgba(${70+v*70|0},${45+v*40|0},${28+v*25|0},.5)`;x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,1+Math.random()*2);}
  for(let i=0;i<60;i++){x.strokeStyle=`rgba(40,26,16,${.12+Math.random()*.2})`;x.lineWidth=1+Math.random()*3;x.beginPath();const y=Math.random()*h;x.moveTo(0,y);x.bezierCurveTo(w*.3,y+Math.random()*20-10,w*.7,y+Math.random()*20-10,w,y);x.stroke();}},[1,1]);}
function tyBuild(){const TH=T3.TH,sc=new TH.Scene(),E={sc,flags:[]};const L=TY.LAP,std=o=>new TH.MeshStandardMaterial(o);
  E.cam=new TH.PerspectiveCamera(55,1,.1,1500);E.cam.layers.enable(2);
  sc.background=new TH.Color(0x05070d);sc.fog=new TH.Fog(0x0a0d16,170,520);
  sc.add(new TH.HemisphereLight(0x5d6f96,0x1a120b,.14));
  const luna=new TH.DirectionalLight(0xb9c9ff,.12);luna.position.set(-100,200,-80);sc.add(luna);
  // torres de luz: cuatro proyectores grandes que iluminan la pista
  const torres=[[-TY.S/2-20,TY.R+22],[TY.S/2+20,TY.R+22],[-TY.S/2-20,-TY.R-22],[TY.S/2+20,-TY.R-22],[0,TY.R+26],[0,-TY.R-26]];
  const postM=std({color:0x777777,roughness:.6});
  torres.forEach(([x,z],i)=>{const p=new TH.Mesh(new TH.CylinderGeometry(.35,.5,26,8),postM);p.position.set(x,13,z);sc.add(p);
    const head=new TH.Mesh(new TH.BoxGeometry(5,2.2,.8),new TH.MeshBasicMaterial({color:0xfff6dc}));head.position.set(x,26.5,z);head.lookAt(0,0,0);sc.add(head);(E.heads=E.heads||[]).push(head);
    if(i<4){const sp=new TH.SpotLight(0xfff1d6,.62,200,Math.PI/3.6,.65,2);sp.position.set(x,26,z);sp.target.position.set(x*.25,0,z*.25);sp.shadow.mapSize.set(2048,2048);sp.shadow.bias=-.0004;sp.shadow.camera.near=8;sp.shadow.camera.far=160;sc.add(sp,sp.target);(E.spots=E.spots||[]).push(sp);}
    const glow=new TH.Sprite(new TH.SpriteMaterial({map:dTex(64,64,(c,w,h)=>{const g=c.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,"rgba(255,248,220,1)");g.addColorStop(1,"rgba(255,240,200,0)");c.fillStyle=g;c.fillRect(0,0,w,h);}),transparent:true,depthWrite:false,fog:false}));glow.scale.set(18,18,1);glow.position.set(x,26.5,z);sc.add(glow);});
  sc.add(new TH.AmbientLight(0xffe7c4,.08));
  // cielo con estrellas
  {const st=[];for(let i=0;i<900;i++){const a=Math.random()*Math.PI*2,e2=Math.random()*1.2+.08,r=900;st.push(Math.cos(a)*Math.cos(e2)*r,Math.sin(e2)*r,Math.sin(a)*Math.cos(e2)*r);}
    const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute(st,3));sc.add(new TH.Points(g,new TH.PointsMaterial({color:0xffffff,size:1.6,sizeAttenuation:false,fog:false})));}
  // pasto alrededor e infield
  const pasto=new TH.Mesh(new TH.PlaneGeometry(1400,1400),std({color:0x101a0c,roughness:1}));E.pasto=pasto;pasto.rotation.x=-Math.PI/2;pasto.position.y=-.06;sc.add(pasto);
  const strip=(d0,d1,mat,dy,step)=>{const pts=[],uv=[],idx=[];step=step||2;let k=0;
    for(let s=0;s<=L+.01;s+=step){for(const d of [d0,d1]){const p=tyPose(s,d);pts.push(p.x,tyY(s,d)+(dy||0),p.z);uv.push(s/10,(d-d0)/10);}
      if(k){const a=(k-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}k++;}
    const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute(pts,3));g.setAttribute("uv",new TH.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
    const m=new TH.Mesh(g,mat);m.material.side=TH.DoubleSide;sc.add(m);return m;};
  // tierra de verdad (foto de una pista de arcilla mojada); mientras carga, la dibujada
  const tierra=tyTierraTex();tierra.wrapS=tierra.wrapT=TH.RepeatWrapping;const pisoM=std({map:tierra,color:0xb08a6a,roughness:1});
  new TH.TextureLoader().load("taya/tierra.webp",t=>{t.encoding=TH.sRGBEncoding;t.wrapS=t.wrapT=TH.RepeatWrapping;t.anisotropy=8;pisoM.map=t;pisoM.color.setHex(0x9a7a66);pisoM.needsUpdate=true;});
  E.pisoM=pisoM;E.piso=strip(-TY.W/2-.2,TY.W/2,pisoM,.02);E.piso.receiveShadow=true;
  // huella oscura (la línea de carrera mojada y apisonada)
  E.huella=strip(-4.2,-.6,std({color:0x3b2818,roughness:.95,transparent:true,opacity:.55}),.035);
  // infield: pasto con cubiertas pintadas en el borde
  {const sh=new TH.Shape();const pts=[];for(let s=0;s<L;s+=3){const p=tyPose(s,-TY.W/2-.3);pts.push(new TH.Vector2(p.x,-p.z));}sh.setFromPoints(pts);
    const inf=new TH.Mesh(new TH.ShapeGeometry(sh),std({color:0x0f1a0b,roughness:1}));E.infield=inf;inf.rotation.x=-Math.PI/2;inf.position.y=.01;sc.add(inf);
    const gomaG=new TH.TorusGeometry(.42,.18,6,12),gomaB=new TH.MeshStandardMaterial({color:0x151515,roughness:.9}),gomaW=new TH.MeshStandardMaterial({color:0xe8e8e0,roughness:.8});
    let n=0;for(let s=0;s<L;s+=1.15){const p=tyPose(s,-TY.W/2-.55);const t=new TH.Mesh(gomaG,(n++>>2)%2?gomaB:gomaW);t.position.set(p.x,.2,p.z);t.rotation.x=Math.PI/2;sc.add(t);}}
  // paredón de hormigón y alambrado
  const muro=(d,h,mat,dy)=>{const pts=[],idx=[];let k=0,prev=false;for(let s=0;s<=L+.01;s+=1){if(tyEnPuerta(s)){prev=false;continue;}const p=tyPose(s,d),y0=tyY(s,d)+(dy||0);pts.push(p.x,y0,p.z,p.x,y0+h,p.z);if(prev){const a=(k-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}k++;prev=true;}
    const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute(pts,3));g.setIndex(idx);g.computeVertexNormals();const m=new TH.Mesh(g,mat);sc.add(m);return m;};
  muro(TY.W/2+.1,1.3,std({color:0xd9d4c8,roughness:.85,side:TH.DoubleSide}));
  {const fence=dTex(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle="rgba(150,150,150,.8)";x.lineWidth=2;for(let i=-64;i<128;i+=12){x.beginPath();x.moveTo(i,0);x.lineTo(i+64,64);x.stroke();x.beginPath();x.moveTo(i+64,0);x.lineTo(i,64);x.stroke();}},[220,1]);
    const pts=[],uv=[],idx=[];let j=0,prev=false;for(let s=0;s<=L+.01;s+=1){if(tyEnPuerta(s)){prev=false;continue;}const p=tyPose(s,TY.W/2+.15),y0=tyY(s,TY.W/2)+1.3;pts.push(p.x,y0,p.z,p.x,y0+3.6,p.z);uv.push(s/L,0,s/L,1);if(prev){const a=(j-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}j++;prev=true;}
    const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute(pts,3));g.setAttribute("uv",new TH.Float32BufferAttribute(uv,2));g.setIndex(idx);
    sc.add(new TH.Mesh(g,new TH.MeshBasicMaterial({map:fence,transparent:true,depthWrite:false,side:TH.DoubleSide})));}
  // carteles de publicidad sobre el paredón
  const ad=t=>dTex(512,96,(x,w,h)=>{x.fillStyle=t[1];x.fillRect(0,0,w,h);x.fillStyle=t[2];x.font="bold 54px 'Barlow Condensed',Arial Narrow,sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(t[0],w/2,h/2+3);});
  const ADS=[["TAYA'xs","#111","#f2c230"],["LUBRICANTES PAMPA","#c0392b","#fff"],["¡VAMOS POCHÓN!","#f2c230","#111"],["CUBIERTAS TORNADO","#111","#f4d03f"],["RADIO FIERRERA","#f39c12","#111"],["CORRALÓN BAHÍA","#1f5fa8","#fff"],["ALDEA ROMANA","#1e8a4c","#fff"],["FRIGORÍFICO ROMANA","#7a1d1d","#fff"],["GOMERÍA RUTA 3","#fff","#c0392b"],["ELECTRO SUR","#0fb5ae","#fff"],["LA TRADICIÓN","#111","#fff"],["TRANSPORTE BAHÍA","#e46b1c","#fff"],["0KM AUTOS","#fff","#1f5fa8"],["PINTURERÍA COLÓN","#6c2a8a","#fff"],["FERRETERÍA WHITE","#f2c230","#111"],["REPUESTOS PUERTO","#1e8a4c","#fff"]];
  // cada cartel se dobla siguiendo el paredón (en las curvas también), pegado a la pared de los dos lados
  const cartelPared=(s0,len,d,mat,flip)=>{const pts=[],uv=[],idx=[],N=12;for(let k=0;k<=N;k++){const ss=s0+len*k/N,q=tyPose(ss,d),y=tyY(ss,TY.W/2+.1);pts.push(q.x,y+.14,q.z,q.x,y+1.19,q.z);const u=flip?k/N:1-k/N;uv.push(u,0,u,1);
      if(k){const a=(k-1)*2;if(flip)idx.push(a,a+1,a+2,a+1,a+3,a+2);else idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
    const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute(pts,3));g.setAttribute("uv",new TH.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new TH.Mesh(g,mat);sc.add(m);return m;};
  for(let i=0;i<48;i++){const s=i*L/48+4;if(tyEnPuerta(s-4.2)||tyEnPuerta(s+4.2)||tyEnPuerta(s))continue;const t=ADS[i%ADS.length],mat=new TH.MeshBasicMaterial({map:ad(t),side:TH.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2});
    cartelPared(s-4.1,8.2,TY.W/2+.065,mat,false);cartelPared(s-4.1,8.2,TY.W/2+.135,mat,true);}
  // línea de llegada
  {const chk=dTex(256,32,(x,w,h)=>{for(let i=0;i<16;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?"#111":"#f4f4f4";x.fillRect(i*16,j*16,16,16);}});
    const fl=new TH.Mesh(new TH.PlaneGeometry(1.2,TY.W),new TH.MeshBasicMaterial({map:chk}));fl.rotation.x=-Math.PI/2;fl.rotation.z=Math.PI/2;fl.position.set(0,.06,TY.R);sc.add(fl);}
  // tribunas con público e hinchas con banderas
  const ROPA=[0xd7d7d7,0x1d3557,0xc0392b,0xf2c230,0x2e86c1,0x111111,0x27ae60,0xe67e22,0x7ec8e3,0xffffff,0x6c2a8a,0x8d6e3b],PIEL=[0xf1c9a5,0xe0ac80,0xc68a5a,0x9a6440,0xf6d6b8];
  const per=[],banderas=[];const concrete=std({color:0x9d988c,roughness:.9}),roofR=std({color:0x9c2a20,roughness:.6}),roofG=std({color:0x8c9096,roughness:.5,metalness:.4});
  // tribuna sobre una porción del óvalo (de s0 a s1), filas escalonadas hacia afuera
  const tribuna=(s0,s1,filas,techo,off)=>{off=off||0;for(let s=s0;s<s1;s+=.5){const p=tyPose(s,0),dx=Math.sin(p.h),dz=Math.cos(p.h);
      for(let r=0;r<filas;r++){const d=TY.W/2+3.2+off+r*1.05,q=tyPose(s,d),y=1.6+r*.62;const hsh=Math.abs(Math.sin(s*12.99+r*78.2)*43758.55)%1;
        if(hsh<.025)continue;per.push([q.x,y,q.z,ROPA[Math.floor(hsh*1e4)%ROPA.length],PIEL[Math.floor(hsh*1e5)%PIEL.length],hsh,p.h]);
        if(hsh>.965)banderas.push([q.x,y+1.1,q.z,Math.floor(hsh*1e6)%6,p.h]);}}
    for(let r=0;r<filas;r++){const pts=[],idx=[];let k=0;for(let s=s0;s<=s1;s+=2){for(const dd of[0,1.05]){const q=tyPose(s,TY.W/2+3.2+off+r*1.05-.5+dd);pts.push(q.x,1.6+r*.62-.02,q.z,q.x,0,q.z);}
        if(k){const a=(k-1)*4;idx.push(a,a+2,a+4,a+2,a+6,a+4,a+1,a+5,a+3,a+3,a+5,a+7);}k++;}
      // escalón: una tapa horizontal por fila
      const top=[],ti=[];let kk=0;for(let s=s0;s<=s1;s+=2){for(const dd of[0,1.05]){const q=tyPose(s,TY.W/2+3.2+off+r*1.05-.5+dd);top.push(q.x,1.6+r*.62-.02,q.z);}if(kk){const a=(kk-1)*2;ti.push(a,a+1,a+2,a+1,a+3,a+2);}kk++;}
      const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute(top,3));g.setIndex(ti);g.computeVertexNormals();const m=new TH.Mesh(g,concrete);m.material.side=TH.DoubleSide;sc.add(m);}
    const dB=TY.W/2+3.2+off+filas*1.05;muroParcial(s0,s1,dB,filas*.62+2.5,concrete);
    if(techo){const pts=[],idx=[];let k=0;for(let s=s0;s<=s1;s+=2){for(const d of[TY.W/2+2.4+off,dB+.3]){const q=tyPose(s,d);pts.push(q.x,filas*.62+4.2,q.z);}if(k){const a=(k-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}k++;}
      const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute(pts,3));g.setIndex(idx);g.computeVertexNormals();sc.add(new TH.Mesh(g,techo==="rojo"?roofR:roofG));
      for(let s=s0;s<=s1;s+=12){const q=tyPose(s,TY.W/2+2.6+off);const col=new TH.Mesh(new TH.CylinderGeometry(.14,.14,filas*.62+4.2),concrete);col.position.set(q.x,(filas*.62+4.2)/2,q.z);sc.add(col);}}};
  const muroParcial=(s0,s1,d,h,mat)=>{const pts=[],idx=[];let k=0;for(let s=s0;s<=s1+.01;s+=2){const p=tyPose(s,d);pts.push(p.x,0,p.z,p.x,h,p.z);if(k){const a=(k-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}k++;}
    const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute(pts,3));g.setIndex(idx);g.computeVertexNormals();const m=new TH.Mesh(g,mat);m.material.side=TH.DoubleSide;sc.add(m);};
  const a=TY.S/2,arc=Math.PI*TY.R;
  tribuna(L-a+6,L+a-6,14,"gris");              // tribuna principal: toda la recta de llegada
  tyBoxesBuild(TH,sc,std,ad); // curvas 3-4: boxes comunitarios
  tribuna(a+arc+10,a+arc+TY.S-10,7,null);         // recta opuesta
  tribuna(a+4,a+arc*.38,5,null);                  // entrada de la curva 1
  // el público: personas reales (modelos de Meshy pasados a figuras) en 5 tipos, espejadas y con ropa de distintos tonos
  {const n=per.length,TT=5,tex=new TH.TextureLoader().load("taya/publico.webp");tex.encoding=TH.sRGBEncoding;
    const mat=new TH.MeshLambertMaterial({map:tex,alphaTest:.5,side:TH.DoubleSide,emissive:0x5a5048,emissiveMap:tex}) /* la luz de las torres que rebota en la tribuna */,M=new TH.Matrix4(),C=new TH.Color(),W=new TH.Color(1,1,1),Q=new TH.Quaternion(),Y=new TH.Vector3(0,1,0),V=new TH.Vector3(),Sc=new TH.Vector3();
    const grupos=[...Array(TT)].map(()=>[]);per.forEach(p=>grupos[Math.floor(p[5]*1e3)%TT].push(p));
    grupos.forEach((g,t)=>{if(!g.length)return;const geo=new TH.PlaneGeometry(.74,1.48),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,(t+uv.getX(i))/TT);
      const im=new TH.InstancedMesh(geo,mat,g.length);
      g.forEach((p,i)=>{const k=.9+((p[5]*1e4)%1)*.22,fl=((p[5]*1e5)%1)<.5?-1:1;Q.setFromAxisAngle(Y,p[6]+Math.PI+(((p[5]*1e6)%1)-.5)*.5);
        M.compose(V.set(p[0],p[1]+.74*k,p[2]),Q,Sc.set(fl*k,k,k));im.setMatrixAt(i,M);C.copy(W).lerp(C.setHex(p[3]),.22);im.setColorAt(i,C);});
      sc.add(im);});
    E.publico=n;}
  // banderas que flamean: celeste y blanca, Pochón, amarilla y negra, roja, verde, a cuadros
  {const BT=[["#75aadb","#fff","#75aadb"],["#f2c230","#111","POCHÓN"],["#f2c230","#111","#f2c230"],["#c0392b","#fff","#c0392b"],["#1e8a4c","#fff","#1e8a4c"],["chk"]].map(c=>dTex(128,80,(x,w,h)=>{
      if(c[0]==="chk"){for(let i=0;i<8;i++)for(let j=0;j<5;j++){x.fillStyle=(i+j)%2?"#111":"#eee";x.fillRect(i*16,j*16,16,16);}return;}
      if(c[2].length>8){x.fillStyle=c[0];x.fillRect(0,0,w,h);x.fillStyle=c[1];x.font="900 30px 'Barlow Condensed',sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(c[2],w/2,h/2+2);return;}
      x.fillStyle=c[0];x.fillRect(0,0,w,h/3);x.fillStyle=c[1];x.fillRect(0,h/3,w,h/3);x.fillStyle=c[2];x.fillRect(0,2*h/3,w,h/3);}));
    const geo=new TH.PlaneGeometry(1.5,.95,6,1);geo.translate(.75,0,0);
    banderas.forEach(b=>{const m=new TH.Mesh(geo,new TH.MeshBasicMaterial({map:BT[b[3]],side:TH.DoubleSide}));const piv=new TH.Group();piv.position.set(b[0],b[1],b[2]);piv.add(m);
      const palo=new TH.Mesh(new TH.CylinderGeometry(.02,.02,1.6),new TH.MeshBasicMaterial({color:0x333333}));palo.position.y=-.3;piv.add(palo);sc.add(piv);E.flags.push({piv,ph:Math.random()*6,h:b[4]});});}
  // torre de control con la cabina de transmisión en el medio del infield
  {const tw=new TH.Mesh(new TH.BoxGeometry(5,9,5),std({color:0xd8d4ca}));tw.position.set(0,4.5,0);sc.add(tw);
    const cab=new TH.Mesh(new TH.BoxGeometry(6.4,3,6.4),std({color:0x3a5f80,roughness:.2,metalness:.5,emissive:0x2a4560,emissiveIntensity:.6}));cab.position.set(0,10.5,0);sc.add(cab);
    const tx=new TH.Mesh(new TH.PlaneGeometry(6,1),new TH.MeshBasicMaterial({map:ad(["TAYA'xs TV","#111","#f2c230"])}));tx.position.set(0,12.6,3.25);sc.add(tx);const tx2=tx.clone();tx2.rotation.y=Math.PI;tx2.position.z=-3.25;sc.add(tx2);}
  // la chica de la bandera a cuadros, en el borde de adentro de la llegada
  E.cars=[];return E;}
function tyEnvEst(){if(!TY3.envEst)TY3.envEst=tyBuild();TY3.env=TY3.envEst;return TY3.envEst;}
function tySetup3D(R){if(!ready3D())return;const E=R.c.entreno?(TY3.env=TY3.envSal||(TY3.envSal=tyBuildSalitral())):tyEnvEst();tyGraf(E);E.cars.forEach(c=>E.sc.remove(c));E.cars=[];
  for(const e of R.cars){const o=tyAutoObj(e);if(!o){e.g=null;continue;}E.sc.add(o);E.cars.push(o);e.g=o;}
  tyChica(E);R.g3=true;}
// la chica (modelo 3D con la animación de la bandera) se para en el borde de adentro de la recta principal
function tyChica(E){if(typeof loadChica==="function")loadChica();}
function tyBanderaBlanca(on){const F=CH3.flag;if(!F)return;const m=F.cloth.material;if(!CH3.texCuadros)CH3.texCuadros=m.map;
  if(on&&!CH3.texBlanca)CH3.texBlanca=dTex(64,48,(x,w,h)=>{x.fillStyle="#fbfbf6";x.fillRect(0,0,w,h);});
  const t=on?CH3.texBlanca:CH3.texCuadros;if(m.map!==t){m.map=t;m.needsUpdate=true;}}
function tyChicaFrame(E,R,dt){if(CH3.st!=="ok"||E.sal)return;
  if(CH3.obj.parent!==E.sc){E.sc.add(CH3.obj,CH3.flag.grp);CH3.obj.position.set(6,0,TY.R-TY.W/2-1.8);CH3.obj.rotation.y=Math.PI*.15;}
  CH3.obj.visible=CH3.flag.grp.visible=true;R.chT=(R.chT??CH_WAVE[0])+dt;if(R.chT>CH_WAVE[1])R.chT=CH_WAVE[0]+(R.chT-CH_WAVE[1]);
  // agita la bandera fuerte en la última vuelta y cuando llegan
  // en la última vuelta la chica agita la bandera blanca; cuando llega el primero, la a cuadros
  const llego=R.done||R.cars.some(e=>e.fin!=null),ultima=R.green&&R.lapN===R.laps&&!llego;tyBanderaBlanca(ultima);
  const agita=R.green&&(R.lapN===R.laps||R.done);CH3.act.time=agita?R.chT:CH_WAVE[0]+.05;CH3.mix.update(0);CH3.obj.updateMatrixWorld(true);updFlag(dt,performance.now()/1000);}

// la tierra que levantan las ruedas de atrás: más cuando derrapan y aceleran
function tyGraf(E){const u=ultra();(E.spots||[]).forEach(sp=>sp.castShadow=u);if(E.polvo)E.polvo.n=u?E.polvo.L.length:110;}
function tyPolvoIni(E){if(E.polvo)return E.polvo;const TH=T3.TH;const tex=dTex(64,64,(x,w,h)=>{const g=x.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,"rgba(190,150,110,.9)");g.addColorStop(.5,"rgba(150,115,85,.45)");g.addColorStop(1,"rgba(120,90,70,0)");x.fillStyle=g;x.fillRect(0,0,w,h);});
  const L=[];for(let i=0;i<220;i++){const m=new TH.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:0,color:0xb89a7c});const sp=new TH.Sprite(m);sp.visible=false;E.sc.add(sp);L.push({sp,life:0,vx:0,vy:0,vz:0,sz:1});}
  E.polvo={L,i:0,n:ultra()?220:110};return E.polvo;}
function tyPolvoEmite(E,g,yaw,e,dt){const P=tyPolvoIni(E),k=Math.min(1,e.v/22)*(.35+Math.min(1,Math.abs(e.sa)*1.6)+e.th*.4)*(ultra()?1.6:1);if(Math.random()>k*dt*22)return;
  const fx=Math.cos(yaw),fz=-Math.sin(yaw),sx=Math.sin(yaw),sz=Math.cos(yaw),lado=Math.random()<.5?-.62:.62;
  const q=P.L[P.i++%(P.n||110)];q.life=1;q.sz=.7+Math.random()*.6;q.sp.visible=true;
  q.sp.position.set(g.position.x-fx*1.25+sx*lado,g.position.y+.25,g.position.z-fz*1.25+sz*lado);
  const v=e.v*.18;q.vx=-fx*v+(Math.random()-.5)*1.5+sx*Math.sign(lado)*e.sa*3;q.vz=-fz*v+(Math.random()-.5)*1.5+sz*Math.sign(lado)*e.sa*3;q.vy=.6+Math.random()*1.2;}
function tyPolvoPaso(E,dt){const P=E.polvo;if(!P)return;for(const q of P.L){if(q.life<=0)continue;q.life-=dt*.8;if(q.life<=0){q.sp.visible=false;continue;}
  q.sp.position.x+=q.vx*dt;q.sp.position.y+=q.vy*dt;q.sp.position.z+=q.vz*dt;q.vx*=1-dt*1.6;q.vz*=1-dt*1.6;q.vy*=1-dt*.8;
  const z=q.sz*(1+(1-q.life)*3.2);q.sp.scale.set(z,z,1);q.sp.material.opacity=Math.max(0,q.life)*.32;}}

// placa transparente con la grilla de largada (de a 4 por fila), antes del verde
function tyPlacaGrilla(ctx,w,h,R,k){const cars=R.cars.filter(e=>!e.out&&!e.gone).slice().sort((a,b)=>b.dist-a.dist||a.d-b.d);if(!cars.length)return;
  const filas=Math.ceil(cars.length/4),cw=Math.min(w*.21,170*k),ch=34*k,gap=6*k,W=cw*4+gap*5,H=ch*filas+gap*(filas+1)+40*k,x0=(w-W)/2,y0=h*.52-H/2;
  ctx.save();ctx.fillStyle="rgba(8,10,16,.6)";ctx.strokeStyle="rgba(242,182,50,.8)";ctx.lineWidth=2*k;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x0,y0,W,H,12*k);else ctx.rect(x0,y0,W,H);ctx.fill();ctx.stroke();
  ctx.fillStyle="#f2b632";ctx.font=`900 ${Math.round(20*k)}px "Barlow Condensed",sans-serif`;ctx.textAlign="center";ctx.fillText(`GRILLA DE LARGADA · ${String(R.c.nom).toUpperCase()}`,w/2,y0+26*k);
  cars.forEach((e,i)=>{const f=Math.floor(i/4),c=i%4,x=x0+gap+c*(cw+gap),y=y0+36*k+gap+f*(ch+gap);
    ctx.fillStyle=e.yo?"rgba(242,182,50,.95)":"rgba(255,255,255,.1)";ctx.fillRect(x,y,cw,ch);ctx.fillStyle=e.col||"#ccc";ctx.fillRect(x,y,6*k,ch);
    ctx.fillStyle=e.yo?"#111":"#f3e9d2";ctx.textAlign="left";ctx.font=`800 ${Math.round(15*k)}px "Barlow Condensed",sans-serif`;ctx.fillText(`${i+1}º  #${e.num}`,x+10*k,y+ch*.42);
    ctx.font=`600 ${Math.round(13*k)}px "Barlow Condensed",sans-serif`;ctx.fillText(String(e.n).slice(0,18),x+10*k,y+ch*.85);});
  ctx.restore();}
// placas informativas de las carreras de la noche (todas, no solo las tuyas)
const TY_ETAPAS=[["series",(s,J)=>s.map((r,i)=>({nom:"Serie "+(i+1),r,tag:x=>{const k=(J.clasS||[]).indexOf(x.id);return k>=0?`→ Semi (${k+1}º tiempo)`:"→ Repechaje";}}))],
  ["repes",(s,J)=>s.map((r,i)=>({nom:"Repechaje "+(i+1),r,tag:x=>(J.clasR||[]).includes(x.id)?"→ Semi (3ª fila)":""}))],
  ["semis",(s,J)=>s.map((r,i)=>({nom:"Semifinal "+(i+1),r,tag:x=>{const k=(J.rkSemi||[]).indexOf(x.id);return k<0?"":k<10?`→ Final (${k+1}º)`:k<12?"Suplente final":k<24?"→ Prefinal":"";}}))],
  ["pre",(r,J)=>[{nom:"Prefinal",r,tag:(x,k)=>(x.sup?"Suplente · ":"")+((J.final||[]).includes(x.id)?"→ Final":"")}]],["final",r=>[{nom:"Gran Final",r,tag:(x,k)=>(x.sup?"Suplente · ":"")+(k===0&&!x.dnf?"🏆 Ganador":"")}]]];
function tyPlacasPend(J){J.vistas=J.vistas||{};const L=[];for(const [k,f] of TY_ETAPAS){if(J.res[k]&&!J.vistas[k]){J.vistas[k]=1;L.push(...f(J.res[k],J));}}return L;}
function tyPlacas(L,done){if(!L.length){done();return;}let i=0,tm=null,fin=false;const quien=["rubia","morocha"];
  const ov=el(`<div class="typlaca" role="dialog" aria-label="Resultados de la noche"><div class="tpbox" id="tpBox"></div><div class="tpopts"><button class="btn sec sm" id="tpSalta">Saltar todas</button><button class="btn oro sm" id="tpSig">Próxima ▶</button></div></div>`);
  document.body.append(ov);const cerrar=()=>{if(fin)return;fin=true;clearTimeout(tm);ov.remove();done();};
  const pinta=()=>{if(i>=L.length){cerrar();return;}const P=L[i],tag=(x,k)=>P.tag?P.tag(x,k):"";
    $("#tpBox").innerHTML=`<div class="tphead"><div><small>Resultados de la noche · ${i+1} de ${L.length}</small><b>${esc(P.nom)}</b></div></div>
      <table class="ovtab"><tr><th>Pos</th><th>Piloto</th><th>Tiempo</th><th></th></tr>${P.r.map((x,k)=>`<tr${x.id==="yo"?' class="yo"':''}><td>${k+1}</td><td>#${tyNum(x.id)} ${esc(tyNombre(x.id))}</td><td>${x.t!=null?x.t.toFixed(2)+" s":""}</td><td>${x.dnf?"Abandono":tag(x,k)}</td></tr>`).join("")}</table>`;
    clearTimeout(tm);tm=setTimeout(()=>{i++;pinta();},5000);};
  ov.querySelector("#tpSig").onclick=()=>{i++;pinta();};ov.querySelector("#tpSalta").onclick=cerrar;pinta();}

// construye los 5 módulos de boxes (tinglado, lonas, calle interna y las dos puertas al óvalo)
function tyBoxesBuild(TH,sc,std,ad){const B=TYB,W2=TY.W/2;
  const banda=(s0,s1,d0,d1,y,mat,step)=>{const pts=[],idx=[];let k=0;step=step||1.5;for(let s=s0;s<=s1+.01;s+=step){for(const d of[d0,d1]){const q=tyPose(s,d);pts.push(q.x,y,q.z);}if(k){const a=(k-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}k++;}
    const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute(pts,3));g.setIndex(idx);g.computeVertexNormals();const m=new TH.Mesh(g,mat);m.material.side=TH.DoubleSide;sc.add(m);return m;};
  const pared=(s0,s1,d,y0,h,mat)=>{const pts=[],idx=[];let k=0;for(let s=s0;s<=s1+.01;s+=1.5){const q=tyPose(s,d);pts.push(q.x,y0,q.z,q.x,y0+h,q.z);if(k){const a=(k-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}k++;}
    const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute(pts,3));g.setIndex(idx);g.computeVertexNormals();const m=new TH.Mesh(g,mat);m.material.side=TH.DoubleSide;sc.add(m);return m;};
  const tierraM=std({color:0x4a3526,roughness:1}),piso=std({color:0x77736c,roughness:.95}),chapa=std({color:0xa7abb0,roughness:.45,metalness:.55}),poste=std({color:0x666a70,roughness:.5,metalness:.6});
  const lonas=[0x1f5fa8,0x1e8a4c,0xe46b1c,0x8a1c1c,0x2b9aa0].map(c=>std({color:c,roughness:.85,side:TH.DoubleSide}));
  // calle interna de boxes (tierra apisonada) y los accesos por las puertas
  banda(B.s3+2,B.s4-2,B.road-2.1,B.road+2.1,.03,tierraM);
  for(const sg of[B.ent,B.sal]){const pts=[],idx=[];const dd=[W2-.4,B.road];for(const [k,s0] of [[0,sg-4],[1,sg+4]])for(const d of dd){const q=tyPose(s0,d);pts.push(q.x,.035,q.z);}
    const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute(pts,3));g.setIndex([0,1,2,1,3,2]);g.computeVertexNormals();sc.add(new TH.Mesh(g,tierraM));}
  B.mods.forEach(([m0,m1],k)=>{const L1=lonas[k];
    // piso de cemento de los boxes y techo de chapa que cubre las dos filas enfrentadas y la calle
    banda(m0,m1,B.dIn-2.4,B.dIn+2.3,.04,piso);banda(m0,m1,B.dOut-2.3,B.dOut+2.4,.04,piso);
    for(const [d0,d1] of [[B.dIn-2.7,B.dIn+2.5],[B.dOut-2.5,B.dOut+2.7]]){const t=banda(m0-.6,m1+.6,d0,d1,4.6,chapa,1);t.castShadow=true;} /* un techo por fila; la calle del medio queda al aire */
    // fondos de lona y lonas entre box y box
    pared(m0,m1,B.dIn-2.4,0,3.1,L1);pared(m0,m1,B.dOut+2.4,0,3.1,L1);
    for(const b of B.boxes.filter(x=>x.mod===k)){for(const sd of[-.5,.5]){const s1=b.s+sd*b.w,p0=tyPose(s1,b.d-2.3),p1=tyPose(s1,b.d+2.3);
        const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute([p0.x,0,p0.z,p1.x,0,p1.z,p0.x,2.5,p0.z,p1.x,2.5,p1.z],3));g.setIndex([0,1,2,1,3,2]);g.computeVertexNormals();sc.add(new TH.Mesh(g,L1));}
      // tubo de luz en cada box
      const q=tyPose(b.s,b.d),tl=new TH.Mesh(new TH.BoxGeometry(1.2,.06,.14),new TH.MeshBasicMaterial({color:0xfff3d6}));tl.position.set(q.x,4.45,q.z);tl.rotation.y=q.h;sc.add(tl);}
    // postes del tinglado
    for(const s1 of[m0-.4,(m0+m1)/2,m1+.4])for(const d of[B.dIn-2.6,B.dIn+2.4,B.dOut-2.4,B.dOut+2.6]){const q=tyPose(s1,d),c=new TH.Mesh(new TH.CylinderGeometry(.09,.09,4.6,6),poste);c.position.set(q.x,2.3,q.z);sc.add(c);}
    // cartel del módulo
    const q=tyPose((m0+m1)/2,B.dOut+2.75),cart=new TH.Mesh(new TH.PlaneGeometry(6,1),new TH.MeshBasicMaterial({map:ad(["BOXES "+(k+1),"#111","#f2c230"])}));cart.position.set(q.x,3.9,q.z);cart.rotation.y=q.h+Math.PI;sc.add(cart);});
  // una luz cálida que baña la zona de boxes
  {const q=tyPose((B.s3+B.s4)/2,B.road),pl=new TH.PointLight(0xffd9a0,1.1,70,2);pl.position.set(q.x,9,q.z);sc.add(pl);}
  // carteles de entrada y salida en las puertas
  for(const [sg,t] of [[B.ent,"ENTRADA BOXES"],[B.sal,"SALIDA BOXES"]]){const q=tyPose(sg,W2+1.2),c=new TH.Mesh(new TH.PlaneGeometry(4.5,.8),new TH.MeshBasicMaterial({map:ad([t,"#f2c230","#111"]),side:TH.DoubleSide}));c.position.set(q.x,3.2,q.z);c.rotation.y=q.h+Math.PI/2;sc.add(c);}}

/* ---------- salida y entrada a boxes: los autos van solos de su box a la grilla y vuelven al terminar ---------- */
function tyRuta(pts){const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));return {pts,cum,len:cum[cum.length-1]};}
function tyRutaEn(r,x){x=Math.max(0,Math.min(r.len,x));let i=1;while(i<r.cum.length-1&&r.cum[i]<x)i++;const a=r.pts[i-1],b=r.pts[i],t=(x-r.cum[i-1])/Math.max(1e-6,r.cum[i]-r.cum[i-1]);
  return {s:a[0]+(b[0]-a[0])*t,d:a[1]+(b[1]-a[1])*t,ang:-Math.atan2(b[1]-a[1],b[0]-a[0])};}
function tyAnimIni(R,tipo,items,vel,cb){const B=el(`<button class="tyskip">Saltar ⏭</button>`);$("#tyRace").append(B);
  const A=R.anim={tipo,t0:performance.now(),items,vel,cb,B,B2:TYB,sigue:null,cam:null};A.dur=Math.max(...items.map(o=>o.delay+o.r.len/vel))+.6;
  items.forEach(o=>{const p=tyRutaEn(o.r,0);o.e.s=p.s;o.e.d=p.d;o.e.sa=p.ang;});B.onclick=()=>{narStopF();tyAnimFin(R);};
  tyMsg(tipo==="salida"?"Los autos salen de boxes y se acomodan en la grilla":"Terminó la carrera: todos vuelven a boxes","var(--celeste)");}
function tyAnimPaso(R,now){const A=R.anim,t=A.frz!=null?A.frz:(now-A.t0)/1000;let mine=null;
  for(const o of A.items){const x=Math.max(0,t-o.delay)*A.vel,p=tyRutaEn(o.r,x),e=o.e;e.s=p.s;e.d=p.d;e.sa+=(p.ang-e.sa)*Math.min(1,R.dt*6);e.v=x>0&&x<o.r.len?A.vel:0;e.th=e.v?.35:0;if(e.yo)mine=e;}
  let fo=null,fx=0;if(A.tipo==="salida"){for(const o of A.items){const x=Math.max(0,t-o.delay)*A.vel;if(x>0&&x<o.r.len){fo=o;fx=x;}}}else{const o=A.items.find(o=>o.e.yo)||A.items[0];fo=o;fx=Math.min(o.r.len,Math.max(0,t-o.delay)*A.vel);}
  if(!fo){fo=A.items[0];fx=0;}const e=fo.e,B=A.B2;const bajo=e.d>TY.W/2+2.5&&B.mods.some(([m0,m1])=>{const s=((e.s%TY.LAP)+TY.LAP)%TY.LAP;return s>m0-1&&s<m1+1;});
  const c=fx<3?tyRutaEn(fo.r,Math.min(fo.r.len,7)):tyRutaEn(fo.r,Math.max(0,fx-7.5));A.cam={s:c.s,d:c.d,y:bajo?2.3:4.2,fs:e.s,fd:e.d};
  A.sigue=mine||A.items[0]&&A.items[0].e;if(t>=A.dur)tyAnimFin(R);}
function tyAnimFin(R){const A=R.anim;if(!A)return;R.anim=null;A.B.remove();A.items.forEach(o=>{const p=tyRutaEn(o.r,o.r.len);o.e.s=p.s;o.e.d=p.d;o.e.sa=0;o.e.v=0;o.e.th=0;if(o.fin)o.fin(o.e);});A.cb&&A.cb();}
function tyBoxesSalida(R,cb){if(!R||R.c.vivo||R.c.entreno||!R.g3){cb();return;}const B=TYB,L=TY.LAP,items=[];
  const orden=R.cars.filter(e=>!e.out).slice().sort((a,b)=>b.dist-a.dist||a.d-b.d);
  orden.forEach((e,i)=>{const bx=tyBoxDe(e.id,i),gs=e.dist+L,gd=e.d,gdist=e.dist;e.box=bx;
    const r=tyRuta([[bx.s,bx.d],[bx.s,B.road],[B.sal-7,B.road],[B.sal+5,TY.W/2-2.5],[gs-9,gd],[gs,gd]]);
    items.push({e,r,delay:i*.4,fin:e=>{e.dist=gdist;e.s=gdist;e.d=gd;}});});
  const cb0=cb;cb=()=>{const t0=performance.now(),esp=()=>{if(TYR!==R)return;if(narLibreF()||performance.now()-t0>9000)cb0();else setTimeout(esp,200);};esp();}; /* que termine de presentar a los pilotos antes de seguir con la largada */
  tyAnimIni(R,"salida",items,15,cb);const p={};const ks=[];orden.slice(0,12).forEach((e,i)=>{const k="c"+i;p[k]=e;ks.push(k);});NARRA_F4.salida=[1,2,3,4,5].map(n=>["f:salida"+n,...ks,"f:grilla1"]);NARF_BOLSA.salida=null;narraF("salida",p);}
function tyBoxesEntrada(R,cb){if(!R||R.c.vivo||R.c.entreno||!R.g3){cb();return;}const B=TYB,L=TY.LAP,items=[];
  R.cars.forEach((e,i)=>{if(e.gone||e.out){if(e.g)e.g.visible=false;e.gone=true;return;}const bx=e.box||tyBoxDe(e.id,i),s0=((e.s%L)+L)%L;let off=0;if(B.ent-9<s0+4)off=L;
    const r=tyRuta([[s0,e.d],[s0+5,Math.max(-2,Math.min(3,e.d))],[B.ent-9+off,TY.W/2-2.5],[B.ent+4+off,B.road],[bx.s+off,B.road],[bx.s+off,bx.d]]);
    items.push({e,r,delay:i*.15});});
  if(!items.length){cb();return;}tyAnimIni(R,"entrada",items,17,cb);narraF("entrada",{});}
function tyDraw(R){const cv=$("#tyScene");if(!cv)return;const dpr=prUltra(Math.min(2,devicePixelRatio||1));if(cv.width!==Math.round(cv.clientWidth*dpr)||cv.height!==Math.round(cv.clientHeight*dpr)){cv.width=Math.round(cv.clientWidth*dpr);cv.height=Math.round(cv.clientHeight*dpr);}
  const ctx=cv.getContext("2d"),w=cv.width,h=cv.height,E=TY3.env;ctx.clearRect(0,0,w,h);
  if(R.g3&&E&&w>0){const TH=T3.TH,ren=T3.ren,dt=R.dt||.016,tt=performance.now()/1000;
    for(const e of R.cars){if(e.g)continue;if(TY3.mod[e.m]){const o=tyAutoObj(e);if(o){E.sc.add(o);E.cars.push(o);e.g=o;}}else if(!TY3.mod["_"+e.m]&&(!R.reintT||tt-R.reintT>4)){R.reintT=tt;tyModelo(e.m).catch(()=>{});}}
    for(const e of R.cars){if(!e.g)continue;e.g.visible=!e.gone;const p=tyPose(e.s,e.d),g=e.g,piv=g.userData.piv;g.position.set(p.x,tyYc(e.s,e.d),p.z);
      // el auto apunta hacia adentro de la curva cuando derrapa (cola afuera); con el vuelco gira y da tumbos
      let yaw=p.h+e.sa;if(e.out)yaw=p.h+e.sa;g.rotation.set(0,yaw,0);
      if(e.vuelco){ /* vuelco de verdad: sale despedido, da vueltas de campana, rebota contra la tierra y queda donde cae */
        const T=e.tumb||(e.tumb={y:0,vy:5.5+Math.random()*3.5,rx:0,wx:(7+Math.random()*5)*(Math.random()<.5?-1:1),rz:0,wz:(Math.random()-.5)*3.5,polvo:0});const d=Math.min(.04,dt||.016);
        T.vy-=9.8*d;T.y+=T.vy*d;T.rx+=T.wx*d;T.rz+=T.wz*d;
        if(T.y<0){T.y=0;if(Math.abs(T.vy)>1.4){T.vy=-T.vy*.36;T.wx*=.62;T.wz*=.5;T.polvo=.35;tySonido("toque",.5);}else{T.vy=0;T.wx*=.86;T.wz*=.8;const tg=Math.round(T.rx/Math.PI)*Math.PI;T.rx+=(tg-T.rx)*Math.min(1,d*5);T.rz+=(0-T.rz)*Math.min(1,d*4);}}
        piv.rotation.x=T.rx;piv.rotation.z=T.rz;piv.position.y=T.y+.55*Math.abs(Math.sin(T.rx));
        if(T.polvo>0){T.polvo-=d;for(let q=0;q<3;q++)tyPolvoEmite(E,g,yaw,{v:22,sa:1,th:1},.05);}}
      else{piv.rotation.z=e.pitch+(e.th>.6&&e.v<14?Math.sin(tt*40)*.006:0);piv.rotation.x=-tyBank(e.s)*.1;piv.position.y=0;}
      if(!e.gone&&!e.out&&e.v>5)tyPolvoEmite(E,g,yaw,e,dt);}
    tyPolvoPaso(E,dt);
    // banderas
    for(const f of E.flags){f.piv.rotation.y=f.h+Math.PI/2+Math.sin(tt*2.2+f.ph)*.9;f.piv.rotation.z=Math.sin(tt*3.1+f.ph)*.25;}
    tyChicaFrame(E,R,dt);
    const P=R.P,asp=w/h;E.cam.aspect=asp;
    const pp=tyPose(P.s,P.d),py=tyY(P.s,P.d);
    if(!R.green&&!R.done&&(R.esperaLuz||R.roja||!R.relargadas)&&R.t<2){const a=tyPose(-30,-TY.W/2-6),b=tyPose(-8,0);E.cam.fov=asp<1?60:48;E.cam.position.set(a.x,6,a.z);E.cam.lookAt(b.x,1,b.z);}
    else if(R.cam==="atras"){const back=asp<1?8:7,c0=tyPose(P.s-back,P.d*.8),c1=tyPose(P.s+14,P.d*.6);const tgt=new TH.Vector3(c0.x,tyY(P.s-back,P.d)+(asp<1?3.2:2.8),c0.z);if(!R.cp||R.cp.distanceTo(tgt)>25)R.cp=tgt.clone();else R.cp.lerp(tgt,Math.min(1,dt*6));
      E.cam.fov=asp<1?66:56;E.cam.position.copy(R.cp);E.cam.lookAt(c1.x,1,c1.z);}
    else if(R.cam==="cabina"){E.cam.fov=asp<1?80:70;tyCabina(E,P,pp,dt);}
    else if(R.cam==="arriba"){E.cam.fov=50;E.cam.position.set(pp.x*.55,48,pp.z*.55+(asp<1?30:20));E.cam.lookAt(pp.x*.8,0,pp.z*.8);}
    else{ // 90° desde adentro: el auto pasa de costado y atrás se ven las tribunas llenas
      const dIn=asp<1?-TY.W/2-15:-TY.W/2-11,c0=tyPose(P.s-2,dIn);const tgt=new TH.Vector3(c0.x,3.4,c0.z);if(!R.cp||R.cp.distanceTo(tgt)>30)R.cp=tgt.clone();else R.cp.lerp(tgt,Math.min(1,dt*5));
      E.cam.fov=asp<1?62:44;E.cam.position.copy(R.cp);E.cam.lookAt(pp.x,py+1.6,pp.z);}
    if(R.anim&&R.anim.tipo==="salida"){const SB=TYB,m1=SB.mods[SB.mods.length-1][1],L0=TY.LAP,ya=R.anim.corte||(R.anim.corte=R.anim.items.some(o=>{const q=((o.e.s%L0)+L0)%L0;return q>SB.sal-4||q<60;})),CP=window.__salCam||(ya?[372,-10,8,350,14,1,70]:[m1+5,SB.road,7.5,m1-28,SB.road,.8,62]),c0=tyPose(CP[0],CP[1]),t0=tyPose(CP[3],CP[4]);E.cam.fov=asp<1?CP[6]+14:CP[6];E.cam.position.set(c0.x,CP[2],c0.z);E.cam.lookAt(t0.x,CP[5],t0.z);}
    else if(R.anim){const C=R.anim.cam,F=C?{s:C.fs,d:C.fd}:(R.anim.sigue||P),fp=tyPose(F.s,F.d),c0=C?tyPose(C.s,C.d):tyPose(F.s-11,F.d-3);const tgt=new TH.Vector3(c0.x,C?C.y:6.5,c0.z);if(!R.ap||R.ap.distanceTo(tgt)>40)R.ap=tgt.clone();else R.ap.lerp(tgt,Math.min(1,dt*3));E.cam.fov=asp<1?64:50;E.cam.position.copy(R.ap);E.cam.lookAt(fp.x,tyYc(F.s,F.d)+.8,fp.z);}
    if(E.cab&&R.cam!=="cabina")E.cab.visible=false;
    if(window.__tyCam){const q=window.__tyCam;E.cam.position.set(...q.p);E.cam.lookAt(...q.l);E.cam.fov=q.f||60;}
    E.cam.updateProjectionMatrix();
    ren.setClearColor(0x05070d,1);gfxRender(E.sc,E.cam,w,h);}
  else{ctx.fillStyle="#0a0d16";ctx.fillRect(0,0,w,h);ctx.fillStyle="#f3e9d2";ctx.font=`600 ${Math.round(h*.04)}px sans-serif`;ctx.textAlign="center";ctx.fillText(R.loading?"Preparando los midgets…":"",w/2,h/2);}
  if(R.esperaLuz)drawLights(ctx,w,h,R.phase);
  if(R.roja){ctx.fillStyle="rgba(200,20,30,.85)";ctx.fillRect(0,h*.42,w,h*.1);ctx.fillStyle="#fff";ctx.font=`900 ${Math.round(h*.06)}px 'Barlow Condensed',sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("BANDERA ROJA",w/2,h*.47);ctx.textBaseline="alphabetic";}
  // torre de posiciones
  const pos=R.pos.length?R.pos:tyPosiciones(R),yo=pos.indexOf(R.P),cssK=w/(ctx.canvas.clientWidth||w),fs=Math.round(Math.max(13*cssK,Math.min(h*.032,w*.045))),top0=Math.max(h*.12,(58*cssK)+fs);ctx.font=`700 ${fs}px "Barlow Condensed",sans-serif`;
  const show=pos.slice(0,5);if(yo>=5)show.push(R.P);const bw=Math.min(w*.62,fs*13.5);
  show.forEach((e,i)=>{const k=pos.indexOf(e),y=top0+i*fs*1.25;ctx.fillStyle=e.yo?"rgba(242,182,50,.92)":"rgba(10,12,18,.72)";ctx.fillRect(8,y-fs,bw,fs*1.15);
    ctx.fillStyle=e.yo?"#111":"#f3e9d2";ctx.textAlign="left";ctx.fillText(`${k+1}  #${e.num} ${e.n}`.slice(0,21),14,y);
    ctx.textAlign="right";ctx.fillStyle=e.yo?"#111":"#9fd3ff";ctx.fillText(e.out?"OUT":k===0?"":"+"+Math.max(0,(pos[0].dist-e.dist)/Math.max(8,e.v)).toFixed(1),8+bw-6,y);ctx.textAlign="left";});
  {const yv=top0+show.length*fs*1.25+fs*.35,lp=Math.min(R.laps,Math.max(1,Math.floor(Math.max(0,R.P.dist)/TY.LAP)+1));ctx.fillStyle="rgba(242,182,50,.92)";ctx.fillRect(8,yv-fs,bw,fs*1.2);
    ctx.fillStyle="#111";ctx.font=`900 ${fs}px "Barlow Condensed",sans-serif`;ctx.textAlign="center";ctx.fillText(R.green||R.done?`VUELTA ${lp} DE ${R.laps}${lp===R.laps&&R.green?" · ÚLTIMA":""}`:`${R.laps} VUELTAS`,8+bw/2,yv);ctx.textAlign="left";}
  if(!R.green&&!R.done&&!R.roja&&!R.podio&&!R.anim)tyPlacaGrilla(ctx,w,h,R,cssK);
  const P=R.P,lap=Math.min(R.laps,Math.max(1,Math.floor(P.dist/TY.LAP)+1));
  $("#tyP").textContent=`${yo+1}º/${R.cars.length}`;$("#tyL").textContent=`Vuelta ${lap}/${R.laps}`;
  $("#tySpd").innerHTML=`${Math.round(P.v*3.6)}<small>km/h</small>`;$("#tyTh").style.width=Math.round(P.th*100)+"%";
  const sa=Math.min(1,Math.max(0,P.sa)/1.12);const sb=$("#tySa");sb.style.width=Math.round(sa*100)+"%";sb.style.background=sa>.75?"var(--rojo)":sa>.45?"var(--oro)":"var(--verde)";
  if(R.msgT>0){R.msgT-=R.dt||0;if(R.msgT<=0)$("#tyMsgT").textContent="";}}

/* ---------- relato en carrera ---------- */
function tyRelato(R,now){if(!R.green||now-R.posAt<700)return;R.posAt=now;const pos=tyPosiciones(R);
  if(R.pos.length){let dijo=false;
    if(pos[0]!==R.pos[0]&&R.pos[0]&&R.t-R.tGreen>5&&!pos[0].out){narraF("lider",{a:pos[0],b:R.pos[0]});dijo=true;}
    if(!dijo&&now-(R.pasaAt||0)>5000){const cand=pos.map((e,i)=>({e,i,was:R.pos.indexOf(e)})).filter(o=>o.was>o.i&&!o.e.out&&!R.pos[o.i].out&&(o.i<5||o.e.yo||R.pos[o.i].yo))[0];
      if(cand){const b2=R.pos[cand.i],enCurva=tyCurva(cand.e.s)||tyCurva(cand.e.s-20);narraF(enCurva?(cand.e.d<b2.d?"adentro":"afuera"):"pasa",{a:cand.e,b:b2});R.pasaAt=now;dijo=true;}}
    if(!dijo&&now-(R.relAt||now)>10000&&Math.random()<.5){R.relAt=now;const pochon=pos.find(e=>e.id==="t0"&&!e.out);narraF(pochon&&Math.random()<.4?"pochon":"relleno",{a:pochon||pos[0]});}
    if(!R.relAt)R.relAt=now;
    const yo=pos.indexOf(R.P),antes=R.pos.indexOf(R.P);if(yo<antes)tyMsg(`¡Subiste al ${yo+1}º!`,"var(--verde)");else if(yo>antes&&!R.P.out)tyMsg(`Te pasaron: ${yo+1}º`,"#ffb4bd");}
  R.pos=pos;const lap=Math.floor(Math.max(...R.cars.filter(e=>!e.out).map(e=>e.dist))/TY.LAP)+1;
  if(lap!==R.lapN&&lap>1&&lap<=R.laps){R.lapN=lap;narraF(lap===R.laps?"ultima":"vuelta",{lap,a:pos[0]});}else R.lapN=R.lapN||lap;}

/* ---------- sonido: el motor tuyo, el ruido de todos los demás de fondo, la tribuna y los golpes ---------- */
const TYA={};
function tyAudioStart(){if(!AC||muted||noFx)return;tyAudioStop();
  const go=()=>{if(!TYR)return;const mk=(buf,vol,rate)=>{if(!buf)return null;const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=buf;s.loop=true;s.playbackRate.value=rate||1;f.type="lowpass";f.frequency.value=2200;g.gain.value=0;s.connect(f);f.connect(g);g.connect(AC.destination);s.start();return {s,f,g,vol};};
    TYA.yo=mk(SND.buf.medio||SND.buf.chico,.34);TYA.pack=[mk(SND.buf.chico,.1,.9),mk(SND.buf.medio,.08,1.1),mk(SND.buf.chico,.07,1.25)];
    // la tribuna: ruido rosa filtrado
    const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){l=.97*l+.03*(Math.random()*2-1);d[i]=l*3;}
    const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=b;s.loop=true;f.type="bandpass";f.frequency.value=900;f.Q.value=.6;g.gain.value=.05;s.connect(f);f.connect(g);g.connect(AC.destination);s.start();TYA.hinchada={s,f,g};};
  if(SND.buf.chico)go();else (loadSounds()||Promise.resolve()).then(go);}
function tyAudioSet(R){if(!AC||!TYA.yo)return;const t=AC.currentTime,P=R.P;
  const rpm=1400+Math.min(1,P.v/42)*6600*(P.th>.1?1:.85)+(R.green?0:P.th*3000);
  TYA.yo.s.playbackRate.setTargetAtTime(Math.max(.35,Math.min(3,rpm/5200)),t,.04);TYA.yo.f.frequency.setTargetAtTime(P.th>.3?3800:1400,t,.05);TYA.yo.g.gain.setTargetAtTime(P.out?0:(.45+P.th*.55)*TYA.yo.vol*VOL.mot,t,.06);
  // los demás: cuantos más cerca de la cámara, más fuerte
  const vivos=R.cars.filter(e=>!e.yo&&!e.out),cerca=vivos.filter(e=>Math.abs(e.dist-P.dist)<40).length,vm=vivos.length?vivos.reduce((a,e)=>a+e.v,0)/vivos.length:0;
  TYA.pack.forEach((p,i)=>{if(!p)return;p.s.playbackRate.setTargetAtTime(Math.max(.4,(.55+vm/42*1.25)*(1+i*.07)),t,.1);p.g.gain.setTargetAtTime(p.vol*VOL.mot*(R.green?1:.5)*Math.min(2.2,.6+cerca*.35),t,.15);});
  if(TYA.hinchada)TYA.hinchada.g.gain.setTargetAtTime(R.c.entreno?0:R.roja?.09:R.done?.12:.045,t,.3);}
function tyAudioStop(){["yo","hinchada"].forEach(k=>{const a=TYA[k];if(a){try{a.g.gain.setTargetAtTime(0,AC.currentTime,.05);const s=a.s;setTimeout(()=>{try{s.stop();}catch(e){}},300);}catch(e){}}TYA[k]=null;});
  (TYA.pack||[]).forEach(a=>{if(a){try{a.g.gain.setTargetAtTime(0,AC.currentTime,.05);const s=a.s;setTimeout(()=>{try{s.stop();}catch(e){}},300);}catch(e){}}});TYA.pack=[];}
// golpes sintetizados: toque (seco), roce (chirrido), paredón (estruendo) y vuelco (varios golpes y chapa)
function tySonido(tipo,vol){if(!AC||muted||noFx)return;const t0=AC.currentTime;
  const ruido=(t,dur,fq,q,g0,tipoF)=>{const n=Math.round(AC.sampleRate*dur),b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.2);
    const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=b;f.type=tipoF||"lowpass";f.frequency.value=fq;f.Q.value=q||1;g.gain.value=g0*(vol||1);s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t);};
  const metal=(t,fq,dur,g0)=>{const o=AC.createOscillator(),g=AC.createGain();o.type="square";o.frequency.setValueAtTime(fq,t);o.frequency.exponentialRampToValueAtTime(fq*.6,t+dur);g.gain.setValueAtTime(g0*(vol||1),t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+dur);};
  if(tipo==="toque"){ruido(t0,.18,700,1,.5);metal(t0,320,.12,.05);}
  else if(tipo==="roce"){ruido(t0,.5,2600,4,.25,"bandpass");}
  else if(tipo==="pared"){ruido(t0,.9,500,1,1);ruido(t0,.5,3000,2,.35,"bandpass");metal(t0,180,.5,.12);metal(t0+.05,410,.35,.06);}
  else if(tipo==="vuelco"){for(let i=0;i<5;i++){const t=t0+i*.28+Math.random()*.08;ruido(t,.4,450+i*80,1,.9-i*.12);metal(t,200+Math.random()*300,.3,.1);}ruido(t0+1.5,.8,2400,3,.2,"bandpass");}}

/* ---------- Fefón Marcelo: el relato ---------- */
const NARF={buf:null,map:null,q:[],busy:false,src:null,loading:false,gain:null};
const NAR_F4={"chiquito":"¡Daaale Chiquito, que arrancamos!","salida1":"¡Salen de boxes, loco! ¡Ahí van saliendo, uno atrás del otro!","salida2":"¡Se abre el portón de boxes y salen los TAYA'xs! ¡Mirá cómo vienen!","salida3":"¡Atención, que salen de boxes! ¡Abre la fila","salida4":"¡Rugen los fierros en los boxes! ¡Van saliendo, eh!","salida5":"¡Ahí asoman por la curva cuatro! ¡Salen de boxes, che!","grilla1":"¡Y se acomodan en la grilla!","entrada1":"¡Se terminó la carrera y vuelven todos a boxes!","previa1":"¡Atención Bahía Blanca, que se viene otra! ¡Motores en marcha, eh!","previa2":"¡Los TAYA'xs ya están en la grilla! ¡Que no pare la joda!","previa3":"¡Se prende fuego Aldea Romana! ¡Vamos con otra, dale!","previa4":"¡Siguen los TAYA'xs! ¡Agarrate fuerte, que esto vuela!","largada1":"¡Verde, verde, verde! ¡Largaron!","largada2":"¡Se larga! ¡Todos a fondo para la uno!","largada3":"¡Allá van los TAYA'xs! ¡Tierra para todos lados, mamita!","largada4":"¡Luz verde! ¡Pata a fondo, hasta el piso!","relarga1":"¡Relargada! ¡De nuevo en verde!","relarga2":"¡Se relarga la carrera! ¡Ojo con la primera curva, eh!","pasa_a":"¡pasa a","por_adentro":"¡se le tira por adentro a","por_afuera":"¡lo pasa por afuera, pegadito al paredón, a","atencion":"¡Ojo, ojo, ojo!","se_tira":"¡se le mete abajo a","nuevo_puntero":"¡Hay nuevo puntero, señores! ¡Ahora manda","toma_punta":"¡se queda con la punta!","vuelta":"¡Pasan por la llegada! Adelante va","manda":"¡Otra vuelta más! Sigue mandando","ultima1":"¡Última vuelta! ¡Campana! Adelante va","ultima2":"¡Se viene la última! Aguanta la punta","bandera1":"¡Bandera a cuadros! ¡Gana","bandera2":"¡Cruza la meta! ¡Se la lleva","bandera3":"¡Y el ganador es...","rueda1":"¡Se tocaron rueda con rueda","y":"¡y!","rueda2":"¡Se enganchan las ruedas! ¡Vuela el auto! ¡Qué palo, por Dios!","pared1":"¡Al paredón! ¡Se la dio de lleno","pared2":"¡Contra el paredón! ¡Uh, qué golpazo, loco!","trompo1":"¡Trompo! ¡Se le fue la cola a","trompo2":"¡Se le cruzó el auto! ¡Trompo en la curva!","choque1":"¡Choque! ¡Hay un palo en la pista!","roja1":"¡Bandera roja! ¡Se para todo! Entra la grúa.","roja2":"¡Roja, roja! ¡Frenan todos, hay autos en la pista!","pochon1":"¡Pochón! ¡Pochóóón! ¡El ídolo de la tribuna, cómo lo quiere la gente!","pochon2":"¡Ahí va Pochón, eh! ¡La tribuna se viene abajo!","pochon3":"¡Escuchá a la hinchada! ¡Po-chón! ¡Po-chón!","r1":"¡Qué nochecita de TAYA'xs en Bahía Blanca, eh!","r2":"¡Mucha tierra, mucho derrape! ¡Esto es TAYA'xs, papá!","r3":"¡Mirá cómo cruzan los autos en la curva!","r4":"¡Las tribunas están reventadas! ¡Hay banderas por todos lados!","r5":"¡Pata a fondo y contravolante! ¡Así se maneja un TAYA'xs!","r6":"¡Qué lindo suenan estos fierros a carburador, che!","podio1":"¡El ganador de la noche,","segundo":"en el segundo lugar,","tercero":"y completa el podio,","adios1":"¡Esto fue TAYA'xs! ¡Gracias, Bahía Blanca, son lo más! ¡Nos vemos en la próxima, eh!","adios2":"¡Se terminó la noche! ¡Un abrazo enorme a toda la gente! ¡Chau, chau, chau!","pueblo":"¡¡El piloto del pueblo!! ¡¡Vamos todavía, carajo!!","previa5":"¡Buenas noches, Bahía Blanca! ¡Las tribunas explotan y los fierros ya rugen!","previa6":"¡Ya forman de a cuatro! ¡Cuatro por fila, señores, esto es puro corazón!","previa7":"¡Se acomodan en la grilla! ¡Que nadie se levante de la tribuna, eh!","previa8":"¡Otra carrera, otra emoción! ¡Bahía Blanca no duerme esta noche!","previa9":"¡La tierra está regadita, la pista está un lujo! ¡Vamos que se larga!","largada5":"¡Bandera verde! ¡Salen los cuatro de adelante como piña!","largada6":"¡Arrancó la carrera! ¡Ojo en la uno, que vienen todos amontonados!","largada7":"¡Se fueron! ¡Qué largada, por favor, qué largada!","relarga3":"¡Vuelven a largar! ¡Otra vez de a cuatro, todos a fondo!","vuelta2":"¡Una vuelta menos! Al frente sigue","vuelta3":"¡Cruzan la recta principal! Va primero","vuelta4":"¡Pasa la punta frente a la tribuna! Ahí va","manda2":"¡No afloja ni un poquito! Sigue adelante","ultima3":"¡Bandera blanca! ¡Última vuelta! Adelante va","ultima4":"¡La piba sacude la bandera blanca! ¡Última vuelta! Manda","bandera4":"¡Bandera a cuadros! ¡Qué carrerón, señores! Ganó","bandera5":"¡Llegó primero! ¡Se lleva la carrera","roja3":"¡Paren todo! ¡Bandera roja en Bahía Blanca!","r7":"¡Mirá cómo le tiran tierra a la tribuna! ¡Y nadie se queja, eh!","r8":"¡Mamita querida, cómo doblan en la curva tres!","r9":"¡El que levanta la pata, pierde! ¡Esto es así, papá!","r10":"¡Vamos, vamos, que esto no termina más!","r11":"¡La gente de pie! ¡Nadie se sienta en Bahía Blanca!","r12":"¡Qué espectáculo! ¡Qué espectáculo, por favor!","r13":"¡Desde la cabina se siente el olor a nafta y a choripán!","r14":"¡Las chicas de la bandera no paran de saludar!","r15":"¡Cómo laburan los mecánicos en los boxes esta noche!","r16":"¡Fijate cómo tiran la cola en la curva! ¡Una locura total!","r17":"¡Esto es puro fierro y puro corazón, eh!","r18":"¡Un saludo grandote a toda la gente de Ingeniero White!","r19":"¡Ojo en la uno y en la dos, que se pone picante!","r20":"¡Para alquilar balcones, señores!","adios3":"¡Qué nochecita, Bahía Blanca! ¡Nos vemos en la próxima fecha de TAYA'xs!","adentro":"¡¡Por adentrooooo!!","afuera":"¡¡Por afueraaaaa!!","cuerda_int":"¡¡Por la cuerda internaaaa!!","cuerda_ext":"¡¡Por la cuerda externaaaa!!","r21":"¡Un saludo enorme a toda la gente de Cabildo!","r22":"¡Arriba Coronel Dorrego, que vino a alentar!","r23":"¡Un abrazo grandote para Punta Alta!","r24":"¡Saludos a la gente de Bajo Hondo, eh!","r25":"¡Y para todo Cerri, un saludo bien grande!","r26":"¡Villarino presente en la tribuna! ¡Un saludo!","r27":"¡Un saludo a los muchachos de Ituzaingó!","r28":"¡Arriba Villa del Parque, que se hace sentir!","r29":"¡Y un saludo para toda la gente de Coghlan!"};
const NARRA_F4={previa:[["f:previa1"],["f:previa2"],["f:previa3"],["f:previa4"],["f:previa5"],["f:previa6"],["f:previa7"],["f:previa8"],["f:previa9"]],largada:[["f:largada1"],["f:largada2"],["f:largada3"],["f:largada4"],["f:largada5"],["f:largada6"],["f:largada7"]],relargada:[["f:relarga1"],["f:relarga2"],["f:relarga3"]],
  pasa:[["a","f:pasa_a","b"],["a","f:por_adentro","b"],["a","f:por_afuera","b"],["f:atencion","a","f:pasa_a","b"],["a","f:se_tira","b"]],
  adentro:[["f:adentro","a"],["f:cuerda_int","a"],["f:adentro","a","f:pasa_a","b"]],afuera:[["f:afuera","a"],["f:cuerda_ext","a"],["f:afuera","a","f:pasa_a","b"]],
  lider:[["f:nuevo_puntero","a"],["a","f:toma_punta"],["f:atencion","a","f:toma_punta"]],
  vuelta:[["f:vuelta","a"],["f:manda","a"],["f:vuelta2","a"],["f:vuelta3","a"],["f:vuelta4","a"],["f:manda2","a"]],ultima:[["f:ultima3","a"],["f:ultima4","a"],["f:ultima2","a"]],
  bandera:[["f:bandera1","a"],["f:bandera2","a"],["f:bandera3","a"],["f:bandera4","a"],["f:bandera5","a"]],
  rueda:[["f:rueda1","a","f:y","b"],["f:rueda2"]],pared:[["f:pared1","a"],["f:pared2"]],trompo:[["f:trompo1","a"],["f:trompo2"]],choque:[["f:choque1"]],
  roja:[["f:roja1"],["f:roja2"],["f:roja3"]],pochon:[["f:pochon1"],["f:pochon2"],["f:pochon3"]],relleno:[["f:r1"], ["f:r2"], ["f:r3"], ["f:r4"], ["f:r5"], ["f:r6"], ["f:r7"], ["f:r8"], ["f:r9"], ["f:r10"], ["f:r11"], ["f:r12"], ["f:r13"], ["f:r14"], ["f:r15"], ["f:r16"], ["f:r17"], ["f:r18"], ["f:r19"], ["f:r20"], ["f:r21"], ["f:r22"], ["f:r23"], ["f:r24"], ["f:r25"], ["f:r26"], ["f:r27"], ["f:r28"], ["f:r29"]],
  podio:[["f:podio1","a","f:segundo","b","f:tercero","c"]],adios:[["f:adios1"],["f:adios2"],["f:adios3"]],chiquito:[["f:chiquito"]],entrada:[["f:entrada1"]]};
const NARF_BOLSA={};
// nombres de pila que Fefón grita para vos (elegís uno en "Tu midget")
const TY_VOCES=["Pablo","Nico","Gastón","Juan","Martín","Diego","Lucas","Matías","Facundo","Sebastián","Federico","Santiago","Agustín","Leandro","Maxi","Ezequiel","Gonzalo","Fernando","Marcelo","Hernán","Damián","Lautaro","Franco","Cristian","Rodrigo","Sofía","Valentina","Camila","Florencia","Micaela"];
const tySlug=n=>n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
function narraF(k,p){p=p||{};if(typeof TYR!=="undefined"&&TYR&&TYR.c.entreno)return;const L=NARRA_F4[k];if(!L)return;let b=NARF_BOLSA[k];if(!b||!b.length)b=NARF_BOLSA[k]=[...Array(L.length).keys()].sort(()=>Math.random()-.5);const seq=L[b.shift()];
  const clips=[],txt=[];for(const sg of seq){if(sg.startsWith("f:")){const f=sg.slice(2);txt.push(NAR_F4[f]||"");clips.push("f_"+f);continue;}
    const e=p[sg];if(!e)continue;if(e.yo||e.id==="yo"){const v=S.tyVoz&&TY_VOCES.find(x=>tySlug(x)===S.tyVoz);if(v){txt.push("¡"+v+"!");clips.push("n_yo_"+S.tyVoz);}else{txt.push("¡el piloto del pueblo!");clips.push("f_pueblo");}}else{txt.push(e.n||tyNombre(e.id));clips.push("n_"+(e.id||""));}}
  const prio=/largada|relargada|ultima|bandera|rueda|pared|trompo|roja|lider|podio|adios|previa|adentro|afuera|salida|entrada|chiquito/.test(k);
  if(!(muted||noVoz||!AC)){narLoadF();const it={clips,prio,t:performance.now()};if(prio){NARF.q=NARF.q.filter(x=>x.prio);NARF.q.push(it);}else if(NARF.q.length<1&&!(NARF.busy&&k==="pasa"))NARF.q.push(it);narPlayF();}
  if(TYR)tyMsg("🎙️ "+txt.join(" ").replace(/ ([,!.])/g,"$1"),"var(--celeste)");}
function narLoadF(){if(NARF.buf||NARF.loading||!AC)return;NARF.loading=true;
  Promise.all([fetch("taya/relato.json?v=70").then(r=>r.json()),fetch("taya/relato.mp3?v=70").then(r=>r.arrayBuffer())]).then(([m,ab])=>{NARF.map=m;return new Promise((res,rej)=>AC.decodeAudioData(ab,res,rej));}).then(b=>{NARF.buf=b;narPlayF();}).catch(()=>{NARF.loading=false;});}
function narPlayF(){if(NARF.busy||!NARF.q.length||!NARF.buf||!AC)return;const it=NARF.q.shift();if(!it.prio&&performance.now()-it.t>2500){narPlayF();return;}const cl=it.clips.filter(c=>c&&NARF.map[c]);if(!cl.length){narPlayF();return;}
  NARF.busy=true;if(!NARF.gain){NARF.gain=AC.createGain();NARF.gain.gain.value=1.2*VOL.rel;NARF.gain.connect(AC.destination);}
  let t=AC.currentTime+.03;const srcs=[];cl.forEach((c,i)=>{const [o,d]=NARF.map[c];const s=AC.createBufferSource(),g=AC.createGain();s.buffer=NARF.buf;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1,t+.02);g.gain.setValueAtTime(1,t+Math.max(.03,d-.04));g.gain.linearRampToValueAtTime(0,t+d);
    s.connect(g);g.connect(NARF.gain);s.start(t,o,d);srcs.push(s);t+=d+(i<cl.length-1?.05:0);});
  NARF.src=srcs;srcs[srcs.length-1].onended=()=>{NARF.src=null;setTimeout(()=>{NARF.busy=false;narPlayF();},400);};}
function narStopF(){NARF.q=[];if(NARF.src)NARF.src.forEach(s=>{try{s.onended=null;s.stop();}catch(e){}});NARF.src=null;NARF.busy=false;}
const narLibreF=()=>!NARF.busy&&!NARF.q.length;
// la presentación de Fefón (la toma aprobada) al comienzo de la noche
function fefonIntro(done){if(muted||noVoz){done();return;}const a=new Audio("taya/fefon_intro.mp3");a.volume=1;let ok=false;const fin=()=>{if(ok)return;ok=true;done();};
  a.onended=fin;a.onerror=fin;a.play().catch(fin);setTimeout(fin,12000);if(TYR)tyMsg("🎙️ ¡Muy buenas noches, Bahía Blanca! Soy Fefón Marcelo, el hermano de Sebastián Cessna… ¡como los aviones!","var(--celeste)");}
// las chicas anuncian cada carrera desde la cabina (se turnan la rubia y la morocha)
function tyAnuncio(c,done){if(!TYR){done();return;}
  const ov=el(`<div class="tyanun"><div><small>Próxima carrera</small><b>${esc(c.nom)}</b><span>${c.laps} vueltas · ${c.ids.length} autos</span></div></div>`);$("#tyRace").append(ov);
  setTimeout(()=>{ov.remove();done();},2400);}

/* ---------- la vuelta de la F-100 con el podio ---------- */
const TY_F100_POD=[1.80,1.59,1.59],TY_F100_PX=[-1.1,-1.8,-0.4],TY_F100_PZ=-0.42,TY_F100_X=-1.55;
function tyPodio(ids,done){if(!ids.length||!ready3D()){done();return;}
  const E=tyEnvEst(),TH=T3.TH;E.cars.forEach(c=>c.visible=false);tyUI(true);document.body.classList.add("typodio");
  const fake={cars:[],P:{s:0,d:0,v:0,th:0,sa:0,dist:0,num:0,n:"",out:null},pos:[],laps:1,g3:true,green:false,cam:"lado",t:5,relargadas:1,podio:true};
  const real=TY3.mod.f100;const camioneta=real?(()=>{const g=new TH.Group();g.add(real.clone(true));const fa=new TH.PointLight(0xfff0c0,1.2,18);fa.position.set(3,1,0);g.add(fa);return g;})():tyF100(TH);E.sc.add(camioneta);
  // los tres pilotos arriba del podio, en la caja de la camioneta
  const podY=real?TY_F100_POD:[1.85,1.6,1.45],podX=real?TY_F100_X:-1.4;
  const pilotos=ids.map((id,i)=>{const g=tyPilotoReal(TH,id)||tyPilotoFig(TH,id);if(g.userData.real)g.rotation.y=(i===1?.3:i===2?-.3:0); /* miran hacia las tribunas */else g.scale.setScalar(1.05);if(real)g.position.set(TY_F100_PX[i],podY[i],TY_F100_PZ);else g.position.set(podX,podY[i],i===0?0:i===1?-.6:.6);camioneta.add(g);return g;});
  narStopF();const bgmWas=!BGM.paused;tyCumbia(true);
  const nm=ids.map(id=>({id,n:tyNombre(id),yo:id==="yo"}));narraF("podio",{a:nm[0],b:nm[1],c:nm[2]});
  tyMsg(`🏆 1º ${tyNombre(ids[0])} · 2º ${ids[1]?tyNombre(ids[1]):"-"} · 3º ${ids[2]?tyNombre(ids[2]):"-"}`,"var(--oro)");
  let s=0,t0=performance.now(),dijoAdios=false,fin=false;
  const sk=el(`<button class="tyskip">Saltar podio ⏭</button>`);$("#tyRace").append(sk);
  const end=()=>{if(fin)return;fin=true;sk.remove();E.sc.remove(camioneta);document.body.classList.remove("typodio");tyUI(false);tyCumbia(false);done();};
  $("#tyQuit").onclick=end;sk.onclick=end;
  const loop=now=>{if(fin)return;const tt=(now-t0)/1000;s=tt*7;const p=tyPose(s+10,2);const yA=tyY(s+10,.9),yB=tyY(s+10,3.1);camioneta.position.set(p.x,Math.max(yA,yB)*.5+Math.min(yA,yB)*.5+.06,p.z);camioneta.rotation.set(0,p.h,0);camioneta.rotateX(Math.atan2(yB-yA,2.2));
    pilotos.forEach((g,i)=>{if(g.userData.real){g.position.y=podY[i]+Math.abs(Math.sin(tt*3.2+i*1.3))*.05;}else g.children[2].rotation.z=Math.sin(tt*6+i)*.6-1.2;});
    fake.P.s=s+10;fake.P.d=2;
    const cv=$("#tyScene"),dpr=Math.min(2,devicePixelRatio||1);if(cv.width!==Math.round(cv.clientWidth*dpr)){cv.width=Math.round(cv.clientWidth*dpr);cv.height=Math.round(cv.clientHeight*dpr);}
    const w=cv.width,h=cv.height,ctx=cv.getContext("2d");E.cam.aspect=w/h;const c0=tyPose(s+10+4.2,TY.W/2-1);E.cam.position.set(c0.x,tyY(s+14,TY.W/2)+3,c0.z);E.cam.lookAt(p.x,2.7,p.z);E.cam.fov=w<h?62:46; /* desde la tribuna: se les ven las caras */if(window.__podCam){const q=window.__podCam;E.cam.position.set(p.x+q[0],q[1],p.z+q[2]);E.cam.lookAt(p.x,1.5,p.z);}E.cam.updateProjectionMatrix();
    for(const f of E.flags){f.piv.rotation.y=f.h+Math.PI/2+Math.sin(tt*2.6+f.ph)*1.1;}
    const ren=T3.ren;if(ren.domElement.width!==w||ren.domElement.height!==h)ren.setSize(w,h,false);ren.render(E.sc,E.cam);ctx.drawImage(ren.domElement,0,0,w,h);cineFX(ctx,w,h,"noche");
    ctx.fillStyle="rgba(10,12,18,.72)";ctx.fillRect(0,h*.06,w,h*.09);ctx.fillStyle="#f2b632";ctx.font=`900 ${Math.round(h*.045)}px 'Alfa Slab One',serif`;ctx.textAlign="center";ctx.fillText("¡VUELTA DEL PODIO!",w/2,h*.12);
    if(tt>9&&!dijoAdios&&narLibreF()){dijoAdios=true;narraF("adios",{});tyMsg("🎙️ ¡Esto fue TAYA'xs! ¡Gracias, Bahía Blanca! Fefón Marcelo se despide… ¡como los aviones!","var(--celeste)");}
    if(tt>26||(dijoAdios&&tt>14&&narLibreF()&&tt>20))end();else requestAnimationFrame(loop);};
  requestAnimationFrame(loop);}
// la camioneta: una F-100 de los 70 con el podio armado en la caja
function tyF100(TH){const g=new TH.Group(),std=o=>new TH.MeshStandardMaterial(o);const pint=std({color:0x1d4f91,roughness:.45,metalness:.3}),blanco=std({color:0xeeeeee,roughness:.5}),cromo=std({color:0xdddddd,metalness:.9,roughness:.2}),negro=std({color:0x111111,roughness:.8}),vidrio=std({color:0x223344,roughness:.1,metalness:.6});
  const box=(w,h,d,m,x,y,z)=>{const b=new TH.Mesh(new TH.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);return b;};
  box(1.6,.75,1.95,pint,1.75,.95,0);box(.06,.5,1.7,cromo,2.57,.92,0);box(.1,.18,2,cromo,2.6,.55,0);// trompa, parrilla, paragolpes
  box(1.35,.95,1.95,pint,.55,1.32,0);box(1.0,.55,1.9,vidrio,.62,1.55,0);box(.05,.5,1.6,vidrio,1.22,1.5,0);box(1.4,.08,1.98,blanco,.55,1.84,0);// cabina
  box(2.6,.6,1.95,pint,-1.45,.9,0);box(2.6,.06,1.95,std({color:0x5a3d22}),-1.45,1.0,0);// caja
  box(.1,.2,2,cromo,-2.8,.55,0);for(const [x,z] of [[1.75,1],[1.75,-1],[-1.6,1],[-1.6,-1]]){const r=new TH.Mesh(new TH.CylinderGeometry(.42,.42,.3,16),negro);r.rotation.x=Math.PI/2;r.position.set(x,.42,z*.92);g.add(r);}
  // podio en la caja: 1, 2 y 3
  const podM=std({color:0xf2f2f2}),oro=std({color:0xf2b632,metalness:.6,roughness:.3});
  box(.8,.6,.55,podM,-1.4,1.3,0);box(.8,.35,.55,podM,-1.4,1.18,-.55);box(.8,.2,.55,podM,-1.4,1.1,.55);box(.3,.3,.02,oro,-1.0,1.35,0.28);
  const faro=new TH.PointLight(0xfff0c0,1.2,18);faro.position.set(2.8,1,0);g.add(faro);return g;}
function tyPiloto(id){return id==="yo"?{col:tyState().col}:TY_P[id]||(TYV&&TYV.info[id])||{col:"#ccc"};}
// un piloto con el buzo de su color, saludando con el brazo en alto (Pochón con su gorra amarilla)
// piloto de verdad (modelo de Meshy): el buzo blanco toma el color del piloto, la cara y las manos quedan
function tyPersona(f,alto){TY3.per=TY3.per||{};if(TY3.per[f])return Promise.resolve(TY3.per[f]);if(TY3.per["_"+f])return TY3.per["_"+f];
  const base="taya/"+f+"/",get=x=>fetch(base+x).then(r=>{if(!r.ok)throw new Error(x);return r.text();});
  return TY3.per["_"+f]=init3D().then(ok=>{if(!ok)throw 0;return Promise.all([get("model.json"),get("geo.txt")]);}).then(([js,b64])=>new Promise((res,rej)=>T3.loader.parse(makeGLB(js,b64),base,g=>{
    const TH=T3.TH,o=g.scene,h=new TH.Group();h.add(o);h.updateMatrixWorld(true);let b=new TH.Box3().setFromObject(h);const k=alto/(b.max.y-b.min.y);o.scale.multiplyScalar(k);
    h.updateMatrixWorld(true);b=new TH.Box3().setFromObject(h);const c=b.getCenter(new TH.Vector3());o.position.set(-c.x,-b.min.y,-c.z);TY3.per[f]=h;res(h);},rej)));}
function tyPilotoReal(TH,id){const src=TY3.per&&TY3.per.piloto;if(!src)return null;const g=src.clone(true),tint=new TH.Color(tyPiloto(id).col);
  g.traverse(q=>{if(q.isMesh){q.material=q.material.clone();q.material.roughness=.7;q.material.metalness=0;
    q.material.onBeforeCompile=sh=>{sh.uniforms.uTint={value:tint};sh.fragmentShader="uniform vec3 uTint;\n"+sh.fragmentShader.replace("#include <map_fragment>","#include <map_fragment>\n{vec3 c=diffuseColor.rgb;float l=max(c.r,max(c.g,c.b)),sat=l-min(c.r,min(c.g,c.b));float w=smoothstep(.5,.78,l)*(1.-smoothstep(.07,.2,sat));diffuseColor.rgb=mix(c,uTint*l*1.05,w);}");};}});
  if(false){const m=new TH.MeshStandardMaterial({color:0xf2c230,roughness:.6}),y=1.78*.985;const gor=new TH.Mesh(new TH.SphereGeometry(.12,14,8,0,Math.PI*2,0,Math.PI/2),m);gor.position.set(0,y-.1,0);g.add(gor);
    const vis=new TH.Mesh(new TH.CylinderGeometry(.11,.11,.015,14,1,false,-Math.PI/2,Math.PI),m);vis.position.set(0,y-.1,.08);g.add(vis);}
  g.userData.real=true;return g;}
function tyPilotoFig(TH,id){const g=new TH.Group(),c=new TH.Color(tyPiloto(id).col),m=new TH.MeshStandardMaterial({color:c,roughness:.7});
  const cuerpo=new TH.Mesh(new TH.CylinderGeometry(.2,.22,.8,10),m);cuerpo.position.y=.4;g.add(cuerpo);
  const cab=new TH.Mesh(new TH.SphereGeometry(.15,12,10),new TH.MeshStandardMaterial({color:id==="t0"?0x7a4b2a:0xe0ac80}));cab.position.y=.95;g.add(cab);
  const brazo=new TH.Group();brazo.position.set(0,.72,.2);const b=new TH.Mesh(new TH.CylinderGeometry(.05,.05,.55,8),m);b.position.y=.27;brazo.add(b);g.add(brazo);
  if(false){const gorra=new TH.Mesh(new TH.CylinderGeometry(.16,.16,.1,12),new TH.MeshStandardMaterial({color:0xf2c230}));gorra.position.y=1.06;g.add(gorra);const vis=new TH.Mesh(new TH.BoxGeometry(.18,.02,.14),new TH.MeshStandardMaterial({color:0xf2c230}));vis.position.set(.14,1.02,0);g.add(vis);}
  return g;}
// música de la noche (la cumbia de Pochón ya no va)
const CUMBIA=new Audio();CUMBIA.preload="none";
function tyCumbia(on){try{CUMBIA.pause();}catch(e){}} /* la música de la noche se cambia: por ahora sin tema */

/* ---------- pantalla del nivel ---------- */
function vTaya(m){const T=tyState();
  const reg=T.fecha<TY_REG,po=T.po,yoVivo=po&&po.vivos.includes("yo");
  m.append(el(`<div><h2>TAYA'xs</h2><p class="sub">Midgets en el óvalo de tierra de Bahía Blanca, de noche y con las tribunas llenas. Autos sin caja: se doblan derrapando y el acelerador es el volante. Cada noche son series, repechajes, semis, prefinal y la Gran Final. Un toque rueda con rueda o un golpe contra el paredón y se terminó tu noche.</p></div>`));
  const fase=T.fecha>=TY_FECHAS?"Campeonato terminado":reg?`Fecha ${T.fecha+1} de ${TY_FECHAS} · temporada regular (${TY_REG} fechas)`:`Fecha ${T.fecha+1} de ${TY_FECHAS} · playoff de ${po?po.vivos.length:12}`;
  const box=el(`<div class="copa"><div class="row" style="justify-content:space-between;align-items:center;gap:10px"><div><div class="t">Campeonato TAYA'xs</div><div class="s">${esc(fase)}</div></div>
    <button class="btn oro" id="tyGo">${T.fecha>=TY_FECHAS?"Nueva temporada":S.tayaJ?"Seguir la noche":"Correr la fecha "+(T.fecha+1)}</button></div></div>`);
  m.append(box);
  box.querySelector("#tyGo").onclick=()=>{if(TYR)return;if(T.fecha>=TY_FECHAS){S.taya=null;tyState();render();return;}
    let J=S.tayaJ;if(!J){J=S.tayaJ=tyJornadaNueva();save();}
    const c=tySiguiente(J);if(!c||J.fuera){tyTerminarNoche(J);return;}
    modal(`<h3 class="gan">Noche de TAYA'xs · Fecha ${J.fecha}</h3><p>${J.ent.length} autos en el autódromo. ${J.carreras?"Te toca":"Arrancás en"} la <b>${esc(c.nom)}</b> (${c.laps} vueltas, ${c.ids.length} autos). Se larga de a 4 por fila. Pasan a las semis los 32 mejores tiempos de las series; el resto va al repechaje. Las gomas aguantan 3 carreras: en el box usás lo que tenés en stock.</p>
      <p class="nota">Acelerá en verde. En las curvas el auto derrapa: si le das de más se va contra el paredón o hace un trompo; si le das de menos te pasan. ◀ te lleva para adentro, ▶ para afuera (contravolante).</p><div id="tyBoxW"></div><div class="opts"><button class="btn oro" id="tyL">¡A la pista!</button>${J.carreras?'<button class="btn sec" id="tyAb">Abandonar la noche e ir al taller</button>':""}</div>`,"resplaca");if($("#tyAb"))$("#tyAb").onclick=()=>tyRetiro(J);
    const bL=$("#tyL"),chk=()=>{const v=pzPuedeLargar(J);bL.disabled=!!v;bL.textContent=v||"¡A la pista!";};
    if(J.carreras){const bx=tyBox(J,chk);$("#tyBoxW").append(bx());}chk();
    bL.onclick=()=>{if(pzPuedeLargar(J))return;closeModal();tyLargar(c,J);};};
  tyAmigosCard(m);
  // tu midget
  const enNoche=!!S.tayaJ;
  const car=el(`<div class="copa"><div class="t">Tu midget</div><div class="s">Chasis ${TY_HUMAN[T.m]} · número ${T.num}. Cambiar de chasis cuesta ${fmt(TY_CHASIS_P)} y no se puede con la noche empezada.</div>
    <div class="row" style="flex-wrap:wrap;gap:6px;margin:8px 0">${TY_M.map(k=>`<button class="btn sm ${T.m===k?"oro":"sec"}" data-m="${k}">${TY_HUMAN[k]}</button>`).join("")}</div>
    <div class="row" style="flex-wrap:wrap;gap:6px">${TY_COL.slice(0,10).map(c=>`<button aria-label="color" data-c="${c}" style="width:30px;height:30px;border-radius:50%;background:${c};border:3px solid ${T.col===c?"var(--oro)":"var(--linea)"}"></button>`).join("")}</div>
    <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:10px">
      <button class="btn sm" id="tyUpM">Carburación ${T.up.motor}/4 · ${T.up.motor<4?fmt(60000*(T.up.motor+1)):"al máximo"}</button>
      <button class="btn sm" id="tyUpG">Cubiertas ${T.up.gomas}/4 · ${T.up.gomas<4?fmt(45000*(T.up.gomas+1)):"al máximo"}</button></div>
      <button class="btn sm" id="tyRect"${T.desg<.01||enNoche?" disabled":""}>Rectificar motor · ${fmt(TY_RECT_P)}</button></div>
    <p class="nota" style="margin:8px 0 0">Motor Audi AP a carburador: ${Math.round((168+T.up.motor*3)*tyMotorK())} HP para 455 kg (motor al ${tyPct(tyMotorK())}). Sin caja de cambios. El motor se gasta con cada carrera y solo se rectifica fuera de la noche.${enNoche?" Con la noche empezada solo podés tocar las gomas y hacer el service, desde el box.":""}</p></div>`);
  {const r=el(`<div class="row" style="gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap"><span style="font-weight:700">Fefón te grita:</span><select id="tyVozSel" style="padding:8px;border-radius:10px;background:var(--chapa);color:var(--crema);border:2px solid var(--linea);font-weight:800"><option value="">el piloto del pueblo</option>${TY_VOCES.map(n=>`<option value="${tySlug(n)}"${S.tyVoz===tySlug(n)?" selected":""}>¡${n}!</option>`).join("")}</select></div>`);
    car.append(r);r.querySelector("#tyVozSel").onchange=ev=>{S.tyVoz=ev.target.value||null;save();if(S.tyVoz){narLoadF();narraF("adentro",{a:{yo:true}});}};}
  car.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{const k=b.dataset.m;if(k===T.m)return;
    if(S.tayaJ){toast("Con la noche empezada no se puede cambiar el chasis");return;}
    if(S.pesos<TY_CHASIS_P){toast("Cambiar de chasis cuesta "+fmt(TY_CHASIS_P));return;}
    modal(`<h3 class="gan">¿Comprar el chasis ${TY_HUMAN[k]}?</h3><p>Cuesta ${fmt(TY_CHASIS_P)}. Tenés ${fmt(S.pesos)}.</p><div class="opts"><button class="btn oro" id="tyCh">Comprar</button><button class="btn sec" id="tyNo">No</button></div>`,"resplaca");
    $("#tyCh").onclick=()=>{S.pesos-=TY_CHASIS_P;T.m=k;save();closeModal();render();};$("#tyNo").onclick=()=>closeModal();});
  car.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{T.col=b.dataset.c;save();render();});
  const comprar=(k,base)=>{const n=T.up[k];if(n>=4)return;if(k==="motor"&&S.tayaJ){toast("Con la noche empezada no se toca el motor");return;}const p=base*(n+1);if(S.pesos<p){toast("No te alcanza la plata");return;}S.pesos-=p;T.up[k]=n+1;save();render();};
  car.querySelector("#tyUpM").onclick=()=>comprar("motor",60000);car.querySelector("#tyUpG").onclick=()=>comprar("gomas",45000);
  car.querySelector("#tyRect").onclick=()=>{if(S.tayaJ||T.desg<.01)return;if(S.pesos<TY_RECT_P){toast("No te alcanza la plata");return;}S.pesos-=TY_RECT_P;T.desg=0;save();toast("Motor rectificado: 100%");render();};
  m.append(car);
  // tabla del campeonato
  const tab=tyTabla(),yoI=tab.findIndex(r=>r.id==="yo");const vis=tab.slice(0,20);if(yoI>=20)vis.push(tab[yoI]);
  m.append(el(`<div class="sec-t">${po?"Playoff y campeonato":"Campeonato"} <span>${tab.length} pilotos · vas ${yoI+1}º</span></div>`));
  m.append(el(`<table class="ovtab"><tr><th>Pos</th><th>Piloto</th>${po?"<th>Playoff</th>":""}<th>Pts</th></tr>${vis.map(r=>`<tr${r.id==="yo"?' class="yo"':''}><td>${tab.indexOf(r)+1}</td><td>#${tyNum(r.id)} ${esc(tyNombre(r.id))}${r.id==="t0"?" 🟡":""}</td>${po?`<td>${r.vivo?r.po:"—"}</td>`:""}<td>${r.p}</td></tr>`).join("")}</table>`));
  if(T.hist.length)m.append(el(`<p class="nota">Última noche: sumaste ${T.hist[0].yo} puntos${T.hist[0].pos>=0?` y llegaste ${T.hist[0].pos+1}º en la final`:""}.</p>`));
  if(PRUEBA){const rz=el(`<button class="btn sec sm" style="margin:10px 0">↺ Reiniciar TAYA'xs (prueba)</button>`);rz.onclick=()=>{S.taya=null;S.tayaJ=null;tyState();save();toast("Campeonato reiniciado");render();};m.append(rz);}}

/* =====================================================================
   TAYA'xs CON AMIGOS: carreras en vivo de hasta 12 (desafío y campeonato)
   - cada celular maneja su auto y manda su posición; los demás autos se dibujan con lo que llega
   - las máquinas (si se completa la grilla) las corre el que organiza y las manda a todos
   - la grilla se arma por el avance de cada uno en el juego (en el campeonato, por la tabla)
   ===================================================================== */
var TYV=null; // {room,code,modo,peers,st,me,go,host,info,tabla}
const TYV_MAX=12;
function tyVivoAvance(){const T=tyState();return (T.fecha|0)*1000+(T.pts.yo|0)*10+((T.up.motor|0)+(T.up.gomas|0))*40+(T.champ==="yo"?5000:0);}
function tyVivoCodigo(){const A="ABCDEFGHJKLMNPQRSTUVWXYZ";let c="";for(let i=0;i<4;i++)c+=A[Math.floor(Math.random()*A.length)];return c;}
function tyVivoPedirCodigo(tit,cb){modal(`<h3>${tit}</h3><p>Escribí el código de 4 letras que te pasó tu amigo.</p><input id="tyvC" maxlength="4" autocapitalize="characters" style="width:100%;font-size:28px;letter-spacing:8px;text-align:center;padding:10px;border-radius:12px;border:2px solid var(--linea);background:var(--chapa);color:var(--crema);text-transform:uppercase"><div class="opts"><button class="btn oro" id="tyvOk">Entrar</button><button class="btn sec" id="tyvNo">Cancelar</button></div>`);
  const ok=()=>{const v=($("#tyvC").value||"").toUpperCase().replace(/[^A-Z]/g,"");if(v.length!==4){toast("El código tiene 4 letras");return;}closeModal();cb(v);};$("#tyvOk").onclick=ok;$("#tyvNo").onclick=closeModal;$("#tyvC").addEventListener("keydown",e=>{if(e.key==="Enter")ok();});setTimeout(()=>{try{$("#tyvC").focus();}catch(e){}},50);}
function tyVivoPres(extra){if(!TYV||!TYV.room)return;const T=tyState();
  return TYV.room.presence({apodo:(S.apodo||"Piloto").slice(0,16),num:T.num,m:T.m,col:T.col,av:tyVivoAvance(),uid:NET.uid||null,sala:1,...(extra||{})}).catch(()=>{});}
async function tyVivoEntrar(modo,code){if(TYR)return;if(!NET.room||!NET.room.join){toast("Jugar con amigos necesita conexión");return;}
  if(!S.apodo){toast("Primero elegí tu apodo");return;}
  modalLock=true;modal(`<h3>${modo==="fecha"?"Campeonato con amigos":"Desafío con amigos"}</h3><p>Conectando a la sala ${esc(code)}…</p>`);
  let room;try{room=await NET.room.join("tyv_"+(modo==="fecha"?"f_":"r_")+code);}catch(e){modalLock=false;closeModal();toast("No se pudo conectar");return;}
  TYV={room,code,modo,peers:[],st:{},me:null,go:false,info:{},tabla:null};tyVivoPres();
  if(modo==="fecha")tyVivoTablaLeer().then(()=>{if(TYV&&!TYV.go)tyVivoSala();});
  room.onPeers(ch=>{if(!TYV||TYV.room!==room)return;TYV.peers=ch.peers.filter(p=>p.presence&&p.presence.apodo);
    for(const p of TYV.peers){if(p.sameTab)TYV.me=p.peer;const q=p.presence;if(q&&q.en)TYV.st[p.peer]={...q,rt:performance.now()};}
    for(const l of ch.left||[]){if(TYV.st[l.peer])TYV.st[l.peer].gone=1;}
    if(!TYV.go)tyVivoSala();},()=>{});
  room.on("largada",m=>{if(!TYV||TYV.go||TYV.room!==room)return;const d=m.data||{};if(d.ty!==1||!Array.isArray(d.grid)||!d.grid.some(g=>g.peer===TYV.me))return;tyVivoArrancar(d);},()=>{});
  tyVivoSala();}
function tyVivoOrden(ps){const pts=uid=>TYV.tabla&&TYV.tabla.t&&uid&&TYV.tabla.t[uid]?TYV.tabla.t[uid].pts|0:0;
  return ps.slice().sort((a,b)=>TYV.modo==="fecha"?(pts(b.presence.uid)-pts(a.presence.uid))||((b.presence.av|0)-(a.presence.av|0)):((b.presence.av|0)-(a.presence.av|0)));}
function tyVivoSala(){if(!TYV||TYV.go)return;const ps=tyVivoOrden(TYV.peers.filter(p=>p.presence.sala&&!p.presence.en)).slice(0,TYV_MAX);
  const host=ps.map(p=>p.peer).sort()[0],soy=host&&host===TYV.me,fecha=TYV.modo==="fecha";
  const tab=fecha&&TYV.tabla&&TYV.tabla.t?Object.values(TYV.tabla.t).sort((a,b)=>b.pts-a.pts):[];
  modalLock=true;modal(`<h3>${fecha?"Campeonato con amigos":"Desafío con amigos"} · código <span style="color:var(--oro);letter-spacing:3px">${esc(TYV.code)}</span></h3>
    <p>Pasales el código a tus amigos: entran desde TAYA'xs → <b>Con amigos</b>. Hasta ${TYV_MAX} pilotos, carrera del largo de una final (${TY.LAPS.final} vueltas). ${fecha?"La grilla sale de la tabla del campeonato.":"La grilla sale del avance de cada uno en el juego: el que más avanzó larga adelante."}</p>
    <table class="ovtab"><tr><th>Larga</th><th>Piloto</th><th>Chasis</th></tr>${ps.map((p,i)=>`<tr${p.sameTab?' class="yo"':''}><td>${i+1}º</td><td>#${p.presence.num|0} ${esc(p.presence.apodo)}${p.peer===host?" · organiza":""}</td><td>${esc(TY_HUMAN[p.presence.m]||"")}</td></tr>`).join("")}</table>
    ${fecha?`<div class="sec-t">Tabla del campeonato <span>${TYV.tabla?(TYV.tabla.n|0)+" fechas":"…"}</span></div>${tab.length?`<table class="ovtab"><tr><th>Pos</th><th>Piloto</th><th>Pts</th></tr>${tab.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.n)}</td><td>${r.pts}</td></tr>`).join("")}</table>`:`<p class="nota">Todavía no se corrió ninguna fecha.</p>`}`:""}
    <p class="nota">${soy?"Vos organizás: largá cuando estén todos.":"Esperá a que el que organiza largue la carrera."}</p><div class="opts" id="tyvo"></div>`,"resplaca");
  const o=$("#tyvo");if(soy){const b=el(`<button class="btn oro">🏁 Largar con máquinas (${ps.length} + ${Math.max(0,TYV_MAX-ps.length)} = ${TYV_MAX})</button>`);b.onclick=()=>tyVivoLargar(ps,true);o.append(b);
    const m=el(`<button class="btn">🤝 Mano a mano (solo los ${ps.length} conectado${ps.length===1?"":"s"})</button>`);m.disabled=ps.length<2;m.title=ps.length<2?"Hacen falta al menos 2 pilotos conectados":"";m.onclick=()=>tyVivoLargar(ps,false);o.append(m);}
  const x=el(`<button class="btn sec">Salir de la sala</button>`);x.onclick=()=>{tyVivoSalir();modalLock=false;closeModal();render();};o.append(x);}
function tyVivoLargar(ps,maq){if(!TYV)return;const usados=new Set(),grid=[];
  const libre=n=>{n=Math.max(1,n|0);while(usados.has(n))n=n%199+1;usados.add(n);return n;};
  ps.forEach(p=>{const q=p.presence;grid.push({peer:p.peer,apodo:String(q.apodo).slice(0,16),num:libre(q.num),m:q.m,col:q.col,uid:q.uid||null});});
  let bots=[];if(maq&&grid.length<TYV_MAX){const pool=TY_PIL.map(p=>p.id).sort((a,b)=>tyRating(b)-tyRating(a));
    bots=pool.slice(0,30).sort(()=>Math.random()-.5).slice(0,TYV_MAX-grid.length).map(id=>({id,num:libre(TY_P[id].num)}));}
  const n=TYV.tabla?(TYV.tabla.n|0)+1:1;
  TYV.room.emit("largada",{ty:1,t0:(NET.now?NET.now():Date.now())+9000,host:TYV.me,grid,bots,laps:TY.LAPS.final,modo:TYV.modo,fecha:n}).catch(()=>toast("No se pudo largar: probá de nuevo"));}
function tyVivoArrancar(d){TYV.go=true;TYV.host=d.host;TYV.d=d;modalLock=false;closeModal();
  const ids=[];d.grid.forEach(g=>{if(g.peer===TYV.me){ids.push("yo");TYV.miNum=g.num;return;}const id="p_"+g.peer;TYV.info[id]={apodo:g.apodo,num:g.num,m:g.m,col:g.col,uid:g.uid};ids.push(id);});
  (d.bots||[]).forEach(b=>ids.push(b.id));
  const c={k:"vivo",n:1,nom:d.modo==="fecha"?`Fecha ${d.fecha} con amigos`:"Desafío con amigos",ids,laps:d.laps||TY.LAPS.final,vivo:d};
  const J={vivo:true,yaPresento:true,res:{},fuera:false};tyVivoPres({en:1,dist:0,d:0,v:0});tyLargar(c,J);}
// quién maneja cada auto: el mío acá; los de los amigos llegan por la red; las máquinas, del que organiza
function tyVivoMarcar(cars,d){const host=d.host===TYV.me;let k=0;
  for(const e of cars){if(e.yo)continue;if(String(e.id).startsWith("p_")){e.remote=true;e.peer=e.id.slice(2);continue;}
    e.bk=k++;if(!host){e.remote=true;e.peer=d.host;}}}
function tyVivoRemoto(R,e){if(!R.green&&!R.done)return;const bot=e.bk!==undefined,h=TYV&&TYV.st[e.peer];let s=null;
  if(bot){if(h&&Array.isArray(h.b)&&h.b[e.bk]){const a=h.b[e.bk];s={dist:a[0],d:a[1],v:a[2],sa:a[3],fin:a[4],out:a[5],rt:h.rt};}
    // si el que organiza se fue, las máquinas siguen corriendo en este celular
    if(R.green&&(!h||h.gone||performance.now()-(h.rt||0)>4000)&&R.t-(R.tGreen||0)>3){e.remote=false;e.peer=null;return;}}
  else s=h;
  if(!s||s.dist===undefined){if(h&&h.gone&&!e.out&&e.fin===null&&!bot){e.out="abandono";e.outT=R.t;}return;}
  const pred=(+s.dist||0)+(+s.v||0)*Math.min(1,(performance.now()-s.rt)/1000);
  if(Math.abs(pred-e.dist)>30||!R.green)e.dist=pred;else e.dist+=(pred-e.dist)*Math.min(1,TYH*7);e.s=e.dist;
  e.d+=((+s.d||0)-e.d)*Math.min(1,TYH*8);e.v=+s.v||0;e.sa+=((+s.sa||0)-e.sa)*Math.min(1,TYH*8);e.th=e.v>1?.8:0;
  if(s.fin!=null&&e.fin===null)e.fin=+s.fin;
  if(s.out&&!e.out){e.out=s.out;e.outT=R.t;e.vuelco=s.out==="rueda";e.dmg=100;if(!R.narChoqueT||R.t-R.narChoqueT>3){R.narChoqueT=R.t;narraF(s.out==="pared"?"pared":s.out==="trompo"?"trompo":"choque",{a:e});}}
  if(h&&h.gone&&!e.out&&e.fin===null&&!bot){e.out="abandono";e.outT=R.t;}}
function tyVivoTick(R,now){if(!TYV||!TYV.room||now-(TYV.sent||0)<130)return;TYV.sent=now;const P=R.P,r1=x=>Math.round(x*100)/100;
  const q={en:1,dist:r1(P.dist),d:r1(P.d),v:r1(P.v),sa:r1(P.sa),fin:P.fin!=null?r1(P.fin):null,out:P.out||null};
  if(TYV.host===TYV.me)q.b=R.cars.filter(e=>e.bk!==undefined&&!e.remote).sort((a,b)=>a.bk-b.bk).map(e=>[r1(e.dist),r1(e.d),r1(e.v),r1(e.sa),e.fin!=null?r1(e.fin):null,e.out||null]);
  tyVivoPres(q);}
function tyVivoFin(R){if(TYR!==R)return;const pos=tyPosiciones(R),d=R.c.vivo,yo=pos.findIndex(e=>e.yo);
  TYR=null;tyBanderaBlanca(false);tyUI(false);tyAudioStop();if(pos[0])narraF("bandera",{a:pos[0]});
  const filas=pos.map((e,i)=>`<tr${e.yo?' class="yo"':''}><td>${i+1}</td><td>#${e.num} ${esc(e.n)}${e.remote&&e.bk===undefined||String(e.id).startsWith("p_")?" 👤":""}</td><td>${e.out?"Afuera":e.fin!=null?e.fin.toFixed(2)+" s":"—"}</td><td>${d.modo==="fecha"&&!e.out&&e.fin!=null?(TY_PTS_FINAL[i]||0):""}</td></tr>`).join("");
  const premio=yo===0&&!R.P.out?60000:yo>=0&&yo<3&&!R.P.out?20000:0;if(premio){S.pesos+=premio;save();}
  // campeonato: el que organiza anota la fecha (puntos de la final por la posición) para todo el grupo
  if(d.modo==="fecha"&&TYV&&TYV.host===TYV.me){const res=pos.map((e,i)=>({uid:e.yo?(NET.uid||"yo"):e.id.startsWith("p_")?(TYV.info[e.id].uid||e.id):null,n:e.n,pts:!e.out&&e.fin!=null?(TY_PTS_FINAL[i]||0):0})).filter(r=>r.uid);
    tyVivoTablaSumar(res,d.fecha);}
  modalLock=false;modal(`<h3 class="gan" style="color:${yo===0?"var(--oro)":"var(--crema)"}">${esc(R.c.nom)}: ${R.P.out?"¡Afuera!":(yo+1)+"º"}</h3>
    <p>${yo===0&&!R.P.out?"¡Les ganaste a todos!":"Carrera terminada."}${premio?" Cobraste "+fmt(premio)+".":""}${d.modo==="fecha"?" Los puntos se suman a la tabla del grupo.":""}</p>
    <table class="ovtab"><tr><th>Pos</th><th>Piloto</th><th>Tiempo</th><th>${d.modo==="fecha"?"Pts":""}</th></tr>${filas}</table>
    <div class="opts"><button class="btn oro" id="tyvOtra">Volver a la sala</button><button class="btn sec" id="tyvFin">Salir</button></div>`,"resplaca");
  $("#tyvOtra").onclick=()=>{closeModal();if(!TYV){render();return;}TYV.go=false;TYV.st={};TYV.info={};tyVivoPres({en:0});if(TYV.modo==="fecha")tyVivoTablaLeer().then(tyVivoSala);else tyVivoSala();};
  $("#tyvFin").onclick=()=>{tyVivoSalir();closeModal();render();};}
function tyVivoSalir(){if(TYV&&TYV.room){try{TYV.room.leave();}catch(e){}}TYV=null;}
// tabla del campeonato con amigos (un documento por grupo)
async function tyVivoTablaLeer(){if(!TYV||!NET.db)return;try{const s=await NET.db.doc("tyamigos/"+TYV.code).get();TYV.tabla=s.exists?s.data():{n:0,t:{}};}catch(e){TYV.tabla=TYV.tabla||{n:0,t:{}};}}
async function tyVivoTablaSumar(res,fecha){if(!NET.db||!TYV)return;try{await tyVivoTablaLeer();const T=TYV.tabla||{n:0,t:{}};T.t=T.t||{};
    res.forEach(r=>{const k=String(r.uid).replace(/[.#$\[\]\/]/g,"_");const o=T.t[k]||(T.t[k]={n:r.n,pts:0,f:0});o.n=r.n;o.pts+=r.pts;o.f++;});
    T.n=Math.max(T.n|0,fecha|0);T.at=Date.now();await NET.db.doc("tyamigos/"+TYV.code).set(T);TYV.tabla=T;}catch(e){toast("No se pudo guardar la tabla del grupo");}}
// tarjeta "Con amigos" del menú de TAYA'xs
function tyAmigosCard(m){return; /* el modo con amigos vuelve más adelante */const G=S.tyGrupo;
  const card=el(`<div class="copa"><div class="t">Con amigos</div><div class="s">Carreras en vivo de hasta ${TYV_MAX} pilotos, del largo de una final. La grilla la arma el avance de cada uno en el juego.</div>
    <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:10px"><button class="btn oro sm" id="tyaR">🏁 Crear desafío</button><button class="btn sec sm" id="tyaU">Unirme a un desafío</button></div>
    <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:10px"><button class="btn sm" id="tyaF">🏆 ${G?"Campeonato "+esc(G):"Crear campeonato con amigos"}</button><button class="btn sec sm" id="tyaFU">${G?"Cambiar de grupo":"Unirme a un campeonato"}</button></div></div>`);
  card.querySelector("#tyaR").onclick=()=>tyVivoEntrar("reto",tyVivoCodigo());
  card.querySelector("#tyaU").onclick=()=>tyVivoPedirCodigo("Unirme a un desafío",c=>tyVivoEntrar("reto",c));
  card.querySelector("#tyaF").onclick=()=>{let g=S.tyGrupo;if(!g){g=S.tyGrupo=tyVivoCodigo();save();}tyVivoEntrar("fecha",g);};
  card.querySelector("#tyaFU").onclick=()=>tyVivoPedirCodigo("Unirme a un campeonato",c=>{S.tyGrupo=c;save();tyVivoEntrar("fecha",c);});
  m.append(card);}

/* ---------- pausa ---------- */
function tyPausa(on){const R=TYR;if(!R||R.done)return;R.pausa=on??!R.pausa;let p=$("#tyPausa");
  if(R.pausa){if(!p){p=el(`<div id="tyPausa"><div class="pbox"><h2>Pausa</h2><button class="btn oro" id="tpSeg">Seguir corriendo</button><button class="btn" id="tpTec">Teclas y joystick</button><button class="btn sec" id="tpAb">Abandonar la carrera</button></div></div>`);$("#tyRace").append(p);
      p.querySelector("#tpSeg").onclick=()=>tyPausa(false);p.querySelector("#tpTec").onclick=()=>{controlesMenu();};p.querySelector("#tpAb").onclick=()=>{tyPausa(false);$("#tyQuit").click();};}
    p.hidden=false;R.gas=false;R.steer=0;if(AC)AC.suspend().catch(()=>{});}
  else{if(p)p.hidden=true;if(AC)AC.resume().catch(()=>{});}}
