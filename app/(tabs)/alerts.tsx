import { CreateAlertModal } from '@/components/inventory/CreateAlertModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useInventoryAlerts, useInventoryItems } from '@/hooks/inventory';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Alert, AlertFormData } from '@/types/inventory';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Alert as RNAlert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

export default function AlertsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { items, loading: itemsLoading } = useInventoryItems();
  const {
    allAlerts,
    triggeredAlerts,
    loading: alertsLoading,
    error,
    toggleAlert,
    deleteAlert,
    loadAlerts,
    showCreateAlertModal,
    openCreateAlertModal,
    closeCreateAlertModal
  } = useInventoryAlerts(items);

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
        await toggleAlert(alert.itemId, alertId);
      } catch (error) {
        RNAlert.alert('Error', 'Failed to update alert status');
      }
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
    // This function should be implemented in the hook or add it here
    try {
      // For now, we'll just close the modal and reload
      closeCreateAlertModal();
      await loadAlerts();
    } catch (error) {
      RNAlert.alert('Error', 'Failed to create alert');
    }
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

  const renderAlert = ({ item }: { item: Alert }) => (
    <View style={[styles.alertCard, { backgroundColor: colors.card }]}>
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
        <Switch
          value={item.isActive}
          onValueChange={() => handleToggleAlert(item.id, item.isActive)}
          trackColor={{
            false: colors.border,
            true: colors.primary,
          }}
          thumbColor={item.isActive ? '#FFFFFF' : colors.textSecondary}
        />
      </View>

      <View style={styles.alertActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => handleDeleteAlert(item.id)}
        >
          <IconSymbol name="trash" size={14} color={colors.error} />
          <ThemedText style={[styles.actionButtonText, { color: colors.error }]}>
            Delete
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="arrow.right" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.actionButtonText, { color: colors.textSecondary }]}>
            View Item
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        onPress={() => openCreateAlertModal(0)} // Let user select an item
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
          onPress={() => openCreateAlertModal(0)} // Use a default itemId or let user select
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

      {/* Quick Actions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickActions}
        contentContainerStyle={styles.quickActionsContent}
      >
        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.warning }]}>
          <IconSymbol name="exclamationmark.triangle" size={20} color="#FFFFFF" />
          <ThemedText style={[styles.quickActionText, { color: '#FFFFFF' }]}>
            Low Stock
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.error }]}>
          <IconSymbol name="xmark.circle" size={20} color="#FFFFFF" />
          <ThemedText style={[styles.quickActionText, { color: '#FFFFFF' }]}>
            Out of Stock
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.info }]}>
          <IconSymbol name="clock" size={20} color="#FFFFFF" />
          <ThemedText style={[styles.quickActionText, { color: '#FFFFFF' }]}>
            Expiration
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

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
      ) : allAlerts.length > 0 ? (
        <FlatList
          data={allAlerts}
          renderItem={renderAlert}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState />
      )}

      {/* Create Alert Modal */}
      {showCreateAlertModal && (
        <CreateAlertModal
          visible={showCreateAlertModal}
          onClose={closeCreateAlertModal}
          onCreateAlert={handleCreateAlert}
          itemId={null} // Let user select item in modal
          itemName=""
        />
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
  alertActions: {
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
  actionButtonText: {
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
