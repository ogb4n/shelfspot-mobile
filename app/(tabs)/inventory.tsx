import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  location: string;
  status: 'available' | 'running_low' | 'out_of_stock' | 'expired';
  image?: string;
  tags: string[];
  isFavorite: boolean;
}

export default function InventoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data
  const inventoryItems: InventoryItem[] = [
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
      name: 'Piles AA',
      quantity: 8,
      location: 'Bureau → Tiroir → Compartiment électronique',
      status: 'available',
      tags: ['électronique', 'utile'],
      isFavorite: true,
    },
  ];

  const filters = [
    { key: 'all', label: 'Tous', icon: 'square.grid.2x2' },
    { key: 'available', label: 'Disponible', icon: 'checkmark.circle' },
    { key: 'running_low', label: 'Stock faible', icon: 'exclamationmark.triangle' },
    { key: 'out_of_stock', label: 'Épuisé', icon: 'xmark.circle' },
    { key: 'favorites', label: 'Favoris', icon: 'heart' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return colors.success;
      case 'running_low': return colors.warning;
      case 'out_of_stock': return colors.error;
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

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity style={[styles.itemCard, { backgroundColor: colors.card }]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <ThemedText type="defaultSemiBold" style={[styles.itemName, { color: colors.text }]}>
            {item.name}
          </ThemedText>
          <ThemedText style={[styles.itemLocation, { color: colors.textSecondary }]}>
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
      
      <View style={styles.itemDetails}>
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

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          Inventaire
        </ThemedText>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <IconSymbol name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Rechercher un objet..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity>
          <IconSymbol name="slider.horizontal.3" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedFilter === filter.key ? colors.primary : colors.backgroundSecondary,
              }
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <IconSymbol 
              name={filter.icon} 
              size={16} 
              color={selectedFilter === filter.key ? '#FFFFFF' : colors.textSecondary} 
            />
            <ThemedText style={[
              styles.filterText,
              { color: selectedFilter === filter.key ? '#FFFFFF' : colors.textSecondary }
            ]}>
              {filter.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Inventory List */}
      <FlatList
        data={inventoryItems}
        renderItem={renderInventoryItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]}>
        <IconSymbol name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
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
    lineHeight: 16,
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
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
