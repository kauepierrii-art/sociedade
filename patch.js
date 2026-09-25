// Ajustes de fluxo do protocolo.
// Nova versão de armazenamento para não herdar estados de testes anteriores.
loadProgress = function(refKey) {
  const stored = Number(localStorage.getItem(`progress:v3:${refKey}`));
  return Number.isInteger(stored) && stored >= 0 && stored <= stages.length ? stored : 0;
};

saveProgress = function(refKey, value) {
  localStorage.setItem(`progress:v3:${refKey}`, String(value));
};

// app.js remove a chave legada; esta versão também precisa remover o estado
// atualmente usado pelo jogo. O sincronizador preserva a sessão anterior no
// painel e abre outra para a nova tentativa.
const resetActivitiesV3 = resetActivities;
resetActivities = function() {
  const refKey = currentRefKey;
  resetActivitiesV3();
  if (refKey) localStorage.removeItem(`progress:v3:${refKey}`);
};

// Usado pelo reinício administrativo: limpa somente o estado deste navegador,
// sem remover o token da sessão que o servidor acabou de reiniciar.
window.DelectusClearLocalAttempt = function(refKey) {
  if (!refKey) return;
  localStorage.removeItem(`progress:${refKey}`);
  localStorage.removeItem(`progress:v3:${refKey}`);
  localStorage.removeItem(`important-info-seen:${refKey}`);
  localStorage.removeItem(`important-info-seen:v2:${refKey}`);
  localStorage.removeItem(`identification:v2:errors:${refKey}`);
  localStorage.removeItem(`identification:v2:until:${refKey}`);
  localStorage.removeItem(`stage5:part-one:${refKey}`);
  localStorage.removeItem(`stage5:complete:${refKey}`);
  localStorage.removeItem(`stage4:tuner-solved:${refKey}`);
  ['visited', 'document', 'remaining', 'annotations', 'research', 'activated'].forEach(name => localStorage.removeItem(`stage6:${name}:${refKey}`));
  ['visited', 'remaining', 'stabilized', 'videoWatched', 'savedCorrespondences', 'additionalNotesElapsed', 'additionalNotesRequested', 'additionalNotesNextAt'].forEach(name => localStorage.removeItem(`stage6:v2:${name}:${refKey}`));
  localStorage.removeItem(`stage7:admission:${refKey}`);
  ['stage4', 'stage5'].forEach(name => ['unlocked', 'nextAt'].forEach(part => localStorage.removeItem(`stage45-hints:${name}:${part}:${refKey}`)));
};

infoKey = function() {
  return `important-info-seen:v2:${currentRefKey}`;
};

window.PROTOCOL_CONTINUE_URL = 'https://kauepierrii-art.github.io/ordomognus/';

