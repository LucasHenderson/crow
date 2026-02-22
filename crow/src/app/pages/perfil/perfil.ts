import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';

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
export class Perfil implements OnInit {
  profileMenuOpen = false;
  showSuccessAlert = false;
  successMessage = '';
  carregando = true;

  user: Usuario = {
    id: 0,
    codigo: '',
    nome: '',
    email: '',
    telefone: '',
    dataEntrada: '',
  };

  userOriginal: Usuario = { ...this.user };

  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';

  camposVisiveis: CamposSenha = {
    senhaAtual: false,
    novaSenha: false,
    confirmarSenha: false,
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.carregarDadosUsuario();
  }

  private carregarDadosUsuario(): void {
    this.carregando = true;
    this.authService.getUsuarioLogado().subscribe({
      next: (user) => {
        this.user = user;
        this.userOriginal = { ...user };
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.showError('Erro ao carregar dados do perfil.');
      }
    });
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
   * Permite apenas números no campo de telefone
   */
  permitirApenasNumeros(event: KeyboardEvent): boolean {
    const tecla = event.key;
    
    // Permite teclas de controle (Backspace, Delete, Tab, Arrow keys, etc)
    if (
      tecla === 'Backspace' || 
      tecla === 'Delete' || 
      tecla === 'Tab' || 
      tecla === 'ArrowLeft' || 
      tecla === 'ArrowRight' ||
      tecla === 'Home' ||
      tecla === 'End'
    ) {
      return true;
    }
    
    // Bloqueia se não for número
    if (!/^\d$/.test(tecla)) {
      event.preventDefault();
      return false;
    }
    
    return true;
  }

  /**
   * Verifica se houve alguma alteração nos dados
   */
  houveAlteracao(): boolean {
    // Verifica se dados do perfil foram alterados
    const dadosAlterados = 
      this.user.nome !== this.userOriginal.nome ||
      this.user.email !== this.userOriginal.email ||
      this.user.telefone !== this.userOriginal.telefone;
    
    // Verifica se há tentativa de alteração de senha
    const senhaAlterada = !!(this.senhaAtual || this.novaSenha || this.confirmarSenha);
    
    return dadosAlterados || senhaAlterada;
  }

  /**
   * Aplica máscara ao campo de telefone
   */
  aplicarMascaraTelefone(event: any): void {
    let valor = event.target.value.replace(/\D/g, '');
    
    if (valor.length > 11) {
      valor = valor.substring(0, 11);
    }
    
    if (valor.length > 6) {
      valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    } else if (valor.length > 2) {
      valor = valor.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (valor.length > 0) {
      valor = valor.replace(/^(\d*)/, '($1');
    }
    
    this.user.telefone = valor;
  }

  /**
   * Valida e salva as alterações do perfil
   */
  salvar(): void {
    if (this.senhaAtual || this.novaSenha || this.confirmarSenha) {
      if (!this.validarAlteracaoSenha()) {
        return;
      }

      this.usuarioService.alterarSenha(this.senhaAtual, this.novaSenha).subscribe({
        next: () => {
          this.showSuccess('Senha alterada com sucesso!');
          this.limparCamposSenha();
        },
        error: (err) => {
          this.showError(err.error?.message || 'Erro ao alterar senha.');
        }
      });
    }

    if (this.user.nome !== this.userOriginal.nome ||
        this.user.email !== this.userOriginal.email ||
        this.user.telefone !== this.userOriginal.telefone) {

      this.usuarioService.atualizarPerfil({
        nome: this.user.nome,
        email: this.user.email,
        telefone: this.user.telefone
      }).subscribe({
        next: (updated) => {
          this.user = updated;
          this.userOriginal = { ...updated };
          this.showSuccess('Dados do perfil atualizados com sucesso!');
        },
        error: (err) => {
          this.showError(err.error?.message || 'Erro ao atualizar perfil.');
        }
      });
    }
  }

  /**
   * Valida a alteração de senha
   */
  private validarAlteracaoSenha(): boolean {
    // As validações de senha agora são feitas visualmente pelos spans
    // Mas mantemos validações críticas aqui
    
    if (!this.senhaAtual) {
      return false;
    }

    if (!this.novaSenha || this.novaSenha.length < 6) {
      return false;
    }

    if (this.novaSenha !== this.confirmarSenha) {
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
    
    // Auto-ocultar após 4 segundos
    setTimeout(() => {
      this.showSuccessAlert = false;
    }, 4000);
  }

  /**
   * Exibe mensagem de erro (mantido para casos críticos)
   */
  showError(message: string): void {
    // Usado apenas para erros críticos que não são cobertos pelos spans
    // Você pode implementar um toast ou notification service aqui
    alert(message);
  }

  /**
   * Retorna a força da senha (0 a 4)
   */
  getForcaSenha(): number {
    const senha = this.novaSenha;
    
    if (!senha) return 0;
    
    let forca = 0;
    
    // Comprimento
    if (senha.length >= 6) forca++;
    if (senha.length >= 10) forca++;
    
    // Complexidade
    if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[^a-zA-Z0-9]/.test(senha)) forca++;
    
    return Math.min(forca, 4);
  }

  /**
   * Retorna o texto da força da senha
   */
  getTextoForcaSenha(): string {
    const forca = this.getForcaSenha();
    
    switch(forca) {
      case 0: return '';
      case 1: return 'Fraca';
      case 2: return 'Média';
      case 3: return 'Boa';
      case 4: return 'Forte';
      default: return '';
    }
  }

  /**
   * Retorna a classe CSS da força da senha
   */
  getClasseForcaSenha(): string {
    const forca = this.getForcaSenha();
    
    switch(forca) {
      case 1: return 'fraca';
      case 2: return 'media';
      case 3: return 'boa';
      case 4: return 'forte';
      default: return '';
    }
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