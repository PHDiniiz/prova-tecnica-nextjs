/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { ObrigadoService } from '../ObrigadoService';
import { ObrigadoRepository } from '@/lib/repositories/ObrigadoRepository';
import { ReferralRepository } from '@/lib/repositories/ReferralRepository';
import { MemberRepository } from '@/lib/repositories/MemberRepository';
import { BusinessError } from '@/lib/errors/BusinessError';
import { Obrigado } from '@/types/obrigado';
import { Referral } from '@/types/referral';
import { Member } from '@/types/member';
import { ZodError } from 'zod';
import { criarIndicacaoFake, criarMembroFake } from '@/tests/helpers/faker';

jest.mock('@/lib/mongodb', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('@/lib/repositories/ObrigadoRepository');
jest.mock('@/lib/repositories/ReferralRepository');
jest.mock('@/lib/repositories/MemberRepository');

describe('ObrigadoService', () => {
  let service: ObrigadoService;
  let mockObrigadoRepository: jest.Mocked<ObrigadoRepository>;
  let mockReferralRepository: jest.Mocked<ReferralRepository>;
  let mockMemberRepository: jest.Mocked<MemberRepository>;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      collection: jest.fn(),
    };

    mockObrigadoRepository = {
      criar: jest.fn(),
      buscarTodosPublicos: jest.fn(),
      buscarComPaginacao: jest.fn(),
      buscarPorIndicacaoId: jest.fn(),
    } as any;

    mockReferralRepository = {
      buscarPorId: jest.fn(),
    } as any;

    mockMemberRepository = {
      buscarPorId: jest.fn(),
    } as any;

    const { getDatabase } = require('@/lib/mongodb');
    getDatabase.mockResolvedValue(mockDb);

    (ObrigadoRepository as jest.MockedClass<typeof ObrigadoRepository>).mockImplementation(
      () => mockObrigadoRepository
    );

    (ReferralRepository as jest.MockedClass<typeof ReferralRepository>).mockImplementation(
      () => mockReferralRepository
    );

    (MemberRepository as jest.MockedClass<typeof MemberRepository>).mockImplementation(
      () => mockMemberRepository
    );

    service = new ObrigadoService();
  });

  describe('criarObrigado', () => {
    const membroIndicadoId = 'membro-indicado-123';
    const membroIndicadorId = 'membro-indicador-456';
    const indicacaoId = 'indicacao-123';

    const indicacaoFechada: Referral = {
      _id: indicacaoId,
      ...criarIndicacaoFake(membroIndicadorId, membroIndicadoId),
      status: 'fechada',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    const membroIndicador: Member = {
      _id: membroIndicadorId,
      ...criarMembroFake(undefined, true),
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    const membroIndicado: Member = {
      _id: membroIndicadoId,
      ...criarMembroFake(undefined, true),
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    const dadosObrigado = {
      indicacaoId,
      mensagem: 'Muito obrigado pela indicação! O negócio foi fechado com sucesso.',
    };

    it('deve criar um obrigado com dados válidos', async () => {
      mockReferralRepository.buscarPorId.mockResolvedValueOnce(indicacaoFechada);
      mockObrigadoRepository.buscarPorIndicacaoId.mockResolvedValueOnce(null);
      mockMemberRepository.buscarPorId
        .mockResolvedValueOnce(membroIndicador)
        .mockResolvedValueOnce(membroIndicado);

      const obrigadoCriado: Obrigado = {
        _id: 'obrigado-123',
        ...dadosObrigado,
        membroIndicadorId,
        membroIndicadoId,
        publico: true,
        criadoEm: new Date(),
      };

      mockObrigadoRepository.criar.mockResolvedValueOnce(obrigadoCriado);

      const resultado = await service.criarObrigado(membroIndicadoId, dadosObrigado);

      expect(resultado).toEqual(obrigadoCriado);
      expect(mockReferralRepository.buscarPorId).toHaveBeenCalledWith(indicacaoId);
      expect(mockObrigadoRepository.buscarPorIndicacaoId).toHaveBeenCalledWith(indicacaoId);
      expect(mockObrigadoRepository.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          indicacaoId,
          membroIndicadorId,
          membroIndicadoId,
          mensagem: dadosObrigado.mensagem,
          publico: true,
        })
      );
    });

    it('deve lançar erro se indicação não for encontrada', async () => {
      mockReferralRepository.buscarPorId.mockResolvedValueOnce(null);

      await expect(
        service.criarObrigado(membroIndicadoId, dadosObrigado)
      ).rejects.toThrow(BusinessError);

      expect(mockObrigadoRepository.criar).not.toHaveBeenCalled();
    });

    it('deve lançar erro se indicação não estiver fechada', async () => {
      const indicacaoNova: Referral = {
        ...indicacaoFechada,
        status: 'nova',
      };

      mockReferralRepository.buscarPorId.mockResolvedValueOnce(indicacaoNova);

      await expect(
        service.criarObrigado(membroIndicadoId, dadosObrigado)
      ).rejects.toThrow(BusinessError);

      expect(mockObrigadoRepository.criar).not.toHaveBeenCalled();
    });

    it('deve lançar erro se membro não for o destinatário', async () => {
      mockReferralRepository.buscarPorId.mockResolvedValueOnce(indicacaoFechada);

      await expect(
        service.criarObrigado('outro-membro', dadosObrigado)
      ).rejects.toThrow(BusinessError);

      expect(mockObrigadoRepository.criar).not.toHaveBeenCalled();
    });

    it('deve lançar erro se já existir obrigado para a indicação', async () => {
      mockReferralRepository.buscarPorId.mockResolvedValueOnce(indicacaoFechada);
      mockObrigadoRepository.buscarPorIndicacaoId.mockResolvedValueOnce({
        _id: 'obrigado-existente',
        ...dadosObrigado,
        membroIndicadorId,
        membroIndicadoId,
        publico: true,
        criadoEm: new Date(),
      });

      await expect(
        service.criarObrigado(membroIndicadoId, dadosObrigado)
      ).rejects.toThrow(BusinessError);

      expect(mockObrigadoRepository.criar).not.toHaveBeenCalled();
    });

    it('deve lançar ZodError para dados inválidos', async () => {
      const dadosInvalidos = {
        indicacaoId: '',
        mensagem: 'Curto', // Muito curto
      };

      await expect(
        service.criarObrigado(membroIndicadoId, dadosInvalidos as any)
      ).rejects.toThrow(ZodError);
    });
  });

  describe('buscarTodosPublicos', () => {
    it('deve buscar todos os obrigados públicos', async () => {
      const obrigados: Obrigado[] = [
        {
          _id: '1',
          indicacaoId: 'indicacao-1',
          membroIndicadorId: 'membro-1',
          membroIndicadoId: 'membro-2',
          mensagem: 'Agradecimento 1',
          publico: true,
          criadoEm: new Date(),
        },
      ];

      mockObrigadoRepository.buscarTodosPublicos.mockResolvedValueOnce(obrigados);

      const resultado = await service.buscarTodosPublicos();

      expect(resultado).toEqual(obrigados);
      expect(mockObrigadoRepository.buscarTodosPublicos).toHaveBeenCalledWith(undefined);
    });

    it('deve buscar obrigados com filtro', async () => {
      const filtro = { membroIndicadorId: 'membro-1' };
      const obrigados: Obrigado[] = [];

      mockObrigadoRepository.buscarTodosPublicos.mockResolvedValueOnce(obrigados);

      const resultado = await service.buscarTodosPublicos(filtro);

      expect(resultado).toEqual(obrigados);
      expect(mockObrigadoRepository.buscarTodosPublicos).toHaveBeenCalledWith(filtro);
    });
  });
});

