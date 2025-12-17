import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

type CamposSenha = {
  senhaAtual: boolean;
  novaSenha: boolean;
  confirmarSenha: boolean;
};

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  profileMenuOpen = false;
  showSuccessAlert = false;
  successMessage = '';

  user = {
    nome: 'Lucas Henderson',
    email: 'lucas@gmail.com',
    pais: 'Brasil',
    telefone: '+55 (63) 99999-9999',
    dataEntrada: '2023-01-15',
  };

  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';

  camposVisiveis: CamposSenha = {
    senhaAtual: false,
    novaSenha: false,
    confirmarSenha: false,
  };

  constructor(private router: Router) {}

  toggleProfileMenu(event: MouseEvent) {
    event.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  @HostListener('document:click')
  closeProfileMenu() {
    this.profileMenuOpen = false;
  }

  togglePassword(field: keyof CamposSenha) {
    this.camposVisiveis[field] = !this.camposVisiveis[field];
  }

  salvar() {
    if (this.senhaAtual || this.novaSenha || this.confirmarSenha) {
      if (!this.senhaAtual) {
        this.showError('Informe a senha atual.');
        return;
      }
      if (this.novaSenha.length < 6) {
        this.showError('A nova senha deve ter ao menos 6 caracteres.');
        return;
      }
      if (this.novaSenha !== this.confirmarSenha) {
        this.showError('A nova senha e a confirmação não coincidem.');
        return;
      }
      this.showSuccess('Senha alterada com sucesso!');
      this.limparCamposSenha();
    } else {
      this.showSuccess('Dados do perfil atualizados com sucesso!');
    }
  }

  limparCamposSenha() {
    this.senhaAtual = '';
    this.novaSenha = '';
    this.confirmarSenha = '';
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessAlert = true;
    setTimeout(() => {
      this.showSuccessAlert = false;
    }, 3000);
  }

  showError(message: string) {
    alert(message);
  }

  getInitials(): string {
    if (!this.user.nome) return 'U';
    const names = this.user.nome.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0);
    }
    return this.user.nome.charAt(0);
  }
}