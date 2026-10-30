/**
 * Modelo de Domínio: Entidade (Entity)
 */
import { generateId } from '../utils/id.js';
import { getCurrentTimestamp } from '../utils/date.js';

export class Entity {
  constructor({ id, project_id, projectId, name, created_at, updated_at, createdAt, updatedAt } = {}) {
    this.id = id || generateId();
    this.projectId = project_id || projectId || null;
    this.name = name ? name.trim() : '';
    this.createdAt = created_at || createdAt || getCurrentTimestamp();
    this.updatedAt = updated_at || updatedAt || this.createdAt;
  }

  toDbRow() {
    return {
      id: this.id,
      project_id: this.projectId,
      name: this.name,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  static fromDbRow(row) {
    if (!row) return null;
    return new Entity(row);
  }
}
