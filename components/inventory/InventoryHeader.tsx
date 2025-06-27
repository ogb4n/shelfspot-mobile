import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';
import { useThemeColor } from '../../hooks/useThemeColor';

interface InventoryHeaderProps {
  isSelectionMode: boolean;
  selectedItemsCount: number;
  totalTriggeredAlerts: number;
  onToggleSelectionMode: () => void;
  onOpenAlertsModal: () => void;
  onOpenAddModal: () => void;
  onSelectAll?: () => void;
  onDeleteSelected?: () => void;
}

export function InventoryHeader({
  isSelectionMode,
  selectedItemsCount,
  totalTriggeredAlerts,
  onToggleSelectionMode,
  onOpenAlertsModal,
  onOpenAddModal,
  onSelectAll,
  onDeleteSelected,
}: InventoryHeaderProps) {
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');
  const backgroundSecondaryColor = useThemeColor({}, 'backgroundSecondary');

  if (isSelectionMode) {
    return (
      <View style={styles.header}>
        <View style={styles.selectionHeader}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={onToggleSelectionMode}
          >
            <IconSymbol name="xmark" size={24} color={textSecondaryColor} />
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" style={[styles.selectionTitle, { color: textColor }]}>
            {selectedItemsCount} sélectionné{selectedItemsCount > 1 ? 's' : ''}
          </ThemedText>
          <TouchableOpacity 
            style={styles.selectAllButton} 
            onPress={onSelectAll}
          >
            <ThemedText style={[styles.selectAllText, { color: primaryColor }]}>
              Tout sélectionner
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        {selectedItemsCount > 0 && (
          <View style={styles.deleteButtonContainer}>
            <TouchableOpacity 
              style={[styles.deleteButton, { backgroundColor: errorColor }]}
              onPress={onDeleteSelected}
            >
              <IconSymbol name="trash" size={20} color="#FFFFFF" />
              <ThemedText style={styles.deleteButtonText}>
                Supprimer ({selectedItemsCount})
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <ThemedText type="title" style={[styles.title, { color: textColor }]}>
        Inventaire
      </ThemedText>
      <View style={styles.headerButtons}>
        <TouchableOpacity 
          style={[styles.headerButton, { backgroundColor: backgroundSecondaryColor }]}
          onPress={onOpenAlertsModal}
        >
          <IconSymbol name="bell" size={20} color={textSecondaryColor} />
          {totalTriggeredAlerts > 0 && (
            <View style={[styles.alertBadge, { backgroundColor: errorColor }]}>
              <ThemedText style={styles.alertBadgeText}>
                {totalTriggeredAlerts}
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.headerButton, { backgroundColor: backgroundSecondaryColor }]}
          onPress={onToggleSelectionMode}
        >
          <IconSymbol name="checkmark.circle" size={20} color={textSecondaryColor} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: primaryColor }]}
          onPress={onOpenAddModal}
        >
          <IconSymbol name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 8,
  },
  selectionTitle: {
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  selectAllButton: {
    padding: 8,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButtonContainer: {
    marginTop: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
    position: 'absolute',
    right: 20,
    top: 60,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
