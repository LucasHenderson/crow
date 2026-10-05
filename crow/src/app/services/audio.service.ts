import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UploadService } from './upload.service';

/** Velocidades dos players com controle de velocidade. */
export const VELOCIDADES_AUDIO: readonly number[] = [0.25, 0.5, 1, 1.25, 1.5, 1.75, 2];

/**
 * Extensões aceitas no cadastro. O backend não confia nelas: reconhece o
 * formato pelo conteúdo do arquivo (`FormatoAudio`) e grava com a extensão
 * do formato detectado. `.oga`/`.opus` são OGG e `.weba` é WEBM.
 */
export const EXTENSOES_AUDIO: readonly string[] = ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'oga', 'opus', 'webm', 'weba'];

/** Valor do atributo `accept` dos seletores de arquivo de áudio. */
export const ACCEPT_AUDIO = ['audio/*', ...EXTENSOES_AUDIO.map(extensao => '.' + extensao)].join(',');

/** Mesmo limite do backend (`FormatoAudio.TAMANHO_MAXIMO_BYTES`). */
export const TAMANHO_MAXIMO_AUDIO = 5 * 1024 * 1024;

export const FORMATOS_AUDIO_TEXTO = 'MP3, M4A, AAC, WAV, OGG ou WEBM';

/** Duração máxima de uma gravação pelo microfone. A 64 kbps fica bem abaixo dos 5 MB. */
export const LIMITE_GRAVACAO_SEGUNDOS = 120;

/**
 * Tipos pedidos ao MediaRecorder, em ordem de preferência: WEBM no
 * Chrome/Edge/Firefox, MP4 no Safari. Todos estão entre os formatos que o
 * backend reconhece pelo conteúdo.
 */
export const TIPOS_GRAVACAO: readonly string[] = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

/** O navegador grava áudio? Exige MediaRecorder e microfone em contexto seguro (HTTPS ou localhost). */
export function podeGravarAudio(): boolean {
  return typeof window !== 'undefined'
    && typeof window.MediaRecorder !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia;
}

