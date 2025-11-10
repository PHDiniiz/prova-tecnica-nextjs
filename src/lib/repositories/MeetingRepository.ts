import { Db, ObjectId } from 'mongodb';
import { Meeting, CheckIn, MeetingFiltros } from '@/types/meeting';

/**
 * Repositório para operações com reuniões no MongoDB
 * Responsabilidade única: Acesso a dados de reuniões
 */
export class MeetingRepository {
  constructor(private db: Db) {}

  /**
   * Cria uma nova reunião
   */
  async criar(meeting: Omit<Meeting, '_id'>): Promise<Meeting> {
    try {
      const agora = new Date();
      const novaReuniao: Omit<Meeting, '_id'> = {
        ...meeting,
        checkIns: meeting.checkIns || [],
        criadoEm: agora,
        atualizadoEm: agora,
      };

      const result = await this.db.collection<Meeting>('meetings').insertOne(novaReuniao as any);

      return {
        ...novaReuniao,
        _id: result.insertedId.toString(),
      };
    } catch (error) {
      console.error('Erro ao criar reunião:', error);
      throw new Error('Não foi possível criar a reunião');
    }
  }

  /**
   * Busca uma reunião por ID
   */
  async buscarPorId(id: string): Promise<Meeting | null> {
    try {
      const reuniao = await this.db
        .collection<Meeting>('meetings')
        .findOne({ _id: new ObjectId(id) as any });

      if (!reuniao) return null;

      return {
        ...reuniao,
        _id: reuniao._id?.toString(),
        membro1Id: reuniao.membro1Id?.toString() || reuniao.membro1Id,
        membro2Id: reuniao.membro2Id?.toString() || reuniao.membro2Id,
        checkIns: reuniao.checkIns?.map((ci) => ({
          ...ci,
          membroId: ci.membroId?.toString() || ci.membroId,
        })) || [],
      };
    } catch (error) {
      console.error('Erro ao buscar reunião:', error);
      throw new Error('Não foi possível buscar a reunião');
    }
  }

  /**
   * Busca reuniões por membro
   */
  async buscarPorMembro(membroId: string): Promise<Meeting[]> {
    try {
      const membroObjectId = new ObjectId(membroId) as any;

      const reunioes = await this.db
        .collection<Meeting>('meetings')
        .find({
          $or: [{ membro1Id: membroObjectId }, { membro2Id: membroObjectId }],
        })
        .sort({ dataReuniao: -1 })
        .toArray();

      return reunioes.map((reuniao) => ({
        ...reuniao,
        _id: reuniao._id?.toString(),
        membro1Id: reuniao.membro1Id?.toString() || reuniao.membro1Id,
        membro2Id: reuniao.membro2Id?.toString() || reuniao.membro2Id,
        checkIns: reuniao.checkIns?.map((ci) => ({
          ...ci,
          membroId: ci.membroId?.toString() || ci.membroId,
        })) || [],
      }));
    } catch (error) {
      console.error('Erro ao buscar reuniões por membro:', error);
      throw new Error('Não foi possível buscar as reuniões');
    }
  }

  /**
   * Busca todas as reuniões com filtros opcionais
   */
  async buscarTodas(filtro?: MeetingFiltros): Promise<Meeting[]> {
    try {
      const query: any = {};

      if (filtro?.membroId) {
        const membroObjectId = new ObjectId(filtro.membroId) as any;
        query.$or = [{ membro1Id: membroObjectId }, { membro2Id: membroObjectId }];
      }

      if (filtro?.dataInicio || filtro?.dataFim) {
        query.dataReuniao = {};
        if (filtro.dataInicio) {
          query.dataReuniao.$gte = new Date(filtro.dataInicio);
        }
        if (filtro.dataFim) {
          query.dataReuniao.$lte = new Date(filtro.dataFim);
        }
      }

      const reunioes = await this.db
        .collection<Meeting>('meetings')
        .find(query)
        .sort({ dataReuniao: -1 })
        .toArray();

      return reunioes.map((reuniao) => ({
        ...reuniao,
        _id: reuniao._id?.toString(),
        membro1Id: reuniao.membro1Id?.toString() || reuniao.membro1Id,
        membro2Id: reuniao.membro2Id?.toString() || reuniao.membro2Id,
        checkIns: reuniao.checkIns?.map((ci) => ({
          ...ci,
          membroId: ci.membroId?.toString() || ci.membroId,
        })) || [],
      }));
    } catch (error) {
      console.error('Erro ao buscar reuniões:', error);
      throw new Error('Não foi possível buscar as reuniões');
    }
  }

  /**
   * Atualiza uma reunião
   */
  async atualizar(id: string, dados: Partial<Meeting>): Promise<Meeting> {
    try {
      const atualizacao: any = {
        ...dados,
        atualizadoEm: new Date(),
      };

      // Converter dataReuniao se fornecida
      if (atualizacao.dataReuniao) {
        atualizacao.dataReuniao = new Date(atualizacao.dataReuniao);
      }

      const result = await this.db.collection<Meeting>('meetings').findOneAndUpdate(
        { _id: new ObjectId(id) as any },
        { $set: atualizacao },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Reunião não encontrada');
      }

      return {
        ...result,
        _id: result._id?.toString(),
        membro1Id: result.membro1Id?.toString() || result.membro1Id,
        membro2Id: result.membro2Id?.toString() || result.membro2Id,
        checkIns: result.checkIns?.map((ci) => ({
          ...ci,
          membroId: ci.membroId?.toString() || ci.membroId,
        })) || [],
      };
    } catch (error) {
      console.error('Erro ao atualizar reunião:', error);
      throw new Error('Não foi possível atualizar a reunião');
    }
  }

  /**
   * Registra um check-in em uma reunião
   */
  async registrarCheckIn(meetingId: string, checkIn: CheckIn): Promise<Meeting> {
    try {
      // Busca a reunião atual
      const reuniao = await this.buscarPorId(meetingId);
      if (!reuniao) {
        throw new Error('Reunião não encontrada');
      }

      // Remove check-in existente do mesmo membro (se houver)
      const checkInsAtualizados = [
        ...(reuniao.checkIns || []).filter((ci) => ci.membroId !== checkIn.membroId),
        {
          ...checkIn,
          dataCheckIn: new Date(),
        },
      ];

      const result = await this.db.collection<Meeting>('meetings').findOneAndUpdate(
        { _id: new ObjectId(meetingId) as any },
        {
          $set: {
            checkIns: checkInsAtualizados,
            atualizadoEm: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Reunião não encontrada');
      }

      return {
        ...result,
        _id: result._id?.toString(),
        membro1Id: result.membro1Id?.toString() || result.membro1Id,
        membro2Id: result.membro2Id?.toString() || result.membro2Id,
        checkIns: result.checkIns?.map((ci) => ({
          ...ci,
          membroId: ci.membroId?.toString() || ci.membroId,
        })) || [],
      };
    } catch (error) {
      console.error('Erro ao registrar check-in:', error);
      throw new Error('Não foi possível registrar o check-in');
    }
  }

  /**
   * Busca check-ins de uma reunião
   */
  async buscarCheckIns(meetingId: string): Promise<CheckIn[]> {
    try {
      const reuniao = await this.buscarPorId(meetingId);
      if (!reuniao) {
        return [];
      }

      return reuniao.checkIns || [];
    } catch (error) {
      console.error('Erro ao buscar check-ins:', error);
      throw new Error('Não foi possível buscar os check-ins');
    }
  }
}

