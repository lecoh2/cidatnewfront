export interface RelatorioMensalResponse {

  quantidadeProcessosCadastrados: number;

  quantidadeProcessosAtendidos: number;

  quantidadeProcessosEnviados: number;

  quantidadeRetornoGabinete: number;

  processosUrgentes: number;

  funcionarios: FuncionarioRelatorio[];

  estagiarios: EstagiarioRelatorio[];

  processosPorUsuario: ProcessoPorUsuario[];

}

export interface FuncionarioRelatorio {

  nome: string;

  quantidadeProcessos: number;

}

export interface EstagiarioRelatorio {

  nome: string;

  quantidadeProcessos: number;

}

export interface ProcessoPorUsuario {

  usuario: string;

  quantidadeProcessos: number;

  processos: string[];

}