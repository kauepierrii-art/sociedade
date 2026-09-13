// ETAPA 04 — INICIATIVA
// Conteúdo e estrutura inicial. Os arquivos reais serão vinculados posteriormente.
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

  const materials = [
    ['REGISTRO 01 — MAPAS', 'Material cartográfico pertencente ao conjunto original.'],
    ['REGISTRO 02 — GRAVAÇÃO', 'Registro sonoro preservado junto aos demais materiais.'],
    ['REGISTRO 03 — FOTOGRAFIAS', 'Conjunto de fotografias sem identificação conclusiva.'],
    ['REGISTRO 04 — IMAGENS', 'Imagens encontradas entre os materiais analisados.'],
    ['REGISTRO 05 — FOLHA TÉCNICA', 'Documento técnico contendo referências e valores.'],
    ['REGISTRO 06 — EQUIPAMENTO SONORO', 'Aparelho de quatro canais contendo uma fita magnética de formato incomum.']
  ];

  function materialMarkup(label, description) {
    return `
      <div class="initiative-material-item">
        <button class="initiative-material-toggle" type="button" aria-expanded="false">
          <span>${label}</span><span class="chev" aria-hidden="true">＋</span>
        </button>
        <div class="initiative-material-content" hidden>
          <p>${description}</p>
          <p class="initiative-material-status">ARQUIVO NÃO VINCULADO</p>
        </div>
      </div>`;
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
          ${materials.map(([label, description]) => materialMarkup(label, description)).join('')}
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
  }

  const originalOpenStageInitiative = openStage;
  openStage = function (index) {
    originalOpenStageInitiative(index);
    if (stages[index] && stages[index].name === 'Iniciativa') renderInitiativeContent();
  };

  const style = document.createElement('style');
  style.textContent = `
    .initiative-copy {
      margin: 0 0 16px;
      color: #a4c3ba;
      font-size: 14px;
      line-height: 1.7;
    }
    .initiative-objective {
      color: var(--text);
      font-weight: 700;
      margin-bottom: 22px;
    }
    .initiative-note {
      margin: 4px 0 20px;
      padding: 12px 14px;
      border-left: 2px solid var(--amber, #d5a64a);
      background: rgba(83, 60, 24, .10);
      color: var(--text);
      font-size: 13px;
      line-height: 1.65;
    }
    .initiative-materials {
      margin-top: 24px;
    }
    .initiative-materials-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
      color: var(--text-soft, #9aa9a3);
    }
    .initiative-materials-head h3 {
      margin: 0;
      color: var(--text);
      font-size: 11px;
      letter-spacing: .10em;
    }
    .initiative-materials-head span {
      font-size: 10px;
      letter-spacing: .08em;
    }
    .initiative-material-list {
      border-top: 1px solid var(--line);
    }
    .initiative-material-item {
      border-bottom: 1px solid var(--line);
    }
    .initiative-material-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 14px 2px;
      border: 0;
      background: transparent;
      color: var(--text);
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: .04em;
      text-align: left;
      cursor: pointer;
    }
    .initiative-material-toggle .chev {
      color: var(--green);
      font-size: 16px;
      font-weight: 400;
    }
    .initiative-material-content {
      padding: 0 2px 14px;
      color: var(--text-soft, #9aa9a3);
      font-size: 12px;
      line-height: 1.65;
    }
    .initiative-material-content p {
      margin: 0 0 8px;
    }
    .initiative-material-status {
      margin-bottom: 0 !important;
      color: var(--amber, #d5a64a);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .08em;
    }
  `;
  document.head.appendChild(style);
})();