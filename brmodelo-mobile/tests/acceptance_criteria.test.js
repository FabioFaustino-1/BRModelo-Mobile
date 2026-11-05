/**
 * Teste Automatizado de Fluxo Completo de Aceitação do MVP — BRMM
 * Valida os 15 passos obrigatórios da Seção 11:
 * 1. Inicializar app e banco
 * 2. Criar um projeto
 * 3. Visualizar projeto na listagem com estatísticas
 * 4. Abrir o projeto
 * 5. Criar entidade
 * 6. Adicionar atributos à entidade
 * 7. Definir chave primária (PK) e nulabilidade
 * 8. Criar outras entidades (ex: Pedido, ItemPedido)
 * 9. Criar relacionamentos entre entidades (1:N, N:N)
 * 10. Editar nomes, atributos e cardinalidades de relacionamentos
 * 11. Excluir um elemento dependente (atributo)
 * 12. Simular fechamento do aplicativo (desconectar do banco)
 * 13. Reabrir o aplicativo (nova conexão com o mesmo arquivo SQLite físico)
 * 14. Verificar integridade total persistida (projeto, entidades, atributos e relacionamentos)
 * 15. Excluir o projeto e verificar remoção completa em cascata
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

describe('Critérios de Aceitação do MVP — Fluxo Completo de 15 Passos', () => {
  const tempDbPath = path.join(process.cwd(), 'tests', 'test_acceptance_flow.db');

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
        // ignora se ainda em uso momentâneo
      }
    }
  });

  test('Fluxo Completo de Aceitação: Criação, Edição, Relacionamentos, Reinicialização e Exclusão em Cascata', async () => {
    // 1. Abrir o aplicativo (conectar e aplicar migrações)
    let adapter = createNodeAdapter(tempDbPath);
    await adapter.execAsync(ENABLE_FOREIGN_KEYS);
    await runMigrations(adapter);
    setDatabase(adapter);

    // 2. Criar um projeto
    const project = await projectService.createProject({ name: 'E-commerce Brasil' });
    assert.ok(project.id, 'Passo 2: Projeto deve ter ID gerado');
    assert.strictEqual(project.name, 'E-commerce Brasil');

    // 3. Visualizar o projeto na lista
    const listInitial = await projectService.listProjectsWithStats();
    const foundProject = listInitial.find((p) => p.id === project.id);
    assert.ok(foundProject, 'Passo 3: Projeto deve estar presente na listagem');
    assert.strictEqual(foundProject.entityCount, 0);

    // 4. Abrir o projeto
    const projectDetails = await projectService.getProjectDetails(project.id);
    assert.strictEqual(projectDetails.project.id, project.id, 'Passo 4: Projeto aberto com sucesso');

    // 5. Criar uma entidade
    const entityCliente = await entityService.createEntity({
      projectId: project.id,
      name: 'Cliente',
    });
    assert.ok(entityCliente.id, 'Passo 5: Entidade Cliente criada');

    // 6. Adicionar atributos à entidade
    const attrNome = await attributeService.createAttribute({
      entityId: entityCliente.id,
      name: 'nome_completo',
      dataType: 'VARCHAR',
      isPrimaryKey: false,
      isNotNull: true,
    });
    assert.ok(attrNome.id, 'Passo 6: Atributo nome_completo criado');

    // 7. Definir uma chave primária
    const attrId = await attributeService.createAttribute({
      entityId: entityCliente.id,
      name: 'id',
      dataType: 'INTEGER',
      isPrimaryKey: true,
      isNotNull: true,
    });
    assert.strictEqual(attrId.isPrimaryKey, true, 'Passo 7: Chave primária definida');
    assert.strictEqual(attrId.isNotNull, true);

    // 8. Criar outras entidades
    const entityPedido = await entityService.createEntity({
      projectId: project.id,
      name: 'Pedido',
    });
    const attrPedidoId = await attributeService.createAttribute({
      entityId: entityPedido.id,
      name: 'id',
      dataType: 'INTEGER',
      isPrimaryKey: true,
    });
    const attrPedidoData = await attributeService.createAttribute({
      entityId: entityPedido.id,
      name: 'data_pedido',
      dataType: 'DATE',
      isNotNull: true,
    });

    const entityProduto = await entityService.createEntity({
      projectId: project.id,
      name: 'Produto',
    });
    const attrProdutoId = await attributeService.createAttribute({
      entityId: entityProduto.id,
      name: 'id',
      dataType: 'INTEGER',
      isPrimaryKey: true,
    });

    // 9. Criar relacionamentos entre elas (1:N entre Cliente e Pedido; N:N entre Pedido e Produto)
    const rel1 = await relationshipService.createRelationship({
      projectId: project.id,
      entityAId: entityCliente.id,
      entityBId: entityPedido.id,
      cardinality: '1:N',
      name: 'realiza',
    });
    assert.strictEqual(rel1.cardinality, '1:N', 'Passo 9: Relacionamento 1:N criado');

    const rel2 = await relationshipService.createRelationship({
      projectId: project.id,
      entityAId: entityPedido.id,
      entityBId: entityProduto.id,
      cardinality: 'N:N',
      name: 'contem',
    });
    assert.strictEqual(rel2.cardinality, 'N:N', 'Passo 9: Relacionamento N:N criado');

    // 10. Editar nomes, atributos e relacionamentos
    // 10.1 Editar nome do projeto
    const renamedProject = await projectService.renameProject(project.id, 'E-commerce Global');
    assert.strictEqual(renamedProject.name, 'E-commerce Global', 'Passo 10: Projeto renomeado');

    // 10.2 Editar nome da entidade
    const renamedEntity = await entityService.renameEntity(entityProduto.id, 'ItemCatalogo');
    assert.strictEqual(renamedEntity.name, 'ItemCatalogo', 'Passo 10: Entidade renomeada');

    // 10.3 Editar atributo
    const updatedAttr = await attributeService.updateAttribute(attrNome.id, {
      name: 'nome_razao_social',
      dataType: 'TEXT',
    });
    assert.strictEqual(updatedAttr.name, 'nome_razao_social', 'Passo 10: Atributo atualizado');
    assert.strictEqual(updatedAttr.dataType, 'TEXT');

    // 10.4 Editar cardinalidade de relacionamento
    const updatedRel = await relationshipService.updateRelationship(rel1.id, {
      cardinality: '1:1',
      name: 'possui_exclusivo',
    });
    assert.strictEqual(updatedRel.cardinality, '1:1', 'Passo 10: Relacionamento alterado');

    // 11. Excluir elementos com confirmação
    // Adiciona um atributo temporário e o exclui
    const tempAttr = await attributeService.createAttribute({
      entityId: entityCliente.id,
      name: 'campo_temporario',
      dataType: 'VARCHAR',
    });
    const deletedAttrResult = await attributeService.deleteAttribute(tempAttr.id);
    assert.strictEqual(deletedAttrResult, true, 'Passo 11: Atributo temporário excluído');

    // 12. Fechar o aplicativo (desconecta a instância do banco)
    await closeDatabase();

    // 13. Abrir novamente o aplicativo (cria nova conexão sobre o arquivo físico persistido)
    adapter = createNodeAdapter(tempDbPath);
    await adapter.execAsync(ENABLE_FOREIGN_KEYS);
    const reInitResult = await runMigrations(adapter);
    assert.strictEqual(reInitResult.appliedCount, 0, 'Passo 13: Nenhuma migration nova em reabertura');
    setDatabase(adapter);

    // 14. Verificar que os projetos, entidades, atributos e relacionamentos continuam salvos
    const persistedProjects = await projectService.listProjectsWithStats();
    assert.strictEqual(persistedProjects.length, 1, 'Passo 14: Projeto persiste após reinício');
    assert.strictEqual(persistedProjects[0].name, 'E-commerce Global');
    assert.strictEqual(persistedProjects[0].entityCount, 3);
    assert.strictEqual(persistedProjects[0].relationshipCount, 2);

    const persistedDetails = await projectService.getProjectDetails(project.id);
    assert.strictEqual(persistedDetails.entities.length, 3);
    assert.strictEqual(persistedDetails.relationships.length, 2);

    const persistedCliente = await entityService.getEntityDetails(entityCliente.id);
    assert.strictEqual(persistedCliente.attributes.length, 2);
    assert.ok(persistedCliente.attributes.some((a) => a.name === 'id' && a.isPrimaryKey));
    assert.ok(persistedCliente.attributes.some((a) => a.name === 'nome_razao_social'));

    // 15. Excluir o projeto e verificar que seus dados dependentes também foram removidos
    const deletedProjectResult = await projectService.deleteProject(project.id);
    assert.strictEqual(deletedProjectResult, true, 'Passo 15: Projeto excluído com sucesso');

    const checkProjectsAfter = await projectService.listProjectsWithStats();
    assert.strictEqual(checkProjectsAfter.length, 0, 'Passo 15: Nenhum projeto restante');

    // Verifica que as entidades, atributos e relacionamentos foram removidos pelo CASCADE
    await assert.rejects(
      () => entityService.getEntityDetails(entityCliente.id),
      /Entidade não encontrada/
    );
    const relsAfter = await relationshipService.listRelationships(project.id);
    assert.strictEqual(relsAfter.length, 0, 'Passo 15: Relacionamentos removidos em cascata');
  });
});
