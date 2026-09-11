// Ajustes de fluxo do protocolo.
// Nova versão de armazenamento para não herdar estados de testes anteriores.
loadProgress = function(refKey) {
  const stored = Number(localStorage.getItem(`progress:v3:${refKey}`));
  return Number.isInteger(stored) && stored >= 0 && stored <= stages.length ? stored : 0;
};

saveProgress = function(refKey, value) {
  localStorage.setItem(`progress:v3:${refKey}`, String(value));
};

infoKey = function() {
  return `important-info-seen:v2:${currentRefKey}`;
};

window.PROTOCOL_CONTINUE_URL = window.PROTOCOL_CONTINUE_URL || '';

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
        <span class="stage-title">${String(step).padStart(2, '0')} — ${stage.name}</span>
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
