/* Noche de TAYA'xs — estado de la partida, preferencias y piezas chicas que comparte todo el juego */
const KEY="nocheTayaxs.v1";
const ES_PC=true; // este juego es para PC: gráficos altos por defecto
function fresh(){return {v:1,pesos:300000,apodo:"",graf:"ultra",taya:null,tayaJ:null,tyVoz:"",tyCam:"atras",tyVol:"auto",savedAt:0};}
let S=(()=>{try{const t=JSON.parse(localStorage.getItem(KEY)||"null");if(t&&t.v===1)return Object.assign(fresh(),t);}catch(e){}return fresh();})();
function save(){S.savedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
// sin modo online por ahora (el desafío con amigos queda para más adelante)
const NET={db:null,room:null,user:null,uid:null,pilots:{},retos:[],peers:[],ready:false};
const PRUEBA=/[?&]prueba=1/.test(location.search);
// calidad gráfica: ultra (sombras, bloom, antialias fino), alta o media
function ultra(){return (S.graf||"ultra")==="ultra";}
const prUltra=base=>{const g=S.graf||"ultra";return Math.min(g==="ultra"?2:g==="alta"?1.5:1,(devicePixelRatio||1)*(g==="ultra"?1.25:1));};
function cineFX(){} // el look de cine ahora lo hace el post-proceso 3D (gfx.js)
// teclas de la carrera
const TECLAS_DEF={gas:["ArrowUp","KeyW"],izq:["ArrowLeft","KeyA"],der:["ArrowRight","KeyD"],camara:["KeyC",""],volante:["KeyV",""],pausa:["Escape","KeyP"]};
const TECLA_N={gas:"Acelerar",izq:"Doblar adentro",der:"Contravolante / abrirse",camara:"Cambiar la cámara",volante:"Volante automático o manual",pausa:"Pausa"};
let TECLAS=JSON.parse(JSON.stringify(TECLAS_DEF));try{const t=JSON.parse(localStorage.getItem(KEY+".teclas")||"null");if(t)for(const k in TECLAS_DEF)if(Array.isArray(t[k]))TECLAS[k]=[t[k][0]||"",t[k][1]||""];}catch(e){}
// música de fondo: todavía sin tema (la cumbia de Pochón ya no va)
const BGM=new Audio();BGM.loop=true;BGM.preload="none";BGM.volume=.35;
function bgm(){try{if(muted||noMus||(typeof TYR!=="undefined"&&TYR)){BGM.pause();return;}if(!BGM.src)return;if(BGM.paused)BGM.play().catch(()=>{});}catch(e){}}
function audioInit(){if(AC||muted){bgm();return;}try{AC=new (window.AudioContext||window.webkitAudioContext)();loadSounds();}catch(e){}bgm();}
["pointerdown","keydown"].forEach(ev=>window.addEventListener(ev,()=>{audioInit();},{passive:true}));
