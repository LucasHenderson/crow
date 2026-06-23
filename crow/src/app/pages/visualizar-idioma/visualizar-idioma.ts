import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Modulo } from '../../models/modulo.model';
import { IdiomaUsuario } from '../../models/idioma.model';
import { PalavraTrad, Par } from '../../models/frase.model';
import { IdiomaService } from '../../services/idioma.service';
import { ModuloService } from '../../services/modulo.service';
import { FraseService } from '../../services/frase.service';
import { UploadService } from '../../services/upload.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-visualizar-idioma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visualizar-idioma.html',
  styleUrl: './visualizar-idioma.css',
})
export class VisualizarIdioma implements OnInit {
  idiomaNome = '';
  descricao = '';
  idIdioma = '';
  codigoIdioma = '';
  idUsuarioCriador: number = 0;
  codigoCriador = '';
  isProprietario = false;
  carregando = true;
  avaliacao = 4.3;
  totalAvaliacoes = 2134;
  
  // Controle dos modais
  mostrarModalDenuncia = false;
  mostrarModalAvaliacao = false;
  mostrarModalImportacao = false;
  mostrarModalEditarModulo = false;
  mostrarModalExcluirModulo = false;
  mostrarModalAdicionarModulo = false;
  mostrarModalAlertaMinimoModulos = false;
  mostrarModalOrdem = false;
  /** Última ordem escolhida na sessão (pré-seleciona no modal). */
  ordemPreferida: 'aleatoria' | 'cadastro' = 'aleatoria';
  mostrarMensagemSucesso = false;
  mensagemSucesso = '';

  // Dados de adição de módulo
  etapaAdicao: 1 | 2 = 1;
  nomeModuloAdicao = '';
  iconeModuloAdicao: SafeHtml | null = null;
  iconeModuloAdicaoSvg: string | null = null;
  salvandoAdicao = false;
  erroAdicao = '';

  // Frase do novo módulo
  modoFrase: 'traducao' | 'pares' | 'quiz' | null = null;

  // Tradução Direta
  imagemPreview: string | null = null;
  imagemFile: File | null = null;
  traducaoCompleta = '';
  palavrasTraducao: PalavraTrad[] = [{ palavra: '', traducao: '' }];
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
  
  // Dados de denúncia
  denunciaImagensInapropriadas = false;
  denunciaVideosInapropriados = false;
  denunciaLinksInapropriados = false;
  denunciaFrasesInapropriadas = false;
  denunciaOutros = false;
  denunciaDescricao = '';
  
  // Dados de avaliação
  notaAvaliacao = 0;
  notaHover = 0;
  
  // Dados de importação
  idiomasUsuario: IdiomaUsuario[] = [];
  etapaImportacao: 'confirmacao' | 'exclusao' | 'sucesso' = 'confirmacao';
  
  // Dados de edição/exclusão de módulo
  moduloEmEdicao: Modulo | null = null;
  moduloEmExclusao: Modulo | null = null;
  salvandoExclusao = false;
  erroExclusao = '';
  nomeModuloEdicao = '';
  iconeModuloEdicaoSvg: string | null = null;
  salvandoEdicao = false;
  erroEdicao = '';
  
  iconesModulo: SafeHtml[] = [];
  iconesModuloSvg: string[] = [];
  
  private rawIcons = [
    `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>`,
    `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
    `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    `<rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>`,
    `<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`,
    `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>`,
    `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
    `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
    `<path d="M12 2L2 7l10 5 10-5-10-5z"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
    `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
    `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
    `<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>`,
    `<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>`,
    `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
    `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>`,
    `<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>`,
    `<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>`,
    `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>`,
    `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>`,
    `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`,
    `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>`,
    `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`
  ];

