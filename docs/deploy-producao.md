# Crow em produção

Tudo roda em planos gratuitos, sem cartão de crédito. Publicado em 2026-10-05.

| Parte | Onde | Endereço |
|---|---|---|
| Site (Angular) + proxy `/api` + relay de e-mail + cron | Cloudflare Workers — Worker `crow` | https://crow.lucashendersonvieiracunha.workers.dev |
| API (Spring Boot, Docker) | Render — serviço `crow-api` (free, Virginia) | https://crow-api-lxjs.onrender.com |
| Banco PostgreSQL | Supabase — projeto `crow` (`svyygvkrbagqxrxpdmyo`, us-east-1, org "Lucas") | pooler `aws-0-us-east-1.pooler.supabase.com:5432` |
| Imagens e áudios | Supabase Storage — bucket público `uploads` | servidos pelo Worker em `/api/uploads/...` |
| E-mail | Gmail `hendersoftwares@gmail.com` (senha de app), enviado pelo Worker | — |

## Como as peças se falam

```
navegador ──► Worker crow (Cloudflare)
               ├─ arquivos do Angular (build estático, fallback de SPA)
               ├─ /api/uploads/<arquivo> ──► Supabase Storage (bucket público)
               ├─ /api/*                 ──► API no Render ──► Postgres no Supabase
               └─ /interno/email  ◄── API (HTTPS + token) ──► Gmail SMTP 465
cron do Worker (*/10 min) ──► GET /api/saude ──► SELECT 1 no banco
```

- **Mesma origem**: o navegador só fala com o Worker, então não há CORS no uso
  normal e os caminhos `/api/uploads/...` gravados no banco funcionam como no
  desenvolvimento. `CORS_ALLOWED_ORIGINS` precisa ser o endereço do Worker,
  porque o Worker repassa o cabeçalho `Origin` para a API.
- **E-mail**: o Render gratuito bloqueia as portas SMTP (25, 465, 587). A API
  monta a mensagem com o JavaMail como sempre e a entrega por HTTPS ao Worker
  (`config/EmailRelaySender`), que faz o SMTP no Gmail (`cloudflare/src/smtp.js`).
  Limite do Gmail: ~500 envios por dia.
- **Uploads**: o disco do Render é apagado a cada deploy. Com `app.supabase.url`
  definido, `ArmazenamentoService` grava no bucket; sem ele (desenvolvimento),
  grava em `api/uploads/`. O Worker serve os arquivos com
  `Content-Security-Policy: sandbox` e `nosniff`, então um arquivo malicioso
  aberto direto pela URL não executa nada na origem do site.
- **Cron**: a API do Render dorme após 15 min sem acesso (e leva ~1 min para
  acordar). O Worker chama `/api/saude` a cada 10 min, o que também mantém o
  Supabase ativo — projetos gratuitos pausam após 7 dias sem uso do banco. Um
  serviço ligado 24 h cabe nas 750 h/mês do Render.

## Configuração

Nenhum segredo fica no repositório.

**Render** (`crow-api` → Environment), lido por `application-prod.properties`:

| Variável | Conteúdo |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | pooler do Supabase em modo sessão (`...?sslmode=require`, usuário `postgres.svyygvkrbagqxrxpdmyo`) |
| `SUPABASE_URL` / `SUPABASE_CHAVE` | URL do projeto e chave `service_role` (Storage) |
| `EMAIL_RELAY_URL` / `EMAIL_RELAY_TOKEN` | `https://crow.lucashendersonvieiracunha.workers.dev/interno/email` e o token compartilhado com o Worker |
| `MAIL_USERNAME` | `hendersoftwares@gmail.com` (remetente) |
| `CORS_ALLOWED_ORIGINS` | endereço do Worker |
| `JWT_SECRET` | gerado pelo Render |
| `ADMIN_SENHA_INICIAL` | senha do `admin@crow.com` — só vale quando o banco está vazio |

**Cloudflare** (`cloudflare/wrangler.jsonc`): variáveis públicas no arquivo;
segredos `SMTP_SENHA` (senha de app do Gmail) e `EMAIL_RELAY_TOKEN` (o mesmo do
Render) via `npx wrangler@4 secret put <NOME>`.

**Supabase**: as tabelas são criadas pelo Hibernate (`ddl-auto=update`) no
schema `public`. Os papéis `anon` e `authenticated` não têm acesso a elas
(privilégios revogados, inclusive os padrões para tabelas novas), então a API
REST pública do Supabase não expõe nada.

## Publicar uma nova versão

- **API**: push na `master` com mudanças em `api/` → o Render reconstrói e
  publica sozinho (`render.yaml` descreve o serviço). O health check é
  `GET /api/saude`.
- **Site / Worker** (manual):
  ```
  cd crow
  CI=true npx ng build --output-path ../cloudflare/build
  cd ../cloudflare
  npx wrangler@4 deploy
  ```
  `CI=true` evita gravar cache em `crow/.angular/`; a saída vai para
  `cloudflare/build/` (ignorada pelo git), sem tocar em `crow/dist/`.

## Limites do plano gratuito

- Render: 512 MB de RAM, 0,1 CPU, 5 GB de banda/mês; o primeiro deploy leva
  alguns minutos (build Maven no Docker).
- Supabase: 500 MB de banco, 1 GB de Storage, 5 GB de egress/mês.
- Cloudflare Workers: 100 mil requisições/dia (os arquivos estáticos não contam).
- Gmail: ~500 e-mails/dia.

## Diagnóstico rápido

- `GET https://crow.lucashendersonvieiracunha.workers.dev/api/saude` → `{"status":"ok"}`
  confirma Worker → Render → Supabase.
- Logs da API: painel do Render (`crow-api` → Logs). Logs do Worker (relay,
  cron): `npx wrangler@4 tail` em `cloudflare/` ou painel da Cloudflare.
- Falha de e-mail aparece no log da API como `Relay de e-mail respondeu HTTP ...`
  com o motivo dado pelo Gmail.
