/**
 * Interface para um convite de cadastro
 */
export interface Invite {
  _id?: string;
  token: string;
  intencaoId: string;
  usado: boolean;
  expiraEm: Date;
  criadoEm: Date;
}

/**
 * DTO para criar um novo convite
 */
export interface CriarConviteDTO {
  intencaoId: string;
}

/**
 * DTO para validar um convite
 */
export interface ValidarConviteDTO {
  token: string;
}

