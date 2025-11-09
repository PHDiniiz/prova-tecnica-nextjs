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
}

/**
 * DTO para atualizar o status de uma indicação
 */
export interface AtualizarStatusIndicacaoDTO {
  status: ReferralStatus;
}

