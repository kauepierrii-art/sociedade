const stages = [
  {
    name: 'Identificação',
    context: 'A origem deste acesso precisa ser confirmada.\n\nA correspondência contém uma segunda marca de validação.',
    mission: '“O que não se vê ainda pode deixar vestígios. Nem toda marca resiste da mesma forma ao calor.”'
  },
  {
    name: 'Aptidão',
    context: 'Antes de prosseguir, precisamos verificar se vocês conseguem interpretar informações incompletas e resolver um primeiro problema.',
    mission: 'MODELO DE CONTEÚDO: aqui entrará o primeiro enigma real. Nesta base, usem o botão abaixo apenas para simular a conclusão da etapa.'
  },
  {
    name: 'Observação',
    context: 'Nem toda informação relevante é apresentada de forma explícita. Esta etapa avaliará atenção, padrão e detalhe.',
    mission: 'MODELO DE CONTEÚDO: esta etapa poderá usar imagem, vídeo, mapa ou outro registro externo.'
  },
  {
    name: 'Julgamento',
    context: 'Informações conflitantes exigirão uma decisão antes que o processo possa continuar.',
    mission: 'MODELO DE CONTEÚDO: aqui poderá existir uma escolha sem resposta objetivamente certa.'
  },
  {
    name: 'Iniciativa',
    context: 'Instruções completas nem sempre estarão disponíveis. Vocês deverão avançar por iniciativa própria.',
    mission: 'MODELO DE CONTEÚDO: esta etapa deverá exigir que vocês encontrem o próximo passo sem um comando explícito.'
  },
  {
    name: 'Confiança',
    context: 'O acesso seguinte envolve material restrito e exige que o processo já tenha sido compreendido.',
    mission: 'MODELO DE CONTEÚDO: etapa final antes da admissão.'
  },
  {
    name: 'Admissão',
    context: 'O processo de seleção foi concluído. A continuidade dependerá do resultado desta etapa.',
    mission: 'MODELO DE CONTEÚDO: aqui ocorrerá a revelação e o encaminhamento para o futuro ambiente permanente.'
  }
];

const REFERENCES = {
  LUMEN: 'Lumen',
  TACITUS: 'Tacitus',
  SPECULO: 'Speculo',
  VIGIL: 'Vigil',
  FERRO: 'Ferro',
  IGNIS: 'Ignis',
  PUGNUS: 'Pugnus',
  CUSTOS: 'Custos',
  MALLEUS: 'Malleus',
  DUX: 'Dux',
  RATIO: 'Ratio',
  NEXUS: 'Nexus',
  VERITAS: 'Veritas',
  ARS: 'Ars',
  FATUM: 'Fatum',
  FINIS: 'Finis',
  ULTOR: 'Ultor',
  AEQUITAS: 'Aequitas',
  SICA: 'Sica'
};

// Código provisório da marca física. Trocar quando a sequência definitiva dos três dados for escolhida.
const IDENTIFICATION_CODE = '352';
const MAX_COOLDOWN_MINUTES = 15;

const IDENTIFICATION_HINTS = [
  'Examine também os elementos que parecem apenas decorativos.',
  'Há três marcas que pertencem ao mesmo conjunto.',
  'Algumas tintas só se revelam sob certas condições.',
  'Calor suave pode tornar certas marcas visíveis.',
  'A marca foi feita com tinta invisível. Aplique calor suave ao papel para revelar os três valores. Não utilize chama direta.'
];

const loginView = document.querySelector('#loginView');
const dashboardView = document.querySelector('#dashboardView');
const stageView = document.querySelector('#stageView');
const loginMessage = document.querySelector('#loginMessage');
const referenceInput = document.querySelector('#reference');
const stageList = document.querySelector('#stageList');
const progressText = document.querySelector('#progressText');
const processStatus = document.querySelector('#processStatus');
const stageStatus = document.querySelector('#stageStatus');
const importantInfoBtn = document.querySelector('#importantInfoBtn');
const printDialog = document.querySelector('#printDialog');
const closePrintDialog = document.querySelector('#closePrintDialog');

let currentRefKey = null;
let currentRefLabel = null;
let completedCount = 0;
let cooldownTimer = null;

