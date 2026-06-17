import { GrupoAtendimentoClienteResponse } from "../grupo-atendimento-cliente/grupo-atendimento-cliente-response";
import { GrupoEtiquetaAtendimentoResponse } from "../grupo-atendimento-etiquetas/grupo-etiqueta-atendimento-response";

export interface ConsultarAtendimentoPaginacaoResponse {
  assunto: string;
  registro: string;

  processoId?: string;
  casoId?: string;
  atendimentoPaiId?: string;
  responsavelId?: string;

idControleAtendimento?: string;
codigoControle?: number;
anoBaseControle?: string;
numeroControle?: string;

  grupoAtendimentoCliente: GrupoAtendimentoClienteResponse[];
  grupoAtendimentoEtiqueta: GrupoEtiquetaAtendimentoResponse[];
}