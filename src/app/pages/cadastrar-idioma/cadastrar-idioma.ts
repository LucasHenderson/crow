import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface IdiomaOpcao {
  nome: string;
  bandeira: string;
}

@Component({
  selector: 'app-cadastrar-idioma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastrar-idioma.html',
  styleUrl: './cadastrar-idioma.css',
})
export class CadastrarIdioma {
  
  constructor(private router: Router) {}

  // ===== ESTADOS =====
  idiomaSelecionado: IdiomaOpcao | null = null;
  proficiencia = '';
  visibilidade: 'publico' | 'privado' = 'publico';

  mostrarIdiomas = false;
  mostrarProficiencia = false;

  buscaIdioma = '';

  // ===== LISTAS =====
  idiomas: IdiomaOpcao[] = [
    { nome: 'Alemão', bandeira: 'assets/imgs/Flag_of_Germany.svg.png' },
    { nome: 'Árabe', bandeira: 'assets/imgs/Saudi_Arabia.svg' },
    { nome: 'Chinês (Mandarim)', bandeira: 'assets/imgs/China.svg' },
    { nome: 'Coreano', bandeira: 'assets/imgs/South_Korea.svg.webp' },
    { nome: 'Espanhol', bandeira: 'assets/imgs/Spain.svg' },
    { nome: 'Francês', bandeira: 'assets/imgs/Franca.png' },
    { nome: 'Hindi', bandeira: 'assets/imgs/India.svg' },
    { nome: 'Inglês (Estados Unidos)', bandeira: 'assets/imgs/Flag_of_the_United_States.svg' },
    { nome: 'Inglês (Reino Unido)', bandeira: 'assets/imgs/United_Kingdom.svg' },
    { nome: 'Italiano', bandeira: 'assets/imgs/Italy.svg' },
    { nome: 'Japonês', bandeira: 'assets/imgs/Japan.png' },
    { nome: 'Português (Brasil)', bandeira: 'assets/imgs/Brazil.svg' },
    { nome: 'Português (Portugal)', bandeira: 'assets/imgs/Flag_of_Portugal.svg.png' },
    { nome: 'Russo', bandeira: 'assets/imgs/Russia.svg' },
    { nome: 'Turco', bandeira: 'assets/imgs/Turkey.svg' }
  ].sort((a, b) => a.nome.localeCompare(b.nome));

  proficiencias = [
    'Todos os níveis',
    'Iniciante',
    'Básico',
    'Intermediário',
    'Avançado',
    'Fluente'
  ];

  /**
   * Fecha os dropdowns ao clicar fora
   */
  @HostListener('document:click', ['$event'])
  fecharDropdowns(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    if (!target.closest('.campo')) {
      this.mostrarIdiomas = false;
      this.mostrarProficiencia = false;
    }
  }

  /**
   * Fecha dropdowns ao pressionar ESC
   */
  @HostListener('document:keydown.escape')
  aoApertarEsc(): void {
    this.mostrarIdiomas = false;
    this.mostrarProficiencia = false;
  }

  // ===== GETTERS =====
  
  /**
   * Retorna idiomas filtrados pela busca
   */
  get idiomasFiltrados(): IdiomaOpcao[] {
    if (!this.buscaIdioma.trim()) {
      return this.idiomas;
    }

    const termo = this.buscaIdioma.toLowerCase().trim();
    return this.idiomas.filter(i =>
      i.nome.toLowerCase().includes(termo)
    );
  }

  /**
   * Verifica se todos os campos obrigatórios estão preenchidos
   */
  podeAvancar(): boolean {
    return !!(
      this.idiomaSelecionado &&
      this.proficiencia &&
      this.visibilidade
    );
  }

  // ===== MÉTODOS =====

  /**
   * Alterna visibilidade do dropdown de idiomas
   */
  toggleIdiomas(): void {
    this.mostrarIdiomas = !this.mostrarIdiomas;
    this.mostrarProficiencia = false;
    
    if (!this.mostrarIdiomas) {
      this.buscaIdioma = '';
    }
  }

  /**
   * Alterna visibilidade do dropdown de proficiência
   */
  toggleProficiencia(): void {
    this.mostrarProficiencia = !this.mostrarProficiencia;
    this.mostrarIdiomas = false;
  }

  /**
   * Seleciona um idioma
   */
  selecionarIdioma(idioma: IdiomaOpcao): void {
    this.idiomaSelecionado = idioma;
    this.mostrarIdiomas = false;
    this.buscaIdioma = '';
    
    console.log('Idioma selecionado:', idioma.nome);
  }

  /**
   * Seleciona um nível de proficiência
   */
  selecionarProficiencia(nivel: string): void {
    this.proficiencia = nivel;
    this.mostrarProficiencia = false;
    
    console.log('Proficiência selecionada:', nivel);
  }

  /**
   * Cancela o cadastro e volta para a página anterior
   */
  cancelar(): void {
    const confirmacao = confirm('Deseja realmente cancelar? Todos os dados serão perdidos.');
    
    if (confirmacao) {
      console.log('Cadastro cancelado');
      this.router.navigate(['/buscar-idioma']);
    }
  }

  /**
   * Avança para a próxima etapa do cadastro
   */
  avancar(): void {
    if (!this.podeAvancar()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const dadosCadastro = {
      idioma: this.idiomaSelecionado,
      proficiencia: this.proficiencia,
      visibilidade: this.visibilidade,
      dataCadastro: new Date()
    };

    console.log('Dados do cadastro:', dadosCadastro);

    // Aqui você pode:
    // 1. Salvar no localStorage
    localStorage.setItem('cadastro-idioma-temp', JSON.stringify(dadosCadastro));

    // 2. Navegar para próxima etapa
    // this.router.navigate(['/cadastrar-idioma/modulos']);

    // 3. Ou enviar para o backend
    // this.idiomaService.cadastrar(dadosCadastro).subscribe(...)

    alert('Dados salvos com sucesso! Próxima etapa: configurar módulos.');
  }

  /**
   * Reseta o formulário
   */
  resetarFormulario(): void {
    this.idiomaSelecionado = null;
    this.proficiencia = '';
    this.visibilidade = 'publico';
    this.buscaIdioma = '';
    this.mostrarIdiomas = false;
    this.mostrarProficiencia = false;
  }
}