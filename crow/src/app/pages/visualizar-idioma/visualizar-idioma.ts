import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Modulo } from '../../models/modulo.model';
import { IdiomaUsuario } from '../../models/idioma.model';
import { IdiomaService } from '../../services/idioma.service';
import { ModuloService } from '../../services/modulo.service';
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
  mostrarMensagemSucesso = false;
  mensagemSucesso = '';
  
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
  nomeModuloEdicao = '';
  iconeModuloEdicao: SafeHtml | null = null;
  
  iconesModulo: SafeHtml[] = [];
  
  private rawIcons = [
    `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
    `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,
    `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
    `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
    `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>`,
    `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>`,
    `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
    `<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`,
    `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    `<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
    `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>`,
    `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
    `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>`,
    `<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>`,
    `<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>`,
    `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
    `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
    `<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`,
    `<polyline points="20 6 9 17 4 12"/>`,
    `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
    `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    `<rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>`,
    `<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>`,
    `<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>`
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
        this.modulos = modulos.map((m: any) => ({
          id: m.id,
          nome: m.nome,
          icone: this.makeIconSvg(this.rawIcons[(m.id - 1) % this.rawIcons.length]),
          selecionado: false,
          frases: m.frases || 0
        }));
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
    this.iconesModulo = this.rawIcons.map(svg => this.sanitizer.bypassSecurityTrustHtml(svg));
  }

  private makeIconSvg(raw: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  }

  addModule(nome?: string): void {
    if (this.modulos.length >= 20) {
      alert('Limite de 20 módulos atingido.');
      return;
    }
    
    const iconRaw = this.rawIcons[(this.nextId - 1) % this.rawIcons.length];
    const modulo: Modulo = {
      id: this.nextId++,
      nome: nome || `Módulo ${this.nextId - 1}`,
      icone: this.makeIconSvg(iconRaw),
      selecionado: false,
      frases: Math.floor(Math.random() * 50) + 1
    };
    
    this.modulos.push(modulo);
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
    
    const ids = this.modulosSelecionados.map(m => m.id);
    console.log('Iniciando módulos:', ids);
    alert(`Iniciando ${this.modulosSelecionados.length} módulo(s) selecionado(s)!`);
  }

  onAdicionarModulo(): void {
    const nome = prompt('Nome do novo módulo:');
    if (!nome || !nome.trim()) return;
    
    this.addModule(nome.trim());
  }

  voltar(): void {
    window.history.back();
  }

  visualizarModulo(mod: Modulo, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    console.log('Visualizando módulo:', mod.nome);
    this.router.navigate(['/visualizar-modulo']);
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
    this.carregarIdiomasUsuario();
    
    if (this.idiomasUsuario.length >= 4) {
      this.etapaImportacao = 'exclusao';
    } else {
      this.etapaImportacao = 'confirmacao';
    }
    
    this.mostrarModalImportacao = true;
  }

  fecharModalImportacao(): void {
    this.mostrarModalImportacao = false;
    this.etapaImportacao = 'confirmacao';
    this.limparSelecaoIdiomas();
  }

  carregarIdiomasUsuario(): void {
    this.idiomaService.getIdiomasUsuario().subscribe({
      next: (idiomas) => {
        this.idiomasUsuario = idiomas.map((i: any) => ({
          nome: i.nome,
          bandeira: i.bandeira,
          selecionado: false
        }));
      },
      error: () => {}
    });
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
    
    const nomesExcluidos = this.idiomasSelecionadosParaExclusao.map(i => i.nome).join(', ');
    console.log('Excluindo idiomas:', nomesExcluidos);
    console.log('Importando idioma:', this.idiomaNome);
    
    this.idiomasUsuario = this.idiomasUsuario.filter(i => !i.selecionado);
    
    this.fecharModalImportacao();
    this.exibirMensagemSucesso(`Idioma "${this.idiomaNome}" importado com sucesso!`);
  }

  // ===== MODAL DE EDITAR MÓDULO =====
  
  editarModulo(mod: Modulo): void {
    this.moduloEmEdicao = mod;
    this.nomeModuloEdicao = mod.nome;
    this.iconeModuloEdicao = mod.icone;
    this.mostrarModalEditarModulo = true;
  }

  fecharModalEditarModulo(): void {
    this.mostrarModalEditarModulo = false;
    this.moduloEmEdicao = null;
    this.nomeModuloEdicao = '';
    this.iconeModuloEdicao = null;
  }

  get podeConfirmarEdicao(): boolean {
    const nomeValido = this.nomeModuloEdicao.trim().length > 0;
    const nomeDiferente = this.nomeModuloEdicao.trim() !== this.moduloEmEdicao?.nome;
    const iconeDiferente = this.iconeModuloEdicao !== this.moduloEmEdicao?.icone;
    
    return nomeValido && (nomeDiferente || iconeDiferente);
  }

  confirmarEdicaoModulo(): void {
    if (!this.podeConfirmarEdicao || !this.moduloEmEdicao) return;
    
    this.moduloEmEdicao.nome = this.nomeModuloEdicao.trim().substring(0, 80);
    if (this.iconeModuloEdicao) {
      this.moduloEmEdicao.icone = this.iconeModuloEdicao;
    }
    
    console.log(`Módulo editado:`, this.moduloEmEdicao);
    
    this.fecharModalEditarModulo();
    this.exibirMensagemSucesso(`Módulo "${this.moduloEmEdicao.nome}" editado com sucesso!`);
  }

  // ===== MODAL DE EXCLUIR MÓDULO =====
  
  removerModuloConfirmacao(mod: Modulo): void {
    if (this.modulos.length <= 1) {
      alert('Deve existir pelo menos 1 módulo.');
      return;
    }
    
    this.moduloEmExclusao = mod;
    this.mostrarModalExcluirModulo = true;
  }

  fecharModalExcluirModulo(): void {
    this.mostrarModalExcluirModulo = false;
    this.moduloEmExclusao = null;
  }

  confirmarExclusaoModulo(): void {
    if (!this.moduloEmExclusao) return;
    
    const nomeModulo = this.moduloEmExclusao.nome;
    this.modulos = this.modulos.filter(m => m.id !== this.moduloEmExclusao!.id);
    
    console.log(`Módulo "${nomeModulo}" excluído`);
    
    this.fecharModalExcluirModulo();
    this.exibirMensagemSucesso(`Módulo "${nomeModulo}" excluído com sucesso!`);
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
    console.log('Navegando para perfil do usuário:', this.idUsuarioCriador);
    this.router.navigate(['/visualizar-usuario']);
  }
}