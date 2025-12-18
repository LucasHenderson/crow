import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Idioma {
  id: string;
  nome: string;
  idioma: string;
  bandeira: string;
  modulos: number;
  avaliacao: number;
  criadoEm: Date;
  visibilidade: boolean;
}

@Component({
  selector: 'app-buscar-idioma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar-idioma.html',
  styleUrl: './buscar-idioma.css',
})
export class BuscarIdioma {

  busca = '';

  mostrarOrdenacao = false;
  criterio: 'avaliacao' | 'data' = 'avaliacao';
  direcao: 'asc' | 'desc' = 'desc';

  paginaAtual = 1;
  porPagina = 9;

  idiomas: Idioma[] = [
    {
      id: '000001',
      nome: 'Japonês para iniciantes',
      idioma: 'Japonês',
      bandeira: '../../../assets/imgs/Japan.png',
      modulos: 20,
      avaliacao: 5,
      criadoEm: new Date('2024-05-01'),
      visibilidade: true,
    },
    {
      id: '000002',
      nome: 'Inglês para informática',
      idioma: 'Inglês',
      bandeira: '../../../assets/imgs/Flag_of_the_United_States.svg',
      modulos: 18,
      avaliacao: 4,
      criadoEm: new Date('2024-04-12'),
      visibilidade: true,
    },
    {
      id: '000003',
      nome: 'Comidas Russas',
      idioma: 'Russo',
      bandeira: '../../../assets/imgs/Russia.svg',
      modulos: 15,
      avaliacao: 3,
      criadoEm: new Date('2024-03-22'),
      visibilidade: true,
    },
    {
      id: '000004',
      nome: 'Espanhol para turismo',
      idioma: 'Espanhol',
      bandeira: '../../../assets/imgs/Spain.svg',
      modulos: 16,
      avaliacao: 4,
      criadoEm: new Date('2024-06-10'),
      visibilidade: true,
    },
    {
      id: '000005',
      nome: 'Francês básico',
      idioma: 'Francês',
      bandeira: '../../../assets/imgs/Franca.png',
      modulos: 12,
      avaliacao: 3,
      criadoEm: new Date('2024-02-18'),
      visibilidade: true,
    },
    {
      id: '000006',
      nome: 'Alemão técnico',
      idioma: 'Alemão',
      bandeira: '../../../assets/imgs/Flag_of_Germany.svg.png',
      modulos: 14,
      avaliacao: 4,
      criadoEm: new Date('2024-07-05'),
      visibilidade: true,
    },
    {
      id: '000007',
      nome: 'Mandarim para negócios',
      idioma: 'Mandarim',
      bandeira: '../../../assets/imgs/China.svg',
      modulos: 19,
      avaliacao: 5,
      criadoEm: new Date('2024-08-20'),
      visibilidade: true,
    },
    {
      id: '000008',
      nome: 'Italiano culinário',
      idioma: 'Italiano',
      bandeira: '../../../assets/imgs/Italy.svg',
      modulos: 11,
      avaliacao: 4,
      criadoEm: new Date('2024-01-30'),
      visibilidade: true,
    },
    {
      id: '000009',
      nome: 'Coreano para K-pop',
      idioma: 'Coreano',
      bandeira: '../../../assets/imgs/South_Korea.svg.webp',
      modulos: 17,
      avaliacao: 5,
      criadoEm: new Date('2024-09-12'),
      visibilidade: true,
    },
    {
      id: '000010',
      nome: 'Português europeu',
      idioma: 'Português',
      bandeira: '../../../assets/imgs/Flag_of_Portugal.svg.png',
      modulos: 13,
      avaliacao: 3,
      criadoEm: new Date('2024-04-25'),
      visibilidade: true,
    },
  ];

  constructor(private router: Router) {}

