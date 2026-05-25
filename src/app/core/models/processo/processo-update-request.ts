import { GrupoClienteRequest } from "../grupo-clientes/grupo-cliente-request ";
import { GrupoEnvolvidosRequest } from "../grupo-envolvidos/grupo-envolvidos-request";
import { GrupoEtiquetaRequest } from "../grupo-etiquetas/grupo-etiquetas";

export interface ProcessoUpdateRequest {

  acaoId?: string | null;
  varaId?: string | null;

  usuarioResponsavelId?: string | null;

  juizo?: string;

  pasta?: string;

  titulo?: string;

  numeroProcesso?: string;

  linkTribunal?: string;

  objeto?: string;

  valorCausa?: number | null;

  distribuido?: Date | string | null;

  valorCondenacao?: number | null;

  observacao?: string;

  instancia?: number | null;

  acesso?: number | null;

  tipoProcesso?: number | null;

  novaLocalizacao?: string;
 localizacaoInicialId?: string;
  grupoClienteProcesso?: GrupoClienteRequest[];
  grupoEnvolvidosProcesso?: GrupoEnvolvidosRequest[];
  grupoEtiquetasProcesso?: GrupoEtiquetaRequest[];
}