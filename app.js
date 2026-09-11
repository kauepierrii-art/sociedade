const stages = [
  {
    name: 'Identificação',
    context: 'A referência informada foi validada. A presença de vocês neste protocolo foi confirmada.',
    mission: 'Nenhuma ação adicional é necessária nesta etapa. A identificação foi concluída com sucesso.'
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

const loginView = document.querySelector('#loginView');
const dashboardView = document.querySelector('#dashboardView');
const stageView = document.querySelector('#stageView');
const loginMessage = document.querySelector('#loginMessage');
const referenceInput = document.querySelector('#reference');
const stageList = document.querySelector('#stageList');
const progressText = document.querySelector('#progressText');
const processStatus = document.querySelector('#processStatus');
const stageStatus = document.querySelector('#stageStatus');

let currentRefKey = null;
let currentRefLabel = null;
let completedCount = 1;

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
  return Number.isInteger(stored) && stored >= 1 && stored <= stages.length ? stored : 1;
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

function openStage(index) {
  const step = index + 1;
  const stage = stages[index];
  const state = stageVisualState(step);

  document.querySelector('#stageCode').textContent = `ETAPA ${String(step).padStart(2, '0')}`;
  document.querySelector('#stageName').textContent = stage.name;
  document.querySelector('#stageContext').textContent = stage.context;
  document.querySelector('#stageMission').textContent = stage.mission;
  stageStatus.textContent = state === 'done' ? 'concluída' : state === 'available' ? 'disponível' : 'bloqueada';

  const actions = document.querySelector('#stageActions');
  actions.innerHTML = '';

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
      document.querySelector('#stageMission').textContent = 'Nesta versão-base, o próximo passo será o encaminhamento para o futuro ambiente permanente.';
      stageStatus.textContent = 'finalizado';
      actions.innerHTML = '<p class="demo-note">A versão definitiva poderá gerar uma credencial de admissão e liberar o segundo site.</p>';
    });
    actions.appendChild(complete);
  }

  const note = document.createElement('p');
  note.className = 'demo-note';
  note.textContent = 'Conteúdo provisório para validar navegação, estética e experiência no celular.';
  actions.appendChild(note);

  show(stageView);
}

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
  currentRefKey = null;
  currentRefLabel = null;
  referenceInput.value = '';
  show(loginView);
});

document.querySelector('#backBtn').addEventListener('click', () => {
  renderDashboard();
  show(dashboardView);
});
