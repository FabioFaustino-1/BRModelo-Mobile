import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { THEME } from '../../constants/theme.js';

export function SelectedElementDrawer({
  selectedEntity,
  selectedRelationship,
  onDeselect,
  onRenameEntity,
  onAddAttribute,
  onManageEntity,
  onDeleteEntity,
  onEditRelationship,
  onDeleteRelationship,
}) {
  if (!selectedEntity && !selectedRelationship) return null;

  return (
    <View style={styles.container}>
      {selectedEntity ? (
        <View style={styles.innerRow}>
          <View style={styles.infoCol}>
            <View style={styles.badgeRow}>
              <Text style={styles.typeLabel}>ENTIDADE SELECIONADA</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {selectedEntity.name}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionsScroll}
          >
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onRenameEntity(selectedEntity)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionBtnIcon}>✎</Text>
              <Text style={styles.actionBtnText}>Renomear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.primaryBtn]}
              onPress={() => onAddAttribute(selectedEntity)}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryBtnText}>+ Atributo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onManageEntity(selectedEntity)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionBtnIcon}>⚙️</Text>
              <Text style={styles.actionBtnText}>Campos ({selectedEntity.attributes?.length || 0})</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => onDeleteEntity(selectedEntity)}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteBtnText}>Excluir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onDeselect}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      ) : selectedRelationship ? (
        <View style={styles.innerRow}>
          <View style={styles.infoCol}>
            <View style={styles.badgeRow}>
              <Text style={styles.typeLabel}>RELACIONAMENTO</Text>
              <View style={styles.cardinalityChip}>
                <Text style={styles.cardinalityChipText}>
                  {selectedRelationship.cardinality}
                </Text>
              </View>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {selectedRelationship.entityAName || 'Entidade A'} ── {selectedRelationship.entityBName || 'Entidade B'}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionsScroll}
          >
            <TouchableOpacity
              style={[styles.actionBtn, styles.primaryBtn]}
              onPress={() => onEditRelationship(selectedRelationship)}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryBtnText}>Cardinalidade</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => onDeleteRelationship(selectedRelationship)}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteBtnText}>Excluir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onDeselect}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#38BDF8',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  infoCol: {
    maxWidth: 130,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  typeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  cardinalityChip: {
    backgroundColor: THEME.colors.primaryDark,
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  cardinalityChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  actionsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 4,
  },
  actionBtnIcon: {
    fontSize: 12,
    color: THEME.colors.primaryLight,
  },
  actionBtnText: {
    fontSize: 11,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryLight,
  },
  primaryBtnText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  deleteBtn: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteBtnText: {
    fontSize: 11,
    color: '#F87171',
    fontWeight: '700',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  closeBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
});
