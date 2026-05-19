import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IdiomaBusca as Idioma, Proficiencia } from '../../models/idioma.model';
import { IdiomaService } from '../../services/idioma.service';

@Component({
  selector: 'app-buscar-idioma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar-idioma.html',
  styleUrl: './buscar-idioma.css',
})
export class BuscarIdioma implements OnInit {

  busca = '';

  mostrarOrdenacao = false;
  mostrarProficiencia = false;

  criterio: 'avaliacao' | 'data' = 'avaliacao';
  direcao: 'asc' | 'desc' = 'desc';

  proficienciaSelecionada: Proficiencia | null = null;

  paginaAtual = 1;
  porPagina = 9;
  carregando = true;

  idiomas: Idioma[] = [];

  constructor(
    private router: Router,
    private idiomaService: IdiomaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarIdiomas();
  }

  carregarIdiomas(): void {
    this.carregando = true;
    this.idiomaService.buscarIdiomas().subscribe({
      next: (idiomas) => {
        this.idiomas = idiomas;
        this.carregando = false;
        // App em modo zoneless: a atualização assíncrona não dispara
        // change detection sozinha — força a renderização da lista.
        this.cdr.detectChanges();
      },
      error: () => {
        this.idiomas = [];
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

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
        i.codigo.toLowerCase().includes(termo) ||
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
   * Abre a página de visualização do idioma selecionado, passando o ID
   * para que os dados, módulos e proprietário sejam carregados corretamente.
   */
  selecionarIdioma(idioma: Idioma): void {
    this.router.navigate(['/visualizar-idioma'], {
      queryParams: { id: idioma.id }
    });
  }
}