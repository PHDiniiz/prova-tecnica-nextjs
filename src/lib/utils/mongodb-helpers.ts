import { ObjectId } from 'mongodb';

/**
 * Utilitários para conversão e manipulação de ObjectId do MongoDB
 * Consolida conversões duplicadas em repositories
 */

/**
 * Converte um documento MongoDB com ObjectId para string
 * @param doc - Documento com _id como ObjectId
 * @returns Documento com _id como string
 */
export function convertObjectIdToString<T extends { _id?: ObjectId | string }>(
  doc: T
): T & { _id: string } {
  if (!doc) {
    return doc as T & { _id: string };
  }

  return {
    ...doc,
    _id: doc._id instanceof ObjectId ? doc._id.toString() : (doc._id as string) || '',
  };
}

/**
 * Converte um array de documentos MongoDB com ObjectId para string
 * @param docs - Array de documentos com _id como ObjectId
 * @returns Array de documentos com _id como string
 */
export function convertObjectIdsToString<T extends { _id?: ObjectId | string }>(
  docs: Array<T>
): Array<T & { _id: string }> {
  return docs.map((doc) => convertObjectIdToString(doc));
}

/**
 * Converte campos específicos de ObjectId para string em um documento
 * @param doc - Documento
 * @param fields - Array de nomes de campos a converter
 * @returns Documento com campos convertidos
 */
export function convertObjectIdFieldsToString<T extends Record<string, any>>(
  doc: T,
  fields: string[]
): T {
  if (!doc) {
    return doc;
  }

  const converted = { ...doc };

  for (const field of fields) {
    if (converted[field] instanceof ObjectId) {
      converted[field] = converted[field].toString();
    } else if (converted[field] && typeof converted[field] === 'object' && '_id' in converted[field]) {
      // Se o campo é um objeto com _id, converte também
      converted[field] = {
        ...converted[field],
        _id: (converted[field] as any)._id instanceof ObjectId
          ? (converted[field] as any)._id.toString()
          : (converted[field] as any)._id,
      };
    }
  }

  return converted;
}

/**
 * Cria ObjectId de forma segura, retornando null se inválido
 * @param id - String ou ObjectId
 * @returns ObjectId ou null se inválido
 */
export function safeObjectId(id: string | ObjectId | null | undefined): ObjectId | null {
  if (!id) {
    return null;
  }

  if (id instanceof ObjectId) {
    return id;
  }

  try {
    // Valida se é um ObjectId válido (24 caracteres hexadecimais)
    if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
      return new ObjectId(id);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Converte string para ObjectId, lançando erro se inválido
 * @param id - String a converter
 * @param fieldName - Nome do campo para mensagem de erro
 * @returns ObjectId
 * @throws Error se o ID for inválido
 */
export function toObjectId(id: string, fieldName: string = 'ID'): ObjectId {
  if (!id || typeof id !== 'string') {
    throw new Error(`${fieldName} é obrigatório`);
  }

  try {
    return new ObjectId(id);
  } catch (error) {
    throw new Error(`${fieldName} inválido: ${id}`);
  }
}

/**
 * Verifica se uma string é um ObjectId válido
 * @param id - String a verificar
 * @returns true se for ObjectId válido
 */
export function isValidObjectId(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return /^[0-9a-fA-F]{24}$/.test(id);
}

