/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useMeetings,
  useCreateMeeting,
  useUpdateMeeting,
  useCheckIn,
} from '../useMeetings';
import { CriarMeetingDTO, AtualizarMeetingDTO, CheckInDTO } from '@/types/meeting';

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

describe('useMeetings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve listar reuniões com sucesso', async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          _id: 'meeting-1',
          membro1Id: 'membro-1',
          membro2Id: 'membro-2',
          data: new Date().toISOString(),
          local: 'Escritório',
          status: 'agendada' as const,
        },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(
      () =>
        useMeetings({
          membroToken: 'membro-token',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/meetings?',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer membro-token',
        }),
      })
    );
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

    const dataInicio = new Date('2024-01-01');
    const dataFim = new Date('2024-01-31');

    const { result } = renderHook(
      () =>
        useMeetings({
          membroId: 'membro-123',
          filtros: {
            dataInicio,
            dataFim,
          },
          membroToken: 'membro-token',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const url = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(url).toContain('membroId=membro-123');
    expect(url).toContain('dataInicio=');
    expect(url).toContain('dataFim=');
  });

  it('deve retornar erro quando a API falha', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Erro ao buscar reuniões',
      }),
    });

    const { result } = renderHook(
      () =>
        useMeetings({
          membroToken: 'invalid-token',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useCreateMeeting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar reunião com sucesso', async () => {
    const mockResponse = {
      success: true,
      data: {
        _id: 'meeting-1',
        membro1Id: 'membro-1',
        membro2Id: 'membro-2',
        data: new Date().toISOString(),
        local: 'Escritório',
        status: 'agendada' as const,
      },
      message: 'Reunião criada com sucesso',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useCreateMeeting(), {
      wrapper: createWrapper(),
    });

    const dto: CriarMeetingDTO = {
      membro1Id: 'membro-1',
      membro2Id: 'membro-2',
      data: new Date(),
      local: 'Escritório',
    };

    await waitFor(async () => {
      const response = await result.current.mutateAsync({
        ...dto,
        membroToken: 'membro-token',
      });
      expect(response).toEqual(mockResponse);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/meetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer membro-token',
      },
      body: JSON.stringify(dto),
    });
  });

  it('deve retornar erro quando a API falha', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Erro ao criar reunião',
      }),
    });

    const { result } = renderHook(() => useCreateMeeting(), {
      wrapper: createWrapper(),
    });

    const dto: CriarMeetingDTO = {
      membro1Id: 'membro-1',
      membro2Id: 'membro-2',
      data: new Date(),
      local: 'Escritório',
    };

    await waitFor(async () => {
      await expect(
        result.current.mutateAsync({
          ...dto,
          membroToken: 'membro-token',
        })
      ).rejects.toThrow();
    });
  });
});

describe('useUpdateMeeting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve atualizar reunião com sucesso', async () => {
    const mockResponse = {
      success: true,
      data: {
        _id: 'meeting-1',
        membro1Id: 'membro-1',
        membro2Id: 'membro-2',
        data: new Date().toISOString(),
        local: 'Novo Local',
        status: 'agendada' as const,
      },
      message: 'Reunião atualizada com sucesso',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useUpdateMeeting(), {
      wrapper: createWrapper(),
    });

    const dto: AtualizarMeetingDTO = {
      local: 'Novo Local',
    };

    await waitFor(async () => {
      const response = await result.current.mutateAsync({
        id: 'meeting-1',
        dto,
        membroToken: 'membro-token',
      });
      expect(response).toEqual(mockResponse);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/meetings/meeting-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer membro-token',
      },
      body: JSON.stringify(dto),
    });
  });
});

describe('useCheckIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve registrar check-in com sucesso', async () => {
    const mockResponse = {
      success: true,
      data: {
        _id: 'meeting-1',
        membro1Id: 'membro-1',
        membro2Id: 'membro-2',
        checkInMembro1: {
          presente: true,
          observacoes: 'Presente',
        },
      },
      message: 'Check-in registrado com sucesso',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useCheckIn(), {
      wrapper: createWrapper(),
    });

    const checkIn: CheckInDTO = {
      presente: true,
      observacoes: 'Presente',
    };

    await waitFor(async () => {
      const response = await result.current.mutateAsync({
        meetingId: 'meeting-1',
        checkIn,
        membroToken: 'membro-token',
      });
      expect(response).toEqual(mockResponse);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/meetings/meeting-1/checkin',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer membro-token',
        },
        body: JSON.stringify(checkIn),
      }
    );
  });

  it('deve retornar erro quando a API falha', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Erro ao registrar check-in',
      }),
    });

    const { result } = renderHook(() => useCheckIn(), {
      wrapper: createWrapper(),
    });

    const checkIn: CheckInDTO = {
      presente: true,
    };

    await waitFor(async () => {
      await expect(
        result.current.mutateAsync({
          meetingId: 'meeting-1',
          checkIn,
          membroToken: 'membro-token',
        })
      ).rejects.toThrow();
    });
  });
});