function show(view) {
  [loginView, dashboardView, stageView].forEach(v => v.classList.remove('active'));
  view.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function normalizeRef(value) {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

function loadProgress(refKey) {
  const stored = Number(localStorage.getItem(`progress:${refKey}`));
  return Number.isInteger(stored) && stored >= 0 && stored <= stages.length ? stored : 0;
}

function saveProgress(refKey, value) {
  localStorage.setItem(`progress:${refKey}`, String(value));
}

function getTopStatus() {
  return completedCount >= stages.length ? 'finalizado' : 'em aberto';
}

function stageVisualState(step) {
  if (step <= completedCount) return 'done';
  if (step === completedCount + 1 && completedCount < stages.length) return 'available';
  return 'locked';
}

function renderDashboard() {
  document.querySelector('#unitTitle').textContent = currentRefLabel;
  processStatus.textContent = getTopStatus();
  progressText.textContent = `${completedCount}/${stages.length}`;
  stageList.innerHTML = '';

  stages.forEach((stage, index) => {
    const step = index + 1;
    const state = stageVisualState(step);

    const btn = document.createElement('button');
    btn.className = `stage-row ${state}`;
    btn.disabled = state === 'locked';
    btn.innerHTML = `
      <span class="num">${String(step).padStart(2, '0')}</span>
      <span class="name">${stage.name}</span>
      <span class="state">${state === 'done' ? 'concluída' : state === 'available' ? 'disponível' : 'bloqueada'}</span>
      <span class="arrow">›</span>
    `;
    btn.addEventListener('click', () => openStage(index));
    stageList.appendChild(btn);
  });
}

function penaltyKey(suffix) {
  return `identification:v2:${suffix}:${currentRefKey}`;
}

function getPenaltyState() {
  return {
    errors: Number(localStorage.getItem(penaltyKey('errors'))) || 0,
    until: Number(localStorage.getItem(penaltyKey('until'))) || 0
  };
}

function clearPenalty() {
  localStorage.removeItem(penaltyKey('errors'));
  localStorage.removeItem(penaltyKey('until'));
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function romanHintNumber(index) {
  return ['I', 'II', 'III', 'IV'][index] || 'AJUDA FINAL';
}

function renderHint(hintBox, errors) {
  if (!errors) {
    hintBox.innerHTML = '';
    hintBox.hidden = true;
    return;
  }

  const hintIndex = Math.min(errors - 1, IDENTIFICATION_HINTS.length - 1);
  const isFinal = hintIndex === IDENTIFICATION_HINTS.length - 1;
  const label = isFinal ? 'AJUDA FINAL' : `DICA ${romanHintNumber(hintIndex)} DESBLOQUEADA`;

  hintBox.hidden = false;
  hintBox.innerHTML = `
    <span class="hint-label">${label}</span>
    <p>${IDENTIFICATION_HINTS[hintIndex]}</p>
  `;
}

function renderIdentificationForm(actions) {
  actions.innerHTML = `
    <form id="identificationForm" class="validation-form" autocomplete="off">
      <label for="validationCode" class="validation-label">CÓDIGO DE VALIDAÇÃO</label>
      <input
        id="validationCode"
        class="validation-code"
        type="text"
        inputmode="numeric"
        pattern="[0-9]{3}"
        maxlength="3"
        placeholder="_ _ _"
        aria-describedby="validationMessage identificationHint"
        required
      />
      <p class="validation-quote">${stages[0].mission}</p>
      <button id="validationBtn" type="submit" class="primary-btn">VALIDAR</button>
      <p id="validationMessage" class="validation-message" role="status"></p>
      <div id="identificationHint" class="identification-hint" hidden></div>
    </form>
  `;

  const form = document.querySelector('#identificationForm');
  const input = document.querySelector('#validationCode');
  const button = document.querySelector('#validationBtn');
  const message = document.querySelector('#validationMessage');
  const hintBox = document.querySelector('#identificationHint');

  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 3);
  });

  function applyCooldown() {
    if (cooldownTimer) clearInterval(cooldownTimer);

    const update = () => {
      const { until, errors } = getPenaltyState();
      const remaining = until - Date.now();
      renderHint(hintBox, errors);

      if (remaining <= 0) {
        input.disabled = false;
        button.disabled = false;
        message.textContent = '';
        clearInterval(cooldownTimer);
        cooldownTimer = null;
        return;
      }

      input.disabled = true;
      button.disabled = true;
      message.innerHTML = `VALIDAÇÃO NEGADA<br>Nova tentativa disponível em <strong>${formatCountdown(remaining)}</strong>.`;
    };

    update();
    cooldownTimer = setInterval(update, 1000);
  }

  const initialPenalty = getPenaltyState();
  renderHint(hintBox, initialPenalty.errors);
  if (initialPenalty.until > Date.now()) applyCooldown();

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const { until, errors } = getPenaltyState();
    if (until > Date.now()) {
      applyCooldown();
      return;
    }

    if (input.value === IDENTIFICATION_CODE) {
      clearPenalty();
      completedCount = Math.max(completedCount, 1);
      saveProgress(currentRefKey, completedCount);
      message.textContent = 'IDENTIFICAÇÃO CONFIRMADA.';
      hintBox.hidden = true;
      input.disabled = true;
      button.disabled = true;

      setTimeout(() => {
        renderDashboard();
        show(dashboardView);
      }, 900);
      return;
    }

    const newErrors = errors + 1;
    const rawMinutes = 2 ** (newErrors - 1);
    const waitMinutes = Math.min(rawMinutes, MAX_COOLDOWN_MINUTES);
    const blockedUntil = Date.now() + waitMinutes * 60 * 1000;

    localStorage.setItem(penaltyKey('errors'), String(newErrors));
    localStorage.setItem(penaltyKey('until'), String(blockedUntil));
    input.value = '';
    renderHint(hintBox, newErrors);
    applyCooldown();
  });
}

