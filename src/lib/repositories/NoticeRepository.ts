import { Db, ObjectId } from 'mongodb';
import { Notice, NoticeFiltros } from '@/types/notice';

/**
 * Repositório para operações com avisos no MongoDB
 * Responsabilidade única: Acesso a dados de avisos
 */
export class NoticeRepository {
  constructor(private db: Db) {}

  /**
   * Cria um novo aviso
   */
  async criar(notice: Omit<Notice, '_id'>): Promise<Notice> {
    try {
      const agora = new Date();
      const novoAviso: Omit<Notice, '_id'> = {
        ...notice,
        ativo: notice.ativo ?? true,
        criadoEm: agora,
        atualizadoEm: agora,
      };

      const result = await this.db.collection<Notice>('notices').insertOne(novoAviso as any);

      return {
        ...novoAviso,
        _id: result.insertedId.toString(),
      };
    } catch (error) {
      console.error('Erro ao criar aviso:', error);
      throw new Error('Não foi possível criar o aviso');
    }
  }

  /**
   * Busca todos os avisos com filtros opcionais
   */
  async buscarTodos(filtro?: NoticeFiltros): Promise<Notice[]> {
    try {
      const query: any = {};

      if (filtro?.tipo) {
        query.tipo = filtro.tipo;
      }

      if (filtro?.ativo !== undefined) {
        query.ativo = filtro.ativo;
      }

      const avisos = await this.db
        .collection<Notice>('notices')
        .find(query)
        .sort({ criadoEm: -1 })
        .toArray();

      return avisos.map((aviso) => ({
        ...aviso,
        _id: aviso._id?.toString(),
      }));
    } catch (error) {
      console.error('Erro ao buscar avisos:', error);
      throw new Error('Não foi possível buscar os avisos');
    }
  }

  /**
   * Busca apenas avisos ativos e públicos
   */
  async buscarAtivosPublicos(): Promise<Notice[]> {
    try {
      const avisos = await this.db
        .collection<Notice>('notices')
        .find({ ativo: true })
        .sort({ criadoEm: -1 })
        .toArray();

      return avisos.map((aviso) => ({
        ...aviso,
        _id: aviso._id?.toString(),
      }));
    } catch (error) {
      console.error('Erro ao buscar avisos públicos:', error);
      throw new Error('Não foi possível buscar os avisos públicos');
    }
  }

  /**
   * Busca um aviso por ID
   */
  async buscarPorId(id: string): Promise<Notice | null> {
    try {
      const aviso = await this.db
        .collection<Notice>('notices')
        .findOne({ _id: new ObjectId(id) as any });

      if (!aviso) return null;

      return {
        ...aviso,
        _id: aviso._id?.toString(),
      };
    } catch (error) {
      console.error('Erro ao buscar aviso:', error);
      throw new Error('Não foi possível buscar o aviso');
    }
  }

  /**
   * Atualiza um aviso
   */
  async atualizar(id: string, dados: Partial<Notice>): Promise<Notice> {
    try {
      const atualizacao: any = {
        ...dados,
        atualizadoEm: new Date(),
      };

      const result = await this.db.collection<Notice>('notices').findOneAndUpdate(
        { _id: new ObjectId(id) as any },
        { $set: atualizacao },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Aviso não encontrado');
      }

      return {
        ...result,
        _id: result._id?.toString(),
      };
    } catch (error) {
      console.error('Erro ao atualizar aviso:', error);
      throw new Error('Não foi possível atualizar o aviso');
    }
  }

  /**
   * Deleta um aviso
   */
  async deletar(id: string): Promise<void> {
    try {
      const result = await this.db.collection<Notice>('notices').deleteOne({
        _id: new ObjectId(id) as any,
      });

      if (result.deletedCount === 0) {
        throw new Error('Aviso não encontrado');
      }
    } catch (error) {
      console.error('Erro ao deletar aviso:', error);
      throw new Error('Não foi possível deletar o aviso');
    }
  }
}

