/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { GET } from '../route';
import { DashboardService } from '@/services/DashboardService';
import { NextRequest } from 'next/server';

// Mock do DashboardService
jest.mock('@/services/DashboardService');

// Mock da função de autenticação
jest.mock('@/lib/auth', () => ({
  verificarAdminToken: jest.fn((request: NextRequest) => {
    const authHeader = request.headers.get('Authorization');
    return authHeader?.includes('Bearer admin-token-123') ?? false;
  }),
  respostaNaoAutorizado: jest.fn(() => ({
    json: async () => ({
      success: false,
      error: 'Não autorizado',
      message: 'Token de autenticação inválido ou ausente',
    }),
    status: 401,
  })),
}));

// Mock do NextRequest para testes
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(
      public url: string,
      public init?: { method?: string; body?: string; headers?: HeadersInit }
    ) {}
    headers = {
      get: (name: string) => {
        if (name === 'Authorization' && this.init?.headers) {
          const headers = this.init.headers as Record<string, string>;
          return headers['Authorization'] || headers['authorization'];
        }
        return null;
      },
    };
  },
  NextResponse: {
    json: (data: any, init?: { status?: number }) => {
      return {
        json: async () => data,
        status: init?.status || 200,
      };
    },
  },
}));

describe('GET /api/dashboard', () => {
  let mockService: jest.Mocked<DashboardService>;
  const adminToken = 'admin-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      obterDashboard: jest.fn(),
    } as any;

    (DashboardService as jest.MockedClass<typeof DashboardService>).mockImplementation(
      () => mockService
    );
  });

  it('deve retornar dados do dashboard com sucesso', async () => {
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
      periodo: 'mensal' as const,
      dataInicio: new Date(),
      dataFim: new Date(),
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
        periodo: 'mensal' as const,
      },
    ];

    mockService.obterDashboard.mockResolvedValueOnce({
      metricasGerais: metricasMock,
      performanceMembros: performanceMock,
    });

    const request = new NextRequest(`http://localhost:3000/api/dashboard?periodo=mensal`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.metricasGerais).toEqual(metricasMock);
    expect(data.data.performanceMembros).toEqual(performanceMock);
    expect(mockService.obterDashboard).toHaveBeenCalledWith({
      periodo: 'mensal',
      membroId: undefined,
    });
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const request = new NextRequest('http://localhost:3000/api/dashboard', {
      method: 'GET',
      headers: {},
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autorizado');
    expect(mockService.obterDashboard).not.toHaveBeenCalled();
  });

  it('deve usar período padrão quando não fornecido', async () => {
    mockService.obterDashboard.mockResolvedValueOnce({
      metricasGerais: {
        membrosAtivos: 100,
        totalIndicacoes: 500,
        indicacoesMes: 50,
        totalObrigados: 200,
        obrigadosMes: 20,
        taxaConversaoIntencoes: 50,
        taxaFechamentoIndicacoes: 20,
        valorTotalEstimado: 1000000,
        valorMedioIndicacao: 20000,
        periodo: 'mensal' as const,
        dataInicio: new Date(),
        dataFim: new Date(),
      },
    });

    const request = new NextRequest('http://localhost:3000/api/dashboard', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockService.obterDashboard).toHaveBeenCalledWith({
      periodo: 'mensal',
      membroId: undefined,
    });
  });

  it('deve filtrar por membroId quando fornecido', async () => {
    const membroId = 'membro-123';
    mockService.obterDashboard.mockResolvedValueOnce({
      metricasGerais: {
        membrosAtivos: 100,
        totalIndicacoes: 500,
        indicacoesMes: 50,
        totalObrigados: 200,
        obrigadosMes: 20,
        taxaConversaoIntencoes: 50,
        taxaFechamentoIndicacoes: 20,
        valorTotalEstimado: 1000000,
        valorMedioIndicacao: 20000,
        periodo: 'mensal' as const,
        dataInicio: new Date(),
        dataFim: new Date(),
      },
      performanceIndividual: {
        membroId,
        membroNome: 'João Silva',
        membroEmail: 'joao@test.com',
        membroEmpresa: 'Empresa A',
        totalIndicacoesFeitas: 5,
        totalIndicacoesRecebidas: 10,
        indicacoesFechadas: 5,
        totalObrigadosRecebidos: 3,
        taxaFechamento: 50,
        valorTotalGerado: 50000,
        periodo: 'mensal' as const,
      },
    });

    const request = new NextRequest(
      `http://localhost:3000/api/dashboard?periodo=mensal&membroId=${membroId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockService.obterDashboard).toHaveBeenCalledWith({
      periodo: 'mensal',
      membroId,
    });
  });
});

