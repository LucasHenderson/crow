import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-termos-de-uso',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './termos-de-uso.html',
  styleUrl: './termos-de-uso.css',
})
export class TermosDeUso {

  constructor(
    private router: Router,
    private location: Location
  ) {}

  /** Volta para a página anterior (respeita o histórico) ou para o login. */
  voltar(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/login']);
    }
  }
}
