/* Noche de TAYA'xs — capa de realismo sobre el autódromo:
   reflejos (mapa de entorno), relieve de la tierra con huellas, luces que encandilan (HDR), conos de luz en el aire,
   niebla de noche, pasto con textura. Se aplica apenas se arma la escena. */
const _tyBuildBase=tyBuild;
tyBuild=function(){const E=_tyBuildBase();try{tyRealismo(E);}catch(e){console.warn("realismo",e);}return E;};
function ruido2(w,h,oct,seed){const a=new Float32Array(w*h);let amp=1,tot=0;
  for(let o=0;o<oct;o++){const f=Math.pow(2,o+2),g=[];const gw=f+1;for(let i=0;i<gw*gw;i++)g.push(tyRnd(seed+i*1.7+o*91.3));
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const fx=x/w*f,fy=y/h*f,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);
      const v00=g[iy*gw+ix],v10=g[iy*gw+(ix+1)%gw],v01=g[((iy+1)%gw)*gw+ix],v11=g[((iy+1)%gw)*gw+(ix+1)%gw];
      a[y*w+x]+=amp*((v00*(1-sx)+v10*sx)*(1-sy)+(v01*(1-sx)+v11*sx)*sy);}tot+=amp;amp*=.55;}
  for(let i=0;i<a.length;i++)a[i]/=tot;return a;}
// relieve de la pista: terrones y huellas a lo largo (u = a lo largo de la pista, v = de adentro hacia afuera)
function tyPisoMapas(TH){const W=512,H=512,n=ruido2(W,H,5,11),n2=ruido2(W,H,3,77),hgt=new Float32Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,v=y/H;
    // surcos que dejan las ruedas: líneas a lo largo, más marcadas en la huella de carrera
    const surco=Math.pow(Math.abs(Math.sin(v*Math.PI*46+n2[i]*3.2)),6)*.35;
    hgt[i]=n[i]*.75+surco*(.5+n2[i])+(tyRnd(i*.37)<.012?.6:0);}
  const nc=document.createElement("canvas");nc.width=W;nc.height=H;const nx=nc.getContext("2d"),nd=nx.createImageData(W,H);
  const rc=document.createElement("canvas");rc.width=W;rc.height=H;const rx=rc.getContext("2d"),rd=rx.createImageData(W,H);
  const hh=(x,y)=>hgt[((y+H)%H)*W+((x+W)%W)],k=5;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=(hh(x+1,y)-hh(x-1,y))*k,dy=(hh(x,y+1)-hh(x,y-1))*k,l=Math.hypot(dx,dy,1),j=(y*W+x)*4;
    nd.data[j]=(-dx/l*.5+.5)*255;nd.data[j+1]=(-dy/l*.5+.5)*255;nd.data[j+2]=(1/l*.5+.5)*255;nd.data[j+3]=255;
    // la tierra húmeda y apisonada brilla un poco más (menos rugosa) en los surcos
    const r=.78+n[y*W+x]*.25-hgt[y*W+x]*.12;rd.data[j]=rd.data[j+1]=rd.data[j+2]=Math.max(0,Math.min(255,r*255));rd.data[j+3]=255;}
  nx.putImageData(nd,0,0);rx.putImageData(rd,0,0);
  const nt=new TH.CanvasTexture(nc),rt=new TH.CanvasTexture(rc);[nt,rt].forEach(t=>{t.wrapS=t.wrapT=TH.RepeatWrapping;t.anisotropy=8;});return {nt,rt};}
function tyPastoTex(TH){const W=256,n=ruido2(W,W,5,5);return dTex(W,W,(x,w,h)=>{const d=x.createImageData(w,h);
  for(let i=0;i<w*h;i++){const v=n[i],j=i*4;d.data[j]=34+v*40;d.data[j+1]=58+v*70;d.data[j+2]=24+v*26;d.data[j+3]=255;}x.putImageData(d,0,0);
  for(let k=0;k<2400;k++){x.fillStyle=`rgba(${60+Math.random()*40},${90+Math.random()*60},${30+Math.random()*30},.35)`;x.fillRect(Math.random()*w,Math.random()*h,1,2+Math.random()*3);}},[1,1]);}
