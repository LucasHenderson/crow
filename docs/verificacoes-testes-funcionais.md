# Verificações executadas nos testes funcionais

Este documento complementa o Trabalho de Conclusão de Curso *Crow: desenvolvimento e avaliação de uma plataforma gamificada e colaborativa para o estudo de idiomas* (Unitins, 2026), Seção 4.2. Reúne o ambiente de execução, o resultado de cada caso de teste e a lista completa de verificações da suíte executada em **25 de outubro de 2026**, além das verificações registradas durante a implementação e dos defeitos corrigidos antes da execução final.

Critérios de situação: **aprovado** quando todas as verificações se confirmaram; **aprovado com ressalva** quando todas se confirmaram, mas a execução revelou uma limitação que não impede o requisito; **reprovado** quando ao menos uma verificação divergiu do esperado.

> Os defeitos D1 (CT-28) e D3 (CT-32) foram corrigidos nas rodadas 8.32 e 8.33. Em 13 de novembro de 2026, os casos CT-28 e CT-32 foram reexecutados como teste de regressão: o CT-28 passou a ser aprovado (7/7), e o CT-32 permaneceu reprovado em razão dos defeitos D2, D4, D5 e D6. As tabelas abaixo mantêm o resultado da execução de 25 de outubro.

## Sumário

