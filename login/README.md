# Autenticação comercial isolada

Abra `/login/` por HTTP. A página não carrega app.js, patch.js ou protocol-sync.js e não lê/escreve progresso ou referências do beta.

Configuração pública reutilizada do projeto em auth.js; SDK Supabase JS fixado em 2.57.4. Sessão mantida pelo SDK na chave `delectus:commercial-auth:v1`. Logout encerra somente a sessão comercial deste navegador.

No Supabase Auth, autorize as URLs de retorno do ambiente de teste e futuro domínio: `http://localhost:4174/login/`, `http://localhost:4174/login/?recovery=1` e equivalentes no domínio escolhido. Não altere o Site URL do beta para testar. Confirmação de e-mail e política de senha são controladas pelo Supabase; a interface exige no mínimo 8 caracteres e trata requisitos adicionais do servidor.

Teste cadastro com uma caixa de e-mail exclusiva de teste, confirmação (se habilitada), login correto/incorreto, recarga, logout e recuperação com retorno do link e nova senha. Não use contas de participantes.

Não há integração com pagamentos, progresso ou autorização de etapas. A confirmação nesta página só representa autenticação.

## Verificação local — 30/09/2026

- Sintaxe dos dois módulos e verificações de URLs/mensagens: aprovadas.
- Supabase Auth real: configurações públicas responderam HTTP 200; cadastro habilitado, confirmação de e-mail obrigatória. Login com credenciais fictícias foi rejeitado e traduzido corretamente.
- Navegador: campos vazios, envio por Enter, bloqueio durante envio, senhas diferentes, navegação entre formulários, desktop, larguras 390 e 768 px: aprovados. Sem erros de console observados; não há logs no código de autenticação.
- Entrada antiga: aviso de manutenção e formulário por referência continuam disponíveis. Nenhum arquivo existente foi modificado. Não foi usado acesso de participante para testar progressão.
- Pendente: cadastro com e-mail de teste controlado, confirmação, login válido, recarga com sessão, logout autenticado e recuperação/redefinição pelo e-mail. É necessário confirmar as URLs autorizadas no Supabase. Safari/iPhone físico também não foi testado.
- Nenhum commit criado enquanto os testes essenciais de autenticação completa estiverem pendentes. Nenhum push ou deploy realizado.
