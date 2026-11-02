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
function tyChampionToca(R){const c=R.c;if(!c||c.entreno||c.sufi||c.vivo)return false;const et=c.etapa||c;return et.k==="semi"&&((et.n|0)===1||(et.n|0)===3);}
function tyChampionPrep(h){if(h.userData.prep)return;h.userData.prep=1;const TH=T3.TH,v=new TH.Vector3();h.updateMatrixWorld(true);
  const bb=new TH.Box3().setFromObject(h),x0=bb.max.x-(bb.max.x-bb.min.x)*.075; /* la pala de adelante va levantada: se suben esos vértices */
  h.traverse(q=>{if(!q.isMesh)return;const P=q.geometry.attributes.position,inv=new TH.Matrix4().copy(q.matrixWorld).invert(),w=new TH.Vector3();
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(q.matrixWorld);if(v.x>x0&&v.y<1.3){v.y+=.22;w.copy(v).applyMatrix4(inv);P.setXYZ(i,w.x,w.y,w.z);}}
    P.needsUpdate=true;q.geometry.computeBoundingSphere();q.castShadow=true;});}
{const _bs=tyBoxesSalida;tyBoxesSalida=function(R,cb){if(R&&R.g3!==false&&tyChampionToca(R)&&!(R.J&&R.J.champ&&R.J.champ[(R.c.etapa||R.c).n])){
    if(R.J){R.J.champ=R.J.champ||{};R.J.champ[(R.c.etapa||R.c).n]=1;}
    tyModelo("champion",7.5).then(h=>{tyChampionPrep(h);tyChampionAnim(R,h,()=>_bs(R,cb));},()=>_bs(R,cb));return;}
  return _bs.apply(this,arguments);};}
function tyChampionAnim(R,h,done){const TH=T3.TH,E=TY3.env;if(!E||TYR!==R){done();return;}
  const L=TY.LAP,carriles=[TY.W/2-2.2,1.1,-2.0,TY_BERMA_D+2.15],vel=34,o=h.clone(true);E.sc.add(o);
  const gone=R.cars.map(e=>e.gone);R.cars.forEach(e=>{e.gone=true;});const berma=E.berma;if(berma)berma.visible=false;
  const huella=E.huella,op0=huella?huella.material.opacity:0;
  // los cordones que va dejando: uno por vuelta, del lado de adentro de la cuchilla
  const mound=new TH.SphereGeometry(1,8,5),mat=tyTierraMat(TH),cord=carriles.map(()=>[]);
  const ov=el(`<div class="champov"><b>🚜 Pasa la Champion</b><span>Deja la pista perfecta para las semifinales</span><button class="btn sec sm" id="chSal">Saltar ▶▶</button></div>`);document.body.append(ov);document.body.classList.add("champrun");
  let fin=false,t0=performance.now(),dejado=0;const total=carriles.length*L;
  const terminar=()=>{if(fin)return;fin=true;E.sc.remove(o);cord.flat().forEach(m=>E.sc.remove(m));if(berma)berma.visible=true;if(huella)huella.material.opacity=0;
    R.cars.forEach((e,i)=>{e.gone=gone[i];});window.__tyCam=null;R.champ=null;ov.remove();document.body.classList.remove("champrun");done();};
  ov.querySelector("#chSal").onclick=terminar;
  R.champ={paso:()=>{if(fin)return;if(TYR!==R){terminar();return;}const t=R.champ.T!=null?R.champ.T:(performance.now()-t0)/1000,x=Math.min(total,t*vel),k=Math.min(carriles.length-1,Math.floor(x/L)),sl=x-k*L;
    // cambio de carril suave al cerrar cada vuelta
    const dA=carriles[k],dB=carriles[Math.min(carriles.length-1,k+1)],mz=sl>L-25?(sl-(L-25))/25:0,d=dA+(dB-dA)*mz*mz*(3-2*mz),s=-20+sl;
    const p=tyPose(s,d);o.position.set(p.x,tyYc(s,d),p.z);o.rotation.set(0,p.h+Math.PI+(dB-dA)*mz*.04,0);
    // va dejando el cordón cada 1,6 m; el de la vuelta anterior se lo lleva al pasar
    while(dejado<=x){const kk=Math.min(carriles.length-1,Math.floor(dejado/L)),ss=-20+dejado-kk*L,dd=carriles[kk]-2.15,q=tyPose(ss,dd);
      const m=new TH.Mesh(mound,mat);m.scale.set(1.1,.3,.6);m.position.set(q.x,tyY(ss,dd),q.z);m.rotation.y=q.h;m.castShadow=true;E.sc.add(m);cord[kk].push({m,s:ss});dejado+=1.6;}
    if(k>0)for(const c of cord[k-1]){if(c.m.parent&&((s-c.s)%L+L)%L<6&&((s-c.s)%L+L)%L>0)E.sc.remove(c.m);}
    if(huella)huella.material.opacity=op0*(1-x/total);
    // cámara: de atrás y del costado de afuera, un poco alta
    const cb=tyPose(s-13,d-6.5),lk=tyPose(s+5,d+.5);window.__tyCam={p:[cb.x,tyY(s,d)+5.2,cb.z],l:[lk.x,1,lk.z],f:50};
    if(x>=total)terminar();}};
  tyMsg("Antes de las semis pasa la Champion a emparejar la pista","var(--oro)");}
{const _dr=tyDraw;tyDraw=function(R){try{if(R&&R.champ)R.champ.paso();}catch(x){console.warn("champion",x);}return _dr.apply(this,arguments);};}
