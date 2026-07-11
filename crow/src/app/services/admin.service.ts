import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Denuncia } from '../models/denuncia.model';
import { Usuario } from '../models/usuario.model';
import { IdiomaAdm } from '../models/idioma.model';
import { Log } from '../models/log.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDenuncias(): Observable<Denuncia[]> {
    return this.http.get<Denuncia[]>(`${this.apiUrl}/admin/denuncias`);
  }

  alterarStatusDenuncia(id: number, status: string): Observable<Denuncia> {
    return this.http.put<Denuncia>(`${this.apiUrl}/admin/denuncias/${id}/status`, { status });
  }

  getUsuariosAdmin(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/admin/usuarios`);
  }

  editarUsuarioAdmin(id: number | string, dados: any): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/admin/usuarios/${id}`, dados);
  }

  alterarStatusUsuario(id: number | string, novoStatus: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/admin/usuarios/${id}/status`, { status: novoStatus });
  }

  getIdiomasAdmin(): Observable<IdiomaAdm[]> {
    return this.http.get<IdiomaAdm[]>(`${this.apiUrl}/admin/idiomas`);
  }

  editarIdiomaAdmin(id: number | string, dados: any): Observable<IdiomaAdm> {
    return this.http.put<IdiomaAdm>(`${this.apiUrl}/admin/idiomas/${id}`, dados);
  }

  excluirIdiomaAdmin(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/idiomas/${id}`);
  }

  getLogs(): Observable<Log[]> {
    return this.http.get<Log[]>(`${this.apiUrl}/admin/logs`);
  }
}
