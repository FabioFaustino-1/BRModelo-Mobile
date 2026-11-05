/**
 * Testes Automatizados da Persistência do Canvas Visual — BRMM
 * Valida o armazenamento e recuperação de coordenadas X/Y e Viewport no SQLite.
 */
import test, { describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { closeDatabase, setDatabase } from '../src/database/index.js';
import { runMigrations } from '../src/database/migrations/index.js';
import { ENABLE_FOREIGN_KEYS } from '../src/database/schema.js';
import { createNodeAdapter } from './helpers/nodeSqliteAdapter.js';

import * as projectService from '../src/services/projectService.js';
import * as entityService from '../src/services/entityService.js';

describe('Persistência do Editor Visual (Canvas 2D) — BRMM', () => {
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

  test('Deve criar entidade com coordenadas de posição e persistir no SQLite', async () => {
    const proj = await projectService.createProject({ name: 'Projeto Diagrama' });
    const ent = await entityService.createEntity({
      projectId: proj.id,
      name: 'Cliente',
      positionX: 320,
      positionY: 180,
    });

    assert.strictEqual(ent.positionX, 320);
    assert.strictEqual(ent.positionY, 180);

    const details = await entityService.getEntityDetails(ent.id);
    assert.strictEqual(details.entity.positionX, 320);
    assert.strictEqual(details.entity.positionY, 180);
  });

  test('Deve atualizar as coordenadas X e Y ao arrastar no canvas e recuperar com precisão', async () => {
    const proj = await projectService.createProject({ name: 'Projeto Movimentacao' });
    const ent = await entityService.createEntity({
      projectId: proj.id,
      name: 'Produto',
      positionX: 100,
      positionY: 100,
    });

    const updated = await entityService.updateEntityPosition(ent.id, 450.5, 620.25);
    assert.strictEqual(updated.positionX, 450.5);
    assert.strictEqual(updated.positionY, 620.25);

    const recheck = await entityService.getEntityDetails(ent.id);
    assert.strictEqual(recheck.entity.positionX, 450.5);
    assert.strictEqual(recheck.entity.positionY, 620.25);
  });

  test('Deve persistir e recuperar o estado de Viewport (zoom e pan) do projeto', async () => {
    const proj = await projectService.createProject({ name: 'Projeto Viewport' });
    assert.strictEqual(proj.viewportZoom, 1.0);
    assert.strictEqual(proj.viewportX, 0);
    assert.strictEqual(proj.viewportY, 0);

    const updatedProj = await projectService.saveProjectViewport(proj.id, {
      zoom: 1.25,
      x: -120,
      y: 80,
    });

    assert.strictEqual(updatedProj.viewportZoom, 1.25);
    assert.strictEqual(updatedProj.viewportX, -120);
    assert.strictEqual(updatedProj.viewportY, 80);

    const details = await projectService.getProjectDetails(proj.id);
    assert.strictEqual(details.project.viewportZoom, 1.25);
    assert.strictEqual(details.project.viewportX, -120);
    assert.strictEqual(details.project.viewportY, 80);
  });
});
