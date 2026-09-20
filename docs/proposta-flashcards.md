# Proposta — Modo de estudo por Flashcards

Referência: branch `feat/auditoria-tcc-fases-2-6-tema`, árvore de trabalho em 2026-09-19
(sobre o commit `10a165b`). Linhas citadas valem para esse estado.

Escopo analisado: `crow/src/app/pages/cadastrar-frase` (modos TRADUCAO, PARES e QUIZ),
`crow/src/app/pages/jogar` e os pontos de contato deles — o modal de início em
`visualizar-idioma`, a listagem/edição em `visualizar-modulo`, `FraseService`/`FraseController`
e a entidade `Frase`.

> Documento de proposta. Nenhum código foi alterado.

---

## Resumo

- Hoje o **criador** decide, no cadastro, como o **estudante** vai praticar: cada `Frase`
  nasce com um `modo` que é ao mesmo tempo o formato do conteúdo e o formato do exercício.
- A única experiência de estudo é o jogo (`/jogar`): uma prova com placar, cronômetro e um
  modal bloqueante a cada resposta. Não existe primeiro contato "sem nota", não existe
  revisão do que foi errado e nada é lembrado entre sessões.
- Flashcards preenchem exatamente esse buraco — e o conteúdo já cadastrado nos três modos
  tem tudo o que um cartão precisa (frente, verso, mídia, dicas).
- **Recomendação:** implementar Flashcards como **modo de estudo** derivado dos três modos
  existentes — sem quarto `ModoFrase`, sem mudança de banco, sem mexer nos formulários de
  cadastro — em uma página nova `/flashcards`, oferecida no modal "Como deseja estudar?".
  Em uma segunda fase opcional, persistir a revisão por usuário (Leitner simples) para
  fechar o ciclo de gamificação.

---

## 1. Como funciona hoje

### 1.1 Modelo

Uma única tabela `frases` guarda os três tipos de conteúdo. Cada modo usa um subconjunto
disjunto das colunas (`api/src/main/java/com/crow/api/entity/Frase.java:19-70`):

| Coluna | TRADUCAO | PARES | QUIZ |
|---|---|---|---|
| `traducaoCompleta` | frase-enunciado (o que o jogo mostra como pergunta) | — | — |
| `palavrasJson` | `[{palavra, traducao}]` — trechos em ordem | — | — |
| `traducoesAlternativasJson` | outras respostas aceitas | — | — |
| `imagem`, `observacoes`, `linksJson` | opcionais | — | — |
| `paresJson` | — | `[{imagem?, palavra, traducao}]`, 3 a 10 | — |
| `pergunta` | — | — | obrigatória |
| `alternativasJson`, `respostaCorreta` | — | — | 2 a 5 / índice |
| `imagemQuiz`, `videoQuiz` | — | — | opcionais (um ou outro) |

O `modo` é um enum fechado (`Frase.java:76-78`) e o frontend repete a união
`'traducao' | 'pares' | 'quiz'` em `crow/src/app/models/frase.model.ts:18` e
`cadastrar-frase.ts:27`. Não existe nenhuma entidade de progresso por usuário: as
entidades são `Avaliacao`, `Denuncia`, `Frase`, `Idioma`, `IdiomaUsuario`, `LogAdmin`,
`Modulo`, `Usuario`. O que a UI chama de "progresso" é `módulos / 20`
(`visualizar-idioma.ts:315`, `home.ts:330`).

### 1.2 Fluxo do criador

1. Em `visualizar-modulo`, clica em adicionar frase → `/cadastrar-frase?moduloId=&idIdioma=`.
2. Escolhe um dos três cards de modo (`cadastrar-frase.html:23-49`).
3. Preenche o bloco daquele modo; o botão **Finalizar** fica desabilitado até
   `podeFinalizar()` ser verdadeiro (`cadastrar-frase.ts:82-103`, `html:288`).
4. Ao salvar, `enviarFrase()` chama `voltar()` e a tela volta para o módulo
   (`cadastrar-frase.ts:324-331`). Uma frase por viagem.
5. Para editar, `visualizar-modulo` abre um modal que **reimplementa o formulário inteiro**
   (`visualizar-modulo.ts:458-493` preenche, `:571` monta o payload, `:684` valida;
   `visualizar-modulo.html:273` em diante).

### 1.3 Fluxo do estudante

1. Em `visualizar-idioma`, marca módulos e clica em **Iniciar** → modal "Como deseja
   estudar?" (`visualizar-idioma.html:639-690`), que na prática só pergunta a **ordem**
   (Aleatória / De cadastro). Clicar na opção já navega (`visualizar-idioma.ts:340-362`).
2. `/jogar` busca `GET /api/modulos/0/frases/jogar?modulos=&ordem=`
   (`frase.service.ts:39`). No modo aleatório o backend corta em 10
   (`FraseService.java:144,168`).
