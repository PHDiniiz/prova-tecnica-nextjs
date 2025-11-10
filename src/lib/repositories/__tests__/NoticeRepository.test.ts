/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { NoticeRepository } from '../NoticeRepository';
import { Db, ObjectId } from 'mongodb';
import { Notice, NoticeType } from '@/types/notice';

describe('NoticeRepository', () => {
  let repository: NoticeRepository;
  let mockDb: jest.Mocked<Db>;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollection = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as any;

    repository = new NoticeRepository(mockDb);
  });

  describe('criar', () => {
    it('deve criar um novo aviso', async () => {
      const agora = new Date();
      const avisoSemId: Omit<Notice, '_id'> = {
        titulo: 'Aviso Importante',
        conteudo: 'Este é um aviso importante para todos os membros.',
        tipo: 'info',
        ativo: true,
        criadoEm: agora,
        atualizadoEm: agora,
      };

      const insertedId = new ObjectId('123');
      mockCollection.insertOne.mockResolvedValueOnce({
        insertedId,
      });

      const resultado = await repository.criar(avisoSemId);

      expect(resultado).toMatchObject({
        titulo: 'Aviso Importante',
        conteudo: 'Este é um aviso importante para todos os membros.',
        tipo: 'info',
        ativo: true,
        _id: '123',
      });
      expect(resultado.criadoEm).toBeInstanceOf(Date);
      expect(resultado.atualizadoEm).toBeInstanceOf(Date);
      expect(mockCollection.insertOne).toHaveBeenCalled();
    });
  });

  describe('buscarTodos', () => {
    it('deve buscar todos os avisos sem filtro', async () => {
      const avisos = [
        {
          _id: new ObjectId('123'),
          titulo: 'Aviso 1',
          conteudo: 'Conteúdo 1',
          tipo: 'info' as NoticeType,
          ativo: true,
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      mockCollection.toArray.mockResolvedValueOnce(avisos);

      const resultado = await repository.buscarTodos();

      expect(resultado).toHaveLength(1);
      expect(resultado[0]._id).toBe('123');
    });

    it('deve buscar avisos com filtro por tipo', async () => {
      mockCollection.toArray.mockResolvedValueOnce([]);

      await repository.buscarTodos({ tipo: 'urgent' });

      expect(mockCollection.find).toHaveBeenCalledWith({ tipo: 'urgent' });
    });
  });

  describe('buscarAtivosPublicos', () => {
    it('deve buscar apenas avisos ativos', async () => {
      mockCollection.toArray.mockResolvedValueOnce([]);

      await repository.buscarAtivosPublicos();

      expect(mockCollection.find).toHaveBeenCalledWith({ ativo: true });
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar aviso por ID', async () => {
      const aviso = {
        _id: new ObjectId('123'),
        titulo: 'Aviso',
        conteudo: 'Conteúdo',
        tipo: 'info' as NoticeType,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockCollection.findOne.mockResolvedValueOnce(aviso);

      const resultado = await repository.buscarPorId('123');

      expect(resultado).not.toBeNull();
      expect(resultado?._id).toBe('123');
    });

    it('deve retornar null se aviso não for encontrado', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const resultado = await repository.buscarPorId('inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar um aviso', async () => {
      const avisoAtualizado = {
        _id: new ObjectId('123'),
        titulo: 'Aviso Atualizado',
        conteudo: 'Conteúdo atualizado',
        tipo: 'warning' as NoticeType,
        ativo: false,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockCollection.findOneAndUpdate.mockResolvedValueOnce(avisoAtualizado);

      const resultado = await repository.atualizar('123', { ativo: false });

      expect(resultado).not.toBeNull();
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('deletar', () => {
    it('deve deletar um aviso', async () => {
      mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

      await repository.deletar('123');

      expect(mockCollection.deleteOne).toHaveBeenCalled();
    });
  });
});

