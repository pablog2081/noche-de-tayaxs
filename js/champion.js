/* Noche de TAYA'xs — la Champion, el cordón de tierra y los banderines.
   · El borde de adentro ya no tiene cubiertas: es un cordón de tierra que deja la motoniveladora.
   · En las curvas hay banderines en el borde de adentro: cada banderín que tira un midget suma 3 segundos a su tiempo.
   · Antes de la semi 1 y de la semi 3 pasa la Champion: arranca desde afuera, da vueltas hacia adentro con la cuchilla de abajo
     de la cabina, deja un cordón de tierra del lado de adentro que la vuelta siguiente lleva más adentro, y el último queda como límite. */
const TY_BERMA_D=-TY.W/2-.55,TY_BAND_D=-TY.W/2+.35;
function tyBermaGeo(TH,dc,ancho,alto,s0,s1,paso){const pts=[],idx=[];let k=0;paso=paso||1.2;
  for(let s=s0;s<=s1+.001;s+=paso){const prof=[[-ancho/2,0],[-ancho/4,alto*.75],[0,alto],[ancho/4,alto*.75],[ancho/2,0]];
    for(const [dd,yy] of prof){const q=tyPose(s,dc+dd);pts.push(q.x,yy+.01,q.z);}
    if(k){const a=(k-1)*5;for(let j=0;j<4;j++)idx.push(a+j,a+j+5,a+j+1,a+j+1,a+j+5,a+j+6);}k++;}
  const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute(pts,3));g.setIndex(idx);g.computeVertexNormals();return g;}
function tyTierraMat(TH){if(!TY3.matCordon){const m=new TH.MeshStandardMaterial({color:0x5b3f2a,roughness:1});
    try{const t=new TH.TextureLoader().load("taya/tierra.webp");t.wrapS=t.wrapT=TH.RepeatWrapping;t.repeat.set(.5,.5);m.map=t;m.color.setHex(0x8a6a50);}catch(x){}TY3.matCordon=m;}return TY3.matCordon;}
// las curvas: s de cada banderín (cada 7 m por el borde de adentro de las dos curvas)
function tyBandS(){const a=TY.S/2,arc=Math.PI*TY.R,L=TY.LAP,out=[];for(const c0 of[a,a+arc+TY.S])for(let x=4;x<arc-3;x+=7)out.push((c0+x)%L);return out;}
function tyBermaArmar(TH,sc,E){const L=TY.LAP;
  const b=new TH.Mesh(tyBermaGeo(TH,TY_BERMA_D,1.1,.32,0,L,1.2),tyTierraMat(TH));b.receiveShadow=true;b.castShadow=true;sc.add(b);E.berma=b;
  // banderines: caña blanca y banderita roja/amarilla
  const caña=new TH.CylinderGeometry(.025,.03,1.1,6);caña.translate(0,.55,0);const tela=new TH.PlaneGeometry(.42,.26);tela.translate(.21,0,0);
  const mC=new TH.MeshStandardMaterial({color:0xf2f2f2,roughness:.6}),mR=new TH.MeshStandardMaterial({color:0xd7263d,roughness:.7,side:TH.DoubleSide}),mA=new TH.MeshStandardMaterial({color:0xf2c230,roughness:.7,side:TH.DoubleSide});
  E.band=tyBandS().map((s,i)=>{const q=tyPose(s,TY_BAND_D),g=new TH.Group();g.add(new TH.Mesh(caña,mC));const f=new TH.Mesh(tela,i%2?mA:mR);f.position.y=.95;g.add(f);
    g.position.set(q.x,tyY(s,TY_BAND_D),q.z);g.rotation.y=q.h;sc.add(g);return {s,g,f};});}
