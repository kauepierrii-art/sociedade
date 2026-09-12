// Dicas progressivas da ETAPA 03 — OBSERVAÇÃO.
(function () {
  const hints = [
    'A resposta não está necessariamente contida apenas no vídeo.',
    'Há uma mensagem no vídeo que indica onde procurar o material complementar.',
    'Parte do caminho está fora da gravação. Verifique também a descrição do vídeo.',
    'O material complementar pode ser acessado por um endereço indicado na descrição.',
    'O site indicado na descrição contém outros registros da mesma sala.'
  ];

  const acceptedAnswers = [
    'espelho',
    'espelho negro',
    'espelho de obsidiana',
    'espelho obsidiana',
    'black mirror'
  ];

  function key() {
    return `observation:v1:errors:${currentRefKey || 'unknown'}`;
  }

  function getErrors() {
    const value = Number(localStorage.getItem(key()));
    return Number.isInteger(value) && value > 0 ? Math.min(value, hints.length) : 0;
  }

  function setErrors(value) {
    localStorage.setItem(key(), String(Math.min(value, hints.length)));
  }

  function clearErrors() {
    localStorage.removeItem(key());
  }

  function ensureHintBox() {
    const form = document.querySelector('#observationForm');
    if (!form) return null;

    let box = document.querySelector('#observationHint');
    if (!box) {
      box = document.createElement('div');
      box.id = 'observationHint';
      box.className = 'identification-hint observation-hint';
      box.hidden = true;
      form.appendChild(box);
    }
    return box;
  }

  function renderHint() {
    const box = ensureHintBox();
    if (!box) return;

    const errors = getErrors();
    if (!errors) {
      box.hidden = true;
      box.innerHTML = '';
      return;
    }

    const index = Math.min(errors - 1, hints.length - 1);
    const roman = ['I', 'II', 'III', 'IV', 'V'][index];
    box.hidden = false;
    box.innerHTML = `<span class="hint-label">DICA ${roman} DESBLOQUEADA</span><p>${hints[index]}</p>`;
  }

  document.addEventListener('submit', function (event) {
    if (!event.target || event.target.id !== 'observationForm') return;

    const input = document.querySelector('#observationAnswer');
    if (!input) return;

    const answer = normalizeAnswer(input.value);
    if (acceptedAnswers.includes(answer)) {
      clearErrors();
      return;
    }

    setErrors(getErrors() + 1);
    setTimeout(renderHint, 0);
  }, true);

  const observer = new MutationObserver(function () {
    if (document.querySelector('#observationForm')) renderHint();
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
