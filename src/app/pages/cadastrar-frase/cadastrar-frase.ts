import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';

interface PalavraTrad {
  palavra: string;
  traducao: string;
}

interface Par {
  imagem?: string;
  palavra: string;
  traducao: string;
}

@Component({
  selector: 'app-cadastrar-frase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastrar-frase.html',
  styleUrl: './cadastrar-frase.css',
})
export class CadastrarFrase {
  
  // Modo da Frase
  modoFrase: 'traducao' | 'pares' | 'quiz' | null = null;

  // Tradução Direta
  imagemPreview: string | null = null;
  traducaoCompleta = '';
  palavrasTraducao: PalavraTrad[] = [{ palavra: '', traducao: '' }];
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
  videoQuiz = '';
  videoQuizEmbed: SafeResourceUrl | null = null;
  perguntaQuiz = '';
  alternativas: string[] = ['', ''];
  respostaCorreta: number = 0; // Alternativa A marcada por padrão

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

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

  onImagemSelecionada(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagemPreview = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removerImagem(event: Event): void {
    event.stopPropagation();
    this.imagemPreview = null;
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

    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.pares[index].imagem = e.target.result;
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  }

  removerImagemPar(event: Event, index: number): void {
    event.stopPropagation();
    this.pares[index].imagem = undefined;
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
      // Se remover a alternativa marcada como correta, marca a primeira (índice 0)
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
    const reader = new FileReader();

    reader.onload = () => {
      this.imagemQuiz = reader.result as string;
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  }

  removerImagemQuiz(event: Event): void {
    event.stopPropagation();
    this.imagemQuiz = null;
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

  cancelar(): void {
    if (confirm('Deseja realmente cancelar? Todos os dados serão perdidos.')) {
      this.voltar();
    }
  }

  voltar(): void {
   this.router.navigate(['/visualizar-modulo']);
  }

  finalizar(): void {
    const frase = {
      modo: this.modoFrase,
      dados: this.getDadosFrase()
    };

    console.log('Frase cadastrada:', frase);
    localStorage.setItem('frase-cadastrada', JSON.stringify(frase));
    
    alert('Frase cadastrada com sucesso!');
    this.voltar();
  }

  getDadosFrase(): any {
    if (this.modoFrase === 'traducao') {
      return {
        imagem: this.imagemPreview,
        traducaoCompleta: this.traducaoCompleta,
        palavras: this.palavrasTraducao,
        observacoes: this.observacoes,
        links: this.links.filter(l => l.trim())
      };
    }
    if (this.modoFrase === 'pares') {
      return { pares: this.pares };
    }
    if (this.modoFrase === 'quiz') {
      return {
        tipoMidia: this.tipoMidiaQuiz,
        imagem: this.imagemQuiz,
        video: this.videoQuiz,
        pergunta: this.perguntaQuiz,
        alternativas: this.alternativas,
        respostaCorreta: this.respostaCorreta
      };
    }
    return null;
  }
}