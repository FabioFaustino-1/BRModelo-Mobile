import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme.js';

export function AttributeItem({
  attribute,
  onEdit,
  onDelete,
}) {
  const isPk = Boolean(attribute.isPrimaryKey !== undefined ? attribute.isPrimaryKey : attribute.is_primary_key);
  const isNn = Boolean(attribute.isNotNull !== undefined ? attribute.isNotNull : attribute.is_not_null);
  const dataType = attribute.dataType || attribute.data_type;

  return (
    <View style={[styles.itemContainer, isPk && styles.itemContainerPk]}>
      <View style={styles.infoWrapper}>
        <View style={styles.nameRow}>
          {isPk && (
            <View style={styles.pkBadge}>
              <Text style={styles.pkBadgeText}>PK</Text>
            </View>
          )}
          <Text style={styles.attributeName}>{attribute.name}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{dataType}</Text>
          </View>

          {isNn && (
            <View style={styles.nnBadge}>
              <Text style={styles.nnBadgeText}>NOT NULL</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionsWrapper}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onEdit(attribute)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Editar atributo"
        >
          <Text style={styles.actionBtnText}>✎</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => onDelete(attribute)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Excluir atributo"
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceLight,
  },
  itemContainerPk: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: '#1E2538',
  },
  infoWrapper: {
    flex: 1,
    paddingRight: THEME.spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  attributeName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  pkBadge: {
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pkBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  typeBadgeText: {
    color: THEME.colors.primaryLight,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  nnBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nnBadgeText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  actionsWrapper: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  actionBtnText: {
    color: THEME.colors.primaryLight,
    fontSize: 14,
  },
  deleteBtn: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteBtnText: {
    color: THEME.colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
