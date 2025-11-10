'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Obrigado, CriarObrigadoDTO } from '@/types/obrigado';

/**
 * Hook para buscar agradecimentos públicos (obrigados)
 */
export function useObrigados(filtro?: {
  membroIndicadorId?: string;
  membroIndicadoId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['obrigados', filtro],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filtro?.membroIndicadorId) {
        params.append('membroIndicadorId', filtro.membroIndicadorId);
      }
      if (filtro?.membroIndicadoId) {
        params.append('membroIndicadoId', filtro.membroIndicadoId);
      }
      if (filtro?.page) {
        params.append('page', filtro.page.toString());
      }
      if (filtro?.limit) {
        params.append('limit', filtro.limit.toString());
      }

      const response = await fetch(`/api/obrigados?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar agradecimentos');
      }

      const data = await response.json();
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para criar um novo agradecimento (obrigado)
 */
export function useCreateObrigado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CriarObrigadoDTO & { membroId: string }) => {
      const response = await fetch('/api/obrigados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${dto.membroId}`,
        },
        body: JSON.stringify({
          indicacaoId: dto.indicacaoId,
          mensagem: dto.mensagem,
          publico: dto.publico,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar agradecimento');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalida queries de obrigados para refetch
      queryClient.invalidateQueries({ queryKey: ['obrigados'] });
      // Também invalida queries de referrals para atualizar status
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });
}

