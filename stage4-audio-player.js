// ETAPA 04 — player da fita magnética convencional
(function () {
  const AUDIO_SRC = 'assets/stage4/coordenadas-oficial.mp3';

  function enhanceStageFourAudio() {
    const stageName = document.getElementById('stageName');
    if (!stageName || stageName.textContent.trim() !== 'Iniciativa') return;

    const items = Array.from(document.querySelectorAll('.initiative-material-item'));
    const record = items.find(item => {
      const button = item.querySelector('.initiative-material-toggle span:first-child');
      return button && button.textContent.includes('REGISTRO 04');
    });
    if (!record || record.dataset.audioEnhanced === '1') return;

    record.dataset.audioEnhanced = '1';

    const title = record.querySelector('.initiative-material-toggle span:first-child');
    if (title) title.textContent = 'REGISTRO 04 — FITA MAGNÉTICA';

    const content = record.querySelector('.initiative-material-content');
    if (!content) return;

    const description = content.querySelector('p');
    if (description) {
      description.textContent = 'Fita magnética de formato convencional encontrada junto aos demais materiais. Parte do conteúdo pôde ser recuperada.';
    }

    const oldStatus = content.querySelector('.initiative-material-status');
    if (oldStatus) oldStatus.remove();

    const player = document.createElement('div');
    player.className = 'stage4-recovered-audio';
    player.innerHTML = `
      <div class="stage4-audio-head">
        <strong>GRAVAÇÃO RECUPERADA — TRECHO 01</strong>
        <span>00:56</span>
      </div>
      <audio controls preload="metadata" src="${AUDIO_SRC}">
        Seu navegador não oferece suporte à reprodução de áudio.
      </audio>
      <p class="stage4-audio-note">Conteúdo parcialmente recuperado da fita magnética convencional.</p>`;
    content.appendChild(player);
  }

  const previousOpenStage = openStage;
  openStage = function (index) {
    previousOpenStage(index);
    if (stages[index] && stages[index].name === 'Iniciativa') {
      setTimeout(enhanceStageFourAudio, 0);
    }
  };

  const style = document.createElement('style');
  style.textContent = `
    .stage4-recovered-audio{margin-top:14px;padding:14px;border:1px solid rgba(150,177,166,.24);background:rgba(4,10,8,.62)}
    .stage4-audio-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;color:#d7e5df;font-size:10px;letter-spacing:.07em}
    .stage4-audio-head span{color:#8ca59c;font-weight:400}
    .stage4-recovered-audio audio{display:block;width:100%;height:40px}
    .stage4-audio-note{margin:10px 0 0!important;color:#8ca59c;font-size:10px;line-height:1.5}
  `;
  document.head.appendChild(style);
})();