function lockIcon() {
  return `
    <svg class="inline-lock" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;
}

renderDashboard = function() {
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
    if (state === 'locked') badge = `<span class="stage-badge" aria-label="bloqueada">${lockIcon()}</span>`;

    let subtitle = stage.subtitle;
    if (step === 1 && state === 'info-required') subtitle = 'leia as informações antes de prosseguir';
    if (step === 1 && state === 'available') subtitle = 'aguardando validação';
    if (step === 1 && state === 'done') subtitle = 'correspondência confirmada';

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

  // O botão inferior não navega entre etapas. Ele só é liberado após a Admissão.
  const admitted = completedCount >= stages.length;
  continueBtn.disabled = !admitted;
  continueBtn.classList.toggle('is-admitted', admitted);
  continueBtn.innerHTML = admitted
    ? '<span aria-hidden="true">→</span> Continuar'
    : `${lockIcon()} <span>Continuar</span>`;

  continueBtn.onclick = admitted
    ? () => {
        if (window.PROTOCOL_CONTINUE_URL) {
          window.location.href = window.PROTOCOL_CONTINUE_URL;
        }
      }
    : null;
};

// Aceita também uma resposta natural para a Aptidão.
document.addEventListener('submit', function(event) {
  if (!event.target || event.target.id !== 'aptitudeForm') return;

  const answerInput = document.querySelector('#aptitudeAnswer');
  if (!answerInput) return;

  const answer = normalizeAnswer(answerInput.value);
  if (answer !== 'caixa do espelho') return;

  event.preventDefault();
  event.stopImmediatePropagation();

  completedCount = Math.max(completedCount, 2);
  saveProgress(currentRefKey, completedCount);

  const message = document.querySelector('#aptitudeMessage');
  if (message) {
    message.style.color = 'var(--green)';
    message.textContent = 'DIVERGÊNCIA CONFIRMADA.';
  }

  setTimeout(() => {
    renderDashboard();
    show(dashboardView);
  }, 900);
}, true);

// ETAPA 03 — OBSERVAÇÃO
stages[2].subtitle = 'avaliação de observação';
stages[2].context = 'Na etapa anterior, a análise documental se concentrou no espelho negro associado a John Dee.\n\nO material a seguir dá continuidade à investigação. Localize o espelho na sala e, ao encontrá-lo, observe com atenção o ambiente ao redor.';
stages[2].mission = '';

function renderStageThree(actions, readOnly = false) {
  actions.innerHTML = `
    <div class="observation-material">
      <p class="observation-label">REGISTRO AUDIOVISUAL</p>
      <a class="observation-video-link" href="https://youtu.be/e6t1TFzlgIk" target="_blank" rel="noopener">
        https://youtu.be/e6t1TFzlgIk <span aria-hidden="true">↗</span>
      </a>
    </div>
    <div class="answer-panel observation-answer-panel">
      <p><strong>Qual palavra aparece no volume superior da pilha de livros?</strong></p>
      <form id="observationForm" autocomplete="off">
        <label for="observationAnswer" class="validation-label">RESPOSTA</label>
        <input id="observationAnswer" class="answer-input" type="text" required${readOnly ? ' value="MAGICK" disabled' : ''} />
        <button class="primary-btn" type="submit"${readOnly ? ' disabled' : ''}>VALIDAR</button>
        <p id="observationMessage" class="answer-message" role="status">${readOnly ? 'OBSERVAÇÃO CONFIRMADA — RESPOSTA: MAGICK.' : ''}</p>
      </form>
    </div>`;

  if (readOnly) {
    const message = document.querySelector('#observationMessage');
    if (message) message.style.color = 'var(--green)';
    return;
  }

  const form = document.querySelector('#observationForm');
  const message = document.querySelector('#observationMessage');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const answer = normalizeAnswer(document.querySelector('#observationAnswer').value);
    const accepted = ['magick'];

    if (accepted.includes(answer)) {
      completedCount = Math.max(completedCount, 3);
      saveProgress(currentRefKey, completedCount);
      message.style.color = 'var(--green)';
      message.textContent = 'OBSERVAÇÃO CONFIRMADA.';
      setTimeout(() => {
        renderDashboard();
        show(dashboardView);
      }, 900);
    } else {
      message.style.color = 'var(--danger)';
      message.textContent = 'RESPOSTA NÃO CONFIRMADA.';
    }
  });
}

const originalOpenStage = openStage;
openStage = function(index) {
  if (index !== 2) {
    originalOpenStage(index);
    return;
  }

  const step = 3;
  const stage = stages[2];
  const state = stageVisualState(step);
  if (state === 'locked' || state === 'info-required') return;
  if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }

  // Esta etapa tem um renderizador próprio e não passa por app.js/openStage.
  // Restaurar os elementos ocultados ao entrar nas etapas 06 ou 07.
  const panelHead = document.querySelector('#stageView .detail-panel .panel-head');
  const context = document.querySelector('#stageContext');
  if (panelHead) panelHead.hidden = false;
  if (context) context.hidden = false;

  document.querySelector('#stageCode').textContent = 'ETAPA 03';
  document.querySelector('#stageName').textContent = stage.name;
  document.querySelector('#stageContext').textContent = stage.context;

  const stageMission = document.querySelector('#stageMission');
  stageMission.hidden = true;
  stageMission.textContent = '';
  stageStatus.textContent = state === 'done' ? 'concluída' : 'disponível';

  const actions = document.querySelector('#stageActions');
  actions.innerHTML = '';
  renderStageThree(actions, state === 'done');
  show(stageView);
};

// No celular, documentos abertos passam a ocupar quase toda a largura útil.
// A ideia é manter os registros recolhíveis, mas tratar o conteúdo como uma área de leitura.
const readingStyle = document.createElement('style');
readingStyle.textContent = `
  .observation-material {
    padding: 15px 16px;
    border: 1px solid var(--line);
    border-radius: 5px;
    background: #08110e;
  }

  .observation-label {
    margin: 0 0 9px;
    color: var(--text-soft);
    font-size: 10px;
    letter-spacing: .14em;
  }

  .observation-video-link {
    color: var(--green);
    font-size: 13px;
    line-height: 1.5;
    word-break: break-all;
    text-decoration: none;
  }

  .observation-video-link:hover,
  .observation-video-link:focus-visible {
    text-decoration: underline;
  }

  .observation-answer-panel {
    margin-top: 18px;
  }

  .observation-answer-panel > p:first-child {
    margin-top: 0;
    font-size: 14px;
    line-height: 1.65;
  }

  @media (max-width: 700px) {
    #stageActions {
      padding-left: 7px;
      padding-right: 7px;
    }

    .records-list {
      gap: 8px;
    }

    .record-toggle,
    .attachment-toggle {
      padding: 14px 12px;
      font-size: 13px;
      line-height: 1.45;
    }

    .record-content {
      padding: 2px 11px 16px;
      font-size: 14px;
      line-height: 1.8;
    }

    .record-content p,
    .record-content li,
    .record-content blockquote {
      font-size: 14px;
      line-height: 1.8;
    }

    .record-content h3 {
      font-size: 17px;
      line-height: 1.35;
      margin-top: 20px;
    }

    .record-content h4 {
      font-size: 15px;
      line-height: 1.4;
      margin-top: 18px;
    }

    .attachments-list {
      margin-left: -7px;
      margin-right: -7px;
      gap: 10px;
    }

    .attachment-item {
      border-left-color: #21483c;
      border-right-color: #21483c;
    }

    .attachment-content {
      padding: 4px 13px 18px;
      font-size: 14px;
      line-height: 1.82;
      background: #07100d;
    }

    .attachment-content p,
    .attachment-content li,
    .attachment-content blockquote {
      font-size: 14px;
      line-height: 1.82;
    }

    .doc-meta {
      font-size: 11.5px;
      line-height: 1.7;
    }

    .doc-section-title {
      font-size: 12px;
      line-height: 1.5;
      margin-top: 18px;
    }

    .doc-list {
      margin-left: 20px;
    }
  }

  @media (max-width: 430px) {
    .stage-card {
      padding-left: 8px;
      padding-right: 8px;
    }

    .detail-panel {
      border-left-color: #16362d;
      border-right-color: #16362d;
    }

    .context-copy,
    .mission-copy {
      padding-left: 13px;
      padding-right: 13px;
      font-size: 14px;
    }

    .record-content,
    .attachment-content {
      font-size: 14.5px;
    }

    .record-content p,
    .record-content li,
    .record-content blockquote,
    .attachment-content p,
    .attachment-content li,
    .attachment-content blockquote {
      font-size: 14.5px;
    }
  }
`;
document.head.appendChild(readingStyle);

