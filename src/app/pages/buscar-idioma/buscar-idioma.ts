import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';


type Proficiencia = 'iniciante' | 'basico' | 'intermediario' | 'avancado' | 'fluente';

interface Idioma {
  id: string;
  nome: string;
  idioma: string;
  bandeira: string;
  modulos: number;
  avaliacao: number;
  criadoEm: Date;
  proficiencia: Proficiencia;
}

@Component({
  selector: 'app-buscar-idioma',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './buscar-idioma.html',
  styleUrl: './buscar-idioma.css',
})
export class BuscarIdioma {

  busca = '';

  mostrarOrdenacao = false;
  mostrarProficiencia = false;
  
  criterio: 'avaliacao' | 'data' = 'avaliacao';
  direcao: 'asc' | 'desc' = 'desc';
  
  proficienciaSelecionada: Proficiencia | null = null;

  paginaAtual = 1;
  porPagina = 9;

  idiomas: Idioma[] = [
    {
      id: '000001',
      nome: 'Japonês para iniciantes',
      idioma: 'Japonês',
      bandeira: '../../../assets/imgs/Japan-Flag.png',
      modulos: 5,
      avaliacao: 5,
      criadoEm: new Date('2024-05-01'),
      proficiencia: 'iniciante'
    },
    {
      id: '000002',
      nome: 'Inglês para informática',
      idioma: 'Inglês',
      bandeira: '../../../assets/imgs/United-States-Flag.svg',
      modulos: 18,
      avaliacao: 4,
      criadoEm: new Date('2024-04-12'),
      proficiencia: 'avancado'
    },
    {
      id: '000003',
      nome: 'Comidas Russas',
      idioma: 'Russo',
      bandeira: '../../../assets/imgs/Russia-Flag.svg',
      modulos: 15,
      avaliacao: 3,
      criadoEm: new Date('2024-03-22'),
      proficiencia: 'intermediario'
    },
    {
      id: '000004',
      nome: 'Espanhol para turismo',
      idioma: 'Espanhol',
      bandeira: '../../../assets/imgs/Spain-Flag.svg',
      modulos: 8,
      avaliacao: 4,
      criadoEm: new Date('2024-06-10'),
      proficiencia: 'basico'
    },
    {
      id: '000005',
      nome: 'Francês básico',
      idioma: 'Francês',
      bandeira: '../../../assets/imgs/France-Flag.png',
      modulos: 7,
      avaliacao: 3,
      criadoEm: new Date('2024-02-18'),
      proficiencia: 'basico'
    },
    {
      id: '000006',
      nome: 'Alemão técnico',
      idioma: 'Alemão',
      bandeira: '../../../assets/imgs/Germany-Flag.svg.png',
      modulos: 14,
      avaliacao: 4,
      criadoEm: new Date('2024-07-05'),
      proficiencia: 'intermediario'
    },
    {
      id: '000007',
      nome: 'Mandarim para negócios',
      idioma: 'Mandarim',
      bandeira: '../../../assets/imgs/China-Flag.svg',
      modulos: 20,
      avaliacao: 5,
      criadoEm: new Date('2024-08-20'),
      proficiencia: 'fluente'
    },
    {
      id: '000008',
      nome: 'Italiano culinário',
      idioma: 'Italiano',
      bandeira: '../../../assets/imgs/Italy-Flag.svg',
      modulos: 11,
      avaliacao: 4,
      criadoEm: new Date('2024-01-30'),
      proficiencia: 'intermediario'
    },
    {
      id: '000009',
      nome: 'Coreano para K-pop',
      idioma: 'Coreano',
      bandeira: '../../../assets/imgs/South-Korea-Flag.svg.webp',
      modulos: 17,
      avaliacao: 5,
      criadoEm: new Date('2024-09-12'),
      proficiencia: 'avancado'
    },
    {
      id: '000010',
      nome: 'Português europeu',
      idioma: 'Português',
      bandeira: '../../../assets/imgs/Portugal-Flag.svg.png',
      modulos: 13,
      avaliacao: 3,
      criadoEm: new Date('2024-04-25'),
      proficiencia: 'intermediario'
    },
    {
      id: '000011',
      nome: 'Árabe iniciante',
      idioma: 'Árabe',
      bandeira: '../../../assets/imgs/United-Arab-Emirates-Flag.svg.png',
      modulos: 3,
      avaliacao: 4,
      criadoEm: new Date('2024-10-15'),
      proficiencia: 'iniciante'
    },
    {
      id: '000012',
      nome: 'Inglês fluente - Business',
      idioma: 'Inglês',
      bandeira: '../../../assets/imgs/United-States-Flag.svg',
      modulos: 20,
      avaliacao: 5,
      criadoEm: new Date('2024-11-01'),
      proficiencia: 'fluente'
    },
  ];

  constructor(private router: Router) {}

  /**
   * Fecha os menus ao clicar fora
   */
  @HostListener('document:click', ['$event'])
  fecharMenus(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    if (!target.closest('.ordenar-wrapper')) {
      this.mostrarOrdenacao = false;
    }
    
    if (!target.closest('.proficiencia-wrapper')) {
      this.mostrarProficiencia = false;
    }
  }

  /**
   * Alterna visibilidade do menu de ordenação
   */
  toggleOrdenacao(): void {
    this.mostrarOrdenacao = !this.mostrarOrdenacao;
    if (this.mostrarOrdenacao) {
      this.mostrarProficiencia = false;
    }
  }

  /**
   * Alterna visibilidade do menu de proficiência
   */
  toggleProficiencia(): void {
    this.mostrarProficiencia = !this.mostrarProficiencia;
    if (this.mostrarProficiencia) {
      this.mostrarOrdenacao = false;
    }
  }

  /**
   * 🔍 BUSCA - Filtra idiomas baseado no texto de busca
   */
  onBuscar(valor: string): void {
    this.busca = valor.trim();
    this.paginaAtual = 1;
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
   * 🎯 PROFICIÊNCIA - Filtra por nível de proficiência
   */
  filtrarPorProficiencia(nivel: Proficiencia | null): void {
    this.proficienciaSelecionada = nivel;
    this.paginaAtual = 1;
    this.mostrarProficiencia = false;
  }

  /**
   * Retorna o nome formatado da proficiência
   */
  getNomeProficiencia(proficiencia: Proficiencia): string {
    const nomes = {
      'iniciante': 'Iniciante',
      'basico': 'Básico',
      'intermediario': 'Intermediário',
      'avancado': 'Avançado',
      'fluente': 'Fluente'
    };
    return nomes[proficiencia];
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
   * Retorna idiomas filtrados pela busca e proficiência
   */
  get idiomasFiltrados(): Idioma[] {
    let resultado = this.idiomas;

    // Filtro de busca
    if (this.busca) {
      const termo = this.busca.toLowerCase();
      resultado = resultado.filter(i =>
        i.id.toLowerCase().includes(termo) ||
        i.nome.toLowerCase().includes(termo) ||
        i.idioma.toLowerCase().includes(termo)
      );
    }

    // Filtro de proficiência
    if (this.proficienciaSelecionada) {
      resultado = resultado.filter(i => i.proficiencia === this.proficienciaSelecionada);
    }

    return this.ordenarIdiomas(resultado);
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
    
    if (this.busca || this.proficienciaSelecionada) {
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
    this.router.navigate(['cadastrar-idioma']);
  }

  /**
   * Seleciona um idioma para visualização detalhada
   */
  selecionarIdioma(idioma: Idioma): void {
    console.log('Idioma selecionado:', idioma);
    // this.router.navigate(['/idioma', idioma.id]);
  }
}