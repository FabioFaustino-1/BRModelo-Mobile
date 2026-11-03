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
} from 'react-native';
import { THEME } from '../constants/theme.js';
import { AppHeader } from '../components/AppHeader.js';
import { EntityCard } from '../components/EntityCard.js';
import { RelationshipItem } from '../components/RelationshipItem.js';
import { EmptyState } from '../components/EmptyState.js';
import { InputModal } from '../components/InputModal.js';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { RelationshipModal } from '../components/RelationshipModal.js';

import * as projectService from '../services/projectService.js';
import * as entityService from '../services/entityService.js';
import * as relationshipService from '../services/relationshipService.js';

export function ProjectScreen({
  projectId,
  onBack,
  onOpenEntity,
}) {
  const [activeTab, setActiveTab] = useState('entities'); // 'entities' | 'relationships'
  const [project, setProject] = useState(null);
  const [entities, setEntities] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modais de Projeto
  const [isRenameProjectOpen, setIsRenameProjectOpen] = useState(false);

  // Modais de Entidade
  const [isCreateEntityOpen, setIsCreateEntityOpen] = useState(false);
  const [entityToRename, setEntityToRename] = useState(null);
  const [entityToDelete, setEntityToDelete] = useState(null);

  // Modais de Relacionamento
  const [isCreateRelOpen, setIsCreateRelOpen] = useState(false);
  const [relToEdit, setRelToEdit] = useState(null);
  const [relToDelete, setRelToDelete] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const details = await projectService.getProjectDetails(projectId);
      setProject(details.project);
      
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

  // Ações de Projeto
  async function handleRenameProject(newName) {
    try {
      const updated = await projectService.renameProject(projectId, newName);
      setProject(updated);
      setIsRenameProjectOpen(false);
    } catch (err) {
      Alert.alert('Erro ao renomear projeto', err.message);
    }
  }

  // Ações de Entidade
  async function handleCreateEntity(name) {
    try {
      await entityService.createEntity({ projectId, name });
      setIsCreateEntityOpen(false);
      await loadData();
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
      await loadData();
    } catch (err) {
      Alert.alert('Erro ao excluir entidade', err.message);
    }
  }

  // Ações de Relacionamento
  function handleOpenCreateRelationship() {
    if (entities.length < 2) {
      Alert.alert(
        'Atenção',
        'É necessário ter ao menos duas entidades cadastradas para criar um relacionamento.'
      );
      return;
    }
    setIsCreateRelOpen(true);
  }

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
          ...relData,
        });
        setIsCreateRelOpen(false);
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
      await loadData();
    } catch (err) {
      Alert.alert('Erro ao excluir relacionamento', err.message);
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title={project ? project.name : 'Editor de Projeto'}
        subtitle={`Projeto • ${entities.length} entidades • ${relationships.length} relacionamentos`}
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

      {/* Tabs Seletoras: Entidades vs Relacionamentos */}
      <View style={styles.tabsHeader}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'entities' && styles.tabButtonActive]}
          onPress={() => setActiveTab('entities')}
        >
          <Text style={[styles.tabText, activeTab === 'entities' && styles.tabTextActive]}>
            Entidades ({entities.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'relationships' && styles.tabButtonActive]}
          onPress={() => setActiveTab('relationships')}
        >
          <Text style={[styles.tabText, activeTab === 'relationships' && styles.tabTextActive]}>
            Relacionamentos ({relationships.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={THEME.colors.primaryLight} />
          <Text style={styles.loadingText}>Carregando modelo...</Text>
        </View>
      ) : activeTab === 'entities' ? (
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
                onPress={() => setIsCreateEntityOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryActionBtnText}>+ Nova Entidade</Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="🧱"
              title="Nenhuma entidade cadastrada neste projeto"
              message="Toque em 'Nova Entidade' para começar a modelar tabelas e atributos."
              actionLabel="+ Nova Entidade"
              onAction={() => setIsCreateEntityOpen(true)}
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
              <Text style={styles.sectionTitle}>Associações entre Entidades</Text>
              <TouchableOpacity
                style={[
                  styles.primaryActionBtn,
                  entities.length < 2 && styles.primaryActionBtnDisabled,
                ]}
                onPress={handleOpenCreateRelationship}
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
              message={
                entities.length < 2
                  ? "Cadastre pelo menos duas entidades no projeto para poder criar relacionamentos entre elas."
                  : "Estabeleça conexões 1:1, 1:N ou N:N entre as entidades cadastradas."
              }
              actionLabel={entities.length >= 2 ? "+ Novo Relacionamento" : null}
              onAction={entities.length >= 2 ? handleOpenCreateRelationship : null}
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
        title="Nova Entidade"
        placeholder="Ex: Cliente, Produto, Pedido"
        label="Nome da Entidade"
        confirmText="Adicionar Entidade"
        onConfirm={handleCreateEntity}
        onCancel={() => setIsCreateEntityOpen(false)}
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

      {/* Modal Confirmar Exclusão de Entidade */}
      <ConfirmModal
        visible={Boolean(entityToDelete)}
        title="Excluir Entidade"
        message={
          entityToDelete
            ? `Deseja realmente excluir a entidade "${entityToDelete.name}"?\n\nATENÇÃO: Todos os atributos pertencentes a esta entidade e todos os relacionamentos conectados a ela serão excluídos permanentemente.`
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
        initialData={relToEdit}
        onConfirm={handleSaveRelationship}
        onCancel={() => {
          setIsCreateRelOpen(false);
          setRelToEdit(null);
        }}
      />

      {/* Modal Confirmar Exclusão de Relacionamento */}
      <ConfirmModal
        visible={Boolean(relToDelete)}
        title="Excluir Relacionamento"
        message="Deseja realmente excluir este relacionamento? As entidades envolvidas não serão afetadas."
        confirmText="Excluir Relacionamento"
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
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
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
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
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
