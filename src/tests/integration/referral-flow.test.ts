/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

/**
 * Testes de Integração - Fluxo de Indicações
 * 
 * Testa o fluxo completo de indicações:
 * 1. Criar indicação
 * 2. Atualizar status da indicação
 * 3. Validar transições de status
 */

import { ReferralService } from '@/services/ReferralService';
import { MemberRepository } from '@/lib/repositories/MemberRepository';
import { criarIndicacaoFake, criarMembroFake } from '@/tests/helpers/faker';
import { Referral, ReferralStatus } from '@/types/referral';
import { Member } from '@/types/member';
import { BusinessError } from '@/lib/errors/BusinessError';

jest.mock('@/services/ReferralService');
jest.mock('@/lib/repositories/MemberRepository');
jest.mock('@/lib/mongodb', () => ({
  getDatabase: jest.fn(),
}));

describe('Fluxo de Integração: Indicações', () => {
  let referralService: jest.Mocked<ReferralService>;
  let memberRepository: jest.Mocked<MemberRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    referralService = {
      criarIndicacao: jest.fn(),
      buscarIndicacaoPorId: jest.fn(),
      atualizarStatusIndicacao: jest.fn(),
      buscarTodasIndicacoes: jest.fn(),
    } as any;

    memberRepository = {
      buscarPorId: jest.fn(),
    } as any;

    (ReferralService as jest.MockedClass<typeof ReferralService>).mockImplementation(
      () => referralService
    );
    (MemberRepository as jest.MockedClass<typeof MemberRepository>).mockImplementation(
      () => memberRepository
    );
  });

  describe('Fluxo completo de indicação', () => {
    it('deve completar o fluxo: criar indicação → atualizar status', async () => {
      // 1. Criar membros (indicador e indicado)
      const membroIndicador: Member = {
        _id: 'membro-indicador-123',
        ...criarMembroFake(undefined, true),
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      const membroIndicado: Member = {
        _id: 'membro-indicado-456',
        ...criarMembroFake(undefined, true),
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      memberRepository.buscarPorId
        .mockResolvedValueOnce(membroIndicador)
        .mockResolvedValueOnce(membroIndicado);

      // 2. Criar indicação
      const dadosIndicacao = criarIndicacaoFake(
        membroIndicador._id!,
        membroIndicado._id!
      );

      const indicacaoCriada: Referral = {
        _id: 'indicacao-123',
        ...dadosIndicacao,
        status: 'nova',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      referralService.criarIndicacao.mockResolvedValueOnce(indicacaoCriada);

      const indicacao = await referralService.criarIndicacao(
        membroIndicador._id!,
        dadosIndicacao
      );

      expect(indicacao.status).toBe('nova');
      expect(indicacao.membroIndicadorId).toBe(membroIndicador._id);
      expect(indicacao.membroIndicadoId).toBe(membroIndicado._id);

      // 3. Atualizar status: nova → em-contato
      const indicacaoEmContato: Referral = {
        ...indicacaoCriada,
        status: 'em-contato',
        atualizadoEm: new Date(),
      };

      referralService.buscarIndicacaoPorId.mockResolvedValueOnce(indicacaoCriada);
      referralService.atualizarStatusIndicacao.mockResolvedValueOnce(indicacaoEmContato);

      const indicacaoAtualizada = await referralService.atualizarStatusIndicacao(
        indicacao._id!,
        { status: 'em-contato' }
      );

      expect(indicacaoAtualizada?.status).toBe('em-contato');

      // 4. Atualizar status: em-contato → fechada
      const indicacaoFechada: Referral = {
        ...indicacaoEmContato,
        status: 'fechada',
        atualizadoEm: new Date(),
      };

      referralService.buscarIndicacaoPorId.mockResolvedValueOnce(indicacaoEmContato);
      referralService.atualizarStatusIndicacao.mockResolvedValueOnce(indicacaoFechada);

      const indicacaoFinal = await referralService.atualizarStatusIndicacao(
        indicacao._id!,
        { status: 'fechada' }
      );

      expect(indicacaoFinal?.status).toBe('fechada');
    });

    it('deve falhar ao tentar transição inválida (nova → fechada)', async () => {
      const indicacaoNova: Referral = {
        _id: 'indicacao-123',
        ...criarIndicacaoFake('membro-1', 'membro-2'),
        status: 'nova',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      referralService.buscarIndicacaoPorId.mockResolvedValueOnce(indicacaoNova);
      referralService.atualizarStatusIndicacao.mockRejectedValueOnce(
        new BusinessError(
          'Transição de status inválida',
          'Não é possível alterar o status de "nova" para "fechada"',
          409
        )
      );

      await expect(
        referralService.atualizarStatusIndicacao(indicacaoNova._id!, {
          status: 'fechada',
        })
      ).rejects.toThrow(BusinessError);
    });

    it('deve falhar ao tentar transição inválida (fechada → em-contato)', async () => {
      const indicacaoFechada: Referral = {
        _id: 'indicacao-123',
        ...criarIndicacaoFake('membro-1', 'membro-2'),
        status: 'fechada',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      referralService.buscarIndicacaoPorId.mockResolvedValueOnce(indicacaoFechada);
      referralService.atualizarStatusIndicacao.mockRejectedValueOnce(
        new BusinessError(
          'Transição de status inválida',
          'Não é possível alterar o status de "fechada" para "em-contato"',
          409
        )
      );

      await expect(
        referralService.atualizarStatusIndicacao(indicacaoFechada._id!, {
          status: 'em-contato',
        })
      ).rejects.toThrow(BusinessError);
    });

    it('deve falhar ao criar indicação com membro inativo', async () => {
      const membroInativo: Member = {
        _id: 'membro-inativo',
        ...criarMembroFake(undefined, false),
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      memberRepository.buscarPorId.mockResolvedValueOnce(membroInativo);

      referralService.criarIndicacao.mockRejectedValueOnce(
        new BusinessError(
          'Membro inativo',
          'Apenas membros ativos podem criar indicações',
          403
        )
      );

      const dadosIndicacao = criarIndicacaoFake('membro-inativo', 'membro-2');

      await expect(
        referralService.criarIndicacao('membro-inativo', dadosIndicacao)
      ).rejects.toThrow(BusinessError);
    });

    it('deve falhar ao criar auto-indicação', async () => {
      const membroId = 'membro-123';

      referralService.criarIndicacao.mockRejectedValueOnce(
        new BusinessError(
          'Auto-indicação não permitida',
          'Você não pode indicar para si mesmo',
          400
        )
      );

      const dadosIndicacao = criarIndicacaoFake(membroId, membroId); // Mesmo ID

      await expect(
        referralService.criarIndicacao(membroId, dadosIndicacao)
      ).rejects.toThrow(BusinessError);
    });
  });
});

