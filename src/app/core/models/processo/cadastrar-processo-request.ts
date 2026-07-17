import { GrupoClienteRequest } from "../grupo-clientes/grupo-cliente-request ";
import { GrupoEnvolvidosRequest } from "../grupo-envolvidos/grupo-envolvidos-request";
import { GrupoEtiquetaRequest } from "../grupo-etiquetas/grupo-etiquetas";
import { ProcessoDocumentoRequest } from "./processo-documento-request";

export interface CadastrarProcessoRequest {

  usuarioResponsavelId?: string;

  pasta?: string;
  titulo?: string;
  numeroProcesso?: string;

  objeto?: string;

  distribuido?: string;

  observacao?: string;
  instancia?: number;
  acesso?: number;

    estagiarioResponsavelId?: string | null;

  documentos?: ProcessoDocumentoRequest[];


  grupoCliente?: GrupoClienteRequest[];
  grupoEnvolvidos?: GrupoEnvolvidosRequest[];
  grupoEtiquetas?: GrupoEtiquetaRequest[];
}


