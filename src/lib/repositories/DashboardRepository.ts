import { Db, ObjectId } from 'mongodb';
import { PeriodoFiltro, DashboardMetrics, MemberPerformance } from '@/types/dashboard';

/**
 * Repositório para operações de dashboard e métricas
 * Responsabilidade única: Acesso a dados agregados para dashboard
 */
export class DashboardRepository {
  constructor(private db: Db) {}

  /**
   * Calcula as datas de início e fim baseado no período
   */
  private calcularPeriodo(periodo: PeriodoFiltro): { dataInicio: Date; dataFim: Date } {
    const agora = new Date();
    const dataFim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);

    switch (periodo) {
      case 'semanal': {
        const dataInicio = new Date(agora);
        dataInicio.setDate(agora.getDate() - 7);
        dataInicio.setHours(0, 0, 0, 0);
        return { dataInicio, dataFim };
      }
      case 'mensal': {
        const dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0);
        return { dataInicio, dataFim };
      }
      case 'acumulado':
      default: {
        // Data muito antiga para pegar tudo
        const dataInicio = new Date(2000, 0, 1, 0, 0, 0);
        return { dataInicio, dataFim };
      }
    }
  }

  /**
   * Busca métricas gerais do dashboard
   */
  async buscarMetricasGerais(periodo: PeriodoFiltro): Promise<DashboardMetrics> {
    try {
      const { dataInicio, dataFim } = this.calcularPeriodo(periodo);

      // Total de membros ativos
      const totalMembrosAtivos = await this.db
        .collection('members')
        .countDocuments({ ativo: true });

      // Total de indicações (todas)
      const totalIndicacoes = await this.db.collection('referrals').countDocuments({});

      // Indicações do período
      const indicacoesMes = await this.db.collection('referrals').countDocuments({
        criadoEm: {
          $gte: dataInicio,
          $lte: dataFim,
        },
      });

      // Total de obrigados
      const totalObrigados = await this.db
        .collection('obrigados')
        .countDocuments({ publico: true });

      // Obrigados do período
      const obrigadosMes = await this.db.collection('obrigados').countDocuments({
        publico: true,
        criadoEm: {
          $gte: dataInicio,
          $lte: dataFim,
        },
      });

      // Taxa de conversão de intenções (aprovadas / total)
      const totalIntencoes = await this.db.collection('intentions').countDocuments({});
      const intencoesAprovadas = await this.db.collection('intentions').countDocuments({
        status: 'approved',
      });
      const taxaConversaoIntencoes =
        totalIntencoes > 0 ? (intencoesAprovadas / totalIntencoes) * 100 : 0;

      // Taxa de fechamento de indicações (fechadas / total)
      const indicacoesFechadas = await this.db.collection('referrals').countDocuments({
        status: 'fechada',
      });
      const taxaFechamentoIndicacoes =
        totalIndicacoes > 0 ? (indicacoesFechadas / totalIndicacoes) * 100 : 0;

      // Valor total estimado das indicações fechadas
      const pipelineValor = [
        {
          $match: {
            status: 'fechada',
            valorEstimado: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            valorTotal: { $sum: '$valorEstimado' },
            count: { $sum: 1 },
          },
        },
      ];

      const resultadoValor = await this.db
        .collection('referrals')
        .aggregate(pipelineValor)
        .toArray();

      const valorTotalEstimado = resultadoValor[0]?.valorTotal || 0;
      const countFechadasComValor = resultadoValor[0]?.count || 0;
      const valorMedioIndicacao =
        countFechadasComValor > 0 ? valorTotalEstimado / countFechadasComValor : 0;

      return {
        membrosAtivos: totalMembrosAtivos,
        totalIndicacoes,
        indicacoesMes,
        totalObrigados,
        obrigadosMes,
        taxaConversaoIntencoes: Math.round(taxaConversaoIntencoes * 100) / 100,
        taxaFechamentoIndicacoes: Math.round(taxaFechamentoIndicacoes * 100) / 100,
        valorTotalEstimado,
        valorMedioIndicacao: Math.round(valorMedioIndicacao * 100) / 100,
        periodo,
        dataInicio,
        dataFim,
      };
    } catch (error) {
      console.error('Erro ao buscar métricas gerais:', error);
      throw new Error('Não foi possível buscar as métricas do dashboard');
    }
  }

  /**
   * Busca performance de todos os membros
   */
  async buscarMetricasMembros(periodo: PeriodoFiltro): Promise<MemberPerformance[]> {
    try {
      const { dataInicio, dataFim } = this.calcularPeriodo(periodo);

      // Pipeline de agregação para performance de membros
      const pipeline = [
        {
          $facet: {
            // Indicações feitas por membro
            indicacoesFeitas: [
              {
                $match: {
                  criadoEm: {
                    $gte: dataInicio,
                    $lte: dataFim,
                  },
                },
              },
              {
                $group: {
                  _id: '$membroIndicadorId',
                  total: { $sum: 1 },
                },
              },
            ],
            // Indicações recebidas por membro
            indicacoesRecebidas: [
              {
                $match: {
                  criadoEm: {
                    $gte: dataInicio,
                    $lte: dataFim,
                  },
                },
              },
              {
                $group: {
                  _id: '$membroIndicadoId',
                  total: { $sum: 1 },
                  fechadas: {
                    $sum: {
                      $cond: [{ $eq: ['$status', 'fechada'] }, 1, 0],
                    },
                  },
                  valorTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ['$status', 'fechada'] },
                        { $ifNull: ['$valorEstimado', 0] },
                        0,
                      ],
                    },
                  },
                },
              },
            ],
            // Obrigados recebidos por membro
            obrigadosRecebidos: [
              {
                $match: {
                  criadoEm: {
                    $gte: dataInicio,
                    $lte: dataFim,
                  },
                  publico: true,
                },
              },
              {
                $group: {
                  _id: '$membroIndicadorId',
                  total: { $sum: 1 },
                },
              },
            ],
          },
        },
      ];

      const resultado = await this.db.collection('referrals').aggregate(pipeline).toArray();
      const dados = resultado[0];

      // Buscar todos os membros ativos para popular dados
      const membros = await this.db
        .collection('members')
        .find({ ativo: true })
        .toArray();

      // Mapear dados de performance
      const performanceMap = new Map<string, MemberPerformance>();

      // Inicializar com dados dos membros
      membros.forEach((membro) => {
        const membroId = membro._id?.toString() || '';
        performanceMap.set(membroId, {
          membroId,
          membroNome: membro.nome || '',
          membroEmail: membro.email || '',
          membroEmpresa: membro.empresa || '',
          totalIndicacoesFeitas: 0,
          totalIndicacoesRecebidas: 0,
          indicacoesFechadas: 0,
          totalObrigadosRecebidos: 0,
          taxaFechamento: 0,
          valorTotalGerado: 0,
          periodo,
        });
      });

      // Popular indicações feitas
      dados.indicacoesFeitas.forEach((item: any) => {
        const membroId = item._id?.toString() || '';
        const performance = performanceMap.get(membroId);
        if (performance) {
          performance.totalIndicacoesFeitas = item.total;
        }
      });

      // Popular indicações recebidas
      dados.indicacoesRecebidas.forEach((item: any) => {
        const membroId = item._id?.toString() || '';
        const performance = performanceMap.get(membroId);
        if (performance) {
          performance.totalIndicacoesRecebidas = item.total;
          performance.indicacoesFechadas = item.fechadas || 0;
          performance.valorTotalGerado = item.valorTotal || 0;
          performance.taxaFechamento =
            item.total > 0 ? Math.round((item.fechadas / item.total) * 100 * 100) / 100 : 0;
        }
      });

      // Popular obrigados recebidos
      dados.obrigadosRecebidos.forEach((item: any) => {
        const membroId = item._id?.toString() || '';
        const performance = performanceMap.get(membroId);
        if (performance) {
          performance.totalObrigadosRecebidos = item.total;
        }
      });

      return Array.from(performanceMap.values()).sort(
        (a, b) => b.totalIndicacoesRecebidas - a.totalIndicacoesRecebidas
      );
    } catch (error) {
      console.error('Erro ao buscar métricas de membros:', error);
      throw new Error('Não foi possível buscar as métricas de performance dos membros');
    }
  }

  /**
   * Busca performance individual de um membro
   */
  async buscarPerformanceIndividual(
    membroId: string,
    periodo: PeriodoFiltro
  ): Promise<MemberPerformance | null> {
    try {
      const { dataInicio, dataFim } = this.calcularPeriodo(periodo);
      const membroObjectId = new ObjectId(membroId) as any;

      // Buscar dados do membro
      const membro = await this.db.collection('members').findOne({ _id: membroObjectId });

      if (!membro) {
        return null;
      }

      // Indicações feitas
      const indicacoesFeitas = await this.db.collection('referrals').countDocuments({
        membroIndicadorId: membroObjectId,
        criadoEm: {
          $gte: dataInicio,
          $lte: dataFim,
        },
      });

      // Indicações recebidas
      const indicacoesRecebidas = await this.db.collection('referrals').countDocuments({
        membroIndicadoId: membroObjectId,
        criadoEm: {
          $gte: dataInicio,
          $lte: dataFim,
        },
      });

      // Indicações fechadas
      const indicacoesFechadas = await this.db.collection('referrals').countDocuments({
        membroIndicadoId: membroObjectId,
        status: 'fechada',
        criadoEm: {
          $gte: dataInicio,
          $lte: dataFim,
        },
      });

      // Valor total gerado
      const pipelineValor = [
        {
          $match: {
            membroIndicadoId: membroObjectId,
            status: 'fechada',
            valorEstimado: { $exists: true, $ne: null },
            criadoEm: {
              $gte: dataInicio,
              $lte: dataFim,
            },
          },
        },
        {
          $group: {
            _id: null,
            valorTotal: { $sum: '$valorEstimado' },
          },
        },
      ];

      const resultadoValor = await this.db
        .collection('referrals')
        .aggregate(pipelineValor)
        .toArray();

      const valorTotalGerado = resultadoValor[0]?.valorTotal || 0;

      // Obrigados recebidos
      const obrigadosRecebidos = await this.db.collection('obrigados').countDocuments({
        membroIndicadorId: membroObjectId,
        publico: true,
        criadoEm: {
          $gte: dataInicio,
          $lte: dataFim,
        },
      });

      const taxaFechamento =
        indicacoesRecebidas > 0
          ? Math.round((indicacoesFechadas / indicacoesRecebidas) * 100 * 100) / 100
          : 0;

      return {
        membroId,
        membroNome: membro.nome || '',
        membroEmail: membro.email || '',
        membroEmpresa: membro.empresa || '',
        totalIndicacoesFeitas: indicacoesFeitas,
        totalIndicacoesRecebidas: indicacoesRecebidas,
        indicacoesFechadas,
        totalObrigadosRecebidos: obrigadosRecebidos,
        taxaFechamento,
        valorTotalGerado,
        periodo,
      };
    } catch (error) {
      console.error('Erro ao buscar performance individual:', error);
      throw new Error('Não foi possível buscar a performance do membro');
    }
  }
}

