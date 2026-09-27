import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';
import { PalavraTrad, Par } from '../../models/frase.model';
import { OrigemIdioma, normalizarOrigem } from '../../models/idioma.model';
import { RespostasAceitas, respostasAceitasValidas } from '../../components/respostas-aceitas/respostas-aceitas';
import { CampoAudio } from '../../components/campo-audio/campo-audio';
import { FraseService } from '../../services/frase.service';
import { UploadService } from '../../services/upload.service';
import { AudioService } from '../../services/audio.service';
import { SoundService } from '../../services/sound.service';
import { forkJoin, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-cadastrar-frase',
  standalone: true,
  imports: [CommonModule, FormsModule, RespostasAceitas, CampoAudio],
  templateUrl: './cadastrar-frase.html',
  styleUrl: './cadastrar-frase.css',
})
export class CadastrarFrase implements OnDestroy {

  // Controle do modal de cancelamento
  mostrarModalCancelar = false;

  // Modo da Frase
  modoFrase: 'traducao' | 'pares' | 'quiz' | null = null;

  // Tradução Direta
  imagemPreview: string | null = null;
  imagemFile: File | null = null;
  traducaoCompleta = '';
  audioTraducaoCompleta: string | null = null;
  palavrasTraducao: PalavraTrad[] = [{ palavra: '', traducao: '' }];
  /** Respostas/ordens alternativas aceitas como corretas (Fase 5). */
  traducoesAlternativas: string[] = [];
  observacoes = '';
  links: string[] = [''];

  // Selecionar Pares
  pares: Par[] = [
    { palavra: '', traducao: '' },
    { palavra: '', traducao: '' },
    { palavra: '', traducao: '' }
  ];

  // Quiz
  tipoMidiaQuiz: 'imagem' | 'video' | null = null;
  imagemQuiz: string | null = null;
  imagemQuizFile: File | null = null;
  videoQuiz = '';
  videoQuizEmbed: SafeResourceUrl | null = null;
  perguntaQuiz = '';
  audioPergunta: string | null = null;
  alternativas: string[] = ['', ''];
  /** Áudio de cada alternativa, sempre com o mesmo tamanho de `alternativas`. */
  audiosAlternativas: (string | null)[] = [null, null];
  respostaCorreta: number = 0;

