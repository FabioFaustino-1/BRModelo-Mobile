/**
 * Repositório de Persistência: Projetos (Projects)
 * Realiza operações CRUD parametrizadas na tabela 'projects'.
 */
import { getDatabase } from '../index.js';
import { TABLES } from '../schema.js';
import { Project } from '../../models/Project.js';
import { validateProjectName } from '../../utils/validation.js';
import { getCurrentTimestamp } from '../../utils/date.js';

function resolveDb(customDb) {
  return customDb || getDatabase();
}

/**
 * Cria um novo projeto no banco de dados.
 * @param {{ name: string, viewportZoom?: number, viewportX?: number, viewportY?: number, id?: string }} projectData
 * @param {object} [customDb]
 * @returns {Promise<Project>}
 */
export async function createProject(projectData, customDb = null) {
  const db = resolveDb(customDb);
  const { name, id, viewportZoom, viewport_zoom, viewportX, viewport_x, viewportY, viewport_y } = projectData || {};

  const validation = validateProjectName(name);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const project = new Project({
    id,
    name,
    viewportZoom: viewportZoom !== undefined ? viewportZoom : viewport_zoom,
    viewportX: viewportX !== undefined ? viewportX : viewport_x,
    viewportY: viewportY !== undefined ? viewportY : viewport_y,
  });
  const row = project.toDbRow();

  const query = `
    INSERT INTO ${TABLES.PROJECTS} (id, name, viewport_zoom, viewport_x, viewport_y, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;
  await db.runAsync(query, [
    row.id,
    row.name,
    row.viewport_zoom,
    row.viewport_x,
    row.viewport_y,
    row.created_at,
    row.updated_at,
  ]);

  return project;
}

/**
 * Retorna todos os projetos ordenados pela última atualização (mais recentes primeiro).
 * @param {object} [customDb]
 * @returns {Promise<Project[]>}
 */
export async function getProjects(customDb = null) {
  const db = resolveDb(customDb);
  const query = `
    SELECT * FROM ${TABLES.PROJECTS}
    ORDER BY updated_at DESC;
  `;
  const rows = await db.getAllAsync(query);
  return rows.map((r) => Project.fromDbRow(r));
}

/**
 * Busca um projeto pelo seu identificador único.
 * @param {string} id
 * @param {object} [customDb]
 * @returns {Promise<Project|null>}
 */
export async function getProjectById(id, customDb = null) {
  if (!id) return null;
  const db = resolveDb(customDb);
  const query = `
    SELECT * FROM ${TABLES.PROJECTS}
    WHERE id = ?;
  `;
  const row = await db.getFirstAsync(query, [id]);
  return Project.fromDbRow(row);
}

/**
 * Atualiza o nome de um projeto e seu timestamp de atualização.
 * @param {string} id
 * @param {{ name: string }} updateData
 * @param {object} [customDb]
 * @returns {Promise<Project>}
 */
export async function updateProject(id, updateData, customDb = null) {
  if (!id) {
    throw new Error('Identificador do projeto é obrigatório para atualização.');
  }
  const db = resolveDb(customDb);
  const { name } = updateData || {};

  const validation = validateProjectName(name);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const existing = await getProjectById(id, db);
  if (!existing) {
    throw new Error(`Projeto com id '${id}' não encontrado.`);
  }

  const now = getCurrentTimestamp();
  const query = `
    UPDATE ${TABLES.PROJECTS}
    SET name = ?, updated_at = ?
    WHERE id = ?;
  `;
  await db.runAsync(query, [name.trim(), now, id]);

  existing.name = name.trim();
  existing.updatedAt = now;
  return existing;
}

/**
 * Atualiza o estado da visualização do Canvas (zoom e deslocamento).
 * @param {string} id
 * @param {{ zoom: number, x: number, y: number }} viewportData
 * @param {object} [customDb]
 * @returns {Promise<Project>}
 */
export async function updateProjectViewport(id, viewportData, customDb = null) {
  if (!id) {
    throw new Error('Identificador do projeto é obrigatório para salvar o viewport.');
  }
  const db = resolveDb(customDb);
  const existing = await getProjectById(id, db);
  if (!existing) {
    throw new Error(`Projeto com id '${id}' não encontrado.`);
  }

  const { zoom, x, y } = viewportData || {};
  const finalZoom = zoom !== undefined ? Number(zoom) : existing.viewportZoom;
  const finalX = x !== undefined ? Number(x) : existing.viewportX;
  const finalY = y !== undefined ? Number(y) : existing.viewportY;

  const now = getCurrentTimestamp();
  const query = `
    UPDATE ${TABLES.PROJECTS}
    SET viewport_zoom = ?, viewport_x = ?, viewport_y = ?, updated_at = ?
    WHERE id = ?;
  `;
  await db.runAsync(query, [finalZoom, finalX, finalY, now, id]);

  existing.viewportZoom = finalZoom;
  existing.viewportX = finalX;
  existing.viewportY = finalY;
  existing.updatedAt = now;
  return existing;
}

/**
 * Exclui um projeto e todos os seus dados dependentes (via CASCADE).
 * @param {string} id
 * @param {object} [customDb]
 * @returns {Promise<boolean>} Retorna true se o projeto foi removido, false se não existia.
 */
export async function deleteProject(id, customDb = null) {
  if (!id) return false;
  const db = resolveDb(customDb);
  const query = `
    DELETE FROM ${TABLES.PROJECTS}
    WHERE id = ?;
  `;
  const result = await db.runAsync(query, [id]);
  return (result.changes || 0) > 0;
}
