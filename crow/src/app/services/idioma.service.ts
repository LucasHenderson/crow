import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IdiomaAdm, IdiomaBusca, Proficiencia } from '../models/idioma.model';

@Injectable({ providedIn: 'root' })
export class IdiomaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getIdiomasUsuario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/idiomas/meus`);
  }

  buscarIdiomas(q?: string): Observable<IdiomaBusca[]> {
    const params = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.http.get<any[]>(`${this.apiUrl}/idiomas${params}`).pipe(
      map(lista => lista.map(i => this.toIdiomaBusca(i)))
    );
  }

  /**
   * Normaliza a resposta do backend (IdiomaResponse) para o modelo de busca.
   * Converte `criadoEm` (string ISO) em Date — necessário para a ordenação —
   * e garante um valor de proficiência válido.
   */
  private toIdiomaBusca(i: any): IdiomaBusca {
    return {
      codigo: i.codigo,
      nome: i.nome,
      idioma: i.idioma,
      bandeira: i.bandeira,
      modulos: i.modulos ?? 0,
      avaliacao: i.avaliacao ?? 0,
      totalAvaliacoes: i.totalAvaliacoes ?? 0,
      criadoEm: i.criadoEm ? new Date(i.criadoEm) : new Date(),
      proficiencia: (i.proficiencia || 'iniciante') as Proficiencia
    };
  }

  getIdiomaPorCodigo(codigo: string): Observable<IdiomaAdm> {
    return this.http.get<IdiomaAdm>(`${this.apiUrl}/idiomas/${codigo}`);
  }

  criarIdioma(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/idiomas`, dados);
  }

  editarIdioma(codigo: string, dados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/idiomas/${codigo}`, dados);
  }

  excluirIdioma(codigo: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/idiomas/${codigo}`);
  }

  importarIdioma(codigo: string): Observable<IdiomaAdm> {
    return this.http.post<IdiomaAdm>(`${this.apiUrl}/idiomas/${codigo}/importar`, {});
  }

  avaliarIdioma(codigo: string, nota: number): Observable<{ novaMedia: number; totalAvaliacoes: number }> {
    return this.http.post<{ novaMedia: number; totalAvaliacoes: number }>(`${this.apiUrl}/idiomas/${codigo}/avaliar`, { nota });
  }

  denunciarIdioma(codigo: string, dados: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/idiomas/${codigo}/denunciar`, dados);
  }
}
