import { NextRequest } from 'next/server';

/**
 * Helpers padronizados para mocks de testes
 */

/**
 * Cria um mock padronizado de NextResponse.json
 */
export function createMockNextResponse(data: any, status: number = 200) {
  return {
    json: async () => data,
    status,
    ok: status >= 200 && status < 300,
  };
}

/**
 * Cria um mock padronizado de resposta de não autorizado
 */
export function createMockUnauthorizedResponse() {
  return createMockNextResponse(
    {
      success: false,
      error: 'Não autorizado',
      message: 'Token de autenticação inválido ou ausente',
    },
    401
  );
}

/**
 * Cria um mock padronizado de resposta de membro inativo
 */
export function createMockInactiveMemberResponse() {
  return createMockNextResponse(
    {
      success: false,
      error: 'Membro inativo',
      message: 'Apenas membros ativos podem realizar esta ação',
    },
    403
  );
}

/**
 * Cria um mock padronizado de NextRequest para testes
 */
export function createMockNextRequest(
  url: string,
  options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  }
): NextRequest {
  const headers = new Headers();
  if (options?.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  return {
    url,
    method: options?.method || 'GET',
    headers: {
      get: (name: string) => headers.get(name),
    },
    json: async () => {
      if (options?.body) {
        return typeof options.body === 'string'
          ? JSON.parse(options.body)
          : options.body;
      }
      return {};
    },
    searchParams: new URL(url).searchParams,
  } as unknown as NextRequest;
}

/**
 * Mock padrão para extrairMembroIdDoToken
 * Retorna o membroId do header Authorization se presente
 */
export function mockExtrairMembroIdDoToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.replace('Bearer ', '');
}

/**
 * Mock padrão para extrairMembroIdAtivoDoToken
 * Retorna objeto com membroId e isInactive
 */
export function mockExtrairMembroIdAtivoDoToken(request: NextRequest): {
  membroId: string | null;
  isInactive: boolean;
} {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { membroId: null, isInactive: false };
  }
  const membroId = authHeader.replace('Bearer ', '');
  return { membroId, isInactive: false };
}

/**
 * Mock padrão para verificarAdminToken
 * Verifica se o token no header corresponde ao ADMIN_TOKEN esperado
 */
export function mockVerificarAdminToken(
  request: NextRequest,
  expectedToken: string = 'admin-token-123'
): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return false;
  }
  const token = authHeader.replace('Bearer ', '');
  return token === expectedToken;
}

