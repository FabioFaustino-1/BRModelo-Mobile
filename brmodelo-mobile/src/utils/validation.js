/**
 * Utilitários de Validação de Dados do BRMM
 */

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
 * @param {{ name: string, dataType: string }} attributeData
 * @param {Array<{ id: string, name: string }>} existingAttributes
 * @param {string|null} currentAttributeId
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateAttribute(attributeData, existingAttributes = [], currentAttributeId = null) {
  const { name, dataType } = attributeData || {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { isValid: false, error: 'O nome do atributo é obrigatório.' };
  }
  if (!dataType || typeof dataType !== 'string' || dataType.trim().length === 0) {
    return { isValid: false, error: 'O tipo de dado do atributo é obrigatório.' };
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
 * @param {{ sourceEntityId: string, targetEntityId: string, relationshipType: string }} relationshipData
 * @param {Array<{ id: string }>} existingEntities
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateRelationship(relationshipData, existingEntities = []) {
  const { sourceEntityId, targetEntityId, relationshipType } = relationshipData || {};

  if (!sourceEntityId || !targetEntityId) {
    return { isValid: false, error: 'É necessário selecionar entidade de origem e de destino.' };
  }

  const entityIds = new Set(existingEntities.map((e) => e.id));
  if (!entityIds.has(sourceEntityId) || !entityIds.has(targetEntityId)) {
    return { isValid: false, error: 'As entidades de origem e destino devem existir no projeto.' };
  }

  if (!relationshipType) {
    return { isValid: false, error: 'A cardinalidade do relacionamento é obrigatória.' };
  }

  return { isValid: true };
}
