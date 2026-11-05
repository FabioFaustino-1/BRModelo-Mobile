/**
 * Repositório de Persistência: Entidades (Entities)
 * Realiza operações CRUD parametrizadas na tabela 'entities'.
 */
import { getDatabase } from '../index.js';
import { TABLES } from '../schema.js';
import { Entity } from '../../models/Entity.js';
import { validateEntityName } from '../../utils/validation.js';
import { getCurrentTimestamp } from '../../utils/date.js';

function resolveDb(customDb) {
  return customDb || getDatabase();
}

/**
 * Cria uma nova entidade vinculada a um projeto.
 * @param {{ projectId: string, name: string, positionX?: number, positionY?: number, id?: string }} entityData
 * @param {object} [customDb]
 * @returns {Promise<Entity>}
 */
export async function createEntity(entityData, customDb = null) {
  const db = resolveDb(customDb);
  const { projectId, project_id, name, positionX, position_x, positionY, position_y, id } = entityData || {};
  const finalProjectId = projectId || project_id;

  if (!finalProjectId) {
    throw new Error('Identificador do projeto (projectId) é obrigatório para criar uma entidade.');
  }

  // Validação prévia de formato
  const basicValidation = validateEntityName(name);
  if (!basicValidation.isValid) {
    throw new Error(basicValidation.error);
  }

  const finalX = positionX !== undefined ? positionX : (position_x !== undefined ? position_x : 100);
  const finalY = positionY !== undefined ? positionY : (position_y !== undefined ? position_y : 100);

  const entity = new Entity({
    id,
    projectId: finalProjectId,
    name,
    positionX: finalX,
    positionY: finalY,
  });
  const row = entity.toDbRow();

  const query = `
    INSERT INTO ${TABLES.ENTITIES} (id, project_id, name, position_x, position_y, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  try {
    await db.runAsync(query, [
      row.id,
      row.project_id,
      row.name,
      row.position_x,
      row.position_y,
      row.created_at,
      row.updated_at,
    ]);
  } catch (err) {
    if (err.message && (err.message.includes('UNIQUE') || err.message.includes('unique'))) {
      throw new Error(`Já existe uma entidade chamada '${name.trim()}' neste projeto.`);
    }
    if (err.message && (err.message.includes('FOREIGN KEY') || err.message.includes('foreign key'))) {
      throw new Error(`Projeto com id '${finalProjectId}' não existe.`);
    }
    throw err;
  }

  return entity;
}

/**
 * Lista todas as entidades pertencentes a um projeto, ordenadas alfabeticamente.
 * @param {string} projectId
 * @param {object} [customDb]
 * @returns {Promise<Entity[]>}
 */
export async function getEntitiesByProjectId(projectId, customDb = null) {
  if (!projectId) return [];
  const db = resolveDb(customDb);
  const query = `
    SELECT * FROM ${TABLES.ENTITIES}
    WHERE project_id = ?
    ORDER BY name COLLATE NOCASE ASC;
  `;
  const rows = await db.getAllAsync(query, [projectId]);
  return rows.map((r) => Entity.fromDbRow(r));
}

/**
 * Consulta uma entidade por seu identificador único.
 * @param {string} id
 * @param {object} [customDb]
 * @returns {Promise<Entity|null>}
 */
export async function getEntityById(id, customDb = null) {
  if (!id) return null;
  const db = resolveDb(customDb);
  const query = `
    SELECT * FROM ${TABLES.ENTITIES}
    WHERE id = ?;
  `;
  const row = await db.getFirstAsync(query, [id]);
  return Entity.fromDbRow(row);
}

/**
 * Atualiza o nome de uma entidade existente.
 * @param {string} id
 * @param {{ name: string }} updateData
 * @param {object} [customDb]
 * @returns {Promise<Entity>}
 */
export async function updateEntity(id, updateData, customDb = null) {
  if (!id) {
    throw new Error('Identificador da entidade é obrigatório para atualização.');
  }
  const db = resolveDb(customDb);
  const { name } = updateData || {};

  const basicValidation = validateEntityName(name);
  if (!basicValidation.isValid) {
    throw new Error(basicValidation.error);
  }

  const existing = await getEntityById(id, db);
  if (!existing) {
    throw new Error(`Entidade com id '${id}' não encontrada.`);
  }

  const now = getCurrentTimestamp();
  const query = `
    UPDATE ${TABLES.ENTITIES}
    SET name = ?, updated_at = ?
    WHERE id = ?;
  `;

  try {
    await db.runAsync(query, [name.trim(), now, id]);
  } catch (err) {
    if (err.message && (err.message.includes('UNIQUE') || err.message.includes('unique'))) {
      throw new Error(`Já existe uma entidade chamada '${name.trim()}' neste projeto.`);
    }
    throw err;
  }

  existing.name = name.trim();
  existing.updatedAt = now;
  return existing;
}

/**
 * Atualiza as coordenadas visuais da entidade no Canvas.
 * @param {string} id
 * @param {number} positionX
 * @param {number} positionY
 * @param {object} [customDb]
 * @returns {Promise<Entity>}
 */
export async function updateEntityPosition(id, positionX, positionY, customDb = null) {
  if (!id) {
    throw new Error('Identificador da entidade é obrigatório para mover no canvas.');
  }
  const db = resolveDb(customDb);
  const existing = await getEntityById(id, db);
  if (!existing) {
    throw new Error(`Entidade com id '${id}' não encontrada.`);
  }

  const now = getCurrentTimestamp();
  const query = `
    UPDATE ${TABLES.ENTITIES}
    SET position_x = ?, position_y = ?, updated_at = ?
    WHERE id = ?;
  `;
  await db.runAsync(query, [Number(positionX), Number(positionY), now, id]);

  existing.positionX = Number(positionX);
  existing.positionY = Number(positionY);
  existing.updatedAt = now;
  return existing;
}

/**
 * Exclui uma entidade pelo identificador (remove em cascata atributos e relacionamentos vinculados).
 * @param {string} id
 * @param {object} [customDb]
 * @returns {Promise<boolean>}
 */
export async function deleteEntity(id, customDb = null) {
  if (!id) return false;
  const db = resolveDb(customDb);
  const query = `
    DELETE FROM ${TABLES.ENTITIES}
    WHERE id = ?;
  `;
  const result = await db.runAsync(query, [id]);
  return (result.changes || 0) > 0;
}
