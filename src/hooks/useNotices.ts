'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notice, CriarNoticeDTO, AtualizarNoticeDTO, NoticeType } from '@/types/notice';

/**
 * Resposta da API ao listar avisos
 */
interface ListarNoticesResponse {
  success: boolean;
  data: Notice[];
}

/**
 * Resposta da API ao criar/atualizar aviso
 */
interface CriarNoticeResponse {
  success: boolean;
  data: Notice;
  message: string;
}

/**
 * Opções para listar avisos
 */
interface UseNoticesOptions {
  publico?: boolean;
  tipo?: NoticeType;
  adminToken?: string;
  enabled?: boolean;
}

/**
 * Hook para listar avisos
 * Implementa UI/UX otimista com cache inteligente
 * 
 * @example
 * ```tsx
 * // Listagem pública
 * const { data, isLoading } = useNotices({ publico: true });
 * 
 * // Listagem admin
 * const { data, isLoading } = useNotices({ 
 *   publico: false, 
 *   adminToken: 'token-admin' 
 * });
 * ```
 */
export function useNotices(options: UseNoticesOptions = {}) {
  const { publico = true, tipo, adminToken, enabled = true } = options;

  return useQuery<ListarNoticesResponse, Error>({
    queryKey: ['notices', publico, tipo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (publico) {
        params.append('publico', 'true');
      } else {
        params.append('publico', 'false');
      }
      if (tipo) {
        params.append('tipo', tipo);
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (!publico && adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const response = await fetch(`/api/notices?${params.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao buscar avisos');
      }

      return response.json();
    },
    enabled: enabled && (publico || !!adminToken),
    staleTime: publico ? 1000 * 60 * 5 : 1000 * 60 * 2, // Público: 5min, Admin: 2min
    refetchOnMount: true,
    refetchOnWindowFocus: publico, // Apenas refetch público no focus
    refetchOnReconnect: true,
  });
}

/**
 * Hook para criar um novo aviso (admin apenas)
 */
export function useCreateNotice() {
  const queryClient = useQueryClient();

  return useMutation<CriarNoticeResponse, Error, CriarNoticeDTO & { adminToken: string }>({
    mutationFn: async ({ adminToken, ...dto }) => {
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar aviso');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalida queries de avisos para refetch
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
}

/**
 * Hook para atualizar um aviso (admin apenas)
 */
export function useUpdateNotice() {
  const queryClient = useQueryClient();

  return useMutation<
    CriarNoticeResponse,
    Error,
    { id: string; dto: AtualizarNoticeDTO; adminToken: string }
  >({
    mutationFn: async ({ id, dto, adminToken }) => {
      const response = await fetch(`/api/notices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar aviso');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalida queries de avisos para refetch
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
}

/**
 * Hook para deletar um aviso (admin apenas)
 */
export function useDeleteNotice() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string },
    Error,
    { id: string; adminToken: string }
  >({
    mutationFn: async ({ id, adminToken }) => {
      const response = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao deletar aviso');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalida queries de avisos para refetch
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
}

