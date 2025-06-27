import { useState } from 'react';
import { AlertFormData, ItemWithLocation } from '../../types/inventory';
import { getTriggeredAlerts, sortAlertsByPriority, generateDefaultAlertName } from '../../utils/inventory/alerts';
import { DEFAULT_ALERT_THRESHOLD } from '../../constants/inventory';

export const useInventoryAlerts = (items: ItemWithLocation[]) => {
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);
  const [selectedItemForAlert, setSelectedItemForAlert] = useState<number | null>(null);
  const [alertFormData, setAlertFormData] = useState<AlertFormData>({
    itemId: 0,
    threshold: DEFAULT_ALERT_THRESHOLD,
    name: '',
    isActive: true,
  });

  // Get triggered alerts
  const triggeredAlerts = sortAlertsByPriority(getTriggeredAlerts(items));
  
  // Get selected item for alert creation
  const selectedItem = selectedItemForAlert 
    ? items.find(item => item.id === selectedItemForAlert)
    : null;

  // Modal functions
  const openAlertsModal = () => setShowAlertsModal(true);
  const closeAlertsModal = () => setShowAlertsModal(false);

  const openCreateAlertModal = (itemId: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setSelectedItemForAlert(itemId);
    setAlertFormData({
      itemId,
      threshold: DEFAULT_ALERT_THRESHOLD,
      name: generateDefaultAlertName(item, DEFAULT_ALERT_THRESHOLD),
      isActive: true,
    });
    setShowCreateAlertModal(true);
  };

  const closeCreateAlertModal = () => {
    setShowCreateAlertModal(false);
    setSelectedItemForAlert(null);
    setAlertFormData({
      itemId: 0,
      threshold: DEFAULT_ALERT_THRESHOLD,
      name: '',
      isActive: true,
    });
  };

  // Form functions
  const updateAlertFormData = (field: keyof AlertFormData, value: any) => {
    setAlertFormData(prev => ({ ...prev, [field]: value }));
  };

  const canCreateAlert = () => {
    return alertFormData.itemId > 0 && 
           alertFormData.threshold > 0 && 
           (alertFormData.name?.trim() || '') !== '';
  };

  // These would typically make API calls to create/update/delete alerts
  const createAlert = (onSuccess?: () => void) => {
    if (!canCreateAlert()) return;

    // Mock implementation - would call API
    console.log('Creating alert:', alertFormData);
    
    closeCreateAlertModal();
    onSuccess?.();
  };

  const toggleAlert = (itemId: number, alertId: number, onSuccess?: () => void) => {
    // Mock implementation - would call API
    console.log('Toggling alert:', { itemId, alertId });
    onSuccess?.();
  };

  const deleteAlert = (itemId: number, alertId: number, onSuccess?: () => void) => {
    // Mock implementation - would call API
    console.log('Deleting alert:', { itemId, alertId });
    onSuccess?.();
  };

  return {
    // State
    showAlertsModal,
    showCreateAlertModal,
    selectedItemForAlert,
    selectedItem,
    alertFormData,
    triggeredAlerts,

    // Modal functions
    openAlertsModal,
    closeAlertsModal,
    openCreateAlertModal,
    closeCreateAlertModal,

    // Form functions
    updateAlertFormData,
    canCreateAlert,

    // Alert operations
    createAlert,
    toggleAlert,
    deleteAlert,
  };
};
