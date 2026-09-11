const stages = [
  { name: 'IDENTIFICAÇÃO', context: 'A referência informada foi validada. O acesso a este processo está autorizado.', mission: 'Nenhuma ação adicional é necessária nesta etapa.' },
  { name: 'APTIDÃO', context: 'Antes de prosseguir, precisamos verificar se vocês conseguem trabalhar com informações incompletas.', mission: 'MODELO DE CONTEÚDO: aqui entra o primeiro enigma real. Nesta base, use o botão abaixo apenas para simular a conclusão.' },
  { name: 'OBSERVAÇÃO', context: 'Nem toda informação relevante é apresentada de forma explícita.', mission: 'MODELO DE CONTEÚDO: esta etapa poderá usar imagem, vídeo, mapa ou outro registro externo.' },
  { name: 'JULGAMENTO', context: 'Informações conflitantes exigem uma decisão antes que o processo possa continuar.', mission: 'MODELO DE CONTEÚDO: aqui poderá existir uma escolha sem resposta objetivamente certa.' },
  { name: 'INICIATIVA', context: 'Instruções completas nem sempre estarão disponíveis.', mission: 'MODELO DE CONTEÚDO: esta etapa deverá exigir que vocês encontrem o próximo passo sem um comando explícito.' },
  { name: 'CONFIANÇA', context: 'O acesso seguinte envolve material restrito.', mission: 'MODELO DE CONTEÚDO: etapa final antes da admissão.' },
  { name: 'ADMISSÃO', context: 'O processo de seleção foi concluído.', mission: 'MODELO DE CONTEÚDO: aqui ocorrerá a revelação e o encaminhamento para o futuro ambiente permanente.' }
];

const VALID_REFS = ['76-01','76-02','76-03','76-04','76-05','76-06','76-07','76-08','76-09'];
const loginView = document.querySelector('#loginView');
const dashboardView = document.querySelector('#dashboardView');
const stageView = document.querySelector('#stageView');
const loginMessage = document.querySelector('#loginMessage');
const referenceInput = document.querySelector('#reference');
const stageList = document.querySelector('#stageList');
const progressText = document.querySelector('#progressText');

let currentRef = null;
let progress = 1;

function show(view) {
  [loginView, dashboardView, stageView].forEach(v => v.classList.remove('active'));
  view.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function normalizeRef(value) {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

function loadProgress(ref) {
  // MOCK LOCAL: depois isso será substituído por leitura do backend compartilhado.
  const stored = Number(localStorage.getItem(`progress:${ref}`));
  return Number.isInteger(stored) && stored >= 1 && stored <= stages.length ? stored : 1;
}

function saveProgress(ref, value) {
  // MOCK LOCAL: depois isso será substituído por gravação no backend compartilhado.
  localStorage.setItem(`progress:${ref}`, String(value));
}

function renderDashboard() {
  document.querySelector('#unitTitle').textContent = currentRef;
  progressText.textContent = `${progress}/${stages.length}`;
  const cells = 22;
  const filled = Math.round((progress / stages.length) * cells);
  document.querySelector('#progressCells').textContent = '#'.repeat(filled) + '.'.repeat(cells - filled);
  stageList.innerHTML = '';

  stages.forEach((stage, index) => {
    const step = index + 1;
    const isDone = step < progress || (step === 1 && progress >= 1);
    const isAvailable = step === progress && step !== 1;
    const isLocked = step > progress;

    const btn = document.createElement('button');
    btn.className = `stage-row ${isDone ? 'done' : ''} ${isAvailable ? 'available' : ''} ${isLocked ? 'locked' : ''}`;
    btn.disabled = isLocked;
    btn.innerHTML = `
      <span class="num">${String(step).padStart(2, '0')}</span>
      <span class="name">${stage.name}</span>
      <span class="state">${isDone ? 'CONCLUÍDO' : isAvailable ? 'DISPONÍVEL' : 'BLOQUEADO'}</span>
    `;
    btn.addEventListener('click', () => openStage(index));
    stageList.appendChild(btn);
  });
}

function openStage(index) {
  const stage = stages[index];
  document.querySelector('#stageCode').textContent = `ETAPA ${String(index + 1).padStart(2, '0')}`;
  document.querySelector('#stageName').textContent = stage.name;
  document.querySelector('#stageContext').textContent = stage.context;
  document.querySelector('#stageMission').textContent = stage.mission;

  const actions = document.querySelector('#stageActions');
  actions.innerHTML = '';

  const step = index + 1;
  if (step === progress && step > 1 && step < stages.length) {
    const complete = document.createElement('button');
    complete.className = 'dos-action demo-action';
    complete.textContent = 'SIMULAR CONCLUSÃO DA ETAPA';
    complete.addEventListener('click', () => {
      progress += 1;
      saveProgress(currentRef, progress);
      renderDashboard();
      show(dashboardView);
    });
    actions.appendChild(complete);
  }

  if (step === stages.length && step === progress) {
    const complete = document.createElement('button');
    complete.className = 'dos-action demo-action';
    complete.textContent = 'SIMULAR ADMISSÃO';
    complete.addEventListener('click', () => {
      document.querySelector('#stageContext').textContent = 'PROCESSO CONCLUÍDO // STATUS: ADMITIDO';
      document.querySelector('#stageMission').textContent = 'Nesta versão-base, o próximo passo será o encaminhamento para o futuro ambiente permanente.';
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
  const ref = normalizeRef(referenceInput.value);
  if (!VALID_REFS.includes(ref)) {
    loginMessage.textContent = 'REFERÊNCIA NÃO LOCALIZADA.';
    return;
  }
  currentRef = ref;
  progress = loadProgress(ref);
  loginMessage.textContent = '';
  renderDashboard();
  show(dashboardView);
});

document.querySelector('#logoutBtn').addEventListener('click', () => {
  currentRef = null;
  referenceInput.value = '';
  show(loginView);
});

document.querySelector('#backBtn').addEventListener('click', () => {
  renderDashboard();
  show(dashboardView);
});