  modulos: Modulo[] = [];
  private nextId = 1;

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private idiomaService: IdiomaService,
    private moduloService: ModuloService,
    private fraseService: FraseService,
    private uploadService: UploadService,
    private authService: AuthService
  ) {
    this.carregarIcones();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.idIdioma = id;
      this.carregarDadosIdioma(id);
    }
    try {
      const salva = sessionStorage.getItem('crow:ordem-jogo');
      if (salva === 'cadastro' || salva === 'aleatoria') {
        this.ordemPreferida = salva;
      }
    } catch { /* sessionStorage indisponível */ }
  }

  carregarDadosIdioma(id: string): void {
    this.carregando = true;
    this.cdr.markForCheck();
    this.idiomaService.getIdiomaPorId(id).subscribe({
      next: (idioma) => {
        this.idiomaNome = idioma.nome;
        this.descricao = idioma.descricao;
        this.codigoIdioma = idioma.codigo;
        this.idUsuarioCriador = idioma.criadorId;
        this.codigoCriador = idioma.codigoCriador;
        this.avaliacao = idioma.avaliacao;
        this.totalAvaliacoes = idioma.totalAvaliacoes;
        const user = this.authService.getCurrentUser();
        this.isProprietario = user?.id === idioma.criadorId;
        this.cdr.detectChanges();
        this.carregarModulos(id);
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  carregarModulos(idiomaId: string): void {
    this.moduloService.getModulosPorIdioma(idiomaId).subscribe({
      next: (modulos) => {
        this.modulos = modulos.map((m: any) => {
          const iconeSvg = this.resolverIconeSvg(m.icone, m.id);
          return {
            id: m.id,
            nome: m.nome,
            iconeSvg,
            icone: this.makeIconSvg(iconeSvg),
            selecionado: false,
            frases: m.frases || 0
          };
        });
        this.nextId = this.modulos.length + 1;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  carregarIcones(): void {
    this.iconesModuloSvg = [...this.rawIcons];
    this.iconesModulo = this.rawIcons.map(svg => this.sanitizer.bypassSecurityTrustHtml(svg));
  }

  private makeIconSvg(raw: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  }

  /**
   * Retorna o SVG bruto do ícone do módulo. Usa o valor persistido no backend
   * e, apenas para módulos legados sem ícone salvo, recorre a um padrão estável
   * derivado do id (nunca aleatório).
   */
  private resolverIconeSvg(iconeBackend: string | null | undefined, id: number): string {
    if (iconeBackend && iconeBackend.trim()) {
      return iconeBackend;
    }
    const total = this.rawIcons.length;
    const indice = ((((id || 1) - 1) % total) + total) % total;
    return this.rawIcons[indice];
  }

  toggleModulo(mod: Modulo, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    mod.selecionado = !mod.selecionado;
  }

  selecionarTodos(): void {
    this.modulos.forEach(m => m.selecionado = true);
  }

  limparSelecao(): void {
    this.modulos.forEach(m => m.selecionado = false);
  }

  get modulosSelecionados(): Modulo[] {
    return this.modulos.filter(m => m.selecionado);
  }

  get podeIniciar(): boolean {
    return this.modulosSelecionados.length > 0;
  }

  calcularProgresso(): number {
    return Math.round((this.modulos.length / 20) * 100);
  }

  estrelas(nota: number): boolean[] {
    const notaArredondada = Math.ceil(nota);
    return Array.from({ length: 5 }, (_, i) => i < notaArredondada);
  }

  iniciar(): void {
    if (!this.podeIniciar) return;
    // Abre o modal para o usuário escolher a ordem de execução (Aleatória ou
    // Ordem de Cadastro). A navegação acontece após a escolha.
    this.mostrarModalOrdem = true;
  }

  fecharModalOrdem(): void {
    this.mostrarModalOrdem = false;
  }

  /**
   * Confirma o modo de ordem escolhido, persiste a opção durante a sessão e
   * inicia o jogo. No modo aleatório os módulos vão embaralhados; na ordem de
   * cadastro vão na sequência exibida (o backend ordena as frases por cadastro).
   */
  iniciarComOrdem(ordem: 'aleatoria' | 'cadastro'): void {
    if (!this.podeIniciar) return;

    const ids = this.modulosSelecionados.map(m => String(m.id));
    const idsOrdenados = ordem === 'aleatoria'
      ? [...ids].sort(() => Math.random() - 0.5)
      : ids;

    // Persiste a escolha durante a sessão (sobrevive a recargas da aba).
    try {
      sessionStorage.setItem('crow:ordem-jogo', ordem);
    } catch { /* sessionStorage indisponível — segue sem persistir */ }

    this.mostrarModalOrdem = false;
    this.router.navigate(['/jogar'], {
      queryParams: {
        modulos: JSON.stringify(idsOrdenados),
        idIdioma: this.idIdioma,
        ordem
      }
    });
  }

  onAdicionarModulo(): void {
    if (this.modulos.length >= 20) {
      this.exibirMensagemSucesso('Limite de 20 módulos atingido.');
      return;
    }
    this.resetarDadosAdicao();
    this.mostrarModalAdicionarModulo = true;
  }

  private resetarDadosAdicao(): void {
    this.etapaAdicao = 1;
    this.nomeModuloAdicao = '';
    this.iconeModuloAdicao = null;
    this.iconeModuloAdicaoSvg = null;
    this.salvandoAdicao = false;
    this.erroAdicao = '';

    this.modoFrase = null;

    this.revogarBlob(this.imagemPreview);
    this.imagemPreview = null;
    this.imagemFile = null;
    this.traducaoCompleta = '';
    this.palavrasTraducao = [{ palavra: '', traducao: '' }];
    this.traducoesAlternativas = [];
    this.observacoes = '';
    this.links = [''];

    this.pares.forEach(p => this.revogarBlob(p.imagem));
    this.pares = [
      { palavra: '', traducao: '' },
      { palavra: '', traducao: '' },
      { palavra: '', traducao: '' }
    ];

    this.tipoMidiaQuiz = null;
    this.revogarBlob(this.imagemQuiz);
    this.imagemQuiz = null;
    this.imagemQuizFile = null;
    this.videoQuiz = '';
    this.videoQuizEmbed = null;
    this.perguntaQuiz = '';
    this.alternativas = ['', ''];
    this.respostaCorreta = 0;
  }

  fecharModalAdicionarModulo(): void {
    if (this.salvandoAdicao) return;
    this.mostrarModalAdicionarModulo = false;
    this.resetarDadosAdicao();
  }

  selecionarIconeAdicao(icone: SafeHtml, index: number): void {
    this.iconeModuloAdicao = icone;
    this.iconeModuloAdicaoSvg = this.iconesModuloSvg[index];
  }

  get podeAvancarEtapa1Adicao(): boolean {
    return !!(this.iconeModuloAdicao && this.nomeModuloAdicao.trim());
  }

  get podeFinalizarAdicao(): boolean {
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

  avancarEtapaAdicao(): void {
    if (this.etapaAdicao === 1 && this.podeAvancarEtapa1Adicao) {
      this.etapaAdicao = 2;
    }
  }

  voltarEtapaAdicao(): void {
    if (this.etapaAdicao === 2) {
      this.etapaAdicao = 1;
    }
  }

  confirmarAdicaoModulo(): void {
    if (this.salvandoAdicao) return;
    if (!this.podeAvancarEtapa1Adicao || !this.podeFinalizarAdicao) return;
    if (this.modulos.length >= 20) {
      this.fecharModalAdicionarModulo();
      return;
    }

    this.salvandoAdicao = true;
    this.erroAdicao = '';

    this.uploadImagensAdicaoPendentes().subscribe({
      next: () => this.criarModuloEFrase(),
      error: (err) => this.tratarErroAdicao(err, 'Erro ao enviar imagens.')
    });
  }

  private uploadImagensAdicaoPendentes(): Observable<any> {
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

  private criarModuloEFrase(): void {
    const nome = this.nomeModuloAdicao.trim().substring(0, 80);
    const dadosModulo = { nome, icone: this.iconeModuloAdicaoSvg || '' };

    this.moduloService.criarModulo(this.idIdioma, dadosModulo).subscribe({
      next: (moduloCriado: any) => {
        this.fraseService.criarFrase(moduloCriado.id, this.getDadosFraseAdicao()).subscribe({
          next: () => {
            const iconeSvg = this.resolverIconeSvg(moduloCriado.icone, moduloCriado.id);
            const novoModulo: Modulo = {
              id: moduloCriado.id,
              nome: moduloCriado.nome || nome,
              iconeSvg,
              icone: this.makeIconSvg(iconeSvg),
              selecionado: false,
              frases: 1
            };
            this.modulos.push(novoModulo);
            this.nextId = this.modulos.length + 1;
            this.salvandoAdicao = false;
            this.fecharModalAdicionarModulo();
            this.exibirMensagemSucesso(`Módulo "${nome}" adicionado com sucesso!`);
          },
          error: (err) => this.tratarErroAdicao(err, 'Erro ao cadastrar frase.')
        });
      },
      error: (err) => this.tratarErroAdicao(err, 'Erro ao cadastrar módulo.')
    });
  }

  private tratarErroAdicao(err: any, fallback: string): void {
    this.salvandoAdicao = false;
    this.erroAdicao = err?.error?.message || fallback;
    this.cdr.detectChanges();
  }

  private getDadosFraseAdicao(): any {
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
      return { ...base, paresJson: JSON.stringify(paresLimpos) };
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

  // ===== HELPERS DA FRASE (adição de módulo) =====

  getLetraAlternativa(index: number): string {
    return String.fromCharCode(65 + index);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private revogarBlob(url: string | null | undefined): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  // Tradução Direta
  adicionarPalavra(): void {
    this.palavrasTraducao.push({ palavra: '', traducao: '' });
  }

  removerPalavra(index: number): void {
    this.palavrasTraducao.splice(index, 1);
  }

  adicionarLink(): void {
    if (this.links.length < 3) this.links.push('');
  }

  removerLink(index: number): void {
    this.links.splice(index, 1);
  }

  adicionarTraducaoAlt(): void {
    if (this.traducoesAlternativas.length < 5) this.traducoesAlternativas.push('');
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

  // Selecionar Pares
  adicionarPar(): void {
    if (this.pares.length < 10) this.pares.push({ palavra: '', traducao: '' });
  }

  removerPar(index: number): void {
    if (this.pares.length > 3) {
      this.revogarBlob(this.pares[index].imagem);
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

  // Quiz
  adicionarAlternativa(): void {
    if (this.alternativas.length < 5) this.alternativas.push('');
  }

  removerAlternativa(index: number): void {
    if (this.alternativas.length > 2) {
      this.alternativas.splice(index, 1);
      if (this.respostaCorreta === index) this.respostaCorreta = 0;
      else if (this.respostaCorreta > index) this.respostaCorreta--;
    }
  }

  marcarRespostaCorreta(index: number): void {
    this.respostaCorreta = index;
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
      const m = url.match(/[?&]v=([^&]+)/);
      if (m?.[1]) embedUrl = `https://www.youtube.com/embed/${m[1]}`;
    } else if (url.includes('youtu.be/')) {
      const m = url.match(/youtu\.be\/([^?]+)/);
      if (m?.[1]) {
        const params = url.includes('?') ? url.substring(url.indexOf('?')) : '';
        embedUrl = `https://www.youtube.com/embed/${m[1]}${params}`;
      }
    }
    this.videoQuizEmbed = embedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl) : null;
  }

  fecharModalAlertaMinimoModulos(): void {
    this.mostrarModalAlertaMinimoModulos = false;
  }

  voltar(): void {
    if (this.isProprietario) {
      this.router.navigate(['/home']);
      return;
    }
    window.history.back();
  }

  visualizarModulo(mod: Modulo, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/visualizar-modulo'], {
      queryParams: { id: mod.id, idIdioma: this.idIdioma }
    });
  }

  // ===== COPIAR ID DO IDIOMA =====
  
  copiarIdIdioma(): void {
    navigator.clipboard.writeText(this.codigoIdioma).then(() => {
      this.exibirMensagemSucesso('ID do Idioma copiado para a área de transferência!');
    }).catch(err => {
      console.error('Erro ao copiar ID:', err);
      alert('Não foi possível copiar o ID. Tente novamente.');
    });
  }

  get idIdiomaFormatado(): string {
    return this.codigoIdioma;
  }

  // ===== MODAL DE DENÚNCIA =====
  
  denunciarIdioma(): void {
    this.mostrarModalDenuncia = true;
  }

  fecharModalDenuncia(): void {
    this.mostrarModalDenuncia = false;
    this.limparCamposDenuncia();
  }

  limparCamposDenuncia(): void {
    this.denunciaImagensInapropriadas = false;
    this.denunciaVideosInapropriados = false;
    this.denunciaLinksInapropriados = false;
    this.denunciaFrasesInapropriadas = false;
    this.denunciaOutros = false;
    this.denunciaDescricao = '';
  }

  get podeEnviarDenuncia(): boolean {
    const temDenuncia = this.denunciaImagensInapropriadas || 
                        this.denunciaVideosInapropriados || 
                        this.denunciaLinksInapropriados || 
                        this.denunciaFrasesInapropriadas || 
                        this.denunciaOutros;
    
    if (this.denunciaOutros) {
      return temDenuncia && this.denunciaDescricao.trim().length > 0;
    }
    
    return temDenuncia;
  }

  enviarDenuncia(): void {
    if (!this.podeEnviarDenuncia) return;

    const tipos: string[] = [];
    if (this.denunciaImagensInapropriadas) tipos.push('Imagens Inapropriadas');
    if (this.denunciaVideosInapropriados) tipos.push('Vídeos Inapropriados');
    if (this.denunciaLinksInapropriados) tipos.push('Links Inapropriados');
    if (this.denunciaFrasesInapropriadas) tipos.push('Frases Inapropriadas');
    if (this.denunciaOutros) tipos.push('Outros');

    this.idiomaService.denunciarIdioma(this.idIdioma, {
      tipos,
      descricao: this.denunciaDescricao
    }).subscribe({
      next: () => {
        this.fecharModalDenuncia();
        this.exibirMensagemSucesso('Obrigado por sua colaboração! A moderação verificará e agirá assim que possível.');
      },
      error: () => {
        this.fecharModalDenuncia();
      }
    });
  }

  // ===== MODAL DE AVALIAÇÃO =====
  
  avaliarIdioma(): void {
    this.notaAvaliacao = 0;
    this.notaHover = 0;
    this.mostrarModalAvaliacao = true;
  }

  fecharModalAvaliacao(): void {
    this.mostrarModalAvaliacao = false;
    this.notaAvaliacao = 0;
    this.notaHover = 0;
  }

  selecionarNota(nota: number): void {
    this.notaAvaliacao = nota;
  }

  hoverNota(nota: number): void {
    this.notaHover = nota;
  }

  resetHover(): void {
    this.notaHover = 0;
  }

  enviarAvaliacao(): void {
    if (this.notaAvaliacao === 0) return;

    this.idiomaService.avaliarIdioma(this.idIdioma, this.notaAvaliacao).subscribe({
      next: (resultado) => {
        this.avaliacao = resultado.novaMedia;
        this.totalAvaliacoes = resultado.totalAvaliacoes;
        this.fecharModalAvaliacao();
        this.exibirMensagemSucesso('Avaliação enviada com sucesso! Obrigado pelo seu feedback.');
      },
      error: () => {
        this.fecharModalAvaliacao();
      }
    });
  }

  // ===== MODAL DE IMPORTAÇÃO =====
  
  importarIdioma(): void {
    // Carrega os idiomas do usuário ANTES de abrir o modal, garantindo que a
    // decisão entre "confirmação" e "exclusão" use a contagem real (corrige
    // o problema de o modal abrir sempre na etapa de confirmação).
    this.idiomaService.getIdiomasUsuario().subscribe({
      next: (idiomas) => {
        this.idiomasUsuario = idiomas.map((i: any) => ({
          id: i.id,
          nome: i.nome,
          bandeira: i.bandeira,
          selecionado: false
        }));
        this.etapaImportacao = this.idiomasUsuario.length >= 4 ? 'exclusao' : 'confirmacao';
        this.mostrarModalImportacao = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.idiomasUsuario = [];
        this.etapaImportacao = 'confirmacao';
        this.mostrarModalImportacao = true;
        this.cdr.detectChanges();
      }
    });
  }

  fecharModalImportacao(): void {
    this.mostrarModalImportacao = false;
    this.etapaImportacao = 'confirmacao';
    this.limparSelecaoIdiomas();
  }

  limparSelecaoIdiomas(): void {
    this.idiomasUsuario.forEach(i => i.selecionado = false);
  }

  toggleIdiomaImportacao(idioma: IdiomaUsuario): void {
    idioma.selecionado = !idioma.selecionado;
  }

  get idiomasSelecionadosParaExclusao(): IdiomaUsuario[] {
    return this.idiomasUsuario.filter(i => i.selecionado);
  }

  get podeExcluirEImportar(): boolean {
    return this.idiomasSelecionadosParaExclusao.length > 0;
  }

  confirmarImportacao(): void {
    this.idiomaService.importarIdioma(this.idIdioma).subscribe({
      next: () => {
        this.fecharModalImportacao();
        this.exibirMensagemSucesso(`Idioma "${this.idiomaNome}" importado com sucesso!`);
      },
      error: (err) => {
        this.fecharModalImportacao();
        this.exibirMensagemSucesso(err.error?.message || 'Erro ao importar idioma.');
      }
    });
  }

  excluirEImportar(): void {
    if (!this.podeExcluirEImportar) return;

    // Exclui de fato os idiomas selecionados no backend e, só após a confirmação,
    // realiza a importação — garantindo persistência e respeito ao limite de 4.
    const exclusoes = this.idiomasSelecionadosParaExclusao.map(i =>
      this.idiomaService.excluirIdioma(i.id));

    forkJoin(exclusoes).subscribe({
      next: () => {
        this.idiomaService.importarIdioma(this.idIdioma).subscribe({
          next: () => {
            this.fecharModalImportacao();
            this.exibirMensagemSucesso(`Idioma "${this.idiomaNome}" importado com sucesso!`);
          },
          error: (err) => {
            this.fecharModalImportacao();
            this.exibirMensagemSucesso(err.error?.message || 'Erro ao importar idioma.');
          }
        });
      },
      error: () => {
        this.fecharModalImportacao();
        this.exibirMensagemSucesso('Erro ao excluir os idiomas selecionados.');
      }
    });
  }

  // ===== MODAL DE EDITAR MÓDULO =====
  
  editarModulo(mod: Modulo): void {
    this.moduloEmEdicao = mod;
    this.nomeModuloEdicao = mod.nome;
    // Pré-seleciona o ícone atualmente em uso pelo módulo.
    this.iconeModuloEdicaoSvg = mod.iconeSvg;
    this.salvandoEdicao = false;
    this.erroEdicao = '';
    this.mostrarModalEditarModulo = true;
  }

  fecharModalEditarModulo(): void {
    if (this.salvandoEdicao) return;
    this.mostrarModalEditarModulo = false;
    this.moduloEmEdicao = null;
    this.nomeModuloEdicao = '';
    this.iconeModuloEdicaoSvg = null;
    this.erroEdicao = '';
  }

  selecionarIconeEdicao(index: number): void {
    this.iconeModuloEdicaoSvg = this.iconesModuloSvg[index];
  }

  get podeConfirmarEdicao(): boolean {
    const nomeValido = this.nomeModuloEdicao.trim().length > 0;
    const nomeDiferente = this.nomeModuloEdicao.trim() !== this.moduloEmEdicao?.nome;
    const iconeDiferente = !!this.iconeModuloEdicaoSvg
      && this.iconeModuloEdicaoSvg !== this.moduloEmEdicao?.iconeSvg;

    return nomeValido && !!this.iconeModuloEdicaoSvg && (nomeDiferente || iconeDiferente);
  }

  confirmarEdicaoModulo(): void {
    if (this.salvandoEdicao) return;
    if (!this.podeConfirmarEdicao || !this.moduloEmEdicao) return;

    const modulo = this.moduloEmEdicao;
    const nome = this.nomeModuloEdicao.trim().substring(0, 80);
    const iconeSvg = this.iconeModuloEdicaoSvg || modulo.iconeSvg;

    this.salvandoEdicao = true;
    this.erroEdicao = '';

    this.moduloService.editarModulo(this.idIdioma, modulo.id, { nome, icone: iconeSvg }).subscribe({
      next: (atualizado: any) => {
        modulo.nome = atualizado?.nome || nome;
        modulo.iconeSvg = this.resolverIconeSvg(atualizado?.icone ?? iconeSvg, modulo.id);
        modulo.icone = this.makeIconSvg(modulo.iconeSvg);
        this.salvandoEdicao = false;
        this.fecharModalEditarModulo();
        this.exibirMensagemSucesso(`Módulo "${modulo.nome}" editado com sucesso!`);
      },
      error: (err) => {
        this.salvandoEdicao = false;
        this.erroEdicao = err?.error?.message || 'Erro ao editar módulo.';
        this.cdr.detectChanges();
      }
    });
  }

  // ===== MODAL DE EXCLUIR MÓDULO =====
  
  removerModuloConfirmacao(mod: Modulo): void {
    if (this.modulos.length <= 1) {
      this.mostrarModalAlertaMinimoModulos = true;
      return;
    }

    this.moduloEmExclusao = mod;
    this.mostrarModalExcluirModulo = true;
  }

  fecharModalExcluirModulo(): void {
    if (this.salvandoExclusao) return;
    this.mostrarModalExcluirModulo = false;
    this.moduloEmExclusao = null;
    this.erroExclusao = '';
  }

  confirmarExclusaoModulo(): void {
    if (!this.moduloEmExclusao || this.salvandoExclusao) return;

    const modulo = this.moduloEmExclusao;
    const nomeModulo = modulo.nome;
    this.salvandoExclusao = true;
    this.erroExclusao = '';

    // Persiste a exclusão no backend ANTES de remover da lista local.
    this.moduloService.excluirModulo(this.idIdioma, modulo.id).subscribe({
      next: () => {
        this.modulos = this.modulos.filter(m => m.id !== modulo.id);
        this.nextId = this.modulos.length + 1;
        this.limparSelecao();
        this.salvandoExclusao = false;
        this.fecharModalExcluirModulo();
        this.exibirMensagemSucesso(`Módulo "${nomeModulo}" excluído com sucesso!`);
      },
      error: (err) => {
        this.salvandoExclusao = false;
        this.erroExclusao = err?.error?.message || 'Erro ao excluir o módulo. Tente novamente.';
        this.cdr.detectChanges();
      }
    });
  }

  // ===== MENSAGEM DE SUCESSO =====
  
  exibirMensagemSucesso(mensagem: string): void {
    this.mensagemSucesso = mensagem;
    this.mostrarMensagemSucesso = true;
    
    this.cdr.detectChanges();

    setTimeout(() => {
      this.mostrarMensagemSucesso = false;
    }, 4000);
  }

  fecharMensagemSucesso(): void {
    this.mostrarMensagemSucesso = false;
  }

  get idUsuarioFormatado(): string {
    return this.codigoCriador;
  }

  navegarParaUsuario(): void {
    if (!this.idUsuarioCriador) return;
    this.router.navigate(['/visualizar-usuario'], {
      queryParams: { id: this.idUsuarioCriador }
    });
  }
}