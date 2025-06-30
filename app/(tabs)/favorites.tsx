import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SkeletonList } from '@/components/ui/Skeleton';
import { Colors } from '@/constants/Colors';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useInventoryFavorites } from '@/stores/inventory';
import { ItemWithLocation } from '@/types/inventory';
import { getStatusColor, getStatusText } from '@/utils/inventory/filters';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function FavoritesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { showSuccess, showError } = useToast();

  // Use favorites hook instead of mock data
  const { favoriteItems, favoritesLoading, favoritesError, removeFromFavorites } = useInventoryFavorites();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter favorites based on search query
  const filteredFavorites = favoriteItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveFromFavorites = async (itemId: number, itemName: string) => {
    try {
      await removeFromFavorites(itemId);
      showSuccess(`"${itemName}" removed from favorites`);
    } catch {
      showError(`Failed to remove "${itemName}" from favorites`);
    }
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
            {searchQuery.length > 0 ? filteredFavorites.length : favoriteItems.length} item{(searchQuery.length > 0 ? filteredFavorites.length : favoriteItems.length) !== 1 ? 's' : ''}
          </ThemedText>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search favorites..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && (
          <View style={styles.searchResults}>
            <ThemedText style={[styles.searchResultsText, { color: colors.textSecondary }]}>
              {filteredFavorites.length} result{filteredFavorites.length !== 1 ? 's' : ''} found
            </ThemedText>
          </View>
        )}
      </View>

      {/* Favorites List */}
      {favoritesLoading ? (
        <View style={styles.list}>
          <SkeletonList itemCount={4} showTags={false} />
        </View>
      ) : favoritesError ? (
        <View style={styles.emptyState}>
          <IconSymbol name="exclamationmark.triangle" size={64} color={colors.error} />
          <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
            Error Loading Favorites
          </ThemedText>
          <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            {favoritesError}
          </ThemedText>
        </View>
      ) : filteredFavorites.length > 0 ? (
        <FlatList
          data={filteredFavorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : searchQuery.length > 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="magnifyingglass" size={64} color={colors.textSecondary} />
          <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
            No Results Found
          </ThemedText>
          <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            No favorites match &quot;{searchQuery}&quot;. Try a different search term.
          </ThemedText>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => setSearchQuery('')}
          >
            <ThemedText style={[styles.emptyButtonText, { color: colors.primary }]}>
              Clear Search
            </ThemedText>
          </TouchableOpacity>
        </View>
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
  // Search Bar Styles
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  searchResults: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  searchResultsText: {
    fontSize: 12,
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
