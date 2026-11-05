/**
 * Modelo de Domínio: Relacionamento (Relationship)
 */
import { generateId } from '../utils/id.js';
import { getCurrentTimestamp } from '../utils/date.js';
import { DEFAULT_CARDINALITY } from '../constants/cardinalities.js';

export class Relationship {
  constructor({
    id,
    project_id,
    projectId,
    name,
    entity_a_id,
    entityAId,
    source_entity_id,
    sourceEntityId,
    entity_b_id,
    entityBId,
    target_entity_id,
    targetEntityId,
    cardinality,
    relationship_type,
    relationshipType,
    created_at,
    updated_at,
    createdAt,
    updatedAt,
    entity_a_name,
    entityAName,
    entity_b_name,
    entityBName,
  } = {}) {
    this.id = id || generateId();
    this.projectId = project_id || projectId || null;
    this.name = name ? name.trim() : null;
    this.entityAId = entity_a_id || entityAId || source_entity_id || sourceEntityId || null;
    this.entityBId = entity_b_id || entityBId || target_entity_id || targetEntityId || null;
    this.cardinality = cardinality || relationship_type || relationshipType || DEFAULT_CARDINALITY;
    this.createdAt = created_at || createdAt || getCurrentTimestamp();
    this.updatedAt = updated_at || updatedAt || this.createdAt;

    // Campos auxiliares de junção (JOINs)
    this.entityAName = entity_a_name || entityAName || null;
    this.entityBName = entity_b_name || entityBName || null;
  }

  // Aliases de conveniência
  get sourceEntityId() {
    return this.entityAId;
  }

  get targetEntityId() {
    return this.entityBId;
  }

  get relationshipType() {
    return this.cardinality;
  }

  toDbRow() {
    return {
      id: this.id,
      project_id: this.projectId,
      name: this.name,
      entity_a_id: this.entityAId,
      entity_b_id: this.entityBId,
      cardinality: this.cardinality,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  static fromDbRow(row) {
    if (!row) return null;
    return new Relationship(row);
  }
}