// mapa de entorno de noche: cielo oscuro y las torres de luz brillando, para que la chapa y el casco reflejen
function tyEntorno(TH,E){const ren=T3.ren,es=new TH.Scene();es.background=new TH.Color(0x05070d);
  const cielo=new TH.Mesh(new TH.SphereGeometry(50,24,12),new TH.ShaderMaterial({side:TH.BackSide,vertexShader:"varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader:"varying vec3 p;void main(){float h=normalize(p).y;vec3 c=mix(vec3(.06,.045,.035),vec3(.025,.035,.07),smoothstep(-.1,.5,h));c+=vec3(.12,.08,.05)*exp(-abs(h)*14.);gl_FragColor=vec4(c,1.);}"}));es.add(cielo);
  const lm=new TH.MeshBasicMaterial({color:new TH.Color(9,8.4,7.2)});
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.4,q=new TH.Mesh(new TH.PlaneGeometry(6,2.4),lm);q.position.set(Math.cos(a)*38,16,Math.sin(a)*38);q.lookAt(0,0,0);es.add(q);}
  const piso=new TH.Mesh(new TH.CircleGeometry(48,24),new TH.MeshBasicMaterial({color:0x2a1c12}));piso.rotation.x=-Math.PI/2;piso.position.y=-2;es.add(piso);
  const pm=new TH.PMREMGenerator(ren),env=pm.fromScene(es,.02).texture;pm.dispose();return env;}
// cono de luz de cada torre (polvo en el aire iluminado)
function tyConoLuz(TH,desde,hacia){const dir=new TH.Vector3().subVectors(hacia,desde),L=dir.length();
  const g=new TH.CylinderGeometry(1.6,16,L,24,1,true);g.translate(0,-L/2,0);
  const m=new TH.ShaderMaterial({transparent:true,depthWrite:false,blending:TH.AdditiveBlending,side:TH.DoubleSide,uniforms:{L:{value:L},k:{value:.055}},
    vertexShader:"varying float t;varying vec3 vn,vv;uniform float L;void main(){t=-position.y/L;vec4 mv=modelViewMatrix*vec4(position,1.);vv=normalize(-mv.xyz);vn=normalize(normalMatrix*normal);gl_Position=projectionMatrix*mv;}",
    fragmentShader:"varying float t;varying vec3 vn,vv;uniform float k;void main(){float f=pow(abs(dot(vn,vv)),1.6);float a=k*f*(1.-t)*(1.-t)*smoothstep(0.,.05,t);gl_FragColor=vec4(vec3(1.,.93,.78)*a,1.);}"});
  const c=new TH.Mesh(g,m);c.position.copy(desde);c.quaternion.setFromUnitVectors(new TH.Vector3(0,-1,0),dir.normalize());c.renderOrder=5;c.frustumCulled=false;return c;}
function tyRealismo(E){const TH=T3.TH,sc=E.sc,ult=ultra();
  // niebla nocturna: lo lejos se pierde en un azul muy oscuro
  sc.fog=new TH.FogExp2(0x0b0f19,.0042);
  // reflejos
  try{sc.environment=tyEntorno(TH,E);}catch(e){console.warn("entorno",e);}
  // la tierra: relieve, brillo húmedo en la huella
  if(E.pisoM){const {nt,rt}=tyPisoMapas(TH);E.pisoM.normalMap=nt;E.pisoM.normalScale=new TH.Vector2(.9,.9);E.pisoM.roughnessMap=rt;E.pisoM.roughness=1;E.pisoM.envMapIntensity=.35;E.pisoM.needsUpdate=true;}
  // pasto con textura en el infield y afuera
  const pt=tyPastoTex(TH);
  if(E.infield){const t=pt.clone();t.needsUpdate=true;t.wrapS=t.wrapT=TH.RepeatWrapping;t.repeat.set(.12,.12);E.infield.material.map=t;E.infield.material.color.setHex(0x9fb08f);E.infield.material.envMapIntensity=.2;E.infield.material.needsUpdate=true;}
  if(E.pasto){const t=pt.clone();t.needsUpdate=true;t.wrapS=t.wrapT=TH.RepeatWrapping;t.repeat.set(120,120);E.pasto.material.map=t;E.pasto.material.color.setHex(0x7d8a70);E.pasto.material.envMapIntensity=.15;E.pasto.material.needsUpdate=true;}
  // los proyectores encandilan: color por encima de 1 para que el bloom los haga brillar de verdad
  (E.heads||[]).forEach(h=>{h.material=new TH.MeshBasicMaterial({color:new TH.Color(6,5.6,4.8),fog:false});
    const desde=h.position.clone(),hacia=new TH.Vector3(h.position.x*.22,0,h.position.z*.22);
    if(ult||S.graf==="alta")sc.add(tyConoLuz(TH,desde,hacia));});
  // las luces de las torres alumbran un poco más fuerte y más cálido (el tono lo baja el post-proceso)
  (E.spots||[]).forEach(sp=>{sp.intensity*=1.35;sp.color.setHex(0xffe9c8);sp.penumbra=.8;});
  // materiales con un toque de reflejo: carteles y paredón
  sc.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshStandardMaterial&&o.material.envMapIntensity===1)o.material.envMapIntensity=.45;});}

