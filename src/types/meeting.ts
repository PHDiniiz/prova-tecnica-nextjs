/**
 * Tipos relacionados ao Sistema de Check-in em Reuniões
 */

/**
 * Interface para um check-in
 */
export interface CheckIn {
  membroId: string;
  dataCheckIn: Date;
  presente: boolean;
}

/**
 * Interface para uma reunião
 */
export interface Meeting {
  _id?: string;
  membro1Id: string;
  membro2Id: string;
  dataReuniao: Date;
  local?: string;
  observacoes?: string;
  checkIns: CheckIn[];
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * DTO para criar uma nova reunião
 */
export interface CriarMeetingDTO {
  membro1Id: string;
  membro2Id: string;
  dataReuniao: Date | string;
  local?: string;
  observacoes?: string;
}

/**
 * DTO para atualizar uma reunião
 */
export interface AtualizarMeetingDTO {
  dataReuniao?: Date | string;
  local?: string;
  observacoes?: string;
}

/**
 * DTO para registrar check-in
 */
export interface CheckInDTO {
  membroId: string;
  presente: boolean;
}

/**
 * Filtros para buscar reuniões
 */
export interface MeetingFiltros {
  membroId?: string;
  dataInicio?: Date | string;
  dataFim?: Date | string;
}

