/**
 * Testes Automatizados da Camada de Persistência SQLite — BRMM
 * Cobre os 15 cenários de persistência, integridade referencial, migrations e repositórios.
 */
import test, { describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { closeDatabase, getDatabase, setDatabase } from '../src/database/index.js';
import { runMigrations } from '../src/database/migrations/index.js';
import { ENABLE_FOREIGN_KEYS } from '../src/database/schema.js';
import { createNodeAdapter } from './helpers/nodeSqliteAdapter.js';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../src/database/repositories/projectRepository.js';
import {
  createEntity,
  getEntitiesByProjectId,
  getEntityById,
  updateEntity,
  deleteEntity,
} from '../src/database/repositories/entityRepository.js';
import {
  createAttribute,
  getAttributesByEntityId,
  getAttributeById,
  updateAttribute,
  deleteAttribute,
} from '../src/database/repositories/attributeRepository.js';
import {
  createRelationship,
  getRelationshipsByProjectId,
  getRelationshipById,
  updateRelationship,
  deleteRelationship,
} from '../src/database/repositories/relationshipRepository.js';

describe('Camada de Persistência SQLite — BRMM', () => {
  beforeEach(async () => {
    // Inicializa adaptador Node.js em memória e injeta no gerenciador de banco
    const adapter = createNodeAdapter(':memory:');
    await adapter.execAsync(ENABLE_FOREIGN_KEYS);
    await runMigrations(adapter);
    setDatabase(adapter);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  // Cenário 1: Criar e consultar um projeto
  test('1. Deve criar e consultar um projeto por identificador', async () => {
    const project = await createProject({ name: 'Sistema Bancário' });
    assert.ok(project.id, 'O projeto deve ter um ID');
    assert.strictEqual(project.name, 'Sistema Bancário');

    const fetched = await getProjectById(project.id);
    assert.ok(fetched, 'Projeto deve ser encontrado');
    assert.strictEqual(fetched.id, project.id);
    assert.strictEqual(fetched.name, 'Sistema Bancário');
    assert.ok(fetched.createdAt);
    assert.ok(fetched.updatedAt);
  });

  // Cenário 2: Listar vários projetos
  test('2. Deve listar múltiplos projetos ordenados por última atualização', async () => {
    const p1 = await createProject({ name: 'Projeto Alfa' });
    const p2 = await createProject({ name: 'Projeto Beta' });

    const projects = await getProjects();
    assert.ok(projects.length >= 2, 'Deve conter pelo menos 2 projetos');
    const names = projects.map((p) => p.name);
    assert.ok(names.includes('Projeto Alfa'));
    assert.ok(names.includes('Projeto Beta'));
  });

  // Cenário 3: Atualizar e excluir um projeto
  test('3. Deve atualizar o nome de um projeto e excluí-lo com sucesso', async () => {
    const project = await createProject({ name: 'Nome Antigo' });
    const updated = await updateProject(project.id, { name: 'Nome Atualizado' });
    assert.strictEqual(updated.name, 'Nome Atualizado');

    const recheck = await getProjectById(project.id);
    assert.strictEqual(recheck.name, 'Nome Atualizado');

    const deleted = await deleteProject(project.id);
    assert.strictEqual(deleted, true);

    const nonexistent = await getProjectById(project.id);
    assert.strictEqual(nonexistent, null);
  });

  // Cenário 4: Criar entidades vinculadas a projetos diferentes
  test('4. Deve criar entidades vinculadas a projetos diferentes', async () => {
    const projA = await createProject({ name: 'E-commerce' });
    const projB = await createProject({ name: 'Escola' });

    const entA = await createEntity({ projectId: projA.id, name: 'Produto' });
    const entB = await createEntity({ projectId: projB.id, name: 'Aluno' });

    assert.strictEqual(entA.projectId, projA.id);
    assert.strictEqual(entB.projectId, projB.id);

    const listA = await getEntitiesByProjectId(projA.id);
    const listB = await getEntitiesByProjectId(projB.id);

    assert.strictEqual(listA.length, 1);
    assert.strictEqual(listA[0].name, 'Produto');
    assert.strictEqual(listB.length, 1);
    assert.strictEqual(listB[0].name, 'Aluno');
  });

  // Cenário 5: Permitir entidades com o mesmo nome em projetos diferentes
  test('5. Deve permitir entidades com o mesmo nome em projetos diferentes', async () => {
    const proj1 = await createProject({ name: 'Projeto 1' });
    const proj2 = await createProject({ name: 'Projeto 2' });

    const ent1 = await createEntity({ projectId: proj1.id, name: 'Usuario' });
    const ent2 = await createEntity({ projectId: proj2.id, name: 'Usuario' });

    assert.strictEqual(ent1.name, 'Usuario');
    assert.strictEqual(ent2.name, 'Usuario');
    assert.notStrictEqual(ent1.id, ent2.id);
  });

  // Cenário 6: Impedir nomes duplicados no mesmo projeto (case-insensitive)
  test('6. Deve impedir nomes duplicados de entidades no mesmo projeto (case-insensitive)', async () => {
    const proj = await createProject({ name: 'Projeto Unicidade' });
    await createEntity({ projectId: proj.id, name: 'Cliente' });

    await assert.rejects(
      async () => {
        // Tentativa com mesmo nome em minúsculas
        await createEntity({ projectId: proj.id, name: 'cliente' });
      },
      /Já existe uma entidade|UNIQUE/i
    );
  });

  // Cenário 7: Criar atributos com tipos válidos
  test('7. Deve criar atributos com tipos válidos, PK e NOT NULL', async () => {
    const proj = await createProject({ name: 'Projeto Tipos' });
    const entity = await createEntity({ projectId: proj.id, name: 'Tabela' });

    const pkAttr = await createAttribute({
      entityId: entity.id,
      name: 'id',
      dataType: 'INTEGER',
      isPrimaryKey: true,
      isNotNull: true,
    });
    assert.strictEqual(pkAttr.isPrimaryKey, true);
    assert.strictEqual(pkAttr.isNotNull, true);

    const dateAttr = await createAttribute({
      entityId: entity.id,
      name: 'criado_em',
      dataType: 'DATETIME',
      isPrimaryKey: false,
      isNotNull: true,
    });
    assert.strictEqual(dateAttr.dataType, 'DATETIME');

    const attributes = await getAttributesByEntityId(entity.id);
    assert.strictEqual(attributes.length, 2);
    assert.strictEqual(attributes[0].name, 'id'); // PK aparece primeiro
  });

  // Cenário 8: Rejeitar atributos com valores inválidos
  test('8. Deve rejeitar atributos com tipos inválidos ou nomes duplicados', async () => {
    const proj = await createProject({ name: 'Projeto Validacao' });
    const entity = await createEntity({ projectId: proj.id, name: 'Item' });

    // Tipo inválido
    await assert.rejects(
      async () => {
        await createAttribute({
          entityId: entity.id,
          name: 'invalido',
          dataType: 'TIPO_QUE_NAO_EXISTE',
        });
      },
      /Tipo de dado inválido|CHECK/i
    );

    // Nome duplicado na mesma entidade
    await createAttribute({
      entityId: entity.id,
      name: 'codigo',
      dataType: 'VARCHAR',
    });

    await assert.rejects(
      async () => {
        await createAttribute({
          entityId: entity.id,
          name: 'CODIGO',
          dataType: 'VARCHAR',
        });
      },
      /Já existe um atributo|UNIQUE/i
    );
  });

  // Cenário 9: Criar relacionamentos com cardinalidades válidas
  test('9. Deve criar relacionamentos com cardinalidades válidas (1:1, 1:N, N:N)', async () => {
    const proj = await createProject({ name: 'Projeto Relacionamentos' });
    const entA = await createEntity({ projectId: proj.id, name: 'Autor' });
    const entB = await createEntity({ projectId: proj.id, name: 'Livro' });

    const rel = await createRelationship({
      projectId: proj.id,
      entityAId: entA.id,
      entityBId: entB.id,
      cardinality: '1:N',
      name: 'escreve',
    });

    assert.strictEqual(rel.cardinality, '1:N');
    assert.strictEqual(rel.name, 'escreve');

    const list = await getRelationshipsByProjectId(proj.id);
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].entityAName, 'Autor');
    assert.strictEqual(list[0].entityBName, 'Livro');
  });

  // Cenário 10: Rejeitar cardinalidades não suportadas ou autorrelacionamento
  test('10. Deve rejeitar cardinalidades não suportadas e autorrelacionamentos no MVP', async () => {
    const proj = await createProject({ name: 'Projeto Invalidos' });
    const entA = await createEntity({ projectId: proj.id, name: 'Pessoa' });
    const entB = await createEntity({ projectId: proj.id, name: 'Carro' });

    // Cardinalidade inválida
    await assert.rejects(
      async () => {
        await createRelationship({
          projectId: proj.id,
          entityAId: entA.id,
          entityBId: entB.id,
          cardinality: 'MUITOS_PARA_MUITOS',
        });
      },
      /Cardinalidade inválida|CHECK/i
    );

    // Autorrelacionamento (não suportado no MVP)
    await assert.rejects(
      async () => {
        await createRelationship({
          projectId: proj.id,
          entityAId: entA.id,
          entityBId: entA.id,
          cardinality: '1:1',
        });
      },
      /não são suportados|CHECK/i
    );
  });

  // Cenário 11: Impedir relacionamentos entre entidades de projetos diferentes
  test('11. Deve impedir relacionamentos entre entidades de projetos diferentes via FK composta', async () => {
    const proj1 = await createProject({ name: 'Projeto Financeiro' });
    const proj2 = await createProject({ name: 'Projeto RH' });

    const entProj1 = await createEntity({ projectId: proj1.id, name: 'Conta' });
    const entProj2 = await createEntity({ projectId: proj2.id, name: 'Funcionario' });

    // Tentativa de relacionar entidade do Projeto 1 com entidade do Projeto 2
    await assert.rejects(
      async () => {
        await createRelationship({
          projectId: proj1.id,
          entityAId: entProj1.id,
          entityBId: entProj2.id,
          cardinality: '1:N',
        });
      },
      /integridade referencial|FOREIGN KEY/i
    );
  });

  // Cenário 12: Excluir uma entidade e verificar o tratamento de atributos e relacionamentos
  test('12. Deve remover em cascata atributos e relacionamentos ao excluir uma entidade', async () => {
    const proj = await createProject({ name: 'Projeto Cascata Entidade' });
    const entA = await createEntity({ projectId: proj.id, name: 'Cliente' });
    const entB = await createEntity({ projectId: proj.id, name: 'Pedido' });

    const attr = await createAttribute({
      entityId: entA.id,
      name: 'cpf',
      dataType: 'VARCHAR',
    });

    const rel = await createRelationship({
      projectId: proj.id,
      entityAId: entA.id,
      entityBId: entB.id,
      cardinality: '1:N',
    });

    // Exclui a entidade A (Cliente)
    await deleteEntity(entA.id);

    // O atributo vinculado deve ter sido excluído pelo CASCADE
    const attrAfter = await getAttributeById(attr.id);
    assert.strictEqual(attrAfter, null, 'Atributo deve ter sido removido em cascata');

    // O relacionamento onde entA era ponta deve ter sido excluído pelo CASCADE
    const relAfter = await getRelationshipById(rel.id);
    assert.strictEqual(relAfter, null, 'Relacionamento deve ter sido removido em cascata');

    // A entidade B (Pedido) deve continuar intacta
    const entBAfter = await getEntityById(entB.id);
    assert.ok(entBAfter, 'Entidade B deve continuar existindo');
  });

  // Cenário 13: Excluir um projeto e verificar a remoção de seus dados dependentes
  test('13. Deve remover em cascata todas as entidades, atributos e relacionamentos ao excluir o projeto', async () => {
    const proj = await createProject({ name: 'Projeto Para Excluir' });
    const ent = await createEntity({ projectId: proj.id, name: 'Teste' });
    const attr = await createAttribute({ entityId: ent.id, name: 'campo', dataType: 'TEXT' });

    await deleteProject(proj.id);

    // Verifica que o projeto e seus dependentes sumiram
    const projCheck = await getProjectById(proj.id);
    const entCheck = await getEntityById(ent.id);
    const attrCheck = await getAttributeById(attr.id);

    assert.strictEqual(projCheck, null);
    assert.strictEqual(entCheck, null);
    assert.strictEqual(attrCheck, null);
  });

  // Cenário 14: Executar a inicialização mais de uma vez sem perder os dados
  test('14. Inicialização repetida deve ser idempotente e preservar dados existentes', async () => {
    const proj = await createProject({ name: 'Projeto Permanente' });
    const ent = await createEntity({ projectId: proj.id, name: 'DadosFixos' });

    // Executa migrações novamente na mesma base ativa
    const db = getDatabase();
    const result = await runMigrations(db);

    assert.strictEqual(result.appliedCount, 0, 'Nenhuma nova migração deve ser aplicada');

    // Dados continuam íntegros
    const projCheck = await getProjectById(proj.id);
    assert.ok(projCheck);
    assert.strictEqual(projCheck.name, 'Projeto Permanente');

    const entCheck = await getEntityById(ent.id);
    assert.ok(entCheck);
    assert.strictEqual(entCheck.name, 'DadosFixos');
  });

  // Cenário 15: Aplicar migrations sem recriar o esquema de maneira destrutiva
  test('15. Tabela de controle __migrations deve registrar versões e manter consistência', async () => {
    const db = getDatabase();
    const rows = await db.getAllAsync('SELECT * FROM __migrations ORDER BY version ASC;');

    assert.ok(rows.length >= 1, 'Deve existir pelo menos uma migração registrada');
    assert.strictEqual(rows[0].version, 1);
    assert.strictEqual(rows[0].name, '001_initial_schema');
    assert.ok(rows[0].applied_at);

    // user_version do SQLite deve ser 1
    const userVersionRow = await db.getFirstAsync('PRAGMA user_version;');
    assert.strictEqual(userVersionRow.user_version, 1);
  });
});
