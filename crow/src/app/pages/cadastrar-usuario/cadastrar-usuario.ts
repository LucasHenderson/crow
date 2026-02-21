import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

type CamposSenha = {
  senha: boolean;
  confirmarSenha: boolean;
};

interface NovoUsuario {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  aceitouTermos: boolean;
}

@Component({
  selector: 'app-cadastrar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cadastrar-usuario.html',
  styleUrl: './cadastrar-usuario.css',
})
export class CadastrarUsuario {
  
  novoUsuario: NovoUsuario = {
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    aceitouTermos: false
  };

  camposVisiveis: CamposSenha = {
    senha: false,
    confirmarSenha: false
  };

  enviandoFormulario = false;

  constructor(private router: Router) {}

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
    
    this.novoUsuario.telefone = valor;
  }

  /**
   * Verifica se todos os campos obrigatórios foram preenchidos
   */
  formularioValido(): boolean {
    return !!(
      this.novoUsuario.nome.trim() &&
      this.novoUsuario.email.trim() &&
      this.novoUsuario.senha &&
      this.novoUsuario.confirmarSenha &&
      this.novoUsuario.aceitouTermos
    );
  }

  /**
   * Alterna a visibilidade dos campos de senha
   */
  togglePassword(field: keyof CamposSenha): void {
    this.camposVisiveis[field] = !this.camposVisiveis[field];
  }

  /**
   * Valida e cadastra o novo usuário
   */
  cadastrar(): void {
    // Validação dos campos obrigatórios
    if (!this.validarCamposObrigatorios()) {
      return;
    }

    // Validação de email
    if (!this.validarEmail(this.novoUsuario.email)) {
      this.showError('Por favor, insira um email válido.');
      return;
    }

    // Validação de senha
    if (!this.validarSenha()) {
      return;
    }

    // Validação dos termos
    if (!this.novoUsuario.aceitouTermos) {
      this.showError('Você precisa aceitar os termos de uso e política de privacidade.');
      return;
    }

    // Simular envio
    this.enviandoFormulario = true;

    // Aqui você implementaria a chamada ao backend
    setTimeout(() => {
      this.enviandoFormulario = false;
      
      // Salvar dados básicos no localStorage (remover senha)
      const usuarioCadastrado = {
        nome: this.novoUsuario.nome,
        email: this.novoUsuario.email,
        telefone: this.novoUsuario.telefone,
        dataEntrada: new Date().toISOString()
      };
      
      localStorage.setItem('usuario', JSON.stringify(usuarioCadastrado));
      
      console.log('Usuário cadastrado:', usuarioCadastrado);
      
      // Redirecionar para login ou home
      alert('Cadastro realizado com sucesso! Faça login para continuar.');
      this.router.navigate(['/login']);
    }, 2000);
  }

  /**
   * Valida os campos obrigatórios
   */
  private validarCamposObrigatorios(): boolean {
    if (!this.novoUsuario.nome.trim() || this.novoUsuario.nome.trim().length < 8) {
      this.showError('Por favor, informe seu nome completo (mínimo 8 caracteres).');
      return false;
    }

    if (!this.novoUsuario.email.trim()) {
      this.showError('Por favor, informe seu email.');
      return false;
    }

    if (!this.novoUsuario.senha) {
      this.showError('Por favor, informe uma senha.');
      return false;
    }

    if (!this.novoUsuario.confirmarSenha) {
      this.showError('Por favor, confirme sua senha.');
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
   * Valida a senha
   */
  private validarSenha(): boolean {
    if (this.novoUsuario.senha.length < 6) {
      this.showError('A senha deve ter no mínimo 6 caracteres.');
      return false;
    }

    if (this.novoUsuario.senha !== this.novoUsuario.confirmarSenha) {
      this.showError('As senhas não coincidem.');
      return false;
    }

    // Validação adicional: pelo menos uma letra e um número
    const temLetra = /[a-zA-Z]/.test(this.novoUsuario.senha);
    const temNumero = /[0-9]/.test(this.novoUsuario.senha);

    if (!temLetra || !temNumero) {
      this.showError('A senha deve conter pelo menos uma letra e um número.');
      return false;
    }

    return true;
  }

  /**
   * Exibe mensagem de erro
   */
  private showError(message: string): void {
    alert(message);
  }

  /**
   * Navega para a página de login
   */
  irParaLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Retorna a força da senha (0 a 4)
   */
  getForcaSenha(): number {
    const senha = this.novoUsuario.senha;
    
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
}