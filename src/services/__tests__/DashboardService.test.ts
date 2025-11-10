/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { DashboardService } from '../DashboardService';
import { DashboardRepository } from '@/lib/repositories/DashboardRepository';
import { PeriodoFiltro } from '@/types/dashboard';
import { BusinessError } from '@/lib/errors/BusinessError';

jest.mock('@/lib/mongodb');
jest.mock('@/lib/repositories/DashboardRepository');

describe('DashboardService', () => {
  let service: DashboardService;
  let mockRepository: jest.Mocked<DashboardRepository>;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      collection: jest.fn(),
    };

    mockRepository = {
      buscarMetricasGerais: jest.fn(),
      buscarMetricasMembros: jest.fn(),
      buscarPerformanceIndividual: jest.fn(),
    } as any;

    const { getDatabase } = require('@/lib/mongodb');
    getDatabase.mockResolvedValue(mockDb);

    (DashboardRepository as jest.MockedClass<typeof DashboardRepository>).mockImplementation(
      () => mockRepository
    );

    service = new DashboardService();
  });

  describe('obterMetricasGerais', () => {
    it('deve obter métricas gerais com sucesso', async () => {
      const metricasMock = {
        membrosAtivos: 100,
        totalIndicacoes: 500,
        indicacoesMes: 50,
        totalObrigados: 200,
        obrigadosMes: 20,
        taxaConversaoIntencoes: 50,
        taxaFechamentoIndicacoes: 20,
        valorTotalEstimado: 1000000,
        valorMedioIndicacao: 20000,
        tempoMedioFechamento: 15.5,
        periodo: 'mensal' as PeriodoFiltro,
        dataInicio: new Date(),
        dataFim: new Date(),
        variacoes: {},
      };

      mockRepository.buscarMetricasGerais.mockResolvedValueOnce(metricasMock);

      const resultado = await service.obterMetricasGerais('mensal');

      expect(resultado).toEqual(metricasMock);
      expect(mockRepository.buscarMetricasGerais).toHaveBeenCalledWith('mensal');
    });

    it('deve lançar BusinessError em caso de erro', async () => {
      mockRepository.buscarMetricasGerais.mockRejectedValueOnce(
        new Error('Erro no banco')
      );

      await expect(service.obterMetricasGerais('mensal')).rejects.toThrow(BusinessError);
    });
  });

  describe('obterPerformanceMembros', () => {
    it('deve obter performance de membros com sucesso', async () => {
      const performanceMock = [
        {
          membroId: 'membro1',
          membroNome: 'João Silva',
          membroEmail: 'joao@test.com',
          membroEmpresa: 'Empresa A',
          totalIndicacoesFeitas: 5,
          totalIndicacoesRecebidas: 10,
          indicacoesFechadas: 5,
          totalObrigadosRecebidos: 3,
          taxaFechamento: 50,
          valorTotalGerado: 50000,
          periodo: 'mensal' as PeriodoFiltro,
        },
      ];

      mockRepository.buscarMetricasMembros.mockResolvedValueOnce(performanceMock);

      const resultado = await service.obterPerformanceMembros('mensal');

      expect(resultado).toEqual(performanceMock);
      expect(mockRepository.buscarMetricasMembros).toHaveBeenCalledWith('mensal');
    });
  });

  describe('obterPerformanceIndividual', () => {
    it('deve obter performance individual com sucesso', async () => {
      const performanceMock = {
        membroId: 'membro1',
        membroNome: 'João Silva',
        membroEmail: 'joao@test.com',
        membroEmpresa: 'Empresa A',
        totalIndicacoesFeitas: 5,
        totalIndicacoesRecebidas: 10,
        indicacoesFechadas: 5,
        totalObrigadosRecebidos: 3,
        taxaFechamento: 50,
        valorTotalGerado: 50000,
        periodo: 'mensal' as PeriodoFiltro,
      };

      mockRepository.buscarPerformanceIndividual.mockResolvedValueOnce(performanceMock);

      const resultado = await service.obterPerformanceIndividual('membro1', 'mensal');

      expect(resultado).toEqual(performanceMock);
      expect(mockRepository.buscarPerformanceIndividual).toHaveBeenCalledWith('membro1', 'mensal');
    });

    it('deve lançar BusinessError se membroId for vazio', async () => {
      await expect(service.obterPerformanceIndividual('', 'mensal')).rejects.toThrow(
        BusinessError
      );
    });

    it('deve retornar null se membro não for encontrado', async () => {
      mockRepository.buscarPerformanceIndividual.mockResolvedValueOnce(null);

      const resultado = await service.obterPerformanceIndividual('membro-inexistente', 'mensal');

      expect(resultado).toBeNull();
    });
  });

  describe('obterDashboard', () => {
    it('deve obter dashboard completo sem membroId', async () => {
      const metricasMock = {
        membrosAtivos: 100,
        totalIndicacoes: 500,
        indicacoesMes: 50,
        totalObrigados: 200,
        obrigadosMes: 20,
        taxaConversaoIntencoes: 50,
        taxaFechamentoIndicacoes: 20,
        valorTotalEstimado: 1000000,
        valorMedioIndicacao: 20000,
        tempoMedioFechamento: 15.5,
        periodo: 'mensal' as PeriodoFiltro,
        dataInicio: new Date(),
        dataFim: new Date(),
        variacoes: {},
      };

      const performanceMock = [
        {
          membroId: 'membro1',
          membroNome: 'João Silva',
          membroEmail: 'joao@test.com',
          membroEmpresa: 'Empresa A',
          totalIndicacoesFeitas: 5,
          totalIndicacoesRecebidas: 10,
          indicacoesFechadas: 5,
          totalObrigadosRecebidos: 3,
          taxaFechamento: 50,
          valorTotalGerado: 50000,
          periodo: 'mensal' as PeriodoFiltro,
        },
      ];

      mockRepository.buscarMetricasGerais.mockResolvedValueOnce(metricasMock);
      mockRepository.buscarMetricasMembros.mockResolvedValueOnce(performanceMock);

      const resultado = await service.obterDashboard({ periodo: 'mensal' });

      expect(resultado.metricasGerais).toEqual(metricasMock);
      expect(resultado.performanceMembros).toEqual(performanceMock);
      expect(resultado.performanceIndividual).toBeUndefined();
    });

    it('deve obter dashboard com performance individual quando membroId fornecido', async () => {
      const metricasMock = {
        membrosAtivos: 100,
        totalIndicacoes: 500,
        indicacoesMes: 50,
        totalObrigados: 200,
        obrigadosMes: 20,
        taxaConversaoIntencoes: 50,
        taxaFechamentoIndicacoes: 20,
        valorTotalEstimado: 1000000,
        valorMedioIndicacao: 20000,
        tempoMedioFechamento: 15.5,
        periodo: 'mensal' as PeriodoFiltro,
        dataInicio: new Date(),
        dataFim: new Date(),
        variacoes: {},
      };

      const performanceIndividualMock = {
        membroId: 'membro1',
        membroNome: 'João Silva',
        membroEmail: 'joao@test.com',
        membroEmpresa: 'Empresa A',
        totalIndicacoesFeitas: 5,
        totalIndicacoesRecebidas: 10,
        indicacoesFechadas: 5,
        totalObrigadosRecebidos: 3,
        taxaFechamento: 50,
        valorTotalGerado: 50000,
        periodo: 'mensal' as PeriodoFiltro,
      };

      mockRepository.buscarMetricasGerais.mockResolvedValueOnce(metricasMock);
      mockRepository.buscarPerformanceIndividual.mockResolvedValueOnce(performanceIndividualMock);

      const resultado = await service.obterDashboard({
        periodo: 'mensal',
        membroId: 'membro1',
      });

      expect(resultado.metricasGerais).toEqual(metricasMock);
      expect(resultado.performanceIndividual).toEqual(performanceIndividualMock);
      expect(resultado.performanceMembros).toBeUndefined();
    });

    it('deve lançar BusinessError para período inválido', async () => {
      await expect(
        service.obterDashboard({ periodo: 'invalido' as PeriodoFiltro })
      ).rejects.toThrow(BusinessError);
    });
  });
});

