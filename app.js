const stages = [
  {
    name: 'Identificação',
    subtitle: 'avaliação preliminar',
    icon: '♙',
    context: 'Antes que qualquer material de investigação seja disponibilizado, é necessário concluir uma avaliação preliminar.\n\nA caixa diante de você contém o primeiro conjunto reservado ao participante.',
    mission: ''
  },
  {
    name: 'Origem',
    subtitle: 'Registro histórico',
    icon: '⌘',
    context: 'Nem toda divergência é relevante.\n\nAlgumas, no entanto, justificam uma segunda análise.\n\nOs documentos disponibilizados pertencem ao mesmo conjunto e foram preservados por razões que serão esclarecidas posteriormente.',
    mission: ''
  },
  { name: 'Observação', subtitle: 'Material não catalogado', icon: '◉', context: 'Nem toda informação relevante é apresentada de forma explícita. Esta etapa avaliará atenção, padrão e detalhe.', mission: 'Conteúdo em desenvolvimento.' },
  { name: 'Iniciativa', subtitle: 'Material incompleto', icon: '◌', context: 'Instruções completas nem sempre estarão disponíveis. Vocês deverão avançar por iniciativa própria.', mission: 'Conteúdo em desenvolvimento.' },
  {
    name: 'Rastreamento',
    subtitle: 'Identificação e custódia',
    icon: '⚖',
    panelTitle: 'CORRELAÇÃO DOCUMENTAL',
    context: '',
    mission: ''
  },
  { name: 'Discernimento', subtitle: 'Análise de inconsistências', icon: '◇', context: 'O acesso seguinte envolve material restrito e exige que o processo já tenha sido compreendido.', mission: 'Conteúdo em desenvolvimento.' },
  { name: 'Admissão', subtitle: 'Resultado do protocolo', icon: '⚿', context: 'O processo de seleção foi concluído. A continuidade dependerá do resultado desta etapa.', mission: 'Conteúdo em desenvolvimento.' }
];

const PANEL_TITLES = [
  'CAIXA DE SELEÇÃO',
  'OBJETO EM ANÁLISE',
  'REGISTRO FOTOGRÁFICO',
  'APARELHO INCOMUM',
  'CORRELAÇÃO DOCUMENTAL',
  'ARQUIVO DE INVESTIGAÇÃO',
  'COMUNICAÇÃO FINAL'
];

const loginView = document.querySelector('#loginView');
const maintenanceView = document.querySelector('#maintenanceView');
const dashboardView = document.querySelector('#dashboardView');
const stageView = document.querySelector('#stageView');
const MAINTENANCE_SESSION_KEY = 'delectus:maintenance-notice:v1';

/* Referência de acesso: aceitar somente letras.
   Espaços, números e símbolos não chegam a permanecer no campo. */
function sanitizeReferenceInput(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z]/g, '');
}

const stageList = document.querySelector('#stageList');
const processStatus = document.querySelector('#processStatus');
const stageStatus = document.querySelector('#stageStatus');
const importantInfoBtn = document.querySelector('#importantInfoBtn');
const printDialog = document.querySelector('#printDialog');
const closePrintDialog = document.querySelector('#closePrintDialog');
const continueBtn = document.querySelector('#continueBtn');
const restartActivitiesBtn = document.querySelector('#restartActivitiesBtn');

let currentRefKey = null;
let currentRefLabel = null;
let completedCount = 0;
let cooldownTimer = null;

