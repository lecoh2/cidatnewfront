import { EnderecoRequest } from '../endereco/endereco-request';
import { InformacoesComplementaresRequest } from '../informacoes-complementares/informacoes-complementares-request';

export interface PessoaJuridicaUpdateRequest {
  nome?: string;
  apelido?: string;
  telefone?: string;
  email?: string;
  site?: string;

  cnpj?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  simplesNacional?: number;

  idUsuario?: string;
  observacoes?: string;

  endereco?: EnderecoRequest;
  informacoesComplementares?: InformacoesComplementaresRequest;
}