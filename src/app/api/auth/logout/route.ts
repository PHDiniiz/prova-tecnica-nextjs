import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { TokenRepository } from '@/lib/repositories/TokenRepository';
import { extrairInfoDoToken } from '@/lib/auth';

/**
 * API Route para logout de membros
 * POST /api/auth/logout
 * 
 * @access Authenticated (opcional - pode ser chamado sem token)
 * 
 * @returns {object} - Confirmação de logout
 * 
 * @note Implementação completa com blacklist:
 * - Invalida o access token no banco de dados (blacklist)
 * - Limpa cookies httpOnly (futuro)
 * - Registra o logout para auditoria (futuro)
 */
export async function POST(request: NextRequest) {
  try {
    // Extrai informações do token (se existir)
    const tokenInfo = extrairInfoDoToken(request);
    
    if (tokenInfo && tokenInfo.membroId) {
      // Adiciona access token à blacklist
      const db = await getDatabase();
      const tokenRepository = new TokenRepository(db);
      
      const authHeader = request.headers.get('Authorization');
      const accessToken = authHeader?.replace('Bearer ', '');
      
      if (accessToken) {
        // Calcula expiração do token (15 minutos padrão)
        const expiraEm = new Date();
        expiraEm.setMinutes(expiraEm.getMinutes() + 15);
        
        await tokenRepository.adicionarBlacklist(
          accessToken,
          tokenInfo.membroId,
          'access',
          expiraEm
        );
      }
    }

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

