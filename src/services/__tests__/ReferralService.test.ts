import { ReferralService } from '../ReferralService';
import { ReferralRepository } from '@/lib/repositories/ReferralRepository';
import { MemberRepository } from '@/lib/repositories/MemberRepository';
import { BusinessError } from '@/lib/errors/BusinessError';
import { Referral, ReferralStatus } from '@/types/referral';
import { ZodError } from 'zod';

// Mock do MongoDB e Repositories
jest.mock('@/lib/mongodb', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('@/lib/repositories/ReferralRepository');
jest.mock('@/lib/repositories/MemberRepository');

describe('ReferralService', () => {
  let service: ReferralService;
  let mockReferralRepository: jest.Mocked<ReferralRepository>;
  let mockMemberRepository: jest.Mocked<MemberRepository>;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      collection: jest.fn(),
    };

    mockReferralRepository = {
      criar: jest.fn(),
      buscarTodas: jest.fn(),
      buscarPorId: jest.fn(),
      atualizarStatus: jest.fn(),
    } as any;

    mockMemberRepository = {
      buscarPorId: jest.fn(),
    } as any;

    const { getDatabase } = require('@/lib/mongodb');
    getDatabase.mockResolvedValue(mockDb);

    (ReferralRepository as jest.MockedClass<typeof ReferralRepository>).mockImplementation(
      () => mockReferralRepository
    );

    (MemberRepository as jest.MockedClass<typeof MemberRepository>).mockImplementation(
      () => mockMemberRepository
    );

    service = new ReferralService();
  });

  describe('criarIndicacao', () => {
    const membroIndicadorId = 'membro-indicador-123';
    const membroIndicadoId = 'membro-indicado-456';

    const membroAtivo = {
      _id: membroIndicadorId,
      nome: 'João Silva',
      email: 'joao@test.com',
      empresa: 'Empresa A',
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    const membroIndicadoAtivo = {
      _id: membroIndicadoId,
      nome: 'Maria Santos',
      email: 'maria@test.com',
      empresa: 'Empresa B',
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    const dadosIndicacao = {
      membroIndicadoId,
      empresaContato: 'Empresa ABC',
      descricao: 'Indicação de cliente potencial para serviços de consultoria',
      valorEstimado: 50000,
    };

    it('deve criar uma indicação com dados válidos', async () => {
      mockMemberRepository.buscarPorId
        .mockResolvedValueOnce(membroAtivo as any)
        .mockResolvedValueOnce(membroIndicadoAtivo as any);

      const indicacaoCriada: Referral = {
        _id: '123',
        membroIndicadorId,
        membroIndicadoId,
        ...dadosIndicacao,
        status: 'nova',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockReferralRepository.criar.mockResolvedValueOnce(indicacaoCriada);

      const resultado = await service.criarIndicacao(membroIndicadorId, dadosIndicacao);

      expect(resultado).toEqual(indicacaoCriada);
      expect(mockMemberRepository.buscarPorId).toHaveBeenCalledTimes(2);
      expect(mockReferralRepository.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          membroIndicadorId,
          membroIndicadoId,
          status: 'nova',
        })
      );
    });

    it('deve lançar erro para auto-indicação', async () => {
      await expect(
        service.criarIndicacao(membroIndicadorId, {
          ...dadosIndicacao,
          membroIndicadoId: membroIndicadorId, // Mesmo ID
        })
      ).rejects.toThrow(BusinessError);

      expect(mockReferralRepository.criar).not.toHaveBeenCalled();
    });

    it('deve lançar erro se membro indicador não for encontrado', async () => {
      mockMemberRepository.buscarPorId.mockResolvedValueOnce(null);

      await expect(
        service.criarIndicacao(membroIndicadorId, dadosIndicacao)
      ).rejects.toThrow(BusinessError);

      expect(mockReferralRepository.criar).not.toHaveBeenCalled();
    });

    it('deve lançar erro se membro indicador estiver inativo', async () => {
      mockMemberRepository.buscarPorId.mockResolvedValueOnce({
        ...membroAtivo,
        ativo: false,
      } as any);

      await expect(
        service.criarIndicacao(membroIndicadorId, dadosIndicacao)
      ).rejects.toThrow(BusinessError);

      expect(mockReferralRepository.criar).not.toHaveBeenCalled();
    });

    it('deve lançar erro se membro indicado estiver inativo', async () => {
      mockMemberRepository.buscarPorId
        .mockResolvedValueOnce(membroAtivo as any)
        .mockResolvedValueOnce({
          ...membroIndicadoAtivo,
          ativo: false,
        } as any);

      await expect(
        service.criarIndicacao(membroIndicadorId, dadosIndicacao)
      ).rejects.toThrow(BusinessError);

      expect(mockReferralRepository.criar).not.toHaveBeenCalled();
    });

    it('deve lançar ZodError para dados inválidos', async () => {
      const dadosInvalidos = {
        membroIndicadoId: '',
        empresaContato: 'A', // Muito curto
        descricao: 'Curto', // Muito curto
      };

      await expect(
        service.criarIndicacao(membroIndicadorId, dadosInvalidos as any)
      ).rejects.toThrow(ZodError);
    });
  });

  describe('atualizarStatusIndicacao', () => {
    const indicacaoId = 'indicacao-123';
    const indicacaoNova: Referral = {
      _id: indicacaoId,
      membroIndicadorId: 'membro-1',
      membroIndicadoId: 'membro-2',
      empresaContato: 'Empresa ABC',
      descricao: 'Descrição da indicação',
      status: 'nova',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    it('deve atualizar status de nova para em-contato', async () => {
      mockReferralRepository.buscarPorId.mockResolvedValueOnce(indicacaoNova);

      const indicacaoAtualizada: Referral = {
        ...indicacaoNova,
        status: 'em-contato',
        atualizadoEm: new Date(),
      };

      mockReferralRepository.atualizarStatus.mockResolvedValueOnce(indicacaoAtualizada);

      const resultado = await service.atualizarStatusIndicacao(indicacaoId, {
        status: 'em-contato',
      });

      expect(resultado).toEqual(indicacaoAtualizada);
      expect(mockReferralRepository.atualizarStatus).toHaveBeenCalledWith(
        indicacaoId,
        'em-contato',
        undefined
      );
    });

    it('deve atualizar status de em-contato para fechada', async () => {
      const indicacaoEmContato: Referral = {
        ...indicacaoNova,
        status: 'em-contato',
      };

      mockReferralRepository.buscarPorId.mockResolvedValueOnce(indicacaoEmContato);

      const indicacaoFechada: Referral = {
        ...indicacaoEmContato,
        status: 'fechada',
        atualizadoEm: new Date(),
      };

      mockReferralRepository.atualizarStatus.mockResolvedValueOnce(indicacaoFechada);

      const resultado = await service.atualizarStatusIndicacao(indicacaoId, {
        status: 'fechada',
      });

      expect(resultado).toEqual(indicacaoFechada);
    });

    it('deve lançar erro para transição inválida (nova → fechada)', async () => {
      mockReferralRepository.buscarPorId.mockResolvedValueOnce(indicacaoNova);

      await expect(
        service.atualizarStatusIndicacao(indicacaoId, { status: 'fechada' })
      ).rejects.toThrow(BusinessError);

      expect(mockReferralRepository.atualizarStatus).not.toHaveBeenCalled();
    });

    it('deve lançar erro para transição inválida (fechada → em-contato)', async () => {
      const indicacaoFechada: Referral = {
        ...indicacaoNova,
        status: 'fechada',
      };

      mockReferralRepository.buscarPorId.mockResolvedValueOnce(indicacaoFechada);

      await expect(
        service.atualizarStatusIndicacao(indicacaoId, { status: 'em-contato' })
      ).rejects.toThrow(BusinessError);
    });

    it('deve lançar erro se indicação não for encontrada', async () => {
      mockReferralRepository.buscarPorId.mockResolvedValueOnce(null);

      await expect(
        service.atualizarStatusIndicacao(indicacaoId, { status: 'em-contato' })
      ).rejects.toThrow(BusinessError);
    });

    it('deve atualizar observações junto com o status', async () => {
      mockReferralRepository.buscarPorId.mockResolvedValueOnce(indicacaoNova);

      const indicacaoAtualizada: Referral = {
        ...indicacaoNova,
        status: 'em-contato',
        observacoes: 'Primeiro contato realizado',
        atualizadoEm: new Date(),
      };

      mockReferralRepository.atualizarStatus.mockResolvedValueOnce(indicacaoAtualizada);

      await service.atualizarStatusIndicacao(indicacaoId, {
        status: 'em-contato',
        observacoes: 'Primeiro contato realizado',
      });

      expect(mockReferralRepository.atualizarStatus).toHaveBeenCalledWith(
        indicacaoId,
        'em-contato',
        'Primeiro contato realizado'
      );
    });
  });

  describe('buscarTodasIndicacoes', () => {
    it('deve buscar todas as indicações sem filtro', async () => {
      const indicacoes: Referral[] = [
        {
          _id: '1',
          membroIndicadorId: 'membro-1',
          membroIndicadoId: 'membro-2',
          empresaContato: 'Empresa A',
          descricao: 'Descrição 1',
          status: 'nova',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      mockReferralRepository.buscarTodas.mockResolvedValueOnce(indicacoes);

      const resultado = await service.buscarTodasIndicacoes();

      expect(resultado).toEqual(indicacoes);
      expect(mockReferralRepository.buscarTodas).toHaveBeenCalledWith(undefined);
    });

    it('deve buscar indicações com filtro', async () => {
      const indicacoes: Referral[] = [];
      const filtro = { status: 'nova' as ReferralStatus };

      mockReferralRepository.buscarTodas.mockResolvedValueOnce(indicacoes);

      const resultado = await service.buscarTodasIndicacoes(filtro);

      expect(resultado).toEqual(indicacoes);
      expect(mockReferralRepository.buscarTodas).toHaveBeenCalledWith(filtro);
    });
  });
});

