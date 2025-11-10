/// <reference types="jest" />
import { TokenRepository, BlacklistedToken } from '../TokenRepository';
import { Db, Collection } from 'mongodb';

describe('TokenRepository', () => {
  let mockDb: jest.Mocked<Db>;
  let mockCollection: jest.Mocked<Collection<BlacklistedToken>>;
  let repository: TokenRepository;

  beforeEach(() => {
    mockCollection = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
    } as any;

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as any;

    repository = new TokenRepository(mockDb);
  });

  describe('adicionarBlacklist', () => {
    it('deve adicionar um token à blacklist', async () => {
      const token = 'test-token-123';
      const membroId = 'membro-123';
      const tipo = 'access' as const;
      const expiraEm = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      mockCollection.insertOne.mockResolvedValue({
        acknowledged: true,
        insertedId: 'inserted-id' as any,
      });

      await repository.adicionarBlacklist(token, membroId, tipo, expiraEm);

      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        token,
        membroId,
        tipo,
        expiraEm,
        criadoEm: expect.any(Date),
      });
    });

    it('deve lançar erro se inserção falhar', async () => {
      const token = 'test-token-123';
      const membroId = 'membro-123';
      const tipo = 'access' as const;
      const expiraEm = new Date();

      mockCollection.insertOne.mockRejectedValue(new Error('Database error'));

      await expect(
        repository.adicionarBlacklist(token, membroId, tipo, expiraEm)
      ).rejects.toThrow('Não foi possível adicionar token à blacklist');
    });
  });

  describe('estaNaBlacklist', () => {
    it('deve retornar false se token não estiver na blacklist', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await repository.estaNaBlacklist('test-token');

      expect(result).toBe(false);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ token: 'test-token' });
    });

    it('deve retornar true se token estiver na blacklist e não expirado', async () => {
      const expiraEm = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos no futuro
      const blacklistedToken: BlacklistedToken = {
        _id: 'id-123',
        token: 'test-token',
        membroId: 'membro-123',
        tipo: 'access',
        expiraEm,
        criadoEm: new Date(),
      };

      mockCollection.findOne.mockResolvedValue(blacklistedToken);

      const result = await repository.estaNaBlacklist('test-token');

      expect(result).toBe(true);
    });

    it('deve remover e retornar false se token estiver expirado', async () => {
      const expiraEm = new Date(Date.now() - 1000); // 1 segundo no passado
      const blacklistedToken: BlacklistedToken = {
        _id: 'id-123',
        token: 'test-token',
        membroId: 'membro-123',
        tipo: 'access',
        expiraEm,
        criadoEm: new Date(),
      };

      mockCollection.findOne.mockResolvedValue(blacklistedToken);
      mockCollection.deleteOne.mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      });

      const result = await repository.estaNaBlacklist('test-token');

      expect(result).toBe(false);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ token: 'test-token' });
    });

    it('deve retornar false em caso de erro', async () => {
      mockCollection.findOne.mockRejectedValue(new Error('Database error'));

      const result = await repository.estaNaBlacklist('test-token');

      expect(result).toBe(false);
    });
  });

  describe('removerBlacklist', () => {
    it('deve remover um token da blacklist', async () => {
      mockCollection.deleteOne.mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      });

      await repository.removerBlacklist('test-token');

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ token: 'test-token' });
    });

    it('não deve lançar erro se remoção falhar', async () => {
      mockCollection.deleteOne.mockRejectedValue(new Error('Database error'));

      await expect(repository.removerBlacklist('test-token')).resolves.not.toThrow();
    });
  });

  describe('limparExpirados', () => {
    it('deve remover tokens expirados e retornar contagem', async () => {
      mockCollection.deleteMany.mockResolvedValue({
        acknowledged: true,
        deletedCount: 5,
      });

      const result = await repository.limparExpirados();

      expect(result).toBe(5);
      expect(mockCollection.deleteMany).toHaveBeenCalledWith({
        expiraEm: { $lt: expect.any(Date) },
      });
    });

    it('deve retornar 0 em caso de erro', async () => {
      mockCollection.deleteMany.mockRejectedValue(new Error('Database error'));

      const result = await repository.limparExpirados();

      expect(result).toBe(0);
    });
  });
});

