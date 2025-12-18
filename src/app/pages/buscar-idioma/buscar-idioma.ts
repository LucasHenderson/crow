import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Idioma {
  id: string;
  nome: string;
  idioma: string;
  bandeira: string;
  modulos: number;
  avaliacao: number;
  criadoEm: Date;
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
  porPagina = 8;

  idiomas: Idioma[] = [
    {
      id: '000001',
      nome: 'Japonês para iniciantes',
      idioma: 'Japonês',
      bandeira: '../../../assets/imgs/Japan.png',
      modulos: 20,
      avaliacao: 5,
      criadoEm: new Date('2024-05-01')
    },
    {
      id: '000002',
      nome: 'Inglês para informática',
      idioma: 'Inglês',
      bandeira: '../../../assets/imgs/Flag_of_the_United_States.svg',
      modulos: 18,
      avaliacao: 4,
      criadoEm: new Date('2024-04-12')
    },
    {
      id: '000003',
      nome: 'Comidas Russas',
      idioma: 'Russo',
      bandeira: '../../../assets/imgs/Russia.svg',
      modulos: 15,
      avaliacao: 3,
      criadoEm: new Date('2024-03-22')
    },
    {
      id: '000002',
      nome: 'Inglês para informática',
      idioma: 'Inglês',
      bandeira: '../../../assets/imgs/Flag_of_the_United_States.svg',
      modulos: 18,
      avaliacao: 4,
      criadoEm: new Date('2024-04-12')
    },
    {
      id: '000002',
      nome: 'Inglês para informática',
      idioma: 'Inglês',
      bandeira: '../../../assets/imgs/Flag_of_the_United_States.svg',
      modulos: 18,
      avaliacao: 4,
      criadoEm: new Date('2024-04-12')
    },
    {
      id: '000002',
      nome: 'Inglês para informática',
      idioma: 'Inglês',
      bandeira: '../../../assets/imgs/Flag_of_the_United_States.svg',
      modulos: 18,
      avaliacao: 4,
      criadoEm: new Date('2024-04-12')
    },
    {
      id: '000002',
      nome: 'Inglês para informática',
      idioma: 'Inglês',
      bandeira: '../../../assets/imgs/Flag_of_the_United_States.svg',
      modulos: 18,
      avaliacao: 4,
      criadoEm: new Date('2024-04-12')
    },
    {
      id: '000002',
      nome: 'Inglês para informática',
      idioma: 'Inglês',
      bandeira: '../../../assets/imgs/Flag_of_the_United_States.svg',
      modulos: 18,
      avaliacao: 4,
      criadoEm: new Date('2024-04-12')
    },
    {
      id: '000002',
      nome: 'Inglês para informática',
      idioma: 'Inglês',
      bandeira: '../../../assets/imgs/Flag_of_the_United_States.svg',
      modulos: 18,
      avaliacao: 4,
      criadoEm: new Date('2024-04-12')
    },
    {
      id: '000002',
      nome: 'Inglês para informática',
      idioma: 'Inglês',
      bandeira: '../../../assets/imgs/Flag_of_the_United_States.svg',
      modulos: 18,
      avaliacao: 4,
      criadoEm: new Date('2024-04-12')
    },
    {
      id: '000002',
      nome: 'Inglês para informática',
      idioma: 'Inglês',
      bandeira: '../../../assets/imgs/Flag_of_the_United_States.svg',
      modulos: 18,
      avaliacao: 4,
      criadoEm: new Date('2024-04-12')
    },
  ];

  get idiomasFiltrados() {
    let lista = this.idiomas.filter(i =>
      `${i.id} ${i.nome} ${i.idioma}`.toLowerCase().includes(this.busca.toLowerCase())
    );

    lista.sort((a, b) => {
      let valorA = this.criterio === 'avaliacao' ? a.avaliacao : a.criadoEm.getTime();
      let valorB = this.criterio === 'avaliacao' ? b.avaliacao : b.criadoEm.getTime();
      return this.direcao === 'asc' ? valorA - valorB : valorB - valorA;
    });

    return lista;
  }

  get paginados() {
    const inicio = (this.paginaAtual - 1) * this.porPagina;
    return this.idiomasFiltrados.slice(inicio, inicio + this.porPagina);
  }

  totalPaginas() {
    return Math.ceil(this.idiomasFiltrados.length / this.porPagina);
  }

  estrelas(nota: number) {
    return Array.from({ length: 5 }, (_, i) => i < nota);
  }

  toggleOrdenacao() {
    this.mostrarOrdenacao = !this.mostrarOrdenacao;
  }

  alterarDirecao() {
    this.direcao = this.direcao === 'asc' ? 'desc' : 'asc';
  }

  irParaCadastro() {
    console.log('Ir para página de cadastro');
  }
}
