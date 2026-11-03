/* Noche de TAYA'xs — la vista de adentro del midget, más lograda:
   · tablero de aluminio remachado con cuentavueltas grande (y luz de cambio), presión de aceite, temperatura de agua,
     voltímetro y combustible, llaves de encendido y nafta con tapitas y el botón rojo de arranque;
   · volante de gamuza con maza de desenganche rápido;
   · las manos del piloto con guantes agarrando el volante a las 9 y cuarto, y los antebrazos con el buzo de su color. */
function tyCabTex(){if(TY3.cabTex)return TY3.cabTex;
  const panel=dTex(1024,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#b9bec4");g.addColorStop(.5,"#d5d9dd");g.addColorStop(1,"#9ea3a9");x.fillStyle=g;x.fillRect(0,0,w,h);
    for(let i=0;i<2600;i++){x.strokeStyle=`rgba(${Math.random()<.5?255:60},${Math.random()<.5?255:60},${Math.random()<.5?255:60},${Math.random()*.06})`;const y=Math.random()*h;x.beginPath();x.moveTo(Math.random()*w,y);x.lineTo(Math.random()*w,y+Math.random()*1.5);x.stroke();}
    x.fillStyle="#5c6168";for(let i=0;i<14;i++){for(const y of[10,h-10]){x.beginPath();x.arc(18+i*(w-36)/13,y,4.5,0,7);x.fill();}}
    x.font="700 22px 'Barlow Condensed',Arial Narrow,sans-serif";x.fillStyle="#1d1f22";x.textAlign="center";
    [["ACEITE",132],["AGUA",268],["VOLTS",756],["NAFTA",892]].forEach(([t,xx])=>x.fillText(t,xx,h-22));
    x.fillText("IGN",660,58);x.fillText("BOMBA",740,58);x.fillText("ARRANQUE",860,58);},[1,1]);
  const reloj=(max,marcas,rojo,label,num)=>dTex(256,256,(x,w,h)=>{const c=128;const g=x.createRadialGradient(c,c,20,c,c,128);g.addColorStop(0,"#16181b");g.addColorStop(1,"#050506");x.fillStyle=g;x.beginPath();x.arc(c,c,124,0,7);x.fill();
    x.lineWidth=10;x.strokeStyle="#c9ced4";x.beginPath();x.arc(c,c,120,0,7);x.stroke();
    for(let i=0;i<=marcas*2;i++){const a=Math.PI*.75+i/(marcas*2)*Math.PI*1.5,larga=i%2===0;x.strokeStyle=rojo!=null&&i/(marcas*2)>=rojo?"#e0242f":"#f2f2ee";x.lineWidth=larga?5:3;
      x.beginPath();x.moveTo(c+Math.cos(a)*(larga?82:92),c+Math.sin(a)*(larga?82:92));x.lineTo(c+Math.cos(a)*104,c+Math.sin(a)*104);x.stroke();
      if(larga&&num){x.fillStyle=rojo!=null&&i/(marcas*2)>=rojo?"#e0242f":"#f2f2ee";x.font="700 26px 'Barlow Condensed',Arial Narrow,sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(String(Math.round(i/2*max/marcas)),c+Math.cos(a)*62,c+Math.sin(a)*62);}}
    x.fillStyle="#f2c230";x.font="700 22px 'Barlow Condensed',Arial Narrow,sans-serif";x.textAlign="center";x.fillText(label,c,c+52);});
  TY3.cabTex={panel,tacho:reloj(10,10,.8,"x1000 RPM",true),acei:reloj(100,5,null,"PSI",true),agua:reloj(120,4,.85,"°C",false),volt:reloj(16,4,null,"V",false),nafta:reloj(1,4,null,"E · F",false)};return TY3.cabTex;}
tyCabArmar=function(E){const TH=T3.TH,cab=new TH.Group(),T=tyCabTex();
  const neg=new TH.MeshStandardMaterial({color:0x151515,roughness:.85}),cromo=new TH.MeshStandardMaterial({color:0xd8dde2,roughness:.22,metalness:.9}),gris=new TH.MeshStandardMaterial({color:0x6c7178,roughness:.4,metalness:.75});
  // tablero
  const dash=new TH.Group();dash.position.set(0,-.165,-.66);dash.rotation.x=-.32;cab.add(dash);
  const pl=new TH.Mesh(new TH.PlaneGeometry(.74,.185),new TH.MeshStandardMaterial({map:T.panel,roughness:.35,metalness:.6}));dash.add(pl);
  const caja=new TH.Mesh(new TH.BoxGeometry(.76,.2,.06),neg);caja.position.z=-.032;dash.add(caja);
  const relojes=[];const pon=(tex,x,y,r)=>{const g=new TH.Group();g.position.set(x,y,.004);dash.add(g);
      const bisel=new TH.Mesh(new TH.TorusGeometry(r*1.02,r*.09,10,32),cromo);g.add(bisel);
      const f=new TH.Mesh(new TH.CircleGeometry(r,32),new TH.MeshBasicMaterial({map:tex,toneMapped:false}));f.position.z=.002;g.add(f);
      const ag=new TH.Mesh(new TH.PlaneGeometry(r*.06,r*.86),new TH.MeshBasicMaterial({color:0xff3b2f,toneMapped:false}));ag.geometry.translate(0,r*.33,0);ag.position.z=.004;g.add(ag);
      const cen=new TH.Mesh(new TH.CircleGeometry(r*.1,12),new TH.MeshBasicMaterial({color:0x222222}));cen.position.z=.005;g.add(cen);
      const vid=new TH.Mesh(new TH.CircleGeometry(r,32),new TH.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.08,roughness:.05,metalness:.2}));vid.position.z=.008;g.add(vid);
      relojes.push(ag);return g;};
  pon(T.acei,-.27,.012,.042);pon(T.agua,-.135,.012,.042);pon(T.tacho,0,.005,.07);pon(T.volt,.135,.012,.042);pon(T.nafta,.27,.012,.042);
  // luz de cambio arriba del cuentavueltas
  const shift=new TH.Mesh(new TH.CircleGeometry(.011,16),new TH.MeshBasicMaterial({color:0x3a0c0c,toneMapped:false}));shift.position.set(0,.082,.006);dash.add(shift);
  // llaves con tapita y botón de arranque
  for(const xx of[.195,.235]){const tap=new TH.Mesh(new TH.BoxGeometry(.022,.03,.012),new TH.MeshStandardMaterial({color:0xd7263d,roughness:.4}));tap.position.set(xx,.058,.01);tap.rotation.x=.5;dash.add(tap);}
  const boton=new TH.Mesh(new TH.CylinderGeometry(.011,.011,.012,16),new TH.MeshStandardMaterial({color:0xe0242f,roughness:.3,emissive:0x330000}));boton.rotation.x=Math.PI/2;boton.position.set(.3,.058,.008);dash.add(boton);
  // volante de gamuza con maza de desenganche rápido
  const vol=new TH.Group();
  const gamuza=new TH.MeshStandardMaterial({color:0x1b1b1d,roughness:.95});
  const aro=new TH.Mesh(new TH.TorusGeometry(.17,.019,12,48),gamuza);vol.add(aro);
  const plato=new TH.MeshStandardMaterial({color:0x2a2d31,roughness:.35,metalness:.8});
  for(const a of[0,2.0944,-2.0944]){const r=new TH.Mesh(new TH.BoxGeometry(.034,.15,.005),plato);r.position.set(Math.sin(a)*.085,-Math.cos(a)*.085,-.004);r.rotation.z=a;vol.add(r);
    for(const k of[.04,.075,.11]){const ag=new TH.Mesh(new TH.CircleGeometry(.007,10),new TH.MeshBasicMaterial({color:0x0a0a0a}));ag.position.set(Math.sin(a)*k,-Math.cos(a)*k,-.001);vol.add(ag);}}
  const maza=new TH.Mesh(new TH.CylinderGeometry(.034,.034,.035,20),cromo);maza.rotation.x=Math.PI/2;maza.position.z=-.02;vol.add(maza);
  const anillo=new TH.Mesh(new TH.TorusGeometry(.03,.006,8,20),new TH.MeshStandardMaterial({color:0xe0242f,roughness:.4}));anillo.position.z=-.002;vol.add(anillo);
  const marca=new TH.Mesh(new TH.BoxGeometry(.016,.04,.042),new TH.MeshStandardMaterial({color:0xf2c230,roughness:.5}));marca.position.y=.17;vol.add(marca);
  vol.position.set(0,-.24,-.48);vol.rotation.x=-.35;cab.add(vol);cab.userData.vol=vol;
  // las manos: guante con los dedos cerrados sobre el aro (a las 9 y a las 3) y el pulgar arriba
  const T0=tyState?tyState():{col:"#f2b632"},guante=new TH.MeshStandardMaterial({color:0x1c1c1e,roughness:.8}),franja=new TH.MeshStandardMaterial({color:0xe0242f,roughness:.6}),
    buzo=new TH.MeshStandardMaterial({color:new TH.Color(T0.col||"#f2b632"),roughness:.75}),blanco=new TH.MeshStandardMaterial({color:0xf2f2ee,roughness:.7});
  const manos=[];for(const sx of[-1,1]){const m=new TH.Group();m.position.set(sx*.17,.005,0);vol.add(m);
    const puño=new TH.Mesh(new TH.CapsuleGeometry(.026,.05,6,12),guante);puño.position.set(sx*.008,0,.014);m.add(puño);
    for(let f=0;f<4;f++){const d=new TH.Mesh(new TH.TorusGeometry(.024,.0105,6,12,Math.PI*1.25),guante);d.position.set(sx*.004,.03-f*.02,0);d.rotation.set(0,Math.PI/2,sx>0?Math.PI*.95:-Math.PI*.2);m.add(d);}
    const pul=new TH.Mesh(new TH.CapsuleGeometry(.01,.03,4,8),guante);pul.position.set(-sx*.012,.042,.018);pul.rotation.z=sx*.9;m.add(pul);
    const fr=new TH.Mesh(new TH.BoxGeometry(.056,.012,.05),franja);fr.position.set(sx*.01,-.035,.016);m.add(fr);
    const muñeca=new TH.Object3D();muñeca.position.set(sx*.02,-.04,.04);m.add(muñeca);
    // antebrazo: va del codo (fijo, abajo y a los costados) a la muñeca, se acomoda cada cuadro
    const brazo=new TH.Group(),man=new TH.Mesh(new TH.CylinderGeometry(.034,.042,1,12),buzo);man.position.y=.5;brazo.add(man);
    const pun=new TH.Mesh(new TH.CylinderGeometry(.036,.036,.04,12),blanco);pun.position.y=.02;brazo.add(pun);
    const fra=new TH.Mesh(new TH.CylinderGeometry(.0425,.0425,.12,12,1,true),blanco);fra.position.y=.55;fra.scale.set(1.01,1,1.01);brazo.add(fra);
    cab.add(brazo);manos.push({sx,muñeca,brazo,codo:new TH.Vector3(sx*.3,-.6,-.12)});}
  cab.userData.manos=manos;cab.userData.relojes=relojes;cab.userData.shift=shift;
  // caños de la jaula y red (como antes)
  for(const sx of[-1,1]){const c=new TH.Mesh(new TH.CylinderGeometry(.022,.022,1.2,8),neg);c.position.set(sx*.42,.05,-.42);c.rotation.x=.55;c.rotation.z=sx*.12;cab.add(c);}
  const top=new TH.Mesh(new TH.CylinderGeometry(.022,.022,.9,8),neg);top.rotation.z=Math.PI/2;top.position.set(0,.36,-.55);cab.add(top);
  const red=dTex(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle="rgba(15,15,15,.95)";x.lineWidth=5;for(let i=0;i<=128;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,128);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(128,i);x.stroke();}});
  const rd=new TH.Mesh(new TH.PlaneGeometry(.5,.45),new TH.MeshBasicMaterial({map:red,transparent:true,side:TH.DoubleSide,depthWrite:false}));rd.position.set(-.46,.02,-.25);rd.rotation.y=Math.PI/2.4;cab.add(rd);
  // una luz chiquita para que se vea el tablero de noche
  const luz=new TH.PointLight(0xfff1dd,.6,1.4);luz.position.set(0,.1,-.3);cab.add(luz);
  cab.traverse(o=>{o.frustumCulled=false;o.renderOrder=20;if(o.material){o.material.depthTest=true;o.material.fog=false;}});
  E.cam.add(cab);E.sc.add(E.cam);E.cab=cab;return cab;};
{const _cb=tyCabina;tyCabina=function(E,P,pp,dt){_cb.apply(this,arguments);const cab=E.cab;if(!cab||!cab.userData.manos)return;const TH=T3.TH;
  // los relojes de la cabina: aceite, agua, vueltas, volts y nafta
  const R=TYR,rpm=Math.min(1,.18+(P.th||0)*.45+Math.min(1,(P.v||0)/30)*.45),t=performance.now()/1000,ag=cab.userData.relojes;
  const ang=f=>2.356-f*4.712;ag[0].rotation.z=ang(.62+.04*Math.sin(t*2.1));ag[1].rotation.z=ang(.55+.02*Math.sin(t*.3));ag[2].rotation.z+=(ang(rpm)-ag[2].rotation.z)*Math.min(1,dt*10);
  ag[3].rotation.z=ang(.78);ag[4].rotation.z=ang(.7-(R?Math.min(.5,R.t/600):0));
  cab.userData.shift.material.color.setHex(rpm>.86&&(t*8|0)%2?0xff2a1a:0x3a0c0c);
  // antebrazos: del codo a la muñeca de cada guante
  cab.updateMatrixWorld(true);const w=new TH.Vector3(),inv=new TH.Matrix4().copy(cab.matrixWorld).invert();
  for(const m of cab.userData.manos){m.muñeca.getWorldPosition(w);w.applyMatrix4(inv);const d=new TH.Vector3().subVectors(m.codo,w),L=d.length();
    m.brazo.position.copy(w);m.brazo.quaternion.setFromUnitVectors(new TH.Vector3(0,1,0),d.normalize());m.brazo.scale.set(1,L,1);
    m.brazo.children.forEach(c=>{if(c.geometry&&c.geometry.parameters&&c.geometry.parameters.height!==1){c.scale.y=1/L;}});}};}
