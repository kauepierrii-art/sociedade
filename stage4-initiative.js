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

  const MAP_1890 = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Planta_da_Capital_do_Estado_de_S._Paulo_e_seus_arrabaldes_(1890).jpg?width=2400';
  const MAP_1890_THUMB = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Planta_da_Capital_do_Estado_de_S._Paulo_e_seus_arrabaldes_(1890).jpg?width=700';
  const MAP_1881 = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Nova_planta_da_cidade_de_S%C3%A3o_Paulo_e_sub%C3%BArbios-_publicada_por_Jules_Martin%2C_da_Cole%C3%A7%C3%A3o_Brasiliana_Iconogr%C3%A1fica.jpg?width=2400';
  const MAP_1881_THUMB = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Nova_planta_da_cidade_de_S%C3%A3o_Paulo_e_sub%C3%BArbios-_publicada_por_Jules_Martin%2C_da_Cole%C3%A7%C3%A3o_Brasiliana_Iconogr%C3%A1fica.jpg?width=700';

  const compassSvg = svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1200" viewBox="0 0 1000 1200">
      <rect width="1000" height="1200" fill="#f4f1e8"/>
      <circle cx="500" cy="560" r="430" fill="none" stroke="#34383b" stroke-width="4"/>
      <circle cx="500" cy="560" r="365" fill="#b7bac0" stroke="#34383b" stroke-width="4"/>
      <circle cx="500" cy="560" r="285" fill="#6d727a" stroke="#34383b" stroke-width="4"/>
      <g fill="#f4f1e8" stroke="#34383b" stroke-width="4" stroke-linejoin="round">
        <path d="M500 560 L278 126 L430 460 Z"/><path d="M500 560 L606 166 L565 475 Z"/>
        <path d="M500 560 L906 374 L602 520 Z"/><path d="M500 560 L846 692 L598 612 Z"/>
        <path d="M500 560 L659 1010 L550 654 Z"/><path d="M500 560 L339 955 L452 647 Z"/>
        <path d="M500 560 L70 760 L398 606 Z"/><path d="M500 560 L112 412 L397 515 Z"/>
      </g>
      <circle cx="500" cy="560" r="112" fill="#6d727a" stroke="#34383b" stroke-width="4"/>
    </svg>`);

  const maskSvg = svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1320" viewBox="0 0 1200 1320">
      <rect width="1200" height="1320" fill="#07110e"/>
      <g fill="none" stroke="#f1f3ef" stroke-width="8" stroke-linejoin="round">
        <path d="M290 120 H910 L1150 600 920 1180 H280 L50 600 Z"/>
        <path d="M320 160 H880 L1100 600 885 1130 H315 L100 600 Z"/>
        <path d="M330 410 L520 790 M870 410 L680 790 M600 210 V790 M600 940 V1130"/>
        <rect x="90" y="300" width="170" height="300" transform="rotate(26 175 450)"/>
        <rect x="430" y="130" width="340" height="115"/>
        <rect x="940" y="300" width="170" height="300" transform="rotate(-26 1025 450)"/>
        <rect x="430" y="1100" width="340" height="115"/>
        <rect x="505" y="770" width="190" height="210" rx="22"/>
        <circle cx="600" cy="870" r="67"/>
      </g>
      <g fill="#f1f3ef" font-family="monospace" font-size="48" font-weight="700" text-anchor="middle">
        <text x="165" y="465" transform="rotate(26 165 465)">1</text><text x="600" y="205">2</text>
        <text x="1035" y="465" transform="rotate(-26 1035 465)">3</text><text x="600" y="1185">4</text>
      </g>
      <g fill="#f1f3ef" font-family="monospace" text-anchor="middle"><text x="600" y="820" font-size="20">Placa</text><text x="600" y="845" font-size="20">Touring Club</text><text x="600" y="960" font-size="20">193X</text></g>
    </svg>`);

  const paulImage = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/St_Paul_(BM_1949,1011.9.2).jpg?width=1600';
  const paulThumb = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/St_Paul_(BM_1949,1011.9.2).jpg?width=500';

  const mapGallery = [
    { full: MAP_1890, thumb: MAP_1890_THUMB, label: 'MAPA A' },
    { full: MAP_1881, thumb: MAP_1881_THUMB, label: 'MAPA B' },
    { full: 'assets/stage4/mapa-c.webp?v=20260913h', thumb: 'assets/stage4/mapa-c.webp?v=20260913h', label: 'MAPA C' }
  ];

  const photoGallery = [
    { full: 'https://pracadase.wordpress.com/wp-content/uploads/2010/11/pracadaseiniciodosanoscinquentaanos50.jpg', thumb: 'https://pracadase.wordpress.com/wp-content/uploads/2010/11/pracadaseiniciodosanoscinquentaanos50.jpg?w=700', label: 'FOTOGRAFIA A' },
    { full: 'https://pracadase.wordpress.com/wp-content/uploads/2010/11/pracadaseconstrucaocatedralanos50.jpg', thumb: 'https://pracadase.wordpress.com/wp-content/uploads/2010/11/pracadaseconstrucaocatedralanos50.jpg?w=700', label: 'FOTOGRAFIA B' },
    { full: 'https://pracadase.wordpress.com/wp-content/uploads/2010/11/pracadaseanoscinquentacatedralemconstrucaoacervojosecarlosneveslopes.jpg', thumb: 'https://pracadase.wordpress.com/wp-content/uploads/2010/11/pracadaseanoscinquentacatedralemconstrucaoacervojosecarlosneveslopes.jpg?w=900', label: 'FOTOGRAFIA C' }
  ];

  const imageGallery = [
    { full: compassSvg, thumb: compassSvg, label: 'IMAGEM A', width: 1000, height: 1200 },
    { full: paulImage, thumb: paulThumb, label: 'IMAGEM B' },
    { full: maskSvg, thumb: maskSvg, label: 'IMAGEM C', width: 1200, height: 1320 }
  ];

  const galleries = { maps: mapGallery, photos: photoGallery, images: imageGallery };
  const materials = [
    { label: 'REGISTRO 01 — MAPAS', description: 'Material cartográfico pertencente ao conjunto original.', gallery: 'maps' },
    { label: 'REGISTRO 02 — GRAVAÇÃO', description: 'Registro sonoro preservado junto aos demais materiais.' },
    { label: 'REGISTRO 03 — FOTOGRAFIAS', description: 'Conjunto de fotografias sem identificação conclusiva.', gallery: 'photos' },
    { label: 'REGISTRO 04 — IMAGENS', description: 'Imagens encontradas entre os materiais analisados.', gallery: 'images' },
    { label: 'REGISTRO 05 — FOLHA TÉCNICA', description: 'Documento técnico contendo referências e valores.' },
    { label: 'REGISTRO 06 — EQUIPAMENTO SONORO', description: 'Aparelho de quatro canais contendo uma fita magnética de formato incomum.' }
  ];

  function svgData(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace(/\s{2,}/g, ' ').trim());
  }

  function galleryMarkup(key) {
    const items = galleries[key] || [];
    return `<div class="initiative-gallery">${items.map((item, index) => `
      <button class="initiative-thumb" type="button" data-gallery="${key}" data-index="${index}" aria-label="Abrir ${item.label}">
        <span class="initiative-thumb-media"><img src="${item.thumb}" alt="" loading="lazy" referrerpolicy="no-referrer" /></span>
        <span class="initiative-thumb-foot"><strong>${item.label}</strong><em>ABRIR</em></span>
      </button>`).join('')}</div>`;
  }

  function materialMarkup(material) {
    return `<div class="initiative-material-item">
      <button class="initiative-material-toggle" type="button" aria-expanded="false"><span>${material.label}</span><span class="chev" aria-hidden="true">＋</span></button>
      <div class="initiative-material-content" hidden>
        <p>${material.description}</p>
        ${material.gallery ? galleryMarkup(material.gallery) : '<p class="initiative-material-status">ARQUIVO NÃO VINCULADO</p>'}
      </div>
    </div>`;
  }

  let viewerState = { gallery: 'maps', index: 0, scale: 1, fitScale: 1, naturalWidth: 0, naturalHeight: 0 };

  function ensureViewer() {
    let viewer = document.getElementById('initiativeViewer');
    if (viewer) return viewer;
    viewer = document.createElement('div');
    viewer.id = 'initiativeViewer';
    viewer.className = 'initiative-viewer';
    viewer.hidden = true;
    viewer.innerHTML = `
      <section class="initiative-viewer-shell" role="dialog" aria-modal="true" aria-label="Visualizador de documento">
        <header class="initiative-viewer-bar">
          <div><strong class="initiative-viewer-title"></strong><small class="initiative-viewer-count"></small></div>
          <div class="initiative-viewer-tools">
            <button type="button" data-view-action="minus" aria-label="Diminuir zoom">−</button>
            <span class="initiative-viewer-zoom">100%</span>
            <button type="button" data-view-action="plus" aria-label="Aumentar zoom">＋</button>
            <button type="button" data-view-action="fit">AJUSTAR</button>
            <button type="button" data-view-action="actual">100%</button>
            <button class="initiative-viewer-close" type="button" data-view-action="close" aria-label="Fechar">×</button>
          </div>
        </header>
        <div class="initiative-viewer-stage">
          <button class="initiative-viewer-nav prev" type="button" data-view-action="prev" aria-label="Anterior">‹</button>
          <div class="initiative-viewer-scroll"><img class="initiative-viewer-image" alt="" referrerpolicy="no-referrer" /></div>
          <button class="initiative-viewer-nav next" type="button" data-view-action="next" aria-label="Próxima">›</button>
        </div>
      </section>`;
    document.body.appendChild(viewer);

    viewer.addEventListener('click', event => {
      const action = event.target.closest('[data-view-action]')?.dataset.viewAction;
      if (!action) return;
      if (action === 'close') closeViewer();
      if (action === 'prev') moveViewer(-1);
      if (action === 'next') moveViewer(1);
      if (action === 'plus') setScale(viewerState.scale * 1.25);
      if (action === 'minus') setScale(viewerState.scale / 1.25);
      if (action === 'fit') setScale(viewerState.fitScale);
      if (action === 'actual') setScale(1);
    });

    const scroll = viewer.querySelector('.initiative-viewer-scroll');
    scroll.addEventListener('wheel', event => {
      if (!event.ctrlKey && Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      event.preventDefault();
      setScale(viewerState.scale * (event.deltaY < 0 ? 1.12 : 0.89));
    }, { passive: false });

    document.addEventListener('keydown', event => {
      if (viewer.hidden) return;
      if (event.key === 'Escape') closeViewer();
      if (event.key === 'ArrowLeft') moveViewer(-1);
      if (event.key === 'ArrowRight') moveViewer(1);
      if (event.key === '+' || event.key === '=') setScale(viewerState.scale * 1.25);
      if (event.key === '-') setScale(viewerState.scale / 1.25);
    });
    return viewer;
  }

  function openViewer(gallery, index) {
    viewerState.gallery = gallery;
    viewerState.index = Number(index) || 0;
    const viewer = ensureViewer();
    viewer.hidden = false;
    document.body.classList.add('initiative-viewer-open');
    loadViewerItem();
  }

  function closeViewer() {
    const viewer = document.getElementById('initiativeViewer');
    if (viewer) viewer.hidden = true;
    document.body.classList.remove('initiative-viewer-open');
  }

  function moveViewer(direction) {
    const items = galleries[viewerState.gallery] || [];
    if (!items.length) return;
    viewerState.index = (viewerState.index + direction + items.length) % items.length;
    loadViewerItem();
  }

  function loadViewerItem() {
    const viewer = ensureViewer();
    const items = galleries[viewerState.gallery] || [];
    const item = items[viewerState.index];
    if (!item) return;
    const image = viewer.querySelector('.initiative-viewer-image');
    const scroll = viewer.querySelector('.initiative-viewer-scroll');
    viewer.querySelector('.initiative-viewer-title').textContent = item.label;
    viewer.querySelector('.initiative-viewer-count').textContent = `${viewerState.index + 1} / ${items.length}`;
    image.style.width = 'auto';
    image.style.height = 'auto';
    image.onload = () => {
      viewerState.naturalWidth = item.width || image.naturalWidth || 1200;
      viewerState.naturalHeight = item.height || image.naturalHeight || 900;
      const availableW = Math.max(240, scroll.clientWidth - 40);
      const availableH = Math.max(240, scroll.clientHeight - 40);
      viewerState.fitScale = Math.min(1, availableW / viewerState.naturalWidth, availableH / viewerState.naturalHeight);
      setScale(viewerState.fitScale);
      scroll.scrollLeft = 0;
      scroll.scrollTop = 0;
    };
    image.onerror = () => {
      image.removeAttribute('src');
      image.alt = 'Arquivo indisponível';
      viewer.querySelector('.initiative-viewer-title').textContent = `${item.label} · ARQUIVO INDISPONÍVEL`;
    };
    image.src = item.full;
    image.alt = item.label;
  }

  function setScale(value) {
    const viewer = ensureViewer();
    const image = viewer.querySelector('.initiative-viewer-image');
    const scale = Math.max(0.08, Math.min(4, value || 1));
    viewerState.scale = scale;
    if (viewerState.naturalWidth) image.style.width = `${Math.round(viewerState.naturalWidth * scale)}px`;
    if (viewerState.naturalHeight) image.style.height = `${Math.round(viewerState.naturalHeight * scale)}px`;
    viewer.querySelector('.initiative-viewer-zoom').textContent = `${Math.round(scale * 100)}%`;
  }

  function renderInitiativeContent() {
    const context = document.getElementById('stageContext');
    const mission = document.getElementById('stageMission');
    const actions = document.getElementById('stageActions');
    if (!context || !mission || !actions) return;

    context.innerHTML = initiativeStage.context.split('\n\n').map((paragraph, index) => {
      if (paragraph === '“Quatro canais. Ajuste independente.”') return `<blockquote class="initiative-note"><strong>${paragraph}</strong></blockquote>`;
      return `<p class="initiative-copy${index === 10 ? ' initiative-objective' : ''}">${paragraph}</p>`;
    }).join('');

    mission.innerHTML = '';
    actions.innerHTML = `<section class="initiative-materials" aria-labelledby="initiativeMaterialsTitle">
      <div class="initiative-materials-head"><h3 id="initiativeMaterialsTitle">MATERIAL DISPONÍVEL</h3><span>06 REGISTROS</span></div>
      <div class="initiative-material-list">${materials.map(materialMarkup).join('')}</div>
    </section>`;

    actions.querySelectorAll('.initiative-material-toggle').forEach(button => button.addEventListener('click', () => {
      const content = button.nextElementSibling;
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      button.querySelector('.chev').textContent = open ? '＋' : '−';
      content.hidden = open;
    }));
    actions.querySelectorAll('.initiative-thumb').forEach(button => button.addEventListener('click', () => openViewer(button.dataset.gallery, button.dataset.index)));
  }

  const originalOpenStageInitiative = openStage;
  openStage = function (index) {
    originalOpenStageInitiative(index);
    if (stages[index] && stages[index].name === 'Iniciativa') renderInitiativeContent();
  };

  const style = document.createElement('style');
  style.textContent = `
    .initiative-copy{margin:0 0 16px;color:#a4c3ba;font-size:14px;line-height:1.7}.initiative-objective{color:var(--text);font-weight:700;margin-bottom:22px}.initiative-note{margin:4px 0 20px;padding:12px 14px;border-left:2px solid var(--amber,#d5a64a);background:rgba(83,60,24,.10);color:var(--text);font-size:13px;line-height:1.65}.initiative-materials{margin-top:24px}.initiative-materials-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;color:var(--text-soft,#9aa9a3)}.initiative-materials-head h3{margin:0;color:var(--text);font-size:11px;letter-spacing:.10em}.initiative-materials-head span{font-size:10px;letter-spacing:.08em}.initiative-material-list{border-top:1px solid var(--line)}.initiative-material-item{border-bottom:1px solid var(--line)}.initiative-material-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 2px;border:0;background:transparent;color:var(--text);font:inherit;font-size:12px;font-weight:600;letter-spacing:.04em;text-align:left;cursor:pointer}.initiative-material-toggle .chev{color:var(--green);font-size:16px;font-weight:400}.initiative-material-content{padding:0 2px 16px;color:var(--text-soft,#9aa9a3);font-size:12px;line-height:1.65}.initiative-material-content>p{margin:0 0 10px}.initiative-material-status{margin-bottom:0!important;color:var(--amber,#d5a64a);font-size:10px;font-weight:700;letter-spacing:.08em}
    .initiative-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}.initiative-thumb{min-width:0;padding:0;overflow:hidden;border:1px solid var(--line);border-radius:4px;background:#050b09;color:var(--text-soft,#9aa9a3);font:inherit;cursor:zoom-in;text-align:left;transition:border-color .15s ease,transform .15s ease}.initiative-thumb:hover,.initiative-thumb:focus-visible{border-color:var(--green);outline:none;transform:translateY(-1px)}.initiative-thumb-media{display:flex;height:220px;align-items:center;justify-content:center;padding:8px;background:#020504;overflow:hidden}.initiative-thumb-media img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain}.initiative-thumb-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-top:1px solid var(--line)}.initiative-thumb-foot strong{font-size:9px;letter-spacing:.09em}.initiative-thumb-foot em{font-style:normal;font-size:8px;letter-spacing:.1em;color:var(--green)}
    body.initiative-viewer-open{overflow:hidden}.initiative-viewer[hidden]{display:none!important}.initiative-viewer{position:fixed;inset:0;z-index:3000;background:#010302;color:#dce7e2}.initiative-viewer-shell{width:100%;height:100%;display:flex;flex-direction:column}.initiative-viewer-bar{min-height:58px;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 14px;border-bottom:1px solid #27483c;background:#06100c}.initiative-viewer-bar>div:first-child{display:flex;flex-direction:column;gap:2px}.initiative-viewer-title{font-size:11px;letter-spacing:.1em}.initiative-viewer-count{color:#82aa9b;font-size:9px}.initiative-viewer-tools{display:flex;align-items:center;gap:6px}.initiative-viewer-tools button{height:32px;min-width:32px;padding:0 9px;border:1px solid #36594d;border-radius:3px;background:#081510;color:#b9cec6;font:600 9px/1 'IBM Plex Mono',monospace;letter-spacing:.05em;cursor:pointer}.initiative-viewer-tools button:hover{border-color:var(--green);color:var(--green)}.initiative-viewer-zoom{min-width:48px;text-align:center;font-size:9px;color:#9fb8af}.initiative-viewer-close{font-size:18px!important}.initiative-viewer-stage{position:relative;flex:1;min-height:0;display:grid;grid-template-columns:44px minmax(0,1fr) 44px}.initiative-viewer-scroll{min-width:0;min-height:0;overflow:auto;display:flex;align-items:flex-start;justify-content:flex-start;padding:20px;background:#000}.initiative-viewer-image{display:block;max-width:none!important;max-height:none!important;flex:none;margin:auto;border:1px solid #253b33;box-shadow:0 12px 40px rgba(0,0,0,.55)}.initiative-viewer-nav{border:0;background:#030906;color:#789c8f;font-size:34px;cursor:pointer}.initiative-viewer-nav:hover{color:var(--green);background:#07130f}
    @media(max-width:700px){.initiative-gallery{grid-template-columns:1fr}.initiative-thumb-media{height:210px}.initiative-viewer-bar{align-items:flex-start}.initiative-viewer-tools{flex-wrap:wrap;justify-content:flex-end}.initiative-viewer-tools [data-view-action="actual"]{display:none}.initiative-viewer-stage{grid-template-columns:34px minmax(0,1fr) 34px}.initiative-viewer-scroll{padding:8px}.initiative-viewer-nav{font-size:28px}}
  `;
  document.head.appendChild(style);
})();
