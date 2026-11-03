/**
 * Teste Automatizado de Fluxo Completo do Editor Visual (Canvas 2D) — BRMM
 * Valida a criação de entidades no espaço 2D, movimentação, linhas de relacionamento,
 * persistência de zoom/pan e integridade após reinício do app.
 */
import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { closeDatabase, setDatabase } from '../src/database/index.js';
import { runMigrations } from '../src/database/migrations/index.js';
import { ENABLE_FOREIGN_KEYS } from '../src/database/schema.js';
import { createNodeAdapter } from './helpers/nodeSqliteAdapter.js';

import * as projectService from '../src/services/projectService.js';
import * as entityService from '../src/services/entityService.js';
import * as attributeService from '../src/services/attributeService.js';
import * as relationshipService from '../src/services/relationshipService.js';

describe('Fluxo Completo do Editor Visual Canvas 2D — BRMM', () => {
  const tempDbPath = path.join(process.cwd(), 'tests', 'test_canvas_flow.db');

  before(async () => {
    if (fs.existsSync(tempDbPath)) {
      fs.unlinkSync(tempDbPath);
    }
  });

  after(async () => {
    await closeDatabase();
    if (fs.existsSync(tempDbPath)) {
      try {
        fs.unlinkSync(tempDbPath);
      } catch (e) {
        // ignora
      }
    }
  });

  test('Fluxo Completo do Canvas: Posicionamento 2D, Conexão Visual, Viewport e Persistência Física', async () => {
    // 1. Inicializa banco SQLite físico
    let adapter = createNodeAdapter(tempDbPath);
    await adapter.execAsync(ENABLE_FOREIGN_KEYS);
    await runMigrations(adapter);
    setDatabase(adapter);

    // 2. Cria projeto com viewport padrão
    const project = await projectService.createProject({ name: 'Diagrama Escola' });
    assert.strictEqual(project.viewportZoom, 1.0);

    // 3. Cria entidades com coordenadas específicas no canvas
    const entAluno = await entityService.createEntity({
      projectId: project.id,
      name: 'Aluno',
      positionX: 80,
      positionY: 120,
    });
    assert.strictEqual(entAluno.positionX, 80);
    assert.strictEqual(entAluno.positionY, 120);

    const entTurma = await entityService.createEntity({
      projectId: project.id,
      name: 'Turma',
      positionX: 420,
      positionY: 120,
    });
    assert.strictEqual(entTurma.positionX, 420);
    assert.strictEqual(entTurma.positionY, 120);

    // 4. Adiciona atributos às entidades
    await attributeService.createAttribute({
      entityId: entAluno.id,
      name: 'id',
      dataType: 'INTEGER',
      isPrimaryKey: true,
    });
    await attributeService.createAttribute({
      entityId: entAluno.id,
      name: 'nome',
      dataType: 'VARCHAR',
      isNotNull: true,
    });

    await attributeService.createAttribute({
      entityId: entTurma.id,
      name: 'id',
      dataType: 'INTEGER',
      isPrimaryKey: true,
    });
    await attributeService.createAttribute({
      entityId: entTurma.id,
      name: 'codigo',
      dataType: 'VARCHAR',
      isNotNull: true,
    });

    // 5. Movimenta a entidade Aluno para nova posição no canvas
    const movedAluno = await entityService.updateEntityPosition(entAluno.id, 150, 260);
    assert.strictEqual(movedAluno.positionX, 150);
    assert.strictEqual(movedAluno.positionY, 260);

    // 6. Estabelece relacionamento visual N:N entre Turma e Aluno
    const rel = await relationshipService.createRelationship({
      projectId: project.id,
      entityAId: entTurma.id,
      entityBId: entAluno.id,
      cardinality: 'N:N',
      name: 'matriculado_em',
    });
    assert.strictEqual(rel.cardinality, 'N:N');

    // 7. Altera cardinalidade do relacionamento
    const updatedRel = await relationshipService.updateRelationship(rel.id, {
      cardinality: '1:N',
    });
    assert.strictEqual(updatedRel.cardinality, '1:N');

    // 8. Salva o viewport do canvas (zoom e deslocamento de pan)
    const savedViewportProj = await projectService.saveProjectViewport(project.id, {
      zoom: 1.4,
      x: -60,
      y: 45,
    });
    assert.strictEqual(savedViewportProj.viewportZoom, 1.4);
    assert.strictEqual(savedViewportProj.viewportX, -60);
    assert.strictEqual(savedViewportProj.viewportY, 45);

    // 9. Simula encerramento do app (fecha conexão ativa)
    await closeDatabase();

    // 10. Reabre o app (nova conexão sobre o mesmo arquivo de banco)
    adapter = createNodeAdapter(tempDbPath);
    await adapter.execAsync(ENABLE_FOREIGN_KEYS);
    await runMigrations(adapter);
    setDatabase(adapter);

    // 11. Valida que o canvas recupera o projeto e as coordenadas exatas
    const reopenedDetails = await projectService.getProjectDetails(project.id);
    assert.strictEqual(reopenedDetails.project.viewportZoom, 1.4);
    assert.strictEqual(reopenedDetails.project.viewportX, -60);
    assert.strictEqual(reopenedDetails.project.viewportY, 45);

    const reAluno = reopenedDetails.entities.find((e) => e.name === 'Aluno');
    assert.ok(reAluno);
    assert.strictEqual(reAluno.positionX, 150, 'Coordenada X do Aluno deve persistir');
    assert.strictEqual(reAluno.positionY, 260, 'Coordenada Y do Aluno deve persistir');

    const reTurma = reopenedDetails.entities.find((e) => e.name === 'Turma');
    assert.ok(reTurma);
    assert.strictEqual(reTurma.positionX, 420, 'Coordenada X da Turma deve persistir');
    assert.strictEqual(reTurma.positionY, 120, 'Coordenada Y da Turma deve persistir');

    assert.strictEqual(reopenedDetails.relationships.length, 1);
    assert.strictEqual(reopenedDetails.relationships[0].cardinality, '1:N');

    // 12. Exclui a entidade Aluno e certifica que o relacionamento é removido em cascata
    await entityService.deleteEntity(entAluno.id);
    const relsAfterEntityDelete = await relationshipService.listRelationships(project.id);
    assert.strictEqual(relsAfterEntityDelete.length, 0, 'Relacionamento visual deve ser removido pelo CASCADE');
  });
});
