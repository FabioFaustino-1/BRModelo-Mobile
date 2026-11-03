/**
 * Serviço de Aplicação: Relacionamentos (RelationshipService)
 * Orquestra as regras de negócio para criação, edição e remoção de relacionamentos entre entidades.
 */
import * as relationshipRepository from '../database/repositories/relationshipRepository.js';
import * as entityRepository from '../database/repositories/entityRepository.js';
import { validateRelationship } from '../utils/validation.js';
import { isValidCardinality } from '../constants/cardinalities.js';

/**
 * Cria um novo relacionamento entre duas entidades do mesmo projeto.
 * @param {{
 *   projectId: string,
 *   entityAId: string,
 *   entityBId: string,
 *   cardinality: string,
 *   name?: string
 * }} data
 * @param {object} [customDb]
 * @returns {Promise<import('../models/Relationship.js').Relationship>}
 */
export async function createRelationship(data, customDb = null) {
  const { projectId, entityAId, entityBId, cardinality, name } = data || {};
  if (!projectId) {
    throw new Error('Identificador do projeto é obrigatório.');
  }

  // Busca entidades do projeto para validação semântica
  const projectEntities = await entityRepository.getEntitiesByProjectId(projectId, customDb);

  if (projectEntities.length < 2) {
    throw new Error('É necessário ter ao menos duas entidades cadastradas para criar um relacionamento.');
  }

  const validation = validateRelationship(
    { projectId, entityAId, entityBId, cardinality },
    projectEntities
  );
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  return relationshipRepository.createRelationship(
    {
      projectId,
      entityAId,
      entityBId,
      cardinality: cardinality.trim(),
      name: name ? name.trim() : null,
    },
    customDb
  );
}

/**
 * Lista todos os relacionamentos de um projeto com dados enriquecidos (nomes de entidades).
 * @param {string} projectId
 * @param {object} [customDb]
 * @returns {Promise<Array<import('../models/Relationship.js').Relationship>>}
 */
export async function listRelationships(projectId, customDb = null) {
  if (!projectId) return [];
  return relationshipRepository.getRelationshipsByProjectId(projectId, customDb);
}

/**
 * Atualiza um relacionamento existente (nome e/ou cardinalidade).
 * @param {string} id
 * @param {{ name?: string, cardinality?: string }} updateData
 * @param {object} [customDb]
 * @returns {Promise<import('../models/Relationship.js').Relationship>}
 */
export async function updateRelationship(id, updateData, customDb = null) {
  if (!id) {
    throw new Error('Identificador do relacionamento é obrigatório.');
  }

  if (updateData.cardinality && !isValidCardinality(updateData.cardinality)) {
    throw new Error('Cardinalidade inválida. Valores aceitos: 1:1, 1:N ou N:N.');
  }

  return relationshipRepository.updateRelationship(id, updateData, customDb);
}

/**
 * Exclui um relacionamento existente.
 * @param {string} id
 * @param {object} [customDb]
 * @returns {Promise<boolean>}
 */
export async function deleteRelationship(id, customDb = null) {
  if (!id) {
    throw new Error('Identificador do relacionamento é obrigatório para exclusão.');
  }
  return relationshipRepository.deleteRelationship(id, customDb);
}
