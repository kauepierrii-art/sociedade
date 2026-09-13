// Ajustes de galeria da ETAPA 04 — força recarga dos arquivos e amplia a visualização.
(function () {
  const ASSET_VERSION = '20260913g';

  function withFreshVersion(url) {
    const base = String(url || '').split('?')[0];
    return `${base}?v=${ASSET_VERSION}`;
  }

  function refreshStageFourGallery() {
    document.querySelectorAll('.initiative-thumb').forEach(button => {
      const img = button.querySelector('img');
      if (!img) return;

      const freshSrc = withFreshVersion(button.dataset.src || img.getAttribute('src'));
      button.dataset.src = freshSrc;

      if (img.getAttribute('src') !== freshSrc) {
        img.removeAttribute('src');
        img.src = freshSrc;
      }
    });
  }

  const previousOpenStage = openStage;
  openStage = function (index) {
    previousOpenStage(index);
    if (stages[index] && stages[index].name === 'Iniciativa') {
      requestAnimationFrame(refreshStageFourGallery);
    }
  };

  // Caso a etapa já esteja aberta quando este arquivo terminar de carregar.
  requestAnimationFrame(refreshStageFourGallery);

  const style = document.createElement('style');
  style.textContent = `
    /* Miniaturas: preserva a imagem inteira em vez de cortar detalhes. */
    .initiative-thumb img {
      width: 100% !important;
      height: 150px !important;
      object-fit: contain !important;
      background: #030705 !important;
    }

    /* Visualizador: abre grande, ocupando a maior área útil da tela. */
    .initiative-lightbox {
      padding: 18px !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .initiative-lightbox[hidden] { display: none !important; }
    .initiative-lightbox-dialog {
      width: calc(100vw - 36px) !important;
      height: calc(100vh - 36px) !important;
      min-width: 0 !important;
      min-height: 0 !important;
      margin: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: auto !important;
    }
    .initiative-lightbox-image {
      display: block !important;
      width: auto !important;
      height: auto !important;
      max-width: min(96vw, 1600px) !important;
      max-height: calc(100vh - 90px) !important;
      min-width: min(70vw, 1000px);
      object-fit: contain !important;
      flex: 0 1 auto !important;
    }
    .initiative-lightbox-label {
      margin-top: 8px !important;
    }

    @media (max-width: 700px) {
      .initiative-thumb img { height: 132px !important; }
      .initiative-lightbox { padding: 8px !important; }
      .initiative-lightbox-dialog {
        width: calc(100vw - 16px) !important;
        height: calc(100vh - 16px) !important;
      }
      .initiative-lightbox-image {
        min-width: 0 !important;
        width: auto !important;
        max-width: 96vw !important;
        max-height: calc(100vh - 70px) !important;
      }
    }
  `;
  document.head.appendChild(style);
})();
