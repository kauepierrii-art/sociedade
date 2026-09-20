const stages = [
  {
    name: 'Identificação',
    subtitle: 'Correspondência confirmada',
    icon: '♙',
    context: 'A origem deste acesso precisa ser confirmada.\n\nA correspondência contém uma segunda marca de validação.',
    mission: '“O que não se vê ainda pode deixar vestígios.”'
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
    name: 'Convergência',
    subtitle: 'Correlação de registros',
    icon: '⚖',
    panelTitle: 'LINHA DO TEMPO',
    context: 'Os materiais analisados até aqui foram apresentados de forma independente.\n\nNesta etapa, eles devem ser considerados em conjunto.\n\nOrganize os registros na ordem em que os eventos ocorreram.\n\nAlgumas informações não estão explicitamente datadas. Use os documentos, imagens e referências obtidas nas etapas anteriores para determinar sua posição cronológica.\n\nA sequência correta revelará uma inconsistência.',
    mission: 'Monte a linha do tempo.',
    missionEmphasis: true
  },
  { name: 'Discernimento', subtitle: 'Análise de inconsistências', icon: '◇', context: 'O acesso seguinte envolve material restrito e exige que o processo já tenha sido compreendido.', mission: 'Conteúdo em desenvolvimento.' },
  { name: 'Admissão', subtitle: 'Resultado do protocolo', icon: '⚿', context: 'O processo de seleção foi concluído. A continuidade dependerá do resultado desta etapa.', mission: 'Conteúdo em desenvolvimento.' }
];

const PANEL_TITLES = [
  'REGISTRO DE ACESSO',
  'OBJETO EM ANÁLISE',
  'REGISTRO FOTOGRÁFICO',
  'APARELHO INCOMUM',
  'CORRELAÇÃO DOCUMENTAL',
  'ARQUIVO DE INVESTIGAÇÃO',
  'COMUNICAÇÃO FINAL'
];

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
    // Ao voltar pelo botão interno ou após concluir uma etapa, descartar a
    // entrada temporária para não exigir dois toques no Voltar do navegador.
    history.back();
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
    const cardViewer = document.querySelector('#stage5CardViewer');
    if (cardViewer) cardViewer.hidden = true;
    document.querySelectorAll('.stage5-completion-modal').forEach(popup => popup.remove());
  }
  [loginView, dashboardView, stageView].forEach(v => v.classList.remove('active'));
  view.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

function normalizeRef(value) { return value.trim().toUpperCase().replace(/\s+/g, ''); }
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
  localStorage.removeItem(`identification:v2:errors:${currentRefKey}`);
  localStorage.removeItem(`identification:v2:until:${currentRefKey}`);
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
    if (state === 'available' && step === 1) subtitle = 'aguardando validação';
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

function penaltyKey(suffix) { return `identification:v2:${suffix}:${currentRefKey}`; }
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
function romanHintNumber(index) { return ['I', 'II', 'III', 'IV'][index] || 'AJUDA FINAL'; }
function renderHint(hintBox, errors) {
  if (!errors) { hintBox.innerHTML = ''; hintBox.hidden = true; return; }
  const hintIndex = Math.min(errors - 1, IDENTIFICATION_HINTS.length - 1);
  const isFinal = hintIndex === IDENTIFICATION_HINTS.length - 1;
  hintBox.hidden = false;
  hintBox.innerHTML = `<span class="hint-label">${isFinal ? 'AJUDA FINAL' : `DICA ${romanHintNumber(hintIndex)} DESBLOQUEADA`}</span><p>${IDENTIFICATION_HINTS[hintIndex]}</p>`;
}

