import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

interface PalavraTrad {
  palavra: string;
  traducao: string;
}

interface Par {
  imagem?: string;
  palavra: string;
  traducao: string;
}

interface Frase {
  id: number;
  modo: 'traducao' | 'pares' | 'quiz';
  modoNome: string;
  modoIcone: SafeHtml;
  
  // Tradução Direta
  traducaoCompleta?: string;
  palavras?: PalavraTrad[];
  imagem?: string;
  observacoes?: string;
  links?: string[];
  
  // Selecionar Pares
  pares?: Par[];
  
  // Quiz
  imagemQuiz?: string;
  videoQuiz?: SafeResourceUrl;
  pergunta?: string;
  alternativas?: string[];
}

@Component({
  selector: 'app-visualizar-modulo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualizar-modulo.html',
  styleUrl: './visualizar-modulo.css',
})
export class VisualizarModulo implements OnInit {
  
  moduloId: string = '';
  moduloNome: string = 'Saudações Básicas';
  moduloIcone: SafeHtml = '';
  dataAtualizacao: string = '';
  
  frases: Frase[] = [];
  frasesPaginadas: Frase[] = [];
  totalFrases: number = 0;
  
  // Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalPaginas: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Pega o ID do módulo da rota
    this.moduloId = this.route.snapshot.paramMap.get('id') || '';
    
    // Carrega dados do módulo (simulação)
    this.carregarModulo();
    
    // Carrega frases (simulação)
    this.carregarFrases();
    
    // Define data de atualização
    this.dataAtualizacao = this.formatarData(new Date());
  }

  carregarModulo(): void {
    // Aqui você buscaria os dados do módulo do backend ou localStorage
    // Por enquanto, vamos usar dados simulados
    
    const iconeSVG = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>';
    this.moduloIcone = this.sanitizer.bypassSecurityTrustHtml(iconeSVG);
  }

  carregarFrases(): void {
    // Simulação de dados - aqui você buscaria do backend ou localStorage
    this.frases = [
      {
        id: 1,
        modo: 'traducao',
        modoNome: 'Tradução Direta',
        modoIcone: this.sanitizer.bypassSecurityTrustHtml('<path d="M5 8h8M9 7v1M12 15l-2-2 2-2M17 15l2-2-2-2"/><rect x="14" y="10" width="7" height="10" rx="1"/>'),
        traducaoCompleta: 'Bom dia! Como você está?',
        palavras: [
          { palavra: 'Bom dia', traducao: 'Good morning' },
          { palavra: 'Como você está?', traducao: 'How are you?' }
        ],
        imagem: 'assets/imgs/example.jpg',
        observacoes: 'Expressão formal comum em contextos profissionais.',
        links: ['https://www.exemplo.com/artigo1', 'https://www.exemplo.com/artigo2']
      },
      {
        id: 2,
        modo: 'pares',
        modoNome: 'Selecionar Pares',
        modoIcone: this.sanitizer.bypassSecurityTrustHtml('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
        pares: [
          { palavra: 'Gato', traducao: 'Cat', imagem: 'assets/imgs/cat.jpg' },
          { palavra: 'Cachorro', traducao: 'Dog', imagem: 'assets/imgs/dog.jpg' },
          { palavra: 'Pássaro', traducao: 'Bird' }
        ]
      },
      {
        id: 3,
        modo: 'quiz',
        modoNome: 'Quiz',
        modoIcone: this.sanitizer.bypassSecurityTrustHtml('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
        imagemQuiz: 'assets/imgs/quiz-example.jpg',
        pergunta: 'Qual é a tradução correta de "Hello" em português?',
        alternativas: ['Olá', 'Tchau', 'Bom dia', 'Boa noite']
      },
      {
        id: 4,
        modo: 'quiz',
        modoNome: 'Quiz',
        modoIcone: this.sanitizer.bypassSecurityTrustHtml('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
        videoQuiz: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/E8N8CAihLT0?si=GX96kXDofoDg6oAM'),
        pergunta: 'Com base no vídeo, qual é o tema principal?',
        alternativas: ['Música', 'História', 'Ciência', 'Tecnologia']
      },
      {
        id: 5,
        modo: 'traducao',
        modoNome: 'Tradução Direta',
        modoIcone: this.sanitizer.bypassSecurityTrustHtml('<path d="M5 8h8M9 7v1M12 15l-2-2 2-2M17 15l2-2-2-2"/><rect x="14" y="10" width="7" height="10" rx="1"/>'),
        traducaoCompleta: 'Muito obrigado pela ajuda!',
        palavras: [
          { palavra: 'Muito obrigado', traducao: 'Thank you very much' },
          { palavra: 'pela ajuda', traducao: 'for the help' }
        ]
      }
    ];

    this.totalFrases = this.frases.length;
    this.calcularPaginacao();
    this.atualizarFrasesPaginadas();
  }

  calcularPaginacao(): void {
    this.totalPaginas = Math.ceil(this.totalFrases / this.itensPorPagina);
  }

  atualizarFrasesPaginadas(): void {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.frasesPaginadas = this.frases.slice(inicio, fim);
    
    // Scroll para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      this.atualizarFrasesPaginadas();
    }
  }

  getPaginasVisiveis(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisiveis = 5;
    
    let inicio = Math.max(1, this.paginaAtual - Math.floor(maxPaginasVisiveis / 2));
    let fim = Math.min(this.totalPaginas, inicio + maxPaginasVisiveis - 1);
    
    // Ajusta o início se não houver páginas suficientes no final
    if (fim - inicio < maxPaginasVisiveis - 1) {
      inicio = Math.max(1, fim - maxPaginasVisiveis + 1);
    }
    
    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  getNumeroFrase(indexPagina: number): number {
    return (this.paginaAtual - 1) * this.itensPorPagina + indexPagina + 1;
  }

  getLetraAlternativa(index: number): string {
    return String.fromCharCode(65 + index);
  }

  formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
  }

  voltarParaLista(): void {
    this.router.navigate(['/buscar-idioma']);
  }

  adicionarFrase(): void {
    // Navegar para página de cadastro de frase
    this.router.navigate(['/cadastrar-frase', this.moduloId]);
  }

  editarFrase(frase: Frase): void {
    // Navegar para página de edição de frase
    this.router.navigate(['/editar-frase', this.moduloId, frase.id]);
  }

  excluirFrase(frase: Frase, index: number): void {
    const confirmacao = confirm(`Deseja realmente excluir a frase #${this.getNumeroFrase(index)}?`);
    
    if (confirmacao) {
      // Remove a frase do array
      const indexGlobal = this.frases.findIndex(f => f.id === frase.id);
      if (indexGlobal !== -1) {
        this.frases.splice(indexGlobal, 1);
        this.totalFrases = this.frases.length;
        
        // Recalcula paginação
        this.calcularPaginacao();
        
        // Se a página atual ficou vazia e não é a primeira, volta uma página
        if (this.frasesPaginadas.length === 1 && this.paginaAtual > 1) {
          this.paginaAtual--;
        }
        
        // Atualiza frases exibidas
        this.atualizarFrasesPaginadas();
        
        // Aqui você faria a chamada para deletar no backend
        console.log(`Frase ${frase.id} excluída com sucesso`);
        
        // Mostra mensagem de sucesso
        alert('Frase excluída com sucesso!');
      }
    }
  }
}