/* ---------- autos: ploteo de colores y calcos de sponsors, como los midgets de verdad ---------- */
const TY_SPONS2=["ELECTRO SUR","LA TRADICIÓN","RECTIFICACIONES","LOS CUÑADOS","EL EMPORIO","CARNICERÍA EL TORO","GOMERÍA RUTA 3","TRANSPORTE BAHÍA","AGRO MÉDANO","REPUESTOS PUERTO","PINTURERÍA COLÓN","CORRALÓN SUR","FERRETERÍA WHITE","LUBRICENTRO 51","PANADERÍA LA ESPIGA","AUTOSERVICIO 9"];
const TY_PALETA=["#f2c230","#c0392b","#1f5fa8","#ececec","#1e8a4c","#e46b1c","#6c2a8a","#111111","#7ec8e3","#e8357a","#b6e01b","#0fb5ae"];
function tySponTex(t,fondo,tinta){return dTex(512,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle=fondo;const r=18;x.beginPath();x.roundRect?x.roundRect(4,8,w-8,h-16,r):x.rect(4,8,w-8,h-16);x.fill();
  x.fillStyle=tinta;x.font="900 64px 'Barlow Condensed',Arial Narrow,sans-serif";x.textAlign="center";x.textBaseline="middle";let s=64;while(x.measureText(t).width>w-40&&s>30){s-=4;x.font=`900 ${s}px 'Barlow Condensed',Arial Narrow,sans-serif`;}x.fillText(t,w/2,h/2+2);});}
