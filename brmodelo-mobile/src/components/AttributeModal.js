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
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { THEME } from '../constants/theme.js';
import { DATA_TYPES, DEFAULT_DATA_TYPE } from '../constants/dataTypes.js';

export function AttributeModal({
  visible,
  initialData = null,
  onConfirm,
  onCancel,
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [name, setName] = useState('');
  const [dataType, setDataType] = useState(DEFAULT_DATA_TYPE);
  const [isPrimaryKey, setIsPrimaryKey] = useState(false);
  const [isNotNull, setIsNotNull] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setName(initialData.name || '');
        setDataType(initialData.dataType || initialData.data_type || DEFAULT_DATA_TYPE);
        const pk = Boolean(initialData.isPrimaryKey !== undefined ? initialData.isPrimaryKey : initialData.is_primary_key);
        const nn = Boolean(initialData.isNotNull !== undefined ? initialData.isNotNull : initialData.is_not_null);
        setIsPrimaryKey(pk);
        setIsNotNull(pk || nn);
      } else {
        setName('');
        setDataType(DEFAULT_DATA_TYPE);
        setIsPrimaryKey(false);
        setIsNotNull(false);
      }
      setErrorMessage('');
    }
  }, [visible, initialData]);

  function handlePkToggle(val) {
    setIsPrimaryKey(val);
    if (val) {
      setIsNotNull(true); // Se for PK, obrigatoriamente é NOT NULL
    }
  }

  function handleSave() {
    if (!name || name.trim().length === 0) {
      setErrorMessage('O nome do atributo é obrigatório.');
      return;
    }
    setErrorMessage('');
    onConfirm({
      name: name.trim(),
      dataType,
      isPrimaryKey,
      isNotNull: isPrimaryKey ? true : isNotNull,
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
                  {isEditing ? 'Editar Atributo' : 'Novo Atributo'}
                </Text>

                <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">
                  {/* Nome do Atributo */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome do Atributo *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errorMessage ? styles.inputError : null,
                      ]}
                      value={name}
                      onChangeText={(t) => {
                        setName(t);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Ex: id, nome, email, valor"
                      placeholderTextColor={THEME.colors.textMuted}
                      maxLength={80}
                      autoFocus={!isEditing}
                    />
                    {errorMessage ? (
                      <Text style={styles.errorText}>{errorMessage}</Text>
                    ) : null}
                  </View>

                  {/* Tipo de Dado */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tipo de Dado *</Text>
                    <View style={styles.typesGrid}>
                      {DATA_TYPES.map((t) => {
                        const isSelected = dataType === t.value;
                        return (
                          <TouchableOpacity
                            key={t.value}
                            style={[
                              styles.typeChip,
                              isSelected && styles.typeChipSelected,
                            ]}
                            onPress={() => setDataType(t.value)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.typeChipText,
                                isSelected && styles.typeChipTextSelected,
                              ]}
                            >
                              {t.value}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Switches de PK e NOT NULL */}
                  <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                      <Text style={styles.switchLabel}>Chave Primária (PK)</Text>
                      <Text style={styles.switchDescription}>
                        Identificador único da entidade
                      </Text>
                    </View>
                    <Switch
                      value={isPrimaryKey}
                      onValueChange={handlePkToggle}
                      trackColor={{ false: '#334155', true: THEME.colors.accent }}
                      thumbColor={isPrimaryKey ? '#FFFFFF' : '#94A3B8'}
                    />
                  </View>

                  <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                      <Text style={styles.switchLabel}>Obrigatório (NOT NULL)</Text>
                      <Text style={styles.switchDescription}>
                        Não aceita valores nulos
                      </Text>
                    </View>
                    <Switch
                      value={isNotNull}
                      onValueChange={setIsNotNull}
                      disabled={isPrimaryKey}
                      trackColor={{ false: '#334155', true: THEME.colors.primary }}
                      thumbColor={isNotNull ? '#FFFFFF' : '#94A3B8'}
                    />
                  </View>
                </ScrollView>

                {/* Botões de Ação */}
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
                      {isEditing ? 'Salvar Alterações' : 'Adicionar Atributo'}
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
  inputError: {
    borderColor: THEME.colors.danger,
  },
  errorText: {
    color: THEME.colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  typeChipSelected: {
    backgroundColor: THEME.colors.primaryDark,
    borderColor: THEME.colors.primaryLight,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  typeChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceLight,
  },
  switchInfo: {
    flex: 1,
    paddingRight: THEME.spacing.sm,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  switchDescription: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
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
