import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Denuncia } from '../../models/denuncia.model';
import { Usuario } from '../../models/usuario.model';
import { IdiomaAdm as Idioma, IdiomaOpcao, IDIOMAS_DISPONIVEIS, PROFICIENCIAS } from '../../models/idioma.model';
import { Log } from '../../models/log.model';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

type AbaAtiva = 'denuncias' | 'usuarios' | 'idiomas' | 'logs';

@Component({
  selector: 'app-controle-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './controle-adm.html',
  styleUrl: './controle-adm.css',
})
export class ControleAdm implements OnInit {

  // Controle de abas
  abaAtiva: AbaAtiva = 'denuncias';
  carregando = true;

  // Dados
  denuncias: Denuncia[] = [];
  usuarios: Usuario[] = [];
  idiomas: Idioma[] = [];
  logs: Log[] = [];

  // Filtros
  filtroDenunciaStatus: string[] = [];
  filtroUsuarioStatus = 'todos';
  buscaUsuario = '';
  buscaIdioma = '';
  filtroLogTipo: string[] = [];
  buscaDenuncia = '';
  buscaLog = '';
  filtroLogDataInicio = '';
  filtroLogDataFim = '';
  filtroDenunciaDataInicio = '';
  filtroDenunciaDataFim = '';
  
  // Paginação - Denúncias
  paginaAtualDenuncias = 1;
  itensPorPaginaDenuncias = 6;
  
  // Paginação - Usuários
  paginaAtualUsuarios = 1;
  itensPorPaginaUsuarios = 9;
  
  // Paginação - Idiomas
  paginaAtualIdiomas = 1;
  itensPorPaginaIdiomas = 6;
  
  // Paginação - Logs
  paginaAtualLogs = 1;
  itensPorPaginaLogs = 10;
  
  // Modais
  mostrarModalDenuncia = false;
  mostrarModalEditarUsuario = false;
  mostrarModalDesativarUsuario = false;
  mostrarModalEditarIdioma = false;
  mostrarModalExcluirIdioma = false;
  mostrarMensagemSucesso = false;
  
  // Dados dos modais
  denunciaSelecionada: Denuncia | null = null;
  usuarioEmEdicao: Usuario | null = null;
  usuarioEmDesativacao: Usuario | null = null;
  idiomaEmEdicao: Idioma | null = null;
  idiomaEmExclusao: Idioma | null = null;
  
  // Campos de edição de usuário
  nomeUsuarioEdicao = '';
  emailUsuarioEdicao = '';
  telefoneUsuarioEdicao = '';
  roleUsuarioEdicao: 'comum' | 'admin' = 'comum';
  novaSenhaUsuario = '';
  confirmarSenhaUsuario = '';
  camposVisiveis = {
    novaSenha: false,
    confirmarSenha: false
  };
  
  // Campos de edição de idioma
  nomeIdiomaEdicao = '';
  descricaoIdiomaEdicao = '';
  idiomaSelecionadoEdicao: IdiomaOpcao | null = null;
  proficienciaIdiomaEdicao = '';
  visibilidadeIdiomaEdicao: 'publico' | 'privado' = 'publico';
  
  // Dropdowns idioma
  mostrarIdiomasEdicao = false;
  mostrarProficienciaEdicao = false;
  buscaIdiomaEdicao = '';
  
  // Opções disponíveis
  idiomasDisponiveis = IDIOMAS_DISPONIVEIS;

  proficiencias = PROFICIENCIAS;
  
  // Mensagem de sucesso
  mensagemSucesso = '';
  
