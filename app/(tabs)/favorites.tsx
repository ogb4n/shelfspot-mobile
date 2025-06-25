import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface FavoriteItem {
  id: string;
  name: string;
  quantity: number;
  location: string;
  status: 'available' | 'running_low' | 'out_of_stock' | 'expired';
  lastUpdated: string;
}

export default function FavoritesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Mock data
  const favoriteItems: FavoriteItem[] = [
    {
      id: '1',
      name: 'Piles AA',
      quantity: 8,
      location: 'Bureau → Tiroir',
      status: 'available',
      lastUpdated: 'Il y a 2 jours',
    },
    {
      id: '2',
      name: 'Yaourts nature',
      quantity: 0,
      location: 'Cuisine → Réfrigérateur',
      status: 'out_of_stock',
      lastUpdated: 'Il y a 1 heure',
    },
    {
      id: '3',
      name: 'Café en grains',
      quantity: 1,
      location: 'Cuisine → Placard',
      status: 'running_low',
      lastUpdated: 'Il y a 3 jours',
    },
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

  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => (
    <TouchableOpacity style={[styles.itemCard, { backgroundColor: colors.card }]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <ThemedText type="defaultSemiBold" style={[styles.itemName, { color: colors.text }]}>
            {item.name}
          </ThemedText>
          <ThemedText style={[styles.itemLocation, { color: colors.textSecondary }]}>
            {item.location}
          </ThemedText>
          <ThemedText style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            Mis à jour {item.lastUpdated}
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.favoriteButton}>
          <IconSymbol name="heart.fill" size={24} color={colors.error} />
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

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="pencil" size={16} color={colors.primary} />
          <ThemedText style={[styles.actionText, { color: colors.primary }]}>
            Modifier
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="eye" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.actionText, { color: colors.textSecondary }]}>
            Voir
          </ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="heart" size={64} color={colors.textSecondary} />
      <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
        Aucun favori
      </ThemedText>
      <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Ajoutez des objets à vos favoris pour les retrouver rapidement ici.
      </ThemedText>
      <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]}>
        <ThemedText style={[styles.emptyButtonText, { color: '#FFFFFF' }]}>
          Explorer l'inventaire
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          Favoris
        </ThemedText>
        <View style={styles.headerStats}>
          <ThemedText style={[styles.statsText, { color: colors.textSecondary }]}>
            {favoriteItems.length} objet{favoriteItems.length > 1 ? 's' : ''}
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
        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.primary }]}>
          <IconSymbol name="square.grid.2x2" size={20} color="#FFFFFF" />
          <ThemedText style={[styles.quickActionText, { color: '#FFFFFF' }]}>
            Voir tout l'inventaire
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.warning }]}>
          <IconSymbol name="exclamationmark.triangle" size={20} color="#FFFFFF" />
          <ThemedText style={[styles.quickActionText, { color: '#FFFFFF' }]}>
            Stock faible uniquement
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.info }]}>
          <IconSymbol name="clock" size={20} color="#FFFFFF" />
          <ThemedText style={[styles.quickActionText, { color: '#FFFFFF' }]}>
            Récemment ajoutés
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Favorites List */}
      {favoriteItems.length > 0 ? (
        <FlatList
          data={favoriteItems}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
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
    marginBottom: 20,
  },
  quickActionsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
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
