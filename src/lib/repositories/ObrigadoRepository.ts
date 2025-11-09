import { Db, ObjectId } from 'mongodb';
import { Obrigado } from '@/types/obrigado';

/**
 * Repositório para operações com obrigados no MongoDB
 */
export class ObrigadoRepository {
  constructor(private db: Db) {}

  /**
   * Busca todos os obrigados públicos
   */
  async buscarTodosPublicos(filtro?: {
    membroIndicadorId?: string;
    membroIndicadoId?: string;
  }): Promise<Obrigado[]> {
    try {
      const query: any = { publico: true };
      
      if (filtro?.membroIndicadorId) {
        query.membroIndicadorId = new ObjectId(filtro.membroIndicadorId) as any;
      }
      
      if (filtro?.membroIndicadoId) {
        query.membroIndicadoId = new ObjectId(filtro.membroIndicadoId) as any;
      }

      const obrigados = await this.db
        .collection<Obrigado>('obrigados')
        .find(query)
        .sort({ criadoEm: -1 })
        .toArray();

      return obrigados.map((obrigado) => ({
        ...obrigado,
        _id: obrigado._id?.toString(),
        membroIndicadorId: obrigado.membroIndicadorId?.toString() || obrigado.membroIndicadorId,
        membroIndicadoId: obrigado.membroIndicadoId?.toString() || obrigado.membroIndicadoId,
      }));
    } catch (error) {
      console.error('Erro ao buscar obrigados:', error);
      throw new Error('Não foi possível buscar os obrigados');
    }
  }

  /**
   * Busca obrigados com paginação
   */
  async buscarComPaginacao(
    filtro?: {
      membroIndicadorId?: string;
      membroIndicadoId?: string;
    },
    pagina: number = 1,
    limite: number = 20
  ): Promise<{
    obrigados: Obrigado[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    try {
      const query: any = { publico: true };
      
      if (filtro?.membroIndicadorId) {
        query.membroIndicadorId = new ObjectId(filtro.membroIndicadorId) as any;
      }
      
      if (filtro?.membroIndicadoId) {
        query.membroIndicadoId = new ObjectId(filtro.membroIndicadoId) as any;
      }

      const skip = (pagina - 1) * limite;

      const [obrigados, total] = await Promise.all([
        this.db
          .collection<Obrigado>('obrigados')
          .find(query)
          .sort({ criadoEm: -1 })
          .skip(skip)
          .limit(limite)
          .toArray(),
        this.db.collection<Obrigado>('obrigados').countDocuments(query),
      ]);

      return {
        obrigados: obrigados.map((obrigado) => ({
          ...obrigado,
          _id: obrigado._id?.toString(),
          membroIndicadorId: obrigado.membroIndicadorId?.toString() || obrigado.membroIndicadorId,
          membroIndicadoId: obrigado.membroIndicadoId?.toString() || obrigado.membroIndicadoId,
        })),
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      };
    } catch (error) {
      console.error('Erro ao buscar obrigados com paginação:', error);
      throw new Error('Não foi possível buscar os obrigados');
    }
  }

  /**
   * Busca um obrigado por ID de indicação
   */
  async buscarPorIndicacaoId(indicacaoId: string): Promise<Obrigado | null> {
    try {
      const obrigado = await this.db
        .collection<Obrigado>('obrigados')
        .findOne({ indicacaoId: new ObjectId(indicacaoId) as any });

      if (!obrigado) return null;

      return {
        ...obrigado,
        _id: obrigado._id?.toString(),
        membroIndicadorId: obrigado.membroIndicadorId?.toString() || obrigado.membroIndicadorId,
        membroIndicadoId: obrigado.membroIndicadoId?.toString() || obrigado.membroIndicadoId,
      };
    } catch (error) {
      console.error('Erro ao buscar obrigado por indicação:', error);
      throw new Error('Não foi possível buscar o obrigado');
    }
  }

  /**
   * Cria um novo obrigado
   */
  async criar(obrigado: Omit<Obrigado, '_id'>): Promise<Obrigado> {
    try {
      const agora = new Date();
      const novoObrigado: any = {
        ...obrigado,
        indicacaoId: new ObjectId(obrigado.indicacaoId),
        membroIndicadorId: new ObjectId(obrigado.membroIndicadorId),
        membroIndicadoId: new ObjectId(obrigado.membroIndicadoId),
        criadoEm: agora,
      };

      const result = await this.db
        .collection<Obrigado>('obrigados')
        .insertOne(novoObrigado);

      return {
        ...obrigado,
        _id: result.insertedId.toString(),
        membroIndicadorId: obrigado.membroIndicadorId,
        membroIndicadoId: obrigado.membroIndicadoId,
      };
    } catch (error) {
      console.error('Erro ao criar obrigado:', error);
      throw new Error('Não foi possível criar o obrigado');
    }
  }
}

