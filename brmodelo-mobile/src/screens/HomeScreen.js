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
import { ProjectCard } from '../components/ProjectCard.js';
import { EmptyState } from '../components/EmptyState.js';
import { InputModal } from '../components/InputModal.js';
import { ConfirmModal } from '../components/ConfirmModal.js';
import * as projectService from '../services/projectService.js';

export function HomeScreen({ onOpenProject }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Estados dos modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setErrorMessage(null);
      const data = await projectService.listProjectsWithStats();
      setProjects(data);
    } catch (err) {
      setErrorMessage('Não foi possível carregar os projetos. ' + err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchProjects();
  }

  async function handleCreateProject(name) {
    try {
      const created = await projectService.createProject({ name });
      setIsCreateModalOpen(false);
      await fetchProjects();
      // Opcional: já abre o projeto recém-criado
      if (onOpenProject) {
        onOpenProject(created);
      }
    } catch (err) {
      Alert.alert('Erro ao criar projeto', err.message);
    }
  }

  async function handleConfirmDelete() {
    if (!projectToDelete) return;
    try {
      await projectService.deleteProject(projectToDelete.id);
      setProjectToDelete(null);
      await fetchProjects();
    } catch (err) {
      Alert.alert('Erro ao excluir projeto', err.message);
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="BRMM"
        subtitle="Modelagem Relacional Mobile • 100% Offline"
        rightAction={
          <TouchableOpacity
            style={styles.newProjectBtn}
            onPress={() => setIsCreateModalOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.newProjectBtnText}>+ Novo Projeto</Text>
          </TouchableOpacity>
        }
      />

      {errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={THEME.colors.primaryLight} />
          <Text style={styles.loadingText}>Carregando projetos...</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
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
            projects.length > 0 ? (
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderTitle}>Projetos de Modelagem</Text>
                <Text style={styles.listHeaderCount}>
                  {projects.length} {projects.length === 1 ? 'modelo' : 'modelos'}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="📁"
              title="Nenhum projeto encontrado"
              message="Crie seu primeiro projeto para começar a desenhar entidades, atributos e relacionamentos relacionais."
              actionLabel="+ Criar Novo Projeto"
              onAction={() => setIsCreateModalOpen(true)}
            />
          }
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={onOpenProject}
              onDelete={(p) => setProjectToDelete(p)}
            />
          )}
        />
      )}

      {/* Modal de Criação de Projeto */}
      <InputModal
        visible={isCreateModalOpen}
        title="Criar Novo Projeto"
        placeholder="Ex: Sistema de Vendas, Hospital, ERP"
        label="Nome do Projeto"
        confirmText="Criar Projeto"
        onConfirm={handleCreateProject}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        visible={Boolean(projectToDelete)}
        title="Excluir Projeto"
        message={
          projectToDelete
            ? `Deseja realmente excluir o projeto "${projectToDelete.name}"?\n\nTodas as entidades, atributos e relacionamentos vinculados a ele serão excluídos permanentemente.`
            : ''
        }
        confirmText="Excluir Definitivamente"
        onConfirm={handleConfirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  newProjectBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.md,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newProjectBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: THEME.colors.dangerSurface,
    padding: THEME.spacing.sm,
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.danger,
  },
  errorBannerText: {
    color: '#FCA5A5',
    fontSize: 13,
    textAlign: 'center',
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
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    paddingHorizontal: 2,
  },
  listHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  listHeaderCount: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
  },
});
