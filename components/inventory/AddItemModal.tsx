import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ADD_ITEM_STEPS, ITEM_STATUSES } from '../../constants/inventory';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useInventoryData } from '../../stores/inventory';
import { ItemFormData } from '../../types/inventory';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from '../ui/IconSymbol';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (item: ItemFormData) => void;
}

export function AddItemModal({ visible, onClose, onAddItem }: AddItemModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    quantity: 1,
    status: 'available',
    consumable: false,
    price: undefined,
    itemLink: '',
    roomId: undefined,
    placeId: undefined,
    containerId: undefined,
    tagIds: [],
  });

  // Get inventory data
  const { rooms, places, containers, tags, dataLoading } = useInventoryData();

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

  const toggleTag = (tagId: number) => {
    const isSelected = formData.tagIds.includes(tagId);
    if (isSelected) {
      updateFormData('tagIds', formData.tagIds.filter(id => id !== tagId));
    } else {
      updateFormData('tagIds', [...formData.tagIds, tagId]);
    }
  };

  // Get available places for selected room
  const getAvailablePlaces = () => {
    if (!formData.roomId) return [];
    return places.filter(place => place.roomId === formData.roomId);
  };

  // Get available containers for selected place
  const getAvailableContainers = () => {
    if (!formData.placeId) return [];
    return containers.filter(container => container.placeId === formData.placeId);
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
      case 1: return formData.roomId !== undefined && formData.placeId !== undefined; // Location required
      case 2: return true; // Optional tags
      case 3: return true; // Confirmation
      default: return false;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log('Submitting item with data:', formData);
      await onAddItem(formData);
      handleClose();
      Alert.alert('Success', 'The item has been added to your inventory!');
    } catch (error: any) {
      console.error('Error adding item:', error);
      Alert.alert('Error', error.message || 'Failed to add item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData({
      name: '',
      quantity: 1,
      status: 'available',
      consumable: false,
      price: undefined,
      itemLink: '',
      roomId: undefined,
      placeId: undefined,
      containerId: undefined,
      tagIds: [],
    });
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
            Add Item
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
                    Item Name *
                  </ThemedText>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.text
                    }]}
                    placeholder="E.g.: Colgate Toothpaste"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.name}
                    onChangeText={(text) => updateFormData('name', text)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Quantity
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
                    Status
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
                    Consumable Item
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 1: Location */}
            {currentStep === 1 && (
              <View style={styles.stepContent}>
                {dataLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                      Loading locations...
                    </ThemedText>
                  </View>
                ) : (
                  <>
                    {/* Room Selection */}
                    <View style={styles.inputGroup}>
                      <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                        Room *
                      </ThemedText>
                      {rooms.length === 0 ? (
                        <ThemedText style={[styles.placeholderText, { color: colors.textSecondary }]}>
                          No rooms available. Please create a room first.
                        </ThemedText>
                      ) : (
                        <View style={styles.selectionGrid}>
                          {rooms.map((room) => (
                            <TouchableOpacity
                              key={room.id}
                              style={[
                                styles.selectionButton,
                                {
                                  backgroundColor: formData.roomId === room.id
                                    ? colors.primary
                                    : colors.backgroundSecondary,
                                }
                              ]}
                              onPress={() => {
                                updateFormData('roomId', room.id);
                                // Reset place and container when room changes
                                updateFormData('placeId', undefined);
                                updateFormData('containerId', undefined);
                              }}
                            >
                              <ThemedText style={[
                                styles.selectionButtonText,
                                {
                                  color: formData.roomId === room.id
                                    ? '#FFFFFF'
                                    : colors.text
                                }
                              ]}>
                                {room.name}
                              </ThemedText>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Place Selection */}
                    {formData.roomId && (
                      <View style={styles.inputGroup}>
                        <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                          Place *
                        </ThemedText>
                        {getAvailablePlaces().length === 0 ? (
                          <ThemedText style={[styles.placeholderText, { color: colors.textSecondary }]}>
                            No places available for this room. Please create a place first.
                          </ThemedText>
                        ) : (
                          <View style={styles.selectionGrid}>
                            {getAvailablePlaces().map((place) => (
                              <TouchableOpacity
                                key={place.id}
                                style={[
                                  styles.selectionButton,
                                  {
                                    backgroundColor: formData.placeId === place.id
                                      ? colors.primary
                                      : colors.backgroundSecondary,
                                  }
                                ]}
                                onPress={() => {
                                  updateFormData('placeId', place.id);
                                  // Reset container when place changes
                                  updateFormData('containerId', undefined);
                                }}
                              >
                                <ThemedText style={[
                                  styles.selectionButtonText,
                                  {
                                    color: formData.placeId === place.id
                                      ? '#FFFFFF'
                                      : colors.text
                                  }
                                ]}>
                                  {place.name}
                                </ThemedText>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    )}

                    {/* Container Selection (Optional) */}
                    {formData.placeId && getAvailableContainers().length > 0 && (
                      <View style={styles.inputGroup}>
                        <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                          Container (Optional)
                        </ThemedText>
                        <View style={styles.selectionGrid}>
                          <TouchableOpacity
                            style={[
                              styles.selectionButton,
                              {
                                backgroundColor: !formData.containerId
                                  ? colors.primary
                                  : colors.backgroundSecondary,
                              }
                            ]}
                            onPress={() => updateFormData('containerId', undefined)}
                          >
                            <ThemedText style={[
                              styles.selectionButtonText,
                              {
                                color: !formData.containerId
                                  ? '#FFFFFF'
                                  : colors.text
                              }
                            ]}>
                              None
                            </ThemedText>
                          </TouchableOpacity>
                          {getAvailableContainers().map((container) => (
                            <TouchableOpacity
                              key={container.id}
                              style={[
                                styles.selectionButton,
                                {
                                  backgroundColor: formData.containerId === container.id
                                    ? colors.primary
                                    : colors.backgroundSecondary,
                                }
                              ]}
                              onPress={() => updateFormData('containerId', container.id)}
                            >
                              <ThemedText style={[
                                styles.selectionButtonText,
                                {
                                  color: formData.containerId === container.id
                                    ? '#FFFFFF'
                                    : colors.text
                                }
                              ]}>
                                {container.name}
                              </ThemedText>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            {/* Step 2: Additional Details */}
            {currentStep === 2 && (
              <View style={styles.stepContent}>
                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Select Tags (Optional)
                  </ThemedText>
                  {dataLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Loading tags...
                      </ThemedText>
                    </View>
                  ) : tags.length === 0 ? (
                    <ThemedText style={[styles.placeholderText, { color: colors.textSecondary }]}>
                      No tags available. You can create tags in the settings.
                    </ThemedText>
                  ) : (
                    <View style={styles.selectionGrid}>
                      {tags.map((tag) => (
                        <TouchableOpacity
                          key={tag.id}
                          style={[
                            styles.selectionButton,
                            {
                              backgroundColor: formData.tagIds.includes(tag.id)
                                ? colors.primary
                                : colors.backgroundSecondary,
                            }
                          ]}
                          onPress={() => toggleTag(tag.id)}
                        >
                          <ThemedText style={[
                            styles.selectionButtonText,
                            {
                              color: formData.tagIds.includes(tag.id)
                                ? '#FFFFFF'
                                : colors.text
                            }
                          ]}>
                            {tag.name}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {formData.tagIds.length > 0 && (
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Selected Tags
                    </ThemedText>
                    <View style={styles.tagsDisplay}>
                      {formData.tagIds.map((tagId) => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? (
                          <View key={tagId} style={[styles.tagChip, { backgroundColor: colors.primary }]}>
                            <ThemedText style={styles.tagChipText}>
                              {tag.name}
                            </ThemedText>
                          </View>
                        ) : null;
                      })}
                    </View>
                  </View>
                )}

                {/* Price Field */}
                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Price (Optional)
                  </ThemedText>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.text,
                      borderColor: colors.backgroundSecondary,
                    }]}
                    placeholder="Enter price"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.price?.toString() || ''}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9.]/g, '');
                      if (numericValue === '') {
                        updateFormData('price', undefined);
                      } else {
                        const price = parseFloat(numericValue);
                        updateFormData('price', isNaN(price) ? undefined : price);
                      }
                    }}
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                  />
                </View>

                {/* Item Link Field */}
                <View style={styles.inputGroup}>
                  <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Item Link (Optional)
                  </ThemedText>
                  <TextInput
                    style={[styles.input, {
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.text,
                      borderColor: colors.backgroundSecondary,
                    }]}
                    placeholder="Enter item link or reference"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.itemLink || ''}
                    onChangeText={(text) => updateFormData('itemLink', text)}
                    keyboardType="url"
                    returnKeyType="done"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <View style={styles.stepContent}>
                <View style={[styles.confirmationCard, { backgroundColor: colors.card }]}>
                  <ThemedText type="defaultSemiBold" style={[styles.confirmationTitle, { color: colors.text }]}>
                    Summary
                  </ThemedText>

                  <View style={styles.confirmationRow}>
                    <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                      Name:
                    </ThemedText>
                    <ThemedText style={[styles.confirmationValue, { color: colors.text }]}>
                      {formData.name}
                    </ThemedText>
                  </View>

                  <View style={styles.confirmationRow}>
                    <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                      Quantity:
                    </ThemedText>
                    <ThemedText style={[styles.confirmationValue, { color: colors.text }]}>
                      {formData.quantity}
                    </ThemedText>
                  </View>

                  <View style={styles.confirmationRow}>
                    <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                      Status:
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
                      {formData.consumable ? 'Consumable' : 'Non-consumable'}
                    </ThemedText>
                  </View>

                  <View style={styles.confirmationRow}>
                    <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                      Room:
                    </ThemedText>
                    <ThemedText style={[styles.confirmationValue, { color: colors.text }]}>
                      {rooms.find(r => r.id === formData.roomId)?.name || 'Not selected'}
                    </ThemedText>
                  </View>

                  <View style={styles.confirmationRow}>
                    <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                      Place:
                    </ThemedText>
                    <ThemedText style={[styles.confirmationValue, { color: colors.text }]}>
                      {places.find(p => p.id === formData.placeId)?.name || 'Not selected'}
                    </ThemedText>
                  </View>

                  {formData.containerId && (
                    <View style={styles.confirmationRow}>
                      <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                        Container:
                      </ThemedText>
                      <ThemedText style={[styles.confirmationValue, { color: colors.text }]}>
                        {containers.find(c => c.id === formData.containerId)?.name || 'None'}
                      </ThemedText>
                    </View>
                  )}

                  {formData.price && (
                    <View style={styles.confirmationRow}>
                      <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                        Price:
                      </ThemedText>
                      <ThemedText style={[styles.confirmationValue, { color: colors.text }]}>
                        ${formData.price.toFixed(2)}
                      </ThemedText>
                    </View>
                  )}

                  {formData.itemLink && (
                    <View style={styles.confirmationRow}>
                      <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                        Link:
                      </ThemedText>
                      <ThemedText 
                        style={[styles.confirmationValue, { color: colors.primary }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {formData.itemLink}
                      </ThemedText>
                    </View>
                  )}

                  {formData.tagIds.length > 0 && (
                    <View style={styles.confirmationRow}>
                      <ThemedText style={[styles.confirmationLabel, { color: colors.textSecondary }]}>
                        Tags:
                      </ThemedText>
                      <ThemedText style={[styles.confirmationValue, { color: colors.text }]}>
                        {formData.tagIds.map(tagId => tags.find(t => t.id === tagId)?.name).filter(Boolean).join(', ') || 'None'}
                      </ThemedText>
                    </View>
                  )}
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
                  Previous
                </ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                {
                  backgroundColor: (canProceedToNextStep() && !isSubmitting) ? colors.primary : colors.backgroundSecondary,
                  flex: currentStep === 0 ? 1 : 0.6
                }
              ]}
              onPress={currentStep === ADD_ITEM_STEPS.length - 1 ? handleSubmit : nextStep}
              disabled={!canProceedToNextStep() || isSubmitting}
            >
              {isSubmitting && currentStep === ADD_ITEM_STEPS.length - 1 ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <ThemedText style={[
                  styles.primaryButtonText,
                  { color: (canProceedToNextStep() && !isSubmitting) ? '#FFFFFF' : colors.textSecondary }
                ]}>
                  {currentStep === ADD_ITEM_STEPS.length - 1 ? 'Add' : 'Next'}
                </ThemedText>
              )}
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  selectionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