// Cada etapa usa uma única entrada de histórico. O botão Voltar do celular
// retorna ao painel do protocolo, sem percorrer as etapas visitadas.
function show(view) {
  const leavingStage = stageView.classList.contains('active') && view !== stageView;
  const enteringStage = view === stageView && !stageView.classList.contains('active');
  if (enteringStage && currentRefKey) {
    // Manter a URL original e o link oculto inalterados.
    if (!history.state || history.state.delectusScreen !== 'stage') {
      history.pushState({ delectusScreen: 'stage', ref: currentRefKey }, '', location.href);
    }
  } else if (leavingStage && history.state && history.state.delectusScreen === 'stage') {
    // A saída interna não deve navegar para a entrada anterior do navegador:
    // ela pode ser a tela de referência. Mantemos a mesma entrada e a marcamos
    // como painel; o Voltar físico continua sendo tratado por popstate.
    history.replaceState({ delectusScreen: 'dashboard', ref: currentRefKey }, '', location.href);
  }
  if (leavingStage) {
    window.dispatchEvent(new Event('delectus:leaving-stage'));
    const supportVideo = document.querySelector('#stage4SupportVideo');
    if (supportVideo) {
      const video = supportVideo.querySelector('video');
      if (video) video.pause();
      supportVideo.hidden = true;
    }
    const recovery = document.querySelector('#stage4RecoverySequence');
    if (recovery) recovery.hidden = true;
  }
  [maintenanceView, loginView, dashboardView, stageView].forEach(v => v.classList.remove('active'));
  view.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// O convite anônimo é a entrada principal; não depende do aviso antigo.
document.querySelector('#maintenanceContinueBtn').addEventListener('click', () => {
  sessionStorage.setItem(MAINTENANCE_SESSION_KEY, '1');
  show(loginView);
});

// Voltar físico/gesto de navegação: sair de qualquer etapa diretamente para
// a lista do protocolo. Quando já estiver no painel, o navegador age normalmente.
window.addEventListener('popstate', () => {
  if (!currentRefKey) return;
  if (stageView.classList.contains('active')) {
    if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
    renderDashboard();
    show(dashboardView);
    return;
  }
  // O arquivo especial pode estar aberto dentro do próprio painel.
  if (dashboardView.classList.contains('active')) {
    const archiveBack = document.querySelector('#dashboardView .dashboard-card.is-stage6-archive .stage6-top-back');
    if (archiveBack) archiveBack.click();
  }
});

function normalizeRef(value) { return sanitizeReferenceInput(value); }
function normalizeAnswer(value) { return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function loadProgress(refKey) {
  const stored = Number(localStorage.getItem(`progress:${refKey}`));
  return Number.isInteger(stored) && stored >= 0 && stored <= stages.length ? stored : 0;
}
function saveProgress(refKey, value) { localStorage.setItem(`progress:${refKey}`, String(value)); }
function resetActivities() {
  if (!currentRefKey) return;
  localStorage.removeItem(`progress:${currentRefKey}`);
  localStorage.removeItem(`important-info-seen:${currentRefKey}`);
  localStorage.removeItem(`stage1:box-open:${currentRefKey}`);
  localStorage.removeItem(`stage5:part-one:${currentRefKey}`);
  localStorage.removeItem(`stage5:complete:${currentRefKey}`);
  localStorage.removeItem(`stage4:tuner-solved:${currentRefKey}`);
  ['visited', 'document', 'remaining', 'annotations', 'research', 'activated'].forEach(name => localStorage.removeItem(`stage6:${name}:${currentRefKey}`));
  ['visited', 'remaining', 'stabilized', 'videoWatched', 'savedCorrespondences', 'additionalNotesElapsed', 'additionalNotesRequested', 'additionalNotesNextAt'].forEach(name => localStorage.removeItem(`stage6:v2:${name}:${currentRefKey}`));
  localStorage.removeItem(`stage7:admission:${currentRefKey}`);
  ['stage4', 'stage5'].forEach(name => ['unlocked', 'nextAt'].forEach(part => localStorage.removeItem(`stage45-hints:${name}:${part}:${currentRefKey}`)));
  completedCount = 0;
}
function infoKey() { return `important-info-seen:${currentRefKey}`; }
function hasSeenImportantInfo() { return currentRefKey ? localStorage.getItem(infoKey()) === '1' : false; }
function markImportantInfoSeen() { if (currentRefKey) localStorage.setItem(infoKey(), '1'); }
function getTopStatus() { return completedCount >= stages.length ? 'finalizado' : 'em aberto'; }

function stageVisualState(step) {
  if (step === 1 && completedCount === 0 && !hasSeenImportantInfo()) return 'info-required';
  if (step <= completedCount) return 'done';
  if (step === completedCount + 1 && completedCount < stages.length) return 'available';
  return 'locked';
}

function renderDashboard() {
  document.querySelector('#unitTitle').textContent = currentRefLabel;
  processStatus.textContent = getTopStatus();
  importantInfoBtn.classList.toggle('seen', hasSeenImportantInfo());
  stageList.innerHTML = '';

  stages.forEach((stage, index) => {
    const step = index + 1;
    const state = stageVisualState(step);
    const btn = document.createElement('button');
    btn.className = `stage-row ${state}`;
    btn.type = 'button';
    btn.disabled = state === 'locked' || state === 'info-required';

    let badge = '';
    if (state === 'done') badge = '<span class="stage-badge">concluída</span>';
    if (state === 'available') badge = '<span class="stage-badge">disponível</span>';
    if (state === 'info-required') badge = '<span class="stage-badge">informações importantes</span>';
    if (state === 'locked') badge = '<span class="stage-badge" aria-label="bloqueada">♙</span>';

    let subtitle = stage.subtitle;
    if (state === 'info-required') subtitle = 'leia as informações antes de prosseguir';

    btn.innerHTML = `
      <span class="stage-icon" aria-hidden="true">${stage.icon}</span>
      <span class="stage-main">
        <span class="stage-title">${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][index]} — ${stage.name}</span>
        <span class="stage-subtitle">${subtitle}</span>
      </span>
      ${badge}
    `;
    if (!btn.disabled) btn.addEventListener('click', () => openStage(index));
    stageList.appendChild(btn);
  });

  const nextIndex = completedCount < stages.length ? completedCount : -1;
  const nextState = nextIndex >= 0 ? stageVisualState(nextIndex + 1) : 'locked';
  continueBtn.disabled = nextIndex < 0 || nextState !== 'available';
  continueBtn.onclick = continueBtn.disabled ? null : () => openStage(nextIndex);
  restartActivitiesBtn.hidden = false;
}

// Conteúdo provisório da Etapa 1; substituir este renderizador pelo puzzle definitivo.
function renderSelectionBox(actions) {
  const stateKey = `stage1:box-open:${currentRefKey}`;
  let opened = completedCount >= 1 || localStorage.getItem(stateKey) === 'open';
  actions.innerHTML = `
    <div id="selectionBoxArea" class="print-file-placeholder" aria-label="Caixa de seleção">
      <div><strong id="selectionBoxState"></strong><small id="selectionBoxPlaceholder">imagem ainda não disponibilizada</small></div>
    </div>
    <section class="answer-panel">
      <p><strong>MODO DE AVALIAÇÃO</strong></p>
      <p>Durante este período de avaliação do Protocolo, o mecanismo de seleção inicial encontra-se desativado.</p>
      <p>O conteúdo da caixa foi liberado para este acesso.</p>
      <button id="openSelectionBox" class="primary-btn" type="button">ABRIR CAIXA</button>
      <p id="selectionBoxMessage" class="answer-message" role="status"></p>
      <button id="continueSelectionBox" class="primary-btn" type="button" hidden>CONTINUAR</button>
    </section>`;
  const area = actions.querySelector('#selectionBoxArea');
  const label = actions.querySelector('#selectionBoxState');
  const openButton = actions.querySelector('#openSelectionBox');
  const nextButton = actions.querySelector('#continueSelectionBox');
  const message = actions.querySelector('#selectionBoxMessage');
  function renderState() {
    area.dataset.state = opened ? 'open' : 'closed';
    label.textContent = opened ? 'CAIXA ABERTA' : 'CAIXA DE SELEÇÃO';
    openButton.disabled = opened;
    message.style.color = 'var(--green)';
    message.textContent = opened ? 'ACESSO AUTORIZADO — MATERIAL DE INVESTIGAÇÃO LIBERADO.' : '';
    nextButton.hidden = !opened;
  }
  openButton.addEventListener('click', () => {
    localStorage.setItem(stateKey, 'open');
    opened = true;
    renderState();
  });
  nextButton.addEventListener('click', () => {
    if (!opened) return;
    completedCount = Math.max(completedCount, 1);
    saveProgress(currentRefKey, completedCount);
    renderDashboard();
    openStage(1);
  });
  renderState();
  // O asset é opcional. Um HEAD evita requisitar uma imagem ausente no DOM.
  const selectionBoxImageAvailable = false; // Habilitar quando o asset for fornecido.
  if (!selectionBoxImageAvailable) return;
  fetch('assets/stage1/caixa-selecao.webp', {method:'HEAD'}).then(response => {
    if (!response.ok || !area.isConnected) return;
    const media = document.createElement('span');
    media.className = 'initiative-thumb-media';
    const image = document.createElement('img');
    image.alt = 'Caixa de seleção';
    image.addEventListener('load', () => {
      if (!area.isConnected) return;
      area.prepend(media);
      actions.querySelector('#selectionBoxPlaceholder').hidden = true;
    }, {once:true});
    media.append(image);
    image.src = 'assets/stage1/caixa-selecao.webp';
  }).catch(() => {});
}

function toggleMarkup(label, body, className = 'record') {
  return `<div class="${className}-item">
    <button class="${className}-toggle" type="button" aria-expanded="false"><span>${label}</span><span class="chev">＋</span></button>
    <div class="${className}-content" hidden>${body}</div>
  </div>`;
}

function registerAccordions(root) {
  root.querySelectorAll('.record-toggle, .attachment-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const content = button.nextElementSibling;
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      button.querySelector('.chev').textContent = open ? '＋' : '−';
      content.hidden = open;
    });
  });
}

