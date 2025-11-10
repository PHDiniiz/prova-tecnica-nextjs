import { BusinessError } from '@/lib/errors/BusinessError';
import { z } from 'zod';

/**
 * Utilitários para tratamento centralizado de erros
 * Consolida padrões de tratamento de erros encontrados em services
 */

/**
 * Normaliza qualquer erro para BusinessError
 * @param error - Erro desconhecido a ser normalizado
 * @param defaultMessage - Mensagem padrão caso o erro não tenha mensagem
 * @param defaultStatusCode - Status code padrão (500)
 * @returns BusinessError normalizado
 */
export function normalizeError(
  error: unknown,
  defaultMessage: string = 'Erro inesperado',
  defaultStatusCode: number = 500
): BusinessError {
  // Se já é BusinessError, retorna como está
  if (error instanceof BusinessError) {
    return error;
  }

  // Se é ZodError, retorna BusinessError com status 400
  if (error instanceof z.ZodError) {
    return new BusinessError(
      'Erro de validação',
      error.errors.map((e) => e.message).join(', '),
      400,
      error.errors
    );
  }

  // Se é Error padrão, extrai a mensagem
  if (error instanceof Error) {
    return new BusinessError(
      error.name || 'Erro',
      error.message || defaultMessage,
      defaultStatusCode
    );
  }

  // Para outros tipos de erro, cria BusinessError genérico
  return new BusinessError(
    'Erro desconhecido',
    defaultMessage,
    defaultStatusCode,
    error
  );
}

/**
 * Cria uma resposta de erro padronizada
 * @param error - Erro desconhecido
 * @param defaultMessage - Mensagem padrão
 * @param statusCode - Status code HTTP (padrão: 500)
 * @returns BusinessError
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string,
  statusCode?: number
): BusinessError {
  // Se já é BusinessError ou ZodError, propaga
  if (error instanceof BusinessError || error instanceof z.ZodError) {
    return normalizeError(error);
  }

  // Log do erro para debug
  console.error('Erro capturado:', error);

  // Cria BusinessError com mensagem padrão
  return new BusinessError(
    'Erro ao processar solicitação',
    defaultMessage,
    statusCode || 500,
    error
  );
}

/**
 * Mapeia erros de negócio para códigos HTTP apropriados
 * @param error - BusinessError
 * @returns Código HTTP apropriado
 */
export function mapBusinessErrorToHttpStatus(error: BusinessError): number {
  // Se o erro já tem statusCode definido, usa ele
  if (error.statusCode) {
    return error.statusCode;
  }

  // Mapeia por tipo de erro
  const typeToStatus: Record<string, number> = {
    'Erro de validação': 400,
    'Não autorizado': 403,
    'Não encontrado': 404,
    'Conflito': 409,
    'Erro ao processar solicitação': 500,
  };

  return typeToStatus[error.type] || 500;
}

/**
 * Wrapper para operações assíncronas com tratamento de erro padronizado
 * @param operation - Função assíncrona a ser executada
 * @param errorMessage - Mensagem de erro padrão
 * @param statusCode - Status code padrão
 * @returns Resultado da operação ou lança BusinessError
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  statusCode: number = 500
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // Propaga BusinessError e ZodError sem modificar
    if (error instanceof BusinessError || error instanceof z.ZodError) {
      throw error;
    }

    // Normaliza outros erros
    throw createErrorResponse(error, errorMessage, statusCode);
  }
}

