import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

type CamposSenha = {
  senhaAtual: boolean;
  novaSenha: boolean;
  confirmarSenha: boolean;
};

interface Usuario {
  nome: string;
  email: string;
  pais: string;
  telefone: string;
  dataEntrada: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  profileMenuOpen = false;
  showSuccessAlert = false;
  successMessage = '';

  user: Usuario = {
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

  ngOnInit(): void {
    // Carregar dados do usuário do localStorage ou serviço
    this.carregarDadosUsuario();
  }

  /**
   * Carrega os dados do usuário do localStorage ou serviço de autenticação
   */
  private carregarDadosUsuario(): void {
    // Exemplo: buscar do localStorage
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      try {
        this.user = JSON.parse(usuarioSalvo);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    }

    // Ou buscar de um serviço de autenticação
    // this.authService.getUsuario().subscribe(user => {
    //   this.user = user;
    // });
  }

  /**
   * Salva os dados do usuário no localStorage
   */
  private salvarDadosUsuario(): void {
    localStorage.setItem('usuario', JSON.stringify(this.user));
  }

  /**
   * Alterna a visibilidade dos menus de perfil
   */
  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  /**
   * Fecha o menu de perfil ao clicar fora
   */
  @HostListener('document:click')
  closeProfileMenu(): void {
    this.profileMenuOpen = false;
  }

  /**
   * Alterna a visibilidade dos campos de senha
   */
  togglePassword(field: keyof CamposSenha): void {
    this.camposVisiveis[field] = !this.camposVisiveis[field];
  }

  /**
   * Valida e salva as alterações do perfil
   */
  salvar(): void {
    // Validação básica dos campos obrigatórios
    if (!this.user.nome || !this.user.email) {
      this.showError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validação de email
    if (!this.validarEmail(this.user.email)) {
      this.showError('Por favor, insira um email válido.');
      return;
    }

    // Se houver campos de senha preenchidos, validar alteração de senha
    if (this.senhaAtual || this.novaSenha || this.confirmarSenha) {
      if (!this.validarAlteracaoSenha()) {
        return;
      }
      
      // Aqui você implementaria a chamada ao backend para alterar a senha
      // this.authService.alterarSenha(this.senhaAtual, this.novaSenha).subscribe(...)
      
      this.showSuccess('Senha alterada com sucesso!');
      this.limparCamposSenha();
    } else {
      // Salvar dados do perfil
      this.salvarDadosUsuario();
      
      // Aqui você implementaria a chamada ao backend para atualizar o perfil
      // this.userService.atualizarPerfil(this.user).subscribe(...)
      
      this.showSuccess('Dados do perfil atualizados com sucesso!');
    }

    console.log('Perfil salvo:', this.user);
  }

  /**
   * Valida a alteração de senha
   */
  private validarAlteracaoSenha(): boolean {
    if (!this.senhaAtual) {
      this.showError('Informe a senha atual.');
      return false;
    }

    if (!this.novaSenha) {
      this.showError('Informe a nova senha.');
      return false;
    }

    if (this.novaSenha.length < 6) {
      this.showError('A nova senha deve ter no mínimo 6 caracteres.');
      return false;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.showError('A nova senha e a confirmação não coincidem.');
      return false;
    }

    if (this.senhaAtual === this.novaSenha) {
      this.showError('A nova senha deve ser diferente da senha atual.');
      return false;
    }

    return true;
  }

  /**
   * Valida o formato do email
   */
  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Limpa os campos de senha
   */
  limparCamposSenha(): void {
    this.senhaAtual = '';
    this.novaSenha = '';
    this.confirmarSenha = '';
    this.camposVisiveis = {
      senhaAtual: false,
      novaSenha: false,
      confirmarSenha: false,
    };
  }

  /**
   * Exibe mensagem de sucesso
   */
  showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessAlert = true;
    
    // Auto-ocultar após 3 segundos
    setTimeout(() => {
      this.showSuccessAlert = false;
    }, 3000);
  }

  /**
   * Exibe mensagem de erro
   */
  showError(message: string): void {
    // Em produção, você pode usar um serviço de notificações mais sofisticado
    alert(message);
  }

  /**
   * Obtém as iniciais do nome do usuário para o avatar
   */
  getInitials(): string {
    if (!this.user.nome) return 'U';
    
    const names = this.user.nome.trim().split(' ');
    
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    
    return this.user.nome.charAt(0).toUpperCase();
  }

  /**
   * Navega para a página inicial
   */
  voltarHome(): void {
    this.router.navigate(['/home']);
  }
}