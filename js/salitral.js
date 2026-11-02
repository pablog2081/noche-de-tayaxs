/* Noche de TAYA'xs — modo entrenamiento: tu midget solo, en un óvalo marcado sobre un salitral, a la tarde.
   La pista usa la misma geometría que el autódromo (así la física es la misma), sin cubiertas: la marcan la huella y unas rocas. */
function tySalTex(TH){const W=1024,G=9,cs=W/G,n=ruido2(W,W,5,31),cel=[];for(let gy=0;gy<G;gy++)for(let gx=0;gx<G;gx++)cel.push([(gx+.15+tyRnd(gx*7.1+gy*13.3)*.7)*cs,(gy+.15+tyRnd(gx*3.7+gy*5.9+1)*.7)*cs]);
  // costra de sal: placas poligonales (celdas de Voronoi en una grilla) con bordes levantados más oscuros
  const c=document.createElement("canvas");c.width=c.height=W;const x=c.getContext("2d"),d=x.createImageData(W,W),hg=new Float32Array(W*W);
  for(let y=0;y<W;y++)for(let xx=0;xx<W;xx++){let a=1e9,b=1e9;const gx=Math.floor(xx/cs),gy=Math.floor(y/cs);
    for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){const cx=(gx+ox+G)%G,cy=(gy+oy+G)%G,[px,py]=cel[cy*G+cx],qx=px+(gx+ox-cx)*cs- (gx+ox<0?0:0),qy=py+(gy+oy-cy)*cs;
      const dd=(xx-qx)**2+(y-qy)**2;if(dd<a){b=a;a=dd;}else if(dd<b)b=dd;}
    const borde=Math.sqrt(b)-Math.sqrt(a),cr=Math.max(0,1-borde/4.5),i=y*W+xx,v=n[i];hg[i]=cr*1.1+v*.3;
    const sombra=Math.max(0,1-Math.abs(borde-6)/3)*.5,base=206+v*30+cr*34-sombra*26,j=i*4;d.data[j]=Math.min(255,base+8);d.data[j+1]=Math.min(255,base+3);d.data[j+2]=Math.min(255,base-9);d.data[j+3]=255;}
  x.putImageData(d,0,0);
  const map=new TH.CanvasTexture(c);map.encoding=TH.sRGBEncoding;
  const nc=document.createElement("canvas");nc.width=nc.height=W;const nx=nc.getContext("2d"),nd=nx.createImageData(W,W),H=(a,b)=>hg[((b+W)%W)*W+((a+W)%W)];
  for(let y=0;y<W;y++)for(let xx=0;xx<W;xx++){const dx=(H(xx+1,y)-H(xx-1,y))*4,dy=(H(xx,y+1)-H(xx,y-1))*4,l=Math.hypot(dx,dy,1),j=(y*W+xx)*4;nd.data[j]=(-dx/l*.5+.5)*255;nd.data[j+1]=(-dy/l*.5+.5)*255;nd.data[j+2]=(1/l*.5+.5)*255;nd.data[j+3]=255;}
  nx.putImageData(nd,0,0);const nrm=new TH.CanvasTexture(nc);
  [map,nrm].forEach(t=>{t.wrapS=t.wrapT=TH.RepeatWrapping;t.anisotropy=8;});return {map,nrm};}
function tyCieloTarde(TH,sol){return new TH.Mesh(new TH.SphereGeometry(1200,48,24),new TH.ShaderMaterial({side:TH.BackSide,depthWrite:false,fog:false,uniforms:{sol:{value:sol.clone().normalize()}},
  vertexShader:"varying vec3 p;void main(){p=normalize(position);vec4 m=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*m;gl_Position.z=gl_Position.w*.9999;}",
  fragmentShader:`varying vec3 p;uniform vec3 sol;void main(){float h=max(p.y,0.);
    vec3 cielo=mix(vec3(1.6,1.05,.62),vec3(.32,.52,.95),pow(h,.45));cielo=mix(cielo,vec3(.18,.3,.7),smoothstep(.35,1.,h));
    float s=max(dot(p,sol),0.);cielo+=vec3(5.,3.6,2.)*pow(s,900.)+vec3(1.2,.75,.4)*pow(s,12.)*.6;
    if(p.y<0.)cielo=vec3(.9,.82,.72);gl_FragColor=vec4(cielo,1.);}`}));}
