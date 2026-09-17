// ETAPA 06 — DISCERNIMENTO / ESPELHO NEGRO (v2)
(function () {
  const stageIndex = stages.findIndex(stage => stage && stage.name === 'Discernimento');
  const stageStep = stageIndex + 1;
  const zodiac = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const solution = ['♑','♈','♊','♒','♓'];

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
    if (context) context.hidden = true;
    if (mission) mission.hidden = true;
    if (panelHead) panelHead.hidden = true;

    let remaining = read('remaining', visibleDefault());
    if (!Array.isArray(remaining) || remaining.length < 5 || remaining.length > zodiac.length || !remaining.every(sign => zodiac.includes(sign))) remaining = visibleDefault();
    const stabilized = read('stabilized', false) === true;

    document.querySelector('#stageCode').textContent = 'ETAPA 06';
    document.querySelector('#stageName').textContent = 'DISCERNIMENTO';
    document.querySelector('#stageStatus').textContent = stabilized ? 'SUPERFÍCIE ESTABILIZADA' : 'EM ANÁLISE';

    actions.innerHTML =
      '<section class="mirror-v2' + (stabilized ? ' is-stabilized' : '') + '">' +
        '<p class="mirror-question">O que, exatamente, o espelho mostra?</p>' +
        '<div class="mirror-v2-field" aria-label="Espelho negro com doze sinais zodiacais">' +
          '<div class="mirror-v2-rim"></div>' +
          '<div class="mirror-v2-surface"><span class="mirror-whisper">Nem todos os olhos veem o mesmo.</span></div>' +
          zodiac.map((sign, index) => {
            const present = remaining.includes(sign);
            return '<button class="zodiac-mark ' + (present ? 'is-present' : 'is-erased') + '" type="button" data-sign="' + sign + '" style="--mark:' + index + '" aria-label="Sinal zodiacal ' + (index + 1) + '">' + glyph(sign) + '</button>';
          }).join('') +
        '</div>' +
      '</section>';

    const root = actions.querySelector('.mirror-v2');
    function draw() {
      root.querySelectorAll('.zodiac-mark').forEach(button => {
        const present = remaining.includes(button.dataset.sign);
        button.classList.toggle('is-present', present);
        button.classList.toggle('is-erased', !present);
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
        draw();
        return;
      }
      draw();
    }));
    draw();
  }

  window.onMirrorStabilized = window.onMirrorStabilized || function () {
    // Reservado para a continuação narrativa da Etapa 06.
  };

  function openDashboardArchive() {
    const card = document.querySelector('#dashboardView .dashboard-card');
    const stagesWrap = card && card.querySelector('.stages-wrap');
    const footer = card && card.querySelector('.dashboard-footer');
    if (!card || !footer) return null;
    let slot = card.querySelector('.dashboard-archive-slot');
    if (!slot) {
      slot = document.createElement('section');
      slot.className = 'dashboard-archive-slot';
      footer.parentNode.insertBefore(slot, footer);
    }
    if (stagesWrap) stagesWrap.hidden = true;
    return slot;
  }

  function closeDashboardArchive() {
    const card = document.querySelector('#dashboardView .dashboard-card');
    const slot = card && card.querySelector('.dashboard-archive-slot');
    const stagesWrap = card && card.querySelector('.stages-wrap');
    if (slot) slot.remove();
    if (stagesWrap) stagesWrap.hidden = false;
    history.replaceState(null, '', location.pathname + location.search);
  }

  function renderInvestigationArchive(target) {
    if (!currentRefKey) return;
    visit();
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
      'A comparação dos registros preservados revela referências recorrentes a instruções atribuídas a Uriel e à preparação dos instrumentos empregados nas sessões.',
      'Entretanto, a sequência documental apresenta lacunas.',
      'Não é possível determinar, a partir do material preservado, se determinadas instruções foram simplesmente interrompidas, registradas em folhas posteriormente perdidas ou mantidas separadamente por Dee.',
      'Entre materiais associados posteriormente ao conjunto, foi identificado um fragmento cuja procedência não pôde ser confirmada.',
      'O texto parece complementar instruções relacionadas à preparação da superfície utilizada durante as operações de observação.',
      '<span class="stage6-attention">Doze sinais foram dispostos ao redor da superfície.</span>',
      '<span class="stage6-attention">Apenas cinco deveriam permanecer.</span>',
      'A seção que permitiria identificar esses cinco sinais não está preservada.',
      'Outras anotações, entretanto, parecem indicar que Dee conhecia a configuração e optou por não registrá-la diretamente.',
      'Em seu lugar, restaram referências breves e aparentemente pessoais.',
      'Os documentos reunidos nos anexos seguintes foram selecionados por apresentarem possíveis relações com essas referências.',
      'Sua procedência e relevância não são uniformes. Alguns elementos possuem correlação documental conhecida; outros permanecem sem classificação conclusiva.',
      '<span class="stage6-attention">Cinco indivíduos parecem ocorrer de maneira indireta e recorrente no conjunto.</span>',
      '<span class="stage6-attention">Identifique-os.</span>'
    ];
    const reconstruction = [
      'Os cinco sinais não foram preservados de forma explícita.',
      'As referências reunidas parecem funcionar como um sistema de memória: cada conjunto conduz a uma figura e, por meio dela, a uma data específica.',
      'A natureza dessa data não é constante.',
      'Em alguns casos, o acontecimento indicado parece ser mais importante do que o nascimento da própria figura.',
      'Se essa interpretação estiver correta, as datas não eram o objetivo final.',
      '<strong>Eram a forma de recuperar os cinco sinais que Dee decidiu não registrar diretamente.</strong>',
      '<span class="stage6-attention">Determine as datas associadas às cinco referências.</span>'
    ];
    const annexes = [
      ['01', 'CARTOGRÁFICA'], ['02', 'MANUSCRITO / TRANSCRIÇÃO'], ['03', 'PRANCHA ICONOGRÁFICA'], ['04', 'RELATÓRIO'],
      ['05', 'FRAGMENTOS BIOGRÁFICOS'], ['06', 'CRONOLOGIA'], ['07', 'PRANCHA HISTÓRICA'], ['08', 'NOTA DE CORRELAÇÃO']
    ];
    const annexMarkup = annexes.map(item =>
      '<article class="attachment-item"><button class="attachment-toggle" type="button" aria-expanded="false"><span>ANEXO ' + item[0] + ' — ' + item[1] + '</span><span class="chev">＋</span></button><div class="attachment-content" hidden></div></article>'
    ).join('');

    actions.innerHTML =
      '<section class="stage6-archive">' +
        '<header class="stage6-archive-head"><p>ETAPA 06 — DISCERNIMENTO</p><h2>ARQUIVO DE INVESTIGAÇÃO</h2></header>' +
        '<article class="attachment-item"><button class="record-toggle" type="button" aria-expanded="false"><span>REGISTRO 01 — CONTEXTO DOCUMENTAL</span><span class="chev">＋</span></button><div class="record-content" hidden><p class="doc-meta">MATERIAL HISTÓRICO VERIFICÁVEL</p><div class="archive-copy">' + paragraphs(historical) + '</div><p class="archive-sources">Referências: <a href="https://www.bl.uk/manuscripts/FullDisplay.aspx?ref=Sloane_MS_3188" target="_blank" rel="noopener">British Library</a> · <a href="https://hsm.ox.ac.uk/holy-table" target="_blank" rel="noopener">History of Science Museum</a> · <a href="https://www.britishmuseum.org/collection/object/H_1906-0922-1" target="_blank" rel="noopener">British Museum</a></p></div></article>' +
        '<article class="attachment-item"><button class="record-toggle" type="button" aria-expanded="false"><span>REGISTRO 02 — MATERIAL EM ANÁLISE</span><span class="chev">＋</span></button><div class="record-content" hidden><p class="doc-meta">PROCEDÊNCIA NÃO CONFIRMADA</p><div class="archive-copy">' + paragraphs(analysis) + '</div></div></article>' +
        '<section class="stage6-section"><h3>ANEXOS PRESERVADOS</h3><div class="attachments-list">' + annexMarkup + '</div></section>' +
        '<article class="attachment-item"><button class="record-toggle" type="button" aria-expanded="false"><span>REGISTRO 03 — RECONSTRUÇÃO</span><span class="chev">＋</span></button><div class="record-content" hidden><div class="archive-copy">' + paragraphs(reconstruction) + '</div></div></article>' +
        '<section class="correspondence-table"><h3>TÁBUA DE CORRESPONDÊNCIA</h3><p><strong>Insira a data reconstruída para consultar o sinal correspondente.</strong></p><form class="correspondence-form"><label>DIA<input name="day" type="number" inputmode="numeric" min="1" max="31" required></label><label>MÊS<input name="month" type="number" inputmode="numeric" min="1" max="12" required></label><button type="submit">CONSULTAR CORRESPONDÊNCIA</button></form><p class="correspondence-result" aria-live="polite"></p></section>' +
        '<button class="archive-back" type="button">VOLTAR AO PROTOCOLO</button>' +
      '</section>';

    actions.querySelectorAll('.stage6-archive .record-toggle, .stage6-archive .attachment-toggle').forEach(button => button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      button.querySelector('.chev').textContent = open ? '＋' : '−';
      button.nextElementSibling.hidden = open;
    }));

    const form = actions.querySelector('.correspondence-form');
    const result = actions.querySelector('.correspondence-result');
    form.addEventListener('submit', event => {
      event.preventDefault();
      const day = Number(form.elements.day.value);
      const month = Number(form.elements.month.value);
      const valid = Number.isInteger(day) && Number.isInteger(month) && new Date(2000, month - 1, day).getMonth() === month - 1;
      if (!valid) { result.textContent = 'DATA NÃO RECONHECIDA'; return; }
      result.textContent = glyph(zodiacFor(day, month));
    });
    actions.querySelector('.archive-back').addEventListener('click', () => {
      if (onDashboard) closeDashboardArchive();
      else openStage(stageIndex);
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
    previousOpenStage(index);
    if (index !== stageIndex) return;
    setTimeout(renderMirrorStage, 0);
  };

  if (location.hash === '#arquivo-etapa-06') {
    setTimeout(() => {
      if (currentRefKey) renderInvestigationArchive(openDashboardArchive());
    }, 0);
  }

  const style = document.createElement('style');
  style.textContent = `
    .mirror-protocol-link a{color:inherit;text-decoration:none;cursor:pointer}.mirror-protocol-link a:hover{text-shadow:0 0 9px rgba(115,224,201,.48)}
    .mirror-v2{padding:6px 0 4px;text-align:center}.mirror-v2-intro{margin:0 auto 14px;color:#b9cdbf;font:14px/1.6 Georgia,serif}.mirror-archive-link,.archive-back{border:0;border-bottom:1px solid #b28746;padding:7px 2px;background:none;color:#e1b86e;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.12em;cursor:pointer}.mirror-archive-link:hover,.archive-back:hover{color:#f7d391}.mirror-v2-field{position:relative;width:min(100%,460px);aspect-ratio:1;margin:4px auto 0}.mirror-v2-rim,.mirror-v2-surface{position:absolute;left:50%;top:50%;border-radius:50%;transform:translate(-50%,-50%)}.mirror-v2-rim{width:70%;height:70%;background:radial-gradient(circle,#050807 58%,#342717 61%,#0a0c09 69%,#49391e 72%,#060807 74%);filter:drop-shadow(0 15px 20px rgba(0,0,0,.7))}.mirror-v2-surface{display:grid;place-items:center;width:62%;height:62%;background:radial-gradient(ellipse at 38% 25%,#28362d 0,#101a17 30%,#030504 72%);box-shadow:inset 0 0 44px #000}.mirror-v2-surface .mirror-whisper{max-width:76%;color:#dcc18a;font:italic 17px/1.42 Georgia,serif;letter-spacing:.03em;text-shadow:0 1px 0 rgba(0,0,0,.9),0 0 8px rgba(229,196,130,.34);opacity:.8;transform:scaleY(.95);transition:opacity .45s ease,color .45s ease,text-shadow .45s ease;animation:mirror-whisper 3.8s ease-in-out infinite}.mirror-v2-field:hover .mirror-whisper,.mirror-v2-field:active .mirror-whisper{color:#f0d6a0;opacity:1;text-shadow:0 1px 0 rgba(0,0,0,.9),0 0 20px rgba(235,198,126,.72)}@keyframes mirror-whisper{0%,100%{opacity:.63;text-shadow:0 1px 0 rgba(0,0,0,.9),0 0 6px rgba(229,196,130,.18)}50%{opacity:1;text-shadow:0 1px 0 rgba(0,0,0,.9),0 0 17px rgba(229,196,130,.62)}}.mirror-question{margin:0 0 7px;color:#d9c6a2;font:italic 16px/1.55 Georgia,serif}.zodiac-mark{position:absolute;left:calc(50% - 27px);top:calc(50% - 27px);display:grid;place-items:center;width:54px;height:54px;padding:0!important;border:0!important;border-radius:0!important;outline:0!important;appearance:none!important;-webkit-appearance:none!important;background:none!important;background-color:transparent!important;box-shadow:none!important;color:#d8b77e;font:28px Georgia,serif;line-height:1;cursor:pointer;-webkit-tap-highlight-color:transparent;transform:rotate(calc(var(--mark) * 30deg)) translateY(calc(-1 * min(43vw, 196px))) rotate(calc(var(--mark) * -30deg));transition:opacity .22s,color .22s,text-shadow .22s}.zodiac-mark:hover,.zodiac-mark:active,.zodiac-mark:focus,.zodiac-mark:focus-visible{border:0!important;outline:0!important;background:none!important;background-color:transparent!important;box-shadow:none!important}.zodiac-mark.is-present{text-shadow:0 0 10px rgba(216,183,126,.32)}.zodiac-mark.is-erased{color:rgba(182,151,90,.13);opacity:.3;text-shadow:none}.zodiac-mark:hover{color:#f0ce8e}.mirror-v2.is-stabilized .zodiac-mark{cursor:default}.mirror-v2-count{margin:2px 0 8px;color:#8ea79b;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.13em;text-transform:uppercase}.mirror-v2-status{min-height:1.5em;margin:0 0 10px;color:#e3bb75;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.1em}.mirror-stabilize{padding:11px 15px;border:1px solid #87662e;background:rgba(44,31,12,.22);color:#e5bd76;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.12em;cursor:pointer}.mirror-stabilize:disabled{border-color:#3c4035;color:#66746a;background:transparent;cursor:not-allowed}
    .stage6-archive{max-width:720px;margin:0 auto;padding:4px 0 10px;color:#d9c6a2;font:16px/1.72 Georgia,serif}.archive-header{padding:2px 0 24px;border-bottom:1px solid #365249}.archive-header p,.archive-header small,.archive-label{margin:0;color:#8fc7b7;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.14em}.archive-header small{display:block;margin-top:6px;color:#a9b9ac;font-size:9px}.archive-header h2{margin:17px 0 0;color:#f0ce8e;font:700 clamp(22px,5vw,34px)/1.16 Georgia,serif}.archive-document{max-width:660px;margin:0 auto}.archive-document h3,.archive-annexes>h3,.correspondence-table h3{margin:0 0 17px;color:#e2bd7e;font:700 12px "IBM Plex Mono",monospace;letter-spacing:.12em}.archive-copy p{margin:0 0 15px}.archive-copy strong{color:#f0ce8e}.archive-sources{margin:25px 0 0;padding-top:13px;border-top:1px solid #2d453c;color:#91a59c;font:11px/1.6 "IBM Plex Mono",monospace}.archive-sources a{color:#c7a66d}.archive-divider{height:1px;margin:35px 0;background:#365249}.archive-analysis{padding-left:18px;border-left:1px solid #735b35}.archive-annexes{max-width:660px;margin:auto}.archive-annex{border-top:1px solid #365249}.archive-annex:last-child{border-bottom:1px solid #365249}.archive-annex button{display:flex;align-items:center;justify-content:space-between;width:100%;padding:14px 0;border:0;background:none;color:#d9c6a2;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.08em;text-align:left;cursor:pointer}.archive-annex button:hover{color:#efc982}.archive-annex>div{min-height:0}.correspondence-table{max-width:660px;margin:0 auto;padding:20px 0;border-top:1px solid #735b35;border-bottom:1px solid #735b35}.correspondence-table>p{margin:0 0 18px}.correspondence-form{display:flex;flex-wrap:wrap;gap:11px;align-items:end}.correspondence-form label{display:grid;gap:5px;color:#93aa9d;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.1em}.correspondence-form input{width:88px;padding:10px;border:1px solid #486257;background:#08110e;color:#f0ce8e;font:16px "IBM Plex Mono",monospace}.correspondence-form button{padding:11px;border:1px solid #87662e;background:transparent;color:#e5bd76;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.09em;cursor:pointer}.correspondence-result{min-height:38px;margin:16px 0 0;color:#f0ce8e;font:34px/1 Georgia,serif}.archive-back{display:block;margin:30px auto 0}
    .dashboard-archive-slot{margin:18px 0 0}.stage6-archive{max-width:none;margin:0;padding:0;color:var(--text);font:inherit}.stage6-archive-head{margin:0 0 14px;padding:0 0 12px;border-bottom:1px solid var(--line)}.stage6-archive-head p{margin:0;color:var(--green);font:700 10px "IBM Plex Mono",monospace;letter-spacing:.12em}.stage6-archive-head h2{margin:7px 0 0;color:var(--text);font:700 17px "IBM Plex Mono",monospace;letter-spacing:.04em}.stage6-archive .attachment-item{margin-top:8px}.stage6-section{margin:20px 0}.stage6-section h3{margin:0 0 9px;color:var(--amber);font:700 11px "IBM Plex Mono",monospace;letter-spacing:.11em}.stage6-archive .archive-copy p{margin:0 0 10px}.stage6-archive .archive-sources{margin:15px 0 0;padding-top:11px;border-top:1px solid var(--line);font-size:10px}.stage6-attention{display:block;margin:15px 0 2px;padding-left:11px;border-left:2px solid var(--amber);color:var(--text);font-weight:700}.stage6-archive .correspondence-table{margin:20px 0 0;padding:15px;border:1px solid var(--line);background:#08110e;color:#a7c1ba;font:12px/1.65 "IBM Plex Mono",monospace}.stage6-archive .correspondence-table h3{margin:0 0 9px;color:var(--text);font-size:12px;letter-spacing:.08em}.stage6-archive .correspondence-table p{margin:0 0 12px}.stage6-archive .correspondence-form input{border-color:var(--line);background:#06100d;color:var(--text)}.stage6-archive .correspondence-form button{border-color:var(--green);color:var(--green)}.stage6-archive .correspondence-result{min-height:28px;margin:13px 0 0;color:var(--amber);font-size:28px}.stage6-archive .archive-back{margin:18px 0 0;border-color:var(--line);color:var(--text)}
    @media(max-width:520px){.zodiac-mark{transform:rotate(calc(var(--mark) * 30deg)) translateY(calc(-1 * min(43vw, 145px))) rotate(calc(var(--mark) * -30deg));font-size:24px}.mirror-v2-field{width:100%;max-width:340px}.stage6-archive{font-size:15px}.correspondence-form{gap:9px}.correspondence-form button{width:100%}}
  `;
  document.head.appendChild(style);
})();