/* Noche de TAYA'xs — ruedas que giran, delanteras que doblan y el piloto adentro.
   Los modelos de Meshy traen las ruedas pegadas a la carrocería: se recortan esos triángulos y se ponen ruedas propias
   (delanteras angostas, traseras más grandes y anchas), que giran con la velocidad y doblan con el contravolante. */
function tyRuedasPrep(m,h){if(h.userData.ruedas)return h.userData.ruedas;const TH=T3.TH;h.updateMatrixWorld(true);
  const bb=new TH.Box3().setFromObject(h),zm=bb.max.z,v=new TH.Vector3(),pts=[];
  h.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i+=2){v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);pts.push([v.x,v.y,v.z]);}});
  const W=[];
  for(const [sx,sz] of [[1,1],[1,-1],[-1,1],[-1,-1]]){
    const low=pts.filter(q=>Math.sign(q[0])===sx&&Math.sign(q[2])===sz&&Math.abs(q[2])>.55*zm&&q[1]<.06);if(!low.length)continue;
    const xc=low.reduce((a,q)=>a+q[0],0)/low.length;
    const cl=pts.filter(q=>Math.abs(q[0]-xc)<.45&&Math.sign(q[2])===sz&&Math.abs(q[2])>.55*zm&&q[1]<.95);
    const top=Math.max(...cl.map(q=>q[1])),zo=Math.max(...cl.map(q=>Math.abs(q[2]))),del=sx>0;
    const r=top/2,w=del?.19:.3;W.push({del,x:xc,z:sz*(zo-w/2),r,w,zo,sz});}
  // se borran los triángulos de las ruedas viejas (cubierta y llanta), la suspensión de adentro queda
  h.traverse(q=>{if(!q.isMesh)return;const g=q.geometry,P=g.attributes.position,I=g.index?g.index.array:null,n=I?I.length:P.count,keep=[];
    const pt=k=>{v.fromBufferAttribute(P,k).applyMatrix4(q.matrixWorld);return v;};
    for(let t=0;t<n;t+=3){let cx=0,cy=0,cz=0;for(let j=0;j<3;j++){const p=pt(I?I[t+j]:t+j);cx+=p.x;cy+=p.y;cz+=p.z;}cx/=3;cy/=3;cz/=3;
      const fuera=W.some(w=>Math.abs(cx-w.x)<w.r+.04&&Math.sign(cz)===w.sz&&Math.abs(cz)>w.zo-w.w-.05&&cy<2*w.r+.05);
      if(!fuera)for(let j=0;j<3;j++)keep.push(I?I[t+j]:t+j);}
    g.setIndex(keep);});
  return h.userData.ruedas=W;}
// texturas: costado de la cubierta con la llanta y letras (así se ve que gira) y la banda de rodamiento con tacos
function tyRuedaTex(){if(TY3.rTex)return TY3.rTex;const TH=T3.TH;
  const lado=dTex(256,256,(x,w,h)=>{const c=w/2;x.fillStyle="#141414";x.fillRect(0,0,w,h);
    x.fillStyle="#1d1d1d";x.beginPath();x.arc(c,c,126,0,7);x.fill();
    x.save();x.translate(c,c);x.fillStyle="#d9d9d9";x.font="900 26px 'Barlow Condensed',Arial Narrow,sans-serif";x.textAlign="center";x.textBaseline="middle";
    for(const a of[0,Math.PI]){x.save();x.rotate(a);x.fillText("TAYA'xs",0,-104);x.restore();}x.restore();
    const g=x.createRadialGradient(c,c,10,c,c,80);g.addColorStop(0,"#f4f4f4");g.addColorStop(.7,"#b9bcc0");g.addColorStop(1,"#7d8186");x.fillStyle=g;x.beginPath();x.arc(c,c,80,0,7);x.fill();
    x.strokeStyle="#55595e";x.lineWidth=5;x.beginPath();x.arc(c,c,78,0,7);x.stroke();
    x.fillStyle="#2a2d31";for(let i=0;i<6;i++){const a=i/6*Math.PI*2;x.beginPath();x.arc(c+Math.cos(a)*44,c+Math.sin(a)*44,13,0,7);x.fill();}
    x.fillStyle="#d7263d";x.beginPath();x.arc(c,c,20,0,7);x.fill();x.fillStyle="#222";for(let i=0;i<5;i++){const a=i/5*Math.PI*2;x.beginPath();x.arc(c+Math.cos(a)*11,c+Math.sin(a)*11,3,0,7);x.fill();}},[1,1]);
  const banda=dTex(256,64,(x,w,h)=>{x.fillStyle="#191919";x.fillRect(0,0,w,h);x.fillStyle="#0c0c0c";for(let i=0;i<24;i++){const xx=i*w/24;x.fillRect(xx,4,w/48,h*.42);x.fillRect(xx+w/48,h*.54,w/48,h*.42);}
    for(let k=0;k<400;k++){x.fillStyle=`rgba(120,90,60,${Math.random()*.25})`;x.fillRect(Math.random()*w,Math.random()*h,2,2);}},[1,1]);
  banda.wrapS=TH.RepeatWrapping;
  return TY3.rTex={lado,banda,mL:new TH.MeshStandardMaterial({map:lado,roughness:.75,metalness:.2}),mB:new TH.MeshStandardMaterial({map:banda,roughness:.95})};}