1. [Ambiente de execução](#1-ambiente-de-execução)
2. [Resultado por caso de teste](#2-resultado-por-caso-de-teste)
3. [Verificações por caso de teste](#3-verificações-por-caso-de-teste)
4. [Verificações registradas durante a implementação](#4-verificações-registradas-durante-a-implementação)
5. [Defeitos encontrados e corrigidos durante a implementação](#5-defeitos-encontrados-e-corrigidos-durante-a-implementação)

## 1. Ambiente de execução

| Item | Configuração |
|---|---|
| Data da execução | 25 de outubro de 2026, das 14h25 às 15h26 (horário de Brasília) |
| Sistema operacional | Windows 11 Pro |
| Backend | Spring Boot 3.5.11, Java 21 |
| Banco de dados | PostgreSQL 16, instalação local |
| Frontend | Angular 21, servidor de desenvolvimento |
| Navegadores | Google Chrome 156, sem interface gráfica (headless), e Microsoft Edge 156 |
| Automação | Roteiros em Node.js 24 sobre o Chrome DevTools Protocol |
| Envio de e-mails | Servidor SMTP local de captura: as mensagens foram gravadas em arquivo para conferência, e nenhuma saiu da máquina |
| Contas | Três contas de usuário comum criadas pelos próprios testes (Ana, Bruno e Carla, com e-mails do domínio reservado example.com) e a conta administrativa |

A execução ocorreu em ambiente local para não introduzir dados de teste no banco de produção. Ao final, o conteúdo criado pelos testes (idiomas, módulos, frases, avaliações e arquivos enviados) foi removido a partir da lista exata registrada pelos roteiros; permaneceram as três contas de teste, as duas denúncias e os registros administrativos, que documentam a execução. O ambiente de produção foi conferido separadamente por testes de fumaça (saúde da API, autenticação, listagens administrativas, envio de arquivos e entrega real de e-mail).

## 2. Resultado por caso de teste

Distribuição: 28 casos aprovados (84,8%), 3 aprovados com ressalva (9,1%) e 2 reprovados (6,1%); 34 execuções (o CT-33 foi repetido no Chrome e no Edge) e 263 verificações, das quais 258 se confirmaram e 5 divergiram.

| Caso | Fluxo verificado | Requisitos | Verificações | Situação |
|---|---|---|---|---|
| CT-01 | Cadastro de conta com verificação de e-mail por código | RF01 | 14/14 | Aprovado com ressalva |
| CT-02 | Autenticação (login) e redirecionamento por perfil | RF01, RNF02 | 8/8 | Aprovado |
| CT-03 | Recuperação de senha por código e alteração de senha no perfil | RF01 | 13/13 | Aprovado com ressalva |
| CT-04 | Cadastro de idioma com módulo e primeira frase (assistente em 3 etapas) | RF02, RF04 | 18/18 | Aprovado |
| CT-05 | Gestão de módulos: adicionar, editar, excluir e reordenar | RF03 | 11/11 | Aprovado |
| CT-06 | Exercícios nos três modos: criar, editar, excluir e reordenar frases | RF04 | 8/8 | Aprovado |
| CT-07 | Áudios nas frases: arquivo anexado e gravação pelo microfone | RF04 | 8/8 | Aprovado |
| CT-08 | Idiomas da Conta B, visibilidade privada e limite de 4 idiomas por usuário | RF02, RNF05 | 8/8 | Aprovado |
| CT-09 | Busca de idiomas públicos com filtros combinados e ordenação | RF05 | 15/15 | Aprovado |
| CT-10 | Busca de usuários, perfil público e navegação de volta pela origem | RF05 | 8/8 | Aprovado |
| CT-11 | Importação de idioma de outro usuário (cópia profunda), inclusive no limite de 4 | RF06, RNF05 | 9/9 | Aprovado |
| CT-12 | Rodada de estudo nos três modos, com registro de acertos e erros | RF07 | 11/11 | Aprovado com ressalva |
| CT-13 | Cancelamento da rodada e ordem aleatória | RF07 | 6/6 | Aprovado |
| CT-14 | Avaliação de idioma por estrelas (curadoria comunitária) | RF08 | 10/10 | Aprovado |
| CT-15 | Denúncia de conteúdo inadequado e encaminhamento à moderação | RF09 | 6/6 | Aprovado |
| CT-16 | Painel administrativo: acesso, lista de usuários, filtros e detalhes somente leitura | RF10 | 11/11 | Aprovado |
| CT-17 | Desativação por tempo indeterminado, bloqueio de login e reativação manual, com e-mails | RF10 | 8/8 | Aprovado |
| CT-18 | Suspensão temporária com data futura e reativação pelos detalhes | RF10 | 6/6 | Aprovado |
| CT-19 | Reativação automática ao fim da suspensão (agendador) | RF10 | 6/6 | Aprovado |
| CT-20 | E-mail avulso do administrador ao usuário | RF10 | 4/4 | Aprovado |
| CT-21 | Visualização de idioma pelo moderador, somente leitura | RF10 | 6/6 | Aprovado |
| CT-22 | Exclusão de idioma pelo moderador, com e sem mensagem ao proprietário | RF10 | 5/5 | Aprovado |
| CT-23 | Tratamento de denúncias: detalhes, acesso rápido e alteração de status | RF09, RF10 | 6/6 | Aprovado |
| CT-24 | Registro (logs) de todas as ações administrativas e filtros da aba Logs | RF10 | 10/10 | Aprovado |
| CT-25 | Administrador não edita usuários nem conteúdo de outros usuários (papel de moderação) | RF10, RNF02 | 6/6 | Aprovado |
| CT-26 | Administrador não cria, importa, avalia nem denuncia idiomas | RF10 | 3/3 | Aprovado |
| CT-27 | Rotas administrativas protegidas: token comum, sem token e guardas do frontend | RF10, RNF02 | 5/5 | Aprovado |
| CT-28 | Identificadores públicos, dados sensíveis, senhas e uploads | RNF02, RNF03 | 6/7 | Reprovado |
| CT-29 | Navegação entre telas sem ciclos (Voltar contextual) | RNF04 | 4/4 | Aprovado |
| CT-30 | Cópia do código público (perfil, perfil público e idioma), por clique e teclado | RNF04 | 4/4 | Aprovado |
| CT-31 | Topbar: nome, alternância de tema e de sons, com preferência persistida | RNF04 | 5/5 | Aprovado |
| CT-32 | Responsividade (desktop e 375 px) e temas claro/escuro nas telas principais | RNF01, RNF04 | 0/4 | Reprovado |
| CT-33 | Compatibilidade: fluxo essencial no Chrome e no Edge | RNF01 | 5/5 + 5/5 | Aprovado |

## 3. Verificações por caso de teste

As verificações estão na ordem em que foram executadas. Foram utilizadas a Conta A (Ana Roteiro), a Conta B (Bruno Roteiro) e a Conta C (Carla Roteiro), todas de usuário comum, além da conta administrativa. Quando registrada, a evidência obtida acompanha o resultado; nas verificações divergentes ou com ressalva, ela descreve a divergência.

### CT-01 – Cadastro de conta com verificação de e-mail por código (RF01) · Aprovado com ressalva

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Páginas /termos-de-uso e /politica-de-privacidade abrem sem login, com seções numeradas | Conforme |
| 2 | Tela "Criar Nova Conta" com botão Voltar e sem o card "Benefícios da Conta" | Conforme |
| 3 | Links de Termos de Uso e Política de Privacidade abrem em nova aba | Conforme: /termos-de-uso, /politica-de-privacidade, /termos-de-uso, /politica-de-privacidade |
| 4 | "Verificar" envia o código e mostra "Código enviado! Verifique sua caixa de entrada." | Conforme: Código enviado! Verifique sua caixa de entrada. |
| 5 | E-mail de verificação recebido com código de 6 dígitos e validade de 10 minutos | Conforme: assunto "Crow - Código de verificação" |
| 6 | Código errado recusado com "Código inválido ou expirado" | Conforme: Código inválido ou expirado. Tente novamente. |
| 7 | Código certo: "Email verificado com sucesso!", botão vira "Verificado" e o e-mail fica somente leitura | Conforme |
| 8 | Sem aceitar os termos, "Criar Conta" fica desabilitado | Conforme |
| 9 | Conta criada: entra na /home e a topbar mostra o primeiro nome | Conforme: Carla |
| 10 | Resposta de /usuarios/me sem senha nem id numérico | Conforme: USR-37ADEDB48A97 |
| 11 | E-mail já cadastrado: "Criar Conta" é recusado com "Email já cadastrado" e não sai da tela | Conforme: Email já cadastrado |
| 12 | Momento em que a duplicidade é informada | Ressalva: o aviso de e-mail já cadastrado só aparece ao clicar em "Criar Conta", depois de o usuário receber e digitar o código |
| 13 | Conta A (Ana Roteiro), criada pelo mesmo fluxo na primeira passagem, autentica | Conforme: HTTP 200 |
| 14 | Conta B (Bruno Roteiro), criada pelo mesmo fluxo na primeira passagem, autentica | Conforme: HTTP 200 |

### CT-02 – Autenticação (login) e redirecionamento por perfil (RF01, RNF02) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Rodapé "© 2026 - Todos os direitos reservados" na tela de login | Conforme |
| 2 | Senha errada: "Email ou senha incorretos" e continua em /login | Conforme: Email ou senha incorretos |
| 3 | E-mail sem cadastro: a mesma mensagem (não revela se o e-mail existe) | Conforme: Email ou senha incorretos |
| 4 | Login da Conta A leva à /home e guarda um JWT | Conforme |
| 5 | Sessão sem cookie de servidor (modelo stateless: só o token no cliente) | Conforme: (nenhum cookie) |
| 6 | Login do administrador leva a /controle-adm | Conforme |
| 7 | API recusa rota protegida sem token | Conforme: HTTP 403 |
| 8 | API recusa token com assinatura adulterada | Conforme: HTTP 403 |

### CT-03 – Recuperação de senha por código e alteração de senha no perfil (RF01) · Aprovado com ressalva

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | "Esqueci minha senha" abre /recuperar-senha na etapa 1 de 3 | Conforme |
| 2 | E-mail sem cadastro: "Este email não está cadastrado." | Conforme |
| 3 | "Cancelar" na etapa 1 volta para /login | Conforme |
| 4 | Etapa 2 com "Código enviado!" e e-mail "Crow - Redefinição de senha" com o código em destaque | Conforme: Crow - Redefinição de senha |
| 5 | "Cancelar" na etapa 2 volta à etapa 1 com o campo vazio e sem mensagens | Conforme |
| 6 | "Reenviar código" envia um novo e-mail | Conforme |
| 7 | Código errado: "Código inválido ou expirado" | Conforme |
| 8 | Código mais recente aceito: etapa 3 "Defina sua Nova Senha" | Conforme |
| 9 | Confirmação diferente da nova senha: "Confirmar Nova Senha" fica desabilitado (o envio é impedido) | Conforme |
| 10 | Retorno ao usuário quando as senhas diferem | Ressalva: o botão é desabilitado sem mensagem explicando o motivo; a mensagem "As senhas não coincidem." existe no código, mas só seria exibida se o botão fosse clicável |
| 11 | Modal "Senha Alterada!" com botão que leva ao login | Conforme |
| 12 | Senha antiga recusada e a nova aceita | Conforme: antiga HTTP 401, nova HTTP 200 |
| 13 | Perfil → "Alterar Senha": "Senha alterada com sucesso!" e a senha do roteiro volta a valer | Conforme: login com a senha do roteiro: HTTP 200 |

### CT-04 – Cadastro de idioma com módulo e primeira frase (assistente em 3 etapas) (RF02, RF04) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Home sem idiomas mostra "Nenhum idioma cadastrado no momento" e o botão "+" | Conforme |
| 2 | Card "+" abre "Adicionar Idioma" com Buscar Idioma, Buscar Usuário e Novo Idioma (sem "Gerar Idioma (IA)") | Conforme: opções: Buscar Idioma, Buscar Usuário e Novo Idioma |
| 3 | "Novo Idioma" abre o assistente com as etapas Idioma → Módulo → Frase | Conforme |
| 4 | Voltar sem nada preenchido volta à home sem confirmação | Conforme |
| 5 | Voltar com dados abre "Sair do Cadastro"; "Continuar Editando" mantém o que foi digitado | Conforme: modal "Sair do Cadastro": "Tem certeza que deseja sair do cadastro?" |
| 6 | "Avançar" da etapa 1 fica desabilitado sem idioma e proficiência | Conforme |
| 7 | Etapa 1 completa (idioma, nome, descrição, proficiência e visibilidade) habilita "Avançar" | Conforme |
| 8 | Tradução Direta: faixa "Tradução principal" mostra "Good morning How are you?" | Conforme: Good morning How are you? |
| 9 | Resposta aceita vazia: "Preencha ou remova esta resposta." e Finalizar desabilitado | Conforme |
| 10 | Resposta igual à principal (ignorando maiúsculas e pontuação) é recusada | Conforme: Esta é a tradução principal — ela já é aceita automaticamente. |
| 11 | Resposta repetida: só a segunda acusa "Esta resposta já foi cadastrada." | Conforme |
| 12 | Limite de 5 respostas aceitas: com 5, o botão de adicionar deixa de estar disponível | Conforme: 5 respostas |
| 13 | Respostas removidas até restar "How are you? Good morning" | Conforme |
| 14 | Finalizar volta à home com "Idioma "Inglês do Roteiro" cadastrado com sucesso!" | Conforme: Idioma "Inglês do Roteiro" cadastrado com sucesso! |
| 15 | Card do idioma na home com código público IDM-… | Conforme: IDM-9010B5BA5731 |
| 16 | Caixa de detalhes do card mostra a proficiência ("Proficiência: Iniciante") | Conforme: Proficiência: Iniciante |
| 17 | Página do idioma: "Última atualização" de hoje e card Proficiência com o nível | Conforme: Última atualização: 25/10/2026 · PROFICIÊNCIA Iniciante |
| 18 | Persistência conferida na API: visibilidade pública, 1 módulo, frase com a resposta alternativa | Conforme: visibilidade=publico; alternativas=["How are you? Good morning"] |

### CT-05 – Gestão de módulos: adicionar, editar, excluir e reordenar (RF03) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Adicionar Módulo "Números" (primeira frase em Selecionar Pares): toast e posição #2 | Conforme: Módulo "Números" adicionado com sucesso! |
| 2 | Adicionar Módulo "Vídeos" (primeira frase em Quiz com vídeo do YouTube): posição #3 | Conforme: Módulo "Vídeos" adicionado com sucesso! |
| 3 | Editar módulo: nome alterado para "Temporário editado" | Conforme: Saudações, Números, Vídeos, Temporário editado |
| 4 | Excluir módulo com confirmação: o módulo some e restam 3 | Conforme: modal "Excluir Módulo": "Tem certeza que deseja excluir o módulo "Temporário editado"?" |
| 5 | Setas: "subir" do #1 e "descer" do último ficam desabilitadas | Conforme |
| 6 | Seta para baixo no #1: "Saudações" vira #2 na hora, sem marcar o módulo | Conforme: Números, Saudações, Vídeos |
| 7 | Nova ordem mantida após recarregar a página | Conforme: Números, Saudações, Vídeos |
| 8 | Ordem restaurada (Saudações, Números, Vídeos) e persistida | Conforme: Saudações, Números, Vídeos |
| 9 | Estatística "Total de Módulos" acompanha (3/20) | Conforme: 3/20 |
| 10 | Visitante (Conta B) vê as posições, mas nenhuma seta, Editar, Excluir ou "Adicionar Módulo" | Conforme |
| 11 | API recusa reordenar/editar módulos de idioma alheio (Conta B) | Conforme: HTTP 403: Você não tem permissão para modificar este idioma |

### CT-06 – Exercícios nos três modos: criar, editar, excluir e reordenar frases (RF04) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | "Nova Frase" (Tradução Direta) cadastra e volta ao módulo, que fica com #1 a #3 | Conforme: #1 #2 #3 |
| 2 | Frases de Selecionar Pares e Quiz (4 alternativas) cadastradas pela mesma tela; a lista mostra o modo de cada uma | Conforme: Tradução Direta, Tradução Direta, Tradução Direta, Selecionar Pares, Quiz |
| 3 | Quiz persistido com 4 alternativas e a correta = "Thank you" | Conforme: resposta correta: segunda alternativa ("Thank you") |
| 4 | Editar frase pelo modal: a tradução completa passa a "Boa noite!" | Conforme |
| 5 | Excluir frase com confirmação: restam 4, renumeradas sem buracos | Conforme: #1 #2 #3 #4 |
| 6 | Seta para baixo na frase #1: troca com a #2 e a ordem persiste após recarregar | Conforme |
| 7 | Cancelar com dados: modal "Cancelar Cadastro"; "Sim, Cancelar" volta ao módulo sem criar a frase | Conforme |
| 8 | API confirma 4 frases no módulo, na ordem original | Conforme: Bom dia! Como você está? \| Obrigado \| Boa noite! \| pares |

### CT-07 – Áudios nas frases: arquivo anexado e gravação pelo microfone (RF04) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Cada campo de áudio vazio oferece "Áudio" (arquivo) e "Gravar" (microfone) | Conforme: 3 campos; Áudio, Gravar |
| 2 | Arquivo que não é áudio (texto renomeado para .mp3) é recusado com mensagem | Conforme: Não foi possível ler este áudio. Verifique o arquivo ou tente um MP3. |
| 3 | Arquivo WAV anexado à tradução completa, com a duração exibida | Conforme: 0:02 |
| 4 | "Gravar" mostra "Gravando 0:0x" e "Parar" gera o anexo com a gravação | Conforme: Gravando 0:02 |
| 5 | Frase salva com os dois áudios em /api/uploads/<uuid>.<ext> (wav anexado e webm gravado) | Conforme: /api/uploads/3b7e8c06-9ea9-46c6-aac0-db0aa8570b60.wav , /api/uploads/87b4050a-3dce-4b0a-a857-c899a66aa017.webm |
| 6 | Arquivos servidos com 200 e tipo de mídia | Conforme: 200 audio/x-wav ; 200 video/webm |
| 7 | Lista do módulo mostra os players de áudio da frase | Conforme: 2 players |
| 8 | API recusa referência de áudio externa (URL fora de /api/uploads) | Conforme: HTTP 400: Áudio inválido na tradução completa: envie o arquivo pelo formulário da frase |

### CT-08 – Idiomas da Conta B, visibilidade privada e limite de 4 idiomas por usuário (RF02, RNF05) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Conta B cadastra "Espanhol do Roteiro" (Espanhol, Básico, publico) | Conforme: IDM-4E5A7BC5ED09 |
| 2 | Conta B cadastra "Descartável 1" (Francês, Iniciante, publico) | Conforme: IDM-C6506AC243FA |
| 3 | Conta B cadastra "Descartável 2" (Italiano, Avançado, privado) | Conforme: IDM-E88D3819154E |
| 4 | Home da Conta B com 3 cards e o card "+" visível | Conforme |
| 5 | Idioma privado não aparece na lista pública vista por outro usuário | Conforme: GET direto do privado por outro usuário: HTTP 403 |
| 6 | Quarto idioma cadastrado (Conta B com 4/4) | Conforme |
| 7 | No limite: card "+" continua visível, o modal avisa o limite e só "Novo Idioma" fica desabilitado | Conforme: Você atingiu o limite de 4 idiomas. Ainda dá para buscar idiomas e usuários — ao importar, você escolhe qual dos seus substituir. Para… |
| 8 | API recusa o quinto idioma do mesmo usuário | Conforme: HTTP 400: Limite máximo de 4 idiomas atingido |

### CT-09 – Busca de idiomas públicos com filtros combinados e ordenação (RF05) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Título "27 IDIOMAS DISPONÍVEIS"; a lista traz os públicos de outros usuários (paginação de 9 por página) | Conforme: 27 IDIOMAS DISPONÍVEIS |
| 2 | Aparecem "Espanhol do Roteiro" e "Descartável 1"; não aparecem os idiomas da própria Conta A nem o privado "Descartável 2" | Conforme |
| 3 | Filtro Idioma: opções derivadas dos resultados, em ordem alfabética | Conforme: Alemão, Árabe, Chinês (Mandarim), Coreano, Espanhol, Francês, Inglês (Estados Unidos), Inglês (Reino Unido), Italiano, Japonês, Português… |
| 4 | Marcar Espanhol e Francês: menu continua aberto, contador 2 e só idiomas em Espanhol OU Francês | Conforme: 8 resultados; "8 RESULTADOS ENCONTRADOS" |
| 5 | Proficiência Iniciante combina com E: (Espanhol ou Francês) e Iniciante; da Conta B, só o "Descartável 1" | Conforme: 1 resultado |
| 6 | Marcar também Básico traz de volta o "Espanhol do Roteiro" | Conforme |
| 7 | Busca por nome combina com os filtros: só o "Descartável 1" | Conforme: 1 RESULTADO ENCONTRADO |
| 8 | "Todos os idiomas" limpa só o filtro de idioma; proficiência e busca continuam valendo | Conforme: filtro de idioma vazio; 2 proficiências marcadas; busca "Descartável" |
| 9 | Ordenação é de escolha única: escolher "Data de Criação" fecha o menu | Conforme |
| 10 | "Limpar filtros" zera busca, idioma e proficiência, mantém a ordenação e o botão some | Conforme: busca e filtros vazios; ordenação mantida em "Data de Criação" |
| 11 | Busca sem resultado: "Nenhum resultado encontrado" | Conforme |
| 12 | Ordenação por avaliação: estrelas exibidas, depois número de avaliações; sem avaliação no fim | Conforme: 21 idiomas avaliados, 6 sem avaliação |
| 13 | Card mostra a contagem ("N avaliações" / "Sem avaliações") | Conforme: 8 avaliações · 7 avaliações · 7 avaliações |
| 14 | Paginação: "próxima" leva à página 2 | Conforme: 3 páginas |
| 15 | Voltar da busca leva à /home | Conforme |

### CT-10 – Busca de usuários, perfil público e navegação de volta pela origem (RF05) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Lista de usuários sem administradores | Conforme: 15 usuários |
| 2 | Buscar "admin" não traz administrador | Conforme |
| 3 | Card da Conta B com "Membro desde" e a contagem só dos idiomas públicos (2 públicos de 4) | Conforme: Bruno Roteiro · 2 idiomas · Membro desde 25/10/2026 |
| 4 | Perfil público: nome, ID USR-…, "Membro desde" e "Idiomas (2/4)" sem os privados; não mostra e-mail | Conforme: URL ?id=USR-FD4417ABD7F1 |
| 5 | Do idioma aberto pelo perfil, Voltar retorna ao perfil da Conta B | Conforme |
| 6 | Do perfil, Voltar vai para /buscar-usuario (sem ciclo de volta ao idioma) | Conforme |
| 7 | Idioma (vindo da busca) → "ID Usuário" → perfil → Voltar → idioma → Voltar → /buscar-idioma: a origem é preservada | Conforme: /visualizar-idioma?id=IDM-4E5A7BC5ED09&origem=buscar-idioma → /buscar-idioma |
| 8 | API do perfil público expõe só código, nome, data de entrada e quantidade de idiomas | Conforme: codigo, nome, dataEntrada, quantidadeIdiomas |

### CT-11 – Importação de idioma de outro usuário (cópia profunda), inclusive no limite de 4 (RF06, RNF05) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Abaixo do limite: modal "Deseja importar o idioma…?" e "Confirmar Importação" mostra o sucesso | Conforme: Idioma "Espanhol do Roteiro" importado com sucesso! |
| 2 | A cópia aparece entre os idiomas da Conta C, com código próprio e a Conta C como dona | Conforme: IDM-5845FD7258B1 |
| 3 | Cópia profunda: mesmos módulos e frases (conteúdo idêntico, ids diferentes) | Conforme |
| 4 | Alterar a cópia não afeta o original | Conforme: original: "No restaurante" |
| 5 | No limite: "Limite Atingido!", lista dos 4 idiomas e botão de excluir-e-importar desabilitado até escolher | Conforme |
| 6 | Escolher o idioma a excluir avisa que é irreversível; a importação troca o "Quarto do Roteiro" pela cópia | Conforme: IDM-F1438580573D |
| 7 | A cópia mantém os 3 módulos, a ordem e os áudios (mesmos arquivos de /api/uploads) | Conforme: Saudações, Números, Vídeos |
| 8 | API recusa importar o próprio idioma | Conforme: HTTP 400: Você não pode importar um idioma do qual já é proprietário |
| 9 | API recusa importar idioma privado de outro usuário | Conforme: HTTP 403: Este idioma não está disponível para importação |

### CT-12 – Rodada de estudo nos três modos, com registro de acertos e erros (RF07) · Aprovado com ressalva

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Marcar dois módulos: "INICIAR MÓDULOS" mostra 2 e aparece "Limpar seleção" | Conforme |
| 2 | "Limpar seleção" zera a seleção e o botão some | Conforme |
| 3 | "INICIAR MÓDULOS" abre "Como deseja estudar?" com Ordem Aleatória e Ordem de Cadastro | Conforme |
| 4 | Ordem de Cadastro: "Etapa 1 / 7" e frases na ordem dos módulos e, dentro deles, na ordem do dono | Conforme: Etapa 1 / 7; Bom dia! Como você está? \| Obrigado \| Boa noite! \| pares \| Até logo \| pares \| Qual palavra o vídeo usa para cumprimentar? |
| 5 | Tradução Direta respondida com a ordem alternativa cadastrada ("How are you? Good morning"): "Resposta Correta!" | Conforme: Bom dia! Como você está? |
| 6 | Erro proposital: "Resposta Incorreta", mostra a resposta correta e o botão "Ok, Entendi" | Conforme: pares: Alguns pares estão incorretos. RESPOSTA CORRETA: Please → Por favor, Bye → Tchau |
| 7 | Os três modos foram jogados e corrigidos (Tradução Direta, Selecionar Pares e Quiz com vídeo) | Conforme: Tradução Direta, Selecionar Pares e Quiz |
| 8 | Tela final com Acertos, Erros, Total, Tempo e "Histórico de Respostas" coerentes com a rodada | Conforme: acertos 6, erros 1, total 7, tempo 9s, histórico 7 |
| 9 | Sons pedidos pela rodada: acerto, erro, avanço e conclusão (conferidos pelas chamadas ao SoundService) | Conforme: selecao, acerto, avanco, par, erro, conclusao |
| 10 | "Voltar ao Idioma" leva à página do idioma | Conforme |
| 11 | Persistência do desempenho | Ressalva: acertos, erros e histórico são registrados durante a rodada e exibidos ao final, mas não são gravados no banco (não há histórico entre sessões) |

### CT-13 – Cancelamento da rodada e ordem aleatória (RF07) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | "Cancelar rodada" abre o aviso de que respostas e tempo serão perdidos, com "Voltar à rodada", "Cancelar rodada" e X | Conforme |
| 2 | Esc fecha o modal e a rodada continua igual | Conforme |
| 3 | Clique fora e "Voltar à rodada" também fecham sem alterar a rodada | Conforme |
| 4 | Confirmar o cancelamento volta à página do idioma | Conforme |
| 5 | Ao iniciar de novo, "Ordem de Cadastro" aparece destacada (última escolha da sessão) | Conforme: Ordem de Cadastro Exatamente na sequência definida pelo criador. |
| 6 | Ordem Aleatória produz sequência diferente da ordem de cadastro | Conforme |

### CT-14 – Avaliação de idioma por estrelas (curadoria comunitária) (RF08) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Idioma recém-criado começa sem avaliações (0 estrelas, 0 avaliações) | Conforme: média 0, total 0 |
| 2 | Conta A: "Enviar Avaliação" só habilita após escolher a nota; 4 estrelas → "Você selecionou: 4 estrelas" | Conforme: Você selecionou: 4 estrelas |
| 3 | Envio mostra "Avaliação enviada com sucesso!" e o card passa a 4 estrelas e "1 avaliações" | Conforme: 4 estrelas · 1 avaliações |
| 4 | Avaliar de novo substitui a nota anterior: 5 estrelas e o total continua 1 | Conforme: 5 estrelas · 1 avaliações |
| 5 | Conta C dá 3 estrelas: média (5 + 3) / 2 = 4,0 com 2 avaliações, na tela e na API | Conforme: API: média 4, total 2 |
| 6 | Card da busca mostra as estrelas e "2 avaliações" | Conforme: Data: 25/10/2026 Avaliação: 2 avaliações |
| 7 | Dono do idioma não vê o botão "Avaliar" | Conforme |
| 8 | API recusa o dono avaliando o próprio idioma | Conforme: HTTP 400: Você não pode avaliar o próprio idioma |
| 9 | API recusa nota fora de 1 a 5 | Conforme: HTTP 400 |
| 10 | Tentativas recusadas não alteram a média (continua 4,0 com 2 avaliações) | Conforme |

### CT-15 – Denúncia de conteúdo inadequado e encaminhamento à moderação (RF09) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Modal de denúncia com 6 tipos (imagens, vídeos, áudios, links, frases, outros) e envio desabilitado sem escolha | Conforme: Imagens Inapropriadas, Vídeos Inapropriados, Áudios Inapropriados, Links Inapropriados, Frases Inapropriadas, Outros (descreva) |
| 2 | "Frases Inapropriadas" enviada: "Obrigado por sua colaboração! A moderação verificará…" | Conforme: Obrigado por sua colaboração! A moderação verificará e agirá assim que possível. |
| 3 | "Outros (descreva)" exige a descrição: o envio só habilita depois de preenchê-la | Conforme |
| 4 | Segunda denúncia enviada com o mesmo aviso de agradecimento | Conforme |
| 5 | Dono não vê o botão "Denunciar" no próprio idioma | Conforme |
| 6 | As 2 denúncias chegam à moderação como pendentes, com tipos, descrição e denunciante (Conta A) | Conforme: DEN-9EAFE173474D pendente, DEN-3FF1962B8103 pendente |

### CT-16 – Painel administrativo: acesso, lista de usuários, filtros e detalhes somente leitura (RF10) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Login do admin abre "Controle Administrativo" com as abas Denúncias, Usuários, Idiomas e Logs | Conforme: abas Denúncias (13), Usuários (15), Idiomas (34) e Logs (50) |
| 2 | Menu do avatar do admin mostra só "Sair", sem "Perfil" | Conforme: Sair |
| 3 | /perfil e /home redirecionam o admin para /controle-adm | Conforme: /controle-adm, /controle-adm |
| 4 | Aba Usuários lista as contas comuns, incluindo Ana e Bruno, e nenhum administrador | Conforme: 15 contas |
| 5 | Buscar "admin@crow.com" não encontra nada | Conforme |
| 6 | Três filtros de situação: Ativos, Suspensos e Desativados (sem "Todos") | Conforme: ATIVOS, SUSPENSOS, DESATIVADOS |
| 7 | Busca por "Bruno" encontra a Conta B | Conforme |
| 8 | Busca por "USR-FD4417ABD7F1" encontra a Conta B | Conforme |
| 9 | Busca por "roteiro.b@example.com" encontra a Conta B | Conforme |
| 10 | Card com Visualizar, Enviar e-mail e Desativar ou suspender | Conforme: Visualizar usuário, Enviar e-mail ao usuário, Desativar ou suspender conta |
| 11 | Detalhes do Usuário: código, nome, e-mail, data, status Ativo e 4 idiomas (inclui privados); sem telefone, senha ou papel; nenhum campo editável | Conforme: código, nome, e-mail, data de entrada, status ATIVO e quantidade de idiomas; nenhum campo editável |

### CT-17 – Desativação por tempo indeterminado, bloqueio de login e reativação manual, com e-mails (RF10) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Modal "Desativar / Suspender Conta": sem campo de data, aviso do e-mail ao usuário e contador da justificativa | Conforme: 30/1000 caracteres |
| 2 | Confirmação: toast "Conta de "Bruno Roteiro" desativada por tempo indeterminado." | Conforme: Conta de "Bruno Roteiro" desativada por tempo indeterminado. |
| 3 | Card com badge "Desativado" e botão "Reativar conta" | Conforme: "Desativada por tempo indeterminado" · badge DESATIVADO |
| 4 | E-mail "Crow - Sua conta foi desativada" com o motivo informado | Conforme: Crow - Sua conta foi desativada |
| 5 | Login com senha errada não revela a situação; com a senha certa é recusado com "Conta desativada…", sem a justificativa | Conforme: Email ou senha incorretos \| 403 Conta desativada. Entre em contato com a equipe de moderação. |
| 6 | Chips: aparece em "Desativados" e não em "Ativos" | Conforme |
| 7 | "Reativar Conta" (desativação indeterminada) volta a Ativo, envia "Crow - Sua conta foi reativada" e o login volta a funcionar | Conforme: Crow - Sua conta foi reativada; login HTTP 200 |
| 8 | Status final da Conta B na API: ativo | Conforme: ativo |

### CT-18 – Suspensão temporária com data futura e reativação pelos detalhes (RF10) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Data passada: "A data e hora de reativação precisam estar no futuro." e confirmação desabilitada | Conforme: A data e hora de reativação precisam estar no futuro. |
| 2 | Data de amanhã às 10:00: resumo "A conta será reativada automaticamente em …" | Conforme: A conta será reativada automaticamente em 26/10/2026 às 10:00. |
| 3 | Toast "… suspensa até dd/MM/yyyy às 10:00." e card "Suspenso" com "Reativação prevista" | Conforme: Conta de "Bruno Roteiro" suspensa até 26/10/2026 às 10:00. |
| 4 | E-mail "Crow - Sua conta foi suspensa temporariamente" com motivo padrão e previsão de reativação | Conforme: Crow - Sua conta foi suspensa temporariamente |
| 5 | Login da conta suspensa recusado com "Conta suspensa temporariamente. Previsão de reativação: …" | Conforme: Conta suspensa temporariamente. Previsão de reativação: 26/10/2026 às 10:00. |
| 6 | Detalhes mostram a reativação prevista; "Reativar conta" dali abre o modal "suspensa com reativação automática prevista…" e reativa agora | Conforme |

### CT-19 – Reativação automática ao fim da suspensão (agendador) (RF10) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Conta B suspensa até 2026-10-25 14:53 (agora + ~2 min) | Conforme |
| 2 | Depois do horário, antes da verificação automática: login informa que a reativação está em andamento (ou já entra, se o agendador passou) | Conforme: HTTP 403 Conta suspensa temporariamente. A reativação automática está em andamento; tente novamente em alguns minutos. |
| 3 | O agendador (a cada 5 min) reativa a conta sozinho | Conforme: 152 s de espera após o vencimento |
| 4 | E-mail "Crow - Sua conta foi reativada" enviado pela reativação automática | Conforme: Crow - Sua conta foi reativada |
| 5 | Login da Conta B volta a funcionar | Conforme |
| 6 | Após recarregar a aba, o card mostra "Ativo" | Conforme |

### CT-20 – E-mail avulso do administrador ao usuário (RF10) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Modal "Enviar E-mail" com destinatário (nome, e-mail, ID), contadores 0/150 e 0/5000 e "Enviar" desabilitado até preencher assunto e mensagem | Conforme |
| 2 | Envio: toast "E-mail para "Bruno Roteiro" enviado com sucesso!" | Conforme: E-mail para "Bruno Roteiro" enviado com sucesso! |
| 3 | E-mail "Crow - Teste do roteiro" com saudação, as duas linhas preservadas e o rodapé da moderação | Conforme: Crow - Teste do roteiro |
| 4 | API recusa assunto vazio (400) e e-mail para conta administrativa (403) | Conforme: 400 / 403 |

### CT-21 – Visualização de idioma pelo moderador, somente leitura (RF10) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Aba Idiomas lista públicos e privados (inclui o privado "Descartável 2") | Conforme |
| 2 | Cada card tem só "Visualizar idioma" e "Excluir idioma" | Conforme: Visualizar idioma, Excluir idioma |
| 3 | Página do moderador com selo "somente leitura", proprietário, proficiência, visibilidade e "3 módulos · 7 frases" | Conforme: 3 módulos · 7 frases |
| 4 | "Expandir todos" mostra as frases dos três modos, a resposta alternativa e os áudios | Conforme |
| 5 | Nenhum controle de edição (setas, editar, Nova Frase, Adicionar Módulo); a única ação é "Excluir idioma" | Conforme |
| 6 | "Voltar ao controle" volta para a aba Idiomas | Conforme |

### CT-22 – Exclusão de idioma pelo moderador, com e sem mensagem ao proprietário (RF10) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Modal "Excluir Idioma" com nome, ID, proprietário, alerta de irreversível, mensagem opcional 0/1000 e aviso de e-mail | Conforme |
| 2 | Com mensagem: toast "… excluído. O proprietário foi avisado por e-mail." e o idioma deixa de existir | Conforme: Idioma "Descartável 1" excluído. O proprietário foi avisado por e-mail. \| GET 404 |
| 3 | E-mail "Crow - Um idioma que você criou foi removido" com o nome e "Removido no teste do roteiro." | Conforme: Crow - Um idioma que você criou foi removido |
| 4 | Sem mensagem, pela página: troca o conteúdo por "Idioma excluído" e o e-mail traz o motivo padrão | Conforme: Crow - Um idioma que você criou foi removido |
| 5 | A aba Idiomas não lista mais os dois idiomas excluídos | Conforme |

### CT-23 – Tratamento de denúncias: detalhes, acesso rápido e alteração de status (RF09, RF10) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Lista mostra a denúncia do "Espanhol do Roteiro" e a do idioma excluído como "Idioma removido" (ID: —) | Conforme |
| 2 | Detalhes: DEN-…, idioma com código, denunciante "Ana Roteiro (USR-…)", tipos e status; acesso rápido em nova aba | Conforme: dois links habilitados, abertos em nova aba |
| 3 | Links: /visualizar-idioma-adm?id=IDM-… e /controle-adm?aba=usuarios&usuario=USR-… | Conforme |
| 4 | "Ver denunciante" abre a aba Usuários com a busca preenchida e os detalhes da Ana abertos | Conforme |
| 5 | Status → "Analisando": toast de sucesso, e a denúncia passa a ter o administrador como responsável | Conforme: analisando · Administrador |
| 6 | Denúncia de idioma excluído: "Ver idioma denunciado" sem link, desabilitado e fora do Tab; "Ver denunciante" funciona | Conforme: "Ver idioma denunciado" sem link, desabilitado e fora do foco ("Idioma não está mais disponível"); "Ver denunciante" com link e focável |

### CT-24 – Registro (logs) de todas as ações administrativas e filtros da aba Logs (RF10) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Desativação registrada com modalidade e justificativa | Conforme |
| 2 | Suspensões registradas com a reativação prevista | Conforme |
| 3 | Reativações manuais registradas (2) e a automática como "Sistema — ação automática" | Conforme |
| 4 | E-mail avulso registrado com destinatário e assunto, sem trecho da mensagem | Conforme |
| 5 | Exclusões de idioma registradas: "mensagem personalizada" e "mensagem padrão" | Conforme |
| 6 | Alteração de status de denúncia registrada (pendente → analisando) | Conforme |
| 7 | Chip "Moderação" mostra só registros de moderação | Conforme: chips: DENÚNCIAS, USUÁRIOS, IDIOMAS, MODERAÇÃO, E-MAILS |
| 8 | Busca pelo código da Conta B traz os registros que a afetaram | Conforme: 9 registros |
| 9 | Card do log com LOG-…, ação, data, detalhes, "Usuário afetado", responsável e tipo legível | Conforme |
| 10 | A reativação automática aparece com o responsável "Sistema — ação automática" | Conforme |

### CT-25 – Administrador não edita usuários nem conteúdo de outros usuários (papel de moderação) (RF10, RNF02) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Rotas de edição de usuário pelo admin não existem (PUT /admin/usuarios/{código} e /usuarios/{código}: 405) | Conforme: 405 / 405 |
| 2 | Cadastro da Conta B intacto (nome, e-mail e papel comum, sem telefone) | Conforme |
| 3 | PUT /admin/idiomas/{código} não existe (405) | Conforme: 405 |
| 4 | Editar idioma, criar módulo e criar frase em conteúdo alheio: 403 com a mensagem de moderação | Conforme: 403, 403, 403 |
| 5 | Conteúdo da Conta B inalterado (sem "Editado pelo admin" nem "Modulo do admin") | Conforme |
| 6 | As 3 tentativas recusadas com 403 viram logs com selo "Bloqueada" (as 405 não geram log) | Conforme: Tentou criar frase em idioma de outro usuário \| Tentou criar módulo em idioma de outro usuário \| Tentou editar idioma de outro usuário |

### CT-26 – Administrador não cria, importa, avalia nem denuncia idiomas (RF10) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Criar, importar, avaliar e denunciar como admin: 403 nas quatro, com a mensagem de moderação | Conforme: 403, 403, 403, 403 |
| 2 | Nada foi criado nem alterado: sem "Idioma do admin", avaliação e denúncias iguais | Conforme |
| 3 | Quatro logs "Bloqueada" ("Tentou criar/importar/avaliar/denunciar idioma") | Conforme: Tentou denunciar idioma \| Tentou avaliar idioma \| Tentou importar idioma \| Tentou criar idioma |

### CT-27 – Rotas administrativas protegidas: token comum, sem token e guardas do frontend (RF10, RNF02) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Com token de usuário comum: 403 nas rotas /admin, sem dados no corpo | Conforme: 403, 403, 403 |
| 2 | Sem token: 403 | Conforme: 403 |
| 3 | A tentativa de desativar com token comum não teve efeito (Conta B ativa) | Conforme: ativo |
| 4 | Logado como usuário comum, /controle-adm e /visualizar-idioma-adm redirecionam para /home | Conforme: /home, /home |
| 5 | Sem sessão, /controle-adm e /home redirecionam para /login | Conforme: /login, /login |

### CT-28 – Identificadores públicos, dados sensíveis, senhas e uploads (RNF02, RNF03) · Reprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | IDs numéricos não abrem idiomas nem usuários (404) | Conforme: 404 Idioma não encontrado \| 404 Usuário não encontrado \| 404 Idioma não encontrado |
| 2 | GET /idiomas/{código}: "codigo" IDM-… e "codigoCriador" USR-…, sem "id" e "criadorId" | Conforme |
| 3 | Nenhuma resposta traz senha ou hash (/usuarios/me, /idiomas/meus, /idiomas/{código}) | Conforme |
| 4 | Inspeção do código: senhas cifradas com BCryptPasswordEncoder; sessão STATELESS | Conforme |
| 5 | Upload de áudio verifica o conteúdo: texto e HTML renomeados para .mp3 são recusados (400) | Conforme: 400 / 400 |
| 6 | Upload de imagem verifica o conteúdo (SVG com <script> deveria ser recusado) | Divergente: HTTP 200: o arquivo SVG com <script> foi aceito e servido como image/svg+xml (defeito D1, já registrado no projeto). Em produção, os arquivos enviados são entregues com política de conteúdo em sandbox e sem detecção de tipo. |
| 7 | Upload exige autenticação | Conforme: 403 |

### CT-29 – Navegação entre telas sem ciclos (Voltar contextual) (RNF04) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Busca → idioma de outro usuário: URL com id=IDM-… e origem=buscar-idioma; botões Denunciar, Avaliar e Importar | Conforme: ?id=IDM-4E5A7BC5ED09&origem=buscar-idioma |
| 2 | Módulo aberto sem controles de dono e com a origem preservada na URL | Conforme: ?id=183&idIdioma=IDM-4E5A7BC5ED09&origem=buscar-idioma |
| 3 | Voltar × 3: módulo → idioma → /buscar-idioma → /home | Conforme: /visualizar-idioma → /buscar-idioma → /home |
| 4 | Perfil próprio → idioma → módulo → Nova Frase → Voltar: módulo → idioma → perfil → /buscar-usuario (origem sobrevive ao cadastro de frase) | Conforme: /visualizar-modulo → /visualizar-idioma → /visualizar-usuario?id=USR-F9C4B9AAAF58 → /buscar-usuario |

### CT-30 – Cópia do código público (perfil, perfil público e idioma), por clique e teclado (RNF04) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Perfil: clicar no código mostra "ID copiado!", copia exatamente o USR-… e volta ao código depois de ~2 s | Conforme: ID copiado! · USR-F9C4B9AAAF58 |
| 2 | Teclado: Enter e Espaço copiam, e o Espaço não rola a página | Conforme: USR-F9C4B9AAAF58 / USR-F9C4B9AAAF58 |
| 3 | Perfil público: "ID copiado!" e cópia do USR-… da Conta B | Conforme: ID copiado! · USR-FD4417ABD7F1 |
| 4 | Página do idioma: "ID do Idioma copiado para a área de transferência!" e cópia do IDM-… | Conforme: IDM-4E5A7BC5ED09 |

### CT-31 – Topbar: nome, alternância de tema e de sons, com preferência persistida (RNF04) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Topbar mostra só o primeiro nome, com inicial maiúscula ("Ana") | Conforme |
| 2 | Botão de tema alterna claro/escuro e a escolha se mantém ao recarregar | Conforme: escuro → claro → (após recarregar) claro |
| 3 | Botão de som alterna "Ativar sons"/"Desativar sons" e a escolha se mantém ao recarregar | Conforme: Desativar sons → Ativar sons → Ativar sons |
| 4 | Com os sons desligados, jogar não gera nenhum som (nenhum oscilador criado) | Conforme: 0 osciladores |
| 5 | Religar os sons toca uma amostra curta | Conforme: 2 osciladores |

### CT-32 – Responsividade (desktop e 375 px) e temas claro/escuro nas telas principais (RNF01, RNF04) · Reprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | 20 telas × 2 larguras × 2 temas (80 combinações): nenhuma rolagem horizontal | Divergente: rolagem horizontal em 6 das 80 combinações, nos dois temas: aba Usuários do painel (6 px além da área útil em 1.366 px e 40 px em 375 px) e aba Logs em 375 px (3 px) — defeitos D4 e D5 |
| 2 | Nenhum botão, campo ou card fora da tela ou cortado pelo contêiner | Divergente: em 375 px, nos dois temas: no cadastro de conta, o campo "Nome completo" e o botão "Verificar" aparecem cortados pela borda do cartão (D3); na aba Logs, os botões de paginação ultrapassam a largura da tela (D5) |
| 3 | Textos com contraste mínimo de 3:1 contra o fundo (verificação automática aproximada, sem fundos em gradiente) | Divergente: botão "Nova Frase" (Visualizar módulo, tema escuro): contraste de 2,54:1 em 1.366 px e em 375 px (D6) |
| 4 | Inspeção visual das capturas: textos e controles legíveis nos dois temas | Divergente: tela de estudo no tema claro, no computador e em 375 px: o rótulo "Etapa n / N" fica quase invisível e os cartões de frase e de resposta são cinza com texto branco, de baixo contraste (D2). Demais telas sem problemas visíveis. |

### CT-33 (Chrome) – Compatibilidade de navegador: fluxo essencial (RNF01) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Login e home carregam | Conforme: Chrome/156.0.0.0 |
| 2 | Rodada de estudo: Tradução Direta corrigida como "Resposta Correta!" | Conforme |
| 3 | Busca de idiomas lista resultados | Conforme |
| 4 | Home em 375 px sem rolagem horizontal | Conforme: 375px |
| 5 | Painel administrativo abre | Conforme |

### CT-33 (Edge) – Compatibilidade de navegador: fluxo essencial (RNF01) · Aprovado

| Nº | Verificação (resultado esperado) | Resultado obtido |
|---|---|---|
| 1 | Login e home carregam | Conforme: Chrome/156.0.0.0 Edg/156.0.0.0 |
| 2 | Rodada de estudo: Tradução Direta corrigida como "Resposta Correta!" | Conforme |
| 3 | Busca de idiomas lista resultados | Conforme |
| 4 | Home em 375 px sem rolagem horizontal | Conforme: 375px |
| 5 | Painel administrativo abre | Conforme |

## 4. Verificações registradas durante a implementação

Em todas as rodadas, a API foi compilada e o frontend passou pelo build de produção sem erros. A tabela resume as verificações mais abrangentes, identificadas pelo número da rodada no histórico do projeto (`PENDENCIAS.md`).

| Rodada | Escopo | Forma de verificação | Resultado |
|---|---|---|---|
| 8.16 | Permissões do administrador | 27 chamadas à API: rotas removidas, campos proibidos, edição de conteúdo alheio e registro das tentativas bloqueadas | Conforme |
| 8.20 | Desativação, suspensão e reativação de contas | Navegação automatizada de 350 a 1.400 px, nos dois temas | Conforme |
| 8.21 | E-mail do administrador ao usuário | Navegação automatizada em 400 e 1.400 px e chamadas à API (envio aceito, 403 para conta administrativa, 400 para assunto inválido) | Conforme |
| 8.22 e 8.23 | Visualização e exclusão de idioma pelo moderador; acesso rápido nas denúncias | Navegação automatizada | Conforme |
| 8.24 | Registros administrativos (logs) | Chamadas à API sobre o banco local | Revelou falha de restrição no banco, corrigida (seção 5) |
| 8.25 | Navegação, cadastro e e-mails em HTML | Navegação automatizada de 390 a 1.400 px; sete modelos de e-mail disparados e capturados | Conforme |
| 8.26 | Sons da interface | 55 passos com o áudio do navegador instrumentado | 55 de 55 conformes |
| 8.27 | Áudios nas frases | 43 verificações na API e 98 no navegador | 141 de 141 conformes |
| 8.29 | Ordenação da busca por avaliação | Conferência das estrelas de 25 cartões, em 3 páginas | Conforme |
| 8.30 | Publicação em produção | Ambiente local, banco em nuvem e produção: saúde da API, autenticação, listagens, envio de arquivos e entrega de e-mail | Conforme |
| 8.31 | Gravação de áudio pelo microfone | 19 verificações com microfone simulado e conferência em produção | 19 de 19 conformes |

## 5. Defeitos encontrados e corrigidos durante a implementação

| Rodada | Defeito | Correção |
|---|---|---|
| 8.2 | O build do frontend apontava para um arquivo de ícone inexistente, e o ícone da aba do navegador não era publicado. | Configuração do build corrigida |
| 8.5 | Os links para os Termos de Uso e a Política de Privacidade, na tela de cadastro, levavam a rotas inexistentes (erro 404). | Links apontados para as rotas corretas |
| 8.10 | Ao voltar de um módulo aberto sem a referência do idioma, a tela do idioma abria vazia. | Retorno à página inicial nesse caso |
| 8.13 | Ao mover para baixo a última frase de uma página da lista, ela passava à página seguinte e sumia da tela. | A lista acompanha a frase até a página em que ela fica |
| 8.16 e 8.19 | A alteração de situação de usuário aceitava requisições sem validação; um valor ausente ou inválido causava erro interno (500). | Requisição validada, com resposta 400 e mensagem |
| 8.24 | Novos tipos de registro administrativo eram recusados por uma restrição do banco criada com os valores antigos: a ação era executada, mas a resposta era erro 500. | Restrição recriada a partir dos tipos atuais a cada inicialização |
| 8.25 | O botão Voltar das buscas reabria o item visitado, criando um ciclo de navegação; o cadastro de idioma cortava o conteúdo à direita no modo Tradução Direta. | Voltar das buscas leva à página inicial; leiaute do assistente corrigido |
| 8.27 | No quiz, duas alternativas com o mesmo texto confundiam a correção da resposta. | A resposta correta passou a ser localizada pela posição |
