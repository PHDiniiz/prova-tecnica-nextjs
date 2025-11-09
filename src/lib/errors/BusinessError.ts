/**
 * Classe de erro customizada para erros de negócio
 */
export class BusinessError extends Error {
  constructor(
    public readonly type: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'BusinessError';
    Object.setPrototypeOf(this, BusinessError.prototype);
  }
}

