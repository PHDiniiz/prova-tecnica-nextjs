/**
 * Utilitários para validação de senha
 * Preparação para implementação futura do sistema de senhas
 */

/**
 * Requisitos de senha
 */
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

/**
 * Configuração padrão de requisitos de senha
 */
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Opcional por padrão
};

/**
 * Resultado da validação de senha
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

/**
 * Valida se a senha atende aos requisitos
 * 
 * @param password - Senha a ser validada
 * @param requirements - Requisitos de senha (opcional, usa padrão se não fornecido)
 * @returns Resultado da validação com lista de erros e força da senha
 * 
 * @example
 * ```typescript
 * const result = validatePassword('MinhaSenh@123');
 * if (result.isValid) {
 *   console.log('Senha válida! Força:', result.strength);
 * } else {
 *   console.log('Erros:', result.errors);
 * }
 * ```
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];

  // Validação de comprimento mínimo
  if (password.length < requirements.minLength) {
    errors.push(
      `A senha deve ter pelo menos ${requirements.minLength} caracteres`
    );
  }

  // Validação de maiúsculas
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }

  // Validação de minúsculas
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }

  // Validação de números
  if (requirements.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }

  // Validação de caracteres especiais
  if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial');
  }

  // Calcula força da senha
  const strength = calculatePasswordStrength(password);

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Calcula a força da senha
 * 
 * @param password - Senha a ser avaliada
 * @returns Nível de força: 'weak' | 'medium' | 'strong' | 'very-strong'
 */
export function calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' | 'very-strong' {
  let score = 0;

  // Comprimento (máximo 3 pontos)
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Variedade de caracteres (máximo 4 pontos)
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  // Determina força baseada no score (máximo 7 pontos)
  // Score 0-3: weak, 4-5: medium, 6-7: strong, 8+: very-strong
  if (score <= 3) return 'weak';
  if (score <= 5) return 'medium';
  if (score <= 7) return 'strong';
  return 'very-strong';
}

/**
 * Gera mensagens de feedback sobre a força da senha
 * 
 * @param strength - Força da senha
 * @returns Mensagem descritiva sobre a força
 */
export function getPasswordStrengthMessage(strength: 'weak' | 'medium' | 'strong' | 'very-strong'): string {
  const messages = {
    weak: 'Senha fraca - adicione mais caracteres e variedade',
    medium: 'Senha média - pode ser melhorada',
    strong: 'Senha forte - boa segurança',
    'very-strong': 'Senha muito forte - excelente segurança',
  };

  return messages[strength];
}

