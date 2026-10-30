/**
 * Definições DDL do Schema SQLite para o BRMM
 * Tabelas: projects, entities, attributes, relationships e metadados de migrações.
 */

export const DATABASE_NAME = 'brmm_local.db';

export const TABLES = {
  PROJECTS: 'projects',
  ENTITIES: 'entities',
  ATTRIBUTES: 'attributes',
  RELATIONSHIPS: 'relationships',
  MIGRATIONS: '__migrations',
};

export const ENABLE_FOREIGN_KEYS = `PRAGMA foreign_keys = ON;`;

export const CREATE_MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${TABLES.MIGRATIONS} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL
  );
`;

export const CREATE_PROJECTS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${TABLES.PROJECTS} (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

export const CREATE_ENTITIES_TABLE = `
  CREATE TABLE IF NOT EXISTS ${TABLES.ENTITIES} (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES ${TABLES.PROJECTS}(id) ON DELETE CASCADE,
    UNIQUE (project_id, name COLLATE NOCASE),
    UNIQUE (id, project_id)
  );
`;

export const CREATE_ATTRIBUTES_TABLE = `
  CREATE TABLE IF NOT EXISTS ${TABLES.ATTRIBUTES} (
    id TEXT PRIMARY KEY NOT NULL,
    entity_id TEXT NOT NULL,
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    data_type TEXT NOT NULL CHECK(data_type IN ('INTEGER', 'VARCHAR', 'TEXT', 'REAL', 'DECIMAL', 'BOOLEAN', 'DATE', 'DATETIME')),
    is_primary_key INTEGER NOT NULL DEFAULT 0 CHECK(is_primary_key IN (0, 1)),
    is_not_null INTEGER NOT NULL DEFAULT 0 CHECK(is_not_null IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (entity_id) REFERENCES ${TABLES.ENTITIES}(id) ON DELETE CASCADE,
    UNIQUE (entity_id, name COLLATE NOCASE)
  );
`;

export const CREATE_RELATIONSHIPS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${TABLES.RELATIONSHIPS} (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL,
    name TEXT,
    entity_a_id TEXT NOT NULL,
    entity_b_id TEXT NOT NULL,
    cardinality TEXT NOT NULL CHECK(cardinality IN ('1:1', '1:N', 'N:N')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK (entity_a_id <> entity_b_id),
    FOREIGN KEY (project_id) REFERENCES ${TABLES.PROJECTS}(id) ON DELETE CASCADE,
    FOREIGN KEY (entity_a_id, project_id) REFERENCES ${TABLES.ENTITIES}(id, project_id) ON DELETE CASCADE,
    FOREIGN KEY (entity_b_id, project_id) REFERENCES ${TABLES.ENTITIES}(id, project_id) ON DELETE CASCADE
  );
`;

export const CREATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_entities_project_id ON ${TABLES.ENTITIES}(project_id);`,
  `CREATE INDEX IF NOT EXISTS idx_attributes_entity_id ON ${TABLES.ATTRIBUTES}(entity_id);`,
  `CREATE INDEX IF NOT EXISTS idx_relationships_project_id ON ${TABLES.RELATIONSHIPS}(project_id);`,
  `CREATE INDEX IF NOT EXISTS idx_relationships_entities ON ${TABLES.RELATIONSHIPS}(entity_a_id, entity_b_id);`,
];
