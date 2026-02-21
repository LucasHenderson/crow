import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ModuloService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getModulosPorIdioma(idiomaId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/idiomas/${idiomaId}/modulos`);
  }

  criarModulo(idiomaId: string, dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/idiomas/${idiomaId}/modulos`, dados);
  }

  editarModulo(idiomaId: string, id: number, dados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/idiomas/${idiomaId}/modulos/${id}`, dados);
  }

  excluirModulo(idiomaId: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/idiomas/${idiomaId}/modulos/${id}`);
  }
}
