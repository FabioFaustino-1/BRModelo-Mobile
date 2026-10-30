/**
 * Modelo de Domínio: Projeto (Project)
 */
import { generateId } from '../utils/id.js';
import { getCurrentTimestamp } from '../utils/date.js';

export class Project {
  constructor({ id, name, created_at, updated_at, createdAt, updatedAt } = {}) {
    this.id = id || generateId();
    this.name = name ? name.trim() : '';
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