3. Para cada frase: cabeçalho com "Etapa X / Y", barra, contadores de acertos/erros e
   "Cancelar rodada" (`jogar.html:5-33`); bloco do modo; botão **Verificar Resposta**
   (`jogar.html:200-208`); modal de resultado bloqueante (`jogar.html:212-240`);
   **Continuar** → próxima (`jogar.ts:466-476`).
4. Tela final com porcentagem, tempo, histórico e "Jogar Novamente" — que apenas
   recarrega a rodada (`jogar.ts:513-524`).

---

## 2. Diagnóstico

Os itens estão numerados para serem referenciados nas alternativas (C = cadastro,
E = estudo, S = estrutura).

### 2.1 Cadastro — quem cria conteúdo

**C1. Uma frase por viagem de ida e volta.**
Não existe "Salvar e adicionar outra": `enviarFrase()` → `voltar()`
(`cadastrar-frase.ts:324-331`). Um módulo de vocabulário com 20 palavras exige 20 ciclos
lista → formulário → escolher modo → preencher → salvar → lista, ou empacotar em frases
PARES (mínimo 3, máximo 10 pares — `cadastrar-frase.ts:145-155`). É o ponto mais cansativo
para o criador.

**C2. Escolha de modo às cegas.**
Os três cards têm só ícone e título (`cadastrar-frase.html:23-49`) — nenhuma descrição,
nenhuma prévia do que o estudante verá. E a palavra "Frase" não descreve dois dos três
modos: uma "frase" PARES é um conjunto de até 10 pares; uma "frase" QUIZ é uma pergunta.
A listagem repete a confusão ("Frase #3 do tipo Quiz").

**C3. TRADUCAO: nomenclatura invertida e um campo que o jogo ignora.**
O campo rotulado **"Tradução Completa \*"** (`cadastrar-frase.html:76`, placeholder
"Bom dia! Como você está?") é, na verdade, o **enunciado** — o jogo o exibe como pergunta
(`jogar.html:75-77`). A resposta é montada só com o campo `traducao` de cada trecho
(`jogar.ts:374-375`, `jogar.html:85,96`). O campo **"Palavra N \*"** (`html:83`) — o
trecho de origem — **nunca aparece no jogo**; só na listagem do módulo
(`visualizar-modulo.html:120`). Ou seja, o criador preenche dois campos obrigatórios por
trecho e o jogo usa um. Além disso, os trechos precisam ser digitados **na ordem da frase
de destino**, sem nenhuma indicação disso além da prévia "Tradução principal" que fica
abaixo, dentro de `app-respostas-aceitas` (`html:105-108`).

**C4. Validação muda.**
`podeFinalizar()` devolve um único booleano (`cadastrar-frase.ts:82-103`) e o botão apenas
fica cinza (`html:288`). Nada diz qual campo falta. Pequenas inconsistências agravam:
"Mídia (opcional)" no Quiz não pode ser desmarcada depois de escolhida
(`html:190,194` só atribuem `'imagem'`/`'video'`), e "Imagem do Quiz \*" (`html:202`)
não é exigida por `podeFinalizar()`.

**C5. Contexto só existe em TRADUCAO.**
Observações e links (`html:109-135`) não existem em PARES nem em QUIZ. Não há onde
colocar uma dica de pronúncia, uma frase de exemplo ou uma nota cultural para um par ou
uma pergunta.

**C6. Todo modo existe em quatro lugares.**
Formulário de cadastro, formulário de edição (cópia integral em `visualizar-modulo`),
card da listagem (`visualizar-modulo.html:110-200`) e renderização no jogo. Qualquer novo
modo de conteúdo custa quatro implementações. Isso pesa diretamente na comparação das
alternativas.

### 2.2 Estudo — quem aprende

**E1. Toda sessão é uma prova.**
Cabeçalho com etapa, acertos e erros (`jogar.html:5-33`), cronômetro (`jogar.ts:478-489`),
porcentagem final. Não existe uma etapa de **ver o conteúdo antes de ser cobrado**: o
primeiro contato com uma frase nova já é uma resposta que conta ponto. Para vocabulário,
isso é pedagogicamente invertido — primeiro se expõe, depois se testa. O modal "Como deseja
estudar?" (`visualizar-idioma.html:639-690`) pergunta a ordem, não o *como*.

**E2. Dois cliques e um modal por item.**
Verificar (`jogar.html:200-208`) → overlay bloqueante (`jogar.html:212-240`; o clique fora
é ignorado em `jogar.ts:665-667`) → Continuar. Numa rodada de 10 são no mínimo 20 cliques
mais 10 animações de modal. O modal **cobre o tabuleiro**, então ao errar o estudante vê a
resposta correta em texto mas não consegue compará-la com o que montou.

