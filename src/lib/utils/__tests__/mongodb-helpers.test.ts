import { ObjectId } from 'mongodb';
import {
  convertObjectIdToString,
  convertObjectIdsToString,
  convertObjectIdFieldsToString,
  safeObjectId,
  toObjectId,
  isValidObjectId,
} from '../mongodb-helpers';

describe('mongodb-helpers', () => {
  describe('convertObjectIdToString', () => {
    it('deve converter ObjectId para string', () => {
      const id = new ObjectId();
      const doc = { _id: id, name: 'Teste' };
      const result = convertObjectIdToString(doc);

      expect(result._id).toBe(id.toString());
      expect(typeof result._id).toBe('string');
      expect(result.name).toBe('Teste');
    });

    it('deve manter string _id como está', () => {
      const doc = { _id: '507f1f77bcf86cd799439011', name: 'Teste' };
      const result = convertObjectIdToString(doc);

      expect(result._id).toBe('507f1f77bcf86cd799439011');
    });

    it('deve lidar com _id undefined', () => {
      const doc = { name: 'Teste' };
      const result = convertObjectIdToString(doc);

      expect(result._id).toBe('');
    });

    it('deve lidar com null', () => {
      const result = convertObjectIdToString(null as any);
      expect(result).toBeNull();
    });
  });

  describe('convertObjectIdsToString', () => {
    it('deve converter array de documentos', () => {
      const id1 = new ObjectId();
      const id2 = new ObjectId();
      const docs = [
        { _id: id1, name: 'Teste 1' },
        { _id: id2, name: 'Teste 2' },
      ];
      const result = convertObjectIdsToString(docs);

      expect(result).toHaveLength(2);
      expect(result[0]._id).toBe(id1.toString());
      expect(result[1]._id).toBe(id2.toString());
    });

    it('deve lidar com array vazio', () => {
      const result = convertObjectIdsToString([]);
      expect(result).toEqual([]);
    });
  });

  describe('convertObjectIdFieldsToString', () => {
    it('deve converter campos específicos', () => {
      const userId = new ObjectId();
      const doc = {
        _id: new ObjectId(),
        userId,
        name: 'Teste',
      };
      const result = convertObjectIdFieldsToString(doc, ['userId']);

      expect(result.userId).toBe(userId.toString());
      expect(typeof result.userId).toBe('string');
    });

    it('deve manter outros campos inalterados', () => {
      const doc = { _id: new ObjectId(), name: 'Teste', age: 30 };
      const result = convertObjectIdFieldsToString(doc, ['_id']);

      expect(result.name).toBe('Teste');
      expect(result.age).toBe(30);
    });
  });

  describe('safeObjectId', () => {
    it('deve criar ObjectId de string válida', () => {
      const id = '507f1f77bcf86cd799439011';
      const result = safeObjectId(id);

      expect(result).toBeInstanceOf(ObjectId);
      expect(result?.toString()).toBe(id);
    });

    it('deve retornar null para string inválida', () => {
      expect(safeObjectId('123')).toBeNull();
      expect(safeObjectId('abc')).toBeNull();
      expect(safeObjectId('')).toBeNull();
    });

    it('deve retornar ObjectId se já for ObjectId', () => {
      const id = new ObjectId();
      const result = safeObjectId(id);

      expect(result).toBe(id);
    });

    it('deve retornar null para null/undefined', () => {
      expect(safeObjectId(null)).toBeNull();
      expect(safeObjectId(undefined)).toBeNull();
    });
  });

  describe('toObjectId', () => {
    it('deve converter string válida para ObjectId', () => {
      const id = '507f1f77bcf86cd799439011';
      const result = toObjectId(id);

      expect(result).toBeInstanceOf(ObjectId);
      expect(result.toString()).toBe(id);
    });

    it('deve lançar erro para string inválida', () => {
      expect(() => toObjectId('123')).toThrow();
      expect(() => toObjectId('')).toThrow();
    });

    it('deve lançar erro para null/undefined', () => {
      expect(() => toObjectId(null as any)).toThrow();
      expect(() => toObjectId(undefined as any)).toThrow();
    });

    it('deve usar fieldName na mensagem de erro', () => {
      expect(() => toObjectId('', 'Campo')).toThrow('Campo');
    });
  });

  describe('isValidObjectId', () => {
    it('deve validar ObjectId válido', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
    });

    it('deve rejeitar ObjectId inválido', () => {
      expect(isValidObjectId('123')).toBe(false);
      expect(isValidObjectId('abc')).toBe(false);
      expect(isValidObjectId('')).toBe(false);
    });

    it('deve retornar false para null/undefined', () => {
      expect(isValidObjectId(null)).toBe(false);
      expect(isValidObjectId(undefined)).toBe(false);
    });
  });
});

