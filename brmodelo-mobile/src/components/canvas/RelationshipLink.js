import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { THEME } from '../../constants/theme.js';
import { ENTITY_NODE_WIDTH } from './EntityNode.js';

export function RelationshipLink({
  relationship,
  entityA,
  entityB,
  isSelected = false,
  onSelect,
}) {
  if (!entityA || !entityB) return null;

  // Altura aproximada do centro do header da entidade
  const NODE_CENTER_OFFSET_Y = 35;
  const NODE_CENTER_OFFSET_X = ENTITY_NODE_WIDTH / 2;

  const ax = (entityA.positionX || 0) + NODE_CENTER_OFFSET_X;
  const ay = (entityA.positionY || 0) + NODE_CENTER_OFFSET_Y;

  const bx = (entityB.positionX || 0) + NODE_CENTER_OFFSET_X;
  const by = (entityB.positionY || 0) + NODE_CENTER_OFFSET_Y;

  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx); // em radianos

  const midX = (ax + bx) / 2;
  const midY = (ay + by) / 2;

  const cardinality = relationship.cardinality || '1:N';
  const name = relationship.name;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Linha que conecta os dois nós */}
      <View
        style={[
          styles.line,
          {
            left: ax,
            top: ay,
            width: length,
            transform: [
              { rotate: `${angle}rad` },
              { translateY: -1.5 }, // centraliza a espessura da linha (3px)
            ],
            transformOrigin: '0% 50%',
          },
          isSelected && styles.lineSelected,
        ]}
      />

      {/* Chip central de cardinalidade e nome clicável */}
      <TouchableOpacity
        style={[
          styles.badgeWrapper,
          {
            left: midX - 35,
            top: midY - 14,
          },
          isSelected && styles.badgeWrapperSelected,
        ]}
        onPress={() => onSelect(relationship)}
        activeOpacity={0.8}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={[styles.cardinalityText, isSelected && styles.cardinalityTextSelected]}>
          {cardinality}
        </Text>
        {name ? (
          <Text style={styles.nameText} numberOfLines={1}>
            {name}
          </Text>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  line: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#38BDF8',
    opacity: 0.85,
    borderRadius: 1.5,
  },
  lineSelected: {
    backgroundColor: THEME.colors.accent,
    height: 4,
    opacity: 1,
    shadowColor: THEME.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 8,
  },
  badgeWrapper: {
    position: 'absolute',
    width: 70,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  badgeWrapperSelected: {
    borderColor: THEME.colors.accent,
    backgroundColor: '#451A03',
    elevation: 8,
  },
  cardinalityText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    fontFamily: 'monospace',
  },
  cardinalityTextSelected: {
    color: '#FDE68A',
  },
  nameText: {
    fontSize: 8,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 1,
  },
});
