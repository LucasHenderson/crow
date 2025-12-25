import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Idioma {
  nome: string;
  bandeira: string;
  nota: number; // 1 a 5
  modulos: number; // até 20
  descricao: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {

  idiomas: Idioma[] = [];

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
        descricao: 'Idioma global, utilizado em negócios, tecnologia e viagens ao redor do mundo.'
      },
      {
        nome: 'Japonês',
        bandeira: '../../../assets/imgs/Japan-Flag.png',
        nota: 5,
        modulos: 20,
        descricao: 'Idioma rico culturalmente, com foco em escrita complexa e conversação formal.'
      },
      {
        nome: 'Espanhol',
        bandeira: '../../../assets/imgs/Spain-Flag.svg',
        nota: 3,
        modulos: 12,
        descricao: 'Idioma amplamente falado na América Latina, Europa e em diversas comunidades.'
      },
      {
        nome: 'Russo',
        bandeira: '../../../assets/imgs/Russia-Flag.svg',
        nota: 4,
        modulos: 15,
        descricao: 'Idioma desafiador, com alfabeto cirílico próprio e estrutura gramatical complexa.'
      }
    ];

    const novoIdioma = exemplos[this.idiomas.length];
    this.idiomas.push(novoIdioma);
    
    console.log(`Idioma ${novoIdioma.nome} adicionado com sucesso!`);
  }

  selecionarIdioma(idioma: Idioma): void {
    console.log('Idioma selecionado:', idioma.nome);
    // Aqui você pode adicionar navegação ou outras ações
  }

  estrelasArray(nota: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < nota);
  }

  calcularProgresso(modulos: number): number {
    return Math.round((modulos / 20) * 100);
  }
}