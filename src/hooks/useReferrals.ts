'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Referral,
  CriarIndicacaoDTO,
  AtualizarStatusIndicacaoDTO,
  ReferralStatus,
} from '@/types/referral';

/**
 * Resposta da API ao criar indicação
 */
interface CriarIndicacaoResponse {
  success: boolean;
  data: Referral;
  message: string;
  error?: string;
}

/**
 * Resposta da API ao listar indicações
 */
interface ListarIndicacoesResponse {
  success: boolean;
  data: {
    feitas: Referral[];
    recebidas: Referral[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Resposta da API ao atualizar status
 */
interface AtualizarStatusResponse {
  success: boolean;
  data: Referral;
  message: string;
}

/**
 * Opções para listar indicações
 */
interface ListarIndicacoesOptions {
  tipo?: 'feitas' | 'recebidas' | 'ambas';
  status?: ReferralStatus;
  page?: number;
  limit?: number;
}

/**
 * Hook para gerenciar indicações usando React Query
 */
export function useReferrals(membroId: string) {
  const queryClient = useQueryClient();

  /**
   * Query para listar indicações
   */
  const useListarIndicacoes = (options: ListarIndicacoesOptions = {}) => {
    const { tipo = 'ambas', status, page = 1, limit = 20 } = options;

    return useQuery<ListarIndicacoesResponse, Error>({
      queryKey: ['referrals', membroId, tipo, status, page, limit],
      queryFn: async () => {
        const params = new URLSearchParams({
          tipo,
          page: page.toString(),
          limit: limit.toString(),
        });
        if (status) {
          params.append('status', status);
        }

        const response = await fetch(`/api/referrals?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${membroId}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || data.error || 'Erro ao listar indicações'
          );
        }

        return data;
      },
      enabled: !!membroId,
      staleTime: 1000 * 5, // 5 segundos (dados dinâmicos - mudam frequentemente)
      gcTime: 1000 * 60 * 10, // 10 minutos no cache
      refetchInterval: 1000 * 30, // Refetch a cada 30 segundos para dados dinâmicos
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    });
  };

  /**
   * Mutation para criar uma nova indicação
   */
  const criarIndicacao = useMutation<
    CriarIndicacaoResponse,
    Error,
    CriarIndicacaoDTO
  >({
    mutationFn: async (dto: CriarIndicacaoDTO) => {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${membroId}`,
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Erro ao criar indicação'
        );
      }

      return data;
    },
    onSuccess: () => {
      // Invalida as queries de indicações para refetch
      queryClient.invalidateQueries({ queryKey: ['referrals', membroId] });
    },
  });

  /**
   * Mutation para atualizar status de uma indicação
   */
  const atualizarStatus = useMutation<
    AtualizarStatusResponse,
    Error,
    { id: string; dto: AtualizarStatusIndicacaoDTO }
  >({
    mutationFn: async ({ id, dto }) => {
      const response = await fetch(`/api/referrals/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${membroId}`,
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Erro ao atualizar status'
        );
      }

      return data;
    },
    onSuccess: () => {
      // Invalida as queries de indicações para refetch
      queryClient.invalidateQueries({ queryKey: ['referrals', membroId] });
    },
  });

  return {
    // Listar indicações
    listarIndicacoes: useListarIndicacoes,
    // Criar indicação
    criarIndicacao: criarIndicacao.mutateAsync,
    isCreating: criarIndicacao.isPending,
    isCreateSuccess: criarIndicacao.isSuccess,
    isCreateError: criarIndicacao.isError,
    createError: criarIndicacao.error,
    resetCreate: criarIndicacao.reset,
    // Atualizar status
    atualizarStatus: atualizarStatus.mutateAsync,
    isUpdatingStatus: atualizarStatus.isPending,
    isUpdateStatusSuccess: atualizarStatus.isSuccess,
    isUpdateStatusError: atualizarStatus.isError,
    updateStatusError: atualizarStatus.error,
    resetUpdateStatus: atualizarStatus.reset,
  };
}

