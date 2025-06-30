import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { FlatList, ListRenderItem, RefreshControl } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ItemWithLocation } from '../../types/inventory';
import { InventoryItem } from './InventoryItem';

interface RefreshableInventoryListProps {
  data: ItemWithLocation[];
  onRefresh: () => Promise<void>;
  isSelected?: (itemId: number) => boolean;
  isSelectionMode?: boolean;
  onItemPress?: (item: ItemWithLocation) => void;
  onItemLongPress?: (item: ItemWithLocation, position: { x: number; y: number }) => void;
  onToggleFavorite?: (itemId: number) => Promise<void>;
  onCreateAlert?: (itemId: number) => void;
  onViewAlerts?: (itemId: number) => void;
  onEditItem?: (item: ItemWithLocation) => void;
  onDeleteItem?: (itemId: number) => void;
  showsVerticalScrollIndicator?: boolean;
  refreshEnabled?: boolean;
}

export function RefreshableInventoryList({
  data,
  onRefresh,
  isSelected,
  isSelectionMode = false,
  onItemPress,
  onItemLongPress,
  onToggleFavorite,
  onCreateAlert,
  onViewAlerts,
  onEditItem,
  onDeleteItem,
  showsVerticalScrollIndicator = false,
  refreshEnabled = true,
}: RefreshableInventoryListProps) {
  const [refreshing, setRefreshing] = useState(false);
  const primaryColor = useThemeColor({}, 'primary');

  const handleRefresh = useCallback(async () => {
    if (!refreshEnabled || refreshing) return;

    try {
      setRefreshing(true);
      // Add haptic feedback for refresh start
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await onRefresh();
      // Add success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Add error feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, refreshing, refreshEnabled]);

  const renderItem: ListRenderItem<ItemWithLocation> = useCallback(
    ({ item }) => (
      <InventoryItem
        item={item}
        isSelected={isSelected?.(item.id)}
        isSelectionMode={isSelectionMode}
        onPress={() => onItemPress?.(item)}
        onLongPress={onItemLongPress}
        onToggleFavorite={onToggleFavorite}
        onCreateAlert={onCreateAlert}
        onViewAlerts={onViewAlerts}
        onEdit={onEditItem}
        onDelete={onDeleteItem}
      />
    ),
    [
      isSelected,
      isSelectionMode,
      onItemPress,
      onItemLongPress,
      onToggleFavorite,
      onCreateAlert,
      onViewAlerts,
      onEditItem,
      onDeleteItem,
    ]
  );

  const keyExtractor = useCallback((item: ItemWithLocation) => item.id.toString(), []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      refreshControl={
        refreshEnabled ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
            progressBackgroundColor="#ffffff"
          />
        ) : undefined
      }
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={8}
      getItemLayout={(data, index) => ({
        length: 120, // Approximate item height
        offset: 120 * index,
        index,
      })}
      style={{ padding: 12 }}
    />
  );
}
