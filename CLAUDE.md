# Projeto Crow

Plataforma gamificada e colaborativa para estudo de idiomas. TCC — UNITINS.

## Estrutura
- `api/` — Spring Boot 3.5, Java, Maven, PostgreSQL, JWT (jjwt), Lombok, Spring Mail
- `crow/` — Angular 21, componentes standalone, CSS puro (sem framework de UI)

## Convenções de backend
- Entidades em `api/src/main/java/com/crow/api/entity`
- DTOs como `record` em `dto/<dominio>/`
- Services com `@RequiredArgsConstructor`
- Erros via `ResponseStatusException` (a mensagem chega ao frontend — `server.error.include-message=always`)
- `ddl-auto=update`: colunas novas são criadas automaticamente, mas nada é removido ou renomeado. Toda coluna nova em tabela existente precisa aceitar nulo ou ter backfill.
- Toda ação administrativa deve gerar registro via `LogAdminService.registrar(...)`

## Convenções de frontend
- Componentes standalone, arquivos separados `.ts` / `.html` / `.css`
- Navegação por query params (`/visualizar-idioma?id=...`), não por path params
- Nomes de arquivos, rotas, variáveis e textos de UI em português
- Ícones são SVG inline, `stroke="currentColor"`, `stroke-width="2"`, `viewBox="0 0 24 24"`
- Temas claro/escuro via `ThemeService`; use variáveis CSS existentes, nunca cores fixas
- Sem bibliotecas novas sem me perguntar antes

## Regras de trabalho
- Nunca altere arquivos fora do escopo da tarefa pedida
- Nunca mexa em `.env`, `application-local.properties`, `target/`, `dist/`, `.angular/`
- Antes de criar algo novo, procure se já existe padrão equivalente no projeto e siga-o
- Mantenha o padrão visual existente em qualquer tela nova
