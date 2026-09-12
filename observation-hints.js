// Dicas progressivas das ETAPAS 02 e 03, com histórico consultável.
(function () {
  const configs = {
    aptitudeForm: {
      stage: 'aptitude',
      inputId: 'aptitudeAnswer',
      boxId: 'aptitudeHints',
      accepted: ['estojo', 'case', 'caixa', 'caixa do espelho'],
      hints: [
        'Nem todas as diferenças entre os registros são relevantes.',
        'Compare as descrições físicas, não apenas a história do objeto.',
        'O elemento inconsistente não é o próprio espelho.',
        'Observe com atenção os anexos do email.',
        'Compare as medidas do estojo entre os registros.'
      ]
    },
    observationForm: {
      stage: 'observation',
      inputId: 'observationAnswer',
      boxId: 'observationHints',
      accepted: [
        'espelho',
        'espelho negro',
        'espelho de obsidiana',
        'espelho obsidiana',
        'black mirror'
      ],
      hints: [
        'A resposta não está necessariamente contida apenas no vídeo.',
        'Há uma mensagem no vídeo que indica onde procurar o material complementar.',
        'Parte do caminho está fora da gravação. Verifique também a descrição do vídeo.',
        'O material complementar pode ser acessado por um endereço indicado na descrição.',
        'O site indicado na descrição contém outros registros da mesma sala.'
      ]
    }
  };

  const roman = ['I', 'II', 'III', 'IV', 'V'];

  function storageKey(config) {
    return `${config.stage}:v2:errors:${currentRefKey || 'unknown'}`;
  }

  function getErrors(config) {
    const value = Number(localStorage.getItem(storageKey(config)));
    return Number.isInteger(value) && value > 0 ? Math.min(value, config.hints.length) : 0;
  }

  function setErrors(config, value) {
    localStorage.setItem(storageKey(config), String(Math.min(value, config.hints.length)));
  }

  function clearErrors(config) {
    localStorage.removeItem(storageKey(config));
  }

  function ensureHintPanel(form, config) {
    let panel = document.getElementById(config.boxId);
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = config.boxId;
    panel.className = 'hint-history-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <button class="hint-history-toggle" type="button" aria-expanded="true">
        <span class="hint-history-title">DICAS DESBLOQUEADAS</span>
        <span class="hint-history-count"></span>
        <span class="hint-history-chevron" aria-hidden="true">−</span>
      </button>
      <div class="hint-history-content"></div>`;

    form.appendChild(panel);

    const toggle = panel.querySelector('.hint-history-toggle');
    const content = panel.querySelector('.hint-history-content');
    const chevron = panel.querySelector('.hint-history-chevron');

    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      content.hidden = expanded;
      chevron.textContent = expanded ? '+' : '−';
    });

    return panel;
  }

  function renderHints(formId, forceOpen = false) {
    const config = configs[formId];
    const form = document.getElementById(formId);
    if (!config || !form) return;

    const panel = ensureHintPanel(form, config);
    const errors = getErrors(config);

    if (!errors) {
      panel.hidden = true;
      return;
    }

    panel.hidden = false;
    const count = panel.querySelector('.hint-history-count');
    const toggle = panel.querySelector('.hint-history-toggle');
    const content = panel.querySelector('.hint-history-content');
    const chevron = panel.querySelector('.hint-history-chevron');

    count.textContent = `(${errors})`;
    content.innerHTML = config.hints.slice(0, errors).map((hint, index) => `
      <div class="hint-history-item${index === errors - 1 ? ' latest' : ''}">
        <span class="hint-label">DICA ${roman[index]}</span>
        <p>${hint}</p>
      </div>`).join('');

    if (forceOpen) {
      toggle.setAttribute('aria-expanded', 'true');
      content.hidden = false;
      chevron.textContent = '−';
    }
  }

  document.addEventListener('submit', function (event) {
    const form = event.target;
    if (!form || !configs[form.id]) return;

    const config = configs[form.id];
    const input = document.getElementById(config.inputId);
    if (!input) return;

    const answer = normalizeAnswer(input.value);
    if (config.accepted.includes(answer)) {
      clearErrors(config);
      return;
    }

    setErrors(config, getErrors(config) + 1);
    setTimeout(() => renderHints(form.id, true), 0);
  }, true);

  const observer = new MutationObserver(function () {
    Object.keys(configs).forEach(formId => {
      if (document.getElementById(formId)) renderHints(formId, false);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const style = document.createElement('style');
  style.textContent = `
    .hint-history-panel {
      margin-top: 14px;
      border: 1px solid #6d5630;
      border-radius: 4px;
      background: rgba(83, 60, 24, .12);
      overflow: hidden;
    }

    .hint-history-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 11px 12px;
      border: 0;
      background: transparent;
      color: var(--amber, #d5a64a);
      font: inherit;
      font-size: 11px;
      letter-spacing: .08em;
      text-align: left;
      cursor: pointer;
    }

    .hint-history-title {
      font-weight: 700;
    }

    .hint-history-count {
      color: var(--text-soft, #9aa9a3);
    }

    .hint-history-chevron {
      margin-left: auto;
      font-size: 15px;
      line-height: 1;
    }

    .hint-history-content {
      border-top: 1px solid rgba(109, 86, 48, .55);
      padding: 2px 12px 11px;
    }

    .hint-history-item {
      padding: 10px 0 8px;
      border-bottom: 1px solid rgba(109, 86, 48, .28);
    }

    .hint-history-item:last-child {
      border-bottom: 0;
    }

    .hint-history-item.latest .hint-label {
      color: var(--amber, #d5a64a);
    }

    .hint-history-item .hint-label {
      display: block;
      margin-bottom: 5px;
      color: var(--text-soft, #9aa9a3);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .1em;
    }

    .hint-history-item p {
      margin: 0;
      color: var(--text, #d8e4df);
      font-size: 12.5px;
      line-height: 1.6;
    }
  `;
  document.head.appendChild(style);
})();
