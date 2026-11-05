/**
 * Utilitários de Validação de Dados do BRMM
 */
import { isValidDataType } from '../constants/dataTypes.js';
import { isValidCardinality } from '../constants/cardinalities.js';

/**
 * Valida o nome de um projeto.
 * @param {string} name
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateProjectName(name) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { isValid: false, error: 'O nome do projeto é obrigatório.' };
  }
  if (name.trim().length > 80) {
    return { isValid: false, error: 'O nome do projeto deve ter no máximo 80 caracteres.' };
  }
  return { isValid: true };
}

/**
 * Valida o nome de uma entidade no contexto de um projeto.
 * @param {string} name
 * @param {Array<{ id: string, name: string }>} existingEntities
 * @param {string|null} currentEntityId
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateEntityName(name, existingEntities = [], currentEntityId = null) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { isValid: false, error: 'O nome da entidade é obrigatório.' };
  }
  if (name.trim().length > 80) {
    return { isValid: false, error: 'O nome da entidade deve ter no máximo 80 caracteres.' };
  }
  const normalized = name.trim().toLowerCase();
  const duplicate = existingEntities.find(
    (e) => e.name.trim().toLowerCase() === normalized && e.id !== currentEntityId
  );
  if (duplicate) {
    return { isValid: false, error: 'Já existe uma entidade com este nome no projeto.' };
  }
  return { isValid: true };
}

/**
 * Valida os dados de um atributo de entidade.
 * @param {{ name: string, dataType: string, isPrimaryKey?: boolean|number, isNotNull?: boolean|number }} attributeData
 * @param {Array<{ id: string, name: string }>} existingAttributes
 * @param {string|null} currentAttributeId
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateAttribute(attributeData, existingAttributes = [], currentAttributeId = null) {
  const { name, dataType } = attributeData || {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { isValid: false, error: 'O nome do atributo é obrigatório.' };
  }
  if (name.trim().length > 80) {
    return { isValid: false, error: 'O nome do atributo deve ter no máximo 80 caracteres.' };
  }
  if (!dataType || !isValidDataType(dataType)) {
    return {
      isValid: false,
      error: `Tipo de dado inválido. Tipos permitidos: INTEGER, VARCHAR, TEXT, REAL, DECIMAL, BOOLEAN, DATE, DATETIME.`,
    };
  }

  const normalized = name.trim().toLowerCase();
  const duplicate = existingAttributes.find(
    (a) => a.name.trim().toLowerCase() === normalized && a.id !== currentAttributeId
  );
  if (duplicate) {
    return { isValid: false, error: 'Já existe um atributo com este nome nesta entidade.' };
  }

  return { isValid: true };
}

/**
 * Valida a criação de um relacionamento entre duas entidades.
 * @param {{ projectId: string, entityAId: string, entityBId: string, cardinality: string }} relationshipData
 * @param {Array<{ id: string, project_id?: string, projectId?: string }>} projectEntities
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateRelationship(relationshipData, projectEntities = []) {
  const { projectId, entityAId, entityBId, cardinality } = relationshipData || {};

  if (!projectId) {
    return { isValid: false, error: 'O identificador do projeto é obrigatório.' };
  }

  if (!entityAId || !entityBId) {
    return { isValid: false, error: 'É necessário selecionar a primeira e a segunda entidade.' };
  }

  if (entityAId === entityBId) {
    return {
      isValid: false,
      error: 'Relacionamentos de uma entidade com ela mesma não são suportados no MVP.',
    };
  }

  if (!cardinality || !isValidCardinality(cardinality)) {
    return {
      isValid: false,
      error: 'Cardinalidade inválida. Valores aceitos: 1:1, 1:N ou N:N.',
    };
  }

  const entityMap = new Map(projectEntities.map((e) => [e.id, e]));
  const entityA = entityMap.get(entityAId);
  const entityB = entityMap.get(entityBId);

  if (!entityA || !entityB) {
    return {
      isValid: false,
      error: 'As duas entidades devem pertencer ao projeto informado e existir no sistema.',
    };
  }

  return { isValid: true };
}
