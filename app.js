const stages = [
  {
    name: 'Identificação',
    short: 'Confirmem quem vocês são.',
    context: 'A referência informada foi validada. A presença de vocês neste protocolo foi confirmada.',
    mission: 'Nenhuma ação adicional é necessária nesta etapa. A identificação já foi concluída com sucesso.'
  },
  {
    name: 'Aptidão',
    short: 'Avaliem seus conhecimentos.',
    context: 'Antes de prosseguir, precisamos verificar se vocês conseguem interpretar informações incompletas e resolver um primeiro problema.',
    mission: 'MODELO DE CONTEÚDO: aqui entrará o primeiro enigma real. Nesta base, usem o botão abaixo apenas para simular a conclusão da etapa.'
  },
  {
    name: 'Observação',
    short: 'Aguardem instruções.',
    context: 'Nem toda informação relevante é apresentada de forma explícita. Esta etapa avaliará atenção, padrão e detalhe.',
    mission: 'MODELO DE CONTEÚDO: esta etapa poderá usar imagem, vídeo, mapa ou outro registro externo.'
  },
  {
    name: 'Julgamento',
    short: 'Confrontem versões.',
    context: 'Informações conflitantes exigirão uma decisão antes que o processo possa continuar.',
    mission: 'MODELO DE CONTEÚDO: aqui poderá existir uma escolha sem resposta objetivamente certa.'
  },
  {
    name: 'Iniciativa',
    short: 'Descubram o próximo passo.',
    context: 'Instruções completas nem sempre estarão disponíveis. Vocês deverão avançar por iniciativa própria.',
    mission: 'MODELO DE CONTEÚDO: esta etapa deverá exigir que vocês encontrem o próximo passo sem um comando explícito.'
  },
  {
    name: 'Confiança',
    short: 'Acesso condicionado.',
    context: 'O acesso seguinte envolve material restrito e exige que o processo já tenha sido compreendido.',
    mission: 'MODELO DE CONTEÚDO: etapa final antes da admissão.'
  },
  {
    name: 'Admissão',
    short: 'Conclusão do protocolo.',
    context: 'O processo de seleção foi concluído. A continuidade dependerá do resultado desta etapa.',
    mission: 'MODELO DE CONTEÚDO: aqui ocorrerá a revelação e o encaminhamento para o futuro ambiente permanente.'
  }
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function normalizeRef(value) {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

function loadProgress(ref) {
  const stored = Number(localStorage.getItem(`progress:${ref}`));
  return Number.isInteger(stored) && stored >= 1 && stored <= stages.length ? stored : 2;
}

function saveProgress(ref, value) {
  localStorage.setItem(`progress:${ref}`, String(value));
}

function renderDashboard() {
  document.querySelector('#unitTitle').textContent = currentRef;
  progressText.textContent = `${Math.min(progress, stages.length)} / ${stages.length}`;
  stageList.innerHTML = '';

  stages.forEach((stage, index) => {
    const step = index + 1;
    const isDone = step < progress || (step === 1 && progress >= 2);
    const isAvailable = step === progress;
    const isLocked = step > progress;

    const btn = document.createElement('button');
    btn.className = `stage-row ${isDone ? 'done' : ''} ${isAvailable ? 'available' : ''} ${isLocked ? 'locked' : ''}`;
    btn.disabled = isLocked;
    btn.innerHTML = `
      <span class="num">${String(step).padStart(2, '0')}</span>
      <span class="copy">
        <span class="name">${stage.name}</span>
        <span class="desc">${stage.short}</span>
      </span>
      <span class="state">${isDone ? 'concluída' : isAvailable ? 'disponível' : 'bloqueada'}</span>
      <span class="arrow">›</span>
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
  if (step === progress && step < stages.length) {
    const complete = document.createElement('button');
    complete.className = 'primary-btn';
    complete.textContent = step === 1 ? 'Prosseguir' : 'Simular conclusão';
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
    complete.className = 'primary-btn';
    complete.textContent = 'Simular admissão';
    complete.addEventListener('click', () => {
      document.querySelector('#stageContext').textContent = 'PROCESSO CONCLUÍDO // STATUS: ADMITIDO';
      document.querySelector('#stageMission').textContent = 'Nesta versão-base, o próximo passo será o encaminhamento para o futuro ambiente permanente da Sociedade.';
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
    loginMessage.textContent = 'Referência não localizada.';
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
