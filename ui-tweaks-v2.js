// Ajustes de cópia e navegação da Etapa 02.
(function () {
  const introContext = 'Antes de prosseguir, precisamos avaliar como você lida com informações conflitantes.\n\nOs registros apresentados não foram reunidos para contar uma história completa. Eles foram preservados porque, em algum momento, alguém considerou que certas diferenças mereciam uma segunda análise.\n\nSeu objetivo não é provar uma teoria, nem confirmar a autenticidade de qualquer objeto.\n\nÉ mais simples que isso.';

  const objectiveLines = [
    'Nem toda divergência é relevante.',
    'Algumas, no entanto, justificam uma segunda análise.',
    'Os documentos disponibilizados pertencem ao mesmo conjunto e foram preservados por razões que serão esclarecidas posteriormente.'
  ];

  // Topo da Etapa 02: texto contextual.
  if (Array.isArray(stages) && stages[1]) {
    stages[1].context = introContext;
  }

  // Parte inferior da Etapa 02: texto objetivo imediatamente antes da instrução final.
  if (typeof renderStageTwo === 'function') {
    const originalRenderStageTwoCopy = renderStageTwo;
    renderStageTwo = function (actions) {
      originalRenderStageTwoCopy(actions);

      const panel = actions.querySelector('.answer-panel');
      if (!panel) return;

      const finalInstruction = Array.from(panel.querySelectorAll('p')).find(p =>
        p.textContent.includes('Leia, compare e identifique qual elemento apresenta uma inconsistência entre os registros.')
      );
      if (!finalInstruction) return;

      // Remove o bloco contextual antigo que vinha antes da instrução final.
      let node = panel.firstElementChild;
      while (node && node !== finalInstruction) {
        const next = node.nextElementSibling;
        node.remove();
        node = next;
      }

      // Insere o bloco objetivo logo antes da instrução final.
      objectiveLines.forEach(text => {
        const p = document.createElement('p');
        p.textContent = text;
        panel.insertBefore(p, finalInstruction);
      });
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
