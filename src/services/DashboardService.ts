import { getDatabase } from '@/lib/mongodb';
import { DashboardRepository } from '@/lib/repositories/DashboardRepository';
import {
  DashboardMetrics,
  MemberPerformance,
  PeriodoFiltro,
  DashboardFiltros,
} from '@/types/dashboard';
import { BusinessError } from '@/lib/errors/BusinessError';
import { z } from 'zod';

/**
 * Schema de validação para período
 */
const periodoSchema = z.enum(['semanal', 'mensal', 'acumulado']);

/**
 * Serviço de aplicação para gerenciar dashboard e métricas
 * Responsabilidade única: Lógica de negócio para dashboard
 */
export class DashboardService {
  private repository: DashboardRepository;

  constructor() {
    this.repository = {} as DashboardRepository;
  }

  /**
   * Inicializa o repositório com a conexão do banco
   */
  private async initRepository() {
    if (!this.repository || !('db' in this.repository)) {
      const db = await getDatabase();
      this.repository = new DashboardRepository(db);
    }
  }

  /**
   * Valida o período fornecido
   */
  private validarPeriodo(periodo: string): PeriodoFiltro {
    try {
      return periodoSchema.parse(periodo);
    } catch {
      throw new BusinessError(
        'Período inválido',
        'Período deve ser: semanal, mensal ou acumulado',
        400
      );
    }
  }

  /**
   * Obtém métricas gerais do dashboard
   */
  async obterMetricasGerais(periodo: PeriodoFiltro): Promise<DashboardMetrics> {
    try {
      await this.initRepository();
      return await this.repository.buscarMetricasGerais(periodo);
    } catch (error) {
      if (error instanceof BusinessError) {
        throw error;
      }
      console.error('Erro ao obter métricas gerais:', error);
      throw new BusinessError(
        'Erro ao obter métricas',
        'Não foi possível obter as métricas do dashboard',
        500
      );
    }
  }

  /**
   * Obtém performance de todos os membros
   */
  async obterPerformanceMembros(periodo: PeriodoFiltro): Promise<MemberPerformance[]> {
    try {
      await this.initRepository();
      return await this.repository.buscarMetricasMembros(periodo);
    } catch (error) {
      console.error('Erro ao obter performance de membros:', error);
      throw new BusinessError(
        'Erro ao obter performance',
        'Não foi possível obter a performance dos membros',
        500
      );
    }
  }

  /**
   * Obtém performance individual de um membro
   */
  async obterPerformanceIndividual(
    membroId: string,
    periodo: PeriodoFiltro
  ): Promise<MemberPerformance | null> {
    try {
      await this.initRepository();

      if (!membroId || membroId.trim() === '') {
        throw new BusinessError('ID inválido', 'ID do membro é obrigatório', 400);
      }

      return await this.repository.buscarPerformanceIndividual(membroId, periodo);
    } catch (error) {
      if (error instanceof BusinessError) {
        throw error;
      }
      console.error('Erro ao obter performance individual:', error);
      throw new BusinessError(
        'Erro ao obter performance',
        'Não foi possível obter a performance do membro',
        500
      );
    }
  }

  /**
   * Obtém dados completos do dashboard baseado nos filtros
   */
  async obterDashboard(filtros: DashboardFiltros): Promise<{
    metricasGerais: DashboardMetrics;
    performanceMembros?: MemberPerformance[];
    performanceIndividual?: MemberPerformance | null;
  }> {
    try {
      const periodo = this.validarPeriodo(filtros.periodo);

      const metricasGerais = await this.obterMetricasGerais(periodo);

      const resultado: {
        metricasGerais: DashboardMetrics;
        performanceMembros?: MemberPerformance[];
        performanceIndividual?: MemberPerformance | null;
      } = {
        metricasGerais,
      };

      // Se não há membroId específico, buscar performance de todos
      if (!filtros.membroId) {
        resultado.performanceMembros = await this.obterPerformanceMembros(periodo);
      } else {
        // Buscar performance individual
        resultado.performanceIndividual = await this.obterPerformanceIndividual(
          filtros.membroId,
          periodo
        );
      }

      return resultado;
    } catch (error) {
      if (error instanceof BusinessError) {
        throw error;
      }
      console.error('Erro ao obter dashboard:', error);
      throw new BusinessError(
        'Erro ao obter dashboard',
        'Não foi possível obter os dados do dashboard',
        500
      );
    }
  }
}

