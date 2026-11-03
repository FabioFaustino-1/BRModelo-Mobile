/**
 * Testes Automatizados da Camada de Serviços — BRMM
 * Valida a orquestração de negócios, regras semânticas e integração com repositórios.
 */
import test, { describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { closeDatabase, setDatabase } from '../src/database/index.js';
import { runMigrations } from '../src/database/migrations/index.js';
import { ENABLE_FOREIGN_KEYS } from '../src/database/schema.js';
import { createNodeAdapter } from './helpers/nodeSqliteAdapter.js';

import * as projectService from '../src/services/projectService.js';
import * as entityService from '../src/services/entityService.js';
import * as attributeService from '../src/services/attributeService.js';
import * as relationshipService from '../src/services/relationshipService.js';

describe('Camada de Serviços de Aplicação — BRMM', () => {
  let db;

  beforeEach(async () => {
    db = createNodeAdapter(':memory:');
    await db.execAsync(ENABLE_FOREIGN_KEYS);
    await runMigrations(db);
    setDatabase(db);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  describe('ProjectService', () => {
    test('Deve validar nome obrigatório na criação de projeto', async () => {
      await assert.rejects(
        () => projectService.createProject({ name: '   ' }),
        /O nome do projeto é obrigatório/
      );
    });

    test('Deve criar projeto e listar com estatísticas de entidades e relacionamentos', async () => {
      const proj = await projectService.createProject({ name: 'ERP Financeiro' });
      assert.ok(proj.id);

      const ent1 = await entityService.createEntity({ projectId: proj.id, name: 'Conta' });
      const ent2 = await entityService.createEntity({ projectId: proj.id, name: 'Lancamento' });

      await relationshipService.createRelationship({
        projectId: proj.id,
        entityAId: ent1.id,
        entityBId: ent2.id,
        cardinality: '1:N',
      });

      const list = await projectService.listProjectsWithStats();
      assert.strictEqual(list.length, 1);
      assert.strictEqual(list[0].name, 'ERP Financeiro');
      assert.strictEqual(list[0].entityCount, 2);
      assert.strictEqual(list[0].relationshipCount, 1);
    });

    test('Deve renomear projeto com validação', async () => {
      const proj = await projectService.createProject({ name: 'Nome Original' });
      const updated = await projectService.renameProject(proj.id, 'Nome Modificado');
      assert.strictEqual(updated.name, 'Nome Modificado');

      await assert.rejects(
        () => projectService.renameProject(proj.id, ''),
        /O nome do projeto é obrigatório/
      );
    });

    test('Deve carregar detalhes do projeto com entidades e relacionamentos', async () => {
      const proj = await projectService.createProject({ name: 'Hospital' });
      const ent = await entityService.createEntity({ projectId: proj.id, name: 'Medico' });

      const details = await projectService.getProjectDetails(proj.id);
      assert.strictEqual(details.project.name, 'Hospital');
      assert.strictEqual(details.entities.length, 1);
      assert.strictEqual(details.entities[0].name, 'Medico');
      assert.strictEqual(details.relationships.length, 0);
    });
  });

  describe('EntityService', () => {
    test('Deve impedir entidades duplicadas no mesmo projeto via serviço', async () => {
      const proj = await projectService.createProject({ name: 'Escola' });
      await entityService.createEntity({ projectId: proj.id, name: 'Aluno' });

      await assert.rejects(
        () => entityService.createEntity({ projectId: proj.id, name: 'aluno' }),
        /Já existe uma entidade com este nome no projeto/
      );
    });

    test('Deve renomear entidade e validar duplicidade entre irmãs', async () => {
      const proj = await projectService.createProject({ name: 'Vendas' });
      const e1 = await entityService.createEntity({ projectId: proj.id, name: 'Cliente' });
      const e2 = await entityService.createEntity({ projectId: proj.id, name: 'Fornecedor' });

      // Permite renomear mantendo o mesmo nome
      await entityService.renameEntity(e1.id, 'Cliente');

      // Rejeita renomear para o nome de outra existente
      await assert.rejects(
        () => entityService.renameEntity(e2.id, 'Cliente'),
        /Já existe uma entidade com este nome no projeto/
      );
    });

    test('Deve listar entidades com seus atributos associados', async () => {
      const proj = await projectService.createProject({ name: 'RH' });
      const ent = await entityService.createEntity({ projectId: proj.id, name: 'Funcionario' });

      await attributeService.createAttribute({
        entityId: ent.id,
        name: 'matricula',
        dataType: 'INTEGER',
        isPrimaryKey: true,
      });

      const list = await entityService.listEntitiesWithAttributes(proj.id);
      assert.strictEqual(list.length, 1);
      assert.strictEqual(list[0].attributeCount, 1);
      assert.strictEqual(list[0].attributes[0].name, 'matricula');
      assert.strictEqual(list[0].attributes[0].isPrimaryKey, true);
    });
  });

  describe('AttributeService', () => {
    test('Deve criar atributo com PK forçando NOT NULL', async () => {
      const proj = await projectService.createProject({ name: 'Inventário' });
      const ent = await entityService.createEntity({ projectId: proj.id, name: 'Produto' });

      const attr = await attributeService.createAttribute({
        entityId: ent.id,
        name: 'codigo',
        dataType: 'VARCHAR',
        isPrimaryKey: true,
        isNotNull: false,
      });

      assert.strictEqual(attr.isPrimaryKey, true);
      assert.strictEqual(attr.isNotNull, true); // Chave primária deve ser NOT NULL
    });

    test('Deve preservar propriedades não alteradas ao atualizar atributo', async () => {
      const proj = await projectService.createProject({ name: 'Blog' });
      const ent = await entityService.createEntity({ projectId: proj.id, name: 'Post' });

      const attr = await attributeService.createAttribute({
        entityId: ent.id,
        name: 'titulo',
        dataType: 'VARCHAR',
        isPrimaryKey: false,
        isNotNull: true,
      });

      // Atualiza apenas o tipo de dado
      const updated = await attributeService.updateAttribute(attr.id, { dataType: 'TEXT' });
      assert.strictEqual(updated.name, 'titulo');
      assert.strictEqual(updated.dataType, 'TEXT');
      assert.strictEqual(updated.isPrimaryKey, false);
      assert.strictEqual(updated.isNotNull, true);
    });

    test('Deve rejeitar atributo duplicado na mesma entidade', async () => {
      const proj = await projectService.createProject({ name: 'Biblioteca' });
      const ent = await entityService.createEntity({ projectId: proj.id, name: 'Livro' });

      await attributeService.createAttribute({
        entityId: ent.id,
        name: 'isbn',
        dataType: 'VARCHAR',
      });

      await assert.rejects(
        () => attributeService.createAttribute({
          entityId: ent.id,
          name: 'ISBN',
          dataType: 'VARCHAR',
        }),
        /Já existe um atributo com este nome nesta entidade/
      );
    });
  });

  describe('RelationshipService', () => {
    test('Deve impedir criação de relacionamento se o projeto tiver menos de 2 entidades', async () => {
      const proj = await projectService.createProject({ name: 'Solitário' });
      const ent = await entityService.createEntity({ projectId: proj.id, name: 'Unica' });

      await assert.rejects(
        () => relationshipService.createRelationship({
          projectId: proj.id,
          entityAId: ent.id,
          entityBId: 'qualquer',
          cardinality: '1:1',
        }),
        /É necessário ter ao menos duas entidades cadastradas/
      );
    });

    test('Deve impedir autorrelacionamento no MVP', async () => {
      const proj = await projectService.createProject({ name: 'Empresa' });
      const e1 = await entityService.createEntity({ projectId: proj.id, name: 'Setor' });
      await entityService.createEntity({ projectId: proj.id, name: 'Cargo' });

      await assert.rejects(
        () => relationshipService.createRelationship({
          projectId: proj.id,
          entityAId: e1.id,
          entityBId: e1.id,
          cardinality: '1:N',
        }),
        /não são suportados no MVP/
      );
    });

    test('Deve criar, listar e atualizar cardinalidade de relacionamento', async () => {
      const proj = await projectService.createProject({ name: 'Hospital' });
      const e1 = await entityService.createEntity({ projectId: proj.id, name: 'Paciente' });
      const e2 = await entityService.createEntity({ projectId: proj.id, name: 'Prontuario' });

      const rel = await relationshipService.createRelationship({
        projectId: proj.id,
        entityAId: e1.id,
        entityBId: e2.id,
        cardinality: '1:1',
        name: 'possui',
      });

      assert.strictEqual(rel.cardinality, '1:1');

      const updated = await relationshipService.updateRelationship(rel.id, {
        cardinality: '1:N',
      });
      assert.strictEqual(updated.cardinality, '1:N');

      const list = await relationshipService.listRelationships(proj.id);
      assert.strictEqual(list.length, 1);
      assert.strictEqual(list[0].entityAName, 'Paciente');
      assert.strictEqual(list[0].entityBName, 'Prontuario');

      const deleted = await relationshipService.deleteRelationship(rel.id);
      assert.strictEqual(deleted, true);

      const afterDelete = await relationshipService.listRelationships(proj.id);
      assert.strictEqual(afterDelete.length, 0);
    });
  });
});
