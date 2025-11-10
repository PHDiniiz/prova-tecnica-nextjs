/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useIntentions } from '../useIntentions';
import { CriarIntencaoDTO } from '@/types/intention';

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

describe('useIntentions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar uma intenção com sucesso', async () => {
    const mockResponse = {
      success: true,
      data: {
        _id: '123',
        nome: 'João Silva',
        email: 'joao@example.com',
        empresa: 'Empresa Teste',
        motivo: 'Quero participar do grupo',
        status: 'pending' as const,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
      message: 'Intenção criada com sucesso!',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useIntentions(), {
      wrapper: createWrapper(),
    });

    const dto: CriarIntencaoDTO = {
      nome: 'João Silva',
      email: 'joao@example.com',
      empresa: 'Empresa Teste',
      motivo: 'Quero participar do grupo',
    };

    await waitFor(async () => {
      const response = await result.current.criarIntencao(dto);
      expect(response).toEqual(mockResponse);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/intentions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
  });

  it('deve retornar erro quando a API falha', async () => {
    const mockError = {
      success: false,
      error: 'Erro ao criar intenção',
      message: 'Dados inválidos',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockError,
    });

    const { result } = renderHook(() => useIntentions(), {
      wrapper: createWrapper(),
    });

    const dto: CriarIntencaoDTO = {
      nome: 'João Silva',
      email: 'joao@example.com',
      empresa: 'Empresa Teste',
      motivo: 'Quero participar do grupo',
    };

    await waitFor(async () => {
      await expect(result.current.criarIntencao(dto)).rejects.toThrow();
    });

    expect(result.current.isCreateError).toBe(true);
  });

  it('deve mostrar estado de loading durante a criação', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        promise.then((value) => ({
          ok: true,
          json: async () => value,
        }))
    );

    const { result } = renderHook(() => useIntentions(), {
      wrapper: createWrapper(),
    });

    const dto: CriarIntencaoDTO = {
      nome: 'João Silva',
      email: 'joao@example.com',
      empresa: 'Empresa Teste',
      motivo: 'Quero participar do grupo',
    };

    const mutationPromise = result.current.criarIntencao(dto);

    // Aguarda que a mutation inicie
    await waitFor(() => {
      expect(result.current.isCreating).toBe(true);
    });

    // Resolve a promise
    resolvePromise!({
      success: true,
      data: {},
      message: 'Sucesso',
    });

    await mutationPromise;

    await waitFor(() => {
      expect(result.current.isCreating).toBe(false);
    });
  });
});

