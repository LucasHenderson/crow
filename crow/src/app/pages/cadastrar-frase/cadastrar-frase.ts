import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';
import { PalavraTrad, Par } from '../../models/frase.model';
import { FraseService } from '../../services/frase.service';
import { UploadService } from '../../services/upload.service';
import { forkJoin, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-cadastrar-frase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastrar-frase.html',
  styleUrl: './cadastrar-frase.css',
})
export class CadastrarFrase {
  
  // Controle do modal de cancelamento
  mostrarModalCancelar = false;

  // Modo da Frase
  modoFrase: 'traducao' | 'pares' | 'quiz' | null = null;

  // Tradução Direta
  imagemPreview: string | null = null;
  imagemFile: File | null = null;
  traducaoCompleta = '';
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
  alternativas: string[] = ['', ''];
  respostaCorreta: number = 0;

  moduloId = '';
  idIdioma = '';
  salvando = false;
  erroSalvar = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private fraseService: FraseService,
    private uploadService: UploadService
  ) {
    this.moduloId = this.route.snapshot.queryParamMap.get('moduloId') || '';
    this.idIdioma = this.route.snapshot.queryParamMap.get('idIdioma') || '';
  }

  getLetraAlternativa(index: number): string {
    return String.fromCharCode(65 + index);
  }

  podeFinalizar(): boolean {
    if (!this.modoFrase) return false;

    if (this.modoFrase === 'traducao') {
      const palavrasValidas = this.palavrasTraducao.every(p => p.palavra.trim() && p.traducao.trim());
      return !!(this.traducaoCompleta.trim() && palavrasValidas);
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
    this.palavrasTraducao.splice(index, 1);
  }

  adicionarLink(): void {
    if (this.links.length < 3) {
      this.links.push('');
    }
  }

  removerLink(index: number): void {
    this.links.splice(index, 1);
  }

  adicionarTraducaoAlt(): void {
    if (this.traducoesAlternativas.length < 5) {
      this.traducoesAlternativas.push('');
    }
  }

  removerTraducaoAlt(index: number): void {
    this.traducoesAlternativas.splice(index, 1);
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
      this.pares.splice(index, 1);
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
    }
  }

  removerAlternativa(index: number): void {
    if (this.alternativas.length > 2) {
      this.alternativas.splice(index, 1);
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
        queryParams: { id: this.moduloId, idIdioma: this.idIdioma }
      });
    } else {
      this.router.navigate(['/visualizar-modulo']);
    }
  }

  finalizar(): void {
    if (this.salvando) return;
    if (!this.moduloId) {
      this.erroSalvar = 'ID do módulo não encontrado.';
      return;
    }

    this.salvando = true;
    this.erroSalvar = '';

    this.uploadImagensPendentes().subscribe({
      next: () => this.enviarFrase(),
      error: (err) => this.tratarErro(err, 'Erro ao enviar imagens.')
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
        this.voltar();
      },
      error: (err) => this.tratarErro(err, 'Erro ao cadastrar frase.')
    });
  }

  private tratarErro(err: any, fallback: string): void {
    this.salvando = false;
    this.erroSalvar = err?.error?.message || fallback;
    // App zoneless: força a renderização da mensagem de erro.
    this.cdr.detectChanges();
  }

  getDadosFrase(): any {
    if (this.modoFrase === 'traducao') {
      return {
        imagem: this.imagemPreview,
        traducaoCompleta: this.traducaoCompleta,
        traducoesAlternativasJson: JSON.stringify(this.traducoesAlternativas.map(t => t.trim()).filter(t => t)),
        palavrasJson: JSON.stringify(this.palavrasTraducao),
        observacoes: this.observacoes,
        linksJson: JSON.stringify(this.links.filter(l => l.trim()))
      };
    }
    if (this.modoFrase === 'pares') {
      const paresLimpos = this.pares.map(p => ({
        imagem: p.imagem,
        palavra: p.palavra,
        traducao: p.traducao
      }));
      return { paresJson: JSON.stringify(paresLimpos) };
    }
    if (this.modoFrase === 'quiz') {
      return {
        imagemQuiz: this.tipoMidiaQuiz === 'imagem' ? this.imagemQuiz : null,
        videoQuiz: this.tipoMidiaQuiz === 'video' ? this.videoQuiz : null,
        pergunta: this.perguntaQuiz,
        alternativasJson: JSON.stringify(this.alternativas),
        respostaCorreta: this.respostaCorreta
      };
    }
    return null;
  }
}