import { Alert, Item, ItemWithLocation } from '../../types/inventory';

export interface TriggeredAlert {
  item: ItemWithLocation;
  alert: Alert;
}

export const isAlertTriggered = (item: Item, alert: Alert): boolean => {
  if (!alert.isActive) return false;
  
  // For now, we only have threshold-based alerts
  // In the future, we could add date-based alerts (expiration, reminder)
  return item.quantity <= alert.threshold;
};

export const getTriggeredAlerts = (items: ItemWithLocation[]): TriggeredAlert[] => {
  const triggeredAlerts: TriggeredAlert[] = [];
  
  items.forEach(item => {
    item.activeAlerts?.forEach(alert => {
      if (isAlertTriggered(item, alert)) {
        triggeredAlerts.push({ item, alert });
      }
    });
  });
  
  return triggeredAlerts;
};

export const hasActiveAlerts = (item: ItemWithLocation): boolean => {
  return item.activeAlerts?.some(alert => isAlertTriggered(item, alert)) || false;
};

export const getAlertMessage = (item: Item, alert: Alert): string => {
  if (alert.name) {
    return alert.name;
  }
  
  // Default message based on alert type
  return `Stock faible: ${item.name} (${item.quantity} restant${item.quantity > 1 ? 's' : ''})`;
};

export const sortAlertsByPriority = (alerts: TriggeredAlert[]): TriggeredAlert[] => {
  return alerts.sort((a, b) => {
    // Sort by how critical the alert is (lower quantity = higher priority)
    const aCriticalness = a.item.quantity / a.alert.threshold;
    const bCriticalness = b.item.quantity / b.alert.threshold;
    
    return aCriticalness - bCriticalness;
  });
};

export const generateDefaultAlertName = (item: Item, threshold: number): string => {
  return `Alerte stock faible - ${item.name} (seuil: ${threshold})`;
};
