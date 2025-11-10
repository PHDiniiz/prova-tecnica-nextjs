/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { IntentionRepository } from '../IntentionRepository';
import { Db, ObjectId } from 'mongodb';
import { Intention } from '@/types/intention';
import { criarIntencaoFake } from '@/tests/helpers/faker';

describe('IntentionRepository', () => {
  let repository: IntentionRepository;
  let mockDb: jest.Mocked<Db>;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock da collection
    mockCollection = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      countDocuments: jest.fn(),
    };

    // Mock do Db
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as any;

    repository = new IntentionRepository(mockDb);
  });

  describe('criar', () => {
    it('deve criar uma nova intenção', async () => {
      const dadosIntencao = criarIntencaoFake();
      const intencaoSemId: Omit<Intention, '_id'> = {
        ...dadosIntencao,
        status: 'pending',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      const insertedId = new ObjectId('123');
      mockCollection.insertOne.mockResolvedValueOnce({
        insertedId,
      });

      const resultado = await repository.criar(intencaoSemId);

      expect(resultado).toEqual(
        expect.objectContaining({
          ...intencaoSemId,
          _id: insertedId.toString(),
          criadoEm: expect.any(Date),
          atualizadoEm: expect.any(Date),
        })
      );
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: dadosIntencao.nome,
          email: dadosIntencao.email,
        })
      );
    });
  });

  describe('buscarTodas', () => {
    it('deve buscar todas as intenções sem filtro', async () => {
      const intencoes = [
        {
          _id: new ObjectId('123'),
          ...criarIntencaoFake(),
          status: 'pending',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
        {
          _id: new ObjectId('456'),
          ...criarIntencaoFake(),
          status: 'approved',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      mockCollection.toArray.mockResolvedValueOnce(intencoes);

      const resultado = await repository.buscarTodas();

      expect(resultado).toHaveLength(2);
      expect(resultado[0]._id).toBe('123');
      expect(resultado[1]._id).toBe('456');
      expect(mockCollection.find).toHaveBeenCalledWith({});
      expect(mockCollection.sort).toHaveBeenCalledWith({ criadoEm: -1 });
    });

    it('deve buscar intenções com filtro de status', async () => {
      const intencoes = [
        {
          _id: new ObjectId('123'),
          ...criarIntencaoFake(),
          status: 'pending',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      mockCollection.toArray.mockResolvedValueOnce(intencoes);

      const resultado = await repository.buscarTodas({ status: 'pending' });

      expect(resultado).toHaveLength(1);
      expect(mockCollection.find).toHaveBeenCalledWith({ status: 'pending' });
    });
  });

  describe('buscarComPaginacao', () => {
    it('deve buscar intenções com paginação', async () => {
      const intencoes = [
        {
          _id: new ObjectId('123'),
          ...criarIntencaoFake(),
          status: 'pending',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      mockCollection.toArray.mockResolvedValueOnce(intencoes);
      mockCollection.countDocuments.mockResolvedValueOnce(10);

      const resultado = await repository.buscarComPaginacao(undefined, 1, 20);

      expect(resultado.intencoes).toHaveLength(1);
      expect(resultado.total).toBe(10);
      expect(resultado.pagina).toBe(1);
      expect(resultado.limite).toBe(20);
      expect(resultado.totalPaginas).toBe(1);
      expect(mockCollection.skip).toHaveBeenCalledWith(0);
      expect(mockCollection.limit).toHaveBeenCalledWith(20);
    });

    it('deve calcular totalPaginas corretamente', async () => {
      mockCollection.toArray.mockResolvedValueOnce([]);
      mockCollection.countDocuments.mockResolvedValueOnce(45);

      const resultado = await repository.buscarComPaginacao(undefined, 1, 20);

      expect(resultado.totalPaginas).toBe(3); // 45 / 20 = 2.25, arredondado para 3
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar uma intenção por ID', async () => {
      const intencao = {
        _id: new ObjectId('123'),
        ...criarIntencaoFake(),
        status: 'pending',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockCollection.findOne.mockResolvedValueOnce(intencao);

      const resultado = await repository.buscarPorId('123');

      expect(resultado).toEqual({
        ...intencao,
        _id: '123',
      });
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(Object),
      });
    });

    it('deve retornar null se intenção não for encontrada', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const resultado = await repository.buscarPorId('inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('atualizarStatus', () => {
    it('deve atualizar o status de uma intenção', async () => {
      const intencaoAtualizada = {
        _id: new ObjectId('123'),
        ...criarIntencaoFake(),
        status: 'approved',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockCollection.findOneAndUpdate.mockResolvedValueOnce(intencaoAtualizada);

      const resultado = await repository.atualizarStatus('123', 'approved');

      expect(resultado).toEqual({
        ...intencaoAtualizada,
        _id: '123',
      });
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        {
          $set: {
            status: 'approved',
            atualizadoEm: expect.any(Date),
          },
        },
        { returnDocument: 'after' }
      );
    });

    it('deve retornar null se intenção não for encontrada', async () => {
      mockCollection.findOneAndUpdate.mockResolvedValueOnce(null);

      const resultado = await repository.atualizarStatus('inexistente', 'approved');

      expect(resultado).toBeNull();
    });
  });
});

