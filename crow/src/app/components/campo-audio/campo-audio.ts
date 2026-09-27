import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerAudio } from '../player-audio/player-audio';
import {
  ACCEPT_AUDIO,
  AudioService,
  FORMATOS_AUDIO_TEXTO,
  formatarDuracao
} from '../../services/audio.service';
import { SoundService } from '../../services/sound.service';

/**
 * Áudio opcional de um campo da frase, usado ao lado do rótulo nos
 * formulários de cadastro e edição. Mostra "+ Áudio" quando vazio e, com
 * áudio, o botão de ouvir, a duração e o remover.
 *
 * O valor é a URL do áudio (`[(audio)]`): o caminho já salvo ou a URL `blob:`
 * de um arquivo escolhido agora — o envio acontece ao salvar a frase, pelo
 * AudioService, como as imagens. O componente descarta o arquivo local que
 * ele mesmo substitui ou remove; o formulário descarta o restante ao sair.
 */
@Component({
  selector: 'app-campo-audio',
  standalone: true,
  imports: [CommonModule, PlayerAudio],
  templateUrl: './campo-audio.html',
  styleUrl: './campo-audio.css',
})
export class CampoAudio implements OnChanges {

  @Input() audio: string | null | undefined = null;
  @Output() audioChange = new EventEmitter<string | null>();

  /** Complemento dos rótulos acessíveis: "da palavra 1", "da pergunta"... */
  @Input() rotulo = '';

  readonly accept = ACCEPT_AUDIO;
  readonly dica = `Adicionar áudio (opcional) — ${FORMATOS_AUDIO_TEXTO}, até 5 MB`;

  readonly verificando = signal(false);
  readonly erro = signal('');
  private readonly duracao = signal<number | null>(null);

  readonly duracaoTexto = computed(() => {
    const segundos = this.duracao();
    return segundos !== null && Number.isFinite(segundos) ? formatarDuracao(segundos) : 'Áudio';
  });

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
    const resultado = await this.audioService.prepararArquivo(arquivo);
    this.verificando.set(false);

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

  remover(evento: Event): void {
    evento.stopPropagation();
    const anterior = this.audio;
    this.audio = null;
    this.erro.set('');
    this.audioChange.emit(null);
    this.audioService.descartar(anterior);
  }
}
