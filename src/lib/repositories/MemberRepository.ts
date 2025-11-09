import { Db, ObjectId } from 'mongodb';
import { Member } from '@/types/member';

/**
 * Repositório para operações com membros no MongoDB
 */
export class MemberRepository {
  constructor(private db: Db) {}

  /**
   * Busca todos os membros
   */
  async buscarTodos(): Promise<Member[]> {
    try {
      const membros = await this.db
        .collection<Member>('members')
        .find({})
        .sort({ criadoEm: -1 })
        .toArray();

      return membros.map((membro) => ({
        ...membro,
        _id: membro._id?.toString(),
      }));
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      throw new Error('Não foi possível buscar os membros');
    }
  }

  /**
   * Busca um membro por ID
   */
  async buscarPorId(id: string): Promise<Member | null> {
    try {
      const membro = await this.db
        .collection<Member>('members')
        .findOne({ _id: new ObjectId(id) });

      if (!membro) return null;

      return {
        ...membro,
        _id: membro._id?.toString(),
      };
    } catch (error) {
      console.error('Erro ao buscar membro:', error);
      throw new Error('Não foi possível buscar o membro');
    }
  }

  /**
   * Busca um membro por email
   */
  async buscarPorEmail(email: string): Promise<Member | null> {
    try {
      const membro = await this.db
        .collection<Member>('members')
        .findOne({ email });

      if (!membro) return null;

      return {
        ...membro,
        _id: membro._id?.toString(),
      };
    } catch (error) {
      console.error('Erro ao buscar membro por email:', error);
      throw new Error('Não foi possível buscar o membro');
    }
  }

  /**
   * Busca membros ativos
   */
  async buscarAtivos(): Promise<Member[]> {
    try {
      const membros = await this.db
        .collection<Member>('members')
        .find({ ativo: true })
        .sort({ criadoEm: -1 })
        .toArray();

      return membros.map((membro) => ({
        ...membro,
        _id: membro._id?.toString(),
      }));
    } catch (error) {
      console.error('Erro ao buscar membros ativos:', error);
      throw new Error('Não foi possível buscar os membros ativos');
    }
  }

  /**
   * Cria um novo membro
   */
  async criar(membro: Omit<Member, '_id'>): Promise<Member> {
    try {
      const agora = new Date();
      const novoMembro: Omit<Member, '_id'> = {
        ...membro,
        criadoEm: agora,
        atualizadoEm: agora,
      };

      const result = await this.db
        .collection<Member>('members')
        .insertOne(novoMembro as any);

      return {
        ...novoMembro,
        _id: result.insertedId.toString(),
      };
    } catch (error) {
      console.error('Erro ao criar membro:', error);
      throw new Error('Não foi possível criar o membro');
    }
  }
}

