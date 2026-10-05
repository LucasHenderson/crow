/**
 * Worker de produção do Crow (Cloudflare).
 *
 * - Serve o build do Angular (assets estáticos, com fallback de SPA).
 * - /api/uploads/<arquivo>: lê do bucket público do Supabase Storage.
 * - /api/*: repassa para a API Spring Boot no Render. O navegador só conhece a
 *   origem do site, então não há CORS e os caminhos /api/uploads/... gravados
 *   no banco funcionam iguais ao desenvolvimento.
 * - /interno/email: relay de e-mail da API (o Render gratuito bloqueia SMTP);
 *   envia pelo Gmail na porta 465. Protegido por token compartilhado.
 * - Cron a cada 10 min: chama /api/saude para a API não dormir.
 *
 * Configuração em wrangler.jsonc; segredos (SMTP_SENHA, EMAIL_RELAY_TOKEN) via
 * `wrangler secret put`. Visão geral: docs/deploy-producao.md
 */
import { enviarPorSmtp } from './smtp.js';

const PREFIXO_UPLOADS = '/api/uploads/';
const NOME_ARQUIVO = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const EMAIL = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/;
const TAMANHO_MAXIMO_EMAIL = 10 * 1024 * 1024;
const MAXIMO_DESTINATARIOS = 20;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/interno/email') {
      return relayEmail(request, env, url);
    }
    if (url.pathname.startsWith(PREFIXO_UPLOADS) && ['GET', 'HEAD'].includes(request.method)) {
      return servirUpload(request, env, url);
    }
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      return encaminharParaApi(request, env, url);
    }
    return env.ASSETS.fetch(request);
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(manterApiAcordada(env));
  },
};

// ===================== API =====================

async function encaminharParaApi(request, env, url) {
  const destino = new URL(url.pathname + url.search, env.API_ORIGEM);
  const headers = new Headers(request.headers);
  headers.set('X-Forwarded-Host', url.host);
  headers.set('X-Forwarded-Proto', 'https');
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) headers.set('X-Forwarded-For', ip);

  try {
    return await fetch(destino, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });
  } catch (erro) {
    console.error('Falha ao falar com a API:', erro);
    return Response.json(
      { message: 'Servidor indisponível no momento. Tente novamente em instantes.' },
      { status: 502 },
    );
  }
}

async function manterApiAcordada(env) {
  const resposta = await fetch(new URL('/api/saude', env.API_ORIGEM), {
    headers: { 'User-Agent': 'crow-cron' },
  });
  console.log('cron /api/saude:', resposta.status);
}

// ===================== Uploads =====================

async function servirUpload(request, env, url) {
  const nome = url.pathname.slice(PREFIXO_UPLOADS.length);
  if (!NOME_ARQUIVO.test(nome)) {
    return new Response('Arquivo não encontrado', { status: 404 });
  }

  const origem = `${env.SUPABASE_URL}/storage/v1/object/public/${env.BUCKET_UPLOADS}/${nome}`;
  const headers = new Headers();
  const range = request.headers.get('Range');
  if (range) headers.set('Range', range);

  let resposta;
  try {
    resposta = await fetch(origem, {
      method: request.method,
      headers,
      cf: { cacheEverything: true, cacheTtl: 86400 },
    });
  } catch (erro) {
    console.error('Falha ao ler o upload no Supabase:', erro);
    return new Response('Arquivo indisponível no momento', { status: 502 });
  }
  if (!resposta.ok) {
    // O Supabase responde 400 com JSON para arquivo inexistente.
    return new Response('Arquivo não encontrado', { status: 404 });
  }

  const saida = new Response(resposta.body, resposta);
  // Arquivos enviados por usuários nunca executam nada na origem do site
  // (ex.: SVG ou HTML disfarçado de imagem aberto direto pela URL).
  saida.headers.set('X-Content-Type-Options', 'nosniff');
  saida.headers.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
  return saida;
}

// ===================== E-mail =====================

async function relayEmail(request, env, url) {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405 });
  }
  if (!(await tokenValido(request.headers.get('Authorization'), env.EMAIL_RELAY_TOKEN))) {
    return new Response('Não autorizado', { status: 401 });
  }

  const destinatarios = (request.headers.get('X-Destinatarios') || '')
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);
  if (!destinatarios.length || destinatarios.length > MAXIMO_DESTINATARIOS
      || destinatarios.some((d) => !EMAIL.test(d))) {
    return new Response('Destinatários inválidos', { status: 400 });
  }

  const mensagem = new Uint8Array(await request.arrayBuffer());
  if (!mensagem.length || mensagem.length > TAMANHO_MAXIMO_EMAIL) {
    return new Response('Mensagem vazia ou grande demais', { status: 400 });
  }

  try {
    await enviarPorSmtp({
      host: env.SMTP_HOST,
      porta: Number(env.SMTP_PORTA),
      usuario: env.SMTP_USUARIO,
      senha: env.SMTP_SENHA,
      dominio: url.hostname,
      destinatarios,
      mensagem,
    });
    return new Response(null, { status: 204 });
  } catch (erro) {
    console.error('Falha no envio SMTP:', erro);
    return new Response(`Falha no envio: ${erro.message}`, { status: 502 });
  }
}

/** Compara "Bearer <token>" com o segredo em tempo constante. */
async function tokenValido(cabecalho, esperado) {
  if (!esperado || !cabecalho || !cabecalho.startsWith('Bearer ')) return false;
  const codificar = (texto) => crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  const [recebido, correto] = await Promise.all([codificar(cabecalho.slice(7)), codificar(esperado)]);
  return crypto.subtle.timingSafeEqual(recebido, correto);
}
