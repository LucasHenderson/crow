# Pendências — levantamento pré-ajustes

Levantamento do estado atual do código, feito antes de qualquer alteração.

Referência: branch `feat/auditoria-tcc-fases-2-6-tema`, commit `10a165b`.

> **Atualização (2026-08-29):** as seções 1–7 continuam sendo o retrato do commit `10a165b`.
> A seção 8, no fim do documento, registra as alterações já aplicadas na árvore de trabalho
> e ainda não commitadas. Onde a seção 8 contradiz as seções 1–7, vale a seção 8.

---

## 1. Exposição de IDs numéricos

### 1.1 Geração do campo `codigo` ("PREFIXO-" + id)

O `codigo` não é um identificador próprio: é o id numérico do banco concatenado a um
prefixo. Qualquer `USR-42` revela que o usuário é o registro 42.

| Prefixo | Onde é gerado | Arquivo:linha |
|---|---|---|
| `USR-` | `AuthService.toUsuarioResponse` | `api/src/main/java/com/crow/api/service/AuthService.java:64` |
| `IDM-` | `IdiomaResponse.from` | `api/src/main/java/com/crow/api/dto/idioma/IdiomaResponse.java:32` |
| `USR-` (criador do idioma) | `IdiomaResponse.from` | `api/src/main/java/com/crow/api/dto/idioma/IdiomaResponse.java:38` |
| `MOD-` | `ModuloController.toResponse` | `api/src/main/java/com/crow/api/controller/ModuloController.java:74` |
| `FRS-` | `FraseController.toResponse` | `api/src/main/java/com/crow/api/controller/FraseController.java:105` |
| `DEN-` | `AdminController.toDenunciaResponse` | `api/src/main/java/com/crow/api/controller/AdminController.java:167` |
| `IDM-` (idioma da denúncia) | `AdminController.toDenunciaResponse` | `api/src/main/java/com/crow/api/controller/AdminController.java:169` |
| `USR-` (denunciante) | `AdminController.toDenunciaResponse` | `api/src/main/java/com/crow/api/controller/AdminController.java:172` |
| `USR-` (responsável) | `AdminController.toDenunciaResponse` | `api/src/main/java/com/crow/api/controller/AdminController.java:179` |
| `LOG-` | `AdminController.listarLogs` | `api/src/main/java/com/crow/api/controller/AdminController.java:149` |
| `USR-` (admin do log) | `AdminController.listarLogs` | `api/src/main/java/com/crow/api/controller/AdminController.java:152` |

### 1.2 DTOs que carregam `codigo` e/ou o `id` cru

Todos os DTOs abaixo expõem o `Long id` **junto** com o `codigo` derivado dele.

- `api/src/main/java/com/crow/api/dto/usuario/UsuarioResponse.java:4-5` — `id`, `codigo`
- `api/src/main/java/com/crow/api/dto/idioma/IdiomaResponse.java:8-9` — `id`, `codigo`
- `api/src/main/java/com/crow/api/dto/idioma/IdiomaResponse.java:14-15` — `criadorId`, `codigoCriador`
- `api/src/main/java/com/crow/api/dto/modulo/ModuloResponse.java:4-5` — `id`, `codigo`
- `api/src/main/java/com/crow/api/dto/frase/FraseResponse.java:4-5` — `id`, `codigo`
- `api/src/main/java/com/crow/api/dto/denuncia/DenunciaResponse.java:4-5` — `id`, `codigo`
- `api/src/main/java/com/crow/api/dto/denuncia/DenunciaResponse.java:6-7` — `idiomaId`, `codigoIdioma`
- `api/src/main/java/com/crow/api/dto/denuncia/DenunciaResponse.java:9-10` — `usuarioId`, `codigoUsuario`
- `api/src/main/java/com/crow/api/dto/denuncia/DenunciaResponse.java:16-17` — `responsavelId`, `codigoResponsavel`
- Logs (`Map` inline): `AdminController.java:148-152` — `id`, `codigo`, `adminId`, `codigoAdmin`

Espelhos no frontend:
`crow/src/app/models/usuario.model.ts:3,14,23`,
`crow/src/app/models/idioma.model.ts:3,15,22,33`,
`crow/src/app/models/denuncia.model.ts:3,5,8,15`,
`crow/src/app/models/log.model.ts:3,6`.

### 1.3 IDs numéricos em query params de navegação

O id do banco viaja na URL em texto puro em todas as navegações internas.

| Origem | Destino / param | Arquivo:linha |
|---|---|---|
| Busca de idiomas | `/visualizar-idioma?id=` | `crow/src/app/pages/buscar-idioma/buscar-idioma.ts:281` |
| Busca de usuários | `/visualizar-usuario?id=` | `crow/src/app/pages/buscar-usuario/buscar-usuario.ts:249` |
| Home | `/visualizar-idioma?id=` | `crow/src/app/pages/home/home.ts:177` |
| Visualizar idioma | `/visualizar-modulo?id=&idIdioma=` | `crow/src/app/pages/visualizar-idioma/visualizar-idioma.ts:683` |
| Visualizar idioma | `/visualizar-usuario?id=` (criador) | `crow/src/app/pages/visualizar-idioma/visualizar-idioma.ts:1024` |
| Visualizar idioma | `/jogar?modulos=[ids]&idIdioma=&ordem=` | `crow/src/app/pages/visualizar-idioma/visualizar-idioma.ts:306-312` |
| Visualizar módulo | `/visualizar-idioma?id=` | `crow/src/app/pages/visualizar-modulo/visualizar-modulo.ts:335,786` |
| Visualizar módulo | `/cadastrar-frase?moduloId=&idIdioma=` | `crow/src/app/pages/visualizar-modulo/visualizar-modulo.ts:343` |
| Cadastrar frase | `/visualizar-modulo?id=&idIdioma=` | `crow/src/app/pages/cadastrar-frase/cadastrar-frase.ts:267` |
| Visualizar usuário | `/visualizar-idioma?id=` | `crow/src/app/pages/visualizar-usuario/visualizar-usuario.ts:129` |

Leitura dos params:
`visualizar-idioma.ts:160`, `visualizar-modulo.ts:148`, `visualizar-usuario.ts:37`,
`cadastrar-frase.ts:68-69`, `jogar.ts:86`.

Caso à parte: `/jogar` recebe **a lista inteira de ids de módulos** serializada em JSON
na query string (`visualizar-idioma.ts:308`).

### 1.4 ID exibido na interface

| Tela | O que aparece | Arquivo:linha |
|---|---|---|
| Buscar idioma | `{{ idioma.codigo }}` no card | `crow/src/app/pages/buscar-idioma/buscar-idioma.html:149` |
| Buscar usuário | `{{ usuario.codigo }}` no card | `crow/src/app/pages/buscar-usuario/buscar-usuario.html:85` |
| Home | `ID: {{ idioma.codigo }}` no card | `crow/src/app/pages/home/home.html:69` |
| Home | `ID do Idioma: {{ idiomaEmEdicao.codigo }}` no modal | `crow/src/app/pages/home/home.html:187` |
| Perfil | badge `{{ user.codigo }}` | `crow/src/app/pages/perfil/perfil.html:44` |
| Visualizar usuário | `ID: {{ usuario.codigo }}` | `crow/src/app/pages/visualizar-usuario/visualizar-usuario.html:35` |
| Visualizar usuário | `{{ idioma.codigo }}` nos cards de idioma | `crow/src/app/pages/visualizar-usuario/visualizar-usuario.html:100` |
| Controle ADM — denúncias | `ID: {{ denuncia.codigoIdioma }}` | `crow/src/app/pages/controle-adm/controle-adm.html:150` |
| Controle ADM — denúncias | `({{ denuncia.codigoUsuario }})` | `controle-adm.html:163` |
| Controle ADM — denúncias | `({{ denuncia.codigoResponsavel }})` | `controle-adm.html:178` |
| Controle ADM — usuários | `ID: {{ usuario.codigo }}` | `controle-adm.html:309` |
| Controle ADM — idiomas | `({{ idioma.codigoCriador }})` | `controle-adm.html:413` |
| Controle ADM — idiomas | `ID: {{ idioma.codigo }}` | `controle-adm.html:421` |
| Controle ADM — logs | `{{ log.codigo }}` | `controle-adm.html:586` |
| Controle ADM — logs | `({{ log.codigoAdmin }})` | `controle-adm.html:599` |
| Controle ADM — modal denúncia | `ID da Denúncia: {{ ...codigo }}` | `controle-adm.html:671,678,687,720` |
| Controle ADM — modal usuário | `ID do Usuário: {{ usuarioEmEdicao.codigo }}` | `controle-adm.html:775,780` |
| Controle ADM — modal desativar | `(ID: {{ usuarioEmDesativacao?.codigo }})` | `controle-adm.html:915` |
| Controle ADM — modal idioma | `ID do Idioma: {{ idiomaEmEdicao.codigo }}` | `controle-adm.html:948,953` |
| Controle ADM — modal excluir | `(ID: {{ idiomaEmExclusao?.codigo }})` | `controle-adm.html:1095` |

Não exibem ID: `visualizar-idioma.html`, `visualizar-modulo.html`, `jogar.html`.

### 1.5 IDs numéricos no corpo dos logs administrativos

As mensagens gravadas em `LogAdmin` incluem o id cru como detalhe:
`AdminController.java:52` ("Alterou status da denúncia #" + id), `:79` e `:121` ("ID: " + id),
`:135` ("ID: " + id).

---

## 2. Endpoints do `AdminController`

Base: `/api/admin` — `api/src/main/java/com/crow/api/controller/AdminController.java`

| # | Método | Rota | Linha | O que faz |
|---|---|---|---|---|
| 1 | GET | `/denuncias` | 34-41 | Lista todas as denúncias, mapeadas por `toDenunciaResponse`. Sem paginação e sem filtro. |
| 2 | PUT | `/denuncias/{id}/status` | 43-56 | Altera o status da denúncia e grava log `DENUNCIA`. Corpo validado (`AlterarStatusDenunciaRequest`). Registra o admin como responsável. |
| 3 | GET | `/usuarios` | 60-67 | Lista todos os usuários via `authService::toUsuarioResponse`. Sem paginação. |
| 4 | PUT | `/usuarios/{id}` | 69-82 | Edita nome, email, telefone, papel e senha do usuário. Grava log `USUARIO`. |
| 5 | PUT | `/usuarios/{id}/status` | 84-98 | Ativa/inativa usuário. Recebe `Map<String,String>` **sem DTO nem validação** (`body.get("status")` nulo causa NPE; valor inválido em `valueOf` gera 500). Grava log `USUARIO`. |
| 6 | GET | `/idiomas` | 102-109 | Lista todos os idiomas via `IdiomaResponse::from`. Sem paginação. |
| 7 | PUT | `/idiomas/{id}` | 111-124 | Edita o idioma sem exigir propriedade (`editarComoAdmin`). Grava log `IDIOMA`. |
| 8 | DELETE | `/idiomas/{id}` | 126-139 | Exclui o idioma e seus vínculos. Grava log `IDIOMA` **antes** da exclusão. |
| 9 | GET | `/logs` | 143-160 | Lista os logs administrativos como `Map` inline (não há DTO próprio). Sem paginação. |

Observações:

- O admin é sempre resolvido por `usuarioService.buscarPorId(Long.valueOf(authentication.getName()))`
  — trecho repetido em 5 métodos (linhas 48, 74, 89, 116, 130).
