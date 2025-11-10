import { NextRequest, NextResponse } from 'next/server';
import { NoticeService } from '@/services/NoticeService';
import { AtualizarNoticeDTO } from '@/types/notice';
import { ZodError } from 'zod';
import { BusinessError } from '@/lib/errors/BusinessError';
import { verificarAdminToken, respostaNaoAutorizado } from '@/lib/auth';

/**
 * API Route para buscar um aviso por ID
 * 
 * @route GET /api/notices/[id]
 * @access Public
 * 
 * @param {string} id - ID do aviso
 * 
 * @returns {Promise<NextResponse>} Aviso encontrado
 * 
 * @throws {404} Se aviso não for encontrado
 * 
 * @example
 * GET /api/notices/507f1f77bcf86cd799439013
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = new NoticeService();
    const aviso = await service.buscarAvisoPorId(id);

    if (!aviso) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aviso não encontrado',
          message: 'Aviso não encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: aviso,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof BusinessError) {
      return NextResponse.json(
        {
          success: false,
          error: error.type,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    console.error('Erro ao buscar aviso:', error);
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

/**
 * API Route para atualizar um aviso
 * 
 * @route PATCH /api/notices/[id]
 * @access Admin (requer ADMIN_TOKEN no header Authorization)
 * 
 * @param {string} id - ID do aviso
 * @param {AtualizarNoticeDTO} body - Dados para atualizar (todos opcionais)
 * 
 * @returns {Promise<NextResponse>} Aviso atualizado
 * 
 * @throws {401} Se token de autenticação admin estiver ausente ou inválido
 * @throws {400} Se dados de validação estiverem inválidos
 * @throws {404} Se aviso não for encontrado
 * 
 * @example
 * PATCH /api/notices/507f1f77bcf86cd799439013
 * Authorization: Bearer {ADMIN_TOKEN}
 * {
 *   "ativo": false
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verifica autenticação admin
    if (!verificarAdminToken(request)) {
      return respostaNaoAutorizado();
    }

    const { id } = await params;
    const body: AtualizarNoticeDTO = await request.json();

    const service = new NoticeService();
    const aviso = await service.atualizarAviso(id, body);

    return NextResponse.json(
      {
        success: true,
        data: aviso,
        message: 'Aviso atualizado com sucesso!',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          message: 'Erro de validação',
          details: error.issues.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof BusinessError) {
      return NextResponse.json(
        {
          success: false,
          error: error.type,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    console.error('Erro ao atualizar aviso:', error);
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

/**
 * API Route para deletar um aviso
 * 
 * @route DELETE /api/notices/[id]
 * @access Admin (requer ADMIN_TOKEN no header Authorization)
 * 
 * @param {string} id - ID do aviso
 * 
 * @returns {Promise<NextResponse>} Confirmação de deleção
 * 
 * @throws {401} Se token de autenticação admin estiver ausente ou inválido
 * @throws {404} Se aviso não for encontrado
 * 
 * @example
 * DELETE /api/notices/507f1f77bcf86cd799439013
 * Authorization: Bearer {ADMIN_TOKEN}
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verifica autenticação admin
    if (!verificarAdminToken(request)) {
      return respostaNaoAutorizado();
    }

    const { id } = await params;

    const service = new NoticeService();
    await service.deletarAviso(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Aviso deletado com sucesso!',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof BusinessError) {
      return NextResponse.json(
        {
          success: false,
          error: error.type,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    console.error('Erro ao deletar aviso:', error);
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

