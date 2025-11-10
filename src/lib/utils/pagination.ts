/**
 * Utilitários para paginação
 * Consolida lógica de paginação duplicada em repositories
 */

/**
 * Interface para resposta paginada padronizada
 */
export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Calcula o offset (skip) para paginação
 * @param page - Número da página (começa em 1)
 * @param limit - Itens por página
 * @returns Offset calculado
 */
export function calculatePaginationOffset(page: number, limit: number): number {
  if (page < 1) {
    throw new Error('Página deve ser maior ou igual a 1');
  }
  if (limit < 1) {
    throw new Error('Limite deve ser maior ou igual a 1');
  }
  return (page - 1) * limit;
}

/**
 * Cria resposta paginada padronizada
 * @param data - Array de dados
 * @param total - Total de itens
 * @param page - Número da página atual
 * @param limit - Itens por página
 * @returns Resposta paginada padronizada
 */
export function createPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResponse<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Valida e normaliza parâmetros de paginação de query string
 * @param page - String do parâmetro page (opcional)
 * @param limit - String do parâmetro limit (opcional)
 * @param defaultPage - Página padrão (padrão: 1)
 * @param defaultLimit - Limite padrão (padrão: 20)
 * @param maxLimit - Limite máximo permitido (padrão: 100)
 * @returns Objeto com page e limit normalizados
 */
export function validatePaginationParams(
  page?: string | null,
  limit?: string | null,
  defaultPage: number = 1,
  defaultLimit: number = 20,
  maxLimit: number = 100
): { page: number; limit: number } {
  // Normaliza page
  let pageNumber = defaultPage;
  if (page) {
    const parsed = parseInt(page, 10);
    if (!isNaN(parsed) && parsed > 0) {
      pageNumber = parsed;
    }
  }

  // Normaliza limit
  let limitNumber = defaultLimit;
  if (limit) {
    const parsed = parseInt(limit, 10);
    if (!isNaN(parsed) && parsed > 0) {
      // Limita ao máximo permitido
      limitNumber = Math.min(parsed, maxLimit);
    }
  }

  return {
    page: pageNumber,
    limit: limitNumber,
  };
}

/**
 * Calcula informações de paginação (útil para UI)
 * @param page - Página atual
 * @param limit - Itens por página
 * @param total - Total de itens
 * @returns Informações de paginação
 */
export function getPaginationInfo(
  page: number,
  limit: number,
  total: number
): {
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPages: number;
} {
  const totalPages = Math.ceil(total / limit);
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return {
    startIndex,
    endIndex,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    totalPages,
  };
}

