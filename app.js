const stages = [
  {
    name: 'Identificação',
    context: 'A origem deste acesso precisa ser confirmada.\n\nA correspondência contém uma segunda marca de validação.',
    mission: '“O que não se vê ainda pode deixar vestígios. Nem toda marca resiste da mesma forma ao calor.”'
  },
  {
    name: 'Aptidão',
    context: 'Nem toda divergência é relevante.\n\nAlgumas, no entanto, justificam uma segunda análise.\n\nOs documentos disponibilizados pertencem ao mesmo conjunto e foram preservados por razões que serão esclarecidas posteriormente.\n\nAnalise o material e identifique a inconsistência.',
    mission: ''
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
  LUMEN: 'Lumen', TACITUS: 'Tacitus', SPECULO: 'Speculo', VIGIL: 'Vigil', FERRO: 'Ferro', IGNIS: 'Ignis',
  PUGNUS: 'Pugnus', CUSTOS: 'Custos', MALLEUS: 'Malleus', DUX: 'Dux', RATIO: 'Ratio', NEXUS: 'Nexus',
  VERITAS: 'Veritas', ARS: 'Ars', FATUM: 'Fatum', FINIS: 'Finis', ULTOR: 'Ultor', AEQUITAS: 'Aequitas', SICA: 'Sica'
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

const APTITUDE_ANSWER = ['estojo', 'case', 'caixa'];

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

function injectAptitudeStyles() {
  if (document.querySelector('#aptitudeStyles')) return;
  const style = document.createElement('style');
  style.id = 'aptitudeStyles';
  style.textContent = `
    .record-stack{display:grid;gap:10px;margin-top:4px}
    .record-item{border:1px solid var(--line);background:rgba(7,11,29,.35)}
    .record-toggle,.attachment-toggle{width:100%;border:0;background:transparent;color:var(--text);padding:15px 16px;display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;text-align:left;cursor:pointer}
    .record-toggle:hover,.record-toggle:focus-visible,.attachment-toggle:hover,.attachment-toggle:focus-visible{background:rgba(203,203,235,.045);outline:none}
    .record-number{color:var(--yellow);font-size:12px;font-weight:700;letter-spacing:.12em}
    .record-title{font-size:14px;font-weight:700;line-height:1.4}
    .record-chevron{color:var(--text-dim);font-size:20px;transition:transform .18s ease}
    .record-toggle[aria-expanded="true"] .record-chevron,.attachment-toggle[aria-expanded="true"] .record-chevron{transform:rotate(90deg)}
    .record-content,.attachment-content{padding:2px 17px 18px;border-top:1px solid var(--line);color:var(--text-soft);font-size:14px;line-height:1.72}
    .record-content[hidden],.attachment-content[hidden]{display:none}
    .record-content h3,.record-content h4,.attachment-content h4{color:var(--text);margin:20px 0 8px;line-height:1.3}
    .record-content h3{font-size:17px}.record-content h4,.attachment-content h4{font-size:14px}
    .record-content p,.attachment-content p{margin:10px 0}
    .record-content blockquote,.attachment-content blockquote{margin:14px 0;padding-left:14px;border-left:2px solid var(--line-strong);color:var(--text);font-style:italic}
    .record-content ul,.attachment-content ul{margin:10px 0;padding-left:20px}
    .record-content li,.attachment-content li{margin:5px 0}
    .attachment-list{display:grid;gap:8px;margin-top:18px}
    .attachment-item{border:1px solid rgba(187,195,234,.18);background:rgba(10,14,34,.4)}
    .attachment-toggle{padding:13px 14px;grid-template-columns:1fr auto}
    .attachment-meta{font-size:11px;color:var(--text-dim);margin-top:2px}
    .document-block{margin-top:14px;padding:15px;border:1px solid rgba(187,195,234,.16);background:rgba(4,8,24,.34)}
    .document-label{display:inline-block;margin-bottom:8px;color:var(--yellow);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
    .source-links{display:grid;gap:9px;margin:14px 0}
    .source-link{display:block;padding:12px 13px;border:1px solid rgba(187,195,234,.18);color:var(--text);text-decoration:none;line-height:1.45}
    .source-link:hover,.source-link:focus-visible{border-color:var(--line-strong);background:rgba(203,203,235,.045);outline:none}
    .source-link small{display:block;color:var(--text-dim);margin-top:4px;overflow-wrap:anywhere}
    .aptitude-prompt{margin-top:22px;padding-top:20px;border-top:1px solid var(--line)}
    .aptitude-prompt strong{color:var(--text)}
    .aptitude-question{display:block;margin:22px 0 10px;color:var(--text);font-size:13px;font-weight:700;letter-spacing:.08em;line-height:1.5}
    .aptitude-answer{font-size:18px;letter-spacing:.04em}
    .aptitude-feedback{min-height:24px;margin:12px 0 0;color:var(--danger);font-size:13px;line-height:1.55}
    .aptitude-feedback.ok{color:var(--green)}
    .mail-head{display:grid;gap:5px;margin:12px 0 16px;padding:13px 14px;border:1px solid rgba(187,195,234,.16);background:rgba(4,8,24,.28)}
    .mail-head span{color:var(--text-dim)} .mail-head strong{color:var(--text-soft);font-weight:500}
    .measurements{margin:14px 0;padding:12px 14px;border-left:2px solid var(--line-strong);background:rgba(203,203,235,.035)}
    .measurements p{margin:4px 0}
    @media(max-width:520px){.record-toggle{grid-template-columns:auto minmax(0,1fr) auto;padding:14px 12px}.record-content,.attachment-content{padding-left:13px;padding-right:13px}.record-title{font-size:13px}}
  `;
  document.head.appendChild(style);
}

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
function getTopStatus() { return completedCount >= stages.length ? 'finalizado' : 'em aberto'; }
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
    btn.innerHTML = `<span class="num">${String(step).padStart(2, '0')}</span><span class="name">${stage.name}</span><span class="state">${state === 'done' ? 'concluída' : state === 'available' ? 'disponível' : 'bloqueada'}</span><span class="arrow">›</span>`;
    btn.addEventListener('click', () => openStage(index));
    stageList.appendChild(btn);
  });
}

