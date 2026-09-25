# Instruções de manutenção

Antes de alterar arquivos, confirme que o diretório atual é a raiz do repositório
Git com `git rev-parse --show-toplevel`. Trabalhe apenas nesse checkout; não use
cópias de trabalho sob `Documents` como fonte de publicação.

## Apontamentos

- Etapas 1–3: `stage-hints-v3.js`
- Etapas 4–5: `stage45-hints.js`
- Etapa 6: `stage6-mirror.js`
- Etapa 7 não possui apontamentos.

Para mudanças nos apontamentos, inspecione somente esses módulos antes de buscar
outros arquivos. Não altere a tela de login, textos dos enigmas, respostas ou
progresso, salvo pedido explícito.

## Publicação

Antes de publicar, execute verificações de sintaxe nos arquivos alterados, confira
`git status -sb` e confirme que a branch é `main`. Não faça deploy, push ou
alterações no banco sem pedido explícito.
