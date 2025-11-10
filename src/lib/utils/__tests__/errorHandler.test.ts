import {
  normalizeError,
  createErrorResponse,
  mapBusinessErrorToHttpStatus,
  withErrorHandling,
} from '../errorHandler';
import { BusinessError } from '@/lib/errors/BusinessError';
import { z } from 'zod';

describe('errorHandler', () => {
  describe('normalizeError', () => {
    it('deve retornar BusinessError como está', () => {
      const businessError = new BusinessError('Teste', 'Mensagem de teste', 400);
      const result = normalizeError(businessError);

      expect(result).toBe(businessError);
      expect(result.type).toBe('Teste');
      expect(result.message).toBe('Mensagem de teste');
      expect(result.statusCode).toBe(400);
    });

    it('deve normalizar ZodError para BusinessError com status 400', () => {
      const zodError = z.object({ name: z.string() }).parse({ name: 123 });
      expect(zodError).toBeDefined();
    });

    it('deve normalizar Error padrão para BusinessError', () => {
      const error = new Error('Erro padrão');
      const result = normalizeError(error, 'Mensagem padrão', 500);

      expect(result).toBeInstanceOf(BusinessError);
      expect(result.message).toBe('Erro padrão');
      expect(result.statusCode).toBe(500);
    });

    it('deve normalizar erro desconhecido para BusinessError genérico', () => {
      const error = { code: 123, message: 'Erro customizado' };
      const result = normalizeError(error, 'Erro inesperado', 500);

      expect(result).toBeInstanceOf(BusinessError);
      expect(result.message).toBe('Erro inesperado');
      expect(result.statusCode).toBe(500);
      expect(result.details).toEqual(error);
    });

    it('deve usar valores padrão quando não fornecidos', () => {
      const error = new Error('Teste');
      const result = normalizeError(error);

      expect(result).toBeInstanceOf(BusinessError);
      expect(result.message).toBe('Teste');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('createErrorResponse', () => {
    it('deve propagar BusinessError sem modificar', () => {
      const businessError = new BusinessError('Teste', 'Mensagem', 404);
      const result = createErrorResponse(businessError, 'Mensagem padrão');

      expect(result).toBeInstanceOf(BusinessError);
      expect(result.type).toBe('Teste');
      expect(result.message).toBe('Mensagem');
      expect(result.statusCode).toBe(404);
    });

    it('deve criar BusinessError para erro desconhecido', () => {
      const error = new Error('Erro desconhecido');
      const result = createErrorResponse(error, 'Não foi possível processar', 500);

      expect(result).toBeInstanceOf(BusinessError);
      expect(result.message).toBe('Não foi possível processar');
      expect(result.statusCode).toBe(500);
    });

    it('deve usar status code padrão quando não fornecido', () => {
      const error = new Error('Erro');
      const result = createErrorResponse(error, 'Mensagem padrão');

      expect(result.statusCode).toBe(500);
    });
  });

  describe('mapBusinessErrorToHttpStatus', () => {
    it('deve retornar statusCode do erro se definido', () => {
      const error = new BusinessError('Teste', 'Mensagem', 403);
      const status = mapBusinessErrorToHttpStatus(error);

      expect(status).toBe(403);
    });

    it('deve mapear tipos conhecidos para status codes', () => {
      const error = new BusinessError('Erro de validação', 'Mensagem');
      const status = mapBusinessErrorToHttpStatus(error);

      expect(status).toBe(400);
    });

    it('deve retornar 500 para tipos desconhecidos', () => {
      const error = new BusinessError('Tipo desconhecido', 'Mensagem');
      const status = mapBusinessErrorToHttpStatus(error);

      expect(status).toBe(500);
    });
  });

  describe('withErrorHandling', () => {
    it('deve retornar resultado da operação bem-sucedida', async () => {
      const operation = async () => 'sucesso';
      const result = await withErrorHandling(operation, 'Erro padrão');

      expect(result).toBe('sucesso');
    });

    it('deve propagar BusinessError sem modificar', async () => {
      const businessError = new BusinessError('Teste', 'Mensagem', 400);
      const operation = async () => {
        throw businessError;
      };

      await expect(
        withErrorHandling(operation, 'Erro padrão')
      ).rejects.toThrow(businessError);
    });

    it('deve normalizar erro desconhecido para BusinessError', async () => {
      const operation = async () => {
        throw new Error('Erro genérico');
      };

      await expect(
        withErrorHandling(operation, 'Não foi possível processar', 500)
      ).rejects.toThrow(BusinessError);
    });
  });
});