function penaltyKey(suffix) { return `identification:v2:${suffix}:${currentRefKey}`; }
function getPenaltyState() { return { errors: Number(localStorage.getItem(penaltyKey('errors'))) || 0, until: Number(localStorage.getItem(penaltyKey('until'))) || 0 }; }
function clearPenalty() { localStorage.removeItem(penaltyKey('errors')); localStorage.removeItem(penaltyKey('until')); }
function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
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
  actions.innerHTML = `<form id="identificationForm" class="validation-form" autocomplete="off"><label for="validationCode" class="validation-label">CÓDIGO DE VALIDAÇÃO</label><input id="validationCode" class="validation-code" type="text" inputmode="numeric" pattern="[0-9]{3}" maxlength="3" placeholder="_ _ _" aria-describedby="validationMessage identificationHint" required/><p class="validation-quote">${stages[0].mission}</p><button id="validationBtn" type="submit" class="primary-btn">VALIDAR</button><p id="validationMessage" class="validation-message" role="status"></p><div id="identificationHint" class="identification-hint" hidden></div></form>`;
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
      if (remaining <= 0) { input.disabled = false; button.disabled = false; message.textContent = ''; clearInterval(cooldownTimer); cooldownTimer = null; return; }
      input.disabled = true; button.disabled = true;
      message.innerHTML = `VALIDAÇÃO NEGADA<br>Nova tentativa disponível em <strong>${formatCountdown(remaining)}</strong>.`;
    };
    update(); cooldownTimer = setInterval(update, 1000);
  }
  const initialPenalty = getPenaltyState();
  renderHint(hintBox, initialPenalty.errors);
  if (initialPenalty.until > Date.now()) applyCooldown();
  form.addEventListener('submit', event => {
    event.preventDefault();
    const { until, errors } = getPenaltyState();
    if (until > Date.now()) { applyCooldown(); return; }
    if (input.value === IDENTIFICATION_CODE) {
      clearPenalty(); completedCount = Math.max(completedCount, 1); saveProgress(currentRefKey, completedCount);
      message.textContent = 'IDENTIFICAÇÃO CONFIRMADA.'; hintBox.hidden = true; input.disabled = true; button.disabled = true;
      setTimeout(() => { renderDashboard(); show(dashboardView); }, 900); return;
    }
    const newErrors = errors + 1;
    const waitMinutes = Math.min(2 ** (newErrors - 1), MAX_COOLDOWN_MINUTES);
    localStorage.setItem(penaltyKey('errors'), String(newErrors));
    localStorage.setItem(penaltyKey('until'), String(Date.now() + waitMinutes * 60 * 1000));
    input.value = ''; renderHint(hintBox, newErrors); applyCooldown();
  });
}

