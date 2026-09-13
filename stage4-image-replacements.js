// ETAPA 04 — substituição preparada para as três imagens do REGISTRO 03
(function () {
  const replacements = [
    {
      label: 'IMAGEM A',
      primary: 'assets/stage4/imagem-a-v2.png?v=20260913q',
      fallback: 'assets/stage4/imagem-a.jfif.jfif?v=20260913j'
    },
    {
      label: 'IMAGEM B',
      primary: 'assets/stage4/imagem-b-v2.png?v=20260913q',
      fallback: 'assets/stage4/imagem-b.jfif.jfif?v=20260913j'
    },
    {
      label: 'IMAGEM C',
      primary: 'assets/stage4/imagem-c-v2.png?v=20260913q',
      fallback: 'assets/stage4/imagem-c.png.png?v=20260913j'
    }
  ];

  function loadWithFallback(img, item) {
    if (!img) return;
    img.onerror = function () {
      img.onerror = null;
      img.src = item.fallback;
    };
    img.src = item.primary;
  }

  function applyReplacements() {
    const stageName = document.getElementById('stageName');
    if (!stageName || stageName.textContent.trim() !== 'Iniciativa') return;

    const thumbs = Array.from(document.querySelectorAll('.initiative-thumb[data-gallery="images"]'));
    thumbs.forEach((button, index) => {
      const item = replacements[index];
      if (!item) return;

      const thumbImage = button.querySelector('img');
      if (thumbImage && thumbImage.dataset.replacementV2 !== '1') {
        thumbImage.dataset.replacementV2 = '1';
        loadWithFallback(thumbImage, item);
      }

      if (button.dataset.replacementV2Bound === '1') return;
      button.dataset.replacementV2Bound = '1';

      button.addEventListener('click', function () {
        setTimeout(() => {
          const viewer = document.getElementById('initiativeViewer');
          if (!viewer || viewer.hidden) return;

          const viewerImage = viewer.querySelector('.initiative-viewer-image');
          const viewerLabel = viewer.querySelector('.initiative-viewer-label');
          if (viewerImage) {
            viewerImage.onerror = function () {
              viewerImage.onerror = null;
              viewerImage.src = item.fallback;
            };
            viewerImage.src = item.primary;
            viewerImage.alt = item.label;
          }
          if (viewerLabel) viewerLabel.textContent = item.label;
        }, 0);
      });
    });
  }

  const previousOpenStage = openStage;
  openStage = function (index) {
    previousOpenStage(index);
    if (stages[index] && stages[index].name === 'Iniciativa') {
      setTimeout(applyReplacements, 0);
    }
  };
})();