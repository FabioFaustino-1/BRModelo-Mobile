/**
 * Adaptador de SQLite para ambiente de testes em Node.js
 * Utiliza o módulo nativo node:sqlite do Node 24.
 * Este arquivo é exclusivo para execução de testes e NUNCA é importado pela aplicação React Native.
 */
import { DatabaseSync } from 'node:sqlite';

/**
 * Cria um adaptador compatível com a interface do expo-sqlite para execução em Node.js.
 * @param {string} [dbPath=':memory:']
 */
export function createNodeAdapter(dbPath = ':memory:') {
  const syncDb = new DatabaseSync(dbPath);

  return {
    isNodeAdapter: true,
    async execAsync(sql) {
      syncDb.exec(sql);
    },
    async runAsync(sql, params = []) {
      const stmt = syncDb.prepare(sql);
      const paramArray = Array.isArray(params) ? params : [params];
      const result = stmt.run(...paramArray);
      return {
        changes: result.changes,
        lastInsertRowId: Number(result.lastInsertRowid),
      };
    },
    async getAllAsync(sql, params = []) {
      const stmt = syncDb.prepare(sql);
      const paramArray = Array.isArray(params) ? params : [params];
      return stmt.all(...paramArray);
    },
    async getFirstAsync(sql, params = []) {
      const stmt = syncDb.prepare(sql);
      const paramArray = Array.isArray(params) ? params : [params];
      const rows = stmt.all(...paramArray);
      return rows.length > 0 ? rows[0] : null;
    },
    async withTransactionAsync(callback) {
      syncDb.exec('BEGIN TRANSACTION;');
      try {
        const result = await callback();
        syncDb.exec('COMMIT;');
        return result;
      } catch (err) {
        try {
          syncDb.exec('ROLLBACK;');
        } catch {}
        throw err;
      }
    },
    async closeAsync() {
      syncDb.close();
    },
  };
}