function accordionButton(number, title, contentId) {
  return `<button class="record-toggle" type="button" aria-expanded="false" aria-controls="${contentId}"><span class="record-number">REGISTRO ${String(number).padStart(2,'0')}</span><span class="record-title">${title}</span><span class="record-chevron" aria-hidden="true">›</span></button>`;
}

function attachmentButton(title, meta, contentId) {
  return `<button class="attachment-toggle" type="button" aria-expanded="false" aria-controls="${contentId}"><span><span class="record-title">${title}</span><span class="attachment-meta">${meta}</span></span><span class="record-chevron" aria-hidden="true">›</span></button>`;
}

function bindAccordions(root) {
  root.querySelectorAll('.record-toggle,.attachment-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.getAttribute('aria-controls'));
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      target.hidden = open;
    });
  });
}

function renderAptitude(actions) {
  injectAptitudeStyles();
  actions.innerHTML = `
    <div class="record-stack">
      <article class="record-item">
        ${accordionButton(1, 'MATERIAL DE AVALIAÇÃO', 'record01')}
        <div id="record01" class="record-content" hidden>
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
          <blockquote>o observador poderia acreditar estar controlando aquilo que via quando, na verdade, estaria sendo conduzido por isso.</blockquote>
          <p>A informação obtida por meio do espelho poderia ser usada para aconselhar governantes, antecipar conflitos, identificar inimigos ou interferir em decisões de grande importância.</p>
          <p>Por essa razão, um objeto capaz de oferecer respostas — verdadeiras ou não — seria tão perigoso nas mãos de alguém interessado em poder quanto qualquer arma convencional.</p>
          <h3>JOHN DEE</h3>
          <p>John Dee nasceu na Inglaterra em 1527.</p>
          <p>Foi matemático, astrônomo, estudioso de navegação, alquimia e filosofia natural. Também esteve ligado à corte da rainha Elizabeth I e atuou como conselheiro em assuntos científicos e políticos.</p>
          <p>Ao mesmo tempo, dedicou parte significativa de sua vida ao estudo do que considerava conhecimentos ocultos.</p>
          <p>Dee acreditava que determinadas inteligências espirituais poderiam transmitir informações inacessíveis aos homens.</p>
          <p>Para tentar estabelecer esse contato, trabalhou principalmente com o médium Edward Kelley. Durante essas sessões, Kelley observava superfícies reflexivas enquanto Dee registrava cuidadosamente aquilo que era relatado.</p>
          <p>As anotações resultantes descrevem mensagens, símbolos, alfabetos e longas conversas atribuídas a seres que eles identificavam como anjos.</p>
          <p>Entre os objetos tradicionalmente relacionados a essas práticas encontra-se um <strong>espelho circular de obsidiana negra</strong>.</p>
          <p>A peça é de origem mexicana e pertence a uma tradição muito anterior a Dee. Espelhos semelhantes já possuíam significados religiosos e divinatórios na Mesoamérica antes de chegarem à Europa.</p>
          <p>Dee teria incorporado um desses objetos às suas próprias experiências.</p>
          <p>O que ele acreditava ter visto nele nunca poderá ser determinado com certeza.</p>
          <p>Mas existe uma questão talvez mais importante:</p>
          <blockquote>se um homem acreditasse possuir um instrumento capaz de revelar informações que ninguém mais poderia conhecer, até onde estaria disposto a ir para protegê-lo — ou utilizá-lo?</blockquote>
        </div>
      </article>

      <article class="record-item">
        ${accordionButton(2, 'REGISTRO DE PROCEDÊNCIA', 'record02')}
        <div id="record02" class="record-content" hidden>
          <p>Após a morte de John Dee, em 1608 ou 1609, parte de seus livros e objetos passou para outras mãos.</p>
          <p>Entre esses objetos estaria uma pedra escura e circular utilizada em suas experiências de comunicação espiritual.</p>
          <p>Em 1624, um depoimento judicial registrou a existência, na casa de John Pontois, homem que havia recebido parte dos bens de Dee, de uma <strong>“pedra redonda e plana”</strong> que teria pertencido ao estudioso e que, segundo o relato, lhe permitia conhecer “coisas estranhas”.</p>
          <p>A partir daí, a trajetória da peça torna-se menos clara.</p>
          <p>Décadas depois, o objeto surge associado à coleção dos Condes de Peterborough.</p>
          <p>Por volta de 1770, já estava nas mãos do antiquário inglês <strong>Horace Walpole</strong>.</p>
          <p>O próprio Walpole registrou em seu estojo que aquela era:</p>
          <blockquote>“A pedra negra na qual Dr. Dee costumava chamar seus espíritos.”</blockquote>
          <p>A partir do século XVIII, a história do objeto passa a ser mais bem documentada.</p>
          <p>O espelho atravessou diferentes coleções particulares, foi vendido diversas vezes e, em 1966, entrou para o acervo do <strong>British Museum</strong>, onde permanece associado a John Dee.</p>
          <h3>A VERSÃO ACEITA</h3>
          <p>A peça preservada atualmente é um espelho de obsidiana de origem mexicana.</p>
          <p>Estudos modernos confirmaram que a pedra utilizada em sua fabricação é compatível com depósitos de obsidiana da região de <strong>Pachuca, no México</strong>, território ligado à produção de objetos desse tipo no período asteca.</p>
          <p>Isso reforçou significativamente a hipótese de que o objeto é antigo e de origem mesoamericana.</p>
          <p>Mas não resolveu tudo.</p>
          <p>Os próprios estudos sobre a peça reconhecem que <strong>não se sabe exatamente quando ou como John Dee a adquiriu</strong>, e que existem períodos de sua trajetória em que a sucessão de proprietários não pode ser reconstruída de forma contínua.</p>
          <p>Durante muito tempo, também houve dúvidas sobre a força da própria atribuição do objeto a Dee. Pesquisas mais recentes fortaleceram essa associação, mas não transformaram toda a trajetória da peça em uma cadeia documental perfeita.</p>
          <h3>UMA QUESTÃO DE CONTINUIDADE</h3>
          <p>Um objeto antigo pode ser autêntico.</p><p>Sua origem pode estar correta.</p><p>Sua idade também.</p><p>E ainda assim uma pergunta permanecer:</p>
          <blockquote>é possível demonstrar que o objeto preservado hoje é exatamente o mesmo que esteve nas mãos de John Dee?</blockquote>
          <p>Durante séculos, a resposta aceita foi suficiente.</p>
          <p><strong>Em 1976, deixou de ser.</strong></p>
        </div>
      </article>

      <article class="record-item">
        ${accordionButton(3, 'CORRESPONDÊNCIA ELETRÔNICA — REVISÃO DE PROCEDÊNCIA', 'record03')}
        <div id="record03" class="record-content" hidden>
          <div class="mail-head"><div><span>De:</span> <strong>M. Silva</strong></div><div><span>Para:</span> <strong>R. Almeida</strong></div><div><span>Data:</span> <strong>18 de agosto de 2011 — 22:43</strong></div><div><span>Assunto:</span> <strong>76-01 / revisão de procedência</strong></div></div>
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
          <div class="attachment-list">
            <div class="attachment-item">
              ${attachmentButton('ANEXO A — Ordem de serviço e conservação', '1897 · original em inglês + tradução técnica', 'attachmentA')}
              <div id="attachmentA" class="attachment-content" hidden>
                <p><strong>Origem documental:</strong> Arquivo comercial privado<br><strong>Procedência:</strong> verificada<br><strong>Documento original:</strong> inglês<br><strong>Data:</strong> 14 de março de 1897</p>
                <div class="document-block"><span class="document-label">Original</span><h4>J. H. WHITMORE & SONS</h4><p><em>Conservation of Fine Objects and Furnishings</em><br>London, 14 March 1897</p><p><strong>Client:</strong> Wetherby Family</p><p><strong>Article received:</strong><br>One leather-covered fitted case containing a circular polished black stone.</p><p><strong>Work requested:</strong></p><ul><li>reinforcement of upper hinge;</li><li>repair of closing mechanism;</li><li>stabilization of worn leather edges;</li><li>partial replacement of detached interior lining;</li><li>cleaning of exterior leather without treatment of the contained object.</li></ul><p><strong>Condition upon receipt:</strong></p><p>Exterior leather dry, with minor cracking along lower edge.</p><p>Upper hinge loose but complete.</p><p>Brass closing mechanism functional, showing oxidation around mounting points.</p><p>Dark interior lining detached along approximately one quarter of its perimeter.</p><p>Internal fitted support intact.</p><p>Contained stone visually examined without removal from the fitted support. No fracture or recent structural damage observed.</p><div class="measurements"><strong>CASE DIMENSIONS</strong><p>Diameter: <strong>20 centimetres</strong></p><p>Length: <strong>24 centimetres</strong></p><p>Width: <strong>2.60 centimetres</strong></p></div><p><strong>Materials observed:</strong><br>Dark brown leather exterior; wood structure; dark textile lining; brass fittings.</p><p><strong>Owner's instruction:</strong><br>The original internal fitting is not to be altered. Existing material is to be retained wherever possible.</p><p>No replacement case is to be produced.</p><p><strong>Estimated completion:</strong> 18 working days.</p><p><strong>Handwritten note received with article:</strong><br><em>Do not polish the stone.</em></p></div>
                <div class="document-block"><span class="document-label">Tradução técnica</span><h4>J. H. WHITMORE & SONS</h4><p><em>Conservação de Objetos Finos e Mobiliário</em><br>Londres, 14 de março de 1897</p><p><strong>Cliente:</strong> Família Wetherby</p><p><strong>Objeto recebido:</strong><br>Um estojo ajustado, revestido em couro, contendo uma pedra negra circular e polida.</p><p><strong>Serviço solicitado:</strong></p><ul><li>reforço da dobradiça superior;</li><li>reparo do mecanismo de fechamento;</li><li>estabilização das bordas de couro desgastadas;</li><li>substituição parcial do revestimento interno desprendido;</li><li>limpeza do couro externo sem tratamento do objeto contido.</li></ul><p><strong>Condição no recebimento:</strong></p><p>Couro externo ressecado, apresentando pequenas fissuras na borda inferior.</p><p>Dobradiça superior com folga, porém completa.</p><p>Mecanismo de fechamento em latão funcional, com sinais de oxidação próximos aos pontos de fixação.</p><p>Revestimento interno escuro desprendido em aproximadamente um quarto de seu perímetro.</p><p>Suporte interno moldado preservado.</p><p>A pedra contida foi examinada visualmente sem remoção do suporte. Não foram observadas fraturas ou danos estruturais recentes.</p><div class="measurements"><strong>DIMENSÕES DO ESTOJO</strong><p>Diâmetro: <strong>20 centímetros</strong></p><p>Comprimento: <strong>24 centímetros</strong></p><p>Largura: <strong>2,60 centímetros</strong></p></div><p><strong>Materiais observados:</strong><br>Revestimento externo em couro marrom-escuro; estrutura de madeira; tecido interno escuro; ferragens em latão.</p><p><strong>Instrução do proprietário:</strong><br>O encaixe interno original não deverá ser alterado. Os materiais existentes deverão ser mantidos sempre que possível.</p><p>Não deverá ser produzido um novo estojo.</p><p><strong>Prazo estimado:</strong> 18 dias úteis.</p><p><strong>Anotação manuscrita recebida com o objeto:</strong><br><strong>Não polir a pedra.</strong></p></div>
              </div>
            </div>
            <div class="attachment-item">
              ${attachmentButton('ANEXO B — Registro de transporte', '1911 · original em inglês + tradução técnica', 'attachmentB')}
              <div id="attachmentB" class="attachment-content" hidden>
                <p><strong>Origem documental:</strong> Arquivo comercial da transportadora<br><strong>Procedência:</strong> verificada<br><strong>Documento original:</strong> inglês<br><strong>Data:</strong> 3 de novembro de 1911</p>
                <div class="document-block"><span class="document-label">Original</span><h4>CALDWELL & FINCH</h4><p><em>Carriers of Paintings, Antiquities and Delicate Articles</em></p><p><strong>Shipping Record No. 4117</strong><br>London, 3 November 1911</p><p><strong>Consignor:</strong> A. Wetherby<br><strong>Consignee:</strong> H. L. Harrington</p><p><strong>Declared contents:</strong></p><p>One wooden transport box containing:</p><ul><li>one old leather-covered fitted case;</li><li>one circular object of polished black stone;</li><li>one sealed envelope containing three papers;</li><li>one small cloth pouch containing two unidentified mineral fragments;</li><li>one folded inventory sheet.</li></ul><p><strong>Total declared weight:</strong> 3.8 kilograms</p><p><strong>Declared insurance value:</strong> £35</p><p><strong>Handling instructions:</strong></p><p>Keep dry.</p><p>Do not place beside heating apparatus.</p><p>Do not open the inner fitted case unless required by the consignee.</p><p>Documents are to remain with the principal article.</p><p><strong>Inspection record:</strong></p><p>The package was temporarily retained following a request for clarification concerning the undeclared nature of the mineral fragments.</p><p>Exterior transport box opened in the presence of the carrier's clerk.</p><p>Sealed document envelope intact.</p><p>Inner leather case not opened.</p><p>Package released at 16:40.</p><p><strong>Delivery record:</strong><br>Received the following morning.<br>No damage to exterior packing reported.</p><p><strong>Signed:</strong> H. L. Harrington</p></div>
                <div class="document-block"><span class="document-label">Tradução técnica</span><h4>CALDWELL & FINCH</h4><p><em>Transportadores de Pinturas, Antiguidades e Objetos Delicados</em></p><p><strong>Registro de Transporte nº 4117</strong><br>Londres, 3 de novembro de 1911</p><p><strong>Remetente:</strong> A. Wetherby<br><strong>Destinatário:</strong> H. L. Harrington</p><p><strong>Conteúdo declarado:</strong></p><p>Uma caixa de transporte em madeira contendo:</p><ul><li>um estojo antigo ajustado, revestido em couro;</li><li>um objeto circular de pedra negra polida;</li><li>um envelope lacrado contendo três documentos;</li><li>uma pequena bolsa de tecido contendo dois fragmentos minerais não identificados;</li><li>uma folha de inventário dobrada.</li></ul><p><strong>Peso total declarado:</strong> 3,8 quilogramas</p><p><strong>Valor declarado para seguro:</strong> £35</p><p><strong>Instruções de manuseio:</strong></p><p>Manter seco.</p><p>Não posicionar próximo a equipamentos de aquecimento.</p><p>Não abrir o estojo interno ajustado, salvo por solicitação do destinatário.</p><p>Os documentos deverão permanecer junto ao objeto principal.</p><p><strong>Registro de inspeção:</strong></p><p>O volume foi retido temporariamente após solicitação de esclarecimentos quanto à natureza não declarada dos fragmentos minerais.</p><p>A caixa externa de transporte foi aberta na presença do funcionário da transportadora.</p><p>Envelope contendo documentos permaneceu lacrado.</p><p>O estojo interno de couro não foi aberto.</p><p>Volume liberado às 16h40.</p><p><strong>Registro de entrega:</strong><br>Recebido na manhã seguinte.<br>Nenhum dano à embalagem externa foi registrado.</p><p><strong>Assinado:</strong> H. L. Harrington</p></div>
              </div>
            </div>
            <div class="attachment-item">
              ${attachmentButton('ANEXO C — Correspondência particular', '1923 · original em inglês + tradução técnica', 'attachmentC')}
              <div id="attachmentC" class="attachment-content" hidden>
                <p><strong>Origem documental:</strong> Arquivo familiar Harrington<br><strong>Procedência:</strong> verificada<br><strong>Documento original:</strong> inglês<br><strong>Data:</strong> 27 de maio de 1923</p>
                <div class="document-block"><span class="document-label">Original</span><p>27 May 1923</p><p>Edward,</p><p>I found the papers you asked about.</p><p>They were kept with Father's records, in the same drawer as the receipts concerning the black mirror.</p><p>I cannot tell you much more than I did before.</p><p>Father never regarded the thing as particularly valuable in the ordinary sense. He owned paintings worth considerably more and never treated any of them with the same caution.</p><p>He insisted that the mirror remain with the papers and with the case in which it had come to the family.</p><p>I once asked why.</p><p>He said that separating them would make it impossible, one day, to know what had actually passed through our hands.</p><p>At the time I thought this was merely another of his peculiarities.</p><p>On two occasions he considered offering the object to an institution. Both attempts ended after he received conflicting opinions regarding its history.</p><p>One gentleman dismissed the story entirely.</p><p>Another asked to examine the object privately before committing anything to writing.</p><p>Father refused.</p><p>There is one sentence of his that I remember particularly well:</p><blockquote>“A story survives only for as long as its evidence does.”</blockquote><p>After his death I found transport papers, an old repair account, several notes concerning previous owners and a sealed envelope whose contents I was instructed not to separate.</p><p>I cannot say which of these things remains important.</p><p>Perhaps none of them.</p><p>But since you asked me to preserve everything, I have done so.</p><p>Eleanor</p></div>
                <div class="document-block"><span class="document-label">Tradução técnica</span><p>27 de maio de 1923</p><p>Edward,</p><p>encontrei os documentos sobre os quais você perguntou.</p><p>Eles estavam guardados junto aos registros de meu pai, na mesma gaveta dos recibos relacionados ao espelho negro.</p><p>Não consigo lhe dizer muito além do que já disse anteriormente.</p><p>Meu pai nunca considerou o objeto particularmente valioso no sentido comum. Possuía pinturas de valor muito superior e jamais tratou nenhuma delas com o mesmo cuidado.</p><p>Ele insistia que o espelho permanecesse junto dos documentos e do estojo com o qual havia chegado à família.</p><p>Certa vez perguntei o motivo.</p><p>Ele respondeu que separá-los tornaria impossível, algum dia, saber o que realmente havia passado por nossas mãos.</p><p>Na época, considerei aquilo apenas mais uma de suas peculiaridades.</p><p>Em duas ocasiões ele cogitou oferecer o objeto a uma instituição. Ambas as tentativas terminaram depois que recebeu opiniões contraditórias sobre sua história.</p><p>Um dos homens descartou completamente o relato.</p><p>Outro pediu para examinar o objeto em particular antes de registrar qualquer opinião por escrito.</p><p>Meu pai recusou.</p><p>Há uma frase dele da qual me lembro particularmente bem:</p><blockquote>“Uma história sobrevive apenas enquanto suas evidências sobreviverem.”</blockquote><p>Depois de sua morte, encontrei documentos de transporte, uma antiga conta de reparo, diversas anotações sobre proprietários anteriores e um envelope lacrado cujo conteúdo fui instruída a não separar.</p><p>Não sei dizer quais dessas coisas ainda possuem importância.</p><p>Talvez nenhuma.</p><p>Mas, como você me pediu para preservar tudo, foi o que fiz.</p><p>Eleanor</p></div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article class="record-item">
        ${accordionButton(4, 'REFERÊNCIAS DE REVISÃO', 'record04')}
        <div id="record04" class="record-content" hidden>
          <p><strong>Referência:</strong> 76-01<br><strong>Data:</strong> 21 de agosto de 2011</p>
          <p>Durante a revisão do material, foram consultadas fontes públicas e registros complementares relacionados ao objeto, sua procedência e seus antigos proprietários.</p>
          <p>As referências abaixo foram mantidas por apresentarem informações potencialmente úteis à comparação documental.</p>
          <p>Nem todas necessariamente possuem relação direta com a questão principal.</p>
          <h3>FONTES CONSULTADAS</h3>
          <div class="source-links">
            <a class="source-link" href="https://www.rmg.co.uk/collections/library/rmgl-13500" target="_blank" rel="noopener noreferrer"><strong>Royal Museums Greenwich — Registros biográficos de John Dee</strong><small>rmg.co.uk/collections/library/rmgl-13500</small></a>
            <a class="source-link" href="https://www.britishmuseum.org/collection/object/H_1966-1001-1?selectedImageId=1045525001" target="_blank" rel="noopener noreferrer"><strong>British Museum — Registro da coleção: espelho de obsidiana associado a John Dee</strong><small>britishmuseum.org/collection/object/H_1966-1001-1</small></a>
            <a class="source-link" href="https://www.cambridge.org/core/journals/antiquity/article/mirror-the-magus-and-more-reflections-on-john-dees-obsidian-mirror/38D4BFEA2CB9766973791029C2EE1289" target="_blank" rel="noopener noreferrer"><strong>Antiquity / Cambridge University Press — Análise da origem dos espelhos de obsidiana</strong><small>cambridge.org/core/journals/antiquity/...</small></a>
            <a class="source-link" href="https://library.si.edu/digital-library/book/descriptivecata00bull" target="_blank" rel="noopener noreferrer"><strong>Smithsonian Libraries — Catálogo da exposição Ancient and Modern Mexico, Londres, 1824</strong><small>library.si.edu/digital-library/book/descriptivecata00bull</small></a>
          </div>
        </div>
      </article>
    </div>

    <form id="aptitudeForm" class="aptitude-prompt" autocomplete="off">
      <p><strong>Antes de prosseguir, precisamos avaliar como você lida com informações conflitantes.</strong></p>
      <p>Os registros apresentados não foram reunidos para contar uma história completa. Eles foram preservados porque, em algum momento, alguém considerou que certas diferenças mereciam uma segunda análise.</p>
      <p>Seu objetivo não é provar uma teoria, nem confirmar a autenticidade de qualquer objeto.</p>
      <p>É mais simples que isso.</p>
      <p><strong>Leia, compare e identifique qual elemento apresenta uma inconsistência entre os registros.</strong></p>
      <label class="aptitude-question" for="aptitudeAnswer">QUAL ELEMENTO APRESENTA INCONSISTÊNCIA ENTRE OS REGISTROS?</label>
      <input id="aptitudeAnswer" class="aptitude-answer" type="text" autocomplete="off" required />
      <button class="primary-btn" type="submit">VALIDAR</button>
      <p id="aptitudeFeedback" class="aptitude-feedback" role="status"></p>
    </form>`;

  bindAccordions(actions);
  const form = actions.querySelector('#aptitudeForm');
  const input = actions.querySelector('#aptitudeAnswer');
  const feedback = actions.querySelector('#aptitudeFeedback');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const answer = normalizeAnswer(input.value);
    if (!APTITUDE_ANSWER.includes(answer)) {
      feedback.classList.remove('ok');
      feedback.textContent = 'RESPOSTA NÃO CONFIRMADA. Revise os registros antes de tentar novamente.';
      return;
    }
    completedCount = Math.max(completedCount, 2);
    saveProgress(currentRefKey, completedCount);
    feedback.classList.add('ok');
    feedback.textContent = 'INCONSISTÊNCIA IDENTIFICADA.';
    input.disabled = true;
    form.querySelector('button').disabled = true;
    stageStatus.textContent = 'concluída';
    setTimeout(() => { renderDashboard(); show(dashboardView); }, 1100);
  });
}

