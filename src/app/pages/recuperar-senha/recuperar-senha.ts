import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

type CamposSenha = {
  novaSenha: boolean;
  confirmarSenha: boolean;
};

type MetodoRecuperacao = 'email' | 'sms' | null;

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recuperar-senha.html',
  styleUrl: './recuperar-senha.css',
})
export class RecuperarSenha {
  
  // Controle de etapas
  etapaAtual = 1;
  totalEtapas = 4;

  // Etapa 1: Email
  email = '';

  // Etapa 2: Método de recuperação
  metodoSelecionado: MetodoRecuperacao = null;

  // Etapa 3: Código de verificação
  codigoDigitado = '';
  codigoEnviado = ''; // Simulação do código enviado

  // Etapa 4: Nova senha
  novaSenha = '';
  confirmarSenha = '';
  camposVisiveis: CamposSenha = {
    novaSenha: false,
    confirmarSenha: false
  };

  // Controles
  carregando = false;

  constructor(private router: Router) {}

  /**
   * Avança para a próxima etapa
   */
  proximaEtapa(): void {
    if (this.etapaAtual === 1) {
      if (!this.validarEmail()) return;
      
      // Simular verificação se o email existe
      this.carregando = true;
      setTimeout(() => {
        this.carregando = false;
        this.etapaAtual++;
      }, 1000);
    } 
    else if (this.etapaAtual === 2) {
      if (!this.metodoSelecionado) {
        alert('Por favor, selecione um método de recuperação.');
        return;
      }
      
      // Simular envio do código
      this.carregando = true;
      this.gerarCodigoVerificacao();
      setTimeout(() => {
        this.carregando = false;
        this.etapaAtual++;
        alert(`Código enviado para ${this.metodoSelecionado === 'email' ? 'seu email' : 'seu celular'}: ${this.codigoEnviado}`);
      }, 1500);
    }
    else if (this.etapaAtual === 3) {
      if (!this.validarCodigo()) return;
      
      this.carregando = true;
      setTimeout(() => {
        this.carregando = false;
        this.etapaAtual++;
      }, 800);
    }
  }

  /**
   * Volta para a etapa anterior
   */
  voltarEtapa(): void {
    if (this.etapaAtual > 1) {
      this.etapaAtual--;
    }
  }

  /**
   * Valida o email informado
   */
  private validarEmail(): boolean {
    if (!this.email.trim()) {
      alert('Por favor, informe seu email.');
      return false;
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(this.email)) {
      alert('Por favor, insira um email válido.');
      return false;
    }

    return true;
  }

  /**
   * Seleciona o método de recuperação
   */
  selecionarMetodo(metodo: MetodoRecuperacao): void {
    this.metodoSelecionado = metodo;
  }

  /**
   * Gera um código de verificação aleatório de 6 dígitos
   */
  private gerarCodigoVerificacao(): void {
    this.codigoEnviado = Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Valida o código informado
   */
  private validarCodigo(): boolean {
    if (!this.codigoDigitado) {
      alert('Por favor, informe o código de verificação.');
      return false;
    }

    if (this.codigoDigitado.length !== 6) {
      alert('O código deve ter 6 dígitos.');
      return false;
    }

    if (this.codigoDigitado !== this.codigoEnviado) {
      alert('Código inválido. Por favor, verifique e tente novamente.');
      return false;
    }

    return true;
  }

  /**
   * Permite apenas números no campo de código
   */
  permitirApenasNumeros(event: KeyboardEvent): boolean {
    const tecla = event.key;
    
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
    
    if (!/^\d$/.test(tecla)) {
      event.preventDefault();
      return false;
    }
    
    return true;
  }

  /**
   * Alterna a visibilidade dos campos de senha
   */
  togglePassword(field: keyof CamposSenha): void {
    this.camposVisiveis[field] = !this.camposVisiveis[field];
  }

  /**
   * Verifica se pode confirmar a nova senha
   */
  podeConfirmarSenha(): boolean {
    return !!(
      this.novaSenha &&
      this.confirmarSenha &&
      this.novaSenha.length >= 6 &&
      this.novaSenha === this.confirmarSenha
    );
  }

  /**
   * Confirma a nova senha e redireciona para login
   */
  confirmarNovaSenha(): void {
    if (!this.novaSenha || this.novaSenha.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    // Validação adicional: pelo menos uma letra e um número
    const temLetra = /[a-zA-Z]/.test(this.novaSenha);
    const temNumero = /[0-9]/.test(this.novaSenha);

    if (!temLetra || !temNumero) {
      alert('A senha deve conter pelo menos uma letra e um número.');
      return;
    }

    // Simular salvamento da nova senha
    this.carregando = true;
    setTimeout(() => {
      this.carregando = false;
      alert('Senha alterada com sucesso! Faça login com sua nova senha.');
      this.router.navigate(['/login']);
    }, 1000);
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
   * Cancela o processo e volta para login
   */
  cancelar(): void {
    if (confirm('Deseja cancelar a recuperação de senha?')) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Calcula a porcentagem de progresso
   */
  getProgresso(): number {
    return (this.etapaAtual / this.totalEtapas) * 100;
  }
}