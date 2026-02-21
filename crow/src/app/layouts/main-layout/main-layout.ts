import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from '../../components/topbar/topbar';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Topbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
    protected readonly title = signal('crow');

    topbarVisible = false; // Controle global da topbar

    toggleTopbar() {
      this.topbarVisible = !this.topbarVisible;
    }
}
