import { Db } from 'mongodb';
import { faker } from '@faker-js/faker';
import {
  criarIntencaoFake,
  criarMembroFake,
  criarConviteFake,
  criarIndicacaoFake,
  criarIntencoesFake,
  criarMembrosFake,
} from './faker';

/**
 * Popula o banco com intenções fake
 */
export async function popularIntencoes(db: Db, quantidade: number = 10) {
  const intencoes = criarIntencoesFake(quantidade);
  const result = await db.collection('intentions').insertMany(intencoes);
  return result.insertedIds;
}

/**
 * Popula o banco com membros fake
 */
export async function popularMembros(
  db: Db,
  quantidade: number = 10,
  intencaoIds?: string[]
) {
  const membros = Array.from({ length: quantidade }, (_, i) =>
    criarMembroFake(intencaoIds?.[i])
  );
  const result = await db.collection('members').insertMany(membros);
  return result.insertedIds;
}

/**
 * Popula o banco com convites fake
 */
export async function popularConvites(
  db: Db,
  intencaoIds: string[],
  quantidadePorIntencao: number = 1
) {
  const convites = intencaoIds.flatMap((intencaoId) =>
    Array.from({ length: quantidadePorIntencao }, () =>
      criarConviteFake(intencaoId)
    )
  );
  const result = await db.collection('invites').insertMany(convites);
  return result.insertedIds;
}

/**
 * Popula o banco com indicações fake
 */
export async function popularIndicacoes(
  db: Db,
  membroIds: string[],
  quantidade: number = 5
) {
  const indicacoes = Array.from({ length: quantidade }, () => {
    const [membroIndicadorId, membroIndicadoId] = faker.helpers.arrayElements(
      membroIds,
      2
    );
    return criarIndicacaoFake(membroIndicadorId, membroIndicadoId);
  });
  const result = await db.collection('referrals').insertMany(indicacoes);
  return result.insertedIds;
}

/**
 * Limpa dados fake do banco baseado em um identificador único
 */
export async function limparDadosFake(
  db: Db,
  identificador: string,
  colecoes: string[] = ['intentions', 'members', 'invites', 'referrals']
) {
  for (const colecao of colecoes) {
    await db.collection(colecao).deleteMany({
      // Aqui você pode adicionar lógica para identificar dados fake
      // Por exemplo, usando um campo especial ou timestamp
    });
  }
}