function renderIdentificationForm(actions) {
  actions.innerHTML = `
    <form id="identificationForm" class="validation-form" autocomplete="off">
      <label for="validationCode" class="validation-label">CÓDIGO DE VALIDAÇÃO</label>
      <input id="validationCode" class="validation-code" type="text" inputmode="numeric" pattern="[0-9]{3}" maxlength="3" placeholder="_ _ _" required />
      <p class="validation-quote">${stages[0].mission}</p>
      <button id="validationBtn" type="submit" class="primary-btn">VALIDAR</button>
      <p id="validationMessage" class="validation-message" role="status"></p>
      <div id="identificationHint" class="identification-hint" hidden></div>
    </form>`;

  const form = document.querySelector('#identificationForm');
  const input = document.querySelector('#validationCode');
  const button = document.querySelector('#validationBtn');
  const message = document.querySelector('#validationMessage');
  const hintBox = document.querySelector('#identificationHint');
  input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(0, 3); });

  function applyCooldown() {
    if (cooldownTimer) clearInterval(cooldownTimer);
    const update = () => {
      const { until, errors } = getPenaltyState();
      const remaining = until - Date.now();
      renderHint(hintBox, errors);
      if (remaining <= 0) {
        input.disabled = false; button.disabled = false; message.textContent = '';
        clearInterval(cooldownTimer); cooldownTimer = null; return;
      }
      input.disabled = true; button.disabled = true;
      message.innerHTML = `VALIDAÇÃO NEGADA<br>Nova tentativa disponível em <strong>${formatCountdown(remaining)}</strong>.`;
    };
    update();
    cooldownTimer = setInterval(update, 1000);
  }

  const initialPenalty = getPenaltyState();
  renderHint(hintBox, initialPenalty.errors);
  if (initialPenalty.until > Date.now()) applyCooldown();

  form.addEventListener('submit', event => {
    event.preventDefault();
    const { until, errors } = getPenaltyState();
    if (until > Date.now()) { applyCooldown(); return; }
    if (input.value === IDENTIFICATION_CODE) {
      clearPenalty();
      completedCount = Math.max(completedCount, 1);
      saveProgress(currentRefKey, completedCount);
      message.textContent = 'IDENTIFICAÇÃO CONFIRMADA.';
      input.disabled = true; button.disabled = true; hintBox.hidden = true;
      setTimeout(() => { renderDashboard(); show(dashboardView); }, 800);
      return;
    }
    const newErrors = errors + 1;
    const waitMinutes = Math.min(2 ** (newErrors - 1), MAX_COOLDOWN_MINUTES);
    localStorage.setItem(penaltyKey('errors'), String(newErrors));
    localStorage.setItem(penaltyKey('until'), String(Date.now() + waitMinutes * 60 * 1000));
    input.value = '';
    renderHint(hintBox, newErrors);
    applyCooldown();
  });
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
    <h3>MATERIAL DE AVALIAÇÃO</h3>
    <p>Antes que outras informações possam ser confiadas a você, precisamos saber como você lida com versões conflitantes de um mesmo fato.</p>
    <p>O conteúdo a seguir não foi reunido por interesse acadêmico.</p>
    <p>Durante décadas, versões diferentes da mesma história circularam ao mesmo tempo.</p>
    <p>Algumas foram preservadas. Outras desapareceram.</p>
    <p>Os documentos abaixo pertencem ao mesmo conjunto.</p>
    <p>Seu objetivo, neste momento, é identificar uma inconsistência.</p>
    <p>Ela foi considerada irrelevante por muitos.</p><p>Não por todos.</p>
    <p><strong>Não ignore os detalhes.</strong></p>
    <h3>O ESPELHO NEGRO</h3>
    <p>Durante séculos, superfícies negras e polidas foram utilizadas em práticas de <strong>scrying</strong> — métodos de contemplação destinados a obter visões, respostas ou contato com inteligências que não poderiam ser alcançadas pelos sentidos comuns.</p>
    <p>Espelhos de obsidiana ocupam um lugar particular nessa tradição. A pedra vulcânica, quando cuidadosamente polida, produz uma superfície escura e reflexiva na qual a imagem nunca é completamente nítida.</p>
    <p>Para alguns praticantes, essa imperfeição era justamente o que permitia perceber aquilo que normalmente permaneceria oculto.</p>
    <p>Alguns relatos atribuíam a esses objetos a capacidade de revelar acontecimentos distantes, antecipar eventos futuros ou permitir contato com entidades desconhecidas.</p>
    <p>Outros advertiam para um risco diferente:</p>
    <blockquote><strong>o observador poderia acreditar estar controlando aquilo que via quando, na verdade, estaria sendo conduzido por isso.</strong></blockquote>
    <p>A informação obtida por meio do espelho poderia ser usada para aconselhar governantes, antecipar conflitos, identificar inimigos ou interferir em decisões de grande importância.</p>
    <p>Por essa razão, um objeto capaz de oferecer respostas — verdadeiras ou não — seria tão perigoso nas mãos de alguém interessado em poder quanto qualquer arma convencional.</p>
    <h3>JOHN DEE</h3>
    <p>John Dee nasceu na Inglaterra em 1527.</p>
    <p>Foi matemático, astrônomo, estudioso de navegação, alquimia e filosofia natural. Também esteve ligado à corte da rainha Elizabeth I e atuou como conselheiro em assuntos científicos e políticos.</p>
    <p>Ao mesmo tempo, dedicou parte significativa de sua vida ao estudo do que considerava conhecimentos ocultos.</p>
    <p>Dee acreditava que determinadas inteligências espirituais poderiam transmitir informações inacessíveis aos homens.</p>
    <p>Para tentar estabelecer esse contato, trabalhou principalmente com o médium Edward Kelley. Durante essas sessões, Kelley observava superfícies reflexivas enquanto Dee registrava cuidadosamente aquilo que era relatado.</p>
    <p>Entre os objetos tradicionalmente relacionados a essas práticas encontra-se um <strong>espelho circular de obsidiana negra</strong>.</p>
    <p>A peça é de origem mexicana e pertence a uma tradição muito anterior a Dee.</p>
    <p><strong>Se um homem acreditasse possuir um instrumento capaz de revelar informações que ninguém mais poderia conhecer, até onde estaria disposto a ir para protegê-lo — ou utilizá-lo?</strong></p>`;

  const record2 = `
    <h3>REGISTRO DE PROCEDÊNCIA</h3>
    <p>Após a morte de John Dee, em 1608 ou 1609, parte de seus livros e objetos passou para outras mãos.</p>
    <p>Entre esses objetos estaria uma pedra escura e circular utilizada em suas experiências de comunicação espiritual.</p>
    <p>Em 1624, um depoimento judicial registrou a existência, na casa de John Pontois, de uma <strong>“pedra redonda e plana”</strong> que teria pertencido ao estudioso.</p>
    <p>A partir daí, a trajetória da peça torna-se menos clara.</p>
    <p>Décadas depois, o objeto surge associado à coleção dos Condes de Peterborough. Por volta de 1770, já estava nas mãos do antiquário inglês <strong>Horace Walpole</strong>.</p>
    <blockquote>“A pedra negra na qual Dr. Dee costumava chamar seus espíritos.”</blockquote>
    <p>A partir do século XVIII, a história do objeto passa a ser mais bem documentada. O espelho atravessou diferentes coleções particulares e, em 1966, entrou para o acervo do <strong>British Museum</strong>.</p>
    <h3>A VERSÃO ACEITA</h3>
    <p>A peça preservada atualmente é um espelho de obsidiana de origem mexicana. Estudos modernos confirmaram que a pedra utilizada em sua fabricação é compatível com depósitos de obsidiana da região de <strong>Pachuca, no México</strong>.</p>
    <p>Isso reforçou significativamente a hipótese de que o objeto é antigo e de origem mesoamericana. Mas não resolveu tudo.</p>
    <p>Não se sabe exatamente quando ou como John Dee a adquiriu, e existem períodos de sua trajetória em que a sucessão de proprietários não pode ser reconstruída de forma contínua.</p>
    <h3>UMA QUESTÃO DE CONTINUIDADE</h3>
    <p>Um objeto antigo pode ser autêntico. Sua origem pode estar correta. Sua idade também.</p>
    <p>E ainda assim uma pergunta permanecer:</p>
    <blockquote><strong>é possível demonstrar que o objeto preservado hoje é exatamente o mesmo que esteve nas mãos de John Dee?</strong></blockquote>
    <p>Durante séculos, a resposta aceita foi suficiente.</p>
    <p><strong>No final do século XIX, deixou de ser.</strong></p>`;

  const annexA = `
    <div class="doc-meta">Origem documental: Arquivo comercial privado · Procedência: verificada · Documento original: inglês · 14 de março de 1897</div>
    <h4>ORIGINAL</h4>
    <p><strong>J. H. WHITMORE & SONS</strong><br><em>Conservation of Fine Objects and Furnishings</em><br>London, 14 March 1897</p>
    <p><strong>Client:</strong> Wetherby Family</p>
    <p><strong>Article received:</strong><br>One leather-covered fitted case containing a circular polished black stone.</p>
    <div class="doc-section-title">WORK REQUESTED</div>
    <ul class="doc-list"><li>reinforcement of upper hinge;</li><li>repair of closing mechanism;</li><li>stabilization of worn leather edges;</li><li>partial replacement of detached interior lining;</li><li>cleaning of exterior leather without treatment of the contained object.</li></ul>
    <p><strong>Condition upon receipt:</strong><br>Exterior leather dry, with minor cracking along lower edge. Upper hinge loose but complete. Brass closing mechanism functional, showing oxidation around mounting points. Dark interior lining detached along approximately one quarter of its perimeter. Internal fitted support intact. Contained stone visually examined without removal from the fitted support. No fracture or recent structural damage observed.</p>
    <div class="doc-section-title">CASE DIMENSIONS</div>
    <p>Diameter: <strong>20 centimetres</strong><br>Length: <strong>24 centimetres</strong><br>Width: <strong>2.60 centimetres</strong></p>
    <p><strong>Materials observed:</strong><br>Dark brown leather exterior; wood structure; dark textile lining; brass fittings.</p>
    <p><strong>Owner's instruction:</strong><br>The original internal fitting is not to be altered. Existing material is to be retained wherever possible. No replacement case is to be produced.</p>
    <p><strong>Estimated completion:</strong> 18 working days.</p>
    <p><em>Do not polish the stone.</em></p>
    <h4>TRADUÇÃO TÉCNICA</h4>
    <p><strong>J. H. WHITMORE & SONS</strong><br><em>Conservação de Objetos Finos e Mobiliário</em><br>Londres, 14 de março de 1897</p>
    <p><strong>Cliente:</strong> Família Wetherby</p>
    <p><strong>Objeto recebido:</strong><br>Um estojo ajustado, revestido em couro, contendo uma pedra negra circular e polida.</p>
    <p><strong>Serviço solicitado:</strong><br>Reforço da dobradiça superior; reparo do mecanismo de fechamento; estabilização das bordas de couro desgastadas; substituição parcial do revestimento interno desprendido; limpeza do couro externo sem tratamento do objeto contido.</p>
    <div class="doc-section-title">DIMENSÕES DO ESTOJO</div>
    <p>Diâmetro: <strong>20 centímetros</strong><br>Comprimento: <strong>24 centímetros</strong><br>Largura: <strong>2,60 centímetros</strong></p>
    <p><strong>Instrução do proprietário:</strong><br>O encaixe interno original não deverá ser alterado. Os materiais existentes deverão ser mantidos sempre que possível. Não deverá ser produzido um novo estojo.</p>
    <p><strong>Prazo estimado:</strong> 18 dias úteis.</p>
    <p><strong>Não polir a pedra.</strong></p>`;

  const annexB = `
    <div class="doc-meta">Origem documental: Arquivo comercial da transportadora · Procedência: verificada · Documento original: inglês · 3 de novembro de 1911</div>
    <h4>ORIGINAL</h4>
    <p>The object examined on the 9th instant was presented without formal provenance.</p>
    <p>Its dimensions, surface characteristics and mounting arrangement are consistent with earlier descriptions of the black speculum traditionally associated with Dr. John Dee.</p>
    <p>However, the object was observed in circumstances incompatible with the documented chain of custody currently accepted for the specimen.</p>
    <p>No conclusion should be drawn from visual similarity alone.</p>
    <p>Further comparison is recommended, particularly regarding edge wear, rear mounting marks and the dimensions of the protective case.</p>
    <p>The present observation is to remain outside the official record until independent confirmation can be obtained.</p>
    <h4>TRADUÇÃO TÉCNICA</h4>
    <p>O objeto examinado no dia 9 do corrente mês foi apresentado sem documentação formal de procedência.</p>
    <p>Suas dimensões, características de superfície e forma de montagem são compatíveis com descrições anteriores do espelho negro tradicionalmente associado ao Dr. John Dee.</p>
    <p>Contudo, o objeto foi observado em circunstâncias incompatíveis com a cadeia de custódia atualmente aceita para o exemplar.</p>
    <p>Nenhuma conclusão deve ser estabelecida apenas com base na semelhança visual.</p>
    <p>Recomenda-se comparação adicional, especialmente quanto ao desgaste das bordas, marcas de fixação posteriores e dimensões do estojo de proteção.</p>
    <p>A presente observação deverá permanecer fora do registro oficial até que seja obtida confirmação independente.</p>`;

  const annexC = `
    <div class="doc-meta">Origem documental: Arquivo familiar Harrington · Procedência: verificada · Documento original: inglês · 27 de maio de 1923</div>
    <h4>ORIGINAL</h4>
    <p>Repeated observation sessions have produced visual phenomena which cannot be adequately preserved by written description alone.</p>
    <p>It is therefore recommended that future sessions be recorded by mechanical means.</p>
    <p>The recording apparatus must operate independently of the observation surface and should remain concealed during use, in order to avoid interference with the procedure and unnecessary exposure of the object.</p>
    <p>Particular attention must be given to recurring architectural features, objects and persons observed during separate sessions.</p>
    <p>Any visual recurrence should be compared against later documentary records whenever such material becomes available.</p>
    <p>No attempt should be made to interpret the observed scenes during the session itself.</p>
    <p><strong>Record first.</strong></p>
    <p><strong>Compare later.</strong></p>
    <h4>TRADUÇÃO TÉCNICA</h4>
    <p>Sessões repetidas de observação produziram fenômenos visuais que não podem ser preservados adequadamente apenas por descrição escrita.</p>
    <p>Recomenda-se, portanto, que as sessões futuras sejam registradas por meios mecânicos.</p>
    <p>O equipamento de registro deverá operar de forma independente da superfície de observação e permanecer oculto durante sua utilização, de modo a evitar interferência no procedimento e exposição desnecessária do objeto.</p>
    <p>Deverá ser dada atenção especial a características arquitetônicas, objetos e pessoas que se repitam em sessões distintas.</p>
    <p>Toda recorrência visual deverá ser comparada com registros documentais posteriores, sempre que esse material se tornar disponível.</p>
    <p>Nenhuma tentativa de interpretação das cenas observadas deverá ser realizada durante a própria sessão.</p>
    <p><strong>Registrar primeiro.</strong></p>
    <p><strong>Comparar depois.</strong></p>`;

  const record3 = `
    <h3>CORRESPONDÊNCIA ELETRÔNICA — REVISÃO DE PROCEDÊNCIA</h3>
    <p><strong>De:</strong> M. Silva<br><strong>Para:</strong> R. Almeida<br><strong>Data:</strong> 18 de agosto de 2011 — 22:43<br><strong>Assunto:</strong> 76-01 / revisão de procedência</p>
    <p>Rafael,</p>
    <p>terminei a revisão do material relacionado ao objeto registrado em 1976.</p>
    <p>Consegui confirmar a origem de três documentos que estavam entre as cópias preservadas. Dois deles puderam ser relacionados diretamente a antigos portadores da peça; o terceiro pertence ao arquivo de uma empresa que realizou seu transporte no início do século passado.</p>
    <p>Até onde pude verificar, não são documentos produzidos posteriormente para sustentar a hipótese. Eles já existiam de forma independente antes de serem reunidos no arquivo.</p>
    <p>Isso não resolve a questão.</p>
    <p>Nenhum deles afirma, de forma direta, que o objeto pertencia a John Dee. Ainda assim, existem informações suficientemente consistentes para justificar uma nova comparação.</p>
    <p>Os documentos tratam de assuntos diferentes: conservação, transporte e correspondência particular. Por isso, recomendo que sejam lidos integralmente antes de qualquer conclusão.</p>
    <p>Datas, nomes, valores, descrições físicas e observações aparentemente secundárias foram mantidos nas transcrições.</p>
    <p>Não presuma que o elemento mais importante seja o próprio espelho.</p>
    <p>Estou enviando as cópias que considero mais úteis.</p><p>— M.</p>
    <div class="attachments-list">
      ${toggleMarkup('ANEXO A — ORDEM DE SERVIÇO E CONSERVAÇÃO / 1897', annexA, 'attachment')}
      ${toggleMarkup('ANEXO B — RELATÓRIO DE INSPEÇÃO / 1911', annexB, 'attachment')}
      ${toggleMarkup('ANEXO C — MEMORANDO DE OBSERVAÇÃO / 1923', annexC, 'attachment')}
    </div>`;

  const record4 = `
    <h3>REFERÊNCIAS DE REVISÃO</h3>
    <p><strong>Referência:</strong> 76-01<br><strong>Data:</strong> 21 de agosto de 2011</p>
    <p>Durante a revisão do material, foram consultadas fontes públicas e registros complementares relacionados ao objeto, sua procedência e seus antigos proprietários.</p>
    <p>As referências abaixo foram mantidas por apresentarem informações potencialmente úteis à comparação documental.</p>
    <p>Nem todas necessariamente possuem relação direta com a questão principal.</p>
    <h4>Fontes consultadas</h4>
    <p><a href="https://www.rmg.co.uk/collections/library/rmgl-13500" target="_blank" rel="noopener">Royal Museums Greenwich — Registros biográficos de John Dee</a></p>
    <p><a href="https://www.britishmuseum.org/collection/object/H_1966-1001-1?selectedImageId=1045525001" target="_blank" rel="noopener">British Museum — Registro da coleção: espelho de obsidiana associado a John Dee</a></p>
    <p><a href="https://www.cambridge.org/core/journals/antiquity/article/mirror-the-magus-and-more-reflections-on-john-dees-obsidian-mirror/38D4BFEA2CB9766973791029C2EE1289" target="_blank" rel="noopener">Antiquity / Cambridge University Press — Análise da origem dos espelhos de obsidiana</a></p>
    <p><a href="https://library.si.edu/digital-library/book/descriptivecata00bull" target="_blank" rel="noopener">Smithsonian Libraries — Catálogo da exposição Ancient and Modern Mexico, Londres, 1824</a></p>`;

  actions.innerHTML = `
    <div class="records-list">
      ${toggleMarkup('REGISTRO 01 — MATERIAL DE AVALIAÇÃO', record1)}
      ${toggleMarkup('REGISTRO 02 — PROCEDÊNCIA', record2)}
      ${toggleMarkup('REGISTRO 03 — CORRESPONDÊNCIA ELETRÔNICA', record3)}
      ${toggleMarkup('REGISTRO 04 — REFERÊNCIAS DE REVISÃO', record4)}
    </div>
    <div class="answer-panel">
      <p><strong>Antes de prosseguir, precisamos avaliar como você lida com informações conflitantes.</strong></p>
      <p>Os registros apresentados não foram reunidos para contar uma história completa. Eles foram preservados porque, em algum momento, alguém considerou que certas diferenças mereciam uma segunda análise.</p>
      <p>Seu objetivo não é provar uma teoria, nem confirmar a autenticidade de qualquer objeto.</p>
      <p>É mais simples que isso.</p>
      <p><strong>Examine os registros e considere as informações apresentadas em cada um deles.</strong></p>
      <form id="aptitudeForm" autocomplete="off">
        <label for="aptitudeAnswer" class="validation-label">QUAL ELEMENTO APRESENTA INCONSISTÊNCIA ENTRE OS REGISTROS?</label>
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
    if (['estojo', 'case', 'caixa'].includes(answer)) {
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
  if (step === 1 && (state === 'available' || state === 'done')) renderIdentificationForm(actions);
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

function accessWithReference(refKey, label = refKey) {
  currentRefKey = refKey;
  currentRefLabel = label;
  completedCount = loadProgress(refKey);
  loginMessage.textContent = '';
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
  currentRefKey = null; currentRefLabel = null; referenceInput.value = '';
  show(loginView);
});

document.querySelector('#backBtn').addEventListener('click', () => {
  if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
  renderDashboard(); show(dashboardView);
});

