import { NextRequest, NextResponse } from 'next/server';

/**
 * Verifica se o token de autenticação admin é válido
 */
export function verificarAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    console.error('ADMIN_TOKEN não configurado nas variáveis de ambiente');
    return false;
  }

  return token === adminToken;
}

/**
 * Retorna uma resposta de erro de autenticação
 */
export function respostaNaoAutorizado() {
  return NextResponse.json(
    {
      success: false,
      error: 'Não autorizado',
      message: 'Token de autenticação inválido ou ausente',
    },
    { status: 401 }
  );
}

