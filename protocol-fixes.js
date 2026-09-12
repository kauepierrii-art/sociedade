// Correções de interface e fluxo: login sem dica duplicada, histórico na Identificação
// e validação robusta da Aptidão.
(function () {
  const identificationHints = [
    'Examine também os elementos que parecem apenas decorativos.',
    'Há três marcas que pertencem ao mesmo conjunto.',
    'Algumas tintas só se revelam sob certas condições.',
    'Calor suave pode tornar certas marcas visíveis.',
    'A marca foi feita com tinta invisível. Aplique calor suave ao papel para revelar os três valores. Não utilize chama direta.'
  ];
  const romans = ['I', 'II', 'III', 'IV', 'V'];

  // LOGIN: mantém somente a mensagem curta + caixa clicável amarela de histórico.
  document.addEventListener('submit', function (event) {
    if (!event.target || event.target.id !== 'accessForm') return;

    setTimeout(() => {
      const value = typeof normalizeRef === 'function'
        ? normalizeRef(referenceInput.value)
        : referenceInput.value.trim().toUpperCase();
      const valid = typeof REFERENCES !== 'undefined' && REFERENCES[value];
      if (!valid && loginMessage) {
        loginMessage.textContent = 'REFERÊNCIA NÃO LOCALIZADA.';
      }
    }, 0);
  }, true);

  function identificationErrorCount() {
    if (!currentRefKey) return 0;
    const raw = Number(localStorage.getItem(`identification:v2:errors:${currentRefKey}`));
    return Number.isInteger(raw) && raw > 0 ? Math.min(raw, identificationHints.length) : 0;
  }

  function ensureIdentificationArchive() {
    const form = document.querySelector('#identificationForm');
    if (!form) return null;

    const old = document.querySelector('#identificationHint');
    if (old) old.style.display = 'none';

    let panel = document.querySelector('#identificationHintsArchive');
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = 'identificationHintsArchive';
    panel.className = 'hint-history-panel identification-hints-archive';
    panel.hidden = true;
    panel.innerHTML = `
      <button class="hint-history-toggle" type="button" aria-expanded="false">
        <span class="hint-history-title">DICAS DESBLOQUEADAS</span>
        <span class="hint-history-count"></span>
        <span class="hint-history-chevron" aria-hidden="true">＋</span>
      </button>
      <div class="hint-history-content" hidden></div>`;

    form.appendChild(panel);

    const toggle = panel.querySelector('.hint-history-toggle');
    const content = panel.querySelector('.hint-history-content');
    const chevron = panel.querySelector('.hint-history-chevron');
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      content.hidden = expanded;
      chevron.textContent = expanded ? '＋' : '−';
    });

    return panel;
  }

  function renderIdentificationArchive(forceOpen = false) {
    const panel = ensureIdentificationArchive();
    if (!panel) return;

    const errors = identificationErrorCount();
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
    content.innerHTML = identificationHints.slice(0, errors).map((hint, index) => `
      <div class="hint-history-item${index === errors - 1 ? ' latest' : ''}">
        <span class="hint-label">${index === identificationHints.length - 1 ? 'AJUDA FINAL' : `DICA ${romans[index]}`}</span>
        <p>${hint}</p>
      </div>`).join('');

    if (forceOpen) {
      toggle.setAttribute('aria-expanded', 'true');
      content.hidden = false;
      chevron.textContent = '−';
    }
  }

  // Atualiza o histórico logo após uma tentativa na Etapa 01.
  document.addEventListener('submit', function (event) {
    if (!event.target || event.target.id !== 'identificationForm') return;
    setTimeout(() => renderIdentificationArchive(true), 20);
  }, true);

  // APTIDÃO: validação centralizada para evitar travamentos em sessão anônima.
  document.addEventListener('submit', function (event) {
    if (!event.target || event.target.id !== 'aptitudeForm') return;

    const input = document.querySelector('#aptitudeAnswer');
    if (!input) return;
    const answer = normalizeAnswer(input.value);
    const accepted = ['estojo', 'case', 'caixa', 'caixa do espelho'];
    if (!accepted.includes(answer)) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    completedCount = Math.max(completedCount, 2);
    saveProgress(currentRefKey, completedCount);

    // limpa histórico de erro da Aptidão após acerto
    localStorage.removeItem(`aptitude:v2:errors:${currentRefKey || 'unknown'}`);

    const message = document.querySelector('#aptitudeMessage');
    if (message) {
      message.style.color = 'var(--green)';
      message.textContent = 'DIVERGÊNCIA CONFIRMADA.';
    }

    setTimeout(() => {
      renderDashboard();
      show(dashboardView);
    }, 700);
  }, true);

  const observer = new MutationObserver(() => {
    if (document.querySelector('#identificationForm')) renderIdentificationArchive(false);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  const style = document.createElement('style');
  style.textContent = `
    #identificationHint { display: none !important; }
    .identification-hints-archive {
      margin-top: 14px;
      border-color: #6d5630;
      background: rgba(83, 60, 24, .12);
    }
  `;
  document.head.appendChild(style);
})();