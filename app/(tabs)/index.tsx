import { AddItemModal } from '@/components/inventory/AddItemModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useInventoryAlerts, useInventoryData, useInventoryFavorites, useInventoryItems } from '@/stores/inventory';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Bar, CartesianChart } from 'victory-native';

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
  const { favoriteItems, favoritesLoading } = useInventoryFavorites();
  const { rooms, places, dataLoading } = useInventoryData();
  const { triggeredAlerts, alertsLoading, loadAlerts } = useInventoryAlerts();

  const loading = itemsLoading || favoritesLoading || dataLoading || alertsLoading;

  // Add item modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Load alerts when items are available
  useEffect(() => {
    if (items.length > 0) {
      loadAlerts();
    }
  }, [items.length, loadAlerts]); // Include loadAlerts dependency

  // Calculate real stats from data
  const stats = {
    totalItems: items.length,
    totalRooms: rooms.length,
    totalPlaces: places.length,
    lowStockItems: items.filter(item => item.quantity <= 5).length, // Assuming 5 is low stock threshold
    favoriteItems: favoriteItems.length,
  };

  // Prepare chart data
  const { width: screenWidth } = Dimensions.get('window');
  const chartWidth = screenWidth - 80; // Account for padding

  // Status distribution data for pie chart
  const statusDistribution = [
    { status: 'Available', count: items.filter(item => item.status === 'available').length, color: colors.primary },
    { status: 'Low Stock', count: items.filter(item => item.status === 'running_low').length, color: colors.warning },
    { status: 'Out of Stock', count: items.filter(item => item.status === 'out_of_stock').length, color: colors.error },
    { status: 'Expired', count: items.filter(item => item.status === 'expired').length, color: colors.textSecondary },
  ].filter(item => item.count > 0);

  // Room distribution data for bar chart
  const roomDistribution = rooms.map(room => ({
    room: room.name.length > 8 ? room.name.substring(0, 8) + '...' : room.name,
    fullName: room.name,
    count: items.filter(item => item.roomId === room.id).length,
  })).filter(item => item.count > 0).slice(0, 6); // Limit to 6 rooms

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
      onPress: () => {
        // Navigate to inventory with consumables filter pre-selected
        router.push('/inventory?filter=consumables');
      }
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
            <IconSymbol name="gearshape.fill" size={32} color={colors.primary} />
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
            {/* Quick Actions - Moved to top */}
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

            {/* Stats Cards - Clean Grid Layout */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
                Overview
              </ThemedText>

              {/* Total Items - Featured Card */}
              <TouchableOpacity
                style={[styles.featuredCard, { backgroundColor: colors.card }]}
                onPress={() => router.push('/inventory')}
                activeOpacity={0.7}
              >
                <View style={[styles.featuredIcon, { backgroundColor: `${colors.primary}20` }]}>
                  <IconSymbol name="cube.fill" size={24} color={colors.primary} />
                </View>
                <View style={styles.featuredContent}>
                  <ThemedText type="title" style={[styles.featuredNumber, { color: colors.primary }]}>
                    {stats.totalItems}
                  </ThemedText>
                  <ThemedText style={[styles.featuredLabel, { color: colors.text }]}>
                    Total Items
                  </ThemedText>
                  <ThemedText style={[styles.featuredDescription, { color: colors.textSecondary }]}>
                    Items in inventory
                  </ThemedText>
                </View>
              </TouchableOpacity>

              {/* Stats Grid - 2x2 Layout */}
              <View style={styles.overviewStatsGrid}>
                <TouchableOpacity
                  style={[styles.statCard, { backgroundColor: colors.card }]}
                  onPress={() => router.push('/inventory' as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIcon, { backgroundColor: `${colors.secondary}20` }]}>
                    <IconSymbol name="house.fill" size={20} color={colors.secondary} />
                  </View>
                  <ThemedText style={[styles.statNumber, { color: colors.secondary }]}>
                    {stats.totalRooms}
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Rooms
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statCard, { backgroundColor: colors.card }]}
                  onPress={() => router.push('/inventory?filter=consumables')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIcon, { backgroundColor: `${colors.warning}20` }]}>
                    <IconSymbol name="cube.box.fill" size={20} color={colors.warning} />
                  </View>
                  <ThemedText style={[styles.statNumber, { color: colors.warning }]}>
                    {stats.totalPlaces}
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Places
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statCard, { backgroundColor: colors.card }]}
                  onPress={() => router.push('/inventory' as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIcon, { backgroundColor: `${colors.error}20` }]}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.error} />
                  </View>
                  <ThemedText style={[styles.statNumber, { color: colors.error }]}>
                    {stats.lowStockItems}
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Low Stock
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statCard, { backgroundColor: colors.card }]}
                  onPress={() => router.push('/favorites' as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statIcon, { backgroundColor: `${colors.info}20` }]}>
                    <IconSymbol name="heart.fill" size={20} color={colors.info} />
                  </View>
                  <ThemedText style={[styles.statNumber, { color: colors.info }]}>
                    {stats.favoriteItems}
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Favorites
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Charts Section */}
            {items.length > 0 && (
              <>
                {/* Status Distribution Chart */}
                <View style={styles.section}>
                  <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
                    Inventory Status Distribution
                  </ThemedText>
                  <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.statusChart}>
                      {statusDistribution.map((item, index) => {
                        const percentage = ((item.count / items.length) * 100).toFixed(1);
                        const barWidth = (item.count / items.length) * (chartWidth - 100);
                        
                        return (
                          <View key={index} style={styles.statusItem}>
                            <View style={styles.statusInfo}>
                              <View style={[styles.statusIndicator, { backgroundColor: item.color }]} />
                              <ThemedText style={[styles.statusLabel, { color: colors.text }]}>
                                {item.status}
                              </ThemedText>
                              <ThemedText style={[styles.statusCount, { color: colors.textSecondary }]}>
                                {item.count}
                              </ThemedText>
                            </View>
                            <View style={styles.statusBarContainer}>
                              <View 
                                style={[
                                  styles.statusBar, 
                                  { 
                                    backgroundColor: item.color + '30',
                                    width: Math.max(barWidth, 20) // Minimum width for visibility
                                  }
                                ]} 
                              >
                                <View 
                                  style={[
                                    styles.statusBarFill, 
                                    { 
                                      backgroundColor: item.color,
                                      width: '100%'
                                    }
                                  ]} 
                                />
                              </View>
                              <ThemedText style={[styles.statusPercentage, { color: colors.textSecondary }]}>
                                {percentage}%
                              </ThemedText>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>

                {/* Room Distribution Chart */}
                {roomDistribution.length > 0 && (
                  <View style={styles.section}>
                    <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
                      Items by Room
                    </ThemedText>
                    <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
                      <View style={{ height: 200 }}>
                        <CartesianChart
                          data={roomDistribution}
                          xKey="room"
                          yKeys={["count"]}
                          domainPadding={{ left: 20, right: 20, top: 20, bottom: 20 }}
                        >
                          {({ points, chartBounds }) => (
                            <Bar
                              points={points.count}
                              chartBounds={chartBounds}
                              animate={{ type: "spring" }}
                              color={colors.primary}
                            />
                          )}
                        </CartesianChart>
                      </View>
                      <View style={styles.roomLabels}>
                        {roomDistribution.map((room, index) => (
                          <ThemedText
                            key={index}
                            style={[styles.roomLabel, { color: colors.textSecondary }]}
                            numberOfLines={1}
                          >
                            {room.room} ({room.count})
                          </ThemedText>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}

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
  // Clean Overview Layout Styles
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featuredContent: {
    flex: 1,
  },
  featuredNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  featuredLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featuredDescription: {
    fontSize: 12,
    opacity: 0.8,
  },
  overviewStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%', // Ensures 2 cards per row with gap
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Chart Styles
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  statusChart: {
    gap: 12,
  },
  statusItem: {
    gap: 8,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  statusCount: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
  statusBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusPercentage: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'right',
  },
  roomLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 8,
    gap: 4,
  },
  roomLabel: {
    fontSize: 10,
    textAlign: 'center',
    flex: 1,
  },
});