// cada carrera los banderines arrancan parados
{const _s3=tySetup3D;tySetup3D=function(R){const r=_s3.apply(this,arguments);try{const E=TY3.env;R.bandT={};if(E&&E.band)E.band.forEach(b=>{b.g.rotation.x=0;b.g.rotation.z=0;b.caido=false;});}catch(x){}return r;};}
// el midget que se mete adentro y toca un banderín lo tira: +3 s
{const _pa=tyPaso;tyPaso=function(R){_pa.apply(this,arguments);if(!R.green||R.c.entreno||R.anim)return;const E=TY3.env;if(!E||!E.band||E===TY3.envSal)return;const L=TY.LAP;R.bandT=R.bandT||{};
  for(const e of R.cars){if(e.out||e.fin!==null||e.gone||e.remote||e.d>TY_BAND_D+.75)continue;const s=((e.s%L)+L)%L;
    for(let i=0;i<E.band.length;i++){const b=E.band[i];if(R.bandT[i])continue;let ds=Math.abs(b.s-s);ds=Math.min(ds,L-ds);if(ds>1)continue;
      R.bandT[i]=e.id;e.band=(e.band|0)+1;b.caido=true;b.g.rotation.z=-1.35;b.g.rotation.x=(Math.random()-.5)*.6;
      if(e.yo){tyMsg(`¡Tiraste un banderín! +3 s (${e.band})`,"#ffb4bd");vib(30);}}}};}

/* ---------- la pasada de la Champion ---------- */
/* pasa antes de la semi 1 y de la semi 3: si corrés la 2 o la 4, ves la pasada que hubo antes de la tuya (la 1 o la 3) */
function tyChampionToca(R){const c=R.c;if(!c||c.entreno||c.sufi||c.vivo)return false;const et=c.etapa||c;return et.k==="semi"&&(et.n|0)>=1;}
function tyChampionPasada(R){const n=((R.c.etapa||R.c).n|0);return n<=2?1:3;}
/* ruedas que giran: se buscan los círculos de las ruedas en los costados del modelo, se separan sus triángulos
   y se cuelgan de un pivote en el eje, así se pueden hacer girar (sirve para la Champion y para el tractor con la cisterna) */