function tyBuildSalitral(){const TH=T3.TH,sc=new TH.Scene(),E={sc,flags:[],sal:true,cars:[]},L=TY.LAP;
  E.cam=new TH.PerspectiveCamera(55,1,.1,2500);E.cam.layers.enable(2);
  const sol=new TH.Vector3(-260,70,-180);sc.add(tyCieloTarde(TH,sol));sc.fog=new TH.FogExp2(0xe8d6bf,.0005);sc.userData.expo=.42;sc.userData.vig=.3;sc.userData.bloom=.18;
  // sol bajo de la tarde: luz cálida con sombras largas
  const sun=new TH.DirectionalLight(0xffd6a8,2.4);sun.position.copy(sol).normalize().multiplyScalar(220);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);
  Object.assign(sun.shadow.camera,{left:-130,right:130,top:90,bottom:-90,near:20,far:600});sun.shadow.bias=-.0003;sun.shadow.normalBias=.02;sc.add(sun,sun.target);E.spots=[sun];
  sc.add(new TH.HemisphereLight(0x9cc0ff,0xc9b9a3,.45));
  // entorno para los reflejos: el mismo cielo de la tarde
  try{const es=new TH.Scene();es.add(tyCieloTarde(TH,sol));const pm=new TH.PMREMGenerator(T3.ren);sc.environment=pm.fromScene(es,.04).texture;pm.dispose();}catch(e){}
  // el salar hasta el horizonte
  const {map,nrm}=tySalTex(TH);map.repeat.set(150,150);nrm.repeat.set(150,150);
  const salM=new TH.MeshStandardMaterial({map,normalMap:nrm,normalScale:new TH.Vector2(.8,.8),roughness:.88,color:0xffffff,envMapIntensity:.6});
  const salar=new TH.Mesh(new TH.PlaneGeometry(2400,2400),salM);salar.rotation.x=-Math.PI/2;salar.receiveShadow=true;sc.add(salar);
  // la pista: la sal pisada y mezclada con barro (más oscura), con las huellas de tanto dar vueltas
  const strip=(d0,d1,mat,dy)=>{const pts=[],uv=[],idx=[];let k=0;for(let s=0;s<=L+.01;s+=2){for(const d of[d0,d1]){const p=tyPose(s,d);pts.push(p.x,dy,p.z);uv.push(s/10,(d-d0)/10);}if(k){const a=(k-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}k++;}
    const g=new TH.BufferGeometry();g.setAttribute("position",new TH.Float32BufferAttribute(pts,3));g.setAttribute("uv",new TH.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new TH.Mesh(g,mat);m.receiveShadow=true;sc.add(m);return m;};
  const huella=dTex(512,256,(x,w,h)=>{x.clearRect(0,0,w,h);for(let i=0;i<260;i++){const y=h*(.12+Math.random()*.76),a=.03+Math.random()*.09;x.strokeStyle=`rgba(${70+Math.random()*30},${58+Math.random()*20},${44+Math.random()*16},${a})`;x.lineWidth=2+Math.random()*7;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(w*.3,y+Math.random()*8-4,w*.7,y+Math.random()*8-4,w,y);x.stroke();}
    const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"rgba(120,100,80,0)");g.addColorStop(.25,"rgba(120,100,80,.35)");g.addColorStop(.75,"rgba(120,100,80,.35)");g.addColorStop(1,"rgba(120,100,80,0)");x.fillStyle=g;x.fillRect(0,0,w,h);});
  huella.wrapS=TH.RepeatWrapping;huella.repeat.set(1,1);
  const pM=new TH.MeshStandardMaterial({map:huella,transparent:true,depthWrite:false,roughness:.8,polygonOffset:true,polygonOffsetFactor:-1});
  E.pisoM=pM;strip(-TY.W/2-.6,TY.W/2+.4,pM,.02);
  // sin cubiertas: el óvalo queda marcado por la huella y por rocas puestas cada tanto en los dos bordes (más seguidas en las curvas)
  {const arc=Math.PI*TY.R,curva=s=>{const u=(((s-TY.S/2)%L)+L)%L;return u<arc||(u>arc+TY.S&&u<2*arc+TY.S);};
    const geos=[0,1,2,3].map(k=>{const g=new TH.IcosahedronGeometry(1,1),P=g.attributes.position,v=new TH.Vector3(),key=new Map();
      for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);const id=v.x.toFixed(3)+v.y.toFixed(3)+v.z.toFixed(3);if(!key.has(id))key.set(id,.72+tyRnd(i*7.3+k*31.7)*.5);const f=key.get(id);P.setXYZ(i,v.x*f,Math.max(-.35,v.y*f),v.z*f);}
      g.computeVertexNormals();return g;});
    const mat=new TH.MeshStandardMaterial({color:0xffffff,roughness:.95,flatShading:true});
    const lista=[];for(const [d,lado] of[[TY.W/2+.75,1],[-TY.W/2-.7,0]])for(let s=0;s<L;){const c=curva(s);lista.push({s,d:d+(tyRnd(s*1.7+lado)-.5)*.35});s+=c?3.2+tyRnd(s+lado*9)*1.2:11+tyRnd(s*.3+lado)*4;}
    const M=new TH.Matrix4(),Q=new TH.Quaternion(),E3=new TH.Euler(),C=new TH.Color(),por=geos.map(()=>[]);lista.forEach((r,i)=>por[i%4].push(r));
    por.forEach((rs,k)=>{const im=new TH.InstancedMesh(geos[k],mat,rs.length);rs.forEach((r,i)=>{const p=tyPose(r.s,r.d),q=tyRnd(r.s*3.1+k),t=.22+q*.3;
        E3.set((tyRnd(r.s+1)-.5)*.5,tyRnd(r.s*5.3)*6.3,(tyRnd(r.s+2)-.5)*.5);Q.setFromEuler(E3);M.compose(new TH.Vector3(p.x,t*.25,p.z),Q,new TH.Vector3(t*(1.1+q*.5),t*.75,t));im.setMatrixAt(i,M);
        const g=.38+tyRnd(r.s*9.7)*.22;C.setRGB(g*1.05,g*.97,g*.88);im.setColorAt(i,C);});
      im.castShadow=im.receiveShadow=true;sc.add(im);});}
  // línea de largada pintada con cal
  {const fl=new TH.Mesh(new TH.PlaneGeometry(.8,TY.W),new TH.MeshStandardMaterial({color:0xffffff,roughness:.6}));fl.rotation.x=-Math.PI/2;fl.rotation.z=Math.PI/2;fl.position.set(0,.04,TY.R);fl.receiveShadow=true;sc.add(fl);}
  // sierras lejanas, azuladas por la distancia
  {const g=new TH.CylinderGeometry(1500,1500,1,180,1,true),pos=g.attributes.position;for(let i=0;i<pos.count;i++){const a=Math.atan2(pos.getZ(i),pos.getX(i)),y=pos.getY(i);if(y>0){const h=26+Math.sin(a*3.1)*18+Math.sin(a*7.7+1)*12+Math.sin(a*17.3)*6+Math.max(0,Math.sin(a*1.3-.5))*40;pos.setY(i,h);}else pos.setY(i,-2);}
    g.computeVertexNormals();const m=new TH.Mesh(g,new TH.MeshBasicMaterial({color:0x8e8aa8,side:TH.BackSide,fog:false}));sc.add(m);}
  // el campamento: la F100 con el trailer, un gazebo y la caja de herramientas al costado de la recta
  {const base=tyPose(-12,-TY.W/2-14),grp=new TH.Group();grp.position.set(base.x,0,base.z);grp.rotation.y=base.h;sc.add(grp);
    const lona=new TH.Mesh(new TH.ConeGeometry(4.2,1.4,4,1,true),new TH.MeshStandardMaterial({color:0x1f5fa8,roughness:.8,side:TH.DoubleSide}));lona.position.set(0,3.3,0);lona.rotation.y=Math.PI/4;lona.castShadow=true;grp.add(lona);
    for(const [x,z] of[[-2.9,-2.9],[2.9,-2.9],[-2.9,2.9],[2.9,2.9]]){const p=new TH.Mesh(new TH.CylinderGeometry(.04,.04,2.6,6),new TH.MeshStandardMaterial({color:0xcfd3d8,metalness:.7,roughness:.3}));p.position.set(x,1.3,z);p.castShadow=true;grp.add(p);}
    const caja=new TH.Mesh(new TH.BoxGeometry(1.2,.8,.6),new TH.MeshStandardMaterial({color:0xc0392b,roughness:.4,metalness:.3}));caja.position.set(1.4,.4,-1.5);caja.castShadow=true;grp.add(caja);
    tyModelo("f100",5.25).then(f=>{const o=f.clone(true);o.position.set(-8,0,0);o.rotation.y=.4;o.traverse(q=>{if(q.isMesh)q.castShadow=true;});grp.add(o);}).catch(()=>{});
    const trailer=new TH.Mesh(new TH.BoxGeometry(4,.25,2),new TH.MeshStandardMaterial({color:0x2c2c2c,roughness:.6,metalness:.5}));trailer.position.set(-13,.6,1.2);trailer.castShadow=true;grp.add(trailer);}
  // un poco de polvo de sal flotando a lo lejos
  E.cars=[];return E;}

