import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Idioma {
  nome: string;
  bandeira: string;
  nota: number; // 1 a 5
  modulos: number; // até 20
  descricao: string;
  proficiencia?: string;
  visibilidade?: 'publico' | 'privado';
}

interface IdiomaOpcao {
  nome: string;
  bandeira: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {

  idiomas: Idioma[] = [];
  
  // Controle dos modals
  mostrarModalEdicao = false;
  mostrarModalExclusao = false;
  
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
  idiomasDisponiveis: IdiomaOpcao[] = [
    { nome: 'Alemão', bandeira: '../../../assets/imgs/Germany-Flag.svg.png' },
    { nome: 'Árabe', bandeira: '../../../assets/imgs/United-Arab-Emirates-Flag.svg.png' },
    { nome: 'Chinês (Mandarim)', bandeira: '../../../assets/imgs/China-Flag.svg' },
    { nome: 'Coreano', bandeira: '../../../assets/imgs/South-Korea-Flag.svg.webp' },
    { nome: 'Espanhol', bandeira: '../../../assets/imgs/Spain-Flag.svg' },
    { nome: 'Francês', bandeira: '../../../assets/imgs/France-Flag.png' },
    { nome: 'Inglês (Estados Unidos)', bandeira: '../../../assets/imgs/United-States-Flag.svg' },
    { nome: 'Inglês (Reino Unido)', bandeira: '../../../assets/imgs/United-Kingdom-Flag.svg.png' },
    { nome: 'Italiano', bandeira: '../../../assets/imgs/Italy-Flag.svg' },
    { nome: 'Japonês', bandeira: '../../../assets/imgs/Japan-Flag.png' },
    { nome: 'Português (Brasil)', bandeira: '../../../assets/imgs/Brazil-Flag.svg' },
    { nome: 'Português (Portugal)', bandeira: '../../../assets/imgs/Portugal-Flag.svg.png' },
    { nome: 'Russo', bandeira: '../../../assets/imgs/Russia-Flag.svg' }
  ].sort((a, b) => a.nome.localeCompare(b.nome));
  
  proficiencias = ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Fluente'];

  constructor(private cdr: ChangeDetectorRef) {}

  /**
   * Adiciona um novo idioma à lista (máximo 4)
   */
  adicionarIdioma(): void {
    if (this.idiomas.length >= 4) {
      console.warn('Limite máximo de 4 idiomas atingido');
      return;
    }

    const exemplos: Idioma[] = [
      {
        nome: 'Inglês',
        bandeira: '../../../assets/imgs/United-States-Flag.svg',
        nota: 4,
        modulos: 18,
        descricao: 'Idioma global, utilizado em negócios, tecnologia e viagens ao redor do mundo.',
        proficiencia: 'Avançado',
        visibilidade: 'publico'
      },
      {
        nome: 'Japonês',
        bandeira: '../../../assets/imgs/Japan-Flag.png',
        nota: 5,
        modulos: 20,
        descricao: 'Idioma rico culturalmente, com foco em escrita complexa e conversação formal.',
        proficiencia: 'Fluente',
        visibilidade: 'publico'
      },
      {
        nome: 'Espanhol',
        bandeira: '../../../assets/imgs/Spain-Flag.svg',
        nota: 3,
        modulos: 12,
        descricao: 'Idioma amplamente falado na América Latina, Europa e em diversas comunidades.',
        proficiencia: 'Intermediário',
        visibilidade: 'privado'
      },
      {
        nome: 'Russo',
        bandeira: '../../../assets/imgs/Russia-Flag.svg',
        nota: 4,
        modulos: 15,
        descricao: 'Idioma desafiador, com alfabeto cirílico próprio e estrutura gramatical complexa.',
        proficiencia: 'Avançado',
        visibilidade: 'publico'
      }
    ];

    const novoIdioma = exemplos[this.idiomas.length];
    this.idiomas.push(novoIdioma);
    
    console.log(`Idioma ${novoIdioma.nome} adicionado com sucesso!`);
  }

  /**
   * Seleciona um idioma para visualização
   */
  selecionarIdioma(idioma: Idioma): void {
    console.log('Idioma selecionado:', idioma.nome);
    // Aqui você pode adicionar navegação para a página de visualização
    // this.router.navigate(['/visualizar-idioma', idioma.nome]);
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