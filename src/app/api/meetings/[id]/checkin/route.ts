import { NextRequest, NextResponse } from 'next/server';
import { MeetingService } from '@/services/MeetingService';
import { CheckInDTO } from '@/types/meeting';
import { ZodError } from 'zod';
import { BusinessError } from '@/lib/errors/BusinessError';
import { extrairMembroIdDoToken, respostaNaoAutorizado } from '@/lib/auth';

/**
 * API Route para registrar check-in em uma reunião
 * 
 * @route POST /api/meetings/[id]/checkin
 * @access Authenticated (requer Bearer token no header Authorization)
 * 
 * @param {string} id - ID da reunião
 * @param {CheckInDTO} body - Dados do check-in
 * @param {string} body.membroId - ID do membro fazendo check-in
 * @param {boolean} body.presente - Se o membro está presente
 * 
 * @returns {Promise<NextResponse>} Reunião atualizada com check-in registrado
 * 
 * @throws {401} Se token de autenticação estiver ausente
 * @throws {400} Se dados de validação estiverem inválidos
 * @throws {403} Se membro não fizer parte da reunião
 * @throws {404} Se reunião não for encontrada
 * 
 * @example
 * POST /api/meetings/507f1f77bcf86cd799439013/checkin
 * Authorization: Bearer {membroId}
 * {
 *   "membroId": "507f1f77bcf86cd799439013",
 *   "presente": true
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const membroId = extrairMembroIdDoToken(request);
    
    if (!membroId) {
      return respostaNaoAutorizado();
    }

    const { id } = await params;
    const body: CheckInDTO = await request.json();

    // Valida se o membroId do body corresponde ao do token
    if (body.membroId !== membroId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Não autorizado',
          message: 'Você só pode fazer check-in para si mesmo',
        },
        { status: 403 }
      );
    }

    const service = new MeetingService();
    const reuniao = await service.registrarCheckIn(id, body.membroId, body.presente);

    return NextResponse.json(
      {
        success: true,
        data: reuniao,
        message: 'Check-in registrado com sucesso!',
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

    console.error('Erro ao registrar check-in:', error);
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

