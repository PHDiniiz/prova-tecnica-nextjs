/**
 * Status possíveis de uma indicação
 */
export type ReferralStatus = 'nova' | 'em-contato' | 'fechada' | 'recusada';

/**
 * Interface para uma indicação de negócio
 */
export interface Referral {
  _id?: string;
  membroIndicadorId: string;
  membroIndicadoId: string;
  empresaContato: string;
  descricao: string;
  status: ReferralStatus;
  valorEstimado?: number;
  observacoes?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * DTO para criar uma nova indicação
 */
export interface CriarIndicacaoDTO {
  membroIndicadoId: string;
  empresaContato: string;
  descricao: string;
  valorEstimado?: number;
  observacoes?: string;
}

/**
 * DTO para atualizar o status de uma indicação
 */
export interface AtualizarStatusIndicacaoDTO {
  status: ReferralStatus;
  observacoes?: string;
}

