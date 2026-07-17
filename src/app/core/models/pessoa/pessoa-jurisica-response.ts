import { PessoaBase } from './pessoa-base-request';

export interface PessoaJuridicaResponse extends PessoaBase {
  cnpj?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  simplesNacional?: number;
}