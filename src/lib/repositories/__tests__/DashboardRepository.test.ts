/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { DashboardRepository } from '../DashboardRepository';
import { Db } from 'mongodb';
import { PeriodoFiltro } from '@/types/dashboard';

describe('DashboardRepository', () => {
  let repository: DashboardRepository;
  let mockDb: jest.Mocked<Db>;
  let mockMembersCollection: any;
  let mockReferralsCollection: any;
  let mockObrigadosCollection: any;
  let mockIntentionsCollection: any;

  /**
   * Cria um mock de collection com métodos básicos
   */
  const createMockCollection = () => ({
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
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Criar mocks separados para cada collection
    mockMembersCollection = createMockCollection();
    mockReferralsCollection = createMockCollection();
    mockObrigadosCollection = createMockCollection();
    mockIntentionsCollection = createMockCollection();

    // Mock do db.collection() para retornar a collection correta baseado no nome
    mockDb = {
      collection: jest.fn((collectionName: string) => {
        switch (collectionName) {
          case 'members':
            return mockMembersCollection;
          case 'referrals':
            return mockReferralsCollection;
          case 'obrigados':
            return mockObrigadosCollection;
          case 'intentions':
            return mockIntentionsCollection;
          default:
            return createMockCollection();
        }
      }),
    } as any;

    repository = new DashboardRepository(mockDb);
  });

  describe('buscarMetricasGerais', () => {
    it('deve buscar métricas gerais para período mensal com variações', async () => {
      // Período atual - buscarMetricasBasicas
      // 1. members.countDocuments (membros ativos)
      mockMembersCollection.countDocuments.mockResolvedValueOnce(100);
      // 2. referrals.countDocuments (indicacoesMes)
      mockReferralsCollection.countDocuments.mockResolvedValueOnce(50);
      // 3. obrigados.countDocuments (obrigadosMes)
      mockObrigadosCollection.countDocuments.mockResolvedValueOnce(20);
      // 4. intentions.countDocuments (totalIntencoes)
      mockIntentionsCollection.countDocuments.mockResolvedValueOnce(300);
      // 5. intentions.countDocuments (intencoesAprovadas)
      mockIntentionsCollection.countDocuments.mockResolvedValueOnce(150);
      // 6. referrals.countDocuments (totalIndicacoes período)
      mockReferralsCollection.countDocuments.mockResolvedValueOnce(100);
      // 7. referrals.countDocuments (indicacoesFechadas período)
      mockReferralsCollection.countDocuments.mockResolvedValueOnce(50);
      // 8. referrals.aggregate (valorTotal)
      mockReferralsCollection.aggregate.mockReturnValueOnce({
        toArray: jest.fn().mockResolvedValueOnce([{ valorTotal: 1000000 }]),
      });
      // 9. referrals.aggregate (tempoMedio)
      mockReferralsCollection.aggregate.mockReturnValueOnce({
        toArray: jest.fn().mockResolvedValueOnce([{ tempoMedio: 15.5 }]),
      });

      // buscarMetricasGerais - totais
      // 10. referrals.countDocuments (totalIndicacoes - todas)
      mockReferralsCollection.countDocuments.mockResolvedValueOnce(500);
      // 11. obrigados.countDocuments (totalObrigados)
      mockObrigadosCollection.countDocuments.mockResolvedValueOnce(200);
      // 12. referrals.aggregate (valorMedio)
      mockReferralsCollection.aggregate.mockReturnValueOnce({
        toArray: jest.fn().mockResolvedValueOnce([
          { valorTotal: 1000000, count: 50 },
        ]),
      });

      // Período anterior - buscarMetricasBasicas
      // 13. members.countDocuments (membros ativos anterior)
      mockMembersCollection.countDocuments.mockResolvedValueOnce(90);
      // 14. referrals.countDocuments (indicacoesMes anterior)
      mockReferralsCollection.countDocuments.mockResolvedValueOnce(40);
      // 15. obrigados.countDocuments (obrigadosMes anterior)
      mockObrigadosCollection.countDocuments.mockResolvedValueOnce(15);
      // 16. intentions.countDocuments (totalIntencoes anterior)
      mockIntentionsCollection.countDocuments.mockResolvedValueOnce(250);
      // 17. intentions.countDocuments (intencoesAprovadas anterior)
      mockIntentionsCollection.countDocuments.mockResolvedValueOnce(120);
      // 18. referrals.countDocuments (totalIndicacoes período anterior)
      mockReferralsCollection.countDocuments.mockResolvedValueOnce(80);
      // 19. referrals.countDocuments (indicacoesFechadas período anterior)
      mockReferralsCollection.countDocuments.mockResolvedValueOnce(40);
      // 20. referrals.aggregate (valorTotal anterior)
      mockReferralsCollection.aggregate.mockReturnValueOnce({
        toArray: jest.fn().mockResolvedValueOnce([{ valorTotal: 800000 }]),
      });
      // 21. referrals.aggregate (tempoMedio anterior)
      mockReferralsCollection.aggregate.mockReturnValueOnce({
        toArray: jest.fn().mockResolvedValueOnce([{ tempoMedio: 18.2 }]),
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
      // Período atual - buscarMetricasBasicas
      mockMembersCollection.countDocuments.mockResolvedValueOnce(100);
      mockReferralsCollection.countDocuments
        .mockResolvedValueOnce(50) // indicacoesMes
        .mockResolvedValueOnce(100) // totalIndicacoes período
        .mockResolvedValueOnce(50); // indicacoesFechadas período
      mockObrigadosCollection.countDocuments.mockResolvedValueOnce(20);
      mockIntentionsCollection.countDocuments
        .mockResolvedValueOnce(200) // totalIntencoes
        .mockResolvedValueOnce(100); // intencoesAprovadas (50%)
      mockReferralsCollection.aggregate
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ valorTotal: 1000000 }]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ tempoMedio: 15 }]),
        });

      // buscarMetricasGerais - totais
      mockReferralsCollection.countDocuments.mockResolvedValueOnce(500);
      mockObrigadosCollection.countDocuments.mockResolvedValueOnce(200);
      mockReferralsCollection.aggregate.mockReturnValueOnce({
        toArray: jest.fn().mockResolvedValueOnce([
          { valorTotal: 1000000, count: 50 },
        ]),
      });

      // Período anterior - buscarMetricasBasicas
      mockMembersCollection.countDocuments.mockResolvedValueOnce(90);
      mockReferralsCollection.countDocuments
        .mockResolvedValueOnce(40) // indicacoesMes anterior
        .mockResolvedValueOnce(80) // totalIndicacoes período anterior
        .mockResolvedValueOnce(40); // indicacoesFechadas período anterior
      mockObrigadosCollection.countDocuments.mockResolvedValueOnce(15);
      mockIntentionsCollection.countDocuments
        .mockResolvedValueOnce(180) // totalIntencoes anterior
        .mockResolvedValueOnce(90); // intencoesAprovadas anterior
      mockReferralsCollection.aggregate
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ valorTotal: 800000 }]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ tempoMedio: 18 }]),
        });

      const resultado = await repository.buscarMetricasGerais('mensal');

      expect(resultado.taxaConversaoIntencoes).toBe(50);
    });

    it('deve lidar com divisão por zero em taxas', async () => {
      // Período atual - buscarMetricasBasicas
      mockMembersCollection.countDocuments.mockResolvedValueOnce(0);
      mockReferralsCollection.countDocuments
        .mockResolvedValueOnce(0) // indicacoesMes
        .mockResolvedValueOnce(0) // totalIndicacoes período
        .mockResolvedValueOnce(0); // indicacoesFechadas período
      mockObrigadosCollection.countDocuments.mockResolvedValueOnce(0);
      mockIntentionsCollection.countDocuments
        .mockResolvedValueOnce(0) // totalIntencoes
        .mockResolvedValueOnce(0); // intencoesAprovadas
      mockReferralsCollection.aggregate
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([]),
        });

      // buscarMetricasGerais - totais
      mockReferralsCollection.countDocuments.mockResolvedValueOnce(0);
      mockObrigadosCollection.countDocuments.mockResolvedValueOnce(0);
      mockReferralsCollection.aggregate.mockReturnValueOnce({
        toArray: jest.fn().mockResolvedValueOnce([]),
      });

      // Período anterior - buscarMetricasBasicas
      mockMembersCollection.countDocuments.mockResolvedValueOnce(0);
      mockReferralsCollection.countDocuments
        .mockResolvedValueOnce(0) // indicacoesMes anterior
        .mockResolvedValueOnce(0) // totalIndicacoes período anterior
        .mockResolvedValueOnce(0); // indicacoesFechadas período anterior
      mockObrigadosCollection.countDocuments.mockResolvedValueOnce(0);
      mockIntentionsCollection.countDocuments
        .mockResolvedValueOnce(0) // totalIntencoes anterior
        .mockResolvedValueOnce(0); // intencoesAprovadas anterior
      mockReferralsCollection.aggregate
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
      // Período atual - buscarMetricasBasicas
      mockMembersCollection.countDocuments.mockResolvedValueOnce(100);
      mockReferralsCollection.countDocuments
        .mockResolvedValueOnce(50) // indicacoesMes
        .mockResolvedValueOnce(100) // totalIndicacoes período
        .mockResolvedValueOnce(50); // indicacoesFechadas período
      mockObrigadosCollection.countDocuments.mockResolvedValueOnce(20);
      mockIntentionsCollection.countDocuments
        .mockResolvedValueOnce(200) // totalIntencoes
        .mockResolvedValueOnce(100); // intencoesAprovadas
      mockReferralsCollection.aggregate
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ valorTotal: 1000000 }]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ tempoMedio: 20.5 }]),
        });

      // buscarMetricasGerais - totais
      mockReferralsCollection.countDocuments.mockResolvedValueOnce(500);
      mockObrigadosCollection.countDocuments.mockResolvedValueOnce(200);
      mockReferralsCollection.aggregate.mockReturnValueOnce({
        toArray: jest.fn().mockResolvedValueOnce([
          { valorTotal: 1000000, count: 50 },
        ]),
      });

      // Período anterior - buscarMetricasBasicas
      mockMembersCollection.countDocuments.mockResolvedValueOnce(90);
      mockReferralsCollection.countDocuments
        .mockResolvedValueOnce(40) // indicacoesMes anterior
        .mockResolvedValueOnce(80) // totalIndicacoes período anterior
        .mockResolvedValueOnce(40); // indicacoesFechadas período anterior
      mockObrigadosCollection.countDocuments.mockResolvedValueOnce(15);
      mockIntentionsCollection.countDocuments
        .mockResolvedValueOnce(180) // totalIntencoes anterior
        .mockResolvedValueOnce(90); // intencoesAprovadas anterior
      mockReferralsCollection.aggregate
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ valorTotal: 800000 }]),
        })
        .mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce([{ tempoMedio: 25.0 }]),
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

      // referrals.aggregate (pipeline de agregação)
      mockReferralsCollection.aggregate.mockReturnValueOnce({
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

      // members.find (buscar todos os membros ativos)
      mockMembersCollection.find.mockReturnValueOnce({
        toArray: jest.fn().mockResolvedValueOnce(membros),
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

      // members.findOne (buscar membro)
      mockMembersCollection.findOne.mockResolvedValueOnce(membro);
      
      // referrals.countDocuments (indicações feitas, recebidas, fechadas)
      mockReferralsCollection.countDocuments
        .mockResolvedValueOnce(5) // indicações feitas
        .mockResolvedValueOnce(10) // indicações recebidas
        .mockResolvedValueOnce(5); // indicações fechadas
      
      // referrals.aggregate (valor total gerado)
      mockReferralsCollection.aggregate.mockReturnValueOnce({
        toArray: jest.fn().mockResolvedValueOnce([
          { valorTotal: 50000 },
        ]),
      });
      
      // obrigados.countDocuments (obrigados recebidos)
      mockObrigadosCollection.countDocuments.mockResolvedValueOnce(3);

      const resultado = await repository.buscarPerformanceIndividual('membro1', 'mensal');

      expect(resultado).not.toBeNull();
      expect(resultado?.membroNome).toBe('João Silva');
      expect(resultado?.totalIndicacoesFeitas).toBe(5);
      expect(resultado?.totalIndicacoesRecebidas).toBe(10);
      expect(resultado?.taxaFechamento).toBe(50);
    });

    it('deve retornar null se membro não for encontrado', async () => {
      mockMembersCollection.findOne.mockResolvedValueOnce(null);

      const resultado = await repository.buscarPerformanceIndividual('membro-inexistente', 'mensal');

      expect(resultado).toBeNull();
    });
  });
});

