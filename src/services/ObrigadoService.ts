import { getDatabase } from '@/lib/mongodb';
import { ObrigadoRepository } from '@/lib/repositories/ObrigadoRepository';
import { ReferralRepository } from '@/lib/repositories/ReferralRepository';
import { MemberRepository } from '@/lib/repositories/MemberRepository';
import { Obrigado, CriarObrigadoDTO } from '@/types/obrigado';
import { BusinessError } from '@/lib/errors/BusinessError';
import { z } from 'zod';
import { objectIdSchema, textoLongoSchema } from '@/lib/utils/validation';
import { withErrorHandling } from '@/lib/utils/errorHandler';

// Schema de validação para criar obrigado
const criarObrigadoSchema = z.object({
  indicacaoId: objectIdSchema,
  mensagem: textoLongoSchema(10, 500, 'Mensagem'),
  publico: z.boolean().optional().default(true),
});

/**
 * Serviço de aplicação para gerenciar obrigados (agradecimentos públicos)
 */
export class ObrigadoService {
  private repository: ObrigadoRepository;
  private referralRepository: ReferralRepository;
  private memberRepository: MemberRepository;

  constructor() {
    this.repository = {} as ObrigadoRepository;
    this.referralRepository = {} as ReferralRepository;
    this.memberRepository = {} as MemberRepository;
  }

  /**
   * Inicializa os repositórios com a conexão do banco
   */
  private async initRepositories() {
    if (!this.repository || !('db' in this.repository)) {
      const db = await getDatabase();
      this.repository = new ObrigadoRepository(db);
      this.referralRepository = new ReferralRepository(db);
      this.memberRepository = new MemberRepository(db);
    }
  }

  /**
   * Cria um novo obrigado (agradecimento público)
   */
  async criarObrigado(
    membroIndicadoId: string,
    dto: CriarObrigadoDTO
  ): Promise<Obrigado> {
    return withErrorHandling(
      async () => {
        await this.initRepositories();

        // Valida os dados
        const dadosValidados = criarObrigadoSchema.parse(dto);

        // Busca a indicação
        const indicacao = await this.referralRepository.buscarPorId(
          dadosValidados.indicacaoId
        );

        if (!indicacao) {
          throw new BusinessError(
            'Indicação não encontrada',
            'Indicação não encontrada',
            404
          );
        }

        // Verifica se a indicação está fechada
        if (indicacao.status !== 'fechada') {
          throw new BusinessError(
            'Indicação não fechada',
            'Apenas indicações com status "fechada" podem receber agradecimentos',
            400
          );
        }

        // Verifica se o membro autenticado é o destinatário
        if (indicacao.membroIndicadoId !== membroIndicadoId) {
          throw new BusinessError(
            'Não autorizado',
            'Apenas o membro que recebeu a indicação pode criar agradecimento',
            403
          );
        }

        // Verifica se já existe obrigado para esta indicação
        const obrigadoExistente = await this.repository.buscarPorIndicacaoId(
          dadosValidados.indicacaoId
        );

        if (obrigadoExistente) {
          throw new BusinessError(
            'Obrigado já existe',
            'Já existe um agradecimento para esta indicação',
            409
          );
        }

        // Valida se os membros existem e estão ativos
        const membroIndicador = await this.memberRepository.buscarPorId(
          indicacao.membroIndicadorId
        );
        const membroIndicado = await this.memberRepository.buscarPorId(
          indicacao.membroIndicadoId
        );

        if (!membroIndicador || !membroIndicado) {
          throw new BusinessError(
            'Membro não encontrado',
            'Um dos membros da indicação não foi encontrado',
            404
          );
        }

        if (!membroIndicador.ativo || !membroIndicado.ativo) {
          throw new BusinessError(
            'Membro inativo',
            'Apenas membros ativos podem criar agradecimentos',
            403
          );
        }

        // Cria o obrigado
        const obrigado: Omit<Obrigado, '_id'> = {
          indicacaoId: dadosValidados.indicacaoId,
          membroIndicadorId: indicacao.membroIndicadorId,
          membroIndicadoId: indicacao.membroIndicadoId,
          mensagem: dadosValidados.mensagem,
          publico: dadosValidados.publico ?? true,
          criadoEm: new Date(),
        };

        return await this.repository.criar(obrigado);
      },
      'Não foi possível criar o agradecimento',
      500
    );
  }

  /**
   * Busca todos os obrigados públicos
   */
  async buscarTodosPublicos(filtro?: {
    membroIndicadorId?: string;
    membroIndicadoId?: string;
  }): Promise<Obrigado[]> {
    return withErrorHandling(
      async () => {
        await this.initRepositories();
        return await this.repository.buscarTodosPublicos(filtro);
      },
      'Não foi possível buscar os agradecimentos',
      500
    );
  }

  /**
   * Busca obrigados públicos com paginação
   */
  async buscarComPaginacao(
    filtro?: {
      membroIndicadorId?: string;
      membroIndicadoId?: string;
    },
    pagina: number = 1,
    limite: number = 20
  ): Promise<{
    obrigados: Obrigado[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    return withErrorHandling(
      async () => {
        await this.initRepositories();
        return await this.repository.buscarComPaginacao(filtro, pagina, limite);
      },
      'Não foi possível buscar os agradecimentos',
      500
    );
  }

  /**
   * Busca um obrigado por ID de indicação
   */
  async buscarPorIndicacaoId(indicacaoId: string): Promise<Obrigado | null> {
    return withErrorHandling(
      async () => {
        await this.initRepositories();
        return await this.repository.buscarPorIndicacaoId(indicacaoId);
      },
      'Não foi possível buscar o agradecimento',
      500
    );
  }
}

