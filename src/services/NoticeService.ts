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
import { stringMinMaxSchema, textoLongoSchema } from '@/lib/utils/validation';
import { withErrorHandling } from '@/lib/utils/errorHandler';

/**
 * Schema de validação para criar aviso
 */
const criarNoticeSchema = z.object({
  titulo: stringMinMaxSchema(3, 200, 'Título'),
  conteudo: textoLongoSchema(10, 2000, 'Conteúdo'),
  tipo: z.enum(['info', 'warning', 'success', 'urgent']),
  ativo: z.boolean().optional().default(true),
});

/**
 * Schema de validação para atualizar aviso
 */
const atualizarNoticeSchema = z.object({
  titulo: stringMinMaxSchema(3, 200, 'Título').optional(),
  conteudo: textoLongoSchema(10, 2000, 'Conteúdo').optional(),
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
    return withErrorHandling(
      async () => {
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
      },
      'Não foi possível criar o aviso',
      500
    );
  }

  /**
   * Lista avisos com filtros opcionais
   */
  async listarAvisos(filtro?: NoticeFiltros): Promise<Notice[]> {
    return withErrorHandling(
      async () => {
        await this.initRepository();
        return await this.repository.buscarTodos(filtro);
      },
      'Não foi possível listar os avisos',
      500
    );
  }

  /**
   * Lista apenas avisos ativos e públicos
   */
  async listarAvisosPublicos(): Promise<Notice[]> {
    return withErrorHandling(
      async () => {
        await this.initRepository();
        return await this.repository.buscarAtivosPublicos();
      },
      'Não foi possível listar os avisos públicos',
      500
    );
  }

  /**
   * Busca um aviso por ID
   */
  async buscarAvisoPorId(id: string): Promise<Notice | null> {
    return withErrorHandling(
      async () => {
        await this.initRepository();

        if (!id || id.trim() === '') {
          throw new BusinessError('ID inválido', 'ID do aviso é obrigatório', 400);
        }

        return await this.repository.buscarPorId(id);
      },
      'Não foi possível buscar o aviso',
      500
    );
  }

  /**
   * Atualiza um aviso
   */
  async atualizarAviso(id: string, dto: AtualizarNoticeDTO): Promise<Notice> {
    return withErrorHandling(
      async () => {
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
      },
      'Não foi possível atualizar o aviso',
      500
    );
  }

  /**
   * Deleta um aviso
   */
  async deletarAviso(id: string): Promise<void> {
    return withErrorHandling(
      async () => {
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
      },
      'Não foi possível deletar o aviso',
      500
    );
  }
}