function openStage(index) {
  const step = index + 1;
  const stage = stages[index];
  const state = stageVisualState(step);

  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }

  document.querySelector('#stageCode').textContent = `ETAPA ${String(step).padStart(2, '0')}`;
  document.querySelector('#stageName').textContent = stage.name;
  document.querySelector('#stageContext').textContent = stage.context;

  const stageMission = document.querySelector('#stageMission');
  stageMission.hidden = step === 1;
  stageMission.textContent = step === 1 ? '' : stage.mission;

  stageStatus.textContent = state === 'done' ? 'concluída' : state === 'available' ? 'disponível' : 'bloqueada';

  const actions = document.querySelector('#stageActions');
  actions.innerHTML = '';

  if (step === 1 && state === 'available') {
    renderIdentificationForm(actions);
    show(stageView);
    return;
  }

  if (state === 'available' && step < stages.length) {
    const complete = document.createElement('button');
    complete.className = 'primary-btn';
    complete.textContent = 'Simular conclusão';
    complete.addEventListener('click', () => {
      completedCount = Math.min(stages.length, completedCount + 1);
      saveProgress(currentRefKey, completedCount);
      renderDashboard();
      show(dashboardView);
    });
    actions.appendChild(complete);
  }

  if (state === 'available' && step === stages.length) {
    const complete = document.createElement('button');
    complete.className = 'primary-btn';
    complete.textContent = 'Simular admissão';
    complete.addEventListener('click', () => {
      completedCount = stages.length;
      saveProgress(currentRefKey, completedCount);
      renderDashboard();
      document.querySelector('#stageContext').textContent = 'PROCESSO CONCLUÍDO.';
      stageMission.hidden = false;
      stageMission.textContent = 'Nesta versão-base, o próximo passo será o encaminhamento para o futuro ambiente permanente.';
      stageStatus.textContent = 'finalizado';
      actions.innerHTML = '<p class="demo-note">A versão definitiva poderá gerar uma credencial de admissão e liberar o segundo site.</p>';
    });
    actions.appendChild(complete);
  }

  if (step > 1) {
    const note = document.createElement('p');
    note.className = 'demo-note';
    note.textContent = 'Conteúdo provisório para validar navegação, estética e experiência no celular.';
    actions.appendChild(note);
  }

  show(stageView);
}

function openPrintDialog() {
  printDialog.hidden = false;
  document.body.style.overflow = 'hidden';
  closePrintDialog.focus();
}

function closePrintModal() {
  printDialog.hidden = true;
  document.body.style.overflow = '';
  importantInfoBtn.focus();
}

importantInfoBtn.addEventListener('click', openPrintDialog);
closePrintDialog.addEventListener('click', closePrintModal);
printDialog.addEventListener('click', (event) => {
  if (event.target === printDialog) closePrintModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !printDialog.hidden) closePrintModal();
});

document.querySelector('#accessForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const refKey = normalizeRef(referenceInput.value);
  if (!REFERENCES[refKey]) {
    loginMessage.textContent = 'Referência não localizada.';
    return;
  }

  currentRefKey = refKey;
  currentRefLabel = REFERENCES[refKey];
  completedCount = loadProgress(refKey);
  loginMessage.textContent = '';
  renderDashboard();
  show(dashboardView);
});

document.querySelector('#logoutBtn').addEventListener('click', () => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
  currentRefKey = null;
  currentRefLabel = null;
  referenceInput.value = '';
  show(loginView);
});

document.querySelector('#backBtn').addEventListener('click', () => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
  renderDashboard();
  show(dashboardView);
});
