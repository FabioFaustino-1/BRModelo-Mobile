/**
 * Serviço de Aplicação: Entidades (EntityService)
 * Orquestra as regras de negócio para criação, edição e remoção de entidades relacionais.
 */
import * as entityRepository from '../database/repositories/entityRepository.js';
import * as attributeRepository from '../database/repositories/attributeRepository.js';
import * as projectRepository from '../database/repositories/projectRepository.js';
import { validateEntityName } from '../utils/validation.js';

/**
 * Cria uma nova entidade em um projeto após validações.
 * @param {{ projectId: string, name: string, positionX?: number, positionY?: number }} data
 * @param {object} [customDb]
 * @returns {Promise<import('../models/Entity.js').Entity>}
 */
export async function createEntity(data, customDb = null) {
  const { projectId, name, positionX, positionY } = data || {};
  if (!projectId) {
    throw new Error('Identificador do projeto é obrigatório.');
  }

  const project = await projectRepository.getProjectById(projectId, customDb);
  if (!project) {
    throw new Error('Projeto pai não encontrado.');
  }

  const existingEntities = await entityRepository.getEntitiesByProjectId(projectId, customDb);
  const validation = validateEntityName(name, existingEntities);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Se não foi informada coordenada explícita, calcula posição em grade
  const index = existingEntities.length;
  const defaultX = 60 + (index % 2) * 240;
  const defaultY = 60 + Math.floor(index / 2) * 200;

  const finalX = positionX !== undefined ? Number(positionX) : defaultX;
  const finalY = positionY !== undefined ? Number(positionY) : defaultY;

  return entityRepository.createEntity(
    {
      projectId,
      name: name.trim(),
      positionX: finalX,
      positionY: finalY,
    },
    customDb
  );
}

/**
 * Retorna as entidades de um projeto com seus atributos carregados.
 * @param {string} projectId
 * @param {object} [customDb]
 * @returns {Promise<Array<import('../models/Entity.js').Entity & { attributes: Array, attributeCount: number }>>}
 */
export async function listEntitiesWithAttributes(projectId, customDb = null) {
  const entities = await entityRepository.getEntitiesByProjectId(projectId, customDb);

  const entitiesWithAttrs = await Promise.all(
    entities.map(async (entity) => {
      const attributes = await attributeRepository.getAttributesByEntityId(entity.id, customDb);
      return {
        ...entity,
        attributes,
        attributeCount: attributes.length,
      };
    })
  );

  return entitiesWithAttrs;
}

/**
 * Retorna uma entidade por ID com seus atributos associados.
 * @param {string} entityId
 * @param {object} [customDb]
 * @returns {Promise<{ entity: import('../models/Entity.js').Entity, attributes: Array }>}
 */
export async function getEntityDetails(entityId, customDb = null) {
  const entity = await entityRepository.getEntityById(entityId, customDb);
  if (!entity) {
    throw new Error('Entidade não encontrada.');
  }
  const attributes = await attributeRepository.getAttributesByEntityId(entityId, customDb);
  return {
    entity,
    attributes,
  };
}

/**
 * Atualiza o nome de uma entidade garantindo unicidade no projeto.
 * @param {string} id
 * @param {string} newName
 * @param {object} [customDb]
 * @returns {Promise<import('../models/Entity.js').Entity>}
 */
export async function renameEntity(id, newName, customDb = null) {
  const existing = await entityRepository.getEntityById(id, customDb);
  if (!existing) {
    throw new Error('Entidade não encontrada.');
  }

  const siblings = await entityRepository.getEntitiesByProjectId(existing.projectId, customDb);
  const validation = validateEntityName(newName, siblings, id);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  return entityRepository.updateEntity(id, { name: newName.trim() }, customDb);
}

/**
 * Atualiza as coordenadas (x, y) de uma entidade no canvas e persiste no SQLite.
 * @param {string} id
 * @param {number} x
 * @param {number} y
 * @param {object} [customDb]
 * @returns {Promise<import('../models/Entity.js').Entity>}
 */
export async function updateEntityPosition(id, x, y, customDb = null) {
  return entityRepository.updateEntityPosition(id, x, y, customDb);
}

/**
 * Exclui uma entidade e seus dependentes em cascata.
 * @param {string} id
 * @param {object} [customDb]
 * @returns {Promise<boolean>}
 */
export async function deleteEntity(id, customDb = null) {
  if (!id) {
    throw new Error('Identificador da entidade é obrigatório para exclusão.');
  }
  return entityRepository.deleteEntity(id, customDb);
}
