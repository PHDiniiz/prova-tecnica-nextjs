/**
 * Tipos relacionados ao sistema de "Obrigados" (Agradecimentos Públicos)
 */

export interface Obrigado {
  _id?: string;
  indicacaoId: string;
  membroIndicadorId: string;
  membroIndicadoId: string;
  mensagem: string;
  publico: boolean;
  criadoEm: Date;
}

export interface CriarObrigadoDTO {
  indicacaoId: string;
  mensagem: string;
  publico?: boolean;
}

export interface ObrigadoComReferral extends Obrigado {
  indicacao?: {
    empresaContato: string;
    descricao: string;
    valorEstimado?: number;
  };
  membroIndicador?: {
    nome: string;
    empresa: string;
  };
  membroIndicado?: {
    nome: string;
    empresa: string;
  };
}

