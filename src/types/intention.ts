/**
 * Status possíveis de uma intenção
 */
export type IntentionStatus = 'pending' | 'approved' | 'rejected';

/**
 * Interface para uma intenção de participação
 */
export interface Intention {
  _id?: string;
  nome: string;
  email: string;
  empresa: string;
  motivo: string;
  status: IntentionStatus;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * DTO para criar uma nova intenção
 */
export interface CriarIntencaoDTO {
  nome: string;
  email: string;
  empresa: string;
  motivo: string;
}

/**
 * DTO para atualizar o status de uma intenção
 */
export interface AtualizarStatusIntencaoDTO {
  status: IntentionStatus;
}

