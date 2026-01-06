import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';

interface Modulo {
  id: number;
  nome: string;
  icone: SafeHtml;
  selecionado: boolean;
  frases: number;
}

interface IdiomaUsuario {
  nome: string;
  bandeira: string;
  selecionado: boolean;
}

@Component({
  selector: 'app-visualizar-idioma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visualizar-idioma.html',
  styleUrl: './visualizar-idioma.css',
})
export class VisualizarIdioma {
  idiomaNome = 'Japonês';
  descricao = 'Aprender japonês básico para viagens e conversação do dia a dia';
  isProprietario = false;
  avaliacao = 4.3;
  totalAvaliacoes = 2134;
  
  // Controle dos modais
  mostrarModalDenuncia = false;
  mostrarModalAvaliacao = false;
  mostrarModalImportacao = false;
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
    `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`
  ];

  modulos: Modulo[] = [];
  private nextId = 1;

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.addModule('Saudações');
    this.addModule('Vocabulário Básico');
    this.addModule('Frases Comuns');
    this.addModule('Números e Contagem');
    this.addModule('Dias da Semana');
    
    // Simular idiomas do usuário (para teste)
    this.carregarIdiomasUsuario();
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

  editarModulo(mod: Modulo): void {
    const novoNome = prompt('Novo nome do módulo (máximo 80 caracteres):', mod.nome);
    if (!novoNome || !novoNome.trim()) return;
    
    const nomeTruncado = novoNome.trim().substring(0, 80);
    mod.nome = nomeTruncado;
  }

  removerModuloConfirmacao(mod: Modulo): void {
    if (this.modulos.length <= 1) {
      alert('Deve existir pelo menos 1 módulo.');
      return;
    }
    
    const confirmar = confirm(`Deseja remover o módulo "${mod.nome}"?`);
    if (!confirmar) return;
    
    this.modulos = this.modulos.filter(m => m.id !== mod.id);
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
    
    console.log('Denúncia enviada:', {
      imagens: this.denunciaImagensInapropriadas,
      videos: this.denunciaVideosInapropriados,
      links: this.denunciaLinksInapropriados,
      frases: this.denunciaFrasesInapropriadas,
      outros: this.denunciaOutros,
      descricao: this.denunciaDescricao
    });
    
    this.fecharModalDenuncia();
    this.exibirMensagemSucesso('Obrigado por sua colaboração! A moderação verificará e agirá assim que possível.');
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
    
    // Calcular nova média
    const somaTotal = (this.avaliacao * this.totalAvaliacoes) + this.notaAvaliacao;
    const novoTotal = this.totalAvaliacoes + 1;
    let novaMedia = somaTotal / novoTotal;
    
    // Arredondar para 5 se >= 4.5
    if (novaMedia >= 4.5) {
      novaMedia = 5;
    }
    
    this.avaliacao = novaMedia;
    this.totalAvaliacoes = novoTotal;
    
    console.log('Avaliação enviada:', this.notaAvaliacao);
    console.log('Nova média:', this.avaliacao);
    
    this.fecharModalAvaliacao();
    this.exibirMensagemSucesso('Avaliação enviada com sucesso! Obrigado pelo seu feedback.');
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
    // Simular idiomas do usuário (substituir por dados reais)
    this.idiomasUsuario = [
      { nome: 'Inglês', bandeira: '../../../assets/imgs/United-States-Flag.svg', selecionado: false },
      { nome: 'Espanhol', bandeira: '../../../assets/imgs/Spain-Flag.svg', selecionado: false },
      { nome: 'Francês', bandeira: '../../../assets/imgs/France-Flag.png', selecionado: false },
      { nome: 'Alemão', bandeira: '../../../assets/imgs/Germany-Flag.svg.png', selecionado: false }
    ];
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
    console.log('Importando idioma:', this.idiomaNome);
    this.fecharModalImportacao();
    this.exibirMensagemSucesso(`Idioma "${this.idiomaNome}" importado com sucesso!`);
  }

  excluirEImportar(): void {
    if (!this.podeExcluirEImportar) return;
    
    const nomesExcluidos = this.idiomasSelecionadosParaExclusao.map(i => i.nome).join(', ');
    console.log('Excluindo idiomas:', nomesExcluidos);
    console.log('Importando idioma:', this.idiomaNome);
    
    // Remover idiomas selecionados
    this.idiomasUsuario = this.idiomasUsuario.filter(i => !i.selecionado);
    
    this.fecharModalImportacao();
    this.exibirMensagemSucesso(`Idioma "${this.idiomaNome}" importado com sucesso!`);
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
}