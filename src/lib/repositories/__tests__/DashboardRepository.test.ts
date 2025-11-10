/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { DashboardRepository } from '../DashboardRepository';
import { Db } from 'mongodb';
import { PeriodoFiltro } from '@/types/dashboard';

describe('DashboardRepository', () => {
  let repository: DashboardRepository;
  let mockDb: jest.Mocked<Db>;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollection = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      countDocuments: jest.fn(),
      aggregate: jest.fn().mockReturnValue({
        toArray: jest.fn(),
      }),
      toArray: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as any;

    repository = new DashboardRepository(mockDb);
  });

  describe('buscarMetricasGerais', () => {
    it('deve buscar métricas gerais para período mensal com variações', async () => {
      // Período atual
      mockCollection.countDocuments
        .mockResolvedValueOnce(100) // membros ativos
        .mockResolvedValueOnce(50) // indicações mês
        .mockResolvedValueOnce(20) // obrigados mês
        .mockResolvedValueOnce(300) // total intenções
        .mockResolvedValueOnce(150) // intenções aprovadas
        .mockResolvedValueOnce(100) // total indicações período
        .mockResolvedValueOnce(50) // indicações fechadas período
        // Período anterior
        .mockResolvedValueOnce(90) // membros ativos anterior
        .mockResolvedValueOnce(40) // indicações mês anterior
        .mockResolvedValueOnce(15) // obrigados mês anterior
        .mockResolvedValueOnce(250) // total intenções anterior
        .mockResolvedValueOnce(120) // intenções aprovadas anterior
        .mockResolvedValueOnce(80) // total indicações período anterior
        .mockResolvedValueOnce(40) // indicações fechadas período anterior
        // Totais
        .mockResolvedValueOnce(500) // total indicações
        .mockResolvedValueOnce(200); // total obrigados

      // Agregações para período atual
      mockCollection.aggregate
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([
            { valorTotal: 1000000 },
          ]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([
            { tempoMedio: 15.5 },
          ]),
        })
        // Agregações para período anterior
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([
            { valorTotal: 800000 },
          ]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([
            { tempoMedio: 18.2 },
          ]),
        })
        // Valor médio
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([
            { valorTotal: 1000000, count: 50 },
          ]),
        });

      const resultado = await repository.buscarMetricasGerais('mensal');

      expect(resultado.membrosAtivos).toBe(100);
      expect(resultado.totalIndicacoes).toBe(500);
      expect(resultado.indicacoesMes).toBe(50);
      expect(resultado.totalObrigados).toBe(200);
      expect(resultado.obrigadosMes).toBe(20);
      expect(resultado.tempoMedioFechamento).toBe(15.5);
      expect(resultado.periodo).toBe('mensal');
      
      // Verificar variações
      expect(resultado.variacoes).toBeDefined();
      expect(resultado.variacoes?.membrosAtivos?.valor).toBeCloseTo(11.11, 1);
      expect(resultado.variacoes?.membrosAtivos?.tipo).toBe('positivo');
      expect(resultado.variacoes?.indicacoesMes?.valor).toBeCloseTo(25, 1);
      expect(resultado.variacoes?.tempoMedioFechamento?.valor).toBeCloseTo(-14.84, 1);
      expect(resultado.variacoes?.tempoMedioFechamento?.tipo).toBe('negativo');
    });

    it('deve calcular taxa de conversão corretamente', async () => {
      mockCollection.countDocuments
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(200) // total intenções
        .mockResolvedValueOnce(100) // intenções aprovadas (50%)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(50)
        // Período anterior
        .mockResolvedValueOnce(90)
        .mockResolvedValueOnce(40)
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(180)
        .mockResolvedValueOnce(90)
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(40)
        // Totais
        .mockResolvedValueOnce(500)
        .mockResolvedValueOnce(200);

      mockCollection.aggregate
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ valorTotal: 1000000 }]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ tempoMedio: 15 }]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ valorTotal: 800000 }]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ tempoMedio: 18 }]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([
            { valorTotal: 1000000, count: 50 },
          ]),
        });

      const resultado = await repository.buscarMetricasGerais('mensal');

      expect(resultado.taxaConversaoIntencoes).toBe(50);
    });

    it('deve lidar com divisão por zero em taxas', async () => {
      mockCollection.countDocuments
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        // Período anterior
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        // Totais
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      mockCollection.aggregate
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([]),
        });

      const resultado = await repository.buscarMetricasGerais('mensal');

      expect(resultado.taxaConversaoIntencoes).toBe(0);
      expect(resultado.taxaFechamentoIndicacoes).toBe(0);
      expect(resultado.tempoMedioFechamento).toBe(0);
    });

    it('deve calcular tempo médio de fechamento corretamente', async () => {
      mockCollection.countDocuments
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(50)
        // Período anterior
        .mockResolvedValueOnce(90)
        .mockResolvedValueOnce(40)
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(180)
        .mockResolvedValueOnce(90)
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(40)
        // Totais
        .mockResolvedValueOnce(500)
        .mockResolvedValueOnce(200);

      // Tempo médio de 20 dias
      mockCollection.aggregate
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ valorTotal: 1000000 }]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ tempoMedio: 20.5 }]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ valorTotal: 800000 }]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ tempoMedio: 25.0 }]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([
            { valorTotal: 1000000, count: 50 },
          ]),
        });

      const resultado = await repository.buscarMetricasGerais('mensal');

      expect(resultado.tempoMedioFechamento).toBe(20.5);
      expect(resultado.variacoes?.tempoMedioFechamento?.valor).toBeCloseTo(-18, 1);
    });
  });

  describe('buscarMetricasMembros', () => {
    it('deve buscar métricas de todos os membros', async () => {
      const membros = [
        {
          _id: 'membro1',
          nome: 'João Silva',
          email: 'joao@test.com',
          empresa: 'Empresa A',
          ativo: true,
        },
        {
          _id: 'membro2',
          nome: 'Maria Santos',
          email: 'maria@test.com',
          empresa: 'Empresa B',
          ativo: true,
        },
      ];

      mockCollection.find.mockReturnValueOnce({
        toArray: jest.fn().mockResolvedValueOnce(membros),
      });

      mockCollection.aggregate.mockReturnValueOnce({
        toArray: jest.fn().mockResolvedValueOnce([
          {
            indicacoesFeitas: [{ _id: 'membro1', total: 5 }],
            indicacoesRecebidas: [
              { _id: 'membro1', total: 10, fechadas: 5, valorTotal: 50000 },
            ],
            obrigadosRecebidos: [{ _id: 'membro1', total: 3 }],
          },
        ]),
      });

      const resultado = await repository.buscarMetricasMembros('mensal');

      expect(resultado).toHaveLength(2);
      expect(resultado[0].membroNome).toBe('João Silva');
      expect(resultado[0].totalIndicacoesFeitas).toBe(5);
      expect(resultado[0].totalIndicacoesRecebidas).toBe(10);
    });
  });

  describe('buscarPerformanceIndividual', () => {
    it('deve buscar performance individual de um membro', async () => {
      const membro = {
        _id: 'membro1',
        nome: 'João Silva',
        email: 'joao@test.com',
        empresa: 'Empresa A',
      };

      mockCollection.findOne.mockResolvedValueOnce(membro);
      mockCollection.countDocuments
        .mockResolvedValueOnce(5) // indicações feitas
        .mockResolvedValueOnce(10) // indicações recebidas
        .mockResolvedValueOnce(5) // indicações fechadas
        .mockResolvedValueOnce(3); // obrigados recebidos

      mockCollection.aggregate.mockReturnValueOnce({
        toArray: jest.fn().mockResolvedValueOnce([
          { valorTotal: 50000 },
        ]),
      });

      const resultado = await repository.buscarPerformanceIndividual('membro1', 'mensal');

      expect(resultado).not.toBeNull();
      expect(resultado?.membroNome).toBe('João Silva');
      expect(resultado?.totalIndicacoesFeitas).toBe(5);
      expect(resultado?.totalIndicacoesRecebidas).toBe(10);
      expect(resultado?.taxaFechamento).toBe(50);
    });

    it('deve retornar null se membro não for encontrado', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const resultado = await repository.buscarPerformanceIndividual('membro-inexistente', 'mensal');

      expect(resultado).toBeNull();
    });
  });
});

