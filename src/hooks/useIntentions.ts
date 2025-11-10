'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CriarIntencaoDTO, Intention, IntentionStatus, AtualizarStatusIntencaoDTO } from '@/types/intention';

/**
 * Resposta da API ao criar intenção
 */
interface CriarIntencaoResponse {
  success: boolean;
  data: Intention;
  message: string;
  error?: string;
  details?: string;
}

/**
 * Resposta da API ao listar intenções
 */
interface ListarIntencoesResponse {
  success: boolean;
  data: Intention[];
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
  data: Intention;
  invite?: {
    token: string;
    expiraEm: Date;
    url: string;
  };
}

/**
 * Hook para gerenciar intenções usando React Query
 */
export function useIntentions() {
  const queryClient = useQueryClient();

  /**
   * Query para listar intenções (admin)
   */
  const listarIntencoes = (
    status?: IntentionStatus,
    pagina: number = 1,
    limite: number = 20,
    adminToken?: string
  ) => {
    return useQuery<ListarIntencoesResponse, Error>({
      queryKey: ['intentions', status, pagina, limite],
      queryFn: async () => {
        const params = new URLSearchParams({
          page: pagina.toString(),
          limit: limite.toString(),
        });
        if (status) {
          params.append('status', status);
        }

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (adminToken) {
          headers['Authorization'] = `Bearer ${adminToken}`;
        }

        const response = await fetch(`/api/intentions?${params.toString()}`, {
          headers,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || data.error || 'Erro ao listar intenções'
          );
        }

        return data;
      },
      enabled: !!adminToken, // Só executa se tiver token admin
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  };

  /**
   * Mutation para criar uma nova intenção
   */
  const criarIntencao = useMutation<
    CriarIntencaoResponse,
    Error,
    CriarIntencaoDTO
  >({
    mutationFn: async (dto: CriarIntencaoDTO) => {
      const response = await fetch('/api/intentions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Erro ao criar intenção'
        );
      }

      return data;
    },
  });

  /**
   * Mutation para atualizar status de uma intenção (admin)
   */
  const atualizarStatus = useMutation<
    AtualizarStatusResponse,
    Error,
    { id: string; dto: AtualizarStatusIntencaoDTO; adminToken: string }
  >({
    mutationFn: async ({ id, dto, adminToken }) => {
      const response = await fetch(`/api/intentions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
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
      // Invalida as queries de intenções para refetch
      queryClient.invalidateQueries({ queryKey: ['intentions'] });
    },
  });

  return {
    // Criar intenção
    criarIntencao: criarIntencao.mutateAsync,
    isCreating: criarIntencao.isPending,
    isCreateSuccess: criarIntencao.isSuccess,
    isCreateError: criarIntencao.isError,
    createError: criarIntencao.error,
    resetCreate: criarIntencao.reset,
    // Listar intenções
    listarIntencoes,
    // Atualizar status
    atualizarStatus: atualizarStatus.mutateAsync,
    isUpdatingStatus: atualizarStatus.isPending,
    isUpdateStatusSuccess: atualizarStatus.isSuccess,
    isUpdateStatusError: atualizarStatus.isError,
    updateStatusError: atualizarStatus.error,
    resetUpdateStatus: atualizarStatus.reset,
  };
}

