import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from '../ui/IconSymbol';
import { ItemFormData } from '../../types/inventory';
import { ADD_ITEM_STEPS, ITEM_STATUSES } from '../../constants/inventory';
import { useThemeColor } from '../../hooks/useThemeColor';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (item: ItemFormData) => void;
}

export function AddItemModal({ visible, onClose, onAddItem }: AddItemModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tempTag, setTempTag] = useState('');
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    quantity: 1,
    status: 'available',
    consumable: false,
    roomId: undefined,
    placeId: undefined,
    containerId: undefined,
    tagIds: [],
  });

  const colors = {
    card: useThemeColor({}, 'card'),
    text: useThemeColor({}, 'text'),
    textSecondary: useThemeColor({}, 'textSecondary'),
    primary: useThemeColor({}, 'primary'),
    backgroundSecondary: useThemeColor({}, 'backgroundSecondary'),
    background: useThemeColor({}, 'background'),
  };

  // Form handlers
  const updateFormData = (field: keyof ItemFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tempTag.trim()) {
      // For now, we'll just store tag names as IDs (mock implementation)
      const newTagId = Date.now();
      updateFormData('tagIds', [...formData.tagIds, newTagId]);
      setTempTag('');
    }
  };

  const removeTag = (tagId: number) => {
    updateFormData('tagIds', formData.tagIds.filter(id => id !== tagId));
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < ADD_ITEM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: return formData.name.trim() !== '';
      case 1: return true; // Images optionnelles
      case 2: return true; // Location optionnelle pour le moment
      case 3: return true; // Tags optionnels
      case 4: return true; // Confirmation
      default: return false;
    }
  };

  const handleSubmit = () => {
    onAddItem(formData);
    handleClose();
    Alert.alert('Succès', 'L&apos;objet a été ajouté à votre inventaire !');
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData({
      name: '',
      quantity: 1,
      status: 'available',
      consumable: false,
      roomId: undefined,
      placeId: undefined,
      containerId: undefined,
      tagIds: [],
    });
    setTempTag('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.backgroundSecondary }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" style={[styles.title, { color: colors.text }]}>
            Ajouter un objet
          </ThemedText>
          <View style={styles.headerSpace} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {ADD_ITEM_STEPS.map((step, index) => (
            <View key={index} style={styles.progressStep}>
              <View style={[
                styles.progressCircle,
                {
                  backgroundColor: index <= currentStep ? colors.primary : colors.backgroundSecondary,
                  borderColor: index <= currentStep ? colors.primary : colors.textSecondary,
                }
              ]}>
                {index < currentStep ? (
                  <IconSymbol name="checkmark" size={12} color="#FFFFFF" />
                ) : (
                  <ThemedText style={[
                    styles.progressNumber,
                    { color: index <= currentStep ? '#FFFFFF' : colors.textSecondary }
                  ]}>
                    {index + 1}
                  </ThemedText>
                )}
              </View>
              {index < ADD_ITEM_STEPS.length - 1 && (
                <View style={[
                  styles.progressLine,
                  { backgroundColor: index < currentStep ? colors.primary : colors.backgroundSecondary }
                ]} />
              )}
            </View>
          ))}
        </View>

        {/* Step Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.stepContainer}>
            <ThemedText type="title" style={[styles.stepTitle, { color: colors.text }]}>
              {ADD_ITEM_STEPS[currentStep].title}
            </ThemedText>
            <ThemedText style={[styles.stepDescription, { color: colors.textSecondary }]}>
              {ADD_ITEM_STEPS[currentStep].description}
            </ThemedText>

            {/* Step 0: Basic Information */}
            {currentStep === 0 && (
              <View style={styles.stepContent}>
                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Nom de l&apos;objet *
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: colors.backgroundSecondary, 
                      color: colors.text 
                    }]}
                    placeholder="Ex: Dentifrice Colgate"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.name}
                    onChangeText={(text) => updateFormData('name', text)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Quantité
                  </ThemedText>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                      onPress={() => updateFormData('quantity', Math.max(1, formData.quantity - 1))}
                    >
                      <IconSymbol name="minus" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.quantityInput, { 
                        backgroundColor: colors.backgroundSecondary, 
                        color: colors.text 
                      }]}
                      value={formData.quantity.toString()}
                      onChangeText={(text) => {
                        const num = parseInt(text) || 1;
                        updateFormData('quantity', Math.max(1, num));
                      }}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity 
                      style={[styles.quantityButton, { backgroundColor: colors.backgroundSecondary }]}
                      onPress={() => updateFormData('quantity', formData.quantity + 1)}
                    >
                      <IconSymbol name="plus" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Statut
                  </ThemedText>
                  <View style={styles.statusButtons}>
                    {ITEM_STATUSES.map((status) => (
                      <TouchableOpacity
                        key={status.value}
                        style={[
                          styles.statusButton,
                          {
                            backgroundColor: formData.status === status.value 
                              ? colors.primary 
                              : colors.backgroundSecondary,
                          }
                        ]}
                        onPress={() => updateFormData('status', status.value)}
                      >
                        <ThemedText style={[
                          styles.statusButtonText,
                          { 
                            color: formData.status === status.value 
                              ? '#FFFFFF' 
                              : colors.textSecondary 
                          }
                        ]}>
                          {status.label}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.consumableToggle}
                  onPress={() => updateFormData('consumable', !formData.consumable)}
                >
                  <IconSymbol 
                    name={formData.consumable ? "checkmark.square" : "square"} 
                    size={24} 
                    color={formData.consumable ? colors.primary : colors.textSecondary} 
                  />
                  <ThemedText style={[styles.consumableText, { color: colors.text }]}>
                    Objet consommable
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 1: Image (placeholder) */}
            {currentStep === 1 && (
              <View style={styles.stepContent}>
                <ThemedText style={[styles.placeholderText, { color: colors.textSecondary }]}>
                  Fonctionnalité d&apos;ajout d&apos;image à venir...
                </ThemedText>
              </View>
            )}

            {/* Step 2: Location (placeholder) */}
            {currentStep === 2 && (
              <View style={styles.stepContent}>
                <ThemedText style={[styles.placeholderText, { color: colors.textSecondary }]}>
                  Sélection de localisation à venir...
                </ThemedText>
              </View>
            )}

            {/* Step 3: Tags */}
            {currentStep === 3 && (
              <View style={styles.stepContent}>
                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Ajouter des tags
                  </ThemedText>
                  <View style={styles.tagInputContainer}>
                    <TextInput
                      style={[styles.tagInput, { 
                        backgroundColor: colors.backgroundSecondary, 
                        color: colors.text 
                      }]}
                      placeholder="Ex: hygiène"
                      placeholderTextColor={colors.textSecondary}
                      value={tempTag}
                      onChangeText={setTempTag}
                      onSubmitEditing={addTag}
                    />
                    <TouchableOpacity 
                      style={[styles.addTagButton, { backgroundColor: colors.primary }]}
                      onPress={addTag}
                    >
                      <IconSymbol name="plus" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {formData.tagIds.length > 0 && (
                  <View style={styles.tagsDisplay}>
                    {formData.tagIds.map((tagId) => (
                      <View key={tagId} style={[styles.tagChip, { backgroundColor: colors.primary }]}>
                        <ThemedText style={styles.tagChipText}>
                          Tag {tagId}
                        </ThemedText>
                        <TouchableOpacity onPress={() => removeTag(tagId)}>
                          <IconSymbol name="xmark" size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <View style={styles.stepContent}>
                <View style={[styles.confirmationCard, { backgroundColor: colors.card }]}>
                  <ThemedText type="defaultSemiBold" style={[styles.confirmationTitle, { color: colors.text }]}>
                    Récapitulatif
                  </ThemedText>
                  
                  <View style={styles.confirmationRow}>
                    <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                      Nom:
                    </ThemedText>
                    <ThemedText style={[styles.confirmationValue, { color: colors.text }]}>
                      {formData.name}
                    </ThemedText>
                  </View>

                  <View style={styles.confirmationRow}>
                    <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                      Quantité:
                    </ThemedText>
                    <ThemedText style={[styles.confirmationValue, { color: colors.text }]}>
                      {formData.quantity}
                    </ThemedText>
                  </View>

                  <View style={styles.confirmationRow}>
                    <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                      Statut:
                    </ThemedText>
                    <ThemedText style={[styles.confirmationValue, { color: colors.text }]}>
                      {ITEM_STATUSES.find(s => s.value === formData.status)?.label}
                    </ThemedText>
                  </View>

                  <View style={styles.confirmationRow}>
                    <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                      Type:
                    </ThemedText>
                    <ThemedText style={[styles.confirmationValue, { color: colors.text }]}>
                      {formData.consumable ? 'Consommable' : 'Non consommable'}
                    </ThemedText>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.backgroundSecondary }]}>
          <View style={styles.footerButtons}>
            {currentStep > 0 && (
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton, { borderColor: colors.textSecondary }]}
                onPress={prevStep}
              >
                <ThemedText style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                  Précédent
                </ThemedText>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.primaryButton, 
                { 
                  backgroundColor: canProceedToNextStep() ? colors.primary : colors.backgroundSecondary,
                  flex: currentStep === 0 ? 1 : 0.6
                }
              ]}
              onPress={currentStep === ADD_ITEM_STEPS.length - 1 ? handleSubmit : nextStep}
              disabled={!canProceedToNextStep()}
            >
              <ThemedText style={[
                styles.primaryButtonText, 
                { color: canProceedToNextStep() ? '#FFFFFF' : colors.textSecondary }
              ]}>
                {currentStep === ADD_ITEM_STEPS.length - 1 ? 'Ajouter' : 'Suivant'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
  },
  headerSpace: {
    width: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    marginBottom: 24,
  },
  stepContent: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    textAlign: 'center',
    minWidth: 80,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  consumableToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  consumableText: {
    fontSize: 16,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 40,
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  confirmationCard: {
    padding: 20,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmationTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  confirmationLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmationValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    borderWidth: 1,
    flex: 0.4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