function tyPloteo(mat,TH,box,c1,c2,c3,seed){mat.color.setRGB(1,1,1);
  mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uC1:{value:new TH.Color(c1)},uC2:{value:new TH.Color(c2)},uC3:{value:new TH.Color(c3)},uMin:{value:box.min.clone()},uSize:{value:box.getSize(new TH.Vector3())},uSeed:{value:seed}});
    sh.vertexShader="varying vec3 vObj;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\nvObj=position;");
    sh.fragmentShader="varying vec3 vObj;uniform vec3 uC1,uC2,uC3,uMin,uSize;uniform float uSeed;\n"+sh.fragmentShader.replace("#include <map_fragment>",`#include <map_fragment>
      {vec3 q=(vObj-uMin)/uSize;vec3 b=diffuseColor.rgb;float lum=dot(b,vec3(.299,.587,.114));float pint=smoothstep(.22,.45,lum);
       float diag=step(.5,q.y*1.3+q.x*.55*sign(uSeed-.5)+fract(uSeed*7.)*.3-.15);
       vec3 liv=mix(uC1,uC2,diag);
       float fr=abs(fract((q.x*1.6+q.y*.9)*(2.+floor(uSeed*3.))+uSeed)-.5);liv=mix(liv,uC3,step(fr,.06));
       diffuseColor.rgb=mix(b,liv*(.45+.75*lum),pint*.92);}`);};
  mat.customProgramCacheKey=()=>"ploteo";mat.roughness=.42;mat.metalness=.08;mat.envMapIntensity=.9;mat.needsUpdate=true;}
// más puntos de la chapa para los calcos de sponsors (adelante y atrás del número)
function tySponPts(m,src){TY3.dsp=TY3.dsp||{};if(TY3.dsp[m])return TY3.dsp[m];const TH=T3.TH,rc=new TH.Raycaster(),out=[];src.updateMatrixWorld(true);
  const box=new TH.Box3().setFromObject(src),L=box.max.x-box.min.x,cx=(box.max.x+box.min.x)/2,H=box.max.y-box.min.y;
  for(const sd of[1,-1])for(const [fx,fy] of[[.2,.36],[.3,.3],[-.32,.34]]){rc.set(new TH.Vector3(cx+fx*L,box.min.y+fy*H,sd*4),new TH.Vector3(0,0,-sd));rc.far=8;
    const h=rc.intersectObject(src,true).find(q=>q.face);if(!h)continue;const n=h.face.normal.clone().transformDirection(h.object.matrixWorld);if(Math.abs(n.z)<.5||Math.sign(n.z)!==sd)continue;
    out.push({p:h.point.clone().add(n.clone().multiplyScalar(.014)),n,w:.5});}
  return TY3.dsp[m]=out;}
const _tyAutoObjBase=tyAutoObj;
tyAutoObj=function(e){const g=_tyAutoObjBase(e);if(!g)return g;try{const TH=T3.TH,src=TY3.mod[e.m],piv=g.userData.piv;
  const h=Math.abs(Math.sin((e.num||7)*12.9898+(e.id||"").length*78.2)*43758.55)%1;
  const c1=e.col,c2=TY_PALETA[Math.floor(h*97)%TY_PALETA.length],c3=h>.5?"#ffffff":"#111111";
  const box=new TH.Box3();src.traverse(q=>{if(q.isMesh){q.geometry.computeBoundingBox();box.union(q.geometry.boundingBox);}});
  piv.children[0].traverse(q=>{if(q.isMesh&&q.material&&!q.material.transparent)tyPloteo(q.material,TH,box,c1,c2===c1?"#111111":c2,c3,h);});
  // calcos de sponsors en los costados
  const sp=tySponPts(e.m,src);sp.forEach((d,i)=>{const t=TY_SPONS2[Math.floor(h*1000+i*7)%TY_SPONS2.length],fondo=i%3===1?"#ffffff":(i%3===2?c2:"#111111"),tinta=fondo==="#ffffff"?"#c0392b":"#f2f2f2";
    const k="sp|"+t+fondo;TY3.spT=TY3.spT||{};const tex=TY3.spT[k]||(TY3.spT[k]=tySponTex(t,fondo,tinta));
    const pl=new TH.Mesh(new TH.PlaneGeometry(d.w,d.w*.25),new TH.MeshStandardMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,roughness:.45}));pl.position.copy(d.p);pl.lookAt(d.p.clone().add(d.n));piv.add(pl);});
}catch(err){console.warn("ploteo",err);}return g;};