  // ID do admin logado
  adminLogadoId: number = 0;
  adminLogadoNome = 'Administrador Principal';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private adminService: AdminService,
    private authService: AuthService
  ) {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.adminLogadoId = user.id;
      this.adminLogadoNome = user.nome;
    }
  }

  ngOnInit(): void {
    this.carregarDenuncias();
    this.carregarUsuarios();
    this.carregarIdiomas();
    this.carregarLogs();
  }

  // ===== NAVEGAÇÃO DE ABAS =====
  
  mudarAba(aba: AbaAtiva): void {
    this.abaAtiva = aba;
  }

  // ===== CARREGAMENTO DE DADOS =====
  
  carregarDenuncias(): void {
    this.adminService.getDenuncias().subscribe({
      next: (denuncias) => {
        this.denuncias = denuncias.map(d => this.normalizarDenuncia(d));
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  /**
   * O backend envia os tipos serializados em JSON (tiposJson); o template
   * espera um array em `tipos`.
   */
  private normalizarDenuncia(d: any): Denuncia {
    let tipos: string[] = [];
    if (d.tiposJson) {
      try {
        tipos = JSON.parse(d.tiposJson) || [];
      } catch { /* JSON inválido — mantém lista vazia */ }
    }
    return { ...d, tipos };
  }

  carregarUsuarios(): void {
    this.adminService.getUsuariosAdmin().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  carregarIdiomas(): void {
    this.adminService.getIdiomasAdmin().subscribe({
      next: (idiomas) => {
        this.idiomas = idiomas;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  carregarLogs(): void {
    this.adminService.getLogs().subscribe({
      next: (logs) => {
        this.logs = logs;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  // ===== DENÚNCIAS =====
  
  toggleFiltroDenunciaStatus(status: string): void {
    const index = this.filtroDenunciaStatus.indexOf(status);
    if (index > -1) {
      this.filtroDenunciaStatus.splice(index, 1);
    } else {
      this.filtroDenunciaStatus.push(status);
    }
    this.paginaAtualDenuncias = 1;
  }

  isStatusDenunciaSelecionado(status: string): boolean {
    return this.filtroDenunciaStatus.includes(status);
  }
  
  get denunciasFiltradas(): Denuncia[] {
    let filtradas = this.denuncias;
    
    if (this.filtroDenunciaStatus.length > 0) {
      filtradas = filtradas.filter(d => this.filtroDenunciaStatus.includes(d.status));
    }
    
    if (this.buscaDenuncia.trim()) {
      const termo = this.buscaDenuncia.toLowerCase();
      filtradas = filtradas.filter(d =>
        d.codigo.toLowerCase().includes(termo) ||
        d.usuarioNome.toLowerCase().includes(termo) ||
        (d.responsavelNome && d.responsavelNome.toLowerCase().includes(termo)) ||
        (d.codigoResponsavel && d.codigoResponsavel.toLowerCase().includes(termo))
      );
    }
    
    if (this.filtroDenunciaDataInicio) {
      const dataInicio = new Date(this.filtroDenunciaDataInicio);
      filtradas = filtradas.filter(d => new Date(d.data) >= dataInicio);
    }
    
    if (this.filtroDenunciaDataFim) {
      const dataFim = new Date(this.filtroDenunciaDataFim);
      dataFim.setHours(23, 59, 59, 999);
      filtradas = filtradas.filter(d => new Date(d.data) <= dataFim);
    }
    
    return filtradas;
  }

  get denunciasPaginadas(): Denuncia[] {
    const inicio = (this.paginaAtualDenuncias - 1) * this.itensPorPaginaDenuncias;
    const fim = inicio + this.itensPorPaginaDenuncias;
    return this.denunciasFiltradas.slice(inicio, fim);
  }

  get totalPaginasDenuncias(): number {
    return Math.ceil(this.denunciasFiltradas.length / this.itensPorPaginaDenuncias);
  }

  get paginasDenuncias(): number[] {
    return Array.from({ length: this.totalPaginasDenuncias }, (_, i) => i + 1);
  }

  mudarPaginaDenuncias(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasDenuncias) {
      this.paginaAtualDenuncias = pagina;
    }
  }

  visualizarDenuncia(denuncia: Denuncia): void {
    this.denunciaSelecionada = denuncia;
    this.mostrarModalDenuncia = true;
  }

  fecharModalDenuncia(): void {
    this.mostrarModalDenuncia = false;
    this.denunciaSelecionada = null;
  }

  alterarStatusDenuncia(status: Denuncia['status']): void {
    if (!this.denunciaSelecionada) return;

    this.adminService.alterarStatusDenuncia(this.denunciaSelecionada.id, status).subscribe({
      next: (denunciaAtualizada) => {
        const normalizada = this.normalizarDenuncia(denunciaAtualizada);
        const index = this.denuncias.findIndex(d => d.id === normalizada.id);
        if (index >= 0) this.denuncias[index] = normalizada;
        this.fecharModalDenuncia();
        this.exibirMensagemSucesso('Status da denúncia atualizado com sucesso!');
        this.carregarLogs();
      },
      error: () => {
        this.exibirMensagemSucesso('Erro ao alterar status da denúncia.');
      }
    });
  }

  formatarData(dataString: string): string {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: Denuncia['status']): string {
    switch(status) {
      case 'pendente': return 'status-pendente';
      case 'analisando': return 'status-analisando';
      case 'resolvida': return 'status-resolvida';
      case 'rejeitada': return 'status-rejeitada';
      default: return '';
    }
  }

  getStatusTexto(status: Denuncia['status']): string {
    switch(status) {
      case 'pendente': return 'Pendente';
      case 'analisando': return 'Analisando';
      case 'resolvida': return 'Resolvida';
      case 'rejeitada': return 'Rejeitada';
      default: return '';
    }
  }

  temTipoOutros(): boolean {
    return this.denunciaSelecionada?.tipos.includes('Outros') || false;
  }

  // ===== USUÁRIOS =====
  
  get usuariosFiltrados(): Usuario[] {
    let usuarios = this.usuarios;
    
    if (this.filtroUsuarioStatus !== 'todos') {
      usuarios = usuarios.filter(u => u.status === this.filtroUsuarioStatus);
    }
    
    if (this.buscaUsuario.trim()) {
      const termo = this.buscaUsuario.toLowerCase();
      usuarios = usuarios.filter(u =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        u.codigo.toLowerCase().includes(termo)
      );
    }
    
    return usuarios;
  }

  get usuariosPaginados(): Usuario[] {
    const inicio = (this.paginaAtualUsuarios - 1) * this.itensPorPaginaUsuarios;
    const fim = inicio + this.itensPorPaginaUsuarios;
    return this.usuariosFiltrados.slice(inicio, fim);
  }

  get totalPaginasUsuarios(): number {
    return Math.ceil(this.usuariosFiltrados.length / this.itensPorPaginaUsuarios);
  }

  get paginasUsuarios(): number[] {
    return Array.from({ length: this.totalPaginasUsuarios }, (_, i) => i + 1);
  }

  mudarPaginaUsuarios(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasUsuarios) {
      this.paginaAtualUsuarios = pagina;
    }
  }

  getInitials(nome: string): string {
    if (!nome) return 'U';
    
    const names = nome.trim().split(' ');
    
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    
    return nome.substring(0, 2).toUpperCase();
  }

  editarUsuario(usuario: Usuario): void {
    this.usuarioEmEdicao = { ...usuario };
    this.nomeUsuarioEdicao = usuario.nome;
    this.emailUsuarioEdicao = usuario.email;
    this.telefoneUsuarioEdicao = usuario.telefone;
    this.roleUsuarioEdicao = usuario.role || 'comum';
    this.novaSenhaUsuario = '';
    this.confirmarSenhaUsuario = '';
    this.mostrarModalEditarUsuario = true;
  }

  fecharModalEditarUsuario(): void {
    this.mostrarModalEditarUsuario = false;
    this.usuarioEmEdicao = null;
    this.limparCamposUsuario();
  }

  limparCamposUsuario(): void {
    this.nomeUsuarioEdicao = '';
    this.emailUsuarioEdicao = '';
    this.telefoneUsuarioEdicao = '';
    this.roleUsuarioEdicao = 'comum';
    this.novaSenhaUsuario = '';
    this.confirmarSenhaUsuario = '';
    this.camposVisiveis = { novaSenha: false, confirmarSenha: false };
  }

  get podeConfirmarEdicaoUsuario(): boolean {
    if (!this.usuarioEmEdicao) return false;
    
    const nomeValido = this.nomeUsuarioEdicao.trim().length >= 8;
    const emailValido = this.validarEmail(this.emailUsuarioEdicao);
    const telefoneValido = this.telefoneUsuarioEdicao.replace(/\D/g, '').length >= 10;
    const roleValido = !!this.roleUsuarioEdicao;
    
    const dadosAlterados = 
      this.nomeUsuarioEdicao !== this.usuarioEmEdicao.nome ||
      this.emailUsuarioEdicao !== this.usuarioEmEdicao.email ||
      this.telefoneUsuarioEdicao !== this.usuarioEmEdicao.telefone ||
      this.roleUsuarioEdicao !== this.usuarioEmEdicao.role;
    
    const senhaValida = !this.novaSenhaUsuario || (
      this.novaSenhaUsuario.length >= 6 &&
      this.novaSenhaUsuario === this.confirmarSenhaUsuario
    );
    
    return nomeValido && emailValido && telefoneValido && roleValido && senhaValida && (dadosAlterados || !!this.novaSenhaUsuario);
  }

  confirmarEdicaoUsuario(): void {
    if (!this.podeConfirmarEdicaoUsuario || !this.usuarioEmEdicao) return;

    const dados: any = {
      nome: this.nomeUsuarioEdicao.trim(),
      email: this.emailUsuarioEdicao.trim(),
      telefone: this.telefoneUsuarioEdicao.trim(),
      role: this.roleUsuarioEdicao
    };
    if (this.novaSenhaUsuario) {
      dados.novaSenha = this.novaSenhaUsuario;
    }

    this.adminService.editarUsuarioAdmin(this.usuarioEmEdicao.id, dados).subscribe({
      next: (updated) => {
        const index = this.usuarios.findIndex(u => u.id === updated.id);
        if (index >= 0) this.usuarios[index] = updated;
        this.fecharModalEditarUsuario();
        this.exibirMensagemSucesso(`Usuário "${updated.nome}" atualizado com sucesso!`);
        this.carregarLogs();
      },
      error: () => {
        this.exibirMensagemSucesso('Erro ao editar usuário.');
      }
    });
  }

  abrirModalDesativarUsuario(usuario: Usuario): void {
    this.usuarioEmDesativacao = usuario;
    this.mostrarModalDesativarUsuario = true;
  }

  fecharModalDesativarUsuario(): void {
    this.mostrarModalDesativarUsuario = false;
    this.usuarioEmDesativacao = null;
  }

  confirmarAlteracaoStatusUsuario(): void {
    if (!this.usuarioEmDesativacao) return;

    const novoStatus = this.usuarioEmDesativacao.status === 'ativo' ? 'inativo' : 'ativo';

    this.adminService.alterarStatusUsuario(this.usuarioEmDesativacao.id, novoStatus).subscribe({
      next: (updated) => {
        const index = this.usuarios.findIndex(u => u.id === updated.id);
        if (index >= 0) this.usuarios[index] = updated;
        const acao = novoStatus === 'ativo' ? 'ativada' : 'desativada';
        this.fecharModalDesativarUsuario();
        this.exibirMensagemSucesso(`Conta de "${updated.nome}" ${acao} com sucesso!`);
        this.carregarLogs();
      },
      error: () => {
        this.exibirMensagemSucesso('Erro ao alterar status do usuário.');
      }
    });
  }

  togglePassword(field: 'novaSenha' | 'confirmarSenha'): void {
    this.camposVisiveis[field] = !this.camposVisiveis[field];
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

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
    
    this.telefoneUsuarioEdicao = valor;
  }

  getForcaSenha(): number {
    const senha = this.novaSenhaUsuario;
    
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

  // ===== IDIOMAS =====
  
  get idiomasFiltrados(): Idioma[] {
    if (!this.buscaIdioma.trim()) return this.idiomas;
    
    const termo = this.buscaIdioma.toLowerCase();
    return this.idiomas.filter(i =>
      i.nome.toLowerCase().includes(termo) ||
      i.criadorNome.toLowerCase().includes(termo) ||
      i.codigoCriador.toLowerCase().includes(termo) ||
      i.codigo.toLowerCase().includes(termo)
    );
  }

  get idiomasPaginados(): Idioma[] {
    const inicio = (this.paginaAtualIdiomas - 1) * this.itensPorPaginaIdiomas;
    const fim = inicio + this.itensPorPaginaIdiomas;
    return this.idiomasFiltrados.slice(inicio, fim);
  }

  get totalPaginasIdiomas(): number {
    return Math.ceil(this.idiomasFiltrados.length / this.itensPorPaginaIdiomas);
  }

  get paginasIdiomas(): number[] {
    return Array.from({ length: this.totalPaginasIdiomas }, (_, i) => i + 1);
  }

  mudarPaginaIdiomas(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasIdiomas) {
      this.paginaAtualIdiomas = pagina;
    }
  }

  get idiomasFiltradosEdicao(): IdiomaOpcao[] {
    if (!this.buscaIdiomaEdicao.trim()) return this.idiomasDisponiveis;
    const termo = this.buscaIdiomaEdicao.toLowerCase();
    return this.idiomasDisponiveis.filter(i => i.nome.toLowerCase().includes(termo));
  }

  toggleIdiomasEdicao(): void {
    this.mostrarIdiomasEdicao = !this.mostrarIdiomasEdicao;
    this.mostrarProficienciaEdicao = false;
  }

  toggleProficienciaEdicao(): void {
    this.mostrarProficienciaEdicao = !this.mostrarProficienciaEdicao;
    this.mostrarIdiomasEdicao = false;
  }

  selecionarIdiomaEdicao(idioma: IdiomaOpcao): void {
    this.idiomaSelecionadoEdicao = idioma;
    this.mostrarIdiomasEdicao = false;
    this.buscaIdiomaEdicao = '';
  }

  selecionarProficienciaEdicao(nivel: string): void {
    this.proficienciaIdiomaEdicao = nivel;
    this.mostrarProficienciaEdicao = false;
  }

  fecharDropdownsEdicao(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.campo')) {
      this.mostrarIdiomasEdicao = false;
      this.mostrarProficienciaEdicao = false;
    }
  }

  editarIdioma(idioma: Idioma): void {
    this.idiomaEmEdicao = { ...idioma };
    this.nomeIdiomaEdicao = idioma.nome;
    this.descricaoIdiomaEdicao = idioma.descricao;
    // O nome da linguagem (ex.: "Inglês (Estados Unidos)") vem no campo `idioma`.
    const nomeLinguagem = idioma.idioma || idioma.nome;
    this.idiomaSelecionadoEdicao = this.idiomasDisponiveis.find(i => i.nome === nomeLinguagem) || null;
    this.proficienciaIdiomaEdicao = this.mapProficienciaParaLabel(idioma.proficiencia);
    this.visibilidadeIdiomaEdicao = idioma.visibilidade || 'publico';
    this.mostrarModalEditarIdioma = true;
  }

  private mapProficienciaParaLabel(valor: string | undefined): string {
    if (!valor) return 'Básico';
    const mapa: Record<string, string> = {
      'iniciante': 'Iniciante',
      'basico': 'Básico',
      'intermediario': 'Intermediário',
      'avancado': 'Avançado',
      'fluente': 'Fluente'
    };
    return mapa[valor.toLowerCase()] || valor;
  }

  private mapProficienciaParaBackend(nivel: string): string {
    const mapa: Record<string, string> = {
      'Iniciante': 'INICIANTE',
      'Básico': 'BASICO',
      'Intermediário': 'INTERMEDIARIO',
      'Avançado': 'AVANCADO',
      'Fluente': 'FLUENTE'
    };
    return mapa[nivel] || nivel.toUpperCase();
  }

  fecharModalEditarIdioma(): void {
    this.mostrarModalEditarIdioma = false;
    this.idiomaEmEdicao = null;
    this.nomeIdiomaEdicao = '';
    this.descricaoIdiomaEdicao = '';
    this.idiomaSelecionadoEdicao = null;
    this.proficienciaIdiomaEdicao = '';
    this.visibilidadeIdiomaEdicao = 'publico';
    this.buscaIdiomaEdicao = '';
    this.mostrarIdiomasEdicao = false;
    this.mostrarProficienciaEdicao = false;
  }

  get podeConfirmarEdicaoIdioma(): boolean {
    if (!this.idiomaEmEdicao) return false;

    const nomeValido = this.nomeIdiomaEdicao.trim().length > 0;
    const descricaoValida = this.descricaoIdiomaEdicao.trim().length > 0;
    const idiomaValido = !!this.idiomaSelecionadoEdicao;
    const proficienciaValida = !!this.proficienciaIdiomaEdicao;

    const nomeLinguagemAtual = this.idiomaEmEdicao.idioma || this.idiomaEmEdicao.nome;
    const dadosAlterados =
      this.nomeIdiomaEdicao !== this.idiomaEmEdicao.nome ||
      this.descricaoIdiomaEdicao !== this.idiomaEmEdicao.descricao ||
      this.idiomaSelecionadoEdicao?.nome !== nomeLinguagemAtual ||
      this.proficienciaIdiomaEdicao !== this.mapProficienciaParaLabel(this.idiomaEmEdicao.proficiencia) ||
      this.visibilidadeIdiomaEdicao !== this.idiomaEmEdicao.visibilidade;

    return nomeValido && descricaoValida && idiomaValido && proficienciaValida && dadosAlterados;
  }

  confirmarEdicaoIdioma(): void {
    if (!this.podeConfirmarEdicaoIdioma || !this.idiomaEmEdicao || !this.idiomaSelecionadoEdicao) return;

    const id = this.idiomaEmEdicao.id;
    const dados = {
      nome: this.nomeIdiomaEdicao.trim(),
      idioma: this.idiomaSelecionadoEdicao.nome,
      bandeira: this.idiomaSelecionadoEdicao.bandeira,
      descricao: this.descricaoIdiomaEdicao.trim(),
      proficiencia: this.mapProficienciaParaBackend(this.proficienciaIdiomaEdicao),
      visibilidade: this.visibilidadeIdiomaEdicao.toUpperCase()
    };

    this.adminService.editarIdiomaAdmin(id, dados).subscribe({
      next: (atualizado) => {
        const index = this.idiomas.findIndex(i => i.id === id);
        if (index >= 0) this.idiomas[index] = atualizado;
        this.fecharModalEditarIdioma();
        this.exibirMensagemSucesso(`Idioma "${atualizado.nome}" atualizado com sucesso!`);
        this.carregarLogs();
      },
      error: (err) => {
        this.exibirMensagemSucesso(err?.error?.message || 'Erro ao editar idioma.');
      }
    });
  }

  excluirIdioma(idioma: Idioma): void {
    this.idiomaEmExclusao = idioma;
    this.mostrarModalExcluirIdioma = true;
  }

  fecharModalExcluirIdioma(): void {
    this.mostrarModalExcluirIdioma = false;
    this.idiomaEmExclusao = null;
  }

  confirmarExclusaoIdioma(): void {
    if (!this.idiomaEmExclusao) return;

    const nomeIdioma = this.idiomaEmExclusao.nome;

    this.adminService.excluirIdiomaAdmin(this.idiomaEmExclusao.id).subscribe({
      next: () => {
        this.idiomas = this.idiomas.filter(i => i.id !== this.idiomaEmExclusao!.id);
        this.fecharModalExcluirIdioma();
        this.exibirMensagemSucesso(`Idioma "${nomeIdioma}" excluído com sucesso!`);
        this.carregarLogs();
      },
      error: () => {
        this.exibirMensagemSucesso('Erro ao excluir idioma.');
      }
    });
  }

  estrelas(nota: number): boolean[] {
    const notaArredondada = Math.ceil(nota);
    return Array.from({ length: 5 }, (_, i) => i < notaArredondada);
  }

  // ===== LOGS =====
  
  toggleFiltroLogTipo(tipo: string): void {
    const index = this.filtroLogTipo.indexOf(tipo);
    if (index > -1) {
      this.filtroLogTipo.splice(index, 1);
    } else {
      this.filtroLogTipo.push(tipo);
    }
    this.paginaAtualLogs = 1;
  }

  isTipoLogSelecionado(tipo: string): boolean {
    return this.filtroLogTipo.includes(tipo);
  }
  
  get logsFiltrados(): Log[] {
    let logs = this.logs;
    
    if (this.filtroLogTipo.length > 0) {
      logs = logs.filter(log => this.filtroLogTipo.includes(log.tipo));
    }
    
    if (this.buscaLog.trim()) {
      const termo = this.buscaLog.toLowerCase();
      logs = logs.filter(log =>
        log.codigo.toLowerCase().includes(termo) ||
        log.adminNome.toLowerCase().includes(termo) ||
        log.codigoAdmin.toLowerCase().includes(termo)
      );
    }
    
    if (this.filtroLogDataInicio) {
      const dataInicio = new Date(this.filtroLogDataInicio);
      logs = logs.filter(log => new Date(log.data) >= dataInicio);
    }
    
    if (this.filtroLogDataFim) {
      const dataFim = new Date(this.filtroLogDataFim);
      dataFim.setHours(23, 59, 59, 999);
      logs = logs.filter(log => new Date(log.data) <= dataFim);
    }
    
    return logs;
  }

  get logsPaginados(): Log[] {
    const inicio = (this.paginaAtualLogs - 1) * this.itensPorPaginaLogs;
    const fim = inicio + this.itensPorPaginaLogs;
    return this.logsFiltrados.slice(inicio, fim);
  }

  get totalPaginasLogs(): number {
    return Math.ceil(this.logsFiltrados.length / this.itensPorPaginaLogs);
  }

  get paginasLogs(): number[] {
    return Array.from({ length: this.totalPaginasLogs }, (_, i) => i + 1);
  }

  mudarPaginaLogs(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasLogs) {
      this.paginaAtualLogs = pagina;
    }
  }

  getLogTipoClass(tipo: Log['tipo']): string {
    switch(tipo) {
      case 'denuncia': return 'log-denuncia';
      case 'usuario': return 'log-usuario';
      case 'idioma': return 'log-idioma';
      default: return '';
    }
  }

  getLogTipoIcone(tipo: Log['tipo']): string {
    switch(tipo) {
      case 'denuncia': return 'alert-triangle';
      case 'usuario': return 'user';
      case 'idioma': return 'globe';
      default: return 'file-text';
    }
  }

  // ===== MENSAGEM DE SUCESSO =====
  
  exibirMensagemSucesso(mensagem: string): void {
    this.mensagemSucesso = mensagem;
    this.mostrarMensagemSucesso = true;
    
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.mostrarMensagemSucesso = false;
      this.cdr.detectChanges();
    }, 4000);
  }

  fecharMensagemSucesso(): void {
    this.mostrarMensagemSucesso = false;
  }
}