/**
 * Tipos relacionados ao Sistema de Avisos
 */

/**
 * Tipo de aviso
 */
export type NoticeType = 'info' | 'warning' | 'success' | 'urgent';

/**
 * Interface para um aviso
 */
export interface Notice {
  _id?: string;
  titulo: string;
  conteudo: string;
  tipo: NoticeType;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * DTO para criar um novo aviso
 */
export interface CriarNoticeDTO {
  titulo: string;
  conteudo: string;
  tipo: NoticeType;
  ativo?: boolean;
}

/**
 * DTO para atualizar um aviso
 */
export interface AtualizarNoticeDTO {
  titulo?: string;
  conteudo?: string;
  tipo?: NoticeType;
  ativo?: boolean;
}

/**
 * Filtros para buscar avisos
 */
export interface NoticeFiltros {
  tipo?: NoticeType;
  ativo?: boolean;
}

