import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { RelatorioMensalResponse } from '../models/usuario/relatorio-mensal-response';



@Injectable({
  providedIn: 'root'
})
export class RelatorioService {

  // =========================
  // ATRIBUTOS
  // =========================
  private url = environment.apiDeslandes;

  private http = inject(HttpClient);

  // =========================
  // RELATÓRIO MENSAL
  // =========================
  obterRelatorioMensal(
    mes: number,
    ano: number
  ): Observable<RelatorioMensalResponse> {

    return this.http.get<RelatorioMensalResponse>(
      `${this.url}/api/v1/processo/relatorio-mensal/${mes}/${ano}`
    );
  }
}