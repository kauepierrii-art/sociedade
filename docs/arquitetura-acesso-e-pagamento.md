# Arquitetura futura — acesso, login, pagamento e progresso compartilhado

## 1. Princípio geral

Progresso local NÃO significa que o jogador comprou o jogo.

Cada conceito deve ter uma responsabilidade diferente:

- `localStorage` = progresso anônimo/local e conveniência;
- conta = identidade do jogador;
- banco = fonte definitiva do progresso autenticado;
- entitlement/compra = direito de acesso ao conteúdo pago;
- game session = partida/investigação em andamento;
- membros da sessão = usuários autorizados a compartilhar aquela investigação.

A arquitetura deve permitir tanto:

- uma pessoa jogando sozinha;
- várias pessoas jogando juntas e visualizando o mesmo progresso.

Uma partida solo deve ser simplesmente uma `game_session` com apenas um membro.

---

# 2. Fluxo inicial gratuito

Fluxo:

O CONVITE
→ Árvore da Cabala
→ Etapa 1
→ Etapa 2
→ Etapa 3

Até esse ponto:

- não exigir cadastro;
- não exigir login;
- não exigir pagamento;
- salvar o progresso localmente;
- permitir que o jogador experimente o Protocolo Delectus de forma anônima.

O objetivo é que o jogador entre primeiro na experiência e só encontre conta/pagamento quando houver motivo real para continuar.

---

# 3. Entrada no conteúdo pago

Ao tentar acessar a Etapa 4:

1. solicitar criação de conta ou login;
2. identificar o progresso anônimo/local existente;
3. associar esse progresso a uma conta e/ou sessão de jogo;
4. solicitar pagamento, caso ainda não exista direito de acesso;
5. registrar no servidor que aquela sessão/conta possui acesso ao Protocolo Delectus;
6. liberar Etapas 4–7.

A liberação do conteúdo pago NÃO deve depender de `localStorage`.

---

# 4. Etapas 4–7

Para acessar conteúdo pago, validar no servidor:

- usuário autenticado;
- participação autorizada em uma sessão;
- entitlement/compra válida para o Protocolo Delectus.

Nunca liberar Etapas 4–7 apenas porque o navegador possui determinado valor em `localStorage`.

O usuário não precisa fazer login novamente a cada etapa enquanto sua sessão de autenticação permanecer válida.

---

# 5. Conta do jogador

A conta representa a identidade do participante.

Exemplo conceitual:

user_id
email
created_at

A conta NÃO representa diretamente o progresso da investigação.

Isso é importante porque uma mesma conta poderá participar de:

- diferentes jogos;
- diferentes sessões;
- sessões individuais;
- sessões em grupo.

---

# 6. Game Session — partida/investigação

O progresso principal deve pertencer a uma `game_session`, e não diretamente ao `user_id`.

Exemplo conceitual:

game_session
- id
- game_id
- owner_user_id
- current_stage
- status
- created_at
- updated_at

Exemplo:

session_id = ABC123
game_id = protocolo_delectus
current_stage = 5

Isso significa que todos os membros autorizados daquela sessão enxergam o mesmo progresso.

---

# 7. Membros da sessão

Criar futuramente uma estrutura que vincule usuários a uma sessão.

Exemplo conceitual:

game_session_members
- session_id
- user_id
- role
- joined_at

Papéis possíveis:

- owner
- member

Exemplo:

Sessão ABC123

- Kauê — owner
- Jane — member
- outro participante — member

Todos visualizam o mesmo progresso daquela investigação.

---

# 8. Jogo individual

Jogar sozinho deve usar a mesma arquitetura.

Exemplo:

Sessão XYZ789

- Kauê — owner

Nenhuma arquitetura separada deve ser criada para jogo solo.

Uma partida solo é simplesmente uma sessão com um único membro.

---

# 9. Jogo em grupo

Uma pessoa poderá criar uma sessão e convidar outras pessoas para participar da mesma investigação.

Fluxo conceitual:

Jogador compra o Protocolo Delectus
→ cria uma sessão
→ recebe código/link de convite
→ compartilha com amigos
→ amigos entram/criam conta
→ entram na mesma sessão
→ todos visualizam o mesmo progresso.

Exemplo:

Sessão:
DELECTUS-7F3K

Participantes:
- owner
- member
- member
- member

Se qualquer participante concluir uma etapa, o progresso daquela sessão é atualizado.

Os outros membros passam a visualizar o novo estado.

---

# 10. Modelo comercial para grupos

A arquitetura deve permitir, futuramente, o modelo:

1 compra = 1 sessão de investigação

Essa sessão poderá autorizar um número limitado de participantes.

O limite exato ainda NÃO está definido.

Exemplo possível futuro:

- 1 comprador;
- até 4 ou 5 participantes na sessão.

Não implementar nem fixar esse limite agora.

A arquitetura deve apenas permitir que essa regra seja configurável futuramente.

Participantes convidados NÃO devem precisar compartilhar a senha ou a conta do comprador.

Cada pessoa deve possuir sua própria conta.

---

# 11. Compra / entitlement

O direito de acesso deve ser armazenado separadamente do progresso.

Exemplo conceitual:

entitlements
- id
- game_id
- purchaser_user_id
- session_id
- status
- created_at

Exemplo:

game_id = protocolo_delectus
session_id = ABC123
status = active

Assim, a sessão ABC123 possui direito de acessar o conteúdo pago.

A compra NÃO deve ser inferida a partir do progresso.

---

# 12. Múltiplos jogos

A mesma conta deve poder participar de vários jogos independentemente.

Exemplo:

Conta X:

- Protocolo Delectus — acesso adquirido
- Caso Sofia — não adquirido
- Caso 003 — acesso adquirido

