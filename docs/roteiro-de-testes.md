# Roteiro de testes manuais — Crow

Roteiro para conferir, com a aplicação rodando, tudo o que mudou na branch
`feat/auditoria-tcc-fases-2-6-tema`: os commits `10a165b` e `24d3bfd` e as alterações de
24/09/2026 ainda não commitadas. O que cada mudança faz está registrado nas seções 8.x do
[`PENDENCIAS.md`](../PENDENCIAS.md).

## Como usar

- **Siga a ordem.** A preparação (seção 0) cria as contas e os dados usados depois, e os casos do
  administrador dependem do estado deixado pelos do usuário comum.
- Cada caso tem uma pré-condição, uma tabela de passos com o resultado esperado de cada um e a
  marcação final. Marque **OK** só se todos os resultados esperados se confirmarem. Em caso de
  falha, anote o número do passo, o que aconteceu e, se possível, um print.
- **375 px:** DevTools do navegador (F12) → alternar barra de dispositivos (Ctrl+Shift+M) →
  *Responsivo* com largura **375**.
- **Dois temas:** o botão de sol/lua da topbar alterna entre claro e escuro; a escolha fica salva
  no navegador.
- Antes de registrar uma falha, confira as [limitações conhecidas](#limitações-conhecidas).

## Registro da execução

| Campo | Preenchimento |
|---|---|
| Data | |
| Testador | |
| Navegador e versão | |
| Branch / commit testado | |
| Caixa de e-mail das contas A e B | |

---

## 0. Preparação

### 0.1 Ambiente

1. PostgreSQL local no ar (porta 5432, banco `crow_db`).
2. SMTP real configurado no perfil `local` da API (conta Gmail). **Não** use as variáveis
   `SPRING_MAIL_HOST`/`SPRING_MAIL_PORT` que desligam o envio: aqui os e-mails precisam chegar.
3. API, num terminal Git Bash: `cd api && ./mvnw spring-boot:run`. Espere a linha `Started …`
   (cerca de 30 s) e deixe esse terminal à vista: o caso A-07 é conferido nele.
4. Front, em outro terminal: `cd crow && npx ng serve`, e abra `http://localhost:4200`.
5. Chrome ou Edge no desktop, com a janela em pelo menos 1280 px de largura. Deixe também uma
   janela anônima à mão para entrar com uma segunda conta ao mesmo tempo.

### 0.2 Contas

| Conta | Nome | E-mail | Senha | Papel |
|---|---|---|---|---|
| Admin | Administrador | `admin@crow.com` | `admin123` (seed de desenvolvimento) | administrador |
| A | Ana Roteiro | `<EMAIL_A>`: caixa real sua, ex.: `seunome+crowa@gmail.com` | `Roteiro123` | comum |
| B | Bruno Roteiro | `<EMAIL_B>`: ex.: `seunome+crowb@gmail.com` | `Roteiro123` | comum |

As contas A e B são criadas no caso U-01. O Gmail entrega `seunome+qualquercoisa@gmail.com` na
caixa `seunome@gmail.com`, então as duas contas podem usar a mesma caixa real.

> ⚠️ **Nunca faça ações de moderação contra `usuario@crow.com` nem contra usuários que já
> existiam no banco.** Com o SMTP real ligado, a API envia e-mail de verdade: `crow.com` é um
> domínio real, de terceiros, e os demais usuários do banco local têm endereços reais. Toda
> desativação, suspensão, reativação, e-mail avulso e exclusão de idioma deste roteiro é feita
> contra a **Conta B**.

### 0.3 Dados usados pelos casos

Criados no caso U-04:

| Dono | Nome do idioma | Idioma | Proficiência | Visibilidade | Conteúdo |
|---|---|---|---|---|---|
| A | Inglês do Roteiro | Inglês (Estados Unidos) | Iniciante | Público | 3 módulos: Saudações (3 frases), Números e Vídeos |
| B | Espanhol do Roteiro | Espanhol | Básico | Público | 1 módulo, 1 frase |
| B | Descartável 1 | Francês | Iniciante | Público | 1 módulo, 1 frase |
| B | Descartável 2 | Italiano | Avançado | **Privado** | 1 módulo, 1 frase |

Anote os códigos conforme aparecerem. A seção de segurança os usa nas chamadas à API.

| Referência | Onde obter | Valor |
|---|---|---|
| `USR_A` | Perfil da Conta A, badge do código (U-11) | |
| `USR_B` | Perfil público da Conta B (U-09) | |
| `IDM_A` | Página do "Inglês do Roteiro", **ID Idioma** (U-04) | |
| `IDM_B` | Página do "Espanhol do Roteiro", **ID Idioma** (U-04) | |
| `MOD_B` | Número depois de `?id=` na URL do módulo do "Espanhol do Roteiro" (U-10) | |

---

## 1. Usuário comum

### U-01 · Cadastro com links institucionais

**Pré-condição:** nenhuma sessão aberta (clique em **Sair** ou use a janela anônima).

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Em `/login`, clique em **Criar nova conta**. | Abre "Criar Nova Conta", com o botão **Voltar** no canto superior esquerdo e o formulário numa coluna única centralizada. O card "Benefícios da Conta" **não** existe mais. |
| 2 | No texto do checkbox ("Eu aceito os Termos de Uso e a Política de Privacidade"), clique em **Termos de Uso**. | Abre em **nova aba** `/termos-de-uso`, sem erro 404: título "Termos de Uso", "Última atualização: 29 de agosto de 2026" e 11 seções numeradas. |
| 3 | Nessa aba nova, clique logo em **Voltar**, antes de navegar para outra página. | Como a aba não tem histórico, vai para `/login`. Feche a aba. |
| 4 | No cadastro, clique em **Política de Privacidade**, no checkbox. No fim da página aberta, clique no link **Termos de Uso**; no fim dos Termos, no link **Política de Privacidade**. | A Política abre em nova aba, com 11 seções numeradas, e os dois links do rodapé levam de uma página à outra na mesma aba. Feche a aba. |
| 5 | Clique nos dois links do texto abaixo do botão ("Ao criar sua conta, você concorda com os…"). | Cada um abre a página certa em nova aba. Feche as abas. |
| 6 | Preencha Nome `Ana Roteiro` e E-mail `<EMAIL_A>` e clique em **Verificar**. | "Código enviado! Verifique sua caixa de entrada." e aparece o campo "Código de verificação". |
| 7 | Abra o e-mail recebido. | Assunto **Crow - Código de Verificação**, com um código de 6 dígitos e "Este código expira em 10 minutos." |
| 8 | Digite um código errado (ex.: `111111`) e clique em **Confirmar**. | "Código inválido ou expirado. Tente novamente." |
| 9 | Digite o código certo e clique em **Confirmar**. | "Email verificado com sucesso!"; o botão vira **Verificado** e o e-mail fica somente leitura. |
| 10 | Preencha senha e confirmação com `Roteiro123`, **sem** marcar o checkbox de aceite. | **Criar Conta** fica desabilitado. |
| 11 | Marque o checkbox e clique em **Criar Conta**. | Entra na `/home` da Conta A; a topbar mostra **Ana**. |
| 12 | Avatar → **Sair**. Repita os passos 1 e 6 a 11 para a Conta B (`Bruno Roteiro`, `<EMAIL_B>`). | Conta B criada; a topbar mostra **Bruno**. Saia. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### U-02 · Login

**Pré-condição:** contas A e B criadas; nenhuma sessão aberta.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Em `/login`, confira o rodapé. | "© 2026 - Todos os direitos reservados". |
| 2 | Clique no botão de tema, no canto da tela. | Alterna entre claro e escuro; campos, textos e botões continuam legíveis nos dois. |
| 3 | Entre com `<EMAIL_A>` e uma senha errada (6 ou mais caracteres). | "Email ou senha incorretos"; continua em `/login`. |
| 4 | Entre com um e-mail sem cadastro (ex.: `naoexiste+crow@gmail.com`). | A mesma mensagem, "Email ou senha incorretos": a tela não revela se o e-mail tem cadastro. |
| 5 | Entre com `<EMAIL_A>` / `Roteiro123`. | Vai para `/home`. |
| 6 | Saia e entre com `admin@crow.com` / `admin123`. | Vai para `/controle-adm`, não para a home. Saia. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### U-03 · Recuperação de senha, com o Cancelar

**Pré-condição:** nenhuma sessão aberta.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Em `/login`, clique em **Esqueci minha senha**. | `/recuperar-senha`, com o título "Recuperar Senha" e o indicador de 3 etapas na primeira. |
| 2 | Informe `naoexiste+crow@gmail.com` e clique em **Enviar Código**. | "Este email não está cadastrado." |
| 3 | Clique em **Cancelar**. | Volta para `/login`. |
| 4 | Abra a recuperação de novo, informe `<EMAIL_A>` e clique em **Enviar Código**. | Etapa 2, "Digite o Código de Verificação", com o e-mail e "Código enviado! Verifique sua caixa de entrada."; chega o e-mail **Crow - Código de Verificação**. |
| 5 | Na etapa 2, clique em **Cancelar** (botão sem seta). | Continua em `/recuperar-senha`, **na etapa 1**, com o campo de e-mail **vazio** e nenhuma mensagem de envio ou de erro. |
| 6 | Informe `<EMAIL_A>` de novo e clique em **Enviar Código**. | Etapa 2; chega um novo e-mail. |
| 7 | Clique em **Reenviar código**. | Chega mais um e-mail. Daqui em diante vale **só o código do e-mail mais recente**. |
| 8 | Digite um código errado e clique em **Verificar Código**. | "Código inválido ou expirado. Tente novamente." (O botão só habilita com 6 dígitos.) |
| 9 | Digite o código mais recente e clique em **Verificar Código**. | Etapa 3, "Defina sua Nova Senha". |
| 10 | Clique em **Voltar** (botão com seta). | Volta à etapa 2. O código já foi usado: para seguir, clique em **Reenviar código** e verifique o novo código (ver [limitações conhecidas](#limitações-conhecidas), item 9). Chegue de novo à etapa 3. |
| 11 | Nova senha `Roteiro456` e uma confirmação diferente; clique em **Confirmar Nova Senha**. | "As senhas não coincidem." |
| 12 | Confirmação igual (`Roteiro456`) e **Confirmar Nova Senha**. | Modal "Senha Alterada!" com "Sua senha foi alterada com sucesso."; o botão do modal leva ao `/login`. |
| 13 | Tente entrar com `Roteiro123` e depois com `Roteiro456`. | A senha antiga é recusada; a nova entra. |
| 14 | Avatar → **Perfil** → "Alterar Senha": senha atual `Roteiro456`, nova senha e confirmação `Roteiro123` → **Salvar Alterações**. | "Senha alterada com sucesso!". A Conta A volta à senha usada no resto do roteiro. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### U-04 · Criação de idioma, módulo e frase, com múltiplas respostas aceitas

**Pré-condição:** Conta A logada, ainda sem idiomas.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Na home, clique no card **+**. | Modal "Adicionar Idioma" com três opções na mesma linha: **Buscar Idioma**, **Buscar Usuário** e **Novo Idioma**. A opção "Gerar Idioma (IA)" **não** existe mais. |
| 2 | Clique em **Novo Idioma**. | `/cadastrar-idioma`, com o botão **Voltar** no topo e as etapas Idioma → Módulo → Frase. |
| 3 | Sem preencher nada, clique em **Voltar**. | Volta para a home na hora, sem modal. |
| 4 | Abra o cadastro de novo, digite só o Nome e clique em **Voltar**. | Modal "Sair do Cadastro" ("Tem certeza que deseja sair do cadastro?"). **Continuar Editando** fecha o modal e mantém o que foi digitado. |
| 5 | Etapa Idioma: Idioma **Inglês (Estados Unidos)**, Nome `Inglês do Roteiro`, uma descrição, Proficiência **Iniciante** e Visibilidade **Público**. Clique em **Avançar**. | Etapa Módulo. |
| 6 | Escolha um ícone, preencha o Nome do Módulo com `Saudações` e clique em **Avançar**. | Etapa Frase. |
| 7 | Modo **Tradução Direta**. Tradução Completa `Bom dia! Como você está?`. Palavra 1 `Bom dia`, com Tradução `Good morning`; pelo botão **+**, Palavra 2 `Como você está?`, com Tradução `How are you?`. | O bloco "Outras respostas aceitas (opcional)" mostra a faixa **Tradução principal** com `Good morning How are you?`. |
| 8 | Em "Outras respostas aceitas", adicione uma resposta e deixe-a vazia. | "Preencha ou remova esta resposta."; o botão de adicionar outra resposta e o **Finalizar** ficam desabilitados. |
| 9 | Preencha essa resposta com `GOOD MORNING, how are you`. | "Esta é a tradução principal — ela já é aceita automaticamente." (a comparação ignora maiúsculas, acentos e pontuação). |
| 10 | Troque o texto para `How are you? Good morning` e adicione outra resposta com `how are you good morning!`. | Só a segunda acusa "Esta resposta já foi cadastrada." |
| 11 | Preencha respostas diferentes até não conseguir adicionar mais. | O limite é **5**: com 5 respostas, o botão de adicionar desabilita. Remova todas menos `How are you? Good morning` (botão **Remover resposta**). |
| 12 | Clique em **Finalizar**. | Volta à home com `Idioma "Inglês do Roteiro" cadastrado com sucesso!` e o card do idioma. |
| 13 | Clique no card do idioma. | Página do idioma com "Última atualização" na data de hoje. Anote o **ID Idioma** como `IDM_A`. |
| 14 | **Adicionar Módulo**: ícone, nome `Números` e **Avançar**; frase no modo **Selecionar Pares** com 3 pares; **Finalizar**. | `Módulo "Números" adicionado com sucesso!`; o módulo aparece como **#2**. |
| 15 | **Adicionar Módulo** `Vídeos`, com uma frase **Quiz**: Mídia **Vídeo** (link de qualquer vídeo público do YouTube), pergunta, 2 alternativas e a resposta correta marcada. | Módulo **#3** criado. |
| 16 | Abra o módulo **Saudações** (clique no ícone ou no nome) → **Nova Frase**. Cadastre duas frases de Tradução Direta (`Obrigado` → `Thank you`; `Boa noite` → `Good night`), cada uma com **Finalizar**. | Depois de cada uma, volta ao módulo, que termina com 3 frases (#1 a #3). |
| 17 | Abra **Nova Frase** mais uma vez, preencha qualquer campo e clique em **Cancelar**. | Modal "Cancelar Cadastro"; **Sim, Cancelar** volta ao módulo sem criar a frase. |
| 18 | Saia, entre como Conta B e crie, pelo mesmo fluxo (home → **+** → **Novo Idioma**), os três idiomas da Conta B da [tabela 0.3](#03-dados-usados-pelos-casos), cada um com um módulo e uma frase. | Home da Conta B com os 3 cards; o card **+** continua visível (o limite é 4). Anote o **ID Idioma** do "Espanhol do Roteiro" como `IDM_B`. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### U-05 · Home em desktop e em 375 px

**Pré-condição:** Conta A logada, com o "Inglês do Roteiro" criado.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Em desktop, passe o mouse sobre o card do idioma. | Aparecem os botões **Ver detalhes do idioma** (i), **Editar idioma** e **Excluir idioma**. |
| 2 | Clique no (i) e depois clique de novo. | Abre uma caixa flutuante abaixo do card com ID (`IDM-…`), Nota, Módulos e a descrição; o segundo clique a fecha. |
| 3 | Clique no card. | Abre a página do idioma. Clique em **Voltar**: volta para a home. |
| 4 | Mude para 375 px. | Cards em **coluna única**, sem rolagem horizontal. A caixa de informações (ID, Nota, Módulos e descrição) fica **sempre visível** dentro do card, e os botões (i), editar e excluir ficam numa barra no rodapé do card, **visíveis sem passar o mouse** e com área de toque grande (cerca de 44 px). |
| 5 | Ainda em 375 px, toque no card **+**. | Modal "Adicionar Idioma" com as três opções empilhadas, dentro da tela. Feche. |
| 6 | Toque em **Editar idioma** e depois em **Excluir idioma**, cancelando os dois. | Os dois modais cabem inteiros na tela e fecham em **Cancelar**. |
| 7 | Troque o tema e repita os passos 1 a 6, em desktop e em 375 px. | Nada ilegível (texto escuro sobre fundo escuro ou claro sobre claro) em cards, caixa de informações, barra de ações e modais. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### U-06 · Reordenação de módulos e frases

**Pré-condição:** Conta A logada; "Inglês do Roteiro" com 3 módulos e "Saudações" com 3 frases (U-04).

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Abra o "Inglês do Roteiro". | Cada módulo mostra a posição (#1, #2, #3) e, como a Conta A é a dona, setas para cima e para baixo. A seta para cima do #1 e a seta para baixo do #3 ficam desabilitadas. |
| 2 | Clique na seta para baixo do #1 ("Saudações"). | A troca aparece na hora ("Saudações" vira #2) e o módulo **não** fica marcado como selecionado. |
| 3 | Espere 1 segundo e recarregue a página (F5). | A nova ordem foi mantida. |
| 4 | DevTools → aba **Rede** (Network). Clique várias vezes seguidas, para baixo e para cima, no mesmo módulo. | A lista acompanha cada clique. Ao terminar a sequência, sai **no máximo uma** requisição `PUT …/modulos/ordem`, e nenhuma se o módulo terminou onde começou. |
| 5 | Com o teclado (Tab), leve o foco a uma seta e pressione **Enter**. | O módulo se move, e o card **não** é marcado nem desmarcado. |
| 6 | DevTools → Rede → limitação de rede **Offline**. Clique numa seta. | A troca aparece e é **desfeita** logo depois, com o aviso "Não foi possível salvar a nova ordem." (fecha no X). Volte a limitação para **Sem limitação**. |
| 7 | Deixe "Saudações" como #1 e abra o módulo. | Cada frase mostra a posição (#1, #2, #3) e setas, com as mesmas regras para a primeira e a última. |
| 8 | Mova a frase #1 para baixo e recarregue. | A nova ordem foi mantida. Anote a ordem final das frases: o U-07 a usa. |
| 9 | Na janela anônima, entre como Conta B, abra o "Inglês do Roteiro" (**+** → **Buscar Idioma**) e o módulo "Saudações". | A Conta B vê as posições (#1, #2…), mas **nenhuma** seta, nenhum Editar ou Excluir e nenhum botão "Nova Frase" ou "Adicionar Módulo". |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### U-07 · Rodada de jogo: ordem de cadastro e cancelar rodada

**Pré-condição:** Conta A logada; ordem das frases de "Saudações" anotada no U-06; sons ligados na topbar (ícone de alto-falante sem o X).

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Pela home, abra o "Inglês do Roteiro" e clique em dois cards de módulo, fora do ícone e do nome. | Os cards ficam marcados, **INICIAR MÓDULOS** mostra o contador **2** e aparece o botão **Limpar seleção**. |
| 2 | Clique em **Limpar seleção**. | A seleção é zerada e o botão **Limpar seleção** some. |
| 3 | Clique em **Selecionar todos** e depois em **INICIAR MÓDULOS**. | Modal "Como deseja estudar?" com **Ordem Aleatória** e **Ordem de Cadastro**. |
| 4 | Clique em **Ordem de Cadastro**. | `/jogar` com "Etapa 1 / 5". As frases seguem a ordem dos módulos na tela e, dentro de "Saudações", a ordem anotada no U-06. |
| 5 | Quando aparecer "Bom dia! Como você está?", monte a resposta alternativa: `How are you?` e depois `Good morning`. Clique em **Verificar Resposta**. | "Resposta Correta!", com som de acerto. |
| 6 | Clique em **Continuar**. Na frase seguinte, erre de propósito e verifique. | Som curto de avanço ao continuar. "Resposta Incorreta" mostra a resposta correta, com som de erro; **Ok, Entendi** avança. |
| 7 | Clique em **Cancelar rodada**, no topo da tela. | Modal avisando que a rodada será perdida (respostas enviadas e tempo decorrido) e que você voltará para a tela do idioma, com **Voltar à rodada**, **Cancelar rodada** e o X. As animações da tela ao fundo param. |
| 8 | Pressione **Esc**. | O modal fecha; etapa e pontuação continuam iguais. |
| 9 | Abra o modal de novo e clique fora dele, no fundo escurecido. Abra mais uma vez e clique em **Voltar à rodada**. | Nos dois casos o modal fecha e nada da rodada muda. |
| 10 | Abra o modal e clique em **Cancelar rodada**. | Volta para a página do "Inglês do Roteiro". **Voltar** dali leva à home. |
| 11 | Abra o idioma, clique em **Selecionar todos** e em **INICIAR MÓDULOS**. | No modal, **Ordem de Cadastro** aparece destacada (a última escolha da sessão). |
| 12 | Escolha **Ordem Aleatória**. | A sequência das frases difere da ordem de cadastro. Se coincidir por acaso, cancele a rodada e repita. |
| 13 | Na frase do Quiz, dê play no vídeo, abra **Cancelar rodada** e depois clique em **Voltar à rodada**. | O vídeo pausa quando o modal abre e volta a tocar quando ele fecha. |
| 14 | Responda até o fim. | Som de conclusão e tela final com Acertos, Erros, Total, Tempo e "Histórico de Respostas". **Voltar ao Idioma** leva à página do idioma. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### U-08 · Busca de idiomas com filtros múltiplos combinados

**Pré-condição:** Conta A logada; os três idiomas da Conta B criados (U-04).

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Home → **+** → **Buscar Idioma**. | `/buscar-idioma` com o título "N IDIOMAS DISPONÍVEIS". Aparecem o "Espanhol do Roteiro" e o "Descartável 1"; **não** aparecem os idiomas da própria Conta A nem o "Descartável 2", que é privado. |
| 2 | Abra o filtro **Idioma**. | As opções saem dos resultados carregados, em ordem alfabética, e incluem Espanhol e Francês. |
| 3 | Marque **Espanhol** e **Francês**. | O menu continua aberto; o botão do filtro ganha o contador **2** e muda de cor; a lista mostra só idiomas em Espanhol **ou** Francês; o título vira "N RESULTADOS ENCONTRADOS". |
| 4 | Abra **Proficiência** e marque **Iniciante**. | Contador 1 em Proficiência. Ficam os idiomas que são (Espanhol ou Francês) **e** Iniciante; dos idiomas da Conta B, só o "Descartável 1". |
| 5 | Marque também **Básico**. | O "Espanhol do Roteiro" (Básico) volta, junto com o "Descartável 1". |
| 6 | Digite `Descartável` na busca. | Fica só o "Descartável 1": busca e filtros se combinam. |
| 7 | No filtro Idioma, clique em **Todos os idiomas**. | Limpa só o filtro de idioma; Proficiência e busca continuam valendo. |
| 8 | Na ordenação, escolha **Avaliação** e depois **Data de Criação**. | A ordenação é de escolha única: o menu fecha a cada escolha. |
| 9 | Clique em **Limpar filtros**. | Busca, Idioma e Proficiência zerados; a ordenação escolhida **continua**; o botão **Limpar filtros** some. |
| 10 | Busque um texto que não exista (ex.: `zzzz`). | "Nenhum resultado encontrado" e "Tente ajustar os filtros ou termos de busca". Limpe a busca. |
| 11 | Em 375 px, abra os três menus. | Os menus cabem na largura da tela; o de Idioma rola por dentro se a lista for longa. |
| 12 | Abra o "Espanhol do Roteiro" e clique em **Voltar**. | Volta para `/buscar-idioma`, com os filtros zerados (ver [limitações conhecidas](#limitações-conhecidas)). |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### U-09 · Busca e visualização de outro usuário

**Pré-condição:** Conta A logada.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Home → **+** → **Buscar Usuário**. | `/buscar-usuario` com os usuários comuns e **nenhum** administrador ("Administrador" não aparece). |
| 2 | Busque `admin`. | Nenhum administrador aparece nos resultados. |
| 3 | Busque `Bruno`. | Card da Conta B com "Membro desde dd/MM/yyyy" e **2** idiomas (só os públicos contam). |
| 4 | Clique no card. | `/visualizar-usuario?id=USR-…`, "Perfil do Usuário": nome, **ID: USR-…**, "Membro desde…" e "Idiomas (2/4)" com os dois idiomas públicos. **Não** aparece e-mail. Anote o código como `USR_B`. |
| 5 | Clique em "Espanhol do Roteiro". | Abre o idioma. |
| 6 | Clique em **Voltar**. | Volta para o **perfil da Conta B**. |
| 7 | No perfil, clique em **Voltar**. | Vai para `/buscar-usuario`, e **não** de volta para o idioma. |
| 8 | Vá por **Buscar Idioma** até o "Espanhol do Roteiro" e clique em **ID Usuário: USR-…**, no cabeçalho. | Abre o perfil da Conta B. |
| 9 | No perfil, clique em **Voltar**; no idioma, clique em **Voltar**. | O primeiro leva ao "Espanhol do Roteiro"; o segundo, a `/buscar-idioma`. A origem do idioma foi preservada. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### U-10 · Navegação completa sem loop

**Pré-condição:** Conta A logada.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Na `/home`: **+** → **Buscar Idioma**. | `/buscar-idioma`. |
| 2 | Abra o "Espanhol do Roteiro", da Conta B. | `/visualizar-idioma?id=IDM-…&origem=buscar-idioma`, com os botões Denunciar, Avaliar e Importar (a Conta A não é a dona). |
| 3 | Abra o módulo (clique no ícone ou no nome). | `/visualizar-modulo?id=…&idIdioma=IDM-…&origem=buscar-idioma`, sem controles de dono. Anote o número depois de `id=` como `MOD_B`. |
| 4 | Clique em **Voltar**. | Volta ao "Espanhol do Roteiro". |
| 5 | Clique em **Voltar**. | `/buscar-idioma`. |
| 6 | Clique em **Voltar**. | `/home`. |
| 7 | Refaça os passos 1 a 6 e, no fim, use também o botão Voltar do navegador algumas vezes. | Em nenhum momento duas telas ficam alternando entre si (idioma ↔ módulo, idioma ↔ perfil). |
| 8 | **+** → **Buscar Usuário** → abra o perfil da **própria** Conta A → "Inglês do Roteiro" → módulo "Saudações" → **Nova Frase** → seta de voltar no topo, sem preencher nada. | Volta ao módulo "Saudações". |
| 9 | No módulo, clique em **Voltar**; no idioma, clique em **Voltar**. | Volta ao "Inglês do Roteiro" e depois ao **perfil público da Conta A**: a origem sobreviveu à passagem pelo cadastro de frase. |
| 10 | No perfil, clique em **Voltar**. | `/buscar-usuario`. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### U-11 · Copiar ID no Perfil e na visualização de usuário

**Pré-condição:** Conta A logada.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Avatar → **Perfil**. | Badge com o código `USR-…` da Conta A (anote como `USR_A`). O botão **Voltar** tem espaço abaixo dele e não encosta no conteúdo. |
| 2 | Clique no badge do código. | O texto vira **"ID copiado!"**, em verde, por cerca de 2 segundos, e volta ao código. |
| 3 | Cole (Ctrl+V) num campo de texto qualquer. | Cola exatamente o `USR-…` exibido. |
| 4 | Leve o foco ao badge com Tab e pressione **Enter**; depois, **Espaço**. | Copia nas duas teclas, e o Espaço **não** rola a página. |
| 5 | Abra o perfil público da Conta B (**Buscar Usuário**) e clique em **ID: USR-…**. | Mostra "ID copiado!" com um ícone de confirmação; ao colar, sai o `USR_B`. |
| 6 | Repita o teste de teclado (Tab + Enter e Espaço) no ID da Conta B. | Mesmo comportamento. |
| 7 | Na página de qualquer idioma, clique em **ID Idioma: IDM-…**. | Toast "ID do Idioma copiado para a área de transferência!"; ao colar, sai o `IDM-…`. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### U-12 · Topbar: nome, tema e sons

**Pré-condição:** Conta A logada.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Observe a topbar. | Logo branca e o nome **Ana**: só a primeira palavra do nome, com inicial maiúscula. |
| 2 | Clique no botão de tema. | Alterna entre claro e escuro, e o ícone do botão continua **branco e visível** sobre a barra azul nos dois temas. Recarregue: o tema escolhido se mantém. |
| 3 | Clique no botão de som (alto-falante). | Ao ligar, toca uma amostra curta; ao desligar, nada toca. O título do botão alterna entre "Ativar sons" e "Desativar sons". Recarregue: a escolha se mantém. |
| 4 | Com o som desligado, jogue uma frase até o fim da rodada. | Nenhum som ao verificar, continuar ou concluir. Deixe o som como preferir. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

---

## 2. Administrador

> Os casos A-04 a A-11 mandam e-mail para a **Conta B**, e só para ela. Confira o aviso da
> [seção 0.2](#02-contas) antes de começar.

### A-00 · Preparação: denúncias feitas pela Conta A

**Pré-condição:** Conta A logada.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Abra o "Espanhol do Roteiro" → **Denunciar**, marque **Frases Inapropriadas** e clique em **Enviar Denúncia**. | Toast "Obrigado por sua colaboração! A moderação verificará e agirá assim que possível." |
| 2 | Abra o "Descartável 1" → **Denunciar** e marque **Outros (descreva)**. | **Enviar Denúncia** só habilita depois de preencher a Descrição. Envie com `Teste do roteiro`. |
| 3 | Saia. | — |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### A-01 · Topbar do administrador sem "Perfil"

**Pré-condição:** nenhuma sessão aberta.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Entre com `admin@crow.com`. | `/controle-adm`, "Controle Administrativo", com as abas Denúncias, Usuários, Idiomas e Logs. |
| 2 | Clique no avatar. | O menu mostra **só "Sair"**, sem "Perfil". |
| 3 | Digite `localhost:4200/perfil` na barra de endereço; depois, `localhost:4200/home`. | As duas voltam para `/controle-adm`. |
| 4 | Clique no logo da topbar. | Continua em `/controle-adm`. |
| 5 | Troque o tema e observe a topbar e a aba Denúncias. | Nome, botões da topbar e cards legíveis nos dois temas. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### A-02 · Lista de usuários sem administradores, com filtros de situação

**Pré-condição:** admin logado.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Aba **Usuários**. | Cards das contas comuns, incluindo Ana e Bruno; **nenhum** administrador. |
| 2 | Busque `admin@crow.com`. | "Nenhum usuário encontrado". |
| 3 | Observe os filtros. | Três chips: **Ativos**, **Suspensos** e **Desativados**. Não existe "Todos". |
| 4 | Clique em **Ativos**. | O chip fica marcado e a lista mostra só contas ativas, entre elas Ana e Bruno. |
| 5 | Clique em **Ativos** de novo. | O chip desmarca e a lista completa volta. |
| 6 | Marque **Suspensos** e **Desativados** ao mesmo tempo. | Aparecem as contas nessas duas situações, se houver; Ana e Bruno somem. Desmarque os dois. |
| 7 | Busque por `Bruno`, depois pelo `USR_B` e depois pelo `<EMAIL_B>`. | O card da Conta B aparece nas três buscas, com **ID: USR-…** e os botões **Visualizar usuário**, **Enviar e-mail ao usuário** e **Desativar ou suspender conta**. |
| 8 | Em 375 px e nos dois temas, confira os chips e o card da Conta B. | Os três chips numa linha só; os botões do card numa faixa no rodapé do card, sem cobrir o texto nem o badge de status. |

O comportamento dos chips com a Conta B em cada situação é conferido nos casos A-04 e A-06.

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### A-03 · Detalhes do usuário, somente leitura

**Pré-condição:** admin logado, aba Usuários.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | No card da Conta B, clique no olho (**Visualizar usuário**). | Modal "Detalhes do Usuário". |
| 2 | Confira os campos. | ID do Usuário, Nome, E-mail, Data de entrada, Status (badge **Ativo**) e Quantidade de idiomas **3**: aqui o idioma privado também conta. **Não** aparecem telefone, senha nem papel (role). |
| 3 | Tente clicar e digitar sobre os valores. | Nada é editável: não há nenhum campo de formulário. |
| 4 | Observe o rodapé. | **Fechar**, **Enviar e-mail** e **Desativar / Suspender**. **Fechar** fecha o modal. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### A-04 · Desativar por tempo indeterminado

**Pré-condição:** admin logado, aba Usuários; Conta B ativa.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | No card da Conta B, clique em **Desativar ou suspender conta**. | Modal "Desativar / Suspender Conta", com "Como a conta deve ficar?" e duas opções: **Desativar por tempo indeterminado** e **Suspender temporariamente**. |
| 2 | Escolha **Desativar por tempo indeterminado**. | Nenhum campo de data. O aviso diz que o usuário receberá um e-mail em `<EMAIL_B>` informando a desativação. O botão de confirmação é **Desativar Conta**. |
| 3 | Justificativa: `Teste do roteiro: desativação.` | O contador "N/1000 caracteres" acompanha a digitação. |
| 4 | Clique em **Desativar Conta**. | "Aplicando..." e o modal fecha; toast `Conta de "Bruno Roteiro" desativada por tempo indeterminado.` |
| 5 | Confira o card. | Badge **Desativado**, a linha "Desativada por tempo indeterminado" e, no lugar do botão vermelho, o botão verde **Reativar conta**. |
| 6 | Marque só o chip **Desativados**; depois, só **Ativos**. | A Conta B aparece em Desativados e **não** aparece em Ativos. |
| 7 | Abra os detalhes (olho). | Status **Desativado**, "Justificativa registrada: Teste do roteiro: desativação.", "Última alteração de status" com data e hora e **Reativar conta** no rodapé. Feche. |
| 8 | Confira a caixa da Conta B. | E-mail **Crow - Sua conta foi desativada**: "Olá, Bruno!", o aviso de desativação, "Motivo informado:" seguido da justificativa, "Seu progresso e os conteúdos que você criou continuam guardados." e a assinatura "Equipe Crow". |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### A-05 · Reativar manualmente, pelo card

**Pré-condição:** Conta B desativada (A-04).

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | No card da Conta B, clique em **Reativar conta**. | Modal "Reativar Conta" com o nome e o ID, o texto "A conta está desativada por tempo indeterminado. Ao confirmar, o usuário volta a acessar a plataforma normalmente." e o aviso do e-mail. |
| 2 | Clique em **Reativar Conta**. | "Reativando..." e toast `Conta de "Bruno Roteiro" reativada com sucesso!`. O card volta a **Ativo**, com o botão **Desativar ou suspender conta**. |
| 3 | Confira a caixa da Conta B. | E-mail **Crow - Sua conta foi reativada**, com "…você já pode acessar a plataforma normalmente." |
| 4 | Na janela anônima, entre como Conta B. | O login funciona. Saia. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### A-06 · Suspender com data futura e reativar pelos detalhes

**Pré-condição:** Conta B ativa.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Card da Conta B → **Desativar ou suspender conta** → **Suspender temporariamente**. | Aparece "Data e hora da reativação automática *"; **Suspender Conta** fica desabilitado enquanto não houver data. |
| 2 | Digite uma data e hora já passadas (ex.: ontem às 10:00). | "A data e hora de reativação precisam estar no futuro." e o botão continua desabilitado. O calendário do campo não oferece horários passados: digite a data. |
| 3 | Escolha **amanhã às 10:00** e deixe a justificativa vazia. | Resumo "A conta será reativada automaticamente em dd/MM/yyyy às 10:00."; o aviso de e-mail fala em "suspensão temporária". |
| 4 | Clique em **Suspender Conta**. | Toast `Conta de "Bruno Roteiro" suspensa até dd/MM/yyyy às 10:00.` |
| 5 | Confira o card e os chips. | Badge âmbar **Suspenso** e a linha "Reativação prevista: dd/MM/yyyy às 10:00". A Conta B aparece no chip **Suspensos** e não aparece em **Ativos** nem em **Desativados**. |
| 6 | Confira a caixa da Conta B. | E-mail **Crow - Sua conta foi suspensa temporariamente**, com o motivo padrão "A decisão foi tomada pela equipe de moderação após a análise da sua conta." e "Previsão de reativação: dd/MM/yyyy às 10:00." |
| 7 | Abra os detalhes (olho). | "Reativação automática prevista: …" e **Reativar conta** no rodapé. |
| 8 | Nos detalhes, clique em **Reativar conta**. | Os detalhes fecham e abre "Reativar Conta" com "A conta está suspensa com reativação automática prevista para … Ao confirmar, ela volta a ficar ativa agora." |
| 9 | Clique em **Reativar Conta**. | Toast de reativação, card **Ativo** e, na caixa da Conta B, o e-mail **Crow - Sua conta foi reativada**. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### A-07 · Reativação automática

**Pré-condição:** Conta B ativa; terminal da API à vista.

A API procura suspensões vencidas **ao subir** e depois **a cada 5 minutos**. Como a tela só
aceita datas futuras, há duas formas de forçar o teste. Execute uma delas e anote qual nas
observações.

**Caminho 1: sem mexer no banco (de 3 a 7 minutos)**

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Suspenda a Conta B com data e hora = **agora + 2 minutos**. | Card **Suspenso** com "Reativação prevista: …". |
| 2 | Espere o horário passar e tente entrar como Conta B. | "Conta suspensa temporariamente. A reativação automática está em andamento; tente novamente em alguns minutos." Se a verificação automática já tiver passado nesse meio-tempo, o login entra direto: siga para o passo 4. |
| 3 | Force a verificação: no terminal da API, Ctrl+C e `./mvnw spring-boot:run` de novo. Ou espere até 5 minutos. | No console da API, `Reativação automática: 1 conta(s) com suspensão vencida` e `Reativação automática: conta USR-… reativada`. |
| 4 | Recarregue o `/controle-adm` (F5) e abra a aba Usuários. | Conta B **Ativo**. A lista só muda depois de recarregar. |
| 5 | Confira a caixa da Conta B. | E-mail **Crow - Sua conta foi reativada**. |
| 6 | Entre como Conta B. | O login funciona. |

**Caminho 2: ajustando a data no banco (imediato)**

1. Suspenda a Conta B com qualquer data futura (ex.: amanhã às 10:00).
2. No psql ou no pgAdmin, conectado ao `crow_db`, execute:

   ```sql
   UPDATE usuarios
      SET suspenso_ate = LOCALTIMESTAMP - INTERVAL '1 day'
    WHERE email = '<EMAIL_B>'
      AND status = 'INATIVO'
      AND suspenso_ate IS NOT NULL;

   SELECT codigo, status, suspenso_ate FROM usuarios WHERE email = '<EMAIL_B>';
   ```

   O `UPDATE` deve afetar 1 linha. O prazo vai para um dia atrás, e não para um minuto atrás,
   para o teste não depender do fuso horário configurado no banco.
3. Siga os passos 2 a 6 do Caminho 1. No log, "prazo vencido em" mostra a data ajustada.

**Resultado**
- [ ] OK
- [ ] Falhou — observações (caminho usado):

### A-08 · E-mail avulso

**Pré-condição:** admin logado, aba Usuários; Conta B ativa.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | No card da Conta B, clique no envelope (**Enviar e-mail ao usuário**). | Modal "Enviar E-mail" com a faixa DESTINATÁRIO (nome, e-mail e ID), os campos Assunto e Mensagem com contadores (0/150 e 0/5000) e **Enviar** desabilitado. |
| 2 | Preencha só o Assunto; depois, apague-o e preencha só a Mensagem. | **Enviar** continua desabilitado nos dois casos. |
| 3 | Preencha os dois, clique em **Cancelar** e abra o modal de novo. | Os campos voltam vazios. |
| 4 | Assunto `Teste do roteiro`; Mensagem em duas linhas (`Linha 1`, Enter, `Linha 2`). Clique em **Enviar**. | "Enviando..." e toast `E-mail para "Bruno Roteiro" enviado com sucesso!` |
| 5 | Confira a caixa da Conta B. | E-mail **Crow - Teste do roteiro**: "Olá, Bruno!", as duas linhas com a quebra preservada, "Esta mensagem foi enviada pela equipe de moderação do Crow. Se precisar de mais informações, responda a este e-mail." e a assinatura. Acentos corretos. |
| 6 | Abra os detalhes da Conta B e clique em **Enviar e-mail**. | Os detalhes fecham e abre o mesmo modal para a Conta B. Cancele. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### A-09 · Visualização de idioma sem edição

**Pré-condição:** admin logado.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Aba **Idiomas**. | Aparecem os idiomas públicos **e** os privados (inclusive o "Descartável 2"). Cada card tem **só** dois botões, o olho (**Visualizar idioma**) e a lixeira (**Excluir idioma**), sem lápis de edição. |
| 2 | Clique no olho do "Inglês do Roteiro", da Conta A. | `/visualizar-idioma-adm?id=IDM-…`, com o selo "Visualização de moderação · somente leitura", os dados (ID do idioma, Proprietário com `USR-…`, Proficiência, Visibilidade, Avaliação, Conteúdo "3 módulos · 5 frases", Criado em, Última atualização) e a seção Módulos. |
| 3 | Clique em **Expandir todos**. | Os três módulos abrem e o botão vira **Recolher todos**. As frases aparecem na ordem do dono, com o conteúdo de cada modo: na tradução, "Respostas também aceitas" com `How are you? Good morning`; os pares; o quiz, com o vídeo. |
| 4 | Procure controles de edição. | **Nenhum**: sem setas de ordem, sem editar ou excluir módulo ou frase, sem "Nova Frase" e sem "Adicionar Módulo". A única ação da página é **Excluir idioma**. |
| 5 | Clique em **Voltar ao controle**. | `/controle-adm?aba=idiomas`, já na aba Idiomas. |
| 6 | Repita os passos 2 e 3 em 375 px e no outro tema. | Página legível e sem rolagem horizontal; frases e vídeo cabem na largura. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### A-10 · Exclusão de idioma com mensagem personalizada

**Pré-condição:** admin logado, aba Idiomas.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Clique na lixeira do "Descartável 1". | Modal "Excluir Idioma" com nome e ID, o alerta de que a ação é irreversível e remove todos os módulos e frases, o campo "Mensagem ao proprietário (opcional)" com contador 0/1000 e o aviso de que o proprietário receberá um e-mail. |
| 2 | Mensagem: `Removido no teste do roteiro.`; clique em **Excluir Idioma**. | "Excluindo..." e toast `Idioma "Descartável 1" excluído. O proprietário foi avisado por e-mail.`; o card some. |
| 3 | Confira a caixa da Conta B. | E-mail **Crow - Um idioma que você criou foi removido**, com `o idioma "Descartável 1", criado por você, foi removido do Crow pela equipe de moderação`, "Motivo informado: Removido no teste do roteiro." e "Sua conta continua ativa…". |
| 4 | Na janela anônima, entre como Conta B. | O "Descartável 1" não aparece mais na home. Saia. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### A-11 · Exclusão de idioma sem mensagem, pela página de visualização

**Pré-condição:** admin logado, aba Idiomas.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Clique no olho do "Descartável 2" (privado). | A página de visualização abre normalmente. |
| 2 | Clique em **Excluir idioma**. | O mesmo modal do A-10, agora com a contagem de módulos e de frases no alerta. |
| 3 | Deixe a mensagem vazia e confirme. | A página troca o conteúdo por "Idioma excluído", "O proprietário recebe o aviso por e-mail em segundo plano." e o botão **Voltar para a aba de idiomas**; aparece o toast de exclusão. |
| 4 | Confira a caixa da Conta B. | E-mail com o mesmo assunto e "Motivo informado: O conteúdo não atendia às diretrizes de uso da plataforma." |
| 5 | Clique em **Voltar para a aba de idiomas**. | Aba Idiomas sem o "Descartável 2". |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### A-12 · Acesso rápido ao idioma e ao denunciante pela denúncia

**Pré-condição:** admin logado; denúncias do A-00; "Descartável 1" já excluído (A-10).

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Aba **Denúncias**. | As duas denúncias da Conta A: a do "Espanhol do Roteiro", com o código do idioma no card, e a do idioma excluído, com "ID: —". |
| 2 | Clique na denúncia do "Espanhol do Roteiro". | Modal "Detalhes da Denúncia" com ID da Denúncia (`DEN-…`), Idioma "Espanhol do Roteiro (IDM-…)", Denunciante "Ana Roteiro (USR-…)", tipos e status. No fim, o bloco **Acesso rápido**, com **Ver idioma denunciado** e **Ver denunciante**, cada um com o ícone de nova aba. |
| 3 | Clique em **Ver idioma denunciado**. | Abre **em nova aba** `/visualizar-idioma-adm?id=IDM-…`, com o "Espanhol do Roteiro". Feche a aba. |
| 4 | Clique em **Ver denunciante**. | Nova aba em `/controle-adm?aba=usuarios&usuario=USR-…`: aba Usuários, com a busca preenchida pelo código e os "Detalhes do Usuário" da Ana já abertos. Feche a aba. |
| 5 | No modal da denúncia, mude o status para **Analisando**. | Toast "Status da denúncia atualizado com sucesso!"; o card passa a "Analisando" e mostra o responsável, "Administrador". |
| 6 | Abra a denúncia do idioma excluído. | "Idioma removido" no lugar do nome. **Ver idioma denunciado** fica esmaecido, não navega ao ser clicado, não recebe foco com Tab e mostra "Idioma não está mais disponível" ao passar o mouse. **Ver denunciante** continua funcionando. |
| 7 | Em 375 px, abra o modal de novo. | Os dois botões de acesso rápido ficam empilhados, sem texto cortado. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### A-13 · Conferência dos logs

**Pré-condição:** A-04 a A-12 executados; admin logado.

Na aba **Logs**, localize cada registro abaixo. Os mais recentes ficam no topo; use os chips de
tipo e a busca. Cada card mostra o código `LOG-…`, a ação, a data, os detalhes, as linhas
"Usuário afetado" e "Idioma afetado" (quando houver), o responsável e o tipo.

| # | Origem | Chip | Ação no card | Afetado(s) | Detalhes | Responsável | Conferido |
|---|---|---|---|---|---|---|---|
| 1 | A-04 | Moderação | Desativou conta de usuário | Usuário: Bruno Roteiro (`USR_B`) | modalidade: por tempo indeterminado; justificativa: Teste do roteiro: desativação. | Administrador (`USR-…`) | [ ] |
| 2 | A-05 | Moderação | Reativou conta de usuário | Usuário: Bruno Roteiro | modalidade: manual; justificativa: não informada | Administrador | [ ] |
| 3 | A-06 | Moderação | Suspendeu conta de usuário | Usuário: Bruno Roteiro | modalidade: temporária; reativação prevista: dd/MM/yyyy às 10:00; justificativa: não informada | Administrador | [ ] |
| 4 | A-06, reativação pelos detalhes | Moderação | Reativou conta de usuário | Usuário: Bruno Roteiro | modalidade: manual; justificativa: não informada | Administrador | [ ] |
| 5 | A-07, suspensão | Moderação | Suspendeu conta de usuário | Usuário: Bruno Roteiro | modalidade: temporária; reativação prevista: … | Administrador | [ ] |
| 6 | A-07, reativação | Moderação | Reativou conta de usuário | Usuário: Bruno Roteiro | origem: sistema; modalidade: automática; motivo: fim da suspensão temporária; prazo vencido em: … | **Sistema — ação automática** | [ ] |
| 7 | A-08 | E-mails | Enviou e-mail a usuário | Usuário: Bruno Roteiro | destinatário: `<EMAIL_B>`; assunto: Teste do roteiro. **Nenhum** trecho da mensagem. | Administrador | [ ] |
| 8 | A-10 | Idiomas | Excluiu idioma | Usuário: Bruno Roteiro; Idioma: Descartável 1 (`IDM-…`) | aviso ao proprietário: mensagem personalizada | Administrador | [ ] |
| 9 | A-11 | Idiomas | Excluiu idioma | Usuário: Bruno Roteiro; Idioma: Descartável 2 (`IDM-…`) | aviso ao proprietário: mensagem padrão | Administrador | [ ] |
| 10 | A-12 | Denúncias | Alterou status de denúncia | Idioma: Espanhol do Roteiro (`IDM_B`) | denúncia: DEN-…; status anterior: pendente; novo status: analisando | Administrador | [ ] |

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Marque só o chip **Moderação**. | Só aparecem registros de moderação, entre eles as linhas 1 a 6 da tabela; nenhum de e-mail, idioma ou denúncia. |
| 2 | Marque também **E-mails**. | Somam-se os registros de e-mail, entre eles o da linha 7. |
| 3 | Desmarque os chips e busque pelo `USR_B`. | Aparecem os registros que afetaram a Conta B (linhas 1 a 9). |
| 4 | Busque `Descartável`. | Linhas 8 e 9. |
| 5 | Observe o selo de tipo nos cards. | O tipo aparece em texto legível: moderação, e-mail, idioma, denúncia. |
| 6 | Preencha Data inicial e Data final com a data de hoje. | Os registros de hoje continuam na lista; os de outros dias somem. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

---

## 3. Segurança

### S-00 · Preparação das chamadas à API

Use o **Git Bash**: no PowerShell 5.1, `curl` é o apelido de outro comando e as aspas do JSON
quebram. Cole o bloco abaixo, trocando os valores entre `< >` pelos anotados na
[seção 0.3](#03-dados-usados-pelos-casos):

```bash
API=http://localhost:8080/api
JSON='Content-Type: application/json'

# Faz login e devolve só o token JWT.
obter_token() {
  curl -s -X POST "$API/auth/login" -H "$JSON" \
    -d "{\"email\":\"$1\",\"senha\":\"$2\"}" | sed -E 's/.*"token":"([^"]+)".*/\1/'
}
# Mostra o corpo da resposta seguido do código HTTP.
chamar() { curl -s -w "\nHTTP %{http_code}\n\n" "$@"; }

TOKEN_ADMIN=$(obter_token admin@crow.com admin123)
TOKEN_A=$(obter_token '<EMAIL_A>' Roteiro123)
USR_B='<USR_B>'
IDM_B='<IDM_B>'
MOD_B='<MOD_B>'

echo "${TOKEN_ADMIN:0:10}  ${TOKEN_A:0:10}"
```

**Esperado:** o `echo` mostra o começo de dois tokens, ambos iniciados por `eyJ`. Se aparecer
um trecho de JSON com `message`, o login falhou: confira e-mail e senha.

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### S-01 · Administrador não edita usuário, idioma nem módulo alheio

**Pré-condição:** S-00 feito; Conta B ativa.

```bash
# 1. Editar usuário pela rota administrativa, que não existe mais
chamar -X PUT "$API/admin/usuarios/$USR_B" -H "Authorization: Bearer $TOKEN_ADMIN" -H "$JSON" \
  -d '{"nome":"Editado pelo admin","email":"outro@exemplo.com","telefone":"63900000000","role":"ADMIN"}'

# 2. Editar usuário pela rota pública
chamar -X PUT "$API/usuarios/$USR_B" -H "Authorization: Bearer $TOKEN_ADMIN" -H "$JSON" \
  -d '{"nome":"Editado pelo admin","email":"outro@exemplo.com"}'

# 3. Conferir que o cadastro não mudou
chamar "$API/admin/usuarios/$USR_B" -H "Authorization: Bearer $TOKEN_ADMIN"

# 4. Editar idioma pela rota administrativa, que não existe mais
chamar -X PUT "$API/admin/idiomas/$IDM_B" -H "Authorization: Bearer $TOKEN_ADMIN" -H "$JSON" \
  -d '{"nome":"Editado pelo admin","idioma":"Espanhol"}'

# 5. Editar idioma pela rota comum
chamar -X PUT "$API/idiomas/$IDM_B" -H "Authorization: Bearer $TOKEN_ADMIN" -H "$JSON" \
  -d '{"nome":"Editado pelo admin","idioma":"Espanhol"}'

# 6. Criar módulo no idioma da Conta B
chamar -X POST "$API/idiomas/$IDM_B/modulos" -H "Authorization: Bearer $TOKEN_ADMIN" -H "$JSON" \
  -d '{"nome":"Modulo do admin","icone":""}'

# 7. Criar frase num módulo da Conta B
chamar -X POST "$API/modulos/$MOD_B/frases" -H "Authorization: Bearer $TOKEN_ADMIN" -H "$JSON" \
  -d '{"modo":"TRADUCAO","traducaoCompleta":"Frase do admin"}'
```

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Chamada 1: `PUT /api/admin/usuarios/{USR_B}` | `HTTP 405`. |
| 2 | Chamada 2: `PUT /api/usuarios/{USR_B}` | `HTTP 405`. |
| 3 | Chamada 3: `GET /api/admin/usuarios/{USR_B}` | `HTTP 200` com `"nome":"Bruno Roteiro"`, o `<EMAIL_B>` original e `"role":"comum"`, sem campo `telefone`. |
| 4 | Chamada 4: `PUT /api/admin/idiomas/{IDM_B}` | `HTTP 405`. |
| 5 | Chamada 5: `PUT /api/idiomas/{IDM_B}` | `HTTP 403` com a mensagem "Administradores não podem alterar conteúdo de outros usuários: o papel administrativo é de moderação, não de edição". |
| 6 | Chamada 6: `POST /api/idiomas/{IDM_B}/modulos` | `HTTP 403`, com a mesma mensagem. |
| 7 | Chamada 7: `POST /api/modulos/{MOD_B}/frases` | `HTTP 403`, com a mesma mensagem. |
| 8 | Como Conta A, abra o "Espanhol do Roteiro". | Nome, módulos e frases iguais aos de antes: nada de "Editado pelo admin" nem de "Modulo do admin". |
| 9 | Como admin, abra a aba Logs. | Três registros com o selo **Bloqueada**: "Tentou editar idioma de outro usuário", "Tentou criar módulo em idioma de outro usuário" e "Tentou criar frase em idioma de outro usuário". Todos com tipo idioma, detalhes "resultado: bloqueada; motivo: administrador não edita conteúdo de outros usuários", Usuário afetado Bruno Roteiro e Idioma afetado Espanhol do Roteiro. As chamadas com 405 não geram log, porque a rota não existe. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### S-02 · Administrador não cria, importa, avalia nem denuncia idiomas

**Pré-condição:** S-00 feito.

```bash
chamar -X POST "$API/idiomas" -H "Authorization: Bearer $TOKEN_ADMIN" -H "$JSON" \
  -d '{"nome":"Idioma do admin","idioma":"Espanhol","visibilidade":"PUBLICO"}'
chamar -X POST "$API/idiomas/$IDM_B/importar" -H "Authorization: Bearer $TOKEN_ADMIN"
chamar -X POST "$API/idiomas/$IDM_B/avaliar" -H "Authorization: Bearer $TOKEN_ADMIN" -H "$JSON" -d '{"nota":5}'
chamar -X POST "$API/idiomas/$IDM_B/denunciar" -H "Authorization: Bearer $TOKEN_ADMIN" -H "$JSON" \
  -d '{"tiposJson":"[\"outros\"]","descricao":"Denuncia do admin"}'
```

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | As quatro chamadas. | `HTTP 403` em todas, com a mensagem "Administradores não criam, importam, avaliam nem denunciam idiomas: o papel administrativo é de moderação". |
| 2 | Como admin, abra a aba Idiomas e a visualização do "Espanhol do Roteiro" (olho). | Nenhum "Idioma do admin" e nenhuma cópia do "Espanhol do Roteiro"; a Avaliação do "Espanhol do Roteiro" continua com o mesmo número de avaliações. |
| 3 | Abra a aba Denúncias. | Nenhuma denúncia nova. |
| 4 | Abra a aba Logs. | Quatro registros com o selo **Bloqueada**: "Tentou criar idioma", "Tentou importar idioma", "Tentou avaliar idioma" e "Tentou denunciar idioma", com "motivo: administrador não cria nem interage com conteúdo". Os três últimos têm Idioma afetado Espanhol do Roteiro e Usuário afetado Bruno Roteiro. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### S-03 · Rotas administrativas com token de usuário comum

**Pré-condição:** S-00 feito; Conta B ativa.

```bash
chamar "$API/admin/usuarios" -H "Authorization: Bearer $TOKEN_A"
chamar -X PUT "$API/admin/usuarios/$USR_B/status" -H "Authorization: Bearer $TOKEN_A" -H "$JSON" \
  -d '{"acao":"DESATIVAR"}'
chamar "$API/admin/logs" -H "Authorization: Bearer $TOKEN_A"
chamar "$API/admin/usuarios"
```

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | As três primeiras chamadas, com o token da Conta A. | `HTTP 403` nas três, sem dados de usuários nem de logs no corpo. |
| 2 | A última chamada, sem token. | `HTTP 403`. |
| 3 | Como admin, abra a aba Usuários. | A Conta B continua **Ativo**: a tentativa não teve efeito. |
| 4 | Logado como Conta A, abra `localhost:4200/controle-adm` e depois `localhost:4200/visualizar-idioma-adm?id=<IDM_B>`. | As duas redirecionam para `/home`. |
| 5 | Sem sessão (depois de **Sair**), abra `localhost:4200/controle-adm`. | Redireciona para `/login`. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### S-04 · Login com conta desativada e com conta suspensa

**Pré-condição:** admin logado numa janela; janela anônima livre para a Conta B. Este caso
envia quatro e-mails à Conta B.

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | Como admin, desative a Conta B por tempo indeterminado, com a justificativa `Motivo interno do teste`. | Card **Desativado**. |
| 2 | Na janela anônima, entre como Conta B com a senha **errada**. | "Email ou senha incorretos": sem a senha certa, a situação da conta **não** aparece. |
| 3 | Entre como Conta B com a senha certa. | Login recusado com "Conta desativada. Entre em contato com a equipe de moderação.", sem mostrar a justificativa. |
| 4 | Como admin, reative a Conta B e suspenda-a até **amanhã às 10:00**. | Card **Suspenso**. |
| 5 | Entre como Conta B com a senha certa. | Recusado com "Conta suspensa temporariamente. Previsão de reativação: dd/MM/yyyy às 10:00." |
| 6 | Opcional, pela API: `chamar -X POST "$API/auth/login" -H "$JSON" -d '{"email":"<EMAIL_B>","senha":"Roteiro123"}'` | `HTTP 403` com a mesma mensagem e nenhum token no corpo. |
| 7 | Como admin, reative a Conta B e entre com ela. | O login volta a funcionar. |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

### S-05 · IDs numéricos recusados e dados sensíveis fora das respostas

**Pré-condição:** S-00 feito.

```bash
chamar "$API/idiomas/1" -H "Authorization: Bearer $TOKEN_A"
chamar "$API/usuarios/1" -H "Authorization: Bearer $TOKEN_A"
chamar "$API/idiomas/1/modulos" -H "Authorization: Bearer $TOKEN_A"
chamar "$API/idiomas/$IDM_B" -H "Authorization: Bearer $TOKEN_A"
chamar "$API/usuarios/$USR_B" -H "Authorization: Bearer $TOKEN_A"
chamar "$API/usuarios/me" -H "Authorization: Bearer $TOKEN_A"
```

| # | Passo | Resultado esperado |
|---|---|---|
| 1 | `GET /api/idiomas/1` | `HTTP 404` "Idioma não encontrado": um id numérico não abre mais nenhum idioma. |
| 2 | `GET /api/usuarios/1` | `HTTP 404` "Usuário não encontrado". |
| 3 | `GET /api/idiomas/1/modulos` | `HTTP 404` "Idioma não encontrado". |
| 4 | `GET /api/idiomas/{IDM_B}` | `HTTP 200` com `"codigo":"IDM-…"` e `"codigoCriador":"USR-…"`, **sem** os campos `id` e `criadorId`. |
| 5 | `GET /api/usuarios/{USR_B}` | `HTTP 200` só com `codigo`, `nome`, `dataEntrada` e `quantidadeIdiomas`: sem e-mail, telefone, papel ou status. |
| 6 | `GET /api/usuarios/me` | `HTTP 200` com os dados da própria Conta A, **sem** o campo `id`. |
| 7 | Navegue pelo app como Conta A, observando a barra de endereço. | Usuários e idiomas aparecem na URL só como `USR-…` e `IDM-…`. Módulos ainda usam número (ver [limitações conhecidas](#limitações-conhecidas)). |

**Resultado**
- [ ] OK
- [ ] Falhou — observações:

---

## 4. Responsividade e tema

### R-01 · Passada de 375 px e dos dois temas nas telas alteradas

**Pré-condição:** dados dos casos anteriores criados. A home, a aba Usuários do controle e a
visualização de idioma do admin já foram conferidas nos casos U-05, A-02 e A-09.

Em cada célula, confira: nada ilegível (texto escuro sobre fundo escuro ou claro sobre claro),
nenhuma rolagem horizontal, botões, campos e modais inteiros dentro da tela, e ícones visíveis.

| Tela | O que abrir | Desktop claro | Desktop escuro | 375 px claro | 375 px escuro |
|---|---|---|---|---|---|
| Login | `/login`, com o botão de tema e o rodapé | [ ] | [ ] | [ ] | [ ] |
| Cadastro | `/cadastrar-usuario`, com o bloco do código de verificação aberto | [ ] | [ ] | [ ] | [ ] |
| Termos e Política | `/termos-de-uso` e `/politica-de-privacidade` | [ ] | [ ] | [ ] | [ ] |
| Recuperar senha | `/recuperar-senha`, etapas 1 e 2 | [ ] | [ ] | [ ] | [ ] |
| Topbar | Conta comum e admin, com o menu do avatar aberto | [ ] | [ ] | [ ] | [ ] |
| Cadastrar idioma | As três etapas e o modal "Sair do Cadastro" | [ ] | [ ] | [ ] | [ ] |
| Visualizar idioma, dono | Setas, "Última atualização" e os modais "Adicionar Módulo" e "Como deseja estudar?" | [ ] | [ ] | [ ] | [ ] |
| Visualizar idioma, visitante | Botões Denunciar, Avaliar e Importar e o modal de denúncia | [ ] | [ ] | [ ] | [ ] |
| Visualizar módulo | Setas das frases, cards de frase e modal de edição | [ ] | [ ] | [ ] | [ ] |
| Cadastrar frase | Formulário e modal "Cancelar Cadastro" | [ ] | [ ] | [ ] | [ ] |
| Jogar | Cabeçalho com "Cancelar rodada", modal de cancelamento, modal de resultado e tela final | [ ] | [ ] | [ ] | [ ] |
| Buscar idioma | Com os três menus de filtro abertos | [ ] | [ ] | [ ] | [ ] |
| Buscar usuário | Lista e busca | [ ] | [ ] | [ ] | [ ] |
| Visualizar usuário | ID copiável e lista de idiomas | [ ] | [ ] | [ ] | [ ] |
| Perfil | Badge do código e bloco "Alterar Senha" | [ ] | [ ] | [ ] | [ ] |
| Controle: Denúncias | Cards e modal com "Acesso rápido" | [ ] | [ ] | [ ] | [ ] |
| Controle: modais de usuário | "Detalhes do Usuário", "Desativar / Suspender Conta" (com a data), "Reativar Conta" e "Enviar E-mail" | [ ] | [ ] | [ ] | [ ] |
| Controle: Idiomas | Cards e modal "Excluir Idioma" | [ ] | [ ] | [ ] | [ ] |
| Controle: Logs | Chips de tipo, card com afetados, selo "Bloqueada" e "Sistema — ação automática" | [ ] | [ ] | [ ] | [ ] |

**Resultado**
- [ ] OK
- [ ] Falhou — observações (tela, tema e largura):

---

## Limitações conhecidas

Comportamentos atuais, já conhecidos e ainda não tratados. Não marque um caso como falho por
causa deles.

1. **Sessão aberta continua valendo.** Desativar ou suspender uma conta bloqueia o próximo login,
   mas quem já estava logado continua navegando até o token expirar (24 h).
2. **A lista de usuários do admin não se atualiza sozinha.** Depois da reativação automática, o
   status novo só aparece ao recarregar a página.
3. **Conta desativada ou suspensa só oferece "Reativar" na tela.** Converter uma suspensão em
   desativação, ou mudar o prazo, não está disponível.
4. **"Enviado com sucesso" quer dizer "aceito pela API".** O envio acontece em segundo plano; se o
   SMTP falhar, o erro aparece só no console da API (`Falha ao enviar e-mail…`).
5. **Home até 768 px:** o botão (i) não tem efeito visível, porque as informações do card já
   ficam abertas.
6. **Termos de Uso e Política de Privacidade** mostram os marcadores `[PREENCHER]` (e-mail de
   contato e comarca do foro), à espera do texto definitivo.
7. **Os filtros da busca de idiomas não ficam na URL:** ao voltar para a busca, eles são zerados.
8. **Rodada:** o tempo continua contando enquanto o modal "Cancelar rodada" está aberto.
9. **Recuperação de senha:** o **Voltar** da etapa 3 leva a uma etapa 2 cujo código já foi usado;
   para seguir, é preciso **Reenviar código**.
10. **Módulos, frases e logs ainda usam o id numérico:** na URL (`visualizar-modulo?id=…`,
    `cadastrar-frase?moduloId=…` e a lista `modulos` do jogo) e nos códigos `MOD-`, `FRS-` e
    `LOG-`, derivados do id. É a Fase 3, fora desta rodada.
11. **Reordenar não confirma o sucesso:** só o erro gera aviso; a própria lista já mostra a nova
    ordem.
12. **Favicon** com pouco contraste na aba do navegador.

## Apêndice: e-mails esperados

| Situação | Assunto | O que o corpo deve conter |
|---|---|---|
| Código de verificação (cadastro e recuperação de senha) | Crow - Código de Verificação | Código de 6 dígitos e "Este código expira em 10 minutos." |
| Conta desativada | Crow - Sua conta foi desativada | "Motivo informado:" com a justificativa ou o texto padrão da conta |
| Conta suspensa | Crow - Sua conta foi suspensa temporariamente | O motivo e "Previsão de reativação: dd/MM/yyyy às HH:mm." |
| Conta reativada, manual ou automaticamente | Crow - Sua conta foi reativada | "…você já pode acessar a plataforma normalmente." |
| E-mail avulso | Crow - *assunto digitado* | A mensagem do administrador e "Esta mensagem foi enviada pela equipe de moderação do Crow…" |
| Idioma excluído | Crow - Um idioma que você criou foi removido | O nome do idioma e "Motivo informado:" com a mensagem ou o texto padrão do idioma |

- Texto padrão da conta: "A decisão foi tomada pela equipe de moderação após a análise da sua conta."
- Texto padrão do idioma: "O conteúdo não atendia às diretrizes de uso da plataforma."
- Os e-mails de moderação começam com "Olá, *primeiro nome*!" e terminam com "Atenciosamente,
  Equipe Crow".

## Depois da execução

O roteiro deixa no banco local as contas A e B, o "Inglês do Roteiro" e o "Espanhol do Roteiro",
as duas denúncias e cerca de 20 registros em `logs_admin`. Nada disso é apagado automaticamente.
