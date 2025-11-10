import { faker } from '@faker-js/faker';

// Configura o Faker para português brasileiro
// Nota: Na versão 10 do faker, a configuração de locale é feita via import
// Se necessário, use: import { faker } from '@faker-js/faker/locale/pt_BR';

/**
 * Gera uma intenção fake completa
 */
export function criarIntencaoFake() {
  return {
    nome: faker.person.fullName(),
    email: faker.internet.email(),
    empresa: faker.company.name(),
    motivo: faker.lorem.paragraph(),
    status: 'pending' as const,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };
}

/**
 * Gera um membro fake completo
 */
export function criarMembroFake(intencaoId?: string, ativo: boolean = true) {
  return {
    nome: faker.person.fullName(),
    email: faker.internet.email(),
    telefone: faker.phone.number(),
    empresa: faker.company.name(),
    linkedin: `https://linkedin.com/in/${faker.internet.username()}`,
    areaAtuacao: faker.person.jobTitle(),
    intencaoId: intencaoId || undefined,
    ativo,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };
}

/**
 * Gera um convite fake
 */
export function criarConviteFake(intencaoId: string) {
  return {
    token: faker.string.uuid(),
    intencaoId,
    usado: false,
    expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    criadoEm: new Date(),
  };
}

/**
 * Gera uma indicação fake
 */
export function criarIndicacaoFake(
  membroIndicadorId: string,
  membroIndicadoId: string,
  valorEstimado?: number
) {
  return {
    membroIndicadorId,
    membroIndicadoId,
    empresaContato: faker.company.name(),
    descricao: faker.lorem.paragraph(),
    status: 'nova' as const,
    valorEstimado: valorEstimado || faker.number.int({ min: 1000, max: 10000000 }),
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };
}

/**
 * Gera múltiplas intenções fake
 */
export function criarIntencoesFake(quantidade: number) {
  return Array.from({ length: quantidade }, () => criarIntencaoFake());
}

/**
 * Gera múltiplos membros fake
 */
export function criarMembrosFake(quantidade: number) {
  return Array.from({ length: quantidade }, () => criarMembroFake());
}

