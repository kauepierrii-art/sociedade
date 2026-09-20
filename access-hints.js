// Histórico clicável de dicas da tela de acesso.
(function () {
  const hints = [
    'A correspondência e os documentos que a acompanham pertencem a um mesmo registro. Considere seus elementos em conjunto.',
    'O Registro de Atribuição apresenta uma informação destinada especificamente ao seu portador.',
    'O Fragmentum III contém orientações para a interpretação dos documentos. Sua compreensão pode exigir mais do que uma leitura literal.',
    'A descrição presente no Registro de Atribuição ajuda a compreender o elemento designado. O Fragmentum III indica como essa informação deve ser interpretada.',
    'A referência de acesso depende da sua identificação e da relação entre o elemento atribuído e as instruções preservadas no Fragmentum III.'
  ];
  const storageKey = 'access:v1:errors';

  function getErrors() {
    const value = Number(localStorage.getItem(storageKey));
    return Number.isInteger(value) && value > 0 ? Math.min(value, hints.length) : 0;
  }

  function setErrors(value) {
    localStorage.setItem(storageKey, String(Math.min(value, hints.length)));
  }

  function clearErrors() {
    localStorage.removeItem(storageKey);
  }

  function ensureBox() {
    const loginCard = document.querySelector('#loginView .login-card');
    if (!loginCard) return null;

    let wrapper = document.querySelector('#accessHintsArchive');
    if (wrapper) return wrapper;

    wrapper = document.createElement('div');
    wrapper.id = 'accessHintsArchive';
    wrapper.className = 'hints-archive access-hints-archive';
    wrapper.hidden = true;
    wrapper.innerHTML = `
      <button type="button" class="hints-archive-toggle" aria-expanded="false">
        <span>APONTAMENTO ADICIONAL (<span class="hints-count">0</span>)</span>
        <span class="hints-chevron" aria-hidden="true">＋</span>
      </button>
      <div class="hints-archive-content" hidden></div>`;

    const loginMessage = document.querySelector('#loginMessage');
    if (loginMessage) loginMessage.insertAdjacentElement('afterend', wrapper);
    else loginCard.appendChild(wrapper);

    const toggle = wrapper.querySelector('.hints-archive-toggle');
    const content = wrapper.querySelector('.hints-archive-content');
    const chevron = wrapper.querySelector('.hints-chevron');

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      content.hidden = open;
      chevron.textContent = open ? '＋' : '−';
    });

    return wrapper;
  }

  function renderArchive() {
    const wrapper = ensureBox();
    if (!wrapper) return;

    const errors = getErrors();
    if (!errors) {
      wrapper.hidden = true;
      return;
    }

    wrapper.hidden = false;
    wrapper.querySelector('.hints-count').textContent = String(errors);
    const content = wrapper.querySelector('.hints-archive-content');
    content.innerHTML = hints.slice(0, errors).map((hint, index) => {
      const roman = ['I', 'II', 'III', 'IV', 'V'][index];
      return `<div class="hints-archive-item"><span class="hint-label">ANOTAÇÃO ${roman}</span><p>${hint}</p></div>`;
    }).join('');
  }

  document.addEventListener('delectus:access-result', function (event) {
    if (event.detail && event.detail.accepted) {
      clearErrors();
      setTimeout(renderArchive, 0);
      return;
    }
    if (event.detail && event.detail.invalid) {
      setErrors(getErrors() + 1);
      setTimeout(renderArchive, 0);
    }
  });

  const style = document.createElement('style');
  style.textContent = `
    /* O painel de ajuda acompanha a largura e a paleta do formulário de acesso. */
    #loginView .access-hints-archive {
      width: min(100%, 760px);
      max-width: 760px;
      flex: 0 0 auto;
      margin: 16px auto 0;
      border: 1px solid rgba(125, 84, 54, .72);
      border-radius: 5px;
      overflow: hidden;
      background: linear-gradient(180deg, rgba(22, 15, 12, .82), rgba(14, 10, 8, .90));
      color: #dfd0bd;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.018);
    }

    #loginView .access-hints-archive .hints-archive-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 24px;
      border: 0;
      background: transparent;
      color: #d18b23;
      font-family: "IBM Plex Mono", monospace;
      font-size: 11px;
      letter-spacing: .08em;
      cursor: pointer;
      text-align: left;
    }

    #loginView .access-hints-archive .hints-archive-toggle:hover,
    #loginView .access-hints-archive .hints-archive-toggle:focus-visible {
      background: rgba(166, 106, 59, .08);
    }

    #loginView .access-hints-archive .hints-archive-content {
      padding: 0 24px 12px;
      border-top: 1px solid rgba(125, 84, 54, .52);
    }

    #loginView .access-hints-archive .hints-archive-item {
      padding: 12px 0 2px;
    }

    #loginView .access-hints-archive .hints-archive-item + .hints-archive-item {
      border-top: 1px solid rgba(125, 84, 54, .32);
      margin-top: 8px;
    }

    #loginView .access-hints-archive .hint-label {
      color: #d18b23;
    }

    #loginView .access-hints-archive .hints-archive-item p {
      margin: 5px 0 0;
      color: #dfd0bd;
      font-size: 12px;
      line-height: 1.65;
    }

    @media (max-width: 430px) {
      #loginView .access-hints-archive .hints-archive-toggle {
        padding-left: 18px;
        padding-right: 18px;
      }
      #loginView .access-hints-archive .hints-archive-content {
        padding-left: 18px;
        padding-right: 18px;
      }
    }
  `;
  document.head.appendChild(style);

  renderArchive();
})();

