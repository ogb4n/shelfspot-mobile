import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { TriggeredAlert } from '../../utils/inventory/alerts';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from '../ui/IconSymbol';

interface AlertsModalProps {
  visible: boolean;
  onClose: () => void;
  triggeredAlerts: TriggeredAlert[];
  onItemPress?: (itemId: number) => void;
}

export function AlertsModal({ visible, onClose, triggeredAlerts, onItemPress }: AlertsModalProps) {
  const colors = {
    card: useThemeColor({}, 'card'),
    text: useThemeColor({}, 'text'),
    textSecondary: useThemeColor({}, 'textSecondary'),
    primary: useThemeColor({}, 'primary'),
    backgroundSecondary: useThemeColor({}, 'backgroundSecondary'),
    warning: useThemeColor({}, 'warning'),
    error: useThemeColor({}, 'error'),
  };

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
          <ThemedText type="defaultSemiBold" style={[styles.title, { color: colors.text }]}>
            Active Alerts
          </ThemedText>
          <View style={styles.headerSpace} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          <View style={styles.alertsContainer}>
            {triggeredAlerts.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name="bell.slash" size={48} color={colors.textSecondary} />
                <ThemedText style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  No active alerts
                </ThemedText>
                <ThemedText style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
                  All your alerts are under control!
                </ThemedText>
              </View>
            ) : (
              triggeredAlerts.map(({ item, alert }, index) => (
                <TouchableOpacity
                  key={`${item.id}-${alert.id}`}
                  style={[styles.alertCard, {
                    backgroundColor: colors.card,
                    borderLeftColor: colors.warning,
                  }]}
                  onPress={() => onItemPress?.(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.alertHeader}>
                    <View style={styles.alertIcon}>
                      <IconSymbol name="exclamationmark.triangle" size={20} color={colors.warning} />
                    </View>
                    <View style={styles.alertInfo}>
                      <ThemedText type="defaultSemiBold" style={[styles.alertTitle, { color: colors.text }]}>
                        {alert.name || `Low stock: ${item.name}`}
                      </ThemedText>
                      <ThemedText style={[styles.alertSubtitle, { color: colors.textSecondary }]}>
                        {item.name} - Quantity: {item.quantity}
                      </ThemedText>
                    </View>
                    <View style={[styles.alertBadge, { backgroundColor: colors.warning }]}>
                      <ThemedText style={styles.alertBadgeText}>
                        Threshold: {alert.threshold}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.alertDetails}>
                    <ThemedText style={[styles.alertLocation, { color: colors.textSecondary }]}>
                      📍 {item.location}
                    </ThemedText>
                    {onItemPress && (
                      <View style={styles.tapHint}>
                        <IconSymbol name="hand.tap" size={12} color={colors.primary} />
                        <ThemedText style={[styles.tapHintText, { color: colors.primary }]}>
                          Tap to view item details
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
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
  title: {
    fontSize: 18,
  },
  headerSpace: {
    width: 32,
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
    marginBottom: 8,
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
  },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  alertBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  alertDetails: {
    marginTop: 8,
  },
  alertLocation: {
    fontSize: 14,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  tapHintText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
