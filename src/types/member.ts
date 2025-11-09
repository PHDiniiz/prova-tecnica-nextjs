/**
 * Interface para um membro do grupo
 */
export interface Member {
  _id?: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa: string;
  cargo?: string;
  linkedin?: string;
  areaAtuacao?: string;
  intencaoId?: string | null;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * DTO para criar um novo membro
 */
export interface CriarMembroDTO {
  nome: string;
  email: string;
  telefone?: string;
  empresa: string;
  cargo?: string;
  linkedin?: string;
  areaAtuacao?: string;
  intencaoId?: string;
  token: string; // Token do convite
}

