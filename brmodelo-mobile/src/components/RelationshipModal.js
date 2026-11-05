import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { THEME } from '../constants/theme.js';
import { CARDINALITIES, DEFAULT_CARDINALITY } from '../constants/cardinalities.js';

export function RelationshipModal({
  visible,
  entities = [],
  initialData = null,
  onConfirm,
  onCancel,
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [entityAId, setEntityAId] = useState('');
  const [entityBId, setEntityBId] = useState('');
  const [cardinality, setCardinality] = useState(DEFAULT_CARDINALITY);
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setEntityAId(initialData.entityAId || initialData.entity_a_id || '');
        setEntityBId(initialData.entityBId || initialData.entity_b_id || '');
        setCardinality(initialData.cardinality || DEFAULT_CARDINALITY);
        setName(initialData.name || '');
      } else {
        setEntityAId(entities.length > 0 ? entities[0].id : '');
        setEntityBId(entities.length > 1 ? entities[1].id : '');
        setCardinality(DEFAULT_CARDINALITY);
        setName('');
      }
      setErrorMessage('');
    }
  }, [visible, initialData, entities]);

  function handleSave() {
    if (!entityAId || !entityBId) {
      setErrorMessage('Selecione ambas as entidades para o relacionamento.');
      return;
    }
    if (entityAId === entityBId) {
      setErrorMessage('Relacionamentos de uma entidade com ela mesma não são suportados no MVP.');
      return;
    }
    setErrorMessage('');
    onConfirm({
      entityAId,
      entityBId,
      cardinality,
      name: name ? name.trim() : null,
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.title}>
                  {isEditing ? 'Editar Relacionamento' : 'Novo Relacionamento'}
                </Text>

                <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">
                  {errorMessage ? (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                  ) : null}

                  {/* Nome do Relacionamento */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome do Relacionamento (opcional)</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Ex: possui, pertence, realiza"
                      placeholderTextColor={THEME.colors.textMuted}
                      maxLength={60}
                    />
                  </View>

                  {/* Cardinalidade */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Cardinalidade *</Text>
                    <View style={styles.cardinalityRow}>
                      {CARDINALITIES.map((c) => {
                        const isSelected = cardinality === c.value;
                        return (
                          <TouchableOpacity
                            key={c.value}
                            style={[
                              styles.cardinalityChip,
                              isSelected && styles.cardinalityChipSelected,
                            ]}
                            onPress={() => setCardinality(c.value)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.cardinalityText,
                                isSelected && styles.cardinalityTextSelected,
                              ]}
                            >
                              {c.value}
                            </Text>
                            <Text
                              style={[
                                styles.cardinalitySubtext,
                                isSelected && styles.cardinalitySubtextSelected,
                              ]}
                            >
                              {c.label.split('(')[1]?.replace(')', '') || ''}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Entidade Origem (A) */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Entidade de Origem (Lado 1) *</Text>
                    <View style={styles.entitySelectorList}>
                      {entities.map((e) => {
                        const isSelected = entityAId === e.id;
                        return (
                          <TouchableOpacity
                            key={`a-${e.id}`}
                            style={[
                              styles.entityChip,
                              isSelected && styles.entityChipSelected,
                            ]}
                            disabled={isEditing}
                            onPress={() => {
                              setEntityAId(e.id);
                              if (errorMessage) setErrorMessage('');
                            }}
                          >
                            <Text
                              style={[
                                styles.entityChipText,
                                isSelected && styles.entityChipTextSelected,
                              ]}
                            >
                              {e.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Entidade Destino (B) */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Entidade de Destino (Lado 2) *</Text>
                    <View style={styles.entitySelectorList}>
                      {entities.map((e) => {
                        const isSelected = entityBId === e.id;
                        const isSameAsA = entityAId === e.id;
                        return (
                          <TouchableOpacity
                            key={`b-${e.id}`}
                            style={[
                              styles.entityChip,
                              isSelected && styles.entityChipSelected,
                              isSameAsA && styles.entityChipDisabled,
                            ]}
                            disabled={isEditing || isSameAsA}
                            onPress={() => {
                              setEntityBId(e.id);
                              if (errorMessage) setErrorMessage('');
                            }}
                          >
                            <Text
                              style={[
                                styles.entityChipText,
                                isSelected && styles.entityChipTextSelected,
                                isSameAsA && styles.entityChipTextDisabled,
                              ]}
                            >
                              {e.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </ScrollView>

                {/* Botões */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={handleSave}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmButtonText}>
                      {isEditing ? 'Salvar Alterações' : 'Criar Relacionamento'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.md,
  },
  scrollArea: {
    maxHeight: 380,
  },
  errorBox: {
    backgroundColor: THEME.colors.dangerSurface,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.danger,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: THEME.spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm + 2,
    color: THEME.colors.textPrimary,
    fontSize: 15,
  },
  cardinalityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cardinalityChip: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  cardinalityChipSelected: {
    backgroundColor: THEME.colors.primaryDark,
    borderColor: THEME.colors.primaryLight,
  },
  cardinalityText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  cardinalityTextSelected: {
    color: '#FFFFFF',
  },
  cardinalitySubtext: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  cardinalitySubtextSelected: {
    color: '#E0F2FE',
  },
  entitySelectorList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  entityChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  entityChipSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primaryLight,
  },
  entityChipDisabled: {
    opacity: 0.35,
  },
  entityChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  entityChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  entityChipTextDisabled: {
    color: THEME.colors.textMuted,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: THEME.spacing.sm,
    marginTop: THEME.spacing.lg,
    paddingTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceLight,
  },
  button: {
    minHeight: 44,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm + 2,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  cancelButton: {
    backgroundColor: THEME.colors.surfaceLight,
  },
  cancelButtonText: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: THEME.colors.primary,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
