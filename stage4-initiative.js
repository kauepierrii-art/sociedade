// ETAPA 04 — INICIATIVA
(function () {
  if (!Array.isArray(stages)) return;

  const initiativeIndex = stages.findIndex(stage => stage && stage.name === 'Iniciativa');
  if (initiativeIndex < 0) return;

  const initiativeStage = stages[initiativeIndex];
  initiativeStage.subtitle = 'análise de material incompleto';
  initiativeStage.context = [
    'Em 1987, um conjunto de materiais sem catalogação foi encaminhado a um de nossos colaboradores para análise.',
    'O conjunto foi localizado durante o inventário de um espólio e encaminhado para análise antes da destinação definitiva dos bens. À primeira vista, os itens pareciam não guardar qualquer relação entre si.',
    'Entre os materiais estavam documentos antigos, mapas, fotografias, uma gravação parcial e um aparelho sonoro sem identificação de fabricante ou modelo.',
    'O equipamento possui quatro controles independentes.',
    'Durante a inspeção, foi identificada em seu interior uma pequena fita magnética em formato incomum.',
    'Não foi possível reproduzi-la.',
    'Junto ao aparelho havia apenas uma anotação:',
    '“Quatro canais. Ajuste independente.”',
    'Nosso colaborador iniciou a análise do conjunto, mas o trabalho permaneceu incompleto.',
    'Alguns dos materiais possuem marcas de uso, anotações e referências cuja função nunca foi determinada com segurança.',
    'Descubra como os itens se relacionam e como acessar o conteúdo da fita.'
  ].join('\n\n');
  initiativeStage.mission = '';

  const mapGallery = [
    { src: 'assets/stage4/mapa-a.webp', label: 'MAPA A' },
    { src: 'assets/stage4/mapa-b.webp', label: 'MAPA B' },
    { src: 'assets/stage4/mapa-c.webp', label: 'MAPA C' }
  ];

  const photoGallery = [
    { src: 'assets/stage4/fotografia-a.webp', label: 'FOTOGRAFIA A' },
    { src: 'assets/stage4/fotografia-b.webp', label: 'FOTOGRAFIA B' },
    { src: 'assets/stage4/fotografia-c.webp', label: 'FOTOGRAFIA C' }
  ];

  const materials = [
    { label: 'REGISTRO 01 — MAPAS', description: 'Material cartográfico pertencente ao conjunto original.', gallery: mapGallery },
    { label: 'REGISTRO 02 — GRAVAÇÃO', description: 'Registro sonoro preservado junto aos demais materiais.' },
    { label: 'REGISTRO 03 — FOTOGRAFIAS', description: 'Conjunto de fotografias sem identificação conclusiva.', gallery: photoGallery },
    { label: 'REGISTRO 04 — IMAGENS', description: 'Imagens encontradas entre os materiais analisados.' },
    { label: 'REGISTRO 05 — FOLHA TÉCNICA', description: 'Documento técnico contendo referências e valores.' },
    { label: 'REGISTRO 06 — EQUIPAMENTO SONORO', description: 'Aparelho de quatro canais contendo uma fita magnética de formato incomum.' }
  ];

  function galleryMarkup(items) {
    return `
      <div class="initiative-gallery">
        ${items.map(item => `
          <button class="initiative-thumb" type="button" data-src="${item.src}" data-label="${item.label}" aria-label="Ampliar ${item.label}">
            <img src="${item.src}" alt="" loading="lazy" />
            <span>${item.label}</span>
          </button>`).join('')}
      </div>`;
  }

  function materialMarkup(material) {
    const hasGallery = Array.isArray(material.gallery) && material.gallery.length;
    return `
      <div class="initiative-material-item">
        <button class="initiative-material-toggle" type="button" aria-expanded="false">
          <span>${material.label}</span><span class="chev" aria-hidden="true">＋</span>
        </button>
        <div class="initiative-material-content" hidden>
          <p>${material.description}</p>
          ${hasGallery ? galleryMarkup(material.gallery) : '<p class="initiative-material-status">ARQUIVO NÃO VINCULADO</p>'}
        </div>
      </div>`;
  }

  function ensureLightbox() {
    let lightbox = document.getElementById('initiativeLightbox');
    if (lightbox) return lightbox;

    lightbox = document.createElement('div');
    lightbox.id = 'initiativeLightbox';
    lightbox.className = 'initiative-lightbox';
    lightbox.hidden = true;
    lightbox.innerHTML = `
      <div class="initiative-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Visualização em tamanho original">
        <button class="initiative-lightbox-close" type="button" aria-label="Fechar">×</button>
        <img class="initiative-lightbox-image" src="" alt="" />
        <p class="initiative-lightbox-label"></p>
      </div>`;
    document.body.appendChild(lightbox);

    const close = () => {
      lightbox.hidden = true;
      document.body.classList.remove('initiative-lightbox-open');
    };

    lightbox.querySelector('.initiative-lightbox-close').addEventListener('click', close);
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !lightbox.hidden) close();
    });

    return lightbox;
  }

  function openLightbox(src, label) {
    const lightbox = ensureLightbox();
    const image = lightbox.querySelector('.initiative-lightbox-image');
    image.src = src;
    image.alt = label;
    lightbox.querySelector('.initiative-lightbox-label').textContent = `${label} · TAMANHO ORIGINAL`;
    lightbox.hidden = false;
    lightbox.scrollTop = 0;
    lightbox.scrollLeft = 0;
    document.body.classList.add('initiative-lightbox-open');
    lightbox.querySelector('.initiative-lightbox-close').focus();
  }

  function renderInitiativeContent() {
    const context = document.getElementById('stageContext');
    const mission = document.getElementById('stageMission');
    const actions = document.getElementById('stageActions');
    if (!context || !mission || !actions) return;

    context.innerHTML = initiativeStage.context
      .split('\n\n')
      .map((paragraph, index) => {
        if (paragraph === '“Quatro canais. Ajuste independente.”') {
          return `<blockquote class="initiative-note"><strong>${paragraph}</strong></blockquote>`;
        }
        const cls = index === 10 ? ' initiative-objective' : '';
        return `<p class="initiative-copy${cls}">${paragraph}</p>`;
      })
      .join('');

    mission.innerHTML = '';
    actions.innerHTML = `
      <section class="initiative-materials" aria-labelledby="initiativeMaterialsTitle">
        <div class="initiative-materials-head">
          <h3 id="initiativeMaterialsTitle">MATERIAL DISPONÍVEL</h3>
          <span>06 REGISTROS</span>
        </div>
        <div class="initiative-material-list">
          ${materials.map(materialMarkup).join('')}
        </div>
      </section>`;

    actions.querySelectorAll('.initiative-material-toggle').forEach(button => {
      button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const open = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!open));
        button.querySelector('.chev').textContent = open ? '＋' : '−';
        content.hidden = open;
      });
    });

    actions.querySelectorAll('.initiative-thumb').forEach(button => {
      button.addEventListener('click', () => openLightbox(button.dataset.src, button.dataset.label));
    });
  }

  const originalOpenStageInitiative = openStage;
  openStage = function (index) {
    originalOpenStageInitiative(index);
    if (stages[index] && stages[index].name === 'Iniciativa') renderInitiativeContent();
  };

  const style = document.createElement('style');
  style.textContent = `
    .initiative-copy { margin: 0 0 16px; color: #a4c3ba; font-size: 14px; line-height: 1.7; }
    .initiative-objective { color: var(--text); font-weight: 700; margin-bottom: 22px; }
    .initiative-note { margin: 4px 0 20px; padding: 12px 14px; border-left: 2px solid var(--amber, #d5a64a); background: rgba(83, 60, 24, .10); color: var(--text); font-size: 13px; line-height: 1.65; }
    .initiative-materials { margin-top: 24px; }
    .initiative-materials-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; color: var(--text-soft, #9aa9a3); }
    .initiative-materials-head h3 { margin: 0; color: var(--text); font-size: 11px; letter-spacing: .10em; }
    .initiative-materials-head span { font-size: 10px; letter-spacing: .08em; }
    .initiative-material-list { border-top: 1px solid var(--line); }
    .initiative-material-item { border-bottom: 1px solid var(--line); }
    .initiative-material-toggle { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 14px 2px; border: 0; background: transparent; color: var(--text); font: inherit; font-size: 12px; font-weight: 600; letter-spacing: .04em; text-align: left; cursor: pointer; }
    .initiative-material-toggle .chev { color: var(--green); font-size: 16px; font-weight: 400; }
    .initiative-material-content { padding: 0 2px 14px; color: var(--text-soft, #9aa9a3); font-size: 12px; line-height: 1.65; }
    .initiative-material-content > p { margin: 0 0 10px; }
    .initiative-material-status { margin-bottom: 0 !important; color: var(--amber, #d5a64a); font-size: 10px; font-weight: 700; letter-spacing: .08em; }

    .initiative-gallery { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
    .initiative-thumb { min-width: 0; padding: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 3px; background: #07110e; color: var(--text-soft, #9aa9a3); font: inherit; cursor: zoom-in; text-align: left; transition: border-color .15s ease, transform .15s ease; }
    .initiative-thumb:hover, .initiative-thumb:focus-visible { border-color: var(--green); outline: none; }
    .initiative-thumb:hover { transform: translateY(-1px); }
    .initiative-thumb img { display: block; width: 100%; height: 104px; object-fit: cover; background: #050907; }
    .initiative-thumb span { display: block; padding: 7px 8px; font-size: 9px; font-weight: 700; letter-spacing: .08em; }

    body.initiative-lightbox-open { overflow: hidden; }
    .initiative-lightbox[hidden] { display: none; }
    .initiative-lightbox { position: fixed; inset: 0; z-index: 2000; overflow: auto; padding: 28px; background: rgba(0, 0, 0, .92); }
    .initiative-lightbox-dialog { position: relative; width: max-content; min-width: calc(100vw - 56px); min-height: calc(100vh - 56px); margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .initiative-lightbox-image { display: block; width: auto; height: auto; max-width: none; max-height: none; flex: 0 0 auto; border: 1px solid #345247; background: #050806; box-shadow: 0 14px 50px rgba(0,0,0,.55); }
    .initiative-lightbox-label { margin: 10px 0 0; color: #a4c3ba; font-size: 10px; font-weight: 700; letter-spacing: .10em; align-self: center; }
    .initiative-lightbox-close { position: fixed; top: 14px; right: 18px; z-index: 2002; width: 38px; height: 38px; border: 1px solid #547266; border-radius: 50%; background: rgba(7,17,14,.96); color: var(--text); font-size: 24px; line-height: 1; cursor: pointer; }
    .initiative-lightbox-close:hover, .initiative-lightbox-close:focus-visible { border-color: var(--green); color: var(--green); outline: none; }

    @media (max-width: 620px) {
      .initiative-gallery { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .initiative-thumb img { height: 112px; }
      .initiative-lightbox { padding: 14px; }
      .initiative-lightbox-dialog { min-width: calc(100vw - 28px); min-height: calc(100vh - 28px); }
      .initiative-lightbox-close { top: 8px; right: 8px; }
    }
  `;
  document.head.appendChild(style);
})();