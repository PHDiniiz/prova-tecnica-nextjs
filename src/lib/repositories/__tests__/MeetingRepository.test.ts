/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { MeetingRepository } from '../MeetingRepository';
import { Db, ObjectId } from 'mongodb';
import { Meeting, CheckIn } from '@/types/meeting';

describe('MeetingRepository', () => {
  let repository: MeetingRepository;
  let mockDb: jest.Mocked<Db>;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollection = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as any;

    repository = new MeetingRepository(mockDb);
  });

  describe('criar', () => {
    it('deve criar uma nova reunião', async () => {
      const agora = new Date();
      const reuniaoSemId: Omit<Meeting, '_id'> = {
        membro1Id: 'membro1',
        membro2Id: 'membro2',
        dataReuniao: agora,
        local: 'Escritório',
        checkIns: [],
        criadoEm: agora,
        atualizadoEm: agora,
      };

      const insertedId = new ObjectId('123');
      mockCollection.insertOne.mockResolvedValueOnce({
        insertedId,
      });

      const resultado = await repository.criar(reuniaoSemId);

      expect(resultado).toMatchObject({
        membro1Id: 'membro1',
        membro2Id: 'membro2',
        local: 'Escritório',
        checkIns: [],
        _id: '123',
      });
      expect(resultado.criadoEm).toBeInstanceOf(Date);
      expect(resultado.atualizadoEm).toBeInstanceOf(Date);
      expect(resultado.dataReuniao).toBeInstanceOf(Date);
      expect(mockCollection.insertOne).toHaveBeenCalled();
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar reunião por ID', async () => {
      const reuniao = {
        _id: new ObjectId('123'),
        membro1Id: new ObjectId('membro1') as any,
        membro2Id: new ObjectId('membro2') as any,
        dataReuniao: new Date(),
        checkIns: [],
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockCollection.findOne.mockResolvedValueOnce(reuniao);

      const resultado = await repository.buscarPorId('123');

      expect(resultado).not.toBeNull();
      expect(resultado?._id).toBe('123');
    });
  });

  describe('registrarCheckIn', () => {
    it('deve registrar check-in em uma reunião', async () => {
      const reuniao = {
        _id: new ObjectId('123'),
        membro1Id: 'membro1',
        membro2Id: 'membro2',
        dataReuniao: new Date(),
        checkIns: [],
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      const checkIn: CheckIn = {
        membroId: 'membro1',
        dataCheckIn: new Date(),
        presente: true,
      };

      // Mock buscarPorId
      repository.buscarPorId = jest.fn().mockResolvedValueOnce(reuniao);

      const reuniaoAtualizada = {
        ...reuniao,
        checkIns: [checkIn],
      };

      mockCollection.findOneAndUpdate.mockResolvedValueOnce(reuniaoAtualizada);

      const resultado = await repository.registrarCheckIn('123', checkIn);

      expect(resultado.checkIns).toHaveLength(1);
      expect(resultado.checkIns[0].membroId).toBe('membro1');
    });
  });
});

