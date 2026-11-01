/* Noche de TAYA'xs — post-proceso de cine para PC
   escena (HDR) → brillo de las luces (bloom) → tono ACES + gradación de color nocturna + viñeta + grano → antialias (SMAA/FXAA) */
const GFX={comp:null,w:0,h:0,q:null,bloom:null,grade:null,aa:null,t0:performance.now()};
const GRADE_SHADER={
  uniforms:{tDiffuse:{value:null},expo:{value:.85},vig:{value:.42},grain:{value:.03},time:{value:0},sat:{value:1.18},con:{value:1.18}},
  vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
  fragmentShader:`uniform sampler2D tDiffuse;uniform float expo,vig,grain,time,sat,con;varying vec2 vUv;
    vec3 aces(vec3 x){x*=.6;const float a=2.51,b=.03,c=2.43,d=.59,e=.14;return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.,1.);}
    vec3 toSRGB(vec3 c){return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}
    float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+time*7.13)*43758.5453);}
    void main(){vec3 c=texture2D(tDiffuse,vUv).rgb*expo;
      c=aces(c);
      float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,sat);
      // noche de estadio: sombras frías, luces cálidas de sodio
      c+=vec3(-.012,.0,.03)*(1.-smoothstep(.0,.45,l))+vec3(.03,.012,-.02)*smoothstep(.45,1.,l);
      vec2 q=vUv-.5;float v=1.-dot(q,q)*vig*2.2;c*=clamp(v,0.,1.);
      c=toSRGB(clamp(c,0.,1.));c=clamp((c-.5)*con+.5,0.,1.);
      c+=(hash(vUv*vec2(1920.,1080.))-.5)*grain;
      gl_FragColor=vec4(c,1.);}`
};
function gfxCalidad(){const g=S.graf||"ultra";return g;}
function gfxArmar(w,h){const TH=T3.TH,ren=T3.ren,q=gfxCalidad();
  if(!TH.EffectComposer){GFX.comp=null;return;}
  const rt=new TH.WebGLRenderTarget(w,h,{type:TH.HalfFloatType,format:TH.RGBAFormat,samples:q==="ultra"&&ren.capabilities.isWebGL2?4:0});
  const comp=new TH.EffectComposer(ren,rt);comp.setPixelRatio(1);comp.setSize(w,h);
  GFX.rp=new TH.RenderPass(null,null);comp.addPass(GFX.rp);
  GFX.bloom=new TH.UnrealBloomPass(new TH.Vector2(w,h),q==="media"?.45:.62,.55,.82);comp.addPass(GFX.bloom);
  GFX.grade=new TH.ShaderPass(GRADE_SHADER);comp.addPass(GFX.grade);
  if(q==="ultra"&&TH.SMAAPass){GFX.aa=new TH.SMAAPass(w,h);}else{GFX.aa=new TH.ShaderPass(TH.FXAAShader);GFX.aa.material.uniforms.resolution.value.set(1/w,1/h);}
  comp.addPass(GFX.aa);
  GFX.comp=comp;GFX.w=w;GFX.h=h;GFX.q=q;}
// dibuja la escena con el post-proceso en el canvas 3D visible (#gl)
function gfxRender(sc,cam,w,h){const ren=T3.ren,TH=T3.TH;
  if(ren.domElement.width!==w||ren.domElement.height!==h)ren.setSize(w,h,false);
  if(!GFX.comp||GFX.w!==w||GFX.h!==h||GFX.q!==gfxCalidad()){if(GFX.comp){GFX.comp.renderTarget1.dispose();GFX.comp.renderTarget2.dispose();}gfxArmar(w,h);}
  if(!GFX.comp){ren.toneMapping=TH.ACESFilmicToneMapping;ren.setRenderTarget(null);ren.render(sc,cam);return;}
  const tm=ren.toneMapping,oe=ren.outputEncoding;ren.toneMapping=TH.NoToneMapping;
  GFX.rp.scene=sc;GFX.rp.camera=cam;GFX.grade.uniforms.time.value=(performance.now()-GFX.t0)/1000%100;
  if(window.__gr)for(const k in window.__gr)GFX.grade.uniforms[k].value=window.__gr[k];GFX.comp.render();ren.toneMapping=tm;ren.outputEncoding=oe;}
