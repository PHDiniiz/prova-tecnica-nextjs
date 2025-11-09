import { IntentionService } from '../IntentionService';
import { IntentionRepository } from '@/lib/repositories/IntentionRepository';
import { criarIntencaoFake } from '@/tests/helpers/faker';
import { Intention } from '@/types/intention';
import { ZodError } from 'zod';

// Mock do MongoDB e Repositories
jest.mock('@/lib/mongodb', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('@/lib/repositories/IntentionRepository');

describe('IntentionService', () => {
  let service: IntentionService;
  let mockRepository: jest.Mocked<IntentionRepository>;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock do database
    mockDb = {
      collection: jest.fn(),
    };

    // Mock do repository
    mockRepository = {
      criar: jest.fn(),
      buscarTodas: jest.fn(),
      buscarComPaginacao: jest.fn(),
      buscarPorId: jest.fn(),
      atualizarStatus: jest.fn(),
    } as any;

    // Mock do getDatabase para retornar o mockDb
    const { getDatabase } = require('@/lib/mongodb');
    getDatabase.mockResolvedValue(mockDb);

    // Mock do IntentionRepository constructor
    (IntentionRepository as jest.MockedClass<typeof IntentionRepository>).mockImplementation(
      () => mockRepository
    );

    service = new IntentionService();
  });

  describe('criarIntencao', () => {
    it('deve criar uma intenção com dados válidos', async () => {
      const dadosIntencao = criarIntencaoFake();
      const intencaoCriada: Intention = {
        _id: '123',
        ...dadosIntencao,
        status: 'pending',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockRepository.criar.mockResolvedValueOnce(intencaoCriada);

      const resultado = await service.criarIntencao(dadosIntencao);

      expect(resultado).toEqual(intencaoCriada);
      expect(mockRepository.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: dadosIntencao.nome,
          email: dadosIntencao.email,
          empresa: dadosIntencao.empresa,
          motivo: dadosIntencao.motivo,
          status: 'pending',
        })
      );
    });

    it('deve lançar erro ZodError para dados inválidos', async () => {
      const dadosInvalidos = {
        nome: 'A', // Muito curto
        email: 'email-invalido',
        empresa: 'E', // Muito curto
        motivo: 'Curto', // Muito curto
      };

      await expect(service.criarIntencao(dadosInvalidos as any)).rejects.toThrow(ZodError);
      expect(mockRepository.criar).not.toHaveBeenCalled();
    });

    it('deve definir status como pending ao criar', async () => {
      const dadosIntencao = criarIntencaoFake();
      const intencaoCriada: Intention = {
        _id: '123',
        ...dadosIntencao,
        status: 'pending',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockRepository.criar.mockResolvedValueOnce(intencaoCriada);

      await service.criarIntencao(dadosIntencao);

      expect(mockRepository.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
        })
      );
    });
  });

  describe('buscarTodasIntencoes', () => {
    it('deve buscar todas as intenções sem filtro', async () => {
      const intencoes: Intention[] = [
        {
          _id: '1',
          ...criarIntencaoFake(),
          status: 'pending',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
        {
          _id: '2',
          ...criarIntencaoFake(),
          status: 'approved',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      mockRepository.buscarTodas.mockResolvedValueOnce(intencoes);

      const resultado = await service.buscarTodasIntencoes();

      expect(resultado).toEqual(intencoes);
      expect(mockRepository.buscarTodas).toHaveBeenCalledWith(undefined);
    });

    it('deve buscar intenções com filtro de status', async () => {
      const intencoes: Intention[] = [
        {
          _id: '1',
          ...criarIntencaoFake(),
          status: 'pending',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      mockRepository.buscarTodas.mockResolvedValueOnce(intencoes);

      const resultado = await service.buscarTodasIntencoes({ status: 'pending' });

      expect(resultado).toEqual(intencoes);
      expect(mockRepository.buscarTodas).toHaveBeenCalledWith({ status: 'pending' });
    });
  });

  describe('buscarIntencoesComPaginacao', () => {
    it('deve buscar intenções com paginação', async () => {
      const intencoes: Intention[] = [
        {
          _id: '1',
          ...criarIntencaoFake(),
          status: 'pending',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      const resultadoPaginacao = {
        intencoes,
        total: 10,
        pagina: 1,
        limite: 20,
        totalPaginas: 1,
      };

      mockRepository.buscarComPaginacao.mockResolvedValueOnce(resultadoPaginacao);

      const resultado = await service.buscarIntencoesComPaginacao(undefined, 1, 20);

      expect(resultado).toEqual(resultadoPaginacao);
      expect(mockRepository.buscarComPaginacao).toHaveBeenCalledWith(undefined, 1, 20);
    });

    it('deve usar valores padrão para página e limite', async () => {
      const resultadoPaginacao = {
        intencoes: [],
        total: 0,
        pagina: 1,
        limite: 20,
        totalPaginas: 0,
      };

      mockRepository.buscarComPaginacao.mockResolvedValueOnce(resultadoPaginacao);

      await service.buscarIntencoesComPaginacao();

      expect(mockRepository.buscarComPaginacao).toHaveBeenCalledWith(undefined, 1, 20);
    });
  });

  describe('buscarIntencaoPorId', () => {
    it('deve buscar uma intenção por ID', async () => {
      const intencao: Intention = {
        _id: '123',
        ...criarIntencaoFake(),
        status: 'pending',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockRepository.buscarPorId.mockResolvedValueOnce(intencao);

      const resultado = await service.buscarIntencaoPorId('123');

      expect(resultado).toEqual(intencao);
      expect(mockRepository.buscarPorId).toHaveBeenCalledWith('123');
    });

    it('deve retornar null se intenção não for encontrada', async () => {
      mockRepository.buscarPorId.mockResolvedValueOnce(null);

      const resultado = await service.buscarIntencaoPorId('inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('atualizarStatusIntencao', () => {
    it('deve atualizar status de uma intenção', async () => {
      const intencaoAtualizada: Intention = {
        _id: '123',
        ...criarIntencaoFake(),
        status: 'approved',
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockRepository.atualizarStatus.mockResolvedValueOnce(intencaoAtualizada);

      const resultado = await service.atualizarStatusIntencao('123', { status: 'approved' });

      expect(resultado).toEqual(intencaoAtualizada);
      expect(mockRepository.atualizarStatus).toHaveBeenCalledWith('123', 'approved');
    });

    it('deve lançar erro para status inválido', async () => {
      await expect(
        service.atualizarStatusIntencao('123', { status: 'invalid' as any })
      ).rejects.toThrow('Status inválido');

      expect(mockRepository.atualizarStatus).not.toHaveBeenCalled();
    });

    it('deve aceitar status válidos', async () => {
      const statusValidos: Array<'pending' | 'approved' | 'rejected'> = [
        'pending',
        'approved',
        'rejected',
      ];

      for (const status of statusValidos) {
        mockRepository.atualizarStatus.mockResolvedValueOnce({
          _id: '123',
          ...criarIntencaoFake(),
          status,
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        });

        await service.atualizarStatusIntencao('123', { status });

        expect(mockRepository.atualizarStatus).toHaveBeenCalledWith('123', status);
      }
    });
  });
});

