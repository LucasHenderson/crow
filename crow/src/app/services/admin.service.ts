import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Denuncia } from '../models/denuncia.model';
import { AlterarStatusUsuario, EnviarEmailUsuario, UsuarioModeracao } from '../models/usuario.model';
import { ExcluirIdioma, IdiomaAdm, IdiomaCompletoAdm } from '../models/idioma.model';
import { Log } from '../models/log.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDenuncias(): Observable<Denuncia[]> {
    return this.http.get<Denuncia[]>(`${this.apiUrl}/admin/denuncias`);
  }

  alterarStatusDenuncia(codigo: string, status: string): Observable<Denuncia> {
    return this.http.put<Denuncia>(`${this.apiUrl}/admin/denuncias/${codigo}/status`, { status });
  }

  /** Contas sujeitas à moderação — o backend já exclui administradores. */
  getUsuariosAdmin(): Observable<UsuarioModeracao[]> {
    return this.http.get<UsuarioModeracao[]>(`${this.apiUrl}/admin/usuarios`);
  }

  /** Desativa, suspende ou reativa uma conta — ver {@link AlterarStatusUsuario}. */
  alterarStatusUsuario(codigo: string, dados: AlterarStatusUsuario): Observable<UsuarioModeracao> {
    return this.http.put<UsuarioModeracao>(`${this.apiUrl}/admin/usuarios/${codigo}/status`, dados);
  }

  /**
   * Mensagem livre ao e-mail cadastrado do usuário. O backend responde 202 assim
   * que aceita o pedido: o envio em si é assíncrono e uma falha de SMTP depois
   * disso fica só no log da API — não há confirmação de entrega.
   */
  enviarEmailUsuario(codigo: string, dados: EnviarEmailUsuario): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/admin/usuarios/${codigo}/email`, dados);
  }

  getIdiomasAdmin(): Observable<IdiomaAdm[]> {
    return this.http.get<IdiomaAdm[]>(`${this.apiUrl}/admin/idiomas`);
  }

  /** Idioma com módulos e frases para avaliação do conteúdo — somente leitura. */
  getIdiomaCompletoAdmin(codigo: string): Observable<IdiomaCompletoAdm> {
    return this.http.get<IdiomaCompletoAdm>(`${this.apiUrl}/admin/idiomas/${codigo}`);
  }

  /**
   * Exclui o idioma (módulos, frases, avaliações e vínculos) e avisa o
   * proprietário por e-mail. `dados.mensagem` substitui o texto padrão do
   * aviso; sem ela, o backend envia a mensagem padrão.
   */
  excluirIdiomaAdmin(codigo: string, dados: ExcluirIdioma = {}): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/idiomas/${codigo}`, { body: dados });
  }

  getLogs(): Observable<Log[]> {
    return this.http.get<Log[]>(`${this.apiUrl}/admin/logs`);
  }
}
