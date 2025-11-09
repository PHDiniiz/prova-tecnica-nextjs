import { Db, ObjectId } from 'mongodb';
import { Intention, IntentionStatus } from '@/src/types/intention';

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

      return intencoes.map((intencao) => ({
        ...intencao,
        _id: intencao._id?.toString(),
      }));
    } catch (error) {
      console.error('Erro ao buscar intenções:', error);
      throw new Error('Não foi possível buscar as intenções');
    }
  }

  /**
   * Busca uma intenção por ID
   */
  async buscarPorId(id: string): Promise<Intention | null> {
    try {
      const intencao = await this.db
        .collection<Intention>('intentions')
        .findOne({ _id: new ObjectId(id) });

      if (!intencao) return null;

      return {
        ...intencao,
        _id: intencao._id?.toString(),
      };
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
      const result = await this.db
        .collection<Intention>('intentions')
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          {
            $set: {
              status,
              atualizadoEm: new Date(),
            },
          },
          { returnDocument: 'after' }
        );

      if (!result) return null;

      return {
        ...result,
        _id: result._id?.toString(),
      };
    } catch (error) {
      console.error('Erro ao atualizar status da intenção:', error);
      throw new Error('Não foi possível atualizar o status da intenção');
    }
  }
}

