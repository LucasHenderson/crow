import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Denuncia } from '../../models/denuncia.model';
import { AlterarStatusUsuario, EnviarEmailUsuario, UsuarioModeracao } from '../../models/usuario.model';
import { IdiomaAdm as Idioma } from '../../models/idioma.model';
import { Log } from '../../models/log.model';
import { AdminService } from '../../services/admin.service';
import { SoundService } from '../../services/sound.service';

type AbaAtiva = 'denuncias' | 'usuarios' | 'idiomas' | 'logs';
const ABAS: readonly AbaAtiva[] = ['denuncias', 'usuarios', 'idiomas', 'logs'];
/** Modalidades do modal "Desativar / Suspender Conta" — espelham DESATIVAR e SUSPENDER do backend. */
type TipoDesativacao = 'indeterminada' | 'temporaria';

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
  usuarios: UsuarioModeracao[] = [];
  idiomas: Idioma[] = [];
  logs: Log[] = [];

  // Filtros
  filtroDenunciaStatus: string[] = [];
  /**
   * Vazio = sem filtro (todos os usuários); segue o padrão das outras abas.
   * Valores: `ativo`, `suspenso` e `inativo` (desativada por tempo indeterminado)
   * — as mesmas situações que `getStatusUsuarioClass` distingue.
   */
  filtroUsuarioStatus: string[] = [];
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
  mostrarModalVisualizarUsuario = false;
  mostrarModalDesativarUsuario = false;
  mostrarModalReativarUsuario = false;
  mostrarModalEmailUsuario = false;
  mostrarModalExcluirIdioma = false;
  mostrarMensagemSucesso = false;

  // Dados dos modais
  denunciaSelecionada: Denuncia | null = null;
  /**
   * Código público vindo de `?usuario=` — o modal de denúncia abre o denunciante
   * em nova aba por esse parâmetro. Consumido assim que a lista de usuários chega.
   */
  private codigoUsuarioSolicitado: string | null = null;
  usuarioEmVisualizacao: UsuarioModeracao | null = null;
  usuarioEmDesativacao: UsuarioModeracao | null = null;
  usuarioEmReativacao: UsuarioModeracao | null = null;
  usuarioEmEmail: UsuarioModeracao | null = null;

  // Campos do modal Desativar / Suspender Conta
  readonly limiteJustificativa = 1000;
  tipoDesativacao: TipoDesativacao = 'indeterminada';
  /** Valor bruto do input datetime-local (yyyy-MM-ddTHH:mm), sempre no fuso do navegador. */
  reativacaoEmDesativacao = '';
  justificativaDesativacao = '';
  salvandoDesativacao = false;
  erroDesativacao = '';

  // Modal Reativar Conta
  salvandoReativacao = false;
  erroReativacao = '';

  // Campos do modal Enviar E-mail — limites iguais aos do EnviarEmailUsuarioRequest do backend
  readonly limiteAssuntoEmail = 150;
  readonly limiteMensagemEmail = 5000;
  assuntoEmail = '';
  mensagemEmail = '';
  enviandoEmail = false;
  erroEmail = '';

  // Modal Excluir Idioma — limite igual ao do ExcluirIdiomaRequest do backend
  idiomaEmExclusao: Idioma | null = null;
  readonly limiteMensagemExclusao = 1000;
  mensagemExclusaoIdioma = '';
  excluindoIdioma = false;
  erroExclusaoIdioma = '';

  // Mensagem de sucesso
  mensagemSucesso = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private adminService: AdminService,
    private soundService: SoundService
  ) {}

  ngOnInit(): void {
    // `?aba=idiomas` abre direto na aba pedida — é assim que a visualização de idioma volta para cá.
    const aba = this.route.snapshot.queryParamMap.get('aba') as AbaAtiva | null;
    if (aba && ABAS.includes(aba)) {
      this.abaAtiva = aba;
    }
    this.codigoUsuarioSolicitado = this.route.snapshot.queryParamMap.get('usuario');

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

  /**
   * Único ponto de entrada de registros em `usuarios`. O backend já omite
   * administradores; o filtro aqui garante que nenhum deles chegue à lista
   * mesmo que a resposta mude (a troca de status só substitui itens já
   * presentes, então não reintroduz ninguém).
   */
  carregarUsuarios(): void {
    this.adminService.getUsuariosAdmin().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios.filter(u => u.role !== 'admin');
        this.abrirUsuarioSolicitado();
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

    this.adminService.alterarStatusDenuncia(this.denunciaSelecionada.codigo, status).subscribe({
      next: (denunciaAtualizada) => {
        const normalizada = this.normalizarDenuncia(denunciaAtualizada);
        const index = this.denuncias.findIndex(d => d.codigo === normalizada.codigo);
        if (index >= 0) this.denuncias[index] = normalizada;
        this.fecharModalDenuncia();
        this.soundService.tocar('sucesso');
        this.exibirMensagemSucesso('Status da denúncia atualizado com sucesso!');
        this.carregarLogs();
      },
      error: () => {
        this.soundService.tocar('erro');
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

  // ----- Acesso rápido aos envolvidos (abre em nova aba) -----

  /** Falso quando o idioma foi excluído: o backend zera o vínculo e o código deixa de vir. */
  get idiomaDenunciadoDisponivel(): boolean {
    return !!this.denunciaSelecionada?.codigoIdioma;
  }

  /** Falso quando a conta do denunciante não existe mais. */
  get denuncianteDisponivel(): boolean {
    return !!this.denunciaSelecionada?.codigoUsuario;
  }

  /** Mesma rota que o botão de olho da aba Idiomas, pelo código público. */
  get linkIdiomaDenunciado(): string | null {
    const codigo = this.denunciaSelecionada?.codigoIdioma;
    if (!codigo) return null;
    return this.router.serializeUrl(
      this.router.createUrlTree(['/visualizar-idioma-adm'], { queryParams: { id: codigo } })
    );
  }

  /** Reabre este painel na aba Usuários com o modal de consulta do denunciante (ver `abrirUsuarioSolicitado`). */
  get linkDenunciante(): string | null {
    const codigo = this.denunciaSelecionada?.codigoUsuario;
    if (!codigo) return null;
    return this.router.serializeUrl(
      this.router.createUrlTree(['/controle-adm'], { queryParams: { aba: 'usuarios', usuario: codigo } })
    );
  }

  // ===== USUÁRIOS =====

  toggleFiltroUsuarioStatus(status: string): void {
    const index = this.filtroUsuarioStatus.indexOf(status);
    if (index > -1) {
      this.filtroUsuarioStatus.splice(index, 1);
    } else {
      this.filtroUsuarioStatus.push(status);
    }
    this.paginaAtualUsuarios = 1;
  }

  isStatusUsuarioSelecionado(status: string): boolean {
    return this.filtroUsuarioStatus.includes(status);
  }

  get usuariosFiltrados(): UsuarioModeracao[] {
    let usuarios = this.usuarios;

    if (this.filtroUsuarioStatus.length > 0) {
      usuarios = usuarios.filter(u => this.filtroUsuarioStatus.includes(this.getStatusUsuarioClass(u)));
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

  get usuariosPaginados(): UsuarioModeracao[] {
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

  /**
   * Atende ao `?usuario=CODIGO` (acesso rápido a partir da denúncia): abre a aba
   * de usuários com a busca preenchida e o modal de consulta já aberto. Se o
   * código não estiver na lista, a busca preenchida deixa claro que não há resultado.
   */
  private abrirUsuarioSolicitado(): void {
    const codigo = this.codigoUsuarioSolicitado;
    if (!codigo) return;
    this.codigoUsuarioSolicitado = null;

    this.abaAtiva = 'usuarios';
    this.buscaUsuario = codigo;
    this.paginaAtualUsuarios = 1;

    const usuario = this.usuarios.find(u => u.codigo.toLowerCase() === codigo.toLowerCase());
    if (usuario) {
      this.abrirModalVisualizarUsuario(usuario);
    }
  }

  /** O administrador apenas consulta os dados do usuário — não há edição. */
  abrirModalVisualizarUsuario(usuario: UsuarioModeracao): void {
    this.usuarioEmVisualizacao = usuario;
    this.mostrarModalVisualizarUsuario = true;
  }

  fecharModalVisualizarUsuario(): void {
    this.mostrarModalVisualizarUsuario = false;
    this.usuarioEmVisualizacao = null;
  }

  /**
   * Ação de moderação a partir do modal de consulta: fecha a consulta e abre
   * o modal correspondente à situação atual da conta.
   */
  moderarUsuarioEmVisualizacao(): void {
    const usuario = this.usuarioEmVisualizacao;
    if (!usuario) return;
    this.fecharModalVisualizarUsuario();
    if (usuario.status === 'ativo') {
      this.abrirModalDesativarUsuario(usuario);
    } else {
      this.abrirModalReativarUsuario(usuario);
    }
  }

  /** "Enviar e-mail" a partir do modal de consulta: fecha a consulta e abre o modal de e-mail. */
  enviarEmailUsuarioEmVisualizacao(): void {
    const usuario = this.usuarioEmVisualizacao;
    if (!usuario) return;
    this.fecharModalVisualizarUsuario();
    this.abrirModalEmailUsuario(usuario);
  }

  // ----- Situação da conta (ativa / suspensa / desativada) -----

  /** Suspensa temporariamente: inativa com data de reativação automática. */
  estaSuspenso(usuario: UsuarioModeracao): boolean {
    return usuario.status === 'inativo' && !!usuario.suspensoAte;
  }

  /** Classe do badge de status: `ativo`, `suspenso` ou `inativo` (desativada por tempo indeterminado). */
  getStatusUsuarioClass(usuario: UsuarioModeracao): string {
    if (usuario.status === 'ativo') return 'ativo';
    return this.estaSuspenso(usuario) ? 'suspenso' : 'inativo';
  }

  getStatusUsuarioTexto(usuario: UsuarioModeracao): string {
    if (usuario.status === 'ativo') return 'Ativo';
    return this.estaSuspenso(usuario) ? 'Suspenso' : 'Desativado';
  }

  /**
   * "12/09/2026 às 14:30" — mesmo formato do e-mail e do log do backend
   * (EmailTemplates.FORMATO_DATA). Aceita o ISO local devolvido pela API ou um Date.
   */
  formatarDataHora(valor: string | Date | null | undefined): string {
    if (!valor) return '';
    const data = valor instanceof Date ? valor : new Date(valor);
    if (isNaN(data.getTime())) return '';
    const dia = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dia} às ${hora}`;
  }

  // ----- Modal Desativar / Suspender Conta -----

  abrirModalDesativarUsuario(usuario: UsuarioModeracao): void {
    this.usuarioEmDesativacao = usuario;
    this.tipoDesativacao = 'indeterminada';
    this.reativacaoEmDesativacao = '';
    this.justificativaDesativacao = '';
    this.erroDesativacao = '';
    this.salvandoDesativacao = false;
    this.mostrarModalDesativarUsuario = true;
    this.soundService.tocar('alerta');
  }

  fecharModalDesativarUsuario(): void {
    if (this.salvandoDesativacao) return;
    this.mostrarModalDesativarUsuario = false;
    this.usuarioEmDesativacao = null;
  }

  selecionarTipoDesativacao(tipo: TipoDesativacao): void {
    this.tipoDesativacao = tipo;
    this.erroDesativacao = '';
  }

  /** Menor valor aceito pelo datetime-local: o minuto atual, no fuso do navegador. */
  get minimoReativacao(): string {
    return this.paraDatetimeLocal(new Date());
  }

  /** Data escolhida no datetime-local, ou null se vazia/inválida. */
  get dataReativacao(): Date | null {
    if (!this.reativacaoEmDesativacao) return null;
    const data = new Date(this.reativacaoEmDesativacao);
    return isNaN(data.getTime()) ? null : data;
  }

  get dataReativacaoFutura(): boolean {
    const data = this.dataReativacao;
    return !!data && data.getTime() > Date.now();
  }

  /** Só acusa erro depois que o campo foi preenchido — vazio é "ainda não escolheu". */
  get reativacaoInvalida(): boolean {
    return !!this.reativacaoEmDesativacao && !this.dataReativacaoFutura;
  }

  get resumoReativacao(): string {
    return this.dataReativacaoFutura
      ? `A conta será reativada automaticamente em ${this.formatarDataHora(this.dataReativacao)}.`
      : '';
  }

  get podeConfirmarDesativacao(): boolean {
    if (!this.usuarioEmDesativacao || this.salvandoDesativacao) return false;
    if (this.justificativaDesativacao.length > this.limiteJustificativa) return false;
    return this.tipoDesativacao === 'indeterminada' || this.dataReativacaoFutura;
  }

  confirmarDesativacaoUsuario(): void {
    if (!this.podeConfirmarDesativacao || !this.usuarioEmDesativacao) return;

    const temporaria = this.tipoDesativacao === 'temporaria';
    const justificativa = this.justificativaDesativacao.trim();
    const dados: AlterarStatusUsuario = {
      acao: temporaria ? 'SUSPENDER' : 'DESATIVAR',
      justificativa: justificativa || undefined,
      reativacaoEm: temporaria ? this.paraIsoLocal(this.reativacaoEmDesativacao) : undefined,
    };

    this.salvandoDesativacao = true;
    this.erroDesativacao = '';

    this.adminService.alterarStatusUsuario(this.usuarioEmDesativacao.codigo, dados).subscribe({
      next: (atualizado) => {
        this.substituirUsuario(atualizado);
        this.salvandoDesativacao = false;
        this.fecharModalDesativarUsuario();
        this.soundService.tocar('exclusao');
        this.exibirMensagemSucesso(temporaria
          ? `Conta de "${atualizado.nome}" suspensa até ${this.formatarDataHora(atualizado.suspensoAte)}.`
          : `Conta de "${atualizado.nome}" desativada por tempo indeterminado.`);
        this.carregarLogs();
      },
      error: (err) => {
        this.salvandoDesativacao = false;
        this.erroDesativacao = err?.error?.message || 'Erro ao alterar o status da conta. Tente novamente.';
        this.soundService.tocar('erro');
        this.cdr.detectChanges();
      }
    });
  }

  // ----- Modal Reativar Conta -----

  abrirModalReativarUsuario(usuario: UsuarioModeracao): void {
    this.usuarioEmReativacao = usuario;
    this.erroReativacao = '';
    this.salvandoReativacao = false;
    this.mostrarModalReativarUsuario = true;
  }

  fecharModalReativarUsuario(): void {
    if (this.salvandoReativacao) return;
    this.mostrarModalReativarUsuario = false;
    this.usuarioEmReativacao = null;
  }

  confirmarReativacaoUsuario(): void {
    if (!this.usuarioEmReativacao || this.salvandoReativacao) return;

    this.salvandoReativacao = true;
    this.erroReativacao = '';

    this.adminService.alterarStatusUsuario(this.usuarioEmReativacao.codigo, { acao: 'REATIVAR' }).subscribe({
      next: (atualizado) => {
        this.substituirUsuario(atualizado);
        this.salvandoReativacao = false;
        this.fecharModalReativarUsuario();
        this.soundService.tocar('sucesso');
        this.exibirMensagemSucesso(`Conta de "${atualizado.nome}" reativada com sucesso!`);
        this.carregarLogs();
      },
      error: (err) => {
        this.salvandoReativacao = false;
        this.erroReativacao = err?.error?.message || 'Erro ao reativar a conta. Tente novamente.';
        this.soundService.tocar('erro');
        this.cdr.detectChanges();
      }
    });
  }

  // ----- Modal Enviar E-mail -----

  abrirModalEmailUsuario(usuario: UsuarioModeracao): void {
    this.usuarioEmEmail = usuario;
    this.limparCamposEmail();
    this.mostrarModalEmailUsuario = true;
  }

  /** Também limpa os campos: o próximo envio não pode herdar assunto ou mensagem deste. */
  fecharModalEmailUsuario(): void {
    if (this.enviandoEmail) return;
    this.mostrarModalEmailUsuario = false;
    this.usuarioEmEmail = null;
    this.limparCamposEmail();
  }

  private limparCamposEmail(): void {
    this.assuntoEmail = '';
    this.mensagemEmail = '';
    this.erroEmail = '';
    this.enviandoEmail = false;
  }

  /** Assunto e mensagem preenchidos (sem contar espaços) e dentro dos limites do backend. */
  get podeEnviarEmail(): boolean {
    if (!this.usuarioEmEmail || this.enviandoEmail) return false;
    const assunto = this.assuntoEmail.trim();
    const mensagem = this.mensagemEmail.trim();
    return assunto.length > 0 && assunto.length <= this.limiteAssuntoEmail
      && mensagem.length > 0 && mensagem.length <= this.limiteMensagemEmail;
  }

  confirmarEnvioEmail(): void {
    if (!this.podeEnviarEmail || !this.usuarioEmEmail) return;

    const destinatario = this.usuarioEmEmail;
    const dados: EnviarEmailUsuario = {
      assunto: this.assuntoEmail.trim(),
      mensagem: this.mensagemEmail.trim(),
    };

    this.enviandoEmail = true;
    this.erroEmail = '';

    this.adminService.enviarEmailUsuario(destinatario.codigo, dados).subscribe({
      next: () => {
        this.enviandoEmail = false;
        this.fecharModalEmailUsuario();
        this.soundService.tocar('sucesso');
        this.exibirMensagemSucesso(`E-mail para "${destinatario.nome}" enviado com sucesso!`);
        this.carregarLogs();
      },
      error: (err) => {
        this.enviandoEmail = false;
        this.erroEmail = err?.error?.message || 'Erro ao enviar o e-mail. Tente novamente.';
        this.soundService.tocar('erro');
        this.cdr.detectChanges();
      }
    });
  }

  // ----- Apoio -----

  /** Troca o registro na lista pelo devolvido pela API — a lista nunca ganha itens por aqui. */
  private substituirUsuario(atualizado: UsuarioModeracao): void {
    const index = this.usuarios.findIndex(u => u.codigo === atualizado.codigo);
    if (index >= 0) this.usuarios[index] = atualizado;
  }

  /** `yyyy-MM-ddTHH:mm` local, o formato que o datetime-local lê e escreve. */
  private paraDatetimeLocal(data: Date): string {
    const dois = (n: number) => String(n).padStart(2, '0');
    return `${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())}`
      + `T${dois(data.getHours())}:${dois(data.getMinutes())}`;
  }

  /**
   * O backend recebe LocalDateTime (sem fuso) e compara com o relógio do
   * servidor, então o valor vai como digitado, só completando os segundos.
   */
  private paraIsoLocal(valorDatetimeLocal: string): string {
    return valorDatetimeLocal.length === 16 ? `${valorDatetimeLocal}:00` : valorDatetimeLocal;
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

  /** Abre a página administrativa do idioma (módulos e frases), somente leitura. */
  visualizarIdioma(idioma: Idioma): void {
    this.router.navigate(['/visualizar-idioma-adm'], { queryParams: { id: idioma.codigo } });
  }

  excluirIdioma(idioma: Idioma): void {
    this.idiomaEmExclusao = idioma;
    this.mensagemExclusaoIdioma = '';
    this.erroExclusaoIdioma = '';
    this.excluindoIdioma = false;
    this.mostrarModalExcluirIdioma = true;
    this.soundService.tocar('alerta');
  }

  fecharModalExcluirIdioma(): void {
    if (this.excluindoIdioma) return;
    this.mostrarModalExcluirIdioma = false;
    this.idiomaEmExclusao = null;
    this.mensagemExclusaoIdioma = '';
    this.erroExclusaoIdioma = '';
  }

  /**
   * Exclui o idioma e avisa o proprietário por e-mail. A mensagem é opcional:
   * em branco, o backend envia o aviso padrão da equipe de moderação.
   */
  confirmarExclusaoIdioma(): void {
    if (!this.idiomaEmExclusao || this.excluindoIdioma) return;

    const codigo = this.idiomaEmExclusao.codigo;
    const nomeIdioma = this.idiomaEmExclusao.nome;
    const mensagem = this.mensagemExclusaoIdioma.trim();
    this.excluindoIdioma = true;
    this.erroExclusaoIdioma = '';

    this.adminService.excluirIdiomaAdmin(codigo, mensagem ? { mensagem } : {}).subscribe({
      next: () => {
        this.idiomas = this.idiomas.filter(i => i.codigo !== codigo);
        this.excluindoIdioma = false;
        this.fecharModalExcluirIdioma();
        this.soundService.tocar('exclusao');
        this.exibirMensagemSucesso(`Idioma "${nomeIdioma}" excluído. O proprietário foi avisado por e-mail.`);
        this.carregarLogs();
      },
      error: (err) => {
        this.excluindoIdioma = false;
        this.erroExclusaoIdioma = err?.error?.message || 'Erro ao excluir idioma.';
        this.soundService.tocar('erro');
        this.cdr.detectChanges();
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
      logs = logs.filter(log => this.camposBuscaveisLog(log).some(campo => campo.includes(termo)));
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

  /**
   * Texto pesquisável de um log: código, quem fez (ou "sistema"), a ação, os
   * detalhes e quem foi afetado — nome e código de usuário e de idioma.
   */
  private camposBuscaveisLog(log: Log): string[] {
    return [
      log.codigo,
      this.nomeResponsavelLog(log),
      log.codigoAdmin,
      log.acao,
      log.detalhes,
      log.usuarioAfetado?.nome,
      log.usuarioAfetado?.codigo,
      log.idiomaAfetado?.nome,
      log.idiomaAfetado?.codigo
    ].filter((campo): campo is string => !!campo).map(campo => campo.toLowerCase());
  }

  /** Quem responde pela ação: o administrador ou, sem ele, o próprio sistema. */
  nomeResponsavelLog(log: Log): string {
    if (log.acaoSistema || !log.adminNome) return 'Sistema';
    return log.adminNome;
  }

  getLogTipoClass(tipo: Log['tipo']): string {
    switch(tipo) {
      case 'denuncia': return 'log-denuncia';
      case 'usuario': return 'log-usuario';
      case 'idioma': return 'log-idioma';
      case 'moderacao': return 'log-moderacao';
      case 'email': return 'log-email';
      default: return '';
    }
  }

  getLogTipoNome(tipo: Log['tipo']): string {
    switch(tipo) {
      case 'denuncia': return 'denúncia';
      case 'usuario': return 'usuário';
      case 'idioma': return 'idioma';
      case 'moderacao': return 'moderação';
      case 'email': return 'e-mail';
      default: return tipo;
    }
  }

  /** Nome e código de quem foi afetado, no mesmo formato do rodapé do admin. */
  descreverAfetado(afetado: Log['usuarioAfetado']): string {
    if (!afetado) return '';
    const nome = afetado.nome || 'Sem nome';
    return afetado.codigo ? `${nome} (${afetado.codigo})` : nome;
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