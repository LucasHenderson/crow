/**
 * Cliente SMTP mínimo para o relay de e-mail: TLS implícito (porta 465),
 * AUTH PLAIN, um remetente e N destinatários. A mensagem chega pronta (RFC 822,
 * montada pelo JavaMail na API); aqui só se normalizam as quebras de linha e se
 * aplica o "dot-stuffing" do comando DATA (RFC 5321, seção 4.5.2).
 */
import { connect } from 'cloudflare:sockets';

const TIMEOUT_MS = 30_000;
const CR = 13;
const LF = 10;
const PONTO = 46;

export async function enviarPorSmtp({ host, porta, usuario, senha, dominio, destinatarios, mensagem }) {
  const socket = connect({ hostname: host, port: porta }, { secureTransport: 'on' });
  const escritor = socket.writable.getWriter();
  const lerResposta = criarLeitor(socket.readable.getReader());
  const encoder = new TextEncoder();

  async function esperar(...codigos) {
    const resposta = await lerResposta();
    if (!codigos.includes(resposta.codigo)) {
      throw new Error(`SMTP respondeu "${resposta.texto}"`);
    }
  }

  async function comando(linha, ...codigos) {
    await escritor.write(encoder.encode(`${linha}\r\n`));
    await esperar(...codigos);
  }

  let timer;
  const conversa = (async () => {
    await esperar(220);
    await comando(`EHLO ${dominio}`, 250);
    await comando(`AUTH PLAIN ${base64(encoder.encode(`\u0000${usuario}\u0000${senha}`))}`, 235);
    await comando(`MAIL FROM:<${usuario}>`, 250);
    for (const destinatario of destinatarios) {
      await comando(`RCPT TO:<${destinatario}>`, 250, 251);
    }
    await comando('DATA', 354);
    await escritor.write(prepararDados(mensagem));
    await esperar(250);
    await escritor.write(encoder.encode('QUIT\r\n')).catch(() => {});
  })();
  const limite = new Promise((_, rejeitar) => {
    timer = setTimeout(() => rejeitar(new Error('Tempo esgotado na conversa SMTP')), TIMEOUT_MS);
  });

  try {
    await Promise.race([conversa, limite]);
  } finally {
    clearTimeout(timer);
    conversa.catch(() => {});
    await socket.close().catch(() => {});
  }
}

/** Lê respostas completas (inclusive multilinha "250-...") do servidor. */
function criarLeitor(leitor) {
  const decoder = new TextDecoder();
  let buffer = '';
  return async function lerResposta() {
    const linhas = [];
    for (;;) {
      let fim;
      while ((fim = buffer.indexOf('\r\n')) === -1) {
        const { value, done } = await leitor.read();
        if (done) throw new Error('Conexão SMTP encerrada pelo servidor');
        buffer += decoder.decode(value, { stream: true });
      }
      const linha = buffer.slice(0, fim);
      buffer = buffer.slice(fim + 2);
      linhas.push(linha);
      if (linha.length < 4 || linha[3] !== '-') {
        return { codigo: Number(linha.slice(0, 3)), texto: linhas.join(' | ') };
      }
    }
  };
}

/** Quebras de linha em CRLF, ponto duplicado no início de linha e terminador "\r\n.\r\n". */
function prepararDados(mensagem) {
  const saida = new Uint8Array(mensagem.length * 2 + 5);
  let j = 0;
  let inicioDeLinha = true;
  for (let i = 0; i < mensagem.length; i++) {
    const byte = mensagem[i];
    if (byte === CR || byte === LF) {
      if (byte === CR && mensagem[i + 1] === LF) i++;
      saida[j++] = CR;
      saida[j++] = LF;
      inicioDeLinha = true;
      continue;
    }
    if (inicioDeLinha && byte === PONTO) saida[j++] = PONTO;
    saida[j++] = byte;
    inicioDeLinha = false;
  }
  if (!inicioDeLinha) {
    saida[j++] = CR;
    saida[j++] = LF;
  }
  saida[j++] = PONTO;
  saida[j++] = CR;
  saida[j++] = LF;
  return saida.subarray(0, j);
}

function base64(bytes) {
  let binario = '';
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario);
}
