import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Denuncia } from '../models/denuncia.model';
import { UsuarioModeracao } from '../models/usuario.model';
import { IdiomaAdm } from '../models/idioma.model';
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

  alterarStatusUsuario(codigo: string, novoStatus: string): Observable<UsuarioModeracao> {
    return this.http.put<UsuarioModeracao>(`${this.apiUrl}/admin/usuarios/${codigo}/status`, { status: novoStatus });
  }

  getIdiomasAdmin(): Observable<IdiomaAdm[]> {
    return this.http.get<IdiomaAdm[]>(`${this.apiUrl}/admin/idiomas`);
  }

  editarIdiomaAdmin(codigo: string, dados: any): Observable<IdiomaAdm> {
    return this.http.put<IdiomaAdm>(`${this.apiUrl}/admin/idiomas/${codigo}`, dados);
  }

  excluirIdiomaAdmin(codigo: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/idiomas/${codigo}`);
  }

  getLogs(): Observable<Log[]> {
    return this.http.get<Log[]>(`${this.apiUrl}/admin/logs`);
  }
}
