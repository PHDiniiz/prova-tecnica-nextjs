import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useObrigados, useCreateObrigado } from '../useObrigados';
import { CriarObrigadoDTO } from '@/types/obrigado';

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

describe('useObrigados', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar obrigados com sucesso', async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          _id: 'obrigado-1',
          indicacaoId: 'indicacao-1',
          membroIndicadorId: 'membro-1',
          membroIndicadoId: 'membro-2',
          mensagem: 'Muito obrigado!',
          publico: true,
        },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useObrigados(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith('/api/obrigados?');
  });

  it('deve incluir filtros nos parâmetros quando fornecidos', async () => {
    const mockResponse = {
      success: true,
      data: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(
      () =>
        useObrigados({
          membroIndicadorId: 'membro-1',
          membroIndicadoId: 'membro-2',
          page: 1,
          limit: 10,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const url = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(url).toContain('membroIndicadorId=membro-1');
    expect(url).toContain('membroIndicadoId=membro-2');
    expect(url).toContain('page=1');
    expect(url).toContain('limit=10');
  });

  it('deve retornar erro quando a API falha', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Erro ao buscar agradecimentos',
      }),
    });

    const { result } = renderHook(() => useObrigados(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useCreateObrigado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar obrigado com sucesso', async () => {
    const mockResponse = {
      success: true,
      data: {
        _id: 'obrigado-1',
        indicacaoId: 'indicacao-1',
        membroIndicadorId: 'membro-1',
        membroIndicadoId: 'membro-2',
        mensagem: 'Muito obrigado pela indicação!',
        publico: true,
      },
      message: 'Agradecimento criado com sucesso',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useCreateObrigado(), {
      wrapper: createWrapper(),
    });

    const dto: CriarObrigadoDTO = {
      indicacaoId: 'indicacao-1',
      mensagem: 'Muito obrigado pela indicação!',
      publico: true,
      membroId: 'membro-2',
    };

    await waitFor(async () => {
      const response = await result.current.mutateAsync(dto);
      expect(response).toEqual(mockResponse);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/obrigados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer membro-2',
      },
      body: JSON.stringify({
        indicacaoId: dto.indicacaoId,
        mensagem: dto.mensagem,
        publico: dto.publico,
      }),
    });
  });

  it('deve retornar erro quando a API falha', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Erro ao criar agradecimento',
      }),
    });

    const { result } = renderHook(() => useCreateObrigado(), {
      wrapper: createWrapper(),
    });

    const dto: CriarObrigadoDTO = {
      indicacaoId: 'indicacao-1',
      mensagem: 'Muito obrigado!',
      publico: true,
      membroId: 'membro-2',
    };

    await waitFor(async () => {
      await expect(result.current.mutateAsync(dto)).rejects.toThrow();
    });
  });

  it('deve invalidar queries após criar obrigado', async () => {
    const mockResponse = {
      success: true,
      data: {
        _id: 'obrigado-1',
        indicacaoId: 'indicacao-1',
        mensagem: 'Muito obrigado!',
        publico: true,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateObrigado(), {
      wrapper,
    });

    const dto: CriarObrigadoDTO = {
      indicacaoId: 'indicacao-1',
      mensagem: 'Muito obrigado!',
      publico: true,
      membroId: 'membro-2',
    };

    await waitFor(async () => {
      await result.current.mutateAsync(dto);
    });

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['obrigados'],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['referrals'],
      });
    });
  });
});

