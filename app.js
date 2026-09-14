const stages = [
  {
    name: 'Identificação',
    subtitle: 'Correspondência confirmada',
    icon: '♙',
    context: 'A origem deste acesso precisa ser confirmada.\n\nA correspondência contém uma segunda marca de validação.',
    mission: '“O que não se vê ainda pode deixar vestígios. Nem toda marca resiste da mesma forma ao calor.”'
  },
  {
    name: 'Origem',
    subtitle: 'Registro histórico',
    icon: '⌘',
    context: 'Nem toda divergência é relevante.\n\nAlgumas, no entanto, justificam uma segunda análise.\n\nOs documentos disponibilizados pertencem ao mesmo conjunto e foram preservados por razões que serão esclarecidas posteriormente.\n\nAnalise o material e identifique a inconsistência.',
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

const REFERENCES = {
  LUMEN: 'LUMEN', TACITUS: 'TACITUS', SPECULO: 'SPECULO', VIGIL: 'VIGIL', FERRO: 'FERRO', IGNIS: 'IGNIS',
  PUGNUS: 'PUGNUS', CUSTOS: 'CUSTOS', MALLEUS: 'MALLEUS', DUX: 'DUX', RATIO: 'RATIO', NEXUS: 'NEXUS',
  VERITAS: 'VERITAS', ARS: 'ARS', FATUM: 'FATUM', FINIS: 'FINIS', ULTOR: 'ULTOR', AEQUITAS: 'AEQUITAS', SICA: 'SICA'
};

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

let currentRefKey = null;
let currentRefLabel = null;
let completedCount = 0;
let cooldownTimer = null;

function show(view) {
  [loginView, dashboardView, stageView].forEach(v => v.classList.remove('active'));
  view.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function normalizeRef(value) { return value.trim().toUpperCase().replace(/\s+/g, ''); }
function normalizeAnswer(value) { return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function loadProgress(refKey) {
  const stored = Number(localStorage.getItem(`progress:${refKey}`));
  return Number.isInteger(stored) && stored >= 0 && stored <= stages.length ? stored : 0;
}
function saveProgress(refKey, value) { localStorage.setItem(`progress:${refKey}`, String(value)); }
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
        <span class="stage-title">${String(step).padStart(2, '0')} — ${stage.name}</span>
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
    <p><strong>CALDWELL & FINCH</strong><br><em>Carriers of Paintings, Antiquities and Delicate Articles</em><br><strong>Shipping Record No. 4117</strong><br>London, 3 November 1911</p>
    <p><strong>Consignor:</strong> A. Wetherby<br><strong>Consignee:</strong> H. L. Harrington</p>
    <p><strong>Declared contents:</strong> One wooden transport box containing one old leather-covered fitted case; one circular object of polished black stone; one sealed envelope containing three papers; one small cloth pouch containing two unidentified mineral fragments; one folded inventory sheet.</p>
    <p><strong>Total declared weight:</strong> 3.8 kilograms<br><strong>Declared insurance value:</strong> £35</p>
    <p><strong>Handling instructions:</strong><br>Keep dry. Do not place beside heating apparatus. Do not open the inner fitted case unless required by the consignee. Documents are to remain with the principal article.</p>
    <p><strong>Inspection record:</strong><br>The package was temporarily retained following a request for clarification concerning the undeclared nature of the mineral fragments. Exterior transport box opened in the presence of the carrier's clerk. Sealed document envelope intact. Inner leather case not opened. Package released at 16:40.</p>
    <p><strong>Signed:</strong> H. L. Harrington</p>
    <h4>TRADUÇÃO TÉCNICA</h4>
    <p><strong>CALDWELL & FINCH</strong><br><em>Transportadores de Pinturas, Antiguidades e Objetos Delicados</em><br><strong>Registro de Transporte nº 4117</strong><br>Londres, 3 de novembro de 1911</p>
    <p><strong>Remetente:</strong> A. Wetherby<br><strong>Destinatário:</strong> H. L. Harrington</p>
    <p><strong>Conteúdo declarado:</strong> Uma caixa de transporte em madeira contendo um estojo antigo ajustado, revestido em couro; um objeto circular de pedra negra polida; um envelope lacrado contendo três documentos; uma pequena bolsa de tecido contendo dois fragmentos minerais não identificados; uma folha de inventário dobrada.</p>
    <p><strong>Peso total declarado:</strong> 3,8 quilogramas<br><strong>Valor declarado para seguro:</strong> £35</p>
    <p><strong>Instruções de manuseio:</strong><br>Manter seco. Não posicionar próximo a equipamentos de aquecimento. Não abrir o estojo interno ajustado, salvo por solicitação do destinatário. Os documentos deverão permanecer junto ao objeto principal.</p>
    <p><strong>Assinado:</strong> H. L. Harrington</p>`;

  const annexC = `
    <div class="doc-meta">Origem documental: Arquivo familiar Harrington · Procedência: verificada · Documento original: inglês · 27 de maio de 1923</div>
    <h4>ORIGINAL</h4>
    <p>27 May 1923</p><p>Edward,</p>
    <p>I found the papers you asked about.</p>
    <p>They were kept with Father's records, in the same drawer as the receipts concerning the black mirror.</p>
    <p>Father never regarded the thing as particularly valuable in the ordinary sense. He owned paintings worth considerably more and never treated any of them with the same caution.</p>
    <p>He insisted that the mirror remain with the papers and with the case in which it had come to the family.</p>
    <p>He said that separating them would make it impossible, one day, to know what had actually passed through our hands.</p>
    <p>On two occasions he considered offering the object to an institution. Both attempts ended after he received conflicting opinions regarding its history.</p>
    <blockquote><strong>“A story survives only for as long as its evidence does.”</strong></blockquote>
    <p>After his death I found transport papers, an old repair account, several notes concerning previous owners and a sealed envelope whose contents I was instructed not to separate.</p>
    <p>But since you asked me to preserve everything, I have done so.</p><p>Eleanor</p>
    <h4>TRADUÇÃO TÉCNICA</h4>
    <p>27 de maio de 1923</p><p>Edward,</p>
    <p>encontrei os documentos sobre os quais você perguntou.</p>
    <p>Eles estavam guardados junto aos registros de meu pai, na mesma gaveta dos recibos relacionados ao espelho negro.</p>
    <p>Meu pai nunca considerou o objeto particularmente valioso no sentido comum. Possuía pinturas de valor muito superior e jamais tratou nenhuma delas com o mesmo cuidado.</p>
    <p>Ele insistia que o espelho permanecesse junto dos documentos e do estojo com o qual havia chegado à família.</p>
    <p>Ele respondeu que separá-los tornaria impossível, algum dia, saber o que realmente havia passado por nossas mãos.</p>
    <p>Em duas ocasiões ele cogitou oferecer o objeto a uma instituição. Ambas as tentativas terminaram depois que recebeu opiniões contraditórias sobre sua história.</p>
    <blockquote><strong>“Uma história sobrevive apenas enquanto suas evidências sobreviverem.”</strong></blockquote>
    <p>Depois de sua morte, encontrei documentos de transporte, uma antiga conta de reparo, diversas anotações sobre proprietários anteriores e um envelope lacrado cujo conteúdo fui instruída a não separar.</p>
    <p>Mas, como você me pediu para preservar tudo, foi o que fiz.</p><p>Eleanor</p>`;

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
      ${toggleMarkup('ANEXO A — Ordem de serviço e conservação / 1897', annexA, 'attachment')}
      ${toggleMarkup('ANEXO B — Registro de transporte / 1911', annexB, 'attachment')}
      ${toggleMarkup('ANEXO C — Correspondência particular / 1923', annexC, 'attachment')}
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
      <p><strong>Leia, compare e identifique qual elemento apresenta uma inconsistência entre os registros.</strong></p>
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

  document.querySelector('#stageCode').textContent = `ETAPA ${String(step).padStart(2, '0')}`;
  document.querySelector('#stageName').textContent = stage.name;
  const panelTitle = document.querySelector('.detail-panel .panel-head h2');
  if (panelTitle) panelTitle.textContent = stage.panelTitle || 'INSTRUÇÃO';
  document.querySelector('#stageContext').textContent = stage.context;
  const stageMission = document.querySelector('#stageMission');
  stageMission.hidden = !stage.mission || step === 1;
  stageMission.textContent = stageMission.hidden ? '' : stage.mission;
  stageMission.classList.toggle('mission-copy--emphasis', Boolean(stage.missionEmphasis));
  stageStatus.textContent = state === 'done' ? 'concluída' : 'disponível';

  const actions = document.querySelector('#stageActions');
  actions.innerHTML = '';
  if (step === 1 && state === 'available') renderIdentificationForm(actions);
  else if (step === 2 && state === 'available') renderStageTwo(actions);
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
  } else if (step === 2 && state === 'done') {
    renderStageTwo(actions);
    const form = document.querySelector('#aptitudeForm');
    if (form) form.remove();
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

document.querySelector('#accessForm').addEventListener('submit', event => {
  event.preventDefault();
  const refKey = normalizeRef(referenceInput.value);
  if (!REFERENCES[refKey]) { loginMessage.textContent = 'Referência não localizada.'; return; }
  currentRefKey = refKey;
  currentRefLabel = REFERENCES[refKey];
  completedCount = loadProgress(refKey);
  loginMessage.textContent = '';
  renderDashboard();
  show(dashboardView);
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