Cada jogo deve possuir:

- seu próprio `game_id`;
- suas próprias sessões;
- seus próprios entitlements;
- seu próprio progresso.

Não criar uma arquitetura exclusiva para o Protocolo Delectus.

O modelo deve permitir crescimento futuro da Ordo Mognus como plataforma/hub de investigações.

---

# 13. Progresso após cadastro

Depois que houver conta e sessão:

- progresso principal deve ser salvo no servidor;
- `localStorage` pode continuar sendo usado como cache ou conveniência;
- o servidor deve ser a fonte definitiva.

Exemplo conceitual:

game_session_progress
- session_id
- game_id
- current_stage
- updated_at

Também pode existir futuramente progresso mais detalhado, como:

- etapas concluídas;
- pistas encontradas;
- documentos liberados;
- apontamentos revelados;
- respostas confirmadas;
- eventos importantes da investigação.

---

# 14. Sincronização entre participantes

Se vários jogadores estiverem na mesma sessão, todos devem visualizar o mesmo progresso.

Não é necessário sincronizar cada clique ou interação visual.

Sincronizar apenas eventos relevantes, como:

- etapa concluída;
- resposta correta;
- pista liberada;
- documento desbloqueado;
- apontamento revelado;
- mudança de etapa;
- alteração importante no estado da investigação.

A arquitetura poderá futuramente utilizar os recursos realtime do Supabase para propagar essas alterações entre participantes.

Isso NÃO deve ser implementado agora.

---

# 15. Conflitos de progresso

Como várias pessoas podem estar jogando ao mesmo tempo, o servidor deve ser a autoridade final.

Evitar lógica em que o navegador substitui diretamente o estado completo da sessão.

Preferir atualizações controladas por eventos ou operações específicas.

Exemplo:

correto:
- marcar Etapa 4 como concluída;
- liberar documento X;
- registrar pista Y.

Evitar:

- navegador envia uma cópia inteira do progresso local e sobrescreve o progresso do grupo.

Essa decisão reduz risco de perda de progresso em sessões com vários participantes.

---

# 16. Convite para sessão

Futuramente, uma sessão poderá possuir:

- código de convite;
- link de convite;
- token temporário ou permanente de entrada.

Exemplo:

DELECTUS-7F3K

ou

/convite/DELECTUS-7F3K

Ao aceitar o convite:

1. usuário cria conta ou faz login;
2. sistema verifica validade do convite;
3. usuário entra como membro da sessão;
4. passa a visualizar o progresso compartilhado.

Não implementar agora.

---

# 17. Botão CONTINUAR

Comportamento futuro:

## Caso 1 — usuário autenticado

Se houver sessão autenticada:

→ localizar sessões do jogador;
→ recuperar progresso da sessão;
→ continuar de onde parou.

Se o usuário participar de mais de uma sessão do mesmo jogo, futuramente poderá ser necessário apresentar uma seleção de partida.

## Caso 2 — progresso anônimo/local

Se não houver conta/sessão autenticada, mas existir progresso gratuito local:

→ continuar normalmente nas Etapas 1–3.

## Caso 3 — usuário já possui conta, mas está em outro dispositivo

Se não houver progresso local:

→ permitir login;
→ recuperar as sessões do usuário no servidor;
→ continuar o progresso correspondente.

IMPORTANTE:

progresso local nunca deve liberar sozinho Etapas 4–7.

---

# 18. Migração do progresso anônimo

Quando o jogador criar conta na transição para a Etapa 4:

- recuperar o progresso local das Etapas 1–3;
- criar ou selecionar uma `game_session`;
- associar o jogador à sessão;
- migrar o progresso relevante para o servidor;
- depois disso, o progresso no servidor passa a ser a referência principal.

Essa migração deve acontecer apenas uma vez de forma segura.

---

# 19. Segurança

Não proteger conteúdo pago apenas escondendo botões no frontend.

A autorização para Etapas 4–7 deve ser validada no servidor.

O frontend pode decidir o que mostrar visualmente, mas o servidor precisa validar:

- identidade;
- sessão;
- membership;
- entitlement;
- permissões.

O enigma pode existir no frontend.

A compra e o direito de acesso não.

---

# 20. Supabase

Quando essa arquitetura for implementada futuramente, utilizar preferencialmente:

- Supabase Auth para contas;
- banco PostgreSQL para sessões, membros, progresso e entitlements;
- Row Level Security;
- validações server-side;
- Supabase Realtime apenas onde fizer sentido.

Não alterar o Supabase neste momento.

---

# 21. Compatibilidade com sistema antigo

O projeto atual possui estruturas antigas relacionadas a:

- referências de acesso;
- sessões do protocolo;
- progresso;
- aliases.

A implementação futura deve ser feita de forma gradual e aditiva.

Não quebrar o beta atual durante a migração.

O sistema antigo poderá permanecer temporariamente enquanto a nova arquitetura é criada e validada.

---

# 22. Regra central da arquitetura

Manter sempre a separação:

localStorage
= progresso temporário/anônimo

conta
= identidade

game_session
= partida/investigação

membership
= quem participa daquela partida

progresso
= estado da sessão

entitlement
= direito de acesso

pagamento
= evento comercial que pode gerar entitlement

Esses conceitos NÃO devem ser tratados como a mesma coisa.

---

# 23. Objetivo futuro

A arquitetura deve suportar:

- jogador solo;
- grupos de amigos;
- continuidade em múltiplos dispositivos;
- vários jogos dentro da Ordo Mognus;
- compra independente por jogo;
- progresso compartilhado;
- convites para sessões;
- crescimento futuro sem depender de compartilhamento de login.


