import { Component, Input, OnChanges, OnDestroy, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AudioService,
  ReprodutorAudio,
  VELOCIDADES_AUDIO,
  formatarDuracao
} from '../../services/audio.service';
import { SoundService } from '../../services/sound.service';

type EstadoPlayer = 'parado' | 'carregando' | 'tocando' | 'pausado' | 'erro';

/**
 * Botão de ouvir um áudio de frase, com seletor de velocidade opcional
 * (0,25x a 2x).
 *
 * - `mini`: só o botão com o alto-falante — palavras, pares e alternativas.
 * - `barra`: botão, barra de progresso arrastável e tempo — tradução completa
 *   e pergunta do quiz. Carrega os metadados logo ao aparecer, para mostrar a
 *   duração antes do primeiro play.
 *
 * Um áudio por vez em toda a aplicação (AudioService). Os cliques do player
 * não chegam ao elemento pai: no Jogar ele fica dentro de cards clicáveis
 * (pares e alternativas), que não devem ser selecionados ao ouvir.
 *
 * O estado fica em signals: os eventos do `<audio>` chegam fora do template e,
 * no app zoneless, é o signal que agenda a renderização.
 */
@Component({
  selector: 'app-player-audio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-audio.html',
  styleUrl: './player-audio.css',
  host: { '[class.em-barra]': "variante === 'barra'" },
})
export class PlayerAudio implements OnChanges, OnDestroy, ReprodutorAudio {

  @Input() src: string | null | undefined = null;
  /** O que se ouve, para os rótulos acessíveis: "a pergunta", "Good morning"... */
  @Input() rotulo = 'o áudio';
  @Input() variante: 'mini' | 'barra' = 'mini';
  @Input() tamanho: 'normal' | 'pequeno' = 'normal';
  /** Mostra o seletor de velocidade. Sem ele, o áudio toca sempre a 1x. */
  @Input() velocidade = false;

  readonly velocidades = VELOCIDADES_AUDIO;
  readonly estado = signal<EstadoPlayer>('parado');
  readonly posicao = signal(0);
  readonly duracao = signal(0);
  readonly taxa = signal(1);

  /** Tocando ou prestes a tocar: o botão vira "pausar". */
  readonly ativo = computed(() => this.estado() === 'tocando' || this.estado() === 'carregando');

  readonly rotuloBotao = computed(() => {
    switch (this.estado()) {
      case 'tocando':
      case 'carregando':
        return `Pausar ${this.rotulo}`;
      case 'erro':
        return `Não foi possível tocar ${this.rotulo} — tentar de novo`;
      default:
        return `Ouvir ${this.rotulo}`;
    }
  });

  readonly tempoTexto = computed(() => {
    const total = this.duracao();
    const atual = formatarDuracao(this.posicao());
    return total > 0 ? `${atual} / ${formatarDuracao(total)}` : atual;
  });

  private elemento: HTMLAudioElement | null = null;
  /** Remove de uma vez todos os ouvintes do elemento atual. */
  private ouvintes: AbortController | null = null;