function renderStageTwo(actions) {
  const record1 = `
    <h3>JOHN DEE</h3>
    <figure class="stage-two-image"><img src="assets/stage2/john-dee.webp" alt="John Dee"></figure>
    <p>John Dee (1527–1608/1609) foi um matemático, astrônomo e estudioso inglês ligado à corte da rainha Elizabeth I. Além de seus trabalhos científicos, dedicou parte de sua vida à busca de conhecimentos que acreditava estarem além dos sentidos humanos.</p>
    <p>Dee acreditava que seria possível estabelecer contato com inteligências espirituais e, por meio delas, obter informações sobre acontecimentos distantes, questões desconhecidas e eventos que ainda não haviam ocorrido.</p>
    <p>Para isso, realizou experiências com superfícies reflexivas, utilizadas como instrumentos de contemplação e comunicação espiritual.</p>
    <h3>O ESPELHO NEGRO</h3>
    <figure class="stage-two-image"><img src="assets/stage2/objetos-john-dee.webp" alt="Espelho negro e objetos associados a John Dee"></figure>
    <p>Entre os objetos tradicionalmente associados a essas experiências encontra-se um espelho circular de obsidiana negra, uma pedra vulcânica que, quando polida, produz uma superfície escura e reflexiva.</p>
    <p>Dee utilizava esse tipo de objeto em suas tentativas de obter visões e respostas que acreditava não serem acessíveis por meios convencionais.</p>
    <p>A possibilidade de alcançar informações desconhecidas despertava interesse, mas também levantava uma questão:</p>
    <blockquote><strong>que consequências poderia ter o uso de um instrumento capaz de revelar aquilo que deveria permanecer oculto?</strong></blockquote>
    <p>O espelho associado a John Dee foi preservado ao longo dos séculos e atualmente integra o acervo do British Museum.</p>`;

  const record2 = `
    <p>Após a morte de John Dee, em 1608 ou 1609, seus livros e objetos passaram para outras mãos.</p>
    <p>Em <strong>1624</strong>, um depoimento judicial mencionou uma pedra escura e circular que teria pertencido ao estudioso.</p>
    <p>Posteriormente, o objeto foi associado à coleção dos Condes de Peterborough e, por volta de <strong>1770</strong>, ao antiquário Horace Walpole.</p>
    <p>Em <strong>1966</strong>, o espelho entrou para o acervo do British Museum.</p>
    <p>Estudos modernos associaram a obsidiana utilizada em sua fabricação à região de Pachuca, no México. Sua origem material, porém, não resolve todas as lacunas da trajetória da peça.</p>
    <blockquote><strong>A questão permanece: é possível demonstrar que o objeto preservado atualmente é exatamente o mesmo que esteve nas mãos de John Dee?</strong></blockquote>
    <p>No final do século XIX, novos registros passaram a justificar uma revisão dessa continuidade.</p>`;

  const annexA = `
    <div class="doc-meta">Origem documental: Arquivo comercial privado<br>Procedência: verificada<br>Data: 14 de março de 1897</div>
    <h4>J. H. WHITMORE & SONS</h4><p><em>Conservação de Objetos Finos e Mobiliário</em></p>
    <p><strong>Cliente:</strong> Família Wetherby</p><p><strong>OBJETOS RECEBIDOS</strong></p><ul class="doc-list"><li>Espelho Negro</li><li>Case</li><li>Discos de cera</li><li>Disco metálico</li></ul>
    <h4>SERVIÇO SOLICITADO</h4><ul class="doc-list"><li>reforço da dobradiça superior;</li><li>reparo do mecanismo de fechamento;</li><li>estabilização das bordas de couro desgastadas;</li><li>substituição parcial do revestimento interno desprendido;</li><li>limpeza do couro externo sem tratamento do objeto contido.</li></ul>
    <h4>DIMENSÕES</h4><p><strong>Diâmetro:</strong> 20 centímetros <em>(case)</em><br><strong>Comprimento:</strong> 24 centímetros <em>(case)</em><br><strong>Largura:</strong> 2,60 centímetros <em>(case)</em></p>
    <p><strong>MATERIAIS OBSERVADOS</strong><br>Estrutura de madeira revestida em couro.</p>
    <p><strong>INSTRUÇÃO DO PROPRIETÁRIO</strong><br>O encaixe interno original não deverá ser alterado. Os materiais existentes deverão ser mantidos sempre que possível.<br>Não deverá ser produzido um novo estojo.</p><p><strong>Prazo estimado:</strong> 18 dias úteis.</p><p><strong>Não polir a pedra.</strong></p>`;

  const annexB = `
    <div class="doc-meta">Origem documental: Arquivo comercial da transportadora<br>Procedência: verificada<br>Ano: 1911</div>
    <p>O objeto examinado foi identificado como o espelho negro tradicionalmente associado ao Dr. John Dee.</p>
    <p>As características da superfície, as dimensões da peça e as marcas de montagem correspondem às descrições preservadas do espelho em registros anteriores. As evidências observadas foram consideradas suficientes para sustentar essa identificação.</p>
    <p>A inspeção, entretanto, foi conduzida de maneira reservada e não integrou os registros oficiais sobre a peça.</p>
    <p>Recomenda-se uma comparação complementar das características físicas do objeto, especialmente o desgaste das bordas, as marcas posteriores de fixação e suas dimensões.</p>
    <p>Até que essa comparação seja concluída, o relatório deverá permanecer restrito ao arquivo da transportadora.</p>`;

  const annexC = `
    <div class="doc-meta">Origem documental: Arquivo familiar Harrington<br>Procedência: verificada<br>Data: 27 de maio de 1923</div>
    <p>Sessões repetidas de observação produziram relatos de fenômenos que não puderam ser adequadamente documentados apenas por escrito.</p>
    <p>Recomenda-se que as próximas sessões sejam gravadas por equipamento próprio, permitindo a conferência posterior dos acontecimentos e dos relatos apresentados pelos participantes.</p>
    <p>O equipamento deverá funcionar sem interferir na superfície de observação e permanecer fora do campo de visão dos participantes durante as sessões.</p>
    <p>Deverá ser dada atenção especial a características arquitetônicas, objetos e pessoas que se repitam em diferentes observações.</p>
    <p>Os registros deverão ser preservados para comparação com documentos que venham a ser encontrados posteriormente.</p>
    <p>Registrar primeiro.</p><p>Comparar depois.</p>`;

  const record3 = `
    <p><strong>De:</strong> M. Silva<br><strong>Para:</strong> R. Almeida<br><strong>Data:</strong> 18 de agosto de 2011 — 22:43<br><strong>Assunto:</strong> 76-01 / revisão de procedência</p>
    <p>Rafael,</p>
    <p>Concluí a revisão do material relacionado ao espelho atribuído a John Dee, registrado em nosso arquivo em 1976.</p>
    <p>Confirmei a procedência de três documentos preservados em arquivos independentes: uma ordem de conservação, um relatório de inspeção e um memorando de observação.</p>
    <p>Os registros apresentam informações consistentes sobre a peça e justificam uma comparação com a documentação atualmente disponível.</p>
    <p>Recomendo examinar especialmente as datas, as descrições físicas e as observações secundárias.</p>
    <p><strong>O elemento mais importante pode não ser o próprio espelho.</strong></p>
    <p>Encaminho as cópias para análise.</p><p>— M.</p>
    <div class="attachments-list">
      ${toggleMarkup('ANEXO A — ORDEM DE SERVIÇO E CONSERVAÇÃO / 1897', annexA, 'attachment')}
      ${toggleMarkup('ANEXO B — RELATÓRIO DE INSPEÇÃO / 1911', annexB, 'attachment')}
      ${toggleMarkup('ANEXO C — MEMORANDO DE OBSERVAÇÃO / 1923', annexC, 'attachment')}
    </div>`;

  const record4 = `
    <p><strong>Referência:</strong> 76-01<br><strong>Data:</strong> 21 de agosto de 2011</p>
    <p>Durante a revisão do material, foram consultadas fontes públicas relacionadas à trajetória de John Dee e ao espelho associado às suas experiências.</p>
    <p><strong>As referências abaixo fizeram parte da análise e devem ser consideradas na comparação das informações apresentadas nos registros.</strong></p>
    <p><strong>Não é necessário compreender integralmente os conteúdos em inglês. Para esta análise, observe também as informações objetivas apresentadas pelas próprias fontes.</strong></p>
    <h4>FONTES CONSULTADAS</h4>
    <p><a href="https://www.rmg.co.uk/collections/library/rmgl-13500" target="_blank" rel="noopener">Royal Museums Greenwich — Registros biográficos de John Dee</a></p>
    <p><a href="https://www.britishmuseum.org/collection/object/H_1966-1001-1?selectedImageId=1045525001" target="_blank" rel="noopener">British Museum — Registro da coleção: espelho de obsidiana associado a John Dee</a></p>`;

  actions.innerHTML = `
    <div class="records-list">
      ${toggleMarkup('REGISTRO 01 — MATERIAL DE AVALIAÇÃO', record1)}
      ${toggleMarkup('REGISTRO 02 — PROCEDÊNCIA', record2)}
      ${toggleMarkup('REGISTRO 03 — CORRESPONDÊNCIA ELETRÔNICA', record3)}
      ${toggleMarkup('REGISTRO 04 — REFERÊNCIAS DE REVISÃO', record4)}
    </div>
    <div class="answer-panel">
      <p><strong>CONCLUSÃO DA ANÁLISE</strong></p>
      <p>A comparação entre os registros preservados e as fontes consultadas revela uma diferença que não pode ser ignorada.</p>
      <p>Entre os itens analisados, um deles apresenta informações incompatíveis.</p>
      <form id="aptitudeForm" autocomplete="off">
        <label for="aptitudeAnswer" class="validation-label">QUAL DOS ITENS APRESENTA UMA DIVERGÊNCIA ENTRE OS REGISTROS?</label>
        <input id="aptitudeAnswer" class="answer-input" type="text" required />
        <button class="primary-btn" type="submit">VALIDAR</button>
        <p id="aptitudeMessage" class="answer-message" role="status"></p>
      </form>
    </div>`;

  registerAccordions(actions);
  const form = document.querySelector('#aptitudeForm');
  const message = document.querySelector('#aptitudeMessage');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const answer = normalizeAnswer(document.querySelector('#aptitudeAnswer').value);
    if (['estojo', 'case'].includes(answer)) {
      completedCount = Math.max(completedCount, 2);
      saveProgress(currentRefKey, completedCount);
      message.style.color = 'var(--green)';
      message.textContent = 'DIVERGÊNCIA CONFIRMADA.';
      setTimeout(() => { renderDashboard(); show(dashboardView); }, 900);
    } else {
      message.style.color = 'var(--danger)';
      message.textContent = 'RESPOSTA NÃO CONFIRMADA.';
    }
  });
}

