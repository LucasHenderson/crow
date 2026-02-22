import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IdiomaAdm, IdiomaBusca } from '../models/idioma.model';

@Injectable({ providedIn: 'root' })
export class IdiomaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getIdiomasUsuario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/idiomas/meus`);
  }

  buscarIdiomas(q?: string): Observable<IdiomaBusca[]> {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.http.get<IdiomaBusca[]>(`${this.apiUrl}/idiomas${params}`);
  }

  getIdiomaPorId(id: number | string): Observable<IdiomaAdm> {
    return this.http.get<IdiomaAdm>(`${this.apiUrl}/idiomas/${id}`);
  }

  criarIdioma(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/idiomas`, dados);
  }

  editarIdioma(id: number | string, dados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/idiomas/${id}`, dados);
  }

  excluirIdioma(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/idiomas/${id}`);
  }

  importarIdioma(idiomaId: number | string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/idiomas/${idiomaId}/importar`, {});
  }

  avaliarIdioma(idiomaId: number | string, nota: number): Observable<{ novaMedia: number; totalAvaliacoes: number }> {
    return this.http.post<{ novaMedia: number; totalAvaliacoes: number }>(`${this.apiUrl}/idiomas/${idiomaId}/avaliar`, { nota });
  }

  denunciarIdioma(idiomaId: number | string, dados: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/idiomas/${idiomaId}/denunciar`, dados);
  }
}
