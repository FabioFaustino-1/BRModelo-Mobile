/**
 * Modelo de Domínio: Atributo (Attribute)
 */
import { generateId } from '../utils/id.js';
import { getCurrentTimestamp } from '../utils/date.js';
import { DEFAULT_DATA_TYPE } from '../constants/dataTypes.js';

export class Attribute {
  constructor({
    id,
    entity_id,
    entityId,
    name,
    data_type,
    dataType,
    is_primary_key,
    isPrimaryKey,
    is_not_null,
    isNotNull,
    is_required,
    isRequired,
    created_at,
    updated_at,
    createdAt,
    updatedAt,
  } = {}) {
    this.id = id || generateId();
    this.entityId = entity_id || entityId || null;
    this.name = name ? name.trim() : '';
    this.dataType = (data_type || dataType || DEFAULT_DATA_TYPE).toUpperCase();
    this.isPrimaryKey = is_primary_key !== undefined ? Boolean(is_primary_key) : Boolean(isPrimaryKey);

    // Suporta is_not_null e aliases legados is_required
    const notNullVal = is_not_null !== undefined ? is_not_null : (isNotNull !== undefined ? isNotNull : (is_required !== undefined ? is_required : isRequired));
    this.isNotNull = Boolean(notNullVal);

    this.createdAt = created_at || createdAt || getCurrentTimestamp();
    this.updatedAt = updated_at || updatedAt || this.createdAt;
  }

  // Alias para compatibilidade com código existente
  get isRequired() {
    return this.isNotNull;
  }

  toDbRow() {
    return {
      id: this.id,
      entity_id: this.entityId,
      name: this.name,
      data_type: this.dataType,
      is_primary_key: this.isPrimaryKey ? 1 : 0,
      is_not_null: this.isNotNull ? 1 : 0,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  static fromDbRow(row) {
    if (!row) return null;
    return new Attribute(row);
  }
}
