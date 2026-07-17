import { EnderecoRequest } from '../endereco/endereco-request';
import { PerfilEnum } from '../enums/perfil/perfilEnum';
import { TipoContaEnum } from '../enums/tipoconta/tipocontaEnum';
import { InformacoesComplementaresRequest } from '../informacoes-complementares/informacoes-complementares-request';

export interface PessoaBase {
  id?: string;
  idUsuario?: string;

  nome?: string;
  apelido?: string;
  telefone?: string;
  site?: string;
  email?: string;

  dataCadastro?: Date;
  dataAtualizacao?: Date;

  endereco?: EnderecoRequest;
  informacoesComplementares?: InformacoesComplementaresRequest;

  idEtiqueta?: string;

  perfil?: PerfilEnum;
  idPerfil?: number;

  tipoConta?: TipoContaEnum;
}