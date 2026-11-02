/* Noche de TAYA'xs — la pista: cal de la largada, mangrullo de la bandera y banderilleros.
   · Línea de largada de cal de 20 cm y, en cada fila de la grilla, una línea igual con 3 separadores de 1 m
     (4 cajones). La cal se va borrando con las pasadas de los autos, carrera tras carrera (se pinta de nuevo cada noche).
   · La banderillera baja la bandera desde un mangrullo de 2 m: verde para largar, blanca en la última vuelta y a cuadros al final.
   · 6 banderilleros, 3 por curva (entrada, medio y salida), 5 m adentro de la pista: con la roja agitan la bandera roja. */
const TY_CAL={s0:-34,s1:4,ppm:32,ancho:.2};
function tyCalFilas(){const f=[];for(let r=0;r<3;r++)f.push(-6-r*7.5+2.1);return f;} // delante de cada fila de la grilla
function tyCalPintar(E){const C=E.cal;if(!C)return;const x=C.ctx,w=C.cv.width,h=C.cv.height,ppm=TY_CAL.ppm,a=TY_CAL.ancho*ppm;x.clearRect(0,0,w,h);
  const X=s=>(s-TY_CAL.s0)*ppm,Y=d=>(d+TY.W/2)*ppm,cal=()=>{x.fillStyle="rgba(250,250,244,.95)";};
  // granitos de cal: el borde no es perfecto
  const linea=(x0,y0,x1,y1)=>{cal();x.fillRect(Math.min(x0,x1),Math.min(y0,y1),Math.abs(x1-x0)||a,Math.abs(y1-y0)||a);
    for(let i=0;i<60;i++){x.fillStyle=`rgba(250,250,244,${Math.random()*.5})`;x.fillRect(Math.min(x0,x1)+Math.random()*(Math.abs(x1-x0)||a)-2,Math.min(y0,y1)+Math.random()*(Math.abs(y1-y0)||a)-2,2,2);}};
  // la línea de largada y llegada
  linea(X(0)-a/2,Y(-TY.W/2),X(0)+a/2,Y(TY.W/2));
  // cada fila: línea de frente y 3 separadores de 1 m hacia atrás, entre los 4 cajones
  const sep=[0,1,2].map(i=>(TY_FILA[i]+TY_FILA[i+1])/2);
  for(const sf of tyCalFilas()){linea(X(sf)-a/2,Y(TY_FILA[0]-1.2),X(sf)+a/2,Y(TY_FILA[3]+1.2));
    for(const d of sep)linea(X(sf-1),Y(d)-a/2,X(sf),Y(d)+a/2);}
  C.tex.needsUpdate=true;}
function tyCalArmar(E){if(E.cal)return;const TH=T3.TH,ppm=TY_CAL.ppm,L=TY_CAL.s1-TY_CAL.s0,cv=document.createElement("canvas");cv.width=Math.round(L*ppm);cv.height=Math.round(TY.W*ppm);
  const tex=new TH.CanvasTexture(cv);tex.encoding=TH.sRGBEncoding;tex.anisotropy=8;
  const pts=[],uv=[],idx=[];let k=0;for(let s=TY_CAL.s0;s<=TY_CAL.s1+.01;s+=1){for(const d of[-TY.W/2,TY.W/2]){const p=tyPose(s,d);pts.push(p.x,tyY(s,d)+.045,p.z);uv.push((s-TY_CAL.s0)/L,1-(d+TY.W/2)/TY.W);}
    if(k){const b=(k-1)*2;idx.push(b,b+1,b+2,b+1,b+3,b+2);}k++;}
  const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute(pts,3));g.setAttribute("uv",new TH.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new TH.Mesh(g,new TH.MeshStandardMaterial({map:tex,transparent:true,depthWrite:false,roughness:.95,polygonOffset:true,polygonOffsetFactor:-3}));m.receiveShadow=true;m.renderOrder=3;E.sc.add(m);
  E.cal={cv,ctx:cv.getContext("2d"),tex,mesh:m,sucio:0};tyCalPintar(E);}
