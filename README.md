# Crow

Plataforma web gratuita, colaborativa e de código aberto para o estudo de idiomas.
Os próprios usuários criam, compartilham, importam e avaliam conteúdos de estudo
organizados em idiomas, módulos e exercícios, e estudam em rodadas com três modos
de exercício: quiz, tradução direta e seleção de pares.

O Crow foi desenvolvido como Trabalho de Conclusão de Curso do bacharelado em
Sistemas de Informação da Universidade Estadual do Tocantins (Unitins), Câmpus
Palmas, em 2026:

> CUNHA, Lucas Henderson Vieira. **Crow: desenvolvimento e avaliação de uma plataforma
> gamificada e colaborativa para o estudo de idiomas**. Trabalho de Conclusão de Curso
> (Bacharelado em Sistemas de Informação) – Universidade Estadual do Tocantins, Palmas,
> 2026. Orientadora: Prof.ª Me.ª Tayse Virgulino Ribeiro.

## Funcionalidades

- **Conta e acesso:** cadastro com verificação de e-mail por código, login com JWT e
  recuperação de senha.
- **Criação colaborativa:** o usuário cadastra um idioma (a língua é escolhida em uma
  lista pré-estabelecida), cria módulos e, neles, exercícios com imagem, vídeo e áudio
  opcionais; o áudio pode ser enviado como arquivo ou gravado pelo microfone.
- **Três modos de exercício:** quiz, tradução direta e seleção de pares.
- **Busca e importação:** busca de idiomas públicos com filtros por idioma e por
  proficiência e ordenação por avaliação ou data; importação do conteúdo de outro
  usuário para a própria conta (limite de quatro idiomas por usuário).
- **Rodada de estudo:** *feedback* imediato com sons, placar, barra de progresso e tela de
  resultado com percentual de acertos, tempo e histórico de respostas.
- **Curadoria comunitária:** avaliação de idiomas por estrelas e denúncia de conteúdo.
- **Moderação:** painel administrativo com tratamento de denúncias, gestão de contas
  (desativação, suspensão e reativação), exclusão de idiomas com aviso ao proprietário
  e registros (*logs*) de todas as ações administrativas.
- **Interface:** em português, com temas claro e escuro e leiaute para computador e
  celular.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend (`crow/`) | Angular 21 (componentes *standalone*), TypeScript, CSS puro |
| Backend (`api/`) | Java 21, Spring Boot 3.5, Spring Security com JWT (jjwt), Spring Data JPA, Spring Mail, BCrypt |
| Banco de dados | PostgreSQL |
| Publicação | Cloudflare Workers (site e intermediação das requisições), Render (API em Docker) e Supabase (banco e arquivos enviados) |

## Estrutura do repositório

```
crow/          aplicação Angular (frontend)
api/           API REST em Spring Boot (backend)
cloudflare/    Worker de produção: site estático, proxy /api, relay de e-mail e cron
docs/          documentação: roteiro de testes, verificações dos testes e publicação
render.yaml    blueprint do serviço da API no Render
PENDENCIAS.md  histórico das pendências e das rodadas de implementação
```

## Como executar localmente

**Pré-requisitos:** Java 21, Node.js 20.19 ou superior (exigido pelo Angular 21),
PostgreSQL 16 e uma conta Gmail com senha de app, usada no envio dos códigos de
verificação.

1. **Banco de dados:** crie um banco vazio chamado `crow_db` no PostgreSQL local. As
   tabelas são criadas pela própria API na primeira execução.

2. **Configuração da API:** crie o arquivo `api/src/main/resources/application-local.properties`
   (ignorado pelo Git) com as suas credenciais:

   ```properties
   spring.datasource.password=SUA_SENHA_DO_POSTGRES
   spring.mail.username=SEU_EMAIL@gmail.com
   spring.mail.password=SUA_SENHA_DE_APP_DO_GMAIL
   jwt.secret=UMA_CHAVE_LONGA_E_ALEATORIA
   ```

3. **API** (porta 8080):

   ```bash
   cd api
   ./mvnw spring-boot:run        # no Windows: mvnw.cmd spring-boot:run
   ```

   Na primeira execução com o banco vazio, a classe `config/DataSeeder.java` cria uma
   conta administrativa e uma conta de usuário de teste para desenvolvimento.

4. **Frontend** (porta 4200, com proxy de `/api` para a porta 8080):

   ```bash
   cd crow
   npm install
   npm start
   ```

   Acesse http://localhost:4200.

## Documentação

- [`docs/roteiro-de-testes.md`](docs/roteiro-de-testes.md): roteiro dos testes manuais
  dos fluxos da plataforma.
- [`docs/verificacoes-testes-funcionais.md`](docs/verificacoes-testes-funcionais.md):
  ambiente, resultado por caso e verificações da suíte de 33 casos de teste
  funcionais executada em 25/10/2026.
- [`docs/deploy-producao.md`](docs/deploy-producao.md): arquitetura e configuração da
  publicação em serviços gratuitos.
- [`PENDENCIAS.md`](PENDENCIAS.md): histórico das pendências e das rodadas de
  implementação, com o que foi feito e como foi verificado.

## Autor

Lucas Henderson Vieira Cunha — Sistemas de Informação, Unitins (Palmas – TO).