**E3. PARES é pesado, principalmente no celular.**
Até 10 pares em duas colunas que viram uma só abaixo de 768px
(`jogar.css:1321-1323`): o estudante rola entre "Palavras", "Traduções" e a lista
"Conexões realizadas" (`jogar.html:142-160`). A associação por borda colorida usa cores
fixas em hex (`jogar.ts:54-57`), que não seguem o tema.

**E4. Nada é lembrado.**
`historicoRespostas` vive na memória (`jogar.ts:34`); "Jogar Novamente" recarrega
(`jogar.ts:513-524`); não há entidade de progresso no backend. O modo aleatório corta em 10
(`FraseService.java:144`) **sem lembrar o que já saiu**: num módulo com 40 frases o
estudante pode repetir as mesmas e nunca ver outras. Não existe "revisar o que errei".

**E5. Só para frente.**
Depois de verificar não há como voltar ao item anterior nem pular um item
(`proximaEtapa()` só avança, `jogar.ts:466-476`; `podeVerificar()` exige resposta
completa, `jogar.ts:330-342`).

**E6. Feedback pobre no erro de TRADUCAO.**
A mensagem é sempre "A ordem das palavras está incorreta." (`jogar.ts:397`) e a resposta
certa aparece como trechos unidos por "→" (`jogar.ts:398`), não como frase natural. O
trecho de origem (`palavra`), que permitiria mostrar o alinhamento trecho a trecho, está
disponível e não é usado (ver C3).

### 2.3 Estrutura — modelo e código

**S1. Tabela esparsa.** Treze colunas de conteúdo em `frases`, cada modo usa entre 3 e 6.
Um quarto modo com colunas próprias segue o padrão e é viável com `ddl-auto=update`
(colunas novas nulas), mas aprofunda o problema.

**S2. Enum fechado e `valueOf` sem tratamento.** `Frase.ModoFrase.valueOf(dto.modo().toUpperCase())`
(`FraseService.java:52,79`) lança `IllegalArgumentException` para um modo desconhecido —
o cliente recebe 500, não 400.

**S3. JSON em texto, parseado no cliente em três lugares.** `jogar.ts:158-193`,
`visualizar-modulo.ts:253-283` e o preenchimento da edição (`:458-493`) repetem o mesmo
`JSON.parse`. Para flashcards isso é até conveniente — um cartão pode ser derivado no
cliente sem tocar o backend — mas a quarta cópia deve ser evitada.

### 2.4 Síntese

Os problemas do **estudo** (E1, E2, E4, E5) não são de layout do jogo: são a falta de um
segundo modo de estudar, de baixa pressão, que o conteúdo atual já sustenta. Os problemas
do **cadastro** (C1–C5) são reais, mas independentes de flashcards — e C6 é o motivo para
não resolvê-los criando mais um modo de conteúdo.

---

## 3. O que seria um flashcard no Crow

Um cartão tem **frente** (estímulo), **verso** (resposta) e, opcionalmente, mídia e
material de apoio. O estudante vê a frente, tenta lembrar, vira, e **se autoavalia**
("Errei" / "Acertei"). Não há verificação automática, não há placar de prova, e o ritmo é
do estudante. É recordação ativa em sua forma mais simples e, com persistência, vira
revisão espaçada (sistema de Leitner).

Os três modos atuais já carregam frente e verso:

| Modo de origem | Cartões gerados | Frente (direção normal) | Verso | Apoio no verso |
|---|---|---|---|---|
| TRADUCAO | 1 | `traducaoCompleta` + `imagem` | ordem principal (`palavras[].traducao` unidas por espaço) | `traducoesAlternativas`, `observacoes`, `links` |
| PARES | 1 por par (3–10) | `par.palavra` + `par.imagem` | `par.traducao` | — |
| QUIZ | 1 | `pergunta` + `imagemQuiz`/`videoQuiz` | alternativa correta | demais alternativas atenuadas |

**Direção invertida** (frente ↔ verso) faz sentido para TRADUCAO e PARES e dobra o valor
do mesmo dado. QUIZ não inverte (pergunta → resposta apenas) e mantém a direção normal
com um selo discreto.

A pergunta central — *FLASHCARD é um quarto modo ou uma forma de exibir os existentes?* —
tem resposta direta: hoje "modo" mistura **tipo de conteúdo** e **tipo de exercício**.
Flashcards é o primeiro caso em que essas duas coisas se separam: é um **tipo de
exercício** que se aplica a todos os tipos de conteúdo. As alternativas abaixo exploram os
dois caminhos.

---

## 4. Alternativas

### Alternativa A — `FLASHCARD` como quarto modo de conteúdo

**Para quem cadastra.** Um quarto card em `modo-grid`: "Flashcard". Formulário curto:
frente (texto obrigatório + imagem opcional), verso (texto obrigatório), dica opcional.
Como um cartão é pequeno, o formulário poderia aceitar **vários cartões de uma vez**
(lista com "+ adicionar cartão"), o que atacaria C1 para esse modo — mas isso exige
decidir se N cartões viram N frases ou 1 frase com `cartoesJson`, e cada escolha tem
efeito na listagem, na reordenação (`ordem`) e na edição.