// las ruedas se llevan la cal: cada pasada borra un poco donde pisan
function tyCalBorrar(E,R,dt){const C=E.cal;if(!C||!R.cars)return;const x=C.ctx,ppm=TY_CAL.ppm,L=TY.LAP;let hubo=false;x.save();x.globalCompositeOperation="destination-out";
  for(const e of R.cars){if(e.gone||!e.g||(e.v|0)<1)continue;let s=((e.s%L)+L)%L;if(s>L/2)s-=L;if(s<TY_CAL.s0-2||s>TY_CAL.s1+2)continue;
    const k=Math.min(.5,(.05+Math.min(1,e.v/25)*.18+Math.abs(e.sa)*.2)*dt*14),yaw=-(e.sa||0);
    for(const [lx,lz] of[[1.05,.62],[1.05,-.62],[-.95,.72],[-.95,-.72]]){const ss=s+lx*Math.cos(yaw)-lz*Math.sin(yaw),dd=e.d+lz*Math.cos(yaw)+lx*Math.sin(yaw);
      x.fillStyle=`rgba(0,0,0,${k})`;x.beginPath();x.ellipse((ss-TY_CAL.s0)*ppm,(dd+TY.W/2)*ppm,Math.max(4,e.v*.6*dt*ppm+4),.13*ppm,0,0,7);x.fill();}
    hubo=true;}
  x.restore();if(hubo&&++C.sucio%2===0)C.tex.needsUpdate=true;}

