import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { PessoaFisicaRequest } from '../models/pessoa/pessoas-fisica-request';
import { PessoaJuridicaRequest } from '../models/pessoa/pessoa-juridica-request';

import { PessoaFisicaResponse } from '../models/pessoa/pessoa-fisica-response';
import { PessoaJuridicaResponse } from '../models/pessoa/pessoa-jurisica-response';


import { PessoaResumo } from '../models/pessoa/pessoa-resumo';

import { ApiResponse } from '../models/respostas/api-response';

import { PessoaJuridicaUpdateRequest } from '../models/pessoa/pessoa-juridica-update-request';
import { PessoaFisicaUpdateRequest } from '../models/pessoa/pessoa-fisica-update-request';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {

  // atributos
  private url = environment.apiDeslandes;
  private http = inject(HttpClient);

  // ========================= PESSOA FÍSICA =========================

  cadastrarPessoaFisica(
    request: PessoaFisicaRequest
  ): Observable<ApiResponse<PessoaFisicaResponse>> {

    return this.http.post<ApiResponse<PessoaFisicaResponse>>(
      `${this.url}/api/v1/pessoa-fisica/cadastrar-pessoa-fisica`,
      request
    );
  }

  consultarPessoaFisicaPaginado(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<any> {

    const params: any = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    };

    if (searchTerm) {
      params.searchTerm = searchTerm;
    }

    return this.http.get<any>(
      `${this.url}/api/v1/pessoa-fisica/consultar-pessoa-fisica-paginacao`,
      { params }
    );
  }

  consultarPessoaFisicaPorId(
    id: string
  ): Observable<ApiResponse<PessoaFisicaResponse>> {

    return this.http.get<ApiResponse<PessoaFisicaResponse>>(
      `${this.url}/api/v1/pessoa-fisica/consultar-pessoa-fisica/${id}`
    );
  }

editarPessoaFisica(
  id: string,
  request: PessoaFisicaUpdateRequest
): Observable<ApiResponse<PessoaFisicaResponse>> {

  return this.http.put<ApiResponse<PessoaFisicaResponse>>(
    `${this.url}/api/v1/pessoa-fisica/atualizar-pessoa-fisica/${id}`,
    request
  );
}
consultarHistoricoPessoaFisica(
  id: string
): Observable<any[]> {

  return this.http.get<any[]>(
    `${this.url}/api/v1/pessoa-fisica/consultar-historico-pessoa-fisica/${id}`
  );
}
  // ========================= PESSOA JURÍDICA =========================

  cadastrarPessoaJuridica(
    request: PessoaJuridicaRequest
  ): Observable<ApiResponse<PessoaJuridicaResponse>> {

    return this.http.post<ApiResponse<PessoaJuridicaResponse>>(
      `${this.url}/api/v1/pessoa-juridica/cadastrar-pessoa-juridica`,
      request
    );
  }

  consultarPessoaJuridicaPaginado(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<any> {

    const params: any = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    };

    if (searchTerm) {
      params.searchTerm = searchTerm;
    }

    return this.http.get<any>(
      `${this.url}/api/v1/pessoa-juridica/consultar-pessoa-juridica-paginacao`,
      { params }
    );
  }

  // ========================= RESUMO DE PESSOAS =========================

  consultarPessoasResumo(
    termo?: string,
    limite: number = 50
  ): Observable<PessoaResumo[]> {

    let params = new HttpParams()
      .set('limite', limite.toString());

    if (termo) {
      params = params.set('termo', termo);
    }

    return this.http.get<PessoaResumo[]>(
      `${this.url}/api/v1/pessoas/resumo`,
      { params }
    );
  }
  consultarPessoaJuridicaPorId(
  id: string
): Observable<ApiResponse<PessoaJuridicaResponse>> {

  return this.http.get<ApiResponse<PessoaJuridicaResponse>>(
    `${this.url}/api/v1/pessoa-juridica/consultar-pessoa-juridica/${id}`
  );
}

editarPessoaJuridica(
  id: string,
  request: PessoaJuridicaUpdateRequest
): Observable<ApiResponse<PessoaJuridicaResponse>> {

  return this.http.put<ApiResponse<PessoaJuridicaResponse>>(
    `${this.url}/api/v1/pessoa-juridica/atualizar-pessoa-juridica/${id}`,
    request
  );
}
}