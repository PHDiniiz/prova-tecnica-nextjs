/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { InviteService } from '../InviteService';
import { InviteRepository } from '@/lib/repositories/InviteRepository';
import { IntentionService } from '@/services/IntentionService';
import { criarConviteFake, criarIntencaoFake } from '@/tests/helpers/faker';
import { Invite } from '@/types/invite';
import { Intention } from '@/types/intention';

jest.mock('@/lib/mongodb', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('@/lib/repositories/InviteRepository');

jest.mock('@/services/IntentionService');

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

    describe('console.log do email', () => {
      let consoleLogSpy: jest.SpyInstance;
      let mockIntentionService: jest.Mocked<IntentionService>;

      beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();

        mockIntentionService = {
          buscarIntencaoPorId: jest.fn(),
        } as any;

        (IntentionService as jest.MockedClass<typeof IntentionService>).mockImplementation(
          () => mockIntentionService
        );
      });

      afterEach(() => {
        consoleLogSpy.mockRestore();
        jest.restoreAllMocks();
      });

      it('deve chamar console.log ao criar convite com informações da intenção', async () => {
        const intencaoId = 'intencao-123';
        const intencaoInfo: Intention = {
          _id: intencaoId,
          ...criarIntencaoFake(),
          cargo: 'Desenvolvedor',
        };

        // Captura o token gerado através do mock do repository
        let tokenGerado: string;
        mockRepository.criar.mockImplementation(async (convite) => {
          tokenGerado = convite.token;
          return {
            _id: '123',
            ...convite,
          } as Invite;
        });

        mockIntentionService.buscarIntencaoPorId.mockResolvedValueOnce(intencaoInfo);

        await service.criarConvite({ intencaoId });

        // Verifica que console.log foi chamado
        expect(consoleLogSpy).toHaveBeenCalled();

        // Verifica se contém informações do candidato
        const logCalls = consoleLogSpy.mock.calls.flat().join('\n');
        expect(logCalls).toContain('📧 CONVITE DE CADASTRO GERADO');
        expect(logCalls).toContain(`👤 Candidato: ${intencaoInfo.nome}`);
        expect(logCalls).toContain(`📧 Email: ${intencaoInfo.email}`);
        expect(logCalls).toContain(`🏢 Empresa: ${intencaoInfo.empresa}`);
        expect(logCalls).toContain(`💼 Cargo: ${intencaoInfo.cargo}`);
        expect(logCalls).toContain(`🔗 Link de Cadastro:`);
        expect(logCalls).toContain(`🔑 Token: ${tokenGerado!}`);
        expect(logCalls).toContain('⏰ Expira em:');
        expect(logCalls).toContain('📅 Criado em:');
      });

      it('deve chamar console.log mesmo quando não há informações da intenção', async () => {
        const intencaoId = 'intencao-123';

        // Captura o token gerado através do mock do repository
        let tokenGerado: string;
        mockRepository.criar.mockImplementation(async (convite) => {
          tokenGerado = convite.token;
          return {
            _id: '123',
            ...convite,
          } as Invite;
        });

        mockIntentionService.buscarIntencaoPorId.mockRejectedValueOnce(
          new Error('Intenção não encontrada')
        );

        await service.criarConvite({ intencaoId });

        // Verifica que console.log foi chamado mesmo sem informações da intenção
        expect(consoleLogSpy).toHaveBeenCalled();

        const logCalls = consoleLogSpy.mock.calls.flat().join('\n');
        expect(logCalls).toContain('📧 CONVITE DE CADASTRO GERADO');
        expect(logCalls).toContain(`🔗 Link de Cadastro:`);
        expect(logCalls).toContain(`🔑 Token: ${tokenGerado!}`);
      });

      it('deve incluir link de cadastro completo com base URL', async () => {
        const intencaoId = 'intencao-123';
        const baseUrl = 'https://example.com';
        const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

        process.env.NEXT_PUBLIC_APP_URL = baseUrl;

        // Captura o token gerado através do mock do repository
        let tokenGerado: string;
        mockRepository.criar.mockImplementation(async (convite) => {
          tokenGerado = convite.token;
          return {
            _id: '123',
            ...convite,
          } as Invite;
        });

        await service.criarConvite({ intencaoId });

        const logCalls = consoleLogSpy.mock.calls.flat().join('\n');
        expect(logCalls).toContain(`🔗 Link de Cadastro: ${baseUrl}/register/${tokenGerado!}`);

        // Restaura
        process.env.NEXT_PUBLIC_APP_URL = originalEnv;
      });

      it('deve usar localhost como padrão quando NEXT_PUBLIC_APP_URL não está definido', async () => {
        const intencaoId = 'intencao-123';
        const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

        delete process.env.NEXT_PUBLIC_APP_URL;

        // Captura o token gerado através do mock do repository
        let tokenGerado: string;
        mockRepository.criar.mockImplementation(async (convite) => {
          tokenGerado = convite.token;
          return {
            _id: '123',
            ...convite,
          } as Invite;
        });

        await service.criarConvite({ intencaoId });

        const logCalls = consoleLogSpy.mock.calls.flat().join('\n');
        expect(logCalls).toContain(`🔗 Link de Cadastro: http://localhost:3000/register/${tokenGerado!}`);

        // Restaura
        process.env.NEXT_PUBLIC_APP_URL = originalEnv;
      });
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

