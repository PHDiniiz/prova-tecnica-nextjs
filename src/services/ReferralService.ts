import { getDatabase } from '@/lib/mongodb';
import { ReferralRepository } from '@/lib/repositories/ReferralRepository';
import {
  Referral,
  CriarIndicacaoDTO,
  AtualizarStatusIndicacaoDTO,
  ReferralStatus,
} from '@/types/referral';
import { z } from 'zod';

// Schema de validação para criar indicação
const criarIndicacaoSchema = z.object({
  membroIndicadoId: z.string().min(1, 'Membro indicado é obrigatório'),
  empresaContato: z.string().min(2, 'Empresa/Contato deve ter pelo menos 2 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
});

/**
 * Serviço de aplicação para gerenciar indicações
 */
export class ReferralService {
  private repository: ReferralRepository;

  constructor() {
    this.repository = {} as ReferralRepository;
  }

  /**
   * Inicializa o repositório com a conexão do banco
   */
  private async initRepository() {
    if (!this.repository || !('db' in this.repository)) {
      const db = await getDatabase();
      this.repository = new ReferralRepository(db);
    }
  }

  /**
   * Cria uma nova indicação
   */
  async criarIndicacao(
    membroIndicadorId: string,
    dto: CriarIndicacaoDTO
  ): Promise<Referral> {
    await this.initRepository();

    // Valida os dados
    const dadosValidados = criarIndicacaoSchema.parse(dto);

    // Verifica se não está indicando para si mesmo
    if (membroIndicadorId === dadosValidados.membroIndicadoId) {
      throw new Error('Você não pode indicar para si mesmo');
    }

    // Cria a indicação com status nova
    const indicacao: Omit<Referral, '_id'> = {
      membroIndicadorId,
      membroIndicadoId: dadosValidados.membroIndicadoId,
      empresaContato: dadosValidados.empresaContato,
      descricao: dadosValidados.descricao,
      status: 'nova',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    return await this.repository.criar(indicacao);
  }

  /**
   * Busca todas as indicações
   */
  async buscarTodasIndicacoes(filtro?: {
    membroIndicadorId?: string;
    membroIndicadoId?: string;
    status?: ReferralStatus;
  }): Promise<Referral[]> {
    await this.initRepository();
    return await this.repository.buscarTodas(filtro);
  }

  /**
   * Busca uma indicação por ID
   */
  async buscarIndicacaoPorId(id: string): Promise<Referral | null> {
    await this.initRepository();
    return await this.repository.buscarPorId(id);
  }

  /**
   * Atualiza o status de uma indicação
   */
  async atualizarStatusIndicacao(
    id: string,
    dto: AtualizarStatusIndicacaoDTO
  ): Promise<Referral | null> {
    await this.initRepository();

    // Valida o status
    const statusValido = ['nova', 'em-contato', 'fechada', 'recusada'].includes(
      dto.status
    );
    if (!statusValido) {
      throw new Error('Status inválido');
    }

    return await this.repository.atualizarStatus(id, dto.status);
  }
}

