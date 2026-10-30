/**
 * Definições DDL do Schema SQLite para o BRMM
 */

export const DATABASE_NAME = 'brmm_local.db';

export const CREATE_PROJECTS_TABLE = `
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

export const CREATE_ENTITIES_TABLE = `
  CREATE TABLE IF NOT EXISTS entities (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );
`;

export const CREATE_ATTRIBUTES_TABLE = `
  CREATE TABLE IF NOT EXISTS attributes (
    id TEXT PRIMARY KEY NOT NULL,
    entity_id TEXT NOT NULL,
    name TEXT NOT NULL,
    data_type TEXT NOT NULL,
    is_primary_key INTEGER NOT NULL DEFAULT 0,
    is_required INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
  );
`;

export const CREATE_RELATIONSHIPS_TABLE = `
  CREATE TABLE IF NOT EXISTS relationships (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL,
    source_entity_id TEXT NOT NULL,
    target_entity_id TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (source_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY (target_entity_id) REFERENCES entities(id) ON DELETE CASCADE
  );
`;

export const ENABLE_FOREIGN_KEYS = `PRAGMA foreign_keys = ON;`;

export const INITIAL_SCHEMA_STATEMENTS = [
  ENABLE_FOREIGN_KEYS,
  CREATE_PROJECTS_TABLE,
  CREATE_ENTITIES_TABLE,
  CREATE_ATTRIBUTES_TABLE,
  CREATE_RELATIONSHIPS_TABLE,
];
