import React, { useRef, useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  Dimensions,
} from 'react-native';
import { THEME } from '../../constants/theme.js';
import { EntityNode, ENTITY_NODE_WIDTH } from './EntityNode.js';
import { RelationshipLink } from './RelationshipLink.js';

/**
 * CanvasWorkspace — Área de trabalho principal do editor visual Canvas 2D.
 * Aplica transform (translate + scale) a uma camada interna de 6000x6000.
 *
 * Usa refs para evitar stale closures nos PanResponders.
 */
export function CanvasWorkspace({
  entities = [],
  relationships = [],
  selectedEntity = null,
  selectedRelationship = null,
  isConnectingMode = false,
  connectingSourceEntity = null,
  mode = 'select', // 'select' | 'pan'
  zoom = 1,
  panX = 0,
  panY = 0,
  onSelectEntity,
  onSelectRelationship,
  onDeselectAll,
  onEntityPositionChange,
  onViewportChange,
  onConnectingEntityPress,
}) {
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setWindowDimensions(window);
    });
    return () => sub?.remove();
  }, []);

  // Refs para valores atualizados dentro do PanResponder (evita stale closures)
  const panState = useRef({ x: panX, y: panY });
  panState.current = { x: panX, y: panY };

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const connectingRef = useRef(isConnectingMode);
  connectingRef.current = isConnectingMode;

  const deselectRef = useRef(onDeselectAll);
  deselectRef.current = onDeselectAll;

  const viewportChangeRef = useRef(onViewportChange);
  viewportChangeRef.current = onViewportChange;

  // PanResponder exclusivo para navegar pelo fundo do Canvas
  const backgroundPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
        },
        onPanResponderGrant: () => {
          if (!connectingRef.current) {
            deselectRef.current();
          }
        },
        onPanResponderMove: (_, gestureState) => {
          const nextX = panState.current.x + gestureState.dx;
          const nextY = panState.current.y + gestureState.dy;
          viewportChangeRef.current(zoomRef.current, nextX, nextY, false);
        },
        onPanResponderRelease: (_, gestureState) => {
          const finalX = panState.current.x + gestureState.dx;
          const finalY = panState.current.y + gestureState.dy;
          viewportChangeRef.current(zoomRef.current, finalX, finalY, true);
        },
      }),
    []
  );

  // Cria mapa de entidades para lookup instantâneo O(1) pelas conexões de relacionamento
  const entityMap = new Map(entities.map((e) => [e.id, e]));

  return (
    <View style={styles.outerContainer}>
      {/* Banner de instrução durante o modo de conexão de relacionamento */}
      {isConnectingMode && (
        <View style={styles.connectionBanner}>
          <Text style={styles.connectionBannerText}>
            {connectingSourceEntity
              ? `🎯 Etapa 2: Toque na entidade de destino para ligar com "${connectingSourceEntity.name}"`
              : '👉 Etapa 1: Toque na entidade de origem no canvas'}
          </Text>
        </View>
      )}

      {/* Camada interativa do Canvas com Pan no fundo */}
      <View
        style={styles.canvasBackground}
        {...backgroundPanResponder.panHandlers}
      >
        {/* Camada transformada com Zoom e Deslocamento Pan */}
        <View
          style={[
            styles.transformLayer,
            {
              transform: [
                { translateX: panX },
                { translateY: panY },
                { scale: zoom },
              ],
            },
          ]}
        >
          {/* Grid de Referência Visual (Grade Estilo Figma) */}
          <View style={styles.gridPlane} pointerEvents="none">
            {/* Grade de pontos para orientação espacial */}
            {renderGridDots()}
            {/* Linhas de eixos de referência */}
            <View style={styles.originCrosshairH} />
            <View style={styles.originCrosshairV} />
          </View>

          {/* Camada de Relacionamentos (Linhas Conectoras) */}
          {relationships.map((rel) => {
            const entAId = rel.entityAId || rel.entity_a_id;
            const entBId = rel.entityBId || rel.entity_b_id;
            const entA = entityMap.get(entAId);
            const entB = entityMap.get(entBId);
            const isSelected = selectedRelationship?.id === rel.id;

            return (
              <RelationshipLink
                key={rel.id}
                relationship={rel}
                entityA={entA}
                entityB={entB}
                isSelected={isSelected}
                onSelect={onSelectRelationship}
              />
            );
          })}

          {/* Camada de Entidades (Nós Arrastáveis) */}
          {entities.map((entity) => {
            const isSelected = selectedEntity?.id === entity.id;
            const isSourceSelected = connectingSourceEntity?.id === entity.id;
            const isTargetCandidate =
              isConnectingMode &&
              connectingSourceEntity &&
              connectingSourceEntity.id !== entity.id;

            return (
              <EntityNode
                key={entity.id}
                entity={entity}
                isSelected={isSelected}
                isSourceSelected={isSourceSelected}
                isTargetCandidate={isTargetCandidate}
                isConnectingMode={isConnectingMode}
                zoom={zoom}
                onSelect={onSelectEntity}
                onPositionChange={onEntityPositionChange}
                onPressConnecting={onConnectingEntityPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

/**
 * Renderiza uma grade de pontos sutis no canvas para referência visual.
 * Estilo inspirado no Figma e Obsidian Canvas.
 */
function renderGridDots() {
  const dots = [];
  const spacing = 100;
  const count = 30; // 30x30 = grid de 3000x3000 pontos
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      dots.push(
        <View
          key={`dot-${row}-${col}`}
          style={[
            styles.gridDot,
            {
              left: col * spacing + 50,
              top: row * spacing + 50,
            },
          ]}
        />
      );
    }
  }
  return dots;
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0B0F19',
    overflow: 'hidden',
  },
  canvasBackground: {
    flex: 1,
  },
  transformLayer: {
    width: 6000,
    height: 6000,
    position: 'absolute',
    left: 0,
    top: 0,
    transformOrigin: '0% 0%',
  },
  gridPlane: {
    position: 'absolute',
    width: 6000,
    height: 6000,
    backgroundColor: '#090D16',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  gridDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  originCrosshairH: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  originCrosshairV: {
    position: 'absolute',
    left: 100,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  connectionBanner: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: '#0369A1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  connectionBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
