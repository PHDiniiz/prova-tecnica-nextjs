import { NoticeService } from '../NoticeService';
import { NoticeRepository } from '@/lib/repositories/NoticeRepository';
import { Notice, NoticeType } from '@/types/notice';
import { BusinessError } from '@/lib/errors/BusinessError';

jest.mock('@/lib/mongodb');
jest.mock('@/lib/repositories/NoticeRepository');

describe('NoticeService', () => {
  let service: NoticeService;
  let mockRepository: jest.Mocked<NoticeRepository>;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      collection: jest.fn(),
    };

    mockRepository = {
      criar: jest.fn(),
      buscarTodos: jest.fn(),
      buscarAtivosPublicos: jest.fn(),
      buscarPorId: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
    } as any;

    const { getDatabase } = require('@/lib/mongodb');
    getDatabase.mockResolvedValue(mockDb);

    (NoticeRepository as jest.MockedClass<typeof NoticeRepository>).mockImplementation(
      () => mockRepository
    );

    service = new NoticeService();
  });

  describe('criarAviso', () => {
    it('deve criar um aviso com sucesso', async () => {
      const avisoCriado = {
        _id: '123',
        titulo: 'Aviso Importante',
        conteudo: 'Este é um aviso importante.',
        tipo: 'info' as NoticeType,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockRepository.criar.mockResolvedValueOnce(avisoCriado);

      const resultado = await service.criarAviso({
        titulo: 'Aviso Importante',
        conteudo: 'Este é um aviso importante.',
        tipo: 'info',
      });

      expect(resultado).toEqual(avisoCriado);
      expect(mockRepository.criar).toHaveBeenCalled();
    });

    it('deve lançar erro para dados inválidos', async () => {
      await expect(
        service.criarAviso({
          titulo: 'AB', // Muito curto
          conteudo: 'Curto',
          tipo: 'info',
        })
      ).rejects.toThrow();
    });
  });

  describe('listarAvisos', () => {
    it('deve listar avisos com filtro', async () => {
      const avisos = [
        {
          _id: '123',
          titulo: 'Aviso',
          conteudo: 'Conteúdo',
          tipo: 'info' as NoticeType,
          ativo: true,
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      mockRepository.buscarTodos.mockResolvedValueOnce(avisos);

      const resultado = await service.listarAvisos({ tipo: 'info' });

      expect(resultado).toEqual(avisos);
      expect(mockRepository.buscarTodos).toHaveBeenCalledWith({ tipo: 'info' });
    });
  });

  describe('listarAvisosPublicos', () => {
    it('deve listar apenas avisos ativos', async () => {
      const avisos = [
        {
          _id: '123',
          titulo: 'Aviso',
          conteudo: 'Conteúdo',
          tipo: 'info' as NoticeType,
          ativo: true,
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      mockRepository.buscarAtivosPublicos.mockResolvedValueOnce(avisos);

      const resultado = await service.listarAvisosPublicos();

      expect(resultado).toEqual(avisos);
      expect(mockRepository.buscarAtivosPublicos).toHaveBeenCalled();
    });
  });

  describe('atualizarAviso', () => {
    it('deve atualizar um aviso com sucesso', async () => {
      const avisoExistente = {
        _id: '123',
        titulo: 'Aviso',
        conteudo: 'Conteúdo',
        tipo: 'info' as NoticeType,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      const avisoAtualizado = {
        ...avisoExistente,
        ativo: false,
      };

      mockRepository.buscarPorId.mockResolvedValueOnce(avisoExistente);
      mockRepository.atualizar.mockResolvedValueOnce(avisoAtualizado);

      const resultado = await service.atualizarAviso('123', { ativo: false });

      expect(resultado).toEqual(avisoAtualizado);
      expect(mockRepository.atualizar).toHaveBeenCalledWith('123', { ativo: false });
    });

    it('deve lançar erro se aviso não for encontrado', async () => {
      mockRepository.buscarPorId.mockResolvedValueOnce(null);

      await expect(service.atualizarAviso('inexistente', { ativo: false })).rejects.toThrow(
        BusinessError
      );
    });
  });

  describe('deletarAviso', () => {
    it('deve deletar um aviso com sucesso', async () => {
      const avisoExistente = {
        _id: '123',
        titulo: 'Aviso',
        conteudo: 'Conteúdo',
        tipo: 'info' as NoticeType,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockRepository.buscarPorId.mockResolvedValueOnce(avisoExistente);
      mockRepository.deletar.mockResolvedValueOnce(undefined);

      await service.deletarAviso('123');

      expect(mockRepository.deletar).toHaveBeenCalledWith('123');
    });

    it('deve lançar erro se aviso não for encontrado', async () => {
      mockRepository.buscarPorId.mockResolvedValueOnce(null);

      await expect(service.deletarAviso('inexistente')).rejects.toThrow(BusinessError);
    });
  });
});

