import { GET, PATCH } from '../route';
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

describe('GET /api/meetings/[id]', () => {
  let mockService: jest.Mocked<MeetingService>;
  const membroToken = 'membro-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      buscarReuniaoPorId: jest.fn(),
    } as any;

    (MeetingService as jest.MockedClass<typeof MeetingService>).mockImplementation(
      () => mockService
    );
  });

  it('deve buscar reunião por ID com sucesso', async () => {
    const reuniao = {
      _id: 'meeting-1',
      membro1Id: 'membro-1',
      membro2Id: 'membro-2',
      data: new Date(),
      local: 'Escritório',
      status: 'agendada' as const,
    };

    mockService.buscarReuniaoPorId.mockResolvedValueOnce(reuniao);

    const request = new NextRequest('http://localhost:3000/api/meetings/meeting-1', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${membroToken}`,
      },
    });

    const params = Promise.resolve({ id: 'meeting-1' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(reuniao);
    expect(mockService.buscarReuniaoPorId).toHaveBeenCalledWith('meeting-1');
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const request = new NextRequest('http://localhost:3000/api/meetings/meeting-1', {
      method: 'GET',
      headers: {},
    });

    const params = Promise.resolve({ id: 'meeting-1' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autorizado');
  });

  it('deve retornar erro 404 quando reunião não é encontrada', async () => {
    mockService.buscarReuniaoPorId.mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/meetings/meeting-inexistente', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${membroToken}`,
      },
    });

    const params = Promise.resolve({ id: 'meeting-inexistente' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Reunião não encontrada');
  });
});

describe('PATCH /api/meetings/[id]', () => {
  let mockService: jest.Mocked<MeetingService>;
  const membroToken = 'membro-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      atualizarReuniao: jest.fn(),
    } as any;

    (MeetingService as jest.MockedClass<typeof MeetingService>).mockImplementation(
      () => mockService
    );
  });

  it('deve atualizar reunião com sucesso', async () => {
    const reuniaoAtualizada = {
      _id: 'meeting-1',
      membro1Id: 'membro-1',
      membro2Id: 'membro-2',
      data: new Date(),
      local: 'Novo Local',
      status: 'agendada' as const,
    };

    mockService.atualizarReuniao.mockResolvedValueOnce(reuniaoAtualizada);

    const requestBody = {
      local: 'Novo Local',
    };

    const request = new NextRequest('http://localhost:3000/api/meetings/meeting-1', {
      method: 'PATCH',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${membroToken}`,
      },
    });

    const params = Promise.resolve({ id: 'meeting-1' });
    const response = await PATCH(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(reuniaoAtualizada);
    expect(mockService.atualizarReuniao).toHaveBeenCalledWith('meeting-1', requestBody);
  });

  it('deve retornar erro 400 para dados inválidos', async () => {
    const { ZodError } = await import('zod');
    const error = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['local'],
        message: 'Local deve ser uma string',
      } as any,
    ]);
    mockService.atualizarReuniao.mockRejectedValueOnce(error);

    const request = new NextRequest('http://localhost:3000/api/meetings/meeting-1', {
      method: 'PATCH',
      body: JSON.stringify({ local: 123 }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${membroToken}`,
      },
    });

    const params = Promise.resolve({ id: 'meeting-1' });
    const response = await PATCH(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Dados inválidos');
  });
});