/* ---------- la sesión de entrenamiento ---------- */
function tyEntreno(){if(typeof TYR!=="undefined"&&TYR)return;const J={fecha:0,ent:["yo"],res:{},pend:[],pts:{},log:[],fuera:false,etapa:"entreno",gUso:0,serv:false,carreras:0,yaPresento:true,entreno:true};
  const c={nom:"Entrenamiento · Salitral",laps:999,ids:["yo"],entreno:true,etapa:"entreno"};
  tyLargar(c,J);TYR.ent={vueltas:[],ult:null,mejor:null,ini:null};}
function tyEntrenoTick(R){const P=R.P,E=R.ent;if(!E||!R.green)return;const L=TY.LAP,v=Math.floor(Math.max(0,P.dist)/L);
  if(E.ini==null){E.ini=R.t;E.v=v;}
  if(v>E.v){const t=R.t-E.ini;E.vueltas.push(t);E.ult=t;if(E.mejor==null||t<E.mejor){E.mejor=t;tyMsg("¡Mejor vuelta! "+t.toFixed(2)+" s","var(--verde)");}else tyMsg("Vuelta "+t.toFixed(2)+" s · mejor "+E.mejor.toFixed(2),"var(--crema)");E.ini=R.t;E.v=v;}
  let d=$("#tyEnt");if(!d){d=el(`<div id="tyEnt"></div>`);$("#tyRace").append(d);}
  d.innerHTML=`<b>Entrenamiento</b><span>Vuelta actual ${(R.t-E.ini).toFixed(1)} s</span><span>Última ${E.ult?E.ult.toFixed(2)+" s":"—"}</span><span>Mejor ${E.mejor?E.mejor.toFixed(2)+" s":"—"}</span><small>Esc: pausa (ahí podés terminar)</small>`;}
