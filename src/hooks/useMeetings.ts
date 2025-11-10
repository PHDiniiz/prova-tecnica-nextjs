'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Meeting, CriarMeetingDTO, AtualizarMeetingDTO, CheckInDTO, MeetingFiltros } from '@/types/meeting';

/**
 * Resposta da API ao listar reuniões
 */
interface ListarMeetingsResponse {
  success: boolean;
  data: Meeting[];
}

/**
 * Resposta da API ao criar/atualizar reunião
 */
interface CriarMeetingResponse {
  success: boolean;
  data: Meeting;
  message: string;
}

/**
 * Opções para listar reuniões
 */
interface UseMeetingsOptions {
  membroId?: string;
  filtros?: MeetingFiltros;
  membroToken: string;
  enabled?: boolean;
}

/**
 * Hook para listar reuniões
 * Implementa UI/UX otimista com cache inteligente
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useMeetings({
 *   membroId: 'membro-123',
 *   membroToken: 'token-membro'
 * });
 * ```
 */
export function useMeetings(options: UseMeetingsOptions) {
  const { membroId, filtros, membroToken, enabled = true } = options;

  return useQuery<ListarMeetingsResponse, Error>({
    queryKey: ['meetings', membroId, filtros],
    queryFn: async () => {
      // Verifica se admin_token está disponível
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const token = adminToken || membroToken;

      const params = new URLSearchParams();
      if (membroId) {
        params.append('membroId', membroId);
      }
      if (filtros?.dataInicio) {
        params.append('dataInicio', new Date(filtros.dataInicio).toISOString());
      }
      if (filtros?.dataFim) {
        params.append('dataFim', new Date(filtros.dataFim).toISOString());
      }

      const response = await fetch(`/api/meetings?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao buscar reuniões');
      }

      return response.json();
    },
    enabled: enabled && (!!membroToken || (typeof window !== 'undefined' && !!localStorage.getItem('admin_token'))),
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/**
 * Hook para criar uma nova reunião
 */
export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation<CriarMeetingResponse, Error, CriarMeetingDTO & { membroToken: string }>({
    mutationFn: async ({ membroToken, ...dto }) => {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${membroToken}`,
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar reunião');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalida queries de reuniões para refetch
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}

/**
 * Hook para atualizar uma reunião
 */
export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation<
    CriarMeetingResponse,
    Error,
    { id: string; dto: AtualizarMeetingDTO; membroToken: string }
  >({
    mutationFn: async ({ id, dto, membroToken }) => {
      const response = await fetch(`/api/meetings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${membroToken}`,
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar reunião');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalida queries de reuniões para refetch
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}

/**
 * Hook para registrar check-in
 */
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation<
    CriarMeetingResponse,
    Error,
    { meetingId: string; checkIn: CheckInDTO; membroToken: string }
  >({
    mutationFn: async ({ meetingId, checkIn, membroToken }) => {
      const response = await fetch(`/api/meetings/${meetingId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${membroToken}`,
        },
        body: JSON.stringify(checkIn),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao registrar check-in');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalida queries de reuniões para refetch
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}

