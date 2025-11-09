import { getDatabase } from '@/lib/mongodb';
import { MemberRepository } from '@/lib/repositories/MemberRepository';
import { InviteService } from './InviteService';
import { Member, CriarMembroDTO } from '@/types/member';
import { z } from 'zod';

// Schema de validação para criar membro
const criarMembroSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  empresa: z.string().min(2, 'Empresa deve ter pelo menos 2 caracteres'),
  linkedin: z.string().url('LinkedIn deve ser uma URL válida').optional(),
  areaAtuacao: z.string().optional(),
  intencaoId: z.string().optional(),
  token: z.string().min(1, 'Token é obrigatório'),
});

/**
 * Serviço de aplicação para gerenciar membros
 */
export class MemberService {
  private repository: MemberRepository;
  private inviteService: InviteService;

  constructor() {
    this.repository = {} as MemberRepository;
    this.inviteService = new InviteService();
  }

  /**
   * Inicializa o repositório com a conexão do banco
   */
  private async initRepository() {
    if (!this.repository || !('db' in this.repository)) {
      const db = await getDatabase();
      this.repository = new MemberRepository(db);
    }
  }

  /**
   * Cria um novo membro a partir de um convite válido
   */
  async criarMembro(dto: CriarMembroDTO): Promise<Member> {
    await this.initRepository();

    // Valida os dados
    const dadosValidados = criarMembroSchema.parse(dto);

    // Valida o token do convite
    const convite = await this.inviteService.validarConvite({
      token: dadosValidados.token,
    });

    if (!convite) {
      throw new Error('Token de convite inválido ou expirado');
    }

    // Verifica se o email já está cadastrado
    const membroExistente = await this.repository.buscarPorEmail(
      dadosValidados.email
    );
    if (membroExistente) {
      throw new Error('Este email já está cadastrado');
    }

    // Cria o membro
    const membro: Omit<Member, '_id'> = {
      nome: dadosValidados.nome,
      email: dadosValidados.email,
      telefone: dadosValidados.telefone,
      empresa: dadosValidados.empresa,
      linkedin: dadosValidados.linkedin,
      areaAtuacao: dadosValidados.areaAtuacao,
      intencaoId: convite.intencaoId,
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    const novoMembro = await this.repository.criar(membro);

    // Marca o convite como usado
    await this.inviteService.marcarComoUsado(dadosValidados.token);

    return novoMembro;
  }

  /**
   * Busca todos os membros
   */
  async buscarTodosMembros(): Promise<Member[]> {
    await this.initRepository();
    return await this.repository.buscarTodos();
  }

  /**
   * Busca um membro por ID
   */
  async buscarMembroPorId(id: string): Promise<Member | null> {
    await this.initRepository();
    return await this.repository.buscarPorId(id);
  }

  /**
   * Busca membros ativos
   */
  async buscarMembrosAtivos(): Promise<Member[]> {
    await this.initRepository();
    return await this.repository.buscarAtivos();
  }
}

