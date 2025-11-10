import {
  calculatePaginationOffset,
  createPaginationResponse,
  validatePaginationParams,
  getPaginationInfo,
} from '../pagination';

describe('pagination', () => {
  describe('calculatePaginationOffset', () => {
    it('deve calcular offset corretamente', () => {
      expect(calculatePaginationOffset(1, 20)).toBe(0);
      expect(calculatePaginationOffset(2, 20)).toBe(20);
      expect(calculatePaginationOffset(3, 10)).toBe(20);
    });

    it('deve lançar erro para página inválida', () => {
      expect(() => calculatePaginationOffset(0, 20)).toThrow();
      expect(() => calculatePaginationOffset(-1, 20)).toThrow();
    });

    it('deve lançar erro para limite inválido', () => {
      expect(() => calculatePaginationOffset(1, 0)).toThrow();
      expect(() => calculatePaginationOffset(1, -1)).toThrow();
    });
  });

  describe('createPaginationResponse', () => {
    it('deve criar resposta paginada corretamente', () => {
      const data = [1, 2, 3, 4, 5];
      const result = createPaginationResponse(data, 25, 1, 10);

      expect(result.data).toEqual(data);
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
    });

    it('deve calcular totalPages corretamente', () => {
      const result1 = createPaginationResponse([], 25, 1, 10);
      expect(result1.totalPages).toBe(3);

      const result2 = createPaginationResponse([], 20, 1, 10);
      expect(result2.totalPages).toBe(2);

      const result3 = createPaginationResponse([], 0, 1, 10);
      expect(result3.totalPages).toBe(0);
    });
  });

  describe('validatePaginationParams', () => {
    it('deve usar valores padrão quando não fornecidos', () => {
      const result = validatePaginationParams(null, null);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('deve validar e converter parâmetros válidos', () => {
      const result = validatePaginationParams('2', '15');
      expect(result.page).toBe(2);
      expect(result.limit).toBe(15);
    });

    it('deve ignorar parâmetros inválidos e usar padrão', () => {
      const result1 = validatePaginationParams('abc', 'xyz');
      expect(result1.page).toBe(1);
      expect(result1.limit).toBe(20);

      const result2 = validatePaginationParams('0', '-5');
      expect(result2.page).toBe(1);
      expect(result2.limit).toBe(20);
    });

    it('deve limitar ao maxLimit', () => {
      const result = validatePaginationParams('1', '200', 1, 20, 100);
      expect(result.limit).toBe(100);
    });

    it('deve usar valores padrão customizados', () => {
      const result = validatePaginationParams(null, null, 2, 50);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });
  });

  describe('getPaginationInfo', () => {
    it('deve calcular informações de paginação corretamente', () => {
      const info = getPaginationInfo(2, 10, 25);

      expect(info.startIndex).toBe(11);
      expect(info.endIndex).toBe(20);
      expect(info.hasNextPage).toBe(true);
      expect(info.hasPreviousPage).toBe(true);
      expect(info.totalPages).toBe(3);
    });

    it('deve indicar primeira página corretamente', () => {
      const info = getPaginationInfo(1, 10, 25);

      expect(info.hasPreviousPage).toBe(false);
      expect(info.hasNextPage).toBe(true);
      expect(info.startIndex).toBe(1);
    });

    it('deve indicar última página corretamente', () => {
      const info = getPaginationInfo(3, 10, 25);

      expect(info.hasPreviousPage).toBe(true);
      expect(info.hasNextPage).toBe(false);
      expect(info.endIndex).toBe(25);
    });

    it('deve lidar com total zero', () => {
      const info = getPaginationInfo(1, 10, 0);

      expect(info.startIndex).toBe(0);
      expect(info.endIndex).toBe(0);
      expect(info.totalPages).toBe(0);
    });
  });
});

