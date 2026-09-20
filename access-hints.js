// Histórico clicável de dicas da tela de acesso.
(function () {
  const hints = [
    'A referência não está escrita de forma direta na correspondência. Considere a indicação ao final da carta.',
    'A palavra associada à sua referência deve ser convertida para o idioma indicado no final da correspondência.'
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
      const roman = ['I', 'II'][index];
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
    .access-hints-archive {
      margin: 12px 24px 0;
      border: 1px solid var(--line);
      border-radius: 5px;
      overflow: hidden;
      background: #08110e;
    }

    .hints-archive-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      border: 0;
      background: transparent;
      color: var(--amber, #d2a861);
      font: inherit;
      font-size: 11px;
      letter-spacing: .08em;
      cursor: pointer;
      text-align: left;
    }

    .hints-archive-content {
      padding: 0 14px 12px;
      border-top: 1px solid var(--line);
    }

    .hints-archive-item {
      padding: 12px 0 2px;
    }

    .hints-archive-item + .hints-archive-item {
      border-top: 1px solid rgba(255,255,255,.07);
      margin-top: 8px;
    }

    .hints-archive-item p {
      margin: 5px 0 0;
      color: var(--text, #d8e2de);
      font-size: 12px;
      line-height: 1.65;
    }

    @media (max-width: 430px) {
      .access-hints-archive {
        margin-left: 16px;
        margin-right: 16px;
      }
    }
  `;
  document.head.appendChild(style);

  renderArchive();
})();

