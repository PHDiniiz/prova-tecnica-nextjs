import { Db, ObjectId, Filter } from 'mongodb';
import { Referral, ReferralStatus } from '@/types/referral';

/**
 * Repositório para operações com indicações no MongoDB
 */
export class ReferralRepository {
  constructor(private db: Db) {}

  /**
   * Busca todas as indicações
   */
  async buscarTodas(filtro?: {
    membroIndicadorId?: string;
    membroIndicadoId?: string;
    status?: ReferralStatus;
    search?: string;
  }): Promise<Referral[]> {
    try {
      const query: Filter<Referral> = {};
      if (filtro?.membroIndicadorId) {
        query.membroIndicadorId = new ObjectId(filtro.membroIndicadorId) as unknown as string;
      }
      if (filtro?.membroIndicadoId) {
        query.membroIndicadoId = new ObjectId(filtro.membroIndicadoId) as unknown as string;
      }
      if (filtro?.status) {
        query.status = filtro.status;
      }
      if (filtro?.search) {
        // Busca case-insensitive em empresaContato e descricao
        query.$or = [
          { empresaContato: { $regex: filtro.search, $options: 'i' } },
          { descricao: { $regex: filtro.search, $options: 'i' } },
        ];
      }

      const indicacoes = await this.db
        .collection<Referral>('referrals')
        .find(query)
        .sort({ criadoEm: -1 })
        .toArray();

      return indicacoes.map((indicacao) => ({
        ...indicacao,
        _id: indicacao._id?.toString(),
        membroIndicadorId: indicacao.membroIndicadorId?.toString() || indicacao.membroIndicadorId,
        membroIndicadoId: indicacao.membroIndicadoId?.toString() || indicacao.membroIndicadoId,
      }));
    } catch (error) {
      console.error('Erro ao buscar indicações:', error);
      throw new Error('Não foi possível buscar as indicações');
    }
  }

  /**
   * Busca uma indicação por ID
   */
  async buscarPorId(id: string): Promise<Referral | null> {
    try {
      const indicacao = await this.db
        .collection<Referral>('referrals')
        .findOne({ _id: new ObjectId(id) as unknown as string });

      if (!indicacao) return null;

      return {
        ...indicacao,
        _id: indicacao._id?.toString(),
        membroIndicadorId: indicacao.membroIndicadorId?.toString() || indicacao.membroIndicadorId,
        membroIndicadoId: indicacao.membroIndicadoId?.toString() || indicacao.membroIndicadoId,
      };
    } catch (error) {
      console.error('Erro ao buscar indicação:', error);
      throw new Error('Não foi possível buscar a indicação');
    }
  }

  /**
   * Cria uma nova indicação
   */
  async criar(indicacao: Omit<Referral, '_id'>): Promise<Referral> {
    try {
      const agora = new Date();
      const novaIndicacao = {
        ...indicacao,
        membroIndicadorId: new ObjectId(indicacao.membroIndicadorId),
        membroIndicadoId: new ObjectId(indicacao.membroIndicadoId),
        criadoEm: agora,
        atualizadoEm: agora,
      };

      const result = await this.db
        .collection('referrals')
        .insertOne(novaIndicacao as any);

      return {
        ...indicacao,
        _id: result.insertedId.toString(),
        membroIndicadorId: indicacao.membroIndicadorId,
        membroIndicadoId: indicacao.membroIndicadoId,
      };
    } catch (error) {
      console.error('Erro ao criar indicação:', error);
      throw new Error('Não foi possível criar a indicação');
    }
  }

  /**
   * Atualiza o status de uma indicação
   */
  async atualizarStatus(
    id: string,
    status: ReferralStatus,
    observacoes?: string
  ): Promise<Referral | null> {
    try {
      const updateData: Partial<Referral> & { atualizadoEm: Date } = {
        status,
        atualizadoEm: new Date(),
      };

      if (observacoes !== undefined) {
        updateData.observacoes = observacoes;
      }

      const result = await this.db
        .collection<Referral>('referrals')
        .findOneAndUpdate(
          { _id: new ObjectId(id) as unknown as string },
          {
            $set: updateData,
          },
          { returnDocument: 'after' }
        );

      if (!result) return null;

      return {
        ...result,
        _id: result._id?.toString(),
        membroIndicadorId: result.membroIndicadorId?.toString() || result.membroIndicadorId,
        membroIndicadoId: result.membroIndicadoId?.toString() || result.membroIndicadoId,
      };
    } catch (error) {
      console.error('Erro ao atualizar status da indicação:', error);
      throw new Error('Não foi possível atualizar o status da indicação');
    }
  }
}

