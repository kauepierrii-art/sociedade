// Ajustes de cópia e navegação da Etapa 02.
(function () {
  const introContext = 'Antes de prosseguir, precisamos avaliar como você lida com informações conflitantes.\n\nOs registros apresentados não foram reunidos para contar uma história completa. Eles foram preservados porque, em algum momento, alguém considerou que certas diferenças mereciam uma segunda análise.\n\nSeu objetivo não é provar uma teoria, nem confirmar a autenticidade de qualquer objeto.\n\nÉ mais simples que isso.';

  const materialIntro = [
    'Nem toda divergência é relevante.',
    'Algumas, no entanto, justificam uma segunda análise.',
    'Os documentos disponibilizados pertencem ao mesmo conjunto e foram preservados por razões que serão esclarecidas posteriormente.',
    'Analise o material e identifique a inconsistência.'
  ];

  // Coloca o texto mais contextual na abertura da Etapa 02.
  if (Array.isArray(stages) && stages[1]) {
    stages[1].context = introContext;
  }

  // Troca o texto introdutório do primeiro registro pelo texto objetivo de análise.
  if (typeof renderStageTwo === 'function') {
    const renderStageTwoBeforeCopySwap = renderStageTwo;
    renderStageTwo = function (actions) {
      renderStageTwoBeforeCopySwap(actions);

      const firstRecord = actions.querySelector('.record-content');
      if (!firstRecord) return;

      const firstHeading = firstRecord.querySelector('h3');
      if (!firstHeading) return;

      const nodesToRemove = [];
      let node = firstHeading.nextSibling;
      while (node) {
        if (node.nodeType === 1 && node.tagName === 'H3') break;
        const next = node.nextSibling;
        nodesToRemove.push(node);
        node = next;
      }

      nodesToRemove.forEach(item => item.remove());

      const fragment = document.createDocumentFragment();
      materialIntro.forEach((text, index) => {
        const p = document.createElement('p');
        p.textContent = text;
        if (index === 0) {
          // mantém o início limpo e direto
        }
        fragment.appendChild(p);
      });

      firstHeading.insertAdjacentElement('afterend', document.createElement('span'));
      const marker = firstHeading.nextElementSibling;
      marker.replaceWith(fragment);
    };
  }

  // Botão de retorno compacto em todas as etapas.
  const backButton = document.getElementById('backBtn');
  if (backButton) {
    backButton.textContent = 'VOLTAR';
    backButton.setAttribute('aria-label', 'Voltar');
  }

  const style = document.createElement('style');
  style.textContent = `
    #backBtn.back-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: auto;
      min-width: 72px;
      padding: 7px 12px;
      border: 1px solid var(--line);
      border-radius: 4px;
      background: transparent;
      color: var(--text-soft);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: .10em;
      text-transform: uppercase;
      text-decoration: none;
      cursor: pointer;
    }

    #backBtn.back-link:hover,
    #backBtn.back-link:focus-visible {
      color: var(--green);
      border-color: var(--green);
      outline: none;
    }
  `;
  document.head.appendChild(style);
})();
