/// <reference types="jest" />

import {
  validatePassword,
  calculatePasswordStrength,
  getPasswordStrengthMessage,
  DEFAULT_PASSWORD_REQUIREMENTS,
} from '../password';

describe('password utils', () => {
  describe('validatePassword', () => {
    it('deve validar senha que atende todos os requisitos', () => {
      const result = validatePassword('MinhaSenh@123');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve rejeitar senha muito curta', () => {
      const result = validatePassword('Senh@1');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve ter pelo menos 8 caracteres');
    });

    it('deve rejeitar senha sem maiúsculas', () => {
      const result = validatePassword('minhasenha123');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos uma letra maiúscula');
    });

    it('deve rejeitar senha sem minúsculas', () => {
      const result = validatePassword('MINHASENHA123');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos uma letra minúscula');
    });

    it('deve rejeitar senha sem números', () => {
      const result = validatePassword('MinhaSenha');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos um número');
    });

    it('deve aceitar senha sem caracteres especiais quando não obrigatório', () => {
      const result = validatePassword('MinhaSenha123');

      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar senha sem caracteres especiais quando obrigatório', () => {
      const result = validatePassword('MinhaSenha123', {
        ...DEFAULT_PASSWORD_REQUIREMENTS,
        requireSpecialChars: true,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos um caractere especial');
    });

    it('deve retornar múltiplos erros quando senha falha em vários requisitos', () => {
      const result = validatePassword('abc');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('calculatePasswordStrength', () => {
    it('deve retornar weak para senha muito simples', () => {
      expect(calculatePasswordStrength('abc')).toBe('weak');
      expect(calculatePasswordStrength('12345678')).toBe('weak');
    });

    it('deve retornar medium para senha com alguma variedade', () => {
      expect(calculatePasswordStrength('MinhaSenha123')).toBe('medium');
    });

    it('deve retornar strong para senha com boa variedade', () => {
      expect(calculatePasswordStrength('MinhaSenh@123')).toBe('strong');
    });

    it('deve retornar strong para senha complexa', () => {
      // Senha com boa variedade: 16+ caracteres, maiúsculas, minúsculas, números e caracteres especiais
      // Score: 3 (comprimento) + 4 (variedade) = 7 = strong
      expect(calculatePasswordStrength('MinhaSenh@MuitoForte123!')).toBe('strong');
    });
  });

  describe('getPasswordStrengthMessage', () => {
    it('deve retornar mensagem apropriada para cada nível de força', () => {
      expect(getPasswordStrengthMessage('weak')).toContain('fraca');
      expect(getPasswordStrengthMessage('medium')).toContain('média');
      expect(getPasswordStrengthMessage('strong')).toContain('forte');
      expect(getPasswordStrengthMessage('very-strong')).toContain('muito forte');
    });
  });
});