function tyRuedaObj(w){const TH=T3.TH,t=tyRuedaTex(),geo=new TH.CylinderGeometry(w.r,w.r,w.w,32,1,false);geo.rotateX(Math.PI/2);
  const m=new TH.Mesh(geo,[t.mB,t.mL,t.mL]);m.castShadow=true;const piv=new TH.Group();piv.position.set(w.x,w.r,w.z);piv.add(m);return {piv,giro:m,del:w.del,r:w.r};}
// el piloto: casco con visera, buzo, hombros, brazos al volante y el collarín
function tyPilotoObj(e){const TH=T3.TH,g=new TH.Group();const h=Math.abs(Math.sin((e.num||7)*7.31)*1000)%1;
  const buzo=new TH.MeshStandardMaterial({color:new TH.Color(e.col||"#888").lerp(new TH.Color(h>.5?"#ffffff":"#111111"),.35),roughness:.8});
  const casco=new TH.MeshStandardMaterial({color:new TH.Color(TY_PALETA[Math.floor(h*97)%TY_PALETA.length]||"#fff"),roughness:.25,metalness:.15});
  const visor=new TH.MeshStandardMaterial({color:0x0b0d12,roughness:.08,metalness:.6});
  const torso=new TH.Mesh(new TH.CapsuleGeometry(.17,.26,4,10),buzo);torso.position.set(0,.66,0);torso.rotation.z=.18;torso.castShadow=true;g.add(torso);
  const hom=new TH.Mesh(new TH.CapsuleGeometry(.08,.34,4,8),buzo);hom.rotation.x=Math.PI/2;hom.position.set(.03,.84,0);g.add(hom);
  for(const s of[-1,1]){const br=new TH.Mesh(new TH.CapsuleGeometry(.05,.3,4,8),buzo);br.position.set(.2,.76,s*.15);br.rotation.z=-1.15;g.add(br);}
  const col=new TH.Mesh(new TH.TorusGeometry(.1,.035,8,16),new TH.MeshStandardMaterial({color:0x111111,roughness:.7}));col.rotation.x=Math.PI/2;col.position.set(.02,.93,0);g.add(col);
  const cab=new TH.Mesh(new TH.SphereGeometry(.15,20,16),casco);cab.position.set(.03,1.04,0);cab.scale.set(1.05,1,.95);cab.castShadow=true;g.add(cab);
  const vis=new TH.Mesh(new TH.SphereGeometry(.152,20,10,-.95,1.9,1.15,.5),visor);vis.position.copy(cab.position);vis.scale.copy(cab.scale);vis.rotation.y=Math.PI;g.add(vis);
  g.position.set(-.3,0,0);return g;}
{const _ao=tyAutoObj;tyAutoObj=function(e){const src=TY3.mod[e.m];if(src&&TY_M.includes(e.m)&&!src.userData.ruedas){try{tyRuedasPrep(e.m,src);}catch(x){console.warn("ruedas",x);}}
  const g=_ao.apply(this,arguments);if(!g||!src||!src.userData.ruedas)return g;
  try{const piv=g.userData.piv,R=src.userData.ruedas.map(tyRuedaObj);R.forEach(r=>piv.add(r.piv));g.userData.ruedas=R;
    tyPilotoPoner(g,e,src);
    const sh=g.children.find(c=>c.isMesh&&c.geometry&&c.geometry.type==="PlaneGeometry");if(sh)g.userData.sombra=sh;}catch(x){console.warn("ruedas2",x);}
  return g;};}