- Não há endpoint de exclusão de usuário: a única baixa possível é a inativação (#5).
- Não há endpoint administrativo para módulos ou frases.
- `GET /logs` monta `Map.of(...)` com 9 pares; `Map.of` rejeita valores nulos, e nem `log.getAcao()`
  (`:154`) nem `log.getDetalhes()` (`:155`) têm garantia de não-nulo na entidade.

---

## 3. Onde o administrador edita usuários e idiomas

### Backend

| Alvo | Ponto de entrada | Serviço | O que pode alterar |
|---|---|---|---|
| Usuário | `AdminController.editarUsuario` (`:69-82`) | `UsuarioService.editarUsuarioAdmin` (`UsuarioService.java:75-95`) | nome, email, telefone (via `atualizarPerfil`), **papel** (`:78-84`) e **senha** (`:86-92`) |
| Usuário | `AdminController.alterarStatusUsuario` (`:84-98`) | `UsuarioService.alterarStatus` | status ativo/inativo |
| Idioma | `AdminController.editarIdioma` (`:111-124`) | `IdiomaService.editarComoAdmin` (`IdiomaService.java:215-222`) | nome, idioma, bandeira, descrição, proficiência, visibilidade — sem checar propriedade |
| Idioma | `AdminController.excluirIdioma` (`:126-139`) | `IdiomaService.excluirComoAdmin` (`IdiomaService.java:207-211`) | exclui o idioma; apaga avaliações e vínculos e desvincula denúncias (`removerVinculosDoIdioma`, `:229-235`) |

DTOs envolvidos: `UsuarioUpdateRequest` (nome, email, telefone, role, novaSenha) e
`IdiomaRequest` (nome, idioma, bandeira, descrição, proficiência, visibilidade).

### Frontend

Camada de serviço — `crow/src/app/services/admin.service.ts`:
`editarUsuarioAdmin` (`:28-30`), `alterarStatusUsuario` (`:32-34`),
`editarIdiomaAdmin` (`:40-42`), `excluirIdiomaAdmin` (`:44-46`).

Tela — `crow/src/app/pages/controle-adm/`:

| Ação | Handler (`.ts`) | Gatilho (`.html`) |
|---|---|---|
| Abrir edição de usuário | `editarUsuario` `:382-391` | botão `:320` |
| Confirmar edição de usuário | `confirmarEdicaoUsuario` `:432-455` | botão `:883` |
| Abrir desativação | `abrirModalDesativarUsuario` `:458` | botão `:330` |
| Confirmar ativação/desativação | `:471-484` | modal `:915` |
| Abrir edição de idioma | `editarIdioma` `:649-658` | botão `:436` |
| Confirmar edição de idioma | `confirmarEdicaoIdioma` `:717-739` | botão `:1062` |
| Abrir exclusão de idioma | `excluirIdioma` `:743` | botão `:443` |
| Confirmar exclusão de idioma | `confirmarExclusaoIdioma` `:758-767` | botão `:1107` |

Campos do modal de usuário (`controle-adm.html:784-831`): nome, email, telefone, papel
(rádio Usuário Comum / Administrador) e nova senha opcional.
Campos do modal de idioma (`controle-adm.html:971-1008`): nome, idioma, descrição,
proficiência e visibilidade.

Edição fora do escopo administrativo, mas com o mesmo formato de modal (dono editando o
próprio idioma): `crow/src/app/pages/home/home.ts:183-255`, via `IdiomaService.editarIdioma`.

---

## 4. Envio de e-mail

Serviço único: `api/src/main/java/com/crow/api/service/EmailVerificationService.java`.

- **Transporte:** `JavaMailSender` do Spring Mail (`:20`); SMTP do Gmail configurado em
  `application.properties:29-34` (host, porta 587, STARTTLS, usuário/senha por variável de ambiente).
- **Formato:** `SimpleMailMessage` — **texto puro, sem HTML e sem identidade visual** (`:42-52`).
  Assunto fixo "Crow - Código de Verificação"; corpo com o código, o prazo e a assinatura "Equipe Crow".
- **Conteúdo:** código numérico de 6 dígitos gerado por `SecureRandom` (`:36`).
- **Armazenamento:** dois `ConcurrentHashMap` **em memória** (`:24-25`) — códigos pendentes e
  e-mails já verificados. Expiram em 10 minutos (`:27`), são perdidos a cada reinício da aplicação
  e não funcionam com mais de uma instância.
- **Falha de envio:** remove o código e lança `ResponseStatusException` 500 (`:56-61`).

**Só existe um tipo de e-mail em todo o sistema — o código de verificação.** Não há e-mail de
boas-vindas, de confirmação de cadastro, de alteração de senha nem de ação administrativa.

> Estado no levantamento. A seção 8.18 acrescentou `EmailService`, com cinco e-mails de
> moderação, e a seção 8.19 ligou três deles (conta desativada, suspensa e reativada —
> esta última também pelo agendador). Idioma excluído e mensagem personalizada seguem sem
> ponto de chamada; cadastro e senha seguem só com o código de verificação.
> A seção 8.25 trocou o `SimpleMailMessage` por HTML com a logo (texto puro como alternativa)
> em todos os e-mails, inclusive o do código, que ganhou texto próprio para a redefinição de senha.

Pontos de chamada:

| Chamada | Onde | Contexto |
|---|---|---|
| `enviarCodigo` | `AuthController.java:36` (`POST /api/auth/enviar-codigo`) | único disparo de e-mail do sistema; serve ao cadastro, à recuperação de senha e à troca de e-mail no perfil |
| `verificarCodigo` | `AuthController.java:47` (`POST /api/auth/verificar-codigo`) | valida o código digitado |
| `isEmailVerificado` | `AuthController.java:53` (`POST /api/auth/redefinir-senha`) | exige verificação prévia |
| `consumirVerificacao` | `AuthController.java:59` | invalida a verificação após redefinir a senha |
| `isEmailVerificado` | `UsuarioController.java:61` (`PUT /api/usuarios/me`) | exige verificação para trocar o e-mail do perfil |
| `consumirVerificacao` | `UsuarioController.java:70` | invalida a verificação após a troca |

Consumo no frontend: `crow/src/app/pages/cadastrar-usuario/`, `crow/src/app/pages/recuperar-senha/`
e `crow/src/app/pages/perfil/` (campos `codigoDigitado`, `codigoEnviado`, `emailVerificado`).

> Nota: `application-local.properties` contém usuário e senha SMTP em texto puro e está
> versionado. Arquivo protegido, fora do escopo de alteração — fica apenas registrado.

---

## 5. Ícones SVG inline

**386 ocorrências de `<svg>` no projeto**: 380 ícones inline em componentes e 6 arquivos de
bandeira em `assets/`.

| Arquivo | Ícones |
|---|---|
| `crow/src/app/pages/visualizar-idioma/visualizar-idioma.html` | 75 |
| `crow/src/app/pages/controle-adm/controle-adm.html` | 72 |
| `crow/src/app/pages/visualizar-modulo/visualizar-modulo.html` | 38 |
| `crow/src/app/pages/cadastrar-idioma/cadastrar-idioma.html` | 30 |
| `crow/src/app/pages/cadastrar-frase/cadastrar-frase.html` | 27 |
| `crow/src/app/pages/cadastrar-usuario/cadastrar-usuario.html` | 22 |
| `crow/src/app/pages/home/home.html` | 21 |
| `crow/src/app/pages/perfil/perfil.html` | 20 |
| `crow/src/app/pages/recuperar-senha/recuperar-senha.html` | 20 |
| `crow/src/app/pages/jogar/jogar.html` | 19 |
| `crow/src/app/pages/visualizar-usuario/visualizar-usuario.html` | 9 |
| `crow/src/app/pages/buscar-usuario/buscar-usuario.html` | 7 |
| `crow/src/app/pages/buscar-idioma/buscar-idioma.html` | 6 |
| `crow/src/app/pages/login/login.html` | 6 |
| `crow/src/app/components/topbar/topbar.html` | 5 |
| `crow/src/app/pages/visualizar-modulo/visualizar-modulo.ts` | 3 (SVG em string dentro do `.ts`) |
| **Subtotal componentes** | **380** |
| `crow/src/assets/imgs/*.svg` (6 bandeiras) | 6 |

Sem ícones: `app.html`, `index.html`, `auth-layout.html`, `main-layout.html`.

Conformidade com a convenção (`stroke="currentColor"`, `stroke-width="2"`, `viewBox="0 0 24 24"`):

- `viewBox="0 0 24 24"`: 379 de 386. As 7 exceções são as bandeiras em `assets/`
  (`0 0 9 6`, `0 0 7410 3900`, `0 0 3 2`, `0 0 200 200`, `-2100 -1470 4200 2940`) — legítimas.
- `stroke="currentColor"`: 360 ocorrências. Restam **cerca de 20 ícones inline sem
  `stroke="currentColor"`** (nenhum usa `fill="currentColor"`) — candidatos a cor fixa fora
  do sistema de temas.
- Não há componente de ícone nem registry: cada ícone é repetido literalmente em cada template,
  e os mesmos desenhos (voltar, editar, excluir, fechar, buscar) se repetem em quase todas as páginas.

---

## 6. "Todos os direitos reservados"

Ocorrência **única** em todo o projeto:

- `crow/src/app/pages/login/login.html:128` — `© 2025 - Todos os direitos reservados`

Consequências: o ano está fixo em 2025; o texto não aparece em nenhuma outra tela; e não há
rodapé nos layouts (`auth-layout.html`, `main-layout.html`) nem no `app.html`.

---

## 7. Comportamento do "voltar"

As três telas resolvem o voltar de formas **diferentes e incompatíveis entre si**.

### `visualizar-idioma`

`crow/src/app/pages/visualizar-idioma/visualizar-idioma.ts:670-676` — botão em
`visualizar-idioma.html:6` (`btn-voltar`).

```ts
voltar(): void {
  if (this.isProprietario) { this.router.navigate(['/home']); return; }
  window.history.back();
}
```

Ramifica pelo papel: o dono vai sempre para `/home`; o visitante cai em `window.history.back()`
puro, sem `Location` e sem fallback — em acesso direto por URL colada, o `back()` sai da aplicação.

### `visualizar-modulo`

`crow/src/app/pages/visualizar-modulo/visualizar-modulo.ts:333-339` — botão em
`visualizar-modulo.html:4` (`btn-voltar-lista`, rotulado "Voltar", método `voltarParaLista`).

```ts
voltarParaLista(): void {
  if (this.idIdioma) this.router.navigate(['/visualizar-idioma'], { queryParams: { id: this.idIdioma } });
  else this.router.navigate(['/visualizar-idioma']);
}
```

Não usa histórico: sempre navega para `/visualizar-idioma`. Sem `idIdioma`, navega para a tela
**sem parâmetro**, que carrega vazia (o `ngOnInit` em `:160` depende do `id`).

### `visualizar-usuario`

`crow/src/app/pages/visualizar-usuario/visualizar-usuario.ts:137-143` — botão em
`visualizar-usuario.html:6` (`btn-voltar`). Único que injeta `Location` (`:33`).

```ts
voltar(): void {
  if (window.history.length > 1) this.location.back();
  else this.router.navigate(['/buscar-usuario']);
}
```

Usa `Location.back()` com fallback para `/buscar-usuario`. Mas `window.history.length > 1` conta
o histórico da aba inteira, não o da aplicação — também pode voltar para fora do Crow.

**Resumo:** três estratégias (rota fixa por papel / rota fixa por parâmetro / histórico com
fallback), dois nomes de método (`voltar` e `voltarParaLista`), duas classes de botão
(`btn-voltar` e `btn-voltar-lista`), e nenhuma delas guarda a origem real da navegação.

---

## 8. Alterações aplicadas (não commitadas)

Validação (reexecutada em 2026-09-21, após a visualização e exclusão de idioma — seção 8.22):
`cd api && ./mvnw -q compile` → **exit 0**;
`cd crow && npm run build` → **exit 0** (dois avisos pré-existentes de orçamento de CSS em
`controle-adm.css` e `visualizar-idioma.css`, ambos anteriores a estas mudanças — o
`visualizar-idioma.css` já estava 19 kB acima do orçamento de 32 kB no commit `10a165b`;
o `controle-adm.css` encolheu 90 linhas na seção 8.17, cresceu ~300 na 8.20 e ~50 na 8.21 e
encolheu 234 na 8.22, ficando 5,1 kB acima, em 37,1 kB).

### 8.1 Concluído

| # | Item | Arquivos |
|---|---|---|
| 1 | Ano do copyright: `© 2025` → `© 2026`. Confirmada ocorrência **única** no projeto (varredura por "direitos reservados", `©`, `&copy;` e `2025`). | `crow/src/app/pages/login/login.html:128` |
| 2 | Nome do usuário na topbar capitalizado no `.ts` (`"lucas"`/`"LUCAS"` → `"Lucas"`), via `toLocaleUpperCase('pt-BR')`/`toLocaleLowerCase('pt-BR')`. Sem `text-transform`. | `crow/src/app/components/topbar/topbar.ts:31-47` |
| 3 | Contraste do toggle de tema: `.theme-toggle` passou de `color: var(--color-text)` (quase preto no tema claro, sobre a barra navy fixa) para `#ffffff`. Borda e hover alinhados à escala branca do resto da topbar. | `crow/src/app/components/topbar/topbar.css:350-370` |
| 4 | Logo branca **gerada como arquivo** (500×500, alpha do original preservado, RGB forçado a branco) via `sharp` executado por `npx sharp-cli` — sem dependência nova no `package.json`. Topbar passou a usá-la. | `crow/src/assets/imgs/logo-branca.png` (novo), `crow/src/app/components/topbar/topbar.html:5` |
| 5 | `apple-touch-icon` criado (180×180, corvo branco sobre `#15263f`) e referenciado no `index.html`, junto com o `favicon.ico`. | `crow/public/apple-touch-icon.png` (novo), `crow/src/index.html:9-10` |
| 6 | **Bug de build corrigido:** a lista `assets` do `angular.json` apontava para `src/favicon.ico`, arquivo inexistente — o Angular ignorava silenciosamente e **nenhum favicon chegava ao `dist`**, deixando o `<link rel="icon">` em 404 em produção. Substituído pelo glob padrão sobre `public/`. | `crow/angular.json:19-25` |

### 8.2 Verificado e mantido como está

- **`crow/public/favicon.ico` já é o ícone da Crow**, não o padrão do Angular (ICO decodificado
  e renderizado para conferência). Por isso não foi regerado. **Porém tem contraste ruim:** corvo
  navy escuro sobre fundo navy `#1e3e67`, quase ilegível na aba. Regerar com o corvo branco sobre
  navy — igual ao `apple-touch-icon` — é uma pendência em aberto.

### 8.3 Auditoria de ícones SVG — diagnóstico concluído, correção **não** aplicada

Varredura completa dos **377 SVGs inline** em 15 arquivos `.html` (63 desenhos distintos).
Nenhum arquivo foi alterado: a etapa de correção depende de três decisões ainda em aberto.

Achados confirmados:

1. **306 dos 377** SVGs sem `stroke-linecap`/`stroke-linejoin` (terminais e vértices quadrados).
   Concentração: `visualizar-idioma.html` 75/75, `controle-adm.html` 72/72,
   `visualizar-modulo.html` 38/38, `cadastrar-idioma.html` 30/30, `cadastrar-frase.html` 27/27.
   **Em parte resolvido na seção 8.26:** os SVGs que desenham um ponto (`x2="N.01"` — o ponto do
   "!", do "?", do "i" e marcadores de lista) ganharam ponta redonda; sem ela o ponto sumia.
2. **Mesmo conceito com desenhos divergentes:** "Excluir" tem **3 lixeiras diferentes**
   (19 + 8 + 1 usos; `visualizar-modulo.html` usa as três); "Editar" tem 2 lápis;
   "Voltar" tem chevron (11 telas) e seta (3 telas); "Enviar" tem 2 construções do mesmo avião.
3. **Ícones incompletos:** `controle-adm.html:372` usa metade do ícone `users` (renderiza
   descentrado); `controle-adm.html:485` usa globo sem o meridiano.
4. **Ícone não representa o conceito:** cadeado usado como ícone de **"ID"** em 8 lugares
   (e corretamente como senha em outros 4); o ícone de "Tradução Direta" tem subpath
   degenerado `M9 7v1`. O gráfico de pizza usado para "Gerar Idioma (IA)" em `home.html:151`
   **deixou de existir** — o card foi removido na seção 8.7.
   **Tradução Direta resolvida na seção 8.26** (ícone `languages` do Lucide).
5. **`stroke-width` fora do padrão:** `jogar.html:215` e `:218` (`3`), `perfil.html:20` (`2.5`),
   `visualizar-idioma.css:571` e `:1270` (`3`).
6. **Cor fixa fora da paleta:** anel de progresso em `jogar.html:308-318` com gradiente
   `#8b5cf6`/`#a78bfa` hardcoded e `jogar.css:1048` com slate fixo que não acompanha o tema.
7. **20 SVGs sem `fill`/`stroke` no markup**, dependentes de regra CSS externa. Todos os 20
   foram conferidos um a um e **funcionam hoje**, mas contrariam a convenção do `CLAUDE.md`.
8. A lista `rawIcons` de 24 ícones de módulo está **triplicada** em `visualizar-idioma.ts:116`,
   `visualizar-modulo.ts:40` e `cadastrar-idioma.ts:96`. Conferidas item a item: **não divergem
   hoje**. Qualquer correção precisa ser aplicada nas três cópias.
   **Resolvido na seção 8.25:** lista única `ICONES_MODULO` em `modulo.model.ts`, com ícones novos.

> As três referências de `jogar.*` acima foram reposicionadas na seção 8.14, que inseriu
> linhas antes delas. O diagnóstico em si não mudou.

Decisões pendentes antes de corrigir: (a) normalizar ou preservar o `stroke-width: 3` dos
checkboxes; (b) inlinear os atributos dos 20 SVGs dependentes de CSS — o que obriga a mexer em
5 arquivos `.css`, fora do escopo "apenas ícones"; (c) unificar `rawIcons` ou manter as 3 cópias.

### 8.4 Migração de identificadores públicos (Usuario, Idioma, Denuncia)

Substitui o `codigo` derivado (`"USR-" + id`) por um identificador **aleatório e persistido**,
no formato `PREFIXO-` + 12 hexadecimais maiúsculos gerados por `SecureRandom`
(ex.: `USR-BCEF874442BF`). O `id` Long continua como chave primária interna.

**Escopo desta fase:** `Usuario`, `Idioma` e `Denuncia`. `Modulo`, `Frase`, `Avaliacao`,
`IdiomaUsuario` e `LogAdmin` **não** foram alterados — o `codigo` deles segue derivado do id.

Backend:

| O que | Arquivos |
|---|---|
| Gerador do código público (`SecureRandom`, 6 bytes → 12 hex) e helper `ehNumerico` | `api/src/main/java/com/crow/api/util/CodigoPublico.java` (novo) |
| Campo `codigo` (`unique`, `length 20`) + geração no `@PrePersist` | `entity/Usuario.java`, `entity/Idioma.java`, `entity/Denuncia.java` |
| Backfill idempotente na subida (`ApplicationRunner` + `@Transactional`) | `config/CodigoPublicoBackfill.java` (novo) |
| `findByCodigo`, `existsByCodigo`, `findByCodigoIsNull` | `repository/{Usuario,Idioma,Denuncia}Repository.java` |
| `buscarPorCodigo` (404) e `resolver(String)` com compatibilidade numérica | `service/{Usuario,Idioma,Denuncia}Service.java` |
| Rotas de recurso agora usam `@PathVariable String codigo` | `controller/{Usuario,Idioma,Admin}Controller.java` |
| DTOs passam a ler o `codigo` persistido em vez de concatenar prefixo + id | `dto/usuario/UsuarioResponse.java`, `dto/idioma/IdiomaResponse.java`, `dto/denuncia/DenunciaResponse.java`, `service/AuthService.java`, `AdminController.toDenunciaResponse` e `listarLogs` |

Frontend:

| O que | Arquivos |
|---|---|
| `codigo` no model `IdiomaUsuario` (faltava; usado no modal de importação) | `crow/src/app/models/idioma.model.ts` |
| Assinaturas `id: number \| string` → `codigo: string`; `getIdiomaPorId`→`getIdiomaPorCodigo`, `getUsuarioPorId`→`getUsuarioPorCodigo` | `services/idioma.service.ts`, `services/usuario.service.ts`, `services/admin.service.ts` |
| Navegação por `queryParams` passando o código | `pages/home/home.ts`, `buscar-idioma.ts`, `buscar-usuario.ts`, `visualizar-usuario.ts`, `visualizar-idioma.ts`, `visualizar-modulo.ts` |
| Chamadas administrativas por código (inclusive a busca de índice na lista, que passou de `id` para `codigo`) | `pages/controle-adm/controle-adm.ts` |

Pontos de atenção registrados:

1. **A coluna `codigo` ficou `nullable` no mapeamento JPA, de propósito.** Com `ddl-auto=update`
   o Hibernate não consegue adicionar `NOT NULL` a uma tabela que já tem linhas. O índice único
   já é criado na subida e convive com nulos (o Postgres não os trata como duplicados), então a
   proteção contra colisão está ativa. Tornar a coluna `NOT NULL` fica para uma migração futura.
2. **Compatibilidade numérica temporária**: `resolver(String)` aceita id numérico além do código,
   marcado com `// TODO remover compatibilidade numérica após migração completa do frontend`.
   Isso mascara regressões — uma URL antiga com id numérico continua abrindo.
3. **Os ids numéricos continuam nos DTOs de resposta**, marcados com `// TODO Fase 21`, porque o
   frontend ainda depende deles (`criadorId` na checagem de proprietário, por exemplo).
4. **`isProprietario` ainda compara id numérico** (`user.id === idioma.criadorId`) em
   `visualizar-idioma.ts` e `visualizar-modulo.ts`. Mantido assim para não quebrar sessões salvas
   no `localStorage` antes de o campo `codigo` existir.
5. **Endpoints de módulo e frase seguem numéricos.** O query param `idIdioma` passou a carregar o
   **código**, mas as chamadas de módulo exigem o id numérico — resolvido pelo campo
   `idIdiomaNumerico`, preenchido a partir da resposta do `GET /idiomas/{codigo}`.
   Em `visualizar-modulo.ts` isso mudou a ordem de carregamento: `carregarModulo()` agora só
   dispara **depois** da resposta do idioma (antes as duas chamadas eram paralelas).
6. `LogAdmin` ainda expõe `"LOG-" + id`, e as rotas de módulo/frase continuam com `idiomaId`
   numérico no path — o id sequencial do idioma segue exposto por esse caminho.

Backfill executado com a aplicação no ar: **8 registros preenchidos** (4 usuários, 3 idiomas,
1 denúncia). Segunda subida: "nenhum registro pendente" — idempotência confirmada.

---

### 8.5 Páginas institucionais e limpeza do cadastro — **concluído**

Somente frontend; nada do backend foi tocado nesta etapa.

| # | Item | Arquivos |
|---|---|---|
| 1 | **Termos de Uso** criados: 11 seções numeradas (objeto, cadastro e conta, responsabilidade pelo conteúdo, propriedade e licença do conteúdo colaborativo, conduta proibida, denúncias e moderação, suspensão/exclusão, isenção de garantias, alterações, foro, contato). Botão Voltar (`.btn-voltar` global) e data de última atualização no topo. | `crow/src/app/pages/termos-de-uso/` (novo: `.ts`, `.html`, `.css`) |
| 2 | **Política de Privacidade** criada: 11 seções numeradas (controlador, dados coletados, finalidade, base legal por artigo da LGPD, compartilhamento, retenção, direitos do titular, cookies e `localStorage`, segurança, alterações, contato). Mesmo layout e mesmo botão Voltar. | `crow/src/app/pages/politica-de-privacidade/` (novo: `.ts`, `.html`, `.css`) |
| 3 | Ambas registradas no bloco do `AuthLayout` (**acessíveis sem login**), como `termos-de-uso` e `politica-de-privacidade`, com `loadComponent`. Geram chunks lazy próprios no build. | `crow/src/app/app.routes.ts:24-31` |
| 4 | Card **"Benefícios da Conta"** removido do cadastro, com o CSS órfão (`.info-card`, `.benefits-content`, `.benefit-item`, `.benefit-text`) e suas referências em 5 media queries. Nenhuma propriedade do `.ts` existia só para ele. | `cadastrar-usuario.html`, `cadastrar-usuario.css` |
| 5 | Layout restante reajustado: `.cadastro-grid` deixou de ser `380px 1fr` e virou coluna única `minmax(0, 720px)` centralizada — sem o vazio à esquerda. O media query de 1024px, que só existia para reempilhar as duas colunas, foi eliminado. | `cadastrar-usuario.css` |
| 6 | Botão **Voltar** adicionado no topo do cadastro, no padrão global `.btn-voltar` (chevron + rótulo), com `Location.back()` e fallback para `/login`. | `cadastrar-usuario.html`, `cadastrar-usuario.ts` |
| 7 | Texto de aceite junto ao botão de concluir cadastro, com links para as duas páginas em nova aba (`target="_blank" rel="noopener"`). | `cadastrar-usuario.html`, `cadastrar-usuario.css` (`.aceite-texto`) |
| 8 | **Bug corrigido:** os links do checkbox de termos apontavam para `/termos` e `/privacidade`, rotas que **não existem** — davam 404. Corrigidos para as rotas reais. | `cadastrar-usuario.html` |

Todo o CSS novo usa exclusivamente tokens (`--surface-glass`, `--color-muted`, `--color-primary`,
`--border-color`…), sem cor fixa — os dois temas funcionam sem regra adicional.

**Em aberto nesta etapa:**

- Dois marcadores `[PREENCHER]` aguardando informação do autor: **e-mail de contato** (aparece nos
  Termos §11 e na Política §1, §7 e §11) e **comarca do foro** (Termos §10). Estão destacados
  visualmente na página, então não passam despercebidos em produção.
- A data "29 de agosto de 2026" está **literal** nos dois arquivos `.html`; precisa ser atualizada
  à mão a cada revisão dos documentos.
- **Redundância de aceite:** a tela agora tem o checkbox obrigatório ("Eu aceito os Termos…",
  ligado a `aceitouTermos`) **e** o texto informativo abaixo do botão. Remover o checkbox exigiria
  também retirar a validação de `aceitouTermos` — decisão do autor, não aplicada.
- Não há link para os dois documentos fora do cadastro (login, rodapé ou topbar). Entra
  naturalmente na Fase 19, junto com o rodapé global.

---

### 8.6 Cancelamento da etapa de código em `recuperar-senha` — **concluído**

Somente frontend; nada do backend foi tocado nesta etapa. Build do Angular e `mvnw compile` da
API rodados após a alteração — ambos passam.

| # | Item | Arquivos |
|---|---|---|
| 1 | Na **etapa 2** (digitação do código de 6 dígitos), o botão **"Voltar"** (`voltarEtapa()`, com chevron) foi substituído por **"Cancelar"** (`cancelarVerificacao()`), sem ícone — mesmo formato do "Cancelar" da etapa 1. Classe `btn-secondary` e `[disabled]="carregando"` mantidos. | `recuperar-senha.html:152-154` |
| 2 | Novo método `cancelarVerificacao()`: volta para `etapaAtual = 1` e descarta todo o estado intermediário — `email`, `codigoDigitado`, `novaSenha`, `confirmarSenha`, `camposVisiveis`, os quatro campos de mensagem (`emailErro`, `codigoErro`, `senhaErro`, `mensagemCodigo`) e as flags `enviandoCodigo`, `verificandoCodigo` e `carregando`. Encerra com `forcarAtualizacao()`, seguindo o padrão do componente. | `recuperar-senha.ts:113-132` |
| 3 | O cancelamento **não navega para fora da página**. O `cancelar()` antigo, que faz `router.navigate(['/login'])`, continua existindo e segue ligado apenas ao botão da etapa 1. | `recuperar-senha.ts` |

**Motivo:** voltar da etapa 2 para a etapa 1 deixava o fluxo inconsistente, porque o código já
havia sido enviado ao e-mail — o usuário podia trocar o e-mail e cair na etapa 2 com um código
emitido para outro endereço.

**Verificado:** **não existe contador/temporizador de reenvio** neste fluxo. O botão "Reenviar
código" (`recuperar-senha.html:146`) é controlado apenas pela flag `enviandoCodigo`, que o
cancelamento zera. Se um cooldown real for adicionado no futuro, ele precisa ser reiniciado
dentro de `cancelarVerificacao()`.

**Intacto:** etapas 1 e 3 sem alteração; `voltarEtapa()` permanece no componente, usado pelo
botão "Voltar" da etapa 3.

---

### 8.7 Home: cards de idioma no mobile e limpeza do modal de opções — **concluído**

Somente frontend; nada do backend foi tocado nesta etapa. `./mvnw -q compile` da API e
`npm run build` do Angular rodados após a alteração — ambos passam.

**Cards de idioma em dispositivos móveis** (`home.css`, bloco novo `@media (max-width: 768px)`
no fim do arquivo). O `home.html` **não foi alterado** para esta parte: a marcação do desktop
continua idêntica e todo o comportamento acima de 768px foi preservado.

| # | Item | Arquivos |
|---|---|---|
| 1 | O `.info-box` (ID, nota, módulos e descrição) deixa de ser um popover dependente de hover e passa a integrar o fluxo do card, **sempre visível**: `position: static`, `opacity: 1`, `pointer-events: auto`, largura total. | `home.css` |
| 2 | Os seletores `.card-wrapper:hover .info-box` e `.card-wrapper.info-aberta .info-box` foram **repetidos** dentro do media query. Sem isso o `transform: translate(-50%, 18px)` do hover venceria por especificidade (0,3,0 contra 0,1,0) e reintroduziria o deslocamento. | `home.css` |
| 3 | A seta `.info-box::before` é ocultada no mobile — só faz sentido quando a caixa flutua sobre o card. | `home.css` |
| 4 | Card reorganizado como `flex-direction: column`: bandeira (200×120) e nome no topo, informações abaixo. `.card span` perde o `min-height: 2.6em` reservado para o layout de grid. | `home.css` |
| 5 | `.acoes-card` sai do posicionamento absoluto e vira **barra horizontal estática** no rodapé do card, com `opacity: 1` (nunca dependente de hover) e filete de separação. | `home.css` |
| 6 | **Alvo de toque:** `.mini-btn` passa de 36×36 para **44×44px** no mobile, com ícone de 20px. `.info-mini` explicitamente `display: flex`. | `home.css` |
| 7 | Grid em **coluna única** (`grid-template-columns: 1fr`), gap reduzido para 1.25rem e `padding: 0` — recupera 2rem de largura útil em telas estreitas. | `home.css` |
| 8 | Elevação no hover do `.card-wrapper` neutralizada no mobile (`transform: none`), sem razão de existir onde não há ponteiro. | `home.css` |

**Remoção do card "Gerar Idioma (IA)"** — estava desabilitado, com badge "Em breve", e fora do
fluxo atual.

| # | Item | Arquivos |
|---|---|---|
| 9 | Botão `.opcao-card.disabled` removido do modal "Adicionar Idioma". | `home.html` |
| 10 | Método `gerarIdiomaIA()` (corpo vazio, reservado para evolução futura) removido do componente. | `home.ts` |
| 11 | CSS órfão removido: bloco `/* OPÇÃO DESABILITADA */` (5 regras `.opcao-card.disabled`), `.badge-breve` e o override de `.badge-breve` no `@media (max-width: 480px)`. | `home.css` |
| 12 | Como a classe `.disabled` deixou de existir no template, os qualificadores `:not(.disabled)` foram retirados de três seletores (`.opcao-card:hover`, `.opcao-card:active`, `.opcao-card:hover .opcao-icon`). | `home.css` |
| 13 | `.opcoes-grid` passou de `repeat(2, 1fr)` para `repeat(3, 1fr)`: os 3 cards restantes ocupam uma linha só, **sem buraco** no lugar do removido. Com o modal em 900px menos 2rem de padding lateral, sobram ~262px por card. O `@media (max-width: 768px)` já existente segue colapsando para `1fr`. | `home.css` |

Confirmado por varredura que `gerarIdiomaIA`, `badge-breve` e `opcao-card` não são referenciados
em nenhum outro ponto de `crow/src/`.

**Em aberto nesta etapa:**

- Com o `.info-box` sempre aberto abaixo de 768px, o **botão "info" fica sem efeito visível** no
  mobile. Foi mantido porque a tarefa lista nominalmente os três botões (info, editar, excluir)
  como obrigatoriamente visíveis. Alternativas não aplicadas, dependem de decisão do autor:
  escondê-lo abaixo de 768px, ou convertê-lo em recolher/expandir com estado inicial aberto.
- O bloco anterior `@media (hover: none), (max-width: 600px)` foi **mantido**: ele continua
  cobrindo tablets de toque **acima** de 768px, onde o `.info-box` ainda é popover e o botão
  "info" é a única forma de abri-lo.

### 8.8 Perfil, perfil público e listagem de usuários — **concluído**

Backend e frontend. `cd api && ./mvnw -q compile` e `cd crow && npm run build` rodados após a
alteração — ambos **exit 0**.

**Cópia do código público (Perfil e Visualizar Usuário)**

| # | Item | Arquivos |
|---|---|---|
| 1 | Utilitário compartilhado novo: `ClipboardService.copiar()` usa a Clipboard API e recorre a um `<textarea>` temporário com `execCommand('copy')` quando ela não existe ou é negada (contexto não seguro). Nunca lança — devolve booleano. | `crow/src/app/services/clipboard.service.ts` (novo) |
| 2 | `EstadoCopia` (mesmo arquivo, criado por `clipboard.criarEstado()`): guarda os signals `copiado`/`falhou` e o temporizador de 2s. Como são **signals**, o modo zoneless re-renderiza sozinho — esta parte não precisou de `ChangeDetectorRef`. `destruir()` cancela o timer no `ngOnDestroy`. | `crow/src/app/services/clipboard.service.ts` |
| 3 | Badge do código no Perfil virou `role="button"`, `tabindex="0"`, `aria-live="polite"`, com `title` explicativo e acionável por click, Enter e Espaço (com `$event.preventDefault()` no Espaço para não rolar a página). O texto alterna para "ID copiado!" / "Não foi possível copiar". | `crow/src/app/pages/perfil/perfil.html:44`, `perfil.ts` |
| 4 | Estados visuais `.badge-codigo`: hover, `:active`, `:focus-visible` e as variantes `.copiado` (`--color-success`) e `.falhou` (`--color-danger`), todas por `color-mix` sobre os tokens existentes — nenhuma cor fixa. | `crow/src/app/pages/perfil/perfil.css` |
| 5 | Mesmo comportamento aplicado ao `.id-item` de Visualizar Usuário, que já era clicável mas **sem confirmação, sem acesso por teclado e chamando `navigator.clipboard` direto**. O ícone de cópia vira um "check" enquanto a confirmação está visível. | `visualizar-usuario.html`, `visualizar-usuario.ts`, `visualizar-usuario.css` |
| 6 | Botão Voltar do Perfil ganhou `margin-bottom: 1.5rem`, o mesmo espaçamento já usado em `cadastrar-usuario`, `politica-de-privacidade` e `termos-de-uso`. | `crow/src/app/pages/perfil/perfil.css` |

**Perfil público sem e-mail**

| # | Item | Arquivos |
|---|---|---|
| 7 | Bloco do e-mail removido do template de Visualizar Usuário — é a página pública de **outro** usuário. | `visualizar-usuario.html` |
| 8 | `email` e `id` saíram do estado do componente e da interface `UsuarioVisualizar`: o campo não é mais carregado, não apenas escondido. | `visualizar-usuario.ts`, `crow/src/app/models/usuario.model.ts` |

**Contagem de idiomas e listagem pública**

| # | Item | Arquivos |
|---|---|---|
| 9 | `quantidadeIdiomas` do badge contava **todos** os vínculos de `idiomas_usuarios`, inclusive privados. Nova contagem derivada `countByUsuarioIdAndIdioma_Visibilidade`, exposta por `UsuarioService.contarIdiomasPublicos`. | `IdiomaUsuarioRepository.java`, `UsuarioService.java` |
| 10 | Administradores fora da listagem, **filtrados no banco** (`findByRoleNot` / `findByRoleNotAndNomeContainingIgnoreCase`), não escondidos no frontend. Concentrado em `UsuarioService.buscarPublicos(termo)`. | `UsuarioRepository.java`, `UsuarioService.java` |
| 11 | A mesma listagem **não** é usada pela área administrativa: `controle-adm` consome `/api/admin/usuarios`, que continua em `buscarTodos()` + `authService.toUsuarioResponse` (todos os campos, contagem total). Nenhum endpoint administrativo foi alterado. | `AdminController.java` (inalterado) |
| 12 | `/usuarios/me` e o login também seguem com `toUsuarioResponse` e a contagem completa — o limite de 4 idiomas do próprio usuário continua correto mesmo com idiomas privados. | `AuthService.java` (inalterado) |

**Projeção pública de usuário (segurança)**

| # | Item | Arquivos |
|---|---|---|
| 13 | O endpoint público devolvia o mesmo `UsuarioResponse` do admin, com `email`, `telefone`, `role` e `status`. Criado `UsuarioPublicoResponse` com apenas `codigo`, `nome`, `dataEntrada` e `quantidadeIdiomas` (públicos). | `api/src/main/java/com/crow/api/dto/usuario/UsuarioPublicoResponse.java` (novo) |
| 14 | `GET /usuarios/{codigo}` e `GET /usuarios/buscar` passaram a devolver a projeção reduzida. | `UsuarioController.java` |
| 15 | `GET /api/usuarios` tinha o mesmo vazamento e passou à mesma projeção pública. Não era usado pelo frontend (`listarTodos()` era código morto) e o admin tem rota própria. | `UsuarioController.java`, `crow/src/app/services/usuario.service.ts` |
| 16 | Tipos do frontend alinhados aos DTOs: `UsuarioBusca` e `UsuarioVisualizar` perderam `id` e `email`; `getUsuarioPorCodigo` deixou de ser tipado como `Usuario` (completo) e o `next: (data: any)` virou tipado. | `crow/src/app/models/usuario.model.ts`, `crow/src/app/services/usuario.service.ts` |

**Em aberto nesta etapa:**

- `UsuarioResponse` continua carregando `email`, `telefone`, `role` e `status`, mas agora só é
  servido ao **próprio usuário** (`/usuarios/me`, login/cadastro) e ao **admin**. Nenhuma rota
  entrega esses campos sobre terceiros.
- A mudança do item 15 (`GET /api/usuarios`) foi além do pedido literal, por ser o mesmo
  vazamento do item 13. Se houver consumidor externo dessa rota esperando os campos completos,
  basta reverter o método `listarTodos` do controller.
- `GET /usuarios/{codigo}` **não** exclui administradores: quem tiver o código de um admin ainda
  abre o perfil público dele, agora sem e-mail nem papel. Filtrar também ali depende de decisão.

---

### 8.9 Filtros da busca de idiomas — **concluído**

Somente frontend, escopo restrito a `crow/src/app/pages/buscar-idioma/`.
`cd api && ./mvnw -q compile` e `cd crow && npm run build` rodados após a alteração —
ambos **exit 0**. A filtragem continua no cliente, sobre a lista completa devolvida por
`GET /idiomas`: nenhum endpoint, DTO ou repositório foi tocado.

**Filtros**

| # | Item | Arquivos |
|---|---|---|
| 1 | Filtro por idioma (novo): dropdown de seleção múltipla no mesmo padrão dos existentes. As opções vêm de `extrairOpcoesIdioma()`, que percorre os registros carregados, deduplica com `Set` e ordena com `localeCompare('pt-BR')` — **não** há lista fixa no código, e `IDIOMAS_DISPONIVEIS` do model não é consumido aqui. Idioma sem nenhum registro não aparece no filtro. | `buscar-idioma.ts`, `buscar-idioma.html` |
| 2 | Proficiência passou de seleção única a múltipla: `proficienciaSelecionada: Proficiencia \| null` virou `proficienciasSelecionadas: Proficiencia[]`. Os cinco níveis (`INICIANTE`…`FLUENTE`) saíram do HTML repetido e agora vêm de `niveis` via `*ngFor`, preservando as classes de cor `nivel-*` já existentes. | `buscar-idioma.ts`, `buscar-idioma.html` |
| 3 | Combinação em `idiomasFiltrados`: busca → idioma → proficiência aplicados em sequência (**E** entre filtros), cada um com `includes` sobre o array selecionado (**OU** dentro do filtro). Array vazio = filtro inativo. | `buscar-idioma.ts` |
| 4 | Nenhum dos menus fecha ao marcar uma opção, para permitir marcar vários itens seguidos; só o de ordenação continua fechando na escolha, que segue sendo única. | `buscar-idioma.ts` |
| 5 | Toda mudança de filtro reseta `paginaAtual = 1`, evitando cair numa página que não existe mais no resultado reduzido. | `buscar-idioma.ts` |

**Interface**

| # | Item | Arquivos |
|---|---|---|
| 6 | `resultadosTexto` passou a reagir a `temFiltrosAtivos`. Antes olhava apenas `busca` e `proficienciaSelecionada`; agora o título alterna para "N RESULTADOS ENCONTRADOS" também quando só o filtro de idioma está ativo. | `buscar-idioma.ts` |
| 7 | Botão "Limpar filtros" com `*ngIf="temFiltrosAtivos"` — só aparece quando há busca ou filtro aplicado. Zera busca e os dois filtros e **preserva a ordenação**, que não é filtro. | `buscar-idioma.html`, `buscar-idioma.css` |
| 8 | Indicação de quantas opções estão marcadas: badge `.filtro-count` no botão de cada filtro, mais `.filtro-ativo` mudando borda e texto para o acento. | `buscar-idioma.html`, `buscar-idioma.css` |
| 9 | Cada opção ganhou caixa de marcação `.opcao-check`, que herda `currentColor` — no filtro de proficiência ela assume a cor do nível. As opções "Todos os idiomas" / "Todos os níveis" limpam apenas aquele filtro. | `buscar-idioma.html`, `buscar-idioma.css` |
| 10 | Menu de idioma rola internamente (`max-height: 300px`), já que a lista cresce com o acervo. O deslocamento de `padding-left` no hover foi neutralizado nas opções múltiplas, para o item não fugir do cursor entre um clique e outro. | `buscar-idioma.css` |
| 11 | O `@HostListener('document:click')` e a exclusão mútua dos menus foram estendidos ao terceiro menu; a regra responsiva de 600px que estica os menus passou a incluir `.idioma-menu`. | `buscar-idioma.ts`, `buscar-idioma.css` |
| 12 | CSS aproveitou os seletores agrupados já existentes (`.ordenar, .proficiencia-btn` etc.) em vez de duplicar blocos. Nenhuma cor fixa: tudo por tokens e `color-mix`. Os dois ícones novos (globo e X) seguem a convenção `stroke="currentColor"`, `stroke-width="2"`, `viewBox="0 0 24 24"`. | `buscar-idioma.css`, `buscar-idioma.html` |

**Efeito sobre o retrato das seções 1–7**

As seções 1–7 continuam sendo o estado do commit `10a165b` e **não** foram editadas. Como este
ajuste mexeu no arquivo, três referências de lá agora apontam para outras linhas na árvore de
trabalho:

- **1.3** — `buscar-idioma.ts:281` (navegação por `queryParams`) → hoje `:379`.
- **1.4** — `buscar-idioma.html:149` (`{{ idioma.codigo }}` no card) → hoje `:182`.
- **5** — `buscar-idioma.html` passou de 6 para 8 ícones inline (globo do filtro de idioma e X do
  "Limpar filtros"), ambos dentro da convenção. Nada disso altera o escopo das fases 6 e 7,
  que seguem pendentes.

**Em aberto nesta etapa:**

- As opções do filtro de idioma derivam da **lista completa carregada**, não do resultado já
  filtrado. É deliberado: com facetas reativas, marcar um idioma faria os demais sumirem do
  próprio menu. Se a preferência for o comportamento de faceta, é uma decisão a tomar.
- Os filtros **não** são refletidos na URL. Recarregar a página ou voltar para a busca zera a
  seleção — diferente do resto do projeto, que navega por query params.
- A filtragem segue no cliente, conforme pedido explicitamente nesta fase. O custo real é a
  lista inteira vir do backend a cada abertura da tela; migrar para filtro no servidor fica
  para quando o acervo justificar.

---

### 8.10 Navegação contextual do idioma e última atualização — **concluído**

Backend e frontend. `cd api && ./mvnw -q compile` e `cd crow && npm run build` rodados após a
alteração — ambos **exit 0**. Primeira etapa desde o commit `10a165b` a tocar o backend fora da
migração de identificadores (seção 8.4).

**Navegação por origem (itens 1 e 2 da tarefa)**

O `voltar()` deixou de decidir por papel (`isProprietario`) ou por histórico do navegador e passa
a decidir pela tela de partida, transportada no query param `origem` por toda a cadeia.

| # | Item | Arquivos |
|---|---|---|
| 1 | Tipo `OrigemIdioma` (`'home' \| 'buscar-idioma' \| 'visualizar-usuario'`) e guard `normalizarOrigem()`, que converte valor ausente ou desconhecido em `home` — é aí que mora o fallback, e não espalhado pelas telas. | `crow/src/app/models/idioma.model.ts:13-24` |
| 2 | Emissão da origem nos três pontos de entrada: `home` → `origem=home`, busca → `origem=buscar-idioma`, perfil público → `origem=visualizar-usuario`. | `home.ts:171`, `buscar-idioma.ts:379`, `visualizar-usuario.ts:136` |
| 3 | `visualizar-idioma.voltar()` reescrito: `buscar-idioma` volta para a busca; `visualizar-usuario` volta para `/visualizar-usuario?id=<codigoCriador>` (o código já vem carregado do próprio idioma, dispensando um segundo param); qualquer outro caso vai para `/home`. Sem `window.history.back()`. | `visualizar-idioma.ts:37,169,688-700` |
| 4 | Propagação da origem para baixo: `visualizar-idioma` → `visualizar-modulo` e → `/jogar`. | `visualizar-idioma.ts:323,707` |
| 5 | Devolução da origem para cima: `visualizar-modulo.voltarParaLista()` e o retorno após excluir a última frase do módulo repassam `id` + `origem`; `jogar.voltarAoIdioma()` idem. Com isso o módulo de outro usuário volta para o idioma daquele usuário, e o Voltar de lá continua sabendo o ponto de partida — o ciclo descrito na seção 7 deixa de existir. | `visualizar-modulo.ts:37,162,352-360,807`, `jogar.ts:69,97,497` |
| 6 | **Bug corrigido de passagem:** sem `idIdioma`, o `voltarParaLista()` navegava para `/visualizar-idioma` **sem parâmetro**, carregando a tela vazia (apontado na seção 7). Agora cai em `/home`. | `visualizar-modulo.ts:358` |

**Botão "Limpar seleção" (item 3 da tarefa)**

| # | Item | Arquivos |
|---|---|---|
| 7 | Botão passou a ter `*ngIf="modulosSelecionados.length > 0"` — remoção do DOM, não ocultação por CSS. Reaproveita o getter `modulosSelecionados` que já servia ao `podeIniciar` e ao badge de contagem; nenhum estado novo foi criado. | `visualizar-idioma.html:129` |

**Última atualização do idioma (item 4 da tarefa)**

| # | Item | Arquivos |
|---|---|---|
| 8 | Campo `atualizadoEm` na entidade `Idioma`, nullable (exigência do `ddl-auto=update`), com `@PrePersist` gravando o mesmo instante de `criadoEm` e `@PreUpdate` adicionado. Mesmo padrão já usado em `Modulo`. | `api/.../entity/Idioma.java` |
| 9 | `IdiomaService.registrarAtualizacao(Long)` — ponto único que sobe a alteração até o idioma, já que mudanças em módulo e frase não passam pela entidade `Idioma` e não disparariam o `@PreUpdate` dela. | `api/.../service/IdiomaService.java` |
| 10 | Chamado nas seis operações de conteúdo: `ModuloService.criar/editar/excluir` e, via o auxiliar `propagarAtualizacao(Modulo)`, `FraseService.criar/editar/excluir`. A frase sobe pelo módulo (`modulo.getIdioma().getId()`), preservando o `registrarAtualizacao(Modulo)` que já existia. | `api/.../service/ModuloService.java`, `api/.../service/FraseService.java` |
| 11 | `atualizadoEm` exposto em `IdiomaResponse` no formato ISO, seguindo o tratamento já dado a `criadoEm` (nulo permanece nulo). | `api/.../dto/idioma/IdiomaResponse.java` |
| 12 | Backfill idempotente no padrão do `CodigoPublicoBackfill`: `ApplicationRunner` que copia `criadoEm` para os registros com `atualizadoEm` nulo. **Feito por update em massa JPQL de propósito** — percorrer as entidades dispararia o `@PreUpdate`, que sobrescreveria o valor copiado pelo instante atual e anularia o próprio backfill. | `api/.../config/IdiomaAtualizadoEmBackfill.java` (novo), `api/.../repository/IdiomaRepository.java` |
| 13 | Frontend: linha "Última atualização: dd/MM/yyyy" no cabeçalho, com `*ngIf="atualizadoEm"` (nulo não renderiza nada) e `DatePipe`, que já vinha do `CommonModule` — nenhum import novo. Estilo `.ultima-atualizacao` em `var(--color-muted)`, sem cor fixa, com ajuste na faixa responsiva de 768px. | `visualizar-idioma.html:24`, `visualizar-idioma.ts:39`, `visualizar-idioma.css`, `idioma.model.ts:43` |

**Efeito sobre o retrato das seções 1–7**

As seções 1–7 continuam sendo o estado do commit `10a165b` e **não** foram editadas. Esta etapa
desatualiza as referências abaixo:

- **Seção 7 inteira** — os três blocos de código citados para `visualizar-idioma` e
  `visualizar-modulo` **não descrevem mais o código atual**. `visualizar-idioma.voltar()` está
  hoje em `:688` (era `:670-676`) e `visualizar-modulo.voltarParaLista()` em `:352` (era
  `:333-339`). O bloco de `visualizar-usuario` (`:144`, era `:137-143`) segue **válido em
  conteúdo** — só a linha mudou.
- **1.3** — a tabela de query params não registra o `origem`, que agora acompanha `id` em toda a
  cadeia idioma → módulo → jogar. As linhas também mudaram: `home.ts:177` → `:171`;
  `visualizar-idioma.ts:683` → `:707`, `:306-312` → `:318-326`, `:1024` → `:1046`;
  `visualizar-modulo.ts:335,786` → `:355,807`; `visualizar-usuario.ts:129` → `:136`.
  A leitura dos params passou a incluir `visualizar-idioma.ts:169`, `visualizar-modulo.ts:162` e
  `jogar.ts:97`. O param `origem` é um rótulo de tela, não um id — não amplia a exposição
  descrita na seção 1.

**Em aberto nesta etapa:**

- **`AvaliacaoService` move a data de atualização.** Ele faz `idioma.setAvaliacao(...)` seguido de
  `idiomaRepository.save(idioma)` (`AvaliacaoService.java:58-60`); com o `@PreUpdate` pedido na
  tarefa, **avaliar um idioma passa a alterar a "última atualização"** mesmo sem mudança de
  conteúdo. Implementado como especificado. Se a intenção for contar só conteúdo, o caminho é
  remover o `@PreUpdate` e deixar o campo exclusivamente sob controle do `registrarAtualizacao`
  — nesse caso `IdiomaService.editar` e `editarComoAdmin` precisariam chamá-lo também.
- **`visualizar-usuario` ainda volta pelo histórico.** Seu `voltar()` (`:144`) segue em
  `location.back()`. Como o Voltar do idioma agora empilha uma entrada nova, o fluxo
  `visualizar-usuario → idioma → Voltar → Voltar` devolve o usuário ao idioma. É o que mantém a
  **Fase 20 em parcial**: duas das três telas de visualização foram padronizadas.
- A origem **não sobrevive a um F5 com URL colada sem o param** — cai no fallback `home`, por
  construção. Aceitável porque o fallback é uma tela válida, diferente do `history.back()`
  anterior, que saía da aplicação.

---

### 8.11 Botão Voltar e paridade da Tradução Direta no `cadastrar-idioma` — **concluído**

Somente frontend. `cd api && ./mvnw -q compile` e `cd crow && npm run build` rodados após a
alteração — ambos **exit 0**. O backend **não foi tocado**: `traducoesAlternativasJson` já existia
em toda a cadeia (entidade `Frase`, `FraseRequest`, `FraseResponse`, `FraseService.criar` e
`FraseController.toResponse`) — era a tela que não preenchia o campo.

**Botão Voltar (item 1 da tarefa)**

| # | Item | Arquivos |
|---|---|---|
| 1 | Botão Voltar no topo da página, acima da barra de progresso, no padrão global `.btn-voltar` de `styles.css` — mesmo ícone, rótulo e posição já usados em `buscar-idioma` e `cadastrar-usuario`. Desabilitado enquanto `salvando`. | `cadastrar-idioma.html:5`, `cadastrar-idioma.css` (`.btn-voltar--topo`) |
| 2 | `voltar()` sai por `Location.back()` com fallback para `/home` (mesmo guard `window.history.length > 1` já usado no projeto), mas **só depois** de checar dados preenchidos. | `cadastrar-idioma.ts:400-430` |
| 3 | `temDadosPreenchidos()` cobre as três etapas (idioma, módulo e frase, incluindo pares, alternativas de quiz, links e traduções alternativas). Com formulário intocado o Voltar sai direto, sem modal. | `cadastrar-idioma.ts:383-397` |
| 4 | Com dados preenchidos, reaproveita o **modal de cancelamento que já existia** em vez de criar outro. `destinoCancelamento` (`'home'` ou `'anterior'`) decide o destino no confirmar e troca os três textos do modal para "Sair do Cadastro" / "Sim, Sair". | `cadastrar-idioma.ts:30,413,423`, `cadastrar-idioma.html:403,422,446` |
| 5 | **Conflito de CSS corrigido:** a página redefinia `.btn-voltar` globalmente (era o botão de etapa, com `flex: 1 1 auto` e padding largo), o que deformaria o botão novo. As cinco regras foram escopadas para `.acoes .btn-voltar`. | `cadastrar-idioma.css:726,746,753,796,1714` |

**Paridade da Tradução Direta (item 2 da tarefa)**

Comparação das duas telas **antes** da alteração. Os formulários já eram quase idênticos — imagem
opcional, Tradução Completa, lista dinâmica de pares palavra/tradução, Observações e até 3 links,
com o mesmo markup e os mesmos métodos:

| Item | `cadastrar-frase` | `cadastrar-idioma` (antes) |
|---|---|---|
| Imagem / Tradução Completa / palavras / observações / links | presente | idêntico |
| Campo `traducoesAlternativas` no estado | presente (limite 5) | **ausente** |
| Bloco "Outras respostas aceitas" na UI | presente, com add/remove | **ausente** |
| `traducoesAlternativasJson` no payload | enviado | **ausente** |
| Botão Voltar no topo | presente | **ausente** (só o Voltar de etapa) |
| `modo` no payload | minúsculo | maiúsculo — indiferente, `FraseService.java:49` faz `toUpperCase()` |
| Quiz: mídia enviada | só a do `tipoMidiaQuiz` escolhido | `imagemQuiz` **e** `videoQuiz` juntos |

No modo Tradução Direta, portanto, a única diferença funcional era a ausência das traduções
alternativas. As duas últimas linhas estão fora desse modo e não foram alteradas (ver "Em aberto").

| # | Item | Arquivos |
|---|---|---|
| 6 | Componente **compartilhado** `RespostasAceitas`, em vez de uma quarta cópia do markup. Standalone, `CommonModule` + `FormsModule`, com CSS próprio (encapsulado) reproduzindo a linguagem dos formulários de cadastro — as classes `.campo`, `.linha-dinamica` e `.btn-icone` são locais de cada página e não atravessam a encapsulação de view. | `components/respostas-aceitas/` (novo: `.ts`, `.html`, `.css`) |
| 7 | Lógica de validação exportada como funções puras (`normalizarRespostaAceita`, `erroRespostaAceita`, `respostasAceitasValidas`), para o `podeFinalizar()` das páginas consultar sem `ViewChild` nem `EventEmitter` durante a detecção de mudanças. | `respostas-aceitas.ts:16,27,39` |
| 8 | **Duplicatas bloqueadas** pela mesma normalização do corretor (`jogar.ts:334`): minúsculas, sem acentos, sem pontuação, espaços colapsados. `"HOW ARE YOU, GOOD MORNING!"` é detectada como duplicata de `"how are you Good morning"`. Também acusa a entrada igual à tradução principal, que já é aceita automaticamente. | `respostas-aceitas.ts:16-37` |
| 9 | **Entradas vazias bloqueadas**: o botão de adicionar desabilita enquanto houver linha em branco, a linha vazia marca erro inline e o Finalizar trava até ela ser preenchida ou removida. | `respostas-aceitas.ts:64-78`, `respostas-aceitas.html:29-36` |
| 10 | **Tradução principal explícita**: faixa no topo do bloco, com a etiqueta "Tradução principal", exibindo a ordem derivada das palavras (`palavrasTraducao.map(p => p.traducao)`) e um estado neutro enquanto elas não estão preenchidas. | `respostas-aceitas.html:8-19`; getter `traducaoPrincipal` em `cadastrar-idioma.ts:194` e `cadastrar-frase.ts:78` |
| 11 | `cadastrar-idioma` ganhou o estado, o payload e a trava de validação: `traducoesAlternativas`, `traducoesAlternativasJson` em `getDadosFrase()` e `respostasAceitasValidas(...)` no `podeFinalizar()`. | `cadastrar-idioma.ts:60,207,531` |
| 12 | `cadastrar-frase` migrado para o mesmo componente: **28 linhas de markup inline removidas** e os métodos `adicionarTraducaoAlt`/`removerTraducaoAlt` excluídos (passaram para o componente). As duas telas passam a compartilhar comportamento, não apenas aparência. | `cadastrar-frase.html:105`, `cadastrar-frase.ts:8,17,78,87` |

**Verificação da aceitação na tela Jogar**

Cadeia conferida ponta a ponta: a tela grava `traducoesAlternativasJson` →
`FraseRequest`/`FraseService.criar` persistem → `FraseController.toResponse:108` devolve no
`FraseResponse` → `jogar.prepararFraseBackend:140` parseia → `jogar.verificarTraducao:344` monta o
conjunto de aceitas (ordem principal + alternativas, todas normalizadas). A cadeia foi simulada
com os dados reais: ordem principal, alternativa reordenada, variação de caixa e duplicata
normalizada — **todas aceitas**; ordem inválida **recusada**.

**Em aberto nesta etapa:**

- **Alternativas fora da permutação das palavras são inalcançáveis.** No Jogar o usuário monta a
  resposta clicando nos blocos de palavras cadastrados (`jogar.ts:242-257`), então `ordemUsuario`
  é sempre uma *permutação* desses blocos. Uma alternativa que não seja um rearranjo das mesmas
  palavras (um sinônimo que não está entre elas, por exemplo) fica gravada mas nunca é atingida.
  É coerente com o nome do campo e com o texto de ajuda ("outras **ordens**/traduções"), mas se a
  intenção for aceitar redações diferentes, o modo de resposta do Jogar teria que mudar para
  entrada livre. **Vale para as duas telas** — não é regressão desta etapa.
- **Quiz do `cadastrar-idioma` envia as duas mídias.** `getDadosFrase()` manda `imagemQuiz` e
  `videoQuiz` juntos, ignorando o `tipoMidiaQuiz`; o `cadastrar-frase` manda só a escolhida.
  Grava lixo no campo não usado. **Não corrigido por estar fora do escopo da tarefa** (modo Quiz,
  não Tradução Direta).
- **`cadastrar-idioma.css` está em 31.67 kB, contra o orçamento de 32 kB** — passou, mas com pouca
  folga. Novas regras nessa página tendem a estourar o budget, como já acontece em
  `visualizar-idioma.css` e `controle-adm.css`.
- **`visualizar-idioma` e `visualizar-modulo` seguem com o markup inline** das respostas aceitas
  (`visualizar-idioma.html:772`, `visualizar-modulo.html:307`). Migrá-los para o `RespostasAceitas`
  eliminaria as duas cópias restantes, mas ficou de fora por serem telas fora do escopo pedido.

---

### 8.12 Ordenação explícita de módulos e frases — **concluído** (somente backend)

Backend. `cd api && ./mvnw -q compile` e `cd crow && npm run build` rodados após a alteração —
ambos **exit 0**. O frontend **não** foi alterado por decisão da tarefa: esta etapa entrega só a
persistência e os endpoints. Antes desta etapa a ordem de módulos e frases dependia do id de
inserção, o que impedia reordenar — e a página Jogar tem o modo "Ordem de Cadastro", que consumia
justamente essa ordem implícita.

**Campo e backfill**

| # | Item | Arquivos |
|---|---|---|
| 1 | `Integer ordem` nas entidades `Modulo` e `Frase`, nullable no mapeamento pela exigência do `ddl-auto=update` (coluna nasce vazia nas linhas existentes), documentado no mesmo formato de `Idioma.codigo` e `Idioma.atualizadoEm`. | `api/.../entity/Modulo.java`, `api/.../entity/Frase.java` |
| 2 | `OrdemBackfill` — `ApplicationRunner` no padrão dos dois já existentes. Para cada idioma numera os módulos de 1 em diante por id crescente; para cada módulo faz o mesmo com as frases. Idempotente: só age em pais que tenham ao menos um filho com `ordem` nula. | `api/.../config/OrdemBackfill.java` (novo) |
| 3 | **Gravação por update em massa JPQL de propósito** — passar pelas entidades dispararia o `@PreUpdate` do `Modulo` e marcaria como "atualizado agora" todo módulo antigo que o backfill apenas numerou, destruindo a "última atualização" criada na seção 8.10. Mesma armadilha e mesma solução do `IdiomaAtualizadoEmBackfill`. | `ModuloRepository.definirOrdem`, `FraseRepository.definirOrdem` |
| 4 | **Executado**: `Backfill de ordem: 5 módulo(s) e 7 frase(s) numerado(s)`. Segunda subida: `nenhum módulo ou frase pendente` — idempotência confirmada na prática. Os `atualizado_em` originais foram conferidos no banco e permaneceram intactos. | — |

**Atribuição e manutenção da sequência**

| # | Item | Arquivos |
|---|---|---|
| 5 | Módulo novo recebe `maior ordem do idioma + 1`; frase nova, `maior ordem do módulo + 1`. Usa `MAX(ordem)` e não a contagem, para não colidir caso exista buraco. | `ModuloService.criar`, `FraseService.criar`, `maiorOrdemDoIdioma`, `maiorOrdemDoModulo` |
| 6 | Na exclusão os irmãos restantes são renumerados 1..n, sem buracos. Só são gravados os registros cuja posição realmente mudou — evita bumpar `atualizadoEm` de módulo que já estava na posição correta. | `ModuloService.excluir`, `FraseService.excluir` |
| 7 | `IdiomaService.importar` também cria módulos e frases: as cópias recebem `ordem` 1..n seguindo a sequência do original. Sem isso todo idioma importado nasceria sem posição até o próximo restart. | `api/.../service/IdiomaService.java` |
| 8 | Regra comum extraída para `Reordenacao` (validar lista, aplicar 1..n, renumerar, próxima posição), em vez de duplicar a validação e as mensagens nos dois services. | `api/.../util/Reordenacao.java` (novo) |

**Endpoints de reordenação**

| # | Item | Arquivos |
|---|---|---|
| 9 | `PUT /api/idiomas/{codigoIdioma}/modulos/ordem` e `PUT /api/modulos/{moduloId}/frases/ordem`, ambos recebendo a lista completa de ids na ordem desejada e devolvendo os itens já reordenados. Operação inteira em uma transação. | `ModuloController.reordenar`, `FraseController.reordenar` |
| 10 | Validações: proprietário do idioma (**403**); lista ausente/vazia, com ids repetidos, de tamanho diferente do existente ou com id de outro pai (**400**, mensagem específica). Todas verificadas contra a API rodando. | `api/.../util/Reordenacao.java` |
| 11 | A rota de módulos aceita **código público e id numérico**, via `idiomaService.resolver` — os outros métodos do `ModuloController` seguem só numéricos (ver Fase 5). Os dois formatos foram verificados. | `ModuloController.java:79-95` |
| 12 | Validação deixada no service em vez de `@NotEmpty` no DTO: o Bean Validation devolvia `Validation failed for object='reordenarModulosRequest'. Error count: 1`, que não serve para exibir ao usuário — e com `include-message=always` a mensagem chega ao frontend. | `dto/modulo/ReordenarModulosRequest.java`, `dto/frase/ReordenarFrasesRequest.java` (novos) |
| 13 | `/ordem` não é capturado pelo `PUT /{id}` já existente: o Spring prefere o segmento literal ao variável, como já acontecia com `/jogar`. `PUT .../frases/{id}` foi testado depois e continua respondendo 200. | — |

**Leitura ordenada**

| # | Item | Arquivos |
|---|---|---|
| 14 | Consultas passaram a `findByIdiomaIdOrderByOrdemAscIdAsc` e `findByModuloIdOrderByOrdemAscIdAsc` — `ordem` com o `id` como desempate. Registros sem posição caem no fim (`NULLS LAST` é o padrão do Postgres em `ASC`). | `ModuloRepository`, `FraseRepository`, `ModuloService.buscarPorIdioma`, `FraseService.buscarPorModulo` |
| 15 | `ordem` exposto em `ModuloResponse` e `FraseResponse`. | `dto/modulo/ModuloResponse.java`, `dto/frase/FraseResponse.java` |
| 16 | **Jogar em "Ordem de Cadastro" passou a respeitar o campo**: invertendo as frases de um módulo, a sequência devolvida mudou de `12 13 11 21` para `13 12 11 21`; `ordem=aleatoria` continua sorteando e limitando a 10. | `FraseService.getFrasesParaJogo` |

**Efeito sobre o retrato das seções 1–7**

As seções 1–7 continuam sendo o estado do commit `10a165b` e **não** foram editadas. Esta etapa
desatualiza as referências de linha abaixo — o conteúdo descrito segue válido:

- **1.1** — `ModuloController.toResponse` está hoje em `:93` (era `:74`) e
  `FraseController.toResponse` em `:120` (era `:105`), por causa dos métodos `reordenar` inseridos
  antes deles. Os prefixos `MOD-`/`FRS-` continuam derivados do id, como a Fase 3 registra.
- **1.2** — `ModuloResponse.java:4-5` e `FraseResponse.java:4-5` (`id`, `codigo`) **seguem válidos**;
  o `ordem` entrou depois desses campos e não mexe na exposição de id descrita na seção.
- **8.11** — `FraseController.toResponse:108` passou a `:120`, e o `FraseService.java:49` que faz
  `toUpperCase()` passou a `:52`.

**Em aberto nesta etapa:**

- **⚠️ Perda de dados no banco local durante os testes.** Ao exercitar a renumeração pós-exclusão
  eu chamei `DELETE /api/idiomas/1/modulos/6` no `crow_db` real, apagando o **módulo id 6
  ("Saudações", idioma 1)** e, por cascade, a **frase id 5**. Sem recuperação possível:
  `archive_mode=off`, nenhum dump e nenhuma cópia da base. O **modo da frase id 13** também foi
  sobrescrito para `TRADUCAO` por um teste de rota e foi **restaurado para `PARES`** por inferência
  (ela tem `pares_json` preenchido e nenhum campo de tradução) — **confirmar se estava certo**.
  Posições e `atualizado_em` que os testes mexeram foram devolvidos aos valores originais.
- **Não há UI de reordenação.** O `ordem` já chega nos dois DTOs, mas `visualizar-idioma` e
  `visualizar-modulo` não têm como reordenar nem consomem o campo. É a próxima etapa.
- **`ModuloService.reordenar` bumpa o `atualizadoEm` dos módulos movidos**, porque grava pelas
  entidades. É defensável (a posição é dado do módulo e quem reordenou foi o dono), mas é uma
  decisão: se a "última atualização" do módulo deve significar só mudança de conteúdo, o caminho é
  gravar por `definirOrdem`, como o backfill faz.
- **Limite de 20 módulos por idioma não foi revisto** — segue contando registros, não posições.
  Com a renumeração fechando buracos as duas leituras coincidem, mas o acoplamento existe.

---

### 8.13 Controles de reordenação no frontend — **concluído**

Frontend. `cd crow && npm run build` e `cd api && ./mvnw -q compile` rodados após a alteração —
ambos **exit 0**. Consome os endpoints entregues em 8.12; o backend **não** foi alterado nesta
etapa. Fecha a pendência "UI de reordenação" aberta em 8.12.

**Estado compartilhado da reordenação**

| # | Item | Arquivos |
|---|---|---|
| 1 | `ReordenacaoService` + `EstadoReordenacao<T>`, no mesmo padrão do `ClipboardService`: o serviço é a fábrica e cada página cria a sua instância com `criarEstado`. Sinaliza por `signal` (`salvando`, `erro`), que em modo zoneless já dispara a renderização ao ser lido no template. | `crow/src/app/services/reordenacao.service.ts` (novo) |
| 2 | **Otimista com desfazer**: o clique aplica a nova ordem na tela na hora; a ordem anterior ao início da rajada fica guardada e é restaurada se a persistência falhar, junto da mensagem do backend (`err.error.message`, padrão já usado no projeto). | idem |
| 3 | **Debounce de 400 ms**: uma rajada de cliques vira **uma** requisição com a ordem final, não uma por clique. Uma rajada que volta ao ponto de partida (sobe e desce) não gera requisição nenhuma. | idem |
| 4 | **Sem chamadas simultâneas**: `salvando` bloqueia `mover()` e desabilita os botões enquanto a requisição está em voo. Necessário porque o endpoint exige a lista completa — duas requisições concorrentes poderiam chegar fora de ordem. | idem |
| 5 | `destruir()` no `ngOnDestroy` envia o que estiver pendente no debounce em vez de descartar: sair da tela dentro da janela de 400 ms perderia silenciosamente uma reordenação que o usuário já viu aplicada. Nesse caminho o desfazer é suprimido, porque a tela já saiu de cena e `detectChanges()` num componente destruído quebraria. | idem |
| 6 | Métodos nos services de dados, com a lista completa de ids no corpo `{ ids }`. | `services/modulo.service.ts`, `services/frase.service.ts` |

**Frases (`visualizar-modulo`)**

| # | Item | Arquivos |
|---|---|---|
| 7 | Duas setas ao lado do marcador `#` existente, dentro de um novo `.frase-posicao`. Seta para cima desabilitada na **primeira frase da lista inteira**, para baixo na **última** — não no limite da página. | `visualizar-modulo.html:75-105`, `visualizar-modulo.ts` |
| 8 | Índices convertidos de página para lista completa por `indiceGlobalFrase()`, reaproveitado pelo `getNumeroFrase()` que já existia. | `visualizar-modulo.ts` |
| 9 | **Bug de paginação evitado**: mover a última frase de uma página a jogava para a página seguinte e ela desaparecia da tela. `moverFrase()` acompanha a frase até a página onde ela caiu. | `visualizar-modulo.ts` |
| 10 | `atualizarFrasesPaginadas()` dividido: o recorte da página virou `fatiarPaginaAtual()`, sem o `window.scrollTo`. A reordenação re-renderiza a lista a cada clique e subir ao topo a cada seta tornaria os botões inutilizáveis. O comportamento de rolagem da troca de página seguiu igual. | `visualizar-modulo.ts` |

**Módulos (`visualizar-idioma`)**

| # | Item | Arquivos |
|---|---|---|
| 11 | Bloco `.ordem-modulo` com a posição (`#1`, `#2`, …) e as mesmas setas, entre `.info` e `.acoes-modulo`. A posição é exibida para **todos**; as setas, só para o proprietário. | `visualizar-idioma.html:181-216` |
| 12 | **Não depende de hover**, ao contrário de `.acoes-modulo` (`opacity: 0` até `:hover`): no toque não há hover, e é o mesmo problema que a seção 8.7 apontou nos cards da home. | `visualizar-idioma.css` |
| 13 | O card inteiro tem `(click)="toggleModulo(mod)"`, então as setas interrompem a propagação — como já faziam os botões de editar/excluir. | `visualizar-idioma.ts` |
| 14 | Página passou a implementar `OnDestroy` para o envio do debounce pendente. | `visualizar-idioma.ts` |

**Acessibilidade e visual**

| # | Item | Arquivos |
|---|---|---|
| 15 | `aria-label` descritivo e único por item: "Mover para cima a frase 3", "Mover para baixo o módulo Saudações" — o rótulo sozinho identifica o alvo, sem depender da vizinhança visual. Mais `title` para o tooltip e `:focus-visible` com contorno. | ambos os HTML/CSS |
| 16 | **Bug de teclado corrigido**: o card do módulo tem `(keydown.enter)`/`(keydown.space)` para marcar/desmarcar. Sem tratar, acionar a seta pelo teclado também marcaria o módulo — e o `preventDefault()` do Space do card chegaria a impedir a própria ativação do botão. As setas passaram a interromper a propagação desses dois eventos. | `visualizar-idioma.html` |
| 17 | Alvo de toque de **44 px** nas setas até 768 px (28–32 px no desktop), com o SVG crescendo junto. | ambos os CSS |
| 18 | Setas e ícones seguem a convenção do projeto: SVG inline, `stroke="currentColor"`, `stroke-width="2"`, `viewBox="0 0 24 24"`. Nenhuma cor fixa — tudo por tokens e `color-mix`. | ambos |
| 19 | Toast de erro `.mensagem-erro`, espelhando o `.mensagem-sucesso` que já existia em cada página, em `var(--color-danger)` e com `role="alert"`. Substitui o `alert()` nativo para este fluxo. | ambos os HTML/CSS |

**Ordem de cadastro no Jogar (item 4 da tarefa) — confirmado**

Verificado contra a API rodando, com um idioma temporário de 3 módulos e 7 frases. A ordem dos
**módulos** governa a ordem dos blocos e a ordem das **frases** governa dentro de cada bloco:

```
modulos=25,23,24  ordem=cadastro  ->  M25-F1 M25-F2  M23-F3 M23-F2 M23-F1  M24-F1 M24-F2
modulos=23,24,25  ordem=cadastro  ->  M23-F3 M23-F2 M23-F1  M24-F1 M24-F2  M25-F1 M25-F2
modulos=25,23,24  ordem=aleatoria ->  M23-F2 M24-F2 M24-F1 M23-F3 M25-F2 M23-F1 M25-F1
```

As frases do módulo 23 saem `F3 F2 F1` porque foi essa a ordem gravada pela reordenação — antes
saíam por id. Nenhuma alteração foi necessária em `iniciarComOrdem()`: ele já montava o param
`modulos` a partir de `modulosSelecionados`, que é um `filter` sobre `this.modulos` e por isso
herda a ordem exibida.

**Em aberto nesta etapa:**

- **`visualizar-idioma.css` foi de 41.05 kB para 43.16 kB**, contra o orçamento de 32 kB. O arquivo
  já estourava antes desta etapa (seção 8.11) e o aviso não quebra o build. O toast de erro é a
  maior parte do acréscimo e está **duplicado** entre as duas páginas — assim como o toast de
  sucesso já estava. Extrair os dois para `styles.css` resolveria as duas coisas, mas mexeria num
  arquivo global que serve todas as telas.
- **Reordenar não é confirmado visualmente.** Só o erro tem toast; o sucesso é silencioso (a
  própria lista já mostra a nova ordem). Decidir se merece a confirmação de sucesso.
- **Sem verificação em navegador.** Build e contratos da API foram exercitados de ponta a ponta,
  mas o comportamento otimista, o debounce, o bloqueio durante a requisição e o desfazer **não**
  foram clicados numa tela real — não há ferramenta de browser neste ambiente.
- **Botões de editar/excluir do módulo seguem com o mesmo bug de teclado** que corrigi nas setas
  (item 16): acioná-los por Enter/Space também marca o módulo. Ficou de fora por não ser o
  controle pedido nesta tarefa.
- **`ordem` não entrou nos models `Frase` e `Modulo`.** A posição exibida vem do índice do array,
  que é a fonte única na tela; o campo do backend chega em runtime pelo spread e não é lido.

### 8.14 Cancelamento da rodada na tela Jogar — **concluído**

Somente frontend. `cd api && ./mvnw -q compile` e `cd crow && npm run build` rodados após a
alteração — ambos **exit 0**. O backend **não** foi tocado: sair da rodada não persiste nada,
porque a pontuação do Jogar já era só estado de componente.

Arquivos: `crow/src/app/pages/jogar/jogar.{ts,html,css}`.

**Botão e modal**

| # | Item | Arquivos |
|---|---|---|
| 1 | Botão **"Cancelar rodada"** no `.jogo-header`, ao lado da pontuação. Some junto com o header quando o jogo termina (`*ngIf="!jogoFinalizado"` já existente), porque aí já existe "Voltar ao Idioma". | `jogar.html:27-34` |
| 2 | Modal central no padrão das demais telas: `.modal-overlay` → `.modal-container` com `$event.stopPropagation()`, header/body/footer, `.icone-alerta` e bloco de aviso — o mesmo desenho do "Excluir Módulo" de `visualizar-idioma`. | `jogar.html:243-301` |
| 3 | Dois botões no footer: **"Voltar à rodada"** (neutro, em `--color-primary`) e **"Cancelar rodada"** (destrutivo, em `--color-danger`), mais o `X` no header. | `jogar.html:284-297` |
| 4 | `.modal-container` e `.modal-header` precisaram de override sob `.modal-cancelar-rodada`: o `.modal-header` que já existia no arquivo é o do modal de resultado, em coluna e com SVG de 60 px. A especificidade de `.modal-cancelar-rodada .modal-header svg` também vence a regra de 50 px do `@media (max-width: 600px)`. | `jogar.css:831-893` |
| 5 | Sem cor fixa: tudo por tokens (`--color-danger`, `--color-primary`, `--shadow-*`, `--transition-base`) e `color-mix`. Ícones SVG inline com `stroke="currentColor"`, `stroke-width="2"`, `viewBox="0 0 24 24"`. | `jogar.css:88-125`, `jogar.html` |
| 6 | Responsivo: botão full-width quando o header vira coluna (768 px) e footer do modal empilhado em 600 px. Alvo de toque de 44 px em todos os botões novos. | `jogar.css` |

**Fechar ≠ cancelar**

| # | Item | Arquivos |
|---|---|---|
| 7 | Overlay, `X` e "Voltar à rodada" chamam o mesmo `fecharModalCancelar()`, que **só** baixa a flag — nenhum estado da rodada é tocado ao abrir ou fechar. | `jogar.ts:551-555` |
| 8 | **ESC** por `@HostListener('document:keydown.escape')`, mesmo padrão do `topbar.ts`. Fecha apenas o modal de cancelamento; o modal de resultado continua ignorando overlay e ESC, como antes. | `jogar.ts:558-561` |
| 9 | `confirmarCancelamento()` zera o estado por `limparEstadoRodada()` (pontuação, etapa, frases, histórico, seleções dos três modos e as marcações de tempo) e chama o `voltarAoIdioma()` que já existia — `/visualizar-idioma?id=<código>&origem=...`, com o código público do idioma, não o id. | `jogar.ts:567-608` |
| 10 | Antes de navegar, o carregamento de frases em voo é descartado e o container de assinaturas é recriado. Sem isso, uma resposta atrasada de `getFrasesParaJogo` cairia no `next` e reiniciaria (`tempoInicio`, `carregarFrase(0)`) uma rodada já cancelada. | `jogar.ts:572-575` |

**Mídia e animações pausadas**

| # | Item | Arquivos |
|---|---|---|
| 11 | A única mídia da tela é o embed do YouTube do modo Quiz — não há `<audio>` nem `<video>` em nenhum ponto do projeto. `toEmbedUrl()` passou a acrescentar `enablejsapi=1`, sem o que não há como comandar o player. **Única mudança de comportamento pré-existente desta etapa.** | `jogar.ts:192-216` |
| 12 | Estado do player rastreado por um listener de `message` registrado com `window.addEventListener` — **fora** do Angular de propósito: o `infoDelivery` chega várias vezes por segundo durante a reprodução e, em app zoneless, um `@HostListener` dispararia detecção de mudanças em cada um. | `jogar.ts:116`, `jogar.ts:648-659` |
| 13 | Só retomamos o vídeo se **nós** o pausamos (`videoPausadoPeloModal`), senão fechar o modal daria play num vídeo que o usuário tinha pausado. Se a JS API não responder, o estado nunca é conhecido e nunca damos play sozinhos — degrada em silêncio. | `jogar.ts:610-624` |
| 14 | Animações congeladas por `animation-play-state: paused` em `.jogo-conteudo.pausado`, ligado por `[class.pausado]="mostrarModalCancelar"`. A classe fica no `.jogo-conteudo`, não no container, para não congelar o `fadeIn`/`slideUp` do próprio modal. | `jogar.html:38`, `jogar.css:137-141` |

**Assinaturas**

| # | Item | Arquivos |
|---|---|---|
| 15 | O `ngOnDestroy` estava vazio (`// Limpa recursos se necessário`) com **duas** assinaturas soltas: `route.queryParams` e `getFrasesParaJogo`. As duas passaram a um container `Subscription`, encerrado no destroy junto com o `removeEventListener` — mesmo padrão de `topbar.ts` e `home.ts`. | `jogar.ts:85`, `jogar.ts:103-127`, `jogar.ts:137-156` |

**Em aberto nesta etapa:**

- **O tempo continua correndo com o modal aberto.** O Jogar não tem timer por `setInterval`: guarda
  `tempoInicio` e faz a diferença no fim. Fechar o modal não reinicia nada, mas o intervalo com o
  modal aberto entra no total — exatamente como já acontecia com o modal de resultado. Decidir se
  os dois devem descontar esse tempo.
- **Sem verificação em navegador.** Os dois builds passam, mas o pause/retomada do vídeo do quiz, o
  ESC e o clique no overlay **não** foram exercitados numa tela real — não há ferramenta de browser
  neste ambiente. O caminho do vídeo é o que mais pede olho: depende do embed do YouTube responder
  ao `postMessage`.
- **Foco não é aprisionado no modal** nem devolvido ao botão ao fechar. Nenhum modal do projeto faz
  isso hoje; se virar requisito, é uma fase própria para todos eles.
- **`jogar.html` foi de 19 para 24 SVGs inline**, contagem da seção 5 — relevante para a Fase 17
  (componente de ícone único), que passa a ter 5 ocorrências a mais para migrar nesta tela.

### 8.15 Efeitos sonoros discretos (`SoundService`) — **concluído**

Somente frontend. `cd api && ./mvnw -q compile` e `cd crow && npm run build` rodados após a
alteração — ambos **exit 0**. Decisões tomadas na proposta que antecedeu o código: **tons
gerados** pela Web Audio API (não arquivos), quatro sons (acerto, erro, conclusão e tique de
avanço), **ligado por padrão**, controle **só na topbar**.

Arquivos: `crow/src/app/services/sound.service.ts` (novo), `crow/src/app/app.ts`,
`crow/src/app/components/topbar/topbar.{ts,html,css}`, `crow/src/app/pages/jogar/jogar.ts`.

**Serviço**

| # | Item | Arquivos |
|---|---|---|
| 1 | `SoundService` é cópia estrutural do `ThemeService`: `signal` `ativo`, `init()` / `setAtivo()` / `toggle()`, chave `crow:sons` no `localStorage` (`ligado` / `desligado`) com `try/catch` em toda leitura e escrita. `init()` é chamado no construtor do `App` logo depois de `themeService.init()` e **não** cria contexto de áudio. | `sound.service.ts:68-105`, `app.ts:14-23` |
| 2 | **Sem arquivo, sem asset, sem `angular.json`, sem dependência.** Cada som é uma receita de notas (frequência, duração, onda, ganho) tocada por osciladores. As receitas ficam no topo do arquivo e são o único lugar para ajustar de ouvido — nenhum componente conhece frequência ou duração. | `sound.service.ts:25-46` |
| 3 | Durações conferidas por script: `acerto` 200 ms (Dó5→Mi5), `erro` 180 ms (Sol3 deslizando a Mi3, onda triangular), `conclusao` 240 ms (Dó5→Mi5→Sol5), `avanco` 40 ms (Lá5). Pico de ganho entre 0,08 e 0,18 — abaixo de qualquer vídeo do quiz. Todas **< 300 ms** por construção, não por confiança num arquivo. | idem |
| 4 | Envelope com ataque de 8 ms e decaimento exponencial até o fim de cada nota; sem ele a onda é cortada no meio do ciclo e produz um "clique". As rampas exponenciais usam piso `0.0001` porque a API não aceita zero. Nós desconectados no `onended`. | `sound.service.ts:48-51`, `sound.service.ts:151-181` |
| 5 | **Autoplay:** o `AudioContext` nasce dentro de `tocar()`, que só é chamado a partir de cliques. Se o navegador entregar o contexto suspenso (Safari), `resume()` é chamado ainda no gesto e o som sai quando ele estiver `running`; se recusar, a promise é engolida e nada toca. Nunca há tentativa de som sem gesto. | `sound.service.ts:110-134` |
| 6 | **Falha nunca escapa:** `tocar()` inteiro em `try/catch`, sem `throw`, sem `await`, sem promise rejeitada solta. Sem Web Audio API (`AudioContext` e `webkitAudioContext` ausentes), o serviço se marca `indisponivel` e o toggle segue funcionando só como preferência. | `sound.service.ts:136-149` |
| 7 | **`prefers-reduced-motion: reduce`** (via `matchMedia`) muda o **padrão** para desligado; a escolha explícita salva vence nos dois sentidos. Escolhido assim para não tirar o controle de quem ligou de propósito. | `sound.service.ts:81-90`, `sound.service.ts:183-189` |

**Controle na topbar**

| # | Item | Arquivos |
|---|---|---|
| 8 | Botão `.sound-toggle` entre o toggle de tema e o avatar, visível em todas as telas do `MainLayout` — incluindo `/jogar`. Compartilha as três regras do `.theme-toggle` (tamanho, hover, cor), então herda o contraste branco sobre o navy nos dois temas. | `topbar.html:30-44`, `topbar.css:352-380` |
| 9 | Ícones Feather `volume-2` / `volume-x` no padrão do projeto (SVG inline, `currentColor`, `stroke-width="2"`, `viewBox="0 0 24 24"`). `aria-label`, `aria-pressed` e `title` dinâmicos. | `topbar.html:30-44` |
| 10 | Ao **ligar**, toca o `acerto` como amostra: é a única confirmação de que o áudio funciona naquele navegador, e o clique garante o gesto da política de autoplay. Ao desligar, silêncio. | `topbar.ts:34-44` |

**Gatilhos no Jogar**

| # | Item | Arquivos |
|---|---|---|
| 11 | `verificarResposta()` → `acerto` ou `erro`, logo após a avaliação e antes de abrir o modal de resultado. | `jogar.ts:355` |
| 12 | `proximaEtapa()` → `avanco` só quando há próxima frase; `finalizarJogo()` → `conclusao`. Todos dentro de handlers de clique (Verificar, Continuar). | `jogar.ts:472`, `jogar.ts:490` |
| 13 | **Sem som** em selecionar/remover palavra, conectar par, marcar alternativa, cancelar rodada, abrir/fechar modais e navegação — a UI já responde visualmente ao clique e som ali vira ruído. Registrado na proposta como decisão, não como omissão. **Revertida na seção 8.26**, a pedido do Lucas: essas interações passaram a ter som. | — |

**Em aberto nesta etapa:**

- **Nenhum som foi ouvido.** Não há saída de áudio neste ambiente; frequências, durações e ganhos
  foram definidos por critério musical e conferidos por script, não de ouvido. O ajuste fino
  é nas constantes de `RECEITAS`. Dois candidatos a revisão: o **volume geral** (ganhos
  conservadores de propósito) e o **`erro`** — se a onda triangular em Sol3 soar "de desenho
  animado", trocar por `'sine'` ou encurtar para 140 ms.
- **Safari/iOS não verificado.** O caminho `resume()` dentro do gesto é o previsto pela
  documentação, mas não foi exercitado num aparelho.
- **Mudança de `prefers-reduced-motion` em tempo de execução não é observada** — só na
  inicialização, e só quando não há preferência salva. Recarregar a página resolve; decidir
  se vale escutar `matchMedia().addEventListener('change')`.
- **Sons fora do Jogar** (toast de reordenação, cópia do código no perfil) ficaram de fora
  por decisão. A API `tocar(nome)` já serve; é adicionar receita e chamada.
  **Feito na seção 8.26** (cópia de código e falha da reordenação; a reordenação que dá certo
  continua sem som próprio além do clique).
- **Sem controle de volume** — só ligado/desligado, como combinado. Se virar requisito,
  é um `GainNode` mestre entre as notas e o `destination`.

### 8.16 Matriz de permissões do administrador: moderação, não edição — **concluído** (somente backend)

Somente backend. `cd api && ./mvnw -q compile` → **exit 0**; `cd crow && npm run build` →
**exit 0** (frontend não alterado). Além do build, cada regra foi exercitada com `curl` contra a
API rodando no PostgreSQL local, com as contas seed (`admin@crow.com` e `usuario@crow.com`):
27 chamadas cobrindo listagem, consulta, rotas removidas (405), status com campo proibido,
status inválido/ausente, alvo administrativo, as oito escritas de módulo/frase e a edição de
idioma pela rota comum como admin, o mesmo cenário como usuário comum, `role`/`novaSenha` no
`PUT /usuarios/me`, e a persistência dos logs de bloqueio (12 registros sobreviveram ao
rollback do 403).

Esta seção **substitui as seções 2 e 3** como retrato do `AdminController`.

**Matriz aplicada.** O administrador **pode**: listar e consultar usuários (somente leitura),
ativar/desativar contas, listar e consultar idiomas com módulos e frases (somente leitura),
excluir um idioma inteiro, alterar status de denúncias e consultar logs. **Não pode**: editar
dados cadastrais, senha ou papel de qualquer usuário (nem promover a administrador), editar
idioma, nem cadastrar/editar/excluir módulo ou frase de outro usuário. "Enviar e-mail a
usuários" consta da matriz mas **não tem endpoint** — fica para a fase de e-mails.

Arquivos: `api/.../controller/AdminController.java`, `service/IdiomaService.java`,
`service/LogAdminService.java`, `service/UsuarioService.java`, `service/ModuloService.java`,
`service/FraseService.java`, `controller/ModuloController.java`, `controller/FraseController.java`,
`config/SecurityConfig.java`, `dto/usuario/UsuarioUpdateRequest.java`,
`dto/usuario/UsuarioModeracaoResponse.java` (novo), `dto/idioma/IdiomaCompletoResponse.java` (novo),
`dto/modulo/ModuloCompletoResponse.java` (novo), `dto/modulo/ModuloResponse.java`,
`dto/frase/FraseResponse.java`.

**`AdminController` depois das mudanças** (base `/api/admin`, tudo sob `hasRole("ADMIN")`)

| # | Método | Rota | O que faz | Blindagem |
|---|---|---|---|---|
| 1 | GET | `/denuncias` | Lista denúncias | leitura |
| 2 | PUT | `/denuncias/{codigo}/status` | Altera status, grava log `DENUNCIA` | — |
| 3 | GET | `/usuarios` | Lista contas **sem papel ADMIN** (`buscarModeraveis` → `findByRoleNot`), sem senha e sem telefone | somente leitura |
| 4 | GET | `/usuarios/{codigo}` **(novo)** | Consulta um usuário, sem senha e sem telefone | conta ADMIN → 403 + log |
| 5 | PUT | `/usuarios/{codigo}/status` | Ativa/inativa, grava log `USUARIO` | `role`/`senha`/`novaSenha` no corpo → 400 + log; `status` ausente/inválido → 400 (antes: NPE/500); alvo ADMIN, inclusive o próprio → 403 + log |
| 6 | GET | `/idiomas` | Lista idiomas | somente leitura |
| 7 | GET | `/idiomas/{codigo}` **(novo)** | Idioma completo com módulos e frases na ordem do criador (`IdiomaCompletoResponse`) | somente leitura |
| 8 | DELETE | `/idiomas/{codigo}` | Exclui o idioma inteiro, grava log `IDIOMA` **depois** da exclusão, com o código do criador | — |
| 9 | GET | `/logs` | Lista logs (ainda `Map` inline, sem paginação) | leitura |

Removidos: `PUT /usuarios/{codigo}` e `PUT /idiomas/{codigo}` (agora respondem **405**), junto
com `UsuarioService.editarUsuarioAdmin` e `IdiomaService.editarComoAdmin` — só o
`AdminController` os usava (varredura por referência antes da remoção).

**Backend**

| # | Item | Arquivos |
|---|---|---|
| 1 | **Ponto único de bloqueio de escrita em conteúdo alheio.** `IdiomaService.validarProprietario` ganhou o parâmetro `acao` e, quando o não-proprietário é ADMIN (papel lido do **banco**, não do JWT), grava `Tentativa bloqueada: <ação> em idioma de outro usuário` e responde 403 com mensagem própria ("Administradores não podem alterar conteúdo de outros usuários: o papel administrativo é de moderação, não de edição"). Usuário comum continua recebendo a mensagem genérica, sem log. Cobre as oito escritas de módulo/frase e a edição de idioma pela rota comum, que passou a chamar o mesmo método em vez do teste inline. | `IdiomaService.java:136-160`, `:210-211`; `ModuloService.java:44-46,61,89,107,127`; `FraseService.java:48,77,102,120` |
| 2 | `LogAdminService.registrarTentativaBloqueada` em `@Transactional(REQUIRES_NEW)`: quem chama lança a exceção logo em seguida, e sem transação própria o rollback do 403/400 apagaria o log junto. Prefixo `Tentativa bloqueada: ` constante. Tipos existentes (`usuario`/`idioma`) reaproveitados para não quebrar filtro e ícones da tela de logs. | `LogAdminService.java:18,36-44` |
| 3 | `UsuarioUpdateRequest` perdeu `role` e `novaSenha`. Não precisou de DTO separado: `atualizarPerfil` nunca leu esses campos, então `/usuarios/me` segue intacto — testado enviando `role: admin` e `novaSenha`: 200, papel `comum`, senha antiga válida. Campos desconhecidos no JSON são **ignorados** (padrão do Jackson no Spring Boot), como facultava a tarefa. | `dto/usuario/UsuarioUpdateRequest.java` |
| 4 | Novo `UsuarioModeracaoResponse` (codigo, nome, email, dataEntrada, status, role, quantidadeIdiomas — total, públicos e privados) usado nos **três** endpoints de usuário. Sem telefone também na listagem: escondê-lo só na consulta seria inócuo. Mantém `id` numérico (com o mesmo `// TODO Fase 21`) porque `controle-adm.ts:475` casa a lista por `u.id` após alterar status. | `dto/usuario/UsuarioModeracaoResponse.java`, `UsuarioService.java:54-56,99-113` |
| 5 | Endpoint de status reforçado: corpo continua `Map<String,String>` **de propósito** — um `record` ignoraria `role`/`senha` silenciosamente, e a tarefa pede detectar, registrar e recusar (400). `parseStatus` devolve 400 para valor ausente ou fora de `ATIVO`/`INATIVO`. Contas ADMIN não podem ser alvo de consulta nem de status (`exigirContaModeravel`) — inclusive o próprio admin, o que também impede autodesativação. | `AdminController.java:45,109-128,190-241` |
| 6 | `GET /idiomas/{codigo}` compõe `IdiomaCompletoResponse { idioma, modulos[ { modulo, frases[] } ] }` reaproveitando `IdiomaResponse`, `ModuloResponse` e `FraseResponse` sem conflito de nomes (`modulos`/`frases` já são contagens nos DTOs base). Contagem de frases do módulo é `frases.size()` da lista carregada, sem query extra. | `AdminController.java:142-146,244-254`, `dto/idioma/IdiomaCompletoResponse.java`, `dto/modulo/ModuloCompletoResponse.java` |
| 7 | Mapeamento de módulo e frase movido para fábricas estáticas `ModuloResponse.from(modulo, frases)` e `FraseResponse.from(frase)` (padrão do `IdiomaResponse.from`); `ModuloController`/`FraseController` delegam a elas. Evita duplicar o mapeamento no endpoint de idioma completo. | `dto/modulo/ModuloResponse.java:19`, `dto/frase/FraseResponse.java:24`, `ModuloController.java:93`, `FraseController.java:121` |
| 8 | Resolução do admin autenticado centralizada em `adminAutenticado(authentication)` (era trecho repetido em cinco métodos — observação da seção 2). `AuthService` deixou de ser dependência do controller. | `AdminController.java:190-192` |
| 9 | `DELETE /idiomas/{codigo}`: log gravado **após** `excluirComoAdmin` (antes era antes — item 8 da seção 2), com o código do criador nos detalhes. | `AdminController.java:148-164` |
| 10 | `SecurityConfig` revisado: as regras já batiam com a matriz (`/api/admin/**` → ADMIN; demais `/api/**` autenticados). Documentado no próprio arquivo por que propriedade é regra de dado (camada de serviço) e não de URL. Nenhuma regra alterada. | `SecurityConfig.java:31-38` |

**Em aberto nesta etapa:**

- **Frontend ainda chama as rotas removidas.** ~~`admin.service.ts` (`editarUsuarioAdmin`,
  `editarIdiomaAdmin`) e os modais de edição de usuário e de idioma em `controle-adm` (seção 3,
  "Frontend") agora recebem 405.~~ **Resolvido para usuário na seção 8.17** (`editarUsuarioAdmin`
  removido, modal virou consulta, lista tipada por `UsuarioModeracao` sem telefone nem rádio de
  papel). **Continua para idioma:** `editarIdiomaAdmin` e o modal "Editar Idioma" seguem chamando
  `PUT /admin/idiomas/{codigo}` (405).
- **`GET /logs` continua `Map` inline e sem paginação** (item 9 da seção 2) — não fazia parte da
  matriz.
- **Sem endpoint de e-mail ao usuário**, embora conste da matriz — depende da fase de e-mails.
- **JWT de conta desativada continua válido até expirar (24 h):** o bloqueio de `INATIVO` só
  acontece no login (`AuthService.login`). Relevante para a evolução de suspensão prevista para o
  endpoint de status.
- **Efeitos dos testes no banco local:** a conta seed `usuario@crow.com` estava **inativa** e foi
  reativada pelo endpoint (padrão do seed); ficaram ~13 linhas em `logs_admin` (doze
  `Tentativa bloqueada: …` e um "Alterou status"). Idiomas, módulos e frases não foram tocados.
- Corpo de erro em dev traz `trace` (stack completa) — é o `devtools` forçando
  `server.error.include-stacktrace=always`; não vale em jar empacotado, mas fica registrado.

### 8.17 Interface administrativa de moderação: topbar e aba de usuários — **concluído** (somente frontend)

Somente frontend, contraparte da seção 8.16 (que o Lucas numera como "Fase 13").
`cd api && ./mvnw -q compile` → **exit 0** (backend não alterado); `cd crow && npm run build` →
**exit 0**, com `strictTemplates` validando os bindings do novo modal contra `UsuarioModeracao`.
**Não foi verificado em navegador.** Ao final, todas as chamadas `http.*` do frontend foram
cruzadas com os `@*Mapping` do backend: a única que ainda aponta para rota removida é
`editarIdiomaAdmin` (aba Idiomas — fora do escopo desta etapa).

Arquivos: `crow/src/app/components/topbar/topbar.{ts,html}`, `crow/src/app/models/usuario.model.ts`,
`crow/src/app/services/admin.service.ts`, `crow/src/app/pages/controle-adm/controle-adm.{ts,html,css}`.
Saldo: `controle-adm.ts` −140 linhas, `controle-adm.html` −66, `controle-adm.css` −90.

**Topbar**

| # | Item | Arquivos |
|---|---|---|
| 1 | Com papel `admin`, o menu do avatar mostra só **Sair**; "Perfil" fica sob `*ngIf="!isAdmin"`. `isAdmin` é derivado de `user.role === 'admin'` na mesma assinatura de `currentUser$` que já alimenta o nome — mesma checagem de `role.guard.ts` e `login.ts`. Nenhum componente de topbar separado. | `topbar.ts:21,51`, `topbar.html:56` |

**Aba de usuários**

| # | Item | Arquivos |
|---|---|---|
| 2 | Filtro "Todos" removido. `filtroUsuarioStatus` passou de `'todos'` para `string[]` com `toggleFiltroUsuarioStatus` / `isStatusUsuarioSelecionado` — o padrão das abas Denúncias e Logs. Vazio = lista completa; clicar de novo desmarca (necessário, já que não há mais botão para voltar a "todos"). `.filter-icon.all` removido do CSS. | `controle-adm.ts:36,326-338`, `controle-adm.html:235-260` |
| 3 | **Administradores nunca entram na lista.** O backend já os omite (`buscarModeraveis`); `carregarUsuarios()` filtra `role !== 'admin'` na entrada e é o **único** ponto que insere registros em `usuarios` — a troca de status só substitui item já presente, então não há outro caminho. | `controle-adm.ts:154-168` |
| 4 | Lápis → olho (Feather `eye`), com `title` e `aria-label` "Visualizar usuário". Renomeados: `editarUsuario` → `abrirModalVisualizarUsuario`, `fecharModalEditarUsuario` → `fecharModalVisualizarUsuario`, `usuarioEmEdicao` → `usuarioEmVisualizacao`, `mostrarModalEditarUsuario` → `mostrarModalVisualizarUsuario`. Classe `btn-acao visualizar` compartilha as regras de `.btn-acao.editar` por lista de seletores — a regra original fica porque a aba Idiomas ainda a usa. | `controle-adm.html:306`, `controle-adm.ts:392-399`, `controle-adm.css:452-465` |

**Modal "Detalhes do Usuário"**

| # | Item | Arquivos |
|---|---|---|
| 5 | Modal de edição virou consulta: só texto, no padrão `.detalhe-item` do modal de denúncia (`.usuario-detalhes` compartilha a regra de `.denuncia-detalhes`). Mostra código (no `usuario-id-display`), nome, e-mail, data de entrada (`date:'dd/MM/yyyy'`, como em `visualizar-usuario`), status (badge) e quantidade de idiomas. Sem telefone, sem senha, sem rádio de papel — nenhum `<input>`, nem desabilitado. | `controle-adm.html:747-826`, `controle-adm.css:1001-1006` |
| 6 | Rodapé: **Fechar**, **Enviar e-mail** → `enviarEmailUsuario()` (`// TODO Fase 17`) e **Suspender conta** → `suspenderUsuario()` (`// TODO Fase 16`) — numeração do Lucas, não deste checklist. Os dois são métodos vazios. "Suspender" no nome para não confundir com o fluxo `abrirModalDesativarUsuario`, que continua funcionando no card. `.btn-email-modal` e `.btn-suspender-modal` reaproveitam `.btn-salvar-modal` e `.btn-confirmar-acao` por lista de seletores, sem CSS duplicado. | `controle-adm.ts:402-408`, `controle-adm.html:801-825`, `controle-adm.css:825-861,940-970` |
| 7 | Removidos do `.ts`: os sete campos do formulário, `camposVisiveis`, `podeConfirmarEdicaoUsuario`, `confirmarEdicaoUsuario`, `limparCamposUsuario`, `togglePassword`, `validarEmail`, `permitirApenasNumeros`, `aplicarMascaraTelefone`, `getForcaSenha`/`getTextoForcaSenha`/`getClasseForcaSenha`. CSS órfão removido: `.password-wrapper`, `.eye-icon`, `.divider`, bloco PASSWORD STRENGTH inteiro. `.radio-group`/`.radio-option`, `.campo` e `.btn-salvar-modal` ficaram porque o modal de idioma ainda os usa. | `controle-adm.ts`, `controle-adm.css` |

**Modelo e serviço**

| # | Item | Arquivos |
|---|---|---|
| 8 | Nova interface `UsuarioModeracao` espelhando `UsuarioModeracaoResponse` (sem telefone, com `quantidadeIdiomas`), no padrão de `UsuarioBusca`/`UsuarioVisualizar`: uma interface por projeção do backend. `Usuario` ficou intacta — o perfil próprio ainda usa `telefone`. | `usuario.model.ts:30-45` |
| 9 | `AdminService.editarUsuarioAdmin` (`PUT /admin/usuarios/{codigo}`) **removido**; `getUsuariosAdmin` e `alterarStatusUsuario` tipados por `UsuarioModeracao`. `controle-adm.ts` deixou de importar `Usuario`. | `admin.service.ts:6,24-31` |

**Em aberto nesta etapa:**

- ~~**`editarIdiomaAdmin` ainda aponta para `PUT /admin/idiomas/{codigo}` (405)** — `admin.service.ts:38`,
  usado por `confirmarEdicaoIdioma()` e pelo modal "Editar Idioma" da aba Idiomas. Remover o fluxo
  inteiro (botão do card, modal, métodos de dropdown/proficiência, CSS de bandeira/select/option)
  é a contraparte de frontend da Fase 12; não foi pedido nesta etapa.~~ **Resolvido na seção 8.22**:
  fluxo de edição removido por inteiro e substituído pela visualização somente leitura.
- **Não verificado em navegador:** dropdown da topbar como admin, toggle dos filtros, layout do
  modal com três botões no rodapé (em `max-width: 768px` o `.modal-footer` já vira coluna) e o
  badge de status dentro de `.detalhe-item` (herda `font-size: 0.95rem`, como no modal de denúncia).
  *Atualização (8.20):* toggles dos filtros, rodapé de três botões e badge do modal verificados
  em navegador (o badge fica esticado à largura do modal, como no de denúncia); **só o dropdown
  da topbar continua sem verificação**.
- **Stubs sem efeito visível:** "Enviar e-mail" e "Suspender conta" não fazem nada até as fases
  16 e 17 (numeração do Lucas). Se a apresentação vier antes, considerar `disabled` com `title`.
  *Atualização (8.20):* "Suspender conta" virou `moderarUsuarioEmVisualizacao()` e funciona;
  **só "Enviar e-mail" segue stub** (Fase 17). *Atualização (8.21):* "Enviar e-mail" virou
  `enviarEmailUsuarioEmVisualizacao()` e abre o modal de e-mail — **não resta stub**.
- **Pré-existentes, não tocados:** `busca-group` e `idioma-removido` são usadas no HTML sem regra
  CSS; `.select-filtro` é CSS sem uso.

---

### 8.18 Base de envio de e-mails (`EmailService`) — **concluído** (somente backend, ainda não ligado a nenhuma ação)

Infraestrutura para as fases de e-mail (14–16 deste checklist; 16–18 na numeração do Lucas).
`cd api && ./mvnw -q compile` → **exit 0**; `cd crow && npm run build` → **exit 0** (frontend não
alterado; as duas advertências de orçamento de CSS em `controle-adm.css` e `visualizar-idioma.css`
são pré-existentes). **Nenhum e-mail foi disparado de verdade** — os textos foram renderizados
fora do Spring, direto das constantes, e conferidos um a um; o caminho SMTP não foi exercitado.

Três arquivos **novos**, nenhum arquivo existente alterado. `EmailVerificationService` ficou
intacto, como pedido: continua síncrono e dono do código de verificação — lá a falha **precisa**
chegar ao usuário, aqui não.

| # | Item | Arquivos |
|---|---|---|
| 1 | `AsyncConfig` com `@EnableAsync` e um `ThreadPoolTaskExecutor` dedicado (`emailExecutor`): 2–4 threads, fila 100, `CallerRunsPolicy` (fila cheia envia na thread do chamador em vez de descartar o aviso) e `setWaitForTasksToCompleteOnShutdown(true)` com 15 s, para não perder envio pendente no encerramento. Primeiro `@EnableAsync` do projeto. | `api/.../config/AsyncConfig.java` (novo) |
| 2 | `EmailTemplates`: **todo** texto lido pelo usuário em constantes de uma classe só — assuntos, corpos (text blocks), saudação, assinatura, motivos padrão, `PREFIXO_ASSUNTO = "Crow - "` e o `DateTimeFormatter` `dd/MM/yyyy 'às' HH:mm`. Os corpos usam `%s` e são montados por métodos nomeados (`contaDesativada`, `contaSuspensa`, …). Classe final, construtor privado, no padrão de `CodigoPublico`. | `api/.../util/EmailTemplates.java` (novo) |
| 3 | `EmailService` com `@Slf4j`, `@RequiredArgsConstructor` e `JavaMailSender`: cinco métodos públicos — `enviarEmailPersonalizado`, `enviarAvisoContaDesativada`, `enviarAvisoContaSuspensa`, `enviarAvisoContaReativada`, `enviarAvisoIdiomaExcluido`. Só envio, validação e log; nenhum texto é montado aqui. | `api/.../service/EmailService.java` (novo) |
| 4 | **Assíncrono:** cada método público é `@Async(AsyncConfig.EMAIL_EXECUTOR)`. SMTP lento ou fora do ar não segura mais a resposta HTTP da ação administrativa. | `EmailService.java` |
| 5 | **Falha não desfaz a ação:** um único ponto de saída (`enviar`) captura qualquer exceção e registra `log.error`. Desativar uma conta funciona mesmo com o e-mail quebrado. Contrapartida assumida: quem chama **não** recebe confirmação de entrega — só o log conta a história. | `EmailService.java` |
| 6 | **Destinatário inválido não vira tentativa:** `podeEnviar` recusa usuário nulo e e-mail ausente ou malformado (regex de formato, não RFC), com `log.warn`. Mensagem personalizada vazia também é recusada — não há o que comunicar. | `EmailService.java` |
| 7 | **Sem justificativa, texto padrão:** conta desativada/suspensa caem em `MOTIVO_PADRAO_CONTA`; idioma removido, em `MOTIVO_PADRAO_IDIOMA`; suspensão sem data usa `SEM_PREVISAO_REATIVACAO`; assunto vazio vira `ASSUNTO_PERSONALIZADO_PADRAO`; cadastro sem nome perde a saudação nominal em vez de sair "Olá, null!". | `EmailTemplates.java` |
| 8 | Remetente por `app.mail.remetente`, com *fallback* para `spring.mail.username` e, se ambos vazios, decisão do próprio SMTP — `application.properties` **não** foi tocado. Log identifica o usuário pelo `codigo` público (`USR-…`), nunca pelo e-mail. | `EmailService.java:47` |

**Os cinco e-mails** (texto puro, assunto sempre prefixado com `Crow - `):

| Método | Assunto | Variáveis |
|---|---|---|
| `enviarEmailPersonalizado` | assunto do admin, ou "Mensagem da equipe" | mensagem livre |
| `enviarAvisoContaDesativada` | "Sua conta foi desativada" | justificativa (opcional) |
| `enviarAvisoContaSuspensa` | "Sua conta foi suspensa temporariamente" | justificativa e data de reativação (ambas opcionais) |
| `enviarAvisoContaReativada` | "Sua conta foi reativada" | — |
| `enviarAvisoIdiomaExcluido` | "Um idioma que você criou foi removido" | nome do idioma e mensagem (opcional) |

**Em aberto nesta etapa:**

- ~~**Nada chama o serviço ainda.** Desativar conta, excluir idioma e o botão "Enviar e-mail" do modal
  (stub da seção 8.17) continuam sem disparo. Ligar os pontos é a fase seguinte, e o `LogAdminService`
  deve registrar o envio junto da ação.~~ **Resolvido para conta na seção 8.19** (desativada,
  suspensa e reativada, com log da ação — o `EmailService` continua sem confirmar entrega, então
  o log registra a ação, não o envio). **Mensagem personalizada resolvida na seção 8.21**
  (`POST /admin/usuarios/{codigo}/email`). **Continua só para idioma excluído.**
- ~~**Não há suspensão no domínio.** `Usuario.Status` só tem `ATIVO`/`INATIVO`; não existe campo de
  reativação prevista. `enviarAvisoContaSuspensa` já aceita a data, mas o backend ainda não sabe
  suspender — ver a ressalva da Fase 10 no checklist.~~ **Resolvido na seção 8.19**
  (`suspensoAte`, `motivoStatus`, `statusAlteradoEm` e o agendador de reativação).
- **Texto puro, sem HTML.** A identidade visual dos e-mails (Fase 15) continua aberta; quando vier,
  o corpo HTML entra em `EmailTemplates` e o `SimpleMailMessage` vira `MimeMessage`.
- **"Responda a este e-mail" aparece em quatro dos cinco textos** e só se sustenta se a caixa de
  `MAIL_USERNAME` for lida por alguém. Decisão pendente do Lucas; troca é numa constante só.
- **A desativação não diz se é permanente**, de propósito — depende de como a fase de suspensão
  distinguir os dois casos. *Atualização (8.19):* os casos ficaram distintos — "desativada" é
  sempre por tempo indeterminado e "suspensa" sempre tem data —, mas o texto do e-mail de
  desativação **não foi alterado**; dizer "por tempo indeterminado" nele é decisão de redação
  pendente.
- **`@Async` lê o `Usuario` fora da thread da requisição.** Hoje é seguro (o projeto não usa
  `getReferenceById` e `Usuario` não tem associação preguiçosa), e está registrado no javadoc:
  passar sempre entidade carregada.
- **Não exercitado com SMTP real**, nem com caixa de verdade: acento, quebra de linha e remetente
  no cliente de e-mail continuam por conferir.

### 8.19 Desativação por tempo indeterminado e suspensão temporária com reativação automática — **concluído** (somente backend)

Fase 16 na numeração do Lucas (suspensão de conta). `cd api && ./mvnw -q compile` → **exit 0**;
`cd crow && npm run build` → **exit 0** (frontend não alterado; as duas advertências de orçamento
de CSS em `controle-adm.css` e `visualizar-idioma.css` são pré-existentes). O `contextLoads`
subiu contra o PostgreSQL local (o `ddl-auto=update` criou as três colunas novas, nulas) e um
teste descartável — apagado depois, com `JavaMailSender` mockado para nada sair pelo Gmail —
exercitou o fluxo inteiro contra o banco: prazo no passado/ausente recusado, suspensão via
serviço, agendador ignorando prazo futuro, reativação de prazo vencido (status `ATIVO`,
`suspensoAte`/`motivoStatus` nulos), log de sistema com admin nulo, e-mail disparado, "conta
já está ativa" e "já está desativada" recusados, desativação indeterminada intocada pelo
agendador. **Nenhum e-mail real foi enviado**; o caminho SMTP continua por exercitar.

Esta seção **substitui a linha 5 da tabela de endpoints da seção 8.16** e resolve os dois
primeiros itens "em aberto" da seção 8.18.

**Duas modalidades.** *Desativação por tempo indeterminado*: `status = INATIVO`,
`suspensoAte = null`, só volta por ação manual. *Suspensão temporária*: `status = INATIVO`,
`suspensoAte` = data futura informada; ao ser atingida, a conta volta sozinha a `ATIVO` e o campo
é zerado. Suspender uma conta já suspensa só redefine o prazo; desativar uma conta suspensa a
converte em indeterminada; suspender uma desativada lhe dá prazo.

Arquivos: `api/.../entity/Usuario.java`, `repository/UsuarioRepository.java`,
`service/UsuarioService.java`, `service/AuthService.java`, `service/LogAdminService.java`,
`controller/AdminController.java`, `util/EmailTemplates.java` (uma constante tornada pública),
`dto/usuario/UsuarioModeracaoResponse.java`, `dto/usuario/AlterarStatusUsuarioRequest.java` (novo),
`config/SchedulingConfig.java` (novo), `service/ReativacaoAutomaticaScheduler.java` (novo).

**Contrato novo de `PUT /api/admin/usuarios/{codigo}/status`** (o corpo antigo `{"status"}` **não é
mais aceito** — responde 400 por `acao` ausente):

```json
{ "acao": "suspender", "justificativa": "…", "reativacaoEm": "2026-09-25T10:00:00" }
```

| Regra | Resposta |
|---|---|
| `acao` ausente ou fora de `DESATIVAR` / `SUSPENDER` / `REATIVAR` (qualquer caixa) | 400 |
| `reativacaoEm` ausente ou no passado em `SUSPENDER` | 400 |
| `reativacaoEm` enviada em `DESATIVAR` / `REATIVAR` (pedido contraditório) | 400 |
| `justificativa` acima de 1000 caracteres (`@Size`) | 400 |
| `REATIVAR` em conta já ativa; `DESATIVAR` em conta já desativada por tempo indeterminado | 400, sem e-mail repetido |
| alvo com papel `ADMIN`, inclusive o próprio (`exigirContaModeravel`, mantido) | 403 + log de tentativa |

**Backend**

| # | Item | Arquivos |
|---|---|---|
| 1 | `Usuario` ganhou `suspensoAte` (`suspenso_ate`), `motivoStatus` (`motivo_status`, 1000) e `statusAlteradoEm` (`status_alterado_em`), todos nulos — sem backfill, por decisão: nulo nas contas existentes é o estado correto. | `Usuario.java:53-69` |
| 2 | `AlterarStatusUsuarioRequest` (`record` com `@NotBlank acao`, `@Size(max=1000) justificativa`, `LocalDateTime reativacaoEm` e o `enum Acao` aninhado). `acao` chega como `String` e é convertida em `parseAcao` com mensagem amigável, no padrão do antigo `parseStatus`; Jackson lê `2026-09-25T10:00` e `…T10:00:00` sem configuração. | `dto/usuario/AlterarStatusUsuarioRequest.java`, `AdminController.java:255-262` |
| 3 | Transições em `UsuarioService`: `desativar`, `suspender`, `reativar` e `reativarSuspensaoVencida` (`@Transactional`, reconfere a condição dentro da transação e devolve `Optional` vazio se um admin já mexeu na conta entre a listagem e a reativação). Tudo passa por um único `aplicarStatus`, que mantém `status`, `suspensoAte`, `motivoStatus` (aparado; vazio vira nulo) e `statusAlteradoEm` coerentes. `alterarStatus(Long, Status)` removido — só o `AdminController` o usava. `exigirNaoAdmin` repete no serviço a regra do controller, para valer para qualquer chamador. | `UsuarioService.java:161-245` |
| 4 | `findByStatusAndSuspensoAteLessThanEqual(INATIVO, agora)`: contas com prazo vencido. | `UsuarioRepository.java:29` |
| 5 | **Orquestração no controller, como nas demais ações** (serviço muda estado; controller avisa e registra): `desativar` → `enviarAvisoContaDesativada`; `suspender` → `enviarAvisoContaSuspensa` com a data; `reativar` → `enviarAvisoContaReativada`. Como o `save` já confirmou antes de o controller chamar o `EmailService` (assíncrono), não sai aviso de ação que falhou. | `AdminController.java:49,109-170` |
| 6 | Log em toda ação, com administrador, ação, usuário, justificativa (ou "sem justificativa") e, na suspensão, "reativação prevista: dd/MM/yyyy às HH:mm". | `AdminController.java:132-170` |
| 7 | `SchedulingConfig` (`@EnableScheduling`, primeiro do projeto; `TaskScheduler` padrão do Boot, uma thread) e `ReativacaoAutomaticaScheduler`: `@Scheduled(fixedDelay = 5 min)` — conta a partir do fim da rodada anterior, então rodadas nunca se sobrepõem; primeira execução logo na subida, para pegar prazos vencidos enquanto a API esteve fora. Uma transação por conta dentro de `try/catch`: falha em uma (banco, e-mail, log) vira `log.error` e as demais seguem. O prazo vencido é guardado antes da reativação (que o zera) para constar no log. | `config/SchedulingConfig.java`, `service/ReativacaoAutomaticaScheduler.java:41-70` |
| 8 | `LogAdminService.registrarAcaoSistema`: log com `admin` nulo (coluna `admin_id` já era nula por mapeamento) e prefixo `Ação automática do sistema: `. `GET /logs` já tratava admin nulo (`adminNome` vazio). **Também:** `registrar` passou a cortar `acao` (200) e `detalhes` (1000) no tamanho da coluna — justificativa de 1000 caracteres somada ao prefixo estouraria o `varchar` e transformaria uma ação já aplicada em 500. | `LogAdminService.java:21-25,34-43,66-68,74-79` |
| 9 | Login: `INATIVO` continua barrado **depois** da senha (situação da conta não serve para enumerar e-mails), agora com três mensagens: "Conta desativada. Entre em contato com a equipe de moderação."; "Conta suspensa temporariamente. Previsão de reativação: dd/MM/yyyy às HH:mm."; e, na janela de até 5 min entre o prazo vencer e o agendador passar, "A reativação automática está em andamento; tente novamente em alguns minutos." Nunca expõe a justificativa nem outro dado do cadastro. | `AuthService.java:55-79` |
| 10 | `EmailTemplates.FORMATO_DATA` tornado público — única alteração nesse arquivo — para login e log mostrarem a previsão exatamente como ela sai no e-mail. | `EmailTemplates.java:36-42` |
| 11 | `UsuarioModeracaoResponse` ganhou `suspensoAte`, `motivoStatus` e `statusAlteradoEm` (ISO ou nulo), aditivo, para a tela de admin exibir a situação. `UsuarioResponse` (próprio perfil) não mudou: conta inativa não loga, então nunca veria os campos. | `dto/usuario/UsuarioModeracaoResponse.java`, `UsuarioService.java:99-122` |
| 12 | `CAMPOS_PROIBIDOS`, `rejeitarCamposProibidos` e `parseStatus` removidos do `AdminController`: só existiam porque o corpo era `Map` (decisão da seção 8.16, item 5). Com DTO fechado, `role`/`senha` são ignorados na desserialização — a garantia continua; perde-se apenas o log de "tentativa bloqueada" para esses campos. Javadoc da classe atualizado. | `AdminController.java:28-37` |

**Em aberto nesta etapa:**

- ~~**Frontend quebra até migrar.** `admin.service.ts#alterarStatusUsuario` e o toggle de status da
  aba Usuários ainda mandam `{ status }` → 400. Precisam passar a enviar
  `{ acao, justificativa?, reativacaoEm? }`; o stub `suspenderUsuario()` da seção 8.17 vira a
  tela de suspensão (data/hora futura + justificativa), e o modal pode exibir `suspensoAte` /
  `motivoStatus` / `statusAlteradoEm` que a resposta já traz.~~ **Resolvido na seção 8.20**
  (DTO `AlterarStatusUsuario`, modal "Desativar / Suspender Conta", modal "Reativar Conta" e os
  três campos exibidos na listagem e na consulta).
- **JWT de conta desativada continua válido até expirar (24 h)** — item já registrado na seção
  8.16; o `JwtAuthenticationFilter` não consulta status. Bloquear na hora exige uma consulta ao
  banco por requisição no filtro.
- **Erro de `@Valid` sem mensagem amigável.** Sem `@ControllerAdvice`, `justificativa` acima de
  1000 caracteres devolve o texto padrão "Validation failed for argument…" — comportamento
  pré-existente de todos os DTOs validados; fica para uma revisão geral de erros.
- **`enviarAvisoIdiomaExcluido` e `enviarEmailPersonalizado` seguem sem ponto de chamada** —
  fora do escopo desta fase (exclusão de idioma e botão "Enviar e-mail" do modal).
- **Fuso horário implícito.** `reativacaoEm` é `LocalDateTime` (sem zona), comparado com o
  relógio do servidor; vale enquanto API e navegador estiverem no mesmo fuso.
- **Efeitos dos testes no banco local:** nenhum. O usuário e o log criados pelo teste descartável
  foram removidos no próprio teste; só as três colunas novas ficaram (nulas), como ficariam na
  primeira subida da API.

---

### 8.20 Interface de desativação, suspensão e reativação de contas — **concluído** (somente frontend)

Contraparte de frontend da seção 8.19 (Fase 16 na numeração do Lucas). `cd api && ./mvnw -q compile`
→ **exit 0** (backend não alterado); `cd crow && npm run build` → **exit 0**, com os dois avisos
pré-existentes de orçamento de CSS (`controle-adm.css` foi de 35,2 kB para 40,4 kB — 8,4 kB acima
dos 32 kB; `visualizar-idioma.css` inalterado em 43,2 kB). **Verificado em navegador** (Chrome
headless dirigido por DevTools Protocol, com a API subida com `SPRING_MAIL_HOST=127.0.0.1
SPRING_MAIL_PORT=1` para nenhum e-mail real sair — o `EmailService` registra a falha e a ação
segue): suspensão de "Usuário Teste" com data passada (bloqueada) e futura, indicador na
listagem, detalhes, reativação pelo modal de consulta, desativação indeterminada, reativação pelo
card, os quatro logs, o caminho de erro do backend (400 "Conta já está ativa" exibido no modal) e
os três chips de filtro em 1400, 420 e 350 px, nos dois temas. Zero erros de console.
Esta seção **resolve o primeiro item "em aberto" da seção 8.19** e dois da seção 8.17.

Arquivos: `crow/src/app/models/usuario.model.ts`, `crow/src/app/services/admin.service.ts`,
`crow/src/app/pages/controle-adm/controle-adm.{ts,html,css}`. Nenhum arquivo do backend.

**Modelo e serviço**

| # | Item | Arquivos |
|---|---|---|
| 1 | `UsuarioModeracao` ganhou `suspensoAte`, `motivoStatus` e `statusAlteradoEm` (`string \| null`, ISO local), espelhando `UsuarioModeracaoResponse`. Novos `AcaoStatusUsuario` (`'DESATIVAR' \| 'SUSPENDER' \| 'REATIVAR'`) e `AlterarStatusUsuario` (`acao`, `justificativa?`, `reativacaoEm?`), espelho do `record` Java, no mesmo arquivo. | `usuario.model.ts:45-71` |
| 2 | `AdminService.alterarStatusUsuario(codigo, dados: AlterarStatusUsuario)` envia o DTO novo; o corpo `{ status }` (400 desde a 8.19) desapareceu. `JSON.stringify` omite os campos `undefined`, então `reativacaoEm` só viaja em `SUSPENDER` — exigência do controller. | `admin.service.ts:6,29-31` |

**Modal "Desativar / Suspender Conta"** (substitui "Desativar/Ativar Usuário", que alternava status por um toggle)

| # | Item | Arquivos |
|---|---|---|
| 3 | Duas opções mutuamente exclusivas como cards-rádio (`<label class="opcao-moderacao">` com `<input type="radio" name="tipoDesativacao">`, `[ngModel]`/`(ngModelChange)`): "Desativar por tempo indeterminado" e "Suspender temporariamente", cada uma com ícone, título e descrição. Só `<span>` dentro do `<label>` (conteúdo de frase). As regras vivem em `.opcoes-moderacao .opcao-moderacao` de propósito: como os cards são `<label>` dentro de `.campo`, `.campo label` (display/margem) e `.campo input` (padding, borda, largura total) venceriam seletores de uma classe só. | `controle-adm.html:915-951`, `controle-adm.ts:14,86-87,491-494`, `controle-adm.css:2079-2173` |
| 4 | Na suspensão temporária aparece `datetime-local` (classe `input-data`, a mesma dos filtros) com `[min]` no minuto atual. Validação: `dataReativacao` (`Date` ou `null`), `dataReativacaoFutura` e `reativacaoInvalida` — o erro "precisam estar no futuro" só aparece depois de preenchido (vazio é "ainda não escolheu"). Resumo em linguagem natural: "A conta será reativada automaticamente em 12/09/2026 às 14:30." | `controle-adm.html:955-973`, `controle-adm.ts:497-522`, `controle-adm.css:2175-2244` |
| 5 | `formatarDataHora` produz `dd/MM/yyyy às HH:mm` via `toLocaleDateString`/`toLocaleTimeString('pt-BR')` — o mesmo formato de `EmailTemplates.FORMATO_DATA`, usado no e-mail, no log e no login. `formatarData` (com vírgula) continua nas denúncias e logs. | `controle-adm.ts:460-471` |
| 6 | Justificativa opcional: `textarea` com `[maxlength]="limiteJustificativa"` (1000, `readonly` no componente), contador `N/1000 caracteres` (âmbar no limite) e texto fixo: "Se preenchida, a justificativa será incluída no e-mail enviado ao usuário. Caso contrário, o e-mail trará a mensagem padrão da equipe de moderação." O `trim()` acontece antes do envio; vazio vira `undefined`, e o backend já grava `null`. | `controle-adm.html:976-994`, `controle-adm.ts:86,533-534` |
| 7 | Aviso `.aviso-email` (âmbar, ícone de envelope) com o endereço do usuário e o tipo da ação ("suspensão temporária" / "desativação"), mais a consequência: não acessa a plataforma enquanto inativa. | `controle-adm.html:997-1007`, `controle-adm.css:2246-2270` |
| 8 | Confirmação: `[disabled]="!podeConfirmarDesativacao"` (alvo presente, não salvando, justificativa dentro do limite, e — na temporária — data futura); texto "Aplicando…" durante a requisição; ícone conforme a modalidade; `btn-confirmar-acao` ganhou `:disabled` e o hover passou a `:hover:not(:disabled)`. Cancelar, "×" e o clique no overlay ficam bloqueados enquanto `salvandoDesativacao`. Erro: `err.error.message` do backend (ou fallback) em `.erro-inline` dentro do modal, sem fechar; o botão volta a habilitar. | `controle-adm.html:1009-1033`, `controle-adm.ts:485-489,524-560`, `controle-adm.css:990-1010,2272-2281` |
| 9 | Envio: `acao` = `SUSPENDER`/`DESATIVAR`; `reativacaoEm` = valor do `datetime-local` completado com `:00` (`paraIsoLocal`), **sem conversão de fuso** — o backend compara `LocalDateTime` com o relógio do servidor (ressalva de fuso da 8.19 mantida). Sucesso: `substituirUsuario` troca o item na lista (nunca insere), toast "suspensa até dd/MM/yyyy às HH:mm" ou "desativada por tempo indeterminado", logs recarregados. | `controle-adm.ts:530-560,602-620` |

**Reativação manual**

| # | Item | Arquivos |
|---|---|---|
| 10 | Novo modal "Reativar Conta" (`modal-pequeno`, ícone check em verde `.icone-sucesso`): confirmação com nome e código, texto conforme o caso (suspensa: mostra a previsão automática e avisa que a reativação passa a ser agora; desativada: volta a acessar normalmente), aviso de e-mail, `.erro-inline`, "Reativando…" e fechamento bloqueado durante a requisição. Envia `{ acao: 'REATIVAR' }`. | `controle-adm.html:1037-1093`, `controle-adm.ts:73,82,95-96,564-597`, `controle-adm.css:1138-1140` |
| 11 | Acessível de dois lugares: pelo card (botão verde `btn-acao ativar`, ícone check-circle, só para conta inativa) e pelo modal "Detalhes do Usuário", cujo stub `suspenderUsuario()` virou `moderarUsuarioEmVisualizacao()` — fecha a consulta e abre o modal certo para a situação da conta. O rodapé da consulta alterna entre **Desativar / Suspender** (`btn-suspender-modal`, vermelho) e **Reativar conta** (`btn-reativar-modal`, verde). `enviarEmailUsuario()` continua stub (Fase 17) — *resolvido na 8.21*. | `controle-adm.html:342-363,868-887`, `controle-adm.ts:427-440`, `controle-adm.css:1012-1048` |

**Listagem e consulta**

| # | Item | Arquivos |
|---|---|---|
| 12 | Três situações em vez de duas: `estaSuspenso` (inativa com `suspensoAte`), `getStatusUsuarioClass` (`ativo` / `suspenso` / `inativo`) e `getStatusUsuarioTexto` (Ativo / Suspenso / Desativado). No card: avatar e badge âmbar para suspensa (`.usuario-avatar.suspenso`, `.status-badge.suspenso`) e linha extra `.info-row.situacao-conta` — "Reativação prevista: dd/MM/yyyy às HH:mm" (âmbar, relógio) ou "Desativada por tempo indeterminado" (cinza). A linha reserva `padding-right: 3.6rem` para não passar por baixo da coluna absoluta de botões; em ≤ 480 px, onde os botões deixam de flutuar, a reserva é zerada. *Na 8.21 a coluna virou linha com faixa própria no rodapé do card, e a reserva lateral foi removida.* | `controle-adm.html:289-333`, `controle-adm.ts:445-458`, `controle-adm.css:377-380,430-455,2532-2534` |
| 13 | Chip **Suspensos** no filtro da aba (relógio âmbar, `.filter-icon.suspenso` agrupado com `.filter-icon.pendente`), entre Ativos e o terceiro chip, que foi **renomeado de "Inativos" para "Desativados"** para bater com o badge. O filtro compara com `getStatusUsuarioClass(u)` em vez do `status` bruto, então os três chips são disjuntos — sem isso "Inativos" englobaria as suspensas. Em ≤ 480 px a grade `compact` já era de 3 colunas. | `controle-adm.html:232-272`, `controle-adm.ts:38-42,364-366`, `controle-adm.css:1302-1305` |
| 14 | "Detalhes do Usuário" mostra, quando existem, "Reativação automática prevista", "Justificativa registrada" (em `.descricao-texto`) e "Última alteração de status"; o badge usa a mesma tríade. | `controle-adm.html:823-844` |

**Em aberto nesta etapa:**

- **Conta inativa só oferece "Reativar".** O backend aceita converter suspensão em desativação
  indeterminada e redefinir o prazo de uma suspensão (8.19), mas a UI não expõe esses caminhos:
  o card e a consulta de conta inativa abrem só o modal de reativação. Se for necessário, é abrir
  o modal "Desativar / Suspender" também para inativas, com o texto ajustado.
- **Listagem não acompanha o agendador.** Quando a reativação automática acontece, a lista só
  reflete o status novo ao recarregar a página; uma suspensão com prazo já vencido aparece como
  "Reativação prevista" em data passada até lá. Não há polling, de propósito.
- **`reativacaoInvalida` só reavalia em eventos.** Com detecção zoneless, uma data escolhida como
  futura e deixada no formulário até vencer não vira erro sozinha; o backend recusa (400) e a
  mensagem aparece no modal. Aceitável para um prazo em minutos.
- **Chip "Inativos" renomeado sem pedido explícito** — decisão de consistência com o badge
  "Desativado"; reverter é trocar um texto (`controle-adm.html:269`).
- **Efeitos dos testes no banco local:** "Usuário Teste" (`usuario@crow.com`) terminou **ativo**,
  como começou, mas as rodadas deixaram linhas em `logs_admin` (LOG-21 em diante: suspensão,
  reativações e desativação). Nenhum e-mail saiu (SMTP apontado para porta fechada por variável
  de ambiente; `application-local.properties` não foi tocado).
- **Pré-existentes, não tocados:** o badge de status dentro de `.detalhe-item` continua esticado
  à largura do modal (flex column sem `align-self`), como no modal de denúncia; o filtro
  "Ativos/Suspensos/Desativados" não mostra contagem por chip.

### 8.21 Envio de e-mail ao usuário pela aba Usuários — **concluído** (backend + frontend)

Fase 17 na numeração do Lucas (e-mail personalizado ao usuário). Liga o
`enviarEmailPersonalizado` da seção 8.18 a uma ação da moderação e elimina o último stub da
seção 8.17. `cd api && ./mvnw -q compile` → **exit 0**; `cd crow && npm run build` → **exit 0**
(mesmos dois avisos de orçamento de CSS; `controle-adm.css` foi de 40,4 kB para 41,0 kB).
**Verificado em navegador** (Chrome headless via DevTools Protocol, API com
`SPRING_MAIL_HOST=127.0.0.1 SPRING_MAIL_PORT=1`): cards com três botões em 1400 e 400 px nos
dois temas, modal aberto pelo card e pela consulta, botão Enviar só habilita com os dois campos
preenchidos, cancelar + reabrir volta vazio, envio real ao "Usuário Teste" → 202, toast, LOG-27
com assunto e início da mensagem, e a API registrou `ERROR … Falha ao enviar e-mail (mensagem
personalizada)` na thread `crow-email-1` sem afetar a resposta. Via `curl`: alvo ADMIN → 403 com
LOG-28/29 "Tentativa bloqueada: envio de e-mail de conta administrativa"; assunto em branco ou com
151 caracteres → 400; sem token → 403. Zero erros de console.

Arquivos: `api/.../dto/usuario/EnviarEmailUsuarioRequest.java` (novo),
`api/.../controller/AdminController.java`, `crow/src/app/models/usuario.model.ts`,
`crow/src/app/services/admin.service.ts`, `crow/src/app/pages/controle-adm/controle-adm.{ts,html,css}`.

**Backend**

| # | Item | Arquivos |
|---|---|---|
| 1 | `EnviarEmailUsuarioRequest` (`record`): `@NotBlank @Size(max = 150) assunto` e `@NotBlank @Size(max = 5000) mensagem`, no padrão de `AlterarStatusUsuarioRequest` (sem mensagens customizadas — a falha de `@Valid` continua genérica, item aberto da 8.19). | `EnviarEmailUsuarioRequest.java` |
| 2 | `POST /api/admin/usuarios/{codigo}/email` (`AdminController.enviarEmailUsuario`): resolve o alvo por código, recusa ADMIN pelo `exigirContaModeravel` já existente (403 + log de tentativa bloqueada), chama `emailService.enviarEmailPersonalizado(alvo, assunto.trim(), mensagem)` e responde **202 Accepted sem corpo** — o envio corre no `emailExecutor` e uma falha de SMTP depois disso fica só no log de erro da aplicação, sem confirmação de entrega. Coberto por `/api/admin/**` → `ROLE_ADMIN` no `SecurityConfig`, sem alteração lá. | `AdminController.java:82,176-203` |
| 3 | Log administrativo (`LogAdminService.registrar`, tipo `USUARIO`): ação "Enviou e-mail ao usuário <nome>", detalhes "Código: … — assunto: … — início da mensagem: …". `resumoMensagem` colapsa quebras e espaços repetidos em um espaço e corta em `LIMITE_MENSAGEM_LOG = 200` caracteres com reticências — **o corpo completo nunca vai para o log**. Admin e data vêm do próprio `registrar`/`@PrePersist`. | `AdminController.java:45,196-216` |

**Frontend**

| # | Item | Arquivos |
|---|---|---|
| 4 | Interface `EnviarEmailUsuario { assunto; mensagem }` (espelho do `record`) e `AdminService.enviarEmailUsuario(codigo, dados): Observable<void>` (`POST …/email`). | `usuario.model.ts:73-82`, `admin.service.ts:6,34-41` |
| 5 | Botão `.btn-acao.email` (envelope, tinta primária como o "visualizar") em cada card, entre Visualizar e Desativar/Reativar; `title`/`aria-label` "Enviar e-mail ao usuário". Aparece para qualquer situação da conta — a moderação pode precisar falar com quem está suspenso. | `controle-adm.html:342-347`, `controle-adm.css:483-499` |
| 6 | **Layout do card:** com três botões, a coluna vertical de `.usuario-acoes` colidia com o badge de status (ou exigiria cards ~60 px mais altos). A coluna virou **linha** no canto inferior direito e o `.usuario-card` reserva a faixa com `padding-bottom: calc(1.2rem + 40px + 0.8rem)` (`1rem + …` em ≤ 768 px). O `padding-right: 3.6rem` de `.info-row.situacao-conta` (8.20) e seu reset em ≤ 480 px saíram, por não ter mais o que desviar; em ≤ 480 px, onde as ações já eram estáticas, o `padding-bottom: 3.5rem` órfão virou `1.5rem`. Card de conta ativa foi de 160 para 169 px de altura. | `controle-adm.css:336-350,439-445,456-465,2437-2440,2557-2563` |
| 7 | Modal "Enviar E-mail" (`modal-container` padrão): faixa `.usuario-id-display.destinatario-email` com rótulo DESTINATÁRIO, nome, e-mail (`overflow-wrap: anywhere`) e ID, para conferência antes do envio; campo Assunto (`input`, `[maxlength]="limiteAssuntoEmail"` = 150) e Mensagem (`textarea`, `rows="8"`, `[maxlength]="limiteMensagemEmail"` = 5000), cada um com `.campo-rodape` (ajuda + contador `N/limite caracteres`, âmbar no limite, no padrão da justificativa da 8.20); `.aviso-email` com o endereço e a observação de que o envio é em segundo plano; `.erro-inline` para o `err.error.message` do backend. Textos avisam que o assunto sai com prefixo "Crow - ", que o corpo vai entre saudação e assinatura e que o log guarda só assunto e início da mensagem. | `controle-adm.html:1102-1200`, `controle-adm.css:2051-2088` |
| 8 | Estado no componente: `mostrarModalEmailUsuario`, `usuarioEmEmail`, `assuntoEmail`, `mensagemEmail`, `enviandoEmail`, `erroEmail`, limites `readonly`. `abrirModalEmailUsuario(usuario)` limpa e abre; `fecharModalEmailUsuario()` fecha **e limpa os campos** (`limparCamposEmail`), então o próximo envio não herda nada; fechar (Cancelar, "×", overlay) fica bloqueado enquanto `enviandoEmail`. `podeEnviarEmail`: alvo presente, não enviando, assunto e mensagem não vazios após `trim()` e dentro dos limites. | `controle-adm.ts:74,84,100-106,614-644` |
| 9 | `confirmarEnvioEmail()`: envia `assunto`/`mensagem` já com `trim()`, "Enviando…" no botão (`btn-email-modal` ganhou `:disabled` e o hover passou a `:hover:not(:disabled)`), sucesso → fecha, toast `E-mail para "<nome>" enviado com sucesso!` e recarrega os logs; erro → mensagem do backend (ou fallback) no modal, botão volta a habilitar, `detectChanges()` explícito (zoneless). | `controle-adm.ts:646-667`, `controle-adm.css:876-892` |
| 10 | O botão "Enviar e-mail" do modal "Detalhes do Usuário" deixou de ser stub: `enviarEmailUsuarioEmVisualizacao()` fecha a consulta e abre o modal de e-mail para o mesmo usuário, no fluxo de `moderarUsuarioEmVisualizacao()`. | `controle-adm.html:868`, `controle-adm.ts:449-455` |

**Em aberto nesta etapa:**

- **"Enviado com sucesso" significa "aceito pela API".** O 202 chega antes de o SMTP ser tocado;
  se a entrega falhar, só o log de erro da API sabe. O aviso no modal diz que o envio é em segundo
  plano, mas o toast fala em "enviado". Uma confirmação de entrega exigiria status por e-mail
  (tabela ou campo), fora do escopo.
- **Sem rascunho.** Cancelar descarta assunto e mensagem de propósito (requisito de não herdar
  conteúdo); não há confirmação "descartar o texto?" ao fechar com campos preenchidos.
- **Log de tentativa bloqueada lê "envio de e-mail de conta administrativa"** — formato fixo do
  `exigirContaModeravel` (`<ação> de conta administrativa`); "a conta administrativa" ficaria
  melhor, mas exigiria mudar o helper compartilhado.
- **Efeitos dos testes no banco local:** LOG-27 (envio ao "Usuário Teste"), LOG-28 e LOG-29
  (bloqueios) em `logs_admin`. Nenhum e-mail saiu (SMTP em porta fechada por variável de ambiente;
  `application-local.properties` não foi tocado).
- **Pré-existentes, não tocados:** ~~o modal "Editar Idioma" e `editarIdiomaAdmin` continuam
  apontando para rota removida (8.17)~~ (resolvido na seção 8.22); a falha de `@Valid` continua
  com mensagem genérica (8.19).

---

### 8.22 Visualização de idioma pelo administrador e exclusão com aviso ao proprietário — **concluído** (backend + frontend)

Fase 18 na numeração do Lucas (contraparte de frontend da Fase 12 mais a evolução do `DELETE`
prevista na seção 8.16). Fecha a aba Idiomas do `controle-adm` no mesmo modelo da aba Usuários:
o administrador **vê** o conteúdo e pode **excluir o idioma inteiro**; nada mais.
`cd api && ./mvnw -q compile` → **exit 0**; `cd crow && npm run build` → **exit 0** (mesmos dois
avisos de orçamento de CSS; `controle-adm.css` foi de 41,0 kB para 37,1 kB). **Verificado em
navegador** (Chrome headless via DevTools Protocol, API com `SPRING_MAIL_HOST=127.0.0.1
SPRING_MAIL_PORT=1`): `?aba=idiomas` abre a aba certa; o card tem só "Visualizar idioma" e
"Excluir idioma"; o olho leva a `/visualizar-idioma-adm?id=IDM-…`, que carregou 2 módulos e 4
frases nos três modos (tradução com palavras e respostas aceitas, pares com imagem, quiz com
alternativa correta); os únicos botões da página são Voltar, Excluir idioma, Expandir/Recolher
todos e os cabeçalhos dos módulos; modal de exclusão aberto e cancelado nas duas telas (contador
`17/1000`, texto do aviso padrão presente); Voltar cai em `/controle-adm?aba=idiomas`; tema claro
e 390 px sem quebra; zero erros de console. Via `curl`: `DELETE` sem corpo e com corpo em código
inexistente → 404 (o corpo opcional não quebra a rota); `mensagem` com 1001 caracteres → 400.
**A exclusão real não foi executada** para não apagar idiomas do banco local — o caminho de
sucesso (e-mail + log) foi validado por leitura do código e compilação, não por execução.

**Decisão de desenho:** rota dedicada em vez de modal, pelo volume (até 20 módulos × 50 frases
com imagens e iframes de vídeo — um modal de `max-height: 90vh` viraria rolagem dentro de
rolagem), pelo reaproveitamento da apresentação de frases de `visualizar-modulo` e por a URL ser
endereçável a partir de uma denúncia.

Arquivos: `api/.../dto/idioma/ExcluirIdiomaRequest.java` (novo),
`api/.../controller/AdminController.java`, `crow/src/app/app.routes.ts`,
`crow/src/app/models/idioma.model.ts`, `crow/src/app/models/modulo.model.ts`,
`crow/src/app/services/admin.service.ts`, `crow/src/app/pages/controle-adm/controle-adm.{ts,html,css}`,
`crow/src/app/pages/visualizar-idioma-adm/visualizar-idioma-adm.{ts,html,css}` (novos).

**Backend**

| # | Item | Arquivos |
|---|---|---|
| 1 | `ExcluirIdiomaRequest` (`record`): só `@Size(max = 1000) mensagem`, sem `@NotBlank` — o corpo inteiro é opcional. | `ExcluirIdiomaRequest.java` |
| 2 | `DELETE /api/admin/idiomas/{codigo}` passou a receber `@Valid @RequestBody(required = false) ExcluirIdiomaRequest`. Nome, código e `Usuario proprietario` (`idioma.getCriador()`, já inicializado por `IdiomaService.resolver`) são lidos **antes** de `excluirComoAdmin`, porque depois a entidade não existe mais; `Usuario` não tem relação preguiçosa, então a instância desanexada serve ao e-mail. | `AdminController.java:236-280` |
| 3 | Depois da exclusão bem-sucedida: `emailService.enviarAvisoIdiomaExcluido(proprietario, nomeIdioma, mensagem)` — assíncrono; mensagem em branco ou corpo ausente → `EmailTemplates.MOTIVO_PADRAO_IDIOMA`; proprietário nulo → o serviço apenas loga e não envia. Nada é enviado nem registrado se a exclusão lançar. | `AdminController.java:266` |
| 4 | Log `IDIOMA`: ação "Excluiu idioma <nome>", detalhes "Código: IDM-… — proprietário: <nome> (USR-…) — aviso padrão ao proprietário" **ou** "— aviso ao proprietário com mensagem personalizada — início da mensagem: …" (mesmo `resumoMensagem` da 8.21: 200 caracteres, espaços colapsados). Admin e data vêm de `registrar`/`@PrePersist`. | `AdminController.java:268-277` |

**Frontend — aba Idiomas**

| # | Item | Arquivos |
|---|---|---|
| 5 | Modelos: `IdiomaCompletoAdm { idioma; modulos: ModuloCompletoAdm[] }`, `ExcluirIdioma { mensagem? }` e `criadoEm` em `IdiomaAdm`; `ModuloAdm` (espelho de `ModuloResponse`, ícone como string) e `ModuloCompletoAdm { modulo; frases: Frase[] }`. | `idioma.model.ts:1,47,50-64`, `modulo.model.ts:2,15-32` |
| 6 | `AdminService`: `editarIdiomaAdmin` **removido**; `getIdiomaCompletoAdmin(codigo)` (`GET …/idiomas/{codigo}`, endpoint da 8.16); `excluirIdiomaAdmin(codigo, dados = {})` envia o corpo pelo `body` do `HttpClient.delete`. | `admin.service.ts:7,47-59` |
| 7 | Botão de edição do card → **olho** (`.btn-acao.visualizar`, `title`/`aria-label` "Visualizar idioma") chamando `visualizarIdioma()`, que navega para `/visualizar-idioma-adm?id=<codigo>` (query param, como as demais telas). | `controle-adm.html:468-473`, `controle-adm.ts:724-727` |
| 8 | Fluxo de edição removido por inteiro: modal "Editar Idioma", `mostrarModalEditarIdioma`, `idiomaEmEdicao`, os cinco campos de edição, os dropdowns de idioma/proficiência (`toggle*`, `selecionar*`, `fecharDropdownsEdicao`, `idiomasFiltradosEdicao`), `mapProficienciaParaLabel/Backend`, `podeConfirmarEdicaoIdioma`, `confirmarEdicaoIdioma` e os imports `IdiomaOpcao`/`IDIOMAS_DISPONIVEIS`/`PROFICIENCIAS`. | `controle-adm.ts`, `controle-adm.html` |
| 9 | CSS órfão removido (234 linhas): `.bandeira-section/-preview/-placeholder`, `.select` e estados, `.dropdown`, `.option` e os cinco `.nivel-*`, `.radio-group/-option`, `.btn-salvar-modal` (saiu dos seletores agrupados com `.btn-email-modal`) e `.btn-acao.editar` (idem com `.visualizar`/`.email`). `.idioma-id-display` foi **mantido** porque passou a servir ao modal de exclusão. | `controle-adm.css` |
| 10 | Modal "Excluir Idioma" (agora `modal-container` padrão, não `modal-pequeno`): faixa `.idioma-id-display` com nome, ID e proprietário; alerta com "irreversível" e "todos os seus módulos e frases (N módulo(s)), avaliações e vínculos"; `textarea` "Mensagem ao proprietário (opcional)" com `[maxlength]="limiteMensagemExclusao"` = 1000 e contador; texto literal **"Se você não escrever uma mensagem, será enviado um aviso padrão informando que o idioma foi excluído."**; `.aviso-email` dizendo que o proprietário receberá o e-mail em segundo plano; `.erro-inline`. Fechar fica bloqueado durante `excluindoIdioma`; `.btn-excluir-confirmar` ganhou `:disabled` e `:hover:not(:disabled)`. | `controle-adm.html:1202-1297`, `controle-adm.css:1068-1082,1750` |
| 11 | `confirmarExclusaoIdioma()`: envia `{ mensagem }` só quando há texto após `trim()` (senão `{}`), "Excluindo…" no botão, sucesso → remove da lista, fecha, toast `Idioma "<nome>" excluído. O proprietário foi avisado por e-mail.` e recarrega os logs; erro → `err.error.message` no modal e `detectChanges()`. Abrir e fechar limpam a mensagem. | `controle-adm.ts:107-112,729-771` |
| 12 | `controle-adm` lê `?aba=` no `ngOnInit` (`denuncias`, `usuarios`, `idiomas` ou `logs`, validado contra a lista `ABAS`; valor desconhecido mantém o padrão) — é o que permite ao Voltar da página nova cair na aba Idiomas. | `controle-adm.ts:4,13,131,136-140` |

**Frontend — página `visualizar-idioma-adm`**

| # | Item | Arquivos |
|---|---|---|
| 13 | Rota `visualizar-idioma-adm` no grupo `adminGuard` (lazy, ao lado de `controle-adm`). | `app.routes.ts:95-98` |
| 14 | Componente standalone `VisualizarIdiomaAdm`: lê `id` do query param, chama `getIdiomaCompletoAdmin`, mapeia módulos para `{ modulo, icone (SafeHtml, com ícone padrão quando o SVG vem vazio), frases, expandido }` e enriquece cada frase com o **mesmo** `enriquecerFrase`/`parseJson`/`toEmbedUrl` de `visualizar-modulo` (campos `*Json` → arrays, vídeo → URL de embed sanitizada). `window.scrollTo(0)` no `ngOnInit`, porque a lista de origem costuma estar rolada e o Voltar ficava sob a topbar. | `visualizar-idioma-adm.ts` |
| 15 | Template: Voltar ("Voltar ao controle" → `/controle-adm?aba=idiomas`), estados carregando / erro (`err.error.message`) / excluído; cabeçalho com bandeira, selo "Visualização de moderação · somente leitura", nome, linguagem, descrição e o botão **Excluir idioma** (única ação); grade de dados (ID, proprietário com `USR-`, proficiência, visibilidade, avaliação com estrelas e contagem, "N módulos · M frases", criado em, última atualização); seção Módulos com acordeão (`aria-expanded`, `#ordem`, ícone, nome, contagem de frases, `MOD-…`, data) e "Expandir/Recolher todos"; dentro de cada módulo os cards de frase de `visualizar-modulo` **sem** setas de ordem, sem rodapé Editar/Excluir e sem "Nova Frase" — os botões proibidos não existem no template, não estão apenas desabilitados; tradução direta mostra também "Respostas também aceitas". | `visualizar-idioma-adm.html` |
| 16 | Modal de exclusão idêntico ao da aba (mesmo texto, mesmo campo, mesmo aviso), com contagem de módulos **e** frases no alerta; sucesso → `excluido = true`, a página troca o conteúdo pelo estado "Idioma excluído" com botão "Voltar para a aba de idiomas" e mostra o toast. | `visualizar-idioma-adm.html`, `visualizar-idioma-adm.ts` |
| 17 | CSS só com tokens do tema (`--bg-card`, `--surface-hover`, `--color-primary*`, `--color-danger`, `--color-warning`, `--color-success`, `--border-*`, `--radius-*`, `--shadow-*`): base da página igual a `visualizar-modulo`, cards de frase copiados de lá (sem os efeitos de hover de reordenação), modal/toast copiados de `controle-adm` (barra superior do modal em `--color-danger`), faixas responsivas em 768 e 480 px. Duplicação consciente: o projeto não tem componente de modal compartilhado (cada página carrega o seu), e a única classe utilitária global usada é a animação `crow-slide-up`. | `visualizar-idioma-adm.css` |

**Em aberto nesta etapa:**

- **Caminho de sucesso da exclusão não exercitado de ponta a ponta** (e-mail + log + estado
  "Idioma excluído"): exigiria apagar um idioma do banco local. Recomendado rodar uma vez contra
  um idioma descartável e conferir o `LOG-…` com "aviso padrão" e outro com "mensagem
  personalizada".
- **Modal de exclusão duplicado** entre `controle-adm` e `visualizar-idioma-adm` (HTML + CSS).
  Extrair um componente `modal-excluir-idioma` em `components/` seria o passo natural se um
  terceiro uso aparecer.
- **Sem paginação nas frases** da página nova: um módulo com 50 frases (limite) renderiza tudo ao
  expandir. `visualizar-modulo` pagina de 5 em 5; aqui o acordeão fechado por padrão compensa,
  mas vale observar o desempenho em idiomas grandes.
- **Aviso de e-mail sem o endereço**: `IdiomaResponse` não carrega o e-mail do criador (e não
  deve — é a projeção pública), então o modal mostra só o nome do proprietário, ao contrário dos
  modais de conta, que exibem o endereço.
- **Efeitos dos testes no banco local:** nenhum — o roteiro só abriu e cancelou modais; os
  `DELETE` via `curl` foram contra código inexistente (404).
- **Pré-existente, não tocado:** a falha de `@Valid` continua com mensagem genérica (8.19).

### 8.23 Acesso rápido aos envolvidos no modal de denúncia — **concluído** (somente frontend)

Continuação da Fase 18 na numeração do Lucas: o modal "Detalhes da Denúncia" do `controle-adm`
ganhou links, em **nova aba**, para o idioma denunciado e para o denunciante, sem nenhuma
alteração de backend (`DenunciaResponse` já trazia `codigoIdioma` e `codigoUsuario`).
`cd api && ./mvnw -q compile` → **exit 0**; `cd crow && npm run build` → **exit 0** (mesmos dois
avisos de orçamento de CSS; `controle-adm.css` foi de 37,1 kB para 38,6 kB). **Verificado em
navegador** (Chrome headless via DevTools Protocol, API com `SPRING_MAIL_HOST=127.0.0.1
SPRING_MAIL_PORT=1`): os dois links saem com `href` pelo código público, `target="_blank"` e
`rel="noopener noreferrer"`; "Ver idioma denunciado" leva a `/visualizar-idioma-adm?id=IDM-…`
com o idioma certo carregado; "Ver denunciante" leva a `/controle-adm?aba=usuarios&usuario=USR-…`,
que abre na aba Usuários com a busca preenchida pelo código e o modal "Detalhes do Usuário" já
aberto; estado indisponível simulado zerando `codigoIdioma`/`codigoUsuario` no estado do
componente (sem excluir nada no banco): sem `href`, `aria-disabled="true"`, `title` com o motivo,
clique não navega e o elemento não recebe foco; **alterar status continua funcionando**
(Resolvida → Analisando → Resolvida, com toast e badge do card atualizados); tema claro e 400 px
conferidos; zero erros de console.

**Decisão de desenho:** o administrador não tem rota de perfil (`visualizar-usuario` fica sob o
`comunGuard`), então o destino do denunciante é a própria visualização que ele já usa — o modal
da aba Usuários — endereçada por query param, no mesmo mecanismo do `?aba=` da seção 8.22.

Arquivos: `crow/src/app/pages/controle-adm/controle-adm.{ts,html,css}`.

| # | Item | Arquivos |
|---|---|---|
| 1 | Bloco `.acesso-rapido` no fim do corpo do modal (acima do rodapé de status), com rótulo "Acesso rápido" e dois `<a target="_blank" rel="noopener noreferrer">`: "Ver idioma denunciado" (ícone de globo, o mesmo da aba Idiomas) e "Ver denunciante" (ícone de usuário), ambos com um ícone menor de nova aba à direita (`aria-hidden`). | `controle-adm.html:757-798` |
| 2 | Getters `linkIdiomaDenunciado` (`/visualizar-idioma-adm?id=<codigoIdioma>`) e `linkDenunciante` (`/controle-adm?aba=usuarios&usuario=<codigoUsuario>`), montados com `router.createUrlTree` + `serializeUrl`; `idiomaDenunciadoDisponivel` / `denuncianteDisponivel` testam a presença dos códigos públicos — o backend zera o vínculo do idioma ao excluí-lo (`IdiomaService.removerVinculosDoIdioma`), então `codigoIdioma` nulo é o sinal de "excluído". | `controle-adm.ts:357-385` |
| 3 | Alvo indisponível: o link fica **sem `href`** (`[attr.href]` nulo — não clicável nem focável), com `aria-disabled="true"`, classe `.indisponivel` (opacidade 0,5, `cursor: not-allowed`, sem hover) e `title` "Idioma não está mais disponível" / "Usuário não está mais disponível". Disponível: `title` descreve o destino ("Abre … em nova aba"). Sem `pointer-events: none`, para o `title` continuar aparecendo. | `controle-adm.html:761-766,780-785`, `controle-adm.css:1788-1804` |
| 4 | `controle-adm` lê `?usuario=` no `ngOnInit` (`codigoUsuarioSolicitado`) e, quando a lista de usuários chega, `abrirUsuarioSolicitado()` troca para a aba Usuários, preenche `buscaUsuario` com o código, zera a página e abre `abrirModalVisualizarUsuario` se o código existir na lista (comparação sem distinção de caixa). Código inexistente deixa a busca preenchida sem resultado, o que já explica a situação. Consumido uma vez. | `controle-adm.ts:81-85,146,196,455-470` |
| 5 | CSS só com tokens do tema: botões neutros (fundo transparente, `--border-color`, acento `--color-primary` só no hover/focus), rótulo no estilo de `.log-id`, separador `border-top` dos detalhes; empilham em coluna no breakpoint de 768 px. | `controle-adm.css:1716-1804,2331-2333` |

**Em aberto nesta etapa:**

- **Destino do denunciante depende da lista carregada**: se `GET /admin/usuarios` falhar, a aba
  abre com a busca preenchida e sem modal, sem mensagem específica.
- **Denunciante administrador**: a lista da aba filtra `role === 'admin'`, então um denunciante
  administrador (caso hoje impossível pelas rotas) cairia no mesmo estado de "sem resultado".
- **Efeitos dos testes no banco local:** duas linhas em `logs_admin` (alteração de status da
  denúncia `DEN-A7BF31B489CD` para Analisando e de volta para Resolvida).

### 8.24 Logs administrativos: rastreabilidade e formato padronizado — **concluído**

Reformulação do `LogAdmin` para o modelo de moderação: cada registro passa a dizer, em colunas
próprias, **quem foi afetado** (usuário e/ou idioma), e `acao`/`detalhes` seguem um formato único.
`cd api && ./mvnw -q compile` → **exit 0**; `cd crow && npm run build` → **exit 0** (mesmos dois
avisos de orçamento de CSS; `controle-adm.css` foi de 44,2 kB para 52,5 kB). **Validado por
`curl` contra o banco local** (API com `SPRING_MAIL_HOST=127.0.0.1 SPRING_MAIL_PORT=1`): listagem
dos 30 registros históricos pelo DTO novo; suspender → reativar o "Usuário Teste"; e-mail ao
mesmo usuário (202); e-mail à própria conta do admin (403 + log `Tentou …`); `PUT /idiomas` de um
idioma alheio como admin (403 + log com proprietário e idioma); status de denúncia ida e volta;
reativação automática pelo scheduler (suspensão de 40 s + reinício da API) gravando log com
`admin` nulo. Usuário de teste e denúncia voltaram ao estado original.

Arquivos: `api/.../entity/LogAdmin.java`, `repository/LogAdminRepository.java`,
`service/LogAdminService.java`, `service/IdiomaService.java`,
`service/ReativacaoAutomaticaScheduler.java`, `controller/AdminController.java`,
`dto/log/LogAdminResponse.java` (novo), `config/LogAdminTipoCheckMigration.java` (novo);
`crow/src/app/models/log.model.ts`, `pages/controle-adm/controle-adm.{ts,html,css}`.

| # | Item | Arquivos |
|---|---|---|
| 1 | `LogAdmin` ganhou `usuarioAfetado` (`@ManyToOne` — contas nunca são excluídas) **mais** `usuarioAfetadoNome`/`usuarioAfetadoCodigo` em texto, e o idioma **sem FK**: `idiomaAfetadoId`, `idiomaAfetadoNome`, `idiomaAfetadoCodigo` (a ação típica é a exclusão, que romperia a FK). Todas as colunas novas aceitam nulo. `TipoLog` recebeu `MODERACAO` e `EMAIL`, mantendo `DENUNCIA`/`USUARIO`/`IDIOMA`. | `LogAdmin.java` |
| 2 | **Armadilha encontrada na execução:** para `@Enumerated(STRING)` o Hibernate cria `CHECK (tipo IN (...))` no PostgreSQL com os valores da época, e `ddl-auto=update` não altera constraints — o primeiro log `EMAIL` falhou com `logs_admin_tipo_check` **depois** de a ação ter acontecido (500). `LogAdminTipoCheckMigration` (`ApplicationRunner`, mesmo padrão dos backfills) recria a constraint a partir do enum a cada subida. | `config/LogAdminTipoCheckMigration.java` |
| 3 | `LogAdminService` deixou de receber strings soltas: os chamadores montam um `Registro` (`registro(admin, tipo, acao)` / `registroSistema(tipo, acao)` + `usuarioAfetado`, `idiomaAfetado` (entidade ou id/nome/código já capturados), `detalhe(chave, valor)`, `detalhe(chave, LocalDateTime)` no formato "dd/MM/yyyy às HH:mm", `detalheSe`). `montar()` produz `detalhes` como `chave: valor; chave: valor`, ignora nulos/vazios, colapsa espaços/quebras e troca `;` por `,` dentro do valor; corte no tamanho da coluna mantido. | `LogAdminService.java` |
| 4 | Formato de `acao`: verbo no passado + objeto ("Desativou conta de usuário", "Excluiu idioma", "Alterou status de denúncia", "Enviou e-mail a usuário"). Tentativas recusadas: `registrarTentativaBloqueada` prefixa `Tentou ` (infinitivo vindo do chamador) e põe `resultado: bloqueada` na frente dos detalhes; ações do sistema: `registrarAcaoSistema` força `admin` nulo e põe `origem: sistema`. Os prefixos antigos (`Tentativa bloqueada: `, `Ação automática do sistema: `) ficaram como constantes `*_LEGADO`, só para reconhecer registros históricos. | `LogAdminService.java` |
| 5 | Ações registradas: desativação (`modalidade: por tempo indeterminado; justificativa: …`), suspensão (`modalidade: temporária; reativação prevista: …`), reativação manual (`modalidade: manual`), reativação automática (`origem: sistema; modalidade: automática; motivo: fim da suspensão temporária; prazo vencido em: …`) — todas `MODERACAO` com o usuário afetado; exclusão de idioma (`IDIOMA`, idioma em texto + proprietário como usuário afetado + `aviso ao proprietário: mensagem personalizada|mensagem padrão`); e-mail (`EMAIL`, `destinatário` + `assunto` — **o trecho de 200 caracteres do corpo foi removido**); status de denúncia (`DENUNCIA`, `denúncia`, `status anterior`, `novo status`, idioma denunciado como afetado); tentativas bloqueadas com o tipo do domínio tentado (`USUARIO` consulta, `MODERACAO` status, `EMAIL` envio, `IDIOMA` escrita em conteúdo alheio) e o alvo como afetado. | `AdminController.java`, `IdiomaService.java:144-156`, `ReativacaoAutomaticaScheduler.java:62-69` |
| 6 | `GET /admin/logs` trocou o `Map.of` inline por `LogAdminResponse` (record): `acaoSistema` (admin nulo) e `bloqueada` (prefixo novo ou legado) derivados no backend, `usuarioAfetado`/`idiomaAfetado` como `{id, codigo, nome}` (retrato em texto prevalece; a FK só fornece o id). Fecha o item "GET /logs `Map` inline" da seção 2; paginação continua ausente. `findAllComAdmin` faz fetch join também do usuário afetado. | `dto/log/LogAdminResponse.java`, `LogAdminRepository.java`, `AdminController.java:262-269` |
| 7 | Aba Logs: chips **Moderação** (escudo, `--color-orange`) e **E-mails** (envelope, `--color-success`) no filtro por tipo; filtros de data e paginação inalterados. Cada card mostra a linha "Usuário afetado: Nome (USR-…)" / "Idioma afetado: Nome (IDM-…)" quando existir; ações do sistema aparecem como **"Sistema — ação automática"** com ícone próprio no lugar do administrador; tentativas recusadas ganham badge **Bloqueada**; o badge de tipo exibe o nome legível (`moderação`, `e-mail`). A busca passou a cobrir ação, detalhes e nome/código dos afetados; `getLogTipoIcone` (sem uso) removido. | `log.model.ts`, `controle-adm.ts:836-925`, `controle-adm.html:528-690`, `controle-adm.css` |

**Em aberto nesta etapa:**

- **Exclusão de idioma não exercitada de ponta a ponta** (continua da 8.22): o log de `Excluiu
  idioma` foi verificado por compilação e leitura; nenhum idioma do banco local foi excluído.
- **Registros históricos** mantêm o texto antigo (`Código: … — …`) e ficam sem usuário/idioma
  afetado — a listagem os exibe normalmente, só sem a linha de afetados.
- **Sem paginação em `GET /logs`** (Fase 9) e `LOG-` ainda derivado do id (Fase 3).
- **Efeitos dos testes no banco local:** 12 linhas novas em `logs_admin` (LOG-32 a LOG-43,
  incluindo a tentativa que falhou antes da migração da constraint, que não gravou), e a
  constraint `logs_admin_tipo_check` recriada com os cinco valores.

---

### 8.25 Navegação das buscas, cadastro, cards de módulo, tema animado e e-mails em HTML — **concluído** (backend + frontend)

Oito pedidos numa rodada. `cd api && ./mvnw -q compile` → **exit 0**; build de produção do front
(`CI=true npx ng build` com saída fora do repositório) → **exit 0**, com os mesmos dois avisos de
orçamento de CSS (`visualizar-idioma.css` cresceu ~1 kB). **Validado no navegador** (Chrome
headless via CDP, 390–1400 px, temas escuro e claro) e **por e-mail capturado**: a API subiu com
`SPRING_MAIL_HOST=127.0.0.1 SPRING_MAIL_PORT=2525`, apontando para um SMTP falso local que só grava
os `.eml` — nenhum e-mail saiu da máquina. Os sete modelos foram disparados pelas rotas reais: os
dois códigos pela interface (recuperar senha e cadastro) e os cinco avisos pelo admin, com o
"Usuário Teste" como alvo.

Arquivos: `crow/src/app/pages/buscar-usuario/buscar-usuario.ts`, `pages/buscar-idioma/buscar-idioma.ts`,
`pages/home/home.{ts,html,css}`, `pages/cadastrar-idioma/cadastrar-idioma.{ts,html,css}`,
`pages/visualizar-idioma/visualizar-idioma.{ts,html,css}`, `pages/visualizar-modulo/visualizar-modulo.ts`,
`models/modulo.model.ts`, `services/theme.service.ts`, `services/auth.service.ts`, `src/styles.css`,
`components/topbar/topbar.{ts,html}`, `pages/login/login.{ts,html}`,
`pages/cadastrar-usuario/cadastrar-usuario.{ts,html}`, `pages/recuperar-senha/recuperar-senha.{ts,html}`;
`api/.../util/EmailLayout.java` (novo), `util/CorpoEmail.java` (novo), `util/EmailTemplates.java`,
`service/EmailService.java`, `service/EmailVerificationService.java`, `controller/AuthController.java`,
`dto/auth/FinalidadeCodigo.java` (novo), `dto/auth/EnviarCodigoRequest.java`,
`src/main/resources/email/logo-crow.png` (novo).

| # | Item | Arquivos |
|---|---|---|
| 1 | **Ciclo no Voltar das buscas:** `buscar-usuario` e `buscar-idioma` usavam `location.back()`, mas o Voltar do perfil/idioma faz `navigate` para a busca (empilhando-a de novo), então voltar da busca reabria o item visitado. As duas buscas só são abertas pela home: o Voltar agora vai sempre para `/home` (`Location` removido). | `buscar-usuario.ts`, `buscar-idioma.ts` |
| 2 | **Home no limite de 4 idiomas:** o card "+" sumia e, com ele, o acesso ao modal das buscas. Agora fica sempre visível; no limite, o modal mostra um aviso (`.aviso-limite`) e só "Novo Idioma" fica desabilitado — o cadastro falharia no último passo. Importar continua possível: o `visualizar-idioma` já pede qual idioma substituir. | `home.{ts,html,css}` |
| 3 | **Cadastrar idioma quebrando à direita:** com `min-width: 100%` e `flex-shrink: 0`, o slide do carrossel crescia até a largura *max-content* do conteúdo — o texto de ajuda do `RespostasAceitas` (Tradução Direta) numa linha só levava o card a 974 px no desktop e 926 px em 390 px, e o `overflow: hidden` cortava título, modos e botões. `.carousel-slide` passou a `flex: 0 0 100%; min-width: 0`; conferido nos três modos da etapa 3. | `cadastrar-idioma.css` |
| 4 | **Ícones de módulo:** os 24 ícones genéricos (cadeado, terminal, download…) deram lugar a **32 ícones por tema de curso** (Saudações, Conversação, Números, Cores, Família, Comida, Viagem, Gramática, Pronúncia…), traçados do Lucide (ISC), com ponta arredondada embutida no próprio SVG salvo e o nome do tema como dica (`title`). A lista triplicada (achado 8 da seção 8.3) virou `ICONES_MODULO` + `iconeModuloPadrao(id)` em `modulo.model.ts`, usada no cadastro de idioma, nos modais de adicionar e editar módulo e no ícone de reserva de módulos legados. | `modulo.model.ts`, `cadastrar-idioma.{ts,html}`, `visualizar-idioma.{ts,html}`, `visualizar-modulo.ts` |
| 5 | **Cards de módulo:** checkbox, ícone, nome, posição, setas e editar/excluir disputavam uma linha — em 1024 px o nome ficava com 47 px ("Famíli a") e os botões saíam do card. O card passou a duas faixas: conteúdo (nome em até 2 linhas + `#posição` · frases) e, para o proprietário, rodapé com as setas e **Editar/Excluir com rótulo, sempre visíveis** (antes só no hover). Colunas de no mínimo 340 px; o nome ficou com 258 px em 1400, 295 px em 1024 e 211 px em 390. O rodapé barra clique e Enter/Espaço: Enter em "Editar" não marca mais o módulo. | `visualizar-idioma.{html,css}` |
| 6 | **Troca de tema animada, como no Porpones:** `ThemeService.toggle(origem)` usa a View Transitions API — o novo tema se expande em círculo a partir do botão clicado (520 ms, `clip-path` em `::view-transition-new(root)`). Durante a revelação, `theme-switching` desliga as transições dos componentes e `ApplicationRef.tick()` põe o ícone sol/lua já no retrato novo (app zoneless). Sem a API, transição curta de cores (`theme-transition`); com "reduzir movimento", troca imediata. Os quatro botões de tema passam o `$event`. | `theme.service.ts`, `styles.css`, `topbar`, `login`, `cadastrar-usuario`, `recuperar-senha` |
| 7 | **E-mails em HTML com a logo:** moldura única em `EmailLayout` (tabelas e estilos inline, próprios para o Gmail): cabeçalho no navy da topbar com a logo embutida por `cid:` (a mesma imagem do `apple-touch-icon`, 5 kB), selo e faixa na cor do tom (informação, sucesso, alerta, perigo), caixas para motivo e previsão de reativação, rodapé. Cada mensagem sai como `multipart/related` → `alternative` (texto puro + HTML) + PNG inline; `EmailLayout.Mensagem` monta as duas versões juntas, e o texto puro manteve a redação (só a previsão de reativação virou bloco rotulado, como o motivo). Nome, assunto e mensagem digitados são escapados e mantêm as quebras de linha. | `EmailLayout.java`, `CorpoEmail.java`, `EmailTemplates.java`, `EmailService.java`, `resources/email/logo-crow.png` |
| 8 | **Código de redefinição de senha:** código em destaque (caixa própria, 34 px, monoespaçado) e texto por finalidade — `EnviarCodigoRequest.finalidade` (`VERIFICACAO_EMAIL`, padrão, ou `REDEFINICAO_SENHA`). "Esqueci minha senha" recebe "Crow - Redefinição de senha", com o aviso "Não foi você?"; cadastro e troca de e-mail do perfil seguem sem informar a finalidade e recebem "Crow - Código de verificação", com texto genérico que serve aos dois. | `FinalidadeCodigo.java`, `EnviarCodigoRequest.java`, `AuthController.java`, `EmailVerificationService.java`, `auth.service.ts`, `recuperar-senha.ts` |

**Em aberto nesta etapa:**

- **Módulos já salvos mantêm o ícone antigo** (o SVG fica gravado no módulo) até serem editados;
  no modal de edição, nenhum ícone novo aparece marcado para eles.
- **Falta abrir os e-mails num cliente real** (Gmail web e app): estrutura MIME, acentos e quebras
  foram conferidos nos `.eml`, e o HTML renderizado no Chrome.
- **Efeitos dos testes no banco local:** 6 linhas em `logs_admin` (LOG-44 a LOG-49, incluindo o
  `Excluiu idioma` que faltava exercitar desde a 8.22); o "Usuário Teste" passou por suspensão →
  reativação → desativação → reativação e terminou **ativo**; os 4 idiomas criados para ele no
  teste foram excluídos (um pela moderação, três ao final).

### 8.26 Ícone de atenção completo, ícones dos modos de frase e sons em toda a interface — **concluído** (somente frontend)

Três pedidos numa rodada. Build de produção do front (`CI=true npx ng build` com saída fora do
repositório) → **exit 0**, com os mesmos dois avisos de orçamento de CSS (nenhum `.css` foi
alterado). **Validado no navegador** (Chrome headless via CDP, API local com o SMTP apontado para
uma porta fechada): um `AudioContext` instrumentado antes do boot registrou cada nota agendada pela
página, e um roteiro de 55 passos (usuário comum e admin) conferiu qual som cada clique produz —
**55/55 OK, nenhum erro de console**. Os ícones foram conferidos por captura de cada modal e seletor
alterado. Nenhum som foi ouvido (ver "Em aberto").

Arquivos: `crow/src/app/services/sound.service.ts`, `services/theme.service.ts`,
`services/clipboard.service.ts`, `pages/jogar/jogar.{ts,html}`, `pages/home/home.{ts,html}`,
`pages/visualizar-idioma/visualizar-idioma.{ts,html}`, `pages/visualizar-modulo/visualizar-modulo.{ts,html}`,
`pages/visualizar-idioma-adm/visualizar-idioma-adm.{ts,html}`, `pages/controle-adm/controle-adm.{ts,html}`,
`pages/cadastrar-frase/cadastrar-frase.{ts,html}`, `pages/cadastrar-idioma/cadastrar-idioma.{ts,html}`,
`pages/login/login.{ts,html}`, `pages/cadastrar-usuario/cadastrar-usuario.{ts,html}`,
`pages/recuperar-senha/recuperar-senha.ts`, `pages/perfil/perfil.{ts,html}`.

| # | Item | Arquivos |
|---|---|---|
| 1 | **Ícone de atenção incompleto:** o ponto do "!" é uma linha de comprimento quase zero (`x1="12" x2="12.01"`, padrão Feather), que só ganha área com ponta redonda. Sem `stroke-linecap="round"`, o triângulo mostrava só o traço. A varredura achou **34** SVGs com esse ponto, **32** sem a ponta: 13 triângulos de atenção (modais de excluir idioma, módulo e frase, cancelar cadastro e rodada, limite na importação, mínimo de módulos, exclusão pelo admin, detalhes da denúncia, botão Denunciar, aba, filtro e card de log de Denúncias), 12 círculos de atenção (avisos "irreversível" dos modais e mensagens de erro de login, cadastro e perfil) e, com o mesmo defeito, os "i" da home e do Jogar, os "?" (placeholder do quiz e o antigo ícone do modo) e os marcadores da opção "Ordem de Cadastro". Todos receberam `stroke-linecap="round" stroke-linejoin="round"` na raiz do `<svg>`, como os ícones que já renderizavam certo. | 11 `.html` |
| 2 | **Ícones dos modos de frase:** "Tradução Direta" (subpath degenerado, achado 4 da seção 8.3) virou o `languages` do Lucide (文A, o símbolo usual de tradução) e "Quiz" (círculo com "?", também sem o ponto) virou o `list-checks` (alternativas marcadas). Trocados nos três seletores de modo — página Cadastrar Nova Frase, modal da primeira frase do módulo (`visualizar-idioma`) e etapa 3 do `cadastrar-idioma` — e nos mapas `iconesModo` da lista de frases (`visualizar-modulo`, `visualizar-idioma-adm`), para que cada modo tenha um ícone só. "Selecionar Pares" não mudou (grade no seletor, elos na lista, como antes). | `cadastrar-frase.html`, `cadastrar-idioma.html`, `visualizar-idioma.html`, `visualizar-modulo.ts`, `visualizar-idioma-adm.ts` |
| 3 | **Clique automático em botões e opções:** um único ouvinte de `click` na fase de captura do `document` (registrado em `SoundService.init()`) toca o `clique` para qualquer `button`, `a[href]`, checkbox/radio, `select`, `[role=button\|tab\|…]` ou elemento com `cursor: pointer` (os cards e opções que são `div` com `(click)`); desabilitados e `cursor: not-allowed` ficam em silêncio. Na captura, os `stopPropagation()` dos modais não o barram. O som espera o fim do clique (`setTimeout` 0): se o handler tocar um som próprio, este **substitui** o clique — os dois nunca se somam. O clique sintético que um `<label>` repassa ao seu radio cai na mesma janela e não toca de novo. O contexto de áudio é criado/retomado ainda dentro do gesto. | `sound.service.ts` |
| 4 | **Nove sons novos**, todos gerados e abaixo de 300 ms (duração audível, pico e RMS medidos por renderização offline de cada receita): `clique` (35 ms, pico −22 dBFS — o mais baixo, no nível do `avanco`), `selecao`/`remocao` (70 ms, deslize Lá4↔Mi5), `par` (quinta Mi5→Si5), `sucesso` (quarta Sol5→Dó6), `exclusao` (quinta descendente Mi5→Lá4), `alerta` (dois toques de Lá4, onda triangular), `clarear`/`escurecer` (varredura de uma oitava, subindo ou descendo). Os sons de resultado ficam ~2 dB abaixo do `acerto`, que continua o mais alto. | `sound.service.ts` |
| 5 | **Jogar:** escolher palavra, lado de um par ou alternativa → `selecao`; devolver palavra ou desfazer ligação → `remocao`; completar um par → `par` (sem revelar se está certo); abrir "Cancelar rodada" → `alerta`. **Reverte a decisão 13 da seção 8.15**, a pedido do Lucas. | `jogar.ts` |
| 6 | **Resultado das ações:** salvar, criar, enviar, importar, avaliar, denunciar, reativar, copiar e códigos enviados/verificados → `sucesso`; excluir idioma, módulo ou frase e desativar/suspender conta → `exclusao`; toda falha exibida (validação ao enviar, erro do backend, reordenação desfeita via `aoFalhar`, cópia recusada) → `erro`; abrir as confirmações com ícone de atenção (excluir, cancelar cadastro, limite de 20 módulos, limite de 4 idiomas na importação, mínimo de 1 módulo) e o modal de desativar/suspender conta → `alerta`. Login, cadastro de conta, recuperação de senha e perfil seguem a mesma regra. | `home.ts`, `visualizar-idioma.ts`, `visualizar-modulo.ts`, `visualizar-idioma-adm.ts`, `controle-adm.ts`, `cadastrar-frase.ts`, `cadastrar-idioma.ts`, `login.ts`, `cadastrar-usuario.ts`, `recuperar-senha.ts`, `perfil.ts` |
| 7 | **Tema e cópia com som num lugar só:** `ThemeService.toggle()` toca `clarear`/`escurecer` — os quatro botões de tema (topbar, login, cadastro e recuperar senha) passam por ele; `EstadoCopia.copiar()` toca `sucesso`/`erro` junto da confirmação "copiado!" (perfil e perfil público). | `theme.service.ts`, `clipboard.service.ts` |

**Em aberto nesta etapa:**

- **Nenhum som foi ouvido** — mesma limitação da seção 8.15. A conferência foi objetiva: quais sons
  cada clique agenda (55 passos no app real) e duração, pico e RMS de cada receita. Ajuste de ouvido
  é nas constantes de `RECEITAS`; o candidato mais provável é o volume do `clique`, deixado baixo de
  propósito porque toca em todo botão.
- Quando o resultado de uma ação chega depois do fim do clique (requisição), ouve-se o `clique` e
  depois o som do resultado; quando chega antes (ex.: cópia recusada na hora), só o som do
  resultado. É o comportamento previsto.
- Os demais SVGs sem ponta redonda (achado 1 da seção 8.3) que não desenham ponto continuam como
  estavam: terminais quadrados não somem, só ficam menos arredondados.
- **Efeitos dos testes no banco local:** o idioma descartável `IDM-98D89C24DE92` ("Teste de Sons",
  do "Usuário Teste") foi criado pela API, salvo sem alterações pela home, perdeu um módulo pela
  interface e foi excluído ao final pela API. No painel do admin, o modal de exclusão foi só aberto
  e cancelado — nenhuma ação de moderação foi executada.

### 8.27 Áudios nas frases e denúncia de áudio — **concluído** (backend + frontend)

Pedido: áudios opcionais nos três modos — Tradução Direta (1 para a tradução completa, 1 por
palavra e 1 por tradução; a tradução completa toca de 0,25x a 2x), Selecionar Pares (1 por
palavra e 1 por tradução) e Quiz (1 para a pergunta e 1 por alternativa, todos de 0,25x a 2x) —,
um tipo de denúncia para áudios e o tratamento de tudo o que a novidade afeta. `cd api && ./mvnw -q
compile` → **exit 0**; build de produção do front (`CI=true npx ng build` com saída fora do
repositório) → **exit 0**, com os mesmos dois avisos de orçamento de CSS (`controle-adm.css` e
`visualizar-idioma.css`, nenhum dos dois alterado). **Backend por script** contra a API local:
**43/43** (upload com assinaturas reais e forjadas, arquivos recusados, tipos servidos, `Range`,
referências inválidas, edição parcial, visão do admin). **Navegador** (Chrome headless via CDP,
`HTMLMediaElement.play/pause/playbackRate` instrumentados, arquivos escolhidos com
`DOM.setFileInputFiles`): **98/98** em quatro roteiros — os quatro formulários, lista do módulo,
modal de edição, rodada completa nos três modos (escuro em 1400 px e claro em 390 px com toque,
incluindo a posição do botão de ouvir, medida por geometria em cada tipo de card), denúncia e visão
do moderador —, nenhum erro de console. Os roteiros de denúncia/moderador e dos outros formulários
rodaram antes do ajuste de posição do botão no Jogar, que não os afeta. API com o SMTP apontado para
uma porta fechada; nenhum e-mail saiu.

Arquivos: `api/.../util/FormatoAudio.java` (novo), `controller/UploadController.java`,
`entity/Frase.java`, `dto/frase/FraseRequest.java`, `dto/frase/FraseResponse.java`,
`service/FraseService.java`, `service/IdiomaService.java`; `crow/src/app/services/audio.service.ts`
(novo), `components/player-audio/player-audio.{ts,html,css}` (novo),
`components/campo-audio/campo-audio.{ts,html,css}` (novo), `services/upload.service.ts`,
`models/frase.model.ts`, `pages/cadastrar-frase/cadastrar-frase.{ts,html}`,
`pages/cadastrar-idioma/cadastrar-idioma.{ts,html}`, `pages/visualizar-idioma/visualizar-idioma.{ts,html}`,
`pages/visualizar-modulo/visualizar-modulo.{ts,html,css}`, `pages/jogar/jogar.{ts,html,css}`,
`pages/visualizar-idioma-adm/visualizar-idioma-adm.{ts,html,css}`, `pages/termos-de-uso/termos-de-uso.html`,
`pages/politica-de-privacidade/politica-de-privacidade.html`, `src/styles.css`.

| # | Item | Arquivos |
|---|---|---|
| 1 | **Dados:** três colunas novas e nulas em `frases` (`audio_traducao_completa`, `audio_pergunta` e `audios_alternativas_json`, lista paralela a `alternativasJson` com o caminho ou `null` em cada posição). Os áudios de palavras e pares são chaves `audioPalavra`/`audioTraducao` dentro de `palavrasJson`/`paresJson` — sem coluna nova e compatível com as frases existentes; áudio ausente não vira chave. Na edição, `null` mantém e `""` remove, como nos demais campos; lista de alternativas sem nenhum áudio vira `null` e as demais são regravadas em forma canônica. | `Frase.java`, `FraseRequest.java`, `FraseResponse.java`, `FraseService.java` |
| 2 | **Upload de áudio:** `POST /api/uploads/audio` (autenticado). `FormatoAudio` reconhece o formato pelos primeiros bytes — ID3 ou quadro MPEG camada III (MP3), ADTS (AAC), `RIFF…WAVE`, `OggS`, `ftyp` (M4A) e EBML (WEBM) — e o arquivo é gravado com a extensão **do formato detectado**: nome e tipo enviados pelo navegador são ignorados (HTML, PNG e texto renomeados para `.mp3` são recusados). Limite de 5 MB. O endpoint de imagens não mudou. Os áudios saem pelo mesmo `/api/uploads/**` público das imagens, com `Range` (206), que o arrastar da barra e o Safari exigem. | `FormatoAudio.java`, `UploadController.java` |
| 3 | **Referências validadas:** a frase só aceita `/api/uploads/<uuid>.<extensão de áudio>`, inclusive dentro dos JSONs de palavras e pares — URL externa (que rastrearia quem joga), `blob:`, imagem e `..` dão 400 com mensagem própria. Os JSONs de palavras e pares passam a ser lidos no backend: malformados, também 400. | `FraseService.java` |
| 4 | **Importação:** a cópia profunda leva os três campos novos (os JSONs já levavam os áudios de palavras e pares). Como as imagens, a cópia aponta para os mesmos arquivos. | `IdiomaService.java` |
| 5 | **`AudioService`:** um áudio por vez em toda a aplicação; `pausarParaModal`/`retomarAposModal`; `inicioDeReproducao` (o Jogar pausa o vídeo do quiz); velocidade escolhida vira a inicial dos próximos players — só em memória, sem nada novo no `localStorage`. Nos formulários, segue o modelo "envia ao salvar" das imagens: o arquivo fica numa URL `blob:` para ouvir antes de salvar, `enviarPendentes` sobe só os do modo escolhido (sem reenviar numa nova tentativa) e `paraSalvar` troca a URL local pelo caminho no corpo da requisição. Recusa no navegador formato fora da lista, arquivo vazio, acima de 5 MB ou ilegível. | `audio.service.ts`, `upload.service.ts` |
| 6 | **`app-player-audio`:** `mini` (alto-falante) ou `barra` (play, progresso arrastável e tempo), seletor de velocidade opcional com 0,25x a 2x em pt-BR ("0,25x"). Estado em signals (app zoneless); os cliques não chegam ao card pai (pares e alternativas do Jogar); falha ao tocar mostra o ícone de alto-falante cortado e toca `erro`. Alvos maiores com `pointer: coarse`; só tokens do tema. | `player-audio.{ts,html,css}` |
| 7 | **`app-campo-audio`:** "+ Áudio" quando vazio; com áudio, ouvir, duração e remover; erro de validação abaixo, com som `erro`. Fica à direita do rótulo pelo utilitário global `.campo-cabecalho` (no quiz, junto do "Resposta correta"). | `campo-audio.{ts,html,css}`, `styles.css` |
| 8 | **Os quatro formulários de frase** (cadastro de idioma etapa 3, Cadastrar Nova Frase, primeira frase do "Adicionar Módulo" e modal de edição) ganharam os campos pedidos. A lista de áudios das alternativas acompanha adicionar e remover alternativa (conferido removendo a do meio); arquivos não salvos são descartados ao remover a linha, fechar o modal, limpar ou sair da página. O Voltar do cadastro de idioma considera áudio como dado preenchido. | `cadastrar-idioma.*`, `cadastrar-frase.*`, `visualizar-idioma.*`, `visualizar-modulo.*` |
| 9 | **Jogar:** Tradução Direta com barra e velocidade na tradução completa, "Ouça as palavras" com os áudios das palavras **em ordem sorteada** (na ordem cadastrada entregariam a ordem da resposta) e botão de ouvir em cada peça, que acompanha a peça até a resposta sem devolvê-la; Selecionar Pares com botão em cada palavra e tradução, sem selecionar o card; Quiz com barra e velocidade na pergunta e botão + velocidade em cada alternativa, áudio embaralhado junto do texto. **Posição do botão (ajuste pedido pelo Lucas):** em todo card de palavra do Jogar — peça disponível, peça na resposta, cards das duas colunas de pares e "Ouça as palavras" — o botão fica **dentro do card, abaixo da palavra, centralizado**. A peça disponível continua um `<button>` só (botão dentro de botão não é HTML válido): o de ouvir é irmão dele, posicionado sobre o rodapé que a peça com áudio reserva (maior com `pointer: coarse`); a peça inteira sobe no hover. Peças sem áudio não esticam (`align-items: flex-start`), então as palavras ficam na mesma linha. O modal "Cancelar rodada" pausa e retoma o áudio (como o vídeo); trocar de frase e cancelar encerram; áudio e vídeo do quiz não tocam juntos. De passagem, a resposta correta do quiz passou a ser localizada pelo índice, não pelo texto (duas alternativas iguais confundiam a correção). | `jogar.{ts,html,css}` |
| 10 | **Lista do módulo e visão do moderador:** botões de ouvir em todos os campos (barras com velocidade na tradução completa e na pergunta). O moderador vê "N áudios" no resumo do idioma e em cada módulo — para conferir uma denúncia de áudio sem abrir módulo por módulo. | `visualizar-modulo.*`, `visualizar-idioma-adm.*`, `frase.model.ts` (`contarAudiosDaFrase`) |
| 11 | **Denúncia:** tipo "Áudios Inapropriados", depois de "Vídeos Inapropriados". O painel do admin já mostra os tipos de forma genérica (tag por tipo) — conferido com uma denúncia injetada só na resposta da listagem. | `visualizar-idioma.{ts,html}` |
| 12 | **Termos e Política:** imagens e áudios passam a constar no conteúdo publicado (Termos, seção 3) e nos dados coletados (Política, seção 2), com menção a gravações da voz — dado pessoal pela LGPD. | `termos-de-uso.html`, `politica-de-privacidade.html` |

**Em aberto nesta etapa:**

- **Importação não exercitada de ponta a ponta:** exige um segundo usuário comum, e o banco local só
  tem o `usuario@crow.com` e duas contas reais. Conferida pela leitura do código (os três campos
  são copiados como os demais). Com a Conta A/B do roteiro de testes, basta importar um idioma com
  áudios e abrir a cópia.
- **Nenhum áudio foi ouvido**: a conferência foi pelos `play`/`pause`/velocidade registrados no
  navegador headless. Safari (OGG/WEBM) e celular real não foram testados.
- **Arquivos órfãos:** como as imagens, os áudios nunca são apagados do disco — nem ao excluir frase
  ou idioma, nem ao trocar o áudio, nem quando o salvamento falha depois do envio. Áudios pesam mais
  que imagens; apagar exigiria contar referências, porque a importação compartilha os arquivos.
- **Risco pré-existente encontrado na análise (não alterado):** o upload de **imagens** confia no
  tipo informado pelo navegador e grava a extensão do nome original — um `.html` ou `.svg` enviado
  como `image/*` é aceito e servido publicamente em `/api/uploads` (XSS armazenado; em
  desenvolvimento o proxy serve `/api` na mesma origem do front, onde fica o token). O endpoint de
  áudio já nasce com detecção pelo conteúdo; o mesmo tratamento cabe às imagens.
- **Tema claro do Jogar (pré-existente):** `jogar.css` usa cores fixas escuras — no claro, os cards
  ficam cinza com texto branco. Os elementos novos usam só tokens e ficam legíveis nos dois temas.
- WEBM gravado no navegador pode não informar a duração: o campo mostra "Áudio" e a barra, só o
  tempo corrido. `.webm` sai como `video/webm` e `.aac` como `audio/x-aac` (tipos do Spring).
- O `docs/roteiro-de-testes.md` não ganhou casos para os áudios.
- **Efeitos dos testes no banco local:** idiomas descartáveis `IDM-8A50EA6DF974` e
  `IDM-CE972B51326F` ("Teste de Áudios", pela API, uma vez por rodada) e `IDM-7123C60D01D7` ("Teste
  Áudios Quiz", pela interface), todos do "Usuário Teste" e excluídos ao final; os 48 arquivos de
  áudio de teste foram apagados de `api/uploads`. Nenhuma denúncia gravada (a do usuário foi
  interceptada e abortada no navegador) e nenhuma linha nova em `logs_admin` (a mais recente segue
  `LOG-53`).
- ⚠️ **Arquivos do Lucas apagados por engano:** entre as duas rodadas, o Lucas criou pelo front de
  teste o idioma "Japonês para viagem" (`IDM-2A0C131647AB`, módulo "cadeado") com 7 áudios `.ogg`, e
  a segunda limpeza — feita por data ("áudios depois das 15:00"), não pela lista do que os scripts
  criaram — os apagou. As frases seguem apontando para eles e mostram o ícone de falha ao tocar:
  **FRS-46** (Tradução Direta: tradução completa, palavra 1, tradução 1 e palavra 2) e **FRS-47**
  (Selecionar Pares: par 1 palavra, par 1 tradução e par 2 palavra). Para restaurar, reanexar os
  arquivos originais pelo "Editar" de cada frase. As 3 imagens `.webp` do idioma não foram tocadas.

### 8.28 Proficiência visível na home e em Visualizar Idioma — **implementado, validação pendente** (somente frontend)

Pedido: nem a home nem `visualizar-idioma` mostravam o nível de proficiência do idioma. O backend já
enviava o campo (`IdiomaResponse.proficiencia`, em minúsculas, em `/idiomas/meus` e
`/idiomas/{codigo}`); faltava exibi-lo. **Não compilado nem visto no navegador nesta sessão:** o
verificador de permissões de comandos ficou indisponível e nenhum comando de terminal rodou (ver
"Em aberto").

Arquivos: `crow/src/app/pages/home/home.{ts,html,css}`,
`pages/visualizar-idioma/visualizar-idioma.{ts,html,css}`.

| # | Item | Arquivos |
|---|---|---|
| 1 | **Home:** linha "Proficiência: <nível>" no card de detalhes do idioma (o mesmo do ID, da nota e dos módulos — hover no desktop, botão "i" no toque, sempre aberto até 768 px), entre a nota e os módulos, com um ponto na cor do nível (verde, azul, âmbar, laranja e vermelho, as cores da busca e do perfil público) e anel claro para destacá-lo do fundo azul. Sem nível, "—" e sem ponto. | `home.{ts,html,css}` |
| 2 | **Visualizar Idioma:** quarto card na faixa de estatísticas, "Proficiência", com o ícone da visão do moderador, fundo do ícone na cor do nível, nome do nível e escala de cinco segmentos preenchida até ele (no papel das estrelas do card Avaliação). O nome usa fonte menor que os números para caber "Intermediário". Valor nulo ou desconhecido → "—", ícone cinza e sem escala. | `visualizar-idioma.{ts,html,css}` |
| 3 | **Faixa de estatísticas:** com quatro cards, troca o `auto-fit` por 4 colunas; 2×2 até 1280 px (o `auto-fit` deixaria 3 + 1); coluna única até 768 px, como antes. | `visualizar-idioma.css` |

**Em aberto nesta etapa:**

- **Validação pendente:** rodar `CI=true npx ng build` com saída fora do repositório e conferir as
  duas telas nos dois temas, em 390, 1024 e 1400 px. Espera-se o mesmo aviso de orçamento do
  `visualizar-idioma.css` (o acréscimo é de ~1 kB; o limite de erro é 64 kB).
- Os mapas valor → rótulo da proficiência seguem duplicados por página (home, busca, perfil público,
  visão do moderador e agora `visualizar-idioma`); um utilitário em `idioma.model.ts` os unificaria.
- Nenhum dado de teste foi criado.

### 8.29 Ordenação por estrelas e número de avaliações na busca de idiomas — **concluído** (somente frontend)

Pedido: a ordenação por avaliação de `buscar-idioma` comparava só a média de estrelas — 2 avaliações
de 5 estrelas empatavam com 1000 de 5 estrelas — e o card não mostrava quantas avaliações o idioma
tinha. O backend já enviava `totalAvaliacoes` em `IdiomaResponse`; o front descartava o campo.
**Regra definida pelo Lucas:** sem considerar a média com vírgula — primeiro as estrelas exibidas no
card, depois o número de avaliações (5★ com 8 → 5★ com 6 → 5★ com 5 → 4★ com 9 → 4★ com 7 → …). Uma
primeira versão com média bayesiana (média geral com peso 5) foi descartada a pedido dele.
`npx tsc -p tsconfig.app.json --noEmit` → **exit 0** nas duas versões; build de produção (`CI=true npx
ng build` com saída fora do repositório, feito na primeira versão) → **exit 0**, com os mesmos dois
avisos de orçamento de CSS (`controle-adm.css` e `visualizar-idioma.css`, nenhum alterado aqui). Esse
build já inclui as alterações ainda não validadas da 8.28, que compilaram. **Navegador** (Chrome
headless via CDP, conta fictícia do Bruno, só leitura): as 3 páginas percorridas pela paginação, com
as estrelas contadas no DOM de cada um dos 25 cards; ordem decrescente e crescente conferidas par a
par contra a regra; estrelas exibidas iguais às de antes; texto da contagem correto nos 25 cards;
"Data de Criação" ainda ordenada; exemplo do pedido simulado só no estado do componente. Card
conferido nos temas claro e escuro, em 1400 e 400 px (na primeira versão; o card não mudou depois);
nenhum erro de console.

Arquivos: `crow/src/app/models/idioma.model.ts`, `services/idioma.service.ts`,
`pages/buscar-idioma/buscar-idioma.{ts,html,css}`.

| # | Item | Arquivos |
|---|---|---|
| 1 | **Dados:** `IdiomaBusca` ganha `totalAvaliacoes`, preenchido pelo `IdiomaService` (0 quando ausente). O `visualizar-usuario`, que reaproveita o tipo, recebe `any[]` do serviço e não precisou mudar. | `idioma.model.ts`, `idioma.service.ts` |
| 2 | **Ordenação:** compara as estrelas acesas no card (`estrelasAcesas`, que agora também alimenta `estrelas()`, para a ordem e o desenho não divergirem) no sentido escolhido; com o mesmo número de estrelas, vem antes o idioma com **mais** avaliações — nos dois sentidos. Mesmo número de estrelas e de avaliações: fica a ordem que veio da API (a média com vírgula não desempata). Nos dados locais, "Espanhol: falsos cognatos" (5,0 × 2) caiu do 1º para o 10º lugar, último dos 5★. | `buscar-idioma.ts` |
| 3 | **Idiomas sem avaliação** vão para o fim nos dois sentidos (antes, com nota 0, encabeçavam a ordem crescente). | `buscar-idioma.ts` |
| 4 | **Card:** ao lado das estrelas, "N avaliações" / "1 avaliação" / "Sem avaliações", com separador de milhar pt-BR ("1.000 avaliações"), no estilo do `.avaliacoes-count` de `visualizar-idioma` (texto discreto, só tokens do tema). | `buscar-idioma.{ts,html,css}` |

**Em aberto nesta etapa:**

- **As estrelas exibidas arredondam para cima (pré-existente, não alterado):** a estrela `i` acende
  quando `i < média`, então 4,1 e 4,6 aparecem — e agora também são ordenados — como 5★; na busca,
  "Japonês: hiragana" (4,4 × 7) fica à frente de "Expressões populares" (4,8 × 6). É o mesmo
  arredondamento (`Math.ceil`) de `visualizar-idioma`, `visualizar-usuario`, `controle-adm` e da
  visão do moderador; só a home usa `Math.round`. Se 4,4 dever contar como 4★, a mudança é no
  `estrelasAcesas` — e muda o desenho junto, o que pede alinhar as outras telas.
- O perfil público (`visualizar-usuario`) não tem ordenação e não ganhou a contagem.
- Nenhum dado de teste foi criado. API e front de teste (portas 8080 e 4200, SMTP apontado para uma
  porta fechada) foram encerrados ao final, a pedido do Lucas.

### 8.30 Deploy em produção (Cloudflare + Render + Supabase, plano gratuito) — **concluído** (backend + infraestrutura)

Pedido: colocar o Crow na internet de graça, com Cloudflare (Workers/Pages) e Supabase, **sem nenhum
dado** além do `admin@crow.com`, com a senha trocada para a informada pelo Lucas. Visão geral do
ambiente, variáveis e como publicar de novo: `docs/deploy-producao.md`.
**Decisões tomadas com o Lucas:** a API vai para o **Render** (Cloudflare não roda Java; Koyeb passou a
exigir cartão), mantida acordada por um cron do Worker; front num **Worker com assets** (no lugar do
Pages); deploy a partir da **`master`** (fast-forward da `feat/auditoria-tcc-fases-2-6-tema`); e-mail
continua saindo pelo **Gmail**, agora da conta `hendersoftwares@gmail.com`. Como o Render gratuito
bloqueia as portas SMTP, a API entrega a mensagem por HTTPS ao Worker, que faz o SMTP no Gmail.

Endereços: site **https://crow.lucashendersonvieiracunha.workers.dev**; API
`https://crow-api-lxjs.onrender.com` (serviço `crow-api`, free, Virginia); Supabase projeto `crow`
(`svyygvkrbagqxrxpdmyo`, us-east-1, org "Lucas"), bucket público `uploads`.

**Validação:** API compilada (`mvnw package` numa cópia fora do repositório, sem tocar em `target/`) e
build do Angular (`CI=true ng build --output-path ../cloudflare/build`, mesmos dois avisos de orçamento
de CSS da 8.29). **Local:** API + Worker (`wrangler dev`) + SMTP falso — site, fallback de rotas, proxy
`/api`, 401/405/400 no relay, cron, CORS (Origin estranho → 403) e o e-mail de código de ponta a ponta
(AUTH, envelope, `From`, logo embutida, acentos). **Contra o Supabase real** (API local com o perfil
`prod`): tabelas criadas, só o admin semeado, `admincrow1234` aceita e `admin123` recusada, upload de
imagem e de áudio no bucket com o tipo certo, áudio falso recusado. **Produção:** deploy `live` no
Render (Spring sobe em ~70 s); pelo endereço do Worker com `Origin` do site — `/api/saude`, login do
admin, `/usuarios/me`, listas do admin (todas vazias), upload servido com `Content-Security-Policy:
sandbox` e `nosniff`; relay real aceito pelo Gmail (mensagem de teste e código de verificação, ambos
para o próprio `hendersoftwares@gmail.com`); telas de login e cadastro no Chrome sem erro de console.
**Estado final:** 8 tabelas, só `admin@crow.com` (ADMIN, ATIVO), todas as outras com 0 linhas, bucket
vazio (os arquivos de teste foram apagados pela lista exata).

Arquivos: `api/Dockerfile`, `api/.dockerignore`, `api/src/main/resources/application-prod.properties`,
`config/{DataSeeder,SecurityConfig,EmailRelaySender}.java`, `controller/{UploadController,SaudeController}.java`,
`service/ArmazenamentoService.java`, `cloudflare/{wrangler.jsonc,.gitignore,src/index.js,src/smtp.js}`,
`render.yaml`, `docs/deploy-producao.md`.

| # | Item | Arquivos |
|---|---|---|
| 1 | **Perfil `prod`:** banco, Storage, relay, CORS e seed lidos de variáveis de ambiente do Render; pool de 5 conexões e 50 threads para os 512 MB. Nenhum segredo no repositório (que é público). | `application-prod.properties` |
| 2 | **Imagem Docker** em dois estágios (Maven → JRE 21) com heap limitado, Serial GC e C1, para caber no plano gratuito. `render.yaml` descreve o serviço (Blueprint). | `Dockerfile`, `.dockerignore`, `render.yaml` |
| 3 | **Uploads no Supabase Storage** quando `app.supabase.url` está definido; sem ele (desenvolvimento) continua em `api/uploads/`. O caminho devolvido é o mesmo `/api/uploads/<uuid>.<ext>`, então `FormatoAudio`, importação e front não mudaram. Imagens gravadas com o tipo enviado (já validado como `image/*`), áudios com o tipo da extensão detectada. | `ArmazenamentoService.java`, `UploadController.java` |
| 4 | **Relay de e-mail:** `EmailRelaySender` (ativo só com `app.mail.relay.url`) substitui o transporte do JavaMail — a mensagem é montada igual e vai por HTTPS, com token, ao Worker; falhas viram `MailSendException`, então `EmailService` e `EmailVerificationService` não mudaram. O código de verificação, que não definia remetente, recebe o `From` configurado. | `EmailRelaySender.java` |
| 5 | **Saúde:** `GET /api/saude` público com `SELECT 1` — health check do Render e alvo do cron (mantém a API acordada e o Supabase ativo). | `SaudeController.java`, `SecurityConfig.java` |
| 6 | **Seed:** senha do admin vem de `app.seed.admin-senha` (padrão `admin123` no desenvolvimento) e o `usuario@crow.com` pode ser desligado (`app.seed.usuario-teste=false` em produção). | `DataSeeder.java` |
| 7 | **Worker `crow`:** assets do Angular com fallback de SPA; `/api/*` repassado ao Render; `/api/uploads/*` lido do bucket público, com cache e cabeçalhos que impedem execução; `/interno/email` com token comparado em tempo constante e cliente SMTP mínimo (TLS 465, AUTH PLAIN, dot-stuffing); cron `*/10 * * * *`. | `cloudflare/src/{index,smtp}.js`, `wrangler.jsonc` |
| 8 | **Supabase:** privilégios de `anon`/`authenticated` revogados no schema `public` (inclusive os padrões para tabelas novas) — a API REST pública do Supabase não expõe as tabelas do Hibernate. | (SQL aplicado no projeto) |

**Em aberto nesta etapa:**

- **Chave do Storage:** a API usa a chave legada `service_role`; a chave nova `sb_secret_...` do
  projeto ainda era recusada pelo gateway do Supabase no dia do deploy (401). O código já aceita a
  nova (vai só no cabeçalho `apikey`); quando o Supabase desativar as legadas, trocar `SUPABASE_CHAVE`
  no Render e testar um upload.
- ~~Revogar a chave de API do Render `claude-deploy-crow`~~ — **feito** em 2026-10-05 (usada só para criar o serviço; foi colada
  no chat).
- O site e o Worker são publicados manualmente (`wrangler deploy`); só a API republica sozinha a cada
  push na `master` que mude `api/`.
- Uploads continuam nunca apagados e o upload de imagens ainda confia no tipo enviado (pendência da
  8.27). Em produção, os cabeçalhos do Worker impedem que um arquivo malicioso execute na origem do site.
- No primeiro acesso após um deploy da API, o Render leva ~70 s para subir o Spring.
- Testes no ambiente de produção que gerem dados (cadastro, idiomas) precisam ser apagados depois,
  para manter o banco limpo.

---

## Checklist do plano de ajustes

> As 21 fases abaixo foram derivadas deste levantamento — não havia documento de plano no
> repositório nem lista fornecida junto com a tarefa. Substituir pelos nomes oficiais quando
> a lista definitiva estiver disponível.

- [x] Fase 1 — Identificador público de usuário no backend — ver seção 8.4
- [x] Fase 2 — Identificador público de idioma no backend — ver seção 8.4
- [ ] Fase 3 — Identificador público de módulo, frase, denúncia e log
      — **parcial**: **denúncia concluída** (seção 8.4). Módulo, frase e log continuam com
      `codigo` derivado do id (`MOD-`, `FRS-`, `LOG-`). A fase permanece aberta.
- [ ] Fase 4 — Migração dos DTOs de resposta para o identificador público
      — **parcial**: `UsuarioResponse`, `IdiomaResponse` e `DenunciaResponse` já leem o `codigo`
      persistido; `ModuloResponse`, `FraseResponse` e o mapa de logs seguem derivando do id.
      Os `id` numéricos continuam nos DTOs (marcados `// TODO Fase 21`).
- [ ] Fase 5 — Endpoints aceitando identificador público no lugar do id numérico
      — **parcial**: usuário, idioma e denúncia migrados, com compatibilidade numérica temporária
      ainda ativa (`// TODO remover`). Módulo e frase seguem numéricos. A fase permanece aberta.
- [x] Fase 6 — Navegação por query params sem id numérico — ver seção 8.4
      — todos os `queryParams` de idioma e usuário passam o código, incluindo o `idIdioma` de
      `visualizar-modulo` e `cadastrar-frase`. `moduloId` e a lista `modulos` do `/jogar`
      continuam numéricos, por dependerem dos endpoints de módulo/frase.
- [ ] Fase 7 — Remoção da exibição de ID nas listagens e cards
- [ ] Fase 8 — Remoção da exibição de ID nos modais e confirmações
- [ ] Fase 9 — Padronização das rotas e respostas do AdminController
      — **parcial** (seção 8.16): todas as rotas por `{codigo}`, admin resolvido num único helper,
      usuários com DTO próprio (`UsuarioModeracaoResponse`) e idioma completo com DTO composto.
      `GET /logs` passou a `LogAdminResponse` (seção 8.24), mas continua sem paginação. A fase
      permanece aberta.
- [x] Fase 10 — Validação com DTO na alteração de status de usuário e denúncia — ver seções 8.16 e 8.19
      — denúncia já validava por DTO (8.16); status de usuário migrou para
      `AlterarStatusUsuarioRequest` (`@Valid`, `@NotBlank`/`@Size`) na seção 8.19, com 400
      para ação inválida, data ausente/passada ou fora da suspensão. A detecção de
      `role`/`senha` em `Map` foi abandonada com o DTO fechado. **Fase fechada.**
- [x] Fase 11 — Revisão da edição de usuário pelo administrador — ver seções 8.16 e 8.17
      — backend: `PUT /usuarios/{codigo}` e `editarUsuarioAdmin` removidos; admin não edita
      cadastro, senha nem papel. Frontend (8.17): modal virou consulta somente leitura,
      `AdminService.editarUsuarioAdmin` removido, lista tipada por `UsuarioModeracao`, topbar do
      admin só com "Sair". **Fase fechada nas duas pontas.**
- [x] Fase 12 — Revisão da edição e exclusão de idioma pelo administrador — ver seções 8.16 e 8.22
      — `PUT /idiomas/{codigo}` e `editarComoAdmin` removidos; `DELETE` mantido e reforçado
      (log após a exclusão, criador nos detalhes). Frontend concluído na 8.22: modal "Editar
      Idioma" e `editarIdiomaAdmin` removidos, botão de olho abre `/visualizar-idioma-adm` (somente
      leitura) e o `DELETE` aceita mensagem opcional ao proprietário, com e-mail e log.
- [x] Fase 13 — Cobertura de log administrativo em todas as ações do admin — ver seção 8.16
      — toda ação de escrita do admin grava log e toda tentativa bloqueada (conteúdo alheio,
      conta administrativa, campos proibidos) também, em transação própria. Leituras não logam.
      Reformulado na seção 8.24: usuário/idioma afetados em colunas próprias, tipos `MODERACAO`
      e `EMAIL`, `acao`/`detalhes` padronizados via `LogAdminService.Registro`.
- [ ] Fase 14 — Persistência dos códigos de verificação de e-mail
- [ ] Fase 15 — Template HTML e identidade visual dos e-mails
      — os textos já estão centralizados em `EmailTemplates` (seção 8.18), o que era
      pré-requisito, mas o envio continua em `SimpleMailMessage` **texto puro**. A fase
      permanece aberta.
- [ ] Fase 16 — Novos e-mails transacionais (cadastro, senha, moderação)
      — **parcial** (seções 8.18, 8.19 e 8.21): os cinco e-mails de moderação existem em
      `EmailService`, assíncronos e com falha isolada em log; **quatro já são disparados**
      (conta desativada, suspensa e reativada — manual e automática, seção 8.19; mensagem
      personalizada pela aba Usuários, seção 8.21) e, com a seção 8.22, **os cinco são
      disparados** (idioma excluído, com mensagem opcional do administrador). Cadastro/senha
      seguem só com o código de verificação. A fase permanece aberta.
- [ ] Fase 17 — Componente de ícone único e registry de SVGs
- [ ] Fase 18 — Padronização dos ícones fora da convenção de atributos
      — **diagnóstico concluído** (seção 8.3); correção não aplicada, aguardando 3 decisões
- [ ] Fase 19 — Rodapé global com "Todos os direitos reservados" e ano dinâmico
      — **parcial**: ano corrigido para 2026 em `login.html`, mas continua **literal** (não
      dinâmico) e **sem rodapé global** nos layouts. A fase permanece aberta.
- [ ] Fase 20 — Padronização do "voltar" nas telas de visualização
      — **parcial**: `visualizar-idioma` e `visualizar-modulo` concluídos (seção 8.10), agora com
      navegação por origem explícita no lugar de `window.history.back()` e da ramificação por
      papel. `visualizar-usuario` segue em `location.back()` e ainda repica para o idioma. Falta
      também unificar nomes (`voltar` / `voltarParaLista`) e classes (`btn-voltar` /
      `btn-voltar-lista`). A fase permanece aberta.
- [ ] Fase 21 — Revisão final: tema claro/escuro, build e regressões
      — pendências já mapeadas para esta fase: remover a compatibilidade numérica de
      `resolver(String)` e os `id` numéricos dos DTOs de resposta (seção 8.4); decidir se
      avaliar um idioma deve mover sua "última atualização" (seção 8.10).

### Concluído fora do plano das 21 fases

Itens das seções 8.1, 8.5–8.9 e 8.12–8.21, que não correspondem a nenhuma das fases acima —
ou que, como os da 8.18 e 8.19, preparam uma fase sem fechá-la:

- [x] Capitalização do nome do usuário na topbar
- [x] Contraste do ícone de tema na topbar
- [x] Logo branca da topbar (arquivo gerado)
- [x] `apple-touch-icon` e referências de ícone no `index.html`
- [x] Correção da lista `assets` do `angular.json` (favicon não chegava ao `dist`)
- [ ] Regerar `favicon.ico` com contraste adequado (ver seção 8.2)
- [x] Página de Termos de Uso (rota pública `termos-de-uso`) — ver seção 8.5
- [x] Página de Política de Privacidade (rota pública `politica-de-privacidade`) — ver seção 8.5
- [x] Remoção do card "Benefícios da Conta" e reajuste do layout do cadastro — ver seção 8.5
- [x] Botão Voltar e links institucionais na tela de cadastro — ver seção 8.5
- [x] Correção dos links quebrados `/termos` e `/privacidade` no checkbox de aceite — ver seção 8.5
- [x] Cancelamento da etapa de código na recuperação de senha (substitui o "Voltar") — ver seção 8.6
- [x] Cards de idioma da home responsivos no mobile, sem dependência de hover — ver seção 8.7
- [x] Remoção do card "Gerar Idioma (IA)" e reequilíbrio do modal de opções — ver seção 8.7
- [ ] Decidir o destino do botão "info" do card no mobile, que ficou sem efeito (seção 8.7)
- [ ] Preencher os `[PREENCHER]` das páginas institucionais: e-mail de contato e comarca do foro
- [ ] Decidir sobre a redundância entre o checkbox de aceite e o texto abaixo do botão (seção 8.5)
- [x] Utilitário compartilhado de cópia para a área de transferência (`ClipboardService`) — ver seção 8.8
- [x] Código do usuário copiável, com confirmação e acesso por teclado, no Perfil — ver seção 8.8
- [x] Mesmo comportamento de cópia do ID em Visualizar Usuário — ver seção 8.8
- [x] Espaçamento do botão Voltar no Perfil alinhado às demais páginas — ver seção 8.8
- [x] Remoção do e-mail do perfil público de outro usuário — ver seção 8.8
- [x] `quantidadeIdiomas` contando somente idiomas com visibilidade `PUBLICO` — ver seção 8.8
- [x] Botão Voltar no `cadastrar-idioma`, com confirmação quando há dados preenchidos — ver seção 8.11
- [x] Componente compartilhado `RespostasAceitas`, substituindo o markup inline do `cadastrar-frase` — ver seção 8.11
- [x] Paridade da Tradução Direta entre `cadastrar-idioma` e `cadastrar-frase`, com múltiplas respostas corretas — ver seção 8.11
- [ ] Corrigir o modo Quiz do `cadastrar-idioma`, que envia `imagemQuiz` e `videoQuiz` juntos (seção 8.11)
- [ ] Decidir se a Tradução Direta deve aceitar redações fora da permutação das palavras (seção 8.11)
- [ ] Migrar `visualizar-idioma` e `visualizar-modulo` para o `RespostasAceitas` (seção 8.11)
- [x] Botão "Limpar seleção" condicionado à existência de seleção, via `*ngIf` — ver seção 8.10
- [x] Campo `atualizadoEm` no idioma, propagado por módulos e frases, com backfill — ver seção 8.10
- [x] Linha "Última atualização" no cabeçalho de `visualizar-idioma` — ver seção 8.10
- [x] Fallback de `voltarParaLista()` sem `idIdioma`, que abria a tela vazia — ver seção 8.10
- [ ] Decidir se avaliar um idioma deve mover a "última atualização" (seção 8.10)
- [ ] Padronizar o `voltar()` de `visualizar-usuario`, hoje ainda por histórico (seção 8.10)
- [x] Administradores fora da busca de usuários, filtrados no backend — ver seção 8.8
- [x] `UsuarioPublicoResponse`: endpoints públicos sem e-mail, telefone, papel e status — ver seção 8.8
- [ ] Decidir se `GET /usuarios/{codigo}` deve recusar códigos de administrador (seção 8.8)
- [x] Campo `ordem` em `Modulo` e `Frase`, com backfill idempotente por update em massa — ver seção 8.12
- [x] Módulo e frase novos recebendo `maior ordem + 1` — ver seção 8.12
- [x] Renumeração dos irmãos na exclusão, sem deixar buracos na sequência — ver seção 8.12
- [x] `PUT /api/idiomas/{codigoIdioma}/modulos/ordem` e `PUT /api/modulos/{moduloId}/frases/ordem`, transacionais e validando proprietário, pertencimento e lista completa — ver seção 8.12
- [x] Consultas de módulo e frase ordenando por `ordem` com `id` como desempate — ver seção 8.12
- [x] `ordem` exposto em `ModuloResponse` e `FraseResponse` — ver seção 8.12
- [x] Jogar em "Ordem de Cadastro" respeitando o campo `ordem` — ver seção 8.12
- [x] `IdiomaService.importar` atribuindo `ordem` às cópias de módulo e frase — ver seção 8.12
- [ ] **Confirmar se o modo da frase id 13 era `PARES`**, restaurado por inferência depois de um teste meu sobrescrevê-lo (seção 8.12)
- [ ] Recadastrar o módulo "Saudações" e sua frase, apagados do banco local durante os testes desta etapa (seção 8.12)
- [x] UI de reordenação em `visualizar-idioma` e `visualizar-modulo` — ver seção 8.13
- [x] Setas de reordenação nas frases, ao lado do marcador `#`, com limites na primeira e na última — ver seção 8.13
- [x] Posição exibida e setas de reordenação nos módulos — ver seção 8.13
- [x] Reordenação otimista com debounce, bloqueio durante a requisição e desfazer em caso de falha — ver seção 8.13
- [x] `aria-label` descritivo, alvo de toque de 44 px e controles restritos ao proprietário — ver seção 8.13
- [x] Toast de erro (`.mensagem-erro`) no lugar do `alert()` no fluxo de reordenação — ver seção 8.13
- [x] Jogar em "Ordem de Cadastro" confirmado respeitando a ordem de módulos e de frases — ver seção 8.13
- [ ] Verificar em navegador o otimista, o debounce, o bloqueio e o desfazer (seção 8.13)
- [ ] Extrair os toasts de sucesso/erro para `styles.css`, hoje duplicados por página e estourando o budget de `visualizar-idioma.css` (seção 8.13)
- [ ] Decidir se reordenar merece confirmação de sucesso, hoje silenciosa (seção 8.13)
- [x] Aplicar aos botões de editar/excluir do módulo o mesmo tratamento de teclado das setas — feito na seção 8.25
- [ ] Decidir se reordenar deve mover o `atualizadoEm` do módulo (seção 8.12)
- [x] Filtro por idioma na busca de idiomas, com opções derivadas dos resultados — ver seção 8.9
- [x] Filtro de proficiência convertido para seleção múltipla — ver seção 8.9
- [x] Combinação E entre filtros e OU dentro de cada filtro — ver seção 8.9
- [x] Contagem de resultados reagindo a todos os filtros, não só à busca — ver seção 8.9
- [x] Botão "Limpar filtros" condicionado a haver filtro ativo — ver seção 8.9
- [x] Indicador de quantas opções estão marcadas em cada filtro — ver seção 8.9
- [ ] Decidir se os filtros da busca devem ser refletidos na URL (seção 8.9)
- [ ] Decidir entre opções derivadas da lista completa ou facetas reativas (seção 8.9)
- [x] Botão "Cancelar rodada" no topo da tela Jogar — ver seção 8.14
- [x] Modal central de confirmação no padrão do projeto, com overlay e `stopPropagation` — ver seção 8.14
- [x] Confirmar limpa pontuação, etapa, respostas e temporizadores e volta para `/visualizar-idioma` com o código do idioma — ver seção 8.14
- [x] Fechar por ESC, overlay ou "Voltar à rodada" preserva a rodada intacta — ver seção 8.14
- [x] Vídeo do quiz e animações pausados enquanto o modal está aberto — ver seção 8.14
- [x] Assinaturas do `jogar` encerradas no `ngOnDestroy`, que estava vazio — ver seção 8.14
- [ ] Verificar em navegador o pause/retomada do vídeo do quiz, o ESC e o clique no overlay (seção 8.14)
- [ ] Decidir se o tempo com modal aberto deve ser descontado do total da rodada (seção 8.14)
- [x] `SoundService` no padrão do `ThemeService`, com preferência persistida em `crow:sons` — ver seção 8.15
- [x] Quatro sons gerados pela Web Audio API (acerto, erro, conclusão, avanço), todos abaixo de 300 ms — ver seção 8.15
- [x] Toggle de sons na topbar, sempre visível, com `aria-pressed` e amostra ao ligar — ver seção 8.15
- [x] `AudioContext` criado só dentro de clique, com `resume()` no gesto — ver seção 8.15
- [x] `prefers-reduced-motion` como padrão desligado, escolha explícita vence — ver seção 8.15
- [x] Falha de áudio isolada no serviço, sem afetar o fluxo do Jogar — ver seção 8.15
- [ ] Ouvir os quatro sons e ajustar `RECEITAS` (volume geral e timbre do `erro`) (seção 8.15)
- [ ] Verificar o caminho `resume()` em Safari/iOS (seção 8.15)
- [ ] Decidir se `prefers-reduced-motion` deve ser observado em tempo de execução (seção 8.15)
- [x] Menu da topbar do administrador só com "Sair", por condicional de papel (sem componente novo) — ver seção 8.17
- [x] Filtro "Todos" removido da aba de usuários; ATIVOS/INATIVOS como toggles no padrão das outras abas — ver seção 8.17
- [x] Administradores filtrados também no frontend, no único ponto de entrada da lista — ver seção 8.17
- [x] Ícone de olho e métodos `abrirModalVisualizarUsuario`/`fecharModalVisualizarUsuario` no lugar da edição — ver seção 8.17
- [x] Modal "Detalhes do Usuário" somente leitura: código, nome, e-mail, data de entrada, status e quantidade de idiomas — ver seção 8.17
- [x] Stubs `suspenderUsuario()` e `enviarEmailUsuario()` com `// TODO` para as fases de suspensão e de e-mail — ver seção 8.17
- [x] Interface `UsuarioModeracao` espelhando `UsuarioModeracaoResponse`; `Usuario` intacta — ver seção 8.17
- [x] CSS órfão do formulário de usuário removido (senha, telefone, `.divider`, `.filter-icon.all`) — ver seção 8.17
- [ ] Remover `editarIdiomaAdmin` e o modal "Editar Idioma" da aba Idiomas, que ainda chamam rota removida (seção 8.17)
- [ ] Verificar em navegador o dropdown do admin (seção 8.17) — toggles de filtro e rodapé do modal verificados na seção 8.20
- [x] ~~Decidir se "Enviar e-mail" fica `disabled` até a fase 17 (seção 8.17)~~ — passou a funcionar na seção 8.21 ("Suspender conta" já na 8.20)
- [x] `AsyncConfig` com `@EnableAsync` e pool dedicado (`emailExecutor`) para o envio de e-mails — ver seção 8.18
- [x] `EmailTemplates`: assuntos, corpos, saudação, assinatura e motivos padrão numa classe só — ver seção 8.18
- [x] `EmailService` com os cinco envios de moderação, assíncronos e sem desfazer a ação principal — ver seção 8.18
- [x] Destinatário nulo, e-mail inválido ou mensagem vazia registrados em log, sem tentativa de envio — ver seção 8.18
- [x] Justificativa, data de reativação e assunto opcionais, com texto padrão para cada ausência — ver seção 8.18
- [x] `EmailVerificationService` mantido intacto e síncrono, dono do código de verificação — ver seção 8.18
- [x] Ligar `EmailService` às ações de conta (desativar, suspender, reativar), com log da ação — ver seção 8.19
- [x] Ligar `EmailService` ao botão "Enviar e-mail" do modal (seção 8.18) — ver seção 8.21
- [x] Ligar `EmailService` à exclusão de idioma — ligado na seção 8.22; e-mail conferido na seção 8.25
- [ ] Revisar a redação dos cinco e-mails, em especial o "responda a este e-mail" e se a desativação deve dizer "por tempo indeterminado" (seções 8.18 e 8.19)
- [ ] Testar com SMTP real: acento, quebra de linha e remetente no cliente de e-mail (seção 8.18)
- [x] `Usuario.suspensoAte`, `motivoStatus` e `statusAlteradoEm`, nulos nas contas existentes — ver seção 8.19
- [x] Duas modalidades de bloqueio: desativação por tempo indeterminado e suspensão temporária com prazo — ver seção 8.19
- [x] `PUT /admin/usuarios/{codigo}/status` com `AlterarStatusUsuarioRequest` (`acao`, `justificativa`, `reativacaoEm`) e validações de prazo, ação e alvo — ver seção 8.19
- [x] Transições únicas em `UsuarioService` (`desativar`, `suspender`, `reativar`, `reativarSuspensaoVencida`) — ver seção 8.19
- [x] `SchedulingConfig` + `ReativacaoAutomaticaScheduler` a cada 5 min, uma transação por conta, falha isolada — ver seção 8.19
- [x] Log de sistema com admin nulo (`LogAdminService.registrarAcaoSistema`) e corte de `acao`/`detalhes` no tamanho da coluna — ver seção 8.19
- [x] Login informando desativação ou suspensão com previsão de reativação, sem expor o motivo — ver seção 8.19
- [x] `UsuarioModeracaoResponse` com `suspensoAte`, `motivoStatus` e `statusAlteradoEm` — ver seção 8.19
- [x] Migrar `admin.service.ts#alterarStatusUsuario` e a aba Usuários para o novo contrato (`acao` + prazo + justificativa) — ver seção 8.20
- [ ] Decidir se o `JwtAuthenticationFilter` deve consultar o status a cada requisição, para derrubar token de conta desativada antes de expirar (seções 8.16 e 8.19)
- [ ] Mensagem amigável para falhas de `@Valid` (hoje "Validation failed for argument…"), comum a todos os DTOs (seção 8.19)
- [x] `UsuarioModeracao` com `suspensoAte`/`motivoStatus`/`statusAlteradoEm`; tipos `AcaoStatusUsuario` e `AlterarStatusUsuario` — ver seção 8.20
- [x] Modal "Desativar / Suspender Conta": cards-rádio das duas modalidades, `datetime-local` com validação de data futura e resumo em linguagem natural — ver seção 8.20
- [x] Justificativa opcional com contador 0/1000 e aviso de que ela vai no e-mail (ou vai a mensagem padrão) — ver seção 8.20
- [x] Aviso de e-mail ao usuário, confirmação desabilitada até validar, estado de carregamento e erro do backend exibido no modal — ver seção 8.20
- [x] Modal "Reativar Conta" com confirmação, acessível pelo card e pelo modal de consulta (`moderarUsuarioEmVisualizacao`) — ver seção 8.20
- [x] Listagem com três situações (Ativo / Suspenso / Desativado): badge âmbar e "Reativação prevista: dd/MM/yyyy às HH:mm" para suspensas — ver seção 8.20
- [x] Consulta do usuário exibindo reativação prevista, justificativa registrada e última alteração de status — ver seção 8.20
- [x] Chip de filtro "Suspensos" e "Inativos" renomeado para "Desativados", com os três chips disjuntos — ver seção 8.20
- [x] Verificação em navegador do fluxo completo (suspender, reativar, desativar, erro do backend, tema claro, 350–1400 px) sem e-mail real — ver seção 8.20
- [ ] Decidir se conta inativa também deve abrir "Desativar / Suspender" (converter suspensão em indeterminada, redefinir prazo), que o backend já aceita (seção 8.20)
- [ ] Decidir se a listagem deve acompanhar a reativação automática sem recarregar a página (seção 8.20)
- [x] `EnviarEmailUsuarioRequest` (assunto ≤ 150, mensagem ≤ 5000, ambos obrigatórios) e `POST /admin/usuarios/{codigo}/email` respondendo 202, com ADMIN recusado — ver seção 8.21
- [x] Log administrativo do envio com admin, destinatário, assunto e data; ~~do corpo, só os 200 primeiros caracteres~~ (trecho do corpo removido na seção 8.24) — ver seção 8.21
- [x] `AdminService.enviarEmailUsuario` e interface `EnviarEmailUsuario` — ver seção 8.21
- [x] Botão de envelope em cada card da aba Usuários; ações do card em linha com faixa reservada no rodapé — ver seção 8.21
- [x] Modal "Enviar E-mail": destinatário (nome, e-mail, ID), assunto e mensagem com contadores, Enviar desabilitado até preencher, carregamento, sucesso e erro — ver seção 8.21
- [x] Campos limpos ao fechar o modal (Cancelar, "×", overlay ou após sucesso) — ver seção 8.21
- [x] "Enviar e-mail" do modal "Detalhes do Usuário" abre o modal de e-mail (`enviarEmailUsuarioEmVisualizacao`) — ver seção 8.21
- [x] Verificação em navegador e por `curl` (envio, 403 para ADMIN, 400 para assunto vazio/longo, tema claro, 400–1400 px) sem e-mail real — ver seção 8.21
- [ ] Decidir se o toast deve dizer "aceito para envio" em vez de "enviado", já que não há confirmação de entrega (seção 8.21)
- [ ] Decidir se fechar o modal de e-mail com texto preenchido deve pedir confirmação antes de descartar (seção 8.21)
- [x] Links "Ver idioma denunciado" e "Ver denunciante" no modal de denúncia, em nova aba, pelo código público — ver seção 8.23
- [x] Link desabilitado (sem `href`, `aria-disabled`, `title` com o motivo) quando o idioma foi excluído ou o usuário não está disponível — ver seção 8.23
- [x] `controle-adm` lendo `?usuario=` para abrir a aba Usuários com o modal "Detalhes do Usuário" do código pedido — ver seção 8.23
- [x] Verificação em navegador dos dois destinos, do estado indisponível e da alteração de status do modal — ver seção 8.23
- [ ] Mensagem específica quando `?usuario=` não encontra o código na lista (seção 8.23)
- [x] `LogAdmin` com usuário afetado (FK + retrato em texto) e idioma afetado (só texto, sem FK); `TipoLog` com `MODERACAO` e `EMAIL` — ver seção 8.24
- [x] `LogAdminTipoCheckMigration` realinhando `logs_admin_tipo_check` com o enum a cada subida — ver seção 8.24
- [x] `LogAdminService.Registro`: chamadores entregam dados estruturados; `acao` = verbo no passado + objeto, `detalhes` = `chave: valor; …` — ver seção 8.24
- [x] Registro obrigatório de desativação, suspensão, reativação manual e automática, exclusão de idioma, e-mail, status de denúncia e tentativas bloqueadas — ver seção 8.24
- [x] `GET /admin/logs` com `LogAdminResponse` (`acaoSistema`, `bloqueada`, `usuarioAfetado`, `idiomaAfetado`) no lugar do `Map` inline — ver seção 8.24
- [x] Aba Logs: chips Moderação e E-mails, linha de afetados, "Sistema — ação automática" e badge Bloqueada; filtros de data mantidos — ver seção 8.24
- [x] Exercitar a exclusão de idioma de ponta a ponta com um idioma descartável e conferir o log `Excluiu idioma` — ver seção 8.25 (LOG-49)
- [ ] Decidir se a aba Logs deve renderizar os pares `chave: valor` como lista em vez de texto corrido (seção 8.24)
- [x] Voltar de `buscar-usuario` e `buscar-idioma` sempre para a home, sem o ciclo com o item visitado — ver seção 8.25
- [x] Card "+" da home visível no limite de 4 idiomas, com aviso no modal e "Novo Idioma" desabilitado — ver seção 8.25
- [x] Carrossel do `cadastrar-idioma` sem cortar a direita na Tradução Direta — ver seção 8.25
- [x] 32 ícones de módulo por tema e lista única `ICONES_MODULO` no lugar das três cópias de `rawIcons` — ver seção 8.25
- [x] Cards de módulo em duas faixas, com ordem e Editar/Excluir sempre visíveis para o proprietário — ver seção 8.25
- [x] Troca de tema com revelação circular a partir do botão (View Transitions), com alternativa e "reduzir movimento" — ver seção 8.25
- [x] E-mails de moderação e de código em HTML com a logo, texto puro como alternativa — ver seção 8.25
- [x] E-mail de redefinição de senha com texto próprio e código em destaque (`finalidade` em `/auth/enviar-codigo`) — ver seção 8.25
- [ ] Abrir os e-mails novos no Gmail (web e app) e conferir logo, cores e quebras de linha (seção 8.25)
- [ ] Decidir se os módulos existentes devem migrar para os ícones novos (seção 8.25)
- [x] Ícone de atenção ("!") completo em todos os modais e avisos: ponta redonda nos 32 SVGs que desenham ponto — ver seção 8.26
- [x] Ícones novos para "Tradução Direta" (`languages`) e "Quiz" (`list-checks`) nos três seletores de modo e na lista de frases — ver seção 8.26
- [x] `clique` automático em todo botão e opção, substituído pelo som específico quando o clique tem um — ver seção 8.26
- [x] Sons no Jogar para escolher, devolver e ligar pares; `alerta` ao abrir as confirmações com ícone de atenção — ver seção 8.26
- [x] `sucesso`, `exclusao` e `erro` nos resultados das ações de todas as telas; tema e cópia com som próprio — ver seção 8.26
- [x] Verificação no app real dos sons agendados por clique (55 passos, `AudioContext` instrumentado) e das capturas dos ícones — ver seção 8.26
- [ ] Ouvir os sons novos e ajustar `RECEITAS`, sobretudo o volume do `clique` (seção 8.26)
- [ ] Decidir se "Selecionar Pares" deve ter o mesmo ícone no seletor (grade) e na lista de frases (elos) (seção 8.26)
- [x] Áudios opcionais nos três modos: tradução completa, palavras e traduções; palavras e traduções dos pares; pergunta e alternativas — ver seção 8.27
- [x] `POST /api/uploads/audio` com formato reconhecido pelo conteúdo (`FormatoAudio`) e limite de 5 MB — ver seção 8.27
- [x] Referências de áudio validadas no backend, inclusive dentro de `palavrasJson`/`paresJson` — ver seção 8.27
- [x] Componentes compartilhados `app-player-audio` e `app-campo-audio` e `AudioService` (um áudio por vez, envio ao salvar) — ver seção 8.27
- [x] Jogar: velocidades de 0,25x a 2x na tradução completa, na pergunta e nas alternativas; áudios pausados pelo modal de cancelar — ver seção 8.27
- [x] Áudios copiados na importação e exibidos na lista do módulo e na visão do moderador — ver seção 8.27
- [x] Tipo de denúncia "Áudios Inapropriados" — ver seção 8.27
- [x] Imagens e áudios (gravações de voz) explícitos nos Termos e na Política de Privacidade — ver seção 8.27
- [x] Botão de ouvir dentro do card da palavra no Jogar, abaixo da palavra e centralizado (peças, resposta, pares e "Ouça as palavras") — ver seção 8.27
- [ ] **Reanexar os 7 áudios do "Japonês para viagem" (FRS-46 e FRS-47), apagados por engano na limpeza dos testes** (seção 8.27)
- [ ] Importar um idioma com áudios usando uma segunda conta comum e conferir a cópia (seção 8.27)
- [ ] Ouvir os áudios num navegador com som, inclusive Safari e celular (seção 8.27)
- [ ] Aplicar ao upload de imagens a detecção pelo conteúdo, contra `.html`/`.svg` servidos em `/api/uploads` (seção 8.27)
- [ ] Decidir se arquivos órfãos de `/api/uploads` (imagens e áudios) devem ser apagados, com contagem de referências (seção 8.27)
- [ ] Tokenizar as cores do `jogar.css` para o tema claro (seção 8.27)
- [ ] Acrescentar casos de áudio ao `docs/roteiro-de-testes.md` (seção 8.27)
- [x] Proficiência no card de detalhes da home, com ponto na cor do nível — ver seção 8.28
- [x] Card "Proficiência" com escala de cinco níveis em Visualizar Idioma; estatísticas em 4, 2 ou 1 coluna — ver seção 8.28
- [ ] Compilar e conferir no navegador a proficiência da home e de Visualizar Idioma (seção 8.28)
- [x] Número de avaliações no card da busca de idiomas — ver seção 8.29
- [x] Ordenação por avaliação: estrelas exibidas no card, depois número de avaliações; idiomas sem avaliação no fim — ver seção 8.29
- [ ] Decidir se as estrelas (e, com elas, a ordenação da busca) devem arredondar para o inteiro mais próximo em vez de `Math.ceil` (seção 8.29)
- [x] Produção no ar: site no Worker `crow` (Cloudflare), API `crow-api` no Render, banco e uploads no Supabase — ver seção 8.30
- [x] Banco de produção só com o `admin@crow.com` (senha nova) e bucket vazio — ver seção 8.30
- [x] E-mail em produção pelo Gmail `hendersoftwares@gmail.com` via relay do Worker (Render bloqueia SMTP) — ver seção 8.30
- [x] Chave de API do Render `claude-deploy-crow` revogada em 2026-10-05 (a API do Render passou a responder 401 com ela) — ver seção 8.30
- [ ] Trocar `SUPABASE_CHAVE` pela chave nova `sb_secret_...` quando o Supabase aceitá-la / desativar as legadas (seção 8.30)
