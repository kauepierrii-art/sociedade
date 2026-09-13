# Protocolo Delectus

Projeto experimental de interface para um protocolo de seleção e investigação.

## Estrutura atual

- `index.html` — estrutura principal da interface
- `styles.css` — estilos visuais
- `app.js` — lógica principal das etapas
- `patch.js` — ajustes de fluxo e persistência
- `access-hints.js` — dicas de acesso
- `stage-hints-v3.js` — sistema de dicas das etapas
- `ui-tweaks-v2.js` — ajustes visuais e de conteúdo
- `stage4-initiative.js` — conteúdo e interações da Etapa 04
- `stage4-tuner.js` — sintonizador analógico do Registro 06

## Áudios do sintonizador

Envie estes arquivos para `assets/stage4/` quando estiverem prontos:

- `tuner-click.mp3` — clique dos potenciômetros
- `tuner-error.mp3` — tentativa de frequência inválida
- `tuner-recovered.mp3` — gravação liberada pela frequência correta

O código do sintonizador é verificado por um digest derivado, em vez de aparecer
como texto no script. Em um site estático, porém, nenhum segredo no navegador é
absoluto: alguém com conhecimento técnico pode inspecionar e reproduzir a lógica.

