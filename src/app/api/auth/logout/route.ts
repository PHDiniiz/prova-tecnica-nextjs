import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route para logout de membros
 * POST /api/auth/logout
 * 
 * @access Authenticated (opcional - pode ser chamado sem token)
 * 
 * @returns {object} - Confirmação de logout
 * 
 * @note Em uma implementação completa, aqui poderíamos:
 * - Invalidar o refresh token no banco de dados (blacklist)
 * - Limpar cookies httpOnly
 * - Registrar o logout para auditoria
 * 
 * Por enquanto, o logout é apenas informativo, pois os tokens JWT
 * são stateless. O cliente deve remover os tokens do storage.
 */
export async function POST() {
  try {
    // Em uma implementação futura, poderíamos invalidar o refresh token
    // em uma blacklist no banco de dados

    return NextResponse.json(
      {
        success: true,
        message: 'Logout realizado com sucesso',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
      },
      { status: 500 }
    );
  }
}

