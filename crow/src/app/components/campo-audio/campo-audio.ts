import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerAudio } from '../player-audio/player-audio';
import {
  ACCEPT_AUDIO,
  AudioService,
  FORMATOS_AUDIO_TEXTO,
  LIMITE_GRAVACAO_SEGUNDOS,
  TIPOS_GRAVACAO,
  formatarDuracao,
  podeGravarAudio
} from '../../services/audio.service';
import { SoundService } from '../../services/sound.service';

/**
 * Áudio opcional de um campo da frase, usado ao lado do rótulo nos
 * formulários de cadastro e edição. Vazio, oferece "Áudio" (arquivo) e
 * "Gravar" (microfone, até 2 minutos); gravando, mostra o tempo e "Parar"; com
 * áudio, o botão de ouvir, a duração e o remover.
 *
 * O valor é a URL do áudio (`[(audio)]`): o caminho já salvo ou a URL `blob:`
 * de um arquivo escolhido ou gravado agora — o envio acontece ao salvar a
 * frase, pelo AudioService, como as imagens. O componente descarta o arquivo
 * local que ele mesmo substitui ou remove; o formulário descarta o restante ao
 * sair.
 */
@Component({
  selector: 'app-campo-audio',
  standalone: true,
  imports: [CommonModule, PlayerAudio],
  templateUrl: './campo-audio.html',
  styleUrl: './campo-audio.css',
})
export class CampoAudio implements OnChanges, OnDestroy {

  @Input() audio: string | null | undefined = null;
  @Output() audioChange = new EventEmitter<string | null>();

  /** Complemento dos rótulos acessíveis: "da palavra 1", "da pergunta"... */
  @Input() rotulo = '';

  readonly accept = ACCEPT_AUDIO;
  readonly dica = `Adicionar arquivo de áudio (opcional) — ${FORMATOS_AUDIO_TEXTO}, até 5 MB`;
  readonly dicaGravar = `Gravar áudio pelo microfone (opcional) — até ${LIMITE_GRAVACAO_SEGUNDOS / 60} minutos`;
  readonly podeGravar = podeGravarAudio();

  readonly verificando = signal(false);
  readonly erro = signal('');
  readonly gravando = signal(false);
  /** Esperando o navegador liberar o microfone (pode haver um pedido de permissão aberto). */
  readonly abrindoMicrofone = signal(false);
  private readonly tempoGravacao = signal(0);
  private readonly duracao = signal<number | null>(null);

  readonly tempoGravacaoTexto = computed(() => formatarDuracao(this.tempoGravacao()));

  readonly duracaoTexto = computed(() => {
    const segundos = this.duracao();
    return segundos !== null && Number.isFinite(segundos) ? formatarDuracao(segundos) : 'Áudio';
  });

  private gravador: MediaRecorder | null = null;
  private microfone: MediaStream | null = null;
  private cronometro: ReturnType<typeof setInterval> | null = null;
  /** Saiu da tela gravando: o que foi gravado é jogado fora. */
  private destruido = false;

  /** O "Parar" recebe o foco ao aparecer, para quem grava pelo teclado. */
  @ViewChild('btnParar') set btnParar(botao: ElementRef<HTMLButtonElement> | undefined) {
    botao?.nativeElement.focus();
  }

