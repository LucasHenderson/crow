import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';

interface IdiomaOpcao {
  nome: string;
  bandeira: string;
}

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
  selector: 'app-cadastrar-idioma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastrar-idioma.html',
  styleUrl: './cadastrar-idioma.css',
})
export class CadastrarIdioma {
  
  etapaAtual = 1;

  // ETAPA 1: Dados do Idioma
  idiomaSelecionado: IdiomaOpcao | null = null;
  proficiencia = '';
  visibilidade: 'publico' | 'privado' = 'publico';
  mostrarIdiomas = false;
  mostrarProficiencia = false;
  buscaIdioma = '';

  // ETAPA 2: Módulo
  iconeModuloSelecionado: SafeHtml | null = null;
  nomeModulo = '';

  // ETAPA 3: Frase
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

  idiomas: IdiomaOpcao[] = [
    { nome: 'Alemão', bandeira: 'assets/imgs/Germany-Flag.svg.png' },
    { nome: 'Árabe', bandeira: 'assets/imgs/United-Arab-Emirates-Flag.svg.png' },
    { nome: 'Chinês (Mandarim)', bandeira: 'assets/imgs/China-Flag.svg' },
    { nome: 'Coreano', bandeira: 'assets/imgs/South-Korea-Flag.svg.webp' },
    { nome: 'Espanhol', bandeira: 'assets/imgs/Spain-Flag.svg' },
    { nome: 'Francês', bandeira: 'assets/imgs/France-Flag.png' },
    { nome: 'Inglês (Estados Unidos)', bandeira: 'assets/imgs/United-States-Flag.svg' },
    { nome: 'Inglês (Reino Unido)', bandeira: 'assets/imgs/United-Kingdom-Flag.svg.png' },
    { nome: 'Italiano', bandeira: 'assets/imgs/Italy-Flag.svg' },
    { nome: 'Japonês', bandeira: 'assets/imgs/Japan-Flag.png' },
    { nome: 'Português (Brasil)', bandeira: 'assets/imgs/Brazil-Flag.svg' },
    { nome: 'Português (Portugal)', bandeira: 'assets/imgs/Portugal-Flag.svg.png' },
    { nome: 'Russo', bandeira: 'assets/imgs/Russia-Flag.svg' }
  ].sort((a, b) => a.nome.localeCompare(b.nome));

  proficiencias = ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Fluente'];

  iconesModulo: SafeHtml[] = [];

  constructor(private router: Router, private sanitizer: DomSanitizer,  private cdr: ChangeDetectorRef) {
    this.carregarIcones();
  }

  carregarIcones(): void {
    const iconesSVG = [
      '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
      '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
      '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
      '<rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>',
      '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
      '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
      '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
      '<path d="M12 2L2 7l10 5 10-5-10-5z"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
      '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
      '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
      '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
      '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
      '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
      '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
      '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
      '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
      '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
      '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
      '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'
    ];

    this.iconesModulo = iconesSVG.map(svg => this.sanitizer.bypassSecurityTrustHtml(svg));
  }

  @HostListener('document:click', ['$event'])
  fecharDropdowns(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.campo')) {
      this.mostrarIdiomas = false;
      this.mostrarProficiencia = false;
    }
  }

  get idiomasFiltrados(): IdiomaOpcao[] {
    if (!this.buscaIdioma.trim()) return this.idiomas;
    const termo = this.buscaIdioma.toLowerCase();
    return this.idiomas.filter(i => i.nome.toLowerCase().includes(termo));
  }

  toggleIdiomas(): void {
    this.mostrarIdiomas = !this.mostrarIdiomas;
    this.mostrarProficiencia = false;
  }

  toggleProficiencia(): void {
    this.mostrarProficiencia = !this.mostrarProficiencia;
    this.mostrarIdiomas = false;
  }

  selecionarIdioma(idioma: IdiomaOpcao): void {
    this.idiomaSelecionado = idioma;
    this.mostrarIdiomas = false;
    this.buscaIdioma = '';
  }

  selecionarProficiencia(nivel: string): void {
    this.proficiencia = nivel;
    this.mostrarProficiencia = false;
  }

  podeAvancarEtapa1(): boolean {
    return !!(this.idiomaSelecionado && this.proficiencia && this.visibilidade);
  }

  getLetraAlternativa(index: number): string {
    return String.fromCharCode(65 + index);
  }

  podeAvancarEtapa2(): boolean {
    return !!(this.iconeModuloSelecionado && this.nomeModulo.trim());
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
      return !!(this.perguntaQuiz.trim() && alternativasValidas);
    }

    return false;
  }

  avancarEtapa(): void {
    if (this.etapaAtual < 3) {
      this.etapaAtual++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  voltarEtapa(): void {
    if (this.etapaAtual > 1) {
      this.etapaAtual--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
    this.cdr.detectChanges(); // 👈 atualização imediata
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

    // 🔥 FORÇA atualização imediata da tela
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
    }
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

  // 1️⃣ Já é link embed → usa direto
  if (url.includes('youtube.com/embed/')) {
    embedUrl = url;
  }

  // 2️⃣ Link padrão: youtube.com/watch?v=
  else if (url.includes('youtube.com/watch')) {
    const videoIdMatch = url.match(/[?&]v=([^&]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
  }

  // 3️⃣ Link curto: youtu.be/
  else if (url.includes('youtu.be/')) {
    const videoIdMatch = url.match(/youtu\.be\/([^?]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      const params = url.includes('?') ? url.substring(url.indexOf('?')) : '';
      embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}${params}`;
    }
  }

  // Se não conseguiu converter, invalida
  if (!embedUrl) {
    this.videoQuizEmbed = null;
    return;
  }

  // Sanitiza para uso no iframe
  this.videoQuizEmbed =
    this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
}


  cancelar(): void {
    if (confirm('Deseja realmente cancelar? Todos os dados serão perdidos.')) {
      this.router.navigate(['/buscar-idioma']);
    }
  }

  finalizar(): void {
    const cadastro = {
      etapa1: {
        idioma: this.idiomaSelecionado,
        proficiencia: this.proficiencia,
        visibilidade: this.visibilidade
      },
      etapa2: {
        icone: this.iconeModuloSelecionado,
        nomeModulo: this.nomeModulo
      },
      etapa3: {
        modo: this.modoFrase,
        dados: this.getDadosFrase()
      }
    };

    console.log('Cadastro completo:', cadastro);
    localStorage.setItem('idioma-cadastrado', JSON.stringify(cadastro));
    
    alert('Idioma cadastrado com sucesso!');
    this.router.navigate(['/buscar-idioma']);
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
        alternativas: this.alternativas
      };
    }
    return null;
  }
}