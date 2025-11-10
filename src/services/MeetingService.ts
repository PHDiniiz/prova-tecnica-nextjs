import { getDatabase } from '@/lib/mongodb';
import { MeetingRepository } from '@/lib/repositories/MeetingRepository';
import { MemberRepository } from '@/lib/repositories/MemberRepository';
import {
  Meeting,
  CriarMeetingDTO,
  AtualizarMeetingDTO,
  CheckInDTO,
  MeetingFiltros,
} from '@/types/meeting';
import { BusinessError } from '@/lib/errors/BusinessError';
import { z } from 'zod';

/**
 * Schema de validação para criar reunião
 */
const criarMeetingSchema = z.object({
  membro1Id: z.string().min(1, 'Membro 1 é obrigatório'),
  membro2Id: z.string().min(1, 'Membro 2 é obrigatório'),
  dataReuniao: z.coerce.date(),
  local: z.string().max(200, 'Local deve ter no máximo 200 caracteres').optional(),
  observacoes: z.string().max(1000, 'Observações deve ter no máximo 1000 caracteres').optional(),
});

/**
 * Schema de validação para atualizar reunião
 */
const atualizarMeetingSchema = z.object({
  dataReuniao: z.coerce.date().optional(),
  local: z.string().max(200, 'Local deve ter no máximo 200 caracteres').optional(),
  observacoes: z.string().max(1000, 'Observações deve ter no máximo 1000 caracteres').optional(),
});

/**
 * Schema de validação para check-in
 */
const checkInSchema = z.object({
  membroId: z.string().min(1, 'ID do membro é obrigatório'),
  presente: z.boolean(),
});

/**
 * Serviço de aplicação para gerenciar reuniões
 * Responsabilidade única: Lógica de negócio para reuniões
 */
export class MeetingService {
  private repository: MeetingRepository;
  private memberRepository: MemberRepository;

  constructor() {
    this.repository = {} as MeetingRepository;
    this.memberRepository = {} as MemberRepository;
  }

  /**
   * Inicializa os repositórios com a conexão do banco
   */
  private async initRepositories() {
    if (!this.repository || !('db' in this.repository)) {
      const db = await getDatabase();
      this.repository = new MeetingRepository(db);
      this.memberRepository = new MemberRepository(db);
    }
  }

  /**
   * Cria uma nova reunião
   */
  async criarReuniao(dto: CriarMeetingDTO): Promise<Meeting> {
    try {
      await this.initRepositories();

      // Valida os dados
      const dadosValidados = criarMeetingSchema.parse(dto);

      // Validações de negócio
      if (dadosValidados.membro1Id === dadosValidados.membro2Id) {
        throw new BusinessError(
          'Membros iguais',
          'Não é possível criar reunião com o mesmo membro',
          400
        );
      }

      // Verifica se os membros existem e estão ativos
      const membro1 = await this.memberRepository.buscarPorId(dadosValidados.membro1Id);
      const membro2 = await this.memberRepository.buscarPorId(dadosValidados.membro2Id);

      if (!membro1 || !membro2) {
        throw new BusinessError(
          'Membro não encontrado',
          'Um ou ambos os membros não foram encontrados',
          404
        );
      }

      if (!membro1.ativo || !membro2.ativo) {
        throw new BusinessError(
          'Membro inativo',
          'Apenas membros ativos podem participar de reuniões',
          403
        );
      }

      return await this.repository.criar({
        membro1Id: dadosValidados.membro1Id,
        membro2Id: dadosValidados.membro2Id,
        dataReuniao: dadosValidados.dataReuniao,
        local: dadosValidados.local,
        observacoes: dadosValidados.observacoes,
        checkIns: [],
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      });
    } catch (error) {
      if (error instanceof BusinessError || error instanceof z.ZodError) {
        throw error;
      }
      console.error('Erro ao criar reunião:', error);
      throw new BusinessError(
        'Erro ao criar reunião',
        'Não foi possível criar a reunião',
        500
      );
    }
  }

  /**
   * Busca uma reunião por ID
   */
  async buscarReuniaoPorId(id: string): Promise<Meeting | null> {
    try {
      await this.initRepositories();

      if (!id || id.trim() === '') {
        throw new BusinessError('ID inválido', 'ID da reunião é obrigatório', 400);
      }

      return await this.repository.buscarPorId(id);
    } catch (error) {
      if (error instanceof BusinessError) {
        throw error;
      }
      console.error('Erro ao buscar reunião:', error);
      throw new BusinessError(
        'Erro ao buscar reunião',
        'Não foi possível buscar a reunião',
        500
      );
    }
  }

  /**
   * Lista reuniões com filtros opcionais
   */
  async listarReunioes(filtro?: MeetingFiltros): Promise<Meeting[]> {
    try {
      await this.initRepositories();
      return await this.repository.buscarTodas(filtro);
    } catch (error) {
      console.error('Erro ao listar reuniões:', error);
      throw new BusinessError(
        'Erro ao listar reuniões',
        'Não foi possível listar as reuniões',
        500
      );
    }
  }

  /**
   * Atualiza uma reunião
   */
  async atualizarReuniao(id: string, dto: AtualizarMeetingDTO): Promise<Meeting> {
    try {
      await this.initRepositories();

      if (!id || id.trim() === '') {
        throw new BusinessError('ID inválido', 'ID da reunião é obrigatório', 400);
      }

      // Valida os dados (apenas campos fornecidos)
      const dadosValidados = atualizarMeetingSchema.partial().parse(dto);

      // Verifica se a reunião existe
      const reuniaoExistente = await this.repository.buscarPorId(id);
      if (!reuniaoExistente) {
        throw new BusinessError('Reunião não encontrada', 'Reunião não encontrada', 404);
      }

      return await this.repository.atualizar(id, dadosValidados);
    } catch (error) {
      if (error instanceof BusinessError || error instanceof z.ZodError) {
        throw error;
      }
      console.error('Erro ao atualizar reunião:', error);
      throw new BusinessError(
        'Erro ao atualizar reunião',
        'Não foi possível atualizar a reunião',
        500
      );
    }
  }

  /**
   * Registra check-in em uma reunião
   */
  async registrarCheckIn(
    meetingId: string,
    membroId: string,
    presente: boolean
  ): Promise<Meeting> {
    try {
      await this.initRepositories();

      if (!meetingId || meetingId.trim() === '') {
        throw new BusinessError('ID inválido', 'ID da reunião é obrigatório', 400);
      }

      if (!membroId || membroId.trim() === '') {
        throw new BusinessError('ID inválido', 'ID do membro é obrigatório', 400);
      }

      // Busca a reunião
      const reuniao = await this.repository.buscarPorId(meetingId);
      if (!reuniao) {
        throw new BusinessError('Reunião não encontrada', 'Reunião não encontrada', 404);
      }

      // Verifica se o membro faz parte da reunião
      if (reuniao.membro1Id !== membroId && reuniao.membro2Id !== membroId) {
        throw new BusinessError(
          'Não autorizado',
          'Apenas membros da reunião podem fazer check-in',
          403
        );
      }

      // Valida check-in
      const checkInValidado = checkInSchema.parse({ membroId, presente });

      return await this.repository.registrarCheckIn(meetingId, {
        ...checkInValidado,
        dataCheckIn: new Date(),
      });
    } catch (error) {
      if (error instanceof BusinessError || error instanceof z.ZodError) {
        throw error;
      }
      console.error('Erro ao registrar check-in:', error);
      throw new BusinessError(
        'Erro ao registrar check-in',
        'Não foi possível registrar o check-in',
        500
      );
    }
  }
}

