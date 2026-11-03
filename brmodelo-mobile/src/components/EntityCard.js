import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme.js';

export function EntityCard({
  entity,
  onOpen,
  onRename,
  onDelete,
}) {
  const attributes = entity.attributes || [];
  const pkAttributes = attributes.filter((a) => a.isPrimaryKey || a.is_primary_key);
  const otherAttributes = attributes.filter((a) => !a.isPrimaryKey && !a.is_primary_key);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Text style={styles.entityIcon}>🧱</Text>
          <Text style={styles.entityName} numberOfLines={1}>
            {entity.name}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => onRename(entity)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Renomear entidade"
          >
            <Text style={styles.actionIconText}>✎</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionIconBtn, styles.deleteIconBtn]}
            onPress={() => onDelete(entity)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Excluir entidade"
          >
            <Text style={styles.deleteIconText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Atributos prévia */}
      <View style={styles.attributesPreview}>
        {attributes.length === 0 ? (
          <Text style={styles.noAttributesText}>
            Nenhum atributo cadastrado ainda.
          </Text>
        ) : (
          <View style={styles.attrList}>
            {pkAttributes.map((attr) => (
              <View key={attr.id} style={styles.attrPreviewItem}>
                <View style={styles.pkBadge}>
                  <Text style={styles.pkBadgeText}>PK</Text>
                </View>
                <Text style={styles.attrNameText}>{attr.name}</Text>
                <Text style={styles.attrTypeText}>({attr.dataType || attr.data_type})</Text>
              </View>
            ))}

            {otherAttributes.slice(0, 3).map((attr) => (
              <View key={attr.id} style={styles.attrPreviewItem}>
                <View style={styles.dotBullet} />
                <Text style={styles.attrNameText}>{attr.name}</Text>
                <Text style={styles.attrTypeText}>({attr.dataType || attr.data_type})</Text>
              </View>
            ))}

            {otherAttributes.length > 3 && (
              <Text style={styles.moreAttrsText}>
                +{otherAttributes.length - 3} outros atributos...
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Rodapé com botão para gerenciar atributos */}
      <TouchableOpacity
        style={styles.manageButton}
        onPress={() => onOpen(entity)}
        activeOpacity={0.7}
      >
        <Text style={styles.manageButtonText}>
          Gerenciar Atributos ({attributes.length}) ›
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceLight,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: THEME.spacing.sm,
  },
  entityIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  entityName: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  actionIconText: {
    color: THEME.colors.primaryLight,
    fontSize: 14,
  },
  deleteIconBtn: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteIconText: {
    color: THEME.colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  attributesPreview: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.sm,
    marginVertical: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  noAttributesText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
  },
  attrList: {
    gap: 4,
  },
  attrPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pkBadge: {
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  pkBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
  },
  dotBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: THEME.colors.textMuted,
    marginHorizontal: 3,
  },
  attrNameText: {
    fontSize: 13,
    color: THEME.colors.textPrimary,
    fontWeight: '500',
  },
  attrTypeText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontFamily: 'monospace',
  },
  moreAttrsText: {
    fontSize: 11,
    color: THEME.colors.primaryLight,
    marginTop: 2,
    fontStyle: 'italic',
  },
  manageButton: {
    marginTop: THEME.spacing.xs,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderRadius: THEME.borderRadius.sm,
  },
  manageButtonText: {
    color: THEME.colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
});
