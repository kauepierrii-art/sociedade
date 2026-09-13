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
    {
      full: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Planta_da_Capital_do_Estado_de_S._Paulo_e_seus_arrabaldes_(1890).jpg?width=2400',
      thumb: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Planta_da_Capital_do_Estado_de_S._Paulo_e_seus_arrabaldes_(1890).jpg?width=700',
      label: 'MAPA A'
    },
    {
      full: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Nova_planta_da_cidade_de_S%C3%A3o_Paulo_e_sub%C3%BArbios-_publicada_por_Jules_Martin%2C_da_Cole%C3%A7%C3%A3o_Brasiliana_Iconogr%C3%A1fica.jpg?width=2400',
      thumb: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Nova_planta_da_cidade_de_S%C3%A3o_Paulo_e_sub%C3%BArbios-_publicada_por_Jules_Martin%2C_da_Cole%C3%A7%C3%A3o_Brasiliana_Iconogr%C3%A1fica.jpg?width=700',
      label: 'MAPA B'
    },
    {
      full: 'assets/stage4/mapa-c.png.png?v=20260913j',
      thumb: 'assets/stage4/mapa-c.png.png?v=20260913j',
      label: 'MAPA C'
    }
  ];

  const photoGallery = [
    { full: 'assets/stage4/fotografia-a.jpg.jpg?v=20260913j', thumb: 'assets/stage4/fotografia-a.jpg.jpg?v=20260913j', label: 'FOTOGRAFIA A' },
    { full: 'assets/stage4/fotografia-b.jpg.jpg?v=20260913j', thumb: 'assets/stage4/fotografia-b.jpg.jpg?v=20260913j', label: 'FOTOGRAFIA B' },
    { full: 'assets/stage4/fotografia-c.jpg.jpg?v=20260913j', thumb: 'assets/stage4/fotografia-c.jpg.jpg?v=20260913j', label: 'FOTOGRAFIA C' }
  ];

  const imageGallery = [
    { full: 'assets/stage4/imagem-a.jfif.jfif?v=20260913j', thumb: 'assets/stage4/imagem-a.jfif.jfif?v=20260913j', label: 'IMAGEM A' },
    { full: 'assets/stage4/imagem-b.jfif.jfif?v=20260913j', thumb: 'assets/stage4/imagem-b.jfif.jfif?v=20260913j', label: 'IMAGEM B' },
    { full: 'assets/stage4/imagem-c.png.png?v=20260913j', thumb: 'assets/stage4/imagem-c.png.png?v=20260913j', label: 'IMAGEM C' }
  ];

  const galleries = { maps: mapGallery, photos: photoGallery, images: imageGallery };
  const materials = [
    { label: 'REGISTRO 01 — MAPAS', description: 'Material cartográfico pertencente ao conjunto original.', gallery: 'maps' },
    { label: 'REGISTRO 02 — FOTOGRAFIAS', description: 'Conjunto de fotografias sem identificação conclusiva.', gallery: 'photos' },
    { label: 'REGISTRO 03 — IMAGENS', description: 'Imagens encontradas entre os materiais analisados.', gallery: 'images' },
    { label: 'REGISTRO 04 — GRAVAÇÃO', description: 'Registro sonoro preservado junto aos demais materiais.' },
    { label: 'REGISTRO 05 — FOLHA TÉCNICA', description: 'Documento técnico contendo referências e valores.' },
    { label: 'REGISTRO 06 — EQUIPAMENTO SONORO', description: 'Aparelho de quatro canais contendo uma fita magnética de formato incomum.' }
  ];

  function galleryMarkup(key) {
    const items = galleries[key] || [];
    return `<div class="initiative-gallery">${items.map((item, index) => `
      <button class="initiative-thumb" type="button" data-gallery="${key}" data-index="${index}" aria-label="Abrir ${item.label}">
        <span class="initiative-thumb-media"><img src="${item.thumb}" alt="" loading="lazy" /></span>
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

  function ensureViewer() {
    let viewer = document.getElementById('initiativeViewer');
    if (viewer) return viewer;

    viewer = document.createElement('div');
    viewer.id = 'initiativeViewer';
    viewer.className = 'initiative-viewer';
    viewer.hidden = true;
    viewer.innerHTML = `
      <div class="initiative-viewer-backdrop">
        <button class="initiative-viewer-close" type="button" aria-label="Fechar">×</button>
        <div class="initiative-viewer-content" role="dialog" aria-modal="true" aria-label="Visualização de imagem">
          <img class="initiative-viewer-image" src="" alt="" />
          <p class="initiative-viewer-label"></p>
        </div>
      </div>`;
    document.body.appendChild(viewer);

    const close = () => {
      viewer.hidden = true;
      document.body.classList.remove('initiative-viewer-open');
    };

    viewer.querySelector('.initiative-viewer-close').addEventListener('click', close);
    viewer.querySelector('.initiative-viewer-backdrop').addEventListener('click', event => {
      if (event.target.classList.contains('initiative-viewer-backdrop')) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !viewer.hidden) close();
    });

    return viewer;
  }

  function openViewer(galleryKey, index) {
    const item = (galleries[galleryKey] || [])[Number(index) || 0];
    if (!item) return;
    const viewer = ensureViewer();
    const image = viewer.querySelector('.initiative-viewer-image');
    image.src = item.full;
    image.alt = item.label;
    viewer.querySelector('.initiative-viewer-label').textContent = item.label;
    viewer.hidden = false;
    document.body.classList.add('initiative-viewer-open');
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
    .initiative-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}.initiative-thumb{min-width:0;padding:0;overflow:hidden;border:1px solid var(--line);border-radius:4px;background:#050b09;color:var(--text-soft,#9aa9a3);font:inherit;cursor:zoom-in;text-align:left}.initiative-thumb:hover,.initiative-thumb:focus-visible{border-color:var(--green);outline:none}.initiative-thumb-media{display:flex;height:220px;align-items:center;justify-content:center;padding:8px;background:#020504;overflow:hidden}.initiative-thumb-media img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain}.initiative-thumb-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-top:1px solid var(--line)}.initiative-thumb-foot strong{font-size:9px;letter-spacing:.09em}.initiative-thumb-foot em{font-style:normal;font-size:8px;letter-spacing:.1em;color:var(--green)}
    body.initiative-viewer-open{overflow:hidden}.initiative-viewer[hidden]{display:none!important}.initiative-viewer{position:fixed;inset:0;z-index:3000}.initiative-viewer-backdrop{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.94)}.initiative-viewer-content{max-width:96vw;max-height:94vh;display:flex;flex-direction:column;align-items:center;justify-content:center}.initiative-viewer-image{display:block;width:auto;height:auto;max-width:94vw;max-height:88vh;object-fit:contain;background:#020504;box-shadow:0 14px 50px rgba(0,0,0,.6)}.initiative-viewer-label{margin:8px 0 0;color:#9fb8af;font-size:9px;font-weight:700;letter-spacing:.10em}.initiative-viewer-close{position:fixed;top:14px;right:16px;z-index:3002;width:40px;height:40px;border:1px solid #547266;border-radius:50%;background:#07110e;color:#dce7e2;font:400 24px/1 'IBM Plex Mono',monospace;cursor:pointer}.initiative-viewer-close:hover,.initiative-viewer-close:focus-visible{border-color:var(--green);color:var(--green);outline:none}
    @media(max-width:700px){.initiative-gallery{grid-template-columns:1fr}.initiative-thumb-media{height:210px}.initiative-viewer-backdrop{padding:10px}.initiative-viewer-image{max-width:96vw;max-height:90vh}.initiative-viewer-close{top:8px;right:8px}}
  `;
  document.head.appendChild(style);
})();