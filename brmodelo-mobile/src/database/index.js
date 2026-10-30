/**
 * Gerenciador Central de Conexão e Acesso ao Banco de Dados SQLite do BRMM
 * Utiliza expo-sqlite para persistência local no ambiente móvel (Android/iOS).
 */
import { DATABASE_NAME, ENABLE_FOREIGN_KEYS } from './schema.js';
import { runMigrations } from './migrations/index.js';

let activeDb = null;
let isInitializing = false;

/**
 * Carrega dinamicamente a biblioteca expo-sqlite no ambiente móvel.
 */
async function getExpoSQLite() {
  return import('expo-sqlite');
}

/**
 * Inicializa a conexão com o banco de dados via expo-sqlite e aplica as migrações de esquema.
 *
 * @param {object} [options]
 * @param {string} [options.dbPath] Nome ou caminho do banco SQLite
 * @param {boolean} [options.skipMigrations=false] Não executa migrações automaticamente
 * @returns {Promise<{ db: object, migrationResult: object }>}
 */
export async function initDatabase(options = {}) {
  if (activeDb && !options.dbPath) {
    return {
      db: activeDb,
      migrationResult: { appliedCount: 0, currentVersion: null, appliedMigrations: [] },
    };
  }

  isInitializing = true;
  try {
    const SQLite = await getExpoSQLite();
    const dbName = options.dbPath || DATABASE_NAME;
    const db = await SQLite.openDatabaseAsync(dbName);

    // 1. Ativação explícita de chaves estrangeiras
    await db.execAsync(ENABLE_FOREIGN_KEYS);

    // 2. Execução das migrações de esquema
    let migrationResult = { appliedCount: 0, currentVersion: 0, appliedMigrations: [] };
    if (!options.skipMigrations) {
      migrationResult = await runMigrations(db);
    }

    activeDb = db;
    return { db, migrationResult };
  } finally {
    isInitializing = false;
  }
}

/**
 * Retorna a instância ativa do banco de dados.
 * Lança erro caso o banco ainda não tenha sido inicializado.
 */
export function getDatabase() {
  if (!activeDb) {
    throw new Error('Banco de dados não inicializado. Chame initDatabase() antes de realizar operações.');
  }
  return activeDb;
}

/**
 * Define explicitamente a instância de banco a ser utilizada.
 * Utilizado para injeção de dependência e adaptadores de testes.
 * @param {object|null} db
 */
export function setDatabase(db) {
  activeDb = db;
}

/**
 * Fecha a conexão ativa do banco de dados e reseta a referência.
 */
export async function closeDatabase() {
  if (activeDb) {
    if (typeof activeDb.closeAsync === 'function') {
      await activeDb.closeAsync();
    }
    activeDb = null;
  }
}

// Métodos de conveniência delegados para a conexão ativa
export async function execAsync(sql) {
  return getDatabase().execAsync(sql);
}

export async function runAsync(sql, params = []) {
  return getDatabase().runAsync(sql, params);
}

export async function getAllAsync(sql, params = []) {
  return getDatabase().getAllAsync(sql, params);
}

export async function getFirstAsync(sql, params = []) {
  return getDatabase().getFirstAsync(sql, params);
}

export async function withTransactionAsync(callback) {
  return getDatabase().withTransactionAsync(callback);
}
