import { AddItemModal } from '@/components/inventory/AddItemModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useFavorites, useInventoryAlerts, useInventoryData, useInventoryItems } from '@/hooks/inventory';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface RecentAlert {
  id: string;
  itemId: number;
  message: string;
  time: string;
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const { items, loading: itemsLoading, addItem } = useInventoryItems();
  const { favoriteItems, loading: favoritesLoading } = useFavorites();
  const { rooms, places, loading: dataLoading } = useInventoryData();
  const { triggeredAlerts, loading: alertsLoading, loadAlerts } = useInventoryAlerts(items);

  const loading = itemsLoading || favoritesLoading || dataLoading || alertsLoading;

  // Add item modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Load alerts when items are available
  useEffect(() => {
    if (items.length > 0) {
      loadAlerts();
    }
  }, [items.length]); // Only trigger when items length changes

  // Calculate real stats from data
  const stats = {
    totalItems: items.length,
    totalRooms: rooms.length,
    totalPlaces: places.length,
    lowStockItems: items.filter(item => item.quantity <= 5).length, // Assuming 5 is low stock threshold
    favoriteItems: favoriteItems.length,
  };

  const quickActions = [
    {
      icon: 'plus.circle.fill' as const,
      title: 'Add Item',
      color: colors.primary,
      onPress: () => setShowAddModal(true)
    },
    {
      icon: 'cube.box.fill' as const,
      title: 'Consumables',
      color: colors.secondary,
      onPress: () => router.push('/consumables' as any)
    },
    {
      icon: 'magnifyingglass' as const,
      title: 'Search',
      color: colors.info,
      onPress: () => router.push('/search')
    },
    {
      icon: 'heart.fill' as const,
      title: 'Favorites',
      color: colors.error,
      onPress: () => router.push('/favorites' as any)
    },
  ];

  const formatAlertTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Get recent alerts from triggered alerts (limit to 3 most recent)
  const recentAlerts: RecentAlert[] = triggeredAlerts.slice(0, 3).map((triggeredAlert, index) => ({
    id: `${triggeredAlert.alert.id}-${index}`,
    itemId: triggeredAlert.item.id,
    message: `Low stock: ${triggeredAlert.item.name}`,
    time: triggeredAlert.alert.lastSent ? formatAlertTime(triggeredAlert.alert.lastSent) : 'New',
  }));

  // Add item modal handlers
  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleAddItem = async (itemData: any) => {
    try {
      await addItem(itemData);
      // Optional: Show success message or perform additional actions
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title" style={[styles.welcomeText, { color: colors.text }]}>
              Hello! 👋
            </ThemedText>
            <ThemedText style={[styles.subtitleText, { color: colors.textSecondary }]}>
              Manage your inventory easily
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => router.push('/settings')}
          >
            <IconSymbol name="person.circle.fill" size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={[styles.section, { alignItems: 'center', paddingVertical: 40 }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={[{ color: colors.textSecondary, marginTop: 16 }]}>
              Loading dashboard...
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <TouchableOpacity
                style={[styles.statsCard, { backgroundColor: colors.card }]}
                onPress={() => router.push('/inventory')}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                  <IconSymbol name="cube.fill" size={24} color={colors.primary} />
                </View>
                <View style={styles.statsContent}>
                  <ThemedText type="subtitle" style={[styles.statsNumber, { color: colors.primary }]}>
                    {stats.totalItems}
                  </ThemedText>
                  <ThemedText style={[styles.statsLabel, { color: colors.textSecondary }]}>
                    Total Items
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statsCard, { backgroundColor: colors.card }]}
                onPress={() => router.push('/inventory' as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${colors.secondary}20` }]}>
                  <IconSymbol name="house.fill" size={24} color={colors.secondary} />
                </View>
                <View style={styles.statsContent}>
                  <ThemedText type="subtitle" style={[styles.statsNumber, { color: colors.secondary }]}>
                    {stats.totalRooms}
                  </ThemedText>
                  <ThemedText style={[styles.statsLabel, { color: colors.textSecondary }]}>
                    Rooms
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statsCard, { backgroundColor: colors.card }]}
                onPress={() => router.push('/consumables' as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${colors.warning}20` }]}>
                  <IconSymbol name="cube.box.fill" size={24} color={colors.warning} />
                </View>
                <View style={styles.statsContent}>
                  <ThemedText type="subtitle" style={[styles.statsNumber, { color: colors.warning }]}>
                    {stats.totalPlaces}
                  </ThemedText>
                  <ThemedText style={[styles.statsLabel, { color: colors.textSecondary }]}>
                    Places
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statsCard, { backgroundColor: colors.card }]}
                onPress={() => router.push('/inventory' as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${colors.secondary}20` }]}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={24} color={colors.secondary} />
                </View>
                <View style={styles.statsContent}>
                  <ThemedText type="subtitle" style={[styles.statsNumber, { color: colors.secondary }]}>
                    {stats.lowStockItems}
                  </ThemedText>
                  <ThemedText style={[styles.statsLabel, { color: colors.textSecondary }]}>
                    Low Stock
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statsCard, { backgroundColor: colors.card }]}
                onPress={() => router.push('/favorites' as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${colors.error}20` }]}>
                  <IconSymbol name="heart.fill" size={24} color={colors.error} />
                </View>
                <View style={styles.statsContent}>
                  <ThemedText type="subtitle" style={[styles.statsNumber, { color: colors.error }]}>
                    {stats.favoriteItems}
                  </ThemedText>
                  <ThemedText style={[styles.statsLabel, { color: colors.textSecondary }]}>
                    Favorites
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
                Quick Actions
              </ThemedText>
              <View style={styles.quickActionsGrid}>
                {quickActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.quickActionCard, { backgroundColor: colors.card }]}
                    activeOpacity={0.7}
                    onPress={action.onPress}
                  >
                    <IconSymbol name={action.icon} size={28} color={action.color} />
                    <ThemedText style={[styles.quickActionText, { color: colors.text }]}>
                      {action.title}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Alerts */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Alerts
              </ThemedText>
              <View style={[styles.alertsContainer, { backgroundColor: colors.card }]}>
                {recentAlerts.length > 0 ? (
                  <>
                    {recentAlerts.map((alert) => (
                      <TouchableOpacity
                        key={alert.id}
                        style={[styles.alertItem, { borderBottomColor: colors.border }]}
                        onPress={() => router.push(`/item/${alert.itemId}`)}
                      >
                        <IconSymbol name="bell.fill" size={20} color={colors.warning} />
                        <View style={styles.alertContent}>
                          <ThemedText style={[styles.alertMessage, { color: colors.text }]}>
                            {alert.message}
                          </ThemedText>
                          <ThemedText style={[styles.alertTime, { color: colors.textSecondary }]}>
                            {alert.time}
                          </ThemedText>
                        </View>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => router.push('/alerts')}
                    >
                      <ThemedText style={[styles.viewAllText, { color: colors.primary }]}>
                        View All Alerts
                      </ThemedText>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.alertItem}>
                    <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                    <View style={styles.alertContent}>
                      <ThemedText style={[styles.alertMessage, { color: colors.text }]}>
                        No alerts at the moment
                      </ThemedText>
                      <ThemedText style={[styles.alertTime, { color: colors.textSecondary }]}>
                        All good!
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Action Button for Search */}
      <TouchableOpacity
        style={[styles.searchFab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/search')}
        activeOpacity={0.8}
      >
        <IconSymbol name="magnifyingglass" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Item Modal */}
      <AddItemModal
        visible={showAddModal}
        onClose={handleCloseAddModal}
        onAddItem={handleAddItem}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Space for tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContent: {
    flex: 1,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  alertsContainer: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
  },
  viewAllButton: {
    paddingTop: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchFab: {
    position: 'absolute',
    right: 20,
    bottom: 100, // Above tab bar
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
