/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { InviteService } from '../InviteService';
import { InviteRepository } from '@/lib/repositories/InviteRepository';
import { criarConviteFake } from '@/tests/helpers/faker';
import { Invite } from '@/types/invite';

jest.mock('@/lib/mongodb', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('@/lib/repositories/InviteRepository');

describe('InviteService', () => {
  let service: InviteService;
  let mockRepository: jest.Mocked<InviteRepository>;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      collection: jest.fn(),
    };

    mockRepository = {
      criar: jest.fn(),
      buscarPorToken: jest.fn(),
      marcarComoUsado: jest.fn(),
    } as any;

    const { getDatabase } = require('@/lib/mongodb');
    getDatabase.mockResolvedValue(mockDb);

    (InviteRepository as jest.MockedClass<typeof InviteRepository>).mockImplementation(
      () => mockRepository
    );

    service = new InviteService();
  });

  describe('criarConvite', () => {
    it('deve criar um convite com token único e expiração de 7 dias', async () => {
      const intencaoId = 'intencao-123';
      const conviteCriado: Invite = {
        _id: '123',
        ...criarConviteFake(intencaoId),
      };

      mockRepository.criar.mockResolvedValueOnce(conviteCriado);

      const resultado = await service.criarConvite({ intencaoId });

      expect(resultado).toEqual(conviteCriado);
      expect(mockRepository.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          intencaoId,
          usado: false,
          token: expect.any(String),
          expiraEm: expect.any(Date),
        })
      );

      // Verifica que o token tem 64 caracteres (32 bytes em hex)
      const callArgs = mockRepository.criar.mock.calls[0][0];
      expect(callArgs.token).toHaveLength(64);

      // Verifica que expira em 7 dias
      const expiraEm = callArgs.expiraEm as Date;
      const agora = new Date();
      const diffEmDias = (expiraEm.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffEmDias).toBeCloseTo(7, 0);
    });

    it('deve gerar tokens únicos para cada convite', async () => {
      const intencaoId = 'intencao-123';
      const convites: Invite[] = [
        { _id: '1', ...criarConviteFake(intencaoId) },
        { _id: '2', ...criarConviteFake(intencaoId) },
      ];

      mockRepository.criar
        .mockResolvedValueOnce(convites[0])
        .mockResolvedValueOnce(convites[1]);

      const resultado1 = await service.criarConvite({ intencaoId });
      const resultado2 = await service.criarConvite({ intencaoId });

      const token1 = mockRepository.criar.mock.calls[0][0].token;
      const token2 = mockRepository.criar.mock.calls[1][0].token;

      expect(token1).not.toBe(token2);
    });
  });

  describe('validarConvite', () => {
    it('deve validar um convite válido', async () => {
      const convite: Invite = {
        _id: '123',
        token: 'token-valido',
        intencaoId: 'intencao-123',
        usado: false,
        expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias no futuro
        criadoEm: new Date(),
      };

      mockRepository.buscarPorToken.mockResolvedValueOnce(convite);

      const resultado = await service.validarConvite({ token: 'token-valido' });

      expect(resultado).toEqual(convite);
      expect(mockRepository.buscarPorToken).toHaveBeenCalledWith('token-valido');
    });

    it('deve retornar null se convite não for encontrado', async () => {
      mockRepository.buscarPorToken.mockResolvedValueOnce(null);

      const resultado = await service.validarConvite({ token: 'token-inexistente' });

      expect(resultado).toBeNull();
    });

    it('deve lançar erro se convite já foi usado', async () => {
      const conviteUsado: Invite = {
        _id: '123',
        token: 'token-usado',
        intencaoId: 'intencao-123',
        usado: true,
        expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        criadoEm: new Date(),
      };

      mockRepository.buscarPorToken.mockResolvedValueOnce(conviteUsado);

      await expect(service.validarConvite({ token: 'token-usado' })).rejects.toThrow(
        'Este convite já foi usado'
      );
    });

    it('deve lançar erro se convite expirou', async () => {
      const conviteExpirado: Invite = {
        _id: '123',
        token: 'token-expirado',
        intencaoId: 'intencao-123',
        usado: false,
        expiraEm: new Date(Date.now() - 1000), // Expirado
        criadoEm: new Date(),
      };

      mockRepository.buscarPorToken.mockResolvedValueOnce(conviteExpirado);

      await expect(service.validarConvite({ token: 'token-expirado' })).rejects.toThrow(
        'Este convite expirou'
      );
    });
  });

  describe('marcarComoUsado', () => {
    it('deve marcar um convite como usado', async () => {
      mockRepository.marcarComoUsado.mockResolvedValueOnce(undefined);

      await service.marcarComoUsado('token-123');

      expect(mockRepository.marcarComoUsado).toHaveBeenCalledWith('token-123');
    });
  });
});

