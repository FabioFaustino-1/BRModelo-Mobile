/**
 * Repositório de Persistência: Atributos (Attributes)
 * Realiza operações CRUD parametrizadas na tabela 'attributes'.
 */
import { getDatabase } from '../index.js';
import { TABLES } from '../schema.js';
import { Attribute } from '../../models/Attribute.js';
import { validateAttribute } from '../../utils/validation.js';
import { getCurrentTimestamp } from '../../utils/date.js';

function resolveDb(customDb) {
  return customDb || getDatabase();
}

/**
 * Cria um novo atributo vinculado a uma entidade.
 * @param {{
 *   entityId: string,
 *   name: string,
 *   dataType: string,
 *   isPrimaryKey?: boolean|number,
 *   isNotNull?: boolean|number,
 *   id?: string
 * }} attributeData
 * @param {object} [customDb]
 * @returns {Promise<Attribute>}
 */
export async function createAttribute(attributeData, customDb = null) {
  const db = resolveDb(customDb);
  const { entityId, entity_id, name, dataType, data_type, isPrimaryKey, is_primary_key, isNotNull, is_not_null, is_required, id } = attributeData || {};
  const finalEntityId = entityId || entity_id;

  if (!finalEntityId) {
    throw new Error('Identificador da entidade (entityId) é obrigatório para criar um atributo.');
  }

  const finalDataType = (dataType || data_type || '').toUpperCase();
  const validation = validateAttribute({ name, dataType: finalDataType });
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const attribute = new Attribute({
    id,
    entityId: finalEntityId,
    name,
    dataType: finalDataType,
    isPrimaryKey: isPrimaryKey !== undefined ? isPrimaryKey : is_primary_key,
    isNotNull: isNotNull !== undefined ? isNotNull : (is_not_null !== undefined ? is_not_null : is_required),
  });
  const row = attribute.toDbRow();

  const query = `
    INSERT INTO ${TABLES.ATTRIBUTES} (
      id, entity_id, name, data_type, is_primary_key, is_not_null, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;

  try {
    await db.runAsync(query, [
      row.id,
      row.entity_id,
      row.name,
      row.data_type,
      row.is_primary_key,
      row.is_not_null,
      row.created_at,
      row.updated_at,
    ]);
  } catch (err) {
    if (err.message && (err.message.includes('UNIQUE') || err.message.includes('unique'))) {
      throw new Error(`Já existe um atributo chamado '${name.trim()}' nesta entidade.`);
    }
    if (err.message && (err.message.includes('FOREIGN KEY') || err.message.includes('foreign key'))) {
      throw new Error(`Entidade com id '${finalEntityId}' não existe.`);
    }
    if (err.message && (err.message.includes('CHECK') || err.message.includes('check'))) {
      throw new Error(`Restrição violada: verifique se os tipos de dados e indicadores são válidos.`);
    }
    throw err;
  }

  return attribute;
}

/**
 * Lista todos os atributos de uma entidade, priorizando chaves primárias e ordenados por nome.
 * @param {string} entityId
 * @param {object} [customDb]
 * @returns {Promise<Attribute[]>}
 */
export async function getAttributesByEntityId(entityId, customDb = null) {
  if (!entityId) return [];
  const db = resolveDb(customDb);
  const query = `
    SELECT * FROM ${TABLES.ATTRIBUTES}
    WHERE entity_id = ?
    ORDER BY is_primary_key DESC, name COLLATE NOCASE ASC;
  `;
  const rows = await db.getAllAsync(query, [entityId]);
  return rows.map((r) => Attribute.fromDbRow(r));
}

/**
 * Consulta um atributo por seu identificador único.
 * @param {string} id
 * @param {object} [customDb]
 * @returns {Promise<Attribute|null>}
 */
export async function getAttributeById(id, customDb = null) {
  if (!id) return null;
  const db = resolveDb(customDb);
  const query = `
    SELECT * FROM ${TABLES.ATTRIBUTES}
    WHERE id = ?;
  `;
  const row = await db.getFirstAsync(query, [id]);
  return Attribute.fromDbRow(row);
}

/**
 * Atualiza os dados de um atributo existente.
 * @param {string} id
 * @param {{
 *   name?: string,
 *   dataType?: string,
 *   isPrimaryKey?: boolean|number,
 *   isNotNull?: boolean|number
 * }} updateData
 * @param {object} [customDb]
 * @returns {Promise<Attribute>}
 */
export async function updateAttribute(id, updateData, customDb = null) {
  if (!id) {
    throw new Error('Identificador do atributo é obrigatório para atualização.');
  }
  const db = resolveDb(customDb);
  const existing = await getAttributeById(id, db);
  if (!existing) {
    throw new Error(`Atributo com id '${id}' não encontrado.`);
  }

  const { name, dataType, isPrimaryKey, isNotNull, is_not_null, is_primary_key, data_type } = updateData || {};

  const newName = name !== undefined ? name.trim() : existing.name;
  const newDataType = (dataType || data_type || existing.dataType).toUpperCase();
  const newIsPrimaryKey = isPrimaryKey !== undefined ? Boolean(isPrimaryKey) : (is_primary_key !== undefined ? Boolean(is_primary_key) : existing.isPrimaryKey);
  const newIsNotNull = isNotNull !== undefined ? Boolean(isNotNull) : (is_not_null !== undefined ? Boolean(is_not_null) : existing.isNotNull);

  const validation = validateAttribute({ name: newName, dataType: newDataType });
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const now = getCurrentTimestamp();
  const query = `
    UPDATE ${TABLES.ATTRIBUTES}
    SET name = ?, data_type = ?, is_primary_key = ?, is_not_null = ?, updated_at = ?
    WHERE id = ?;
  `;

  try {
    await db.runAsync(query, [
      newName,
      newDataType,
      newIsPrimaryKey ? 1 : 0,
      newIsNotNull ? 1 : 0,
      now,
      id,
    ]);
  } catch (err) {
    if (err.message && (err.message.includes('UNIQUE') || err.message.includes('unique'))) {
      throw new Error(`Já existe um atributo chamado '${newName}' nesta entidade.`);
    }
    throw err;
  }

  existing.name = newName;
  existing.dataType = newDataType;
  existing.isPrimaryKey = newIsPrimaryKey;
  existing.isNotNull = newIsNotNull;
  existing.updatedAt = now;
  return existing;
}

/**
 * Exclui um atributo pelo identificador.
 * @param {string} id
 * @param {object} [customDb]
 * @returns {Promise<boolean>}
 */
export async function deleteAttribute(id, customDb = null) {
  if (!id) return false;
  const db = resolveDb(customDb);
  const query = `
    DELETE FROM ${TABLES.ATTRIBUTES}
    WHERE id = ?;
  `;
  const result = await db.runAsync(query, [id]);
  return (result.changes || 0) > 0;
}
