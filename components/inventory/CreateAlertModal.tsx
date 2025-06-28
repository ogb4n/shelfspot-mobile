import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { DEFAULT_ALERT_THRESHOLD } from '../../constants/inventory';
import { useThemeColor } from '../../hooks/useThemeColor';
import { AlertFormData } from '../../types/inventory';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from '../ui/IconSymbol';

interface CreateAlertModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateAlert: (alertData: AlertFormData) => void;
  itemId: number | null;
  itemName?: string;
}

export function CreateAlertModal({
  visible,
  onClose,
  onCreateAlert,
  itemId,
  itemName
}: CreateAlertModalProps) {
  const [formData, setFormData] = useState<AlertFormData>({
    itemId: itemId || 0,
    threshold: DEFAULT_ALERT_THRESHOLD,
    name: '',
    isActive: true,
  });

  const colors = {
    card: useThemeColor({}, 'card'),
    text: useThemeColor({}, 'text'),
    textSecondary: useThemeColor({}, 'textSecondary'),
    primary: useThemeColor({}, 'primary'),
    backgroundSecondary: useThemeColor({}, 'backgroundSecondary'),
    background: useThemeColor({}, 'background'),
    error: useThemeColor({}, 'error'),
  };

  // Update form data when itemId changes
  React.useEffect(() => {
    if (itemId) {
      setFormData(prev => ({
        ...prev,
        itemId,
        name: '', // User must provide their own name
      }));
    }
  }, [itemId, itemName]);

  const updateFormData = (field: keyof AlertFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canCreateAlert = () => {
    return formData.itemId > 0 &&
      formData.threshold > 0 &&
      (formData.name?.trim() || '') !== '';
  };

  const handleSubmit = () => {
    if (!canCreateAlert()) return;

    onCreateAlert(formData);
    handleClose();
    Alert.alert('Success', 'The alert has been created!');
  };

  const handleClose = () => {
    setFormData({
      itemId: 0,
      threshold: DEFAULT_ALERT_THRESHOLD,
      name: '',
      isActive: true,
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
            Create Alert
          </ThemedText>
          <View style={styles.headerSpace} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          <View style={styles.formContainer}>
            {/* Item Info */}
            {itemName && (
              <View style={[styles.itemInfo, { backgroundColor: colors.backgroundSecondary }]}>
                <IconSymbol name="cube.box" size={20} color={colors.primary} />
                <ThemedText style={[styles.itemName, { color: colors.text }]}>
                  {itemName}
                </ThemedText>
              </View>
            )}

            {/* Alert Name */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Alert Name *
              </ThemedText>
              <TextInput
                style={[styles.input, {
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text,
                  borderColor: colors.backgroundSecondary
                }]}
                placeholder="E.g.: Stock running low"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
              />
            </View>

            {/* Threshold */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Alert Threshold *
              </ThemedText>
              <View style={styles.thresholdContainer}>
                <TouchableOpacity
                  style={[styles.thresholdButton, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => updateFormData('threshold', Math.max(1, formData.threshold - 1))}
                >
                  <IconSymbol name="minus" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.thresholdInput, {
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderColor: colors.backgroundSecondary
                  }]}
                  value={formData.threshold.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 1;
                    updateFormData('threshold', Math.max(1, num));
                  }}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[styles.thresholdButton, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => updateFormData('threshold', formData.threshold + 1)}
                >
                  <IconSymbol name="plus" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ThemedText style={[styles.thresholdHelp, { color: colors.textSecondary }]}>
                The alert will trigger when quantity is equal or below {formData.threshold}
              </ThemedText>
            </View>

            {/* Active Status */}
            <TouchableOpacity
              style={styles.activeToggle}
              onPress={() => updateFormData('isActive', !formData.isActive)}
            >
              <IconSymbol
                name={formData.isActive ? "checkmark.square" : "square"}
                size={24}
                color={formData.isActive ? colors.primary : colors.textSecondary}
              />
              <View style={styles.activeToggleText}>
                <ThemedText style={[styles.activeLabel, { color: colors.text }]}>
                  Active Alert
                </ThemedText>
                <ThemedText style={[styles.activeDescription, { color: colors.textSecondary }]}>
                  The alert will be checked automatically
                </ThemedText>
              </View>
            </TouchableOpacity>

            {/* Info Card */}
            <View style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary }]}>
              <IconSymbol name="info.circle" size={20} color={colors.primary} />
              <View style={styles.infoText}>
                <ThemedText style={[styles.infoTitle, { color: colors.text }]}>
                  How does it work?
                </ThemedText>
                <ThemedText style={[styles.infoDescription, { color: colors.textSecondary }]}>
                  This alert will automatically check the stock of this item and notify you when the quantity reaches the defined threshold.
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.backgroundSecondary }]}>
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { borderColor: colors.textSecondary }]}
              onPress={handleClose}
            >
              <ThemedText style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                {
                  backgroundColor: canCreateAlert() ? colors.primary : colors.backgroundSecondary,
                }
              ]}
              onPress={handleSubmit}
              disabled={!canCreateAlert()}
            >
              <ThemedText style={[
                styles.primaryButtonText,
                { color: canCreateAlert() ? '#FFFFFF' : colors.textSecondary }
              ]}>
                Create Alert
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
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    gap: 24,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
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
    borderWidth: 1,
  },
  thresholdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thresholdButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thresholdInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    textAlign: 'center',
    minWidth: 80,
    borderWidth: 1,
  },
  thresholdHelp: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  activeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  activeToggleText: {
    flex: 1,
  },
  activeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 12,
    lineHeight: 16,
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
