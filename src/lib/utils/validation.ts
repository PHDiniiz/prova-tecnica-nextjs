import { z } from 'zod';

/**
 * Utilitários de validação reutilizáveis com Zod
 * Consolida schemas duplicados encontrados em services
 */

/**
 * Schema para validação de email reutilizável
 */
export const emailSchema = z
  .string()
  .email('Email inválido')
  .toLowerCase()
  .trim();

/**
 * Schema para validação de ObjectId MongoDB
 */
export const objectIdSchema = z
  .string()
  .min(1, 'ID é obrigatório')
  .regex(/^[0-9a-fA-F]{24}$/, 'ID inválido (deve ser ObjectId válido)');

/**
 * Helper para criar schema de string com min/max
 * @param min - Tamanho mínimo
 * @param max - Tamanho máximo
 * @param fieldName - Nome do campo para mensagens de erro
 * @returns Schema Zod
 */
export function stringMinMaxSchema(
  min: number,
  max: number,
  fieldName: string
): z.ZodString {
  return z
    .string()
    .min(min, `${fieldName} deve ter pelo menos ${min} caracteres`)
    .max(max, `${fieldName} deve ter no máximo ${max} caracteres`)
    .trim();
}

/**
 * Schema para validação de nome (pessoa/empresa)
 */
export const nomeSchema = stringMinMaxSchema(2, 100, 'Nome');

/**
 * Schema para validação de empresa
 */
export const empresaSchema = stringMinMaxSchema(2, 100, 'Empresa');

/**
 * Schema para validação de URL (LinkedIn, etc)
 */
export const urlSchema = z
  .string()
  .url('URL inválida')
  .optional()
  .or(z.literal(''));

/**
 * Schema para validação de telefone (formato brasileiro)
 */
export const telefoneSchema = z
  .string()
  .regex(
    /^[\d\s\(\)\-\+]+$/,
    'Telefone deve conter apenas números, espaços, parênteses, hífens e sinal de +'
  )
  .optional()
  .or(z.literal(''));

/**
 * Interface para campos de validação em factory
 */
export interface ValidationField {
  name: string;
  schema: z.ZodTypeAny;
  optional?: boolean;
}

/**
 * Factory para criar schemas de validação dinamicamente
 * @param fields - Array de campos de validação
 * @returns Schema Zod object
 */
export function createValidationSchema<T extends Record<string, any>>(
  fields: ValidationField[]
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (field.optional) {
      shape[field.name] = field.schema.optional();
    } else {
      shape[field.name] = field.schema;
    }
  }

  return z.object(shape) as z.ZodObject<Record<string, z.ZodTypeAny>>;
}

/**
 * Schema para validação de valores monetários
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns Schema Zod para número
 */
export function valorMonetarioSchema(min: number, max: number): z.ZodNumber {
  return z
    .number()
    .min(min, `Valor deve ser no mínimo ${min.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`)
    .max(max, `Valor deve ser no máximo ${max.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`);
}

/**
 * Schema para validação de data
 */
export const dataSchema = z.coerce.date({
  required_error: 'Data é obrigatória',
  invalid_type_error: 'Data inválida',
});

/**
 * Helper para criar schema de texto longo (descrições, observações)
 * @param min - Tamanho mínimo
 * @param max - Tamanho máximo
 * @param fieldName - Nome do campo
 * @returns Schema Zod
 */
export function textoLongoSchema(
  min: number,
  max: number,
  fieldName: string
): z.ZodString {
  return stringMinMaxSchema(min, max, fieldName);
}