/** "0:07", "1:05". Duração desconhecida (ex.: WEBM gravado no navegador) vira "0:00". */
export function formatarDuracao(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return '0:00';
  const total = Math.floor(segundos);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** Um player que o serviço pode interromper. Implementado por `PlayerAudio`. */
export interface ReprodutorAudio {
  /** Outro áudio começou: interrompe e volta ao início. */
  parar(): void;
  /** Um modal abriu por cima: pausa mantendo a posição. */
  pausar(): void;
  /** O modal fechou: continua de onde parou. */
  retomar(): void;
}

/** Arquivo escolhido num formulário e ainda não salvo. */
interface ArquivoPendente {
  arquivo: File;
  /** Caminho no servidor depois do envio — reaproveitado se o salvamento falhar e for repetido. */
  caminho?: string;
}

/**
 * Áudios das frases.
 *
 * **Reprodução.** Só um áudio toca por vez em toda a aplicação: quando um
 * player começa, o que estava tocando é interrompido. O Jogar usa
 * `pausarParaModal`/`retomarAposModal` no modal de cancelar a rodada, como já
 * faz com o vídeo do quiz, e `inicioDeReproducao` para pausar o vídeo quando um
 * áudio começa. A velocidade escolhida vira a inicial dos próximos players —
 * só em memória: ao recarregar a página volta a 1x.
 *
 * **Cadastro.** Os áudios seguem o modelo das imagens: o arquivo escolhido (ou
 * gravado pelo microfone) fica no navegador (URL `blob:`, para ouvir antes de
 * salvar) e só é enviado ao salvar a frase. `enviarPendentes` envia e `paraSalvar` troca a URL local pelo
 * caminho no servidor na hora de montar o corpo da requisição. Quem prepara um
 * arquivo é responsável por descartá-lo (`descartar`/`descartarTodos`) ao
 * limpar ou sair do formulário.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {

  /** Player tocando agora. */
  private ativo: ReprodutorAudio | null = null;
  /** Player pausado por um modal, à espera de `retomarAposModal`. */
  private pausadoPeloModal: ReprodutorAudio | null = null;

  /** Emite sempre que um áudio de frase começa a tocar. */
  readonly inicioDeReproducao = new Subject<void>();

  /** Última velocidade escolhida num player com controle de velocidade. */
  velocidadePreferida = 1;

  private readonly pendentes = new Map<string, ArquivoPendente>();
  /** Durações já lidas, por URL — evita reler o arquivo a cada renderização. */
  private readonly duracoes = new Map<string, number>();

  constructor(private uploadService: UploadService) {}

  // ===== REPRODUÇÃO =====

  /** Chamado pelo player ao começar a tocar: interrompe o que estiver tocando. */
  iniciar(reprodutor: ReprodutorAudio): void {
    if (this.ativo && this.ativo !== reprodutor) {
      this.ativo.parar();
    }
    this.ativo = reprodutor;
    this.pausadoPeloModal = null;
    this.inicioDeReproducao.next();
  }

  /** O player parou por conta própria (pausa, fim do áudio ou falha). */
  encerrar(reprodutor: ReprodutorAudio): void {
    if (this.ativo === reprodutor) this.ativo = null;
  }

  /** O player saiu da tela: não pode mais ser retomado. */
  remover(reprodutor: ReprodutorAudio): void {
    this.encerrar(reprodutor);
    if (this.pausadoPeloModal === reprodutor) this.pausadoPeloModal = null;
  }

  /** Pausa o áudio que estiver tocando. Devolve se havia algum. */
  pausarParaModal(): boolean {
    const reprodutor = this.ativo;
    if (!reprodutor) return false;
    this.ativo = null;
    this.pausadoPeloModal = reprodutor;
    reprodutor.pausar();
    return true;
  }

  /** Retoma o áudio pausado por `pausarParaModal`, se ainda estiver na tela. */
  retomarAposModal(): void {
    const reprodutor = this.pausadoPeloModal;
    this.pausadoPeloModal = null;
    reprodutor?.retomar();
  }

  pararTudo(): void {
    this.pausadoPeloModal = null;
    const reprodutor = this.ativo;
    this.ativo = null;
    reprodutor?.parar();
  }

  /**
   * Duração em segundos, lida dos metadados. `Infinity` quando o arquivo não
   * informa (comum em WEBM gravado no navegador). Rejeita se o navegador não
   * conseguir ler o áudio.
   */
  lerDuracao(url: string, limiteMs = 10000): Promise<number> {
    const conhecida = this.duracoes.get(url);
    if (conhecida !== undefined) return Promise.resolve(conhecida);

    return new Promise<number>((resolve, reject) => {
      const elemento = new Audio();
      elemento.preload = 'metadata';

      const finalizar = () => {
        clearTimeout(limite);
        elemento.onloadedmetadata = null;
        elemento.onerror = null;
        // Solta o arquivo: sem isso o elemento continua segurando a conexão.
        elemento.removeAttribute('src');
        elemento.load();
      };
      const limite = setTimeout(() => {
        finalizar();
        reject(new Error('Tempo esgotado ao ler o áudio'));
      }, limiteMs);

      elemento.onloadedmetadata = () => {
        const duracao = elemento.duration;
        finalizar();
        this.duracoes.set(url, duracao);
        resolve(duracao);
      };
      elemento.onerror = () => {
        finalizar();
        reject(new Error('O navegador não conseguiu ler o áudio'));
      };
      elemento.src = url;
    });
  }

  // ===== ARQUIVOS DOS FORMULÁRIOS =====

  /**
   * Confere o arquivo escolhido e, se servir, guarda-o até o salvamento.
   * Devolve a URL `blob:` para ouvir antes de salvar, ou a mensagem de erro:
   * formato fora da lista, arquivo vazio, acima de 5 MB ou ilegível para o
   * navegador (o que também pega arquivo corrompido ou renomeado).
   */
  async prepararArquivo(arquivo: File): Promise<{ url: string } | { erro: string }> {
    const extensao = arquivo.name.includes('.') ? arquivo.name.split('.').pop()!.toLowerCase() : '';
    if (!EXTENSOES_AUDIO.includes(extensao)) {
      return { erro: `Formato não suportado. Use ${FORMATOS_AUDIO_TEXTO}.` };
    }
    if (arquivo.size === 0) {
      return { erro: 'O arquivo de áudio está vazio.' };
    }
    if (arquivo.size > TAMANHO_MAXIMO_AUDIO) {
      return { erro: 'O áudio deve ter no máximo 5 MB.' };
    }

    const url = URL.createObjectURL(arquivo);
    try {
      await this.lerDuracao(url);
    } catch {
      URL.revokeObjectURL(url);
      return { erro: 'Não foi possível ler este áudio. Verifique o arquivo ou tente um MP3.' };
    }
    this.pendentes.set(url, { arquivo });
    return { url };
  }

  /**
   * Gravação feita pelo microfone: vira um arquivo como os escolhidos no
   * seletor e passa pelas mesmas conferências. O WEBM gravado no navegador não
   * informa a duração, então vale a medida durante a gravação.
   */
  async prepararGravacao(gravacao: Blob, segundos: number): Promise<{ url: string } | { erro: string }> {
    const tipo = (gravacao.type || 'audio/webm').split(';')[0];
    const extensao = tipo.includes('mp4') ? 'm4a' : tipo.includes('ogg') ? 'ogg' : 'webm';
    const resultado = await this.prepararArquivo(new File([gravacao], `gravacao.${extensao}`, { type: tipo }));
    if ('url' in resultado && !Number.isFinite(this.duracoes.get(resultado.url))) {
      this.duracoes.set(resultado.url, segundos);
    }
    return resultado;
  }

  /** Libera um arquivo ainda não salvo. Caminhos do servidor são ignorados. */
  descartar(url: string | null | undefined): void {
    if (!url || !this.pendentes.has(url)) return;
    this.pendentes.delete(url);
    this.duracoes.delete(url);
    URL.revokeObjectURL(url);
  }

  descartarTodos(urls: (string | null | undefined)[]): void {
    urls.forEach(url => this.descartar(url));
  }

  /**
   * Envia os arquivos ainda não salvos entre as URLs informadas. Os que já
   * subiram numa tentativa anterior não são reenviados.
   */
  enviarPendentes(urls: (string | null | undefined)[]): Observable<void> {
    const envios = [...new Set(urls)]
      .map(url => (url ? this.pendentes.get(url) : undefined))
      .filter((pendente): pendente is ArquivoPendente => !!pendente && !pendente.caminho)
      .map(pendente => this.uploadService.uploadAudio(pendente.arquivo).pipe(
        tap(resposta => { pendente.caminho = resposta.path; })
      ));

    return envios.length ? forkJoin(envios).pipe(map(() => undefined)) : of(undefined);
  }

  /**
   * Valor a gravar na frase: o caminho no servidor. Para um arquivo local,
   * o caminho recebido em `enviarPendentes`; sem áudio, `undefined` — que o
   * `JSON.stringify` omite dos objetos e transforma em `null` nas listas.
   */
  paraSalvar(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    const pendente = this.pendentes.get(url);
    if (pendente) return pendente.caminho;
    return url.startsWith('blob:') ? undefined : url;
  }
}
