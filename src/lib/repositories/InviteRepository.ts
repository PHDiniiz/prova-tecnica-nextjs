import { Db, ObjectId } from 'mongodb';
import { Invite } from '@/src/types/invite';

/**
 * Repositório para operações com convites no MongoDB
 */
export class InviteRepository {
  constructor(private db: Db) {}

  /**
   * Busca um convite por token
   */
  async buscarPorToken(token: string): Promise<Invite | null> {
    try {
      const convite = await this.db
        .collection<Invite>('invites')
        .findOne({ token });

      if (!convite) return null;

      // Verifica se o convite expirou
      if (new Date() > convite.expiraEm) {
        return null;
      }

      return {
        ...convite,
        _id: convite._id?.toString(),
      };
    } catch (error) {
      console.error('Erro ao buscar convite:', error);
      throw new Error('Não foi possível buscar o convite');
    }
  }

  /**
   * Cria um novo convite
   */
  async criar(convite: Omit<Invite, '_id'>): Promise<Invite> {
    try {
      const agora = new Date();
      const novoConvite: Omit<Invite, '_id'> = {
        ...convite,
        criadoEm: agora,
      };

      const result = await this.db
        .collection<Invite>('invites')
        .insertOne(novoConvite as any);

      return {
        ...novoConvite,
        _id: result.insertedId.toString(),
      };
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      throw new Error('Não foi possível criar o convite');
    }
  }

  /**
   * Marca um convite como usado
   */
  async marcarComoUsado(token: string): Promise<void> {
    try {
      await this.db.collection<Invite>('invites').updateOne(
        { token },
        {
          $set: {
            usado: true,
          },
        }
      );
    } catch (error) {
      console.error('Erro ao marcar convite como usado:', error);
      throw new Error('Não foi possível marcar o convite como usado');
    }
  }
}

