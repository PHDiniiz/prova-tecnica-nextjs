/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { MemberService } from '../MemberService';
import { MemberRepository } from '@/lib/repositories/MemberRepository';
import { InviteService } from '../InviteService';
import { criarMembroFake, criarConviteFake } from '@/tests/helpers/faker';
import { Member } from '@/types/member';
import { Invite } from '@/types/invite';
import { ZodError } from 'zod';
import { getDatabase } from '@/lib/mongodb';

jest.mock('@/lib/mongodb', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('@/lib/repositories/MemberRepository');
jest.mock('../InviteService');

describe('MemberService', () => {
  let service: MemberService;
  let mockRepository: jest.Mocked<MemberRepository>;
  let mockInviteService: jest.Mocked<InviteService>;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      collection: jest.fn(),
    };

    mockRepository = {
      criar: jest.fn(),
      buscarTodos: jest.fn(),
      buscarPorId: jest.fn(),
      buscarPorEmail: jest.fn(),
      buscarAtivos: jest.fn(),
    } as any;

    mockInviteService = {
      validarConvite: jest.fn(),
      marcarComoUsado: jest.fn(),
    } as any;

    (getDatabase as jest.Mock).mockResolvedValue(mockDb);

    (MemberRepository as jest.MockedClass<typeof MemberRepository>).mockImplementation(
      () => mockRepository
    );

    (InviteService as jest.MockedClass<typeof InviteService>).mockImplementation(
      () => mockInviteService
    );

    service = new MemberService();
  });

  describe('criarMembro', () => {
    const tokenValido = 'token-valido-123';
    const intencaoId = 'intencao-123';
    const conviteValido: Invite = {
      _id: 'convite-123',
      token: tokenValido,
      intencaoId,
      usado: false,
      expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      criadoEm: new Date(),
    };

    const dadosMembro = {
      nome: 'João Silva',
      email: 'joao@test.com',
      telefone: '+55 11 99999-9999',
      empresa: 'Empresa XYZ',
      linkedin: 'https://linkedin.com/in/joaosilva',
      areaAtuacao: 'Vendas',
      token: tokenValido,
    };

    it('deve criar um membro com dados válidos e token válido', async () => {
      mockInviteService.validarConvite.mockResolvedValueOnce(conviteValido);
      mockRepository.buscarPorEmail.mockResolvedValueOnce(null);

      const membroCriado: Member = {
        _id: '123',
        ...dadosMembro,
        intencaoId,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockRepository.criar.mockResolvedValueOnce(membroCriado);

      const resultado = await service.criarMembro(dadosMembro);

      expect(resultado).toEqual(membroCriado);
      expect(mockInviteService.validarConvite).toHaveBeenCalledWith({ token: tokenValido });
      expect(mockRepository.buscarPorEmail).toHaveBeenCalledWith(dadosMembro.email);
      expect(mockRepository.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: dadosMembro.nome,
          email: dadosMembro.email,
          intencaoId,
          ativo: true,
        })
      );
      expect(mockInviteService.marcarComoUsado).toHaveBeenCalledWith(tokenValido);
    });

    it('deve lançar erro se token for inválido', async () => {
      mockInviteService.validarConvite.mockResolvedValueOnce(null);

      await expect(service.criarMembro(dadosMembro)).rejects.toThrow(
        'Token de convite inválido ou expirado'
      );

      expect(mockRepository.criar).not.toHaveBeenCalled();
    });

    it('deve lançar erro se email já estiver cadastrado', async () => {
      mockInviteService.validarConvite.mockResolvedValueOnce(conviteValido);
      mockRepository.buscarPorEmail.mockResolvedValueOnce({
        _id: 'existente',
        email: dadosMembro.email,
        nome: 'Membro Existente',
        empresa: 'Empresa',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      } as Member);

      await expect(service.criarMembro(dadosMembro)).rejects.toThrow(
        'Este email já está cadastrado'
      );

      expect(mockRepository.criar).not.toHaveBeenCalled();
    });

    it('deve lançar ZodError para dados inválidos', async () => {
      const dadosInvalidos = {
        nome: 'A', // Muito curto
        email: 'email-invalido',
        empresa: 'E', // Muito curto
        token: '',
      };

      await expect(service.criarMembro(dadosInvalidos as any)).rejects.toThrow(ZodError);
    });

    it('deve criar membro sem campos opcionais', async () => {
      const dadosMinimos = {
        nome: 'João Silva',
        email: 'joao@test.com',
        empresa: 'Empresa XYZ',
        token: tokenValido,
      };

      mockInviteService.validarConvite.mockResolvedValueOnce(conviteValido);
      mockRepository.buscarPorEmail.mockResolvedValueOnce(null);

      const membroCriado: Member = {
        _id: '123',
        ...dadosMinimos,
        intencaoId,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockRepository.criar.mockResolvedValueOnce(membroCriado);

      const resultado = await service.criarMembro(dadosMinimos);

      expect(resultado).toEqual(membroCriado);
      expect(mockRepository.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: dadosMinimos.nome,
          email: dadosMinimos.email,
          empresa: dadosMinimos.empresa,
        })
      );
    });
  });

  describe('buscarTodosMembros', () => {
    it('deve buscar todos os membros', async () => {
      const membros: Member[] = [
        {
          _id: '1',
          ...criarMembroFake(),
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
        {
          _id: '2',
          ...criarMembroFake(),
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      mockRepository.buscarTodos.mockResolvedValueOnce(membros);

      const resultado = await service.buscarTodosMembros();

      expect(resultado).toEqual(membros);
      expect(mockRepository.buscarTodos).toHaveBeenCalled();
    });
  });

  describe('buscarMembroPorId', () => {
    it('deve buscar um membro por ID', async () => {
      const membro: Member = {
        _id: '123',
        ...criarMembroFake(),
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockRepository.buscarPorId.mockResolvedValueOnce(membro);

      const resultado = await service.buscarMembroPorId('123');

      expect(resultado).toEqual(membro);
      expect(mockRepository.buscarPorId).toHaveBeenCalledWith('123');
    });

    it('deve retornar null se membro não for encontrado', async () => {
      mockRepository.buscarPorId.mockResolvedValueOnce(null);

      const resultado = await service.buscarMembroPorId('inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('buscarMembrosAtivos', () => {
    it('deve buscar apenas membros ativos', async () => {
      const membrosAtivos: Member[] = [
        {
          _id: '1',
          ...criarMembroFake(undefined, true),
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

      mockRepository.buscarAtivos.mockResolvedValueOnce(membrosAtivos);

      const resultado = await service.buscarMembrosAtivos();

      expect(resultado).toEqual(membrosAtivos);
      expect(mockRepository.buscarAtivos).toHaveBeenCalled();
    });
  });
});

