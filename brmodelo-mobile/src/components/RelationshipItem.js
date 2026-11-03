import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme.js';

export function RelationshipItem({
  relationship,
  onEdit,
  onDelete,
}) {
  const entityAName = relationship.entityAName || relationship.entity_a_name || 'Entidade A';
  const entityBName = relationship.entityBName || relationship.entity_b_name || 'Entidade B';
  const cardinality = relationship.cardinality || '1:N';
  const name = relationship.name;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.nameBadge}>
          <Text style={styles.nameBadgeText}>
            {name ? `« ${name} »` : 'Relacionamento'}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onEdit(relationship)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Editar relacionamento"
          >
            <Text style={styles.actionBtnText}>✎</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => onDelete(relationship)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Excluir relacionamento"
          >
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Diagrama Estruturado do Relacionamento */}
      <View style={styles.diagramContainer}>
        <View style={styles.entityNode}>
          <Text style={styles.entityNodeText} numberOfLines={1}>
            {entityAName}
          </Text>
        </View>

        <View style={styles.connectorContainer}>
          <View style={styles.line} />
          <View style={styles.cardinalityBadge}>
            <Text style={styles.cardinalityText}>{cardinality}</Text>
          </View>
          <View style={styles.line} />
          <Text style={styles.arrowHead}>▶</Text>
        </View>

        <View style={styles.entityNode}>
          <Text style={styles.entityNodeText} numberOfLines={1}>
            {entityBName}
          </Text>
        </View>
      </View>
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
  nameBadge: {
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  nameBadgeText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
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
  diagramContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: 4,
  },
  entityNode: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.primaryDark,
  },
  entityNodeText: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  connectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    flexShrink: 0,
  },
  line: {
    width: 14,
    height: 2,
    backgroundColor: THEME.colors.primaryLight,
  },
  cardinalityBadge: {
    backgroundColor: THEME.colors.primaryDark,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.colors.primaryLight,
  },
  cardinalityText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  arrowHead: {
    color: THEME.colors.primaryLight,
    fontSize: 10,
    marginLeft: -2,
  },
});
