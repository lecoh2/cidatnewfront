import { EnderecoRequest } from '../endereco/endereco-request';
import { InformacoesComplementaresRequest } from '../informacoes-complementares/informacoes-complementares-request';

export interface PessoaFisicaUpdateRequest {
  idPessoa?: string;
  nome?: string | null;
  apelido?: string | null;
  idEtiqueta?: number | null;
  email?: string | null;
  site?: string | null;
  idPerfil?: number | null;
  rg?: string | null;
  cpf?: string | null;
  tituloEleitor?: string | null;
  carteiraTrabalho?: string | null;
  pisPasep?: string | null;
  cnh?: string | null;
  passaporte?: string | null;
  certidaoReservista?: string | null;
  telefone?: string | null;
  idUsuario?: string | null;
  idSexo?: string | null;
  observacoes?: string | null;

  endereco?: EnderecoRequest | null;
  informacoesComplementares?: InformacoesComplementaresRequest | null;
}