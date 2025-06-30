import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useFavorites } from '@/hooks/inventory';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ItemWithLocation } from '@/types/inventory';
import { getStatusColor, getStatusText } from '@/utils/inventory/filters';
import { router } from 'expo-router';
import { Alert, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function FavoritesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Use favorites hook instead of mock data
  const { favoriteItems, loading, error, removeFromFavorites } = useFavorites();

  const handleRemoveFromFavorites = (itemId: number, itemName: string) => {
    Alert.alert(
      'Remove from Favorites',
      `Are you sure you want to remove "${itemName}" from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromFavorites(itemId),
        },
      ]
    );
  };

  const renderFavoriteItem = ({ item }: { item: ItemWithLocation }) => (
    <TouchableOpacity
      style={[styles.itemCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <ThemedText type="defaultSemiBold" style={[styles.itemName, { color: colors.text }]}>
            {item.name}
          </ThemedText>
          <ThemedText style={[styles.itemLocation, { color: colors.textSecondary }]}>
            {item.location}
          </ThemedText>
          <ThemedText style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            Updated {new Date(item.updatedAt || '').toLocaleDateString()}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleRemoveFromFavorites(item.id, item.name)}
        >
          <IconSymbol name="heart.fill" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.itemDetails}>
        <View style={styles.quantityContainer}>
          <ThemedText style={[styles.quantityLabel, { color: colors.textSecondary }]}>
            Quantity:
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={[styles.quantity, { color: colors.text }]}>
            {item.quantity}
          </ThemedText>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="pencil" size={16} color={colors.primary} />
          <ThemedText style={[styles.actionText, { color: colors.primary }]}>
            Edit
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="eye" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.actionText, { color: colors.textSecondary }]}>
            View
          </ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="heart" size={64} color={colors.textSecondary} />
      <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
        No Favorites
      </ThemedText>
      <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Add items to your favorites to find them quickly here.
      </ThemedText>
      <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]}>
        <ThemedText style={[styles.emptyButtonText, { color: '#FFFFFF' }]}>
          Explore Inventory
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          Favorites
        </ThemedText>
        <View style={styles.headerStats}>
          <ThemedText style={[styles.statsText, { color: colors.textSecondary }]}>
            {favoriteItems.length} item{favoriteItems.length > 1 ? 's' : ''}
          </ThemedText>
        </View>
      </View>

      {/* Quick Actions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickActions}
        contentContainerStyle={styles.quickActionsContent}
      >
        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/inventory')}
        >
          <IconSymbol name="square.grid.2x2" size={16} color="#FFFFFF" />
          <ThemedText style={[styles.quickActionText, { color: '#FFFFFF' }]}>
            All
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: colors.warning }]}
          onPress={() => router.push('/(tabs)/inventory')}
        >
          <IconSymbol name="exclamationmark.triangle" size={16} color="#FFFFFF" />
          <ThemedText style={[styles.quickActionText, { color: '#FFFFFF' }]}>
            Low Stock
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: colors.info }]}
          onPress={() => router.push('/(tabs)/inventory')}
        >
          <IconSymbol name="clock" size={16} color="#FFFFFF" />
          <ThemedText style={[styles.quickActionText, { color: '#FFFFFF' }]}>
            Recent
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Favorites List */}
      {loading ? (
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Loading favorites...
          </ThemedText>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <IconSymbol name="exclamationmark.triangle" size={64} color={colors.error} />
          <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
            Error Loading Favorites
          </ThemedText>
          <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            {error}
          </ThemedText>
        </View>
      ) : favoriteItems.length > 0 ? (
        <FlatList
          data={favoriteItems}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    marginBottom: 16,
    flexGrow: 0,
  },
  quickActionsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    minHeight: 40,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 12,
    marginBottom: 2,
  },
  lastUpdated: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  favoriteButton: {
    padding: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
