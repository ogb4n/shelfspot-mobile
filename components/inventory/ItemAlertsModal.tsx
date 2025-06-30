import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ItemWithLocation } from '../../types/inventory';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from '../ui/IconSymbol';

interface ItemAlertsModalProps {
  visible: boolean;
  onClose: () => void;
  item: ItemWithLocation | null;
  onEditAlert?: (alert: any) => void;
  onDeleteAlert?: (alertId: number) => void;
  onCreateAlert?: () => void;
}

export function ItemAlertsModal({ 
  visible, 
  onClose, 
  item, 
  onEditAlert,
  onDeleteAlert,
  onCreateAlert 
}: ItemAlertsModalProps) {
  const colors = {
    card: useThemeColor({}, 'card'),
    text: useThemeColor({}, 'text'),
    textSecondary: useThemeColor({}, 'textSecondary'),
    primary: useThemeColor({}, 'primary'),
    backgroundSecondary: useThemeColor({}, 'backgroundSecondary'),
    warning: useThemeColor({}, 'warning'),
    error: useThemeColor({}, 'error'),
    success: useThemeColor({}, 'success'),
  };

  if (!item) return null;

  const alerts = item.activeAlerts || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.backgroundSecondary }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText type="defaultSemiBold" style={[styles.title, { color: colors.text }]}>
              Alerts for {item.name}
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              {item.location}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={onCreateAlert} style={styles.addButton}>
            <IconSymbol name="plus" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          <View style={styles.alertsContainer}>
            {alerts.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name="bell.slash" size={48} color={colors.textSecondary} />
                <ThemedText style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  No alerts configured
                </ThemedText>
                <ThemedText style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
                  Create an alert to be notified when stock is low
                </ThemedText>
                <TouchableOpacity 
                  style={[styles.createButton, { backgroundColor: colors.primary }]}
                  onPress={onCreateAlert}
                >
                  <IconSymbol name="plus" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.createButtonText}>
                    Create Alert
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              alerts.map((alert, index) => {
                const isTriggered = item.quantity <= alert.threshold;
                return (
                  <View
                    key={alert.id || index}
                    style={[styles.alertCard, {
                      backgroundColor: colors.card,
                      borderLeftColor: isTriggered ? colors.warning : alert.isActive ? colors.success : colors.textSecondary,
                    }]}
                  >
                    <View style={styles.alertHeader}>
                      <View style={styles.alertIcon}>
                        <IconSymbol 
                          name={isTriggered ? "exclamationmark.triangle.fill" : alert.isActive ? "bell.fill" : "bell.slash"} 
                          size={20} 
                          color={isTriggered ? colors.warning : alert.isActive ? colors.success : colors.textSecondary} 
                        />
                      </View>
                      <View style={styles.alertInfo}>
                        <ThemedText type="defaultSemiBold" style={[styles.alertTitle, { color: colors.text }]}>
                          {alert.name || `Low stock alert`}
                        </ThemedText>
                        <ThemedText style={[styles.alertSubtitle, { color: colors.textSecondary }]}>
                          Threshold: {alert.threshold} • {alert.isActive ? 'Active' : 'Inactive'}
                        </ThemedText>
                        {isTriggered && (
                          <ThemedText style={[styles.triggeredText, { color: colors.warning }]}>
                            ⚠️ Alert triggered! Current stock: {item.quantity}
                          </ThemedText>
                        )}
                      </View>
                      <View style={styles.alertActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => onEditAlert?.(alert)}
                        >
                          <IconSymbol name="pencil" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => onDeleteAlert?.(alert.id)}
                        >
                          <IconSymbol name="trash" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  addButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  alertsContainer: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  alertCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  triggeredText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
});
