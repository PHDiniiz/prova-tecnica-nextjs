import { getDatabase } from '@/lib/mongodb';
import { ReferralRepository } from '@/lib/repositories/ReferralRepository';
import { MemberRepository } from '@/lib/repositories/MemberRepository';
import {
  Referral,
  CriarIndicacaoDTO,
  AtualizarStatusIndicacaoDTO,
  ReferralStatus,
} from '@/types/referral';
import { BusinessError } from '@/lib/errors/BusinessError';
import { z } from 'zod';

// Schema de validação para criar indicação
const criarIndicacaoSchema = z.object({
  membroIndicadoId: z.string().min(1, 'Membro indicado é obrigatório'),
  empresaContato: z.string().min(2, 'Empresa/Contato deve ter pelo menos 2 caracteres').max(100),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(1000),
  valorEstimado: z
    .number()
    .min(1000, 'Valor estimado deve ser no mínimo R$ 1.000')
    .max(10000000, 'Valor estimado deve ser no máximo R$ 10.000.000')
    .optional(),
});

/**
 * Serviço de aplicação para gerenciar indicações
 */
export class ReferralService {
  private repository: ReferralRepository;
  private memberRepository: MemberRepository;

  constructor() {
    this.repository = {} as ReferralRepository;
    this.memberRepository = {} as MemberRepository;
  }

  /**
   * Inicializa os repositórios com a conexão do banco
   */
  private async initRepositories() {
    if (!this.repository || !('db' in this.repository)) {
      const db = await getDatabase();
      this.repository = new ReferralRepository(db);
      this.memberRepository = new MemberRepository(db);
    }
  }

  /**
   * Valida transições de status permitidas
   */
  private validarTransicaoStatus(
    statusAtual: ReferralStatus,
    novoStatus: ReferralStatus
  ): void {
    const transicoesValidas: Record<ReferralStatus, ReferralStatus[]> = {
      nova: ['em-contato', 'recusada'],
      'em-contato': ['fechada', 'recusada'],
      fechada: [], // Status final, não pode mudar
      recusada: [], // Status final, não pode mudar
    };

    const statusPermitidos = transicoesValidas[statusAtual];
    if (!statusPermitidos || !statusPermitidos.includes(novoStatus)) {
      throw new BusinessError(
        'Transição de status inválida',
        `Não é possível alterar o status de "${statusAtual}" para "${novoStatus}"`,
        409
      );
    }
  }

  /**
   * Cria uma nova indicação
   */
  async criarIndicacao(
    membroIndicadorId: string,
    dto: CriarIndicacaoDTO
  ): Promise<Referral> {
    try {
      await this.initRepositories();

      // Valida os dados
      const dadosValidados = criarIndicacaoSchema.parse(dto);

      // Verifica se não está indicando para si mesmo
      if (membroIndicadorId === dadosValidados.membroIndicadoId) {
        throw new BusinessError(
          'Auto-indicação não permitida',
          'Você não pode indicar para si mesmo',
          400
        );
      }

      // Valida se o membro indicador está ativo
      const membroIndicador = await this.memberRepository.buscarPorId(membroIndicadorId);
      if (!membroIndicador) {
        throw new BusinessError('Membro não encontrado', 'Membro indicador não encontrado', 404);
      }
      if (!membroIndicador.ativo) {
        throw new BusinessError(
          'Membro inativo',
          'Apenas membros ativos podem criar indicações',
          403
        );
      }

      // Valida se o membro indicado está ativo
      const membroIndicado = await this.memberRepository.buscarPorId(
        dadosValidados.membroIndicadoId
      );
      if (!membroIndicado) {
        throw new BusinessError(
          'Membro não encontrado',
          'Membro indicado não encontrado',
          404
        );
      }
      if (!membroIndicado.ativo) {
        throw new BusinessError(
          'Membro inativo',
          'Apenas membros ativos podem receber indicações',
          403
        );
      }

      // Cria a indicação com status nova
      const indicacao: Omit<Referral, '_id'> = {
        membroIndicadorId,
        membroIndicadoId: dadosValidados.membroIndicadoId,
        empresaContato: dadosValidados.empresaContato,
        descricao: dadosValidados.descricao,
        valorEstimado: dadosValidados.valorEstimado,
        status: 'nova',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      return await this.repository.criar(indicacao);
    } catch (error) {
      if (error instanceof BusinessError || error instanceof z.ZodError) {
        throw error;
      }
      console.error('Erro ao criar indicação:', error);
      throw new BusinessError(
        'Erro ao criar indicação',
        'Não foi possível criar a indicação',
        500
      );
    }
  }

  /**
   * Busca todas as indicações
   */
  async buscarTodasIndicacoes(filtro?: {
    membroIndicadorId?: string;
    membroIndicadoId?: string;
    status?: ReferralStatus;
  }): Promise<Referral[]> {
    try {
      await this.initRepositories();
      return await this.repository.buscarTodas(filtro);
    } catch (error) {
      console.error('Erro ao buscar indicações:', error);
      throw new BusinessError(
        'Erro ao buscar indicações',
        'Não foi possível buscar as indicações',
        500
      );
    }
  }

  /**
   * Busca uma indicação por ID
   */
  async buscarIndicacaoPorId(id: string): Promise<Referral | null> {
    try {
      await this.initRepositories();
      return await this.repository.buscarPorId(id);
    } catch (error) {
      console.error('Erro ao buscar indicação:', error);
      throw new BusinessError(
        'Erro ao buscar indicação',
        'Não foi possível buscar a indicação',
        500
      );
    }
  }

  /**
   * Atualiza o status de uma indicação
   */
  async atualizarStatusIndicacao(
    id: string,
    dto: AtualizarStatusIndicacaoDTO
  ): Promise<Referral | null> {
    try {
      await this.initRepositories();

      // Valida o status
      const statusValido = ['nova', 'em-contato', 'fechada', 'recusada'].includes(
        dto.status
      );
      if (!statusValido) {
        throw new BusinessError('Status inválido', `Status "${dto.status}" não é válido`, 400);
      }

      // Busca a indicação atual
      const indicacaoAtual = await this.repository.buscarPorId(id);
      if (!indicacaoAtual) {
        throw new BusinessError('Indicação não encontrada', 'Indicação não encontrada', 404);
      }

      // Valida transição de status
      this.validarTransicaoStatus(indicacaoAtual.status, dto.status);

      // Atualiza o status e observações se fornecidas
      const indicacaoAtualizada = await this.repository.atualizarStatus(
        id,
        dto.status,
        dto.observacoes
      );

      return indicacaoAtualizada;
    } catch (error) {
      if (error instanceof BusinessError) {
        throw error;
      }
      console.error('Erro ao atualizar status da indicação:', error);
      throw new BusinessError(
        'Erro ao atualizar status',
        'Não foi possível atualizar o status da indicação',
        500
      );
    }
  }
}

