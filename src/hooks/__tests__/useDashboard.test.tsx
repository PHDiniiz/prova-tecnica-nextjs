/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useDashboard } from '../useDashboard';

// Mock do fetch global
global.fetch = jest.fn();

// Helper para criar QueryClient wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar dados do dashboard com sucesso', async () => {
    const mockResponse = {
      success: true,
      data: {
        metricasGerais: {
          membrosAtivos: 50,
          indicacoesMes: 20,
          obrigadosMes: 15,
          taxaConversaoIntencoes: 80.5,
          taxaFechamentoIndicacoes: 60.0,
          valorTotalEstimado: 100000,
        },
        performanceMembros: [],
      },
      periodo: 'mensal' as const,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(
      () =>
        useDashboard({
          periodo: 'mensal',
          adminToken: 'admin-token',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/dashboard?periodo=mensal',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-token',
        },
      }
    );
  });

  it('deve incluir membroId nos parâmetros quando fornecido', async () => {
    const mockResponse = {
      success: true,
      data: {
        metricasGerais: {},
        performanceIndividual: {},
      },
      periodo: 'semanal' as const,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(
      () =>
        useDashboard({
          periodo: 'semanal',
          membroId: 'membro-123',
          adminToken: 'admin-token',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/dashboard?periodo=semanal&membroId=membro-123',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer admin-token',
        }),
      })
    );
  });

  it('deve retornar erro quando a API falha', async () => {
    const mockError = {
      success: false,
      error: 'Erro ao buscar dados',
      message: 'Token inválido',
    };

    // Mock fetch para retornar erro em todas as tentativas (retry: 2)
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => mockError,
    });

    const { result } = renderHook(
      () =>
        useDashboard({
          adminToken: 'invalid-token',
        }),
      { wrapper: createWrapper() }
    );

    // Aguarda o React Query processar o erro (incluindo retries)
    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 10000 }
    );

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('Token inválido');
  });

  it('não deve fazer requisição quando enabled é false', async () => {
    const { result } = renderHook(
      () =>
        useDashboard({
          adminToken: 'admin-token',
          enabled: false,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('não deve fazer requisição quando adminToken não é fornecido', async () => {
    const { result } = renderHook(
      () =>
        useDashboard({
          adminToken: '',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('deve usar período padrão quando não fornecido', async () => {
    const mockResponse = {
      success: true,
      data: { metricasGerais: {} },
      periodo: 'mensal' as const,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(
      () =>
        useDashboard({
          adminToken: 'admin-token',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/dashboard?periodo=mensal',
      expect.any(Object)
    );
  });
});