function tyVehRuedas(h){if(h.userData.ruedasV)return h.userData.ruedasV;const TH=T3.TH,v=new TH.Vector3();h.updateMatrixWorld(true);
  const bb=new TH.Box3().setFromObject(h),zm=Math.max(bb.max.z,-bb.min.z),H=bb.max.y,pts=[];
  h.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);if(Math.abs(v.z)>.2*zm&&v.y<H*.75)pts.push([v.x,v.y,v.z]);}});
  // las ruedas tocan el piso: se agrupan los puntos más bajos por x y por lado; la cuerda que apoya da el radio
  const h0=Math.max(.06,H*.045),W=[];
  for(const sz of[1,-1]){const bajos=pts.filter(q=>q[1]<h0&&Math.sign(q[2])===sz).sort((a,b)=>a[0]-b[0]),gr=[];let g0=null;
    for(const q of bajos){if(g0&&q[0]-g0.x1<.2){g0.x1=q[0];g0.p.push(q);}else{g0={x0:q[0],x1:q[0],p:[q]};gr.push(g0);}}
    for(const g of gr){const xc=(g.x0+g.x1)/2;const zs=g.p.map(q=>Math.abs(q[2])),zIn=Math.min(...zs),zOut=Math.max(...zs);
      // contorno de abajo de la cubierta (lo más bajo en cada franja de x) y se ajusta un círculo apoyado en el piso
      const T=pts.filter(q=>Math.sign(q[2])===sz&&Math.abs(q[2])>=zIn-.05&&Math.abs(q[2])<=zOut+.05&&Math.abs(q[0]-xc)<1.2&&q[1]<1.3),bin={};
      for(const q of T){const k=Math.round((q[0]-xc)/.04);if(!bin[k]||q[1]<bin[k][1])bin[k]=q;}
      let ol=Object.values(bin).filter(q=>q[1]>.02),r=.5;
      for(let it=0;it<4&&ol.length>4;it++){const rr=ol.map(q=>((q[0]-xc)**2+q[1]**2)/(2*q[1])).sort((a,b)=>a-b);r=rr[rr.length>>1];ol=ol.filter(q=>q[1]<r*.95);}
      r=Math.max(.2,Math.min(r,H*.48));
      W.push({x:xc,y:r,r,sz,zIn,zOut});}}
  // un pivote por eje (las dos ruedas del mismo eje giran juntas)
  const ejes=[];for(const w of W){let e=ejes.find(e=>Math.abs(e.x-w.x)<.3&&Math.abs(e.r-w.r)<.2);if(!e){e={x:w.x,y:w.y,r:w.r,ws:[]};ejes.push(e);}e.ws.push(w);}
  const piv=ejes.map(w=>{const g=new TH.Group();g.position.set(w.x,w.y,0);g.userData.rueda=w;h.add(g);return g;});
  const hInv=new TH.Matrix4().copy(h.matrixWorld).invert(),metas=[];
  h.traverse(q=>{if(!q.isMesh||q.userData.ruedaM)return;metas.push(q);});
  for(const q of metas){const g=q.geometry,P=g.attributes.position,I=g.index?g.index.array:null,n=I?I.length:P.count,keep=[],por=ejes.map(()=>[]);
    const pt=k=>{v.fromBufferAttribute(P,k).applyMatrix4(q.matrixWorld);return v;};
    for(let t=0;t<n;t+=3){let cx=0,cy=0,cz=0;for(let j=0;j<3;j++){const p=pt(I?I[t+j]:t+j);cx+=p.x;cy+=p.y;cz+=p.z;}cx/=3;cy/=3;cz/=3;
      const k=ejes.findIndex(e=>Math.hypot(cx-e.x,cy-e.y)<e.r+.03&&e.ws.some(w=>Math.sign(cz)===w.sz&&Math.abs(cz)>=w.zIn-.1&&Math.abs(cz)<=w.zOut+.06));
      if(k>=0)for(let j=0;j<3;j++)por[k].push(I?I[t+j]:t+j);else for(let j=0;j<3;j++)keep.push(I?I[t+j]:t+j);}
    if(!por.some(x=>x.length))continue;
    por.forEach((ix,k)=>{if(!ix.length)return;const g2=g.clone();g2.setIndex(ix);const m=new TH.Mesh(g2,q.material);m.userData.ruedaM=1;m.castShadow=true;
      // la malla queda en el pivote, con la transformación que tenía respecto del modelo
      const M=new TH.Matrix4().multiplyMatrices(hInv,q.matrixWorld);M.premultiply(new TH.Matrix4().makeTranslation(-ejes[k].x,-ejes[k].y,0));M.decompose(m.position,m.quaternion,m.scale);piv[k].add(m);});
    g.setIndex(keep);}
  return h.userData.ruedasV=ejes;}
function tyVehGirar(o,dist){o.traverse(q=>{const w=q.userData.rueda;if(w)q.rotation.z=-dist/w.r;});}
function tyChampionPrep(h){if(h.userData.prep)return;h.userData.prep=1;const TH=T3.TH,v=new TH.Vector3();h.updateMatrixWorld(true);
  const bb=new TH.Box3().setFromObject(h),x0=bb.max.x-(bb.max.x-bb.min.x)*.075; /* la pala de adelante va levantada: se suben esos vértices */
  h.traverse(q=>{if(!q.isMesh)return;const P=q.geometry.attributes.position,inv=new TH.Matrix4().copy(q.matrixWorld).invert(),w=new TH.Vector3();
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(q.matrixWorld);if(v.x>x0&&v.y<1.3){v.y+=.22;w.copy(v).applyMatrix4(inv);P.setXYZ(i,w.x,w.y,w.z);}}
    P.needsUpdate=true;q.geometry.computeBoundingSphere();q.castShadow=true;});
  try{tyVehRuedas(h);}catch(x){console.warn("ruedas champion",x);}}
{const _bs=tyBoxesSalida;tyBoxesSalida=function(R,cb){if(R&&R.g3!==false&&tyChampionToca(R)&&!(R.J&&R.J.champ&&R.J.champ[tyChampionPasada(R)])){
    if(R.J){R.J.champ=R.J.champ||{};R.J.champ[tyChampionPasada(R)]=1;}
    const trac=tyModelo("tractor",8.2).then(t=>{try{tyVehRuedas(t);}catch(x){}return t;},()=>null);
    tyModelo("champion",7.5).then(h=>trac.then(t=>{tyChampionPrep(h);tyChampionAnim(R,h,()=>_bs(R,cb),t);}),()=>_bs(R,cb));return;}
  return _bs.apply(this,arguments);};}
