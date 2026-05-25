export interface CriarAtendimentoClienteResponse {
  id: string;

  assunto: string;

  registro: string;

  quantidadeAtendimentosMesmoProcesso: number;

  grupoAtendimentoCliente: any[];

  grupoAtendimentoEtiqueta: any[];
}