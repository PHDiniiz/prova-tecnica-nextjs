import { MongoClient, Db, ClientSession } from 'mongodb';

// Interface para garantir tipagem
interface MongoConnection {
  client: MongoClient;
  db: Db;
}

// Variável global para manter a conexão persistente
let cachedConnection: MongoConnection | null = null;

/**
 * Conecta ao MongoDB com connection pooling
 * Reutiliza a conexão existente se já estiver conectado
 */
export async function conectarMongoDB(): Promise<MongoConnection> {
  // Se já tem conexão cached e está conectada, retorna ela
  if (cachedConnection) {
    try {
      // Testa se a conexão ainda está viva
      await cachedConnection.client.db().admin().ping();
      return cachedConnection;
    } catch (error) {
      // Se a conexão morreu, limpa o cache e reconecta
      console.log('Conexão MongoDB expirou, reconectando...');
      cachedConnection = null;
    }
  }

  // Pega a URL do MongoDB das variáveis de ambiente
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI não está definida nas variáveis de ambiente');
  }

  // Cria nova conexão com configurações de pooling
  const client = new MongoClient(uri, {
    maxPoolSize: 10, // máximo de conexões no pool
    minPoolSize: 2, // mínimo de conexões mantidas
    maxIdleTimeMS: 30000, // fecha conexões idle após 30s
    serverSelectionTimeoutMS: 5000, // timeout para seleção de servidor
    socketTimeoutMS: 45000, // timeout para operações
  });

  try {
    // Conecta ao MongoDB
    await client.connect();
    
    // Pega o nome do banco da URI ou usa um padrão
    const dbName = 'ag-sistemas';
    const db = client.db(dbName);

    // Cacheia a conexão para reutilizar
    cachedConnection = { client, db };

    console.log('Conectado ao MongoDB com sucesso!');
    
    return cachedConnection;
  } catch (error) {
    console.error('Erro ao conectar no MongoDB:', error);
    throw error;
  }
}

/**
 * Retorna o banco de dados MongoDB
 * Conecta automaticamente se necessário
 */
export async function getDatabase(): Promise<Db> {
  const connection = await conectarMongoDB();
  return connection.db;
}

/**
 * Retorna o cliente MongoDB para usar em transactions
 */
export async function getMongoClient(): Promise<MongoClient> {
  const connection = await conectarMongoDB();
  return connection.client;
}

/**
 * Executa uma operação dentro de uma transaction
 * Garante atomicidade das operações
 */
export async function executarTransaction<T>(
  callback: (session: ClientSession) => Promise<T>
): Promise<T> {
  const client = await getMongoClient();
  const session = client.startSession();

  try {
    let result: T;
    
    // Executa a callback dentro de uma transaction
    await session.withTransaction(async () => {
      result = await callback(session);
    });

    return result!;
  } catch (error) {
    console.error('Erro na transaction:', error);
    throw error;
  } finally {
    // Sempre fecha a session
    await session.endSession();
  }
}

/**
 * Fecha a conexão com o MongoDB
 * Útil para cleanup em testes ou shutdown
 */
export async function fecharConexao(): Promise<void> {
  if (cachedConnection) {
    await cachedConnection.client.close();
    cachedConnection = null;
    console.log('Conexão MongoDB fechada');
  }
}

