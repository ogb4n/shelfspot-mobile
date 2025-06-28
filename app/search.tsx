import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { backendApi } from '@/services/backend-api';
import { useAuthStore } from '@/stores/auth';
import { ItemWithLocation } from '@/types/inventory';
import { transformItemsToItemsWithLocation } from '@/utils/inventory/transforms';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function SearchScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ItemWithLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search function using real API
  const searchItems = React.useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiItems = await backendApi.getItems(query);
      const transformedItems = transformItemsToItemsWithLocation(apiItems, user?.id);
      setResults(transformedItems);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Handle search query changes
  useEffect(() => {
    searchItems(searchQuery);
  }, [searchQuery, searchItems]);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'available': return colors.success || '#22C55E';
      case 'running_low': return colors.warning || '#F59E0B';
      case 'out_of_stock': return colors.error || '#EF4444';
      case 'expired': return '#805AD5';
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'available': return 'Available';
      case 'running_low': return 'Running Low';
      case 'out_of_stock': return 'Out of Stock';
      case 'expired': return 'Expired';
      default: return status || 'Unknown';
    }
  };

  const renderSearchResult = ({ item }: { item: ItemWithLocation }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card }]}
      activeOpacity={0.7}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      <View style={styles.resultHeader}>
        <View style={styles.resultInfo}>
          <ThemedText type="defaultSemiBold" style={[styles.resultName, { color: colors.text }]}>
            {item.name}
          </ThemedText>
          <ThemedText style={[styles.resultLocation, { color: colors.textSecondary }]}>
            {item.location}
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.favoriteButton}>
          <IconSymbol
            name={item.isFavorite ? "heart.fill" : "heart"}
            size={20}
            color={item.isFavorite ? colors.error : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.resultDetails}>
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

      <View style={styles.tagsContainer}>
        {item.tags.map((tag, index) => (
          <View key={index} style={[styles.tag, { backgroundColor: colors.backgroundSecondary }]}>
            <ThemedText style={[styles.tagText, { color: colors.textSecondary }]}>
              {tag.name}
            </ThemedText>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      {searchQuery ? (
        <>
          <IconSymbol name="magnifyingglass" size={64} color={colors.textSecondary} />
          <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
            No results found
          </ThemedText>
          <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Try different keywords or check spelling.
          </ThemedText>
        </>
      ) : (
        <>
          <IconSymbol name="magnifyingglass.circle" size={64} color={colors.textSecondary} />
          <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
            Search your inventory
          </ThemedText>
          <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Type an item name, location or tag to start.
          </ThemedText>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header with Search Bar */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for an item, location, tag..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <ThemedText style={[styles.cancelText, { color: colors.primary }]}>
            Cancel
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      {searchQuery && (
        <View style={styles.resultsHeader}>
          <ThemedText style={[styles.resultsCount, { color: colors.textSecondary }]}>
            {isLoading ? 'Recherche...' : `${results.length} résultat${results.length > 1 ? 's' : ''}`}
          </ThemedText>
        </View>
      )}

      {/* Results List */}
      <View style={styles.content}>
        {error ? (
          <View style={styles.emptyState}>
            <IconSymbol name="exclamationmark.triangle" size={64} color={colors.error} />
            <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
              Search Error
            </ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              {error}
            </ThemedText>
          </View>
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <EmptyState />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  resultCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultInfo: {
    flex: 1,
    marginRight: 12,
  },
  resultName: {
    fontSize: 16,
    marginBottom: 4,
  },
  resultLocation: {
    fontSize: 14,
  },
  favoriteButton: {
    padding: 4,
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quantityLabel: {
    fontSize: 14,
  },
  quantity: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
