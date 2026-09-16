// ETAPA 06 — procedimento do espelho
(function () {
  const stageIndex = stages.findIndex(stage => stage && stage.name === 'Discernimento');
  const stageStep = stageIndex + 1;
  const correctRunes = ['rune_04', 'rune_11', 'rune_03', 'rune_07', 'rune_14', 'rune_12', 'rune_13'];
  const runeSymbols = ['✢','⌬','⟡','✦','⊹','⟁','☽','⟟','✧','⨳','♜','◈','✣','⨯'];

  // Fonte, URL e anotações podem ser trocadas aqui sem alterar a lógica do procedimento.
  const runeOccurrences = [
    { id: 1, rune: 'rune_04', source: 'Convite', description: 'A primeira esteve em suas mãos antes mesmo de o processo começar.', url: null, hints: ['Ela antecede seu primeiro acesso ao protocolo.','Não procure entre os arquivos investigados posteriormente.','O sinal foi apresentado quando você ainda não sabia que havia algo a procurar.','Observe novamente o material pelo qual tudo começou.','Examine atentamente os elementos gráficos do convite.'] },
    { id: 2, rune: 'rune_11', source: 'The Obscure', description: 'A segunda permanece onde o obscuro foi deixado para trás.', url: null, hints: ['Você já esteve nesse lugar.','Ele não pertence ao protocolo propriamente dito.','Foi encontrado durante uma investigação anterior.','Retorne ao arquivo digital abandonado.','Procure novamente no site The Obscure.'] },
    { id: 3, rune: 'rune_03', source: 'Instituição pública', description: 'Uma foi preservada por uma instituição pública entre registros que não tratam do oculto.', url: null, hints: ['O sinal não é o assunto principal do registro.','A instituição responsável não o classifica como elemento esotérico.','Procure entre acervos históricos oficiais.','A ocorrência está associada a um documento ou imagem preservada digitalmente.','A referência direta à instituição será preservada no arquivo quando definida.'] },
    { id: 4, rune: 'rune_07', source: 'Monumento', description: 'Outra continua exposta em pedra, diante de milhares de pessoas que nunca tiveram motivo para observá-la.', url: null, hints: ['Ela não está guardada.','Pode ser vista sem autorização ou acesso especial.','Não procure dentro de museus.','O sinal faz parte de um monumento ou estrutura pública.','A referência indireta ao monumento será incorporada ao arquivo quando definida.'] },
    { id: 5, rune: 'rune_14', source: 'Obra digitalizada', description: 'Uma sobrevive entre as páginas digitalizadas de uma obra que já não pertence a ninguém.', url: null, hints: ['Não se trata de uma página da internet originalmente digital.','A obra existia muito antes da rede.','Seu conteúdo pode ser consultado livremente.','Procure em acervos de obras históricas digitalizadas e em domínio público.','O título e a página aproximada serão preservados no arquivo quando definidos.'] },
    { id: 6, rune: 'rune_12', source: 'Imagem histórica', description: 'Outra foi preservada em uma imagem histórica cujo assunto nada tem a ver com o símbolo que contém.', url: null, hints: ['O sinal não é o objeto fotografado.','Ele ocupa uma posição secundária na imagem.','Quem catalogou a fotografia provavelmente não o percebeu como relevante.','Observe fundos, paredes, objetos e detalhes periféricos.','A referência ao acervo será incorporada ao arquivo quando definida.'] },
    { id: 7, rune: 'rune_13', source: 'Vídeo', description: 'A última ainda pode ser vista em movimento. Está onde muitos assistiram — poucos olharam.', url: null, hints: ['A ocorrência dura apenas alguns instantes.','Não está no título nem na descrição.','É preciso observar a imagem, não apenas acompanhar o conteúdo.','Ela aparece em material audiovisual disponível publicamente.','A referência e a faixa de tempo serão incorporadas ao arquivo quando definidas.'] }
  ];

  const researchReferences = [
    { id:'ref01', code:'REF-01', title:'MATERIAL DE INGRESSO', body:[
      'Entre as referências preservadas há menção a um sinal reproduzido em um material destinado a marcar o início de um processo.',
      'O texto original não especifica instituição, data ou destinatário.',
      'Há apenas a indicação de que a marca deveria estar presente <strong>antes do primeiro acesso</strong>, incorporada ao próprio material recebido pelo participante.',
      'Durante a revisão dos registros recentes, foi identificada uma possível correspondência.',
      'Nenhuma relação com o procedimento havia sido percebida naquele momento.',
      'Se a interpretação estiver correta, o sinal permaneceu visível desde o início.',
      '<strong>O material ainda está disponível.</strong>'
    ], levels:[
      'A primeira leitura do material não permitiu isolar uma marca com segurança.',
      'A composição deve ser examinada por inteiro, incluindo detalhes que não parecem fazer parte do texto principal.',
      'A marca, caso exista, pode ter sido apresentada antes que houvesse qualquer razão para procurá-la.',
      'Compare os elementos encontrados com as formas atualmente dispostas ao redor da superfície.',
      'Nenhuma identificação foi confirmada neste registro.'
    ]},
    { id:'ref02', code:'REF-02', title:'ARQUIVO ABANDONADO', body:[
      'A segunda referência descreve uma marca preservada em um arquivo deixado fora de circulação.',
      'As anotações mencionam conteúdo relacionado a assuntos incomuns, mantido acessível mesmo depois de o restante da estrutura ter sido abandonado.',
      'Não há indicação de que a marca fosse o assunto principal da página.',
      'Ela parece ter sido incorporada como elemento secundário — possivelmente gráfico, decorativo ou parte de uma imagem.',
      'Durante este processo, um arquivo com características semelhantes já foi consultado.',
      'Na ocasião, nenhuma atenção foi dada aos sinais presentes em sua composição.',
      '<strong>Talvez seja necessário olhar novamente.</strong>'
    ], levels:[
      'O registro não indica que a marca seja legível de imediato.',
      'A busca deve considerar elementos gráficos secundários, não apenas o conteúdo textual.',
      'O estado de abandono do arquivo não reduz a relevância de seus detalhes preservados.',
      'Uma comparação visual continua necessária antes de qualquer conclusão.',
      'Nenhuma identificação foi confirmada neste registro.'
    ]},
    { id:'ref03', code:'REF-03', title:'ACERVO PÚBLICO', body:[
      'Uma das referências aponta para material preservado por uma instituição pública.',
      'O registro não está classificado como ocultista, religioso ou esotérico.',
      'Tudo indica que o sinal aparece em um documento ou imagem cuja importância reconhecida é completamente diferente.',
      'Isso pode explicar por que permaneceu preservado por tanto tempo sem receber atenção específica.',
      'O texto menciona um acervo acessível para consulta e sugere que a marca não ocupa posição de destaque.',
      'Não procure um arquivo sobre símbolos.',
      '<strong>Procure um arquivo que não sabe que contém um.</strong>'
    ], levels:[
      'O assunto principal do acervo não deve orientar sozinho a investigação.',
      'A marca pode estar associada a um detalhe que a catalogação não descreve.',
      'Examine margens, fundos e elementos periféricos com a mesma atenção dedicada ao documento principal.',
      'A relação com o procedimento permanece apenas hipotética.',
      'Nenhuma identificação foi confirmada neste registro.'
    ]},
    { id:'ref04', code:'REF-04', title:'PEDRA', body:[
      'Outra referência descreve uma marca que não foi preservada em papel.',
      'Ela permanece exposta.',
      'O texto menciona pedra trabalhada, acesso público e grande circulação de pessoas.',
      'Não há indicação de que seja necessário entrar em qualquer edifício ou solicitar autorização para observá-la.',
      'A marca parece fazer parte de uma estrutura construída para outra finalidade.',
      'Milhares de pessoas podem ter passado diante dela sem qualquer motivo para isolá-la do restante da composição.',
      'O autor registra apenas:',
      '<q>Ainda está lá.</q>',
      'Se a referência continua válida, <strong>o sinal permanece visível hoje</strong>.'
    ], levels:[
      'A escala da estrutura pode dificultar a percepção de um detalhe isolado.',
      'A marca não deve ser presumida como elemento central da construção.',
      'Observe a superfície, os limites e os elementos decorativos sem antecipar uma forma específica.',
      'O acesso público torna possível a consulta, mas não confirma a correspondência.',
      'Nenhuma identificação foi confirmada neste registro.'
    ]},
    { id:'ref05', code:'REF-05', title:'OBRA DIGITALIZADA', body:[
      'Esta referência conduz a uma obra produzida muito antes de sua disponibilização em meio digital.',
      'O original não foi criado para a internet.',
      'A digitalização apenas preservou algo que já estava presente nas páginas.',
      'A anotação não informa se o sinal aparece no texto, em uma ilustração, na margem ou em algum elemento editorial.',
      'Há, porém, uma indicação de que a obra pode ser consultada livremente e que sua reprodução integral ainda existe.',
      'O sinal pode ter permanecido naquele lugar durante séculos sem qualquer relação conhecida com esta investigação.',
      '<strong>A página foi preservada.</strong>',
      'É necessário encontrá-la.'
    ], levels:[
      'A paginação e a reprodução digital podem esconder detalhes em escala reduzida.',
      'A consulta deve preservar o contexto editorial da página, não apenas uma transcrição.',
      'Ilustrações, capitulares e margens devem ser consideradas.',
      'A antiguidade da obra não é prova de que a marca pertença ao procedimento.',
      'Nenhuma identificação foi confirmada neste registro.'
    ]},
    { id:'ref06', code:'REF-06', title:'REGISTRO FOTOGRÁFICO', body:[
      'Uma fotografia histórica é citada entre as referências.',
      'O sinal não é o tema da imagem.',
      'Segundo as anotações, ele aparece em algum ponto secundário do enquadramento e não foi mencionado na catalogação conhecida.',
      'Isso sugere que a marca pode estar em uma parede, objeto, placa, estrutura ou elemento de fundo.',
      'A fotografia teria sido preservada pelo valor histórico de outra coisa completamente diferente.',
      'Talvez ninguém responsável pelo arquivo tenha tido motivo para observar aquele detalhe.',
      'A indicação deixada no documento é curta:',
      '<q>Não olhe para aquilo que foi fotografado.</q>'
    ], levels:[
      'O enquadramento pode conter informações que não participam do motivo histórico da fotografia.',
      'A investigação deve considerar os extremos e o plano de fundo da imagem.',
      'Não é possível presumir tamanho, posição ou contraste do sinal.',
      'A marca precisa ser comparada à superfície antes de ser considerada relevante.',
      'Nenhuma identificação foi confirmada neste registro.'
    ]},
    { id:'ref07', code:'REF-07', title:'REGISTRO EM MOVIMENTO', body:[
      'A última referência é diferente das demais.',
      'Não aponta para um objeto estático.',
      'As anotações descrevem uma marca visível em um registro audiovisual disponível para consulta pública.',
      'Sua aparição é breve.',
      'O sinal não é mencionado no título, na descrição ou no assunto principal do material.',
      'Quem assiste normalmente não tem motivo para procurar por ele.',
      'Não sabemos se foi colocado deliberadamente ou se apenas fazia parte do ambiente registrado.',
      'O documento contém uma única observação adicional:',
      '<q>Muitos viram a gravação. Poucos viram a marca.</q>',
      'Ela ainda deve estar lá.'
    ], levels:[
      'A brevidade da ocorrência impede que ela seja encontrada apenas pela descrição do material.',
      'A observação deve priorizar os detalhes do ambiente em vez do assunto registrado.',
      'A repetição da consulta pode ser necessária, mas não é uma condição automática de liberação.',
      'A possível marca deve ser confrontada com o conjunto mantido ao redor da superfície.',
      'Nenhuma identificação foi confirmada neste registro.'
    ]}
  ];

  const researchAccessPolicy = {
    canAdvance(reference, nextLevel, state) {
      // Futuras condições podem consultar progresso, marcas e reconstrução aqui.
      return nextLevel <= reference.levels.length;
    }
  };

  function key(name) { return currentRefKey ? 'stage6:' + name + ':' + currentRefKey : null; }
  function read(name, fallback) {
    const stored = key(name) && localStorage.getItem(key(name));
    if (!stored) return fallback;
    try { return JSON.parse(stored); } catch (_) { return fallback; }
  }
  function write(name, value) { if (key(name)) localStorage.setItem(key(name), JSON.stringify(value)); }
  function hasVisited() { return Boolean(key('visited') && localStorage.getItem(key('visited')) === '1'); }
  function visit() { if (key('visited')) localStorage.setItem(key('visited'), '1'); }
  function documentSeen() { return Boolean(key('document') && localStorage.getItem(key('document')) === '1'); }
  function remainDefault() { return runeSymbols.map((_, index) => 'rune_' + String(index + 1).padStart(2, '0')); }

  window.onMirrorActivated = window.onMirrorActivated || function () {
    if (key('activated')) localStorage.setItem(key('activated'), '1');
  };

  function renderProcedureDocument() {
    if (!currentRefKey) return;
    localStorage.setItem(key('document'), '1');
    document.querySelector('#stageCode').textContent = 'ARQUIVO RECUPERADO';
    document.querySelector('#stageName').textContent = 'NEM TODOS OS OLHOS VEEM O MESMO.';
    document.querySelector('#stageStatus').textContent = 'CLASSIFICAÇÃO: PROCEDIMENTO / SUPERFÍCIE REFLEXIVA';
    const panelHead = document.querySelector('.detail-panel .panel-head');
    if (panelHead) panelHead.hidden = true;
    const context = document.querySelector('#stageContext');
    const mission = document.querySelector('#stageMission');
    context.hidden = true; mission.hidden = true;
    const actions = document.querySelector('#stageActions');
    const procedureText = [
      'Os primeiros registros conhecidos do fenômeno apresentam uma característica que, durante muito tempo, foi tratada como secundária.',
      'Havia sinais traçados ao redor da superfície.',
      'Não sabemos quem os introduziu.',
      'Também não sabemos qual era sua função.',
      'Por décadas, foram interpretados como ornamentação, marcação ritual ou simples identificação do procedimento.',
      'Essa hipótese mudou quando diferentes registros de sessão foram comparados.',
      'Nas experiências em que a imagem permaneceu estável por mais tempo, os sinais estavam presentes.',
      'Nas demais, estavam ausentes, incompletos ou dispostos de maneira diferente.',
      'O problema surgiu depois.',
      'Os registros originais não sobreviveram intactos.',
      'As marcas foram copiadas, redesenhadas e reproduzidas por pessoas diferentes, em épocas diferentes.',
      'Ao final da investigação, <strong>quatorze sinais distintos</strong> haviam sido associados ao procedimento.',
      'Sem qualquer forma segura de determinar quais eram autênticos, todos foram mantidos ao redor da superfície.',
      'As tentativas posteriores permaneceram inconclusivas.',
      '<strong>Até recentemente.</strong>',
      'Entre materiais ainda não catalogados relacionados às primeiras sessões, foi localizado um documento incompleto.',
      'As figuras que originalmente acompanhavam o texto não foram preservadas.',
      'Uma informação, porém, permanece legível:',
      '<strong>o procedimento utilizava sete sinais.</strong>',
      'Não quatorze.',
      'O documento também faz referência a registros independentes nos quais essas mesmas marcas teriam sido encontradas novamente.',
      'Se essas referências puderem ser localizadas, talvez seja possível reconstruir o conjunto original.',
      'As quatorze marcas permanecem onde foram deixadas.',
      '<strong>Sete pertencem ao procedimento.</strong>',
      '<strong>Sete não deveriam estar ali.</strong>',
      'Apague as marcas incorretas.',
      'Mantenha apenas o conjunto original.',
      'Se os registros estiverem corretos, a superfície deverá responder.'
    ];
    const referenceText = [
      'O documento recentemente localizado não contém representações legíveis dos sete sinais.',
      'As figuras que acompanhavam as anotações foram perdidas, removidas ou deterioradas a ponto de impedir qualquer identificação segura.',
      'As referências associadas a elas, entretanto, permanecem parcialmente preservadas.',
      'O texto sugere que os sinais utilizados no procedimento não permaneceram restritos ao espelho.',
      'Aparentemente, as mesmas marcas foram registradas em lugares, objetos, imagens e documentos distintos.',
      'Não sabemos se foram inseridas deliberadamente nesses locais, se serviram como referências para reproduzir o conjunto ou se já estavam presentes quando passaram a ser relacionadas ao fenômeno.',
      'O documento não esclarece essa origem.',
      'Também não explica por que determinadas fontes foram escolhidas.',
      'Há apenas uma orientação repetida nas anotações:',
      '<q>LOCALIZE AS MARCAS QUE FORAM DEIXADAS.</q>',
      'Sete referências permanecem legíveis.',
      'Duas delas, por coincidência ou intenção ainda desconhecida, parecem corresponder a materiais que já fizeram parte deste processo.',
      'As demais apontam para fontes que, ao que tudo indica, ainda podem ser consultadas.',
      'Se nossa leitura estiver correta, cada referência pode conduzir a uma das marcas utilizadas no procedimento original.',
      'Não sabemos se todas permanecem visíveis.',
      'Não sabemos se foram preservadas intactas.',
      'E ainda não sabemos por que aparecem em contextos sem relação aparente entre si.',
      '<strong>As figuras desapareceram.<br>As referências, não.</strong>',
      '<strong>Siga os registros.<br>Localize as marcas.</strong>'
    ];
    const paragraphs = lines => lines.map(line => line.indexOf('<q>') === 0 ? '<blockquote>' + line.slice(3, -4) + '</blockquote>' : '<p>' + line + '</p>').join('');
    const archive = researchReferences.map(reference => {
      return '<article class="reference-file" data-reference="' + reference.id + '">' +
        '<header><span>' + reference.code + '</span><h3>' + reference.title + '</h3><small>REGISTRO PRESERVADO</small></header>' +
        '<div class="reference-body">' + paragraphs(reference.body) + '</div>' +
        '<div class="research-results"></div><p class="research-message" aria-live="polite"></p>' +
        '<button class="research-button" type="button" data-research="' + reference.id + '">APROFUNDAR PESQUISA</button></article>';
    }).join('');
    actions.innerHTML = '<section class="recovered-dossier">' +
      '<header class="recovered-header"><p>ARQUIVO RECUPERADO</p><small>CLASSIFICAÇÃO: PROCEDIMENTO / SUPERFÍCIE REFLEXIVA</small><h1>NEM TODOS OS OLHOS VEEM O MESMO.</h1></header>' +
      '<div class="dossier-divider"></div>' +
      '<article class="dossier-document"><p class="dossier-label">DOCUMENTO I</p><h2>NOTA DE PROCEDIMENTO</h2><div class="dossier-copy">' + paragraphs(procedureText) + '</div></article>' +
      '<div class="dossier-divider"></div>' +
      '<article class="dossier-document"><p class="dossier-label">DOCUMENTO II</p><h2>REFERÊNCIAS PRESERVADAS</h2><div class="dossier-copy">' + paragraphs(referenceText) + '</div></article>' +
      '<div class="dossier-divider"></div><section class="reference-archive" aria-label="Documentos de referência">' + archive + '</section>' +
      '<button class="mirror-back procedure-back" type="button">VOLTAR AO PROTOCOLO</button></section>';
    const researchState = read('research', {});
    function drawResearch(reference, file) {
      const saved = researchState[reference.id] || { opened:false, level:0, consulted:[] };
      const result = file.querySelector('.research-results');
      result.innerHTML = reference.levels.slice(0, saved.level).map((level, index) => '<p><span>NÍVEL ' + String(index + 1).padStart(2, '0') + '</span>' + level + '</p>').join('');
      const button = file.querySelector('.research-button');
      button.textContent = saved.level >= reference.levels.length ? 'CONSULTA ESGOTADA' : 'APROFUNDAR PESQUISA';
    }
    researchReferences.forEach(reference => {
      const file = actions.querySelector('[data-reference="' + reference.id + '"]');
      drawResearch(reference, file);
      file.querySelector('.research-button').addEventListener('click', () => {
        const saved = researchState[reference.id] || { opened:false, level:0, consulted:[] };
        saved.opened = true;
        const nextLevel = saved.level + 1;
        const message = file.querySelector('.research-message');
        if (!researchAccessPolicy.canAdvance(reference, nextLevel, researchState)) {
          message.innerHTML = 'Investigação insuficiente.<br>Examine a referência antes de aprofundar a consulta.';
          write('research', researchState);
          return;
        }
        if (saved.level >= reference.levels.length) {
          message.textContent = 'Investigação insuficiente.';
          write('research', researchState);
          return;
        }
        saved.level = nextLevel;
        if (!saved.consulted.includes(nextLevel)) saved.consulted.push(nextLevel);
        researchState[reference.id] = saved;
        message.textContent = '';
        write('research', researchState);
        drawResearch(reference, file);
      });
    });
    actions.querySelector('.procedure-back').addEventListener('click', () => { renderDashboard(); show(dashboardView); });
    show(stageView);
  }

  function enableProtocolClue() {
    const quote = document.querySelector('#dashboardView .quote');
    if (!quote) return;
    const active = hasVisited();
    quote.classList.toggle('mirror-protocol-link', active);
    if (!active) {
      quote.textContent = '“Nem todos os olhos veem o mesmo.”';
      return;
    }
    if (quote.querySelector('a')) return;
    quote.innerHTML = '<a href="#procedimento-espelho">“Nem todos os olhos veem o mesmo.”</a>';
    quote.querySelector('a').addEventListener('click', event => {
      event.preventDefault();
      renderProcedureDocument();
    });
  }

  const previousDashboard = renderDashboard;
  renderDashboard = function () {
    previousDashboard();
    enableProtocolClue();
  };

  function renderMirrorStage() {
    const actions = document.querySelector('#stageActions');
    const context = document.querySelector('#stageContext');
    const mission = document.querySelector('#stageMission');
    const panelHead = document.querySelector('.detail-panel .panel-head');
    if (!actions || !currentRefKey) return;
    visit();
    context.hidden = true;
    mission.hidden = true;
    if (panelHead) panelHead.hidden = true;

    let remaining = read('remaining', remainDefault());
    if (!Array.isArray(remaining) || remaining.length < 7 || remaining.length > runeSymbols.length || !remaining.every(id => remainDefault().includes(id))) remaining = remainDefault();
    const activated = key('activated') && localStorage.getItem(key('activated')) === '1';
    const unlocked = documentSeen();

    actions.innerHTML = '<section class="mirror-procedure ' + (unlocked ? 'is-unlocked' : 'is-sealed') + (activated ? ' is-activated' : '') + '">' +
      '<p class="mirror-question">O que, exatamente, o espelho mostra?</p>' +
      '<div class="mirror-field" aria-label="Espelho negro e marcas do procedimento">' +
      '<div class="mirror-rim"></div><div class="mirror-surface"><span>Nem todos os olhos veem o mesmo.</span></div>' +
      runeSymbols.map((symbol, index) => {
        const id = 'rune_' + String(index + 1).padStart(2, '0');
        const visible = remaining.includes(id);
        return '<button class="mirror-rune ' + (visible ? 'is-present' : 'is-erased') + '" type="button" data-rune="' + id + '" aria-label="Marca ' + String(index + 1).padStart(2, '0') + '">' + symbol + '</button>';
      }).join('') +
      '<div class="mirror-base" aria-hidden="true"></div></div><p class="mirror-status" role="status"></p>' +
      '<button type="button" class="mirror-back">VOLTAR</button></section>';

    const status = actions.querySelector('.mirror-status');
    const field = actions.querySelector('.mirror-field');
    actions.querySelector('.mirror-back').addEventListener('click', () => { renderDashboard(); show(dashboardView); });
    if (!unlocked || activated) return;

    function check() {
      if (remaining.length !== 7) return;
      const correct = correctRunes.every(id => remaining.includes(id));
      if (!correct) return;
      field.classList.add('is-responding');
      field.querySelectorAll('.mirror-rune').forEach(button => button.disabled = true);
      setTimeout(() => {
        localStorage.setItem(key('activated'), '1');
        window.onMirrorActivated();
        field.classList.add('is-activated');
        status.textContent = '';
      }, 1400);
    }

    actions.querySelectorAll('.mirror-rune').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.rune;
      const present = remaining.includes(id);
      if (present && remaining.length <= 7) {
        status.textContent = 'Sete devem permanecer.';
        setTimeout(() => { if (status.textContent === 'Sete devem permanecer.') status.textContent = ''; }, 2400);
        return;
      }
      remaining = present ? remaining.filter(value => value !== id) : remaining.concat(id);
      write('remaining', remaining);
      button.classList.toggle('is-present', !present);
      button.classList.toggle('is-erased', present);
      check();
    }));
    check();
  }

  const previousOpenStage = openStage;
  openStage = function (index) {
    previousOpenStage(index);
    if (index !== stageIndex) return;
    setTimeout(renderMirrorStage, 0);
  };

  const style = document.createElement('style');
  style.textContent = [
    '.mirror-protocol-link a{color:inherit;text-decoration:none;cursor:pointer;transition:opacity .2s,text-shadow .2s}.mirror-protocol-link a:hover{opacity:1;text-shadow:0 0 9px rgba(115,224,201,.48)}',
    '.procedure-document{padding-top:4px;color:#d9c6a2;font:14px/1.7 Georgia,serif}.procedure-copy{max-width:650px;margin:auto}.procedure-copy p{margin:0 0 13px}.procedure-known{margin:28px 0 0;padding:16px 0;border-top:1px solid var(--line);color:#e0b56f;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.12em}.procedure-occurrence{border-top:1px solid rgba(112,90,58,.62)}.procedure-occurrence:last-child{border-bottom:1px solid rgba(112,90,58,.62)}.procedure-occurrence button{display:flex;align-items:center;justify-content:space-between;width:100%;padding:13px 0;border:0;background:none;color:#d9c6a2;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.07em;text-align:left;cursor:pointer}.procedure-occurrence button:hover{color:#f0ce8e}.procedure-consult{color:#a4c3ba;font-size:8px}.procedure-annotation{padding:0 0 12px;color:#a8c4bb;font-size:13px}.procedure-annotation p{margin:0 0 10px}.procedure-document blockquote{margin:28px 0 0;padding:16px 0 0;border-top:1px solid #765631;color:#f0ce8e;font:italic 16px/1.6 Georgia,serif}.procedure-back{margin-top:22px}',
    '.mirror-procedure{text-align:center;padding:8px 0 4px}.mirror-question{margin:0 0 25px;color:#ded1b1;font:italic 20px/1.45 Georgia,serif}.mirror-field{--size:min(78vw,430px);position:relative;width:var(--size);height:var(--size);margin:0 auto 14px}.mirror-rim,.mirror-surface{position:absolute;border-radius:50%}.mirror-rim{inset:8%;background:radial-gradient(circle at 37% 30%,#4c3b2d,#0b0c0d 52%,#84613c 80%,#17100b 83%);box-shadow:0 0 0 1px #9b7849,0 0 0 5px #15100c,0 22px 35px #000}.mirror-surface{inset:12%;display:grid;place-items:center;overflow:hidden;background:radial-gradient(ellipse at 38% 22%,#1d2c2e 0,#061011 31%,#020405 73%,#000);box-shadow:inset 0 0 45px #000}.mirror-surface:before{content:"";position:absolute;inset:0;background:linear-gradient(118deg,transparent 25%,rgba(143,190,177,.09) 43%,transparent 49%);transform:translateX(-40%)}.mirror-surface span{position:relative;z-index:1;width:64%;color:rgba(196,210,191,.43);font:italic 12px/1.45 Georgia,serif}.mirror-rune{position:absolute;z-index:3;width:48px;height:48px;padding:0;border:0;background:transparent;color:rgba(186,148,92,.27);font:34px/1 Georgia,serif;transform:translate(-50%,-50%);transition:color .35s,opacity .35s,text-shadow .35s;cursor:default}.is-unlocked .mirror-rune{color:rgba(201,163,102,.68);cursor:pointer}.mirror-rune.is-erased{opacity:.12;color:#6c5c45}.mirror-rune:nth-of-type(1){left:50%;top:1%}.mirror-rune:nth-of-type(2){left:71.2%;top:5.8%}.mirror-rune:nth-of-type(3){left:88.3%;top:19.4%}.mirror-rune:nth-of-type(4){left:97.8%;top:39.1%}.mirror-rune:nth-of-type(5){left:97.8%;top:60.9%}.mirror-rune:nth-of-type(6){left:88.3%;top:80.6%}.mirror-rune:nth-of-type(7){left:71.2%;top:94.2%}.mirror-rune:nth-of-type(8){left:50%;top:99%}.mirror-rune:nth-of-type(9){left:28.8%;top:94.2%}.mirror-rune:nth-of-type(10){left:11.7%;top:80.6%}.mirror-rune:nth-of-type(11){left:2.2%;top:60.9%}.mirror-rune:nth-of-type(12){left:2.2%;top:39.1%}.mirror-rune:nth-of-type(13){left:11.7%;top:19.4%}.mirror-rune:nth-of-type(14){left:28.8%;top:5.8%}.mirror-field.is-responding .mirror-rune.is-present,.mirror-field.is-activated .mirror-rune.is-present{color:#ead18d;text-shadow:0 0 9px #e2ba68,0 0 22px rgba(196,140,56,.8)}.mirror-field.is-responding .mirror-surface,.mirror-field.is-activated .mirror-surface{animation:mirrorResponse 2.6s ease-in-out forwards}.mirror-status{min-height:23px;margin:0;color:#d8b77e;font:9px "IBM Plex Mono",monospace;letter-spacing:.1em}.mirror-back{margin-top:16px;border:0;background:none;color:#aabbb2;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.13em;cursor:pointer}.mirror-back:hover{color:#e2bc80}@keyframes mirrorResponse{35%{filter:brightness(.45)}68%{filter:brightness(1.5) contrast(1.15)}100%{filter:brightness(.7)}}@media(max-width:420px){.mirror-rune{font-size:28px;width:38px;height:38px}.mirror-question{font-size:18px}}'
,'.recovered-dossier{max-width:760px;margin:0 auto;padding:4px 0 22px;color:#d5c6aa;font:15px/1.78 Georgia,serif}.recovered-header{padding:0 0 23px}.recovered-header p,.dossier-label,.reference-file header span{margin:0 0 8px;color:#dcb772;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.15em}.recovered-header small,.reference-file header small{display:block;color:#8eaca4;font:9px "IBM Plex Mono",monospace;letter-spacing:.1em}.recovered-header h1{margin:18px 0 0;color:#ead7ad;font:700 clamp(24px,5vw,39px)/1.06 Georgia,serif;letter-spacing:.03em}.dossier-divider{height:1px;margin:28px 0;background:linear-gradient(90deg,transparent,var(--line),transparent)}.dossier-document{max-width:660px}.dossier-document h2{margin:0 0 21px;color:#e4c282;font:700 14px "IBM Plex Mono",monospace;letter-spacing:.1em}.dossier-copy p,.reference-body p{margin:0 0 15px}.dossier-copy blockquote,.reference-body blockquote{margin:20px 0;padding:12px 18px;border-left:1px solid #8d7046;color:#e5cb96;font-style:italic}.reference-file{padding:24px 0;border-top:1px solid rgba(115,91,58,.62)}.reference-file:last-child{border-bottom:1px solid rgba(115,91,58,.62)}.reference-file header{margin-bottom:18px}.reference-file h3{margin:0 0 7px;color:#ded1b5;font:700 15px "IBM Plex Mono",monospace;letter-spacing:.08em}.research-results{margin:18px 0 2px}.research-results p{margin:0 0 12px;padding:0 0 0 14px;border-left:1px solid rgba(122,161,151,.6);color:#afc6bb}.research-results span{display:block;margin-bottom:4px;color:#7fa69a;font:700 8px "IBM Plex Mono",monospace;letter-spacing:.13em}.research-button{margin:12px 0 0;padding:7px 0;border:0;border-bottom:1px solid rgba(196,157,94,.55);background:none;color:#d8b879;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.12em;cursor:pointer}.research-button:hover{color:#f0d39c;border-color:#e1bb75}.research-message{min-height:0;margin:12px 0 0;color:#b5a17d;font:italic 12px/1.5 Georgia,serif}.procedure-back{display:block;margin:36px auto 0}@media(max-width:520px){.recovered-dossier{font-size:14px}.recovered-header h1{font-size:27px}.reference-file h3{font-size:13px}}'
  ].join('');
  document.head.appendChild(style);
  if (currentRefKey) enableProtocolClue();
})();