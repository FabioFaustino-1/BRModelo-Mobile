/**
 * Migration 002: Suporte ao Editor Visual de Modelos Relacionais (Canvas 2D)
 * Adiciona coordenadas (position_x, position_y) às entidades e viewport (zoom, x, y) aos projetos.
 */
import { TABLES } from '../schema.js';

export const migration002 = {
  version: 2,
  name: '002_canvas_visual_editor',

  /**
   * Aplica a migração adicionando as colunas necessárias para o Canvas.
   * @param {{ execAsync: (sql: string) => Promise<void>, getAllAsync: (sql: string) => Promise<Array<any>> }} db
   */
  async up(db) {
    // 1. Verifica colunas existentes na tabela 'entities'
    const entityColumns = await db.getAllAsync(`PRAGMA table_info(${TABLES.ENTITIES});`);
    const entityColNames = new Set(entityColumns.map((c) => c.name));

    if (!entityColNames.has('position_x')) {
      await db.execAsync(`ALTER TABLE ${TABLES.ENTITIES} ADD COLUMN position_x REAL DEFAULT 100;`);
    }
    if (!entityColNames.has('position_y')) {
      await db.execAsync(`ALTER TABLE ${TABLES.ENTITIES} ADD COLUMN position_y REAL DEFAULT 100;`);
    }

    // 2. Verifica colunas existentes na tabela 'projects'
    const projectColumns = await db.getAllAsync(`PRAGMA table_info(${TABLES.PROJECTS});`);
    const projectColNames = new Set(projectColumns.map((c) => c.name));

    if (!projectColNames.has('viewport_zoom')) {
      await db.execAsync(`ALTER TABLE ${TABLES.PROJECTS} ADD COLUMN viewport_zoom REAL DEFAULT 1.0;`);
    }
    if (!projectColNames.has('viewport_x')) {
      await db.execAsync(`ALTER TABLE ${TABLES.PROJECTS} ADD COLUMN viewport_x REAL DEFAULT 0;`);
    }
    if (!projectColNames.has('viewport_y')) {
      await db.execAsync(`ALTER TABLE ${TABLES.PROJECTS} ADD COLUMN viewport_y REAL DEFAULT 0;`);
    }
  },

  async down() {
    // SQLite não suporta DROP COLUMN em versões antigas sem recriar tabela,
    // mantendo noop seguro para reversões
  },
};