function openStage(index) {
  const step = index + 1;
  const stage = stages[index];
  const state = stageVisualState(step);
  if (state === 'locked' || state === 'info-required') return;
  if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
  if (stageView.classList.contains('active')) {
    window.dispatchEvent(new Event('delectus:leaving-stage'));
  }

  // Etapas especiais (06/07) ocultam estes elementos. Restaurar sua
  // visibilidade ao abrir outra etapa, antes de preencher o conteúdo.
  const panelHead = document.querySelector('#stageView .detail-panel .panel-head');
  const stageContext = document.querySelector('#stageContext');
  if (panelHead) panelHead.hidden = false;
  if (stageContext) stageContext.hidden = false;

  document.querySelector('#stageCode').textContent = `ETAPA ${String(step).padStart(2, '0')}`;
  document.querySelector('#stageName').textContent = stage.name;
  const panelTitle = document.querySelector('.detail-panel .panel-head h2');
  if (panelTitle) panelTitle.textContent = PANEL_TITLES[index] || stage.panelTitle || 'INSTRUÇÃO';
  document.querySelector('#stageContext').textContent = stage.context;
  const stageMission = document.querySelector('#stageMission');
  stageMission.hidden = !stage.mission || step === 1;
  stageMission.textContent = stageMission.hidden ? '' : stage.mission;
  stageMission.classList.toggle('mission-copy--emphasis', Boolean(stage.missionEmphasis));
  stageStatus.textContent = state === 'done' ? 'concluída' : 'disponível';

  const actions = document.querySelector('#stageActions');
  actions.innerHTML = '';
  if (step === 1 && (state === 'available' || state === 'done')) renderSelectionBox(actions);
  else if (step === 2 && (state === 'available' || state === 'done')) renderStageTwo(actions);
  else if (state === 'available') {
    const complete = document.createElement('button');
    complete.className = 'primary-btn';
    complete.textContent = step === stages.length ? 'Simular admissão' : 'Simular conclusão';
    complete.addEventListener('click', () => {
      completedCount = Math.min(stages.length, Math.max(completedCount, step));
      saveProgress(currentRefKey, completedCount);
      renderDashboard(); show(dashboardView);
    });
    actions.appendChild(complete);
  }
  show(stageView);
}

function openPrintDialog() {
  markImportantInfoSeen();
  importantInfoBtn.classList.add('seen');
  renderDashboard();
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
printDialog.addEventListener('click', event => { if (event.target === printDialog) closePrintModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !printDialog.hidden) closePrintModal(); });

function accessWithLocalId(refKey, label = 'LOCAL') {
  currentRefKey = refKey;
  currentRefLabel = label;
  completedCount = loadProgress(refKey);
  renderDashboard();
  show(dashboardView);
  return true;
}
restartActivitiesBtn.addEventListener('click', () => {
  if (!window.confirm('Reiniciar todas as atividades deste acesso neste navegador?')) return;
  resetActivities();
  renderDashboard();
});

document.querySelector('#logoutBtn').addEventListener('click', () => {
  if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
  currentRefKey = null; currentRefLabel = null;
  window.dispatchEvent(new Event('delectus:return-to-invite'));
  show(loginView);
});

document.querySelector('#backBtn').addEventListener('click', () => {
  if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
  renderDashboard(); show(dashboardView);
});


