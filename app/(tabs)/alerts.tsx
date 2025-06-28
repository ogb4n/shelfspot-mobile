import { AlertContextMenu, CreateAlertWithItemSelectorModal, EditAlertModal } from '@/components/inventory';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useInventoryAlerts, useInventoryItems } from '@/hooks/inventory';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Alert, AlertFormData } from '@/types/inventory';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Alert as RNAlert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function AlertsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Context menu state
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedAlertForContext, setSelectedAlertForContext] = useState<Alert | null>(null);

  const { items, loading: itemsLoading } = useInventoryItems();
  const {
    allAlerts,
    triggeredAlerts,
    loading: alertsLoading,
    error,
    toggleAlert,
    deleteAlert,
    updateAlert,
    loadAlerts,
    showCreateAlertModal,
    openCreateAlertModal,
    closeCreateAlertModal,
    createAlert
  } = useInventoryAlerts(items);

  // Filter alerts based on search query
  const filteredAlerts = searchQuery.trim()
    ? allAlerts.filter(alert =>
      alert.item?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : allAlerts;

  const loading = itemsLoading || alertsLoading;

  useEffect(() => {
    if (items.length > 0) {
      loadAlerts();
    }
  }, [items.length]); // Only depend on items length, not the whole items array or loadAlerts

  const handleToggleAlert = async (alertId: number, currentStatus: boolean) => {
    const alert = allAlerts.find(a => a.id === alertId);
    if (alert) {
      try {
        console.log('Toggling alert:', { alertId, currentStatus, newStatus: !currentStatus });
        await toggleAlert(alert.itemId, alertId);
        // Force reload after toggle
        setTimeout(() => {
          loadAlerts();
        }, 500);
      } catch (error) {
        console.error('Error toggling alert:', error);
        RNAlert.alert('Error', 'Failed to update alert status');
      }
    } else {
      console.error('Alert not found for toggle:', { alertId, allAlertsCount: allAlerts.length });
      RNAlert.alert('Error', 'Alert not found');
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    const alert = allAlerts.find(a => a.id === alertId);
    if (alert) {
      RNAlert.alert(
        'Delete Alert',
        'Are you sure you want to delete this alert?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteAlert(alert.itemId, alertId);
              } catch (error) {
                RNAlert.alert('Error', 'Failed to delete alert');
              }
            }
          }
        ]
      );
    }
  };

  const handleCreateAlert = async (alertData: AlertFormData) => {
    try {
      await createAlert(() => {
        closeCreateAlertModal();
        loadAlerts();
      });
    } catch (error) {
      RNAlert.alert('Error', 'Failed to create alert');
    }
  };

  const handleEditAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowEditModal(true);
  };

  const handleUpdateAlert = async (alertData: AlertFormData) => {
    if (!selectedAlert) return;

    try {
      await updateAlert(selectedAlert.id, alertData, () => {
        setShowEditModal(false);
        setSelectedAlert(null);
        loadAlerts();
      });
    } catch (error) {
      RNAlert.alert('Error', 'Failed to update alert');
    }
  };

  const handleViewItem = (itemId: number) => {
    router.push(`/item/${itemId}`);
  };

  // Context menu handlers
  const handleAlertLongPress = (alert: Alert, position: { x: number; y: number }) => {
    setSelectedAlertForContext(alert);
    setContextMenuPosition(position);
    setShowContextMenu(true);
  };

  const handleCloseContextMenu = () => {
    setShowContextMenu(false);
    setSelectedAlertForContext(null);
  };

  const getAlertIcon = (alert: Alert) => {
    // Since Alert doesn't have type, we'll determine it based on threshold and item status
    if (alert.item.quantity === 0) return 'xmark.circle.fill';
    if (alert.item.quantity <= alert.threshold) return 'exclamationmark.triangle.fill';
    // For expiration, we'd need additional logic if we had expiry dates
    return 'bell.fill';
  };

  const getAlertColor = (alert: Alert) => {
    if (alert.item.quantity === 0) return colors.error;
    if (alert.item.quantity <= alert.threshold) return colors.warning;
    return colors.info;
  };

  const getAlertTypeText = (alert: Alert) => {
    if (alert.item.quantity === 0) return 'Out of Stock';
    if (alert.item.quantity <= alert.threshold) return 'Low Stock';
    return 'Alert';
  };

  const getAlertMessage = (alert: Alert) => {
    if (alert.item.quantity === 0) {
      return 'Product is out of stock';
    }
    if (alert.item.quantity <= alert.threshold) {
      return `Current stock: ${alert.item.quantity} (threshold: ${alert.threshold})`;
    }
    return `Stock level: ${alert.item.quantity}`;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  };

  const renderAlert = ({ item }: { item: Alert }) => {
    const handleLongPress = (event: any) => {
      const { pageX, pageY } = event.nativeEvent;
      handleAlertLongPress(item, { x: pageX, y: pageY });
    };

    return (
      <TouchableOpacity
        style={[styles.alertCard, { backgroundColor: colors.card }]}
        onPress={() => handleViewItem(item.item.id)}
        onLongPress={handleLongPress}
      >
        <View style={styles.alertHeader}>
          <View style={styles.alertInfo}>
            <View style={styles.alertTitleRow}>
              <View style={[styles.alertIconContainer, { backgroundColor: `${getAlertColor(item)}20` }]}>
                <IconSymbol
                  name={getAlertIcon(item)}
                  size={16}
                  color={getAlertColor(item)}
                />
              </View>
              <View style={styles.alertTitleContent}>
                <ThemedText type="defaultSemiBold" style={[styles.alertItemName, { color: colors.text }]}>
                  {item.name || item.item.name}
                </ThemedText>
                <View style={[styles.alertTypeBadge, { backgroundColor: `${getAlertColor(item)}20` }]}>
                  <ThemedText style={[styles.alertTypeText, { color: getAlertColor(item) }]}>
                    {getAlertTypeText(item)}
                  </ThemedText>
                </View>
              </View>
            </View>
            <ThemedText style={[styles.alertMessage, { color: colors.textSecondary }]}>
              {getAlertMessage(item)}
            </ThemedText>
            <ThemedText style={[styles.alertMeta, { color: colors.textSecondary }]}>
              Created {formatDate(item.createdAt)}
              {item.lastSent && ` • Last triggered ${formatDate(item.lastSent)}`}
            </ThemedText>
          </View>

          {/* Status indicator */}
          <View style={[
            styles.alertStatusBadge,
            { backgroundColor: item.isActive ? `${colors.primary}20` : `${colors.textSecondary}20` }
          ]}>
            <ThemedText style={[
              styles.alertStatusText,
              { color: item.isActive ? colors.primary : colors.textSecondary }
            ]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="bell.slash" size={64} color={colors.textSecondary} />
      <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
        No Alerts Configured
      </ThemedText>
      <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Create alerts to be notified when your stock is low or approaching expiration.
      </ThemedText>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowCreateModal(true)}
      >
        <ThemedText style={[styles.emptyButtonText, { color: '#FFFFFF' }]}>
          Create Alert
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          Alerts
        </ThemedText>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <IconSymbol name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <ThemedText type="subtitle" style={[styles.statNumber, { color: colors.warning }]}>
            {allAlerts.filter((a: Alert) => a.isActive).length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Active Alerts
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <ThemedText type="subtitle" style={[styles.statNumber, { color: colors.error }]}>
            {allAlerts.filter((a: Alert) => a.lastSent).length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Recently Triggered
          </ThemedText>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search alerts by item name..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Alerts List */}
      {loading ? (
        <View style={[styles.emptyState, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary, marginTop: 16 }]}>
            Loading alerts...
          </ThemedText>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <IconSymbol name="exclamationmark.triangle" size={64} color={colors.error} />
          <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
            Error Loading Alerts
          </ThemedText>
          <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            {error}
          </ThemedText>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            onPress={loadAlerts}
          >
            <ThemedText style={[styles.emptyButtonText, { color: '#FFFFFF' }]}>
              Retry
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : filteredAlerts.length > 0 ? (
        <FlatList
          data={filteredAlerts}
          renderItem={renderAlert}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : searchQuery.trim() ? (
        <View style={styles.emptyState}>
          <IconSymbol name="magnifyingglass" size={64} color={colors.textSecondary} />
          <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
            No Results Found
          </ThemedText>
          <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            No alerts found for "{searchQuery}". Try a different search term.
          </ThemedText>
        </View>
      ) : (
        <EmptyState />
      )}

      {/* Create Alert Modal */}
      <CreateAlertWithItemSelectorModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateAlert={handleCreateAlert}
        items={items}
      />
      {/* Edit Alert Modal */}
      {showEditModal && selectedAlert && (
        <EditAlertModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          alert={selectedAlert}
          onUpdateAlert={handleUpdateAlert}
        />
      )}

      {/* Alert Context Menu */}
      <AlertContextMenu
        visible={showContextMenu}
        onClose={handleCloseContextMenu}
        alert={selectedAlertForContext}
        position={contextMenuPosition}
        onEdit={handleEditAlert}
        onToggleActive={handleToggleAlert}
        onViewItem={handleViewItem}
        onDelete={handleDeleteAlert}
      />
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
    minHeight: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  alertCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertTitleContent: {
    flex: 1,
  },
  alertItemName: {
    fontSize: 16,
    marginBottom: 4,
  },
  alertTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  alertMeta: {
    fontSize: 12,
  },
  alertStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  alertStatusText: {
    fontSize: 10,
    fontWeight: '600',
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
