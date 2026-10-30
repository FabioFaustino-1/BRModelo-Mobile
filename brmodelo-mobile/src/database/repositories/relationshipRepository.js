/**
 * Repositório de Persistência: Relacionamentos (Relationships)
 * Realiza operações CRUD parametrizadas na tabela 'relationships'.
 */
import { getDatabase } from '../index.js';
import { TABLES } from '../schema.js';
import { Relationship } from '../../models/Relationship.js';
import { isValidCardinality } from '../../constants/cardinalities.js';
import { getCurrentTimestamp } from '../../utils/date.js';

function resolveDb(customDb) {
  return customDb || getDatabase();
}

/**
 * Cria um novo relacionamento entre duas entidades do mesmo projeto.
 * @param {{
 *   projectId: string,
 *   entityAId: string,
 *   entityBId: string,
 *   cardinality: string,
 *   name?: string,
 *   id?: string
 * }} relationshipData
 * @param {object} [customDb]
 * @returns {Promise<Relationship>}
 */
export async function createRelationship(relationshipData, customDb = null) {
  const db = resolveDb(customDb);
  const {
    projectId,
    project_id,
    entityAId,
    entity_a_id,
    sourceEntityId,
    source_entity_id,
    entityBId,
    entity_b_id,
    targetEntityId,
    target_entity_id,
    cardinality,
    relationshipType,
    relationship_type,
    name,
    id,
  } = relationshipData || {};

  const finalProjectId = projectId || project_id;
  const finalEntityAId = entityAId || entity_a_id || sourceEntityId || source_entity_id;
  const finalEntityBId = entityBId || entity_b_id || targetEntityId || target_entity_id;
  const finalCardinality = (cardinality || relationshipType || relationship_type || '').trim();

  if (!finalProjectId) {
    throw new Error('Identificador do projeto é obrigatório para criar um relacionamento.');
  }
  if (!finalEntityAId || !finalEntityBId) {
    throw new Error('É necessário selecionar as duas entidades para estabelecer um relacionamento.');
  }
  if (finalEntityAId === finalEntityBId) {
    throw new Error('Relacionamentos de uma entidade com ela mesma não são suportados no MVP.');
  }
  if (!isValidCardinality(finalCardinality)) {
    throw new Error('Cardinalidade inválida. Valores aceitos: 1:1, 1:N ou N:N.');
  }

  const relationship = new Relationship({
    id,
    projectId: finalProjectId,
    name,
    entityAId: finalEntityAId,
    entityBId: finalEntityBId,
    cardinality: finalCardinality,
  });
  const row = relationship.toDbRow();

  const query = `
    INSERT INTO ${TABLES.RELATIONSHIPS} (
      id, project_id, name, entity_a_id, entity_b_id, cardinality, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;

  try {
    await db.runAsync(query, [
      row.id,
      row.project_id,
      row.name,
      row.entity_a_id,
      row.entity_b_id,
      row.cardinality,
      row.created_at,
      row.updated_at,
    ]);
  } catch (err) {
    if (err.message && (err.message.includes('FOREIGN KEY') || err.message.includes('foreign key'))) {
      throw new Error(
        'Falha de integridade referencial: as entidades selecionadas devem existir e pertencer obrigatoriamente ao mesmo projeto.'
      );
    }
    if (err.message && (err.message.includes('CHECK') || err.message.includes('check'))) {
      throw new Error('Restrição violada: verifique se a cardinalidade é válida e as entidades são distintas.');
    }
    throw err;
  }

  return relationship;
}

/**
 * Lista todos os relacionamentos de um projeto, incluindo os nomes das entidades associadas.
 * @param {string} projectId
 * @param {object} [customDb]
 * @returns {Promise<Relationship[]>}
 */
export async function getRelationshipsByProjectId(projectId, customDb = null) {
  if (!projectId) return [];
  const db = resolveDb(customDb);
  const query = `
    SELECT 
      r.*,
      ea.name AS entity_a_name,
      eb.name AS entity_b_name
    FROM ${TABLES.RELATIONSHIPS} r
    LEFT JOIN ${TABLES.ENTITIES} ea ON r.entity_a_id = ea.id
    LEFT JOIN ${TABLES.ENTITIES} eb ON r.entity_b_id = eb.id
    WHERE r.project_id = ?
    ORDER BY r.created_at ASC;
  `;
  const rows = await db.getAllAsync(query, [projectId]);
  return rows.map((r) => Relationship.fromDbRow(r));
}

/**
 * Consulta um relacionamento por seu identificador único.
 * @param {string} id
 * @param {object} [customDb]
 * @returns {Promise<Relationship|null>}
 */
export async function getRelationshipById(id, customDb = null) {
  if (!id) return null;
  const db = resolveDb(customDb);
  const query = `
    SELECT 
      r.*,
      ea.name AS entity_a_name,
      eb.name AS entity_b_name
    FROM ${TABLES.RELATIONSHIPS} r
    LEFT JOIN ${TABLES.ENTITIES} ea ON r.entity_a_id = ea.id
    LEFT JOIN ${TABLES.ENTITIES} eb ON r.entity_b_id = eb.id
    WHERE r.id = ?;
  `;
  const row = await db.getFirstAsync(query, [id]);
  return Relationship.fromDbRow(row);
}

/**
 * Atualiza o nome ou a cardinalidade de um relacionamento existente.
 * @param {string} id
 * @param {{ name?: string, cardinality?: string }} updateData
 * @param {object} [customDb]
 * @returns {Promise<Relationship>}
 */
export async function updateRelationship(id, updateData, customDb = null) {
  if (!id) {
    throw new Error('Identificador do relacionamento é obrigatório para atualização.');
  }
  const db = resolveDb(customDb);
  const existing = await getRelationshipById(id, db);
  if (!existing) {
    throw new Error(`Relacionamento com id '${id}' não encontrado.`);
  }

  const { name, cardinality, relationshipType, relationship_type } = updateData || {};

  const newName = name !== undefined ? (name ? name.trim() : null) : existing.name;
  const newCardinality = (cardinality || relationshipType || relationship_type || existing.cardinality).trim();

  if (!isValidCardinality(newCardinality)) {
    throw new Error('Cardinalidade inválida. Valores aceitos: 1:1, 1:N ou N:N.');
  }

  const now = getCurrentTimestamp();
  const query = `
    UPDATE ${TABLES.RELATIONSHIPS}
    SET name = ?, cardinality = ?, updated_at = ?
    WHERE id = ?;
  `;

  await db.runAsync(query, [newName, newCardinality, now, id]);

  existing.name = newName;
  existing.cardinality = newCardinality;
  existing.updatedAt = now;
  return existing;
}

/**
 * Exclui um relacionamento pelo identificador.
 * @param {string} id
 * @param {object} [customDb]
 * @returns {Promise<boolean>}
 */
export async function deleteRelationship(id, customDb = null) {
  if (!id) return false;
  const db = resolveDb(customDb);
  const query = `
    DELETE FROM ${TABLES.RELATIONSHIPS}
    WHERE id = ?;
  `;
  const result = await db.runAsync(query, [id]);
  return (result.changes || 0) > 0;
}
