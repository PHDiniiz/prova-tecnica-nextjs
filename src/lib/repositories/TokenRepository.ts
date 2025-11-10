import { Db } from 'mongodb';

/**
 * Interface para token na blacklist
 */
export interface BlacklistedToken {
  _id?: string;
  token: string;
  membroId: string;
  tipo: 'refresh' | 'access';
  expiraEm: Date;
  criadoEm: Date;
}

/**
 * Repository para gerenciar tokens na blacklist
 */
export class TokenRepository {
  private collectionName = 'blacklisted_tokens';

  constructor(private db: Db) {}

  /**
   * Adiciona um token à blacklist
   */
  async adicionarBlacklist(
    token: string,
    membroId: string,
    tipo: 'refresh' | 'access',
    expiraEm: Date
  ): Promise<void> {
    try {
      await this.db.collection<BlacklistedToken>(this.collectionName).insertOne({
        token,
        membroId,
        tipo,
        expiraEm,
        criadoEm: new Date(),
      });
    } catch (error) {
      console.error('Erro ao adicionar token à blacklist:', error);
      throw new Error('Não foi possível adicionar token à blacklist');
    }
  }

  /**
   * Verifica se um token está na blacklist
   */
  async estaNaBlacklist(token: string): Promise<boolean> {
    try {
      const blacklisted = await this.db
        .collection<BlacklistedToken>(this.collectionName)
        .findOne({ token });

      if (!blacklisted) return false;

      // Se o token expirou, remove da blacklist
      if (blacklisted.expiraEm < new Date()) {
        await this.removerBlacklist(token);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar blacklist:', error);
      return false;
    }
  }

  /**
   * Remove um token da blacklist
   */
  async removerBlacklist(token: string): Promise<void> {
    try {
      await this.db
        .collection<BlacklistedToken>(this.collectionName)
        .deleteOne({ token });
    } catch (error) {
      console.error('Erro ao remover token da blacklist:', error);
    }
  }

  /**
   * Limpa tokens expirados da blacklist
   */
  async limparExpirados(): Promise<number> {
    try {
      const result = await this.db
        .collection<BlacklistedToken>(this.collectionName)
        .deleteMany({ expiraEm: { $lt: new Date() } });

      return result.deletedCount || 0;
    } catch (error) {
      console.error('Erro ao limpar tokens expirados:', error);
      return 0;
    }
  }
}

