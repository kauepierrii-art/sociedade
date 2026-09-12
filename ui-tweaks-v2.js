// Ajustes de cópia e navegação da Etapa 02.
(function () {
  const objectiveContext = 'Nem toda divergência é relevante.\n\nAlgumas, no entanto, justificam uma segunda análise.\n\nOs documentos disponibilizados pertencem ao mesmo conjunto e foram preservados por razões que serão esclarecidas posteriormente.\n\nAnalise o material e identifique a inconsistência.';

  // A abertura da Etapa 02 fica com a instrução objetiva.
  // O texto contextual "Antes de prosseguir..." permanece na parte inferior,
  // imediatamente antes de "Leia, compare e identifique...", como já é renderizado pela etapa.
  if (Array.isArray(stages) && stages[1]) {
    stages[1].context = objectiveContext;
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