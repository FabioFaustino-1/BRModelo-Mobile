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
import { AttributeItem } from '../components/AttributeItem.js';
import { EmptyState } from '../components/EmptyState.js';
import { InputModal } from '../components/InputModal.js';
import { AttributeModal } from '../components/AttributeModal.js';
import { ConfirmModal } from '../components/ConfirmModal.js';

import * as entityService from '../services/entityService.js';
import * as attributeService from '../services/attributeService.js';

export function EntityScreen({
  entityId,
  onBack,
}) {
  const [entity, setEntity] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modais de Entidade
  const [isRenameEntityOpen, setIsRenameEntityOpen] = useState(false);

  // Modais de Atributo
  const [isCreateAttrOpen, setIsCreateAttrOpen] = useState(false);
  const [attrToEdit, setAttrToEdit] = useState(null);
  const [attrToDelete, setAttrToDelete] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const details = await entityService.getEntityDetails(entityId);
      setEntity(details.entity);
      setAttributes(details.attributes);
    } catch (err) {
      Alert.alert('Erro ao carregar entidade', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [entityId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadData();
  }

  // Renomear Entidade
  async function handleRenameEntity(newName) {
    try {
      const updated = await entityService.renameEntity(entityId, newName);
      setEntity(updated);
      setIsRenameEntityOpen(false);
    } catch (err) {
      Alert.alert('Erro ao renomear entidade', err.message);
    }
  }

  // Criar / Editar Atributo
  async function handleSaveAttribute(attrData) {
    try {
      if (attrToEdit) {
        await attributeService.updateAttribute(attrToEdit.id, attrData);
        setAttrToEdit(null);
      } else {
        await attributeService.createAttribute({
          entityId,
          ...attrData,
        });
        setIsCreateAttrOpen(false);
      }
      await loadData();
    } catch (err) {
      Alert.alert('Erro ao salvar atributo', err.message);
    }
  }

  // Excluir Atributo
  async function handleConfirmDeleteAttribute() {
    if (!attrToDelete) return;
    try {
      await attributeService.deleteAttribute(attrToDelete.id);
      setAttrToDelete(null);
      await loadData();
    } catch (err) {
      Alert.alert('Erro ao excluir atributo', err.message);
    }
  }

  const pkCount = attributes.filter((a) => a.isPrimaryKey || a.is_primary_key).length;

  return (
    <View style={styles.container}>
      <AppHeader
        title={entity ? entity.name : 'Entidade'}
        subtitle={`Entidade • ${attributes.length} atributos • ${pkCount} PK`}
        onBack={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.renameBtn}
            onPress={() => setIsRenameEntityOpen(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Renomear Entidade"
          >
            <Text style={styles.renameBtnText}>✎</Text>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={THEME.colors.primaryLight} />
          <Text style={styles.loadingText}>Carregando atributos...</Text>
        </View>
      ) : (
        <FlatList
          data={attributes}
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
            <View>
              {/* Card Informativo com Resumo Semântico */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{attributes.length}</Text>
                  <Text style={styles.summaryLabel}>Total de Campos</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, styles.pkHighlight]}>
                    {pkCount}
                  </Text>
                  <Text style={styles.summaryLabel}>Chaves Primárias</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>
                    {attributes.filter((a) => a.isNotNull || a.is_not_null).length}
                  </Text>
                  <Text style={styles.summaryLabel}>NOT NULL</Text>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Atributos da Entidade</Text>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => setIsCreateAttrOpen(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.primaryActionBtnText}>+ Novo Atributo</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="🏷️"
              title="Nenhum atributo cadastrado"
              message="Defina colunas, selecione o tipo de dado e indique chaves primárias (PK) e nulabilidade (NOT NULL)."
              actionLabel="+ Adicionar Primeiro Atributo"
              onAction={() => setIsCreateAttrOpen(true)}
            />
          }
          renderItem={({ item }) => (
            <AttributeItem
              attribute={item}
              onEdit={(a) => setAttrToEdit(a)}
              onDelete={(a) => setAttrToDelete(a)}
            />
          )}
        />
      )}

      {/* Modal Renomear Entidade */}
      <InputModal
        visible={isRenameEntityOpen}
        title="Renomear Entidade"
        initialValue={entity ? entity.name : ''}
        placeholder="Nome da entidade"
        label="Novo Nome"
        confirmText="Salvar"
        onConfirm={handleRenameEntity}
        onCancel={() => setIsRenameEntityOpen(false)}
      />

      {/* Modal Criar / Editar Atributo */}
      <AttributeModal
        visible={isCreateAttrOpen || Boolean(attrToEdit)}
        initialData={attrToEdit}
        onConfirm={handleSaveAttribute}
        onCancel={() => {
          setIsCreateAttrOpen(false);
          setAttrToEdit(null);
        }}
      />

      {/* Modal Confirmar Exclusão de Atributo */}
      <ConfirmModal
        visible={Boolean(attrToDelete)}
        title="Excluir Atributo"
        message={
          attrToDelete
            ? `Deseja realmente excluir o atributo "${attrToDelete.name}" (${attrToDelete.dataType || attrToDelete.data_type}) desta entidade?`
            : ''
        }
        confirmText="Excluir Atributo"
        onConfirm={handleConfirmDeleteAttribute}
        onCancel={() => setAttrToDelete(null)}
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
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  pkHighlight: {
    color: THEME.colors.accent,
  },
  summaryLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: THEME.colors.surfaceLight,
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
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
