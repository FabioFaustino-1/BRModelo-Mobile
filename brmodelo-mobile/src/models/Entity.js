/**
 * Modelo de Domínio: Entidade (Entity)
 */
import { generateId } from '../utils/id.js';
import { getCurrentTimestamp } from '../utils/date.js';

export class Entity {
  constructor({
    id,
    project_id,
    projectId,
    name,
    position_x,
    positionX,
    position_y,
    positionY,
    created_at,
    updated_at,
    createdAt,
    updatedAt,
  } = {}) {
    this.id = id || generateId();
    this.projectId = project_id || projectId || null;
    this.name = name ? name.trim() : '';
    this.positionX = position_x !== undefined ? Number(position_x) : (positionX !== undefined ? Number(positionX) : 100);
    this.positionY = position_y !== undefined ? Number(position_y) : (positionY !== undefined ? Number(positionY) : 100);
    this.createdAt = created_at || createdAt || getCurrentTimestamp();
    this.updatedAt = updated_at || updatedAt || this.createdAt;
  }

  toDbRow() {
    return {
      id: this.id,
      project_id: this.projectId,
      name: this.name,
      position_x: this.positionX,
      position_y: this.positionY,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  static fromDbRow(row) {
    if (!row) return null;
    return new Entity(row);
  }
}