/* ---------- cámara de adentro: los ojos del piloto, el volante y los relojes ---------- */
function tyCabArmar(E){const TH=T3.TH,cab=new TH.Group();
  const neg=new TH.MeshStandardMaterial({color:0x1a1a1a,roughness:.75}),gris=new TH.MeshStandardMaterial({color:0x8a8f96,roughness:.35,metalness:.7});
  // volante de gamuza con 3 rayos y la marca amarilla arriba
  const vol=new TH.Group();const aro=new TH.Mesh(new TH.TorusGeometry(.17,.022,10,40),neg);vol.add(aro);
  for(const a of[0,2.1,-2.1]){const r=new TH.Mesh(new TH.BoxGeometry(.03,.16,.012),gris);r.position.set(Math.sin(a)*.08,-Math.cos(a)*.08,0);r.rotation.z=a;vol.add(r);}
  const cen=new TH.Mesh(new TH.CylinderGeometry(.045,.045,.03,20),gris);cen.rotation.x=Math.PI/2;vol.add(cen);
  const marca=new TH.Mesh(new TH.BoxGeometry(.02,.03,.03),new TH.MeshStandardMaterial({color:0xf2c230,roughness:.5}));marca.position.y=.17;vol.add(marca);
  vol.position.set(0,-.24,-.48);vol.rotation.x=-.35;cab.add(vol);cab.userData.vol=vol;
  // tablero con relojes (temperatura, presión de aceite, vueltas)
  const tab=new TH.Mesh(new TH.BoxGeometry(.62,.1,.12),neg);tab.position.set(0,-.17,-.66);tab.rotation.x=-.3;cab.add(tab);
  const relojT=dTex(128,128,(x,w,h)=>{x.fillStyle="#f2f2ee";x.beginPath();x.arc(64,64,60,0,7);x.fill();x.strokeStyle="#111";x.lineWidth=4;x.stroke();for(let i=0;i<9;i++){const a=Math.PI*.75+i/8*Math.PI*1.5;x.beginPath();x.moveTo(64+Math.cos(a)*44,64+Math.sin(a)*44);x.lineTo(64+Math.cos(a)*54,64+Math.sin(a)*54);x.stroke();}});
  const agujas=[];for(const xx of[-.17,0,.17]){const r=new TH.Mesh(new TH.CircleGeometry(.04,24),new TH.MeshBasicMaterial({map:relojT}));r.position.set(xx,-.115,-.615);r.rotation.x=-.3;cab.add(r);
    const ag=new TH.Mesh(new TH.PlaneGeometry(.004,.034),new TH.MeshBasicMaterial({color:0xd7263d}));ag.geometry.translate(0,.017,0);ag.position.set(xx,-.113,-.611);ag.rotation.x=-.3;cab.add(ag);agujas.push(ag);}
  cab.userData.agujas=agujas;
  // caños de la jaula a los costados y arriba (el marco de la vista)
  for(const sx of[-1,1]){const c=new TH.Mesh(new TH.CylinderGeometry(.022,.022,1.2,8),neg);c.position.set(sx*.42,.05,-.42);c.rotation.x=.55;c.rotation.z=sx*.12;cab.add(c);}
  const top=new TH.Mesh(new TH.CylinderGeometry(.022,.022,.9,8),neg);top.rotation.z=Math.PI/2;top.position.set(0,.36,-.55);cab.add(top);
  // red de seguridad del lado izquierdo
  const red=dTex(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle="rgba(15,15,15,.95)";x.lineWidth=5;for(let i=0;i<=128;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,128);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(128,i);x.stroke();}});
  const rd=new TH.Mesh(new TH.PlaneGeometry(.5,.45),new TH.MeshBasicMaterial({map:red,transparent:true,side:TH.DoubleSide,depthWrite:false}));rd.position.set(-.46,.02,-.25);rd.rotation.y=Math.PI/2.4;cab.add(rd);
  cab.traverse(o=>{o.frustumCulled=false;o.renderOrder=20;if(o.material){o.material.depthTest=true;o.material.fog=false;}});
  E.cam.add(cab);E.sc.add(E.cam);E.cab=cab;return cab;}
