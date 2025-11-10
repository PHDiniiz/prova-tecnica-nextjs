import { Db, ObjectId } from 'mongodb';
import { Intention, IntentionStatus } from '@/types/intention';
import {
  convertObjectIdToString,
  convertObjectIdsToString,
  toObjectId,
} from '@/lib/utils/mongodb-helpers';
import {
  calculatePaginationOffset,
  createPaginationResponse,
} from '@/lib/utils/pagination';

/**
 * Repositório para operações com intenções no MongoDB
 */
export class IntentionRepository {
  constructor(private db: Db) {}

  /**
   * Busca todas as intenções
   */
  async buscarTodas(filtro?: { status?: IntentionStatus }): Promise<Intention[]> {
    try {
      const query = filtro?.status ? { status: filtro.status } : {};
      const intencoes = await this.db
        .collection<Intention>('intentions')
        .find(query)
        .sort({ criadoEm: -1 })
        .toArray();

      return convertObjectIdsToString(intencoes);
    } catch (error) {
      console.error('Erro ao buscar intenções:', error);
      throw new Error('Não foi possível buscar as intenções');
    }
  }

  /**
   * Busca intenções com paginação
   */
  async buscarComPaginacao(
    filtro?: { status?: IntentionStatus },
    pagina: number = 1,
    limite: number = 20
  ): Promise<{
    intencoes: Intention[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    try {
      const query = filtro?.status ? { status: filtro.status } : {};
      const skip = calculatePaginationOffset(pagina, limite);

      const [intencoes, total] = await Promise.all([
        this.db
          .collection<Intention>('intentions')
          .find(query)
          .sort({ criadoEm: -1 })
          .skip(skip)
          .limit(limite)
          .toArray(),
        this.db.collection<Intention>('intentions').countDocuments(query),
      ]);

      const convertedIntencoes = convertObjectIdsToString(intencoes);
      const paginationResponse = createPaginationResponse(
        convertedIntencoes,
        total,
        pagina,
        limite
      );

      return {
        intencoes: paginationResponse.data,
        total: paginationResponse.total,
        pagina: paginationResponse.page,
        limite: paginationResponse.limit,
        totalPaginas: paginationResponse.totalPages,
      };
    } catch (error) {
      console.error('Erro ao buscar intenções com paginação:', error);
      throw new Error('Não foi possível buscar as intenções');
    }
  }

  /**
   * Busca uma intenção por ID
   */
  async buscarPorId(id: string): Promise<Intention | null> {
    try {
      const objectId = toObjectId(id, 'ID da intenção');
      const intencao = await this.db
        .collection<Intention>('intentions')
        .findOne({ _id: objectId as any });

      if (!intencao) return null;

      return convertObjectIdToString(intencao);
    } catch (error) {
      console.error('Erro ao buscar intenção:', error);
      throw new Error('Não foi possível buscar a intenção');
    }
  }

  /**
   * Cria uma nova intenção
   */
  async criar(intencao: Omit<Intention, '_id'>): Promise<Intention> {
    try {
      const agora = new Date();
      const novaIntencao: Omit<Intention, '_id'> = {
        ...intencao,
        criadoEm: agora,
        atualizadoEm: agora,
      };

      const result = await this.db
        .collection<Intention>('intentions')
        .insertOne(novaIntencao as any);

      return {
        ...novaIntencao,
        _id: result.insertedId.toString(),
      };
    } catch (error) {
      console.error('Erro ao criar intenção:', error);
      throw new Error('Não foi possível criar a intenção');
    }
  }

  /**
   * Atualiza o status de uma intenção
   */
  async atualizarStatus(
    id: string,
    status: IntentionStatus
  ): Promise<Intention | null> {
    try {
      const objectId = toObjectId(id, 'ID da intenção');
      const result = await this.db
        .collection<Intention>('intentions')
        .findOneAndUpdate(
          { _id: objectId as any },
          {
            $set: {
              status,
              atualizadoEm: new Date(),
            },
          },
          { returnDocument: 'after' }
        );

      if (!result) return null;

      return convertObjectIdToString(result);
    } catch (error) {
      console.error('Erro ao atualizar status da intenção:', error);
      throw new Error('Não foi possível atualizar o status da intenção');
    }
  }
}

