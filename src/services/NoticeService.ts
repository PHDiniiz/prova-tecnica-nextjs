import { getDatabase } from '@/lib/mongodb';
import { NoticeRepository } from '@/lib/repositories/NoticeRepository';
import {
  Notice,
  CriarNoticeDTO,
  AtualizarNoticeDTO,
  NoticeFiltros,
} from '@/types/notice';
import { BusinessError } from '@/lib/errors/BusinessError';
import { z } from 'zod';

/**
 * Schema de validação para criar aviso
 */
const criarNoticeSchema = z.object({
  titulo: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  conteudo: z
    .string()
    .min(10, 'Conteúdo deve ter pelo menos 10 caracteres')
    .max(2000, 'Conteúdo deve ter no máximo 2000 caracteres'),
  tipo: z.enum(['info', 'warning', 'success', 'urgent']),
  ativo: z.boolean().optional().default(true),
});

/**
 * Schema de validação para atualizar aviso
 */
const atualizarNoticeSchema = z.object({
  titulo: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .optional(),
  conteudo: z
    .string()
    .min(10, 'Conteúdo deve ter pelo menos 10 caracteres')
    .max(2000, 'Conteúdo deve ter no máximo 2000 caracteres')
    .optional(),
  tipo: z.enum(['info', 'warning', 'success', 'urgent']).optional(),
  ativo: z.boolean().optional(),
});

/**
 * Serviço de aplicação para gerenciar avisos
 * Responsabilidade única: Lógica de negócio para avisos
 */
export class NoticeService {
  private repository: NoticeRepository;

  constructor() {
    this.repository = {} as NoticeRepository;
  }

  /**
   * Inicializa o repositório com a conexão do banco
   */
  private async initRepository() {
    if (!this.repository || !('db' in this.repository)) {
      const db = await getDatabase();
      this.repository = new NoticeRepository(db);
    }
  }

  /**
   * Cria um novo aviso
   */
  async criarAviso(dto: CriarNoticeDTO): Promise<Notice> {
    try {
      await this.initRepository();

      // Valida os dados
      const dadosValidados = criarNoticeSchema.parse(dto);

      // Adiciona campos obrigatórios do Notice
      const agora = new Date();
      const noticeCompleto: Omit<Notice, '_id'> = {
        ...dadosValidados,
        ativo: dadosValidados.ativo ?? true,
        criadoEm: agora,
        atualizadoEm: agora,
      };

      return await this.repository.criar(noticeCompleto);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw error;
      }
      console.error('Erro ao criar aviso:', error);
      throw new BusinessError(
        'Erro ao criar aviso',
        'Não foi possível criar o aviso',
        500
      );
    }
  }

  /**
   * Lista avisos com filtros opcionais
   */
  async listarAvisos(filtro?: NoticeFiltros): Promise<Notice[]> {
    try {
      await this.initRepository();
      return await this.repository.buscarTodos(filtro);
    } catch (error) {
      console.error('Erro ao listar avisos:', error);
      throw new BusinessError(
        'Erro ao listar avisos',
        'Não foi possível listar os avisos',
        500
      );
    }
  }

  /**
   * Lista apenas avisos ativos e públicos
   */
  async listarAvisosPublicos(): Promise<Notice[]> {
    try {
      await this.initRepository();
      return await this.repository.buscarAtivosPublicos();
    } catch (error) {
      console.error('Erro ao listar avisos públicos:', error);
      throw new BusinessError(
        'Erro ao listar avisos públicos',
        'Não foi possível listar os avisos públicos',
        500
      );
    }
  }

  /**
   * Busca um aviso por ID
   */
  async buscarAvisoPorId(id: string): Promise<Notice | null> {
    try {
      await this.initRepository();

      if (!id || id.trim() === '') {
        throw new BusinessError('ID inválido', 'ID do aviso é obrigatório', 400);
      }

      return await this.repository.buscarPorId(id);
    } catch (error) {
      if (error instanceof BusinessError) {
        throw error;
      }
      console.error('Erro ao buscar aviso:', error);
      throw new BusinessError(
        'Erro ao buscar aviso',
        'Não foi possível buscar o aviso',
        500
      );
    }
  }

  /**
   * Atualiza um aviso
   */
  async atualizarAviso(id: string, dto: AtualizarNoticeDTO): Promise<Notice> {
    try {
      await this.initRepository();

      if (!id || id.trim() === '') {
        throw new BusinessError('ID inválido', 'ID do aviso é obrigatório', 400);
      }

      // Valida os dados (apenas campos fornecidos)
      const dadosValidados = atualizarNoticeSchema.partial().parse(dto);

      // Verifica se o aviso existe
      const avisoExistente = await this.repository.buscarPorId(id);
      if (!avisoExistente) {
        throw new BusinessError('Aviso não encontrado', 'Aviso não encontrado', 404);
      }

      return await this.repository.atualizar(id, dadosValidados);
    } catch (error) {
      if (error instanceof BusinessError || error instanceof z.ZodError) {
        throw error;
      }
      console.error('Erro ao atualizar aviso:', error);
      throw new BusinessError(
        'Erro ao atualizar aviso',
        'Não foi possível atualizar o aviso',
        500
      );
    }
  }

  /**
   * Deleta um aviso
   */
  async deletarAviso(id: string): Promise<void> {
    try {
      await this.initRepository();

      if (!id || id.trim() === '') {
        throw new BusinessError('ID inválido', 'ID do aviso é obrigatório', 400);
      }

      // Verifica se o aviso existe
      const avisoExistente = await this.repository.buscarPorId(id);
      if (!avisoExistente) {
        throw new BusinessError('Aviso não encontrado', 'Aviso não encontrado', 404);
      }

      await this.repository.deletar(id);
    } catch (error) {
      if (error instanceof BusinessError) {
        throw error;
      }
      console.error('Erro ao deletar aviso:', error);
      throw new BusinessError(
        'Erro ao deletar aviso',
        'Não foi possível deletar o aviso',
        500
      );
    }
  }
}

