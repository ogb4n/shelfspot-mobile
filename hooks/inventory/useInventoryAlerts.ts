import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_ALERT_THRESHOLD } from '../../constants/inventory';
import { backendApi } from '../../services/backend-api';
import { AlertFormData, ItemWithLocation } from '../../types/inventory';
import { generateDefaultAlertName, getTriggeredAlerts, sortAlertsByPriority } from '../../utils/inventory/alerts';

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
  const [allAlerts, setAllAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load alerts from API
  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const alerts = await backendApi.getAlerts();
      setAllAlerts(alerts);
    } catch (err: any) {
      console.error('Error loading alerts:', err);
      setError(err.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove the automatic useEffect loading - let components handle it manually

  // Get triggered alerts (combining local computation with server data) - memoized
  const triggeredAlerts = useMemo(() => {
    return sortAlertsByPriority(getTriggeredAlerts(items));
  }, [items]);
  
  // Get selected item for alert creation - memoized
  const selectedItem = useMemo(() => {
    return selectedItemForAlert 
      ? items.find(item => item.id === selectedItemForAlert)
      : null;
  }, [selectedItemForAlert, items]);

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

  // These now make API calls to create/update/delete alerts
  const createAlert = async (onSuccess?: () => void) => {
    if (!canCreateAlert()) return;

    try {
      setLoading(true);
      setError(null);
      
      await backendApi.createAlert({
        itemId: alertFormData.itemId,
        threshold: alertFormData.threshold,
        name: alertFormData.name,
      });
      
      console.log('Alert created successfully:', alertFormData);
      await loadAlerts(); // Reload alerts after creating
      closeCreateAlertModal();
      onSuccess?.();
    } catch (err: any) {
      console.error('Error creating alert:', err);
      setError(err.message || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  const toggleAlert = async (itemId: number, alertId: number, onSuccess?: () => void) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find the alert to get its current state
      const item = items.find(i => i.id === itemId);
      const alert = item?.activeAlerts.find(a => a.id === alertId);
      
      if (alert) {
        await backendApi.updateAlert(alertId, { isActive: !alert.isActive });
        console.log('Alert toggled:', { itemId, alertId });
        await loadAlerts(); // Reload alerts after toggling
        onSuccess?.();
      }
    } catch (err: any) {
      console.error('Error toggling alert:', err);
      setError(err.message || 'Failed to toggle alert');
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (itemId: number, alertId: number, onSuccess?: () => void) => {
    try {
      setLoading(true);
      setError(null);
      
      await backendApi.deleteAlert(alertId);
      console.log('Alert deleted:', { itemId, alertId });
      await loadAlerts(); // Reload alerts after deleting
      onSuccess?.();
    } catch (err: any) {
      console.error('Error deleting alert:', err);
      setError(err.message || 'Failed to delete alert');
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    showAlertsModal,
    showCreateAlertModal,
    selectedItemForAlert,
    selectedItem,
    alertFormData,
    triggeredAlerts,
    allAlerts,
    loading,
    error,

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
    loadAlerts,
  };
};
