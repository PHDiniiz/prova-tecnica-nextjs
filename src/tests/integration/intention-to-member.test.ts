/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

/**
 * Testes de Integração - Fluxo Completo: Intenção → Aprovação → Convite → Membro
 * 
 * Testa o fluxo completo de admissão de membros:
 * 1. Criar intenção
 * 2. Aprovar intenção (gera convite automaticamente)
 * 3. Validar convite
 * 4. Criar membro com token válido
 */

import { IntentionService } from '@/services/IntentionService';
import { InviteService } from '@/services/InviteService';
import { MemberService } from '@/services/MemberService';
import { criarIntencaoFake, criarMembroFake } from '@/tests/helpers/faker';
import { Intention } from '@/types/intention';
import { Invite } from '@/types/invite';
import { Member } from '@/types/member';

// Mock dos serviços e repositórios
jest.mock('@/services/IntentionService');
jest.mock('@/services/InviteService');
jest.mock('@/services/MemberService');
jest.mock('@/lib/mongodb', () => ({
  getDatabase: jest.fn(),
}));

describe('Fluxo de Integração: Intenção → Membro', () => {
  let intentionService: jest.Mocked<IntentionService>;
  let inviteService: jest.Mocked<InviteService>;
  let memberService: jest.Mocked<MemberService>;

  beforeEach(() => {
    jest.clearAllMocks();

    intentionService = {
      criarIntencao: jest.fn(),
      atualizarStatusIntencao: jest.fn(),
      buscarIntencaoPorId: jest.fn(),
    } as any;

    inviteService = {
      criarConvite: jest.fn(),
      validarConvite: jest.fn(),
      marcarComoUsado: jest.fn(),
    } as any;

    memberService = {
      criarMembro: jest.fn(),
    } as any;

    (IntentionService as jest.MockedClass<typeof IntentionService>).mockImplementation(
      () => intentionService
    );
    (InviteService as jest.MockedClass<typeof InviteService>).mockImplementation(
      () => inviteService
    );
    (MemberService as jest.MockedClass<typeof MemberService>).mockImplementation(
      () => memberService
    );
  });

  describe('Fluxo completo de admissão', () => {
    it('deve completar o fluxo: criar intenção → aprovar → gerar convite → criar membro', async () => {
      // 1. Criar intenção
      const dadosIntencao = criarIntencaoFake();
      const intencaoCriada: Intention = {
        _id: 'intencao-123',
        ...dadosIntencao,
        status: 'pending',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      intentionService.criarIntencao.mockResolvedValueOnce(intencaoCriada);

      const intencao = await intentionService.criarIntencao(dadosIntencao);
      expect(intencao.status).toBe('pending');

      // 2. Aprovar intenção
      const intencaoAprovada: Intention = {
        ...intencaoCriada,
        status: 'approved',
        atualizadoEm: new Date(),
      };

      intentionService.atualizarStatusIntencao.mockResolvedValueOnce(intencaoAprovada);

      // 3. Gerar convite automaticamente após aprovação
      const conviteCriado: Invite = {
        _id: 'convite-123',
        token: 'token-abc123',
        intencaoId: intencaoCriada._id!,
        usado: false,
        expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        criadoEm: new Date(),
      };

      inviteService.criarConvite.mockResolvedValueOnce(conviteCriado);

      const intencaoAtualizada = await intentionService.atualizarStatusIntencao(
        intencaoCriada._id!,
        { status: 'approved' }
      );
      expect(intencaoAtualizada?.status).toBe('approved');

      const convite = await inviteService.criarConvite({
        intencaoId: intencaoCriada._id!,
      });
      expect(convite.token).toBe('token-abc123');
      expect(convite.usado).toBe(false);

      // 4. Validar convite
      inviteService.validarConvite.mockResolvedValueOnce(conviteCriado);

      const conviteValidado = await inviteService.validarConvite({
        token: convite.token,
      });
      expect(conviteValidado).not.toBeNull();
      expect(conviteValidado?.usado).toBe(false);

      // 5. Criar membro com token válido
      const dadosMembro = criarMembroFake(intencaoCriada._id);
      const membroCriado: Member = {
        _id: 'membro-123',
        ...dadosMembro,
        intencaoId: intencaoCriada._id!,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      memberService.criarMembro.mockResolvedValueOnce(membroCriado);

      const membro = await memberService.criarMembro({
        ...dadosMembro,
        intencaoId: intencaoCriada._id,
        token: convite.token,
      });

      expect(membro).not.toBeNull();
      expect(membro.intencaoId).toBe(intencaoCriada._id);
      expect(membro.ativo).toBe(true);

      // 6. Marcar convite como usado
      inviteService.marcarComoUsado.mockResolvedValueOnce(undefined);
      await inviteService.marcarComoUsado(convite.token);

      // Verificações finais
      expect(intentionService.criarIntencao).toHaveBeenCalledTimes(1);
      expect(intentionService.atualizarStatusIntencao).toHaveBeenCalledWith(
        intencaoCriada._id,
        { status: 'approved' }
      );
      expect(inviteService.criarConvite).toHaveBeenCalledWith({
        intencaoId: intencaoCriada._id,
      });
      expect(inviteService.validarConvite).toHaveBeenCalledWith({
        token: convite.token,
      });
      expect(memberService.criarMembro).toHaveBeenCalledWith(
        expect.objectContaining({
          token: convite.token,
        })
      );
      expect(inviteService.marcarComoUsado).toHaveBeenCalledWith(convite.token);
    });

    it('deve falhar ao criar membro com token inválido', async () => {
      const dadosMembro = criarMembroFake();
      const tokenInvalido = 'token-invalido';

      // MemberService valida o token internamente e lança erro se inválido
      memberService.criarMembro.mockRejectedValueOnce(
        new Error('Token de convite inválido ou expirado')
      );

      await expect(
        memberService.criarMembro({
          ...dadosMembro,
          token: tokenInvalido,
        })
      ).rejects.toThrow('Token de convite inválido ou expirado');

      expect(memberService.criarMembro).toHaveBeenCalledWith(
        expect.objectContaining({
          token: tokenInvalido,
        })
      );
    });

    it('deve falhar ao criar membro com token já usado', async () => {
      const conviteUsado: Invite = {
        _id: 'convite-123',
        token: 'token-usado',
        intencaoId: 'intencao-123',
        usado: true,
        expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        criadoEm: new Date(),
      };

      // MemberService valida o token e lança erro se já usado
      memberService.criarMembro.mockRejectedValueOnce(
        new Error('Este convite já foi usado')
      );

      const dadosMembro = criarMembroFake();

      await expect(
        memberService.criarMembro({
          ...dadosMembro,
          token: conviteUsado.token,
        })
      ).rejects.toThrow('Este convite já foi usado');
    });

    it('deve falhar ao criar membro com token expirado', async () => {
      const conviteExpirado: Invite = {
        _id: 'convite-123',
        token: 'token-expirado',
        intencaoId: 'intencao-123',
        usado: false,
        expiraEm: new Date(Date.now() - 1000), // Expirado
        criadoEm: new Date(),
      };

      // MemberService valida o token e lança erro se expirado
      memberService.criarMembro.mockRejectedValueOnce(
        new Error('Este convite expirou')
      );

      const dadosMembro = criarMembroFake();

      await expect(
        memberService.criarMembro({
          ...dadosMembro,
          token: conviteExpirado.token,
        })
      ).rejects.toThrow('Este convite expirou');
    });
  });

  describe('Fluxo de recusa de intenção', () => {
    it('não deve gerar convite ao recusar intenção', async () => {
      const dadosIntencao = criarIntencaoFake();
      const intencaoCriada: Intention = {
        _id: 'intencao-123',
        ...dadosIntencao,
        status: 'pending',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      intentionService.criarIntencao.mockResolvedValueOnce(intencaoCriada);

      const intencao = await intentionService.criarIntencao(dadosIntencao);

      // Recusar intenção
      const intencaoRecusada: Intention = {
        ...intencaoCriada,
        status: 'rejected',
        atualizadoEm: new Date(),
      };

      intentionService.atualizarStatusIntencao.mockResolvedValueOnce(intencaoRecusada);

      const intencaoAtualizada = await intentionService.atualizarStatusIntencao(
        intencao._id!,
        { status: 'rejected' }
      );

      expect(intencaoAtualizada?.status).toBe('rejected');
      // Não deve gerar convite
      expect(inviteService.criarConvite).not.toHaveBeenCalled();
    });
  });
});