// cada cuadro: giran según la velocidad; las delanteras apuntan hacia donde va el auto (contravolante en el derrape)
function tyRuedasPaso(R){const dt=Math.min(.05,R.dt||.016);
  for(const e of R.cars){const g=e.g;if(!g||!g.userData.ruedas)continue;
    const ang=(e.rA=(e.rA||0)+(e.out&&!e.vuelco?0:e.v)*dt);
    const curva=tyCurva(e.s)?.07:0,dir=Math.max(-.55,Math.min(.55,-(e.sa||0)*.9+curva+(e.yo&&R.steer?-R.steer*.12:0)));
    for(const w of g.userData.ruedas){w.giro.rotation.z=-ang/w.r;if(w.del)w.piv.rotation.y+=(dir-w.piv.rotation.y)*Math.min(1,dt*10);}
    const sh=g.userData.sombra;if(sh){const piso=R.c.entreno||e.vuelco?0:-tyBank(e.s)*.1;sh.rotation.x=-Math.PI/2+piso;}}}
{const _dr=tyDraw;tyDraw=function(R){try{if(R&&R.cars)tyRuedasPaso(R);}catch(x){}return _dr.apply(this,arguments);};}

/* el piloto de Meshy (sentado, con el volante): se acomoda en el habitáculo de cada chasis, más chico si la jaula es baja */
let TY_PIL_CARGA=null;
function tyPilotoCargar(){if(!TY_PIL_CARGA)TY_PIL_CARGA=tyModelo("pil",1.15).catch(()=>{TY_PIL_CARGA=null;});return TY_PIL_CARGA;}
function tyPilotoMeshy(e,src){const TH=T3.TH,P=TY3.mod.pil;if(!P)return null;const o=P.clone(true);o.rotation.y=Math.PI;
  const tint=new TH.Color(1,1,1).lerp(new TH.Color(e.col||"#ffffff"),.28);
  o.traverse(q=>{if(q.isMesh){q.castShadow=true;q.material=q.material.clone();q.material.color=tint;}});
  const g=new TH.Group();g.add(o);
  const bb=new TH.Box3().setFromObject(src),top=bb.max.y,asiento=.27,k=Math.max(.78,Math.min(1,(top-.14-asiento)/.8));g.scale.setScalar(k);
  const tras=src.userData.ruedas.filter(w=>!w.del),xr=tras.length?tras.reduce((a,w)=>a+w.x,0)/tras.length:-.8;
  g.position.set(xr+.45+.375*k,asiento,0);g.userData.meshy=true;return g;}
function tyPilotoPoner(g,e,src){const piv=g.userData.piv;if(g.userData.piloto){piv.remove(g.userData.piloto);g.userData.piloto=null;}
  let pil=null;try{pil=tyPilotoMeshy(e,src);}catch(x){}
  if(!pil){tyPilotoCargar();pil=tyPilotoObj(e);const tras=src.userData.ruedas.filter(w=>!w.del);if(tras.length)pil.position.x=tras.reduce((a,w)=>a+w.x,0)/tras.length+.48;g.userData.pilProc=true;}
  else g.userData.pilProc=false;
  pil.userData.e=e;piv.add(pil);g.userData.piloto=pil;}
{const _rp=tyRuedasPaso;tyRuedasPaso=function(R){_rp.apply(this,arguments);if(!TY3.mod.pil)return;
  for(const e of R.cars){const g=e.g;if(g&&g.userData.pilProc&&TY3.mod[e.m]){const vis=g.userData.piloto?g.userData.piloto.visible:true;tyPilotoPoner(g,e,TY3.mod[e.m]);g.userData.piloto.visible=vis;}}};}
try{init3D().then(ok=>{if(ok)tyPilotoCargar();});}catch(x){}
