import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { IdiomaOpcao, IDIOMAS_DISPONIVEIS, PROFICIENCIAS } from '../../models/idioma.model';
import { ICONES_MODULO } from '../../models/modulo.model';
import { PalavraTrad, Par } from '../../models/frase.model';
import { RespostasAceitas, respostasAceitasValidas } from '../../components/respostas-aceitas/respostas-aceitas';
import { IdiomaService } from '../../services/idioma.service';
import { ModuloService } from '../../services/modulo.service';
import { FraseService } from '../../services/frase.service';
import { UploadService } from '../../services/upload.service';
import { SoundService } from '../../services/sound.service';
import { forkJoin, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-cadastrar-idioma',
  standalone: true,
  imports: [CommonModule, FormsModule, RespostasAceitas],
  templateUrl: './cadastrar-idioma.html',
  styleUrl: './cadastrar-idioma.css',
})
export class CadastrarIdioma {
  
  etapaAtual = 1;

  // Controle do modal de cancelamento
  mostrarModalCancelar = false;
  /** Para onde ir ao confirmar: 'home' (Cancelar) ou 'anterior' (Voltar). */
  destinoCancelamento: 'home' | 'anterior' = 'home';

  // ETAPA 1: Dados do Idioma
  idiomaSelecionado: IdiomaOpcao | null = null;
  nomeIdioma = '';
  descricaoIdioma = '';
  proficiencia = '';
  visibilidade: 'publico' | 'privado' = 'publico';
  mostrarIdiomas = false;
  mostrarProficiencia = false;
  buscaIdioma = '';

  // ETAPA 2: Módulo
  iconeModuloSelecionado: SafeHtml | null = null;
  iconeModuloSvg: string | null = null;
  nomeModulo = '';

  // Estado de submissão
  salvando = false;
  erroSalvar = '';

  // ETAPA 3: Frase
  modoFrase: 'traducao' | 'pares' | 'quiz' | null = null;

  // Tradução Direta
  imagemPreview: string | null = null;
  imagemFile: File | null = null;
  traducaoCompleta = '';
  palavrasTraducao: PalavraTrad[] = [{ palavra: '', traducao: '' }];
  /** Respostas/ordens alternativas aceitas como corretas. */
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

  idiomas = IDIOMAS_DISPONIVEIS;

  proficiencias = PROFICIENCIAS;

  iconesModulo: SafeHtml[] = [];
  iconesModuloSvg: string[] = [];
  /** Tema de cada ícone, na mesma ordem de iconesModulo (dica ao passar o mouse). */
  iconesModuloNomes: string[] = [];

  constructor(
    private router: Router,
    private location: Location,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private idiomaService: IdiomaService,
    private moduloService: ModuloService,
    private fraseService: FraseService,
    private uploadService: UploadService,
    private soundService: SoundService
  ) {
    this.carregarIcones();
  }

  carregarIcones(): void {
    this.iconesModuloSvg = ICONES_MODULO.map(icone => icone.svg);
    this.iconesModuloNomes = ICONES_MODULO.map(icone => icone.nome);
    this.iconesModulo = this.iconesModuloSvg.map(svg => this.sanitizer.bypassSecurityTrustHtml(svg));
  }

  selecionarIconeModulo(icone: SafeHtml, index: number): void {
    this.iconeModuloSelecionado = icone;
    this.iconeModuloSvg = this.iconesModuloSvg[index];
  }

  private mapProficiencia(nivel: string): string {
    const mapa: { [k: string]: string } = {
      'Iniciante': 'INICIANTE',
      'Básico': 'BASICO',
      'Intermediário': 'INTERMEDIARIO',
      'Avançado': 'AVANCADO',
      'Fluente': 'FLUENTE'
    };
    return mapa[nivel] || nivel.toUpperCase();
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
    return !!(this.idiomaSelecionado && this.nomeIdioma.trim() && this.descricaoIdioma.trim() && this.proficiencia && this.visibilidade);
  }