  /**
   * Fecha o menu de ordenação ao clicar fora
   */
  @HostListener('document:click', ['$event'])
  fecharMenuOrdenacao(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.ordenar-wrapper')) {
      this.mostrarOrdenacao = false;
    }
  }

  /**
   * Alterna visibilidade do menu de ordenação
   */
  toggleOrdenacao(): void {
    this.mostrarOrdenacao = !this.mostrarOrdenacao;
  }

  /**
   * 🔍 BUSCA - Filtra idiomas baseado no texto de busca
   */
  onBuscar(valor: string): void {
    this.busca = valor.trim();
    this.paginaAtual = 1; // Volta para primeira página ao buscar
  }

  /**
   * 📊 ORDENAÇÃO - Altera o critério de ordenação
   */
  alterarCriterio(novo: 'avaliacao' | 'data'): void {
    if (this.criterio === novo) {
      this.toggleDirecao();
    } else {
      this.criterio = novo;
      this.direcao = 'desc';
    }
    this.paginaAtual = 1;
    this.mostrarOrdenacao = false;
  }

  /**
   * Inverte a direção da ordenação
   */
  toggleDirecao(): void {
    this.direcao = this.direcao === 'asc' ? 'desc' : 'asc';
  }

  /**
   * 📄 PAGINAÇÃO - Avança para próxima página
   */
  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas()) {
      this.paginaAtual++;
      this.scrollToTop();
    }
  }

  /**
   * Volta para página anterior
   */
  paginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
      this.scrollToTop();
    }
  }

  /**
   * Scroll suave para o topo ao mudar de página
   */
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Retorna idiomas filtrados pela busca
   */
  get idiomasFiltrados(): Idioma[] {
    if (!this.busca) {
      return this.ordenarIdiomas(this.idiomas);
    }

    const termo = this.busca.toLowerCase();
    const filtrados = this.idiomas.filter(i =>
      i.id.toLowerCase().includes(termo) ||
      i.nome.toLowerCase().includes(termo) ||
      i.idioma.toLowerCase().includes(termo)
    );

    return this.ordenarIdiomas(filtrados);
  }

  /**
   * Ordena os idiomas baseado no critério selecionado
   */
  private ordenarIdiomas(idiomas: Idioma[]): Idioma[] {
    return [...idiomas].sort((a, b) => {
      const valA = this.criterio === 'avaliacao'
        ? a.avaliacao
        : a.criadoEm.getTime();

      const valB = this.criterio === 'avaliacao'
        ? b.avaliacao
        : b.criadoEm.getTime();

      return this.direcao === 'asc' ? valA - valB : valB - valA;
    });
  }

  /**
   * Retorna idiomas da página atual
   */
  get paginados(): Idioma[] {
    const inicio = (this.paginaAtual - 1) * this.porPagina;
    return this.idiomasFiltrados.slice(inicio, inicio + this.porPagina);
  }

  /**
   * Calcula o total de páginas
   */
  totalPaginas(): number {
    return Math.ceil(this.idiomasFiltrados.length / this.porPagina);
  }

  /**
   * Retorna array de booleanos para renderizar estrelas
   */
  estrelas(nota: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < nota);
  }

  /**
   * Calcula a porcentagem de progresso dos módulos
   */
  calcularProgresso(modulos: number): number {
    return Math.round((modulos / 20) * 100);
  }

  /**
   * Texto dinâmico para o título dos resultados
   */
  get resultadosTexto(): string {
    const total = this.idiomasFiltrados.length;
    
    if (this.busca) {
      return total === 0 
        ? 'NENHUM RESULTADO' 
        : total === 1 
          ? '1 RESULTADO ENCONTRADO'
          : `${total} RESULTADOS ENCONTRADOS`;
    }
    
    return total === 1 
      ? '1 IDIOMA DISPONÍVEL' 
      : `${total} IDIOMAS DISPONÍVEIS`;
  }

  /**
   * Navega para o formulário de cadastro de novo idioma
   */
  irParaCadastro(): void {
    console.log('Navegando para cadastro de idioma...');
    // this.router.navigate(['/idioma/novo']);
  }

  /**
   * Seleciona um idioma para visualização detalhada
   */
  selecionarIdioma(idioma: Idioma): void {
    console.log('Idioma selecionado:', idioma);
    // this.router.navigate(['/idioma', idioma.id]);
  }
}