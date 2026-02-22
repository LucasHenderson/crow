import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Frase } from '../models/frase.model';

@Injectable({ providedIn: 'root' })
export class FraseService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFrasesPorModulo(moduloId: number | string): Observable<Frase[]> {
    return this.http.get<Frase[]>(`${this.apiUrl}/modulos/${moduloId}/frases`);
  }

  criarFrase(moduloId: number | string, dados: any): Observable<Frase> {
    return this.http.post<Frase>(`${this.apiUrl}/modulos/${moduloId}/frases`, dados);
  }

  editarFrase(moduloId: number | string, id: number, dados: any): Observable<Frase> {
    return this.http.put<Frase>(`${this.apiUrl}/modulos/${moduloId}/frases/${id}`, dados);
  }

  excluirFrase(moduloId: number | string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/modulos/${moduloId}/frases/${id}`);
  }

  getFrasesParaJogo(moduloIds: string[]): Observable<Frase[]> {
    return this.http.get<Frase[]>(`${this.apiUrl}/modulos/0/frases/jogar`, {
      params: { modulos: moduloIds.join(',') }
    });
  }
}
