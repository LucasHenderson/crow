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
  mostrarIdioma = false;

  criterio: 'avaliacao' | 'data' = 'avaliacao';
  direcao: 'asc' | 'desc' = 'desc';

  /** Niveis do filtro de proficiencia, na ordem de progressao. */
  readonly niveis: Proficiencia[] = ['iniciante', 'basico', 'intermediario', 'avancado', 'fluente'];

  /** Filtros multiplos: vazio = sem restricao (mostra tudo). */
  proficienciasSelecionadas: Proficiencia[] = [];
  idiomasSelecionados: string[] = [];

  /** Idiomas realmente presentes nos resultados carregados. */
  opcoesIdioma: string[] = [];

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

  /**
   * A busca só é aberta pela home, então o Voltar leva sempre para lá. O
   * antigo `location.back()` prendia o usuário em ciclo: o Voltar do idioma
   * empilha esta página de novo, e "voltar" daqui reabria o idioma visitado.
   */
  voltar(): void {
    this.router.navigate(['/home']);
  }

  carregarIdiomas(): void {
    this.carregando = true;
    this.idiomaService.buscarIdiomas().subscribe({
      next: (idiomas) => {
        this.idiomas = idiomas;
        this.opcoesIdioma = this.extrairOpcoesIdioma(idiomas);
        this.carregando = false;
        // App em modo zoneless: a atualização assíncrona não dispara
        // change detection sozinha — força a renderização da lista.
        this.cdr.detectChanges();
      },
      error: () => {
        this.idiomas = [];
        this.opcoesIdioma = [];
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Monta a lista de opções do filtro de idioma a partir dos registros
   * carregados — nada de lista fixa: só aparece o que existe nos resultados.
   */
  private extrairOpcoesIdioma(idiomas: Idioma[]): string[] {
    const nomes = new Set<string>();
    for (const idioma of idiomas) {
      const nome = (idioma.idioma ?? '').trim();
      if (nome) {
        nomes.add(nome);
      }
    }
    return [...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR'));
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

    if (!target.closest('.idioma-wrapper')) {
      this.mostrarIdioma = false;
    }
  }

  /**
   * Alterna visibilidade do menu de ordenação
   */
  toggleOrdenacao(): void {
    this.mostrarOrdenacao = !this.mostrarOrdenacao;
    if (this.mostrarOrdenacao) {
      this.mostrarProficiencia = false;
      this.mostrarIdioma = false;
    }
  }

  /**
   * Alterna visibilidade do menu de proficiência
   */
  toggleProficiencia(): void {
    this.mostrarProficiencia = !this.mostrarProficiencia;
    if (this.mostrarProficiencia) {
      this.mostrarOrdenacao = false;
      this.mostrarIdioma = false;
    }
  }

  /**
   * Alterna visibilidade do menu de idioma
   */
  toggleIdioma(): void {
    this.mostrarIdioma = !this.mostrarIdioma;
    if (this.mostrarIdioma) {
      this.mostrarOrdenacao = false;
      this.mostrarProficiencia = false;
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
   * 🎯 PROFICIÊNCIA - Marca/desmarca um nível (seleção múltipla).
   * O menu continua aberto para permitir marcar vários de uma vez.
   */
  alternarProficiencia(nivel: Proficiencia): void {
    this.proficienciasSelecionadas = this.proficienciasSelecionadas.includes(nivel)
      ? this.proficienciasSelecionadas.filter(n => n !== nivel)
      : [...this.proficienciasSelecionadas, nivel];
    this.paginaAtual = 1;
  }

  /**
   * 🌐 IDIOMA - Marca/desmarca um idioma (seleção múltipla).
   */
  alternarIdioma(idioma: string): void {
    this.idiomasSelecionados = this.idiomasSelecionados.includes(idioma)
      ? this.idiomasSelecionados.filter(i => i !== idioma)
      : [...this.idiomasSelecionados, idioma];
    this.paginaAtual = 1;
  }

  proficienciaMarcada(nivel: Proficiencia): boolean {
    return this.proficienciasSelecionadas.includes(nivel);
  }

  idiomaMarcado(idioma: string): boolean {
    return this.idiomasSelecionados.includes(idioma);
  }

  /** Limpa apenas o filtro de proficiência (opção "Todos os níveis"). */
  limparProficiencia(): void {
    this.proficienciasSelecionadas = [];
    this.paginaAtual = 1;
  }

  /** Limpa apenas o filtro de idioma (opção "Todos os idiomas"). */
  limparIdioma(): void {
    this.idiomasSelecionados = [];
    this.paginaAtual = 1;
  }

  /** Há busca ou algum filtro aplicado? Controla o botão "Limpar filtros". */
  get temFiltrosAtivos(): boolean {
    return !!this.busca
      || this.proficienciasSelecionadas.length > 0
      || this.idiomasSelecionados.length > 0;
  }

  /** Zera busca e filtros (a ordenação é preservada). */
  limparFiltros(): void {
    this.busca = '';
    this.proficienciasSelecionadas = [];
    this.idiomasSelecionados = [];
    this.paginaAtual = 1;
    this.mostrarProficiencia = false;
    this.mostrarIdioma = false;
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
   * Retorna idiomas filtrados pela busca, pelo idioma e pela proficiência.
   * Filtros diferentes se combinam com E; opções do mesmo filtro, com OU.
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

    // Filtro de idioma (OU entre os selecionados)
    if (this.idiomasSelecionados.length > 0) {
      resultado = resultado.filter(i => this.idiomasSelecionados.includes(i.idioma));
    }

    // Filtro de proficiência (OU entre os selecionados)
    if (this.proficienciasSelecionadas.length > 0) {
      resultado = resultado.filter(i => this.proficienciasSelecionadas.includes(i.proficiencia));
    }

    return this.ordenarIdiomas(resultado);
  }

  /**
   * Ordena os idiomas baseado no critério selecionado
   */
  private ordenarIdiomas(idiomas: Idioma[]): Idioma[] {
    const sentido = this.direcao === 'asc' ? 1 : -1;

    if (this.criterio === 'data') {
      return [...idiomas].sort((a, b) => sentido * (a.criadoEm.getTime() - b.criadoEm.getTime()));
    }

    return [...idiomas].sort((a, b) => {
      // Sem avaliação não há nota a comparar: esses idiomas vão para o fim
      // nos dois sentidos, em vez de encabeçar a ordem crescente.
      const semNotaA = a.totalAvaliacoes === 0;
      const semNotaB = b.totalAvaliacoes === 0;
      if (semNotaA !== semNotaB) {
        return semNotaA ? 1 : -1;
      }

      // Compara as estrelas exibidas no card (a média com vírgula não entra);
      // com o mesmo número de estrelas, vem antes quem tem mais avaliações.
      const diferenca = sentido * (this.estrelasAcesas(a.avaliacao) - this.estrelasAcesas(b.avaliacao));
      return diferenca !== 0 ? diferenca : b.totalAvaliacoes - a.totalAvaliacoes;
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
    const acesas = this.estrelasAcesas(nota);
    return Array.from({ length: 5 }, (_, i) => i < acesas);
  }

  /**
   * Quantidade de estrelas acesas no card para a média: arredonda para cima
   * (4,1 acende 5). A ordenação usa o mesmo valor, para seguir o que se vê.
   */
  private estrelasAcesas(nota: number): number {
    return Math.ceil(nota);
  }

  /** Texto do número de avaliações exibido ao lado das estrelas. */
  textoAvaliacoes(total: number): string {
    if (total === 0) {
      return 'Sem avaliações';
    }
    return `${total.toLocaleString('pt-BR')} ${total === 1 ? 'avaliação' : 'avaliações'}`;
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

    if (this.temFiltrosAtivos) {
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
      queryParams: { id: idioma.codigo, origem: 'buscar-idioma' }
    });
  }
}
