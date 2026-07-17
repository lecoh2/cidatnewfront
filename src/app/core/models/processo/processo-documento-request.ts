import { TipoDocumentoProcessoEnum } from "../enums/tipo-documento/tipo-documento-processo-enum";


export interface ProcessoDocumentoRequest {
  tipoDocumento: TipoDocumentoProcessoEnum;
  numeroDocumento: string;
}