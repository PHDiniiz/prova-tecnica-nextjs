import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useNotices,
  useCreateNotice,
  useUpdateNotice,
  useDeleteNotice,
} from '../useNotices';
import { CriarNoticeDTO, AtualizarNoticeDTO } from '@/types/notice';

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

describe('useNotices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve listar avisos públicos com sucesso', async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          _id: 'notice-1',
          titulo: 'Aviso Importante',
          conteudo: 'Conteúdo do aviso',
          tipo: 'info' as const,
          ativo: true,
        },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(
      () =>
        useNotices({
          publico: true,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/notices?publico=true',
      expect.objectContaining({
        method: 'GET',
        headers: expect.not.objectContaining({
          Authorization: expect.anything(),
        }),
      })
    );
  });

  it('deve listar avisos admin com token', async () => {
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
        useNotices({
          publico: false,
          adminToken: 'admin-token',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/notices?publico=false',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer admin-token',
        }),
      })
    );
  });

  it('deve filtrar por tipo quando fornecido', async () => {
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
        useNotices({
          publico: true,
          tipo: 'warning' as const,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const url = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(url).toContain('tipo=warning');
  });

  it('deve retornar erro quando a API falha', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Erro ao buscar avisos',
      }),
    });

    const { result } = renderHook(
      () =>
        useNotices({
          publico: true,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useCreateNotice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar aviso com sucesso', async () => {
    const mockResponse = {
      success: true,
      data: {
        _id: 'notice-1',
        titulo: 'Novo Aviso',
        conteudo: 'Conteúdo',
        tipo: 'info' as const,
        ativo: true,
      },
      message: 'Aviso criado com sucesso',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useCreateNotice(), {
      wrapper: createWrapper(),
    });

    const dto: CriarNoticeDTO = {
      titulo: 'Novo Aviso',
      conteudo: 'Conteúdo',
      tipo: 'info',
      ativo: true,
    };

    await waitFor(async () => {
      const response = await result.current.mutateAsync({
        ...dto,
        adminToken: 'admin-token',
      });
      expect(response).toEqual(mockResponse);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/notices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin-token',
      },
      body: JSON.stringify(dto),
    });
  });

  it('deve retornar erro quando a API falha', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Erro ao criar aviso',
      }),
    });

    const { result } = renderHook(() => useCreateNotice(), {
      wrapper: createWrapper(),
    });

    const dto: CriarNoticeDTO = {
      titulo: 'Novo Aviso',
      conteudo: 'Conteúdo',
      tipo: 'info',
      ativo: true,
    };

    await waitFor(async () => {
      await expect(
        result.current.mutateAsync({
          ...dto,
          adminToken: 'admin-token',
        })
      ).rejects.toThrow();
    });
  });
});

describe('useUpdateNotice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve atualizar aviso com sucesso', async () => {
    const mockResponse = {
      success: true,
      data: {
        _id: 'notice-1',
        titulo: 'Aviso Atualizado',
        conteudo: 'Conteúdo atualizado',
        tipo: 'warning' as const,
        ativo: true,
      },
      message: 'Aviso atualizado com sucesso',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useUpdateNotice(), {
      wrapper: createWrapper(),
    });

    const dto: AtualizarNoticeDTO = {
      titulo: 'Aviso Atualizado',
    };

    await waitFor(async () => {
      const response = await result.current.mutateAsync({
        id: 'notice-1',
        dto,
        adminToken: 'admin-token',
      });
      expect(response).toEqual(mockResponse);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/notices/notice-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin-token',
      },
      body: JSON.stringify(dto),
    });
  });
});

describe('useDeleteNotice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve deletar aviso com sucesso', async () => {
    const mockResponse = {
      success: true,
      message: 'Aviso deletado com sucesso',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useDeleteNotice(), {
      wrapper: createWrapper(),
    });

    await waitFor(async () => {
      const response = await result.current.mutateAsync({
        id: 'notice-1',
        adminToken: 'admin-token',
      });
      expect(response).toEqual(mockResponse);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/notices/notice-1', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin-token',
      },
    });
  });

  it('deve retornar erro quando a API falha', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Erro ao deletar aviso',
      }),
    });

    const { result } = renderHook(() => useDeleteNotice(), {
      wrapper: createWrapper(),
    });

    await waitFor(async () => {
      await expect(
        result.current.mutateAsync({
          id: 'notice-1',
          adminToken: 'admin-token',
        })
      ).rejects.toThrow();
    });
  });
});

