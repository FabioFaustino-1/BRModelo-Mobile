/**
 * Migration 001: Esquema inicial do MVP do BRMM
 * Cria as tabelas projects, entities, attributes e relationships com restrições e índices.
 */
import {
  CREATE_PROJECTS_TABLE,
  CREATE_ENTITIES_TABLE,
  CREATE_ATTRIBUTES_TABLE,
  CREATE_RELATIONSHIPS_TABLE,
  CREATE_INDEXES,
  TABLES,
} from '../schema.js';

export const migration001 = {
  version: 1,
  name: '001_initial_schema',

  /**
   * Aplica a migração criando as tabelas e índices.
   * @param {{ execAsync: (sql: string) => Promise<void> }} db
   */
  async up(db) {
    await db.execAsync(CREATE_PROJECTS_TABLE);
    await db.execAsync(CREATE_ENTITIES_TABLE);
    await db.execAsync(CREATE_ATTRIBUTES_TABLE);
    await db.execAsync(CREATE_RELATIONSHIPS_TABLE);

    for (const indexSql of CREATE_INDEXES) {
      await db.execAsync(indexSql);
    }
  },

  /**
   * Reverte a migração removendo as tabelas (ordem inversa de dependência).
   * @param {{ execAsync: (sql: string) => Promise<void> }} db
   */
  async down(db) {
    await db.execAsync(`DROP TABLE IF EXISTS ${TABLES.RELATIONSHIPS};`);
    await db.execAsync(`DROP TABLE IF EXISTS ${TABLES.ATTRIBUTES};`);
    await db.execAsync(`DROP TABLE IF EXISTS ${TABLES.ENTITIES};`);
    await db.execAsync(`DROP TABLE IF EXISTS ${TABLES.PROJECTS};`);
  },
};