  constructor(
    private audioService: AudioService,
    private soundService: SoundService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['velocidade']) {
      this.taxa.set(this.velocidade ? this.audioService.velocidadePreferida : 1);
      this.aplicarTaxa();
    }
    if (changes['src']) {
      this.descartarElemento();
      this.estado.set('parado');
      this.posicao.set(0);
      this.duracao.set(0);
      if (this.variante === 'barra' && this.src) {
        this.criarElemento('metadata');
      }
    }
  }

  ngOnDestroy(): void {
    this.descartarElemento();
  }

  alternar(evento: Event): void {
    evento.stopPropagation();
    if (!this.src) return;
    if (this.ativo()) {
      this.elemento?.pause();
      this.estado.set('pausado');
      this.audioService.encerrar(this);
    } else {
      this.tocar();
    }
  }

  buscar(evento: Event): void {
    const segundos = Number((evento.target as HTMLInputElement).value);
    if (!this.elemento || !Number.isFinite(segundos)) return;
    this.elemento.currentTime = segundos;
    this.posicao.set(segundos);
  }

  mudarVelocidade(evento: Event): void {
    const valor = Number((evento.target as HTMLSelectElement).value);
    if (!this.velocidades.includes(valor)) return;
    this.taxa.set(valor);
    this.audioService.velocidadePreferida = valor;
    this.aplicarTaxa();
  }

  rotuloVelocidade(valor: number): string {
    return valor.toLocaleString('pt-BR') + 'x';
  }

  // ===== ReprodutorAudio (chamados pelo AudioService) =====

  parar(): void {
    if (this.elemento) {
      this.elemento.pause();
      this.elemento.currentTime = 0;
    }
    this.posicao.set(0);
    if (this.estado() !== 'erro') this.estado.set('parado');
  }

  pausar(): void {
    this.elemento?.pause();
    if (this.ativo()) this.estado.set('pausado');
  }

  retomar(): void {
    this.tocar();
  }

  // ===== INTERNOS =====

  private tocar(): void {
    // Depois de uma falha, recomeça do zero: o arquivo pode ter voltado.
    if (!this.elemento || this.estado() === 'erro') {
      this.descartarElemento();
      this.criarElemento('auto');
    }
    const elemento = this.elemento!;
    this.aplicarTaxa();
    this.audioService.iniciar(this);
    this.estado.set('carregando');
    elemento.play().catch((erro: unknown) => {
      // Pausado antes de começar (outro áudio, modal ou novo clique): não é falha.
      if (erro instanceof DOMException && erro.name === 'AbortError') return;
      this.falhar(true);
    });
  }

  private falhar(avisar: boolean): void {
    if (this.estado() === 'erro') return;
    this.estado.set('erro');
    this.audioService.encerrar(this);
    if (avisar) this.soundService.tocar('erro');
  }

  private aplicarTaxa(): void {
    if (!this.elemento) return;
    // `defaultPlaybackRate` sobrevive a recarregamentos do elemento.
    this.elemento.defaultPlaybackRate = this.taxa();
    this.elemento.playbackRate = this.taxa();
  }

  private criarElemento(preload: 'metadata' | 'auto'): void {
    const elemento = new Audio();
    elemento.preload = preload;
    const ouvintes = new AbortController();
    const opcoes = { signal: ouvintes.signal };

    const atualizarDuracao = () =>
      this.duracao.set(Number.isFinite(elemento.duration) ? elemento.duration : 0);

    elemento.addEventListener('loadedmetadata', atualizarDuracao, opcoes);
    elemento.addEventListener('durationchange', atualizarDuracao, opcoes);
    elemento.addEventListener('timeupdate', () => this.posicao.set(elemento.currentTime), opcoes);
    elemento.addEventListener('playing', () => this.estado.set('tocando'), opcoes);
    elemento.addEventListener('waiting', () => {
      if (this.estado() === 'tocando') this.estado.set('carregando');
    }, opcoes);
    // Pausa que não partiu do player (ex.: o sistema tomou o áudio no celular).
    // No fim do áudio o navegador também dispara `pause`, antes de `ended`.
    elemento.addEventListener('pause', () => {
      if (this.ativo() && !elemento.ended) {
        this.estado.set('pausado');
        this.audioService.encerrar(this);
      }
    }, opcoes);
    elemento.addEventListener('ended', () => {
      this.estado.set('parado');
      this.posicao.set(0);
      this.audioService.encerrar(this);
    }, opcoes);
    // Só avisa com som quando a falha interrompe um play pedido pelo usuário;
    // na leitura antecipada dos metadados (barra), o ícone basta.
    elemento.addEventListener('error', () => this.falhar(this.ativo()), opcoes);

    elemento.src = this.src!;
    this.elemento = elemento;
    this.ouvintes = ouvintes;
    this.aplicarTaxa();
  }

  private descartarElemento(): void {
    this.audioService.remover(this);
    if (!this.elemento) return;
    this.ouvintes?.abort();
    this.elemento.pause();
    this.elemento.removeAttribute('src');
    this.elemento.load();
    this.elemento = null;
    this.ouvintes = null;
  }
}
