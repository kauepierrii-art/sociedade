// ETAPA 07 — ADMISSÃO / ENCERRAMENTO DO PROTOCOLO DELECTUS
(function () {
  const stageIndex = stages.findIndex(stage => stage && stage.name === 'Admissão');
  const stageStep = stageIndex + 1;

  function stateKey() {
    return currentRefKey ? 'stage7:admission:' + currentRefKey : null;
  }
  function isClosed() {
    return Boolean(stateKey() && localStorage.getItem(stateKey()) === 'closed');
  }
  function closeProtocol() {
    if (stateKey()) localStorage.setItem(stateKey(), 'closed');
    if (stageStep && currentRefKey) {
      completedCount = Math.max(completedCount, stageStep);
      saveProgress(currentRefKey, completedCount);
    }
  }
  function monogram() {
    return '<img class="ordo-monogram" src="assets/ordo-mognus-logo.png" alt="Monograma oficial da Ordo Mognus">';
  }
  function renderFinal(actions) {
    document.querySelector('#stageStatus').textContent = 'ADMISSÃO CONFIRMADA';
    actions.innerHTML =
      '<section class="ordo-final" aria-label="Admissão confirmada">' +
        monogram() +
        '<h1>ORDO MOGNUS</h1>' +
        '<p class="ordo-values">DISCIPLINA · CONHECIMENTO · PROPÓSITO</p>' +
        '<p class="ordo-final-line">Mais que uma sociedade.<br>Um compromisso com o que permanece.</p>' +
        '<small>ADMISSÃO CONFIRMADA</small>' +
      '</section>';
  }
  function renderAdmission() {
    const actions = document.querySelector('#stageActions');
    const context = document.querySelector('#stageContext');
    const mission = document.querySelector('#stageMission');
    const panelHead = document.querySelector('.detail-panel .panel-head');
    if (!actions || !currentRefKey) return;
    if (context) context.hidden = true;
    if (mission) mission.hidden = true;
    if (panelHead) panelHead.hidden = true;
    document.querySelector('#stageCode').textContent = 'ETAPA 07 — ADMISSÃO';
    document.querySelector('#stageName').textContent = 'RESULTADO DO PROTOCOLO';
    if (isClosed()) { renderFinal(actions); return; }
    document.querySelector('#stageStatus').textContent = 'ADMISSÃO AUTORIZADA';
    actions.innerHTML =
      '<section class="ordo-admission">' +
        '<header class="ordo-opening ordo-reveal-1"><p>ETAPA 07 — ADMISSÃO</p><span>RESULTADO DO PROTOCOLO</span></header>' +
        '<div class="ordo-copy ordo-reveal-2">' +
          '<p>O processo foi concluído.</p>' +
          '<p>Sua referência foi acompanhada desde o primeiro acesso.</p>' +
          '<p>As etapas anteriores não foram destinadas apenas à obtenção de respostas.</p>' +
          '<p>Foram observadas a forma como informações incompletas foram tratadas, como contradições foram examinadas e como decisões foram tomadas diante de materiais cuja natureza nem sempre era evidente.</p>' +
          '<p>O protocolo foi concluído.</p><p>Sua admissão foi autorizada.</p>' +
        '</div>' +
        '<div class="ordo-revelation ordo-reveal-3">' + monogram() + '<h1>ORDO MOGNUS</h1><p>Bem-vindo à Ordo Mognus.</p><small>DISCIPLINA · CONHECIMENTO · PROPÓSITO</small></div>' +
        '<div class="ordo-copy ordo-reveal-4">' +
          '<p>Durante séculos, acontecimentos como os que você examinou foram tratados como fraude, erro de registro, coincidência ou superstição.</p>' +
          '<p>Alguns são exatamente isso.</p><p>Outros não são.</p>' +
          '<p>A Ordo Mognus existe para distinguir uns dos outros.</p>' +
          '<p>Chamamos essas ocorrências de Divergências.</p>' +
          '<p>Elas não obedecem a uma única natureza. Algumas permanecem durante séculos sem produzir qualquer consequência perceptível. Outras deixam registros incompatíveis, observações impossíveis ou objetos cuja existência não pode ser explicada apenas pelo contexto em que foram encontrados.</p>' +
          '<p>O espelho é apenas uma delas.</p>' +
        '</div>' +
        '<blockquote class="ordo-statement ordo-reveal-5">O protocolo que você concluiu não foi criado para investigar o espelho.<br><strong>O espelho foi utilizado para investigar você.</strong></blockquote>' +
        '<section class="ordo-confirmation ordo-reveal-6"><p>REFERÊNCIA ACEITA</p><h2>ADMISSÃO CONFIRMADA</h2><small>REFERÊNCIA: ' + currentRefLabel + '</small></section>' +
        '<button class="ordo-close ordo-reveal-6" type="button">ENCERRAR PROTOCOLO</button>' +
      '</section>';
    actions.querySelector('.ordo-close').addEventListener('click', () => {
      closeProtocol();
      renderAdmission();
    });
  }

  const previousOpenStage = openStage;
  openStage = function (index) {
    previousOpenStage(index);
    if (index === stageIndex) setTimeout(renderAdmission, 0);
  };

  const style = document.createElement('style');
  style.textContent = `
    .ordo-admission,.ordo-final{position:relative;overflow:hidden;max-width:760px;margin:0 auto;padding:clamp(32px,8vw,68px) clamp(22px,7vw,72px);border:1px solid rgba(169,125,55,.6);background:radial-gradient(ellipse at 50% 12%,rgba(109,35,39,.32),transparent 45%),linear-gradient(145deg,#120708,#260b0d 52%,#0b0606);box-shadow:inset 0 0 0 7px rgba(0,0,0,.2),0 18px 45px rgba(0,0,0,.45);color:#eee3ca;text-align:center}.ordo-admission:before,.ordo-final:before{content:"";position:absolute;inset:11px;border:1px solid rgba(183,139,66,.28);pointer-events:none}.ordo-opening{margin:0 0 48px}.ordo-opening p,.ordo-opening span,.ordo-confirmation p,.ordo-confirmation small,.ordo-final small,.ordo-values{font:700 10px "IBM Plex Mono",monospace;letter-spacing:.16em}.ordo-opening p{margin:0 0 8px;color:#d3aa68}.ordo-opening span{color:#bda888}.ordo-copy{max-width:590px;margin:0 auto;color:#e8ddc5;font:16px/1.78 Georgia,"Times New Roman",serif;text-align:left}.ordo-copy p{margin:0 0 18px}.ordo-revelation{margin:72px 0 65px;padding:42px 0;border-top:1px solid rgba(183,139,66,.55);border-bottom:1px solid rgba(183,139,66,.55)}.ordo-monogram{display:block;width:clamp(98px,18vw,142px);height:auto;margin:0 auto 20px;filter:drop-shadow(0 3px 6px rgba(0,0,0,.5))}.ordo-revelation h1,.ordo-final h1{margin:0;color:#dfbc7c;font:400 clamp(29px,7vw,47px)/1.1 Georgia,"Times New Roman",serif;letter-spacing:.16em}.ordo-revelation>p{margin:14px 0 24px;color:#f0e6d0;font:italic 18px/1.5 Georgia,serif}.ordo-revelation small{color:#cba96f;font:700 9px "IBM Plex Mono",monospace;letter-spacing:.15em}.ordo-statement{max-width:620px;margin:68px auto;padding:35px 18px;border-top:1px solid rgba(183,139,66,.5);border-bottom:1px solid rgba(183,139,66,.5);color:#e8d6ae;font:italic 20px/1.6 Georgia,"Times New Roman",serif}.ordo-statement strong{display:block;margin-top:12px;color:#f4d28d;font-style:normal}.ordo-confirmation{margin:0 auto 30px;padding:28px 16px;border:1px solid rgba(183,139,66,.58);background:rgba(25,7,8,.48)}.ordo-confirmation p{margin:0 0 10px;color:#cba96f}.ordo-confirmation h2{margin:0 0 12px;color:#f0d49c;font:400 24px/1.25 Georgia,serif;letter-spacing:.09em}.ordo-confirmation small{color:#d5c4a4}.ordo-close{display:block;margin:0 auto;padding:13px 18px;border:1px solid #bd914e;background:linear-gradient(145deg,#3c1516,#17090a);color:#ead09b;font:700 10px "IBM Plex Mono",monospace;letter-spacing:.14em;cursor:pointer}.ordo-close:hover,.ordo-close:focus-visible{background:#5a2021;color:#fff0cc;outline:0}.ordo-final{display:grid;min-height:520px;place-content:center;animation:ordo-arrive 1s ease both}.ordo-final .ordo-monogram{width:clamp(120px,23vw,174px);margin-bottom:30px}.ordo-final h1{margin-bottom:28px}.ordo-values{margin:0;color:#cba96f}.ordo-final-line{margin:52px 0;color:#eee3ca;font:italic 19px/1.6 Georgia,serif}.ordo-final small{color:#9e8560}.ordo-admission .ordo-reveal-1{animation:ordo-arrive .65s ease both}.ordo-admission .ordo-reveal-2{animation:ordo-arrive .8s .25s ease both}.ordo-admission .ordo-reveal-3{animation:ordo-arrive .9s .65s ease both}.ordo-admission .ordo-reveal-4{animation:ordo-arrive .85s .95s ease both}.ordo-admission .ordo-reveal-5{animation:ordo-arrive .85s 1.2s ease both}.ordo-admission .ordo-reveal-6{animation:ordo-arrive .75s 1.45s ease both}@keyframes ordo-arrive{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}@media(max-width:520px){.ordo-admission,.ordo-final{padding:34px 19px}.ordo-opening{margin-bottom:35px}.ordo-copy{font-size:15px}.ordo-revelation{margin:52px 0;padding:32px 0}.ordo-statement{margin:52px auto;font-size:18px}.ordo-final{min-height:440px}.ordo-revelation h1,.ordo-final h1{font-size:29px;letter-spacing:.12em}}
  `;
  document.head.appendChild(style);
})();
