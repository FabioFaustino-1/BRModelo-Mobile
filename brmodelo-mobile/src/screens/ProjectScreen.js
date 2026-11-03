import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { THEME } from '../constants/theme.js';
import { AppHeader } from '../components/AppHeader.js';
import { EntityCard } from '../components/EntityCard.js';
import { RelationshipItem } from '../components/RelationshipItem.js';
import { EmptyState } from '../components/EmptyState.js';
import { InputModal } from '../components/InputModal.js';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { RelationshipModal } from '../components/RelationshipModal.js';
import { AttributeModal } from '../components/AttributeModal.js';

// Componentes do Canvas Visual
import { CanvasWorkspace } from '../components/canvas/CanvasWorkspace.js';
import { CanvasToolbar } from '../components/canvas/CanvasToolbar.js';
import { SelectedElementDrawer } from '../components/canvas/SelectedElementDrawer.js';
import { ENTITY_NODE_WIDTH } from '../components/canvas/EntityNode.js';

import * as projectService from '../services/projectService.js';
import * as entityService from '../services/entityService.js';
import * as attributeService from '../services/attributeService.js';
import * as relationshipService from '../services/relationshipService.js';

export function ProjectScreen({
  projectId,
  onBack,
  onOpenEntity,
}) {
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' (padrão) | 'list'
  const [activeListTab, setActiveListTab] = useState('entities'); // 'entities' | 'relationships' (na visão lista)

  const [project, setProject] = useState(null);
  const [entities, setEntities] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados do Canvas (Zoom e Pan)
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [canvasMode, setCanvasMode] = useState('select'); // 'select' | 'pan'

  // Seleção no Canvas
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedRelationship, setSelectedRelationship] = useState(null);

  // Modo de Conexão Visual de Relacionamento
  const [isConnectingMode, setIsConnectingMode] = useState(false);
  const [connectingSourceEntity, setConnectingSourceEntity] = useState(null);

  // Modais de Projeto
  const [isRenameProjectOpen, setIsRenameProjectOpen] = useState(false);

  // Modais de Entidade
  const [isCreateEntityOpen, setIsCreateEntityOpen] = useState(false);
  const [pendingSpawnCoords, setPendingSpawnCoords] = useState(null);
  const [entityToRename, setEntityToRename] = useState(null);
  const [entityToDelete, setEntityToDelete] = useState(null);

  // Modais de Atributo (para adicionar diretamente da gaveta do nó)
  const [entityForNewAttribute, setEntityForNewAttribute] = useState(null);

  // Modais de Relacionamento
  const [isCreateRelOpen, setIsCreateRelOpen] = useState(false);
  const [relToEdit, setRelToEdit] = useState(null);
  const [relToDelete, setRelToDelete] = useState(null);
  const [pendingRelConnection, setPendingRelConnection] = useState(null); // { entityAId, entityBId }

  const loadData = useCallback(async () => {
    try {
      const details = await projectService.getProjectDetails(projectId);
      setProject(details.project);
      
      // Restaura zoom e coordenadas de navegação salvos
      if (details.project.viewportZoom) {
        setZoom(details.project.viewportZoom);
      }
      if (details.project.viewportX !== undefined) {
        setPanX(details.project.viewportX);
      }
      if (details.project.viewportY !== undefined) {
        setPanY(details.project.viewportY);
      }

      const loadedEntities = await entityService.listEntitiesWithAttributes(projectId);
      setEntities(loadedEntities);

      const loadedRels = await relationshipService.listRelationships(projectId);
      setRelationships(loadedRels);
    } catch (err) {
      Alert.alert('Erro ao carregar dados', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadData();
  }

  // --- Ações de Viewport do Canvas ---
  function handleViewportChange(newZoom, newPanX, newPanY, persist = false) {
    setZoom(newZoom);
    setPanX(newPanX);
    setPanY(newPanY);

    if (persist) {
      projectService
        .saveProjectViewport(projectId, { zoom: newZoom, x: newPanX, y: newPanY })
        .catch((err) => console.warn('Erro ao salvar viewport:', err.message));
    }
  }

  function handleZoomIn() {
    const nextZoom = Math.min(2.5, Number((zoom + 0.2).toFixed(2)));
    handleViewportChange(nextZoom, panX, panY, true);
  }

  function handleZoomOut() {
    const nextZoom = Math.max(0.4, Number((zoom - 0.2).toFixed(2)));
    handleViewportChange(nextZoom, panX, panY, true);
  }

  // Enquadra / Centraliza todas as entidades na tela
  function handleFitToView() {
    if (entities.length === 0) {
      handleViewportChange(1, 0, 0, true);
      return;
    }

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height - 180; // desconto da barra e headers

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    entities.forEach((e) => {
      const ex = e.positionX || 100;
      const ey = e.positionY || 100;
      minX = Math.min(minX, ex);
      minY = Math.min(minY, ey);
      maxX = Math.max(maxX, ex + ENTITY_NODE_WIDTH);
      maxY = Math.max(maxY, ey + 180);
    });

    const diagramWidth = maxX - minX + 80;
    const diagramHeight = maxY - minY + 80;

    const scaleX = screenWidth / diagramWidth;
    const scaleY = screenHeight / diagramHeight;
    const targetZoom = Math.min(1.2, Math.max(0.5, Math.min(scaleX, scaleY)));

    const targetPanX = Math.round((screenWidth - diagramWidth * targetZoom) / 2 - minX * targetZoom + 40);
    const targetPanY = Math.round((screenHeight - diagramHeight * targetZoom) / 2 - minY * targetZoom + 40);

    handleViewportChange(targetZoom, targetPanX, targetPanY, true);
  }

  // --- Movimentação de Entidades no Canvas ---
  function handleEntityPositionChange(id, x, y, persist = false) {
    // Atualização imediata em memória para acompanhar o dedo a 60fps
    setEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, positionX: x, positionY: y } : e))
    );

    if (persist) {
      entityService.updateEntityPosition(id, x, y).catch((err) => {
        console.warn('Erro ao persistir posição:', err.message);
      });
    }
  }

  // --- Duplo Toque no Canvas para Criar Entidade na Coordenada ---
  function handleCanvasDoubleTap({ screenX, screenY }) {
    if (isConnectingMode) return;
    const spawnX = Math.round((screenX - panX) / zoom - ENTITY_NODE_WIDTH / 2);
    const spawnY = Math.round((screenY - 120 - panY) / zoom - 40);
    setPendingSpawnCoords({
      x: Math.max(20, spawnX),
      y: Math.max(20, spawnY),
    });
    setIsCreateEntityOpen(true);
  }

  // --- Seleção de Elementos ---
  function handleSelectEntity(entity) {
    setSelectedEntity(entity);
    setSelectedRelationship(null);
  }

  function handleSelectRelationship(relationship) {
    setSelectedRelationship(relationship);
    setSelectedEntity(null);
  }

  function handleDeselectAll() {
    setSelectedEntity(null);
    setSelectedRelationship(null);
  }

  // --- Modo de Ligação Visual de Relacionamentos ---
  function handleStartConnectMode() {
    if (entities.length < 2) {
      Alert.alert(
        'Atenção',
        'É necessário ter ao menos duas entidades cadastradas para criar um relacionamento.'
      );
      return;
    }
    handleDeselectAll();
    setIsConnectingMode(true);
    setConnectingSourceEntity(null);
  }

  function handleCancelConnectMode() {
    setIsConnectingMode(false);
    setConnectingSourceEntity(null);
    setPendingRelConnection(null);
  }

  function handleConnectingEntityPress(entity) {
    if (!connectingSourceEntity) {
      // Passo 1: Selecionou a Origem
      setConnectingSourceEntity(entity);
    } else {
      // Passo 2: Selecionou o Destino
      if (connectingSourceEntity.id === entity.id) {
        Alert.alert('Aviso', 'Relacionamentos de uma entidade com ela mesma não são suportados no MVP.');
        return;
      }

      setPendingRelConnection({
        entityAId: connectingSourceEntity.id,
        entityBId: entity.id,
      });
      setIsConnectingMode(false);
      setConnectingSourceEntity(null);
      setIsCreateRelOpen(true);
    }
  }

  // --- Ações de Projeto ---
  async function handleRenameProject(newName) {
    try {
      const updated = await projectService.renameProject(projectId, newName);
      setProject(updated);
      setIsRenameProjectOpen(false);
    } catch (err) {
      Alert.alert('Erro ao renomear projeto', err.message);
    }
  }

  // --- Ações de Entidade ---
  async function handleCreateEntity(name) {
    try {
      let spawnX, spawnY;
      if (pendingSpawnCoords) {
        spawnX = pendingSpawnCoords.x;
        spawnY = pendingSpawnCoords.y;
      } else {
        const screenWidth = Dimensions.get('window').width;
        const screenHeight = Dimensions.get('window').height - 180;
        spawnX = Math.max(20, Math.round((screenWidth / 2 - panX) / zoom - ENTITY_NODE_WIDTH / 2));
        spawnY = Math.max(20, Math.round((screenHeight / 2 - panY) / zoom - 60));
      }
      setPendingSpawnCoords(null);

      const created = await entityService.createEntity({
        projectId,
        name,
        positionX: spawnX,
        positionY: spawnY,
      });

      setIsCreateEntityOpen(false);
      await loadData();
      setSelectedEntity(created);
    } catch (err) {
      Alert.alert('Erro ao criar entidade', err.message);
    }
  }

  async function handleRenameEntity(newName) {
    if (!entityToRename) return;
    try {
      await entityService.renameEntity(entityToRename.id, newName);
      setEntityToRename(null);
      await loadData();
    } catch (err) {
      Alert.alert('Erro ao renomear entidade', err.message);
    }
  }

  async function handleConfirmDeleteEntity() {
    if (!entityToDelete) return;
    try {
      await entityService.deleteEntity(entityToDelete.id);
      setEntityToDelete(null);
      handleDeselectAll();
      await loadData();
    } catch (err) {
      Alert.alert('Erro ao excluir entidade', err.message);
    }
  }

  // --- Ações de Atributo ---
  async function handleSaveNewAttribute(attrData) {
    if (!entityForNewAttribute) return;
    try {
      await attributeService.createAttribute({
        entityId: entityForNewAttribute.id,
        ...attrData,
      });
      setEntityForNewAttribute(null);
      await loadData();
    } catch (err) {
      Alert.alert('Erro ao criar atributo', err.message);
    }
  }

  // --- Ações de Relacionamento ---
  async function handleSaveRelationship(relData) {
    try {
      if (relToEdit) {
        await relationshipService.updateRelationship(relToEdit.id, {
          cardinality: relData.cardinality,
          name: relData.name,
        });
        setRelToEdit(null);
      } else {
        await relationshipService.createRelationship({
          projectId,
          entityAId: pendingRelConnection ? pendingRelConnection.entityAId : relData.entityAId,
          entityBId: pendingRelConnection ? pendingRelConnection.entityBId : relData.entityBId,
          cardinality: relData.cardinality,
          name: relData.name,
        });
        setIsCreateRelOpen(false);
        setPendingRelConnection(null);
      }
      await loadData();
    } catch (err) {
      Alert.alert('Erro ao salvar relacionamento', err.message);
    }
  }

  async function handleConfirmDeleteRelationship() {
    if (!relToDelete) return;
    try {
      await relationshipService.deleteRelationship(relToDelete.id);
      setRelToDelete(null);
      handleDeselectAll();
      await loadData();
    } catch (err) {
      Alert.alert('Erro ao excluir relacionamento', err.message);
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title={project ? project.name : 'Editor de Diagrama'}
        subtitle={`Canvas Relacional • ${entities.length} entidades • ${relationships.length} ligações`}
        onBack={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.renameBtn}
            onPress={() => setIsRenameProjectOpen(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Renomear Projeto"
          >
            <Text style={styles.renameBtnText}>✎</Text>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={THEME.colors.primaryLight} />
          <Text style={styles.loadingText}>Carregando espaço visual...</Text>
        </View>
      ) : viewMode === 'canvas' ? (
        // ==========================================
        // EXPERIÊNCIA PRINCIPAL: CANVAS VISUAL 2D
        // ==========================================
        <View style={styles.canvasContainer}>
          <CanvasWorkspace
            entities={entities}
            relationships={relationships}
            selectedEntity={selectedEntity}
            selectedRelationship={selectedRelationship}
            isConnectingMode={isConnectingMode}
            connectingSourceEntity={connectingSourceEntity}
            mode={canvasMode}
            zoom={zoom}
            panX={panX}
            panY={panY}
            onSelectEntity={handleSelectEntity}
            onSelectRelationship={handleSelectRelationship}
            onDeselectAll={handleDeselectAll}
            onEntityPositionChange={handleEntityPositionChange}
            onViewportChange={handleViewportChange}
            onConnectingEntityPress={handleConnectingEntityPress}
            onDoubleTapCanvas={handleCanvasDoubleTap}
          />

          {/* Gaveta de Ações Contextuais do Elemento Selecionado */}
          <SelectedElementDrawer
            selectedEntity={selectedEntity}
            selectedRelationship={selectedRelationship}
            onDeselect={handleDeselectAll}
            onRenameEntity={(e) => setEntityToRename(e)}
            onAddAttribute={(e) => setEntityForNewAttribute(e)}
            onManageEntity={(e) => onOpenEntity(e)}
            onDeleteEntity={(e) => setEntityToDelete(e)}
            onEditRelationship={(r) => setRelToEdit(r)}
            onDeleteRelationship={(r) => setRelToDelete(r)}
          />

          {/* Barra de Ferramentas Móvel Flutuante */}
          <CanvasToolbar
            mode={canvasMode}
            isConnectingMode={isConnectingMode}
            zoom={zoom}
            viewMode={viewMode}
            onSetMode={(m) => setCanvasMode(m)}
            onAddEntity={() => {
              setPendingSpawnCoords(null);
              setIsCreateEntityOpen(true);
            }}
            onStartConnect={handleStartConnectMode}
            onCancelConnect={handleCancelConnectMode}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitToView={handleFitToView}
            onToggleViewMode={() => setViewMode('list')}
          />
        </View>
      ) : (
        // ==========================================
        // VISÃO AUXILIAR: LISTAGEM E TABELAS
        // ==========================================
        <View style={styles.listWrapper}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity
              style={[styles.tabButton, activeListTab === 'entities' && styles.tabButtonActive]}
              onPress={() => setActiveListTab('entities')}
            >
              <Text style={[styles.tabText, activeListTab === 'entities' && styles.tabTextActive]}>
                Entidades ({entities.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeListTab === 'relationships' && styles.tabButtonActive]}
              onPress={() => setActiveListTab('relationships')}
            >
              <Text style={[styles.tabText, activeListTab === 'relationships' && styles.tabTextActive]}>
                Relacionamentos ({relationships.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToCanvasBtn}
              onPress={() => setViewMode('canvas')}
              activeOpacity={0.7}
            >
              <Text style={styles.backToCanvasBtnText}>🎨 Voltar ao Canvas</Text>
            </TouchableOpacity>
          </View>

          {activeListTab === 'entities' ? (
            <FlatList
              data={entities}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={THEME.colors.primaryLight}
                />
              }
              ListHeaderComponent={
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Entidades do Modelo</Text>
                  <TouchableOpacity
                    style={styles.primaryActionBtn}
                    onPress={() => {
                      setPendingSpawnCoords(null);
                      setIsCreateEntityOpen(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.primaryActionBtnText}>+ Nova Entidade</Text>
                  </TouchableOpacity>
                </View>
              }
              ListEmptyComponent={
                <EmptyState
                  icon="🧱"
                  title="Nenhuma entidade cadastrada"
                  message="Adicione sua primeira entidade para visualizá-la no Canvas e na lista."
                  actionLabel="+ Nova Entidade"
                  onAction={() => {
                    setPendingSpawnCoords(null);
                    setIsCreateEntityOpen(true);
                  }}
                />
              }
              renderItem={({ item }) => (
                <EntityCard
                  entity={item}
                  onOpen={onOpenEntity}
                  onRename={(e) => setEntityToRename(e)}
                  onDelete={(e) => setEntityToDelete(e)}
                />
              )}
            />
          ) : (
            <FlatList
              data={relationships}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={THEME.colors.primaryLight}
                />
              }
              ListHeaderComponent={
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Relacionamentos Estruturados</Text>
                  <TouchableOpacity
                    style={[
                      styles.primaryActionBtn,
                      entities.length < 2 && styles.primaryActionBtnDisabled,
                    ]}
                    onPress={() => {
                      if (entities.length < 2) {
                        Alert.alert('Atenção', 'É necessário ter ao menos duas entidades cadastradas.');
                        return;
                      }
                      setPendingRelConnection(null);
                      setIsCreateRelOpen(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.primaryActionBtnText}>+ Novo Relacionamento</Text>
                  </TouchableOpacity>
                </View>
              }
              ListEmptyComponent={
                <EmptyState
                  icon="🔗"
                  title="Nenhum relacionamento criado"
                  message="Conecte entidades com cardinalidades 1:1, 1:N ou N:N no Canvas ou na lista."
                />
              }
              renderItem={({ item }) => (
                <RelationshipItem
                  relationship={item}
                  onEdit={(r) => setRelToEdit(r)}
                  onDelete={(r) => setRelToDelete(r)}
                />
              )}
            />
          )}
        </View>
      )}

      {/* Modal Renomear Projeto */}
      <InputModal
        visible={isRenameProjectOpen}
        title="Renomear Projeto"
        initialValue={project ? project.name : ''}
        placeholder="Nome do projeto"
        label="Novo Nome"
        confirmText="Salvar"
        onConfirm={handleRenameProject}
        onCancel={() => setIsRenameProjectOpen(false)}
      />

      {/* Modal Criar Entidade */}
      <InputModal
        visible={isCreateEntityOpen}
        title={pendingSpawnCoords ? 'Nova Entidade na Posição' : 'Nova Entidade no Canvas'}
        placeholder="Ex: Cliente, Produto, Pedido"
        label="Nome da Entidade"
        confirmText="Criar no Canvas"
        onConfirm={handleCreateEntity}
        onCancel={() => {
          setIsCreateEntityOpen(false);
          setPendingSpawnCoords(null);
        }}
      />

      {/* Modal Renomear Entidade */}
      <InputModal
        visible={Boolean(entityToRename)}
        title="Renomear Entidade"
        initialValue={entityToRename ? entityToRename.name : ''}
        placeholder="Nome da entidade"
        label="Novo Nome"
        confirmText="Salvar"
        onConfirm={handleRenameEntity}
        onCancel={() => setEntityToRename(null)}
      />

      {/* Modal Adicionar Atributo Rápido a Entidade do Canvas */}
      <AttributeModal
        visible={Boolean(entityForNewAttribute)}
        onConfirm={handleSaveNewAttribute}
        onCancel={() => setEntityForNewAttribute(null)}
      />

      {/* Modal Confirmar Exclusão de Entidade */}
      <ConfirmModal
        visible={Boolean(entityToDelete)}
        title="Excluir Entidade"
        message={
          entityToDelete
            ? `Deseja realmente excluir a entidade "${entityToDelete.name}"?\n\nATENÇÃO: Todos os atributos pertencentes a esta entidade e todos os relacionamentos conectados a ela serão excluídos permanentemente do diagrama.`
            : ''
        }
        confirmText="Excluir Definitivamente"
        onConfirm={handleConfirmDeleteEntity}
        onCancel={() => setEntityToDelete(null)}
      />

      {/* Modal Criar / Editar Relacionamento */}
      <RelationshipModal
        visible={isCreateRelOpen || Boolean(relToEdit)}
        entities={entities}
        initialData={
          relToEdit ||
          (pendingRelConnection
            ? {
                entityAId: pendingRelConnection.entityAId,
                entityBId: pendingRelConnection.entityBId,
              }
            : null)
        }
        onConfirm={handleSaveRelationship}
        onCancel={() => {
          setIsCreateRelOpen(false);
          setRelToEdit(null);
          setPendingRelConnection(null);
        }}
      />

      {/* Modal Confirmar Exclusão de Relacionamento */}
      <ConfirmModal
        visible={Boolean(relToDelete)}
        title="Excluir Relacionamento"
        message="Deseja realmente remover esta linha de relacionamento do diagrama? As duas entidades permanecerão intactas."
        confirmText="Excluir Ligação"
        onConfirm={handleConfirmDeleteRelationship}
        onCancel={() => setRelToDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  canvasContainer: {
    flex: 1,
  },
  listWrapper: {
    flex: 1,
  },
  renameBtn: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  renameBtnText: {
    color: THEME.colors.primaryLight,
    fontSize: 16,
  },
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceLight,
    alignItems: 'center',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: THEME.colors.primary,
  },
  tabText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  backToCanvasBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: THEME.borderRadius.md,
    marginLeft: 'auto',
  },
  backToCanvasBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
  },
  listContent: {
    padding: THEME.spacing.md,
    flexGrow: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  primaryActionBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.md,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionBtnDisabled: {
    backgroundColor: THEME.colors.surfaceLight,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