/* adelante va el tractor con la cisterna regando (la tierra mojada se ve más oscura) y atrás la Champion emparejando */
function tyChampionAnim(R,h,done,trac){const TH=T3.TH,E=TY3.env;if(!E||TYR!==R){done();return;}
  const L=TY.LAP,carriles=[TY.W/2-2.2,1.1,-2.0,TY_BERMA_D+2.15],vel=34,ADE=24,o=h.clone(true);E.sc.add(o);
  const tr=trac?trac.clone(true):null;if(tr){tr.traverse(q=>{if(q.isMesh)q.castShadow=true;});E.sc.add(tr);}
  const gone=R.cars.map(e=>e.gone);R.cars.forEach(e=>{e.gone=true;});const berma=E.berma;
  const huella=E.huella,op0=huella?huella.material.opacity:0;
  // los cordones que va dejando: uno por vuelta, del lado de adentro de la cuchilla; cada uno se lo lleva la vuelta siguiente
  const mound=new TH.SphereGeometry(1,8,5),mat=tyTierraMat(TH),cord=[];
  // el agua: gotas que caen del caño de atrás y manchas de tierra mojada
  const NG=420,gp=new Float32Array(NG*3),gv=new Float32Array(NG*3),gt=new Float32Array(NG);for(let i=0;i<NG;i++)gt[i]=9;
  const gGeo=new TH.BufferGeometry();gGeo.setAttribute("position",new TH.BufferAttribute(gp,3));
  const gotas=new TH.Points(gGeo,new TH.PointsMaterial({color:0xdcebf7,size:.13,transparent:true,opacity:.75,depthWrite:false}));gotas.frustumCulled=false;if(tr)E.sc.add(gotas);
  const mojM=new TH.MeshStandardMaterial({color:0x2a1a0f,roughness:.55,transparent:true,opacity:.42,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),mojG=new TH.PlaneGeometry(2.1,3.0),moja=[],mojM2=mojM.clone();mojM2.opacity=.16;
  const ov=el(`<div class="champov"><b>🚜 Pasa la Champion</b><span>Adelante el tractor riega y atrás la Champion deja la pista perfecta</span><button class="btn sec sm" id="chSal">Saltar ▶▶</button></div>`);document.body.append(ov);document.body.classList.add("champrun");
  let fin=false,t0=performance.now(),dejado=0,regado=0,tPrev=0;const total=carriles.length*L;
  const carril=x=>{const k=Math.min(carriles.length-1,Math.max(0,Math.floor(x/L))),sl=Math.max(0,x)-k*L,dA=carriles[k],dB=carriles[Math.min(carriles.length-1,k+1)],mz=sl>L-25?(sl-(L-25))/25:0;
    return {k,s:-20+sl,d:dA+(dB-dA)*mz*mz*(3-2*mz),giro:(dB-dA)*mz*.04};};
  const terminar=()=>{if(fin)return;fin=true;E.sc.remove(o);if(tr){E.sc.remove(tr);E.sc.remove(gotas);}cord.forEach(c=>E.sc.remove(c.m));moja.forEach(m=>E.sc.remove(m.m));if(berma)berma.visible=true;if(huella)huella.material.opacity=op0;
    R.cars.forEach((e,i)=>{e.gone=gone[i];});window.__tyCam=null;R.champ=null;ov.remove();document.body.classList.remove("champrun");done();};
  ov.querySelector("#chSal").onclick=terminar;
  R.champ={o,tr,paso:()=>{if(fin)return;if(TYR!==R){terminar();return;}const t=R.champ.T!=null?R.champ.T:(performance.now()-t0)/1000,x=Math.min(total,t*vel),dt=Math.max(0,Math.min(.1,t-tPrev));tPrev=t;
    const c=carril(x),p=tyPose(c.s,c.d);o.position.set(p.x,tyYc(c.s,c.d),p.z);o.rotation.set(0,p.h+c.giro,0);tyVehGirar(o,x);
    // el tractor va adelante, por el mismo carril, regando
    if(tr){const xt=x+ADE,ct=carril(Math.min(total,xt)),st=ct.s+Math.max(0,xt-total),pt=tyPose(st,ct.d);tr.position.set(pt.x,tyYc(st,ct.d),pt.z);tr.rotation.set(0,pt.h+ct.giro,0);tyVehGirar(tr,xt);
      const atras=tyPose(st-4.4,ct.d),q=tyPose(st-4.4,ct.d+1);const lx=q.x-atras.x,lz=q.z-atras.z;let nuevas=Math.round(dt*900);
      for(let i=0;i<NG&&nuevas>0;i++){if(gt[i]<.7)continue;nuevas--;const u=Math.random()*2-1;gp[i*3]=atras.x+lx*u*1.05;gp[i*3+1]=.75;gp[i*3+2]=atras.z+lz*u*1.05;
        gv[i*3]=(atras.x-pt.x)*.18+(Math.random()-.5)*.6;gv[i*3+1]=-.4-Math.random();gv[i*3+2]=(atras.z-pt.z)*.18+(Math.random()-.5)*.6;gt[i]=0;}
      for(let i=0;i<NG;i++){if(gt[i]>=.7){gp[i*3+1]=-50;continue;}gt[i]+=dt;gv[i*3+1]-=9.8*dt;gp[i*3]+=gv[i*3]*dt;gp[i*3+1]=Math.max(.02,gp[i*3+1]+gv[i*3+1]*dt);gp[i*3+2]+=gv[i*3+2]*dt;}
      gGeo.attributes.position.needsUpdate=true;
      // manchas de agua sobre la tierra (cada 2,4 m)
      while(regado<=Math.min(total,xt)-4.4){const cr=carril(regado),qq=tyPose(cr.s,cr.d),m=new TH.Mesh(mojG,mojM);m.rotation.set(-Math.PI/2,0,qq.h);m.position.set(qq.x,tyY(cr.s,cr.d)+.03,qq.z);m.renderOrder=2;E.sc.add(m);moja.push({m,x:regado});regado+=2.4;}}
    // la Champion pasa por la tierra mojada: queda pareja (la mancha se aclara)
    for(const m of moja){if(!m.ok&&x>=m.x+2){m.ok=1;m.m.material=mojM2;m.m.scale.set(1.5,1,1.1);}}
    // cordón: cada 1,6 m del lado de adentro de la cuchilla; la última vuelta lo lleva contra el borde y no deja nada
    while(dejado<=x){const cr=carril(dejado);if(cr.k>=carriles.length-1){dejado+=1.6;continue;}
      const dd=carriles[cr.k]-2.15,q=tyPose(cr.s,dd),m=new TH.Mesh(mound,mat);m.scale.set(1.1,.3,.6);m.position.set(q.x,tyY(cr.s,dd),q.z);m.rotation.y=q.h;m.castShadow=true;E.sc.add(m);cord.push({m,x:dejado});dejado+=1.6;}
    // el de la vuelta anterior desaparece cuando la Champion vuelve a pasar por ese lugar (por distancia recorrida: no queda ninguno aunque se salteen cuadros)
    for(const cc of cord){if(cc.m.parent&&x>=cc.x+L-1)E.sc.remove(cc.m);}
    if(huella)huella.material.opacity=op0*(1-x/total);
    // cámara: de atrás y del costado de adentro, un poco alta
    const cb=tyPose(c.s-13,c.d-6.5),lk=tyPose(c.s+(tr?9:5),c.d+.5);window.__tyCam={p:[cb.x,tyY(c.s,c.d)+5.2,cb.z],l:[lk.x,1,lk.z],f:52};
    if(x>=total)terminar();}};
  {const n=((R.c.etapa||R.c).n|0),ps=tyChampionPasada(R);tyMsg(n===ps?"Antes de la semi "+n+" pasa la Champion a emparejar la pista":"Antes de la semi "+ps+" pasó la Champion a emparejar la pista","var(--oro)");}}
{const _dr=tyDraw;tyDraw=function(R){try{if(R&&R.champ)R.champ.paso();}catch(x){console.warn("champion",x);}return _dr.apply(this,arguments);};}
