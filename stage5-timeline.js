// ETAPA 05 — linha do tempo dos registros visuais
(function () {
  const cards = Array.from({ length: 7 }, (_, index) => ({
    id: String(index + 1),
    image: `assets/stage5/timeline-0${index + 1}.png`
  }));
  // Troque este par assim que os dois registros definitivos forem definidos.
  const impossiblePair = new Set(['1', '2']);

  function shuffled(items) {
    return items.slice().sort(() => Math.random() - .5);
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
        <button class="stage5-next" type="button">PRÓXIMA CARTA</button>
        <p class="stage5-deck-count"></p>
      </div>
      <div class="stage5-timeline-line" aria-label="Linha do tempo com sete posições"></div>
      <p class="stage5-timeline-message" role="status">AGUARDANDO ORGANIZAÇÃO DOS REGISTROS.</p>
      <button class="primary-btn stage5-confirm" type="button" disabled>CONFIRMAR SEQUÊNCIA</button>
      <section class="stage5-part-two" hidden></section>`;
    actions.appendChild(timeline);

    let deck = shuffled(cards);
    let placed = Array(7).fill(null);
    let selectedDeck = false;
    let selectedSlot = null;
    const deckButton = timeline.querySelector('.stage5-deck');
    const nextButton = timeline.querySelector('.stage5-next');
    const count = timeline.querySelector('.stage5-deck-count');
    const line = timeline.querySelector('.stage5-timeline-line');
    const message = timeline.querySelector('.stage5-timeline-message');
    const confirm = timeline.querySelector('.stage5-confirm');
    const partTwo = timeline.querySelector('.stage5-part-two');

    function cardMarkup(card, position) {
      if (!card) return `<span class="stage5-empty">POSIÇÃO ${String(position + 1).padStart(2, '0')}</span>`;
      return `<span class="stage5-card"><img src="${card.image}" alt="Registro visual" onerror="this.hidden=true"><span class="stage5-card-fallback">ARQUIVO ${card.id}</span><span class="stage5-card-label">REGISTRO VISUAL</span></span>`;
    }

    function draw() {
      const front = deck[0];
      deckButton.innerHTML = front ? `${cardMarkup(front, 0)}<span class="stage5-deck-mark">CARTA DA FRENTE</span>` : '<span class="stage5-deck-empty">TODAS AS CARTAS FORAM POSICIONADAS</span>';
      deckButton.disabled = !front;
      deckButton.classList.toggle('is-selected', selectedDeck);
      nextButton.disabled = deck.length < 2 || selectedDeck;
      count.textContent = deck.length ? `${deck.length} CARTA${deck.length === 1 ? '' : 'S'} NO BARALHO` : 'BARALHO VAZIO';
      line.innerHTML = placed.map((card, index) => `<button class="stage5-slot ${selectedSlot === index ? 'is-selected' : ''}" type="button" data-slot="${index}" aria-label="Posição ${index + 1}${card ? ', preenchida' : ', vazia'}"><span class="stage5-slot-number">${String(index + 1).padStart(2, '0')}</span>${cardMarkup(card, index)}</button>`).join('');
      line.querySelectorAll('.stage5-slot').forEach(slot => slot.addEventListener('click', () => placeOrAdjust(Number(slot.dataset.slot))));
      confirm.disabled = placed.some(card => !card);
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

    function showPartTwo() {
      let selected = [];
      partTwo.hidden = false;
      partTwo.innerHTML = `
        <p class="stage5-part-label">PARTE 2 — IDENTIFIQUE A CORRESPONDÊNCIA IMPOSSÍVEL.</p>
        <p class="stage5-part-copy">Há uma relação entre dois registros que a cronologia não explica.<br>Conecte-os.</p>
        <div class="stage5-pair-grid">${placed.map((card, index) => `<button type="button" class="stage5-pair-card" data-card="${card.id}"><span class="stage5-pair-order">${String(index + 1).padStart(2, '0')}</span>${cardMarkup(card, index)}</button>`).join('')}</div>
        <p class="stage5-pair-message" role="status">SELECIONE DOIS REGISTROS.</p>
        <button class="primary-btn stage5-pair-confirm" type="button" disabled>CONFIRMAR CONEXÃO</button>
        <div class="stage5-reward" hidden></div>`;
      const pairMessage = partTwo.querySelector('.stage5-pair-message');
      const pairConfirm = partTwo.querySelector('.stage5-pair-confirm');
      const pairCards = partTwo.querySelectorAll('.stage5-pair-card');
      pairCards.forEach(button => button.addEventListener('click', () => {
        const id = button.dataset.card;
        if (selected.includes(id)) selected = selected.filter(value => value !== id);
        else if (selected.length < 2) selected.push(id);
        else {
          pairMessage.textContent = 'APENAS DOIS REGISTROS PODEM SER CONECTADOS.';
          return;
        }
        pairCards.forEach(card => card.classList.toggle('is-selected', selected.includes(card.dataset.card)));
        pairConfirm.disabled = selected.length !== 2;
        pairMessage.textContent = selected.length === 2 ? 'DOIS REGISTROS SELECIONADOS. CONFIRME A CONEXÃO.' : 'SELECIONE DOIS REGISTROS.';
      }));
      pairConfirm.addEventListener('click', () => {
        const correct = selected.length === 2 && selected.every(id => impossiblePair.has(id));
        if (!correct) {
          pairMessage.textContent = 'A RELAÇÃO SELECIONADA NÃO EXPLICA A INCONSISTÊNCIA.';
          partTwo.classList.add('is-error');
          setTimeout(() => partTwo.classList.remove('is-error'), 500);
          return;
        }
        pairMessage.textContent = 'CORRESPONDÊNCIA CONFIRMADA — PRÓXIMA ETAPA LIBERADA.';
        pairConfirm.disabled = true;
        pairCards.forEach(card => { card.disabled = true; });
        const step = stages.findIndex(stage => stage && stage.name === 'Convergência') + 1;
        if (step && currentRefKey) {
          completedCount = Math.max(completedCount, step);
          saveProgress(currentRefKey, completedCount);
        }
      });
    }

    deckButton.addEventListener('click', () => {
      if (!deck.length) return;
      selectedDeck = !selectedDeck;
      selectedSlot = null;
      message.textContent = selectedDeck ? 'CARTA DA FRENTE SELECIONADA. ESCOLHA UMA POSIÇÃO NA LINHA.' : 'SELEÇÃO CANCELADA.';
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
        timeline.classList.remove('is-correct');
        timeline.classList.add('is-error');
        setTimeout(() => timeline.classList.remove('is-error'), 500);
        return;
      }
      timeline.classList.add('is-correct');
      message.textContent = 'SEQUÊNCIA CONFIRMADA — INCONSISTÊNCIA IDENTIFICADA.';
      confirm.disabled = true;
      timeline.classList.add('is-part-two');
      showPartTwo();
    });
    draw();
  }

  const previousOpenStage = openStage;
  openStage = function (index) {
    previousOpenStage(index);
    if (stages[index] && stages[index].name === 'Convergência') setTimeout(renderTimeline, 0);
  };

  const style = document.createElement('style');
  style.textContent = `
    .stage5-timeline{margin-top:8px;border-top:1px solid var(--line);padding-top:17px}.stage5-timeline-intro{margin:0 0 18px;color:#9fb8af;font-size:10px;line-height:1.65;letter-spacing:.08em}.stage5-deck-area{display:grid;justify-items:center;margin:0 auto 26px}.stage5-deck{position:relative;display:grid;width:172px;height:128px;padding:8px;border:1px solid #82613d;background:linear-gradient(145deg,#251a12,#0b0908);box-shadow:6px 6px 0 #120d0a,11px 11px 0 #21170f;color:#d8b77e;cursor:pointer}.stage5-deck:before,.stage5-deck:after{content:"";position:absolute;inset:5px;border:1px solid rgba(195,145,76,.25);pointer-events:none}.stage5-deck:after{inset:9px}.stage5-deck:hover,.stage5-deck.is-selected{border-color:#e1b56b;box-shadow:0 0 0 2px rgba(212,156,72,.22),6px 6px 0 #120d0a,11px 11px 0 #21170f}.stage5-deck:disabled{opacity:.6;cursor:default}.stage5-card{position:relative;display:grid;width:100%;height:100%;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 35%,#5e4121,#140e0a 65%)}.stage5-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.stage5-card-fallback{color:#c59b5d;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.12em}.stage5-card-label{position:absolute;right:0;bottom:0;left:0;padding:5px;background:rgba(8,6,4,.82);color:#d8b77e;font:700 7px "IBM Plex Mono",monospace;letter-spacing:.12em}.stage5-deck-mark{position:absolute;z-index:3;right:7px;bottom:7px;left:7px;padding:4px;background:#17100b;color:#e2bc80;font:700 7px "IBM Plex Mono",monospace;letter-spacing:.12em}.stage5-deck-empty{align-self:center;font-size:9px;letter-spacing:.1em}.stage5-next{margin-top:17px;padding:7px 10px;border:1px solid #765631;background:#1b130d;color:#d7b57a;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.1em;cursor:pointer}.stage5-next:disabled{opacity:.45;cursor:default}.stage5-deck-count{margin:9px 0 0;color:#8e704b;font:8px "IBM Plex Mono",monospace;letter-spacing:.12em}.stage5-timeline-line{display:grid;grid-template-columns:repeat(7,minmax(70px,1fr));gap:8px;position:relative;align-items:end;padding:18px 0 8px;overflow-x:auto}.stage5-timeline-line:before{content:"";position:absolute;right:35px;left:35px;bottom:47px;height:1px;background:#86613a;box-shadow:0 1px #080604}.stage5-slot{position:relative;z-index:1;display:grid;gap:6px;min-width:70px;padding:0;border:0;background:transparent;color:#d8b77e;cursor:pointer}.stage5-slot-number{display:grid;width:26px;height:26px;margin:0 auto -1px;place-items:center;border:1px solid #84623c;border-radius:50%;background:#15100c;color:#e0b56f;font:700 8px "IBM Plex Mono",monospace;letter-spacing:.04em}.stage5-slot .stage5-card{height:88px;border:1px dashed #745535;background:#100c09}.stage5-slot:hover .stage5-card,.stage5-slot.is-selected .stage5-card{border-color:#e3b86f;box-shadow:0 0 0 2px rgba(211,157,73,.2)}.stage5-empty{display:grid;height:100%;place-items:center;padding:6px;color:#8e704b;font:700 7px "IBM Plex Mono",monospace;letter-spacing:.08em;text-align:center}.stage5-timeline-message{min-height:34px;margin:14px 0 0;padding:10px;border-top:1px solid #60462e;color:#cba36a;font:700 9px/1.5 "IBM Plex Mono",monospace;letter-spacing:.08em;text-align:center}.stage5-confirm{display:block;margin:8px auto 0}.stage5-timeline.is-error .stage5-timeline-message{color:#d77a67}.stage5-timeline.is-correct .stage5-timeline-message{color:#afd078}.stage5-timeline.is-correct .stage5-slot .stage5-card{border-color:#a8c76e;box-shadow:0 0 7px rgba(168,199,110,.35)}@media(max-width:600px){.stage5-timeline-line{grid-template-columns:repeat(7,76px);padding-bottom:8px}.stage5-timeline-line:before{right:38px;left:38px}.stage5-slot .stage5-card{height:94px}.stage5-deck{width:162px;height:120px}}
  `;
  document.head.appendChild(style);

  const partTwoStyle = document.createElement('style');
  partTwoStyle.textContent = `
    .stage5-part-two[hidden]{display:none}.stage5-timeline.is-part-two>.stage5-timeline-intro,.stage5-timeline.is-part-two>.stage5-deck-area,.stage5-timeline.is-part-two>.stage5-timeline-line,.stage5-timeline.is-part-two>.stage5-timeline-message,.stage5-timeline.is-part-two>.stage5-confirm{display:none}.stage5-part-two{padding-top:4px}.stage5-part-label{margin:0;color:#e0b56f;font:700 12px/1.5 Georgia,serif;letter-spacing:.1em;text-align:center}.stage5-part-copy{margin:10px 0 18px;color:#a4c3ba;font-size:12px;line-height:1.7;text-align:center}.stage5-pair-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.stage5-pair-card{position:relative;min-width:0;height:105px;padding:0;border:1px solid #684b2d;background:#100c09;color:#d8b77e;cursor:pointer}.stage5-pair-card:nth-child(n+5){grid-column:span 1}.stage5-pair-card:hover,.stage5-pair-card.is-selected{border-color:#e3b86f;box-shadow:0 0 0 2px rgba(211,157,73,.2)}.stage5-pair-card.is-selected:after{content:"SELECIONADO";position:absolute;z-index:4;right:4px;bottom:4px;left:4px;padding:4px;background:#19110a;color:#f1cb82;font:700 7px "IBM Plex Mono",monospace;letter-spacing:.09em}.stage5-pair-card .stage5-card{height:100%}.stage5-pair-order{position:absolute;z-index:4;top:5px;left:5px;display:grid;width:21px;height:21px;place-items:center;border:1px solid #84623c;border-radius:50%;background:#15100c;color:#e0b56f;font:700 7px "IBM Plex Mono",monospace}.stage5-pair-message{min-height:32px;margin:15px 0 0;padding:9px;border-top:1px solid #60462e;color:#cba36a;font:700 9px/1.5 "IBM Plex Mono",monospace;letter-spacing:.08em;text-align:center}.stage5-pair-confirm{display:block;margin:8px auto 0}.stage5-part-two.is-error .stage5-pair-message{color:#d77a67}@media(max-width:480px){.stage5-pair-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.stage5-pair-card{height:92px}}
  `;
  document.head.appendChild(partTwoStyle);
})();
