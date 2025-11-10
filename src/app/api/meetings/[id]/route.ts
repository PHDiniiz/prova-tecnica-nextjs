import { NextRequest, NextResponse } from 'next/server';
import { MeetingService } from '@/services/MeetingService';
import { AtualizarMeetingDTO } from '@/types/meeting';
import { ZodError } from 'zod';
import { BusinessError } from '@/lib/errors/BusinessError';
import { extrairMembroIdDoToken, respostaNaoAutorizado } from '@/lib/auth';

/**
 * API Route para buscar uma reunião por ID
 * 
 * @route GET /api/meetings/[id]
 * @access Authenticated (requer Bearer token no header Authorization)
 * 
 * @param {string} id - ID da reunião
 * 
 * @returns {Promise<NextResponse>} Reunião encontrada
 * 
 * @throws {401} Se token de autenticação estiver ausente
 * @throws {404} Se reunião não for encontrada
 * 
 * @example
 * GET /api/meetings/507f1f77bcf86cd799439013
 * Authorization: Bearer {membroId}
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const membroId = extrairMembroIdDoToken(request);
    
    if (!membroId) {
      return respostaNaoAutorizado();
    }

    const { id } = await params;

    const service = new MeetingService();
    const reuniao = await service.buscarReuniaoPorId(id);

    if (!reuniao) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reunião não encontrada',
          message: 'Reunião não encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: reuniao,
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

    console.error('Erro ao buscar reunião:', error);
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
 * API Route para atualizar uma reunião
 * 
 * @route PATCH /api/meetings/[id]
 * @access Authenticated (requer Bearer token no header Authorization)
 * 
 * @param {string} id - ID da reunião
 * @param {AtualizarMeetingDTO} body - Dados para atualizar (todos opcionais)
 * 
 * @returns {Promise<NextResponse>} Reunião atualizada
 * 
 * @throws {401} Se token de autenticação estiver ausente
 * @throws {400} Se dados de validação estiverem inválidos
 * @throws {404} Se reunião não for encontrada
 * 
 * @example
 * PATCH /api/meetings/507f1f77bcf86cd799439013
 * Authorization: Bearer {membroId}
 * {
 *   "local": "Novo local",
 *   "observacoes": "Observações atualizadas"
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const membroId = extrairMembroIdDoToken(request);
    
    if (!membroId) {
      return respostaNaoAutorizado();
    }

    const { id } = await params;
    const body: AtualizarMeetingDTO = await request.json();

    const service = new MeetingService();
    const reuniao = await service.atualizarReuniao(id, body);

    return NextResponse.json(
      {
        success: true,
        data: reuniao,
        message: 'Reunião atualizada com sucesso!',
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

    console.error('Erro ao atualizar reunião:', error);
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

