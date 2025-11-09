import { ObrigadoRepository } from '../ObrigadoRepository';
import { Db, ObjectId } from 'mongodb';
import { Obrigado } from '@/types/obrigado';

describe('ObrigadoRepository', () => {
  let repository: ObrigadoRepository;
  let mockDb: jest.Mocked<Db>;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollection = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      countDocuments: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as any;

    repository = new ObrigadoRepository(mockDb);
  });

  describe('criar', () => {
    it('deve criar um novo obrigado', async () => {
      const obrigadoSemId: Omit<Obrigado, '_id'> = {
        indicacaoId: 'indicacao-123',
        membroIndicadorId: 'membro-1',
        membroIndicadoId: 'membro-2',
        mensagem: 'Muito obrigado pela indicação!',
        publico: true,
        criadoEm: new Date(),
      };

      const insertedId = new ObjectId('123');
      mockCollection.insertOne.mockResolvedValueOnce({
        insertedId,
      });

      const resultado = await repository.criar(obrigadoSemId);

      expect(resultado).toEqual({
        ...obrigadoSemId,
        _id: '123',
      });
      expect(mockCollection.insertOne).toHaveBeenCalled();
    });
  });

  describe('buscarTodosPublicos', () => {
    it('deve buscar todos os obrigados públicos', async () => {
      const obrigados = [
        {
          _id: new ObjectId('123'),
          indicacaoId: new ObjectId('indicacao-1'),
          membroIndicadorId: new ObjectId('membro-1'),
          membroIndicadoId: new ObjectId('membro-2'),
          mensagem: 'Agradecimento 1',
          publico: true,
          criadoEm: new Date(),
        },
      ];

      mockCollection.toArray.mockResolvedValueOnce(obrigados);

      const resultado = await repository.buscarTodosPublicos();

      expect(resultado).toHaveLength(1);
      expect(resultado[0]._id).toBe('123');
      expect(mockCollection.find).toHaveBeenCalledWith({ publico: true });
      expect(mockCollection.sort).toHaveBeenCalledWith({ criadoEm: -1 });
    });

    it('deve buscar obrigados com filtro de membro indicador', async () => {
      const filtro = { membroIndicadorId: 'membro-1' };
      const obrigados: any[] = [];

      mockCollection.toArray.mockResolvedValueOnce(obrigados);

      await repository.buscarTodosPublicos(filtro);

      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          publico: true,
          membroIndicadorId: expect.any(Object),
        })
      );
    });
  });

  describe('buscarComPaginacao', () => {
    it('deve buscar obrigados com paginação', async () => {
      const obrigados = [
        {
          _id: new ObjectId('123'),
          indicacaoId: new ObjectId('indicacao-1'),
          membroIndicadorId: new ObjectId('membro-1'),
          membroIndicadoId: new ObjectId('membro-2'),
          mensagem: 'Agradecimento 1',
          publico: true,
          criadoEm: new Date(),
        },
      ];

      mockCollection.toArray.mockResolvedValueOnce(obrigados);
      mockCollection.countDocuments.mockResolvedValueOnce(10);

      const resultado = await repository.buscarComPaginacao(undefined, 1, 20);

      expect(resultado.obrigados).toHaveLength(1);
      expect(resultado.total).toBe(10);
      expect(resultado.pagina).toBe(1);
      expect(resultado.limite).toBe(20);
      expect(resultado.totalPaginas).toBe(1);
      expect(mockCollection.skip).toHaveBeenCalledWith(0);
      expect(mockCollection.limit).toHaveBeenCalledWith(20);
    });
  });

  describe('buscarPorIndicacaoId', () => {
    it('deve buscar um obrigado por ID de indicação', async () => {
      const obrigado = {
        _id: new ObjectId('123'),
        indicacaoId: new ObjectId('indicacao-123'),
        membroIndicadorId: new ObjectId('membro-1'),
        membroIndicadoId: new ObjectId('membro-2'),
        mensagem: 'Agradecimento',
        publico: true,
        criadoEm: new Date(),
      };

      mockCollection.findOne.mockResolvedValueOnce(obrigado);

      const resultado = await repository.buscarPorIndicacaoId('indicacao-123');

      expect(resultado).toEqual(
        expect.objectContaining({
          _id: '123',
        })
      );
    });

    it('deve retornar null se obrigado não for encontrado', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const resultado = await repository.buscarPorIndicacaoId('inexistente');

      expect(resultado).toBeNull();
    });
  });
});