/* ---------- mangrullo de la banderillera ---------- */
const TY_MANG={x:6,z:TY.R-TY.W/2-1.8,h:2};
function tyMangrullo(E){if(E.mang)return;const TH=T3.TH,g=new TH.Group(),mad=new TH.MeshStandardMaterial({color:0x8a6a48,roughness:.9}),fierro=new TH.MeshStandardMaterial({color:0xd8d8d8,roughness:.5,metalness:.4});
  const H=TY_MANG.h,a=.75;
  for(const [x,z] of[[-a,-a],[a,-a],[-a,a],[a,a]]){const p=new TH.Mesh(new TH.BoxGeometry(.12,H+1.1,.12),mad);p.position.set(x,(H+1.1)/2,z);p.castShadow=true;g.add(p);}
  const piso=new TH.Mesh(new TH.BoxGeometry(1.7,.1,1.7),mad);piso.position.y=H-.05;piso.castShadow=piso.receiveShadow=true;g.add(piso);
  for(const [x,z,w,dd] of[[0,-a,1.6,.05],[0,a,1.6,.05],[-a,0,.05,1.6]]){const b=new TH.Mesh(new TH.BoxGeometry(w,.06,dd),fierro);b.position.set(x,H+.95,z);g.add(b);const b2=b.clone();b2.position.y=H+.5;g.add(b2);}
  // crucetas y la escalera
  for(const z of[-a,a]){const c=new TH.Mesh(new TH.BoxGeometry(.06,Math.hypot(1.5,H),.06),mad);c.position.set(0,H/2,z);c.rotation.z=Math.atan2(1.5,H);g.add(c);}
  for(let i=0;i<6;i++){const p=new TH.Mesh(new TH.BoxGeometry(.05,.05,.5),fierro);p.position.set(a+.35,.3+i*.34,0);g.add(p);}
  for(const z of[-.25,.25]){const p=new TH.Mesh(new TH.BoxGeometry(.05,H+.2,.05),fierro);p.position.set(a+.35,(H+.2)/2,z);g.add(p);}
  // cartel
  const cart=new TH.Mesh(new TH.PlaneGeometry(1.5,.38),new TH.MeshBasicMaterial({map:dTex(256,64,(x,w,h)=>{x.fillStyle="#f2c230";x.fillRect(0,0,w,h);x.fillStyle="#111";x.font="900 44px 'Barlow Condensed',sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText("LARGADA",w/2,h/2+2);}),side:TH.DoubleSide}));cart.position.set(0,H-.35,a+.02);g.add(cart);
  g.position.set(TY_MANG.x,0,TY_MANG.z);g.rotation.y=Math.PI*.15;E.sc.add(g);E.mang=g;}
// textura de la bandera de la chica: verde, blanca o a cuadros
function tyBanderaTipo(k){const F=CH3.flag;if(!F)return;const m=F.cloth.material;if(!CH3.texCuadros)CH3.texCuadros=m.map;
  if(!CH3.texBlanca)CH3.texBlanca=dTex(64,48,(x,w,h)=>{x.fillStyle="#fbfbf6";x.fillRect(0,0,w,h);});
  if(!CH3.texVerde)CH3.texVerde=dTex(64,48,(x,w,h)=>{x.fillStyle="#1f9a4a";x.fillRect(0,0,w,h);});
  const t=k==="blanca"?CH3.texBlanca:k==="verde"?CH3.texVerde:CH3.texCuadros;if(m.map!==t){m.map=t;m.needsUpdate=true;}}
tyBanderaBlanca=function(on){tyBanderaTipo(on?"blanca":"cuadros");};
tyChicaFrame=function(E,R,dt){if(CH3.st!=="ok"||E.sal)return;
  if(CH3.obj.parent!==E.sc){E.sc.add(CH3.obj,CH3.flag.grp);CH3.obj.position.set(TY_MANG.x-.15,TY_MANG.h,TY_MANG.z);CH3.obj.rotation.y=Math.PI*.15;}
  CH3.obj.visible=CH3.flag.grp.visible=true;R.chT=(R.chT??CH_WAVE[0])+dt;if(R.chT>CH_WAVE[1])R.chT=CH_WAVE[0]+(R.chT-CH_WAVE[1]);
  const llego=R.done||R.cars.some(e=>e.fin!=null),ultima=R.green&&R.lapN===R.laps&&!llego;
  // verde: la levanta con el semáforo y la baja cuando se larga (y la agita un ratito); blanca en la última; a cuadros al final
  const largando=(R.esperaLuz&&R.phase>=2)||(R.green&&R.tGreen!=null&&R.t-R.tGreen<2.5);
  const tipo=llego?"cuadros":ultima?"blanca":(!R.green||largando)?"verde":"verde";tyBanderaTipo(tipo);
  const agita=largando||ultima||llego;CH3.act.time=agita?R.chT:CH_WAVE[0]+.05;CH3.mix.update(0);CH3.obj.updateMatrixWorld(true);updFlag(dt,performance.now()/1000);
  CH3.flag.grp.visible=agita||(!R.green&&!R.done);};

/* ---------- banderilleros ---------- */
function tyBandeSitios(){const a=TY.S/2,arc=Math.PI*TY.R,out=[];for(const c0 of[a,a+arc+TY.S])for(const f of[.06,.5,.94])out.push(c0+arc*f);return out;}
function tyBanderilleros(E){if(E.bande)return;E.bande=[];const TH=T3.TH;
  tyPersona("piloto",1.76).then(src=>{if(E.bande.length)return;const naranja=new TH.Color("#ff7a1a");
    tyBandeSitios().forEach((s,i)=>{const d=-TY.W/2-5,q=tyPose(s,d),g=new TH.Group(),o=src.clone(true);
      o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.material=m.material.clone();const tint=naranja;m.material.onBeforeCompile=sh=>{sh.uniforms.uTint={value:tint};sh.fragmentShader="uniform vec3 uTint;\n"+sh.fragmentShader.replace("#include <map_fragment>","#include <map_fragment>\n{vec3 c=diffuseColor.rgb;float l=max(c.r,max(c.g,c.b)),sat=l-min(c.r,min(c.g,c.b));float w=smoothstep(.5,.78,l)*(1.-smoothstep(.07,.2,sat));diffuseColor.rgb=mix(c,uTint*l,w);}");};}});
      g.add(o);tyBandeSinCasco(o);
      // la bandera roja en un palo, en la mano derecha
      const brazo=new TH.Group();brazo.position.set(-.36,1.52,0);g.add(brazo);
      const palo=new TH.Mesh(new TH.CylinderGeometry(.012,.012,1,6),new TH.MeshStandardMaterial({color:0x333333}));palo.position.y=.5;brazo.add(palo);
      const tela=new TH.Mesh(new TH.PlaneGeometry(.6,.42,4,1),new TH.MeshStandardMaterial({color:0xd7191f,roughness:.8,side:TH.DoubleSide}));tela.position.set(.3,.78,0);brazo.add(tela);
      brazo.rotation.z=2.6; // abajo, plegada al costado
      g.position.set(q.x,tyY(s,d),q.z);g.rotation.y=q.h+TY_BANDE_ROT;E.sc.add(g);E.bande.push({g,brazo,tela,ph:i*1.3});});}).catch(()=>{});}
const TY_BANDE_ROT=0;
// el modelo del piloto tiene el casco en la mano: al banderillero se le saca
function tyBandeSinCasco(o){const TH=T3.TH,v=new TH.Vector3();o.updateMatrixWorld(true);const inv=new TH.Matrix4().copy(o.parent.matrixWorld).invert();
  o.traverse(q=>{if(!q.isMesh)return;const g=q.geometry=q.geometry.clone(),P=g.attributes.position,I=g.index?g.index.array:null,n=I?I.length:P.count,keep=[];
    const M=new TH.Matrix4().multiplyMatrices(inv,q.matrixWorld);
    for(let t=0;t<n;t+=3){let cx=0,cy=0;for(let j=0;j<3;j++){v.fromBufferAttribute(P,I?I[t+j]:t+j).applyMatrix4(M);cx+=v.x;cy+=v.y;}cx/=3;cy/=3;
      if(!(cx>.19&&cy>.4&&cy<.8))for(let j=0;j<3;j++)keep.push(I?I[t+j]:t+j);}
    g.setIndex(keep);});}
function tyBandePaso(E,R,dt){if(!E.bande||!E.bande.length)return;const roja=!!R.roja,t=performance.now()/1000;
  for(const b of E.bande){const w=roja?-.25+Math.sin(t*7+b.ph)*.9:2.6;b.brazo.rotation.z+=(w-b.brazo.rotation.z)*Math.min(1,dt*(roja?12:3));
    b.tela.rotation.y=roja?Math.sin(t*9+b.ph)*.5:0;}}

/* ---------- semáforo: poste desde la tribuna con un brazo hasta un cuarto de la pista ---------- */
function tySemaforo3D(E){if(E.sema)return;const TH=T3.TH,g=new TH.Group(),fierro=new TH.MeshStandardMaterial({color:0x8f949a,roughness:.45,metalness:.7}),negro=new TH.MeshStandardMaterial({color:0x15171a,roughness:.6});
  const s0=1.5,p=tyPose(s0,0),H=7.2,dP=TY.W/2+2.4,dF=TY.W/2-TY.W/4;
  const poste=new TH.Mesh(new TH.CylinderGeometry(.14,.18,H,12),fierro);poste.position.set(0,H/2,dP);poste.castShadow=true;g.add(poste);
  const base=new TH.Mesh(new TH.CylinderGeometry(.35,.4,.3,12),fierro);base.position.set(0,.15,dP);g.add(base);
  const brazo=new TH.Mesh(new TH.CylinderGeometry(.09,.09,dP-dF+.3,10),fierro);brazo.rotation.x=Math.PI/2;brazo.position.set(0,H-.15,(dP+dF)/2);brazo.castShadow=true;g.add(brazo);
  const top=new TH.Mesh(new TH.CylinderGeometry(.08,.08,1.6,8),fierro);top.position.set(0,H+.6,dP);g.add(top);
  // la caja del semáforo, colgada del brazo, de cara a la grilla
  const W=2.05,caja=new TH.Mesh(new TH.BoxGeometry(.36,.62,W),negro);caja.position.set(0,H-.75,dF+W/2-.25);caja.castShadow=true;g.add(caja);
  for(const z of[-.6,.6]){const c=new TH.Mesh(new TH.CylinderGeometry(.03,.03,.32,6),fierro);c.position.set(0,H-.3,caja.position.z+z);g.add(c);}
  const lamps=[];for(let i=0;i<4;i++){const z=caja.position.z-W/2+.29+i*.49;
    const m=new TH.MeshStandardMaterial({color:0x1d1d1f,roughness:.25,emissive:0x000000,emissiveIntensity:3});const l=new TH.Mesh(new TH.CircleGeometry(.17,20),m);l.rotation.y=-Math.PI/2;l.position.set(-.185,H-.75,z);g.add(l);
    const vis=new TH.Mesh(new TH.CylinderGeometry(.2,.2,.22,16,1,true,0,Math.PI),negro);vis.rotation.z=Math.PI/2;vis.rotation.y=0;vis.position.set(-.29,H-.75,z);vis.rotation.set(0,0,Math.PI/2);vis.material.side=TH.DoubleSide;g.add(vis);
    lamps.push(m);}
  g.position.set(p.x,0,p.z);g.rotation.y=p.h;E.sc.add(g);E.sema={g,lamps,st:""};}
function tySemaPaso(E,R){const S3=E.sema;if(!S3)return;let st;
  if(R.esperaLuz)st="r"+Math.min(3,R.phase|0);else if(R.green&&R.tGreen!=null&&R.t-R.tGreen<5)st="v";else if(R.roja)st=(performance.now()/500|0)%2?"r3":"r0";else st="r0";
  if(st===S3.st)return;S3.st=st;const n=st[0]==="r"?+st[1]:0;
  S3.lamps.forEach((m,i)=>{if(st==="v"){m.color.setHex(0x0a3a18);m.emissive.setHex(0x22ff66);}else if(i<n){m.color.setHex(0x3a0808);m.emissive.setHex(0xff1a1a);}else{m.color.setHex(0x1d1d1f);m.emissive.setHex(0x000000);}});}
// el relator: "¡Comienza el semáforo…!" y al verde "¡Pasa a verde…! ¡Largaron!"
Object.assign(NAR_F4,{sema:"¡Comienza el semáforo…!",paverde:"¡Pasa a verde…!",largaron:"¡Largaron!"});
NARRA_F4.sema=[["f:sema"]];NARRA_F4.largada=[["f:paverde","f:largaron"]];NARRA_F4.relargada=[["f:paverde","f:largaron"]];NARF_BOLSA.largada=NARF_BOLSA.relargada=null;
// si todavía no están grabadas las frases nuevas del semáforo, usa las de siempre
{const _nf=narraF;narraF=function(k,p){if((k==="largada"||k==="relargada")&&NARF.map&&!NARF.map.f_paverde){NARRA_F4.largada_v=[["f:largada1"]];NARF_BOLSA.largada_v=null;return _nf.call(this,"largada_v",p);}
  return _nf.apply(this,arguments);};}
/* ---------- enganches ---------- */
{const _ee=tyEnvEst;tyEnvEst=function(){const E=_ee.apply(this,arguments);try{tyCalArmar(E);tyMangrullo(E);tyBanderilleros(E);tySemaforo3D(E);}catch(x){console.warn("pista",x);}return E;};}
// la cal se pinta de nuevo al empezar cada noche (o cada desafío)
{const _s3=tySetup3D;tySetup3D=function(R){const r=_s3.apply(this,arguments);try{const E=TY3.env;if(E&&E.cal&&!R.c.entreno){const id=R.J||R.c;if(TY3.calJ!==id){TY3.calJ=id;tyCalPintar(E);}}}catch(x){}return r;};}
{const _dr=tyDraw;tyDraw=function(R){try{const E=TY3.env;if(E&&!E.sal&&R&&R.g3){const dt=Math.min(.05,R.dt||.016);tyCalBorrar(E,R,dt);tyBandePaso(E,R,dt);tySemaPaso(E,R);if(R.esperaLuz&&!R._luzVista&&!R.c.vivo)narraF("sema",{});R._luzVista=!!R.esperaLuz;}}catch(x){}return _dr.apply(this,arguments);};}
