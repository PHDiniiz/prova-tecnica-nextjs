/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { GET } from '../route';
import { InviteService } from '@/services/InviteService';
import { IntentionService } from '@/services/IntentionService';
import { NextRequest } from 'next/server';

// Mock dos Services
jest.mock('@/services/InviteService');
jest.mock('@/services/IntentionService');

// Mock do NextRequest para testes
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(
      public url: string,
      public init?: { method?: string; body?: string; headers?: HeadersInit }
    ) {}
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

describe('GET /api/invites/[token]', () => {
  let mockInviteService: jest.Mocked<InviteService>;
  let mockIntentionService: jest.Mocked<IntentionService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockInviteService = {
      validarConvite: jest.fn(),
    } as any;

    mockIntentionService = {
      buscarIntencaoPorId: jest.fn(),
    } as any;

    (InviteService as jest.MockedClass<typeof InviteService>).mockImplementation(
      () => mockInviteService
    );

    (IntentionService as jest.MockedClass<typeof IntentionService>).mockImplementation(
      () => mockIntentionService
    );
  });

  it('deve validar convite com sucesso', async () => {
    const convite = {
      _id: 'convite-123',
      token: 'token-abc123',
      intencaoId: 'intencao-456',
      usado: false,
      expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      criadoEm: new Date(),
    };

    const intencao = {
      _id: 'intencao-456',
      nome: 'João Silva',
      email: 'joao@example.com',
      empresa: 'Empresa Teste',
      motivo: 'Quero participar do grupo',
      status: 'approved' as const,
    };

    mockInviteService.validarConvite.mockResolvedValueOnce(convite);
    mockIntentionService.buscarIntencaoPorId.mockResolvedValueOnce(intencao);

    const request = new NextRequest('http://localhost:3000/api/invites/token-abc123');
    const params = Promise.resolve({ token: 'token-abc123' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.token).toBe(convite.token);
    expect(data.data.valido).toBe(true);
    expect(data.data.intencao.nome).toBe(intencao.nome);
    expect(mockInviteService.validarConvite).toHaveBeenCalledWith({
      token: 'token-abc123',
    });
  });

  it('deve retornar erro 400 quando token não é fornecido', async () => {
    const request = new NextRequest('http://localhost:3000/api/invites/');
    const params = Promise.resolve({ token: '' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Token não fornecido');
  });

  it('deve retornar erro 400 quando token é inválido', async () => {
    mockInviteService.validarConvite.mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/invites/token-invalido');
    const params = Promise.resolve({ token: 'token-invalido' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Token inválido ou expirado');
  });

  it('deve retornar erro 400 quando convite já foi usado', async () => {
    const error = new Error('Este convite já foi usado');
    mockInviteService.validarConvite.mockRejectedValueOnce(error);

    const request = new NextRequest('http://localhost:3000/api/invites/token-usado');
    const params = Promise.resolve({ token: 'token-usado' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Este convite já foi usado');
  });

  it('deve retornar erro 400 quando convite expirou', async () => {
    // O erro precisa conter "expirou" na mensagem para ser capturado pela rota
    // A rota verifica error.message.includes('expirado') || error.message.includes('expirou')
    const error = new Error('Este convite expirou');
    mockInviteService.validarConvite.mockRejectedValueOnce(error);

    const request = new NextRequest('http://localhost:3000/api/invites/token-expirado');
    const params = Promise.resolve({ token: 'token-expirado' });

    const response = await GET(request, { params });
    const data = await response.json();

    // A rota deve capturar o erro e retornar 400
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Este convite expirou');
  });

  it('deve retornar erro 404 quando intenção não é encontrada', async () => {
    const convite = {
      _id: 'convite-123',
      token: 'token-abc123',
      intencaoId: 'intencao-456',
      usado: false,
      expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      criadoEm: new Date(),
    };

    mockInviteService.validarConvite.mockResolvedValueOnce(convite);
    mockIntentionService.buscarIntencaoPorId.mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/invites/token-abc123');
    const params = Promise.resolve({ token: 'token-abc123' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Intenção não encontrada');
  });

  it('deve retornar erro 500 para erros inesperados', async () => {
    const error = new Error('Erro inesperado');
    mockInviteService.validarConvite.mockRejectedValueOnce(error);

    const request = new NextRequest('http://localhost:3000/api/invites/token-abc123');
    const params = Promise.resolve({ token: 'token-abc123' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Erro ao processar sua solicitação');
  });
});

