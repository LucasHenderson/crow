import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Idioma {
  nome: string;
  bandeira: string;
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

  adicionarIdioma() {
    if (this.idiomas.length >= 4) return;

    const exemplos: Idioma[] = [
      { nome: 'Inglês', bandeira: '../../../assets/imgs/Flag_of_the_United_States.svg' },
      { nome: 'Japonês', bandeira: '../../../assets/imgs/Japan.png' },
      { nome: 'Espanhol', bandeira: '../../../assets/imgs/Spain.svg' },
      { nome: 'Russo', bandeira: '../../../assets/imgs/Russia.svg' }
    ];

    this.idiomas.push(exemplos[this.idiomas.length]);
  }
}
