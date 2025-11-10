/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useReferrals } from '../useReferrals';
import {
  CriarIndicacaoDTO,
  AtualizarStatusIndicacaoDTO,
} from '@/types/referral';

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

describe('useReferrals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listarIndicacoes', () => {
    it('deve listar indicações com sucesso', async () => {
      const mockResponse = {
        success: true,
        data: {
          feitas: [],
          recebidas: [],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useReferrals('membro-123'), {
        wrapper: createWrapper(),
      });

      const { result: queryResult } = renderHook(
        () => result.current.listarIndicacoes(),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(queryResult.current.isSuccess).toBe(true);
      });

      expect(queryResult.current.data).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/referrals?tipo=ambas&page=1&limit=20',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer membro-123',
          }),
        })
      );
    });

    it('deve incluir filtros nos parâmetros quando fornecidos', async () => {
      const mockResponse = {
        success: true,
        data: {
          feitas: [],
          recebidas: [],
        },
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useReferrals('membro-123'), {
        wrapper: createWrapper(),
      });

      const { result: queryResult } = renderHook(
        () =>
          result.current.listarIndicacoes({
            tipo: 'feitas',
            status: 'nova',
            page: 2,
            limit: 10,
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(queryResult.current.isSuccess).toBe(true);
      });

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('tipo=feitas');
      expect(url).toContain('status=nova');
      expect(url).toContain('page=2');
      expect(url).toContain('limit=10');
    });

    it('deve retornar erro quando a API falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Erro ao listar indicações',
        }),
      });

      const { result } = renderHook(() => useReferrals('membro-123'), {
        wrapper: createWrapper(),
      });

      const { result: queryResult } = renderHook(
        () => result.current.listarIndicacoes(),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(queryResult.current.isError).toBe(true);
      });

      expect(queryResult.current.error).toBeInstanceOf(Error);
    });

    it('não deve fazer requisição quando membroId não é fornecido', async () => {
      const { result } = renderHook(() => useReferrals(''), {
        wrapper: createWrapper(),
      });

      const { result: queryResult } = renderHook(
        () => result.current.listarIndicacoes(),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(queryResult.current.isLoading).toBe(false);
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('criarIndicacao', () => {
    it('deve criar indicação com sucesso', async () => {
      const mockResponse = {
        success: true,
        data: {
          _id: 'referral-1',
          membroIndicadorId: 'membro-1',
          membroIndicadoId: 'membro-2',
          descricao: 'Indicação de negócio',
          status: 'nova' as const,
        },
        message: 'Indicação criada com sucesso',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useReferrals('membro-1'), {
        wrapper: createWrapper(),
      });

      const dto: CriarIndicacaoDTO = {
        membroIndicadoId: 'membro-2',
        descricao: 'Indicação de negócio',
        valorEstimado: 10000,
      };

      await waitFor(async () => {
        const response = await result.current.criarIndicacao(dto);
        expect(response).toEqual(mockResponse);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer membro-1',
        },
        body: JSON.stringify(dto),
      });
    });

    it('deve retornar erro quando a API falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Erro ao criar indicação',
        }),
      });

      const { result } = renderHook(() => useReferrals('membro-1'), {
        wrapper: createWrapper(),
      });

      const dto: CriarIndicacaoDTO = {
        membroIndicadoId: 'membro-2',
        descricao: 'Indicação de negócio',
        valorEstimado: 10000,
      };

      await waitFor(async () => {
        await expect(
          result.current.criarIndicacao(dto)
        ).rejects.toThrow();
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

      const { result } = renderHook(() => useReferrals('membro-1'), {
        wrapper: createWrapper(),
      });

      const dto: CriarIndicacaoDTO = {
        membroIndicadoId: 'membro-2',
        descricao: 'Indicação de negócio',
        valorEstimado: 10000,
      };

      const mutationPromise = result.current.criarIndicacao(dto);

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true);
      });

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

  describe('atualizarStatus', () => {
    it('deve atualizar status com sucesso', async () => {
      const mockResponse = {
        success: true,
        data: {
          _id: 'referral-1',
          membroIndicadorId: 'membro-1',
          membroIndicadoId: 'membro-2',
          status: 'em-contato' as const,
        },
        message: 'Status atualizado com sucesso',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useReferrals('membro-1'), {
        wrapper: createWrapper(),
      });

      const dto: AtualizarStatusIndicacaoDTO = {
        status: 'em-contato',
      };

      await waitFor(async () => {
        const response = await result.current.atualizarStatus({
          id: 'referral-1',
          dto,
        });
        expect(response).toEqual(mockResponse);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/referrals/referral-1/status',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer membro-1',
          },
          body: JSON.stringify(dto),
        }
      );
    });

    it('deve retornar erro quando a API falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Erro ao atualizar status',
        }),
      });

      const { result } = renderHook(() => useReferrals('membro-1'), {
        wrapper: createWrapper(),
      });

      const dto: AtualizarStatusIndicacaoDTO = {
        status: 'em-contato',
      };

      await waitFor(async () => {
        await expect(
          result.current.atualizarStatus({
            id: 'referral-1',
            dto,
          })
        ).rejects.toThrow();
      });

      expect(result.current.isUpdateStatusError).toBe(true);
    });
  });
});

