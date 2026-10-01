// ETAPA 05 — usa os componentes compartilhados do protocolo.
(function () {
  const assets = {room:'assets/stage5/registro-sala.webp',envelope:'assets/stage5/envelope-foto-optica.webp',card:'assets/stage5/cartao-foto-optica.webp'};
  // Habilitar os caminhos quando as imagens forem fornecidas.
  const availableAssets = new Set(Object.values(assets));
  const identityVersion='identity-v1', completionVersion='documental-v1';
  const key=part=>currentRefKey ? `stage5:${part}:${currentRefKey}` : null;
  const read=part=>{try{return key(part)&&localStorage.getItem(key(part));}catch{return null;}};
  const write=(part,value)=>{if(key(part))localStorage.setItem(key(part),value);};
  const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').trim().replace(/\s+/g,' ');
  const previousOpenStage=openStage;
  openStage=function(index){
    previousOpenStage(index);
    if(index!==4||!stageView.classList.contains('active')||stageVisualState(5)==='locked')return;
    const context=document.getElementById('stageContext');
    context.hidden=false;
    context.innerHTML='<p>O ambiente descrito durante a Sessão XI apresenta correspondências com o registro fotográfico analisado anteriormente.</p><p>A disposição da sala, os objetos e a posição do espelho são compatíveis.</p><p>Há, entretanto, uma divergência.</p><p><strong>Durante a sessão, foi registrada a presença de um homem.</strong></p><p>O indivíduo não aparece no registro fotográfico inicialmente analisado.</p><p>A origem do registro fotográfico pode oferecer novos elementos para a identificação.</p>';
    const actions=document.getElementById('stageActions');
    actions.innerHTML=`<section id="stage5Documental"><div class="records-list">${toggleMarkup('REGISTRO 01 — REGISTRO FOTOGRÁFICO','<div id="s5Room"></div><p>Registro previamente analisado.</p>')}${toggleMarkup('REGISTRO 02 — MATERIAL ASSOCIADO','<div class="initiative-gallery" id="s5Materials"></div>')}</div><section class="answer-panel" id="s5Identity"></section></section>`;
    registerAccordions(actions);
    const root=actions.querySelector('#stage5Documental');
    let identified=read('part-one')===identityVersion||completedCount>=5;
    let located=read('complete')===completionVersion||completedCount>=5;
    let activeViewer=null, previousFocus=null;
    function closeViewer(){
      if(!activeViewer)return;
      activeViewer.remove();activeViewer=null;
      document.body.classList.remove('initiative-viewer-open');
      document.removeEventListener('keydown',onEscape);
      previousFocus?.focus();
    }
    function onEscape(event){if(event.key==='Escape')closeViewer();}
    function viewer(src,label){
      closeViewer();previousFocus=document.activeElement;
      const panel=document.createElement('div');panel.className='initiative-viewer';
      panel.innerHTML='<div class="initiative-viewer-backdrop"><button class="initiative-viewer-close" type="button" aria-label="Fechar">×</button><div class="initiative-viewer-content" role="dialog" aria-modal="true"><img class="initiative-viewer-image"><p class="initiative-viewer-label"></p></div></div>';
      panel.querySelector('[role="dialog"]').setAttribute('aria-label',label);
      const image=panel.querySelector('img');image.src=src;image.alt=label;
      panel.querySelector('p').textContent=label;
      panel.querySelector('button').addEventListener('click',closeViewer);
      panel.querySelector('.initiative-viewer-backdrop').addEventListener('click',event=>{if(event.target===event.currentTarget)closeViewer();});
      document.body.append(panel);activeViewer=panel;document.body.classList.add('initiative-viewer-open');
      document.addEventListener('keydown',onEscape);panel.querySelector('button').focus();
    }
    async function evidence(container,src,label){
      const notice=document.createElement('p');notice.textContent=label+' — imagem ainda não disponibilizada.';container.append(notice);
      if(!availableAssets.has(src))return;
      try{
        const response=await fetch(src,{method:'HEAD'});
        if(!response.ok)return;
        const button=document.createElement('button');button.type='button';button.className='initiative-thumb';button.setAttribute('aria-label','Ampliar '+label);
        button.innerHTML='<span class="initiative-thumb-media"><img></span><span class="initiative-thumb-foot"><strong></strong><em>ABRIR</em></span>';
        const image=button.querySelector('img');image.addEventListener('error',()=>button.replaceWith(notice),{once:true});image.src=src;image.alt=label;
        button.querySelector('strong').textContent=label;button.addEventListener('click',()=>viewer(src,label));notice.replaceWith(button);
      }catch{}
    }
    evidence(root.querySelector('#s5Room'),assets.room,'Registro fotográfico');
    evidence(root.querySelector('#s5Materials'),assets.envelope,'Envelope');
    evidence(root.querySelector('#s5Materials'),assets.card,'Cartão');
    function form(container,id,title,question,value,solved,confirmation,submit){
      container.innerHTML=`${title?`<p><strong>${title}</strong></p>`:''}<form autocomplete="off"><label class="validation-label" for="${id}">${question}</label><input class="answer-input" id="${id}" type="text" required><button class="primary-btn" type="submit">VALIDAR</button><p class="answer-message" role="status"></p></form>`;
      const input=container.querySelector('input'),button=container.querySelector('button'),message=container.querySelector('.answer-message');
      if(solved){input.value=value;input.disabled=true;button.disabled=true;message.style.color='var(--green)';message.textContent=confirmation;}
      container.querySelector('form').addEventListener('submit',event=>{event.preventDefault();if(!solved)submit(input,message);});
    }
    function error(message){message.style.color='var(--danger)';message.textContent='RESPOSTA NÃO CONFIRMADA.';}
    function drawIdentity(){
      form(root.querySelector('#s5Identity'),'s5IdentityAnswer','IDENTIFICAÇÃO','QUEM ERA O HOMEM OBSERVADO DURANTE A SESSÃO XI?','Eduardo Vesperini',identified,'IDENTIDADE CONFIRMADA — EDUARDO VESPERINI.',(input,message)=>{
        if(normalize(input.value)!=='eduardo vesperini'){error(message);return;}
        identified=true;write('part-one',identityVersion);drawIdentity();
      });
      if(identified){const second=document.createElement('div');second.id='s5Second';root.querySelector('#s5Identity').append(second);drawSecond();}
    }
    function drawSecond(){
      const second=root.querySelector('#s5Second');
      root.querySelectorAll('[data-s5-transition]').forEach(p=>p.remove());
      second.innerHTML='<section id="s5Custody"><p>Os materiais localizados durante a identificação de Eduardo Vesperini indicam que o espelho permaneceu associado a ele após as filmagens.</p><p>Seu destino posterior ainda precisa ser determinado.</p><div id="s5CustodyForm"></div></section>';
      second.querySelectorAll('#s5Custody > p').forEach(p=>{p.dataset.s5Transition='';second.before(p);});
      form(second.querySelector('#s5CustodyForm'),'s5CustodyAnswer','','EM POSSE DE QUEM ESTÁ O ESPELHO?','Instituto Saldanha de Estudos Históricos',located,'CUSTÓDIA IDENTIFICADA — INSTITUTO SALDANHA DE ESTUDOS HISTÓRICOS.',(input,message)=>{
        if(!['instituto saldanha de estudos historicos','instituto saldanha','saldanha'].includes(normalize(input.value))){error(message);return;}
        located=true;write('complete',completionVersion);drawSecond();
      });
      if(located){
        const next=document.createElement('button');next.type='button';next.className='primary-btn';next.textContent='CONTINUAR';
        next.addEventListener('click',()=>{write('complete',completionVersion);completedCount=Math.max(completedCount,5);saveProgress(currentRefKey,completedCount);renderDashboard();openStage(5);});
        second.querySelector('#s5Custody').append(next);
      }
    }
    drawIdentity();
    window.addEventListener('delectus:leaving-stage',closeViewer,{once:true});
  };
})();