function tyFinEntreno(R){const E=R.ent||{vueltas:[]},T=tyState();if(E.mejor&&(!T.mejorSal||E.mejor<T.mejorSal)){T.mejorSal=E.mejor;save();}
  tyAudioStop&&tyAudioStop();TYR=null;tyUI(false);const d=$("#tyEnt");if(d)d.remove();
  modal(`<h3 class="gan">Entrenamiento terminado</h3><p>Diste ${E.vueltas.length} vuelta${E.vueltas.length===1?"":"s"} en el salitral.${E.mejor?` Tu mejor vuelta: <b>${E.mejor.toFixed(2)} s</b>.`:""}${T.mejorSal?` Récord tuyo: ${T.mejorSal.toFixed(2)} s.`:""}</p>
    ${E.vueltas.length?`<table class="ovtab"><tr><th>Vuelta</th><th>Tiempo</th></tr>${E.vueltas.map((t,i)=>`<tr${t===E.mejor?' class="yo"':''}><td>${i+1}</td><td>${t.toFixed(2)} s</td></tr>`).join("")}</table>`:""}
    <div class="opts"><button class="btn oro" id="teOtra">Otra tanda</button><button class="btn sec" id="teOk">Volver</button></div>`,"resplaca");
  $("#teOk").onclick=()=>{closeModal();render();};$("#teOtra").onclick=()=>{closeModal();tyEntreno();};}
// tarjeta en la pantalla principal
const _vTayaBase2=vTaya;
vTaya=function(m){_vTayaBase2(m);const T=tyState();const c=el(`<div class="copa"><div class="row" style="justify-content:space-between;align-items:center;gap:10px"><div><div class="t">Entrenamiento en el salitral</div><div class="s">Tu midget solo, a la tarde, en un óvalo marcado con rocas sobre la sal. Sin rivales ni gastos: para aprender a manejar el derrape.${T.mejorSal?` Tu récord: ${T.mejorSal.toFixed(2)} s.`:""}</div></div><button class="btn" id="tyEnt0">Entrenar</button></div></div>`);
  const box=m.querySelector("#tyGo");const card=box?box.closest(".copa"):null;if(card)card.after(c);else m.append(c);c.querySelector("#tyEnt0").onclick=()=>tyEntreno();};
