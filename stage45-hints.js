// Apontamentos progressivos das etapas 04 e 05.
(function () {
  const configs = {
    stage4: {
      root: '#stage4Tuner',
      placement: 'before',
      hints: [
        'Os materiais indicam um ponto específico no centro da cidade. O áudio da fita magnética revela coordenadas que são mais importantes do que parecem.',
        'O local procurado não é apenas um endereço. Trata-se de um monumento que representa um ponto de referência oficial.',
        'Uma das imagens encontradas deve ser usada com a parte superior do monumento.',
        'A ordem da máscara do monumento tem conexão com números e estados presentes em outro documento.',
        'A configuração necessária para reproduzir a fita depende da combinação de <strong>três elementos</strong>: o Marco Zero, a máscara e um dos registros técnicos. Nenhum deles, isoladamente, fornece a resposta completa.'
      ]
    },
    stage5: {
      root: '#stage5Timeline',
      hints: [
        'A ordem correta dos registros depende das datas presentes nos materiais anteriores.',
        'Nem todas as datas estão destacadas. Algumas aparecem em cabeçalhos, códigos, fotografias ou documentos associados.',
        'Depois de estabelecer a cronologia, observe quais registros descrevem acontecimentos semelhantes.',
        'Há dois registros separados por décadas que apontam para o mesmo ambiente.',
        'Procure um registro que <strong>descreve</strong> uma cena e outro que <strong>a mostra</strong>.'
      ]
    }
  };

  function refKey() { return currentRefKey || 'unknown'; }
  function storageKey(id, part) { return 'stage45-hints:' + id + ':' + part + ':' + refKey(); }
  function unlocked(id) { return Math.max(0, Math.min(configs[id].hints.length, Number(localStorage.getItem(storageKey(id, 'unlocked'))) || 0)); }
  function setUnlocked(id, value) { localStorage.setItem(storageKey(id, 'unlocked'), String(value)); }
  function ensure(id) {
    const root = document.querySelector(configs[id].root);
    if (!root) return null;
    let box = document.getElementById('stage45Hints-' + id);
    if (box) return box;
    box = document.createElement('section');
    box.id = 'stage45Hints-' + id;
    box.className = 'stage45-hints';
    box.innerHTML = '<div class="stage45-hints-box"><button class="stage45-hints-toggle" type="button" aria-expanded="false"><span>APONTAMENTO ADICIONAL <span class="stage45-hints-count"></span></span><span class="stage45-hints-chev">＋</span></button><div class="stage45-hints-history" hidden></div></div><button class="stage45-hints-request" type="button"></button>';
    if (configs[id].placement === 'before') {
      root.insertAdjacentElement('beforebegin', box);
    } else {
      const anchor = root.nextElementSibling && root.nextElementSibling.classList.contains('stage4-replay-video') ? root.nextElementSibling : root;
      anchor.insertAdjacentElement('afterend', box);
    }
    const toggle = box.querySelector('.stage45-hints-toggle');
    toggle.addEventListener('click', () => {
      const history = box.querySelector('.stage45-hints-history');
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.querySelector('.stage45-hints-chev').textContent = open ? '＋' : '−';
      history.hidden = open;
    });
    box.querySelector('.stage45-hints-request').addEventListener('click', () => advance(id));
    return box;
  }
  function render(id, openLatest) {
    const box = ensure(id);
    if (!box) return;
    const count = unlocked(id);
    box.hidden = false;
    box.querySelector('.stage45-hints-box').hidden = !count;
    box.querySelector('.stage45-hints-count').textContent = '(' + count + ')';
    const history = box.querySelector('.stage45-hints-history');
    history.innerHTML = configs[id].hints.slice(0, count).map((hint, index) => '<div class="stage45-hints-item"><span>ANOTAÇÃO ' + ['I','II','III','IV','V'][index] + '</span><p>' + hint + '</p></div>').join('');
    const toggle = box.querySelector('.stage45-hints-toggle');
    if (openLatest) {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.querySelector('.stage45-hints-chev').textContent = '−';
      history.hidden = false;
    }
    const request = box.querySelector('.stage45-hints-request');
    if (count >= configs[id].hints.length) { request.hidden = true; return; }
    request.hidden = false;
    request.disabled = false;
    request.textContent = count ? 'SOLICITAR NOVO APONTAMENTO' : 'SOLICITAR APONTAMENTO';
  }
  function advance(id) {
    const current = unlocked(id);
    if (current >= configs[id].hints.length) return;
    const next = current + 1;
    setUnlocked(id, next);
    localStorage.removeItem(storageKey(id, 'nextAt'));
    render(id, true);
  }
  window.addEventListener('stage45-hints-mount', event => render(event.detail, false));

  const style = document.createElement('style');
  style.textContent = '.stage45-hints{margin:14px 0}.stage45-hints-box{overflow:hidden;border:1px solid #6d5630;border-radius:4px;background:rgba(83,60,24,.12)}.stage45-hints-toggle{display:flex;align-items:center;justify-content:space-between;width:100%;padding:11px 12px;border:0;background:transparent;color:var(--amber,#d5a64a);font:700 11px "IBM Plex Mono",monospace;letter-spacing:.08em;text-align:left;cursor:pointer}.stage45-hints-chev{font-size:15px}.stage45-hints-history{padding:2px 12px 10px;border-top:1px solid rgba(109,86,48,.55)}.stage45-hints-item{padding:10px 0 8px;border-bottom:1px solid rgba(109,86,48,.28)}.stage45-hints-item:last-child{border-bottom:0}.stage45-hints-item span{display:block;margin-bottom:5px;color:var(--amber,#d5a64a);font:700 10px "IBM Plex Mono",monospace;letter-spacing:.1em}.stage45-hints-item p{margin:0;color:var(--text,#d8e4df);font-size:12.5px;line-height:1.6}.stage45-hints-request{width:100%;margin-top:8px;padding:10px 12px;border:1px solid #6d5630;border-radius:4px;background:transparent;color:var(--amber,#d5a64a);font:700 10.5px "IBM Plex Mono",monospace;letter-spacing:.06em;cursor:pointer}.stage45-hints-request:disabled{opacity:.55;cursor:default}';
  document.head.appendChild(style);
})();
