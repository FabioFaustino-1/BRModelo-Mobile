import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { THEME } from '../../constants/theme.js';

export function CanvasToolbar({
  mode = 'select', // 'select' | 'pan' | 'connect'
  isConnectingMode = false,
  zoom = 1,
  onSetMode,
  onAddEntity,
  onStartConnect,
  onCancelConnect,
  onZoomIn,
  onZoomOut,
  onFitToView,
  onToggleViewMode,
  viewMode = 'canvas', // 'canvas' | 'list'
}) {
  return (
    <View style={styles.floatingContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.toolbarScroll}
      >
        {/* Alternador de Modo de Interação: Selecionar vs Pan */}
        <TouchableOpacity
          style={[
            styles.toolButton,
            mode === 'select' && !isConnectingMode && styles.toolButtonActive,
          ]}
          onPress={() => onSetMode('select')}
          activeOpacity={0.7}
        >
          <Text style={styles.toolIcon}>👆</Text>
          <Text style={[styles.toolLabel, mode === 'select' && !isConnectingMode && styles.toolLabelActive]}>
            Selecionar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolButton,
            mode === 'pan' && !isConnectingMode && styles.toolButtonActive,
          ]}
          onPress={() => onSetMode('pan')}
          activeOpacity={0.7}
        >
          <Text style={styles.toolIcon}>🖐️</Text>
          <Text style={[styles.toolLabel, mode === 'pan' && !isConnectingMode && styles.toolLabelActive]}>
            Navegar
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Adicionar Nova Entidade no Canvas */}
        <TouchableOpacity
          style={[styles.toolButton, styles.addEntityBtn]}
          onPress={onAddEntity}
          activeOpacity={0.7}
        >
          <Text style={styles.toolIcon}>🧱</Text>
          <Text style={styles.addEntityBtnText}>+ Entidade</Text>
        </TouchableOpacity>

        {/* Criar Relacionamento Visual */}
        {isConnectingMode ? (
          <TouchableOpacity
            style={[styles.toolButton, styles.cancelConnectBtn]}
            onPress={onCancelConnect}
            activeOpacity={0.7}
          >
            <Text style={styles.toolIcon}>✕</Text>
            <Text style={styles.cancelConnectBtnText}>Cancelar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.toolButton}
            onPress={onStartConnect}
            activeOpacity={0.7}
          >
            <Text style={styles.toolIcon}>🔗</Text>
            <Text style={styles.toolLabel}>Relacionar</Text>
          </TouchableOpacity>
        )}

        <View style={styles.divider} />

        {/* Controles de Zoom e Enquadramento */}
        <TouchableOpacity
          style={styles.toolButton}
          onPress={onZoomOut}
          activeOpacity={0.7}
        >
          <Text style={styles.toolIcon}>−</Text>
          <Text style={styles.toolLabel}>Zoom</Text>
        </TouchableOpacity>

        <View style={styles.zoomDisplay}>
          <Text style={styles.zoomDisplayText}>{Math.round(zoom * 100)}%</Text>
        </View>

        <TouchableOpacity
          style={styles.toolButton}
          onPress={onZoomIn}
          activeOpacity={0.7}
        >
          <Text style={styles.toolIcon}>+</Text>
          <Text style={styles.toolLabel}>Zoom</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolButton}
          onPress={onFitToView}
          activeOpacity={0.7}
        >
          <Text style={styles.toolIcon}>🎯</Text>
          <Text style={styles.toolLabel}>Enquadrar</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Alternar Canvas vs Lista */}
        <TouchableOpacity
          style={styles.toolButton}
          onPress={onToggleViewMode}
          activeOpacity={0.7}
        >
          <Text style={styles.toolIcon}>{viewMode === 'canvas' ? '📋' : '🎨'}</Text>
          <Text style={styles.toolLabel}>
            {viewMode === 'canvas' ? 'Ver Lista' : 'Ver Canvas'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceLight,
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  toolbarScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  toolButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    minHeight: 46,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  toolButtonActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryLight,
  },
  toolIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  toolLabel: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  toolLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  addEntityBtn: {
    backgroundColor: '#0369A1',
    borderColor: THEME.colors.primaryLight,
  },
  addEntityBtnText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cancelConnectBtn: {
    backgroundColor: THEME.colors.danger,
    borderColor: '#F87171',
  },
  cancelConnectBtnText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: THEME.colors.surfaceLight,
    marginHorizontal: 4,
  },
  zoomDisplay: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDisplayText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
});
