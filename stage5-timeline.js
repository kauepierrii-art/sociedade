// ETAPA 05 — linha do tempo dos registros visuais
(function () {
  const cards = Array.from({ length: 7 }, (_, index) => ({
    id: String(index + 1),
    image: `assets/stage5/timeline-0${index + 1}.webp`
  }));
  // Troque este par assim que os dois registros definitivos forem definidos.
  const impossiblePair = new Set(['4', '7']);

  function shuffled(items) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const replacementIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[replacementIndex]] = [result[replacementIndex], result[index]];
    }
    return result;
  }

  function preloadCardImages() {
    cards.forEach(card => {
      const image = new Image();
      image.src = card.image;
    });
  }

  function stage5PartOneKey() {
    return currentRefKey ? `stage5:part-one:${currentRefKey}` : null;
  }

  function isStage5PartOneComplete() {
    const key = stage5PartOneKey();
    return Boolean(key && localStorage.getItem(key) === '1');
  }

  function saveStage5PartOneComplete() {
    const key = stage5PartOneKey();
    if (key) localStorage.setItem(key, '1');
  }

  function stage5CompleteKey() {
    return currentRefKey ? `stage5:complete:${currentRefKey}` : null;
  }

  function isStage5Complete() {
    const key = stage5CompleteKey();
    return Boolean(key && localStorage.getItem(key) === '1');
  }

  function saveStage5Complete() {
    const key = stage5CompleteKey();
    if (key) localStorage.setItem(key, '1');
  }

  function completionTextMarkup() {
    return `
      <p class="stage5-opening-label">REGISTRO DE ABERTURA</p>
      <h3>Correlação confirmada.</h3>
      <p>A gravação descreve a mesma sala registrada nas fotografias.</p>
      <p>As poltronas.</p><p>A mesa.</p><p>A estante.</p>
      <p>O quadro com a aeronave na parede.</p><p>O espelho.</p>
      <p>Não se trata de uma semelhança aproximada.</p><p>Trata-se do mesmo ambiente.</p>
      <p>O problema é a data.</p><p>Quando a sessão foi registrada, aquela sala ainda não existia.</p>
      <p>Alguns dos elementos descritos sequer pertenciam àquele período.</p><p>Ainda assim, foram observados.</p>
      <p>Décadas antes de qualquer registro visual conhecido.</p>
      <p><strong>A cronologia está correta.</strong></p><p><strong>A observação é que não deveria ser possível.</strong></p>
      <blockquote>O que, exatamente, o espelho mostra?</blockquote>`;
  }

  function renderTimeline() {
    const stageName = document.getElementById('stageName');
    if (!stageName || stageName.textContent.trim() !== 'Convergência') return;
    const actions = document.getElementById('stageActions');
    if (!actions || document.getElementById('stage5Timeline')) return;

    actions.innerHTML = '';
    const timeline = document.createElement('section');
    timeline.id = 'stage5Timeline';
    timeline.className = 'stage5-timeline';
    timeline.innerHTML = `
      <p class="stage5-timeline-intro">SELECIONE A CARTA DA FRENTE E POSICIONE-A NA LINHA. AS CARTAS INSERIDAS PODEM SER TROCADAS A QUALQUER MOMENTO.</p>
      <div class="stage5-deck-area">
        <button class="stage5-deck" type="button" aria-label="Selecionar carta da frente"></button>
        <button class="stage5-zoom" type="button">AMPLIAR CARTA</button>
        <div class="stage5-card-navigation">
          <button class="stage5-previous" type="button">CARTA ANTERIOR</button>
          <button class="stage5-next" type="button">PRÓXIMA CARTA</button>
        </div>
        <p class="stage5-deck-count"></p>
      </div>
      <div class="stage5-timeline-line" aria-label="Linha do tempo com sete posições"></div>
      <p class="stage5-timeline-message" role="status">AGUARDANDO ORGANIZAÇÃO DOS REGISTROS.</p>
      <div class="stage5-part-one-actions"><button class="primary-btn stage5-confirm" type="button" disabled>CONFIRMAR SEQUÊNCIA</button><button class="stage5-clear" type="button" disabled>LIMPAR BARALHO</button></div>
      <div class="stage5-hint-notice" role="status" hidden><span>APONTAMENTO DISPONÍVEL</span><button type="button" class="stage5-hint-open">VER ANOTAÇÃO</button></div>
      <section class="stage5-opening" hidden></section><section class="stage5-part-two" hidden></section>`;
    actions.appendChild(timeline);
    preloadCardImages();

    const partOneComplete = isStage5PartOneComplete();
    const stageStep = stages.findIndex(stage => stage && stage.name === 'Convergência') + 1;
    const stageComplete = isStage5Complete() || completedCount >= stageStep;
    let deck = stageComplete ? [] : shuffled(cards);
    let placed = stageComplete ? cards.slice() : Array(7).fill(null);
    let selectedDeck = false;
    let selectedSlot = null;
    const deckButton = timeline.querySelector('.stage5-deck');
    const zoomButton = timeline.querySelector('.stage5-zoom');
    const previousButton = timeline.querySelector('.stage5-previous');
    const nextButton = timeline.querySelector('.stage5-next');
    const count = timeline.querySelector('.stage5-deck-count');
    const line = timeline.querySelector('.stage5-timeline-line');
    const message = timeline.querySelector('.stage5-timeline-message');
    const confirm = timeline.querySelector('.stage5-confirm');
    const clearButton = timeline.querySelector('.stage5-clear');
    const partOneNotice = timeline.querySelector('.stage5-hint-notice');
    const opening = timeline.querySelector('.stage5-opening');
    const partTwo = timeline.querySelector('.stage5-part-two');

    function cardMarkup(card, position) {
      if (!card) return `<span class="stage5-empty">POSIÇÃO ${String(position + 1).padStart(2, '0')}</span>`;
      return `<span class="stage5-card"><img src="${card.image}" alt="Registro visual" decoding="async" onerror="this.hidden=true"><span class="stage5-card-label">REGISTRO VISUAL</span></span>`;
    }

    function openCardViewer(card) {
      if (!card) return;
      let viewer = document.getElementById('stage5CardViewer');
      if (!viewer) {
        viewer = document.createElement('section');
        viewer.id = 'stage5CardViewer';
        viewer.className = 'stage5-card-viewer';
        viewer.hidden = true;
        viewer.innerHTML = `<div class="stage5-card-viewer-backdrop"><button type="button" aria-label="Fechar ampliação">×</button><img alt="Registro visual ampliado"></div>`;
        document.body.appendChild(viewer);
        viewer.querySelector('button').addEventListener('click', () => { viewer.hidden = true; });
        viewer.querySelector('.stage5-card-viewer-backdrop').addEventListener('click', event => { if (event.target === event.currentTarget) viewer.hidden = true; });
      }
      viewer.querySelector('img').src = card.image;
      viewer.hidden = false;
    }

    function draw() {
      const front = deck[0];
      deckButton.innerHTML = front ? `${cardMarkup(front, 0)}<span class="stage5-deck-mark">CARTA DA FRENTE</span>` : '<span class="stage5-deck-empty">TODAS AS CARTAS FORAM POSICIONADAS</span>';
      const selectedCard = selectedSlot !== null ? placed[selectedSlot] : null;
      const zoomTarget = selectedDeck ? front : (selectedCard || front);
      deckButton.disabled = !front;
      zoomButton.disabled = !zoomTarget;
      zoomButton.textContent = selectedCard && !selectedDeck ? 'AMPLIAR CARTA SELECIONADA' : 'AMPLIAR CARTA';
      deckButton.classList.toggle('is-selected', selectedDeck);
      previousButton.disabled = deck.length < 2 || selectedDeck;
      nextButton.disabled = deck.length < 2 || selectedDeck;
      count.textContent = deck.length ? `${deck.length} CARTA${deck.length === 1 ? '' : 'S'} NO BARALHO` : 'BARALHO VAZIO';
      line.innerHTML = placed.map((card, index) => `<button class="stage5-slot ${selectedSlot === index ? 'is-selected' : ''}" type="button" data-slot="${index}" aria-label="Posição ${index + 1}${card ? ', preenchida' : ', vazia'}"><span class="stage5-slot-number">${String(index + 1).padStart(2, '0')}</span>${cardMarkup(card, index)}</button>`).join('');
      line.querySelectorAll('.stage5-slot').forEach(slot => slot.addEventListener('click', () => {
        const slotIndex = Number(slot.dataset.slot);
        if (timeline.classList.contains('is-review')) {
          openCardViewer(placed[slotIndex]);
          return;
        }
        placeOrAdjust(slotIndex);
      }));
      confirm.disabled = placed.some(card => !card);
      clearButton.disabled = !placed.some(Boolean) || partOneComplete || stageComplete;
    }

    function placeOrAdjust(target) {
      if (selectedDeck) {
        const front = deck.shift();
        if (placed[target]) deck.unshift(placed[target]);
        placed[target] = front;
        selectedDeck = false;
        message.textContent = `REGISTRO INSERIDO NA POSIÇÃO ${String(target + 1).padStart(2, '0')}.`;
      } else if (selectedSlot !== null) {
        [placed[selectedSlot], placed[target]] = [placed[target], placed[selectedSlot]];
        message.textContent = selectedSlot === target ? 'POSIÇÃO MANTIDA.' : 'POSIÇÕES AJUSTADAS.';
        selectedSlot = null;
      } else if (placed[target]) {
        selectedSlot = target;
        message.textContent = `POSIÇÃO ${String(target + 1).padStart(2, '0')} SELECIONADA. ESCOLHA OUTRA POSIÇÃO PARA TROCAR.`;
      } else {
        message.textContent = 'SELECIONE A CARTA DA FRENTE PRIMEIRO.';
      }
      draw();
    }

    function showReview() {
      timeline.classList.remove('is-part-two');
      timeline.classList.add('is-correct', 'is-review');
      opening.innerHTML = '<button type="button" class="stage5-opening-toggle" aria-expanded="false"><span>REGISTRO DE ABERTURA</span><span class="chev">＋</span></button><div class="stage5-opening-content" hidden>' + completionTextMarkup() + '</div>';
      opening.querySelector('.stage5-opening-toggle').addEventListener('click', () => {
        const toggle = opening.querySelector('.stage5-opening-toggle');
        const body = opening.querySelector('.stage5-opening-content');
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        toggle.querySelector('.chev').textContent = open ? '＋' : '−';
        body.hidden = open;
      });
      opening.hidden = false;
    }

    function openCompletionPopup() {
      const popup = document.createElement('section');
      popup.className = 'stage5-completion-modal';
      popup.innerHTML = `<div class="stage5-completion-dialog" role="dialog" aria-modal="true"><div class="stage5-opening">${completionTextMarkup()}</div><button class="primary-btn stage5-completion-continue" type="button">CONTINUAR PARA A ETAPA 6</button></div>`;
      document.body.appendChild(popup);
      popup.querySelector('.stage5-completion-continue').addEventListener('click', () => {
        popup.remove();
        showReview();
        renderDashboard();
        show(dashboardView);
      });
    }

    function showPartTwo() {
      let selected = [];
      let lastSelectedId = null;
      partTwo.hidden = false;
      // A introdução da Parte 1 deixa de competir com a nova tarefa.
      const context = document.getElementById('stageContext');
      const mission = document.getElementById('stageMission');
      if (context) context.hidden = true;
      if (mission) mission.hidden = true;
      partTwo.innerHTML = `
        <header class="stage5-part-heading">
          <p class="stage5-part-label">ETAPA 05 · PARTE 2 DE 2</p>
          <h3>Correlação documental</h3>
          <p class="stage5-part-status">LINHA DO TEMPO CONCLUÍDA — NOVA INVESTIGAÇÃO</p>
        </header>
        <div class="stage5-part-copy">
          <p>Todos os registros pertencem à mesma investigação. Entre eles, dois parecem registrar <strong>a mesma cena</strong>.</p>
          <p>Pela cronologia estabelecida, isso não deveria ser possível.</p>
          <p class="stage5-part-instruction"><strong>Identifique os dois registros e conecte-os selecionando suas cartas abaixo.</strong></p>
        </div>
        <div class="stage5-pair-grid">${placed.map((card, index) => `<button type="button" class="stage5-pair-card" data-card="${card.id}"><span class="stage5-pair-order">${String(index + 1).padStart(2, '0')}</span>${cardMarkup(card, index)}</button>`).join('')}</div>
        <p class="stage5-pair-message" role="status">SELECIONE DOIS REGISTROS.</p>
        <button class="stage5-pair-zoom" type="button" disabled>AMPLIAR ÚLTIMO REGISTRO SELECIONADO</button>
        <button class="primary-btn stage5-pair-confirm" type="button" disabled>CONFIRMAR CONEXÃO</button>
        <div class="stage5-hint-notice" role="status" hidden><span>APONTAMENTO DISPONÍVEL</span><button type="button" class="stage5-hint-open">VER ANOTAÇÃO</button></div>
        <div class="stage5-reward" hidden></div>`;
      const pairMessage = partTwo.querySelector('.stage5-pair-message');
      const pairZoom = partTwo.querySelector('.stage5-pair-zoom');
      const pairConfirm = partTwo.querySelector('.stage5-pair-confirm');
      const pairCards = partTwo.querySelectorAll('.stage5-pair-card');
      connectHintNotice(partTwo.querySelector('.stage5-hint-notice'));
      pairCards.forEach(button => button.addEventListener('click', () => {
        const id = button.dataset.card;
        if (selected.includes(id)) {
          selected = selected.filter(value => value !== id);
          if (lastSelectedId === id) lastSelectedId = selected[selected.length - 1] || null;
        } else if (selected.length < 2) {
          selected.push(id);
          lastSelectedId = id;
        } else {
          pairMessage.textContent = 'APENAS DOIS REGISTROS PODEM SER CONECTADOS.';
          return;
        }
        pairCards.forEach(card => card.classList.toggle('is-selected', selected.includes(card.dataset.card)));
        pairZoom.disabled = !lastSelectedId;
        pairConfirm.disabled = selected.length !== 2;
        pairMessage.textContent = selected.length === 2 ? 'DOIS REGISTROS SELECIONADOS. CONFIRME A CONEXÃO.' : 'SELECIONE DOIS REGISTROS.';
      }));
      pairZoom.addEventListener('click', () => {
        openCardViewer(placed.find(card => card.id === lastSelectedId));
      });
      pairConfirm.addEventListener('click', () => {
        const correct = selected.length === 2 && selected.every(id => impossiblePair.has(id));
        if (!correct) {
          pairMessage.textContent = 'A RELAÇÃO SELECIONADA NÃO EXPLICA A INCONSISTÊNCIA.';
          window.dispatchEvent(new Event('stage5-hint-error'));
          revealHintNotice(partTwo.querySelector('.stage5-hint-notice'));
          partTwo.classList.add('is-error');
          setTimeout(() => partTwo.classList.remove('is-error'), 500);
          return;
        }
        pairMessage.textContent = 'CORRELAÇÃO CONFIRMADA — ETAPA 6 LIBERADA.';
        pairConfirm.disabled = true;
        pairCards.forEach(card => { card.disabled = true; });
        saveStage5Complete();
        const step = stages.findIndex(stage => stage && stage.name === 'Convergência') + 1;
        if (step && currentRefKey) {
          completedCount = Math.max(completedCount, step);
          saveProgress(currentRefKey, completedCount);
        }
        openCompletionPopup();
      });
    }

    function connectHintNotice(notice) {
      if (!notice) return;
      notice.querySelector('.stage5-hint-open').addEventListener('click', () => {
        const panel = document.getElementById('stage45Hints-stage5');
        if (!panel || panel.hidden) return;
        const toggle = panel.querySelector('.stage45-hints-toggle');
        const history = panel.querySelector('.stage45-hints-history');
        const chevron = panel.querySelector('.stage45-hints-chev');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
        if (history) history.hidden = false;
        if (chevron) chevron.textContent = '−';
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    function revealHintNotice(notice) {
      const panel = document.getElementById('stage45Hints-stage5');
      if (!notice || !panel || panel.hidden) return;
      notice.hidden = false;
      notice.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    connectHintNotice(partOneNotice);

    clearButton.addEventListener('click', () => {
      if (partOneComplete || stageComplete || !placed.some(Boolean)) return;
      if (!window.confirm('Limpar a linha do tempo e devolver todas as cartas ao baralho?')) return;
      deck = shuffled(cards);
      placed = Array(7).fill(null);
      selectedDeck = false;
      selectedSlot = null;
      message.textContent = 'LINHA DO TEMPO LIMPA. TODAS AS CARTAS VOLTARAM AO BARALHO.';
      draw();
    });

    deckButton.addEventListener('click', () => {
      if (!deck.length) return;
      selectedDeck = !selectedDeck;
      selectedSlot = null;
      message.textContent = selectedDeck ? 'CARTA DA FRENTE SELECIONADA. ESCOLHA UMA POSIÇÃO NA LINHA.' : 'SELEÇÃO CANCELADA.';
      draw();
    });
    zoomButton.addEventListener('click', () => {
      const card = selectedDeck ? deck[0] : (selectedSlot !== null ? placed[selectedSlot] : deck[0]);
      openCardViewer(card);
    });
    previousButton.addEventListener('click', () => {
      deck.unshift(deck.pop());
      message.textContent = 'CARTA ANTERIOR EXIBIDA.';
      draw();
    });
    nextButton.addEventListener('click', () => {
      deck.push(deck.shift());
      message.textContent = 'PRÓXIMA CARTA EXIBIDA.';
      draw();
    });
    confirm.addEventListener('click', () => {
      const correct = placed.every((card, index) => card && card.id === String(index + 1));
      if (!correct) {
        message.textContent = 'A SEQUÊNCIA AINDA APRESENTA INCOMPATIBILIDADES.';
        window.dispatchEvent(new Event('stage5-hint-error'));
        revealHintNotice(partOneNotice);
        timeline.classList.remove('is-correct');
        timeline.classList.add('is-error');
        setTimeout(() => timeline.classList.remove('is-error'), 500);
        return;
      }
      saveStage5PartOneComplete();
      timeline.classList.add('is-correct');
      message.textContent = 'SEQUÊNCIA CONFIRMADA — PARTE 2 LIBERADA.';
      confirm.disabled = true;
      timeline.classList.add('is-part-two');
      showPartTwo();
      partTwo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    window.dispatchEvent(new CustomEvent('stage45-hints-mount', { detail: 'stage5' }));
    if (stageComplete) {
      draw();
      showReview();
    } else if (partOneComplete) {
      timeline.classList.add('is-correct', 'is-part-two');
      showPartTwo();
    } else {
      draw();
    }
  }

  const previousOpenStage = openStage;
  openStage = function (index) {
    previousOpenStage(index);
    if (stages[index] && stages[index].name === 'Convergência') setTimeout(renderTimeline, 0);
  };

  const style = document.createElement('style');
  style.textContent = `
    .stage5-timeline{margin-top:8px;border-top:1px solid var(--line);padding-top:17px}.stage5-timeline-intro{margin:0 0 18px;color:#9fb8af;font-size:10px;line-height:1.65;letter-spacing:.08em}.stage5-deck-area{display:grid;justify-items:center;margin:0 auto 26px}.stage5-deck{position:relative;display:grid;width:172px;height:128px;padding:8px;border:1px solid #82613d;background:linear-gradient(145deg,#251a12,#0b0908);box-shadow:6px 6px 0 #120d0a,11px 11px 0 #21170f;color:#d8b77e;cursor:pointer}.stage5-deck:before,.stage5-deck:after{content:"";position:absolute;inset:5px;border:1px solid rgba(195,145,76,.25);pointer-events:none}.stage5-deck:after{inset:9px}.stage5-deck:hover,.stage5-deck.is-selected{border-color:#e1b56b;box-shadow:0 0 0 2px rgba(212,156,72,.22),6px 6px 0 #120d0a,11px 11px 0 #21170f}.stage5-deck:disabled{opacity:.6;cursor:default}.stage5-card{position:relative;display:grid;width:100%;height:100%;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 35%,#5e4121,#140e0a 65%)}.stage5-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.stage5-card-fallback{color:#c59b5d;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.12em}.stage5-card-label{position:absolute;right:0;bottom:0;left:0;padding:5px;background:rgba(8,6,4,.82);color:#d8b77e;font:700 7px "IBM Plex Mono",monospace;letter-spacing:.12em}.stage5-deck-mark{position:absolute;z-index:3;right:7px;bottom:7px;left:7px;padding:4px;background:#17100b;color:#e2bc80;font:700 7px "IBM Plex Mono",monospace;letter-spacing:.12em}.stage5-deck-empty{align-self:center;font-size:9px;letter-spacing:.1em}.stage5-card-navigation{display:flex;gap:8px;margin-top:17px}.stage5-previous,.stage5-next{padding:7px 10px;border:1px solid #765631;background:#1b130d;color:#d7b57a;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.1em;cursor:pointer}.stage5-previous:disabled,.stage5-next:disabled{opacity:.45;cursor:default}.stage5-deck-count{margin:9px 0 0;color:#8e704b;font:8px "IBM Plex Mono",monospace;letter-spacing:.12em}.stage5-timeline-line{display:grid;grid-template-columns:repeat(7,minmax(70px,1fr));gap:8px;position:relative;align-items:end;padding:18px 0 8px;overflow-x:auto}.stage5-timeline-line:before{content:"";position:absolute;right:35px;left:35px;bottom:47px;height:1px;background:#86613a;box-shadow:0 1px #080604}.stage5-slot{position:relative;z-index:1;display:grid;gap:6px;min-width:70px;padding:0;border:0;background:transparent;color:#d8b77e;cursor:pointer}.stage5-timeline.is-review .stage5-slot{cursor:zoom-in}.stage5-timeline.is-review .stage5-slot:hover .stage5-card{border-color:#e3b86f;box-shadow:0 0 0 2px rgba(211,157,73,.2)}.stage5-slot-number{display:grid;width:26px;height:26px;margin:0 auto -1px;place-items:center;border:1px solid #84623c;border-radius:50%;background:#15100c;color:#e0b56f;font:700 8px "IBM Plex Mono",monospace;letter-spacing:.04em}.stage5-slot .stage5-card{height:88px;border:1px dashed #745535;background:#100c09}.stage5-slot:hover .stage5-card,.stage5-slot.is-selected .stage5-card{border-color:#e3b86f;box-shadow:0 0 0 2px rgba(211,157,73,.2)}.stage5-empty{display:grid;height:100%;place-items:center;padding:6px;color:#8e704b;font:700 7px "IBM Plex Mono",monospace;letter-spacing:.08em;text-align:center}.stage5-timeline-message{min-height:34px;margin:14px 0 0;padding:10px;border-top:1px solid #60462e;color:#cba36a;font:700 9px/1.5 "IBM Plex Mono",monospace;letter-spacing:.08em;text-align:center}.stage5-confirm{display:block;margin:8px auto 0}.stage5-timeline.is-error .stage5-timeline-message{color:#d77a67}.stage5-timeline.is-correct .stage5-timeline-message{color:#afd078}.stage5-timeline.is-correct .stage5-slot .stage5-card{border-color:#a8c76e;box-shadow:0 0 7px rgba(168,199,110,.35)}@media(max-width:600px){.stage5-timeline-line{grid-template-columns:repeat(7,76px);padding-bottom:8px}.stage5-timeline-line:before{right:38px;left:38px}.stage5-slot .stage5-card{height:94px}.stage5-deck{width:162px;height:120px}}
  `;
  document.head.appendChild(style);

  const partTwoStyle = document.createElement('style');
  partTwoStyle.textContent = `
    .stage5-part-two[hidden],.stage5-opening[hidden]{display:none}.stage5-timeline.is-part-two>.stage5-opening,.stage5-timeline.is-review>.stage5-timeline-intro,.stage5-timeline.is-review>.stage5-deck-area,.stage5-timeline.is-review>.stage5-timeline-message,.stage5-timeline.is-review>.stage5-confirm,.stage5-timeline.is-review>.stage5-part-two{display:none}.stage5-timeline.is-part-two>.stage5-timeline-intro,.stage5-timeline.is-part-two>.stage5-deck-area,.stage5-timeline.is-part-two>.stage5-timeline-line,.stage5-timeline.is-part-two>.stage5-timeline-message,.stage5-timeline.is-part-two>.stage5-confirm{display:none}.stage5-part-two{padding-top:4px}.stage5-part-label{margin:0;color:#e0b56f;font:700 12px/1.5 Georgia,serif;letter-spacing:.1em;text-align:center}.stage5-part-copy{margin:10px 0 18px;color:#a4c3ba;font-size:12px;line-height:1.7;text-align:center}.stage5-pair-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.stage5-pair-card{position:relative;min-width:0;height:105px;padding:0;border:1px solid #684b2d;background:#100c09;color:#d8b77e;cursor:pointer}.stage5-pair-card:nth-child(n+5){grid-column:span 1}.stage5-pair-card:hover,.stage5-pair-card.is-selected{border-color:#e3b86f;box-shadow:0 0 0 2px rgba(211,157,73,.2)}.stage5-pair-card.is-selected:after{content:"SELECIONADO";position:absolute;z-index:4;right:4px;bottom:4px;left:4px;padding:4px;background:#19110a;color:#f1cb82;font:700 7px "IBM Plex Mono",monospace;letter-spacing:.09em}.stage5-pair-card .stage5-card{height:100%}.stage5-pair-order{position:absolute;z-index:4;top:5px;left:5px;display:grid;width:21px;height:21px;place-items:center;border:1px solid #84623c;border-radius:50%;background:#15100c;color:#e0b56f;font:700 7px "IBM Plex Mono",monospace}.stage5-pair-message{min-height:32px;margin:15px 0 0;padding:9px;border-top:1px solid #60462e;color:#cba36a;font:700 9px/1.5 "IBM Plex Mono",monospace;letter-spacing:.08em;text-align:center}.stage5-pair-zoom{display:block;margin:8px auto;padding:7px 10px;border:1px solid #aa7b3d;background:#2a1b0e;color:#f0ce8e;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.08em;cursor:zoom-in}.stage5-pair-zoom:disabled{opacity:.45;cursor:default}.stage5-pair-confirm{display:block;margin:8px auto 0}.stage5-opening,.stage5-reward{margin-top:26px;padding:20px;border:1px solid #745535;background:linear-gradient(145deg,rgba(34,24,15,.74),rgba(9,7,5,.92));color:#d9c6a2;font:14px/1.7 Georgia,serif}.stage5-reward[hidden]{display:none}.stage5-opening-label{margin:0 0 8px!important;color:#cba36a;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.12em}.stage5-opening h3,.stage5-reward h3{margin:0 0 22px;color:#f0ce8e;font:700 18px/1.3 Georgia,serif}.stage5-opening p,.stage5-reward p{margin:0 0 13px}.stage5-opening blockquote,.stage5-reward blockquote{margin:24px 0 0;padding:14px 0 0;border-top:1px solid #765631;color:#f0ce8e;font:italic 16px/1.55 Georgia,serif}.stage5-completion-modal{position:fixed;z-index:5600;inset:0;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.88);overflow:auto}.stage5-completion-dialog{width:min(680px,100%);padding:10px}.stage5-completion-dialog .stage5-opening{margin-top:0}.stage5-completion-continue{display:block;margin:18px auto 0}.stage5-part-two.is-error .stage5-pair-message{color:#d77a67}@media(max-width:480px){.stage5-pair-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.stage5-pair-card{height:92px}}
  `;
  document.head.appendChild(partTwoStyle);

  const readabilityStyle = document.createElement('style');
  readabilityStyle.textContent = `
    .stage5-deck{width:min(82vw,330px)!important;height:auto!important;aspect-ratio:0.73!important}.stage5-deck .stage5-card img{object-fit:contain!important}.stage5-deck-mark{top:7px!important;bottom:auto!important}.stage5-zoom{margin-top:17px;padding:7px 10px;border:1px solid #aa7b3d;background:#2a1b0e;color:#f0ce8e;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.1em;cursor:zoom-in}.stage5-zoom:disabled{opacity:.45;cursor:default}.stage5-card-viewer[hidden]{display:none}.stage5-card-viewer{position:fixed;z-index:5200;inset:0}.stage5-card-viewer-backdrop{position:absolute;inset:0;display:grid;place-items:center;padding:22px;background:rgba(0,0,0,.94)}.stage5-card-viewer img{display:block;max-width:94vw;max-height:88vh;object-fit:contain;background:#090604;box-shadow:0 18px 60px #000}.stage5-card-viewer button{position:fixed;z-index:1;top:13px;right:15px;width:40px;height:40px;border:1px solid #aa7b3d;border-radius:50%;background:#17100b;color:#f0ce8e;font:400 25px/1 Georgia,serif;cursor:pointer}@media(max-width:390px){.stage5-deck{width:min(88vw,310px)!important}.stage5-deck-mark{font-size:6px!important}}
  `;
  document.head.appendChild(readabilityStyle);

  const stage5OpeningStyle = document.createElement('style');
  stage5OpeningStyle.textContent = `
    .stage5-opening{padding:0;border-color:rgba(87,214,178,.58);background:linear-gradient(145deg,rgba(9,35,30,.62),rgba(5,18,16,.92));color:#bcd6ce}.stage5-opening-toggle{display:flex;align-items:center;justify-content:space-between;width:100%;padding:14px 16px;border:0;background:none;color:var(--green);font:700 9px "IBM Plex Mono",monospace;letter-spacing:.12em;text-align:left;cursor:pointer}.stage5-opening-toggle:hover{background:rgba(87,214,178,.06)}.stage5-opening-toggle .chev{font-size:15px}.stage5-opening-content{padding:0 20px 20px;border-top:1px solid rgba(87,214,178,.24)}.stage5-opening-content .stage5-opening-label{padding-top:17px;color:var(--green)}.stage5-opening-content h3{color:#d7eee6}.stage5-opening-content blockquote{border-color:rgba(87,214,178,.42);color:#bce5d9}
  `;
  document.head.appendChild(stage5OpeningStyle);
})();
