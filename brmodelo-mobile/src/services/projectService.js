/**
 * Serviço de Aplicação: Projetos (ProjectService)
 * Orquestra as regras de negócio e validações antes de persistir na camada de dados.
 */
import * as projectRepository from '../database/repositories/projectRepository.js';
import * as entityRepository from '../database/repositories/entityRepository.js';
import * as relationshipRepository from '../database/repositories/relationshipRepository.js';
import { validateProjectName } from '../utils/validation.js';

/**
 * Cria um novo projeto após validar seu nome.
 * @param {{ name: string }} data
 * @param {object} [customDb]
 * @returns {Promise<import('../models/Project.js').Project>}
 */
export async function createProject(data, customDb = null) {
  const { name } = data || {};
  const validation = validateProjectName(name);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  return projectRepository.createProject({ name: name.trim() }, customDb);
}

/**
 * Retorna todos os projetos ordenados pela última modificação,
 * acompanhados da contagem de entidades e relacionamentos.
 * @param {object} [customDb]
 * @returns {Promise<Array<import('../models/Project.js').Project & { entityCount: number, relationshipCount: number }>>}
 */
export async function listProjectsWithStats(customDb = null) {
  const projects = await projectRepository.getProjects(customDb);
  
  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      const entities = await entityRepository.getEntitiesByProjectId(project.id, customDb);
      const relationships = await relationshipRepository.getRelationshipsByProjectId(project.id, customDb);
      return {
        ...project,
        entityCount: entities.length,
        relationshipCount: relationships.length,
      };
    })
  );

  return projectsWithStats;
}

/**
 * Retorna um projeto por ID com todas as suas entidades e relacionamentos carregados.
 * @param {string} projectId
 * @param {object} [customDb]
 * @returns {Promise<{ project: import('../models/Project.js').Project, entities: Array, relationships: Array }>}
 */
export async function getProjectDetails(projectId, customDb = null) {
  if (!projectId) {
    throw new Error('Identificador do projeto é obrigatório.');
  }

  const project = await projectRepository.getProjectById(projectId, customDb);
  if (!project) {
    throw new Error('Projeto não encontrado.');
  }

  const entities = await entityRepository.getEntitiesByProjectId(projectId, customDb);
  const relationships = await relationshipRepository.getRelationshipsByProjectId(projectId, customDb);

  return {
    project,
    entities,
    relationships,
  };
}

/**
 * Atualiza o nome de um projeto.
 * @param {string} id
 * @param {string} newName
 * @param {object} [customDb]
 * @returns {Promise<import('../models/Project.js').Project>}
 */
export async function renameProject(id, newName, customDb = null) {
  const validation = validateProjectName(newName);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  return projectRepository.updateProject(id, { name: newName.trim() }, customDb);
}

/**
 * Exclui um projeto e todos os seus vínculos em cascata.
 * @param {string} id
 * @param {object} [customDb]
 * @returns {Promise<boolean>}
 */
export async function deleteProject(id, customDb = null) {
  if (!id) {
    throw new Error('Identificador do projeto é obrigatório para exclusão.');
  }
  return projectRepository.deleteProject(id, customDb);
}
