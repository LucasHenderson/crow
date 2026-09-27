import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ModuloService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getModulosPorIdioma(codigoIdioma: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/idiomas/${codigoIdioma}/modulos`);
  }

  criarModulo(codigoIdioma: string, dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/idiomas/${codigoIdioma}/modulos`, dados);
  }

  editarModulo(codigoIdioma: string, id: number, dados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/idiomas/${codigoIdioma}/modulos/${id}`, dados);
  }

  excluirModulo(codigoIdioma: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/idiomas/${codigoIdioma}/modulos/${id}`);
  }

  /**
   * Persiste a ordem dos módulos do idioma. O backend exige a lista **completa**
   * de ids na ordem desejada e recusa listas parciais, com ids repetidos ou de
   * outro idioma.
   */
  reordenarModulos(codigoIdioma: string, ids: number[]): Observable<any[]> {
    return this.http.put<any[]>(`${this.apiUrl}/idiomas/${codigoIdioma}/modulos/ordem`, { ids });
  }
}