  moduloId = '';
  idIdioma = '';
  /** Origem da cadeia de navegação, repassada ao módulo para o Voltar de lá continuar correto. */
  origem: OrigemIdioma = 'home';
  salvando = false;
  erroSalvar = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private fraseService: FraseService,
    private uploadService: UploadService,
    private audioService: AudioService,
    private soundService: SoundService
  ) {
    this.moduloId = this.route.snapshot.queryParamMap.get('moduloId') || '';
    this.idIdioma = this.route.snapshot.queryParamMap.get('idIdioma') || '';
    this.origem = normalizarOrigem(this.route.snapshot.queryParamMap.get('origem'));
  }

  /** Libera os áudios escolhidos e não salvos, qualquer que seja a saída da página. */
  ngOnDestroy(): void {
    this.audioService.descartarTodos(this.audiosDoFormulario());
  }

  /**
   * Áudios do formulário. Com `apenasModoAtual`, só os do modo escolhido — os
   * que vão para o backend; sem ele, os de todos os modos, para descarte.
   */
  private audiosDoFormulario(apenasModoAtual = false): (string | null | undefined)[] {
    const traducao = [
      this.audioTraducaoCompleta,
      ...this.palavrasTraducao.flatMap(p => [p.audioPalavra, p.audioTraducao])
    ];
    const pares = this.pares.flatMap(p => [p.audioPalavra, p.audioTraducao]);
    const quiz = [this.audioPergunta, ...this.audiosAlternativas];

    if (!apenasModoAtual) return [...traducao, ...pares, ...quiz];
    if (this.modoFrase === 'traducao') return traducao;
    if (this.modoFrase === 'pares') return pares;
    if (this.modoFrase === 'quiz') return quiz;
    return [];
  }

  getLetraAlternativa(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /** Ordem principal aceita pelo jogo: as traduções das palavras em sequência. */
  get traducaoPrincipal(): string {
    return this.palavrasTraducao.map(p => p.traducao.trim()).filter(t => t).join(' ');
  }

  podeFinalizar(): boolean {
    if (!this.modoFrase) return false;

    if (this.modoFrase === 'traducao') {
      const palavrasValidas = this.palavrasTraducao.every(p => p.palavra.trim() && p.traducao.trim());
      const alternativasValidas = respostasAceitasValidas(this.traducoesAlternativas, this.traducaoPrincipal);
      return !!(this.traducaoCompleta.trim() && palavrasValidas && alternativasValidas);
    }

    if (this.modoFrase === 'pares') {
      return this.pares.every(p => p.palavra.trim() && p.traducao.trim());
    }

    if (this.modoFrase === 'quiz') {
      const alternativasValidas = this.alternativas.every(a => a.trim());
      return !!(this.perguntaQuiz.trim() && alternativasValidas && this.respostaCorreta !== null);
    }

    return false;
  }

  // TRADUÇÃO DIRETA
  adicionarPalavra(): void {
    this.palavrasTraducao.push({ palavra: '', traducao: '' });
  }

  removerPalavra(index: number): void {
    const [removida] = this.palavrasTraducao.splice(index, 1);
    this.audioService.descartarTodos([removida?.audioPalavra, removida?.audioTraducao]);
  }

  adicionarLink(): void {
    if (this.links.length < 3) {
      this.links.push('');
    }
  }

  removerLink(index: number): void {
    this.links.splice(index, 1);
  }

  onImagemSelecionada(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.revogarBlob(this.imagemPreview);
    this.imagemFile = file;
    this.imagemPreview = URL.createObjectURL(file);
  }

  removerImagem(event: Event): void {
    event.stopPropagation();
    this.revogarBlob(this.imagemPreview);
    this.imagemPreview = null;
    this.imagemFile = null;
  }

  private revogarBlob(url: string | null | undefined): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  // SELECIONAR PARES
  adicionarPar(): void {
    if (this.pares.length < 10) {
      this.pares.push({ palavra: '', traducao: '' });
    }
  }

  removerPar(index: number): void {
    if (this.pares.length > 3) {
      const [removido] = this.pares.splice(index, 1);
      this.audioService.descartarTodos([removido?.audioPalavra, removido?.audioTraducao]);
    }
  }

  onParImagemSelecionada(event: any, index: number): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.revogarBlob(this.pares[index].imagem);
    this.pares[index].imagemFile = file;
    this.pares[index].imagem = URL.createObjectURL(file);
  }

  removerImagemPar(event: Event, index: number): void {
    event.stopPropagation();
    this.revogarBlob(this.pares[index].imagem);
    this.pares[index].imagem = undefined;
    this.pares[index].imagemFile = undefined;
  }

  // QUIZ
  adicionarAlternativa(): void {
    if (this.alternativas.length < 5) {
      this.alternativas.push('');
      this.audiosAlternativas.push(null);
    }
  }

  removerAlternativa(index: number): void {
    if (this.alternativas.length > 2) {
      this.alternativas.splice(index, 1);
      const [audioRemovido] = this.audiosAlternativas.splice(index, 1);
      this.audioService.descartar(audioRemovido);
      if (this.respostaCorreta === index) {
        this.respostaCorreta = 0;
      } else if (this.respostaCorreta > index) {
        this.respostaCorreta--;
      }
    }
  }

  marcarRespostaCorreta(index: number): void {
    this.respostaCorreta = index;
  }

  trackByIndex(index: number): number {
    return index;
  }

  onQuizImagemSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.revogarBlob(this.imagemQuiz);
    this.imagemQuizFile = file;
    this.imagemQuiz = URL.createObjectURL(file);
  }

  removerImagemQuiz(event: Event): void {
    event.stopPropagation();
    this.revogarBlob(this.imagemQuiz);
    this.imagemQuiz = null;
    this.imagemQuizFile = null;
  }

  onVideoQuizChange(url: string): void {
    if (!url || !url.trim()) {
      this.videoQuizEmbed = null;
      return;
    }

    let embedUrl = '';

    if (url.includes('youtube.com/embed/')) {
      embedUrl = url;
    } else if (url.includes('youtube.com/watch')) {
      const videoIdMatch = url.match(/[?&]v=([^&]+)/);
      if (videoIdMatch && videoIdMatch[1]) {
        embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
      }
    } else if (url.includes('youtu.be/')) {
      const videoIdMatch = url.match(/youtu\.be\/([^?]+)/);
      if (videoIdMatch && videoIdMatch[1]) {
        const params = url.includes('?') ? url.substring(url.indexOf('?')) : '';
        embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}${params}`;
      }
    }

    if (!embedUrl) {
      this.videoQuizEmbed = null;
      return;
    }

    this.videoQuizEmbed = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  // MODAL DE CANCELAMENTO
  cancelar(): void {
    this.mostrarModalCancelar = true;
    this.soundService.tocar('alerta');
  }

  fecharModalCancelar(): void {
    this.mostrarModalCancelar = false;
  }

  confirmarCancelamento(): void {
    this.mostrarModalCancelar = false;
    this.voltar();
  }

  voltar(): void {
    if (this.moduloId) {
      this.router.navigate(['/visualizar-modulo'], {
        queryParams: { id: this.moduloId, idIdioma: this.idIdioma, origem: this.origem }
      });
    } else {
      this.router.navigate(['/visualizar-modulo']);
    }
  }

  finalizar(): void {
    if (this.salvando) return;
    if (!this.moduloId) {
      this.erroSalvar = 'ID do módulo não encontrado.';
      this.soundService.tocar('erro');
      return;
    }

    this.salvando = true;
    this.erroSalvar = '';

    forkJoin([
      this.uploadImagensPendentes(),
      this.audioService.enviarPendentes(this.audiosDoFormulario(true))
    ]).subscribe({
      next: () => this.enviarFrase(),
      error: (err) => this.tratarErro(err, 'Erro ao enviar imagens ou áudios.')
    });
  }

  private uploadImagensPendentes(): Observable<any> {
    const uploads: Observable<any>[] = [];

    if (this.modoFrase === 'traducao' && this.imagemFile) {
      uploads.push(
        this.uploadService.uploadImagem(this.imagemFile).pipe(
          tap(res => { this.imagemPreview = res.path; this.imagemFile = null; })
        )
      );
    }

    if (this.modoFrase === 'pares') {
      this.pares.forEach((par, i) => {
        if (par.imagemFile) {
          uploads.push(
            this.uploadService.uploadImagem(par.imagemFile).pipe(
              tap(res => {
                this.pares[i].imagem = res.path;
                this.pares[i].imagemFile = undefined;
              })
            )
          );
        }
      });
    }

    if (this.modoFrase === 'quiz' && this.tipoMidiaQuiz === 'imagem' && this.imagemQuizFile) {
      uploads.push(
        this.uploadService.uploadImagem(this.imagemQuizFile).pipe(
          tap(res => { this.imagemQuiz = res.path; this.imagemQuizFile = null; })
        )
      );
    }

    return uploads.length ? forkJoin(uploads) : of(null);
  }

  private enviarFrase(): void {
    const dados = { modo: this.modoFrase, ...this.getDadosFrase() };

    this.fraseService.criarFrase(this.moduloId, dados).subscribe({
      next: () => {
        this.salvando = false;
        this.soundService.tocar('sucesso');
        this.voltar();
      },
      error: (err) => this.tratarErro(err, 'Erro ao cadastrar frase.')
    });
  }

  private tratarErro(err: any, fallback: string): void {
    this.salvando = false;
    this.erroSalvar = err?.error?.message || fallback;
    this.soundService.tocar('erro');
    // App zoneless: força a renderização da mensagem de erro.
    this.cdr.detectChanges();
  }

  /** Corpo da requisição. Os áudios já foram enviados em `finalizar()`. */
  getDadosFrase(): any {
    const audio = (url: string | null | undefined) => this.audioService.paraSalvar(url);

    if (this.modoFrase === 'traducao') {
      return {
        imagem: this.imagemPreview,
        traducaoCompleta: this.traducaoCompleta,
        audioTraducaoCompleta: audio(this.audioTraducaoCompleta),
        traducoesAlternativasJson: JSON.stringify(this.traducoesAlternativas.map(t => t.trim()).filter(t => t)),
        palavrasJson: JSON.stringify(this.palavrasTraducao.map(p => ({
          palavra: p.palavra,
          traducao: p.traducao,
          audioPalavra: audio(p.audioPalavra),
          audioTraducao: audio(p.audioTraducao)
        }))),
        observacoes: this.observacoes,
        linksJson: JSON.stringify(this.links.filter(l => l.trim()))
      };
    }
    if (this.modoFrase === 'pares') {
      const paresLimpos = this.pares.map(p => ({
        imagem: p.imagem,
        palavra: p.palavra,
        traducao: p.traducao,
        audioPalavra: audio(p.audioPalavra),
        audioTraducao: audio(p.audioTraducao)
      }));
      return { paresJson: JSON.stringify(paresLimpos) };
    }
    if (this.modoFrase === 'quiz') {
      return {
        imagemQuiz: this.tipoMidiaQuiz === 'imagem' ? this.imagemQuiz : null,
        videoQuiz: this.tipoMidiaQuiz === 'video' ? this.videoQuiz : null,
        pergunta: this.perguntaQuiz,
        audioPergunta: audio(this.audioPergunta),
        alternativasJson: JSON.stringify(this.alternativas),
        audiosAlternativasJson: JSON.stringify(this.audiosAlternativas.map(audio)),
        respostaCorreta: this.respostaCorreta
      };
    }
    return null;
  }
}