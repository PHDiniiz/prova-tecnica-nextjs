/**
 * Tipos relacionados ao Dashboard de Performance
 */

/**
 * Período de filtro para métricas
 */
export type PeriodoFiltro = 'semanal' | 'mensal' | 'acumulado';

/**
 * Informações de variação de uma métrica
 */
export interface VariacaoMetrica {
  valor: number; // Variação percentual
  tipo: 'positivo' | 'negativo' | 'neutro';
  periodo: string; // Descrição do período comparado (ex: "vs mês anterior")
}

/**
 * Métricas gerais do dashboard
 */
export interface DashboardMetrics {
  membrosAtivos: number;
  totalIndicacoes: number;
  indicacoesMes: number;
  totalObrigados: number;
  obrigadosMes: number;
  taxaConversaoIntencoes: number; // Percentual de intenções aprovadas
  taxaFechamentoIndicacoes: number; // Percentual de indicações fechadas
  valorTotalEstimado: number; // Soma dos valores estimados das indicações fechadas
  valorMedioIndicacao: number; // Valor médio por indicação fechada
  tempoMedioFechamento: number; // Tempo médio em dias entre criação e fechamento
  periodo: PeriodoFiltro;
  dataInicio: Date;
  dataFim: Date;
  // Variações comparando com período anterior
  variacoes?: {
    membrosAtivos?: VariacaoMetrica;
    indicacoesMes?: VariacaoMetrica;
    obrigadosMes?: VariacaoMetrica;
    taxaConversaoIntencoes?: VariacaoMetrica;
    taxaFechamentoIndicacoes?: VariacaoMetrica;
    valorTotalEstimado?: VariacaoMetrica;
    tempoMedioFechamento?: VariacaoMetrica;
  };
}

/**
 * Performance individual de um membro
 */
export interface MemberPerformance {
  membroId: string;
  membroNome: string;
  membroEmail: string;
  membroEmpresa: string;
  totalIndicacoesFeitas: number;
  totalIndicacoesRecebidas: number;
  indicacoesFechadas: number;
  totalObrigadosRecebidos: number;
  taxaFechamento: number; // Percentual de indicações recebidas que foram fechadas
  valorTotalGerado: number; // Soma dos valores das indicações fechadas que recebeu
  periodo: PeriodoFiltro;
}

/**
 * Resposta da API de dashboard
 */
export interface DashboardResponse {
  success: boolean;
  data: {
    metricasGerais: DashboardMetrics;
    performanceMembros?: MemberPerformance[];
    performanceIndividual?: MemberPerformance;
  };
  periodo: PeriodoFiltro;
}

/**
 * Filtros para buscar métricas
 */
export interface DashboardFiltros {
  periodo: PeriodoFiltro;
  membroId?: string; // Para performance individual
}

