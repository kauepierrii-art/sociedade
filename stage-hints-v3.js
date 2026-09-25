// Sistema unificado de apontamentos das etapas 01–03.
// Cada solicitação revela imediatamente o próximo apontamento.
// O histórico permanece consultável por referência.
(function () {
  const roman = ['I', 'II', 'III', 'IV', 'V'];

  const configs = {
    identification: {
      formId: 'identificationForm',
      inputId: 'validationCode',
      panelId: 'identificationHintsV3',
      stageKey: 'identification',
      hints: [
        'Examine também os elementos que parecem apenas decorativos.',
        'Há três elementos que pertencem ao mesmo conjunto.',
        'Nem todos os detalhes desses elementos têm função apenas visual.',
        'A ordem em que aparecem também faz parte da resposta.',
        'Observe os três dados.'
      ]
    },
    aptitude: {
      formId: 'aptitudeForm',
      inputId: 'aptitudeAnswer',
      panelId: 'aptitudeHintsV3',
      stageKey: 'aptitude',
      hints: [
        'Nem todas as diferenças entre os registros são relevantes.',
        'Compare as descrições físicas, não apenas a história do objeto.',
        'O elemento inconsistente não é o próprio espelho.',
        'Observe com atenção os anexos do email.',
        'Compare as medidas do estojo entre os registros.'
      ]
    },
    observation: {
      formId: 'observationForm',
      inputId: 'observationAnswer',
      panelId: 'observationHintsV3',
      stageKey: 'observation',
      hints: [
        'A resposta não está necessariamente contida apenas no vídeo.',
        'Há uma mensagem no vídeo que indica onde procurar o material complementar.',
        'Parte do caminho está fora da gravação. Verifique também a descrição do vídeo.',
        'O material complementar pode ser acessado por um endereço indicado na descrição.',
        'O site indicado na descrição contém outros registros da mesma sala.'
      ]
    }
  };

  function refKey() {
    return currentRefKey || 'unknown';
  }

  function stateKey(config, part) {
    return `stage-hints:v3:${config.stageKey}:${part}:${refKey()}`;
  }

  function getUnlocked(config) {
    const value = Number(localStorage.getItem(stateKey(config, 'unlocked')));
    return Number.isInteger(value) && value > 0 ? Math.min(value, config.hints.length) : 0;
  }

  function setUnlocked(config, value) {
    localStorage.setItem(stateKey(config, 'unlocked'), String(Math.max(0, Math.min(value, config.hints.length))));
  }

  function unlockNextHint(config) {
    const unlocked = getUnlocked(config);
    if (unlocked >= config.hints.length) return;
    const nextCount = unlocked + 1;
    setUnlocked(config, nextCount);
    localStorage.removeItem(stateKey(config, 'nextAt'));
    renderPanel(config, true);
  }

  function hintLabel(index, total) {
    return `ANOTAÇÃO ${roman[index]}`;
  }

  function ensurePanel(config) {
    const form = document.getElementById(config.formId);
    if (!form) return null;

    let panel = document.getElementById(config.panelId);
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = config.panelId;
    panel.className = 'stage-hints-v3';
    panel.hidden = true;
    panel.innerHTML = `
      <div class="stage-hints-box">
        <button type="button" class="stage-hints-toggle" aria-expanded="false">
          <span>APONTAMENTO ADICIONAL <span class="stage-hints-count"></span></span>
          <span class="stage-hints-chevron" aria-hidden="true">＋</span>
        </button>
        <div class="stage-hints-history" hidden></div>
      </div>
      <button type="button" class="stage-hints-request"></button>`;

    form.appendChild(panel);

    const toggle = panel.querySelector('.stage-hints-toggle');
    const history = panel.querySelector('.stage-hints-history');
    const chev = panel.querySelector('.stage-hints-chevron');
    const request = panel.querySelector('.stage-hints-request');

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      history.hidden = expanded;
      chev.textContent = expanded ? '＋' : '−';
    });

    request.addEventListener('click', () => unlockNextHint(config));
    return panel;
  }

  function renderPanel(config, forceOpen = false) {
    const panel = ensurePanel(config);
    if (!panel) return;

    const unlocked = getUnlocked(config);
    panel.hidden = false;
    const box = panel.querySelector('.stage-hints-box');
    const toggle = panel.querySelector('.stage-hints-toggle');
    const history = panel.querySelector('.stage-hints-history');
    const chev = panel.querySelector('.stage-hints-chevron');
    const count = panel.querySelector('.stage-hints-count');
    const request = panel.querySelector('.stage-hints-request');

    box.hidden = !unlocked;
    count.textContent = `(${unlocked})`;
    history.innerHTML = config.hints.slice(0, unlocked).map((hint, index) => `
      <div class="stage-hints-item${index === unlocked - 1 ? ' latest' : ''}">
        <span class="stage-hints-label">${hintLabel(index, config.hints.length)}</span>
        <p>${hint}</p>
      </div>`).join('');

    if (forceOpen) {
      toggle.setAttribute('aria-expanded', 'true');
      history.hidden = false;
      chev.textContent = '−';
    }

    if (unlocked >= config.hints.length) {
      request.hidden = true;
      return;
    }

    request.hidden = false;
    request.disabled = false;
    request.textContent = unlocked ? 'SOLICITAR NOVO APONTAMENTO' : 'SOLICITAR APONTAMENTO';
  }

  // ETAPA 01 — substitui o bloqueio de respostas pelo contador exclusivo das dicas.
  renderIdentificationForm = function (actions) {
    const config = configs.identification;

    // Ignora resíduos do sistema antigo de cooldown.
    localStorage.removeItem(`identification:v2:until:${refKey()}`);

    actions.innerHTML = `
      <form id="identificationForm" class="validation-form" autocomplete="off">
        <label for="validationCode" class="validation-label">CÓDIGO DE VALIDAÇÃO</label>
        <input id="validationCode" class="validation-code" type="text" inputmode="numeric" pattern="[0-9]{3}" maxlength="3" placeholder="_ _ _" required />
        <p class="validation-quote">${stages[0].mission}</p>
        <button id="validationBtn" type="submit" class="primary-btn">VALIDAR</button>
        <p id="validationMessage" class="validation-message" role="status"></p>
      </form>`;

    const form = document.getElementById('identificationForm');
    const input = document.getElementById('validationCode');
    const button = document.getElementById('validationBtn');
    const message = document.getElementById('validationMessage');
    const reviewMode = completedCount >= 1;

    if (reviewMode) {
      input.value = IDENTIFICATION_CODE;
      input.disabled = true;
      button.disabled = true;
      message.style.color = 'var(--green)';
      message.textContent = 'IDENTIFICAÇÃO CONFIRMADA — RESPOSTA: ' + IDENTIFICATION_CODE + '.';
      renderPanel(config, false);
      return;
    }

    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 3);
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (input.value === IDENTIFICATION_CODE) {
        completedCount = Math.max(completedCount, 1);
        saveProgress(currentRefKey, completedCount);
        message.style.color = 'var(--green)';
        message.textContent = 'IDENTIFICAÇÃO CONFIRMADA.';
        input.disabled = true;
        button.disabled = true;
        setTimeout(() => {
          renderDashboard();
          show(dashboardView);
        }, 700);
        return;
      }

      message.style.color = 'var(--danger)';
      message.textContent = 'VALIDAÇÃO NEGADA.';
      input.value = '';
      input.focus();
    });

    renderPanel(config, false);
  };

  // ETAPA 02 — mantém a validação robusta e adiciona o novo sistema de dicas.
  const originalRenderStageTwoV3 = renderStageTwo;
  renderStageTwo = function (actions) {
    originalRenderStageTwoV3(actions);
    const form = document.getElementById('aptitudeForm');
    if (!form) return;

    const config = configs.aptitude;
    const reviewMode = completedCount >= 2;
    const input = document.getElementById('aptitudeAnswer');
    const submit = form.querySelector('button[type="submit"]');
    const message = document.getElementById('aptitudeMessage');

    if (reviewMode) {
      if (input) { input.value = 'Estojo'; input.disabled = true; }
      if (submit) submit.disabled = true;
      if (message) {
        message.style.color = 'var(--green)';
        message.textContent = 'DIVERGÊNCIA CONFIRMADA — RESPOSTA: ESTOJO.';
      }
      renderPanel(config, false);
      return;
    }

    renderPanel(config, false);

    form.addEventListener('submit', function (event) {
      const input = document.getElementById('aptitudeAnswer');
      if (!input) return;
      const answer = normalizeAnswer(input.value);
      const accepted = ['estojo', 'case'];

      if (accepted.includes(answer)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        completedCount = Math.max(completedCount, 2);
        saveProgress(currentRefKey, completedCount);
        const message = document.getElementById('aptitudeMessage');
        if (message) {
          message.style.color = 'var(--green)';
          message.textContent = 'DIVERGÊNCIA CONFIRMADA.';
        }
        setTimeout(() => {
          renderDashboard();
          show(dashboardView);
        }, 700);
      }
    }, true);
  };

  // ETAPA 03 — usa o mesmo histórico + contador de solicitação.
  if (typeof renderStageThree === 'function') {
    const originalRenderStageThreeV3 = renderStageThree;
    renderStageThree = function (actions, readOnly = false) {
      originalRenderStageThreeV3(actions, readOnly);
      if (readOnly) return;
      const form = document.getElementById('observationForm');
      if (!form) return;
      renderPanel(configs.observation, false);
    };
  }

  const style = document.createElement('style');
  style.textContent = `
    .stage-hints-v3 {
      margin-top: 14px;
    }

    .stage-hints-box {
      border: 1px solid #6d5630;
      border-radius: 4px;
      background: rgba(83, 60, 24, .12);
      overflow: hidden;
    }

    .stage-hints-toggle {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      padding: 11px 12px;
      border: 0;
      background: transparent;
      color: var(--amber, #d5a64a);
      font: inherit;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .08em;
      text-align: left;
      cursor: pointer;
    }

    .stage-hints-chevron {
      font-size: 15px;
      line-height: 1;
    }

    .stage-hints-history {
      border-top: 1px solid rgba(109, 86, 48, .55);
      padding: 2px 12px 10px;
    }

    .stage-hints-item {
      padding: 10px 0 8px;
      border-bottom: 1px solid rgba(109, 86, 48, .28);
    }

    .stage-hints-item:last-child {
      border-bottom: 0;
    }

    .stage-hints-label {
      display: block;
      margin-bottom: 5px;
      color: var(--text-soft, #9aa9a3);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .1em;
    }

    .stage-hints-item.latest .stage-hints-label {
      color: var(--amber, #d5a64a);
    }

    .stage-hints-item p {
      margin: 0;
      color: var(--text, #d8e4df);
      font-size: 12.5px;
      line-height: 1.6;
    }

    .stage-hints-request {
      width: 100%;
      margin-top: 8px;
      padding: 10px 12px;
      border: 1px solid #6d5630;
      border-radius: 4px;
      background: transparent;
      color: var(--amber, #d5a64a);
      font: inherit;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: .06em;
      cursor: pointer;
    }

    .stage-hints-request:disabled {
      opacity: .55;
      cursor: default;
    }
  `;
  document.head.appendChild(style);
})();

