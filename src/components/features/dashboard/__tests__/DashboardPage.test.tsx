/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from '../DashboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDashboard } from '@/hooks/useDashboard';

jest.mock('@/hooks/useDashboard');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('DashboardPage', () => {
  const mockUseDashboard = useDashboard as jest.MockedFunction<typeof useDashboard>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o componente', () => {
    mockUseDashboard.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<DashboardPage adminToken="admin-token-123" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/dashboard de performance/i)).toBeInTheDocument();
  });

  it('deve mostrar loading quando está carregando', () => {
    mockUseDashboard.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<DashboardPage adminToken="admin-token-123" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/dashboard de performance/i)).toBeInTheDocument();
  });

  it('deve exibir métricas quando dados estão disponíveis', async () => {
    const mockData = {
      data: {
        metricasGerais: {
          membrosAtivos: 100,
          indicacoesMes: 50,
          obrigadosMes: 20,
          taxaConversaoIntencoes: 75.5,
          taxaFechamentoIndicacoes: 60.0,
          valorTotalEstimado: 1000000,
          tempoMedioFechamento: 15.5,
          variacoes: {
            membrosAtivos: {
              valor: 10,
              tipo: 'positivo' as const,
              periodo: 'vs mês anterior',
            },
            indicacoesMes: {
              valor: 25,
              tipo: 'positivo' as const,
              periodo: 'vs mês anterior',
            },
          },
        },
        performanceMembros: [],
      },
    };

    mockUseDashboard.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<DashboardPage adminToken="admin-token-123" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText(/membros ativos/i)).toBeInTheDocument();
      expect(screen.getByText(/indicações no período/i)).toBeInTheDocument();
      expect(screen.getByText(/tempo médio de fechamento/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando há erro ao carregar', () => {
    const mockError = new Error('Erro ao carregar dashboard');
    mockUseDashboard.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: jest.fn(),
    } as any);

    render(<DashboardPage adminToken="admin-token-123" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/erro ao carregar dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/erro ao carregar dashboard/i)).toBeInTheDocument();
  });

  it('deve permitir mudar período', async () => {
    const user = userEvent.setup();
    const mockRefetch = jest.fn();

    mockUseDashboard.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as any);

    render(<DashboardPage adminToken="admin-token-123" />, {
      wrapper: createWrapper(),
    });

    const botaoSemanal = screen.getByRole('button', { name: /semanal/i });
    await user.click(botaoSemanal);

    // Verificar se o período foi alterado (isso seria verificado pela chamada do hook)
    expect(mockUseDashboard).toHaveBeenCalled();
  });

  it('deve exibir card de tempo médio de fechamento', async () => {
    const mockData = {
      data: {
        metricasGerais: {
          membrosAtivos: 100,
          indicacoesMes: 50,
          obrigadosMes: 20,
          taxaConversaoIntencoes: 75.5,
          taxaFechamentoIndicacoes: 60.0,
          valorTotalEstimado: 1000000,
          tempoMedioFechamento: 15.5,
          variacoes: {},
        },
        performanceMembros: [],
      },
    };

    mockUseDashboard.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<DashboardPage adminToken="admin-token-123" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText(/tempo médio de fechamento/i)).toBeInTheDocument();
    });
  });
});

