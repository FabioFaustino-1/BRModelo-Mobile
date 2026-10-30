/**
 * Mecanismo de Migrations do BRMM
 * Gerencia e aplica migrações de esquema de forma transacional, versionada e idempotente.
 */
import { CREATE_MIGRATIONS_TABLE, TABLES } from '../schema.js';
import { migration001 } from './001_initial_schema.js';
import { getCurrentTimestamp } from '../../utils/date.js';

/**
 * Lista ordenada de migrações disponíveis.
 */
export const MIGRATIONS = [
  migration001,
];

/**
 * Executa as migrações pendentes no banco de dados.
 *
 * @param {object} db Conexão de banco de dados compatível
 * @returns {Promise<{ appliedCount: number, currentVersion: number, appliedMigrations: string[] }>}
 */
export async function runMigrations(db) {
  // 1. Garante que a tabela de controle de migrações existe
  await db.execAsync(CREATE_MIGRATIONS_TABLE);

  // 2. Consulta versões já aplicadas
  const appliedRows = await db.getAllAsync(
    `SELECT version FROM ${TABLES.MIGRATIONS} ORDER BY version ASC;`
  );
  const appliedVersions = new Set(appliedRows.map((r) => r.version));

  // 3. Filtra migrações pendentes
  const pendingMigrations = MIGRATIONS
    .filter((m) => !appliedVersions.has(m.version))
    .sort((a, b) => a.version - b.version);

  const newlyApplied = [];

  // 4. Aplica cada migração pendente dentro de uma transação
  for (const migration of pendingMigrations) {
    await db.withTransactionAsync(async () => {
      // Executa o schema da migração
      await migration.up(db);

      // Registra a migração aplicada
      const now = getCurrentTimestamp();
      await db.runAsync(
        `INSERT INTO ${TABLES.MIGRATIONS} (version, name, applied_at) VALUES (?, ?, ?);`,
        [migration.version, migration.name, now]
      );

      // Atualiza o user_version nativo do SQLite
      await db.execAsync(`PRAGMA user_version = ${migration.version};`);
    });

    newlyApplied.push(migration.name);
  }

  // 5. Determina a versão corrente
  const lastVersionRow = await db.getFirstAsync(
    `SELECT version FROM ${TABLES.MIGRATIONS} ORDER BY version DESC LIMIT 1;`
  );
  const currentVersion = lastVersionRow ? lastVersionRow.version : 0;

  return {
    appliedCount: newlyApplied.length,
    currentVersion,
    appliedMigrations: newlyApplied,
  };
}