function openStage(index) {
  const step = index + 1;
  const stage = stages[index];
  const state = stageVisualState(step);
  if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
  document.querySelector('#stageCode').textContent = `ETAPA ${String(step).padStart(2, '0')}`;
  document.querySelector('#stageName').textContent = stage.name;
  document.querySelector('#stageContext').textContent = stage.context;
  const stageMission = document.querySelector('#stageMission');
  stageMission.hidden = step === 1 || step === 2;
  stageMission.textContent = stageMission.hidden ? '' : stage.mission;
  stageStatus.textContent = state === 'done' ? 'concluída' : state === 'available' ? 'disponível' : 'bloqueada';
  const actions = document.querySelector('#stageActions');
  actions.innerHTML = '';

  if (step === 1 && state === 'available') { renderIdentificationForm(actions); show(stageView); return; }
  if (step === 2 && (state === 'available' || state === 'done')) { renderAptitude(actions); show(stageView); return; }

  if (state === 'available' && step < stages.length) {
    const complete = document.createElement('button');
    complete.className = 'primary-btn'; complete.textContent = 'Simular conclusão';
    complete.addEventListener('click', () => { completedCount = Math.min(stages.length, completedCount + 1); saveProgress(currentRefKey, completedCount); renderDashboard(); show(dashboardView); });
    actions.appendChild(complete);
  }
  if (state === 'available' && step === stages.length) {
    const complete = document.createElement('button');
    complete.className = 'primary-btn'; complete.textContent = 'Simular admissão';
    complete.addEventListener('click', () => {
      completedCount = stages.length; saveProgress(currentRefKey, completedCount); renderDashboard();
      document.querySelector('#stageContext').textContent = 'PROCESSO CONCLUÍDO.';
      stageMission.hidden = false; stageMission.textContent = 'Nesta versão-base, o próximo passo será o encaminhamento para o futuro ambiente permanente.';
      stageStatus.textContent = 'finalizado'; actions.innerHTML = '<p class="demo-note">A versão definitiva poderá gerar uma credencial de admissão e liberar o segundo site.</p>';
    });
    actions.appendChild(complete);
  }
  if (step > 2) {
    const note = document.createElement('p'); note.className = 'demo-note'; note.textContent = 'Conteúdo provisório para validar navegação, estética e experiência no celular.'; actions.appendChild(note);
  }
  show(stageView);
}

function openPrintDialog() { printDialog.hidden = false; document.body.style.overflow = 'hidden'; closePrintDialog.focus(); }
function closePrintModal() { printDialog.hidden = true; document.body.style.overflow = ''; importantInfoBtn.focus(); }
importantInfoBtn.addEventListener('click', openPrintDialog);
closePrintDialog.addEventListener('click', closePrintModal);
printDialog.addEventListener('click', event => { if (event.target === printDialog) closePrintModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !printDialog.hidden) closePrintModal(); });

document.querySelector('#accessForm').addEventListener('submit', event => {
  event.preventDefault();
  const refKey = normalizeRef(referenceInput.value);
  if (!REFERENCES[refKey]) { loginMessage.textContent = 'Referência não localizada.'; return; }
  currentRefKey = refKey; currentRefLabel = REFERENCES[refKey]; completedCount = loadProgress(refKey); loginMessage.textContent = ''; renderDashboard(); show(dashboardView);
});

document.querySelector('#logoutBtn').addEventListener('click', () => {
  if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
  currentRefKey = null; currentRefLabel = null; referenceInput.value = ''; show(loginView);
});

document.querySelector('#backBtn').addEventListener('click', () => {
  if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
  renderDashboard(); show(dashboardView);
});
