// Ajustes de cópia e navegação da Etapa 02.
(function () {
  const introContext = 'Um espelho negro, associado ao estudioso inglês John Dee, encontra-se atualmente sob os cuidados de uma instituição museológica.\n\nDurante uma revisão de sua documentação, foram identificadas informações que justificaram a reabertura de uma antiga investigação sobre o objeto.\n\nVocê recebeu acesso aos registros reunidos nessa análise. Sua tarefa é examiná-los, consultar as referências disponíveis e identificar a inconsistência que motivou a revisão.\n\nO que passou despercebido nos registros anteriores?';

  // Topo da Etapa 02: texto contextual.
  if (Array.isArray(stages) && stages[1]) {
    stages[1].context = introContext;
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

    .stage-two-image { margin: 14px 0 18px; }
    .stage-two-image img { display: block; width: 100%; max-width: 560px; height: auto; margin: 0 auto; border: 1px solid var(--line); border-radius: 4px; background: #06100d; }
    @media (max-width: 520px) {
      .stage-two-image { margin: 12px 0 16px; }
    }
  `;
  document.head.appendChild(style);
})();
