// ETAPA 06 — DISCERNIMENTO / ESPELHO NEGRO (v2)
(function () {
  const stageIndex = stages.findIndex(stage => stage && stage.name === 'Discernimento');
  const stageStep = stageIndex + 1;
  // Posições distribuídas ao redor do espelho; não altera a correspondência de cada signo.
  const zodiac = ['♈','♋','♑','♌','♊','♍','♒','♎','♓','♏','♉','♐'];
  const solution = ['♑','♈','♊','♒','♓'];
  const MIRROR_VIDEO = 'assets/stage6/espelho-revelacao.mp4';
  const additionalNotes = [
    'Nenhum dos documentos parece suficiente isoladamente. As correspondências mais consistentes surgem apenas quando localização, período e natureza da referência são considerados em conjunto.',
    'Algumas associações permanecem plausíveis em um único registro, mas desaparecem quando confrontadas com os demais.',
    'As figuras corretas parecem manter coerência entre geografia, período histórico, atividade e acontecimento associado.',
    'O acontecimento ligado a cada figura não segue uma única regra. Em alguns casos, trata-se de nascimento; em outros, morte, execução ou celebração.',
    'As datas permitem situar o acontecimento historicamente; entretanto, é a combinação entre o dia e o mês que estabelece a correspondência com um dos doze sinais.'
  ];
  // Após cada solicitação, aguardar 10, 10, 10 e 20 minutos,
  // como nas demais etapas. A primeira anotação pode ser solicitada
  // assim que o jogador acessa o arquivo; não depende de erro.
  const additionalNoteIntervals = [600, 600, 600, 1200];
  let stage6TimerStartedAt = 0;
  let stage6TimerHandle = 0;
  let stage6TimingActive = false;

  function storageKey(name) {
    return currentRefKey ? 'stage6:v2:' + name + ':' + currentRefKey : null;
  }
  function read(name, fallback) {
    const value = storageKey(name) && localStorage.getItem(storageKey(name));
    if (!value) return fallback;
    try { return JSON.parse(value); } catch (_) { return fallback; }
  }
  function write(name, value) {
    if (storageKey(name)) localStorage.setItem(storageKey(name), JSON.stringify(value));
  }
  // A admissão fica disponível assim que o vídeo começa a reproduzir;
  // manter a chave legada para preservar os progressos já salvos.
  function canContinueToAdmission() {
    return Boolean(currentRefKey && stageStep > 0 &&
      read('videoWatched', false) === true && completedCount >= stageStep);
  }
  function elapsedStage6Time() {
    const saved = Number(read('additionalNotesElapsed', 0)) || 0;
    return saved + (stage6TimerStartedAt ? Date.now() - stage6TimerStartedAt : 0);
  }
  function syncStage6Time() {
    if (!stage6TimerStartedAt) return elapsedStage6Time();
    const elapsed = elapsedStage6Time();
    write('additionalNotesElapsed', elapsed);
    stage6TimerStartedAt = Date.now();
    return elapsed;
  }
  // O tempo do próximo apontamento começa ao solicitar o anterior.
  // Preservar as solicitações anteriores quando o visitante já tinha
  // anotação desbloqueada antes desta atualização.
  function requestedAdditionalNotes() {
    const value = Number(read('additionalNotesRequested', 0));
    return Number.isInteger(value) ? Math.max(0, Math.min(additionalNotes.length, value)) : 0;
  }
  function nextAdditionalNoteAt(requested) {
    if (requested === 0 || requested >= additionalNotes.length) return 0;
    const saved = Number(read('additionalNotesNextAt', 0));
    if (Number.isFinite(saved) && saved > 0) return saved;
    const next = Date.now() + additionalNoteIntervals[requested - 1] * 1000;
    write('additionalNotesNextAt', next);
    return next;
  }
  function formatAdditionalWait(milliseconds) {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
  }
  function updateAdditionalNotes(forceOpen = false) {
    const requested = requestedAdditionalNotes();
    const nextAt = nextAdditionalNoteAt(requested);
    document.querySelectorAll('.stage6-additional-notes').forEach(panel => {
      panel.hidden = false;
      const count = panel.querySelector('.stage6-notes-count');
      const toggle = panel.querySelector('.stage6-notes-toggle');
      const history = panel.querySelector('.stage6-notes-history');
      const chevron = panel.querySelector('.stage6-notes-chevron');
      const request = panel.querySelector('.stage6-notes-request');
      if (!count || !toggle || !history || !chevron || !request) return;
      count.textContent = '(' + requested + ')';
      toggle.disabled = requested === 0;
      if (history.dataset.renderedCount !== String(requested)) {
        history.innerHTML = additionalNotes.slice(0, requested).map((note, index) =>
          '<article><span>ANOTAÇÃO ' + ['I', 'II', 'III', 'IV', 'V'][index] + '</span><p>' + note + '</p></article>'
        ).join('');
        history.dataset.renderedCount = String(requested);
      }
      if (forceOpen && requested > 0) toggle.setAttribute('aria-expanded', 'true');
      const expanded = requested > 0 && toggle.getAttribute('aria-expanded') === 'true';
      history.hidden = !expanded;
      chevron.textContent = expanded ? '−' : '＋';
      request.hidden = requested >= additionalNotes.length;
      if (!request.hidden) {
        const wait = Math.max(0, nextAt - Date.now());
        request.disabled = wait > 0;
        request.textContent = wait > 0
          ? 'SOLICITAR NOVO APONTAMENTO · ' + formatAdditionalWait(wait)
          : 'SOLICITAR NOVO APONTAMENTO';
      }
    });
  }
  function requestAdditionalNote() {
    const requested = requestedAdditionalNotes();
    if (requested >= additionalNotes.length ||
        Date.now() < nextAdditionalNoteAt(requested)) return;
    write('additionalNotesRequested', requested + 1);
    const next = requested + 1;
    write('additionalNotesNextAt', next < additionalNotes.length
      ? Date.now() + additionalNoteIntervals[next - 1] * 1000
      : 0);
    updateAdditionalNotes(true);
  }
  function startStage6Timer() {
    stage6TimingActive = true;
    if (!stage6TimerStartedAt && !document.hidden) stage6TimerStartedAt = Date.now();
    if (!stage6TimerHandle) {
      stage6TimerHandle = setInterval(() => {
        if (!document.hidden) syncStage6Time();
        updateAdditionalNotes();
      }, 1000);
    }
    updateAdditionalNotes();
  }
  function stopStage6Timer() {
    if (stage6TimerStartedAt) syncStage6Time();
    stage6TimerStartedAt = 0;
    stage6TimingActive = false;
    if (stage6TimerHandle) clearInterval(stage6TimerHandle);
    stage6TimerHandle = 0;
  }
  document.addEventListener('visibilitychange', () => {
    if (!stage6TimingActive) return;
    if (document.hidden) {
      if (stage6TimerStartedAt) syncStage6Time();
      stage6TimerStartedAt = 0;
    } else {
      stage6TimerStartedAt = Date.now();
    }
  });
  function hasVisited() {
    return Boolean(storageKey('visited') && localStorage.getItem(storageKey('visited')) === '1');
  }
  function visit() {
    if (storageKey('visited')) localStorage.setItem(storageKey('visited'), '1');
  }
  function visibleDefault() { return zodiac.slice(); }
  function glyph(sign) { return sign + '\uFE0E'; }
  function isSolution(visible) {
    return visible.length === solution.length && solution.every(sign => visible.includes(sign));
  }
  function paragraphs(lines) {
    return lines.map(line => '<p>' + line + '</p>').join('');
  }

  function enableProtocolClue() {
    const quote = document.querySelector('.dashboard-footer .quote');
    if (!quote || !hasVisited() || quote.querySelector('a')) return;
    quote.classList.add('mirror-protocol-link');
    const archiveHref = location.pathname + '?ref=' + encodeURIComponent(currentRefKey) + '#arquivo-etapa-06';
    quote.innerHTML = '<a href="' + archiveHref + '">“Nem todos os olhos veem o mesmo.”</a>';
    quote.querySelector('a').addEventListener('click', event => {
      event.preventDefault();
      renderInvestigationArchive(openDashboardArchive());
    });
  }

  const previousDashboard = renderDashboard;
  renderDashboard = function () {
    stopStage6Timer();
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
    startStage6Timer();
    if (context) context.hidden = true;
    if (mission) mission.hidden = true;
    if (panelHead) panelHead.hidden = true;

    let remaining = read('remaining', visibleDefault());
    if (!Array.isArray(remaining) || remaining.length < 5 || remaining.length > zodiac.length || !remaining.every(sign => zodiac.includes(sign))) remaining = visibleDefault();
    let stabilized = read('stabilized', false) === true;
    if (!stabilized && isSolution(remaining)) {
      stabilized = true;
      write('stabilized', true);
    }

    document.querySelector('#stageCode').textContent = 'ETAPA 06';
    document.querySelector('#stageName').textContent = 'DISCERNIMENTO';
    document.querySelector('#stageStatus').textContent = stabilized ? 'SUPERFÍCIE ESTABILIZADA' : 'EM ANÁLISE';

    actions.innerHTML =
      '<section class="mirror-v2' + (stabilized ? ' is-stabilized' : '') + '">' +
        '<p class="mirror-question">O que, exatamente, o espelho mostra?</p>' +
        '<div class="mirror-v2-field" aria-label="Espelho negro com doze sinais zodiacais">' +
          '<div class="mirror-v2-rim"></div>' +
          '<div class="mirror-v2-surface"><span class="mirror-whisper">Nem todos os olhos veem o mesmo</span><video class="mirror-v2-video" controls playsinline preload="metadata" hidden><source src="' + MIRROR_VIDEO + '" type="video/mp4"></video></div>' +
          zodiac.map((sign, index) => {
            const present = remaining.includes(sign);
            return '<button class="zodiac-mark ' + (present ? 'is-present' : 'is-erased') + '" type="button" data-sign="' + sign + '" style="--mark:' + index + '" aria-label="Sinal zodiacal ' + (index + 1) + '">' + glyph(sign) + '</button>';
          }).join('') +
        '</div><div class="mirror-video-controls"' + (stabilized ? '' : ' hidden') + '><button class="mirror-activate" type="button">ATIVAR ESPELHO</button><button class="mirror-deactivate" type="button">DESATIVAR ESPELHO</button></div>' +
        '<button class="primary-btn mirror-stage-continue" type="button"' + (canContinueToAdmission() ? '' : ' hidden') + '>CONTINUAR PARA A ETAPA 7</button>' +
      '</section>';

    const root = actions.querySelector('.mirror-v2');
    const continueButton = root.querySelector('.mirror-stage-continue');
    continueButton.addEventListener('click', () => {
      if (!canContinueToAdmission()) return;
      video.pause();
      openStage(stageIndex + 1);
    });
    const video = root.querySelector('.mirror-v2-video');
    const videoControls = root.querySelector('.mirror-video-controls');
    const activateMirror = root.querySelector('.mirror-activate');
    const deactivateMirror = root.querySelector('.mirror-deactivate');
    const surface = root.querySelector('.mirror-v2-surface');
    function revealVideo(autoplay) {
      surface.classList.add('is-revealing');
      video.hidden = false;
      root.querySelector('.mirror-whisper').hidden = true;
      if (!autoplay) return;
      video.currentTime = 0;
      video.play().catch(() => {
        document.querySelector('#stageStatus').textContent = 'TOQUE EM ATIVAR ESPELHO PARA INICIAR O REGISTRO';
      });
    }
    function hideVideo() {
      video.pause();
      video.hidden = true;
      surface.classList.remove('is-revealing');
      const whisper = root.querySelector('.mirror-whisper');
      whisper.hidden = false;
      whisper.textContent = 'Superfície estabilizada.';
    }
    function releaseAdmission() {
      if (!currentRefKey || !stageStep) return;
      write('videoWatched', true);
      completedCount = Math.max(completedCount, stageStep);
      saveProgress(currentRefKey, completedCount);
      continueButton.hidden = false;
    }
    // O vídeo pode continuar tocando enquanto o botão já fica disponível.
    // Se o jogador interromper a reprodução depois de iniciada, o acesso
    // permanece liberado nas próximas visitas à etapa e ao arquivo.
    video.addEventListener('playing', () => {
      releaseAdmission();
      document.querySelector('#stageStatus').textContent = 'REGISTRO EM REPRODUÇÃO — ETAPA 07 LIBERADA';
    });
    video.addEventListener('ended', () => {
      releaseAdmission();
      document.querySelector('#stageStatus').textContent = 'REGISTRO CONCLUÍDO — ETAPA 07 LIBERADA';
    });
    video.addEventListener('error', () => {
      hideVideo();
      const whisper = root.querySelector('.mirror-whisper');
      whisper.textContent = 'Arquivo visual aguardando upload.';
    });
    activateMirror.addEventListener('click', () => revealVideo(true));
    deactivateMirror.addEventListener('click', hideVideo);
    function draw() {
      root.querySelectorAll('.zodiac-mark').forEach(button => {
        const present = remaining.includes(button.dataset.sign);
        button.classList.toggle('is-present', present);
        button.classList.toggle('is-erased', !present);
        button.disabled = stabilized;
      });
    }

    root.querySelectorAll('.zodiac-mark').forEach(button => button.addEventListener('click', () => {
      if (stabilized) return;
      const sign = button.dataset.sign;
      const present = remaining.includes(sign);
      if (present && remaining.length === 5) {
        return;
      }
      remaining = present ? remaining.filter(item => item !== sign) : remaining.concat(sign);
      write('remaining', remaining);
      if (remaining.length === 5 && isSolution(remaining)) {
        stabilized = true;
        write('stabilized', true);
        window.onMirrorStabilized();
        document.querySelector('#stageStatus').textContent = 'SUPERFÍCIE ESTABILIZADA';
        videoControls.hidden = false;
        draw();
        setTimeout(() => revealVideo(true), 700);
        return;
      }
      draw();
    }));
    draw();
    if (read('videoWatched', false) === true) {
      document.querySelector('#stageStatus').textContent = 'REGISTRO CONCLUÍDO — ETAPA 07 LIBERADA';
    }
  }

  window.onMirrorStabilized = window.onMirrorStabilized || function () {
    // Reservado para a continuação narrativa da Etapa 06.
  };

  function openDashboardArchive() {
    const card = document.querySelector('#dashboardView .dashboard-card');
    const stagesWrap = card && card.querySelector('.stages-wrap');
    const dashboardHead = card && card.querySelector('.dashboard-head');
    if (!card) return null;
    // O arquivo aparece dentro do painel. Criar uma única entrada de navegação
    // para que o Voltar físico do celular retorne à lista de etapas.
    if (!card.classList.contains('is-stage6-archive') && currentRefKey &&
        (!history.state || history.state.delectusScreen !== 'archive')) {
      history.pushState({ delectusScreen: 'archive', ref: currentRefKey }, '', location.href);
    }
    let slot = card.querySelector('.dashboard-archive-slot');
    if (!slot) {
      slot = document.createElement('section');
      slot.className = 'dashboard-archive-slot';
      card.insertBefore(slot, card.firstChild);
    }
    card.classList.add('is-stage6-archive');
    if (dashboardHead) dashboardHead.hidden = true;
    if (stagesWrap) stagesWrap.hidden = true;
    return slot;
  }

  function closeDashboardArchive() {
    const card = document.querySelector('#dashboardView .dashboard-card');
    const slot = card && card.querySelector('.dashboard-archive-slot');
    const stagesWrap = card && card.querySelector('.stages-wrap');
    const dashboardHead = card && card.querySelector('.dashboard-head');
    if (slot) slot.remove();
    stopStage6Timer();
    if (card) card.classList.remove('is-stage6-archive');
    if (dashboardHead) dashboardHead.hidden = false;
    if (stagesWrap) stagesWrap.hidden = false;
    history.replaceState(null, '', location.pathname + location.search);
  }

  function renderInvestigationArchive(target) {
    if (!currentRefKey) return;
    visit();
    startStage6Timer();
    const onDashboard = Boolean(target);
    const actions = target || document.querySelector('#stageActions');
    if (!onDashboard) {
      document.querySelector('#stageCode').textContent = 'ARQUIVO RECUPERADO';
      document.querySelector('#stageName').textContent = 'NEM TODOS OS OLHOS VEEM O MESMO.';
      document.querySelector('#stageStatus').textContent = 'CLASSIFICAÇÃO: PROCEDIMENTO / SUPERFÍCIE REFLEXIVA';
      const panelHead = document.querySelector('.detail-panel .panel-head');
      const context = document.querySelector('#stageContext');
      const mission = document.querySelector('#stageMission');
      if (panelHead) panelHead.hidden = true;
      if (context) context.hidden = true;
      if (mission) mission.hidden = true;
    }

    const historical = [
      'Entre 1581 e 1583, John Dee registrou uma série de conferências nas quais afirmava receber comunicações de anjos e outros espíritos, com auxílio de um vidente e de meios de observação empregados durante as sessões.',
      'Parte desses registros sobrevive no manuscrito <em>Sloane MS 3188</em>, hoje preservado pela British Library. O catálogo da instituição identifica o volume como <em>John Dee’s conferences with angels</em> e registra conferências realizadas entre <strong>22 de dezembro de 1581 e 30 de maio de 1583</strong>.',
      'Entre as entidades mencionadas nesses registros encontra-se <strong>Uriel</strong>.',
      'As comunicações atribuídas às entidades não se limitavam a mensagens. Os materiais relacionados às operações de Dee incluem instruções, diagramas, tabelas, símbolos e objetos destinados à preparação das sessões.',
      'O History of Science Museum, em Oxford, preserva uma cópia em mármore da chamada <em>Holy Table</em> e registra que, segundo os relatos de Dee, a mesa original teria sido produzida seguindo instruções atribuídas ao arcanjo Uriel.',
      'O British Museum preserva também discos de cera gravados associados às práticas de Dee. A instituição observa que esses objetos apresentam forte correspondência com os selos descritos nas instruções que Dee atribuiu a Uriel em março de 1582.',
      'O conjunto documental que chegou até o presente, entretanto, <strong>não está completo</strong>.',
      'O próprio catálogo da British Library registra explicitamente que algumas folhas do <em>Sloane MS 3188</em> estão desaparecidas.',
      'Elias Ashmole, que posteriormente recuperou e copiou parte dos manuscritos, relatou que folhas pertencentes ao conjunto haviam sido utilizadas pela criada de antigos proprietários para <strong>forrar formas de torta</strong>.',
      'Outros materiais sobreviveram separadamente.',
      'O <em>Sloane MS 3189</em>, por exemplo, contém o <em>Liber Mysteriorum Sextus et Sanctus</em>, também chamado <em>Liber Logaeth</em>, transcrito por Edward Kelley em 1583.',
      'O <em>Sloane MS 3191</em> preserva outro conjunto de notas de John Dee sobre magia cerimonial.',
      'Portanto, o registro atualmente conhecido das experiências de Dee é fragmentário.',
      '<strong>Partes sobreviveram.<br>Outras foram copiadas.<br>Outras permaneceram separadas.<br>E algumas foram perdidas.</strong>'
    ];
    const analysis = [
      'Durante a revisão de materiais reunidos em coleções privadas no início do século XX, foi localizado um pequeno caderno sem catalogação, encadernado junto a documentos de procedência diversa.',
      'O volume não traz nome, data ou indicação de autoria.',
      'A maior parte de seu conteúdo consiste em notas fragmentárias, símbolos e referências difíceis de relacionar entre si. Em algumas páginas, porém, aparecem expressões, construções e diagramas muito próximos daqueles encontrados nos registros cerimoniais associados a John Dee.',
      'A semelhança chamou atenção por um motivo específico.',
      'Em determinado trecho, o texto descreve a preparação de uma superfície escura cercada por <strong>doze sinais</strong>.',
      '<span class="stage6-attention">Apenas cinco deveriam permanecer.</span>',
      'Nenhuma lista acompanha a indicação.',
      'Nenhum dos cinco sinais é nomeado.',
      'As páginas posteriores também não apresentam uma chave direta. Em vez disso, surgem referências breves, aparentemente pessoais, a lugares, acontecimentos e figuras conhecidas — anotações curtas demais para formar um relato, mas recorrentes o bastante para sugerir intenção.',
      'A hipótese mais consistente é que Dee não tenha registrado a combinação de maneira explícita.',
      'Pode ter preferido preservá-la por meio de associações que somente ele seria capaz de reconstruir.',
      'Não como um código destinado a outra pessoa.',
      '<strong>Como uma forma de memória.</strong>',
      'A análise dessas anotações revelou outro padrão.',
      'As referências não parecem conduzir apenas a indivíduos.',
      'Em diferentes trechos, uma mesma figura é associada a um acontecimento específico de sua história: em alguns casos, nascimento; em outros, morte, execução, celebração ou outro marco diretamente relacionado àquela pessoa.',
      'Ao lado de parte dessas referências aparecem registros numéricos breves, geralmente compatíveis com <strong>dia e mês</strong>, mas sem qualquer explicação sobre sua finalidade.',
      'Isso sugere que a identidade da figura talvez não fosse o destino final da associação.',
      'Era apenas uma etapa.',
      'Primeiro, a memória conduzia à pessoa.',
      'Depois, a um acontecimento.',
      'E desse acontecimento, a uma data.',
      'Por que Dee precisaria preservar apenas <strong>dia e mês</strong> permanece incerto.',
      'Os materiais reunidos nos anexos seguintes parecem derivar dessas anotações ou de tentativas posteriores de interpretá-las.',
      'Nenhum nome é apresentado de maneira direta.',
      'Ainda assim, diferentes referências parecem convergir repetidamente para o mesmo pequeno grupo de figuras.',
      'Se essa leitura estiver correta, os nomes nunca foram a resposta.',
      '<strong>Eram apenas o caminho para recuperar aquilo que Dee decidiu não escrever.</strong>'
    ];
    const reconstruction = [
      'Os cinco sinais não foram preservados de forma explícita.',
      'As anotações atribuídas a Dee sugerem que ele evitou registrar a configuração de maneira direta, recorrendo a associações pessoais que pudesse reconstruir posteriormente.',
      'Essas referências parecem conduzir primeiro a determinadas figuras históricas.',
      'Em seguida, cada uma delas aponta para um acontecimento específico de sua trajetória — nascimento, morte, execução, celebração ou outro marco suficientemente reconhecível.',
      'É nesse ponto que as anotações deixam de avançar.',
      'Outros materiais cerimoniais associados a Dee, porém, mostram que correspondências astrológicas e zodiacais faziam parte do repertório utilizado em suas práticas.',
      'Isso permite uma interpretação adicional:',
      'as datas talvez não fossem o resultado final da associação, mas apenas a última etapa antes dos sinais.',
      '<strong>A cada data corresponderia um dos doze sinais.</strong>',
      'Assim, a configuração não precisaria existir escrita em nenhum lugar.',
      'Poderia ser reconstruída a partir de uma sequência que só fazia sentido para quem conhecesse suas referências.',
      '<span class="stage6-attention">Cinco figuras. Cinco acontecimentos. Cinco datas. Cinco sinais.</span>',
      '<span class="stage6-attention">Uma única configuração.</span>'
    ];
    const annexes = [
      { code:'01', title:'CARTOGRÁFICA', body:'<img class="stage6-annex-image" src="assets/stage6/anexo-01-cartografica.png" alt="Anexo cartográfico" onerror="this.remove()">' },
      { code:'02', title:'TRANSCRIÇÃO PARCIAL', body:`<h3>ANEXO 02 — TRANSCRIÇÃO PARCIAL</h3><p><strong>Referências cronológicas identificadas entre os materiais associados</strong></p><p>A sequência original das anotações não pôde ser reconstruída.</p><p>Em diferentes trechos, permanecem apenas indicações de período, sem nome, local ou contexto suficiente para determinar com segurança a figura à qual pertencem.</p><p>As referências legíveis apontam para:</p><ul><li><strong>século X</strong></li><li><strong>século XV</strong></li><li><strong>século I a.C.</strong></li><li><strong>século XVI</strong></li><li><strong>século I d.C.</strong></li></ul><p>Algumas das anotações parecem corresponder a figuras cuja vida atravessou mais de um desses períodos.</p><p>Por esse motivo, uma mesma referência pode se relacionar a mais de uma faixa cronológica.</p><p>Não há indicação de que todas as marcações preservadas pertençam ao conjunto principal.</p><p><strong>A distribuição temporal, isoladamente, não permite uma identificação conclusiva.</strong></p>` },
      { code:'03', title:'PRANCHA ICONOGRÁFICA', body:`<h3>ANEXO 03 — PRANCHA ICONOGRÁFICA</h3><p><strong>Categorias recorrentes associadas às referências preservadas</strong></p><p>A comparação entre imagens, margens e anotações permitiu separar parte do material em grupos temáticos.</p><p>As associações não parecem exclusivas.</p><p>Uma mesma figura pode ocorrer em mais de uma categoria.</p><p>Foram identificados os seguintes conjuntos:</p><ul><li><strong>Conhecimento / estudo</strong></li><li><strong>Arte / ofício</strong></li><li><strong>Guerra / comando</strong></li><li><strong>Religião / tradição</strong></li><li><strong>Poder político</strong></li><li><strong>Navegação / exploração</strong></li></ul><p><strong>A classificação indica afinidade temática, não identidade individual.</strong></p>` },
      { code:'04', title:'RELATÓRIO', body:`<h3>ANEXO 04 — RELATÓRIO</h3><p><strong>Classificação provisória dos acontecimentos associados às referências</strong></p><p>A análise das anotações indica que algumas figuras não são mencionadas por sua obra ou posição, mas por um acontecimento específico de sua trajetória.</p><p>Os registros preservados permitem distinguir as seguintes naturezas de referência:</p><ul><li>coroação;</li><li>assassinato;</li><li>morte por causas naturais;</li><li>execução;</li><li>celebração tradicional;</li><li>nascimento;</li></ul><p>Não há indicação de que todos os acontecimentos listados pertençam ao conjunto principal.</p><p>Em alguns casos, o acontecimento parece ter sido escolhido por sua facilidade de associação à figura, e não por sua importância histórica.</p><p><strong>A recorrência sugere que o evento associado pode ser mais relevante que o nome em si.</strong></p>` },
      { code:'05', title:'FRAGMENTOS BIOGRÁFICOS', body:`<h3>ANEXO 05 — FRAGMENTOS BIOGRÁFICOS</h3><p><strong>Características pessoais identificadas em referências dispersas</strong></p><p>Os trechos preservados não formam biografias completas.</p><p>Em vários casos, apenas uma característica da origem ou da condição da figura parece ter sido considerada suficiente para distingui-la das demais.</p><p>Entre as anotações legíveis:</p><p>“...o nascimento seria lembrado e celebrado para sempre...”</p><p>“...descendente de uma casa ligada ao comércio e às rotas entre cidades...”</p><p>“...a família preservava nome e posição, embora não a riqueza que o nome poderia sugerir...”</p><p>“...nascido fora do matrimônio, mas reconhecido junto à casa paterna...”</p><p>“...de origem rural; nenhuma posição lhe foi transmitida por nascimento...”</p><p>“...a condição de nascimento já o colocava próximo daqueles que exerciam o poder...”</p><blockquote><strong>Os fragmentos parecem registrar apenas aquilo que seria suficiente para evocar uma figura já conhecida pelo autor.</strong></blockquote>` },
      { code:'06', title:'CRONOLOGIA', body:`<h3>ANEXO 06 — CRONOLOGIA</h3><p><strong>Relações temporais identificadas entre as referências</strong></p><p>A ordenação absoluta dos registros não pôde ser preservada.</p><p>Ainda assim, algumas relações cronológicas aparecem de forma consistente quando os diferentes materiais são comparados.</p><p>As referências permitem estabelecer que:</p><ul><li><strong>uma das figuras pertence a um período anterior à era comum;</strong></li><li><strong>outra pertence aos primeiros séculos da era comum;</strong></li><li><strong>três referências concentram-se entre o final da Idade Média e o Renascimento;</strong></li><li><strong>duas dessas três figuras foram contemporâneas durante parte de suas vidas;</strong></li><li><strong>uma delas morreu antes que outra atingisse a maturidade;</strong></li><li><strong>uma referência adicional aparece deslocada temporalmente do conjunto principal.</strong></li></ul><p>Nenhuma dessas relações permite, isoladamente, identificar as figuras com segurança.</p><p>Em conjunto, porém, elas ajudam a distinguir associações compatíveis daquelas que apenas parecem plausíveis.</p><p><strong>A sequência cronológica não revela os nomes. Ela apenas elimina o que não pode pertencer ao mesmo conjunto.</strong></p>` },
      { code:'07', title:'PRANCHA HISTÓRICA', body:`<h3>ANEXO 07 — PRANCHA HISTÓRICA</h3><p><strong>Reproduções visuais associadas às referências preservadas</strong></p><p>As imagens reunidas nesta prancha foram localizadas em fontes distintas e não pertenciam originalmente ao mesmo conjunto.</p><p>Nenhuma delas apresenta identificação nominal preservada nos materiais analisados.</p><p>A seleção foi mantida porque determinados elementos visuais parecem corresponder às características observadas nos demais registros.</p><p>As reproduções foram preservadas apenas parcialmente.</p><p><strong>Seu valor está menos na imagem isolada do que na correspondência com aquilo que já aparece em outros documentos.</strong></p><img class="stage6-annex-image" src="assets/stage6/anexo-07-prancha-historica.png" alt="Prancha histórica" onerror="this.remove()">` },
      { code:'08', title:'NOTA DE CORRELAÇÃO', body:`<h3>ANEXO 08 — NOTA DE CORRELAÇÃO</h3><p><strong>Observações sobre recorrência entre os registros</strong></p><p>A comparação individual dos documentos produziu associações demais para qualquer conclusão segura.</p><p>Localização, período, atividade, condição biográfica e acontecimento podem apontar para dezenas de figuras históricas diferentes quando considerados separadamente.</p><p>O padrão só começa a se tornar útil quando as referências são confrontadas entre si.</p><p>Algumas possibilidades desaparecem assim que comparadas com um segundo registro.</p><p>Outras permanecem compatíveis por mais tempo, mas deixam de corresponder quando um terceiro elemento é considerado.</p><p>Um grupo reduzido, entretanto, continua surgindo de maneira consistente ao longo do conjunto.</p><p>As referências associadas a essas figuras não são idênticas.</p><p>Em alguns documentos, a correspondência é geográfica.</p><p>Em outros, cronológica.</p><p>Em outros, biográfica, iconográfica ou relacionada a um acontecimento específico.</p><p>Isso sugere que os materiais não foram produzidos para registrar nomes.</p><p>Foram produzidos para permitir que determinadas figuras fossem <strong>reconstruídas por sobreposição de características</strong>.</p><p>A identificação correta, portanto, não depende de uma única pista.</p><p>Depende daquilo que permanece verdadeiro quando todas as fontes são consideradas em conjunto.</p><p><strong>As associações isoladas são numerosas. As convergências, não.</strong></p>` }
    ];
    const annexMarkup = annexes.map(item =>
      '<article class="attachment-item"><button class="attachment-toggle" type="button" aria-expanded="false"><span>ANEXO ' + item.code + ' — ' + item.title + '</span><span class="chev">＋</span></button><div class="attachment-content stage6-annex-content" hidden>' + item.body + '</div></article>'
    ).join('');

    actions.innerHTML =
      '<section class="stage6-archive">' +
        '<button class="stage6-top-back" type="button">VOLTAR</button>' +
        '<header class="stage6-archive-head stage-hero"><p class="eyebrow">ETAPA 06 — DISCERNIMENTO</p><h1>ARQUIVO DE INVESTIGAÇÃO</h1></header>' +
        '<article class="stage6-context-document"><p class="doc-meta">MATERIAL HISTÓRICO</p><div class="archive-copy">' + paragraphs(historical) + '</div><p class="archive-sources">Referências: <a href="https://www.bl.uk/manuscripts/FullDisplay.aspx?ref=Sloane_MS_3188" target="_blank" rel="noopener">British Library</a> · <a href="https://hsm.ox.ac.uk/holy-table" target="_blank" rel="noopener">History of Science Museum</a> · <a href="https://www.britishmuseum.org/collection/object/H_1906-0922-1" target="_blank" rel="noopener">British Museum</a></p></article>' +
        '<article class="attachment-item"><button class="record-toggle" type="button" aria-expanded="false"><span>REGISTRO 01 — MATERIAL EM ANÁLISE</span><span class="chev">＋</span></button><div class="record-content" hidden><p class="doc-meta">MATERIAL NÃO CATALOGADO</p><div class="archive-copy">' + paragraphs(analysis) + '</div></div></article>' +
        '<section class="stage6-section"><h3>ANEXOS PRESERVADOS</h3><div class="attachments-list">' + annexMarkup + '</div></section>' +
        '<article class="attachment-item"><button class="record-toggle" type="button" aria-expanded="false"><span>REGISTRO 02 — RECONSTRUÇÃO</span><span class="chev">＋</span></button><div class="record-content" hidden><div class="archive-copy">' + paragraphs(reconstruction) + '</div></div></article>' +
        '<section class="stage6-additional-notes"><button class="stage6-notes-toggle" type="button" aria-expanded="false" disabled><span>APONTAMENTO ADICIONAL <span class="stage6-notes-count">(0)</span></span><span class="stage6-notes-chevron" aria-hidden="true">＋</span></button><div class="stage6-notes-history" hidden></div><button class="stage6-notes-request" type="button" disabled>SOLICITAR NOVO APONTAMENTO</button></section>' +
        '<section class="correspondence-table"><h3>TÁBUA DE CORRESPONDÊNCIA</h3><p><strong>Insira a data reconstruída para consultar o sinal correspondente.</strong></p><form class="correspondence-form"><label>DIA<input name="day" type="number" inputmode="numeric" min="1" max="31" required></label><label>MÊS<input name="month" type="number" inputmode="numeric" min="1" max="12" required></label><button type="submit">CONSULTAR CORRESPONDÊNCIA</button></form><p class="correspondence-result" aria-live="polite"></p><button class="correspondence-save" type="button" hidden>GRAVAR SÍMBOLO</button><div class="correspondence-saved" aria-live="polite"></div></section>' +
        '<button class="primary-btn stage6-archive-continue" type="button"' + (canContinueToAdmission() ? '' : ' hidden') + '>CONTINUAR PARA A ETAPA 7</button>' +
      '</section>';

    const notesPanel = actions.querySelector('.stage6-additional-notes');
    if (notesPanel) {
      notesPanel.querySelector('.stage6-notes-toggle').addEventListener('click', () => {
        const toggle = notesPanel.querySelector('.stage6-notes-toggle');
        toggle.setAttribute('aria-expanded', String(toggle.getAttribute('aria-expanded') !== 'true'));
        updateAdditionalNotes();
      });
      notesPanel.querySelector('.stage6-notes-request').addEventListener('click', requestAdditionalNote);
    }
    updateAdditionalNotes();

    actions.querySelectorAll('.stage6-archive .record-toggle, .stage6-archive .attachment-toggle').forEach(button => button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      button.querySelector('.chev').textContent = open ? '＋' : '−';
      button.nextElementSibling.hidden = open;
    }));

    const form = actions.querySelector('.correspondence-form');
    const result = actions.querySelector('.correspondence-result');
    const saveSymbol = actions.querySelector('.correspondence-save');
    const savedSymbols = actions.querySelector('.correspondence-saved');
    let consulted = null;
    let saved = read('savedCorrespondences', []);
    if (!Array.isArray(saved)) saved = [];
    function renderSavedSymbols() {
      if (!saved.length) {
        savedSymbols.innerHTML = '<p class="correspondence-empty">NENHUM SÍMBOLO GRAVADO.</p>';
        return;
      }
      savedSymbols.innerHTML = '<p class="correspondence-saved-title">SÍMBOLOS GRAVADOS</p>' + saved.map((entry, index) =>
        '<div class="correspondence-saved-item"><span>' + glyph(entry.sign) + '</span><small>' + entry.date + '</small><button type="button" data-saved-index="' + index + '" aria-label="Apagar símbolo ' + entry.sign + '">APAGAR</button></div>'
      ).join('');
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      const day = Number(form.elements.day.value);
      const month = Number(form.elements.month.value);
      const valid = Number.isInteger(day) && Number.isInteger(month) && new Date(2000, month - 1, day).getMonth() === month - 1;
      if (!valid) { result.textContent = 'DATA NÃO RECONHECIDA'; saveSymbol.hidden = true; consulted = null; return; }
      consulted = { sign: zodiacFor(day, month), date: String(day).padStart(2, '0') + '/' + String(month).padStart(2, '0') };
      result.textContent = glyph(consulted.sign);
      saveSymbol.hidden = false;
    });
    saveSymbol.addEventListener('click', () => {
      if (!consulted) return;
      if (!saved.some(entry => entry.sign === consulted.sign)) {
        saved.push(consulted);
        write('savedCorrespondences', saved);
      }
      saveSymbol.hidden = true;
      renderSavedSymbols();
    });
    savedSymbols.addEventListener('click', event => {
      const button = event.target.closest('[data-saved-index]');
      if (!button) return;
      saved.splice(Number(button.dataset.savedIndex), 1);
      write('savedCorrespondences', saved);
      renderSavedSymbols();
    });
    renderSavedSymbols();
    actions.querySelector('.stage6-archive-continue').addEventListener('click', () => {
      if (!canContinueToAdmission()) return;
      if (onDashboard) closeDashboardArchive();
      openStage(stageIndex + 1);
    });
    actions.querySelector('.stage6-top-back').addEventListener('click', () => {
      if (onDashboard && history.state && history.state.delectusScreen === 'archive') {
        history.back();
      } else if (onDashboard) {
        closeDashboardArchive();
      } else {
        openStage(stageIndex);
      }
    });
  }

  function zodiacFor(day, month) {
    const value = month * 100 + day;
    if (value >= 1222 || value <= 119) return '♑';
    if (value <= 218) return '♒';
    if (value <= 320) return '♓';
    if (value <= 419) return '♈';
    if (value <= 520) return '♉';
    if (value <= 620) return '♊';
    if (value <= 722) return '♋';
    if (value <= 822) return '♌';
    if (value <= 922) return '♍';
    if (value <= 1022) return '♎';
    if (value <= 1121) return '♏';
    return '♐';
  }

  const previousOpenStage = openStage;
  openStage = function (index) {
    if (index !== stageIndex) stopStage6Timer();
    previousOpenStage(index);
    if (index !== stageIndex) return;
    // Uma mudança rápida de etapa pode ocorrer antes deste callback.
    // Não ocultar o conteúdo da nova tela com um render antigo.
    setTimeout(() => {
      const stageCode = document.querySelector('#stageCode');
      if (!stageView.classList.contains('active') || !stageCode ||
          stageCode.textContent.trim() !== 'ETAPA 06') return;
      renderMirrorStage();
    }, 0);
  };

  if (location.hash === '#arquivo-etapa-06') {
    setTimeout(() => {
      if (currentRefKey) renderInvestigationArchive(openDashboardArchive());
    }, 0);
  }

  const style = document.createElement('style');
  style.textContent = `
    .mirror-protocol-link a{color:#b7cdc5;text-decoration:none;cursor:pointer;animation:protocol-clue-pulse 2.9s ease-in-out infinite}.mirror-protocol-link a:hover{color:#fff;text-shadow:0 0 3px #fff,0 0 19px rgba(255,255,255,.95)}@keyframes protocol-clue-pulse{0%,32%,100%{color:#a7beb6;text-shadow:none}46%,70%{color:#fff;text-shadow:0 0 3px #fff,0 0 19px rgba(255,255,255,.95),0 0 31px rgba(189,239,224,.52)}}
    .mirror-v2{padding:6px 0 4px;text-align:center}.mirror-v2-intro{margin:0 auto 14px;color:#b9cdbf;font:14px/1.6 Georgia,serif}.mirror-archive-link,.archive-back{border:0;border-bottom:1px solid #b28746;padding:7px 2px;background:none;color:#e1b86e;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.12em;cursor:pointer}.mirror-archive-link:hover,.archive-back:hover{color:#f7d391}.mirror-v2-field{position:relative;width:min(100%,460px);aspect-ratio:1;margin:4px auto 0}.mirror-v2-rim,.mirror-v2-surface{position:absolute;left:50%;top:50%;border-radius:50%;transform:translate(-50%,-50%)}.mirror-v2-rim{width:70%;height:70%;background:radial-gradient(circle,#050807 58%,#342717 61%,#0a0c09 69%,#49391e 72%,#060807 74%);filter:drop-shadow(0 15px 20px rgba(0,0,0,.7))}.mirror-v2-surface{display:grid;place-items:center;width:62%;height:62%;background:radial-gradient(ellipse at 38% 25%,#28362d 0,#101a17 30%,#030504 72%);box-shadow:inset 0 0 44px #000}.mirror-v2-surface .mirror-whisper{max-width:72%;color:rgba(220,193,138,.86);font-family:Georgia,"Times New Roman",serif;font-size:12px;font-style:italic;font-weight:400;letter-spacing:.04em;text-shadow:none;opacity:.72;transform:scaleX(.91) scaleY(.94);transition:opacity .45s ease,color .45s ease;animation:mirror-whisper 3.8s ease-in-out infinite}.mirror-v2-field:hover .mirror-whisper,.mirror-v2-field:active .mirror-whisper{color:#ead4a7;opacity:.96;text-shadow:none}@keyframes mirror-whisper{0%,100%{opacity:.5}50%{opacity:.92}}.mirror-question{margin:0 0 7px;color:#d9c6a2;font:italic 16px/1.55 Georgia,serif}.zodiac-mark{position:absolute;left:calc(50% - 27px);top:calc(50% - 27px);display:grid;place-items:center;width:54px;height:54px;padding:0!important;border:0!important;border-radius:0!important;outline:0!important;appearance:none!important;-webkit-appearance:none!important;background:none!important;background-color:transparent!important;box-shadow:none!important;color:#d8b77e;font:28px Georgia,serif;line-height:1;cursor:pointer;-webkit-tap-highlight-color:transparent;transform:rotate(calc(var(--mark) * 30deg)) translateY(calc(-1 * min(43vw, 196px))) rotate(calc(var(--mark) * -30deg));transition:opacity .22s,color .22s,text-shadow .22s}.zodiac-mark:hover,.zodiac-mark:active,.zodiac-mark:focus,.zodiac-mark:focus-visible{border:0!important;outline:0!important;background:none!important;background-color:transparent!important;box-shadow:none!important}.zodiac-mark.is-present{text-shadow:0 0 10px rgba(216,183,126,.32)}.zodiac-mark.is-erased,.zodiac-mark.is-erased:hover,.zodiac-mark.is-erased:active{color:rgba(182,151,90,.13);opacity:0;text-shadow:none}@media (hover:hover) and (pointer:fine){.zodiac-mark:not(.is-erased):hover{color:#f0ce8e}}.mirror-v2.is-stabilized .zodiac-mark{cursor:default}.mirror-v2-count{margin:2px 0 8px;color:#8ea79b;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.13em;text-transform:uppercase}.mirror-v2-status{min-height:1.5em;margin:0 0 10px;color:#e3bb75;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.1em}.mirror-stabilize{padding:11px 15px;border:1px solid #87662e;background:rgba(44,31,12,.22);color:#e5bd76;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.12em;cursor:pointer}.mirror-stabilize:disabled{border-color:#3c4035;color:#66746a;background:transparent;cursor:not-allowed}
    .stage6-archive{max-width:720px;margin:0 auto;padding:4px 0 10px;color:#d9c6a2;font:16px/1.72 Georgia,serif}.archive-header{padding:2px 0 24px;border-bottom:1px solid #365249}.archive-header p,.archive-header small,.archive-label{margin:0;color:#8fc7b7;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.14em}.archive-header small{display:block;margin-top:6px;color:#a9b9ac;font-size:9px}.archive-header h2{margin:17px 0 0;color:#f0ce8e;font:700 clamp(22px,5vw,34px)/1.16 Georgia,serif}.archive-document{max-width:660px;margin:0 auto}.archive-document h3,.archive-annexes>h3,.correspondence-table h3{margin:0 0 17px;color:#e2bd7e;font:700 12px "IBM Plex Mono",monospace;letter-spacing:.12em}.archive-copy p{margin:0 0 15px}.archive-copy strong{color:#f0ce8e}.archive-sources{margin:25px 0 0;padding-top:13px;border-top:1px solid #2d453c;color:#91a59c;font:11px/1.6 "IBM Plex Mono",monospace}.archive-sources a{color:#c7a66d}.archive-divider{height:1px;margin:35px 0;background:#365249}.archive-analysis{padding-left:18px;border-left:1px solid #735b35}.archive-annexes{max-width:660px;margin:auto}.archive-annex{border-top:1px solid #365249}.archive-annex:last-child{border-bottom:1px solid #365249}.archive-annex button{display:flex;align-items:center;justify-content:space-between;width:100%;padding:14px 0;border:0;background:none;color:#d9c6a2;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.08em;text-align:left;cursor:pointer}.archive-annex button:hover{color:#efc982}.archive-annex>div{min-height:0}.correspondence-table{max-width:660px;margin:0 auto;padding:20px 0;border-top:1px solid #735b35;border-bottom:1px solid #735b35}.correspondence-table>p{margin:0 0 18px}.correspondence-form{display:flex;flex-wrap:wrap;gap:11px;align-items:end}.correspondence-form label{display:grid;gap:5px;color:#93aa9d;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.1em}.correspondence-form input{width:88px;padding:10px;border:1px solid #486257;background:#08110e;color:#f0ce8e;font:16px "IBM Plex Mono",monospace}.correspondence-form button{padding:11px;border:1px solid #87662e;background:transparent;color:#e5bd76;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.09em;cursor:pointer}.correspondence-result{min-height:38px;margin:16px 0 0;color:#f0ce8e;font:34px/1 Georgia,serif}.archive-back{display:block;margin:30px auto 0}
    .dashboard-archive-slot{margin:0}.stage6-archive{max-width:none;margin:0;padding:0;color:var(--text);font:inherit}.stage6-top-back{display:inline-flex;align-items:center;justify-content:center;width:auto;min-width:72px;margin:0 0 20px;padding:7px 12px;border:1px solid var(--line);border-radius:4px;background:transparent;color:var(--text-soft);font:600 10px "IBM Plex Mono",monospace;letter-spacing:.10em;text-transform:uppercase;cursor:pointer}.stage6-top-back:hover,.stage6-top-back:focus-visible{color:var(--green);border-color:var(--green);outline:0}.stage6-context-document{margin:0 0 18px;padding:2px 0 16px;border-bottom:1px solid var(--line);color:#a4c3ba;font-size:14px;line-height:1.7}.stage6-archive .record-content{font-size:14px;line-height:1.7}.stage6-annex-content{font-size:14px;line-height:1.7}.stage6-annex-content h3{margin:16px 0 9px;color:var(--text);font-size:13px;letter-spacing:.04em}.stage6-annex-content p{margin:0 0 11px}.stage6-annex-content ul{margin:8px 0 13px;padding-left:20px}.stage6-annex-content li{margin:4px 0}.stage6-annex-content blockquote{margin:14px 0 4px;padding-left:12px;border-left:2px solid var(--amber);color:#d8e1de}.stage6-annex-image{display:block;width:100%;height:auto;margin:16px 0 2px;border:1px solid var(--line);background:#07100d}.stage6-context-document .doc-meta{margin-bottom:13px}.stage6-archive-head{margin:0 0 18px;padding:0;border:0}.stage6-archive-head .eyebrow{margin:0 0 12px}.stage6-archive-head h1{margin:0;color:var(--text);font-size:clamp(30px,6vw,48px);letter-spacing:0}.stage6-archive .attachment-item{margin-top:8px}.stage6-section{margin:20px 0}.stage6-section h3{margin:0 0 9px;color:var(--amber);font:700 11px "IBM Plex Mono",monospace;letter-spacing:.11em}.stage6-archive .archive-copy p{margin:0 0 10px}.stage6-archive .archive-sources{margin:15px 0 0;padding-top:11px;border-top:1px solid var(--line);font-size:10px}.stage6-attention{display:block;margin:15px 0 2px;padding-left:11px;border-left:2px solid var(--amber);color:var(--text);font-weight:700}.stage6-archive .correspondence-table{margin:20px 0 0;padding:15px;border:1px solid var(--line);background:#08110e;color:#a7c1ba;font:12px/1.65 "IBM Plex Mono",monospace}.stage6-archive .correspondence-table h3{margin:0 0 9px;color:var(--text);font-size:12px;letter-spacing:.08em}.stage6-archive .correspondence-table p{margin:0 0 12px}.stage6-archive .correspondence-form input{border-color:var(--line);background:#06100d;color:var(--text)}.stage6-archive .correspondence-form button{border-color:var(--green);color:var(--green)}.stage6-archive .correspondence-result{min-height:28px;margin:13px 0 0;color:var(--amber);font-size:28px}.stage6-archive .archive-back{margin:18px 0 0;border-color:var(--line);color:var(--text)}
    .dashboard-card.is-stage6-archive .dashboard-head,.dashboard-card.is-stage6-archive .stages-wrap,.dashboard-card.is-stage6-archive .dashboard-footer{display:none!important}
    @media(max-width:520px){.zodiac-mark{transform:rotate(calc(var(--mark) * 30deg)) translateY(calc(-1 * min(43vw, 145px))) rotate(calc(var(--mark) * -30deg));font-size:24px}.mirror-v2-field{width:100%;max-width:340px}.stage6-archive{font-size:15px}.correspondence-form{gap:9px}.correspondence-form button{width:100%}}
  `;
  document.head.appendChild(style);

  const additionalNotesStyle = document.createElement('style');
  additionalNotesStyle.textContent = `
    .stage6-additional-notes{margin:22px 0 0;border:1px solid #6d5630;border-radius:4px;background:rgba(83,60,24,.12);overflow:hidden}.stage6-additional-notes h3{margin:0;padding:11px 12px;border-bottom:1px solid rgba(109,86,48,.55);color:var(--amber,#d5a64a);font:700 10px "IBM Plex Mono",monospace;letter-spacing:.12em}.stage6-additional-notes article{padding:11px 12px 10px;border-bottom:1px solid rgba(109,86,48,.28)}.stage6-additional-notes article:last-child{border-bottom:0}.stage6-additional-notes span{display:block;margin-bottom:5px;color:var(--text-soft,#9aa9a3);font:700 8px "IBM Plex Mono",monospace;letter-spacing:.1em}.stage6-additional-notes article:last-child span{color:var(--amber,#d5a64a)}.stage6-additional-notes p{margin:0;color:var(--text,#d8e4df);font-size:12.5px;line-height:1.6}
  `;
  additionalNotesStyle.textContent += `
    .stage6-additional-notes .stage6-notes-toggle{display:flex;align-items:center;justify-content:space-between;width:100%;padding:12px;border:0;border-bottom:1px solid rgba(109,86,48,.55);background:transparent;color:#d3a268;font:700 11px "IBM Plex Mono",monospace;letter-spacing:.06em;text-align:left;cursor:pointer}
    .stage6-additional-notes .stage6-notes-toggle:disabled{cursor:default}
    .stage6-notes-chevron{font-size:15px}
    .stage6-notes-history[hidden]{display:none!important}
    .stage6-notes-history article{border-bottom:1px solid rgba(109,86,48,.3)}
    .stage6-notes-history article:last-child{border-bottom:0}
    .stage6-additional-notes .stage6-notes-request{display:block;width:calc(100% - 24px);margin:10px 12px 12px;padding:11px 12px;border:1px solid #805f37;border-radius:4px;background:#18110d;color:#e6b778;font:700 11px "IBM Plex Mono",monospace;letter-spacing:.045em;cursor:pointer}
    .stage6-additional-notes .stage6-notes-request:disabled{opacity:.62;cursor:default}
    .stage6-additional-notes .stage6-notes-request[hidden]{display:none!important}
    .stage6-additional-notes .stage6-notes-toggle:focus-visible,.stage6-additional-notes .stage6-notes-request:focus-visible{outline:2px solid #d5a46b;outline-offset:2px}
  `;
  document.head.appendChild(additionalNotesStyle);

  const mirrorVideoStyle = document.createElement('style');
  mirrorVideoStyle.textContent = `
    .mirror-v2-surface{overflow:hidden}.mirror-v2-video{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000;object-fit:cover}.mirror-v2-surface.is-revealing{background:#000}.mirror-v2-surface.is-revealing:after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 32px rgba(0,0,0,.72)}.mirror-v2-video[hidden],.mirror-video-controls[hidden]{display:none!important}.mirror-video-play{margin:9px auto 0;padding:9px 12px;border:1px solid #87662e;background:rgba(44,31,12,.3);color:#e5bd76;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.12em;cursor:pointer}.mirror-video-play:hover,.mirror-video-play:focus-visible{border-color:#e5bd76;color:#f7d391;outline:0}
  `;
  document.head.appendChild(mirrorVideoStyle);

  const correspondenceStyle = document.createElement('style');
  correspondenceStyle.textContent = `
    .mirror-video-controls{display:flex;justify-content:center;gap:8px;margin:9px auto 0}.mirror-activate,.mirror-deactivate{padding:9px 12px;border:1px solid #87662e;background:rgba(44,31,12,.3);color:#e5bd76;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.12em;cursor:pointer}.mirror-deactivate{border-color:#4b5d54;color:#acc0b6}.mirror-activate:hover,.mirror-activate:focus-visible,.mirror-deactivate:hover,.mirror-deactivate:focus-visible{border-color:#e5bd76;color:#f7d391;outline:0}.correspondence-save{margin:0;padding:9px 11px;border:1px solid #87662e;background:rgba(44,31,12,.22);color:#e5bd76;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.1em;cursor:pointer}.correspondence-saved{margin-top:15px;padding-top:12px;border-top:1px solid rgba(109,86,48,.52)}.correspondence-empty,.correspondence-saved-title{margin:0;color:#91a59c;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.1em}.correspondence-saved-title{margin-bottom:8px;color:#e3bb75}.correspondence-saved-item{display:flex;align-items:center;gap:10px;min-height:33px;border-top:1px solid rgba(54,82,73,.7)}.correspondence-saved-item span{width:20px;color:#e5bd76;font:22px/1 Georgia,serif}.correspondence-saved-item small{flex:1;color:#a4b9ae;font:10px "IBM Plex Mono",monospace}.correspondence-saved-item button{padding:4px 0;border:0;background:none;color:#bd806f;font:700 8px "IBM Plex Mono",monospace;letter-spacing:.08em;cursor:pointer}.correspondence-saved-item button:hover{color:#efaa94}
  `;
  document.head.appendChild(correspondenceStyle);
})();
