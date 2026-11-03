import React, { useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { THEME } from '../../constants/theme.js';

export const ENTITY_NODE_WIDTH = 210;

/**
 * EntityNode — Nó visual arrastável de entidade no Canvas 2D.
 * Renderizado em posição absoluta (positionX, positionY) dentro da transformLayer.
 *
 * Usa refs para acessar valores atualizados dentro do PanResponder (evita stale closures).
 */
export function EntityNode({
  entity,
  isSelected = false,
  isSourceSelected = false,
  isTargetCandidate = false,
  isConnectingMode = false,
  zoom = 1,
  onSelect,
  onPositionChange,
  onPressConnecting,
}) {
  // Refs para valores atualizados dentro do PanResponder (evita stale closures)
  const connectingRef = useRef(isConnectingMode);
  connectingRef.current = isConnectingMode;

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const entityRef = useRef(entity);
  entityRef.current = entity;

  const posRef = useRef({ x: entity.positionX || 100, y: entity.positionY || 100 });
  posRef.current = { x: entity.positionX || 100, y: entity.positionY || 100 };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !connectingRef.current,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (connectingRef.current) return false;
          return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
        },
        onPanResponderGrant: () => {
          onSelect(entityRef.current);
        },
        onPanResponderMove: (_, gestureState) => {
          const currentZoom = zoomRef.current;
          const newX = Math.round(posRef.current.x + gestureState.dx / currentZoom);
          const newY = Math.round(posRef.current.y + gestureState.dy / currentZoom);
          onPositionChange(entityRef.current.id, newX, newY, false);
        },
        onPanResponderRelease: (_, gestureState) => {
          const currentZoom = zoomRef.current;
          const finalX = Math.round(posRef.current.x + gestureState.dx / currentZoom);
          const finalY = Math.round(posRef.current.y + gestureState.dy / currentZoom);
          onPositionChange(entityRef.current.id, finalX, finalY, true);
        },
        onPanResponderTerminate: () => {},
      }),
    [onSelect, onPositionChange]
  );

  const attributes = entity.attributes || [];
  const pkAttributes = attributes.filter((a) => a.isPrimaryKey || a.is_primary_key);
  const otherAttributes = attributes.filter((a) => !a.isPrimaryKey && !a.is_primary_key);

  function handleCardPress() {
    if (isConnectingMode && onPressConnecting) {
      onPressConnecting(entity);
    } else {
      onSelect(entity);
    }
  }

  /** Renderiza um indicador de nulabilidade inline */
  function renderNullBadge(attr) {
    const isNotNull = attr.isNotNull || attr.is_not_null;
    if (!isNotNull) return null;
    return (
      <View style={styles.nnBadge}>
        <Text style={styles.nnBadgeText}>NN</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.nodeContainer,
        {
          left: entity.positionX || 100,
          top: entity.positionY || 100,
        },
        isSelected && styles.nodeSelected,
        isSourceSelected && styles.nodeSourceSelected,
        isTargetCandidate && styles.nodeTargetCandidate,
      ]}
      {...(!isConnectingMode ? panResponder.panHandlers : {})}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleCardPress}
        style={styles.touchableWrapper}
      >
        {/* Cabeçalho da Entidade */}
        <View
          style={[
            styles.header,
            isSelected && styles.headerSelected,
            isSourceSelected && styles.headerSourceSelected,
          ]}
        >
          <View style={styles.headerTitleRow}>
            <Text style={styles.entityIcon}>🧱</Text>
            <Text style={styles.entityTitle} numberOfLines={1}>
              {entity.name}
            </Text>
          </View>
          <View style={styles.attributeCountBadge}>
            <Text style={styles.attributeCountText}>{attributes.length}</Text>
          </View>
        </View>

        {/* Lista de Atributos com Tipos, PKs e Nulabilidade */}
        <View style={styles.body}>
          {attributes.length === 0 ? (
            <Text style={styles.emptyAttributesText}>Sem atributos</Text>
          ) : (
            <View style={styles.attributeList}>
              {pkAttributes.map((attr) => (
                <View key={attr.id} style={styles.attributeRow}>
                  <View style={styles.pkBadge}>
                    <Text style={styles.pkBadgeText}>PK</Text>
                  </View>
                  <Text style={[styles.attributeName, styles.pkNameText]} numberOfLines={1}>
                    {attr.name}
                  </Text>
                  {renderNullBadge(attr)}
                  <Text style={styles.attributeType}>
                    {attr.dataType || attr.data_type}
                  </Text>
                </View>
              ))}

              {otherAttributes.slice(0, 5).map((attr) => (
                <View key={attr.id} style={styles.attributeRow}>
                  <View style={styles.dotBullet} />
                  <Text style={styles.attributeName} numberOfLines={1}>
                    {attr.name}
                  </Text>
                  {renderNullBadge(attr)}
                  <Text style={styles.attributeType}>
                    {attr.dataType || attr.data_type}
                  </Text>
                </View>
              ))}

              {otherAttributes.length > 5 && (
                <Text style={styles.moreText}>
                  +{otherAttributes.length - 5} atributos...
                </Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  nodeContainer: {
    position: 'absolute',
    width: ENTITY_NODE_WIDTH,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },
  touchableWrapper: {
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
  },
  nodeSelected: {
    borderColor: THEME.colors.primaryLight,
    borderWidth: 2,
    shadowColor: THEME.colors.primaryLight,
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 20,
  },
  nodeSourceSelected: {
    borderColor: THEME.colors.accent,
    borderWidth: 2.5,
    shadowColor: THEME.colors.accent,
    shadowOpacity: 0.8,
    elevation: 12,
    zIndex: 25,
  },
  nodeTargetCandidate: {
    borderColor: '#34D399',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerSelected: {
    backgroundColor: '#0C4A6E',
  },
  headerSourceSelected: {
    backgroundColor: '#78350F',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 4,
  },
  entityIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  entityTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 13,
  },
  attributeCountBadge: {
    backgroundColor: THEME.colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  attributeCountText: {
    color: THEME.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    padding: 8,
    backgroundColor: THEME.colors.surface,
  },
  emptyAttributesText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 6,
  },
  attributeList: {
    gap: 3,
  },
  attributeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pkBadge: {
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  pkBadgeText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '900',
  },
  pkNameText: {
    fontWeight: '700',
    color: '#FDE68A',
  },
  nnBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    paddingHorizontal: 3,
    paddingVertical: 0,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  nnBadgeText: {
    color: '#F87171',
    fontSize: 7,
    fontWeight: '800',
  },
  dotBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.textMuted,
    marginHorizontal: 2,
  },
  attributeName: {
    fontSize: 11,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  attributeType: {
    fontSize: 9,
    color: THEME.colors.primaryLight,
    fontFamily: 'monospace',
  },
  moreText: {
    fontSize: 9,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
