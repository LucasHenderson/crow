import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Idioma, IdiomaOpcao, IDIOMAS_DISPONIVEIS, PROFICIENCIAS } from '../../models';
import { IdiomaService } from '../../services/idioma.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {

  idiomas: Idioma[] = [];
  carregando = true;

  // Controle dos modals
  mostrarModalEdicao = false;
  mostrarModalExclusao = false;
  mostrarModalOpcoes = false; // NOVO: Modal de opções ao adicionar idioma
  
  // Mensagem de sucesso
  mostrarMensagemSucesso = false;
  mensagemSucesso = '';
  
  // Dados de edição
  idiomaEmEdicao: Idioma | null = null;
  indiceEdicao = -1;
  
  // Campos do formulário de edição
  nomeEdicao = '';
  idiomaSelecionadoEdicao: IdiomaOpcao | null = null;
  descricaoEdicao = '';
  proficienciaEdicao = '';
  visibilidadeEdicao: 'publico' | 'privado' = 'publico';
  
  // Dropdowns
  mostrarIdiomasEdicao = false;
  mostrarProficienciaEdicao = false;
  buscaIdiomaEdicao = '';
  
  // Dados de exclusão
  idiomaEmExclusao: Idioma | null = null;
  indiceExclusao = -1;
  
  // Opções disponíveis
  idiomasDisponiveis = IDIOMAS_DISPONIVEIS;

  proficiencias = PROFICIENCIAS;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private idiomaService: IdiomaService
  ) {}

  ngOnInit(): void {
    this.carregarIdiomas();
  }

  carregarIdiomas(): void {
    this.carregando = true;
    this.idiomaService.getIdiomasUsuario().subscribe({
      next: (idiomas) => {
        this.idiomas = idiomas;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  /**
   * Abre o modal de opções para adicionar idioma
   */
  adicionarIdioma(): void {
    if (this.idiomas.length >= 4) {
      console.warn('Limite máximo de 4 idiomas atingido');
      return;
    }
    this.mostrarModalOpcoes = true;
  }

  /**
   * Fecha o modal de opções
   */
  fecharModalOpcoes(): void {
    this.mostrarModalOpcoes = false;
  }

  /**
   * Navega para buscar idioma
   */
  buscarIdioma(): void {
    console.log('Navegar para Buscar Idioma');
    this.fecharModalOpcoes();
    this.router.navigate(['/buscar-idioma']);
  }

  /**
   * Navega para buscar usuário
   */
  buscarUsuario(): void {
    console.log('Navegar para Buscar Usuário');
    this.fecharModalOpcoes();
    this.router.navigate(['/buscar-usuario']);
  }

  /**
   * Navega para criar novo idioma
   */
  novoIdioma(): void {
    console.log('Navegar para Cadastrar Novo Idioma');
    this.fecharModalOpcoes();
    this.router.navigate(['/cadastrar-idioma']);
  }

  /**
   * Gerar idioma com IA (desabilitado por enquanto)
   */
  gerarIdiomaIA(): void {
    console.log('Funcionalidade de IA em desenvolvimento');
    // Será implementado em breve
  }

  /**
   * Seleciona um idioma para visualização
   */
  selecionarIdioma(idioma: Idioma): void {
    console.log('Idioma selecionado:', idioma.nome);
    // Aqui você pode adicionar navegação para a página de visualização
    // this.router.navigate(['/visualizar-idioma', idioma.id]);
  }

  /**
   * Abre o modal de edição
   */
  editarIdioma(idioma: Idioma, index: number): void {
    this.idiomaEmEdicao = { ...idioma };
    this.indiceEdicao = index;
    
    // Preenche os campos do formulário
    this.nomeEdicao = idioma.nome;
    this.idiomaSelecionadoEdicao = this.idiomasDisponiveis.find(i => i.nome === idioma.nome) || null;
    this.descricaoEdicao = idioma.descricao;
    this.proficienciaEdicao = idioma.proficiencia || 'Básico';
    this.visibilidadeEdicao = idioma.visibilidade || 'publico';
    
    this.mostrarModalEdicao = true;
  }

  /**
   * Salva as alterações do idioma
   */
  salvarEdicao(): void {
    if (!this.podeAvancarEdicao()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    if (this.indiceEdicao >= 0 && this.idiomaSelecionadoEdicao) {
      this.idiomas[this.indiceEdicao].nome = this.nomeEdicao.trim();
      this.idiomas[this.indiceEdicao].bandeira = this.idiomaSelecionadoEdicao.bandeira;
      this.idiomas[this.indiceEdicao].descricao = this.descricaoEdicao;
      this.idiomas[this.indiceEdicao].proficiencia = this.proficienciaEdicao;
      this.idiomas[this.indiceEdicao].visibilidade = this.visibilidadeEdicao;
      
      console.log(`Idioma editado com sucesso: ${this.idiomas[this.indiceEdicao].nome}`);
      this.fecharModalEdicao();
      this.exibirMensagemSucesso(`Idioma "${this.nomeEdicao}" editado com sucesso!`);
    }
  }

  /**
   * Fecha o modal de edição
   */
  fecharModalEdicao(): void {
    this.mostrarModalEdicao = false;
    this.idiomaEmEdicao = null;
    this.indiceEdicao = -1;
    this.limparCamposEdicao();
  }

  /**
   * Limpa os campos de edição
   */
  limparCamposEdicao(): void {
    this.nomeEdicao = '';
    this.idiomaSelecionadoEdicao = null;
    this.descricaoEdicao = '';
    this.proficienciaEdicao = '';
    this.visibilidadeEdicao = 'publico';
    this.buscaIdiomaEdicao = '';
    this.mostrarIdiomasEdicao = false;
    this.mostrarProficienciaEdicao = false;
  }

  /**
   * Abre o modal de exclusão
   */
  excluirIdioma(idioma: Idioma, index: number): void {
    this.idiomaEmExclusao = idioma;
    this.indiceExclusao = index;
    this.mostrarModalExclusao = true;
  }

  /**
   * Confirma a exclusão do idioma
   */
  confirmarExclusao(): void {
    if (this.indiceExclusao >= 0) {
      const nomeIdioma = this.idiomas[this.indiceExclusao].nome;
      this.idiomas.splice(this.indiceExclusao, 1);
      console.log(`Idioma "${nomeIdioma}" excluído com sucesso!`);
      this.fecharModalExclusao();
      this.exibirMensagemSucesso(`Idioma "${nomeIdioma}" excluído com sucesso!`);
    }
  }

  /**
   * Fecha o modal de exclusão
   */
  fecharModalExclusao(): void {
    this.mostrarModalExclusao = false;
    this.idiomaEmExclusao = null;
    this.indiceExclusao = -1;
  }

  /**
   * Retorna array de booleanos para renderizar estrelas
   */
  estrelasArray(nota: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < nota);
  }

  /**
   * Calcula o progresso percentual baseado nos módulos
   */
  calcularProgresso(modulos: number): number {
    return Math.round((modulos / 20) * 100);
  }

  // ===== FUNÇÕES DO MODAL DE EDIÇÃO =====

  get idiomasFiltradosEdicao(): IdiomaOpcao[] {
    if (!this.buscaIdiomaEdicao.trim()) return this.idiomasDisponiveis;
    const termo = this.buscaIdiomaEdicao.toLowerCase();
    return this.idiomasDisponiveis.filter(i => i.nome.toLowerCase().includes(termo));
  }

  toggleIdiomasEdicao(): void {
    this.mostrarIdiomasEdicao = !this.mostrarIdiomasEdicao;
    this.mostrarProficienciaEdicao = false;
  }

  toggleProficienciaEdicao(): void {
    this.mostrarProficienciaEdicao = !this.mostrarProficienciaEdicao;
    this.mostrarIdiomasEdicao = false;
  }

  selecionarIdiomaEdicao(idioma: IdiomaOpcao): void {
    this.idiomaSelecionadoEdicao = idioma;
    this.mostrarIdiomasEdicao = false;
    this.buscaIdiomaEdicao = '';
  }

  selecionarProficienciaEdicao(nivel: string): void {
    this.proficienciaEdicao = nivel;
    this.mostrarProficienciaEdicao = false;
  }

  podeAvancarEdicao(): boolean {
    return !!(this.nomeEdicao.trim() && this.idiomaSelecionadoEdicao && this.descricaoEdicao.trim() && this.proficienciaEdicao && this.visibilidadeEdicao);
  }

  fecharDropdownsEdicao(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.campo')) {
      this.mostrarIdiomasEdicao = false;
      this.mostrarProficienciaEdicao = false;
    }
  }

  // ===== MENSAGEM DE SUCESSO =====
  
  exibirMensagemSucesso(mensagem: string): void {
    this.mensagemSucesso = mensagem;
    this.mostrarMensagemSucesso = true;
    
    // Força a detecção de mudanças para garantir que o texto seja exibido imediatamente
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.mostrarMensagemSucesso = false;
      this.cdr.detectChanges();
    }, 4000);
  }

  fecharMensagemSucesso(): void {
    this.mostrarMensagemSucesso = false;
  }
}