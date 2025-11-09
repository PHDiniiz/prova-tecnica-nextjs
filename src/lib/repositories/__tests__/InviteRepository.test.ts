import { InviteRepository } from '../InviteRepository';
import { Db, ObjectId } from 'mongodb';
import { Invite } from '@/types/invite';
import { criarConviteFake } from '@/tests/helpers/faker';

describe('InviteRepository', () => {
  let repository: InviteRepository;
  let mockDb: jest.Mocked<Db>;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as any;

    repository = new InviteRepository(mockDb);
  });

  describe('criar', () => {
    it('deve criar um novo convite', async () => {
      const intencaoId = 'intencao-123';
      const conviteSemId = criarConviteFake(intencaoId);

      const insertedId = new ObjectId('123');
      mockCollection.insertOne.mockResolvedValueOnce({
        insertedId,
      });

      const resultado = await repository.criar(conviteSemId);

      expect(resultado).toEqual(
        expect.objectContaining({
          ...conviteSemId,
          _id: '123',
          criadoEm: expect.any(Date),
        })
      );
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          token: conviteSemId.token,
          intencaoId,
        })
      );
    });
  });

  describe('buscarPorToken', () => {
    it('deve buscar um convite por token válido', async () => {
      const convite: Invite = {
        _id: '123',
        token: 'token-valido',
        intencaoId: 'intencao-123',
        usado: false,
        expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        criadoEm: new Date(),
      };

      mockCollection.findOne.mockResolvedValueOnce(convite);

      const resultado = await repository.buscarPorToken('token-valido');

      expect(resultado).toEqual({
        ...convite,
        _id: '123',
      });
      expect(mockCollection.findOne).toHaveBeenCalledWith({ token: 'token-valido' });
    });

    it('deve retornar null se convite não for encontrado', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const resultado = await repository.buscarPorToken('token-inexistente');

      expect(resultado).toBeNull();
    });

    it('deve retornar null se convite expirou', async () => {
      const conviteExpirado: Invite = {
        _id: '123',
        token: 'token-expirado',
        intencaoId: 'intencao-123',
        usado: false,
        expiraEm: new Date(Date.now() - 1000), // Expirado
        criadoEm: new Date(),
      };

      mockCollection.findOne.mockResolvedValueOnce(conviteExpirado);

      const resultado = await repository.buscarPorToken('token-expirado');

      expect(resultado).toBeNull();
    });
  });

  describe('marcarComoUsado', () => {
    it('deve marcar um convite como usado', async () => {
      mockCollection.updateOne.mockResolvedValueOnce({ modifiedCount: 1 });

      await repository.marcarComoUsado('token-123');

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { token: 'token-123' },
        {
          $set: {
            usado: true,
          },
        }
      );
    });
  });
});

