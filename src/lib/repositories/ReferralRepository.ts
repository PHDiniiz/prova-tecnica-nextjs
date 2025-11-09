import { Db, ObjectId } from 'mongodb';
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
  }): Promise<Referral[]> {
    try {
      const query: any = {};
      if (filtro?.membroIndicadorId) {
        query.membroIndicadorId = filtro.membroIndicadorId;
      }
      if (filtro?.membroIndicadoId) {
        query.membroIndicadoId = filtro.membroIndicadoId;
      }
      if (filtro?.status) {
        query.status = filtro.status;
      }

      const indicacoes = await this.db
        .collection<Referral>('referrals')
        .find(query)
        .sort({ criadoEm: -1 })
        .toArray();

      return indicacoes.map((indicacao) => ({
        ...indicacao,
        _id: indicacao._id?.toString(),
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
        .findOne({ _id: new ObjectId(id) as any });

      if (!indicacao) return null;

      return {
        ...indicacao,
        _id: indicacao._id?.toString(),
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
      const novaIndicacao: Omit<Referral, '_id'> = {
        ...indicacao,
        criadoEm: agora,
        atualizadoEm: agora,
      };

      const result = await this.db
        .collection<Referral>('referrals')
        .insertOne(novaIndicacao as any);

      return {
        ...novaIndicacao,
        _id: result.insertedId.toString(),
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
      const updateData: any = {
        status,
        atualizadoEm: new Date(),
      };

      if (observacoes !== undefined) {
        updateData.observacoes = observacoes;
      }

      const result = await this.db
        .collection<Referral>('referrals')
        .findOneAndUpdate(
          { _id: new ObjectId(id) as any },
          {
            $set: updateData,
          },
          { returnDocument: 'after' }
        );

      if (!result) return null;

      return {
        ...result,
        _id: result._id?.toString(),
      };
    } catch (error) {
      console.error('Erro ao atualizar status da indicação:', error);
      throw new Error('Não foi possível atualizar o status da indicação');
    }
  }
}

