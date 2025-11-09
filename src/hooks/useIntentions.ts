'use client';

import { useMutation } from '@tanstack/react-query';
import { CriarIntencaoDTO, Intention } from '@/src/types/intention';

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
 * Hook para gerenciar intenções usando React Query
 */
export function useIntentions() {
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

  return {
    criarIntencao: criarIntencao.mutateAsync,
    isCreating: criarIntencao.isPending,
    isSuccess: criarIntencao.isSuccess,
    isError: criarIntencao.isError,
    error: criarIntencao.error,
    reset: criarIntencao.reset,
  };
}

