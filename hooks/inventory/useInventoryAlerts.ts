import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_ALERT_THRESHOLD } from '../../constants/inventory';
import { backendApi } from '../../services/backend-api';
import { AlertFormData, ItemWithLocation } from '../../types/inventory';
import { getTriggeredAlerts, sortAlertsByPriority } from '../../utils/inventory/alerts';

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
      name: '', // User must provide their own name
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
      
      console.log('toggleAlert called with:', { itemId, alertId, alertIdType: typeof alertId });
      console.log('Available alerts:', allAlerts.map(a => ({ id: a.id, idType: typeof a.id, isActive: a.isActive })));
      
      // Ensure alertId is a number
      const numericAlertId = typeof alertId === 'string' ? parseInt(alertId, 10) : alertId;
      
      // Find the alert in allAlerts to get its current state
      const alert = allAlerts.find(a => a.id === numericAlertId);
      
      if (alert) {
        console.log('Alert found:', { id: alert.id, currentStatus: alert.isActive });
        const newStatus = !alert.isActive;
        
        await backendApi.updateAlert(numericAlertId, { isActive: newStatus });
        console.log('Backend API call successful, new status:', newStatus);
        
        await loadAlerts(); // Reload alerts after toggling
        console.log('Alerts reloaded');
        onSuccess?.();
      } else {
        console.error('Alert not found:', { alertId: numericAlertId, itemId, availableIds: allAlerts.map(a => a.id) });
        setError('Alert not found');
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

  const updateAlert = async (alertId: number, alertData: Partial<AlertFormData>, onSuccess?: () => void) => {
    try {
      setLoading(true);
      setError(null);
      
      await backendApi.updateAlert(alertId, {
        threshold: alertData.threshold,
        name: alertData.name,
        isActive: alertData.isActive,
      });
      
      console.log('Alert updated successfully:', { alertId, alertData });
      await loadAlerts(); // Reload alerts after updating
      onSuccess?.();
    } catch (err: any) {
      console.error('Error updating alert:', err);
      setError(err.message || 'Failed to update alert');
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
    updateAlert,
    loadAlerts,
  };
};
