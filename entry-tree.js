(function(){
'use strict';
// Mude somente sound para redistribuir os arquivos. IDs não representam sons.
const SPHERES = [
  {id:'a',x:240,y:55,sound:'porta'},
  {id:'b',x:365,y:165,sound:'trovao'},
  {id:'c',x:115,y:165,sound:'caixinha'},
  {id:'d',x:365,y:305,sound:'corvo'},
  {id:'e',x:115,y:305,sound:'sino'},
  {id:'f',x:240,y:375,sound:'lobo'},
  {id:'g',x:365,y:465,sound:'cristal'},
  {id:'h',x:115,y:465,sound:'relogio'},
  {id:'i',x:240,y:550,sound:'coracao'},
  {id:'j',x:240,y:665,sound:'gota'}
];
const ANSWER = ['caixinha','trovao','lobo','coracao'];
const PATHS = [['a','b'],['a','c'],['a','f'],['b','c'],['b','d'],['b','f'],['c','e'],['c','f'],['d','e'],['d','f'],['d','g'],['e','f'],['e','h'],['f','g'],['f','h'],['f','i'],['g','h'],['g','i'],['g','j'],['h','i'],['h','j'],['i','j']];
// Os dez arquivos principais e os dois retornos sonoros são opcionais no protótipo.
const FEEDBACK = {failure:'falha',success:'conclusao'};
const AUDIO_FILES = {
  sino:'sino novo.MP3',coracao:'coracao novo.MP3',cristal:'cristal novo.MP3',
  gota:'gota novo.MP3',caixinha:'caixinha novo.MP3',relogio:'relogio.MP3',
  corvo:'corvo.mp3',porta:'porta novo.MP3',trovao:'trovao novo.MP3',lobo:'lobo novo.MP3',
  falha:'falha novo.MP3',conclusao:'conclusao novo.MP3'
};
const ns='http://www.w3.org/2000/svg', byId=new Map(SPHERES.map(s=>[s.id,s]));
const tree=document.querySelector('#tree'), seal=document.querySelector('#seal'), result=document.querySelector('#result'), thread=document.querySelector('#thread');
const selection=[], explored=new Set();let locked=false,currentAudio=null;
function svg(tag,attrs={}){const node=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key,value));return node;}
function segment(a,b){return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;}
PATHS.forEach(([a,b])=>document.querySelector('#engraving').append(svg('path',{d:segment(byId.get(a),byId.get(b)),class:'path'})));
SPHERES.forEach((sphere,index)=>{
  const group=svg('g',{class:'sphere unexplored',id:`sphere-${sphere.id}`,role:'button',tabindex:0,'aria-label':`Esfera sonora ${index+1}`,'aria-pressed':'false'});
  group.style.setProperty('--breath-delay',`${-index*.31}s`);
  group.append(svg('circle',{cx:sphere.x,cy:sphere.y,r:29,class:'breath'}));
  group.append(svg('circle',{cx:sphere.x,cy:sphere.y,r:32,class:'halo'}),svg('circle',{cx:sphere.x,cy:sphere.y,r:22,class:'core'}),svg('circle',{cx:sphere.x,cy:sphere.y,r:27,class:'rim'}),svg('circle',{cx:sphere.x,cy:sphere.y,r:34,class:'hit'}));
  group.addEventListener('click',()=>choose(sphere));
  group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(!event.repeat)choose(sphere);}});
  document.querySelector('#spheres').append(group);
});
function play(sound,feedback=false){
  if(currentAudio){currentAudio.pause();currentAudio.currentTime=0;currentAudio=null;}
  const audio=new Audio(`assets/entry-audio/${encodeURIComponent(AUDIO_FILES[sound])}`);audio.volume=feedback?.28:.65;currentAudio=audio;
  audio.play().then(()=>{if(!feedback)document.querySelector('#audio-status').textContent='';}).catch(()=>{if(!feedback)document.querySelector('#audio-status').textContent='Áudios pendentes nesta prévia. A interação está disponível.';});
}
function draw(){
  thread.replaceChildren();
  selection.forEach((id,index)=>{if(index)thread.append(svg('path',{d:segment(byId.get(selection[index-1]),byId.get(id)),class:'thread'}));});
  SPHERES.forEach(s=>{const node=document.querySelector(`#sphere-${s.id}`);node.classList.toggle('selected',selection.includes(s.id));node.setAttribute('aria-pressed',String(selection.includes(s.id)));});
  seal.hidden=selection.length!==4;
}
function choose(sphere){
  if(locked)return;
  explored.add(sphere.id);
  document.querySelector(`#sphere-${sphere.id}`).classList.remove('unexplored');
  play(sphere.sound);result.textContent='';
  const node=document.querySelector(`#sphere-${sphere.id}`);node.classList.remove('pulse');void node.getBoundingClientRect();node.classList.add('pulse');setTimeout(()=>node.classList.remove('pulse'),600);
  const index=selection.indexOf(sphere.id);if(index>=0)selection.splice(index,1);else if(selection.length<4)selection.push(sphere.id);
  draw();
}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Identidade apenas local: não é conta, autenticação, compra ou entitlement.
const INVITE_STORAGE_KEY='delectus_invite_started';
const LOCAL_ID_KEY='delectus:local-player:v1';
const RECOGNIZED_KEY='delectus:entry-recognized:v1';
let openingExperience=false;
function localId(){
  let id=localStorage.getItem(LOCAL_ID_KEY);
  if(!/^local-[a-f0-9]{32}$/.test(id||'')){
    id='local-'+[...crypto.getRandomValues(new Uint8Array(16))].map(n=>n.toString(16).padStart(2,'0')).join('');
    localStorage.setItem(LOCAL_ID_KEY,id);
  }
  return id;
}
async function openExperience(){
  if(openingExperience)return;
  openingExperience=true;
  const invitation=document.querySelector('#invitation');
  invitation.classList.add('invite-exit');
  await wait(reduced?0:280);
  invitation.hidden=true;
  const experience=document.querySelector('#experience');
  experience.hidden=false;experience.classList.add('invite-enter');experience.focus();
  openingExperience=false;
}
function enterProtocol(){
  const id=localId();
  // Reutiliza loadProgress/saveProgress existentes, sem sessões remotas.
  if(localStorage.getItem('progress:v3:'+id)===null)saveProgress(id,0);
  accessWithLocalId(id);
}
function handleStart(){
  selection.length=0;locked=false;seal.disabled=false;
  tree.classList.remove('respond');
  tree.querySelectorAll('.sphere').forEach(node=>{node.classList.remove('locked','awakened');node.removeAttribute('aria-disabled');});
  document.querySelector('#recognized').hidden=true;
  document.querySelector('#experience').classList.remove('fade-away');
  result.textContent='';draw();
  localId();localStorage.setItem(INVITE_STORAGE_KEY,'true');
  openExperience();
}
function handleContinue(){
  const id=localStorage.getItem(LOCAL_ID_KEY);
  const raw=id&&localStorage.getItem('progress:v3:'+id);
  const valid=/^local-[a-f0-9]{32}$/.test(id||'')&&raw!==null&&raw!==''&&Number.isInteger(Number(raw))&&Number(raw)>=0&&Number(raw)<=stages.length;
  if(valid&&localStorage.getItem(RECOGNIZED_KEY)===id)enterProtocol();
  else if(id&&localStorage.getItem(INVITE_STORAGE_KEY)==='true')openExperience();
  else document.querySelector('#continue-status').textContent='Nenhum progresso local foi encontrado.';
}
document.querySelector('#start-invite').addEventListener('click',handleStart);
document.querySelector('#continue-invite').addEventListener('click',handleContinue);
document.querySelector('#enter-protocol').addEventListener('click',enterProtocol);
window.addEventListener('delectus:return-to-invite',()=>{
  if(currentAudio){currentAudio.pause();currentAudio.currentTime=0;}
  document.querySelector('#experience').hidden=true;
  document.querySelector('#recognized').hidden=true;
  const invitation=document.querySelector('#invitation');
  invitation.hidden=false;invitation.classList.remove('invite-exit');
});
const clueDialog=document.querySelector('#clue-dialog');
document.querySelector('#consult-clue').addEventListener('click',()=>clueDialog.showModal());
clueDialog.addEventListener('click',event=>{if(event.target===clueDialog){const bounds=clueDialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)clueDialog.close();}});
async function recognize(){
  locked=true;seal.disabled=true;tree.querySelectorAll('.sphere').forEach(node=>{node.classList.add('locked');node.setAttribute('aria-disabled','true');});
  result.textContent='';
  for(let index=0;index<selection.length;index++){
    if(index){const a=byId.get(selection[index-1]),b=byId.get(selection[index]);const path=svg('path',{d:segment(a,b),class:'travel'});thread.append(path);const length=path.getTotalLength();path.style.strokeDasharray=String(length);path.style.strokeDashoffset=String(length);if(!reduced)await path.animate([{strokeDashoffset:length},{strokeDashoffset:0}],{duration:600,easing:'ease-in-out',fill:'forwards'}).finished;}
    document.querySelector(`#sphere-${selection[index]}`).classList.add('awakened');await wait(reduced?40:340);
  }
  tree.classList.add('respond');play(FEEDBACK.success,true);await wait(reduced?80:1200);
  const experience=document.querySelector('#experience');experience.classList.add('fade-away');await wait(reduced?0:700);experience.hidden=true;
  localStorage.setItem(RECOGNIZED_KEY,localId());
  const recognized=document.querySelector('#recognized');recognized.hidden=false;recognized.focus();
}
seal.addEventListener('click',()=>{
  if(locked||selection.length!==4)return;
  if(selection.every((id,index)=>byId.get(id).sound===ANSWER[index]))recognize();
  else{result.textContent='SEQUÊNCIA NÃO RECONHECIDA';play(FEEDBACK.failure,true);}
});
document.querySelector('#alternative').addEventListener('click',event=>{const note=document.querySelector('#alternative-note');note.hidden=!note.hidden;event.currentTarget.setAttribute('aria-expanded',String(!note.hidden));});


})();
