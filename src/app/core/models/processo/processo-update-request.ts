import { ProcessoDocumentoRequest } from './processo-documento-request';

export interface ProcessoUpdateRequest {
  usuarioResponsavelId?: string;
  estagiarioResponsavelId?: string;

  titulo?: string;
  numeroProcesso?: string;
  objeto?: string;
  distribuido?: string;

  observacao?: string;

  acesso?: number;
  tipoProcesso?: number;

  novaLocalizacao?: string;
  localizacaoInicialId?: string;

  documentos?: ProcessoDocumentoRequest[];

  grupoClienteProcesso?: {
    idPessoa: string;
  }[];

  grupoEnvolvidosProcesso?: {
    idPessoa: string;
  }[];

  grupoEtiquetasProcesso?: {
    etiquetaId: string;
  }[];
}