**Para quem estuda.** Em `/jogar`, quando `fraseAtual.modo === 'flashcard'`: mostra a
frente, toque para virar, botões "Errei" / "Acertei" que alimentam `acertos`/`erros`
existentes. Cartões nascidos nos outros três modos continuam sendo jogados como hoje.

**Modelo de dados.** `ModoFrase.FLASHCARD`; colunas novas nulas em `frases`
(`frente_texto`, `verso_texto`, `dica`) reaproveitando `imagem`. `FraseRequest`/`FraseResponse`
ganham três campos. Frontend: união de tipos +1 em `frase.model.ts:18` e
`cadastrar-frase.ts:27`.

**Impacto no backend.** Baixo: enum, três colunas, DTOs, três `set` em `criar`/`editar`.
Sem migração (`ddl-auto=update` cria as colunas nulas).

**Impacto no frontend.** Médio, por C6: bloco novo em `cadastrar-frase`, bloco novo no
modal de edição de `visualizar-modulo`, card novo na listagem, bloco novo em `jogar`,
ícone/nome em `enriquecerFrase` e `iconesModo`.

**O que resolve / não resolve.**
Resolve E1/E2/E5 **só para cartões novos**. Todo o conteúdo já cadastrado nos três modos
continua sem modo de revisão. Não resolve E4. Não muda a experiência do estudante com
PARES (E3). Mistura, numa mesma rodada, itens autoavaliados com itens verificados — o
placar de prova perde sentido. Aprofunda S1 e C6.

**Esforço:** **Médio** (backend baixo + quatro pontos no frontend).

---

### Alternativa B — Flashcards como modo de estudo derivado dos modos existentes

**Para quem cadastra.** Nada muda. O criador continua cadastrando TRADUCAO, PARES e QUIZ;
cada frase passa a valer, automaticamente, como cartão(ões) segundo a tabela da seção 3.

**Para quem estuda.** O modal "Como deseja estudar?" ganha a dimensão que falta —
**Praticar (jogo)** ou **Flashcards** — antes da ordem. Flashcards navega para uma página
nova `/flashcards?modulos=&idIdioma=&ordem=&origem=` (mesmos parâmetros de `/jogar`). Na
página:

- um cartão por vez, centralizado; cabeçalho leve ("Cartão 4 de 18", barra, contagem
  discreta de acertei/errei) — sem cronômetro, sem "Etapa";
- toque/clique/Espaço vira o cartão (transição CSS, respeitando `prefers-reduced-motion`);
- após virar aparecem **Errei** e **Acertei** (teclas 1 e 2); **Pular** e **Voltar** como
  ações secundárias; alternador de **direção** (normal / invertida) no cabeçalho;
- cartões marcados como "Errei" entram numa **fila de revisão**; ao fim da primeira
  passada a página oferece "Revisar as N que você errou" até zerar a fila ou o estudante
  encerrar;
- tela final no mesmo vocabulário visual da atual (círculo, estatísticas, lista), com
  "Revisar erradas", "Praticar no jogo" (leva para `/jogar` com os mesmos parâmetros — os
  dois modos se complementam) e "Voltar ao Idioma";
- cancelar a qualquer momento com o mesmo padrão de modal de `jogar.html:243-300`.

**Modelo de dados.** Nenhuma mudança. Um `Flashcard` existe só no cliente
(`{ id: 'fraseId:indice', fraseId, indice, modoOrigem, frente, verso, apoio }`), projetado
a partir de `Frase[]` por uma função pura. O `id` composto é escolhido já pensando na
Alternativa C.

**Impacto no backend.** Nenhum. Reaproveita `GET /modulos/0/frases/jogar`. Atenção: para
o baralho ser completo, a página deve pedir `ordem=cadastro` e embaralhar no cliente
quando o estudante escolher "aleatória" — senão o corte de 10 de `LIMITE_JOGO_ALEATORIO`
se aplica (e a expansão de PARES em N cartões torna o corte ainda mais arbitrário).

**Impacto no frontend.** Baixo–médio: 1 página nova (`pages/flashcards/` .ts/.html/.css),
1 modelo, 1 serviço de projeção/sessão, 1 rota, e a extensão do modal em
`visualizar-idioma` (ts + html + css do modal).