function tyCabina(E,P,pp,dt){const TH=T3.TH,g=P.g;if(!g)return;const cab=E.cab||tyCabArmar(E);cab.visible=true;
  // hacia dónde apunta la trompa: el eje del modelo que más coincide con la dirección de marcha
  g.updateMatrixWorld(true);const ax=new TH.Vector3(1,0,0).transformDirection(g.matrixWorld),q1=tyPose(P.s+1,P.d),mar=new TH.Vector3(q1.x-pp.x,0,q1.z-pp.z).normalize();
  const sgn=Math.sign(ax.dot(new TH.Vector3().copy(mar).applyAxisAngle(new TH.Vector3(0,1,0),-(P.sa||0))))||1,fw=ax.multiplyScalar(sgn).setY(0).normalize();
  const hy=g.position.y+1.05+(g.userData.piv?g.userData.piv.rotation.z*.4:0),side=new TH.Vector3(-fw.z,0,fw.x);
  const eye=new TH.Vector3(g.position.x,hy,g.position.z).addScaledVector(fw,-.15).addScaledVector(side,.08);
  E.cam.position.copy(eye);E.cam.lookAt(eye.x+fw.x*20,hy-.9,eye.z+fw.z*20);
  // el volante gira con el contravolante y la cabeza se sacude con la tierra
  const R=TYR,st=R?(R.steer||0):0;cab.userData.vol.rotation.z+=((-st*1.4+(P.sa||0)*1.2)-cab.userData.vol.rotation.z)*Math.min(1,dt*8);
  E.cam.position.y+=Math.sin(performance.now()/37)*.006*Math.min(1,P.v/20);
  const ag=cab.userData.agujas;if(ag){ag[0].rotation.z=-.6+.2*Math.sin(performance.now()/3000);ag[1].rotation.z=1.2-Math.min(2.4,P.v/14);ag[2].rotation.z=-.4-(P.th||0)*1.6;}
  // el propio auto no se dibuja por dentro (taparía la vista), pero sí su sombra y el polvo
  if(g.userData.piv)g.userData.piv.visible=false;}
// al salir de la cámara de adentro, el auto vuelve a verse
(function(){const t=setInterval(()=>{if(typeof TYR==="undefined")return;const R=TYR;if(R&&R.P&&R.P.g&&R.cam!=="cabina"&&R.P.g.userData.piv&&!R.P.g.userData.piv.visible)R.P.g.userData.piv.visible=true;},300);})();

/* ---------- torres de luz: bastidor con 8 reflectores cada una, como en el autódromo ---------- */
function tyTorresReales(E){const TH=T3.TH;if(!E.heads)return;const lamp=new TH.MeshBasicMaterial({color:new TH.Color(7,6.6,5.6),fog:false}),marco=new TH.MeshStandardMaterial({color:0x3a3d42,roughness:.6,metalness:.6}),
  geoL=new TH.CylinderGeometry(.42,.48,.35,16),geoC=new TH.CylinderGeometry(.5,.5,.42,16,1,true);
  E.heads.forEach(h=>{const g=new TH.Group();g.position.copy(h.position);g.quaternion.copy(h.quaternion);
    const bast=new TH.Mesh(new TH.BoxGeometry(5.4,2.6,.18),marco);g.add(bast);
    for(let r=0;r<2;r++)for(let c=0;c<4;c++){const x=-1.95+c*1.3,y=-.62+r*1.24;
      const caja=new TH.Mesh(geoC,marco);caja.rotation.x=Math.PI/2;caja.position.set(x,y,.3);g.add(caja);
      const l=new TH.Mesh(geoL,lamp);l.rotation.x=Math.PI/2;l.position.set(x,y,.32);g.add(l);}
    h.visible=false;h.parent.add(g);});}
