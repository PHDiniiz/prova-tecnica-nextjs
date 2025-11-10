/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { POST } from '../route';
import { MeetingService } from '@/services/MeetingService';
import { NextRequest } from 'next/server';
import { BusinessError } from '@/lib/errors/BusinessError';

// Mock do MeetingService
jest.mock('@/services/MeetingService');

// Mock do NextRequest para testes
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(
      public url: string,
      public init?: { method?: string; body?: string; headers?: HeadersInit }
    ) {}
    headers = {
      get: (name: string) => {
        if (name === 'Authorization' && this.init?.headers) {
          const headers = this.init.headers as Record<string, string>;
          return headers['Authorization'] || headers['authorization'];
        }
        return null;
      },
    };
    async json() {
      if (this.init?.body) {
        return JSON.parse(this.init.body);
      }
      return {};
    }
  },
  NextResponse: {
    json: (data: any, init?: { status?: number }) => {
      return {
        json: async () => data,
        status: init?.status || 200,
      };
    },
  },
}));

describe('POST /api/meetings/[id]/checkin', () => {
  let mockService: jest.Mocked<MeetingService>;
  const membroToken = 'membro-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      registrarCheckIn: jest.fn(),
    } as any;

    (MeetingService as jest.MockedClass<typeof MeetingService>).mockImplementation(
      () => mockService
    );
  });

  it('deve registrar check-in com sucesso', async () => {
    const reuniaoAtualizada = {
      _id: 'meeting-1',
      membro1Id: 'membro-1',
      membro2Id: 'membro-2',
      checkInMembro1: {
        presente: true,
        observacoes: 'Presente',
      },
      status: 'agendada' as const,
    };

    mockService.registrarCheckIn.mockResolvedValueOnce(reuniaoAtualizada);

    const requestBody = {
      membroId: membroToken,
      presente: true,
      observacoes: 'Presente',
    };

    const request = new NextRequest(
      'http://localhost:3000/api/meetings/meeting-1/checkin',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${membroToken}`,
        },
      }
    );

    const params = Promise.resolve({ id: 'meeting-1' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(reuniaoAtualizada);
    expect(mockService.registrarCheckIn).toHaveBeenCalledWith(
      'meeting-1',
      membroToken,
      true
    );
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/meetings/meeting-1/checkin',
      {
        method: 'POST',
        body: JSON.stringify({
          membroId: 'membro-1',
          presente: true,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const params = Promise.resolve({ id: 'meeting-1' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autorizado');
  });

  it('deve retornar erro 403 quando membroId do body não corresponde ao token', async () => {
    const requestBody = {
      membroId: 'outro-membro',
      presente: true,
    };

    const request = new NextRequest(
      'http://localhost:3000/api/meetings/meeting-1/checkin',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${membroToken}`,
        },
      }
    );

    const params = Promise.resolve({ id: 'meeting-1' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autorizado');
    expect(data.message).toContain('si mesmo');
    expect(mockService.registrarCheckIn).not.toHaveBeenCalled();
  });

  it('deve retornar erro 400 para dados inválidos', async () => {
    const { ZodError } = await import('zod');
    const error = new ZodError([
      {
        code: 'invalid_type',
        expected: 'boolean',
        received: 'string',
        path: ['presente'],
        message: 'Presente deve ser um boolean',
      } as any,
    ]);
    mockService.registrarCheckIn.mockRejectedValueOnce(error);

    const request = new NextRequest(
      'http://localhost:3000/api/meetings/meeting-1/checkin',
      {
        method: 'POST',
        body: JSON.stringify({
          membroId: membroToken,
          presente: 'sim',
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${membroToken}`,
        },
      }
    );

    const params = Promise.resolve({ id: 'meeting-1' });
    const response = await POST(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Dados inválidos');
  });
});

