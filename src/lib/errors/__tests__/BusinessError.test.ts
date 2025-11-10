/// <reference types="jest" />
import { BusinessError } from '../BusinessError';

describe('BusinessError', () => {
  it('deve criar uma instância de BusinessError com propriedades corretas', () => {
    const error = new BusinessError('VALIDATION_ERROR', 'Campo obrigatório', 400);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BusinessError);
    expect(error.name).toBe('BusinessError');
    expect(error.type).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Campo obrigatório');
    expect(error.statusCode).toBe(400);
    expect(error.details).toBeUndefined();
  });

  it('deve criar erro com detalhes adicionais', () => {
    const details = { field: 'email', reason: 'invalid format' };
    const error = new BusinessError('VALIDATION_ERROR', 'Email inválido', 400, details);

    expect(error.details).toEqual(details);
  });

  it('deve usar statusCode padrão 400 se não fornecido', () => {
    const error = new BusinessError('ERROR', 'Mensagem de erro');

    expect(error.statusCode).toBe(400);
  });

  it('deve manter a cadeia de protótipos correta', () => {
    const error = new BusinessError('ERROR', 'Mensagem');

    expect(Object.getPrototypeOf(error)).toBe(BusinessError.prototype);
    expect(error instanceof Error).toBe(true);
    expect(error instanceof BusinessError).toBe(true);
  });

  it('deve permitir diferentes tipos de erro', () => {
    const validationError = new BusinessError('VALIDATION_ERROR', 'Erro de validação', 400);
    const notFoundError = new BusinessError('NOT_FOUND', 'Recurso não encontrado', 404);
    const forbiddenError = new BusinessError('FORBIDDEN', 'Acesso negado', 403);

    expect(validationError.type).toBe('VALIDATION_ERROR');
    expect(notFoundError.type).toBe('NOT_FOUND');
    expect(forbiddenError.type).toBe('FORBIDDEN');

    expect(validationError.statusCode).toBe(400);
    expect(notFoundError.statusCode).toBe(404);
    expect(forbiddenError.statusCode).toBe(403);
  });
});