const _tyRealismoBase=tyRealismo;
tyRealismo=function(E){_tyRealismoBase(E);try{tyTorresReales(E);}catch(e){console.warn("torres",e);}};

/* ---------- vitrina: el midget elegido girando en 3D, con su ploteo y su número ---------- */
const VIT={raf:0,sc:null,cam:null,car:null,key:"",ang:.6,drag:null};
function tyVitrina(cont){const T=tyState(),cv=el(`<canvas class="tyvit" title="Arrastrá para girarlo"></canvas>`);cont.prepend(cv);
  cancelAnimationFrame(VIT.raf);
  init3D().then(ok=>{if(!ok)return;const TH=T3.TH;
    if(!VIT.sc){const sc=new TH.Scene();sc.background=new TH.Color(0x0b0e16);try{sc.environment=tyEntorno(TH);}catch(e){}
      const piso=new TH.Mesh(new TH.CircleGeometry(4.2,64),new TH.MeshStandardMaterial({color:0x2a2622,roughness:.9}));piso.rotation.x=-Math.PI/2;piso.receiveShadow=true;sc.add(piso);
      const key=new TH.SpotLight(0xfff0d8,2.2,30,Math.PI/5,.6,1.5);key.position.set(4,7,3);key.castShadow=true;key.shadow.mapSize.set(1024,1024);sc.add(key,key.target);
      const rim=new TH.DirectionalLight(0x9fb8ff,.6);rim.position.set(-5,3,-4);sc.add(rim);sc.add(new TH.HemisphereLight(0x8090b0,0x201810,.35));
      VIT.sc=sc;VIT.cam=new TH.PerspectiveCamera(32,1,.1,50);}
    const k=T.m+T.col+T.num;
    const poner=()=>{if(VIT.car){VIT.sc.remove(VIT.car);VIT.car=null;}const o=tyAutoObj({id:"yo",m:T.m,col:T.col,num:T.num,spon:S.apodo||"",n:S.apodo});if(o){o.traverse(q=>{if(q.isMesh)q.castShadow=true;});VIT.sc.add(o);VIT.car=o;VIT.key=k;}};
    tyModelo(T.m).then(()=>{if(VIT.key!==k||!VIT.car)poner();});
    cv.addEventListener("pointerdown",e=>{VIT.drag=e.clientX;cv.setPointerCapture(e.pointerId);});cv.addEventListener("pointermove",e=>{if(VIT.drag!=null){VIT.ang-=(e.clientX-VIT.drag)*.01;VIT.drag=e.clientX;}});cv.addEventListener("pointerup",()=>VIT.drag=null);
    const loop=()=>{if(!cv.isConnected||(typeof TYR!=="undefined"&&TYR))return;VIT.raf=requestAnimationFrame(loop);
      const w=Math.round(cv.clientWidth*Math.min(2,devicePixelRatio||1)),h=Math.round(cv.clientHeight*Math.min(2,devicePixelRatio||1));if(!w||!h)return;if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
      if(VIT.drag==null)VIT.ang+=.004;const r=6.2;VIT.cam.aspect=w/h;VIT.cam.position.set(Math.cos(VIT.ang)*r,2.1,Math.sin(VIT.ang)*r);VIT.cam.lookAt(0,.55,0);VIT.cam.updateProjectionMatrix();
      const ren=T3.ren;ren.setSize(w,h,false);ren.setClearColor(0x0b0e16,1);ren.toneMapping=TH.ACESFilmicToneMapping;ren.render(VIT.sc,VIT.cam);const x=cv.getContext("2d");x.drawImage(ren.domElement,0,0,w,h);};loop();});}
const _vTayaBase=vTaya;
vTaya=function(m){_vTayaBase(m);try{const card=[...m.querySelectorAll(".copa")].find(c=>/Tu midget/.test(c.textContent));if(card)tyVitrina(card);}catch(e){console.warn("vitrina",e);}};
