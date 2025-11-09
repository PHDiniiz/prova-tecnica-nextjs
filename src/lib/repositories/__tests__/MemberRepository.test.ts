import { MemberRepository } from '../MemberRepository';
import { Db, ObjectId } from 'mongodb';
import { Member } from '@/types/member';
import { criarMembroFake } from '@/tests/helpers/faker';

describe('MemberRepository', () => {
  let repository: MemberRepository;
  let mockDb: jest.Mocked<Db>;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollection = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as any;

    repository = new MemberRepository(mockDb);
  });

  describe('criar', () => {
    it('deve criar um novo membro', async () => {
      const membroSemId = criarMembroFake();
      const insertedId = new ObjectId('123');

      mockCollection.insertOne.mockResolvedValueOnce({
        insertedId,
      });

      const resultado = await repository.criar(membroSemId);

      expect(resultado).toEqual(
        expect.objectContaining({
          ...membroSemId,
          _id: '123',
          criadoEm: expect.any(Date),
          atualizadoEm: expect.any(Date),
        })
      );
      expect(mockCollection.insertOne).toHaveBeenCalled();
    });
  });

  describe('buscarTodos', () => {
    it('deve buscar todos os membros', async () => {
      const membros = [
        {
          _id: new ObjectId('123'),
          ...criarMembroFake(),
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      mockCollection.toArray.mockResolvedValueOnce(membros);

      const resultado = await repository.buscarTodos();

      expect(resultado).toHaveLength(1);
      expect(resultado[0]._id).toBe('123');
      expect(mockCollection.find).toHaveBeenCalledWith({});
      expect(mockCollection.sort).toHaveBeenCalledWith({ criadoEm: -1 });
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar um membro por ID', async () => {
      const membro = {
        _id: new ObjectId('123'),
        ...criarMembroFake(),
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockCollection.findOne.mockResolvedValueOnce(membro);

      const resultado = await repository.buscarPorId('123');

      expect(resultado).toEqual({
        ...membro,
        _id: '123',
      });
    });

    it('deve retornar null se membro não for encontrado', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const resultado = await repository.buscarPorId('inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('buscarPorEmail', () => {
    it('deve buscar um membro por email', async () => {
      const membro = {
        _id: new ObjectId('123'),
        ...criarMembroFake(),
        email: 'joao@test.com',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockCollection.findOne.mockResolvedValueOnce(membro);

      const resultado = await repository.buscarPorEmail('joao@test.com');

      expect(resultado).toEqual({
        ...membro,
        _id: '123',
      });
      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'joao@test.com' });
    });

    it('deve retornar null se membro não for encontrado', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const resultado = await repository.buscarPorEmail('inexistente@test.com');

      expect(resultado).toBeNull();
    });
  });

  describe('buscarAtivos', () => {
    it('deve buscar apenas membros ativos', async () => {
      const membrosAtivos = [
        {
          _id: new ObjectId('123'),
          ...criarMembroFake(undefined, true),
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      mockCollection.toArray.mockResolvedValueOnce(membrosAtivos);

      const resultado = await repository.buscarAtivos();

      expect(resultado).toHaveLength(1);
      expect(mockCollection.find).toHaveBeenCalledWith({ ativo: true });
    });
  });
});

