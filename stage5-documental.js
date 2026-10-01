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
    context.innerHTML='<p>A gravação da Sessão XI, ouvida na etapa anterior, descreve um ambiente que apresenta correspondências com o registro fotográfico analisado anteriormente.</p><p>A disposição da sala, os objetos e a posição do espelho são compatíveis.</p><p>Há, entretanto, uma divergência.</p><p><strong>Durante a sessão, foi registrada a presença de um homem.</strong></p><p>O indivíduo não aparece no registro fotográfico inicialmente analisado.</p><p>A origem do registro fotográfico pode oferecer novos elementos para a identificação.</p>';
    const actions=document.getElementById('stageActions');
    const materialBlock=(title,body)=>`<div class="initiative-material-item"><button class="initiative-material-toggle" type="button" aria-expanded="false"><span>${title}</span><span class="chev" aria-hidden="true">＋</span></button><div class="initiative-material-content" hidden>${body}</div></div>`;
    actions.innerHTML=`<section id="stage5Documental"><section class="initiative-materials"><div class="initiative-material-list">${materialBlock('REGISTRO 01 — REGISTRO FOTOGRÁFICO','<div class="initiative-gallery" id="s5Room"></div>')}${materialBlock('REGISTRO 02 — MATERIAL ASSOCIADO','<div class="initiative-gallery" id="s5Materials"></div>')}</div></section><section class="answer-panel" id="s5Identity"></section></section>`;
    actions.querySelectorAll('.initiative-material-toggle').forEach(button=>button.addEventListener('click',()=>{
      const expanded=button.getAttribute('aria-expanded')==='true';
      button.setAttribute('aria-expanded',String(!expanded));button.nextElementSibling.hidden=expanded;button.querySelector('.chev').textContent=expanded?'＋':'−';
    }));
    const root=actions.querySelector('#stage5Documental');
    let identified=read('part-one')===identityVersion;
    let located=identified&&read('complete')===completionVersion;
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
    async function evidence(container,src,label,caption){
      const notice=document.createElement('p');notice.textContent=label+' — imagem ainda não disponibilizada.';container.append(notice);
      if(!availableAssets.has(src))return;
      try{
        const response=await fetch(src,{method:'HEAD'});
        if(!response.ok)return;
        const item=document.createElement('div');item.className='initiative-thumb';
        item.innerHTML='<a class="initiative-thumb-media"><img></a><div class="initiative-thumb-foot"><div><strong></strong><br><small></small></div><a><em>ABRIR</em></a></div>';
        const image=item.querySelector('img');image.addEventListener('error',()=>item.replaceWith(notice),{once:true});image.src=src;image.alt=label;
        item.querySelector('strong').textContent=label;
        const detail=item.querySelector('small');
        if(label==='Cartão comercial'){
          const link=document.createElement('a');link.href='https://fotoopticabrasil.vercel.app';link.target='_blank';link.rel='noopener noreferrer';link.textContent=caption;link.style.color='var(--green)';detail.append(link);
        }else detail.textContent=caption;
        item.querySelectorAll('.initiative-thumb-media, .initiative-thumb-foot > a').forEach(link=>{
          link.href=src;link.style.color='var(--green)';link.style.textDecoration='none';link.setAttribute('aria-label','Abrir '+label);link.addEventListener('click',event=>{event.preventDefault();viewer(src,label);});
        });
        notice.replaceWith(item);
      }catch{}
    }
    evidence(root.querySelector('#s5Room'),assets.room,'Registro fotográfico','Registro previamente analisado.');
    evidence(root.querySelector('#s5Materials'),assets.envelope,'Envelope de acondicionamento','Negativo: FOB-94-0918-07');
    evidence(root.querySelector('#s5Materials'),assets.card,'Cartão comercial','fotoopticabrasil.vercel.app');
    function form(container,id,title,question,solved,confirmation,submit){
      container.innerHTML=`${title?`<p><strong>${title}</strong></p>`:''}<form autocomplete="off"><label class="validation-label" for="${id}">${question}</label><input class="answer-input" id="${id}" type="text" required><button class="primary-btn" type="submit">Validar</button><p class="answer-message" role="status"></p></form>`;
      const input=container.querySelector('input'),button=container.querySelector('button'),message=container.querySelector('.answer-message');
      if(solved){input.disabled=true;button.disabled=true;message.style.color='var(--green)';message.textContent=confirmation;}
      container.querySelector('form').addEventListener('submit',event=>{event.preventDefault();if(!solved)submit(input,message);});
    }
    function error(message){message.style.color='var(--danger)';message.textContent='RESPOSTA NÃO CONFIRMADA.';}
    function drawIdentity(){
      form(root.querySelector('#s5Identity'),'s5IdentityAnswer','Identificação','Quem era o homem observado durante a Sessão XI?',identified,'Identidade confirmada — Eduardo Vesperini.',(input,message)=>{
        if(normalize(input.value)!=='eduardo vesperini'){error(message);return;}
        identified=true;write('part-one',identityVersion);drawIdentity();
      });
      if(identified){const second=document.createElement('div');second.id='s5Second';root.querySelector('#s5Identity').append(second);drawSecond();}
    }
    function drawSecond(){
      const second=root.querySelector('#s5Second');
      root.querySelectorAll('[data-s5-transition], [data-s5-continue]').forEach(p=>p.remove());
      second.innerHTML='<section id="s5Custody"><p>Os materiais localizados durante a identificação de Eduardo Vesperini indicam que o espelho permaneceu associado a ele após as filmagens.</p><p>Seu destino posterior ainda precisa ser determinado.</p><div id="s5CustodyForm"></div></section>';
      second.querySelectorAll('#s5Custody > p').forEach(p=>{p.dataset.s5Transition='';second.before(p);});
      form(second.querySelector('#s5CustodyForm'),'s5CustodyAnswer','Custódia','Em posse de quem está o espelho?',located,'Custódia identificada — Instituto Saldanha de Estudos Históricos.',(input,message)=>{
        if(!['instituto saldanha de estudos historicos','instituto saldanha','saldanha'].includes(normalize(input.value))){error(message);return;}
        located=true;write('complete',completionVersion);drawSecond();
      });
      const custodyTitle=second.querySelector('#s5CustodyForm > p');
      custodyTitle.dataset.s5Transition='';second.before(custodyTitle);
      if(located){
        for(const text of ['A instituição atualmente associada à custódia do espelho foi identificada.','O acesso ao arquivo seguinte pode ser iniciado.']){const p=document.createElement('p');p.dataset.s5Transition='';p.textContent=text;root.querySelector('#s5Identity').append(p);}

        const next=document.createElement('button');next.dataset.s5Continue='';next.type='button';next.className='primary-btn';next.textContent='Continuar';
        next.addEventListener('click',()=>{write('complete',completionVersion);completedCount=Math.max(completedCount,5);saveProgress(currentRefKey,completedCount);renderDashboard();openStage(5);});
        root.querySelector('#s5Identity').append(next);
      }
    }
    drawIdentity();
    window.addEventListener('delectus:leaving-stage',closeViewer,{once:true});
  };
})();