  getLetraAlternativa(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /** Ordem principal aceita pelo jogo: as traduções das palavras em sequência. */
  get traducaoPrincipal(): string {
    return this.palavrasTraducao.map(p => p.traducao.trim()).filter(t => t).join(' ');
  }

  podeAvancarEtapa2(): boolean {
    return !!(this.iconeModuloSelecionado && this.nomeModulo.trim());
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

  // NAVEGAÇÃO / MODAL DE CANCELAMENTO
  /** True quando qualquer campo do fluxo (idioma, módulo ou frase) foi tocado. */
  temDadosPreenchidos(): boolean {
    const etapa1 = !!(this.idiomaSelecionado || this.nomeIdioma.trim() ||
      this.descricaoIdioma.trim() || this.proficiencia);
    const etapa2 = !!(this.iconeModuloSelecionado || this.nomeModulo.trim());
    const frase = !!(this.modoFrase || this.imagemPreview || this.traducaoCompleta.trim() ||
      this.observacoes.trim() || this.perguntaQuiz.trim() || this.videoQuiz.trim() ||
      this.imagemQuiz ||
      this.palavrasTraducao.some(p => p.palavra.trim() || p.traducao.trim()) ||
      this.traducoesAlternativas.some(t => t.trim()) ||
      this.links.some(l => l.trim()) ||
      this.pares.some(p => p.palavra.trim() || p.traducao.trim() || p.imagem) ||
      this.alternativas.some(a => a.trim()));

    return etapa1 || etapa2 || frase;
  }

  /** Botão Voltar do topo: sai da página, confirmando se houver dados. */
  voltar(): void {
    if (this.salvando) return;

    if (this.temDadosPreenchidos()) {
      this.destinoCancelamento = 'anterior';
      this.mostrarModalCancelar = true;
      this.soundService.tocar('alerta');
      return;
    }

    this.sairDaPagina('anterior');
  }

  cancelar(): void {
    this.destinoCancelamento = 'home';
    this.mostrarModalCancelar = true;
    this.soundService.tocar('alerta');
  }

  fecharModalCancelar(): void {
    this.mostrarModalCancelar = false;
  }

  confirmarCancelamento(): void {
    this.mostrarModalCancelar = false;
    this.sairDaPagina(this.destinoCancelamento);
  }

  private sairDaPagina(destino: 'home' | 'anterior'): void {
    if (destino === 'anterior' && window.history.length > 1) {
      this.location.back();
      return;
    }
    this.router.navigate(['/home']);
  }

  finalizar(): void {
    if (this.salvando) return;
    this.salvando = true;
    this.erroSalvar = '';

    this.uploadImagensPendentes().subscribe({
      next: () => this.criarIdiomaModuloFrase(),
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

  private criarIdiomaModuloFrase(): void {
    const dadosIdioma = {
      nome: this.nomeIdioma,
      idioma: this.idiomaSelecionado?.nome,
      bandeira: this.idiomaSelecionado?.bandeira,
      descricao: this.descricaoIdioma,
      proficiencia: this.mapProficiencia(this.proficiencia),
      visibilidade: this.visibilidade.toUpperCase()
    };

    this.idiomaService.criarIdioma(dadosIdioma).subscribe({
      next: (idiomaCriado: any) => {
        const dadosModulo = { nome: this.nomeModulo, icone: this.iconeModuloSvg || '' };
        this.moduloService.criarModulo(idiomaCriado.codigo, dadosModulo).subscribe({
          next: (moduloCriado: any) => {
            this.fraseService.criarFrase(moduloCriado.id, this.getDadosFrase()).subscribe({
              next: () => this.irParaHomeComSucesso(idiomaCriado.nome),
              error: (err) => this.tratarErro(err, 'Erro ao cadastrar frase.')
            });
          },
          error: (err) => this.tratarErro(err, 'Erro ao cadastrar módulo.')
        });
      },
      error: (err) => this.tratarErro(err, 'Erro ao cadastrar idioma.')
    });
  }

  private irParaHomeComSucesso(nomeIdioma: string): void {
    this.salvando = false;
    this.soundService.tocar('sucesso');
    this.router.navigate(['/home'], {
      state: { mensagemSucesso: `Idioma "${nomeIdioma}" cadastrado com sucesso!` }
    });
  }

  private tratarErro(err: any, fallback: string): void {
    this.salvando = false;
    this.erroSalvar = err?.error?.message || fallback;
    this.soundService.tocar('erro');
    // App zoneless: força a renderização da mensagem de erro.
    this.cdr.detectChanges();
  }

  getDadosFrase(): any {
    const base: any = { modo: (this.modoFrase || '').toUpperCase() };

    if (this.modoFrase === 'traducao') {
      return {
        ...base,
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
      return {
        ...base,
        paresJson: JSON.stringify(paresLimpos)
      };
    }
    if (this.modoFrase === 'quiz') {
      return {
        ...base,
        imagemQuiz: this.imagemQuiz,
        videoQuiz: this.videoQuiz,
        pergunta: this.perguntaQuiz,
        alternativasJson: JSON.stringify(this.alternativas),
        respostaCorreta: this.respostaCorreta
      };
    }
    return base;
  }
}