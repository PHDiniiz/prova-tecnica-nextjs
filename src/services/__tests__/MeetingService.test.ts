import { MeetingService } from '../MeetingService';
import { MeetingRepository } from '@/lib/repositories/MeetingRepository';
import { MemberRepository } from '@/lib/repositories/MemberRepository';
import { Meeting, CriarMeetingDTO } from '@/types/meeting';
import { BusinessError } from '@/lib/errors/BusinessError';

jest.mock('@/lib/mongodb');
jest.mock('@/lib/repositories/MeetingRepository');
jest.mock('@/lib/repositories/MemberRepository');

describe('MeetingService', () => {
  let service: MeetingService;
  let mockMeetingRepository: jest.Mocked<MeetingRepository>;
  let mockMemberRepository: jest.Mocked<MemberRepository>;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      collection: jest.fn(),
    };

    mockMeetingRepository = {
      criar: jest.fn(),
      buscarPorId: jest.fn(),
      buscarTodas: jest.fn(),
      atualizar: jest.fn(),
      registrarCheckIn: jest.fn(),
    } as any;

    mockMemberRepository = {
      buscarPorId: jest.fn(),
    } as any;

    const { getDatabase } = require('@/lib/mongodb');
    getDatabase.mockResolvedValue(mockDb);

    (MeetingRepository as jest.MockedClass<typeof MeetingRepository>).mockImplementation(
      () => mockMeetingRepository
    );

    (MemberRepository as jest.MockedClass<typeof MemberRepository>).mockImplementation(
      () => mockMemberRepository
    );

    service = new MeetingService();
  });

  describe('criarReuniao', () => {
    it('deve criar uma reunião com sucesso', async () => {
      const membro1 = {
        _id: 'membro1',
        nome: 'João',
        email: 'joao@test.com',
        empresa: 'Empresa A',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      const membro2 = {
        _id: 'membro2',
        nome: 'Maria',
        email: 'maria@test.com',
        empresa: 'Empresa B',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      const reuniaoCriada: Meeting = {
        _id: '123',
        membro1Id: 'membro1',
        membro2Id: 'membro2',
        dataReuniao: new Date(),
        checkIns: [],
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockMemberRepository.buscarPorId
        .mockResolvedValueOnce(membro1)
        .mockResolvedValueOnce(membro2);
      mockMeetingRepository.criar.mockResolvedValueOnce(reuniaoCriada);

      const dto: CriarMeetingDTO = {
        membro1Id: 'membro1',
        membro2Id: 'membro2',
        dataReuniao: new Date(),
      };

      const resultado = await service.criarReuniao(dto);

      expect(resultado).toEqual(reuniaoCriada);
      expect(mockMeetingRepository.criar).toHaveBeenCalled();
    });

    it('deve lançar erro se membros forem iguais', async () => {
      const dto: CriarMeetingDTO = {
        membro1Id: 'membro1',
        membro2Id: 'membro1', // Mesmo membro
        dataReuniao: new Date(),
      };

      await expect(service.criarReuniao(dto)).rejects.toThrow(BusinessError);
    });

    it('deve lançar erro se membro não for encontrado', async () => {
      mockMemberRepository.buscarPorId.mockResolvedValueOnce(null);

      const dto: CriarMeetingDTO = {
        membro1Id: 'membro-inexistente',
        membro2Id: 'membro2',
        dataReuniao: new Date(),
      };

      await expect(service.criarReuniao(dto)).rejects.toThrow(BusinessError);
    });

    it('deve lançar erro se membro estiver inativo', async () => {
      const membroInativo = {
        _id: 'membro1',
        nome: 'João',
        email: 'joao@test.com',
        empresa: 'Empresa A',
        ativo: false, // Inativo
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockMemberRepository.buscarPorId.mockResolvedValueOnce(membroInativo);

      const dto: CriarMeetingDTO = {
        membro1Id: 'membro1',
        membro2Id: 'membro2',
        dataReuniao: new Date(),
      };

      await expect(service.criarReuniao(dto)).rejects.toThrow(BusinessError);
    });
  });

  describe('registrarCheckIn', () => {
    it('deve registrar check-in com sucesso', async () => {
      const reuniao: Meeting = {
        _id: '123',
        membro1Id: 'membro1',
        membro2Id: 'membro2',
        dataReuniao: new Date(),
        checkIns: [],
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      const reuniaoAtualizada = {
        ...reuniao,
        checkIns: [
          {
            membroId: 'membro1',
            dataCheckIn: new Date(),
            presente: true,
          },
        ],
      };

      mockMeetingRepository.buscarPorId.mockResolvedValueOnce(reuniao);
      mockMeetingRepository.registrarCheckIn.mockResolvedValueOnce(reuniaoAtualizada);

      const resultado = await service.registrarCheckIn('123', 'membro1', true);

      expect(resultado.checkIns).toHaveLength(1);
      expect(mockMeetingRepository.registrarCheckIn).toHaveBeenCalled();
    });

    it('deve lançar erro se membro não fizer parte da reunião', async () => {
      const reuniao: Meeting = {
        _id: '123',
        membro1Id: 'membro1',
        membro2Id: 'membro2',
        dataReuniao: new Date(),
        checkIns: [],
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      mockMeetingRepository.buscarPorId.mockResolvedValueOnce(reuniao);

      await expect(
        service.registrarCheckIn('123', 'membro-inexistente', true)
      ).rejects.toThrow(BusinessError);
    });
  });
});