  constructor(
    private audioService: AudioService,
    private soundService: SoundService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['audio']) return;
    this.duracao.set(null);
    const atual = this.audio;
    if (!atual) return;
    this.audioService.lerDuracao(atual)
      .then(segundos => { if (this.audio === atual) this.duracao.set(segundos); })
      .catch(() => { /* sem duração: mostra "Áudio" */ });
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.encerrarGravacao();
  }

  escolher(seletor: HTMLInputElement, evento: Event): void {
    evento.stopPropagation();
    this.erro.set('');
    seletor.click();
  }

  async aoSelecionar(evento: Event): Promise<void> {
    const seletor = evento.target as HTMLInputElement;
    const arquivo = seletor.files?.[0];
    // Limpa para que escolher o mesmo arquivo de novo dispare `change`.
    seletor.value = '';
    if (!arquivo) return;

    this.verificando.set(true);
    this.erro.set('');
    this.aceitar(await this.audioService.prepararArquivo(arquivo));
  }

  async gravar(evento: Event): Promise<void> {
    evento.stopPropagation();
    if (this.gravando() || this.abrindoMicrofone() || this.verificando()) return;
    this.erro.set('');

    let microfone: MediaStream | null = null;
    try {
      this.abrindoMicrofone.set(true);
      try {
        microfone = await navigator.mediaDevices.getUserMedia({ audio: true });
      } finally {
        this.abrindoMicrofone.set(false);
      }
      if (this.destruido) {
        microfone.getTracks().forEach(trilha => trilha.stop());
        return;
      }
      const tipo = TIPOS_GRAVACAO.find(candidato => MediaRecorder.isTypeSupported(candidato));
      const gravador = new MediaRecorder(microfone, tipo ? { mimeType: tipo, audioBitsPerSecond: 64_000 } : undefined);
      const partes: Blob[] = [];
      const inicio = Date.now();

      gravador.ondataavailable = e => {
        if (e.data.size > 0) partes.push(e.data);
      };
      gravador.onstop = () => {
        const segundos = (Date.now() - inicio) / 1000;
        this.encerrarGravacao();
        if (this.destruido) return;
        const gravacao = new Blob(partes, { type: gravador.mimeType || tipo || 'audio/webm' });
        if (gravacao.size === 0) return;
        this.verificando.set(true);
        this.audioService.prepararGravacao(gravacao, segundos).then(resultado => this.aceitar(resultado));
      };

      // Um áudio tocando agora acabaria na gravação.
      this.audioService.pararTudo();
      this.microfone = microfone;
      this.gravador = gravador;
      this.tempoGravacao.set(0);
      gravador.start(250);
      this.gravando.set(true);
      this.cronometro = setInterval(() => {
        const segundos = (Date.now() - inicio) / 1000;
        this.tempoGravacao.set(segundos);
        if (segundos >= LIMITE_GRAVACAO_SEGUNDOS) this.pararGravacao();
      }, 250);
    } catch {
      microfone?.getTracks().forEach(trilha => trilha.stop());
      this.microfone = null;
      this.gravador = null;
      this.erro.set('Não foi possível acessar o microfone. Verifique a permissão do navegador.');
      this.soundService.tocar('erro');
    }
  }

  pararGravacao(evento?: Event): void {
    evento?.stopPropagation();
    if (this.gravador?.state === 'recording') this.gravador.stop();
  }

  remover(evento: Event): void {
    evento.stopPropagation();
    const anterior = this.audio;
    this.audio = null;
    this.erro.set('');
    this.audioChange.emit(null);
    this.audioService.descartar(anterior);
  }

  /** Arquivo escolhido ou gravado, já conferido pelo AudioService. */
  private aceitar(resultado: { url: string } | { erro: string }): void {
    this.verificando.set(false);
    if (this.destruido) {
      if ('url' in resultado) this.audioService.descartar(resultado.url);
      return;
    }
    if ('erro' in resultado) {
      this.erro.set(resultado.erro);
      this.soundService.tocar('erro');
      return;
    }
    const anterior = this.audio;
    this.audio = resultado.url;
    this.audioChange.emit(resultado.url);
    this.audioService.descartar(anterior);
  }

  /** Para o cronômetro e solta o microfone (o indicador de gravação do navegador apaga). */
  private encerrarGravacao(): void {
    if (this.cronometro !== null) {
      clearInterval(this.cronometro);
      this.cronometro = null;
    }
    if (this.gravador?.state === 'recording') this.gravador.stop();
    this.gravador = null;
    this.microfone?.getTracks().forEach(trilha => trilha.stop());
    this.microfone = null;
    this.gravando.set(false);
  }
}
