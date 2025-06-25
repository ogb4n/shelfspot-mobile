import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  Keyboard,
  StatusBar,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SearchResult {
  id: string;
  name: string;
  quantity: number;
  location: string;
  status: 'available' | 'running_low' | 'out_of_stock' | 'expired';
  tags: string[];
  isFavorite: boolean;
}

export default function SearchScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in a real app, this would come from your search API
  const allItems: SearchResult[] = React.useMemo(() => [
    {
      id: '1',
      name: 'Dentifrice Colgate',
      quantity: 2,
      location: 'Salle de bain → Armoire → Étagère du haut',
      status: 'running_low',
      tags: ['hygiène', 'consommable'],
      isFavorite: false,
    },
    {
      id: '2',
      name: 'Yaourts nature',
      quantity: 0,
      location: 'Cuisine → Réfrigérateur → Étagère du milieu',
      status: 'out_of_stock',
      tags: ['nourriture', 'périssable'],
      isFavorite: true,
    },
    {
      id: '3',
      name: 'Aspirine',
      quantity: 15,
      location: 'Chambre → Table de chevet → Tiroir',
      status: 'available',
      tags: ['médicament', 'santé'],
      isFavorite: false,
    },
    {
      id: '4',
      name: 'Piles AA',
      quantity: 8,
      location: 'Bureau → Tiroir',
      status: 'available',
      tags: ['électronique', 'utile'],
      isFavorite: true,
    },
    {
      id: '5',
      name: 'Café en grains',
      quantity: 1,
      location: 'Cuisine → Placard → Étagère du haut',
      status: 'running_low',
      tags: ['boisson', 'consommable'],
      isFavorite: false,
    },
  ], []);

  // Search function
  const searchItems = React.useCallback((query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const filteredItems = allItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.location.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      
      setResults(filteredItems);
      setIsLoading(false);
    }, 300);
  }, [allItems]);

  // Handle search query changes
  useEffect(() => {
    searchItems(searchQuery);
  }, [searchQuery, searchItems]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return colors.success || '#22C55E';
      case 'running_low': return colors.warning || '#F59E0B';
      case 'out_of_stock': return colors.error || '#EF4444';
      case 'expired': return '#805AD5';
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'running_low': return 'Stock faible';
      case 'out_of_stock': return 'Épuisé';
      case 'expired': return 'Expiré';
      default: return status;
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity 
      style={[styles.resultCard, { backgroundColor: colors.card }]}
      activeOpacity={0.7}
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
            Quantité:
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
              {tag}
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
            Aucun résultat trouvé
          </ThemedText>
          <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Essayez avec d&apos;autres mots-clés ou vérifiez l&apos;orthographe.
          </ThemedText>
        </>
      ) : (
        <>
          <IconSymbol name="magnifyingglass.circle" size={64} color={colors.textSecondary} />
          <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
            Rechercher dans votre inventaire
          </ThemedText>
          <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Tapez le nom d&apos;un objet, un lieu ou un tag pour commencer.
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
            placeholder="Rechercher un objet, lieu, tag..."
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
            Annuler
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
        {results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
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
