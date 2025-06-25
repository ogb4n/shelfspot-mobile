import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, FlatList, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Alert {
  id: string;
  itemName: string;
  type: 'low_stock' | 'expiration' | 'out_of_stock';
  threshold: number;
  currentValue: number;
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
}

export default function AlertsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Mock data
  const alerts: Alert[] = [
    {
      id: '1',
      itemName: 'Dentifrice Colgate',
      type: 'low_stock',
      threshold: 3,
      currentValue: 2,
      isActive: true,
      createdAt: 'Il y a 2 jours',
      lastTriggered: 'Il y a 2h',
    },
    {
      id: '2',
      itemName: 'Yaourts nature',
      type: 'out_of_stock',
      threshold: 1,
      currentValue: 0,
      isActive: true,
      createdAt: 'Il y a 1 semaine',
      lastTriggered: 'Il y a 1h',
    },
    {
      id: '3',
      itemName: 'Lait demi-écrémé',
      type: 'expiration',
      threshold: 3,
      currentValue: 1,
      isActive: false,
      createdAt: 'Il y a 3 jours',
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return 'exclamationmark.triangle.fill';
      case 'out_of_stock': return 'xmark.circle.fill';
      case 'expiration': return 'clock.fill';
      default: return 'bell.fill';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'low_stock': return colors.warning;
      case 'out_of_stock': return colors.error;
      case 'expiration': return colors.info;
      default: return colors.textSecondary;
    }
  };

  const getAlertTypeText = (type: string) => {
    switch (type) {
      case 'low_stock': return 'Stock faible';
      case 'out_of_stock': return 'Épuisé';
      case 'expiration': return 'Expiration proche';
      default: return 'Alerte';
    }
  };

  const getAlertMessage = (alert: Alert) => {
    switch (alert.type) {
      case 'low_stock':
        return `Stock actuel: ${alert.currentValue} (seuil: ${alert.threshold})`;
      case 'out_of_stock':
        return 'Produit épuisé';
      case 'expiration':
        return `Expire dans ${alert.currentValue} jour${alert.currentValue > 1 ? 's' : ''}`;
      default:
        return '';
    }
  };

  const renderAlert = ({ item }: { item: Alert }) => (
    <View style={[styles.alertCard, { backgroundColor: colors.card }]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <View style={styles.alertTitleRow}>
            <View style={[styles.alertIconContainer, { backgroundColor: `${getAlertColor(item.type)}20` }]}>
              <IconSymbol 
                name={getAlertIcon(item.type)} 
                size={16} 
                color={getAlertColor(item.type)} 
              />
            </View>
            <View style={styles.alertTitleContent}>
              <ThemedText type="defaultSemiBold" style={[styles.alertItemName, { color: colors.text }]}>
                {item.itemName}
              </ThemedText>
              <View style={[styles.alertTypeBadge, { backgroundColor: `${getAlertColor(item.type)}20` }]}>
                <ThemedText style={[styles.alertTypeText, { color: getAlertColor(item.type) }]}>
                  {getAlertTypeText(item.type)}
                </ThemedText>
              </View>
            </View>
          </View>
          <ThemedText style={[styles.alertMessage, { color: colors.textSecondary }]}>
            {getAlertMessage(item)}
          </ThemedText>
          <ThemedText style={[styles.alertMeta, { color: colors.textSecondary }]}>
            Créé {item.createdAt}
            {item.lastTriggered && ` • Dernière alerte ${item.lastTriggered}`}
          </ThemedText>
        </View>
        <Switch
          value={item.isActive}
          onValueChange={() => {}}
          trackColor={{
            false: colors.border,
            true: colors.primary,
          }}
          thumbColor={item.isActive ? '#FFFFFF' : colors.textSecondary}
        />
      </View>
      
      <View style={styles.alertActions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="pencil" size={14} color={colors.primary} />
          <ThemedText style={[styles.actionButtonText, { color: colors.primary }]}>
            Modifier
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="arrow.right" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.actionButtonText, { color: colors.textSecondary }]}>
            Voir l'objet
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="bell.slash" size={64} color={colors.textSecondary} />
      <ThemedText type="subtitle" style={[styles.emptyTitle, { color: colors.text }]}>
        Aucune alerte configurée
      </ThemedText>
      <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Créez des alertes pour être notifié lorsque vos stocks sont faibles ou proches de l'expiration.
      </ThemedText>
      <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]}>
        <ThemedText style={[styles.emptyButtonText, { color: '#FFFFFF' }]}>
          Créer une alerte
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          Alertes
        </ThemedText>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <IconSymbol name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <ThemedText type="subtitle" style={[styles.statNumber, { color: colors.warning }]}>
            {alerts.filter(a => a.isActive).length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Alertes actives
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <ThemedText type="subtitle" style={[styles.statNumber, { color: colors.error }]}>
            {alerts.filter(a => a.lastTriggered).length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Déclenchées récemment
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
            Stock faible
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: colors.error }]}>
          <IconSymbol name="xmark.circle" size={20} color="#FFFFFF" />
          <ThemedText style={[styles.quickActionText, { color: '#FFFFFF' }]}>
            Épuisé
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
      {alerts.length > 0 ? (
        <FlatList
          data={alerts}
          renderItem={renderAlert}
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
