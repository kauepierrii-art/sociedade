// ETAPA 05 — correlação documental. Mantém o armazenamento e a progressão do protocolo.
(function () {
  const assets = {
    room: 'assets/stage5/registro-sala.webp',
    envelope: 'assets/stage5/envelope-foto-optica.webp',
    card: 'assets/stage5/cartao-foto-optica.webp'
  };
  // Marque cada caminho como disponível quando a imagem correspondente for fornecida.
  const availableAssets = new Set();
  const identityVersion = 'identity-v1';
  const completionVersion = 'documental-v1';
  const key = part => currentRefKey ? `stage5:${part}:${currentRefKey}` : null;
  const read = part => { try { return key(part) && localStorage.getItem(key(part)); } catch { return null; } };
  const write = (part,value) => { if (key(part)) localStorage.setItem(key(part),value); };
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').trim().replace(/\s+/g,' ');
  const previousOpenStage = openStage;
  openStage = function (index) {
    previousOpenStage(index);
    if (index !== 4 || !stageView.classList.contains('active') || stageVisualState(5) === 'locked') return;
    document.getElementById('stageCode').textContent = '05';
    document.getElementById('stageName').textContent = 'CORRELAÇÃO DOCUMENTAL';
    const context = document.getElementById('stageContext');
    context.hidden = false;
    context.innerHTML = `<p>O ambiente descrito durante a Sessão XI apresenta correspondências com o registro fotográfico analisado anteriormente.</p><p>A disposição da sala, os objetos e a posição do espelho são compatíveis.</p><p>Há, entretanto, uma divergência.</p><p><strong>Durante a sessão, foi registrada a presença de um homem.</strong></p><p>O indivíduo não aparece no registro fotográfico inicialmente analisado.</p><p class="s5-origin">A origem do registro fotográfico pode oferecer novos elementos para a identificação.</p>`;
    const actions = document.getElementById('stageActions');
    actions.innerHTML = `<section id="stage5Documental"><section class="s5-evidence"><h3>REGISTRO FOTOGRÁFICO ENCONTRADO</h3><div class="s5-known"></div><p class="s5-caption">Registro previamente analisado.</p></section><section class="s5-evidence"><h3>MATERIAL ASSOCIADO</h3><div class="s5-material"></div></section><section class="answer-panel" id="s5Identity"></section><div id="s5Second"></div></section>`;
    const root = actions.querySelector('#stage5Documental');
    let identified = read('part-one') === identityVersion || completedCount >= 5;
    let located = read('complete') === completionVersion || completedCount >= 5;
    let activeDialog = null;
    function viewer(src,label) {
      const dialog = document.createElement('dialog');
      dialog.className = 's5-viewer';
      dialog.setAttribute('aria-label',label);
      dialog.innerHTML = '<button type="button" class="primary-btn">FECHAR</button><img>';
      const image = dialog.querySelector('img');
      image.src = src; image.alt = label;
      dialog.querySelector('button').addEventListener('click',()=>dialog.close());
      dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
      dialog.addEventListener('close',()=>{dialog.remove();activeDialog=null;},{once:true});
      document.body.append(dialog); activeDialog=dialog; dialog.showModal();
    }
    async function evidence(container,src,label) {
      const item = document.createElement('div'); item.className='s5-image-slot';
      const notice=document.createElement('p');notice.className='s5-caption';notice.textContent=label+' — imagem ainda não disponibilizada.';item.append(notice);container.append(item);
      // Verifica existência antes de atribuir src: arquivo ausente não produz imagem quebrada.
      if (!availableAssets.has(src)) return;
      try { const response=await fetch(src,{method:'HEAD'});if(!response.ok()||!response.headers.get('content-type')?.startsWith('image/'))return;
        const button=document.createElement('button');button.type='button';button.className='s5-image';button.setAttribute('aria-label','Ampliar '+label);
        const image=document.createElement('img');image.alt=label;image.src=src;button.append(image);button.addEventListener('click',()=>viewer(src,label));item.replaceChildren(button);
      } catch {}
    }
    evidence(root.querySelector('.s5-known'),assets.room,'Registro fotográfico');
    const materials=root.querySelector('.s5-material');
    evidence(materials,assets.room,'Registro fotográfico');evidence(materials,assets.envelope,'Envelope');evidence(materials,assets.card,'Cartão');
    function form(container,id,question,submit) {
      container.innerHTML=`<p><strong>${question}</strong></p><form autocomplete="off"><label class="validation-label" for="${id}">RESPOSTA</label><input class="answer-input" id="${id}" type="text" required><button class="primary-btn" type="submit">CONFIRMAR</button><p class="answer-message" role="status"></p></form>`;
      container.querySelector('form').addEventListener('submit',event=>{event.preventDefault();submit(container.querySelector('input'),container.querySelector('.answer-message'));});
    }
    function error(message) { message.style.color='var(--danger)';message.textContent='RESPOSTA NÃO CONFIRMADA.'; }
    function drawIdentity() {
      const first=root.querySelector('#s5Identity');
      if(identified){first.innerHTML='<h3>IDENTIDADE CONFIRMADA</h3><p>Eduardo Vesperini foi identificado como o indivíduo observado durante a Sessão XI.</p>';drawSecond();return;}
      form(first,'s5IdentityAnswer','QUEM ERA O HOMEM OBSERVADO DURANTE A SESSÃO XI?',(input,message)=>{if(normalize(input.value)!=='eduardo vesperini'){error(message);return;}identified=true;write('part-one',identityVersion);drawIdentity();});
    }
    function drawSecond() {
      const second=root.querySelector('#s5Second');
      second.innerHTML='<div class="s5-transition"><p>Os materiais localizados durante a identificação de Eduardo Vesperini indicam que o espelho permaneceu associado a ele após as filmagens.</p><p>Seu destino posterior ainda precisa ser determinado.</p></div><section class="answer-panel" id="s5Custody"></section>';
      const custody=second.querySelector('#s5Custody');
      if(located){custody.innerHTML='<h3>OBJETO LOCALIZADO</h3><p>Foi identificada a instituição associada à custódia posterior do espelho.</p><p>Acesso documental disponível.</p><button class="primary-btn" type="button">CONTINUAR</button>';custody.querySelector('button').addEventListener('click',()=>{write('complete',completionVersion);completedCount=Math.max(completedCount,5);saveProgress(currentRefKey,completedCount);renderDashboard();openStage(5);});return;}
      form(custody,'s5CustodyAnswer','EM POSSE DE QUEM ESTÁ O ESPELHO?',(input,message)=>{if(!['instituto saldanha de estudos historicos','instituto saldanha','saldanha'].includes(normalize(input.value))){error(message);return;}located=true;write('complete',completionVersion);drawSecond();});
    }
    drawIdentity();
    window.addEventListener('delectus:leaving-stage',()=>{if(activeDialog)activeDialog.close();},{once:true});
  };
  const style=document.createElement('style');
  style.textContent=`#stage5Documental h3{color:var(--green);font:700 12px/1.6 "IBM Plex Mono",monospace;letter-spacing:.06em}.s5-origin{color:var(--green)}.s5-evidence{margin:22px 0}.s5-material{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.s5-image-slot{min-width:0}.s5-image{display:block;width:100%;padding:0;border:1px solid var(--line,#37564a);background:transparent;cursor:zoom-in}.s5-image img{display:block;width:100%;max-height:360px;object-fit:contain}.s5-known{max-width:680px}.s5-caption{font-size:12px;color:var(--muted);line-height:1.6}.s5-transition{margin:24px 0;line-height:1.7}.s5-viewer{width:min(960px,94vw);max-height:94vh;background:var(--bg,#07130f);color:var(--text);border:1px solid var(--green);padding:12px}.s5-viewer::backdrop{background:#000d}.s5-viewer img{display:block;max-width:100%;max-height:78vh;object-fit:contain;margin:12px auto 0}@media(max-width:600px){.s5-material{grid-template-columns:1fr}.s5-image img{max-height:440px}}`;
  document.head.append(style);
})();

