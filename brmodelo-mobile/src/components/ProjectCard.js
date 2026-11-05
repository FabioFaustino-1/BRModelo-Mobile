import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme.js';
import { formatDisplayDate } from '../utils/date.js';

export function ProjectCard({
  project,
  onPress,
  onDelete,
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(project)}
      activeOpacity={0.7}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleInfo}>
          <Text style={styles.projectName} numberOfLines={1}>
            {project.name}
          </Text>
          <Text style={styles.projectDate}>
            Atualizado em: {formatDisplayDate(project.updatedAt || project.updated_at)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(project)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Excluir projeto"
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.statsContainer}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>
              {project.entityCount !== undefined ? project.entityCount : '—'}
            </Text>
            <Text style={styles.statLabel}>entidades</Text>
          </View>

          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>
              {project.relationshipCount !== undefined ? project.relationshipCount : '—'}
            </Text>
            <Text style={styles.statLabel}>relacionamentos</Text>
          </View>
        </View>

        <View style={styles.openArrowWrapper}>
          <Text style={styles.openArrow}>Abrir ›</Text>
        </View>
      </View>
    </TouchableOpacity>
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
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.md,
  },
  titleInfo: {
    flex: 1,
    paddingRight: THEME.spacing.sm,
  },
  projectName: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  projectDate: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  deleteButtonText: {
    color: THEME.colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceLight,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.sm,
    gap: 4,
  },
  statNumber: {
    color: THEME.colors.primaryLight,
    fontWeight: '700',
    fontSize: 12,
  },
  statLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
  },
  openArrowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openArrow: {
    color: THEME.colors.primaryLight,
    fontWeight: '600',
    fontSize: 13,
  },
});
