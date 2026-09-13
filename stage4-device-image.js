// ETAPA 04 — imagem do aparelho sonoro incomum
(function () {
  const IMAGE_CANDIDATES = [
    'assets/stage4/aparelho-incomum.png',
    'assets/stage4/aparelho-incomum.png.png',
    'assets/stage4/aparelho-incomum.jpg',
    'assets/stage4/aparelho-incomum.jpg.jpg',
    'assets/stage4/aparelho-incomum.jpeg',
    'assets/stage4/aparelho-incomum.jpeg.jpeg'
  ];

  function setImageWithFallback(img, index) {
    if (index >= IMAGE_CANDIDATES.length) {
      const card = img.closest('.stage4-device-card');
      if (card) card.classList.add('image-missing');
      img.removeAttribute('src');
      return;
    }
    img.onerror = () => setImageWithFallback(img, index + 1);
    img.src = IMAGE_CANDIDATES[index] + '?v=20260913p';
  }

  function ensureDeviceViewer() {
    let viewer = document.getElementById('stage4DeviceViewer');
    if (viewer) return viewer;

    viewer = document.createElement('div');
    viewer.id = 'stage4DeviceViewer';
    viewer.className = 'stage4-device-viewer';
    viewer.hidden = true;
    viewer.innerHTML = `
      <div class="stage4-device-viewer-backdrop">
        <button class="stage4-device-viewer-close" type="button" aria-label="Fechar">×</button>
        <div class="stage4-device-viewer-content" role="dialog" aria-modal="true" aria-label="Visualização do aparelho sonoro incomum">
          <img class="stage4-device-viewer-image" alt="Aparelho sonoro incomum" />
          <p class="stage4-device-viewer-label">APARELHO SONORO INCOMUM</p>
        </div>
      </div>`;
    document.body.appendChild(viewer);

    const close = () => {
      viewer.hidden = true;
      document.body.classList.remove('stage4-device-viewer-open');
    };

    viewer.querySelector('.stage4-device-viewer-close').addEventListener('click', close);
    viewer.querySelector('.stage4-device-viewer-backdrop').addEventListener('click', event => {
      if (event.target.classList.contains('stage4-device-viewer-backdrop')) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !viewer.hidden) close();
    });

    return viewer;
  }

  function openDeviceViewer(source) {
    const viewer = ensureDeviceViewer();
    const image = viewer.querySelector('.stage4-device-viewer-image');
    image.src = source;
    viewer.hidden = false;
    document.body.classList.add('stage4-device-viewer-open');
  }

  function enhanceDeviceRecord() {
    const stageName = document.getElementById('stageName');
    if (!stageName || stageName.textContent.trim() !== 'Iniciativa') return;

    const items = Array.from(document.querySelectorAll('.initiative-material-item'));
    const record = items.find(item => {
      const label = item.querySelector('.initiative-material-toggle span:first-child');
      return label && label.textContent.includes('REGISTRO 06');
    });
    if (!record || record.dataset.deviceImageEnhanced === '1') return;

    const content = record.querySelector('.initiative-material-content');
    if (!content) return;
    record.dataset.deviceImageEnhanced = '1';

    const oldStatus = content.querySelector('.initiative-material-status');
    if (oldStatus) oldStatus.remove();

    const card = document.createElement('button');
    card.className = 'stage4-device-card';
    card.type = 'button';
    card.disabled = true;
    card.innerHTML = `
      <span class="stage4-device-media">
        <img alt="Aparelho sonoro incomum" />
        <span class="stage4-device-placeholder">IMAGEM AINDA NÃO DISPONÍVEL</span>
      </span>
      <span class="stage4-device-foot">
        <strong>APARELHO SONORO INCOMUM</strong>
        <em>ABRIR</em>
      </span>`;

    const img = card.querySelector('img');
    img.addEventListener('load', () => {
      card.classList.remove('image-missing');
      card.disabled = false;
    });
    card.addEventListener('click', () => {
      if (!card.disabled && img.currentSrc) openDeviceViewer(img.currentSrc);
    });

    content.appendChild(card);
    setImageWithFallback(img, 0);
  }

  const previousOpenStage = openStage;
  openStage = function (index) {
    previousOpenStage(index);
    if (stages[index] && stages[index].name === 'Iniciativa') {
      setTimeout(enhanceDeviceRecord, 0);
    }
  };

  const style = document.createElement('style');
  style.textContent = `
    .stage4-device-card{display:block;width:100%;margin-top:14px;padding:0;overflow:hidden;border:1px solid var(--line);border-radius:4px;background:#050b09;color:var(--text-soft,#9aa9a3);font:inherit;text-align:left;cursor:zoom-in}.stage4-device-card:hover:not(:disabled),.stage4-device-card:focus-visible:not(:disabled){border-color:var(--green);outline:none}.stage4-device-card:disabled{cursor:default;opacity:.78}.stage4-device-media{position:relative;display:flex;height:300px;align-items:center;justify-content:center;padding:10px;background:#020504;overflow:hidden}.stage4-device-media img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain}.stage4-device-placeholder{display:none;color:var(--amber,#d5a64a);font-size:10px;font-weight:700;letter-spacing:.08em}.stage4-device-card.image-missing .stage4-device-media img{display:none}.stage4-device-card.image-missing .stage4-device-placeholder{display:block}.stage4-device-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;border-top:1px solid var(--line)}.stage4-device-foot strong{font-size:9px;letter-spacing:.09em}.stage4-device-foot em{font-style:normal;font-size:8px;letter-spacing:.1em;color:var(--green)}
    body.stage4-device-viewer-open{overflow:hidden}.stage4-device-viewer[hidden]{display:none!important}.stage4-device-viewer{position:fixed;inset:0;z-index:3050}.stage4-device-viewer-backdrop{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.94)}.stage4-device-viewer-content{max-width:96vw;max-height:94vh;display:flex;flex-direction:column;align-items:center;justify-content:center}.stage4-device-viewer-image{display:block;width:auto;height:auto;max-width:94vw;max-height:88vh;object-fit:contain;background:#020504;box-shadow:0 14px 50px rgba(0,0,0,.6)}.stage4-device-viewer-label{margin:8px 0 0;color:#9fb8af;font-size:9px;font-weight:700;letter-spacing:.10em}.stage4-device-viewer-close{position:fixed;top:14px;right:16px;z-index:3052;width:40px;height:40px;border:1px solid #547266;border-radius:50%;background:#07110e;color:#dce7e2;font:400 24px/1 'IBM Plex Mono',monospace;cursor:pointer}.stage4-device-viewer-close:hover,.stage4-device-viewer-close:focus-visible{border-color:var(--green);color:var(--green);outline:none}
    @media(max-width:700px){.stage4-device-media{height:230px}.stage4-device-viewer-backdrop{padding:10px}.stage4-device-viewer-image{max-width:96vw;max-height:90vh}.stage4-device-viewer-close{top:8px;right:8px}}
  `;
  document.head.appendChild(style);
})();