**O que resolve / não resolve.**
Resolve E1 (primeiro contato sem nota), E2 (um toque para virar, um para avaliar, sem
modal), E3 (um par por vez — excelente no celular), E5 (voltar/pular) e dá uso imediato a
**todo** o conteúdo existente. Não resolve E4 (só na sessão) nem C1–C5. A qualidade do
cartão depende de dados feitos para outro fim: um QUIZ com pergunta genérica ("Qual a
alternativa correta?") e mídia vira um cartão fraco; o verso de TRADUCAO é a junção dos
trechos (se o criador cadastrou bem, é a frase natural).

**Esforço:** **Baixo–Médio** (frontend apenas).

---

### Alternativa C — B + revisão persistida por usuário (Leitner)

Tudo de B, mais memória entre sessões.

**Para quem cadastra.** Nada muda.

**Para quem estuda.** A sessão de flashcards prioriza cartões **vencidos** (próxima
revisão ≤ hoje), depois **novos**, depois o resto. O card do idioma (home /
`visualizar-idioma`) mostra "N cartões para revisar". Cinco caixas de Leitner com
intervalos fixos (1, 3, 7, 15, 30 dias): acertou sobe uma caixa, errou volta para a
primeira. Sem SM-2 — o suficiente para o TCC e explicável em uma frase.

**Modelo de dados.** Tabela nova `revisoes_flashcard` — sem tocar `frases`:
`usuario_id`, `frase_id`, `indice` (0 para modos de cartão único; posição do par em PARES),
`caixa` (0–5), `acertos`, `erros`, `ultima_revisao`, `proxima_revisao`;
`unique(usuario_id, frase_id, indice)`. Limitação assumida: reordenar/editar os pares de
uma frase desloca o `indice` e "renomeia" cartões — aceitável nesta escala; a alternativa
(chave por hash de `palavra+traducao`) pode ser adotada depois sem mudar o contrato.

**Impacto no backend.** Médio: entidade, repositório, serviço, dois endpoints
(`GET /api/flashcards/revisoes?modulos=…` → estado por cartão;
`POST /api/flashcards/revisoes` → lote `[{fraseId, indice, acertou}]` aplicado numa
transação ao fim da sessão), validação de leitura dos módulos com
`validarAcessoLeituraDoModulo`, `usuarioId` sempre do `Authentication`, limpeza em
`FraseService.excluir` (ou `ON DELETE CASCADE` via `@OnDelete`). Não é ação administrativa
— sem `LogAdminService`. Cuidados já conhecidos: `open-in-view=false` (fetch join ao montar
respostas) e `cdr.detectChanges()` nos callbacks.

**Impacto no frontend.** Médio: B + envio do lote no encerramento (inclusive no cancelar,
com o que já foi avaliado), ordenação por vencimento, selo "N para revisar" nos cards de
idioma, tratamento de falha de rede (a sessão não pode travar por causa do POST).

**O que resolve / não resolve.** Tudo de B mais E4 — e é o que dá à plataforma
"gamificada" um ciclo real de retorno (há motivo para voltar amanhã). Não resolve C1–C5.

**Esforço:** **Alto** (B + backend médio + integração + estados de erro).

---

### Comparativo

| | A — 4º modo | B — modo de estudo | C — B + persistência |
|---|---|---|---|
| Backend | Baixo | **Nenhum** | Médio |
| Frontend | Médio (4 lugares) | Baixo–Médio (1 página + modal) | Médio |
| Banco | 3 colunas nulas em `frases` | — | Tabela nova |
| Aproveita conteúdo existente | Não | **Sim** | **Sim** |
| E1 primeiro contato sem nota | Só cartões novos | Sim | Sim |
| E2 menos cliques / sem modal | Só cartões novos | Sim | Sim |
| E3 PARES no celular | Não | Sim | Sim |
| E4 memória entre sessões | Não | Não | **Sim** |
| E5 voltar / pular | Só cartões novos | Sim | Sim |
| C1 cadastro em lote | Parcial (se houver lote) | Não | Não |
| Toca formulários de cadastro/edição (C6) | Sim, os dois | Não | Não |
| Reversível sem rastro | Não (enum + colunas) | Sim | Parcial (tabela) |
| **Esforço total** | **Médio** | **Baixo–Médio** | **Alto** |

---

## 5. Recomendação

**Implementar B agora, desenhada para receber C depois. Não fazer A.**

Justificativa:

1. **Os problemas que motivam flashcards estão do lado do estudo, não do cadastro.**
   E1, E2, E4 e E5 são ausência de um segundo modo de estudar. A resposta certa muda como
   o conteúdo é *exibido*, não como é *cadastrado*. Portanto: **não** é um quarto
   `ModoFrase`; é um modo de estudo que projeta os três modos existentes.

2. **B entrega valor no dia um para todo o acervo.** Um idioma com 15 módulos cadastrados
   ganha flashcards sem que ninguém recadastre nada. A alternativa A só beneficia conteúdo
   futuro e obriga o criador a escolher entre "cadastrar para o jogo" e "cadastrar para
   revisar".

3. **Custo e risco.** B não toca backend, banco, nem os dois formulários duplicados (C6).
   Pode ser desenvolvida e revertida sem rastro. É o tamanho certo para uma etapa de TCC
   com prazo.

4. **C é a continuação natural, não um redesenho.** Se B nascer com `id` de cartão
   estável (`fraseId:indice`), avaliação binária e o resultado da sessão concentrado num
   serviço, C acrescenta persistência sem reescrever a página.

5. **A fica registrada como opção futura, condicionada a demanda.** Se criadores pedirem
   "um jeito rápido de cadastrar vocabulário", a resposta é atacar C1 (cadastro em lote /
   "salvar e adicionar outra") — não um novo modo. Se ainda assim um tipo de conteúdo
   "cartão puro" se justificar, ele se encaixa na projeção de B como quarta linha da tabela
   da seção 3, e o custo de C6 deve ser pago antes (extrair um componente de formulário
   único usado por cadastro e edição).

Decisões de produto embutidas na recomendação (todas trocáveis na Etapa 0):

- Nome da funcionalidade na UI: **"Flashcards"**; cada item é um **"cartão"**.
- Avaliação **binária** (Errei / Acertei). Três ou quatro níveis complicam a UI e o Leitner
  simples não precisa deles.
- Cartões errados vão para uma **fila de revisão** oferecida ao fim da passada — não são
  reinseridos no meio do baralho (evita sessão sem fim e mantém "Cartão X de Y" verdadeiro).
- QUIZ no verso mostra **todas** as alternativas com a correta em destaque (mais útil que
  só a correta).
- Direção padrão **normal**; o alternador fica na página, não no modal.
- Sem limite de tamanho de baralho; o estudante pode encerrar quando quiser e vê o resumo
  parcial.

---

## 6. Plano de implementação (se aprovado)

Tamanhos: **P** (poucas horas), **M** (cerca de um dia), **G** (dois ou mais dias).
Cada etapa termina em estado navegável; nenhuma exige backend reiniciado até a Etapa 6.

### Etapa 0 — Decisões de design · P
Confirmar as seis decisões da seção 5 e o esboço do Apêndice A. Definir textos da UI
(títulos, botões, mensagens de vazio/erro).

**Pronto quando:** lista fechada de textos e comportamentos.

### Etapa 1 — Modelo e projeção (sem UI) · P
Arquivos novos:
- `crow/src/app/models/flashcard.model.ts` — `Flashcard`, `LadoCartao`, `DirecaoCartao`,
  `ResultadoCartao`.
- `crow/src/app/services/flashcard.service.ts` — `projetar(frases, direcao): Flashcard[]`
  (função pura: 1 cartão por TRADUCAO/QUIZ, N por PARES; `id = fraseId:indice`),
  `embaralhar`, e o estado de sessão (baralho, posição, fila de revisão, resultados) com
  API pequena: `iniciar`, `virar`, `avaliar(acertou)`, `pular`, `voltar`,
  `iniciarRevisao`, `resumo`.
- O parse dos campos `*Json` fica **privado neste serviço** por enquanto (é a quarta cópia
  de S3; a consolidação das quatro entra na seção 8 como refatoração separada, para não
  tocar `jogar.ts`/`visualizar-modulo.ts` fora de escopo).

**Pronto quando:** projeção testada manualmente no console com frases dos três modos
(inclusive PARES com imagem, TRADUCAO com alternativas, QUIZ com vídeo).

### Etapa 2 — Página `/flashcards` · M/G
- `crow/src/app/pages/flashcards/flashcards.ts|html|css` (standalone; padrão de
  `jogar`: lê `modulos`, `idIdioma`, `ordem`, `origem` da query; `voltarAoIdioma` igual a
  `jogar.ts:527`).
- Rota `flashcards` no grupo `comunGuard` de `app.routes.ts`, ao lado de `jogar`.
- Busca com `getFrasesParaJogo(ids, 'cadastro')` e embaralha no cliente se
  `ordem === 'aleatoria'`; `cdr.detectChanges()` no callback (zoneless).
- Layout do Apêndice A: cabeçalho leve, cartão com frente/verso, ações que só aparecem
  após virar, direção no cabeçalho, atalhos (Espaço vira, 1 = Errei, 2 = Acertei,
  ← volta), sons via `SoundService` (`acerto`, `erro`, `conclusao` — sem som ao virar).
- Fila de revisão ao fim da passada; tela final; modal de cancelar copiando o padrão de
  `jogar.html:243-300`.
- CSS só com variáveis de `styles.css`; virada com `transform: rotateY` e fallback de
  opacidade sob `prefers-reduced-motion`; ícones SVG inline conforme convenção.
- Iframe do YouTube (cartões QUIZ com vídeo) só é montado quando o cartão está em tela —
  nunca pré-renderizar o baralho inteiro.

**Pronto quando:** dá para abrir `/flashcards?modulos=["1"]&idIdioma=…` na mão e
completar uma sessão nos dois temas, no desktop e a 400px de largura.

### Etapa 3 — Entrada no fluxo · P/M
- `visualizar-idioma.html:639-690`: o modal ganha a linha **Modo de estudo** (Flashcards /
  Praticar) acima da linha **Ordem**, e um botão **Começar** substitui o clique-que-navega
  das opções de ordem.
- `visualizar-idioma.ts:340-362`: `iniciarComOrdem(ordem)` vira
  `iniciarEstudo(modo, ordem)`; navega para `/flashcards` ou `/jogar` com os mesmos
  parâmetros; persiste a preferência em `sessionStorage` (`crow:modo-estudo`, ao lado de
  `crow:ordem-jogo`, `:200,:350`).
- CSS do modal (`.opcoes-ordem` e vizinhos) estendido para duas linhas de opções.
- Estado vazio: módulos selecionados sem nenhuma frase → mensagem e volta.

**Pronto quando:** o fluxo Iniciar → Flashcards → sessão → Voltar ao Idioma funciona a
partir da home, da busca e do perfil de usuário (`origem` preservada).

### Etapa 4 — Acabamento e acessibilidade · P/M
Foco visível e ordem de tabulação; `aria-live` anunciando "verso" ao virar; botões com
`aria-label`; contraste checado nos dois temas; imagens com `loading="lazy"`; erro de rede
com "Tentar novamente"; comportamento de "Voltar" do navegador no meio da sessão.

**Pronto quando:** navegável só pelo teclado; sem cor fixa no CSS; sem aviso no console.

### Etapa 5 — Verificação · P
Roteiro manual: 3 modos × 2 direções; baralho de 1 cartão; baralho com todos errados;
fila de revisão até zerar; cancelar no meio; trocar tema no meio; PARES com 10 pares e
imagens; QUIZ com vídeo (não deve tocar antes da virada); módulos misturados; "Praticar no
jogo" a partir do resumo.

**Pronto quando:** roteiro executado sem falha e anotado no PR.

### Etapa 6 (opcional, Alternativa C) — Revisão persistida · G
Backend: `RevisaoFlashcard` (entidade/repositório/serviço/controller), dois endpoints,
limpeza ao excluir frase. Frontend: `flashcard.service.ts` passa a carregar o estado antes
de projetar (ordena vencidos → novos → demais) e a enviar o lote ao encerrar/cancelar;
selo "N para revisar" nos cards de idioma. Sem nenhuma alteração na página além do ponto
de injeção — é o teste de que B foi desenhada certo.

**Pronto quando:** um cartão errado hoje aparece primeiro amanhã, em outro navegador.

---

## 7. Riscos e pontos de atenção

- **Corte de 10 do modo aleatório** (`FraseService.java:144`): a página de flashcards deve
  sempre pedir `ordem=cadastro`. Se um dia o jogo quiser baralho completo, o parâmetro
  `limite` no endpoint é uma mudança pequena — mas fora deste escopo.
- **Baralhos grandes**: 5 frases PARES × 10 pares = 50 cartões. O "Cartão X de Y" e o
  encerramento a qualquer momento tornam isso aceitável; se incomodar, um limite por sessão
  com "Continuar com os próximos" é trivial de adicionar no serviço.
- **Qualidade de cartões QUIZ**: perguntas genéricas dependentes da mídia produzem frentes
  fracas. Mitigação: mídia grande na frente; opcionalmente permitir excluir QUIZ do baralho
  em uma configuração futura.
- **Identidade do cartão para a Fase 2**: `fraseId:indice` muda se os pares forem
  reordenados/editados. Limitação documentada; chave por hash é a evolução.
- **Zoneless**: todo callback assíncrono que altera estado exibido chama
  `cdr.detectChanges()`.
- **Sem bibliotecas novas**: a virada é CSS puro; nenhuma lib de swipe/flip.
- **Nomenclatura**: "Flashcards" convive com "Praticar" no modal; evitar "Jogar" vs
  "Estudar" como rótulos, porque os dois são estudo.

---

## 8. Achados fora do escopo (registro, não fazem parte desta proposta)

Correções pequenas que apareceram no diagnóstico e valem um item próprio cada:

1. **C3** — Renomear rótulos de TRADUCAO ("Frase" em vez de "Tradução Completa";
   "Trecho" / "Tradução do trecho") e decidir o destino de `palavra`: exibir no jogo (por
   exemplo no feedback de erro, E6) ou tornar opcional.
2. **C4** — Trocar o `[disabled]` mudo por indicação do que falta; permitir desmarcar a
   mídia do Quiz; exigir a imagem quando "Imagem" estiver marcada.
3. **E2** — Resultado inline abaixo do tabuleiro em vez de modal bloqueante, mantendo a
   resposta do estudante visível ao lado da correta.
4. `coresPares` em hex (`jogar.ts:54-57`) → variáveis CSS (convenção do projeto).
5. `verificarPares` localiza o par original por texto (`jogar.ts:416`); pares com
   `palavra` repetida quebram a checagem — usar índice.
6. **S3** — Uma única função de parse de `Frase` para as quatro cópias
   (`jogar.ts:158`, `visualizar-modulo.ts:253` e `:458`, e a da Etapa 1).
7. **C6** — Extrair um componente `formulario-frase` usado pelo cadastro e pelo modal de
   edição. Pré-requisito para qualquer novo tipo de conteúdo.
8. **S2** — `valueOf` em `FraseService.java:52,79` → validar e responder 400.
9. **C1** — "Salvar e adicionar outra" em `cadastrar-frase` (uma linha em `enviarFrase`
   e um segundo botão).

---

## Apêndice A — Esboços

Ícones no produto final são SVG inline; aqui estão como texto.

### A.1 Página `/flashcards` — frente

```
┌────────────────────────────────────────────────────────────────┐
│ [←]  Flashcards · Inglês básico             Cartão 4 de 18     │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░   ✓ 3   ✗ 1   ⇄ normal   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│               ┌────────────────────────────────┐               │
│               │ TRADUÇÃO DIRETA                │               │
│               │ ┌────────────────────────────┐ │               │
│               │ │          [imagem]          │ │               │
│               │ └────────────────────────────┘ │               │
│               │                                │               │
│               │   Bom dia! Como você está?     │               │
│               │                                │               │
│               │          toque para virar      │               │
│               └────────────────────────────────┘               │
│                                                                │
│      [ ← Voltar ]                              [ Pular → ]     │
└────────────────────────────────────────────────────────────────┘
```

### A.2 Página `/flashcards` — verso

```
│               ┌────────────────────────────────┐               │
│               │ VERSO                          │               │
│               │                                │               │
│               │   Good morning! How are you?   │               │
│               │   ──────────────────────────   │               │
│               │   Também aceito                │               │
│               │   · Good morning, how are you? │               │
│               │   Observações                  │               │
│               │   "How are you" é a forma…     │               │
│               │   Links  · youglish.com/…      │               │
│               └────────────────────────────────┘               │
│                                                                │
│         [ ✗ Errei  (1) ]              [ ✓ Acertei  (2) ]       │
```

Cartão PARES: frente = imagem + palavra; verso = tradução (uma linha grande).
Cartão QUIZ: frente = mídia + pergunta; verso = lista de alternativas, correta em destaque.

### A.3 Modal "Como deseja estudar?" (em `visualizar-idioma`)

```
┌──────────────── Como deseja estudar? ────────────────┐
│ Modo de estudo                                       │
│ ┌────────────────────────┐ ┌────────────────────────┐│
│ │ [ico] Flashcards       │ │ [ico] Praticar         ││
│ │ Veja, lembre e vire.   │ │ Monte, associe e       ││
│ │ No seu ritmo, sem nota.│ │ responda. Com placar.  ││
│ └────────────────────────┘ └────────────────────────┘│
│ Ordem                                                │
│ (•) Aleatória                (  ) De cadastro        │
│                                                      │
│                                     [ Começar → ]    │
└──────────────────────────────────────────────────────┘
```

### A.4 Resumo da sessão

```
┌────────────────────────────────────────────────────────────────┐
│                    ( 83% )   15 de 18 de primeira              │
│   ✓ 15 acertei    ✗ 3 errei    ↻ 3 revisados    18 cartões     │
│                                                                │
│   Cartões que você errou                                       │
│   · Bom dia! Como você está?  →  Good morning! How are you?    │
│   · maçã  →  apple                                             │
│   · …                                                          │
│                                                                │
│  [ ↻ Revisar erradas ]  [ Praticar no jogo ]  [ ← Voltar ]     │
└────────────────────────────────────────────────────────────────┘
```

## Apêndice B — Arquivos tocados pela recomendação (B)

| Arquivo | Ação |
|---|---|
| `crow/src/app/models/flashcard.model.ts` | novo |
| `crow/src/app/services/flashcard.service.ts` | novo |
| `crow/src/app/pages/flashcards/flashcards.ts` | novo |
| `crow/src/app/pages/flashcards/flashcards.html` | novo |
| `crow/src/app/pages/flashcards/flashcards.css` | novo |
| `crow/src/app/app.routes.ts` | + rota `flashcards` |
| `crow/src/app/pages/visualizar-idioma/visualizar-idioma.html` | modal "Como deseja estudar?" |
| `crow/src/app/pages/visualizar-idioma/visualizar-idioma.ts` | `iniciarEstudo(modo, ordem)` + preferência |
| `crow/src/app/pages/visualizar-idioma/visualizar-idioma.css` | estilos do modal |
| `api/**` | **nenhum** |

Não são tocados: `cadastrar-frase/*`, `jogar/*`, `visualizar-modulo/*`, `frase.model.ts`,
`frase.service.ts`, entidades e DTOs.
