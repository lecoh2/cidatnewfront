export interface ProcessoLocalizacaoResponse {
  id: string;
  processoId: string;
  local: string;
  observacao?: string;
  atual: boolean;

  dataCadastro?: string;
  dataSaida?: string;

  usuarioCriacaoId?: string;
  usuarioCriacaoNome?: string;

  usuarioSaidaId?: string;
  usuarioSaidaNome?: string;
}