/**
 * Serviço de Aplicação: Atributos (AttributeService)
 * Orquestra as regras de negócio para definição, alteração e remoção de atributos de entidades.
 */
import * as attributeRepository from '../database/repositories/attributeRepository.js';
import * as entityRepository from '../database/repositories/entityRepository.js';
import { validateAttribute } from '../utils/validation.js';

/**
 * Cria um novo atributo para uma entidade.
 * @param {{
 *   entityId: string,
 *   name: string,
 *   dataType: string,
 *   isPrimaryKey?: boolean|number,
 *   isNotNull?: boolean|number
 * }} data
 * @param {object} [customDb]
 * @returns {Promise<import('../models/Attribute.js').Attribute>}
 */
export async function createAttribute(data, customDb = null) {
  const { entityId, name, dataType, isPrimaryKey, isNotNull } = data || {};
  if (!entityId) {
    throw new Error('Identificador da entidade é obrigatório.');
  }

  const entity = await entityRepository.getEntityById(entityId, customDb);
  if (!entity) {
    throw new Error('Entidade vinculada não encontrada.');
  }

  const existingAttributes = await attributeRepository.getAttributesByEntityId(entityId, customDb);
  const normalizedType = (dataType || '').toUpperCase();

  const validation = validateAttribute(
    { name, dataType: normalizedType },
    existingAttributes
  );
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  return attributeRepository.createAttribute(
    {
      entityId,
      name: name.trim(),
      dataType: normalizedType,
      isPrimaryKey: Boolean(isPrimaryKey),
      isNotNull: Boolean(isNotNull) || Boolean(isPrimaryKey), // Se for PK, é obrigatoriamente NOT NULL
    },
    customDb
  );
}

/**
 * Atualiza um atributo existente, mantendo propriedades originais que não foram enviadas.
 * @param {string} id
 * @param {{
 *   name?: string,
 *   dataType?: string,
 *   isPrimaryKey?: boolean,
 *   isNotNull?: boolean
 * }} updateData
 * @param {object} [customDb]
 * @returns {Promise<import('../models/Attribute.js').Attribute>}
 */
export async function updateAttribute(id, updateData, customDb = null) {
  if (!id) {
    throw new Error('Identificador do atributo é obrigatório.');
  }

  const existing = await attributeRepository.getAttributeById(id, customDb);
  if (!existing) {
    throw new Error('Atributo não encontrado.');
  }

  const siblings = await attributeRepository.getAttributesByEntityId(existing.entityId, customDb);
  const newName = updateData.name !== undefined ? updateData.name.trim() : existing.name;
  const newDataType = (updateData.dataType || existing.dataType).toUpperCase();
  const newIsPrimaryKey = updateData.isPrimaryKey !== undefined ? Boolean(updateData.isPrimaryKey) : existing.isPrimaryKey;
  const newIsNotNull = updateData.isNotNull !== undefined ? Boolean(updateData.isNotNull) : (newIsPrimaryKey ? true : existing.isNotNull);

  const validation = validateAttribute(
    { name: newName, dataType: newDataType },
    siblings,
    id
  );
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  return attributeRepository.updateAttribute(
    id,
    {
      name: newName,
      dataType: newDataType,
      isPrimaryKey: newIsPrimaryKey,
      isNotNull: newIsNotNull,
    },
    customDb
  );
}

/**
 * Exclui um atributo pelo identificador.
 * @param {string} id
 * @param {object} [customDb]
 * @returns {Promise<boolean>}
 */
export async function deleteAttribute(id, customDb = null) {
  if (!id) {
    throw new Error('Identificador do atributo é obrigatório para exclusão.');
  }
  return attributeRepository.deleteAttribute(id, customDb);
}
