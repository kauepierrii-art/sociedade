// ETAPA 06 — procedimento do espelho
(function () {
  const stageIndex = stages.findIndex(stage => stage && stage.name === 'Discernimento');
  const stageStep = stageIndex + 1;
  const correctRunes = ['rune_04', 'rune_11', 'rune_03', 'rune_07', 'rune_14', 'rune_12', 'rune_13'];
  const runeSymbols = ['✢','⌬','⟡','✦','⊹','⟁','☽','⟟','✧','⨳','♜','◈','✣','⨯'];

  // Fonte, URL e anotações podem ser trocadas aqui sem alterar a lógica do procedimento.
  const runeOccurrences = [
    { id: 1, rune: 'rune_04', source: 'Convite', description: 'A primeira esteve em suas mãos antes mesmo de o processo começar.', url: null, hints: ['Ela antecede seu primeiro acesso ao protocolo.','Não procure entre os arquivos investigados posteriormente.','O sinal foi apresentado quando você ainda não sabia que havia algo a procurar.','Observe novamente o material pelo qual tudo começou.','Examine atentamente os elementos gráficos do convite.'] },
    { id: 2, rune: 'rune_11', source: 'The Obscure', description: 'A segunda permanece onde o obscuro foi deixado para trás.', url: null, hints: ['Você já esteve nesse lugar.','Ele não pertence ao protocolo propriamente dito.','Foi encontrado durante uma investigação anterior.','Retorne ao arquivo digital abandonado.','Procure novamente no site The Obscure.'] },
    { id: 3, rune: 'rune_03', source: 'Instituição pública', description: 'Uma foi preservada por uma instituição pública entre registros que não tratam do oculto.', url: null, hints: ['O sinal não é o assunto principal do registro.','A instituição responsável não o classifica como elemento esotérico.','Procure entre acervos históricos oficiais.','A ocorrência está associada a um documento ou imagem preservada digitalmente.','A referência direta à instituição será preservada no arquivo quando definida.'] },
    { id: 4, rune: 'rune_07', source: 'Monumento', description: 'Outra continua exposta em pedra, diante de milhares de pessoas que nunca tiveram motivo para observá-la.', url: null, hints: ['Ela não está guardada.','Pode ser vista sem autorização ou acesso especial.','Não procure dentro de museus.','O sinal faz parte de um monumento ou estrutura pública.','A referência indireta ao monumento será incorporada ao arquivo quando definida.'] },
    { id: 5, rune: 'rune_14', source: 'Obra digitalizada', description: 'Uma sobrevive entre as páginas digitalizadas de uma obra que já não pertence a ninguém.', url: null, hints: ['Não se trata de uma página da internet originalmente digital.','A obra existia muito antes da rede.','Seu conteúdo pode ser consultado livremente.','Procure em acervos de obras históricas digitalizadas e em domínio público.','O título e a página aproximada serão preservados no arquivo quando definidos.'] },
    { id: 6, rune: 'rune_12', source: 'Imagem histórica', description: 'Outra foi preservada em uma imagem histórica cujo assunto nada tem a ver com o símbolo que contém.', url: null, hints: ['O sinal não é o objeto fotografado.','Ele ocupa uma posição secundária na imagem.','Quem catalogou a fotografia provavelmente não o percebeu como relevante.','Observe fundos, paredes, objetos e detalhes periféricos.','A referência ao acervo será incorporada ao arquivo quando definida.'] },
    { id: 7, rune: 'rune_13', source: 'Vídeo', description: 'A última ainda pode ser vista em movimento. Está onde muitos assistiram — poucos olharam.', url: null, hints: ['A ocorrência dura apenas alguns instantes.','Não está no título nem na descrição.','É preciso observar a imagem, não apenas acompanhar o conteúdo.','Ela aparece em material audiovisual disponível publicamente.','A referência e a faixa de tempo serão incorporadas ao arquivo quando definidas.'] }
  ];

  function key(name) { return currentRefKey ? 'stage6:' + name + ':' + currentRefKey : null; }
  function read(name, fallback) {
    const stored = key(name) && localStorage.getItem(key(name));
    if (!stored) return fallback;
    try { return JSON.parse(stored); } catch (_) { return fallback; }
  }
  function write(name, value) { if (key(name)) localStorage.setItem(key(name), JSON.stringify(value)); }
  function hasVisited() { return Boolean(key('visited') && localStorage.getItem(key('visited')) === '1'); }
  function visit() { if (key('visited')) localStorage.setItem(key('visited'), '1'); }
  function documentSeen() { return Boolean(key('document') && localStorage.getItem(key('document')) === '1'); }
  function remainDefault() { return runeSymbols.map((_, index) => 'rune_' + String(index + 1).padStart(2, '0')); }

  window.onMirrorActivated = window.onMirrorActivated || function () {
    if (key('activated')) localStorage.setItem(key('activated'), '1');
  };

  function renderProcedureDocument() {
    if (!currentRefKey) return;
    localStorage.setItem(key('document'), '1');
    document.querySelector('#stageCode').textContent = 'ARQUIVO DE PROCEDIMENTO';
    document.querySelector('#stageName').textContent = 'Procedimento do Espelho';
    document.querySelector('#stageStatus').textContent = 'consultável';
    const panelHead = document.querySelector('.detail-panel .panel-head h2');
    if (panelHead) panelHead.textContent = 'NEM TODOS OS OLHOS VEEM O MESMO';
    const context = document.querySelector('#stageContext');
    const mission = document.querySelector('#stageMission');
    context.hidden = true; mission.hidden = true;
    const actions = document.querySelector('#stageActions');
    actions.innerHTML = '<section class="procedure-document">' +
      '<div class="procedure-copy"><p>Os primeiros registros conhecidos do fenômeno apresentam uma característica que, durante muito tempo, foi tratada como secundária.</p><p>Havia sinais traçados ao redor da superfície.</p><p>Não sabemos quem os introduziu.</p><p>Também não sabemos qual era sua função.</p><p>Por décadas, foram interpretados como ornamentação, marcação ritual ou simples identificação do procedimento.</p><p>Essa hipótese mudou quando diferentes registros de sessão foram comparados.</p><p>Nas experiências em que a imagem permaneceu estável por mais tempo, os sinais estavam presentes.</p><p>Nas demais, estavam ausentes, incompletos ou dispostos de maneira diferente.</p><p>O problema surgiu depois.</p><p>Os registros originais não sobreviveram intactos.</p><p>As marcas foram copiadas, redesenhadas e reproduzidas por pessoas diferentes, em épocas diferentes.</p><p>Ao final da investigação, <strong>quatorze sinais distintos</strong> haviam sido associados ao procedimento.</p><p>Sem qualquer forma segura de determinar quais eram autênticos, todos foram mantidos ao redor da superfície.</p><p>As tentativas posteriores permaneceram inconclusivas.</p><p>Até recentemente.</p><p>Entre materiais ainda não catalogados relacionados às primeiras sessões, foi localizado um documento incompleto.</p><p>As figuras que originalmente acompanhavam o texto não foram preservadas.</p><p>Uma informação, porém, permanece legível:</p><p><strong>o procedimento utilizava sete sinais.</strong></p><p>Não quatorze.</p><p>O documento também faz referência a registros independentes nos quais essas mesmas marcas teriam sido encontradas novamente.</p><p>Se essas referências puderem ser localizadas, talvez seja possível reconstruir o conjunto original.</p><p>As quatorze marcas permanecem onde foram deixadas.</p><p><strong>Sete pertencem ao procedimento.</strong></p><p><strong>Sete não deveriam estar ali.</strong></p><p>Apague as marcas incorretas.</p><p>Mantenha apenas o conjunto original.</p><p>Se os registros estiverem corretos, a superfície deverá responder.</p></div></div><p class="procedure-known">OCORRÊNCIAS CONHECIDAS</p><div class="procedure-occurrences"></div><blockquote>Sete ocorrências.<br>Sete marcas recorrentes.<br><br>Não procure significado onde talvez não exista nenhum.<br>Procure repetição.</blockquote><button class="mirror-back procedure-back" type="button">VOLTAR AO PROTOCOLO</button></section>';
    const opened = read('annotations', {});
    const occurrences = actions.querySelector('.procedure-occurrences');
    runeOccurrences.forEach(occurrence => {
      const count = Number(opened[occurrence.id]) || 0;
      const item = document.createElement('article');
      item.className = 'procedure-occurrence';
      item.innerHTML = '<button type="button"><span>' + String(occurrence.id).padStart(2, '0') + '. ' + occurrence.source.toUpperCase() + '</span><span class="procedure-consult"></span></button><div class="procedure-annotation"></div>';
      const annotation = item.querySelector('.procedure-annotation');
      const consult = item.querySelector('.procedure-consult');
      function draw() {
        annotation.innerHTML = '<p>' + occurrence.description + '</p>' + occurrence.hints.slice(0, Number(opened[occurrence.id]) || 0).map(hint => '<p>' + hint + '</p>').join('');
        consult.textContent = (Number(opened[occurrence.id]) || 0) < occurrence.hints.length ? 'CONSULTAR ANOTAÇÃO' : 'ANOTAÇÕES CONSULTADAS';
      }
      draw();
      item.querySelector('button').addEventListener('click', () => {
        if ((Number(opened[occurrence.id]) || 0) >= occurrence.hints.length) return;
        opened[occurrence.id] = (Number(opened[occurrence.id]) || 0) + 1;
        write('annotations', opened); draw();
      });
      occurrences.appendChild(item);
    });
    actions.querySelector('.procedure-back').addEventListener('click', () => { renderDashboard(); show(dashboardView); });
    show(stageView);
  }

  function enableProtocolClue() {
    const quote = document.querySelector('#dashboardView .quote');
    if (!quote) return;
    const active = hasVisited();
    quote.classList.toggle('mirror-protocol-link', active);
    if (!active) {
      quote.textContent = '“Nem todos os olhos veem o mesmo.”';
      return;
    }
    if (quote.querySelector('a')) return;
    quote.innerHTML = '<a href="#procedimento-espelho">“Nem todos os olhos veem o mesmo.”</a>';
    quote.querySelector('a').addEventListener('click', event => {
      event.preventDefault();
      renderProcedureDocument();
    });
  }

  const previousDashboard = renderDashboard;
  renderDashboard = function () {
    previousDashboard();
    enableProtocolClue();
  };

  function renderMirrorStage() {
    const actions = document.querySelector('#stageActions');
    const context = document.querySelector('#stageContext');
    const mission = document.querySelector('#stageMission');
    const panelHead = document.querySelector('.detail-panel .panel-head');
    if (!actions || !currentRefKey) return;
    visit();
    context.hidden = true;
    mission.hidden = true;
    if (panelHead) panelHead.hidden = true;

    let remaining = read('remaining', remainDefault());
    if (!Array.isArray(remaining) || remaining.length < 7 || remaining.length > runeSymbols.length || !remaining.every(id => remainDefault().includes(id))) remaining = remainDefault();
    const activated = key('activated') && localStorage.getItem(key('activated')) === '1';
    const unlocked = documentSeen();

    actions.innerHTML = '<section class="mirror-procedure ' + (unlocked ? 'is-unlocked' : 'is-sealed') + (activated ? ' is-activated' : '') + '">' +
      '<p class="mirror-question">O que, exatamente, o espelho mostra?</p>' +
      '<div class="mirror-field" aria-label="Espelho negro e marcas do procedimento">' +
      '<div class="mirror-hanger" aria-hidden="true"></div><div class="mirror-rim"></div><div class="mirror-surface"><span>Nem todos os olhos veem o mesmo.</span></div>' +
      runeSymbols.map((symbol, index) => {
        const id = 'rune_' + String(index + 1).padStart(2, '0');
        const visible = remaining.includes(id);
        return '<button class="mirror-rune ' + (visible ? 'is-present' : 'is-erased') + '" type="button" data-rune="' + id + '" aria-label="Marca ' + String(index + 1).padStart(2, '0') + '">' + symbol + '</button>';
      }).join('') +
      '<div class="mirror-base" aria-hidden="true"></div></div><p class="mirror-status" role="status"></p>' +
      '<button type="button" class="mirror-back">VOLTAR</button></section>';

    const status = actions.querySelector('.mirror-status');
    const field = actions.querySelector('.mirror-field');
    actions.querySelector('.mirror-back').addEventListener('click', () => { renderDashboard(); show(dashboardView); });
    if (!unlocked || activated) return;

    function check() {
      if (remaining.length !== 7) return;
      const correct = correctRunes.every(id => remaining.includes(id));
      if (!correct) return;
      field.classList.add('is-responding');
      field.querySelectorAll('.mirror-rune').forEach(button => button.disabled = true);
      setTimeout(() => {
        localStorage.setItem(key('activated'), '1');
        window.onMirrorActivated();
        field.classList.add('is-activated');
        status.textContent = '';
      }, 1400);
    }

    actions.querySelectorAll('.mirror-rune').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.rune;
      const present = remaining.includes(id);
      if (present && remaining.length <= 7) {
        status.textContent = 'Sete devem permanecer.';
        setTimeout(() => { if (status.textContent === 'Sete devem permanecer.') status.textContent = ''; }, 2400);
        return;
      }
      remaining = present ? remaining.filter(value => value !== id) : remaining.concat(id);
      write('remaining', remaining);
      button.classList.toggle('is-present', !present);
      button.classList.toggle('is-erased', present);
      check();
    }));
    check();
  }

  const previousOpenStage = openStage;
  openStage = function (index) {
    previousOpenStage(index);
    if (index !== stageIndex) return;
    setTimeout(renderMirrorStage, 0);
  };

  const style = document.createElement('style');
  style.textContent = [
    '.mirror-field{overflow:visible;margin:30px auto 48px}.mirror-hanger{position:absolute;z-index:0;top:-25px;left:calc(50% - 26px);width:52px;height:68px;border:0;border-radius:28px 28px 0 0;background:linear-gradient(145deg,#141414,#030303 72%);box-shadow:inset 1px 1px 3px rgba(115,115,110,.42),0 2px 4px #000;-webkit-mask:radial-gradient(circle 10px at 50% 40%,transparent 96%,#000 100%);mask:radial-gradient(circle 10px at 50% 40%,transparent 96%,#000 100%)}.mirror-rim{z-index:1;background:#030303!important;box-shadow:0 18px 35px #000!important}.mirror-surface{z-index:2;inset:0!important;background:radial-gradient(ellipse at 40% 22%,#202020 0,#040404 26%,#000 70%)!important;box-shadow:inset 0 0 38px #000!important}.mirror-surface:after{display:none}.mirror-surface span{color:rgba(211,205,192,.35)!important}.mirror-rune{z-index:4;color:rgba(211,201,187,.72)!important;font-family:Georgia,serif!important;font-size:37px!important;text-shadow:0 1px 1px #000}.mirror-base{position:absolute;z-index:3;left:7%;right:7%;bottom:-28px;height:29px;border:0;border-radius:2px;background:linear-gradient(180deg,#1b1b1b,#040404 58%,#121212);box-shadow:0 4px 8px #000,inset 0 1px rgba(116,116,116,.45)}.mirror-base:before{display:none}.mirror-base:after{content:"";position:absolute;top:6px;left:5%;right:5%;height:1px;background:rgba(214,208,195,.25)}.mirror-protocol-link a{color:inherit;text-decoration:none;cursor:pointer;transition:opacity .2s,text-shadow .2s}.mirror-protocol-link a:hover{opacity:1;text-shadow:0 0 9px rgba(115,224,201,.48)}',
    '.procedure-document{padding-top:4px;color:#d9c6a2;font:14px/1.7 Georgia,serif}.procedure-copy{max-width:650px;margin:auto}.procedure-copy p{margin:0 0 13px}.procedure-known{margin:28px 0 0;padding:16px 0;border-top:1px solid var(--line);color:#e0b56f;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.12em}.procedure-occurrence{border-top:1px solid rgba(112,90,58,.62)}.procedure-occurrence:last-child{border-bottom:1px solid rgba(112,90,58,.62)}.procedure-occurrence button{display:flex;align-items:center;justify-content:space-between;width:100%;padding:13px 0;border:0;background:none;color:#d9c6a2;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.07em;text-align:left;cursor:pointer}.procedure-occurrence button:hover{color:#f0ce8e}.procedure-consult{color:#a4c3ba;font-size:8px}.procedure-annotation{padding:0 0 12px;color:#a8c4bb;font-size:13px}.procedure-annotation p{margin:0 0 10px}.procedure-document blockquote{margin:28px 0 0;padding:16px 0 0;border-top:1px solid #765631;color:#f0ce8e;font:italic 16px/1.6 Georgia,serif}.procedure-back{margin-top:22px}',
    '.mirror-procedure{text-align:center;padding:8px 0 4px}.mirror-question{margin:0 0 25px;color:#ded1b1;font:italic 20px/1.45 Georgia,serif}.mirror-field{--size:min(78vw,430px);position:relative;width:var(--size);height:var(--size);margin:0 auto 14px}.mirror-rim,.mirror-surface{position:absolute;border-radius:50%}.mirror-rim{inset:8%;background:radial-gradient(circle at 37% 30%,#4c3b2d,#0b0c0d 52%,#84613c 80%,#17100b 83%);box-shadow:0 0 0 1px #9b7849,0 0 0 5px #15100c,0 22px 35px #000}.mirror-surface{inset:12%;display:grid;place-items:center;overflow:hidden;background:radial-gradient(ellipse at 38% 22%,#1d2c2e 0,#061011 31%,#020405 73%,#000);box-shadow:inset 0 0 45px #000}.mirror-surface:before{content:"";position:absolute;inset:0;background:linear-gradient(118deg,transparent 25%,rgba(143,190,177,.09) 43%,transparent 49%);transform:translateX(-40%)}.mirror-surface span{position:relative;z-index:1;width:64%;color:rgba(196,210,191,.43);font:italic 12px/1.45 Georgia,serif}.mirror-rune{position:absolute;z-index:3;width:48px;height:48px;padding:0;border:0;background:transparent;color:rgba(186,148,92,.27);font:34px/1 Georgia,serif;transform:translate(-50%,-50%);transition:color .35s,opacity .35s,text-shadow .35s;cursor:default}.is-unlocked .mirror-rune{color:rgba(201,163,102,.68);cursor:pointer}.mirror-rune.is-erased{opacity:.12;color:#6c5c45}.mirror-rune:nth-of-type(1){left:50%;top:12%}.mirror-rune:nth-of-type(2){left:66.5%;top:15.4%}.mirror-rune:nth-of-type(3){left:79.7%;top:26%}.mirror-rune:nth-of-type(4){left:87%;top:41.5%}.mirror-rune:nth-of-type(5){left:87%;top:58.5%}.mirror-rune:nth-of-type(6){left:79.7%;top:74%}.mirror-rune:nth-of-type(7){left:66.5%;top:84.6%}.mirror-rune:nth-of-type(8){left:50%;top:88%}.mirror-rune:nth-of-type(9){left:33.5%;top:84.6%}.mirror-rune:nth-of-type(10){left:20.3%;top:74%}.mirror-rune:nth-of-type(11){left:13%;top:58.5%}.mirror-rune:nth-of-type(12){left:13%;top:41.5%}.mirror-rune:nth-of-type(13){left:20.3%;top:26%}.mirror-rune:nth-of-type(14){left:33.5%;top:15.4%}.mirror-field.is-responding .mirror-rune.is-present,.mirror-field.is-activated .mirror-rune.is-present{color:#ead18d;text-shadow:0 0 9px #e2ba68,0 0 22px rgba(196,140,56,.8)}.mirror-field.is-responding .mirror-surface,.mirror-field.is-activated .mirror-surface{animation:mirrorResponse 2.6s ease-in-out forwards}.mirror-status{min-height:23px;margin:0;color:#d8b77e;font:9px "IBM Plex Mono",monospace;letter-spacing:.1em}.mirror-back{margin-top:16px;border:0;background:none;color:#aabbb2;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.13em;cursor:pointer}.mirror-back:hover{color:#e2bc80}@keyframes mirrorResponse{35%{filter:brightness(.45)}68%{filter:brightness(1.5) contrast(1.15)}100%{filter:brightness(.7)}}@media(max-width:420px){.mirror-rune{font-size:28px;width:38px;height:38px}.mirror-question{font-size:18px}}'
  ].join('');
  document.head.appendChild(style);
  if (currentRefKey) enableProtocolClue();
})();