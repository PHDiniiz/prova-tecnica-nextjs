import { getDatabase } from '@/lib/mongodb';
import { IntentionRepository } from '@/lib/repositories/IntentionRepository';
import {
  Intention,
  CriarIntencaoDTO,
  AtualizarStatusIntencaoDTO,
  IntentionStatus,
} from '@/src/types/intention';
import { z } from 'zod';

// Schema de validação para criar intenção
const criarIntencaoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  empresa: z.string().min(2, 'Empresa deve ter pelo menos 2 caracteres'),
  motivo: z.string().min(10, 'Motivo deve ter pelo menos 10 caracteres'),
});

/**
 * Serviço de aplicação para gerenciar intenções
 */
export class IntentionService {
  private repository: IntentionRepository;

  constructor() {
    // Inicializa o repositório de forma assíncrona quando necessário
    this.repository = {} as IntentionRepository;
  }

  /**
   * Inicializa o repositório com a conexão do banco
   */
  private async initRepository() {
    if (!this.repository || !('db' in this.repository)) {
      const db = await getDatabase();
      this.repository = new IntentionRepository(db);
    }
  }

  /**
   * Cria uma nova intenção
   */
  async criarIntencao(dto: CriarIntencaoDTO): Promise<Intention> {
    await this.initRepository();

    // Valida os dados
    const dadosValidados = criarIntencaoSchema.parse(dto);

    // Cria a intenção com status pending
    const intencao: Omit<Intention, '_id'> = {
      ...dadosValidados,
      status: 'pending',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    return await this.repository.criar(intencao);
  }

  /**
   * Busca todas as intenções
   */
  async buscarTodasIntencoes(
    filtro?: { status?: IntentionStatus }
  ): Promise<Intention[]> {
    await this.initRepository();
    return await this.repository.buscarTodas(filtro);
  }

  /**
   * Busca uma intenção por ID
   */
  async buscarIntencaoPorId(id: string): Promise<Intention | null> {
    await this.initRepository();
    return await this.repository.buscarPorId(id);
  }

  /**
   * Atualiza o status de uma intenção
   */
  async atualizarStatusIntencao(
    id: string,
    dto: AtualizarStatusIntencaoDTO
  ): Promise<Intention | null> {
    await this.initRepository();

    // Valida o status
    const statusValido = ['pending', 'approved', 'rejected'].includes(
      dto.status
    );
    if (!statusValido) {
      throw new Error('Status inválido');
    }

    return await this.repository.atualizarStatus(id, dto.status);
  }
}

