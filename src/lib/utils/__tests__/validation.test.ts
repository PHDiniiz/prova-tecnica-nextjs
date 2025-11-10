import {
  emailSchema,
  objectIdSchema,
  stringMinMaxSchema,
  nomeSchema,
  empresaSchema,
  urlSchema,
  telefoneSchema,
  valorMonetarioSchema,
  dataSchema,
  textoLongoSchema,
  createValidationSchema,
} from '../validation';
import { z } from 'zod';

describe('validation', () => {
  describe('emailSchema', () => {
    it('deve validar email válido', () => {
      expect(() => emailSchema.parse('teste@example.com')).not.toThrow();
    });

    it('deve rejeitar email inválido', () => {
      expect(() => emailSchema.parse('email-invalido')).toThrow();
    });

    it('deve converter email para lowercase', () => {
      const result = emailSchema.parse('TESTE@EXAMPLE.COM');
      expect(result).toBe('teste@example.com');
    });
  });

  describe('objectIdSchema', () => {
    it('deve validar ObjectId válido', () => {
      const validId = '507f1f77bcf86cd799439011';
      expect(() => objectIdSchema.parse(validId)).not.toThrow();
    });

    it('deve rejeitar ObjectId inválido', () => {
      expect(() => objectIdSchema.parse('123')).toThrow();
      expect(() => objectIdSchema.parse('')).toThrow();
    });
  });

  describe('stringMinMaxSchema', () => {
    it('deve validar string dentro do range', () => {
      const schema = stringMinMaxSchema(2, 10, 'Campo');
      expect(() => schema.parse('teste')).not.toThrow();
    });

    it('deve rejeitar string muito curta', () => {
      const schema = stringMinMaxSchema(2, 10, 'Campo');
      expect(() => schema.parse('a')).toThrow();
    });

    it('deve rejeitar string muito longa', () => {
      const schema = stringMinMaxSchema(2, 5, 'Campo');
      expect(() => schema.parse('muito longo')).toThrow();
    });
  });

  describe('nomeSchema', () => {
    it('deve validar nome válido', () => {
      expect(() => nomeSchema.parse('João Silva')).not.toThrow();
    });

    it('deve rejeitar nome muito curto', () => {
      expect(() => nomeSchema.parse('A')).toThrow();
    });
  });

  describe('empresaSchema', () => {
    it('deve validar empresa válida', () => {
      expect(() => empresaSchema.parse('Empresa XYZ')).not.toThrow();
    });
  });

  describe('urlSchema', () => {
    it('deve validar URL válida', () => {
      expect(() => urlSchema.parse('https://linkedin.com/in/teste')).not.toThrow();
    });

    it('deve aceitar string vazia', () => {
      expect(() => urlSchema.parse('')).not.toThrow();
    });

    it('deve rejeitar URL inválida', () => {
      expect(() => urlSchema.parse('não é url')).toThrow();
    });
  });

  describe('telefoneSchema', () => {
    it('deve validar telefone válido', () => {
      expect(() => telefoneSchema.parse('(11) 98765-4321')).not.toThrow();
      expect(() => telefoneSchema.parse('+55 11 98765-4321')).not.toThrow();
    });

    it('deve aceitar string vazia', () => {
      expect(() => telefoneSchema.parse('')).not.toThrow();
    });

    it('deve rejeitar telefone com caracteres inválidos', () => {
      expect(() => telefoneSchema.parse('abc123')).toThrow();
    });
  });

  describe('valorMonetarioSchema', () => {
    it('deve validar valor dentro do range', () => {
      const schema = valorMonetarioSchema(1000, 100000);
      expect(() => schema.parse(5000)).not.toThrow();
    });

    it('deve rejeitar valor abaixo do mínimo', () => {
      const schema = valorMonetarioSchema(1000, 100000);
      expect(() => schema.parse(500)).toThrow();
    });

    it('deve rejeitar valor acima do máximo', () => {
      const schema = valorMonetarioSchema(1000, 100000);
      expect(() => schema.parse(200000)).toThrow();
    });
  });

  describe('dataSchema', () => {
    it('deve validar data válida', () => {
      expect(() => dataSchema.parse('2024-01-01')).not.toThrow();
      expect(() => dataSchema.parse(new Date())).not.toThrow();
    });
  });

  describe('textoLongoSchema', () => {
    it('deve validar texto dentro do range', () => {
      const schema = textoLongoSchema(10, 500, 'Descrição');
      expect(() => schema.parse('Este é um texto longo o suficiente')).not.toThrow();
    });
  });

  describe('createValidationSchema', () => {
    it('deve criar schema de validação dinamicamente', () => {
      const schema = createValidationSchema([
        { name: 'nome', schema: nomeSchema },
        { name: 'email', schema: emailSchema },
        { name: 'telefone', schema: telefoneSchema, optional: true },
      ]);

      const validData = {
        nome: 'João Silva',
        email: 'joao@example.com',
      };

      expect(() => schema.parse(validData)).not.toThrow();
    });

    it('deve validar campos opcionais', () => {
      const schema = createValidationSchema([
        { name: 'nome', schema: nomeSchema },
        { name: 'telefone', schema: telefoneSchema, optional: true },
      ]);

      const data = { nome: 'João' };
      expect(() => schema.parse(data)).not.toThrow();
    });
  });
});

