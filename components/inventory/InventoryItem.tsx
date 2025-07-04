import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ItemWithLocation } from '../../types/inventory';
import { hasActiveAlerts, hasAnyAlerts } from '../../utils/inventory/alerts';
import { getStatusColor, getStatusText } from '../../utils/inventory/filters';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';

interface InventoryItemProps {
  item: ItemWithLocation;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onPress?: () => void;
  onLongPress?: (item: ItemWithLocation, position: { x: number; y: number }) => void;
  onToggleFavorite?: (itemId: number) => Promise<void>;
  onCreateAlert?: (itemId: number) => void;
  onViewAlerts?: (itemId: number) => void;
  onEdit?: (item: ItemWithLocation) => void;
  onDelete?: (itemId: number) => void;
}

export function InventoryItem({
  item,
  isSelected = false,
  isSelectionMode = false,
  onPress,
  onLongPress,
  onToggleFavorite,
  onCreateAlert,
  onViewAlerts,
  onEdit,
  onDelete,
}: InventoryItemProps) {
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');
  const warningColor = useThemeColor({}, 'warning');
  const backgroundSecondaryColor = useThemeColor({}, 'backgroundSecondary');

  const hasTriggeredAlerts = hasActiveAlerts(item);
  const hasConfiguredAlerts = hasAnyAlerts(item);

  const handleLongPress = (event: any) => {
    if (!isSelectionMode && onLongPress) {
      // Add haptic feedback for long press
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { pageX, pageY } = event.nativeEvent;
      onLongPress(item, { x: pageX, y: pageY });
    }
  };

  const handleFavoriteToggle = async () => {
    if (favoriteLoading || !onToggleFavorite) return;

    try {
      setFavoriteLoading(true);
      // Add haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await onToggleFavorite(item.id);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAlertPress = () => {
    // Add haptic feedback for alert actions
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (hasConfiguredAlerts) {
      // If item has configured alerts, show alerts modal to view/manage them
      onViewAlerts?.(item.id);
    } else {
      // If no alerts configured, open create alert modal
      onCreateAlert?.(item.id);
    }
  };

  const renderItemContent = () => (
    <TouchableOpacity
      style={[
        styles.itemCard,
        { backgroundColor },
        isSelectionMode && isSelected && {
          borderColor: primaryColor,
          borderWidth: 2
        }
      ]}
      onPress={onPress}
      onLongPress={handleLongPress}
    >
      {isSelectionMode && (
        <View style={styles.checkboxContainer}>
          <View style={[
            styles.checkbox,
            {
              backgroundColor: isSelected ? primaryColor : 'transparent',
              borderColor: isSelected ? primaryColor : textSecondaryColor
            }
          ]}>
            {isSelected && (
              <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
            )}
          </View>
        </View>
      )}

      <View style={[styles.itemContent, isSelectionMode && styles.itemContentWithCheckbox]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <View style={styles.nameAndAlerts}>
              <ThemedText type="defaultSemiBold" style={[styles.itemName, { color: textColor }]}>
                {item.name}
              </ThemedText>
              {hasTriggeredAlerts && (
                <View style={[styles.alertIndicator, { backgroundColor: warningColor }]}>
                  <IconSymbol name="exclamationmark" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
            <ThemedText style={[styles.itemLocation, { color: textSecondaryColor }]}>
              {item.location}
            </ThemedText>
          </View>
          {!isSelectionMode && (
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={handleAlertPress}
              >
                <IconSymbol
                  name={hasConfiguredAlerts ? "bell.fill" : "bell"}
                  size={18}
                  color={hasTriggeredAlerts ? warningColor : hasConfiguredAlerts ? primaryColor : textSecondaryColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={handleFavoriteToggle}
                disabled={favoriteLoading}
              >
                {favoriteLoading ? (
                  <ActivityIndicator size={20} color={textSecondaryColor} />
                ) : (
                  <IconSymbol
                    name={item.isFavorite ? "heart.fill" : "heart"}
                    size={20}
                    color={item.isFavorite ? errorColor : textSecondaryColor}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.quantityContainer}>
            <ThemedText style={[styles.quantityLabel, { color: textSecondaryColor }]}>
              Quantity:
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={[styles.quantity, { color: textColor }]}>
              {item.quantity}
            </ThemedText>
          </View>

          <View style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}20` }
          ]}>
            <ThemedText style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}>
              {getStatusText(item.status)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          {item.tags.map((tag) => (
            <View
              key={tag.id}
              style={[styles.tag, { backgroundColor: backgroundSecondaryColor }]}
            >
              <ThemedText style={[styles.tagText, { color: textSecondaryColor }]}>
                {tag.name}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return renderItemContent();
}

const styles = StyleSheet.create({
  itemCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemContent: {
    flex: 1,
  },
  itemContentWithCheckbox: {
    paddingLeft: 40,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  nameAndAlerts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 4,
  },
  alertIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLocation: {
    fontSize: 12,
    lineHeight: 16,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertButton: {
    padding: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityLabel: {
    fontSize: 14,
  },
  quantity: {
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
