import { GrupoClienteRequest } from "../grupo-clientes/grupo-cliente-request ";
import { GrupoEnvolvidosRequest } from "../grupo-envolvidos/grupo-envolvidos-request";
import { GrupoEtiquetaRequest } from "../grupo-etiquetas/grupo-etiquetas";

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

  grupoCliente?: GrupoClienteRequest[];
  grupoEnvolvidos?: GrupoEnvolvidosRequest[];
  grupoEtiquetas?: GrupoEtiquetaRequest[];
}


