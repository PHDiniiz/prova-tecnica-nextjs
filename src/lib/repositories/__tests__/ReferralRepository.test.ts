/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { ReferralRepository } from '../ReferralRepository';
import { Db, ObjectId } from 'mongodb';
import { Referral, ReferralStatus } from '@/types/referral';
import { criarIndicacaoFake } from '@/tests/helpers/faker';

describe('ReferralRepository', () => {
  let repository: ReferralRepository;
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

    repository = new ReferralRepository(mockDb);
  });

  describe('criar', () => {
    it('deve criar uma nova indicação', async () => {
      const membroIndicadorId = 'membro-1';
      const membroIndicadoId = 'membro-2';
      const indicacaoSemId = criarIndicacaoFake(membroIndicadorId, membroIndicadoId);

      const insertedId = new ObjectId('123');
      mockCollection.insertOne.mockResolvedValueOnce({
        insertedId,
      });

      const resultado = await repository.criar(indicacaoSemId);

      expect(resultado).toEqual({
        ...indicacaoSemId,
        _id: '123',
      });
      expect(mockCollection.insertOne).toHaveBeenCalled();
    });
  });

  describe('buscarTodas', () => {
    it('deve buscar todas as indicações sem filtro', async () => {
      const indicacoes = [
        {
          _id: new ObjectId('123'),
          membroIndicadorId: new ObjectId('membro-1'),
          membroIndicadoId: new ObjectId('membro-2'),
          ...criarIndicacaoFake('membro-1', 'membro-2'),
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      mockCollection.toArray.mockResolvedValueOnce(indicacoes);

      const resultado = await repository.buscarTodas();

      expect(resultado).toHaveLength(1);
      expect(mockCollection.find).toHaveBeenCalledWith({});
      expect(mockCollection.sort).toHaveBeenCalledWith({ criadoEm: -1 });
    });

    it('deve buscar indicações com filtro de membro indicador', async () => {
      const indicacoes: any[] = [];
      const filtro = { membroIndicadorId: 'membro-1' };

      mockCollection.toArray.mockResolvedValueOnce(indicacoes);

      await repository.buscarTodas(filtro);

      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          membroIndicadorId: expect.any(Object),
        })
      );
    });

    it('deve buscar indicações com filtro de status', async () => {
      const filtro = { status: 'nova' as ReferralStatus };

      mockCollection.toArray.mockResolvedValueOnce([]);

      await repository.buscarTodas(filtro);

      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'nova',
        })
      );
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar uma indicação por ID', async () => {
      const indicacao = {
        _id: new ObjectId('123'),
        membroIndicadorId: new ObjectId('membro-1'),
        membroIndicadoId: new ObjectId('membro-2'),
        ...criarIndicacaoFake('membro-1', 'membro-2'),
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockCollection.findOne.mockResolvedValueOnce(indicacao);

      const resultado = await repository.buscarPorId('123');

      expect(resultado).toEqual(
        expect.objectContaining({
          _id: '123',
        })
      );
    });

    it('deve retornar null se indicação não for encontrada', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const resultado = await repository.buscarPorId('inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('atualizarStatus', () => {
    it('deve atualizar o status de uma indicação', async () => {
      const indicacaoAtualizada = {
        _id: new ObjectId('123'),
        membroIndicadorId: new ObjectId('membro-1'),
        membroIndicadoId: new ObjectId('membro-2'),
        ...criarIndicacaoFake('membro-1', 'membro-2'),
        status: 'em-contato' as ReferralStatus,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockCollection.findOneAndUpdate.mockResolvedValueOnce(indicacaoAtualizada);

      const resultado = await repository.atualizarStatus('123', 'em-contato');

      expect(resultado).toEqual(
        expect.objectContaining({
          _id: '123',
          status: 'em-contato',
        })
      );
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        {
          $set: {
            status: 'em-contato',
            atualizadoEm: expect.any(Date),
          },
        },
        { returnDocument: 'after' }
      );
    });

    it('deve atualizar observações junto com o status', async () => {
      const indicacaoAtualizada = {
        _id: new ObjectId('123'),
        membroIndicadorId: new ObjectId('membro-1'),
        membroIndicadoId: new ObjectId('membro-2'),
        ...criarIndicacaoFake('membro-1', 'membro-2'),
        status: 'em-contato' as ReferralStatus,
        observacoes: 'Primeiro contato realizado',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockCollection.findOneAndUpdate.mockResolvedValueOnce(indicacaoAtualizada);

      await repository.atualizarStatus('123', 'em-contato', 'Primeiro contato realizado');

      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        {
          $set: {
            status: 'em-contato',
            observacoes: 'Primeiro contato realizado',
            atualizadoEm: expect.any(Date),
          },
        },
        { returnDocument: 'after' }
      );
    });

    it('deve retornar null se indicação não for encontrada', async () => {
      mockCollection.findOneAndUpdate.mockResolvedValueOnce(null);

      const resultado = await repository.atualizarStatus('inexistente', 'em-contato');

      expect(resultado).toBeNull();
    });
  });
});

