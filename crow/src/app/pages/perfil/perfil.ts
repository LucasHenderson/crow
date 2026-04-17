import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
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
  showSuccessAlert = false;
  successMessage = '';
  erroMensagem = '';
  carregando = true;
  salvando = false;

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

  // Verificação do novo email
  emailVerificado = false;
  codigoEnviado = false;
  codigoDigitado = '';
  enviandoCodigo = false;
  verificandoCodigo = false;
  mensagemEmail = '';
  erroEmail = false;
  private emailVerificadoValor = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDadosUsuario();
  }

  private carregarDadosUsuario(): void {
    this.carregando = true;
    this.cdr.detectChanges();
    this.authService.getUsuarioLogado().subscribe({
      next: (user) => {
        this.user = user;
        this.userOriginal = { ...user };
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.erroMensagem = 'Erro ao carregar dados do perfil.';
        this.cdr.detectChanges();
      }
    });
  }

  togglePassword(field: keyof CamposSenha): void {
    this.camposVisiveis[field] = !this.camposVisiveis[field];
  }

  // --- Email Verification ---

  emailFoiAlterado(): boolean {
    return this.user.email.trim().toLowerCase() !== (this.userOriginal.email || '').trim().toLowerCase();
  }

  onEmailChange(): void {
    if (this.emailVerificado && this.user.email !== this.emailVerificadoValor) {
      this.emailVerificado = false;
      this.codigoEnviado = false;
      this.codigoDigitado = '';
      this.mensagemEmail = '';
      this.erroEmail = false;
      this.emailVerificadoValor = '';
    }
  }

  podeEnviarCodigo(): boolean {
    return (
      this.emailFoiAlterado() &&
      this.validarEmail(this.user.email) &&
      !this.enviandoCodigo &&
      !this.emailVerificado
    );
  }

  enviarCodigo(): void {
    if (!this.validarEmail(this.user.email)) {
      this.mensagemEmail = 'Informe um email válido.';
      this.erroEmail = true;
      return;
    }

    this.enviandoCodigo = true;
    this.mensagemEmail = '';
    this.erroEmail = false;

    this.authService.enviarCodigoVerificacao(this.user.email).subscribe({
      next: () => {
        this.enviandoCodigo = false;
        this.codigoEnviado = true;
        this.mensagemEmail = 'Código enviado! Verifique sua caixa de entrada.';
        this.erroEmail = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.enviandoCodigo = false;
        this.mensagemEmail = err.error?.message || 'Erro ao enviar código. Tente novamente.';
        this.erroEmail = true;
        this.cdr.detectChanges();
      }
    });
  }

  verificarCodigo(): void {
    if (!this.codigoDigitado || this.codigoDigitado.length !== 6) {
      this.mensagemEmail = 'Digite o código de 6 dígitos.';
      this.erroEmail = true;
      return;
    }

    this.verificandoCodigo = true;
    this.mensagemEmail = '';
    this.erroEmail = false;

    this.authService.verificarCodigo(this.user.email, this.codigoDigitado).subscribe({
      next: (res) => {
        this.verificandoCodigo = false;
        if (res.valido) {
          this.emailVerificado = true;
          this.emailVerificadoValor = this.user.email;
          this.mensagemEmail = 'Email verificado com sucesso!';
          this.erroEmail = false;
        } else {
          this.mensagemEmail = 'Código inválido ou expirado. Tente novamente.';
          this.erroEmail = true;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.verificandoCodigo = false;
        this.mensagemEmail = 'Erro ao verificar código. Tente novamente.';
        this.erroEmail = true;
        this.cdr.detectChanges();
      }
    });
  }

  permitirApenasNumerosCodigo(event: KeyboardEvent): boolean {
    const tecla = event.key;
    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(tecla)) {
      return true;
    }
    if (!/^\d$/.test(tecla)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // --- Alterações gerais ---

  houveAlteracao(): boolean {
    const dadosAlterados =
      this.user.nome !== this.userOriginal.nome ||
      this.emailFoiAlterado();
    const senhaAlterada = !!(this.senhaAtual || this.novaSenha || this.confirmarSenha);
    return dadosAlterados || senhaAlterada;
  }

  podeSalvar(): boolean {
    if (!this.houveAlteracao() || this.salvando) return false;
    if (this.emailFoiAlterado() && !this.emailVerificado) return false;
    return true;
  }

  salvar(): void {
    this.erroMensagem = '';

    if (!this.user.nome || this.user.nome.trim().length < 8) {
      this.erroMensagem = 'Nome deve ter no mínimo 8 caracteres.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.validarEmail(this.user.email)) {
      this.erroMensagem = 'Informe um email válido.';
      this.cdr.detectChanges();
      return;
    }

    if (this.emailFoiAlterado() && !this.emailVerificado) {
      this.erroMensagem = 'Verifique o novo email antes de salvar.';
      this.cdr.detectChanges();
      return;
    }

    const alterarSenha = !!(this.senhaAtual || this.novaSenha || this.confirmarSenha);
    const alterarDados =
      this.user.nome !== this.userOriginal.nome ||
      this.emailFoiAlterado();

    if (alterarSenha && !this.validarAlteracaoSenha()) {
      return;
    }

    this.salvando = true;

    if (alterarSenha) {
      this.usuarioService.alterarSenha(this.senhaAtual, this.novaSenha).subscribe({
        next: () => {
          this.limparCamposSenha();
          if (!alterarDados) {
            this.salvando = false;
            this.showSuccess('Senha alterada com sucesso!');
            this.carregarDadosUsuario();
          } else {
            this.atualizarDadosPerfil(true);
          }
        },
        error: (err) => {
          this.salvando = false;
          this.erroMensagem = err.error?.message || 'Erro ao alterar senha.';
          this.cdr.detectChanges();
        }
      });
    } else if (alterarDados) {
      this.atualizarDadosPerfil(false);
    } else {
      this.salvando = false;
    }
  }

  private atualizarDadosPerfil(senhaTambem: boolean): void {
    this.usuarioService.atualizarPerfil({
      nome: this.user.nome,
      email: this.user.email
    }).subscribe({
      next: () => {
        this.salvando = false;
        this.emailVerificado = false;
        this.codigoEnviado = false;
        this.codigoDigitado = '';
        this.mensagemEmail = '';
        this.showSuccess(senhaTambem ? 'Dados e senha atualizados com sucesso!' : 'Dados do perfil atualizados com sucesso!');
        this.carregarDadosUsuario();
      },
      error: (err) => {
        this.salvando = false;
        this.erroMensagem = err.error?.message || 'Erro ao atualizar perfil.';
        this.cdr.detectChanges();
      }
    });
  }

  private validarAlteracaoSenha(): boolean {
    if (!this.senhaAtual) {
      this.erroMensagem = 'Informe a senha atual.';
      this.cdr.detectChanges();
      return false;
    }
    if (!this.novaSenha || this.novaSenha.length < 6) {
      this.erroMensagem = 'Nova senha deve ter no mínimo 6 caracteres.';
      this.cdr.detectChanges();
      return false;
    }
    if (this.novaSenha !== this.confirmarSenha) {
      this.erroMensagem = 'As senhas não coincidem.';
      this.cdr.detectChanges();
      return false;
    }
    if (this.senhaAtual === this.novaSenha) {
      this.erroMensagem = 'A nova senha deve ser diferente da senha atual.';
      this.cdr.detectChanges();
      return false;
    }
    return true;
  }

  private validarEmail(email: string): boolean {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

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

  showSuccess(message: string): void {
    this.erroMensagem = '';
    this.successMessage = message;
    this.showSuccessAlert = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.showSuccessAlert = false;
      this.cdr.detectChanges();
    }, 4000);
  }

  getForcaSenha(): number {
    const senha = this.novaSenha;
    if (!senha) return 0;
    let forca = 0;
    if (senha.length >= 6) forca++;
    if (senha.length >= 10) forca++;
    if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[^a-zA-Z0-9]/.test(senha)) forca++;
    return Math.min(forca, 4);
  }

  getTextoForcaSenha(): string {
    switch (this.getForcaSenha()) {
      case 1: return 'Fraca';
      case 2: return 'Média';
      case 3: return 'Boa';
      case 4: return 'Forte';
      default: return '';
    }
  }

  getClasseForcaSenha(): string {
    switch (this.getForcaSenha()) {
      case 1: return 'fraca';
      case 2: return 'media';
      case 3: return 'boa';
      case 4: return 'forte';
      default: return '';
    }
  }

  getInitials(): string {
    if (!this.user.nome) return 'U';
    const names = this.user.nome.trim().split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    return this.user.nome.charAt(0).toUpperCase();
  }
}
