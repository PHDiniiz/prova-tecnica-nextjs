import { getDatabase } from '@/lib/mongodb';
import { InviteRepository } from '@/lib/repositories/InviteRepository';
import { Invite, CriarConviteDTO, ValidarConviteDTO } from '@/src/types/invite';
import { randomBytes } from 'crypto';

/**
 * Serviço de aplicação para gerenciar convites
 */
export class InviteService {
  private repository: InviteRepository;

  constructor() {
    this.repository = {} as InviteRepository;
  }

  /**
   * Inicializa o repositório com a conexão do banco
   */
  private async initRepository() {
    if (!this.repository || !('db' in this.repository)) {
      const db = await getDatabase();
      this.repository = new InviteRepository(db);
    }
  }

  /**
   * Gera um token único para o convite
   */
  private gerarToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Cria um novo convite para uma intenção aprovada
   */
  async criarConvite(dto: CriarConviteDTO): Promise<Invite> {
    await this.initRepository();

    const token = this.gerarToken();
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 7); // Expira em 7 dias

    const convite: Omit<Invite, '_id'> = {
      token,
      intencaoId: dto.intencaoId,
      usado: false,
      expiraEm,
      criadoEm: new Date(),
    };

    const novoConvite = await this.repository.criar(convite);

    // Simula envio de email (console.log)
    console.log(
      `\n📧 Convite gerado para intenção ${dto.intencaoId}:\n` +
        `Link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register/${token}\n` +
        `Token: ${token}\n`
    );

    return novoConvite;
  }

  /**
   * Valida um token de convite
   */
  async validarConvite(dto: ValidarConviteDTO): Promise<Invite | null> {
    await this.initRepository();

    const convite = await this.repository.buscarPorToken(dto.token);

    if (!convite) {
      return null;
    }

    if (convite.usado) {
      throw new Error('Este convite já foi usado');
    }

    if (new Date() > convite.expiraEm) {
      throw new Error('Este convite expirou');
    }

    return convite;
  }

  /**
   * Marca um convite como usado
   */
  async marcarComoUsado(token: string): Promise<void> {
    await this.initRepository();
    await this.repository.marcarComoUsado(token);
  }
}

