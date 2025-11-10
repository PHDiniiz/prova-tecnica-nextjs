'use client';

import { useQuery } from '@tanstack/react-query';
import { PeriodoFiltro, DashboardResponse } from '@/types/dashboard';

/**
 * Resposta da API de dashboard
 */
interface DashboardApiResponse {
  success: boolean;
  data: {
    metricasGerais: any;
    performanceMembros?: any[];
    performanceIndividual?: any | null;
  };
  periodo: PeriodoFiltro;
}

/**
 * Opções para buscar dashboard
 */
interface UseDashboardOptions {
  periodo?: PeriodoFiltro;
  membroId?: string;
  adminToken: string;
  enabled?: boolean;
}

/**
 * Hook para buscar dados do dashboard
 * Implementa UI/UX otimista com cache inteligente
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDashboard({
 *   periodo: 'mensal',
 *   adminToken: 'token-admin'
 * });
 * ```
 */
export function useDashboard(options: UseDashboardOptions) {
  const { periodo = 'mensal', membroId, adminToken, enabled = true } = options;

  return useQuery<DashboardApiResponse, Error>({
    queryKey: ['dashboard', periodo, membroId],
    queryFn: async () => {
      const params = new URLSearchParams({
        periodo,
      });

      if (membroId) {
        params.append('membroId', membroId);
      }

      const response = await fetch(`/api/dashboard?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao buscar dados do dashboard');
      }

      return response.json();
    },
    enabled: enabled && !!adminToken,
    staleTime: 1000 * 60 * 5, // 5 minutos - dados de dashboard não mudam frequentemente
    gcTime: 1000 * 60 * 10, // 10 minutos - manter em cache por mais tempo
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

