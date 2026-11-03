/**
 * Modelo de Domínio: Projeto (Project)
 */
import { generateId } from '../utils/id.js';
import { getCurrentTimestamp } from '../utils/date.js';

export class Project {
  constructor({
    id,
    name,
    viewport_zoom,
    viewportZoom,
    viewport_x,
    viewportX,
    viewport_y,
    viewportY,
    created_at,
    updated_at,
    createdAt,
    updatedAt,
  } = {}) {
    this.id = id || generateId();
    this.name = name ? name.trim() : '';
    this.viewportZoom = viewport_zoom !== undefined ? Number(viewport_zoom) : (viewportZoom !== undefined ? Number(viewportZoom) : 1.0);
    this.viewportX = viewport_x !== undefined ? Number(viewport_x) : (viewportX !== undefined ? Number(viewportX) : 0);
    this.viewportY = viewport_y !== undefined ? Number(viewport_y) : (viewportY !== undefined ? Number(viewportY) : 0);
    this.createdAt = created_at || createdAt || getCurrentTimestamp();
    this.updatedAt = updated_at || updatedAt || this.createdAt;
  }

  /**
   * Converte o modelo para o formato de linha do banco SQLite.
   */
  toDbRow() {
    return {
      id: this.id,
      name: this.name,
      viewport_zoom: this.viewportZoom,
      viewport_x: this.viewportX,
      viewport_y: this.viewportY,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  /**
   * Cria uma instância a partir de uma linha do SQLite.
   */
  static fromDbRow(row) {
    if (!row) return null;
    return new Project(row);
  }
}
